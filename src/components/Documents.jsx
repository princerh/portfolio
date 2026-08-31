import {
  Award,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  useTheme,
} from "../context/ThemeContext";

function Documents() {
  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const {
    theme,
  } = useTheme();

  const isDark =
    theme === "dark";

  useEffect(() => {
    loadDocuments();
  }, []);

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

      setDocuments(
        data || []
      );
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
  /* CATEGORIES */
  /* ================================= */

  const categories =
    useMemo(() => {
      const types =
        new Set(
          documents
            .map(
              (document) =>
                document.document_type
            )
            .filter(Boolean)
        );

      return [
        "All",
        ...Array.from(types),
      ];
    }, [documents]);

  /* ================================= */
  /* FILTERED DOCUMENTS */
  /* ================================= */

  const filteredDocuments =
    useMemo(() => {
      if (
        activeCategory === "All"
      ) {
        return documents;
      }

      return documents.filter(
        (document) =>
          document.document_type ===
          activeCategory
      );
    }, [
      documents,
      activeCategory,
    ]);

  /* ================================= */
  /* LOADING */
  /* ================================= */

  if (loading) {
    return (
      <section
        id="documents"
        className={`px-6 py-24 transition-colors duration-300 lg:px-8 ${
          isDark
            ? "bg-[#050816]"
            : "bg-white"
        }`}
      >
        <div className="flex min-h-[300px] items-center justify-center">

          <Loader2
            size={34}
            className={`animate-spin ${
              isDark
                ? "text-purple-400"
                : "text-violet-600"
            }`}
          />

        </div>
      </section>
    );
  }

  /* ================================= */
  /* DARK THEME */
  /* ================================= */

  if (isDark) {
    return (
      <section
        id="documents"
        className="relative overflow-hidden px-6 py-24 lg:px-8"
      >

        <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">

          {/* Header */}

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
              Credentials & Work
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">

              Documents &{" "}

              <span className="gradient-text">
                Certificates
              </span>

            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Certificates, research work,
              reports and selected academic
              documents.
            </p>

          </div>

          {/* Error */}

          {errorMessage && (
            <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Filters */}

          {categories.length > 1 && (
            <div className="mb-12 flex flex-wrap justify-center gap-3">

              {categories.map(
                (category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                      activeCategory ===
                      category
                        ? "border-purple-500/50 bg-purple-500/20 text-purple-200"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
                    }`}
                  >
                    {category}
                  </button>
                )
              )}

            </div>
          )}

          {/* Empty */}

          {documents.length === 0 ? (
            <div className="glass-card flex min-h-[280px] flex-col items-center justify-center rounded-3xl text-center">

              <FileText
                size={50}
                className="text-gray-600"
              />

              <p className="mt-4 text-gray-500">
                Documents will appear here.
              </p>

            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

              {filteredDocuments.map(
                (document) => (
                  <DarkDocumentCard
                    key={document.id}
                    document={document}
                  />
                )
              )}

            </div>
          )}

        </div>

      </section>
    );
  }

  /* ================================= */
  /* LIGHT THEME */
  /* DESIGN #2 */
  /* ================================= */

  return (
    <section
      id="documents"
      className="relative overflow-hidden bg-white px-6 py-24 text-slate-900 lg:px-8"
    >

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-180px] top-[10%] h-[380px] w-[380px] rounded-full bg-violet-100/70 blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[380px] w-[380px] rounded-full bg-blue-100/60 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ================================= */}
        {/* LIGHT HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-12 max-w-3xl text-center">

          <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
            Credentials & Work
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

            Documents &{" "}

            <span className="text-violet-700">
              Certificates
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Certificates, research work,
            reports and selected academic
            documents that represent my
            academic and professional work.
          </p>

        </div>

        {/* Error */}

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ================================= */}
        {/* LIGHT FILTERS */}
        {/* ================================= */}

        {categories.length > 1 && (
          <div className="mb-12 flex flex-wrap justify-center gap-3">

            {categories.map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                  className={`rounded-full border px-5 py-2.5 text-sm font-medium transition duration-300 ${
                    activeCategory ===
                    category
                      ? "border-violet-700 bg-violet-700 text-white shadow-md shadow-violet-700/15"
                      : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                  }`}
                >
                  {category}
                </button>
              )
            )}

          </div>
        )}

        {/* ================================= */}
        {/* EMPTY */}
        {/* ================================= */}

        {documents.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">

              <FileText
                size={30}
              />

            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              No documents available
            </h3>

            <p className="mt-3 text-slate-500">
              Documents will appear here.
            </p>

          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

            {filteredDocuments.map(
              (document) => (
                <LightDocumentCard
                  key={document.id}
                  document={document}
                />
              )
            )}

          </div>
        )}

      </div>

    </section>
  );
}


/* ================================= */
/* DARK DOCUMENT CARD */
/* ================================= */

function DarkDocumentCard({
  document,
}) {
  const isImage =
    document.file_url &&
    /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
      document.file_url
    );

  const isCertificate =
    document.document_type ===
    "Certificate";

  return (
    <article className="glass-card group flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-2 hover:border-purple-500/30">

      {/* Preview */}

      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-white/5">

        {isImage ? (
          <img
            src={document.file_url}
            alt={document.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : isCertificate ? (
          <Award
            size={60}
            className="text-purple-400"
          />
        ) : (
          <FileText
            size={60}
            className="text-purple-400"
          />
        )}

        <div className="absolute left-4 top-4 rounded-full border border-purple-500/20 bg-[#090c1b]/80 px-3 py-1 text-xs text-purple-300 backdrop-blur-md">
          {document.document_type}
        </div>

      </div>

      {/* Details */}

      <div className="flex flex-1 flex-col p-6">

        <h3 className="text-lg font-semibold text-white transition group-hover:text-purple-300">
          {document.title}
        </h3>

        {document.issuer && (
          <p className="mt-2 text-sm font-medium text-purple-400">
            {document.issuer}
          </p>
        )}

        {document.description && (
          <p className="mt-4 leading-7 text-gray-400">
            {document.description}
          </p>
        )}

        <div className="flex-1" />

        {document.file_url && (
          <div className="mt-6 border-t border-white/10 pt-5">

            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-300 transition hover:bg-purple-500/20"
            >
              View Document

              <ExternalLink
                size={16}
              />
            </a>

          </div>
        )}

      </div>

    </article>
  );
}


/* ================================= */
/* LIGHT DOCUMENT CARD */
/* ================================= */

function LightDocumentCard({
  document,
}) {
  const isImage =
    document.file_url &&
    /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(
      document.file_url
    );

  const isCertificate =
    document.document_type ===
    "Certificate";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-2 hover:border-violet-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]">

      {/* ================================= */}
      {/* PREVIEW */}
      {/* ================================= */}

      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50 to-slate-100">

        {isImage ? (
          <img
            src={document.file_url}
            alt={document.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-3">

            <div
              className={`flex h-20 w-20 items-center justify-center rounded-3xl shadow-sm ${
                isCertificate
                  ? "bg-amber-50 text-amber-600"
                  : "bg-white text-violet-600"
              }`}
            >
              {isCertificate ? (
                <Award
                  size={38}
                />
              ) : (
                <FileText
                  size={38}
                />
              )}
            </div>

          </div>
        )}

        {/* Type badge */}

        {document.document_type && (
          <div className="absolute left-4 top-4">

            <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur-md">
              {document.document_type}
            </span>

          </div>
        )}

      </div>

      {/* ================================= */}
      {/* CONTENT */}
      {/* ================================= */}

      <div className="flex flex-1 flex-col p-6">

        <h3 className="text-lg font-bold leading-7 text-slate-900 transition duration-300 group-hover:text-violet-700">
          {document.title}
        </h3>

        {document.issuer && (
          <p className="mt-2 text-sm font-semibold text-violet-700">
            {document.issuer}
          </p>
        )}

        {document.description && (
          <p className="mt-4 leading-7 text-slate-600">
            {document.description}
          </p>
        )}

        <div className="flex-1" />

        {/* ================================= */}
        {/* LINK */}
        {/* ================================= */}

        {document.file_url && (
          <div className="mt-6 border-t border-slate-100 pt-5">

            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-violet-700"
            >
              View Document

              <ExternalLink
                size={16}
              />

            </a>

          </div>
        )}

      </div>

    </article>
  );
}

export default Documents;