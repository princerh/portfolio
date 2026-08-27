import {
  GraduationCap,
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
  institution: "",
  degree: "",
  field: "",
  location: "",
  passingYear: "",
  description: "",
  resultScore: "",
};

function EducationManager() {
  const [education, setEducation] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

      if (error) {
        throw error;
      }

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

      setMessage(
        editingId
          ? "Education updated successfully."
          : "Education added successfully."
      );

      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadEducation();
    } catch (error) {
      console.error(
        "Education save error:",
        error
      );

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
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(item) {
    const confirmed =
      window.confirm(
        `Delete "${item.degree}" from "${item.institution}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(item.id);
    setMessage("");
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("education")
        .delete()
        .eq("id", item.id);

      if (error) {
        throw error;
      }

      if (editingId === item.id) {
        resetForm();
      }

      setMessage(
        "Education deleted successfully."
      );

      await loadEducation();
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
          Manage your academic background
          and qualifications.
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
              result and other academic details.
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

      {/* Existing education */}

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
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
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

export default EducationManager;