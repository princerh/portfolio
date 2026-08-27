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

  if (loading) {
    return (
      <section
        id="documents"
        className="px-6 py-24 lg:px-8"
      >
        <div className="flex min-h-[300px] items-center justify-center">

          <Loader2
            size={34}
            className="animate-spin text-purple-400"
          />

        </div>
      </section>
    );
  }

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
                <PublicDocumentCard
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
/* PUBLIC DOCUMENT CARD */
/* ================================= */

function PublicDocumentCard({
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

export default Documents;