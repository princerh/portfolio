import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getBeyondSettings,
  getGalleryCategories,
  getGalleryPhotos,
} from "../services/galleryService";

function Gallery() {
  const [
    settings,
    setSettings,
  ] = useState(null);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    photos,
    setPhotos,
  ] = useState([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("all");

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const {
    theme,
  } = useTheme();

  const isDark =
    theme === "dark";

  useEffect(() => {
    loadGallery();
  }, []);

  const filteredPhotos =
    useMemo(() => {
      if (
        selectedCategory ===
        "all"
      ) {
        return photos;
      }

      return photos.filter(
        (photo) =>
          photo.category?.slug ===
          selectedCategory
      );
    }, [
      photos,
      selectedCategory,
    ]);

  const selectedPhotoIndex =
    useMemo(() => {
      if (!selectedPhoto) {
        return -1;
      }

      return filteredPhotos.findIndex(
        (photo) =>
          photo.id ===
          selectedPhoto.id
      );
    }, [
      filteredPhotos,
      selectedPhoto,
    ]);

  useEffect(() => {
    if (!selectedPhoto) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setSelectedPhoto(null);
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPreviousPhoto();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNextPhoto();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedPhoto,
    filteredPhotos,
  ]);

  async function loadGallery() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        settingsData,
        categoryData,
        photoData,
      ] = await Promise.all([
        getBeyondSettings(),

        getGalleryCategories({
          activeOnly: true,
        }),

        getGalleryPhotos({
          publishedOnly: true,
          featuredOnly: false,
        }),
      ]);

      setSettings(
        settingsData
      );

      setCategories(
        categoryData
      );

      setPhotos(
        photoData
      );
    } catch (error) {
      console.error(
        "Gallery loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load the gallery."
      );
    } finally {
      setLoading(false);
    }
  }

  function showPreviousPhoto() {
    if (
      !selectedPhoto ||
      filteredPhotos.length === 0
    ) {
      return;
    }

    const currentIndex =
      filteredPhotos.findIndex(
        (photo) =>
          photo.id ===
          selectedPhoto.id
      );

    const previousIndex =
      currentIndex <= 0
        ? filteredPhotos.length - 1
        : currentIndex - 1;

    setSelectedPhoto(
      filteredPhotos[
        previousIndex
      ]
    );
  }

  function showNextPhoto() {
    if (
      !selectedPhoto ||
      filteredPhotos.length === 0
    ) {
      return;
    }

    const currentIndex =
      filteredPhotos.findIndex(
        (photo) =>
          photo.id ===
          selectedPhoto.id
      );

    const nextIndex =
      currentIndex >=
      filteredPhotos.length - 1
        ? 0
        : currentIndex + 1;

    setSelectedPhoto(
      filteredPhotos[
        nextIndex
      ]
    );
  }

  function handleCategoryChange(
    slug
  ) {
    setSelectedCategory(
      slug
    );

    setSelectedPhoto(null);
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDark
            ? "bg-[#050816] text-white"
            : "bg-[#f8fafc] text-slate-900"
        }`}
      >
        <Navbar />

        <div className="flex min-h-screen items-center justify-center pt-20">

          <div className="text-center">

            <Loader2
              size={34}
              className={`mx-auto animate-spin ${
                isDark
                  ? "text-purple-400"
                  : "text-violet-600"
              }`}
            />

            <p
              className={`mt-4 text-sm ${
                isDark
                  ? "text-gray-500"
                  : "text-slate-500"
              }`}
            >
              Loading gallery...
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#050816] text-white"
          : "bg-[#f8fafc] text-slate-900"
      }`}
    >

      <Navbar />

      {/* ================================= */}
      {/* HERO */}
      {/* ================================= */}

      <section
        className={`relative overflow-hidden border-b pt-20 ${
          isDark
            ? "border-white/10"
            : "border-slate-200"
        }`}
      >

        <div className="pointer-events-none absolute inset-0">

          <div
            className={`absolute left-[-180px] top-10 h-[420px] w-[420px] rounded-full blur-[140px] ${
              isDark
                ? "bg-purple-600/10"
                : "bg-violet-300/30"
            }`}
          />

          <div
            className={`absolute right-[-180px] top-10 h-[420px] w-[420px] rounded-full blur-[140px] ${
              isDark
                ? "bg-pink-500/10"
                : "bg-fuchsia-200/35"
            }`}
          />

        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">

          <Link
            to="/#beyond"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition ${
              isDark
                ? "border-white/10 bg-white/5 text-gray-300 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
                : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
            }`}
          >
            <ArrowLeft
              size={17}
            />

            Back to Beyond the Code
          </Link>

          <div className="mt-12 max-w-3xl">

            {settings?.eyebrow && (
              <p
                className={`text-sm font-medium ${
                  isDark
                    ? "text-purple-400"
                    : "text-violet-600"
                }`}
              >
                {settings.eyebrow}
              </p>
            )}

            {settings?.gallery_title && (
              <h1
                className={`mt-2 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                {
                  settings.gallery_title
                }
              </h1>
            )}

            {settings?.gallery_description && (
              <p
                className={`mt-5 max-w-2xl text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-gray-400"
                    : "text-slate-600"
                }`}
              >
                {
                  settings.gallery_description
                }
              </p>
            )}

            <div
              className={`mt-7 flex flex-wrap items-center gap-4 text-sm ${
                isDark
                  ? "text-gray-500"
                  : "text-slate-500"
              }`}
            >

              <span>
                {photos.length}{" "}
                {photos.length ===
                1
                  ? "photo"
                  : "photos"}
              </span>

              {categories.length >
                0 && (
                <>
                  <span
                    className={`h-1 w-1 rounded-full ${
                      isDark
                        ? "bg-gray-600"
                        : "bg-slate-400"
                    }`}
                  />

                  <span>
                    {
                      categories.length
                    }{" "}
                    {categories.length ===
                    1
                      ? "category"
                      : "categories"}
                  </span>
                </>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* GALLERY CONTENT */}
      {/* ================================= */}

      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        {errorMessage && (
          <div
            className={`mb-8 rounded-xl border px-4 py-3 text-sm ${
              isDark
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {errorMessage}
          </div>
        )}

        {/* ================================= */}
        {/* CATEGORY FILTERS */}
        {/* ================================= */}

        {categories.length >
          0 && (
          <div className="mb-10">

            <p
              className={`mb-4 text-sm font-medium ${
                isDark
                  ? "text-gray-500"
                  : "text-slate-500"
              }`}
            >
              Browse by category
            </p>

            <div className="flex flex-wrap gap-3">

              <CategoryButton
                label="All"
                active={
                  selectedCategory ===
                  "all"
                }
                onClick={() =>
                  handleCategoryChange(
                    "all"
                  )
                }
                isDark={
                  isDark
                }
              />

              {categories.map(
                (category) => (
                  <CategoryButton
                    key={
                      category.id
                    }
                    label={
                      category.name
                    }
                    active={
                      selectedCategory ===
                      category.slug
                    }
                    onClick={() =>
                      handleCategoryChange(
                        category.slug
                      )
                    }
                    isDark={
                      isDark
                    }
                  />
                )
              )}

            </div>

          </div>
        )}

        {/* ================================= */}
        {/* EMPTY STATE */}
        {/* ================================= */}

        {filteredPhotos.length ===
        0 ? (
          <div
            className={`flex min-h-[280px] flex-col items-center justify-center rounded-3xl border p-8 text-center ${
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-slate-200 bg-white shadow-sm"
            }`}
          >

            <h2
              className={`text-xl font-semibold ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              No photos found
            </h2>

            <p
              className={`mt-2 text-sm ${
                isDark
                  ? "text-gray-500"
                  : "text-slate-500"
              }`}
            >
              There are currently no published photos in this category.
            </p>

          </div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">

            {filteredPhotos.map(
              (photo) => (
                <GalleryCard
                  key={
                    photo.id
                  }
                  photo={
                    photo
                  }
                  onOpen={() =>
                    setSelectedPhoto(
                      photo
                    )
                  }
                  isDark={
                    isDark
                  }
                />
              )
            )}

          </div>
        )}

      </main>

      <Footer />

      {/* ================================= */}
      {/* LIGHTBOX */}
      {/* ================================= */}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedPhoto(
                null
              );
            }
          }}
        >

          <div className="flex h-full flex-col">

            <div
              className={`flex shrink-0 items-center justify-between border-b px-4 py-4 backdrop-blur-xl sm:px-6 ${
                isDark
                  ? "border-white/10 bg-[#050816]/90"
                  : "border-white/10 bg-black/70"
              }`}
            >

              <div className="min-w-0">

                <p className="truncate text-sm font-medium text-white">
                  {
                    selectedPhoto.title
                  }
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {selectedPhotoIndex +
                    1}{" "}
                  of{" "}
                  {
                    filteredPhotos.length
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPhoto(
                    null
                  )
                }
                aria-label="Close gallery"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-gray-200 transition hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">

              <div className="relative flex min-h-[50vh] flex-1 items-center justify-center p-4 sm:p-6 lg:min-h-0">

                <img
                  src={
                    selectedPhoto.image_url
                  }
                  alt={
                    selectedPhoto.title
                  }
                  className="max-h-full max-w-full object-contain"
                />

                {filteredPhotos.length >
                  1 && (
                  <>
                    <button
                      type="button"
                      onClick={
                        showPreviousPhoto
                      }
                      aria-label="Previous photo"
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-gray-200 backdrop-blur-md transition hover:bg-purple-500/30 hover:text-white sm:left-6"
                    >
                      <ChevronLeft
                        size={23}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={
                        showNextPhoto
                      }
                      aria-label="Next photo"
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-black/55 text-gray-200 backdrop-blur-md transition hover:bg-purple-500/30 hover:text-white sm:right-6"
                    >
                      <ChevronRight
                        size={23}
                      />
                    </button>
                  </>
                )}

              </div>

              <aside className="max-h-[42vh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#090c1b] p-6 lg:max-h-none lg:w-[390px] lg:border-l lg:border-t-0 lg:p-8">

                {selectedPhoto.category?.name && (
                  <span className="inline-flex rounded-full border border-purple-400/20 bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-200">
                    {
                      selectedPhoto
                        .category
                        .name
                    }
                  </span>
                )}

                <h2 className="mt-5 text-2xl font-bold leading-tight text-white">
                  {
                    selectedPhoto.title
                  }
                </h2>

                {(selectedPhoto.location ||
                  selectedPhoto.taken_date) && (
                  <div className="mt-5 space-y-3 text-sm text-gray-400">

                    {selectedPhoto.location && (
                      <div className="flex items-start gap-3">

                        <MapPin
                          size={17}
                          className="mt-0.5 shrink-0 text-purple-400"
                        />

                        <span>
                          {
                            selectedPhoto.location
                          }
                        </span>

                      </div>
                    )}

                    {selectedPhoto.taken_date && (
                      <div className="flex items-start gap-3">

                        <CalendarDays
                          size={17}
                          className="mt-0.5 shrink-0 text-purple-400"
                        />

                        <span>
                          {formatDate(
                            selectedPhoto.taken_date
                          )}
                        </span>

                      </div>
                    )}

                  </div>
                )}

                {selectedPhoto.caption && (
                  <div className="mt-7 border-t border-white/10 pt-6">

                    <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
                      {
                        selectedPhoto.caption
                      }
                    </p>

                  </div>
                )}

                {filteredPhotos.length >
                  1 && (
                  <p className="mt-8 text-xs text-gray-500">
                    Use the left and right arrow keys to browse photos.
                  </p>
                )}

              </aside>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function CategoryButton({
  label,
  active,
  onClick,
  isDark,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? isDark
            ? "border-purple-500/30 bg-purple-500/15 text-purple-300"
            : "border-violet-300 bg-violet-100 text-violet-700"
          : isDark
            ? "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-300"
            : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
      }`}
    >
      {label}
    </button>
  );
}

function GalleryCard({
  photo,
  onOpen,
  isDark,
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative mb-5 block w-full break-inside-avoid overflow-hidden rounded-3xl border text-left transition duration-300 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white shadow-md shadow-slate-200/60"
      }`}
    >

      <div className="relative overflow-hidden">

        <img
          src={
            photo.image_url
          }
          alt={
            photo.title
          }
          loading="lazy"
          className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.035]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent opacity-90 transition duration-300 group-hover:opacity-100" />

        <div className="absolute inset-x-0 bottom-0 p-5">

          {photo.category?.name && (
            <span className="inline-flex rounded-full border border-purple-300/20 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-100 backdrop-blur-md">
              {
                photo.category.name
              }
            </span>
          )}

          <h2 className="mt-3 text-lg font-semibold text-white">
            {photo.title}
          </h2>

          {(photo.location ||
            photo.taken_date) && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-200">

              {photo.location && (
                <span className="flex items-center gap-1.5">

                  <MapPin
                    size={13}
                    className="text-purple-300"
                  />

                  {
                    photo.location
                  }

                </span>
              )}

              {photo.taken_date && (
                <span className="flex items-center gap-1.5">

                  <CalendarDays
                    size={13}
                    className="text-purple-300"
                  />

                  {formatDate(
                    photo.taken_date
                  )}

                </span>
              )}

            </div>
          )}

        </div>

      </div>

    </button>
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
      month: "long",
      day: "numeric",
    }
  );
}

export default Gallery;