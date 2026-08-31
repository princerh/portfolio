import {
  Award,
  GraduationCap,
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

function Education() {
  const [education, setEducation] =
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
    loadEducation();
  }, []);

  async function loadEducation() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("education")
          .select("*")
          .order("passing_year", {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      setEducation(
        data || []
      );
    } catch (error) {
      console.error(
        "Education loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load education."
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
        id="education"
        className={`px-6 py-24 transition-colors duration-300 lg:px-8 ${
          isDark
            ? "bg-[#050816]"
            : "bg-white"
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
        id="education"
        className="relative overflow-hidden px-6 py-24 lg:px-8"
      >

        <div className="pointer-events-none absolute left-[-100px] top-[30%] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">

          {/* Header */}

          <div className="mx-auto mb-14 max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
              Academic Background
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">

              My{" "}

              <span className="gradient-text">
                Education
              </span>

            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              My academic qualifications,
              fields of study and academic
              background.
            </p>

          </div>

          {errorMessage && (
            <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {education.length === 0 ? (
            <div className="glass-card flex min-h-[260px] flex-col items-center justify-center rounded-3xl text-center">

              <GraduationCap
                size={50}
                className="text-gray-600"
              />

              <p className="mt-4 text-gray-500">
                Education information will
                appear here.
              </p>

            </div>
          ) : (
            <div className="space-y-7">

              {education.map(
                (item) => (
                  <DarkEducationItem
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
      id="education"
      className="relative overflow-hidden bg-white px-6 py-24 text-slate-900 lg:px-8"
    >

      {/* Background decoration */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-160px] top-[15%] h-[380px] w-[380px] rounded-full bg-violet-100/70 blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-100px] h-[360px] w-[360px] rounded-full bg-blue-100/60 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* ================================= */}
        {/* LIGHT HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
            Academic Background
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

            Education that shaped{" "}

            <span className="text-violet-700">
              my journey
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            My academic qualifications,
            areas of study and educational
            background.
          </p>

        </div>

        {/* Error */}

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* No Education */}

        {education.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">

              <GraduationCap
                size={30}
              />

            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              No education available
            </h3>

            <p className="mt-3 text-slate-500">
              Education information will
              appear here.
            </p>

          </div>
        ) : (
          <div className="relative">

            {/* Timeline line */}

            <div className="absolute bottom-4 left-[27px] top-4 hidden w-px bg-slate-200 sm:block" />

            <div className="space-y-7">

              {education.map(
                (item) => (
                  <LightEducationItem
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
/* DARK EDUCATION ITEM */
/* ================================= */

function DarkEducationItem({
  item,
}) {
  return (
    <article className="glass-card group rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/30 sm:p-8">

      <div className="flex flex-col gap-6 md:flex-row md:items-start">

        {/* Icon */}

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">

          <GraduationCap
            size={26}
          />

        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-4">

            <div>

              <h3 className="text-xl font-semibold text-white transition group-hover:text-purple-300">
                {item.degree}
              </h3>

              <p className="mt-2 text-lg font-medium text-purple-400">
                {item.institution}
              </p>

              {item.field && (
                <p className="mt-1 text-sm text-gray-500">
                  {item.field}
                </p>
              )}

            </div>

            {item.passing_year && (
              <div className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-300">
                {item.passing_year}
              </div>
            )}

          </div>

          {/* Meta */}

          <div className="mt-5 flex flex-wrap gap-4">

            {item.location && (
              <div className="flex items-center gap-2 text-sm text-gray-500">

                <MapPin
                  size={16}
                />

                {item.location}

              </div>
            )}

            {item.result_score && (
              <div className="flex items-center gap-2 text-sm text-gray-400">

                <Award
                  size={16}
                  className="text-purple-400"
                />

                <span>
                  {item.result_score}
                </span>

              </div>
            )}

          </div>

          {/* Description */}

          {item.description && (
            <p className="mt-5 leading-7 text-gray-400">
              {item.description}
            </p>
          )}

        </div>

      </div>

    </article>
  );
}


/* ================================= */
/* LIGHT EDUCATION ITEM */
/* ================================= */

function LightEducationItem({
  item,
}) {
  return (
    <article className="group relative sm:pl-[84px]">

      {/* Timeline Icon */}

      <div className="absolute left-0 top-7 z-10 hidden h-14 w-14 items-center justify-center rounded-2xl border border-violet-200 bg-white text-violet-700 shadow-sm transition group-hover:border-violet-300 group-hover:bg-violet-50 sm:flex">

        <GraduationCap
          size={25}
        />

      </div>

      {/* Main card */}

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.09)] sm:p-8">

        {/* Mobile Icon */}

        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700 sm:hidden">

          <GraduationCap
            size={23}
          />

        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

          {/* Main info */}

          <div className="min-w-0">

            <h3 className="text-xl font-bold tracking-tight text-slate-900 transition group-hover:text-violet-700 sm:text-2xl">
              {item.degree}
            </h3>

            <p className="mt-2 text-lg font-semibold text-violet-700">
              {item.institution}
            </p>

            {item.field && (
              <p className="mt-2 text-sm font-medium text-slate-500">
                {item.field}
              </p>
            )}

          </div>

          {/* Year */}

          {item.passing_year && (
            <div className="shrink-0">

              <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
                {item.passing_year}
              </span>

            </div>
          )}

        </div>

        {/* Meta */}

        {(item.location ||
          item.result_score) && (
          <div className="mt-6 flex flex-wrap gap-3">

            {item.location && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">

                <MapPin
                  size={15}
                  className="text-slate-400"
                />

                <span>
                  {item.location}
                </span>

              </div>
            )}

            {item.result_score && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">

                <Award
                  size={15}
                />

                <span>
                  {item.result_score}
                </span>

              </div>
            )}

          </div>
        )}

        {/* Divider */}

        {item.description && (
          <div className="mt-6 h-px bg-slate-100" />
        )}

        {/* Description */}

        {item.description && (
          <p className="mt-5 max-w-4xl leading-7 text-slate-600">
            {item.description}
          </p>
        )}

      </div>

    </article>
  );
}

export default Education;