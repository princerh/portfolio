import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

/* ================================= */
/* SKILL OPTIONS */
/* ================================= */

const SKILL_CATEGORIES = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Database",
  "AI / Machine Learning",
  "AI Frameworks",
  "Computer Vision",
  "Generative AI",
  "Data Science",
  "Cloud",
  "DevOps / MLOps",
  "Research",
  "Professional Skills",
  "Tools",
  "Other",
];

const SKILL_LEVELS = [
  "Learning",
  "Intermediate",
  "Advanced",
];

/* ================================= */
/* DEFAULT FORM */
/* ================================= */

const EMPTY_FORM = {
  name: "",
  category: "Frontend",
  level: "Intermediate",
  featured: false,
};

/* ================================= */
/* SKILL MANAGER */
/* ================================= */

function SkillManager() {
  const [skills, setSkills] =
    useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  /* ================================= */
  /* LOAD SKILLS */
  /* ================================= */

  async function loadSkills() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("skills")
          .select("*")
          .order("category", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      setSkills(data || []);
    } catch (error) {
      console.error(
        "Skill loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load skills."
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

  /* ================================= */
  /* SAVE SKILL */
  /* ================================= */

  async function handleSave(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!form.name.trim()) {
        throw new Error(
          "Skill name is required."
        );
      }

      if (!form.category) {
        throw new Error(
          "Skill category is required."
        );
      }

      if (!form.level) {
        throw new Error(
          "Skill level is required."
        );
      }

      const skillData = {
        name: form.name.trim(),

        category:
          form.category,

        level:
          form.level,

        featured:
          form.featured,
      };

      let result;

      if (editingId) {
        result =
          await supabase
            .from("skills")
            .update(skillData)
            .eq(
              "id",
              editingId
            )
            .select()
            .single();
      } else {
        result =
          await supabase
            .from("skills")
            .insert(skillData)
            .select()
            .single();
      }

      if (result.error) {
        throw result.error;
      }

      setMessage(
        editingId
          ? "Skill updated successfully."
          : "Skill added successfully."
      );

      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadSkills();
    } catch (error) {
      console.error(
        "Skill save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save skill."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================================= */
  /* EDIT */
  /* ================================= */

  function handleEdit(skill) {
    setEditingId(
      skill.id
    );

    setForm({
      name:
        skill.name ?? "",

      category:
        skill.category ??
        "Frontend",

      level:
        skill.level ??
        "Intermediate",

      featured:
        Boolean(
          skill.featured
        ),
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ================================= */
  /* DELETE */
  /* ================================= */

  async function handleDelete(
    skill
  ) {
    const confirmed =
      window.confirm(
        `Delete "${skill.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      skill.id
    );

    setMessage("");
    setErrorMessage("");

    try {
      const { error } =
        await supabase
          .from("skills")
          .delete()
          .eq(
            "id",
            skill.id
          );

      if (error) {
        throw error;
      }

      if (
        editingId ===
        skill.id
      ) {
        resetForm();
      }

      setMessage(
        "Skill deleted successfully."
      );

      await loadSkills();
    } catch (error) {
      console.error(
        "Skill delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete skill."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ================================= */
  /* STATISTICS */
  /* ================================= */

  const stats =
    useMemo(() => {
      const categories =
        new Set(
          skills
            .map(
              (skill) =>
                skill.category
            )
            .filter(Boolean)
        );

      return {
        total:
          skills.length,

        featured:
          skills.filter(
            (skill) =>
              skill.featured
          ).length,

        categories:
          categories.size,
      };
    }, [skills]);

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
            Loading skills...
          </p>
        </div>
      </div>
    );
  }

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
          Skills
        </h2>

        <p className="mt-3 text-gray-500">
          Manage the technologies,
          frameworks, research,
          professional and technical
          skills displayed on your
          portfolio.
        </p>
      </div>

      {/* ================================= */}
      {/* SUCCESS MESSAGE */}
      {/* ================================= */}

      {message && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {/* ================================= */}
      {/* ERROR MESSAGE */}
      {/* ================================= */}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* ================================= */}
      {/* STATS */}
      {/* ================================= */}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Skills"
          value={stats.total}
        />

        <StatCard
          title="Featured"
          value={stats.featured}
        />

        <StatCard
          title="Categories"
          value={stats.categories}
        />
      </div>

      {/* ================================= */}
      {/* ADD / EDIT FORM */}
      {/* ================================= */}

      <form
        onSubmit={handleSave}
        className="glass-card mb-10 rounded-3xl p-6 sm:p-8"
      >
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">
              {editingId
                ? "Edit Skill"
                : "Add New Skill"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add a technology,
              framework, research,
              professional or technical
              skill to your portfolio.
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* ================================= */}
          {/* SKILL NAME */}
          {/* ================================= */}

          <InputField
            label="Skill Name"
            value={form.name}
            onChange={(value) =>
              updateField(
                "name",
                value
              )
            }
            placeholder="React"
            required
          />

          {/* ================================= */}
          {/* CATEGORY */}
          {/* ================================= */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#111427] px-4 py-3 text-white outline-none focus:border-purple-500/60"
            >
              {SKILL_CATEGORIES.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ================================= */}
          {/* LEVEL */}
          {/* ================================= */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Level
            </label>

            <select
              value={form.level}
              onChange={(event) =>
                updateField(
                  "level",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-white/10 bg-[#111427] px-4 py-3 text-white outline-none focus:border-purple-500/60"
            >
              {SKILL_LEVELS.map(
                (level) => (
                  <option
                    key={level}
                    value={level}
                  >
                    {level}
                  </option>
                )
              )}
            </select>
          </div>

          {/* ================================= */}
          {/* FEATURED */}
          {/* ================================= */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Highlight
            </label>

            <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked
                  )
                }
                className="toggle toggle-primary"
              />

              <span className="text-sm text-gray-300">
                Featured Skill
              </span>
            </label>
          </div>
        </div>

        {/* ================================= */}
        {/* SAVE BUTTON */}
        {/* ================================= */}

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

                Update Skill
              </>
            ) : (
              <>
                <Plus size={18} />

                Add Skill
              </>
            )}
          </button>
        </div>
      </form>

      {/* ================================= */}
      {/* EXISTING SKILLS */}
      {/* ================================= */}

      <div>
        <div className="mb-5">
          <h3 className="text-xl font-semibold">
            Existing Skills
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {skills.length}{" "}
            {skills.length === 1
              ? "skill"
              : "skills"}
          </p>
        </div>

        {skills.length === 0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">
            <Sparkles
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No skills yet
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              Add your first skill
              using the form above.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onEdit={() =>
                  handleEdit(skill)
                }
                onDelete={() =>
                  handleDelete(skill)
                }
                deleting={
                  deletingId ===
                  skill.id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================= */
/* SKILL CARD */
/* ================================= */

function SkillCard({
  skill,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-purple-400">
            {skill.category}
          </p>

          <h4 className="mt-2 text-lg font-semibold">
            {skill.name}
          </h4>
        </div>

        {skill.featured && (
          <Star
            size={18}
            className="text-yellow-400"
            fill="currentColor"
          />
        )}
      </div>

      <div className="mt-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
            skill.level ===
            "Advanced"
              ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
              : skill.level ===
                "Intermediate"
              ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
              : "border-gray-500/30 bg-gray-500/10 text-gray-300"
          }`}
        >
          {skill.level}
        </span>
      </div>

      {/* ================================= */}
      {/* ACTIONS */}
      {/* ================================= */}

      <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
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

export default SkillManager;