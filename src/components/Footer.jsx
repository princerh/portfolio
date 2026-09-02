import {
  ArrowUp,
  Mail,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

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
    name: "Research",
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

  const { theme } = useTheme();

  const isDark =
    theme === "dark";

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data, error } =
      await supabase
        .from("profile")
        .select(
          "full_name, email, github_url, linkedin_url, google_scholar_url, facebook_url, instagram_url, twitter_url"
        )
        .limit(1)
        .maybeSingle();

    if (!error) {
      setProfile(data);
    } else {
      console.error(
        "Unable to load footer profile:",
        error
      );
    }
  }

  const year =
    new Date().getFullYear();

  /* ================================= */
  /* DARK THEME */
  /* ================================= */

  if (isDark) {
    return (
      <footer className="relative border-t border-white/10 bg-[#040611] px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
            {/* ================================= */}
            {/* BRAND */}
            {/* ================================= */}

            <div>
              <a
                href="#home"
                className="gradient-text text-2xl font-bold"
              >
                Prince.
              </a>

              <p className="mt-4 max-w-sm text-sm leading-7 text-gray-500">
                Software engineering,
                artificial intelligence,
                machine learning and
                research focused
                portfolio.
              </p>
            </div>

            {/* ================================= */}
            {/* NAVIGATION */}
            {/* ================================= */}

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

            {/* ================================= */}
            {/* CONNECT */}
            {/* ================================= */}

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-300">
                Connect
              </h3>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {/* Email */}

                {profile?.email && (
                  <DarkSocialLink
                    href={`mailto:${profile.email}`}
                    label="Email"
                    external={false}
                  >
                    <Mail
                      size={16}
                    />
                  </DarkSocialLink>
                )}

                {/* GitHub */}

                {profile?.github_url && (
                  <DarkSocialLink
                    href={
                      profile.github_url
                    }
                    label="GitHub"
                  >
                    <GitHubIcon
                      size={16}
                    />
                  </DarkSocialLink>
                )}

                {/* LinkedIn */}

                {profile?.linkedin_url && (
                  <DarkSocialLink
                    href={
                      profile.linkedin_url
                    }
                    label="LinkedIn"
                  >
                    <LinkedInIcon
                      size={16}
                    />
                  </DarkSocialLink>
                )}

                {/* Google Scholar */}

                {profile?.google_scholar_url && (
                  <DarkSocialLink
                    href={
                      profile.google_scholar_url
                    }
                    label="Google Scholar"
                  >
                    <GoogleScholarIcon
                      size={16}
                    />
                  </DarkSocialLink>
                )}

                {/* Facebook */}

                {profile?.facebook_url && (
                  <DarkSocialLink
                    href={
                      profile.facebook_url
                    }
                    label="Facebook"
                  >
                    <FacebookIcon
                      size={16}
                    />
                  </DarkSocialLink>
                )}

                {/* Instagram */}

                {profile?.instagram_url && (
                  <DarkSocialLink
                    href={
                      profile.instagram_url
                    }
                    label="Instagram"
                  >
                    <InstagramIcon
                      size={16}
                    />
                  </DarkSocialLink>
                )}

                {/* X / Twitter */}

                {profile?.twitter_url && (
                  <DarkSocialLink
                    href={
                      profile.twitter_url
                    }
                    label="X / Twitter"
                  >
                    <XIcon
                      size={16}
                    />
                  </DarkSocialLink>
                )}
              </div>
            </div>
          </div>

          {/* ================================= */}
          {/* BOTTOM */}
          {/* ================================= */}

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

              <ArrowUp
                size={16}
              />
            </a>
          </div>
        </div>
      </footer>
    );
  }

  /* ================================= */
  /* LIGHT THEME */
  /* ================================= */

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-white px-6 py-14 text-slate-900 lg:px-8">
      {/* ================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ================================= */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -bottom-36 -left-28 h-[320px] w-[320px] rounded-full bg-violet-100/60 blur-[110px]" />

        <div className="absolute -right-28 top-0 h-[280px] w-[280px] rounded-full bg-blue-100/60 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* ================================= */}
        {/* MAIN FOOTER */}
        {/* ================================= */}

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.15fr]">
          {/* ================================= */}
          {/* BRAND */}
          {/* ================================= */}

          <div>
            <a
              href="#home"
              className="inline-flex items-center text-2xl font-bold tracking-tight text-slate-950"
            >
              Prince

              <span className="text-violet-700">
                .
              </span>
            </a>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
              A portfolio focused on
              software engineering,
              artificial intelligence,
              machine learning and
              research.
            </p>

            <div className="mt-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-xs font-medium text-slate-500">
                Open to relevant opportunities
                and collaborations
              </p>
            </div>
          </div>

          {/* ================================= */}
          {/* NAVIGATION */}
          {/* ================================= */}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Navigation
            </h3>

            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {navigation.map(
                (item) => (
                  <a
                    key={
                      item.name
                    }
                    href={
                      item.href
                    }
                    className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition duration-300 hover:text-violet-700"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-300 transition group-hover:bg-violet-600" />

                    {item.name}
                  </a>
                )
              )}
            </div>
          </div>

          {/* ================================= */}
          {/* CONNECT */}
          {/* ================================= */}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Connect
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {/* Email */}

              {profile?.email && (
                <LightSocialLink
                  href={`mailto:${profile.email}`}
                  label="Email"
                  external={false}
                >
                  <Mail
                    size={16}
                  />
                </LightSocialLink>
              )}

              {/* GitHub */}

              {profile?.github_url && (
                <LightSocialLink
                  href={
                    profile.github_url
                  }
                  label="GitHub"
                >
                  <GitHubIcon
                    size={16}
                  />
                </LightSocialLink>
              )}

              {/* LinkedIn */}

              {profile?.linkedin_url && (
                <LightSocialLink
                  href={
                    profile.linkedin_url
                  }
                  label="LinkedIn"
                >
                  <LinkedInIcon
                    size={16}
                  />
                </LightSocialLink>
              )}

              {/* Google Scholar */}

              {profile?.google_scholar_url && (
                <LightSocialLink
                  href={
                    profile.google_scholar_url
                  }
                  label="Google Scholar"
                >
                  <GoogleScholarIcon
                    size={16}
                  />
                </LightSocialLink>
              )}

              {/* Facebook */}

              {profile?.facebook_url && (
                <LightSocialLink
                  href={
                    profile.facebook_url
                  }
                  label="Facebook"
                >
                  <FacebookIcon
                    size={16}
                  />
                </LightSocialLink>
              )}

              {/* Instagram */}

              {profile?.instagram_url && (
                <LightSocialLink
                  href={
                    profile.instagram_url
                  }
                  label="Instagram"
                >
                  <InstagramIcon
                    size={16}
                  />
                </LightSocialLink>
              )}

              {/* X / Twitter */}

              {profile?.twitter_url && (
                <LightSocialLink
                  href={
                    profile.twitter_url
                  }
                  label="X / Twitter"
                >
                  <XIcon
                    size={16}
                  />
                </LightSocialLink>
              )}
            </div>
          </div>
        </div>

        {/* ================================= */}
        {/* BOTTOM */}
        {/* ================================= */}

        <div className="mt-12 flex flex-col gap-5 border-t border-slate-200 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            © {year}{" "}
            {profile?.full_name ||
              "Reazul Hasan Prince"}
            . All rights reserved.
          </p>

          <a
            href="#home"
            aria-label="Back to top"
            className="group flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            Back to top

            <ArrowUp
              size={16}
              className="transition duration-300 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ================================= */
