import {
  ArrowRight,
  Camera,
  Loader2,
  MapPin,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useTheme,
} from "../context/ThemeContext";

import {
  getBeyondSettings,
  getGalleryPhotos,
} from "../services/galleryService";

function BeyondTheCode() {
  const [
    settings,
    setSettings,
  ] = useState(null);

  const [
    photos,
    setPhotos,
  ] = useState([]);

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
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        settingsData,
        photoData,
      ] = await Promise.all([
        getBeyondSettings(),

        getGalleryPhotos({
          publishedOnly: true,
          featuredOnly: true,
          limit: 6,
        }),
      ]);

      setSettings(
        settingsData
      );

      setPhotos(
        photoData
      );
    } catch (error) {
      console.error(
        "Beyond the Code loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load Beyond the Code content."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <section
        id="beyond"
        className={`border-t py-24 transition-colors duration-300 ${
          isDark
            ? "border-white/10 bg-[#050816]"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">

          <div className="text-center">

            <Loader2
              size={32}
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
              Loading Beyond the Code...
            </p>

          </div>

        </div>
      </section>
    );
  }

  if (
    !settings &&
    photos.length === 0
  ) {
    return null;
  }

  return (
    <section
      id="beyond"
      className={`relative overflow-hidden border-t py-20 transition-colors duration-300 sm:py-24 ${
        isDark
          ? "border-white/10 bg-[#050816]"
          : "border-slate-200 bg-white"
      }`}
    >

      {/* ================================= */}
      {/* BACKGROUND EFFECTS */}
      {/* ================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div
          className={`absolute left-[-180px] top-20 h-[420px] w-[420px] rounded-full blur-[140px] ${
            isDark
              ? "bg-purple-600/10"
              : "bg-violet-300/25"
          }`}
        />

        <div
          className={`absolute right-[-180px] bottom-10 h-[420px] w-[420px] rounded-full blur-[140px] ${
            isDark
              ? "bg-pink-500/10"
              : "bg-fuchsia-200/30"
          }`}
        />

      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mb-12">

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

          {settings?.title && (
            <h2
              className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              {settings.title}
            </h2>
          )}

          {settings?.description && (
            <p
              className={`mt-4 max-w-3xl text-base leading-8 ${
                isDark
                  ? "text-gray-400"
                  : "text-slate-600"
              }`}
            >
              {settings.description}
            </p>
          )}

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

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
        {/* FEATURED PHOTOS */}
        {/* ================================= */}

        {photos.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {photos.map(
              (photo) => (
                <GalleryPreviewCard
                  key={
                    photo.id
                  }
                  photo={
                    photo
                  }
                  isDark={
                    isDark
                  }
                />
              )
            )}

          </div>
        )}

        {/* ================================= */}
        {/* GALLERY BUTTON */}
        {/* ================================= */}

        {settings?.gallery_title && (
          <div className="mt-10">

            <Link
              to="/gallery"
              className="gradient-button inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold"
            >
              <Camera
                size={18}
              />

              {
                settings.gallery_title
              }

              <ArrowRight
                size={18}
              />
            </Link>

          </div>
        )}

      </div>

    </section>
  );
}

function GalleryPreviewCard({
  photo,
  isDark,
}) {
  return (
    <Link
      to="/gallery"
      className={`group relative block overflow-hidden rounded-3xl border shadow-sm transition duration-300 ${
        isDark
          ? "border-white/10 bg-white/[0.03]"
          : "border-slate-200 bg-white shadow-slate-200/70"
      }`}
    >

      {/* ================================= */}
      {/* IMAGE */}
      {/* ================================= */}

      <div className="relative aspect-[4/3] overflow-hidden">

        <img
          src={
            photo.image_url
          }
          alt={
            photo.title
          }
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />

        {/* Dark overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

        {/* ================================= */}
        {/* PHOTO DETAILS */}
        {/* ================================= */}

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">

          {photo.category?.name && (
            <span className="inline-flex rounded-full border border-purple-300/25 bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-100 backdrop-blur-md">
              {
                photo.category.name
              }
            </span>
          )}

          <h3 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-white sm:text-xl">
            {
              photo.title
            }
          </h3>

          {photo.location && (
            <div className="mt-2 flex items-start gap-2 text-sm text-gray-200">

              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-purple-300"
              />

              <span className="line-clamp-2">
                {
                  photo.location
                }
              </span>

            </div>
          )}

        </div>

      </div>

    </Link>
  );
}

export default BeyondTheCode;