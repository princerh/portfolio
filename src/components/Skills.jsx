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

import {
  useTheme,
} from "../context/ThemeContext";

function Skills() {
  const [skills, setSkills] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const {
    theme,
  } = useTheme();

  const isDark =
    theme === "dark";

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

      setSkills(
        data || []
      );
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
        className={`relative px-6 py-24 transition-colors duration-300 lg:px-8 ${
          isDark
            ? "bg-[#050816]"
            : "bg-[#f8fafc]"
        }`}
      >
        <div className="mx-auto flex min-h-[400px] max-w-7xl items-center justify-center">

          <div className="text-center">

            <Loader2
              size={36}
              className={`mx-auto animate-spin ${
                isDark
                  ? "text-purple-400"
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
              Loading skills...
            </p>

          </div>

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

          {/* Error */}

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
                    <DarkSkillCategory
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
  /* LIGHT THEME */
  /* DESIGN #2 */
  /* ================================= */

  return (
    <section
      id="skills"
      className="relative overflow-hidden bg-[#f8fafc] px-6 py-24 text-slate-900 lg:px-8"
    >

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute right-[-180px] top-[5%] h-[400px] w-[400px] rounded-full bg-violet-100/70 blur-[120px]" />

        <div className="absolute bottom-[-180px] left-[-100px] h-[380px] w-[380px] rounded-full bg-blue-100/60 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* ================================= */}
        {/* LIGHT HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-12 max-w-3xl text-center">

          <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
            Technical Expertise
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

            Skills that power{" "}

            <span className="text-violet-700">
              my work
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Technologies, frameworks and
            tools I use across software
            engineering, artificial
            intelligence, machine learning
            and research.
          </p>

        </div>

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {errorMessage && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* ================================= */}
        {/* LIGHT CATEGORY FILTERS */}
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
                    className={`rounded-full border px-5 py-2.5 text-sm font-medium transition duration-300 ${
                      isActive
                        ? "border-violet-700 bg-violet-700 text-white shadow-md shadow-violet-700/15"
                        : "border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
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
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">

              <Sparkles
                size={30}
              />

            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              No skills available
            </h3>

            <p className="mt-3 max-w-md leading-7 text-slate-500">
              Skills added from the admin
              dashboard will automatically
              appear here.
            </p>

          </div>
        )}

        {/* ================================= */}
        {/* LIGHT GROUPED SKILLS */}
        {/* ================================= */}

        {skills.length > 0 &&
          Object.keys(
            groupedSkills
          ).length > 0 && (
            <div className="space-y-12">

              {Object.entries(
                groupedSkills
              ).map(
                ([
                  category,
                  categorySkills,
                ]) => (
                  <LightSkillCategory
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
/* DARK CATEGORY BLOCK */
/* ================================= */

function DarkSkillCategory({
  category,
  skills,
}) {
  return (
    <div>

      <div className="mb-5 flex items-center gap-3">

        <div className="h-px flex-1 bg-white/10" />

        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
          {category}
        </h3>

        <div className="h-px flex-1 bg-white/10" />

      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {skills.map(
          (skill) => (
            <DarkSkillCard
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
/* LIGHT CATEGORY BLOCK */
/* ================================= */

function LightSkillCategory({
  category,
  skills,
}) {
  return (
    <div>

      {/* Category Heading */}

      <div className="mb-6 flex items-center gap-4">

        <div className="h-px flex-1 bg-slate-200" />

        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">

          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {category}
          </h3>

        </div>

        <div className="h-px flex-1 bg-slate-200" />

      </div>

      {/* Cards */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {skills.map(
          (skill) => (
            <LightSkillCard
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
/* DARK SKILL CARD */
/* ================================= */

function DarkSkillCard({
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


/* ================================= */
/* LIGHT SKILL CARD */
/* ================================= */

function LightSkillCard({
  skill,
}) {
  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_7px_25px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.09)] ${
        skill.featured
          ? "border-violet-200"
          : "border-slate-200"
      }`}
    >

      {/* Featured decoration */}

      {skill.featured && (
        <div className="pointer-events-none absolute right-[-45px] top-[-45px] h-28 w-28 rounded-full bg-violet-100 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-4">

        <div className="min-w-0">

          {/* Icon + Name */}

          <div className="flex items-center gap-3">

            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                skill.featured
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Sparkles
                size={18}
              />
            </div>

            <div className="min-w-0">

              <h4 className="truncate text-base font-bold text-slate-900 transition group-hover:text-violet-700">
                {skill.name}
              </h4>

              <p className="mt-0.5 truncate text-xs text-slate-400">
                {skill.category}
              </p>

            </div>

          </div>

        </div>

        {skill.featured && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500"
            title="Featured skill"
          >

            <Star
              size={15}
              fill="currentColor"
            />

          </div>
        )}

      </div>

      {/* Divider */}

      <div className="my-4 h-px bg-slate-100" />

      {/* Level */}

      {skill.level ? (
        <div className="flex items-center justify-between gap-3">

          <span className="text-xs font-medium text-slate-400">
            Proficiency
          </span>

          <LightSkillLevel
            level={
              skill.level
            }
          />

        </div>
      ) : (
        <div className="flex items-center justify-between">

          <span className="text-xs text-slate-400">
            Technical skill
          </span>

          <span className="h-2 w-2 rounded-full bg-violet-400" />

        </div>
      )}

    </article>
  );
}


/* ================================= */
/* LIGHT SKILL LEVEL */
/* ================================= */

function LightSkillLevel({
  level,
}) {
  let classes =
    "border-slate-200 bg-slate-50 text-slate-600";

  if (
    level === "Advanced"
  ) {
    classes =
      "border-violet-200 bg-violet-50 text-violet-700";
  } else if (
    level ===
    "Intermediate"
  ) {
    classes =
      "border-blue-200 bg-blue-50 text-blue-700";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {level}
    </span>
  );
}

export default Skills;