/* DARK SOCIAL LINK */
/* ================================= */

function DarkSocialLink({
  href,
  label,
  children,
  external = true,
}) {
  return (
    <a
      href={href}
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      aria-label={label}
      title={label}
      className="flex items-center gap-2 text-sm text-gray-500 transition hover:text-purple-400"
    >
      {children}

      <span>
        {label}
      </span>
    </a>
  );
}

/* ================================= */
/* LIGHT SOCIAL LINK */
/* ================================= */

function LightSocialLink({
  href,
  label,
  children,
  external = true,
}) {
  return (
    <a
      href={href}
      target={
        external
          ? "_blank"
          : undefined
      }
      rel={
        external
          ? "noopener noreferrer"
          : undefined
      }
      aria-label={label}
      title={label}
      className="group flex items-center gap-3 text-sm font-medium text-slate-500 transition hover:text-violet-700"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-700">
        {children}
      </div>

      <span>
        {label}
      </span>
    </a>
  );
}

/* ================================= */
/* GITHUB SVG */
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
/* LINKEDIN SVG */
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

/* ================================= */
/* GOOGLE SCHOLAR SVG */
/* ================================= */

function GoogleScholarIcon({
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
      <path d="M12 3 2 9l10 6 8-4.8V17h2V9L12 3Zm0 9.67L5.55 8.8 12 4.93l6.45 3.87L12 12.67ZM6 12.1V16c0 2.2 2.69 4 6 4s6-1.8 6-4v-3.9l-2 1.2V16c0 .84-1.58 2-4 2s-4-1.16-4-2v-2.7l-2-1.2Z" />
    </svg>
  );
}

/* ================================= */
/* FACEBOOK SVG */
/* ================================= */

function FacebookIcon({
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
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V14h2.8v8h3.4Z" />
    </svg>
  );
}

/* ================================= */
/* INSTAGRAM SVG */
/* ================================= */

function InstagramIcon({
  size = 18,
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

/* ================================= */
/* X / TWITTER SVG */
/* ================================= */

function XIcon({
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
      <path d="M18.244 2H21.552L14.325 10.26L22.827 22H16.17L10.956 15.183L4.99 22H1.68L9.411 13.165L1.254 2H8.08L12.793 8.231L18.244 2ZM17.083 19.932H18.916L7.084 3.96H5.117L17.083 19.932Z" />
    </svg>
  );
}

export default Footer;