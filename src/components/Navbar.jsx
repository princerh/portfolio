import {
  Menu,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

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

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#050816]/85 shadow-lg shadow-black/10 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}

        <a
          href="#home"
          onClick={closeMenu}
          className="gradient-text text-2xl font-bold"
        >
          Prince.
        </a>

        {/* Desktop */}

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
                className="text-sm font-medium text-gray-400 transition hover:text-purple-400"
              >
                {item.name}
              </a>
            )
          )}

        </div>

        {/* Mobile button */}

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
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-purple-500/30 hover:text-purple-400 lg:hidden"
        >

          {open ? (
            <X size={21} />
          ) : (
            <Menu size={21} />
          )}

        </button>

      </nav>

      {/* Mobile menu */}

      <div
        className={`overflow-hidden border-t border-white/10 bg-[#070a17]/95 backdrop-blur-xl transition-all duration-300 lg:hidden ${
          open
            ? "max-h-[600px] opacity-100"
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
                className="block rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-purple-500/10 hover:text-purple-300"
              >
                {item.name}
              </a>
            )
          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;