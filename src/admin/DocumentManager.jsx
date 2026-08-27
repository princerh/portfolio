import {
  File,
  FileImage,
  FileText,
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

const EMPTY_FORM = {
  title: "",
  documentType: "Certificate",
  issuer: "",
  description: "",
  fileUrl: "",
  filePath: "",
};

function DocumentManager() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  /* ================================= */
  /* LOAD DOCUMENTS */
  /* ================================= */

  async function loadDocuments() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("document_type", {
          ascending: true,
        })
        .order("title", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error(
        "Document loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================= */
  /* FORM HELPERS */
  /* ================================= */

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setErrorMessage("");
  }

  /* ================================= */
  /* FILE UPLOAD */
  /* ================================= */

  async function handleFileUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Only PDF, JPG, PNG and WebP files are allowed."
        );
      }

      const maxSize =
        15 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Document must be smaller than 15 MB."
        );
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "pdf";

      const safeName =
        file.name
          .replace(/\s+/g, "-")
          .replace(
            /[^a-zA-Z0-9._-]/g,
            ""
          );

      const filePath =
        `documents/${Date.now()}-${safeName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("portfolio")
        .upload(
          filePath,
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
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new Error(
          "Unable to generate document URL."
        );
      }

      setForm((current) => ({
        ...current,
        fileUrl:
          publicUrlData.publicUrl,
        filePath,
      }));

      setMessage(
        "Document uploaded successfully. Click Save Document to publish it."
      );
    } catch (error) {
      console.error(
        "Document upload error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to upload document."
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  }

  /* ================================= */
  /* SAVE DOCUMENT */
  /* ================================= */

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!form.title.trim()) {
        throw new Error(
          "Document title is required."
        );
      }

      if (!form.documentType.trim()) {
        throw new Error(
          "Document type is required."
        );
      }

      if (!form.fileUrl) {
        throw new Error(
          "Please upload a document file."
        );
      }

      const documentData = {
        title:
          form.title.trim(),

        document_type:
          form.documentType.trim(),

        issuer:
          form.issuer.trim(),

        description:
          form.description.trim(),

        file_url:
          form.fileUrl,

        file_path:
          form.filePath,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("documents")
          .update(documentData)
          .eq("id", editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("documents")
          .insert(documentData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setMessage(
        editingId
          ? "Document updated successfully."
          : "Document added successfully."
      );

      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadDocuments();
    } catch (error) {
      console.error(
        "Document save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save document."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================================= */
  /* EDIT DOCUMENT */
  /* ================================= */

  function handleEdit(document) {
    setEditingId(document.id);

    setForm({
      title:
        document.title ?? "",

      documentType:
        document.document_type ??
        "Certificate",

      issuer:
        document.issuer ?? "",

      description:
        document.description ?? "",

      fileUrl:
        document.file_url ?? "",

      filePath:
        document.file_path ?? "",
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ================================= */
  /* DELETE DOCUMENT */
  /* ================================= */

  async function handleDelete(document) {
    const confirmed =
      window.confirm(
        `Delete "${document.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(document.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", document.id);

      if (error) {
        throw error;
      }

      if (document.file_path) {
        const {
          error: fileDeleteError,
        } = await supabase.storage
          .from("portfolio")
          .remove([
            document.file_path,
          ]);

        if (fileDeleteError) {
          console.warn(
            "Document file could not be deleted:",
            fileDeleteError.message
          );
        }
      }

      if (editingId === document.id) {
        resetForm();
      }

      setMessage(
        "Document deleted successfully."
      );

      await loadDocuments();
    } catch (error) {
      console.error(
        "Document delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ================================= */
  /* LOADING */
  /* ================================= */

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-purple-400"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading documents...
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
          Documents
        </h2>

        <p className="mt-3 text-gray-500">
          Manage certificates, research
          papers, reports and other
          portfolio documents.
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

      {/* ================================= */}
      {/* FORM */}
      {/* ================================= */}

      <form
        onSubmit={handleSave}
        className="glass-card mb-10 rounded-3xl p-6 sm:p-8"
      >

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

          <div>
            <h3 className="text-xl font-semibold">
              {editingId
                ? "Edit Document"
                : "Add Document"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Upload a certificate,
              report, paper or other
              document.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
            >
              <X size={17} />

              Cancel Edit
            </button>
          )}

        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">

          {/* ========================= */}
          {/* FILE UPLOAD */}
          {/* ========================= */}

          <div>

            <label className="mb-2 block text-sm text-gray-300">
              Document File
            </label>

            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">

              {form.fileUrl ? (
                <div className="text-center">

                  <FileText
                    size={55}
                    className="mx-auto text-purple-400"
                  />

                  <p className="mt-3 text-sm text-green-400">
                    File uploaded
                  </p>

                </div>
              ) : (
                <div className="text-center">

                  <File
                    size={55}
                    className="mx-auto text-gray-600"
                  />

                  <p className="mt-3 text-sm text-gray-600">
                    No file selected
                  </p>

                </div>
              )}

            </div>

            <label
              className={`mt-4 flex items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-300 transition ${
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
              ) : (
                <>
                  <Upload size={18} />

                  Upload Document
                </>
              )}

              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={handleFileUpload}
              />

            </label>

            <p className="mt-3 text-xs leading-5 text-gray-600">
              PDF, JPG, PNG or WebP.
              Maximum 15 MB.
            </p>

            {form.fileUrl && (
              <a
                href={form.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-sm text-purple-400 transition hover:text-purple-300"
              >
                View current file
              </a>
            )}

          </div>

          {/* ========================= */}
          {/* DETAILS */}
          {/* ========================= */}

          <div className="grid gap-6">

            <InputField
              label="Document Title"
              value={form.title}
              onChange={(value) =>
                updateField(
                  "title",
                  value
                )
              }
              placeholder="Machine Learning Certificate"
              required
            />

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Document Type
              </label>

              <select
                value={form.documentType}
                onChange={(event) =>
                  updateField(
                    "documentType",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#111427] px-4 py-3 text-white outline-none focus:border-purple-500/60"
              >
                <option>
                  Certificate
                </option>

                <option>
                  Research Paper
                </option>

                <option>
                  Project Report
                </option>

                <option>
                  Academic Document
                </option>

                <option>
                  Award
                </option>

                <option>
                  Publication
                </option>

                <option>
                  Other
                </option>
              </select>

            </div>

            <InputField
              label="Issuer / Organization"
              value={form.issuer}
              onChange={(value) =>
                updateField(
                  "issuer",
                  value
                )
              }
              placeholder="Deakin University"
            />

            <div>

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
                placeholder="Briefly describe the certificate or document..."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
              />

            </div>

            <div>

              <button
                type="submit"
                disabled={
                  saving ||
                  uploading
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
                ) : editingId ? (
                  <>
                    <Save size={18} />

                    Update Document
                  </>
                ) : (
                  <>
                    <Plus size={18} />

                    Save Document
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </form>

      {/* ================================= */}
      {/* EXISTING DOCUMENTS */}
      {/* ================================= */}

      <div>

        <div className="mb-5">

          <h3 className="text-xl font-semibold">
            Existing Documents
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {documents.length}{" "}
            {documents.length === 1
              ? "document"
              : "documents"}
          </p>

        </div>

        {documents.length === 0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">

            <FileText
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No documents added
            </h4>

          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {documents.map(
              (document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onEdit={() =>
                    handleEdit(document)
                  }
                  onDelete={() =>
                    handleDelete(document)
                  }
                  deleting={
                    deletingId ===
                    document.id
                  }
                />
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}


/* ================================= */
/* DOCUMENT CARD */
/* ================================= */

function DocumentCard({
  document,
  onEdit,
  onDelete,
  deleting,
}) {
  const isImage =
    document.file_url &&
    /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
      document.file_url
    );

  return (
    <div className="glass-card overflow-hidden rounded-2xl">

      <div className="flex h-40 items-center justify-center bg-white/5">

        {isImage ? (
          <img
            src={document.file_url}
            alt={document.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText
            size={50}
            className="text-purple-400"
          />
        )}

      </div>

      <div className="p-5">

        <p className="text-xs font-medium text-purple-400">
          {document.document_type}
        </p>

        <h4 className="mt-2 font-semibold">
          {document.title}
        </h4>

        {document.issuer && (
          <p className="mt-2 text-sm text-gray-500">
            {document.issuer}
          </p>
        )}

        {document.description && (
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {document.description}
          </p>
        )}

        {document.file_url && (
          <a
            href={document.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex text-sm text-purple-400 transition hover:text-purple-300"
          >
            View Document
          </a>
        )}

        <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">

          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
          >
            <Pencil size={15} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={15} />
            )}

            Delete
          </button>

        </div>

      </div>

    </div>
  );
}


/* ================================= */
/* INPUT FIELD */
/* ================================= */

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
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
      />

    </div>
  );
}

export default DocumentManager;