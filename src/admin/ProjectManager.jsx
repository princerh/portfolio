import {
  ExternalLink,
  FolderKanban,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

const EMPTY_FORM = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "Software Engineering",
  technologies: "",
  githubUrl: "",
  demoUrl: "",
  featured: false,
  imageUrl: "",
  imagePath: "",
};

function ProjectManager() {
  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState(
    EMPTY_FORM
  );

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
          .order("title", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      setProjects(
        data || []
      );
    } catch (error) {
      console.error(
        "Project loading error:",
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

  function generateSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      );
  }

  function handleTitleChange(
    value
  ) {
    setForm((current) => ({
      ...current,
      title: value,

      slug:
        editingId
          ? current.slug
          : generateSlug(
              value
            ),
    }));
  }

  function resetForm() {
    setEditingId(null);

    setForm(
      EMPTY_FORM
    );

    setMessage("");
    setErrorMessage("");
  }

  /* ================================= */
  /* IMAGE UPLOAD */
  /* ================================= */

  async function handleImageUpload(
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
          "Only JPG, PNG and WebP images are allowed."
        );
      }

      const maxSize =
        8 * 1024 * 1024;

      if (
        file.size > maxSize
      ) {
        throw new Error(
          "Project image must be smaller than 8 MB."
        );
      }

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const fileName =
        `project-${Date.now()}.${extension}`;

      const filePath =
        `projects/${fileName}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("portfolio")
        .upload(
          filePath,
          file,
          {
            cacheControl:
              "3600",

            upsert:
              false,
          }
        );

      if (
        uploadError
      ) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from("portfolio")
          .getPublicUrl(
            filePath
          );

      if (
        !publicUrlData
          ?.publicUrl
      ) {
        throw new Error(
          "Unable to generate project image URL."
        );
      }

      setForm((current) => ({
        ...current,

        imageUrl:
          publicUrlData.publicUrl,

        imagePath:
          filePath,
      }));

      setMessage(
        "Project image uploaded successfully."
      );
    } catch (error) {
      console.error(
        "Project image upload error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to upload project image."
      );
    } finally {
      setUploading(false);

      event.target.value =
        "";
    }
  }

  /* ================================= */
  /* SAVE PROJECT */
  /* ================================= */

  async function handleSave(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (
        !form.title.trim()
      ) {
        throw new Error(
          "Project title is required."
        );
      }

      if (
        !form.slug.trim()
      ) {
        throw new Error(
          "Project slug is required."
        );
      }

      const technologies =
        form.technologies
          .split(",")
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const projectData = {
        title:
          form.title.trim(),

        slug:
          form.slug.trim(),

        short_description:
          form.shortDescription.trim(),

        description:
          form.description.trim(),

        category:
          form.category,

        technologies,

        image_url:
          form.imageUrl ||
          null,

        image_path:
          form.imagePath ||
          null,

        github_url:
          form.githubUrl.trim() ||
          null,

        demo_url:
          form.demoUrl.trim() ||
          null,

        featured:
          form.featured,
      };

      let result;

      if (
        editingId
      ) {
        result =
          await supabase
            .from(
              "projects"
            )
            .update(
              projectData
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
            .from(
              "projects"
            )
            .insert(
              projectData
            )
            .select()
            .single();
      }

      if (
        result.error
      ) {
        throw result.error;
      }

      setMessage(
        editingId
          ? "Project updated successfully."
          : "Project added successfully."
      );

      setEditingId(
        null
      );

      setForm(
        EMPTY_FORM
      );

      await loadProjects();
    } catch (error) {
      console.error(
        "Project save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save project."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================================= */
  /* EDIT PROJECT */
  /* ================================= */

  function handleEdit(
    project
  ) {
    setEditingId(
      project.id
    );

    setForm({
      title:
        project.title ??
        "",

      slug:
        project.slug ??
        "",

      shortDescription:
        project.short_description ??
        "",

      description:
        project.description ??
        "",

      category:
        project.category ??
        "Software Engineering",

      technologies:
        Array.isArray(
          project.technologies
        )
          ? project.technologies.join(
              ", "
            )
          : "",

      githubUrl:
        project.github_url ??
        "",

      demoUrl:
        project.demo_url ??
        "",

      featured:
        Boolean(
          project.featured
        ),

      imageUrl:
        project.image_url ??
        "",

      imagePath:
        project.image_path ??
        "",
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior:
        "smooth",
    });
  }

  /* ================================= */
  /* DELETE PROJECT */
  /* ================================= */

  async function handleDelete(
    project
  ) {
    const confirmed =
      window.confirm(
        `Delete "${project.title}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      project.id
    );

    setMessage("");
    setErrorMessage("");

    try {
      const { error } =
        await supabase
          .from(
            "projects"
          )
          .delete()
          .eq(
            "id",
            project.id
          );

      if (error) {
        throw error;
      }

      if (
        project.image_path
      ) {
        const {
          error:
            imageDeleteError,
        } =
          await supabase.storage
            .from(
              "portfolio"
            )
            .remove([
              project.image_path,
            ]);

        if (
          imageDeleteError
        ) {
          console.warn(
            "Project image could not be removed:",
            imageDeleteError.message
          );
        }
      }

      if (
        editingId ===
        project.id
      ) {
        resetForm();
      }

      setMessage(
        "Project deleted successfully."
      );

      await loadProjects();
    } catch (error) {
      console.error(
        "Project delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete project."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }

  /* ================================= */
  /* STATISTICS */
  /* ================================= */

  const stats =
    useMemo(() => {
      const categories =
        new Set(
          projects
            .map(
              (project) =>
                project.category
            )
            .filter(Boolean)
        );

      return {
        total:
          projects.length,

        featured:
          projects.filter(
            (project) =>
              project.featured
          ).length,

        categories:
          categories.size,
      };
    }, [projects]);

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
            Loading projects...
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

      {/* Header */}

      <div className="mb-8">

        <p className="text-sm font-medium text-purple-400">
          Portfolio Content
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Projects
        </h2>

        <p className="mt-3 text-gray-500">
          Create and manage the
          projects displayed on your
          public portfolio.
        </p>

      </div>

      {/* Success Message */}

      {message && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {/* Error Message */}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* ================================= */}
      {/* STATISTICS */}
      {/* ================================= */}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">

        <StatCard
          title="Total Projects"
          value={
            stats.total
          }
        />

        <StatCard
          title="Featured"
          value={
            stats.featured
          }
        />

        <StatCard
          title="Categories"
          value={
            stats.categories
          }
        />

      </div>

      {/* ================================= */}
      {/* FORM */}
      {/* ================================= */}

      <form
        onSubmit={
          handleSave
        }
        className="glass-card mb-10 rounded-3xl p-6 sm:p-8"
      >

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h3 className="text-xl font-semibold">

              {editingId
                ? "Edit Project"
                : "Add New Project"}

            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your project
              information, image,
              technologies and links.
            </p>

          </div>

          {editingId && (
            <button
              type="button"
              onClick={
                resetForm
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
            >

              <X size={17} />

              Cancel Edit

            </button>
          )}

        </div>

        <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">

          {/* ================================= */}
          {/* PROJECT IMAGE */}
          {/* ================================= */}

          <div>

            <label className="mb-2 block text-sm text-gray-300">
              Project Image
            </label>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">

              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden">

                {form.imageUrl ? (
                  <img
                    src={
                      form.imageUrl
                    }
                    alt="Project preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus
                    size={55}
                    className="text-gray-600"
                  />
                )}

              </div>

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
                  <Upload
                    size={18}
                  />

                  Upload Image
                </>
              )}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={
                  uploading
                }
                onChange={
                  handleImageUpload
                }
              />

            </label>

            <p className="mt-3 text-xs leading-5 text-gray-600">
              JPG, PNG or WebP.
              Maximum file size:
              8 MB.
            </p>

          </div>

          {/* ================================= */}
          {/* PROJECT DETAILS */}
          {/* ================================= */}

          <div className="grid gap-6">

            <div className="grid gap-6 md:grid-cols-2">

              <InputField
                label="Project Title"
                value={
                  form.title
                }
                onChange={
                  handleTitleChange
                }
                placeholder="Project Orion"
                required
              />

              <InputField
                label="Slug"
                value={
                  form.slug
                }
                onChange={(value) =>
                  updateField(
                    "slug",
                    generateSlug(
                      value
                    )
                  )
                }
                placeholder="project-orion"
                required
              />

            </div>

            {/* Category */}

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Category
              </label>

              <select
                value={
                  form.category
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "category",
                    event.target
                      .value
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#111427] px-4 py-3 text-white outline-none focus:border-purple-500/60"
              >

                <option>
                  Software Engineering
                </option>

                <option>
                  Full Stack
                </option>

                <option>
                  Frontend Development
                </option>

                <option>
                  Backend Development
                </option>

                <option>
                  Mobile Development
                </option>

                <option>
                  AI / Machine Learning
                </option>

                <option>
                  Computer Vision
                </option>

                <option>
                  Generative AI
                </option>

                <option>
                  Research
                </option>

                <option>
                  Other
                </option>

              </select>

            </div>

            {/* Short Description */}

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Short Description
              </label>

              <textarea
                value={
                  form.shortDescription
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "shortDescription",
                    event.target
                      .value
                  )
                }
                rows={3}
                maxLength={
                  300
                }
                placeholder="A short summary that will appear on the project card."
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
              />

              <p className="mt-1 text-right text-xs text-gray-600">

                {
                  form
                    .shortDescription
                    .length
                }
                /300

              </p>

            </div>

            {/* Full Description */}

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Full Description
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
                rows={7}
                placeholder="Describe the project, features, your contribution, technologies and results."
                className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
              />

            </div>

            {/* Technologies */}

            <InputField
              label="Technologies"
              value={
                form.technologies
              }
              onChange={(
                value
              ) =>
                updateField(
                  "technologies",
                  value
                )
              }
              placeholder="React, JavaScript, Tailwind CSS, FastAPI, Docker"
              help="Separate each technology with a comma."
            />

            {/* Links */}

            <div className="grid gap-6 md:grid-cols-2">

              <InputField
                label="GitHub URL"
                type="url"
                value={
                  form.githubUrl
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "githubUrl",
                    value
                  )
                }
                placeholder="https://github.com/..."
              />

              <InputField
                label="Live Demo URL"
                type="url"
                value={
                  form.demoUrl
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "demoUrl",
                    value
                  )
                }
                placeholder="https://..."
              />

            </div>

            {/* Featured */}

            <ToggleField
              label="Featured Project"
              checked={
                form.featured
              }
              onChange={(
                checked
              ) =>
                updateField(
                  "featured",
                  checked
                )
              }
            />

            {/* Save */}

            <div className="pt-2">

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

                    Update Project
                  </>
                ) : (
                  <>
                    <Plus
                      size={18}
                    />

                    Add Project
                  </>
                )}

              </button>

            </div>

          </div>

        </div>

      </form>

      {/* ================================= */}
      {/* PROJECT LIST */}
      {/* ================================= */}

      <div>

        <div className="mb-5">

          <h3 className="text-xl font-semibold">
            Existing Projects
          </h3>

          <p className="mt-1 text-sm text-gray-500">

            {projects.length}{" "}

            {projects.length === 1
              ? "project"
              : "projects"}

          </p>

        </div>

        {projects.length ===
        0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">

            <FolderKanban
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No projects yet
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              Add your first
              project using the
              form above.
            </p>

          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">

            {projects.map(
              (project) => (
                <ProjectCard
                  key={
                    project.id
                  }
                  project={
                    project
                  }
                  onEdit={() =>
                    handleEdit(
                      project
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      project
                    )
                  }
                  deleting={
                    deletingId ===
                    project.id
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
/* PROJECT CARD */
/* ================================= */

function ProjectCard({
  project,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="glass-card overflow-hidden rounded-3xl">

      {/* Image */}

      <div className="relative aspect-[16/8] overflow-hidden bg-white/5">

        {project.image_url ? (
          <img
            src={
              project.image_url
            }
            alt={
              project.title
            }
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">

            <FolderKanban
              size={45}
              className="text-gray-700"
            />

          </div>
        )}

        {/* Featured Badge */}

        {project.featured && (
          <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-yellow-500/90 px-3 py-1 text-xs font-semibold text-black">

            <Star
              size={13}
              fill="currentColor"
            />

            Featured

          </div>
        )}

      </div>

      {/* Content */}

      <div className="p-6">

        <p className="text-xs font-medium text-purple-400">
          {project.category}
        </p>

        <h4 className="mt-2 text-xl font-semibold">
          {project.title}
        </h4>

        {project.short_description && (
          <p className="mt-3 text-sm leading-6 text-gray-500">

            {
              project.short_description
            }

          </p>
        )}

        {/* Technologies */}

        {Array.isArray(
          project.technologies
        ) &&
          project.technologies
            .length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">

              {project.technologies.map(
                (
                  technology,
                  index
                ) => (
                  <span
                    key={`${technology}-${index}`}
                    className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300"
                  >
                    {
                      technology
                    }
                  </span>
                )
              )}

            </div>
          )}

        {/* Links */}

        <div className="mt-5 flex flex-wrap gap-4">

          {project.github_url && (
            <a
              href={
                project.github_url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-400 transition hover:text-purple-400"
            >

              GitHub

              <ExternalLink
                size={14}
              />

            </a>
          )}

          {project.demo_url && (
            <a
              href={
                project.demo_url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-400 transition hover:text-purple-400"
            >

              Live Demo

              <ExternalLink
                size={14}
              />

            </a>
          )}

        </div>

        {/* Actions */}

        <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">

          <button
            type="button"
            onClick={
              onEdit
            }
            className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
          >

            <Pencil
              size={16}
            />

            Edit

          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            disabled={
              deleting
            }
            className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          >

            {deleting ? (
              <Loader2
                size={16}
                className="animate-spin"
              />
            ) : (
              <Trash2
                size={16}
              />
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
  type = "text",
  required = false,
  help = "",
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
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .value
          )
        }
        placeholder={
          placeholder
        }
        required={
          required
        }
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
      />

      {help && (
        <p className="mt-2 text-xs text-gray-600">
          {help}
        </p>
      )}

    </div>
  );
}


/* ================================= */
/* TOGGLE FIELD */
/* ================================= */

function ToggleField({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">

      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target
              .checked
          )
        }
        className="toggle toggle-primary"
      />

      <span className="text-sm text-gray-300">
        {label}
      </span>

    </label>
  );
}


/* ================================= */
/* STAT CARD */
/* ================================= */

function StatCard({
  title,
  value,
}) {
  return (
    <div className="glass-card rounded-2xl p-5">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

    </div>
  );
}

export default ProjectManager;