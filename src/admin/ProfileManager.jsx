import {
  Camera,
  Loader2,
  Mail,
  MapPin,
  Save,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function ProfileManager() {
  const [profileId, setProfileId] =
    useState(null);

  const [fullName, setFullName] =
    useState("");

  const [headline, setHeadline] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [githubUrl, setGithubUrl] =
    useState("");

  const [linkedinUrl, setLinkedinUrl] =
    useState("");

  const [
    profileImageUrl,
    setProfileImageUrl,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  /* ================================= */
  /* LOAD PROFILE */
  /* ================================= */

  async function loadProfile() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("profile")
          .select("*")
          .limit(1)
          .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setProfileId(data.id);

        setFullName(
          data.full_name ?? ""
        );

        setHeadline(
          data.headline ?? ""
        );

        setBio(
          data.bio ?? ""
        );

        setLocation(
          data.location ?? ""
        );

        setEmail(
          data.email ?? ""
        );

        setGithubUrl(
          data.github_url ?? ""
        );

        setLinkedinUrl(
          data.linkedin_url ?? ""
        );

        setProfileImageUrl(
          data.profile_image_url ?? ""
        );
      }
    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================= */
  /* SAVE PROFILE */
  /* ================================= */

  async function handleSave(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    const profileData = {
      full_name: fullName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      email: email.trim(),
      github_url: githubUrl.trim(),
      linkedin_url:
        linkedinUrl.trim(),
      profile_image_url:
        profileImageUrl,
      updated_at:
        new Date().toISOString(),
    };

    try {
      let result;

      if (profileId) {
        result = await supabase
          .from("profile")
          .update(profileData)
          .eq("id", profileId)
          .select()
          .single();
      } else {
        result = await supabase
          .from("profile")
          .insert(profileData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data?.id) {
        setProfileId(
          result.data.id
        );
      }

      setMessage(
        "Profile updated successfully."
      );
    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
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
      /*
       * Allow any file that the
       * browser identifies as an image.
       */

      if (
        !file.type ||
        !file.type.startsWith(
          "image/"
        )
      ) {
        throw new Error(
          "Please select a valid image file."
        );
      }

      /* Maximum 50 MB */

      const maxFileSize =
        50 * 1024 * 1024;

      if (
        file.size > maxFileSize
      ) {
        throw new Error(
          "Profile image must be smaller than 50 MB."
        );
      }

      /*
       * Get the original extension.
       * This keeps formats such as
       * gif, svg, avif, bmp, heic,
       * heif, tiff, etc.
       */

      const fileExtension =
        file.name.includes(".")
          ? file.name
              .split(".")
              .pop()
              ?.toLowerCase()
          : "";

      /*
       * Create a safe fallback when
       * an uploaded image has no
       * filename extension.
       */

      const fallbackExtension =
        getExtensionFromMimeType(
          file.type
        );

      const finalExtension =
        fileExtension ||
        fallbackExtension ||
        "img";

      /* Unique file name */

      const fileName =
        `profile-${Date.now()}.${finalExtension}`;

      const filePath =
        `profile/${fileName}`;

      /* Upload */

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
            upsert: false,
            contentType:
              file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      /* Get public URL */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("portfolio")
        .getPublicUrl(
          filePath
        );

      if (
        !publicUrlData
          ?.publicUrl
      ) {
        throw new Error(
          "Unable to generate the uploaded image URL."
        );
      }

      const newImageUrl =
        publicUrlData.publicUrl;

      setProfileImageUrl(
        newImageUrl
      );

      setMessage(
        "Photo uploaded successfully. Click Save Changes to publish it."
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to upload profile image."
      );
    } finally {
      setUploading(false);

      event.target.value =
        "";
    }
  }

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
            Loading profile...
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
          Profile
        </h2>

        <p className="mt-3 text-gray-500">
          Manage the personal
          information displayed on your
          public portfolio.
        </p>

      </div>

      {/* Success */}

      {message && (
        <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      )}

      {/* Error */}

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      {/* Main Grid */}

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">

        {/* ========================= */}
        {/* PROFILE IMAGE */}
        {/* ========================= */}

        <div className="glass-card h-fit rounded-3xl p-6">

          <h3 className="mb-6 font-semibold">
            Profile Photo
          </h3>

          <div className="flex flex-col items-center">

            {/* Preview */}

            <div className="flex h-52 w-52 items-center justify-center overflow-hidden rounded-full border-2 border-purple-500/30 bg-white/5">

              {profileImageUrl ? (
                <img
                  src={
                    profileImageUrl
                  }
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound
                  size={75}
                  className="text-gray-600"
                />
              )}

            </div>

            {/* Upload */}

            <label
              className={`mt-6 flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-5 py-3 text-sm text-purple-300 transition ${
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
                  <Camera
                    size={18}
                  />

                  Change Photo
                </>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImageUpload
                }
                className="hidden"
                disabled={
                  uploading
                }
              />

            </label>

            <p className="mt-4 text-center text-xs leading-5 text-gray-600">
              Any browser-supported image format
              <br />
              Maximum size: 50 MB
            </p>

          </div>
        </div>

        {/* ========================= */}
        {/* PROFILE FORM */}
        {/* ========================= */}

        <form
          onSubmit={handleSave}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >

          <div className="mb-7">

            <h3 className="text-xl font-semibold">
              Personal Information
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              These details appear
              on your public
              portfolio.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Full Name */}

            <InputField
              label="Full Name"
              value={fullName}
              onChange={
                setFullName
              }
              placeholder="Your full name"
              icon={
                UserRound
              }
              required
            />

            {/* Headline */}

            <InputField
              label="Professional Headline"
              value={headline}
              onChange={
                setHeadline
              }
              placeholder="Software Engineer & AI/ML Enthusiast"
            />

            {/* Location */}

            <InputField
              label="Location"
              value={location}
              onChange={
                setLocation
              }
              placeholder="Melbourne, Australia"
              icon={MapPin}
            />

            {/* Email */}

            <InputField
              label="Public Email"
              type="email"
              value={email}
              onChange={
                setEmail
              }
              placeholder="your@email.com"
              icon={Mail}
            />

            {/* GitHub */}

            <InputField
              label="GitHub URL"
              type="url"
              value={githubUrl}
              onChange={
                setGithubUrl
              }
              placeholder="https://github.com/username"
              customIcon={
                <GitHubIcon
                  size={18}
                />
              }
            />

            {/* LinkedIn */}

            <InputField
              label="LinkedIn URL"
              type="url"
              value={
                linkedinUrl
              }
              onChange={
                setLinkedinUrl
              }
              placeholder="https://linkedin.com/in/username"
              customIcon={
                <LinkedInIcon
                  size={18}
                />
              }
            />

          </div>

          {/* Bio */}

          <div className="mt-6">

            <label
              htmlFor="profile-bio"
              className="mb-2 block text-sm text-gray-300"
            >
              Bio
            </label>

            <textarea
              id="profile-bio"
              value={bio}
              onChange={(
                event
              ) =>
                setBio(
                  event.target
                    .value
                )
              }
              rows={6}
              maxLength={1000}
              placeholder="Write a short introduction about yourself..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
            />

            <div className="mt-2 text-right text-xs text-gray-600">
              {bio.length}/1000
            </div>

          </div>

          {/* Save Button */}

          <div className="mt-7">

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
              ) : (
                <>
                  <Save
                    size={18}
                  />

                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* ================================= */
/* MIME TYPE → EXTENSION */
/* ================================= */

function getExtensionFromMimeType(
  mimeType
) {
  const mimeMap = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/avif": "avif",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon":
      "ico",
  };

  return mimeMap[mimeType] || "";
}


/* ================================= */
/* INPUT COMPONENT */
/* ================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
  customIcon,
  required = false,
}) {
  const inputId =
    `profile-${label
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  return (
    <div>

      <label
        htmlFor={inputId}
        className="mb-2 block text-sm text-gray-300"
      >
        {label}

        {required && (
          <span className="ml-1 text-purple-400">
            *
          </span>
        )}

      </label>

      <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-purple-500/60">

        {Icon && (
          <Icon
            size={18}
            className="shrink-0 text-gray-500"
          />
        )}

        {customIcon && (
          <span className="shrink-0 text-gray-500">
            {customIcon}
          </span>
        )}

        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }
          placeholder={
            placeholder
          }
          required={
            required
          }
          className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-600"
        />

      </div>

    </div>
  );
}


/* ================================= */
/* GITHUB SVG ICON */
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


/* ================================= */
/* LINKEDIN SVG ICON */
/* ================================= */

function LinkedInIcon({
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
      <path d="M6.94 8.5H3.56V19H6.94V8.5ZM5.25 3C4.17 3 3.3 3.87 3.3 4.95C3.3 6.03 4.17 6.9 5.25 6.9C6.33 6.9 7.2 6.03 7.2 4.95C7.2 3.87 6.33 3 5.25 3ZM20.7 12.98C20.7 9.82 19.01 8.35 16.76 8.35C14.95 8.35 14.14 9.35 13.69 10.05V8.5H10.31V19H13.69V13.8C13.69 12.43 13.95 11.1 15.65 11.1C17.33 11.1 17.35 12.67 17.35 13.89V19H20.73L20.7 12.98Z" />
    </svg>
  );
}

export default ProfileManager;