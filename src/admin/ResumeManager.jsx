import {
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Upload,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function ResumeManager() {
  const [resumeId, setResumeId] = useState(null);

  const [title, setTitle] =
    useState("Resume");

  const [fileUrl, setFileUrl] =
    useState("");

  const [filePath, setFilePath] =
    useState("");

  const [fileName, setFileName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadResume();
  }, []);

  async function loadResume() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("resume")
          .select("*")
          .limit(1)
          .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setResumeId(data.id);
        setTitle(data.title ?? "Resume");
        setFileUrl(data.file_url ?? "");
        setFilePath(data.file_path ?? "");
        setFileName(data.file_name ?? "");
      }
    } catch (error) {
      console.error(
        "Resume loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load resume."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (
        file.type !==
        "application/pdf"
      ) {
        throw new Error(
          "Please select a PDF file."
        );
      }

      const maxSize =
        10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Resume must be smaller than 10 MB."
        );
      }

      const safeFileName =
        file.name
          .replace(/\s+/g, "-")
          .replace(
            /[^a-zA-Z0-9._-]/g,
            ""
          );

      const newFilePath =
        `resume/resume-${Date.now()}-${safeFileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("portfolio")
        .upload(
          newFilePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("portfolio")
        .getPublicUrl(
          newFilePath
        );

      if (
        !publicUrlData?.publicUrl
      ) {
        throw new Error(
          "Unable to generate resume URL."
        );
      }

      const newFileUrl =
        publicUrlData.publicUrl;

      const oldFilePath =
        filePath;

      setFileUrl(newFileUrl);
      setFilePath(newFilePath);
      setFileName(file.name);

      const resumeData = {
        title:
          title.trim() ||
          "Resume",

        file_url:
          newFileUrl,

        file_path:
          newFilePath,

        file_name:
          file.name,

        updated_at:
          new Date().toISOString(),
      };

      let result;

      if (resumeId) {
        result = await supabase
          .from("resume")
          .update(
            resumeData
          )
          .eq(
            "id",
            resumeId
          )
          .select()
          .single();
      } else {
        result = await supabase
          .from("resume")
          .insert(
            resumeData
          )
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data?.id) {
        setResumeId(
          result.data.id
        );
      }

      /*
       * Delete previous resume
       * after the database has
       * successfully updated.
       */

      if (
        oldFilePath &&
        oldFilePath !==
          newFilePath
      ) {
        const {
          error: deleteError,
        } =
          await supabase.storage
            .from(
              "portfolio"
            )
            .remove([
              oldFilePath,
            ]);

        if (deleteError) {
          console.warn(
            "Old resume could not be deleted:",
            deleteError.message
          );
        }
      }

      setMessage(
        "Resume uploaded and published successfully."
      );
    } catch (error) {
      console.error(
        "Resume upload error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to upload resume."
      );
    } finally {
      setUploading(false);

      event.target.value =
        "";
    }
  }

  async function handleSaveTitle(
    event
  ) {
    event.preventDefault();

    if (!resumeId) {
      setErrorMessage(
        "Upload a resume first."
      );

      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } =
        await supabase
          .from("resume")
          .update({
            title:
              title.trim() ||
              "Resume",

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            resumeId
          );

      if (error) {
        throw error;
      }

      setMessage(
        "Resume information updated successfully."
      );
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to update resume."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">

          <Loader2
            size={34}
            className="mx-auto animate-spin text-purple-400"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading resume...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Header */}

      <div className="mb-8">

        <p className="text-sm font-medium text-purple-400">
          Portfolio Content
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Resume
        </h2>

        <p className="mt-3 text-gray-500">
          Upload and manage the
          resume available on your
          public portfolio.
        </p>

      </div>

      {/* Success */}

      {message && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {/* Error */}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">

        {/* Upload Card */}

        <div className="glass-card h-fit rounded-3xl p-6">

          <h3 className="mb-6 font-semibold">
            Resume File
          </h3>

          <div className="flex flex-col items-center">

            <div className="flex h-32 w-32 items-center justify-center rounded-3xl border border-purple-500/30 bg-purple-500/10 text-purple-400">

              <FileText
                size={55}
              />

            </div>

            {fileName ? (
              <div className="mt-5 text-center">

                <p className="max-w-[280px] break-words text-sm font-medium text-gray-300">
                  {fileName}
                </p>

                <p className="mt-1 text-xs text-green-400">
                  Resume available
                </p>

              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-500">
                No resume uploaded
              </p>
            )}

            <label
              className={`mt-6 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm text-purple-300 transition ${
                uploading
                  ? "cursor-not-allowed opacity-60"
                  : "cursor-pointer hover:bg-purple-500/20"
              }`}
            >

              {uploading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Uploading...
                </>
              ) : fileUrl ? (
                <>
                  <RefreshCw
                    size={18}
                  />

                  Replace Resume
                </>
              ) : (
                <>
                  <Upload
                    size={18}
                  />

                  Upload Resume
                </>
              )}

              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={
                  uploading
                }
                onChange={
                  handleResumeUpload
                }
              />

            </label>

            <p className="mt-4 text-center text-xs leading-5 text-gray-600">
              PDF only
              <br />
              Maximum size: 10 MB
            </p>

            {fileUrl && (
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center gap-2 text-sm text-gray-400 transition hover:text-purple-400"
              >
                <Download
                  size={17}
                />

                View current resume
              </a>
            )}

          </div>

        </div>

        {/* Resume Settings */}

        <form
          onSubmit={
            handleSaveTitle
          }
          className="glass-card h-fit rounded-3xl p-6 sm:p-8"
        >

          <div className="mb-7">

            <h3 className="text-xl font-semibold">
              Resume Information
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Manage how the resume
              appears on your
              portfolio.
            </p>

          </div>

          <div>

            <label
              htmlFor="resume-title"
              className="mb-2 block text-sm text-gray-300"
            >
              Resume Title
            </label>

            <input
              id="resume-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="Resume"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
            />

          </div>

          <div className="mt-7">

            <button
              type="submit"
              disabled={
                saving ||
                !resumeId
              }
              className="gradient-button flex items-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={18}
                  />

                  Save Information
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ResumeManager;