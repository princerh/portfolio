import {
  ArrowRight,
  Download,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  useTheme,
} from "../context/ThemeContext";

function Hero() {
  const [profile, setProfile] =
    useState(null);

  const [resume, setResume] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const {
    theme,
  } = useTheme();

  const isDark =
    theme === "dark";

  useEffect(() => {
    loadHeroData();
  }, []);

  /* ================================= */
  /* LOAD PROFILE + RESUME */
  /* ================================= */

  async function loadHeroData() {
    try {
      const [
        profileResult,
        resumeResult,
      ] = await Promise.all([
        supabase
          .from("profile")
          .select("*")
          .limit(1)
          .maybeSingle(),

        supabase
          .from("resume")
          .select("*")
          .limit(1)
          .maybeSingle(),
      ]);

      if (profileResult.error) {
        console.error(
          "Unable to load profile:",
          profileResult.error.message
        );
      } else {
        setProfile(
          profileResult.data
        );
      }

      if (resumeResult.error) {
        console.error(
          "Unable to load resume:",
          resumeResult.error.message
        );
      } else {
        setResume(
          resumeResult.data
        );
      }
    } catch (error) {
      console.error(
        "Unexpected hero loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================= */
  /* LOADING */
  /* ================================= */

  if (loading) {
    return (
      <section
        className={`flex min-h-screen items-center justify-center transition-colors duration-300 ${
          isDark
            ? "bg-[#050816]"
            : "bg-[#f8fafc]"
        }`}
      >
        <div className="text-center">

          <span
            className={`loading loading-spinner loading-lg ${
              isDark
                ? "text-purple-500"
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
            Loading portfolio...
          </p>

        </div>
      </section>
    );
  }

  /* ================================= */
  /* FALLBACK DATA */
  /* ================================= */

  const fullName =
    profile?.full_name ||
    "Reazul Hasan Prince";

  const headline =
    profile?.headline ||
    "Software Engineer & AI/ML Enthusiast";

  const bio =
    profile?.bio ||
    "I build modern software applications and intelligent AI solutions.";

  const location =
    profile?.location || "";

  const email =
    profile?.email || "";

  const githubUrl =
    profile?.github_url || "";

  const linkedinUrl =
    profile?.linkedin_url || "";

  const profileImageUrl =
    profile?.profile_image_url || "";

  const resumeUrl =
    resume?.file_url || "";

  /* ================================= */
  /* DARK THEME */
  /* ================================= */

  if (isDark) {
    return (
      <section
        id="home"
        className="relative flex min-h-screen items-center overflow-hidden px-6 pb-20 pt-28 lg:px-8"
      >

        {/* ================================= */}
        {/* BACKGROUND EFFECTS */}
        {/* ================================= */}

        <div className="pointer-events-none absolute right-[-100px] top-[80px] h-[420px] w-[420px] rounded-full bg-purple-600/20 blur-[120px]" />

        <div className="pointer-events-none absolute bottom-[-150px] left-[-100px] h-[400px] w-[400px] rounded-full bg-pink-600/10 blur-[130px]" />

        <div className="pointer-events-none absolute left-[45%] top-[20%] h-[250px] w-[250px] rounded-full bg-indigo-600/10 blur-[100px]" />

        {/* ================================= */}
        {/* MAIN CONTAINER */}
        {/* ================================= */}

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ================================= */}
          {/* INTRODUCTION */}
          {/* MOBILE: SECOND */}
          {/* DESKTOP: LEFT */}
          {/* ================================= */}

          <div className="order-2 lg:order-1">

            <p className="mb-3 text-lg text-gray-300">
              Hi, I'm
            </p>

            <h1 className="gradient-text mb-5 text-3xl font-bold leading-[1.05] sm:text-6xl lg:text-5xl">
              {fullName}
            </h1>

            <h2 className="mb-6 text-xl font-semibold leading-relaxed text-gray-200 sm:text-3xl">
              {headline}
            </h2>

            <p className="mb-7 max-w-xl text-base leading-8 text-gray-400 sm:text-lg">
              {bio}
            </p>

            {/* Location */}

            {location && (
              <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">

                <MapPin
                  size={17}
                />

                <span>
                  {location}
                </span>

              </div>
            )}

            {/* ================================= */}
            {/* MAIN BUTTONS */}
            {/* ================================= */}

            <div className="mb-9 flex flex-wrap gap-4">

              {/* View Projects */}

              <a
                href="#projects"
                className="gradient-button flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white"
              >
                View Projects

                <ArrowRight
                  size={18}
                />
              </a>

              {/* Download Resume */}

              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-white/5 px-6 py-3 font-semibold text-gray-200 transition duration-300 hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-500/10 hover:text-white"
                >
                  <Download
                    size={18}
                  />

                  Download Resume
                </a>
              )}

              {/* Contact */}

              <a
                href="#contact"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-gray-300 transition duration-300 hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-white"
              >
                Contact Me
              </a>

            </div>

            {/* ================================= */}
            {/* SOCIAL LINKS */}
            {/* ================================= */}

            <div className="flex gap-4">

              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:text-purple-400"
                >
                  <GitHubIcon
                    size={21}
                  />
                </a>
              )}

              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:text-purple-400"
                >
                  <LinkedInIcon
                    size={21}
                  />
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label="Email"
                  title="Email"
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:text-purple-400"
                >
                  <Mail
                    size={21}
                  />
                </a>
              )}

            </div>

          </div>

          {/* ================================= */}
          {/* PROFILE IMAGE */}
          {/* MOBILE: FIRST */}
          {/* DESKTOP: RIGHT */}
          {/* ================================= */}

          <div className="order-1 relative flex min-h-[360px] items-center justify-center sm:min-h-[500px] lg:order-2">

            {/* Main glow */}

            <div className="absolute h-[280px] w-[280px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20 blur-[70px] sm:h-[340px] sm:w-[340px]" />

            {/* Outer ring */}

            <div className="absolute h-[320px] w-[320px] rounded-full border border-purple-500/20 sm:h-[410px] sm:w-[410px]" />

            {/* Inner ring */}

            <div className="absolute h-[290px] w-[290px] rounded-full border border-fuchsia-500/20 sm:h-[370px] sm:w-[370px]" />

            {/* Profile picture */}

            <div className="relative z-10 flex h-[240px] w-[240px] items-center justify-center overflow-hidden rounded-full border-2 border-purple-400/40 bg-[#10142b] shadow-[0_0_60px_rgba(168,85,247,0.2)] sm:h-[320px] sm:w-[320px]">

              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-600">

                  <UserRound
                    size={90}
                  />

                  <p className="text-sm">
                    Upload photo from Admin
                  </p>

                </div>
              )}

            </div>

            {/* Decorative dots */}

            <div className="absolute right-[8%] top-[16%] h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.8)] sm:right-[10%] sm:top-[18%]" />

            <div className="absolute bottom-[18%] left-[8%] h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.8)] sm:bottom-[20%] sm:left-[12%]" />

          </div>

        </div>

      </section>
    );
  }

  /* ================================= */
  /* LIGHT THEME */
  /* DESIGN #2 */
  /* ================================= */

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-[#f8fafc] px-6 pb-20 pt-32 text-slate-900 transition-colors duration-300 lg:px-8"
    >

      {/* ================================= */}
      {/* LIGHT BACKGROUND DECORATION */}
      {/* ================================= */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute right-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-violet-200/50 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[-100px] h-[380px] w-[380px] rounded-full bg-blue-100/70 blur-[120px]" />

        <div className="absolute left-1/2 top-[35%] h-[250px] w-[250px] rounded-full bg-fuchsia-100/50 blur-[100px]" />

      </div>

      {/* ================================= */}
      {/* CONTAINER */}
      {/* ================================= */}

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-24">

        {/* ================================= */}
        {/* LEFT SIDE */}
        {/* ================================= */}

        <div className="order-2 lg:order-1">

          {/* Small intro */}

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">

            <span className="h-2 w-2 rounded-full bg-violet-600" />

            Welcome to my portfolio

          </div>

          {/* Intro */}

          <p className="mb-3 text-lg font-medium text-slate-500">
            Hello, I'm
          </p>

          {/* Name */}

          <h1 className="mb-5 text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-6xl">

            {fullName}

          </h1>

          {/* Headline */}

          <h2 className="mb-6 max-w-2xl text-2xl font-semibold leading-snug text-violet-700 sm:text-3xl">

            {headline}

          </h2>

          {/* Bio */}

          <p className="mb-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">

            {bio}

          </p>

          {/* Location */}

          {location && (
            <div className="mb-8 flex items-center gap-2 text-sm font-medium text-slate-500">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">

                <MapPin
                  size={16}
                />

              </div>

              <span>
                {location}
              </span>

            </div>
          )}

          {/* ================================= */}
          {/* BUTTONS */}
          {/* ================================= */}

          <div className="mb-9 flex flex-wrap gap-3">

            {/* Primary */}

            <a
              href="#projects"
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-lg shadow-slate-900/10 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-700"
            >
              View Projects

              <ArrowRight
                size={18}
              />
            </a>

            {/* Resume */}

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:text-violet-700"
              >
                <Download
                  size={18}
                />

                Download Resume
              </a>
            )}

            {/* Contact */}

            <a
              href="#contact"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-6 py-3.5 font-semibold text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:bg-violet-50 hover:text-violet-700"
            >
              Contact Me
            </a>

          </div>

          {/* ================================= */}
          {/* SOCIAL AREA */}
          {/* ================================= */}

          <div className="flex flex-wrap items-center gap-4">

            <span className="text-sm font-medium text-slate-400">
              Connect
            </span>

            <div className="h-px w-8 bg-slate-300" />

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:text-violet-700"
              >
                <GitHubIcon
                  size={20}
                />
              </a>
            )}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:text-violet-700"
              >
                <LinkedInIcon
                  size={20}
                />
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                title="Email"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:text-violet-700"
              >
                <Mail
                  size={20}
                />
              </a>
            )}

          </div>

        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* LIGHT DESIGN #2 PROFILE */}
        {/* ================================= */}

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">

          <div className="relative w-full max-w-[440px]">

            {/* Decorative block */}

            <div className="absolute -right-5 -top-5 hidden h-28 w-28 rounded-3xl border border-violet-200 bg-violet-100/60 sm:block" />

            {/* Small dot pattern */}

            <div className="absolute -bottom-7 -left-7 hidden grid-cols-5 gap-2 sm:grid">

              {Array.from({
                length: 25,
              }).map((_, index) => (
                <span
                  key={index}
                  className="h-1.5 w-1.5 rounded-full bg-violet-300"
                />
              ))}

            </div>

            {/* Main profile card */}

            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">

              {/* Image */}

              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-100 via-violet-50 to-slate-100">

                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-400">

                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-sm">

                      <UserRound
                        size={70}
                      />

                    </div>

                    <p className="text-sm">
                      Upload photo from Admin
                    </p>

                  </div>
                )}

                {/* Bottom gradient */}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/40 to-transparent" />

                {/* ================================= */}
                {/* AVAILABLE LABEL */}
                {/* MOBILE / TABLET ONLY */}
                {/* HIDDEN ON DESKTOP */}
                {/* ================================= */}

                <div className="absolute bottom-5 left-5 right-5 lg:hidden">

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    Available for opportunities

                  </div>

                </div>

              </div>

            </div>

            {/* Floating professional card */}

            <div className="absolute -bottom-8 -left-5 hidden min-w-[210px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:block">

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-600">
                Focus
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                AI • ML • Software
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Building intelligent solutions
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


/* ================================= */
/* GITHUB SVG ICON */
/* ================================= */

function GitHubIcon({
  size = 21,
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
  size = 21,
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

export default Hero;