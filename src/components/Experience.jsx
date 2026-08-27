import {
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  MapPin,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Experience() {
  const [experience, setExperience] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

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

      setExperience(data || []);
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

  if (loading) {
    return (
      <section
        id="experience"
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
      id="experience"
      className="relative overflow-hidden px-6 py-24 lg:px-8"
    >
      <div className="pointer-events-none absolute right-[-120px] top-[20%] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">

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

        {errorMessage && (
          <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
            {errorMessage}
          </div>
        )}

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
            {experience.map((item) => (
              <ExperienceItem
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

function ExperienceItem({
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

        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-400">
          <BriefcaseBusiness
            size={26}
          />
        </div>

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
              <MapPin size={16} />
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

export default Experience;