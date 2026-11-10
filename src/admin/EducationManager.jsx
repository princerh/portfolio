
import {
  ExternalLink,
  FileText,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const BUCKET = "transcripts";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
];

const EMPTY_FORM = {
  institution: "",
  degree: "",
  field: "",
  location: "",
  passingYear: "",
  description: "",
  resultScore: "",
  transcriptPath: "",
};

function getTranscriptUrl(path) {
  if (!path) return null;

  if (path.startsWith("https://")) {
    return path;
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  return data?.publicUrl || null;
}

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      "Only PDF, PNG, JPG and JPEG transcripts are allowed."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Transcript must be 10 MB or smaller."
    );
  }
}

function EducationManager() {
  const [education, setEducation] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);

  const [transcriptFile, setTranscriptFile] =
    useState(null);

  const [removeTranscript, setRemoveTranscript] =
    useState(false);

  const [fileInputKey, setFileInputKey] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadEducation();
  }, []);

  async function loadEducation() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("institution", {
          ascending: true,
        });

      if (error) throw error;

      setEducation(data || []);
    } catch (error) {
      console.error(
        "Education loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load education."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function clearSelectedFile() {
    setTranscriptFile(null);
    setFileInputKey((key) => key + 1);
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setTranscriptFile(null);
    setRemoveTranscript(false);
    setFileInputKey((key) => key + 1);
    setMessage("");
    setErrorMessage("");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      validateFile(file);
      setTranscriptFile(file);
      setRemoveTranscript(false);
      setErrorMessage("");
    } catch (error) {
      clearSelectedFile();
      setErrorMessage(error.message);
    }
  }

  async function uploadTranscript(file) {
    validateFile(file);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "Please sign in as an administrator."
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "pdf";

    const filePath =
      `${user.id}/education/` +
      `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    return filePath;
  }

  async function deleteTranscriptFile(path) {
    if (!path || path.startsWith("https://")) {
      return;
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path]);

    if (error) throw error;
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    let uploadedPath = null;

    try {
      if (!form.institution.trim()) {
        throw new Error(
          "Institution is required."
        );
      }

      if (!form.degree.trim()) {
        throw new Error(
          "Degree is required."
        );
      }

      const oldPath =
        form.transcriptPath || null;

      let newPath =
        removeTranscript ? null : oldPath;

      if (transcriptFile) {
        uploadedPath =
          await uploadTranscript(transcriptFile);

        newPath = uploadedPath;
      }

      const educationData = {
        institution:
          form.institution.trim(),

        degree:
          form.degree.trim(),

        field:
          form.field.trim(),

        location:
          form.location.trim(),

        passing_year:
          form.passingYear.trim(),

        description:
          form.description.trim(),

        result_score:
          form.resultScore.trim(),

        transcript_path: newPath,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("education")
          .update(educationData)
          .eq("id", editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("education")
          .insert(educationData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      // Remove the previous file only after
      // the database update succeeds.
      let cleanupWarning = "";

      if (
        oldPath &&
        oldPath !== newPath
      ) {
        try {
          await deleteTranscriptFile(oldPath);
        } catch (cleanupError) {
          console.error(
            "Old transcript cleanup failed:",
            cleanupError
          );

          cleanupWarning =
            " The previous transcript file could not be removed from storage.";
        }
      }

      const successMessage = editingId
        ? "Education updated successfully."
        : "Education added successfully.";

      resetForm();

      await loadEducation();

      setMessage(
        successMessage + cleanupWarning
      );
    } catch (error) {
      console.error(
        "Education save error:",
        error
      );

      // If a new file was uploaded but the
      // database save failed, remove it.
      if (uploadedPath) {
        try {
          await deleteTranscriptFile(
            uploadedPath
          );
        } catch (cleanupError) {
          console.error(
            "Uploaded file cleanup failed:",
            cleanupError
          );
        }
      }

      setErrorMessage(
        error.message ||
          "Unable to save education."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      institution:
        item.institution ?? "",

      degree:
        item.degree ?? "",

      field:
        item.field ?? "",

      location:
        item.location ?? "",

      passingYear:
        item.passing_year ?? "",

      description:
        item.description ?? "",

      resultScore:
        item.result_score ?? "",

      transcriptPath:
        item.transcript_path ?? "",
    });

    clearSelectedFile();
    setRemoveTranscript(false);
    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete "${item.degree}" from "${item.institution}"?`
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("education")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      let cleanupWarning = "";

      if (item.transcript_path) {
        try {
          await deleteTranscriptFile(
            item.transcript_path
          );
        } catch (cleanupError) {
          console.error(
            "Transcript cleanup failed:",
            cleanupError
          );

          cleanupWarning =
            " The transcript file could not be removed from storage.";
        }
      }

      if (editingId === item.id) {
        resetForm();
      }

      await loadEducation();

      setMessage(
        "Education deleted successfully." +
          cleanupWarning
      );
    } catch (error) {
      console.error(
        "Education delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete education."
      );
    } finally {
      setDeletingId(null);
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
            Loading education...
          </p>
        </div>
      </div>
    );
  }

  const existingTranscriptUrl =
    !removeTranscript
      ? getTranscriptUrl(
          form.transcriptPath
        )
      : null;

  return (
    <div>
      {/* Header */}

      <div className="mb-8">
        <p className="text-sm font-medium text-purple-400">
          Portfolio Content
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Education
        </h2>

        <p className="mt-3 text-gray-500">
          Manage your academic background,
          qualifications and transcripts.
        </p>
      </div>

      {/* Messages */}

      {message && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Form */}

      <form
        onSubmit={handleSave}
        className="glass-card mb-10 rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {editingId
                ? "Edit Education"
                : "Add Education"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your university, degree,
              result and academic details.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
            >
              <X size={17} />
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            label="Institution Name"
            value={form.institution}
            onChange={(value) =>
              updateField(
                "institution",
                value
              )
            }
            placeholder="Deakin University"
            required
          />

          <InputField
            label="Degree"
            value={form.degree}
            onChange={(value) =>
              updateField(
                "degree",
                value
              )
            }
            placeholder="Master of Applied Artificial Intelligence"
            required
          />

          <InputField
            label="Field"
            value={form.field}
            onChange={(value) =>
              updateField(
                "field",
                value
              )
            }
            placeholder="Artificial Intelligence"
          />

          <InputField
            label="Location"
            value={form.location}
            onChange={(value) =>
              updateField(
                "location",
                value
              )
            }
            placeholder="Victoria, Australia"
          />

          <InputField
            label="Passing Year"
            value={form.passingYear}
            onChange={(value) =>
              updateField(
                "passingYear",
                value
              )
            }
            placeholder="2027"
          />

          <InputField
            label="Result / Score"
            value={form.resultScore}
            onChange={(value) =>
              updateField(
                "resultScore",
                value
              )
            }
            placeholder="CGPA 3.75/4.00"
          />
        </div>

        {/* Description */}

        <div className="mt-6">
          <label className="mb-2 block text-sm text-gray-300">
            Description
          </label>

          <textarea
            value={form.description}
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows={5}
            placeholder="Add relevant coursework, research focus, thesis or academic highlights..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
          />
        </div>

        {/* Transcript Upload */}

        <div className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-300">
              <FileText size={21} />
            </div>

            <div>
              <h4 className="font-semibold text-white">
                Academic Transcript
              </h4>

              <p className="mt-1 text-xs text-gray-400">
                PDF, PNG or JPEG. Maximum 10 MB.
              </p>
            </div>
          </div>

          {/* Existing transcript */}

          {existingTranscriptUrl && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FileText
                  size={18}
                  className="text-purple-400"
                />
                Current transcript available
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={existingTranscriptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
                >
                  <ExternalLink size={15} />
                  View
                </a>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setRemoveTranscript(true);
                    clearSelectedFile();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>
            </div>
          )}

          {removeTranscript && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-200">
                Transcript will be removed when
                you save this education entry.
              </p>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setRemoveTranscript(false)
                }
                className="text-sm font-medium text-amber-100 underline disabled:opacity-50"
              >
                Undo
              </button>
            </div>
          )}

          {/* File input */}

          <div className="mt-5">
            <label className="mb-3 block text-sm font-medium text-gray-300">
              {form.transcriptPath
                ? "Replace Transcript"
                : "Upload Transcript"}
            </label>

            <input
              key={fileInputKey}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              disabled={saving}
              className="block w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:px-4 file:py-2 file:font-semibold file:text-purple-200 hover:file:bg-purple-500/30 disabled:opacity-50"
            />

            {transcriptFile && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-green-200">
                  <Upload size={16} />
                  <span className="break-all">
                    {transcriptFile.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={clearSelectedFile}
                  disabled={saving}
                  className="text-sm text-green-100 underline disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            )}

            <p className="mt-3 text-xs leading-6 text-gray-500">
              Upload a redacted transcript only.
              Public visitors will be able to
              view this file from your Education
              section.
            </p>
          </div>
        </div>

        {/* Save */}

        <div className="mt-8">
          <button
            type="submit"
            disabled={saving}
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
            ) : editingId ? (
              <>
                <Save size={18} />
                Update Education
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Education
              </>
            )}
          </button>
        </div>
      </form>

      {/* Existing Education */}

      <div>
        <div className="mb-5">
          <h3 className="text-xl font-semibold">
            Existing Education
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {education.length}{" "}
            {education.length === 1
              ? "entry"
              : "entries"}
          </p>
        </div>

        {education.length === 0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">
            <GraduationCap
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No education added
            </h4>
          </div>
        ) : (
          <div className="space-y-5">
            {education.map((item) => (
              <EducationCard
                key={item.id}
                item={item}
                onEdit={() =>
                  handleEdit(item)
                }
                onDelete={() =>
                  handleDelete(item)
                }
                deleting={
                  deletingId === item.id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EducationCard({
  item,
  onEdit,
  onDelete,
  deleting,
}) {
  const transcriptUrl =
    getTranscriptUrl(item.transcript_path);

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold">
            {item.degree}
          </h4>

          <p className="mt-2 text-purple-400">
            {item.institution}
          </p>

          {item.field && (
            <p className="mt-1 text-sm text-gray-500">
              {item.field}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
            {item.location && (
              <span>
                {item.location}
              </span>
            )}

            {item.passing_year && (
              <span>
                Passing Year:{" "}
                {item.passing_year}
              </span>
            )}

            {item.result_score && (
              <span className="text-purple-300">
                {item.result_score}
              </span>
            )}
          </div>

          {item.description && (
            <p className="mt-4 max-w-3xl leading-7 text-gray-400">
              {item.description}
            </p>
          )}

          {/* Transcript status */}

          <div className="mt-5">
            {transcriptUrl ? (
              <a
                href={transcriptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-300 transition hover:bg-green-500/20"
              >
                <FileText size={16} />
                View Transcript
                <ExternalLink size={14} />
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-500">
                <FileText size={15} />
                No transcript uploaded
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onEdit}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20 disabled:opacity-50"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={16} />
            )}

            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-gray-300">
        {label}

        {required && (
          <span className="ml-1 text-purple-400">
            *
          </span>
        )}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
      />
    </div>
  );
}

export default EducationManager;
