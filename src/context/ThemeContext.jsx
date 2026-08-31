import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

const ThemeContext =
  createContext(null);

function ThemeProvider({
  children,
}) {
  const [theme, setTheme] =
    useState("dark");

  const [
    defaultTheme,
    setDefaultTheme,
  ] = useState("dark");

  const [
    loadingTheme,
    setLoadingTheme,
  ] = useState(true);

  /* ================================= */
  /* LOAD ADMIN THEME ON SITE LOAD */
  /* ================================= */

  useEffect(() => {
    loadAdminTheme();
  }, []);

  async function loadAdminTheme() {
    setLoadingTheme(true);

    try {
      const { data, error } =
        await supabase
          .from("site_settings")
          .select("default_theme")
          .limit(1)
          .maybeSingle();

      if (error) {
        throw error;
      }

      const adminTheme =
        data?.default_theme ===
        "light"
          ? "light"
          : "dark";

      /*
       * Admin theme always controls
       * the initial website theme.
       */

      setDefaultTheme(
        adminTheme
      );

      setTheme(
        adminTheme
      );
    } catch (error) {
      console.error(
        "Unable to load admin theme:",
        error
      );

      /*
       * Safe fallback
       */

      setDefaultTheme(
        "dark"
      );

      setTheme(
        "dark"
      );
    } finally {
      setLoadingTheme(false);
    }
  }

  /* ================================= */
  /* CHANGE THEME */
  /* CURRENT VISIT ONLY */
  /* ================================= */

  function changeTheme(
    newTheme
  ) {
    if (
      newTheme !== "dark" &&
      newTheme !== "light"
    ) {
      return;
    }

    /*
     * Do NOT save to localStorage.
     *
     * Visitor can change the theme
     * during this visit, but when
     * they revisit/reload the site,
     * the Admin theme is loaded again.
     */

    setTheme(
      newTheme
    );
  }

  /* ================================= */
  /* TOGGLE */
  /* ================================= */

  function toggleTheme() {
    const nextTheme =
      theme === "dark"
        ? "light"
        : "dark";

    changeTheme(
      nextTheme
    );
  }

  /* ================================= */
  /* RESET TO ADMIN DEFAULT */
  /* ================================= */

  function resetTheme() {
    setTheme(
      defaultTheme
    );
  }

  /* ================================= */
  /* APPLY THEME TO HTML */
  /* ================================= */

  useEffect(() => {
    const root =
      document.documentElement;

    root.dataset.theme =
      theme;

    root.classList.remove(
      "portfolio-dark",
      "portfolio-light"
    );

    root.classList.add(
      theme === "dark"
        ? "portfolio-dark"
        : "portfolio-light"
    );
  }, [theme]);

  /* ================================= */
  /* CONTEXT VALUE */
  /* ================================= */

  const value =
    useMemo(
      () => ({
        theme,
        defaultTheme,
        loadingTheme,
        changeTheme,
        toggleTheme,
        resetTheme,
        reloadAdminTheme:
          loadAdminTheme,
      }),
      [
        theme,
        defaultTheme,
        loadingTheme,
      ]
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context =
    useContext(
      ThemeContext
    );

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider."
    );
  }

  return context;
}

export {
  ThemeProvider,
  useTheme,
};