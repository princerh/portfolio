import {
  CalendarDays,
  ImagePlus,
  Images,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  createGalleryPhoto,
  deleteGalleryPhotoRecord,
  getGalleryCategories,
  getGalleryPhotos,
  updateGalleryPhoto,
} from "../services/galleryService";

import {
  deleteGalleryImage,
  uploadGalleryImage,
} from "../utils/galleryStorage";

const EMPTY_FORM = {
  title: "",
  category_id: "",
  location: "",
  taken_date: "",
  caption: "",
  display_order: "0",
  featured: false,
  is_published: true,
};

const MAX_FILE_SIZE =
  15 * 1024 * 1024;

function GalleryManager() {
  const fileInputRef =
    useRef(null);

  const [user, setUser] =
    useState(null);

  const [photos, setPhotos] =
    useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [
    editingPhoto,
    setEditingPhoto,
  ] = useState(null);

  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState("");

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

  useEffect(() => {
    return () => {
      if (
        previewUrl &&
        selectedFile
      ) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl, selectedFile]);

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
          "You must be signed in to manage gallery photos."
        );
      }

      setUser(currentUser);

      await loadGalleryData();
    } catch (error) {
      console.error(
        "Gallery loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load gallery."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadGalleryData() {
    const [
      categoryData,
      photoData,
    ] = await Promise.all([
      getGalleryCategories({
        activeOnly: false,
      }),

      getGalleryPhotos({
        publishedOnly: false,
        featuredOnly: false,
      }),
    ]);

    setCategories(
      categoryData
    );

    setPhotos(photoData);
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

  function clearFileSelection() {
    if (
      previewUrl &&
      selectedFile
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(null);
    setPreviewUrl("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function resetForm() {
    setEditingPhoto(null);
    setForm(EMPTY_FORM);

    clearFileSelection();

    setMessage("");
    setErrorMessage("");
  }

  function handleFileChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    setMessage("");
    setErrorMessage("");

    if (!file) {
      clearFileSelection();
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      event.target.value = "";

      setErrorMessage(
        "Please select a valid image file."
      );

      return;
    }

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      event.target.value = "";

      setErrorMessage(
        "The selected image is larger than 15 MB."
      );

      return;
    }

    if (
      previewUrl &&
      selectedFile
    ) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(
        file
      )
    );
  }

  async function handleSave(
    event
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    let newlyUploadedPath =
      null;

    try {
      if (!user?.id) {
        throw new Error(
          "User authentication is unavailable."
        );
      }

      const title =
        form.title.trim();

      if (!title) {
        throw new Error(
          "Photo title is required."
        );
      }

      if (
        !editingPhoto &&
        !selectedFile
      ) {
        throw new Error(
          "Please select an image to upload."
        );
      }

      let imagePath =
        editingPhoto?.image_path ||
        "";

      if (selectedFile) {
        imagePath =
          await uploadGalleryImage({
            file: selectedFile,
            userId: user.id,
          });

        newlyUploadedPath =
          imagePath;
      }

      const displayOrder =
        Number.parseInt(
          form.display_order,
          10
        );

      const payload = {
        title,

        category_id:
          form.category_id ||
          null,

        location:
          form.location.trim(),

        taken_date:
          form.taken_date ||
          null,

        caption:
          form.caption.trim(),

        display_order:
          Number.isNaN(
            displayOrder
          )
            ? 0
            : Math.max(
                0,
                displayOrder
              ),

        featured:
          form.featured,

        is_published:
          form.is_published,

        image_path:
          imagePath,
      };

      if (editingPhoto) {
        const oldImagePath =
          editingPhoto.image_path;

        await updateGalleryPhoto(
          editingPhoto.id,
          payload
        );

        if (
          selectedFile &&
          oldImagePath &&
          oldImagePath !==
            imagePath
        ) {
          try {
            await deleteGalleryImage(
              oldImagePath
            );
          } catch (
            storageError
          ) {
            console.warn(
              "Old gallery image could not be removed:",
              storageError
            );
          }
        }

        setMessage(
          "Gallery photo updated successfully."
        );
      } else {
        await createGalleryPhoto({
          owner_id: user.id,
          ...payload,
        });

        setMessage(
          "Gallery photo uploaded successfully."
        );
      }

      newlyUploadedPath =
        null;

      setEditingPhoto(null);
      setForm(EMPTY_FORM);
      clearFileSelection();

      await loadGalleryData();
    } catch (error) {
      console.error(
        "Gallery save error:",
        error
      );

      if (
        newlyUploadedPath
      ) {
        try {
          await deleteGalleryImage(
            newlyUploadedPath
          );
        } catch (
          cleanupError
        ) {
          console.warn(
            "Failed to clean uploaded gallery image:",
            cleanupError
          );
        }
      }

      setErrorMessage(
        error.message ||
          "Unable to save gallery photo."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(photo) {
    setEditingPhoto(photo);

    setForm({
      title:
        photo.title ?? "",

      category_id:
        photo.category_id ?? "",

      location:
        photo.location ?? "",

      taken_date:
        photo.taken_date ?? "",

      caption:
        photo.caption ?? "",

      display_order:
        String(
          photo.display_order ??
            0
        ),

      featured:
        photo.featured ??
        false,

      is_published:
        photo.is_published ??
        true,
    });

    clearFileSelection();

    setPreviewUrl(
      photo.image_url || ""
    );

    setMessage("");
    setErrorMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(
    photo
  ) {
    const confirmed =
      window.confirm(
        `Delete "${photo.title}" from your gallery?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      photo.id
    );

    setMessage("");
    setErrorMessage("");

    try {
      await deleteGalleryPhotoRecord(
        photo.id
      );

      if (
        photo.image_path
      ) {
        try {
          await deleteGalleryImage(
            photo.image_path
          );
        } catch (
          storageError
        ) {
          console.warn(
            "Gallery file deletion error:",
            storageError
          );
        }
      }

      if (
        editingPhoto?.id ===
        photo.id
      ) {
        resetForm();
      }

      setMessage(
        "Gallery photo deleted successfully."
      );

      await loadGalleryData();
    } catch (error) {
      console.error(
        "Gallery delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete gallery photo."
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
            Loading gallery...
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
          Gallery
        </h2>

        <p className="mt-3 text-gray-500">
          Upload and manage the photos displayed in
          your public Beyond the Code gallery.
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
              {editingPhoto
                ? "Edit Photo"
                : "Add Photo"}
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Add an image, details, category,
              location and publication settings.
            </p>

          </div>

          {editingPhoto && (
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

        {/* Image Upload */}

        <div className="mb-8">

          <label className="mb-2 block text-sm text-gray-300">

            Photo

            {!editingPhoto && (
              <span className="ml-1 text-purple-400">
                *
              </span>
            )}

          </label>

          <div className="overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03]">

            {previewUrl ? (
              <div className="relative">

                <img
                  src={previewUrl}
                  alt="Gallery preview"
                  className="max-h-[500px] w-full object-contain bg-black/20"
                />

                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 p-4">

                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20">

                    <Upload
                      size={17}
                    />

                    Replace Image

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/*"
                      onChange={
                        handleFileChange
                      }
                      className="hidden"
                    />

                  </label>

                  {selectedFile && (
                    <button
                      type="button"
                      onClick={
                        clearFileSelection
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                    >
                      <X size={16} />
                      Remove Selection
                    </button>
                  )}

                </div>

              </div>
            ) : (
              <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center px-6 py-10 text-center">

                <ImagePlus
                  size={44}
                  className="text-gray-600"
                />

                <p className="mt-4 font-medium text-gray-300">
                  Select an image
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  JPG, PNG, WEBP or other browser-supported
                  image formats up to 15 MB.
                </p>

                <span className="mt-5 flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">
                  <Upload size={17} />
                  Choose Image
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  className="hidden"
                />

              </label>
            )}

          </div>

        </div>

        {/* Fields */}

        <div className="grid gap-6 md:grid-cols-2">

          <InputField
            label="Photo Title"
            value={form.title}
            onChange={(value) =>
              updateField(
                "title",
                value
              )
            }
            placeholder="An Evening in Melbourne"
            required
          />

          <SelectField
            label="Category"
            value={
              form.category_id
            }
            onChange={(value) =>
              updateField(
                "category_id",
                value
              )
            }
            categories={
              categories
            }
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
            placeholder="Melbourne, Victoria, Australia"
          />

          <DateField
            label="Date Taken"
            value={
              form.taken_date
            }
            onChange={(value) =>
              updateField(
                "taken_date",
                value
              )
            }
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
            type="number"
            min="0"
            placeholder="0"
            help="Lower numbers appear first."
          />

        </div>

        <div className="mt-6">

          <label className="mb-2 block text-sm text-gray-300">
            Caption
          </label>

          <textarea
            value={
              form.caption
            }
            onChange={(event) =>
              updateField(
                "caption",
                event.target.value
              )
            }
            rows={5}
            placeholder="Write something about this moment, place or memory..."
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
          />

        </div>

        {/* Status */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <ToggleField
            title="Featured Photo"
            description="Featured photos can appear in the homepage Beyond the Code preview."
            checked={
              form.featured
            }
            onChange={(value) =>
              updateField(
                "featured",
                value
              )
            }
          />

          <ToggleField
            title="Published"
            description="Published photos are visible to public visitors."
            checked={
              form.is_published
            }
            onChange={(value) =>
              updateField(
                "is_published",
                value
              )
            }
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
            ) : editingPhoto ? (
              <>
                <Save size={18} />
                Update Photo
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Photo
              </>
            )}
          </button>

        </div>

      </form>

      {/* Existing Photos */}

      <div>

        <div className="mb-5">

          <h3 className="text-xl font-semibold">
            Existing Gallery Photos
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {photos.length}{" "}
            {photos.length === 1
              ? "photo"
              : "photos"}
          </p>

        </div>

        {photos.length === 0 ? (
          <div className="glass-card flex min-h-[280px] flex-col items-center justify-center rounded-3xl p-8 text-center">

            <Images
              size={45}
              className="text-gray-600"
            />

            <h4 className="mt-4 font-semibold">
              No gallery photos
            </h4>

            <p className="mt-2 text-sm text-gray-500">
              Upload your first gallery photo
              using the form above.
            </p>

          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

            {photos.map(
              (photo) => (
                <GalleryPhotoCard
                  key={photo.id}
                  photo={photo}
                  onEdit={() =>
                    handleEdit(
                      photo
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      photo
                    )
                  }
                  deleting={
                    deletingId ===
                    photo.id
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

function GalleryPhotoCard({
  photo,
  onEdit,
  onDelete,
  deleting,
}) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">

      <div className="relative aspect-[4/3] overflow-hidden bg-black/20">

        {photo.image_url ? (
          <img
            src={
              photo.image_url
            }
            alt={
              photo.title
            }
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">

            <Images
              size={42}
              className="text-gray-700"
            />

          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">

          {photo.featured && (
            <span className="rounded-full border border-purple-400/20 bg-purple-500/80 px-3 py-1 text-xs text-white backdrop-blur">
              Featured
            </span>
          )}

          <span
            className={`rounded-full border px-3 py-1 text-xs backdrop-blur ${
              photo.is_published
                ? "border-green-400/20 bg-green-500/80 text-white"
                : "border-white/10 bg-black/60 text-gray-300"
            }`}
          >
            {photo.is_published
              ? "Published"
              : "Draft"}
          </span>

        </div>

      </div>

      <div className="p-5">

        {photo.category?.name && (
          <p className="text-xs font-medium uppercase tracking-wider text-purple-400">
            {photo.category.name}
          </p>
        )}

        <h4 className="mt-2 text-lg font-semibold">
          {photo.title}
        </h4>

        {(photo.location ||
          photo.taken_date) && (
          <div className="mt-3 space-y-2 text-sm text-gray-500">

            {photo.location && (
              <div className="flex items-center gap-2">

                <MapPin
                  size={15}
                />

                <span>
                  {photo.location}
                </span>

              </div>
            )}

            {photo.taken_date && (
              <div className="flex items-center gap-2">

                <CalendarDays
                  size={15}
                />

                <span>
                  {formatDate(
                    photo.taken_date
                  )}
                </span>

              </div>
            )}

          </div>
        )}

        {photo.caption && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-400">
            {photo.caption}
          </p>
        )}

        <p className="mt-4 text-xs text-gray-600">
          Display order:{" "}
          {photo.display_order ??
            0}
        </p>

        <div className="mt-5 flex gap-3 border-t border-white/10 pt-4">

          <button
            type="button"
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 transition hover:bg-purple-500/20"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
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

function DateField({
  label,
  value,
  onChange,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-gray-300">
        {label}
      </label>

      <input
        type="date"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition [color-scheme:dark] focus:border-purple-500/60"
      />

    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  categories,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-gray-300">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-[#151928] px-4 py-3 text-white outline-none transition focus:border-purple-500/60"
      >
        <option value="">
          No Category
        </option>

        {categories.map(
          (category) => (
            <option
              key={
                category.id
              }
              value={
                category.id
              }
            >
              {category.name}
              {!category.is_active
                ? " (Hidden)"
                : ""}
            </option>
          )
        )}

      </select>

    </div>
  );
}

function ToggleField({
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <label className="cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-purple-500/20">

      <div className="flex items-start gap-3">

        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(
              event.target.checked
            )
          }
          className="mt-1 h-4 w-4 shrink-0 accent-purple-500"
        />

        <div>

          <p className="text-sm font-medium text-gray-300">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-600">
            {description}
          </p>

        </div>

      </div>

    </label>
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}

export default GalleryManager;