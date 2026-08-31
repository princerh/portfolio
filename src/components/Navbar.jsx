import {
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useTheme,
} from "../context/ThemeContext";

const navItems = [
  {
    name: "Home",
    href: "#home",
  },
  {
    name: "Projects",
    href: "#projects",
  },
  {
    name: "Skills",
    href: "#skills",
  },
  {
    name: "Education",
    href: "#education",
  },
  {
    name: "Experience",
    href: "#experience",
  },
  {
    name: "Documents",
    href: "#documents",
  },
  {
    name: "Contact",
    href: "#contact",
  },
];

function Navbar() {
  const [open, setOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const {
    theme,
    toggleTheme,
  } = useTheme();

  useEffect(() => {
    function handleScroll() {
      setScrolled(
        window.scrollY > 20
      );
    }

    window.addEventListener(
      "scroll",
      handleScroll
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  function closeMenu() {
    setOpen(false);
  }

  function handleThemeToggle() {
    toggleTheme();
  }

  const isDark =
    theme === "dark";

  return (
    <header
      className={`portfolio-navbar fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "portfolio-navbar-scrolled"
          : "portfolio-navbar-top"
      }`}
    >

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* ================================= */}
        {/* LOGO */}
        {/* ================================= */}

        <a
          href="#home"
          onClick={closeMenu}
          className="gradient-text text-2xl font-bold"
        >
          Prince.
        </a>

        {/* ================================= */}
        {/* DESKTOP NAVIGATION */}
        {/* ================================= */}

        <div className="hidden items-center gap-7 lg:flex">

          {navItems.map(
            (item) => (
              <a
                key={
                  item.name
                }
                href={
                  item.href
                }
                className="portfolio-nav-link text-sm font-medium transition"
              >
                {item.name}
              </a>
            )
          )}

          {/* ================================= */}
          {/* DESKTOP THEME BUTTON */}
          {/* ================================= */}

          <button
            type="button"
            onClick={
              handleThemeToggle
            }
            aria-label={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            className="portfolio-theme-button flex h-10 w-10 items-center justify-center rounded-xl border transition duration-300"
          >

            {isDark ? (
              <Sun
                size={19}
              />
            ) : (
              <Moon
                size={19}
              />
            )}

          </button>

        </div>

        {/* ================================= */}
        {/* MOBILE ACTIONS */}
        {/* ================================= */}

        <div className="flex items-center gap-2 lg:hidden">

          {/* Theme Button */}

          <button
            type="button"
            onClick={
              handleThemeToggle
            }
            aria-label={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            className="portfolio-theme-button flex h-10 w-10 items-center justify-center rounded-xl border transition duration-300"
          >

            {isDark ? (
              <Sun
                size={19}
              />
            ) : (
              <Moon
                size={19}
              />
            )}

          </button>

          {/* Menu Button */}

          <button
            type="button"
            onClick={() =>
              setOpen(
                (current) =>
                  !current
              )
            }
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="portfolio-mobile-menu-button flex h-10 w-10 items-center justify-center rounded-xl border transition duration-300"
          >

            {open ? (
              <X
                size={21}
              />
            ) : (
              <Menu
                size={21}
              />
            )}

          </button>

        </div>

      </nav>

      {/* ================================= */}
      {/* MOBILE MENU */}
      {/* ================================= */}

      <div
        className={`portfolio-mobile-menu overflow-hidden backdrop-blur-xl transition-all duration-300 lg:hidden ${
          open
            ? "max-h-[650px] border-t opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >

        <div className="space-y-1 px-6 py-5">

          {navItems.map(
            (item) => (
              <a
                key={
                  item.name
                }
                href={
                  item.href
                }
                onClick={
                  closeMenu
                }
                className="portfolio-mobile-nav-link block rounded-xl px-4 py-3 text-sm font-medium transition"
              >
                {item.name}
              </a>
            )
          )}

          {/* ================================= */}
          {/* MOBILE THEME INFORMATION */}
          {/* ================================= */}

          <div className="mt-4 border-t border-current/10 pt-4">

            <div className="portfolio-theme-status flex items-center justify-between rounded-xl px-4 py-3">

              <div className="flex items-center gap-3">

                <div className="portfolio-theme-status-icon flex h-9 w-9 items-center justify-center rounded-lg">

                  {isDark ? (
                    <Moon
                      size={17}
                    />
                  ) : (
                    <Sun
                      size={17}
                    />
                  )}

                </div>

                <div>

                  <p className="text-sm font-medium">
                    {isDark
                      ? "Dark Theme"
                      : "Light Theme"}
                  </p>

                  <p className="portfolio-theme-status-description mt-0.5 text-xs">
                    Current appearance
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={
                  handleThemeToggle
                }
                className="portfolio-theme-switch rounded-lg px-3 py-2 text-xs font-medium transition"
              >
                {isDark
                  ? "Light"
                  : "Dark"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;