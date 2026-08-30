import {
  ArrowRight,
  Download,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Hero() {
  const [profile, setProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

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
        setProfile(profileResult.data);
      }

      if (resumeResult.error) {
        console.error(
          "Unable to load resume:",
          resumeResult.error.message
        );
      } else {
        setResume(resumeResult.data);
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
      <section className="flex min-h-screen items-center justify-center bg-[#050816]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-purple-500" />

          <p className="mt-4 text-sm text-gray-500">
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
  /* PAGE */
  /* ================================= */

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

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-16 lg:grid-cols-2 lg:gap-20">

        {/* ================================= */}
        {/* LEFT SIDE */}
        {/* ================================= */}

        <div>
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

              <MapPin size={17} />

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

              <ArrowRight size={18} />
            </a>

            {/* Download Resume */}

            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-purple-400/30 bg-white/5 px-6 py-3 font-semibold text-gray-200 transition duration-300 hover:-translate-y-0.5 hover:border-purple-400 hover:bg-purple-500/10 hover:text-white"
              >
                <Download size={18} />

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

            {/* GitHub */}

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                title="GitHub"
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:text-purple-400"
              >
                <GitHubIcon size={21} />
              </a>
            )}

            {/* LinkedIn */}

            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                title="LinkedIn"
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:text-purple-400"
              >
                <LinkedInIcon size={21} />
              </a>
            )}

            {/* Email */}

            {email && (
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                title="Email"
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-gray-300 transition duration-300 hover:-translate-y-1 hover:border-purple-500 hover:text-purple-400"
              >
                <Mail size={21} />
              </a>
            )}

          </div>
        </div>

        {/* ================================= */}
        {/* RIGHT SIDE */}
        {/* ================================= */}

        <div className="relative flex min-h-[450px] items-center justify-center sm:min-h-[500px]">

          {/* Main glow */}

          <div className="absolute h-[340px] w-[340px] rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20 blur-[70px]" />

          {/* Outer ring */}

          <div className="absolute h-[410px] w-[410px] rounded-full border border-purple-500/20" />

          {/* Inner ring */}

          <div className="absolute h-[370px] w-[370px] rounded-full border border-fuchsia-500/20" />

          {/* Profile picture */}

          <div className="relative z-10 flex h-[290px] w-[290px] items-center justify-center overflow-hidden rounded-full border-2 border-purple-400/40 bg-[#10142b] shadow-[0_0_60px_rgba(168,85,247,0.2)] sm:h-[320px] sm:w-[320px]">

            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-gray-600">

                <UserRound size={100} />

                <p className="text-sm">
                  Upload photo from Admin
                </p>

              </div>
            )}

          </div>

          {/* Decorative dot */}

          <div className="absolute right-[10%] top-[18%] h-3 w-3 rounded-full bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.8)]" />

          {/* Decorative dot */}

          <div className="absolute bottom-[20%] left-[12%] h-2 w-2 rounded-full bg-pink-400 shadow-[0_0_20px_rgba(244,114,182,0.8)]" />

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