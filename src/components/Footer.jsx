import {
  ArrowUp,
  Mail,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

const navigation = [
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

function Footer() {
  const [profile, setProfile] =
    useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data, error } =
      await supabase
        .from("profile")
        .select(
          "full_name, email, github_url, linkedin_url"
        )
        .limit(1)
        .maybeSingle();

    if (!error) {
      setProfile(data);
    }
  }

  const year =
    new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-[#040611] px-6 py-12 lg:px-8">

      <div className="mx-auto max-w-7xl">

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <a
              href="#home"
              className="gradient-text text-2xl font-bold"
            >
              Prince.
            </a>

            <p className="mt-4 max-w-sm text-sm leading-7 text-gray-500">
              Software engineering,
              artificial intelligence
              and research focused
              portfolio.
            </p>

          </div>

          {/* Navigation */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-300">
              Navigation
            </h3>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">

              {navigation.map(
                (item) => (
                  <a
                    key={
                      item.name
                    }
                    href={
                      item.href
                    }
                    className="text-sm text-gray-500 transition hover:text-purple-400"
                  >
                    {item.name}
                  </a>
                )
              )}

            </div>

          </div>

          {/* Connect */}

          <div>

            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-300">
              Connect
            </h3>

            <div className="mt-5 space-y-3">

              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-purple-400"
                >
                  <Mail
                    size={16}
                  />

                  Email
                </a>
              )}

              {profile?.github_url && (
                <a
                  href={
                    profile.github_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-500 transition hover:text-purple-400"
                >
                  GitHub
                </a>
              )}

              {profile?.linkedin_url && (
                <a
                  href={
                    profile.linkedin_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-gray-500 transition hover:text-purple-400"
                >
                  LinkedIn
                </a>
              )}

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-7 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">

          <p>
            © {year}{" "}
            {profile?.full_name ||
              "Reazul Hasan Prince"}
            . All rights reserved.
          </p>

          <a
            href="#home"
            aria-label="Back to top"
            className="flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-gray-400 transition hover:border-purple-500/30 hover:text-purple-400"
          >
            Back to top

            <ArrowUp size={16} />
          </a>

        </div>

      </div>

    </footer>
  );
}

export default Footer;