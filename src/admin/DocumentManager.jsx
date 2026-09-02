import {
  ExternalLink,
  File,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

/* ================================= */
/* DOCUMENT TYPES */
/* ================================= */

const DOCUMENT_TYPES = [
  "Certificate",
  "Publication",
  "Research Paper",
  "Project Report",
  "Academic Document",
  "Award",
  "Other",
];

/* ================================= */
/* EMPTY FORM */
/* ================================= */

const EMPTY_FORM = {
  title: "",
  documentType: "Certificate",

  issuer: "",
  description: "",

  fileUrl: "",
  filePath: "",

  /* Publication-specific fields */
  publicationName: "",
  publicationDate: "",
  authors: "",
  abstract: "",
  articleUrl: "",
};

/* ================================= */
/* DOCUMENT MANAGER */
/* ================================= */

function DocumentManager() {
  const [documents, setDocuments] =
    useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const isPublication =
    form.documentType === "Publication";

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
      const { data, error } =
        await supabase
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

  function updateField(
    field,
    value
  ) {
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

  function handleDocumentTypeChange(
    value
  ) {
    setForm((current) => ({
      ...current,
      documentType: value,

      /*
       * We keep existing publication values
       * during editing so switching the dropdown
       * accidentally does not immediately erase
       * entered data.
       */
    }));
  }

  /* ================================= */
  /* URL VALIDATION */
  /* ================================= */

  function isValidUrl(value) {
    if (!value) {
      return true;
    }

    try {
      const url = new URL(value);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }

  /* ================================= */
  /* FILE UPLOAD */
  /* ================================= */

  async function handleFileUpload(
    event
  ) {
    const file =
      event.target.files?.[0];

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

      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        throw new Error(
          "Only PDF, JPG, PNG and WebP files are allowed."
        );
      }

      /*
       * Keeping your existing 15 MB
       * document upload limit.
       *
       * You can increase this later if
       * you want it aligned with your
       * 50 MB Supabase bucket limit.
       */
      const maxSize =
        15 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Document must be smaller than 15 MB."
        );
      }

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

      if (
        !publicUrlData?.publicUrl
      ) {
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
        isPublication
          ? "Publication file uploaded successfully. Save the publication when ready."
          : "Document uploaded successfully. Click Save Document to publish it."
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
  /* REMOVE CURRENT FILE */
  /* ================================= */

  async function handleRemoveCurrentFile() {
    if (!form.fileUrl) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove the currently uploaded file?"
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setMessage("");

    try {
      /*
       * If this is an already saved
       * storage object, remove it.
       */
      if (form.filePath) {
        const {
          error: removeError,
        } = await supabase.storage
          .from("portfolio")
          .remove([
            form.filePath,
          ]);

        if (removeError) {
          throw removeError;
        }
      }

      setForm((current) => ({
        ...current,
        fileUrl: "",
        filePath: "",
      }));

      setMessage(
        "File removed successfully."
      );
    } catch (error) {
      console.error(
        "File removal error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to remove file."
      );
    }
  }

  /* ================================= */
  /* SAVE DOCUMENT */
  /* ================================= */

  async function handleSave(
    event
  ) {
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

      if (
        !form.documentType.trim()
      ) {
        throw new Error(
          "Document type is required."
        );
      }

      /* ============================= */
      /* PUBLICATION VALIDATION */
      /* ============================= */

      if (isPublication) {
        if (
          !form.publicationName.trim()
        ) {
          throw new Error(
            "Journal / publication name is required."
          );
        }

        if (
          !form.publicationDate
        ) {
          throw new Error(
            "Publication date is required."
          );
        }

        if (
          !form.authors.trim()
        ) {
          throw new Error(
            "Authors are required."
          );
        }

        if (
          !form.abstract.trim()
        ) {
          throw new Error(
            "Abstract / summary is required."
          );
        }

        if (
          !form.articleUrl.trim()
        ) {
          throw new Error(
            "Article URL is required."
          );
        }

        if (
          !isValidUrl(
            form.articleUrl.trim()
          )
        ) {
          throw new Error(
            "Please enter a valid article URL."
          );
        }
      }

      /* ============================= */
      /* NON-PUBLICATION VALIDATION */
      /* ============================= */

      if (
        !isPublication &&
        !form.fileUrl
      ) {
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
          isPublication
            ? ""
            : form.issuer.trim(),

        description:
          isPublication
            ? ""
            : form.description.trim(),

        file_url:
          form.fileUrl || null,

        file_path:
          form.filePath || null,

        /* Publication fields */

        publication_name:
          isPublication
            ? form.publicationName.trim()
            : null,

        publication_date:
          isPublication
            ? form.publicationDate
            : null,

        authors:
          isPublication
            ? form.authors.trim()
            : null,

        abstract:
          isPublication
            ? form.abstract.trim()
            : null,

        article_url:
          isPublication
            ? form.articleUrl.trim()
            : null,
      };

      let result;

      if (editingId) {
        result =
          await supabase
            .from("documents")
            .update(
              documentData
            )
            .eq(
              "id",
              editingId
            )
            .select()
            .single();
      } else {
        result =
          await supabase
            .from("documents")
            .insert(
              documentData
            )
            .select()
            .single();
      }

      if (result.error) {
        throw result.error;
      }

      setMessage(
        editingId
          ? isPublication
            ? "Publication updated successfully."
            : "Document updated successfully."
          : isPublication
          ? "Publication added successfully."
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

      publicationName:
        document.publication_name ??
        "",

      publicationDate:
        document.publication_date
          ? String(
              document.publication_date
            ).slice(0, 10)
          : "",

      authors:
        document.authors ?? "",

      abstract:
        document.abstract ?? "",

      articleUrl:
        document.article_url ?? "",
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

  async function handleDelete(
    document
  ) {
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
      const { error } =
        await supabase
          .from("documents")
          .delete()
          .eq(
            "id",
            document.id
          );

      if (error) {
        throw error;
      }

      if (
        document.file_path
      ) {
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

      if (
        editingId ===
        document.id
      ) {
        resetForm();
      }

      setMessage(
        document.document_type ===
          "Publication"
          ? "Publication deleted successfully."
          : "Document deleted successfully."
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

  /* ================================= */
  /* PAGE */
  /* ================================= */

  return (
    <div>
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8">
        <p className="text-sm font-medium text-purple-400">
          Portfolio Content
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Publications & Credentials
        </h2>

        <p className="mt-3 text-gray-500">
          Manage research publications,
          certificates, reports and
          selected academic documents.
        </p>
      </div>

      {/* ================================= */}
      {/* MESSAGES */}
      {/* ================================= */}

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
        {/* Form Heading */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {editingId
                ? isPublication
                  ? "Edit Publication"
                  : "Edit Document"
                : isPublication
                ? "Add Publication"
                : "Add Document"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              {isPublication
                ? "Add publication details, authors, abstract and the official article link."
                : "Upload a certificate, report, academic document or other credential."}
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

        {/* ================================= */}
        {/* DOCUMENT TYPE - FIRST */}
        {/* ================================= */}

        <div className="mb-8 max-w-xl">
          <label className="mb-2 block text-sm text-gray-300">
            Document Type
          </label>

          <select
            value={
              form.documentType
            }
            onChange={(event) =>
              handleDocumentTypeChange(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-white/10 bg-[#111427] px-4 py-3 text-white outline-none focus:border-purple-500/60"
          >
            {DOCUMENT_TYPES.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>

          {isPublication && (
            <p className="mt-2 text-xs leading-5 text-purple-300/80">
              Publication mode adds
              journal, date, authors,
              abstract and article URL
              fields.
            </p>
          )}
        </div>

        {/* ================================= */}
        {/* MAIN FORM GRID */}
        {/* ================================= */}

        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* ================================= */}
          {/* FILE UPLOAD */}
          {/* ================================= */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              {isPublication
                ? "Publication PDF / File"
                : "Document File"}
            </label>

            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              {form.fileUrl ? (
                <div className="px-4 text-center">
                  <FileText
                    size={55}
                    className="mx-auto text-purple-400"
                  />

                  <p className="mt-3 text-sm text-green-400">
                    File uploaded
                  </p>
                </div>
              ) : (
                <div className="px-4 text-center">
                  <File
                    size={55}
                    className="mx-auto text-gray-600"
                  />

                  <p className="mt-3 text-sm text-gray-600">
                    {isPublication
                      ? "No PDF uploaded"
                      : "No file selected"}
                  </p>
                </div>
              )}
            </div>

            {/* Upload button */}

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
                  <Upload
                    size={18}
                  />

                  {form.fileUrl
                    ? "Replace File"
                    : isPublication
                    ? "Upload PDF"
                    : "Upload Document"}
                </>
              )}

              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={
                  handleFileUpload
                }
              />
            </label>

            <p className="mt-3 text-xs leading-5 text-gray-600">
              PDF, JPG, PNG or WebP.
              Maximum 15 MB.
            </p>

            {isPublication && (
              <p className="mt-2 text-xs leading-5 text-gray-500">
                Optional. The official
                article URL is used as
                the primary publication
                link.
              </p>
            )}

            {/* Current file actions */}

            {form.fileUrl && (
              <div className="mt-4 space-y-3">
                <a
                  href={form.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-sm text-purple-400 transition hover:text-purple-300"
                >
                  <ExternalLink
                    size={15}
                  />

                  View current file
                </a>

                <button
                  type="button"
                  onClick={
                    handleRemoveCurrentFile
                  }
                  className="mx-auto flex items-center gap-2 text-sm text-red-400 transition hover:text-red-300"
                >
                  <Trash2
                    size={15}
                  />

                  Remove file
                </button>
              </div>
            )}
          </div>

          {/* ================================= */}
          {/* DETAILS */}
          {/* ================================= */}

          <div className="grid gap-6">
            {/* Title */}

            <InputField
              label={
                isPublication
                  ? "Publication Title"
                  : "Document Title"
              }
              value={form.title}
              onChange={(value) =>
                updateField(
                  "title",
                  value
                )
              }
              placeholder={
                isPublication
                  ? "Enter the full publication title"
                  : "Machine Learning Certificate"
              }
              required
            />

            {/* ================================= */}
            {/* PUBLICATION FIELDS */}
            {/* ================================= */}

            {isPublication ? (
              <>
                {/* Journal / Publication */}

                <InputField
                  label="Journal / Conference / Publication"
                  value={
                    form.publicationName
                  }
                  onChange={(value) =>
                    updateField(
                      "publicationName",
                      value
                    )
                  }
                  placeholder="Frontiers in Plant Science"
                  required
                />

                {/* Publication Date */}

                <InputField
                  label="Publication Date"
                  type="date"
                  value={
                    form.publicationDate
                  }
                  onChange={(value) =>
                    updateField(
                      "publicationDate",
                      value
                    )
                  }
                  required
                />

                {/* Authors */}

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Authors
                    <span className="ml-1 text-purple-400">
                      *
                    </span>
                  </label>

                  <textarea
                    value={
                      form.authors
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "authors",
                        event.target
                          .value
                      )
                    }
                    rows={3}
                    placeholder="RH Prince, AA Mamun, HI Peyal, S Miraz, ..."
                    required
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    Enter authors in the
                    same order as the
                    published article.
                  </p>
                </div>

                {/* Abstract */}

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Abstract / Summary
                    <span className="ml-1 text-purple-400">
                      *
                    </span>
                  </label>

                  <textarea
                    value={
                      form.abstract
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "abstract",
                        event.target
                          .value
                      )
                    }
                    rows={7}
                    placeholder="Add a concise abstract or 2–4 sentence summary of the research..."
                    required
                    className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-600">
                    For the portfolio,
                    a concise version of
                    the abstract usually
                    works best.
                  </p>
                </div>

                {/* Article URL */}

                <InputField
                  label="Official Article URL"
                  type="url"
                  value={
                    form.articleUrl
                  }
                  onChange={(value) =>
                    updateField(
                      "articleUrl",
                      value
                    )
                  }
                  placeholder="https://doi.org/... or publisher article URL"
                  required
                />

                <p className="-mt-4 text-xs leading-5 text-gray-600">
                  Prefer the official
                  publisher or DOI page
                  rather than Google
                  Scholar.
                </p>
              </>
            ) : (
              <>
                {/* ================================= */}
                {/* NORMAL DOCUMENT FIELDS */}
                {/* ================================= */}

                <InputField
                  label="Issuer / Organization"
                  value={
                    form.issuer
                  }
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
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "description",
                        event.target
                          .value
                      )
                    }
                    rows={5}
                    placeholder="Briefly describe the certificate or document..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
                  />
                </div>
              </>
            )}

            {/* ================================= */}
            {/* SAVE BUTTON */}
            {/* ================================= */}

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
                    <Save
                      size={18}
                    />

                    {isPublication
                      ? "Update Publication"
                      : "Update Document"}
                  </>
                ) : (
                  <>
                    <Plus
                      size={18}
                    />

                    {isPublication
                      ? "Save Publication"
                      : "Save Document"}
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
            Existing Publications &
            Documents
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {documents.length}{" "}
            {documents.length === 1
              ? "item"
              : "items"}
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">
            <FileText
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No publications or
              documents added
            </h4>

            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              Add a publication,
              certificate, research
              paper or other credential
              using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {documents.map(
              (document) => (
                <DocumentCard
                  key={document.id}
                  document={
                    document
                  }
                  onEdit={() =>
                    handleEdit(
                      document
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      document
                    )
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
  const isPublication =
    document.document_type ===
    "Publication";

  const isImage =
    document.file_url &&
    /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
      document.file_url
    );

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* ================================= */}
      {/* PUBLICATION CARD */}
      {/* ================================= */}

      {isPublication ? (
        <>
          <div className="border-b border-white/10 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-400">
                Publication
              </p>

              {document.publication_date && (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                  {formatPublicationDate(
                    document.publication_date
                  )}
                </span>
              )}
            </div>

            <h4 className="mt-4 text-lg font-semibold leading-7">
              {document.title}
            </h4>

            {document.publication_name && (
              <p className="mt-3 text-sm font-medium text-purple-300">
                {
                  document.publication_name
                }
              </p>
            )}
          </div>

          <div className="p-5">
            {document.authors && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Authors
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {document.authors}
                </p>
              </div>
            )}

            {document.abstract && (
              <div className="mt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
                  Abstract
                </p>

                <p className="mt-2 line-clamp-5 text-sm leading-6 text-gray-400">
                  {document.abstract}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              {document.article_url && (
                <a
                  href={
                    document.article_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
                >
                  <ExternalLink
                    size={15}
                  />

                  View Article
                </a>
              )}

              {document.file_url && (
                <a
                  href={
                    document.file_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                >
                  <FileText
                    size={15}
                  />

                  View PDF
                </a>
              )}
            </div>

            {/* Admin actions */}

            <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
              >
                <Pencil
                  size={15}
                />

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
                  <Trash2
                    size={15}
                  />
                )}

                Delete
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ================================= */}
          {/* NORMAL DOCUMENT CARD */}
          {/* ================================= */}

          <div className="flex h-40 items-center justify-center bg-white/5">
            {isImage ? (
              <img
                src={
                  document.file_url
                }
                alt={
                  document.title
                }
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
              {
                document.document_type
              }
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
                {
                  document.description
                }
              </p>
            )}

            {document.file_url && (
              <a
                href={
                  document.file_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-purple-400 transition hover:text-purple-300"
              >
                <ExternalLink
                  size={15}
                />

                View Document
              </a>
            )}

            {/* Actions */}

            <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onEdit}
                className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-3 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
              >
                <Pencil
                  size={15}
                />

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
                  <Trash2
                    size={15}
                  />
                )}

                Delete
              </button>
            </div>
          </div>
        </>
      )}
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
  type = "text",
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
        type={type}
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

/* ================================= */
/* DATE FORMATTER */
/* ================================= */

function formatPublicationDate(
  value
) {
  if (!value) {
    return "";
  }

  try {
    /*
     * Appending T00:00:00 prevents
     * timezone conversion from moving
     * the date backwards in some
     * regions.
     */
    const date = new Date(
      `${String(value).slice(
        0,
        10
      )}T00:00:00`
    );

    return new Intl.DateTimeFormat(
      "en-AU",
      {
        month: "short",
        year: "numeric",
      }
    ).format(date);
  } catch {
    return value;
  }
}

export default DocumentManager;