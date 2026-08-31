import {
  Loader2,
  Moon,
  Save,
  Sun,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

function SettingsManager() {
  const [settingsId, setSettingsId] =
    useState(null);

  const [defaultTheme, setDefaultTheme] =
    useState("dark");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  /* ================================= */
  /* LOAD SETTINGS */
  /* ================================= */

  async function loadSettings() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("site_settings")
          .select("*")
          .limit(1)
          .maybeSingle();

      if (error) {
        throw error;
      }

      if (data) {
        setSettingsId(data.id);

        setDefaultTheme(
          data.default_theme ||
            "dark"
        );
      }
    } catch (error) {
      console.error(
        "Settings loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load site settings."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================= */
  /* SAVE SETTINGS */
  /* ================================= */

  async function handleSave() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!settingsId) {
        throw new Error(
          "Site settings record was not found."
        );
      }

      const { error } =
        await supabase
          .from("site_settings")
          .update({
            default_theme:
              defaultTheme,
          })
          .eq(
            "id",
            settingsId
          );

      if (error) {
        throw error;
      }

      setMessage(
        "Default theme updated successfully."
      );
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to save site settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ================================= */
  /* LOADING */
  /* ================================= */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">

          <Loader2
            size={34}
            className="mx-auto animate-spin text-purple-400"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading settings...
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
          Portfolio Settings
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Settings
        </h2>

        <p className="mt-3 max-w-2xl text-gray-500">
          Choose which theme new visitors
          see when they first open your
          portfolio.
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

      {/* Settings Card */}

      <div className="glass-card max-w-4xl rounded-3xl p-6 sm:p-8">

        <div className="mb-7">

          <h3 className="text-xl font-semibold">
            Default Public Theme
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            This is the theme shown to
            visitors who have never chosen
            a theme themselves.
          </p>

        </div>

        {/* Theme Options */}

        <div className="grid gap-5 md:grid-cols-2">

          {/* Dark */}

          <ThemeOption
            theme="dark"
            title="Dark Theme"
            description="Your current dark purple and pink technology-focused design."
            icon={Moon}
            selected={
              defaultTheme === "dark"
            }
            onSelect={() =>
              setDefaultTheme(
                "dark"
              )
            }
          />

          {/* Light */}

          <ThemeOption
            theme="light"
            title="Light Theme"
            description="A clean bright professional layout based on the second portfolio design."
            icon={Sun}
            selected={
              defaultTheme === "light"
            }
            onSelect={() =>
              setDefaultTheme(
                "light"
              )
            }
          />

        </div>

        {/* Current selection */}

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4">

          <p className="text-xs uppercase tracking-[0.15em] text-gray-600">
            Current Default
          </p>

          <div className="mt-2 flex items-center gap-2">

            {defaultTheme ===
            "dark" ? (
              <Moon
                size={18}
                className="text-purple-400"
              />
            ) : (
              <Sun
                size={18}
                className="text-yellow-400"
              />
            )}

            <span className="font-medium text-white">
              {defaultTheme ===
              "dark"
                ? "Dark Theme"
                : "Light Theme"}
            </span>

          </div>

        </div>

        {/* Save */}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="gradient-button mt-7 flex items-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
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

              Save Default Theme
            </>
          )}

        </button>

      </div>

      {/* Explanation */}

      <div className="glass-card mt-6 max-w-4xl rounded-3xl p-6">

        <h3 className="font-semibold">
          How theme selection works
        </h3>

        <div className="mt-4 space-y-3 text-sm leading-6 text-gray-500">

          <p>
            A new visitor will see the
            default theme selected here.
          </p>

          <p>
            If that visitor later changes
            the theme using the public
            theme button, their personal
            choice will be stored in their
            browser.
          </p>

          <p>
            Their own theme choice will
            take priority over this admin
            default on future visits.
          </p>

        </div>

      </div>

    </div>
  );
}


/* ================================= */
/* THEME OPTION */
 /* ================================= */

function ThemeOption({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative rounded-2xl border p-6 text-left transition duration-300 ${
        selected
          ? "border-purple-500/50 bg-purple-500/10"
          : "border-white/10 bg-white/5 hover:border-purple-500/30 hover:bg-purple-500/5"
      }`}
    >

      <div className="flex items-start gap-4">

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            selected
              ? "bg-purple-500/20 text-purple-300"
              : "bg-white/5 text-gray-400"
          }`}
        >
          <Icon size={22} />
        </div>

        <div>

          <div className="flex items-center gap-3">

            <h4 className="font-semibold text-white">
              {title}
            </h4>

            {selected && (
              <span className="rounded-full bg-purple-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300">
                Selected
              </span>
            )}

          </div>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {description}
          </p>

        </div>

      </div>

    </button>
  );
}

export default SettingsManager;