import {
  Loader2,
  Sparkles,
  Star,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

function Skills() {
  const [skills, setSkills] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("All");

  useEffect(() => {
    loadSkills();
  }, []);

  /* ================================= */
  /* LOAD SKILLS */
  /* ================================= */

  async function loadSkills() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("skills")
          .select("*")
          .order("featured", {
            ascending: false,
          })
          .order("category", {
            ascending: true,
          })
          .order("name", {
            ascending: true,
          });

      if (error) {
        throw error;
      }

      setSkills(data || []);
    } catch (error) {
      console.error(
        "Unable to load skills:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load skills."
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================= */
  /* CATEGORY LIST */
  /* ================================= */

  const categories =
    useMemo(() => {
      const uniqueCategories =
        new Set(
          skills
            .map(
              (skill) =>
                skill.category
            )
            .filter(Boolean)
        );

      return [
        "All",
        ...Array.from(
          uniqueCategories
        ),
      ];
    }, [skills]);

  /* ================================= */
  /* FILTER SKILLS */
  /* ================================= */

  const filteredSkills =
    useMemo(() => {
      if (
        activeCategory ===
        "All"
      ) {
        return skills;
      }

      return skills.filter(
        (skill) =>
          skill.category ===
          activeCategory
      );
    }, [
      skills,
      activeCategory,
    ]);

  /* ================================= */
  /* GROUP SKILLS BY CATEGORY */
  /* ================================= */

  const groupedSkills =
    useMemo(() => {
      const groups = {};

      filteredSkills.forEach(
        (skill) => {
          const category =
            skill.category ||
            "Other";

          if (!groups[category]) {
            groups[category] =
              [];
          }

          groups[category].push(
            skill
          );
        }
      );

      return groups;
    }, [filteredSkills]);

  /* ================================= */
  /* LOADING */
  /* ================================= */

  if (loading) {
    return (
      <section
        id="skills"
        className="relative px-6 py-24 lg:px-8"
      >
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center">

          <div className="text-center">

            <Loader2
              size={36}
              className="mx-auto animate-spin text-purple-400"
            />

            <p className="mt-4 text-sm text-gray-500">
              Loading skills...
            </p>

          </div>

        </div>
      </section>
    );
  }

  /* ================================= */
  /* PAGE */
  /* ================================= */

  return (
    <section
      id="skills"
      className="relative overflow-hidden px-6 py-24 lg:px-8"
    >
      {/* Background glow */}

      <div className="pointer-events-none absolute right-[-120px] top-[10%] h-[380px] w-[380px] rounded-full bg-purple-600/10 blur-[130px]" />

      <div className="pointer-events-none absolute bottom-[-120px] left-[-100px] h-[350px] w-[350px] rounded-full bg-pink-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-12 max-w-3xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
            Technical Expertise
          </p>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">

            My{" "}

            <span className="gradient-text">
              Skills
            </span>

          </h2>

          <p className="mt-5 leading-7 text-gray-400">

            Technologies, frameworks and
            tools I use across software
            engineering, AI/ML and research.

          </p>

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {errorMessage && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* ================================= */}
        {/* CATEGORY FILTERS */}
        {/* ================================= */}

        {categories.length > 1 && (
          <div className="mb-12 flex flex-wrap justify-center gap-3">

            {categories.map(
              (category) => {
                const isActive =
                  activeCategory ===
                  category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                    className={`rounded-full border px-5 py-2 text-sm font-medium transition duration-300 ${
                      isActive
                        ? "border-purple-500/50 bg-purple-500/20 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-300"
                    }`}
                  >
                    {category}
                  </button>
                );
              }
            )}

          </div>
        )}

        {/* ================================= */}
        {/* NO SKILLS */}
        {/* ================================= */}

        {skills.length === 0 && (
          <div className="glass-card flex min-h-[300px] flex-col items-center justify-center rounded-3xl p-8 text-center">

            <Sparkles
              size={52}
              className="text-gray-600"
            />

            <h3 className="mt-5 text-xl font-semibold">
              No skills available
            </h3>

            <p className="mt-3 max-w-md leading-7 text-gray-500">
              Skills added from the admin
              dashboard will automatically
              appear here.
            </p>

          </div>
        )}

        {/* ================================= */}
        {/* GROUPED SKILLS */}
        {/* ================================= */}

        {skills.length > 0 &&
          Object.keys(
            groupedSkills
          ).length > 0 && (
            <div className="space-y-10">

              {Object.entries(
                groupedSkills
              ).map(
                ([
                  category,
                  categorySkills,
                ]) => (
                  <SkillCategory
                    key={category}
                    category={
                      category
                    }
                    skills={
                      categorySkills
                    }
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
/* CATEGORY BLOCK */
/* ================================= */

function SkillCategory({
  category,
  skills,
}) {
  return (
    <div>

      {/* Category heading */}

      <div className="mb-5 flex items-center gap-3">

        <div className="h-px flex-1 bg-white/10" />

        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          {category}
        </h3>

        <div className="h-px flex-1 bg-white/10" />

      </div>

      {/* Skill cards */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {skills.map(
          (skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
            />
          )
        )}

      </div>

    </div>
  );
}


/* ================================= */
/* SKILL CARD */
/* ================================= */

function SkillCard({
  skill,
}) {
  return (
    <article
      className={`glass-card group relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-purple-500/30 ${
        skill.featured
          ? "border-purple-500/25"
          : ""
      }`}
    >
      {/* Featured glow */}

      {skill.featured && (
        <div className="pointer-events-none absolute right-[-40px] top-[-40px] h-24 w-24 rounded-full bg-purple-500/20 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-4">

        <div>

          <h4 className="text-base font-semibold text-white transition group-hover:text-purple-300">
            {skill.name}
          </h4>

          <p className="mt-1 text-xs text-gray-500">
            {skill.category}
          </p>

        </div>

        {skill.featured && (
          <Star
            size={17}
            className="shrink-0 text-yellow-400"
            fill="currentColor"
          />
        )}

      </div>

      {/* Level */}

      {skill.level && (
        <div className="relative mt-4">

          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
              skill.level ===
              "Advanced"
                ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
                : skill.level ===
                  "Intermediate"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                : "border-gray-500/30 bg-gray-500/10 text-gray-300"
            }`}
          >
            {skill.level}
          </span>

        </div>
      )}

    </article>
  );
}

export default Skills;