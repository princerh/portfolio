import {
  BriefcaseBusiness,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

const EMPTY_FORM = {
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  description: "",
  technologies: "",
};

function ExperienceManager() {
  const [experience, setExperience] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadExperience();
  }, []);

  async function loadExperience() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("company", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setExperience(data || []);
    } catch (error) {
      console.error(
        "Experience loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load experience."
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

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage("");
    setErrorMessage("");
  }

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!form.company.trim()) {
        throw new Error(
          "Company name is required."
        );
      }

      if (!form.position.trim()) {
        throw new Error(
          "Position is required."
        );
      }

      const technologies = form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const experienceData = {
        company: form.company.trim(),
        position: form.position.trim(),
        location: form.location.trim(),
        start_date: form.startDate.trim(),
        end_date: form.endDate.trim(),
        description: form.description.trim(),
        technologies,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("experience")
          .update(experienceData)
          .eq("id", editingId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("experience")
          .insert(experienceData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setMessage(
        editingId
          ? "Experience updated successfully."
          : "Experience added successfully."
      );

      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadExperience();
    } catch (error) {
      console.error(
        "Experience save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save experience."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      company:
        item.company ?? "",

      position:
        item.position ?? "",

      location:
        item.location ?? "",

      startDate:
        item.start_date ?? "",

      endDate:
        item.end_date ?? "",

      description:
        item.description ?? "",

      technologies:
        Array.isArray(
          item.technologies
        )
          ? item.technologies.join(", ")
          : "",
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete "${item.position}" at "${item.company}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("experience")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      if (editingId === item.id) {
        resetForm();
      }

      setMessage(
        "Experience deleted successfully."
      );

      await loadExperience();
    } catch (error) {
      console.error(
        "Experience delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete experience."
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
            Loading experience...
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
          Experience
        </h2>

        <p className="mt-3 text-gray-500">
          Manage your professional and technical experience.
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
                ? "Edit Experience"
                : "Add Experience"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add your role, company, responsibilities and technologies.
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
          <InputField
            label="Company / Organization"
            value={form.company}
            onChange={(value) =>
              updateField(
                "company",
                value
              )
            }
            placeholder="Company name"
            required
          />

          <InputField
            label="Position / Role"
            value={form.position}
            onChange={(value) =>
              updateField(
                "position",
                value
              )
            }
            placeholder="Frontend Developer"
            required
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
            placeholder="Melbourne, Australia"
          />

          <InputField
            label="Start Date"
            value={form.startDate}
            onChange={(value) =>
              updateField(
                "startDate",
                value
              )
            }
            placeholder="Jan 2026"
          />

          <InputField
            label="End Date"
            value={form.endDate}
            onChange={(value) =>
              updateField(
                "endDate",
                value
              )
            }
            placeholder="Present"
          />

          <InputField
            label="Technologies"
            value={form.technologies}
            onChange={(value) =>
              updateField(
                "technologies",
                value
              )
            }
            placeholder="React, JavaScript, Tailwind CSS"
            help="Separate technologies with commas."
          />
        </div>

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
            rows={6}
            placeholder="Describe your responsibilities, contributions and achievements..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
          />
        </div>

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
                Update Experience
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Experience
              </>
            )}
          </button>
        </div>
      </form>

      {/* Existing Experience */}

      <div>
        <div className="mb-5">
          <h3 className="text-xl font-semibold">
            Existing Experience
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {experience.length}{" "}
            {experience.length === 1
              ? "entry"
              : "entries"}
          </p>
        </div>

        {experience.length === 0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">
            <BriefcaseBusiness
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No experience added
            </h4>
          </div>
        ) : (
          <div className="space-y-5">
            {experience.map((item) => (
              <ExperienceCard
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

function ExperienceCard({
  item,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h4 className="text-lg font-semibold">
            {item.position}
          </h4>

          <p className="mt-2 text-purple-400">
            {item.company}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
            {item.location && (
              <span>
                {item.location}
              </span>
            )}

            {(item.start_date ||
              item.end_date) && (
              <span>
                {item.start_date}

                {item.start_date &&
                  item.end_date &&
                  " - "}

                {item.end_date}
              </span>
            )}
          </div>

          {item.description && (
            <p className="mt-4 max-w-3xl leading-7 text-gray-400">
              {item.description}
            </p>
          )}

          {Array.isArray(
            item.technologies
          ) &&
            item.technologies.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.technologies.map(
                  (
                    technology,
                    index
                  ) => (
                    <span
                      key={`${technology}-${index}`}
                      className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300"
                    >
                      {technology}
                    </span>
                  )
                )}
              </div>
            )}
        </div>

        <div className="flex gap-3">
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
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
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

      {help && (
        <p className="mt-2 text-xs text-gray-600">
          {help}
        </p>
      )}
    </div>
  );
}

export default ExperienceManager;