import {
  ExternalLink,
  FolderKanban,
  Loader2,
  Star,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

function Projects() {
  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("All");

  useEffect(() => {
    loadProjects();
  }, []);

  /* ================================= */
  /* LOAD PROJECTS */
  /* ================================= */

  async function loadProjects() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("projects")
          .select("*")
          .order("featured", {
            ascending: false,
          })
          .order("title", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error) {
      console.error(
        "Unable to load projects:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load projects."
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
      const uniqueCategories =
        new Set(
          projects
            .map(
              (project) =>
                project.category
            )
            .filter(Boolean)
        );

      return [
        "All",
        ...Array.from(
          uniqueCategories
        ),
      ];
    }, [projects]);

  /* ================================= */
  /* FILTERED PROJECTS */
  /* ================================= */

  const filteredProjects =
    useMemo(() => {
      if (
        activeCategory ===
        "All"
      ) {
        return projects;
      }

      return projects.filter(
        (project) =>
          project.category ===
          activeCategory
      );
    }, [
      projects,
      activeCategory,
    ]);

  /* ================================= */
  /* LOADING */
  /* ================================= */

  if (loading) {
    return (
      <section
        id="projects"
        className="relative px-6 py-24 lg:px-8"
      >
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center">

          <div className="text-center">

            <Loader2
              size={36}
              className="mx-auto animate-spin text-purple-400"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading projects...
            </p>

          </div>

        </div>
      </section>
    );
  }

  /* ================================= */
  /* PAGE */
  /* ================================= */

  return (
    <section
      id="projects"
      className="relative overflow-hidden px-6 py-24 lg:px-8"
    >
      {/* Background decoration */}

      <div className="pointer-events-none absolute left-[-150px] top-[20%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-[-150px] right-[-100px] h-[400px] w-[400px] rounded-full bg-pink-600/10 blur-[130px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* ================================= */}
        {/* SECTION HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-12 max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
            My Work
          </p>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">

            Featured{" "}

            <span className="gradient-text">
              Projects
            </span>

          </h2>

          <p className="mt-5 leading-7 text-gray-400">

            A selection of my software
            engineering, AI/ML and research
            projects.

          </p>

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {errorMessage && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* ================================= */}
        {/* CATEGORY FILTERS */}
        {/* ================================= */}

        {categories.length > 1 && (
          <div className="mb-12 flex flex-wrap justify-center gap-3">

            {categories.map(
              (category) => {

                const isActive =
                  activeCategory ===
                  category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition duration-300 ${
                      isActive
                        ? "border-purple-500/50 bg-purple-500/20 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
                    }`}
                  >
                    {category}
                  </button>
                );
              }
            )}

          </div>
        )}

        {/* ================================= */}
        {/* NO PROJECTS */}
        {/* ================================= */}

        {projects.length === 0 && (
          <div className="glass-card flex min-h-[300px] flex-col items-center justify-center rounded-3xl p-8 text-center">

            <FolderKanban
              size={52}
              className="text-gray-600"
            />

            <h3 className="mt-5 text-xl font-semibold">
              No projects available
            </h3>

            <p className="mt-3 max-w-md leading-7 text-gray-500">
              Projects added from the admin
              dashboard will automatically
              appear here.
            </p>

          </div>
        )}

        {/* ================================= */}
        {/* FILTER EMPTY */}
        {/* ================================= */}

        {projects.length > 0 &&
          filteredProjects.length ===
            0 && (
            <div className="py-20 text-center">

              <FolderKanban
                size={45}
                className="mx-auto text-gray-700"
              />

              <p className="mt-4 text-gray-500">
                No projects in this
                category.
              </p>

            </div>
          )}

        {/* ================================= */}
        {/* PROJECT GRID */}
        {/* ================================= */}

        {filteredProjects.length > 0 && (
          <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">

            {filteredProjects.map(
              (project) => (
                <PublicProjectCard
                  key={project.id}
                  project={project}
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
/* PROJECT CARD */
/* ================================= */

function PublicProjectCard({
  project,
}) {
  const technologies =
    Array.isArray(
      project.technologies
    )
      ? project.technologies
      : [];

  return (
    <article className="glass-card group flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-2 hover:border-purple-500/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">

      {/* ================================= */}
      {/* PROJECT IMAGE */}
      {/* ================================= */}

      <div className="relative aspect-[16/10] overflow-hidden bg-white/5">

        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">

            <FolderKanban
              size={55}
              className="text-gray-700"
            />

          </div>
        )}

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-[#070a17]/80 via-transparent to-transparent opacity-70" />

        {/* Featured Badge */}

        {project.featured && (
          <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-yellow-300/20 bg-yellow-400/90 px-3 py-1.5 text-xs font-semibold text-black shadow-lg">

            <Star
              size={13}
              fill="currentColor"
            />

            Featured

          </div>
        )}

        {/* Category */}

        {project.category && (
          <div className="absolute bottom-4 left-4">

            <span className="rounded-full border border-white/10 bg-[#090c1b]/80 px-3 py-1.5 text-xs font-medium text-purple-300 backdrop-blur-md">

              {project.category}

            </span>

          </div>
        )}

      </div>

      {/* ================================= */}
      {/* PROJECT CONTENT */}
      {/* ================================= */}

      <div className="flex flex-1 flex-col p-6">

        <h3 className="text-xl font-semibold text-white transition group-hover:text-purple-300">
          {project.title}
        </h3>

        {project.short_description && (
          <p className="mt-3 leading-7 text-gray-400">

            {project.short_description}

          </p>
        )}

        {/* ================================= */}
        {/* TECHNOLOGIES */}
        {/* ================================= */}

        {technologies.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">

            {technologies
              .slice(0, 6)
              .map(
                (
                  technology,
                  index
                ) => (
                  <span
                    key={`${technology}-${index}`}
                    className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
                  >
                    {technology}
                  </span>
                )
              )}

            {technologies.length >
              6 && (
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-500">

                +
                {technologies.length -
                  6}

              </span>
            )}

          </div>
        )}

        {/* Push links to bottom */}

        <div className="flex-1" />

        {/* ================================= */}
        {/* PROJECT LINKS */}
        {/* ================================= */}

        {(project.github_url ||
          project.demo_url) && (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-white/10 pt-5">

            {project.github_url && (
              <a
                href={
                  project.github_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300"
              >

                <GitHubIcon
                  size={17}
                />

                GitHub

              </a>
            )}

            {project.demo_url && (
              <a
                href={
                  project.demo_url
                }
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-button flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white"
              >

                Live Demo

                <ExternalLink
                  size={16}
                />

              </a>
            )}

          </div>
        )}

      </div>

    </article>
  );
}


/* ================================= */
/* GITHUB ICON */
/* ================================= */

function GitHubIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.337 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.34-.012 2.421-.012 2.75 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

export default Projects;