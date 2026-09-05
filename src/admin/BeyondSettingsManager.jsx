import {
  Loader2,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  getBeyondSettings,
  saveBeyondSettings,
} from "../services/galleryService";

const EMPTY_FORM = {
  eyebrow: "",
  title: "",
  description: "",
  gallery_title: "",
  gallery_description: "",
};

function BeyondSettingsManager() {
  const [user, setUser] = useState(null);
  const [settingsId, setSettingsId] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
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
          "You must be signed in to manage Beyond the Code settings."
        );
      }

      setUser(currentUser);

      const settings =
        await getBeyondSettings();

      if (settings) {
        setSettingsId(settings.id);

        setForm({
          eyebrow:
            settings.eyebrow ?? "",

          title:
            settings.title ?? "",

          description:
            settings.description ?? "",

          gallery_title:
            settings.gallery_title ?? "",

          gallery_description:
            settings.gallery_description ?? "",
        });
      } else {
        setSettingsId(null);
        setForm(EMPTY_FORM);
      }
    } catch (error) {
      console.error(
        "Beyond settings loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load Beyond the Code settings."
      );
    } finally {
      setLoading(false);
    }
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

      const values = {
        eyebrow:
          form.eyebrow.trim(),

        title:
          form.title.trim(),

        description:
          form.description.trim(),

        gallery_title:
          form.gallery_title.trim(),

        gallery_description:
          form.gallery_description.trim(),
      };

      const saved =
        await saveBeyondSettings({
          id: settingsId,
          userId: user.id,
          values,
        });

      setSettingsId(saved.id);

      setForm({
        eyebrow:
          saved.eyebrow ?? "",

        title:
          saved.title ?? "",

        description:
          saved.description ?? "",

        gallery_title:
          saved.gallery_title ?? "",

        gallery_description:
          saved.gallery_description ?? "",
      });

      setMessage(
        "Beyond the Code settings saved successfully."
      );
    } catch (error) {
      console.error(
        "Beyond settings save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save Beyond the Code settings."
      );
    } finally {
      setSaving(false);
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
            Loading Beyond the Code settings...
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
          Beyond the Code Settings
        </h2>

        <p className="mt-3 max-w-3xl text-gray-500">
          Manage the heading and introduction displayed
          in your public Beyond the Code section and
          gallery page.
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
        className="glass-card rounded-3xl p-6 sm:p-8"
      >

        <div className="mb-8">

          <h3 className="text-xl font-semibold">
            Homepage Section
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Configure the content shown above your
            featured gallery photos on the homepage.
          </p>

        </div>

        <div className="space-y-6">

          <InputField
            label="Section Label"
            value={form.eyebrow}
            onChange={(value) =>
              updateField(
                "eyebrow",
                value
              )
            }
            placeholder="Beyond the Code"
            help="Small text displayed above the main section title."
          />

          <InputField
            label="Homepage Section Title"
            value={form.title}
            onChange={(value) =>
              updateField(
                "title",
                value
              )
            }
            placeholder="Life Beyond the Screen"
          />

          <TextareaField
            label="Homepage Description"
            value={form.description}
            onChange={(value) =>
              updateField(
                "description",
                value
              )
            }
            placeholder="Write a short introduction about your interests, travels, experiences and life beyond technology..."
            rows={6}
          />

        </div>

        <div className="my-8 border-t border-white/10" />

        <div className="mb-8">

          <h3 className="text-xl font-semibold">
            Gallery Page
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Configure the heading and introduction
            displayed on your public gallery page.
          </p>

        </div>

        <div className="space-y-6">

          <InputField
            label="Gallery Title"
            value={
              form.gallery_title
            }
            onChange={(value) =>
              updateField(
                "gallery_title",
                value
              )
            }
            placeholder="My Visual Journal"
          />

          <TextareaField
            label="Gallery Description"
            value={
              form.gallery_description
            }
            onChange={(value) =>
              updateField(
                "gallery_description",
                value
              )
            }
            placeholder="Write a short introduction for your public gallery..."
            rows={5}
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
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>

        </div>

      </form>

    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  help = "",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-gray-300">
        {label}
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

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm text-gray-300">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
      />

    </div>
  );
}

export default BeyondSettingsManager;