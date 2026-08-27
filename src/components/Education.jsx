import {
  Award,
  GraduationCap,
  Loader2,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Education() {
  const [education, setEducation] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

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

      setEducation(data || []);
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

  if (loading) {
    return (
      <section
        id="education"
        className="px-6 py-24 lg:px-8"
      >
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2
            size={34}
            className="animate-spin text-purple-400"
          />
        </div>
      </section>
    );
  }

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

            {education.map((item) => (
              <EducationItem
                key={item.id}
                item={item}
              />
            ))}

          </div>
        )}

      </div>
    </section>
  );
}

function EducationItem({
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

              <h3 className="text-xl font-semibold text-white group-hover:text-purple-300">
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
                <MapPin size={16} />
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

export default Education;