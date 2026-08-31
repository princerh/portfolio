import {
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  MapPin,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import {
  useTheme,
} from "../context/ThemeContext";

function Experience() {
  const [experience, setExperience] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const {
    theme,
  } = useTheme();

  const isDark =
    theme === "dark";

  useEffect(() => {
    loadExperience();
  }, []);

  async function loadExperience() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("experience")
          .select("*")
          .order("company", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      setExperience(
        data || []
      );
    } catch (error) {
      console.error(
        "Experience loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load experience."
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
        id="experience"
        className={`px-6 py-24 transition-colors duration-300 lg:px-8 ${
          isDark
            ? "bg-[#050816]"
            : "bg-[#f8fafc]"
        }`}
      >
        <div className="flex min-h-[300px] items-center justify-center">

          <Loader2
            size={34}
            className={`animate-spin ${
              isDark
                ? "text-purple-400"
                : "text-violet-600"
            }`}
          />

        </div>
      </section>
    );
  }

  /* ================================= */
  /* DARK THEME */
  /* ================================= */

  if (isDark) {
    return (
      <section
        id="experience"
        className="relative overflow-hidden px-6 py-24 lg:px-8"
      >

        <div className="pointer-events-none absolute right-[-120px] top-[20%] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">

          {/* Header */}

          <div className="mx-auto mb-14 max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
              Professional Journey
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">

              My{" "}

              <span className="gradient-text">
                Experience
              </span>

            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Professional, technical and research experience.
            </p>

          </div>

          {/* Error */}

          {errorMessage && (
            <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Empty */}

          {experience.length === 0 ? (
            <div className="glass-card flex min-h-[260px] flex-col items-center justify-center rounded-3xl text-center">

              <BriefcaseBusiness
                size={50}
                className="text-gray-600"
              />

              <p className="mt-4 text-gray-500">
                Experience information will appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-7">

              {experience.map(
                (item) => (
                  <DarkExperienceItem
                    key={item.id}
                    item={item}
                  />
                )
              )}

            </div>
          )}

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
      id="experience"
      className="relative overflow-hidden bg-[#f8fafc] px-6 py-24 text-slate-900 lg:px-8"
    >

      {/* Background Decoration */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute right-[-160px] top-[10%] h-[380px] w-[380px] rounded-full bg-violet-100/70 blur-[120px]" />

        <div className="absolute bottom-[-180px] left-[-100px] h-[360px] w-[360px] rounded-full bg-blue-100/60 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* ================================= */}
        {/* LIGHT HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
            Professional Journey
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

            Experience that shaped{" "}

            <span className="text-violet-700">
              my career
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Professional, technical and research experience across
            software development, artificial intelligence and related work.
          </p>

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ================================= */}
        {/* EMPTY */}
        {/* ================================= */}

        {experience.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">

              <BriefcaseBusiness
                size={30}
              />

            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              No experience available
            </h3>

            <p className="mt-3 text-slate-500">
              Experience information will appear here.
            </p>

          </div>
        ) : (
          <div className="relative">

            {/* Timeline */}

            <div className="absolute bottom-4 left-[27px] top-4 hidden w-px bg-slate-200 sm:block" />

            <div className="space-y-7">

              {experience.map(
                (item) => (
                  <LightExperienceItem
                    key={item.id}
                    item={item}
                  />
                )
              )}

            </div>

          </div>
        )}

      </div>
    </section>
  );
}


/* ================================= */
/* DARK EXPERIENCE ITEM */
/* ================================= */

function DarkExperienceItem({
  item,
}) {
  const technologies =
    Array.isArray(
      item.technologies
    )
      ? item.technologies
      : [];

  return (
    <article className="glass-card group rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/30 sm:p-8">

      <div className="flex flex-col gap-6 md:flex-row md:items-start">

        {/* Icon */}

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">

          <BriefcaseBusiness
            size={26}
          />

        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <h3 className="text-xl font-semibold text-white transition group-hover:text-purple-300">
                {item.position}
              </h3>

              <p className="mt-2 text-lg font-medium text-purple-400">
                {item.company}
              </p>

            </div>

            {(item.start_date ||
              item.end_date) && (
              <div className="flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm text-purple-300">

                <CalendarDays
                  size={15}
                />

                {item.start_date}

                {item.start_date &&
                  item.end_date &&
                  " - "}

                {item.end_date}

              </div>
            )}

          </div>

          {item.location && (
            <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">

              <MapPin
                size={16}
              />

              {item.location}

            </div>
          )}

          {item.description && (
            <p className="mt-5 leading-7 text-gray-400">
              {item.description}
            </p>
          )}

          {technologies.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">

              {technologies.map(
                (
                  technology,
                  index
                ) => (
                  <span
                    key={`${technology}-${index}`}
                    className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300"
                  >
                    {technology}
                  </span>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </article>
  );
}


/* ================================= */
/* LIGHT EXPERIENCE ITEM */
/* ================================= */

function LightExperienceItem({
  item,
}) {
  const technologies =
    Array.isArray(
      item.technologies
    )
      ? item.technologies
      : [];

  return (
    <article className="group relative sm:pl-[84px]">

      {/* ================================= */}
      {/* TIMELINE ICON */}
      {/* ================================= */}

      <div className="absolute left-0 top-7 z-10 hidden h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-700 shadow-sm transition duration-300 group-hover:border-violet-300 group-hover:bg-violet-50 sm:flex">

        <BriefcaseBusiness
          size={25}
        />

      </div>

      {/* ================================= */}
      {/* MAIN CARD */}
      {/* ================================= */}

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:p-8">

        {/* Mobile icon */}

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:hidden">

          <BriefcaseBusiness
            size={23}
          />

        </div>

        {/* ================================= */}
        {/* TITLE + DATE */}
        {/* ================================= */}

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          <div className="min-w-0">

            <h3 className="text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-violet-700 sm:text-2xl">
              {item.position}
            </h3>

            <p className="mt-2 text-lg font-semibold text-violet-700">
              {item.company}
            </p>

          </div>

          {(item.start_date ||
            item.end_date) && (
            <div className="shrink-0">

              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">

                <CalendarDays
                  size={15}
                />

                <span>
                  {item.start_date}

                  {item.start_date &&
                    item.end_date &&
                    " - "}

                  {item.end_date}
                </span>

              </div>

            </div>
          )}

        </div>

        {/* ================================= */}
        {/* LOCATION */}
        {/* ================================= */}

        {item.location && (
          <div className="mt-6">

            <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">

              <MapPin
                size={15}
                className="text-slate-400"
              />

              <span>
                {item.location}
              </span>

            </div>

          </div>
        )}

        {/* ================================= */}
        {/* DESCRIPTION */}
        {/* ================================= */}

        {item.description && (
          <>
            <div className="mt-6 h-px bg-slate-100" />

            <p className="mt-5 max-w-4xl leading-7 text-slate-600">
              {item.description}
            </p>
          </>
        )}

        {/* ================================= */}
        {/* TECHNOLOGIES */}
        {/* ================================= */}

        {technologies.length > 0 && (
          <div className="mt-6">

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Technologies
            </p>

            <div className="flex flex-wrap gap-2">

              {technologies.map(
                (
                  technology,
                  index
                ) => (
                  <span
                    key={`${technology}-${index}`}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition duration-300 group-hover:border-violet-100 group-hover:bg-violet-50 group-hover:text-violet-700"
                  >
                    {technology}
                  </span>
                )
              )}

            </div>

          </div>
        )}

      </div>

    </article>
  );
}

export default Experience;