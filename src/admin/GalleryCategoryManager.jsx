import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Tags,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  createGalleryCategory,
  deleteGalleryCategory,
  getGalleryCategories,
  updateGalleryCategory,
} from "../services/galleryService";

const EMPTY_FORM = {
  name: "",
  description: "",
  display_order: "0",
  is_active: true,
};

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function GalleryCategoryManager() {
  const [user, setUser] =
    useState(null);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [message, setMessage] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: {
          user: currentUser,
        },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!currentUser) {
        throw new Error(
          "You must be signed in to manage gallery categories."
        );
      }

      setUser(currentUser);

      await loadCategories();
    } catch (error) {
      console.error(
        "Gallery categories loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load gallery categories."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    const data =
      await getGalleryCategories({
        activeOnly: false,
      });

    setCategories(data);
  }

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

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!user?.id) {
        throw new Error(
          "User authentication is unavailable."
        );
      }

      const name =
        form.name.trim();

      if (!name) {
        throw new Error(
          "Category name is required."
        );
      }

      const slug =
        createSlug(name);

      if (!slug) {
        throw new Error(
          "Unable to create a valid category slug."
        );
      }

      const duplicate =
        categories.find(
          (category) =>
            category.slug === slug &&
            category.id !== editingId
        );

      if (duplicate) {
        throw new Error(
          "A category with this name already exists."
        );
      }

      const displayOrder =
        Number.parseInt(
          form.display_order,
          10
        );

      const payload = {
        name,
        slug,

        description:
          form.description.trim(),

        display_order:
          Number.isNaN(
            displayOrder
          )
            ? 0
            : Math.max(
                0,
                displayOrder
              ),

        is_active:
          form.is_active,
      };

      if (editingId) {
        await updateGalleryCategory(
          editingId,
          payload
        );

        setMessage(
          "Gallery category updated successfully."
        );
      } else {
        await createGalleryCategory({
          owner_id: user.id,
          ...payload,
        });

        setMessage(
          "Gallery category added successfully."
        );
      }

      setEditingId(null);
      setForm(EMPTY_FORM);

      await loadCategories();
    } catch (error) {
      console.error(
        "Gallery category save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save gallery category."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category) {
    setEditingId(category.id);

    setForm({
      name:
        category.name ?? "",

      description:
        category.description ?? "",

      display_order:
        String(
          category.display_order ??
            0
        ),

      is_active:
        category.is_active ??
        true,
    });

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(
    category
  ) {
    const confirmed =
      window.confirm(
        `Delete the category "${category.name}"?\n\nPhotos in this category will remain in the gallery but will no longer have this category assigned.`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      category.id
    );

    setMessage("");
    setErrorMessage("");

    try {
      await deleteGalleryCategory(
        category.id
      );

      if (
        editingId ===
        category.id
      ) {
        resetForm();
      }

      setMessage(
        "Gallery category deleted successfully."
      );

      await loadCategories();
    } catch (error) {
      console.error(
        "Gallery category delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete gallery category."
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
            Loading gallery categories...
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
          Gallery Categories
        </h2>

        <p className="mt-3 text-gray-500">
          Create and organise the categories used
          throughout your public gallery.
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
                ? "Edit Category"
                : "Add Category"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Create categories for organising
              and filtering your gallery photos.
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
            label="Category Name"
            value={form.name}
            onChange={(value) =>
              updateField(
                "name",
                value
              )
            }
            placeholder="Travel"
            required
          />

          <InputField
            label="Display Order"
            value={
              form.display_order
            }
            onChange={(value) =>
              updateField(
                "display_order",
                value
              )
            }
            placeholder="0"
            type="number"
            min="0"
            help="Lower numbers appear first."
          />

        </div>

        <div className="mt-6">

          <label className="mb-2 block text-sm text-gray-300">
            Description
          </label>

          <textarea
            value={
              form.description
            }
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
            rows={5}
            placeholder="Describe what this category contains..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
          />

        </div>

        <div className="mt-6">

          <label className="flex cursor-pointer items-center gap-3">

            <input
              type="checkbox"
              checked={
                form.is_active
              }
              onChange={(event) =>
                updateField(
                  "is_active",
                  event.target.checked
                )
              }
              className="h-4 w-4 accent-purple-500"
            />

            <div>

              <p className="text-sm text-gray-300">
                Active Category
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Active categories appear as filters on
                your public gallery.
              </p>

            </div>

          </label>

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
                Update Category
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Category
              </>
            )}
          </button>

        </div>

      </form>

      {/* Existing Categories */}

      <div>

        <div className="mb-5">

          <h3 className="text-xl font-semibold">
            Existing Categories
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {categories.length}{" "}
            {categories.length === 1
              ? "category"
              : "categories"}
          </p>

        </div>

        {categories.length ===
        0 ? (
          <div className="glass-card flex min-h-[250px] flex-col items-center justify-center rounded-3xl p-8 text-center">

            <Tags
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No gallery categories
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              Add your first category using
              the form above.
            </p>

          </div>
        ) : (
          <div className="space-y-5">

            {categories.map(
              (category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() =>
                    handleEdit(
                      category
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      category
                    )
                  }
                  deleting={
                    deletingId ===
                    category.id
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

function CategoryCard({
  category,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="glass-card rounded-2xl p-6">

      <div className="flex flex-wrap items-start justify-between gap-5">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-3">

            <h4 className="text-lg font-semibold">
              {category.name}
            </h4>

            <span
              className={`rounded-full border px-3 py-1 text-xs ${
                category.is_active
                  ? "border-green-500/20 bg-green-500/10 text-green-300"
                  : "border-white/10 bg-white/5 text-gray-500"
              }`}
            >
              {category.is_active
                ? "Active"
                : "Hidden"}
            </span>

          </div>

          <p className="mt-2 text-sm text-purple-400">
            /{category.slug}
          </p>

          {category.description && (
            <p className="mt-4 max-w-3xl leading-7 text-gray-400">
              {category.description}
            </p>
          )}

          <p className="mt-4 text-xs text-gray-600">
            Display order:{" "}
            {category.display_order ??
              0}
          </p>

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

function InputField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  help = "",
  type = "text",
  min,
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
        min={min}
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

export default GalleryCategoryManager;