import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

const MAX_QUESTION_LENGTH = 1000;
const MAX_JOB_DESCRIPTION_LENGTH = 6000;
const MAX_HISTORY_MESSAGES = 10;

/* ================================= */
/* VISITOR ID */
/* ================================= */

function getVisitorId() {
  const storageKey =
    "portfolio-ai-visitor-id";

  let visitorId =
    localStorage.getItem(
      storageKey
    );

  if (!visitorId) {
    visitorId =
      crypto.randomUUID();

    localStorage.setItem(
      storageKey,
      visitorId
    );
  }

  return visitorId;
}

/* ================================= */
/* SUGGESTED QUESTIONS */
/* ================================= */

const suggestedQuestions = [
  "What AI projects has Reazul worked on?",
  "What are his strongest technical skills?",
  "Tell me about his research experience.",
  "Which projects involve computer vision?",
];

const initialMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the AI assistant for this portfolio. Ask me about Reazul's projects, AI/ML skills, research, education, experience, or travel.",
};

function PortfolioAI() {
  const { theme } = useTheme();

  const isDark =
    theme === "dark";

  const [isOpen, setIsOpen] =
    useState(false);

  const [activeMode, setActiveMode] =
    useState("chat");

  const [question, setQuestion] =
    useState("");

  const [messages, setMessages] =
    useState([
      initialMessage,
    ]);

  const [loading, setLoading] =
    useState(false);

  const [
    jobDescription,
    setJobDescription,
  ] = useState("");

  const [
    recruiterResult,
    setRecruiterResult,
  ] = useState("");

  const [
    recruiterError,
    setRecruiterError,
  ] = useState("");

  const [
    recruiterLoading,
    setRecruiterLoading,
  ] = useState(false);

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  /* ================================= */
  /* RECRUITER SCORE PARSING */
  /* ================================= */

  const recruiterMeta =
    useMemo(() => {
      return parseRecruiterResult(
        recruiterResult
      );
    }, [recruiterResult]);

  /* ================================= */
  /* AUTO SCROLL */
  /* ================================= */

  useEffect(() => {
    if (
      activeMode !== "chat"
    ) {
      return;
    }

    messagesEndRef.current
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, [
    messages,
    loading,
    activeMode,
  ]);

  /* ================================= */
  /* AUTO FOCUS */
  /* ================================= */

  useEffect(() => {
    if (
      !isOpen ||
      activeMode !== "chat"
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        inputRef.current
          ?.focus();
      }, 200);

    return () =>
      clearTimeout(timer);
  }, [
    isOpen,
    activeMode,
  ]);

  /* ================================= */
  /* CHAT HISTORY */
  /* ================================= */

  function buildHistory() {
    return messages
      .filter(
        (message) =>
          message.id !==
            "welcome" &&
          !message.error &&
          (
            message.role ===
              "user" ||
            message.role ===
              "assistant"
          )
      )
      .slice(
        -MAX_HISTORY_MESSAGES
      )
      .map(
        (message) => ({
          role:
            message.role,

          content:
            message.content,
        })
      );
  }

  /* ================================= */
  /* ASK AI */
  /* ================================= */

  async function askAI(
    customQuestion
  ) {
    const cleanQuestion =
      String(
        customQuestion ??
          question
      ).trim();

    if (
      !cleanQuestion ||
      loading
    ) {
      return;
    }

    if (
      cleanQuestion.length >
      MAX_QUESTION_LENGTH
    ) {
      setMessages(
        (current) => [
          ...current,
          {
            id:
              crypto.randomUUID(),

            role:
              "assistant",

            content:
              "Please keep your question under 1,000 characters.",

            error: true,
          },
        ]
      );

      return;
    }

    const history =
      buildHistory();

    const visitorId =
      getVisitorId();

    const userMessage = {
      id:
        crypto.randomUUID(),

      role: "user",

      content:
        cleanQuestion,
    };

    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setQuestion("");
    setLoading(true);

    try {
      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          "ask-portfolio-ai",
          {
            body: {
              question:
                cleanQuestion,

              messages:
                history,

              visitorId,

              requestType:
                "chat",
            },
          }
        );

      if (error) {
        console.error(
          "Portfolio AI function error:",
          error
        );

        throw new Error(
          "The AI assistant is temporarily unavailable."
        );
      }

      if (data?.error) {
        throw new Error(
          data.error
        );
      }

      if (!data?.answer) {
        throw new Error(
          "The AI assistant did not return an answer."
        );
      }

      setMessages(
        (current) => [
          ...current,
          {
            id:
              crypto.randomUUID(),

            role:
              "assistant",

            content:
              data.answer,
          },
        ]
      );
    } catch (error) {
      console.error(
        "Ask Portfolio AI error:",
        error
      );

      setMessages(
        (current) => [
          ...current,
          {
            id:
              crypto.randomUUID(),

            role:
              "assistant",

            content:
              error?.message ||
              "Sorry, I couldn't answer that right now. Please try again.",

            error: true,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }

  /* ================================= */
  /* CHAT SUBMIT */
  /* ================================= */

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    askAI();
  }

  /* ================================= */
  /* RESET CHAT */
  /* ================================= */

  function resetChat() {
    setMessages([
      initialMessage,
    ]);

    setQuestion("");

    setTimeout(() => {
      inputRef.current
        ?.focus();
    }, 100);
  }

  /* ================================= */
  /* RECRUITER MATCH */
  /* ================================= */

  async function analyzeJob() {
    const cleanDescription =
      jobDescription.trim();

    setRecruiterError("");

    if (!cleanDescription) {
      setRecruiterError(
        "Paste a job description first."
      );

      return;
    }

    if (
      cleanDescription.length <
      40
    ) {
      setRecruiterError(
        "Please paste a more complete job description."
      );

      return;
    }

    if (
      cleanDescription.length >
      MAX_JOB_DESCRIPTION_LENGTH
    ) {
      setRecruiterError(
        "Please keep the job description under 6,000 characters."
      );

      return;
    }

    const visitorId =
      getVisitorId();

    setRecruiterLoading(true);
    setRecruiterResult("");

    const recruiterPrompt = `
Analyze Reazul Hasan Prince's suitability for the job description below using only the LIVE portfolio information available to you.

JOB DESCRIPTION

${cleanDescription}

Return a concise recruiter-style analysis using this exact structure:

## Overall Fit

Score: 0-100

Classification: Strong, Moderate, or Limited

Then give a short 1-2 sentence explanation of the score.

## Strong Matches

List the job requirements that are clearly demonstrated by Reazul's live skills, projects, education, research, or professional experience.

For each important match, briefly explain the evidence.

## Relevant Projects & Experience

Identify the most relevant projects, research work, or professional experience and explain why each is useful for this role.

## Partial Matches

List requirements where Reazul has related exposure, transferable experience, or adjacent skills, but where the portfolio does not strongly demonstrate the exact requirement.

## Not Demonstrated

List important job requirements that are not currently demonstrated in the portfolio.

Use wording such as:
"Not currently demonstrated in the portfolio."

Do not claim that Reazul definitely lacks the skill.

## Recruiter Summary

Write a concise 2-4 sentence recruiter-style summary explaining Reazul's suitability for the role.

IMPORTANT RULES

- Use only live portfolio data.
- Do not invent skills, employers, experience, qualifications, certifications, tools, projects, or achievements.
- Do not assume expertise simply because a related technology appears elsewhere.
- Distinguish between strong evidence and partial evidence.
- Keep the analysis professional and concise.
- Make sure every section is complete.
- The Overall Fit score must be a whole number between 0 and 100.
- Use exactly one classification: Strong, Moderate, or Limited.
`;

    try {
      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          "ask-portfolio-ai",
          {
            body: {
              question:
                recruiterPrompt,

              messages: [],

              visitorId,

              requestType:
                "recruiter",
            },
          }
        );

      if (error) {
        console.error(
          "Recruiter AI function error:",
          error
        );

        throw new Error(
          "The recruiter analysis is temporarily unavailable."
        );
      }

      if (data?.error) {
        throw new Error(
          data.error
        );
      }

      if (!data?.answer) {
        throw new Error(
          "No recruiter analysis was returned."
        );
      }

      setRecruiterResult(
        data.answer
      );
    } catch (error) {
      console.error(
        "Recruiter Match error:",
        error
      );

      setRecruiterError(
        error?.message ||
          "Unable to analyze the job description right now."
      );
    } finally {
      setRecruiterLoading(false);
    }
  }

  /* ================================= */
  /* RESET RECRUITER */
  /* ================================= */

  function resetRecruiter() {
    setJobDescription("");
    setRecruiterResult("");
    setRecruiterError("");
  }

  return (
    <>
      {isOpen && (
        <div
          className={`
            fixed
            bottom-24
            right-4
            z-[100]
            flex
            h-[min(720px,calc(100vh-130px))]
            w-[calc(100vw-32px)]
            max-w-[470px]
            flex-col
            overflow-hidden
            rounded-3xl
            border
            shadow-2xl
            backdrop-blur-xl
            sm:right-6
            ${
              isDark
                ? "border-white/10 bg-[#090d1d]/95 text-white shadow-black/40"
                : "border-slate-200 bg-white/95 text-slate-900 shadow-slate-300/50"
            }
          `}
        >
          {/* ================================= */}
          {/* HEADER */}
          {/* ================================= */}

          <div
            className={`
              border-b
              ${
                isDark
                  ? "border-white/10"
                  : "border-slate-100"
              }
            `}
          >
            <div className="flex items-center justify-between gap-4 px-5 pb-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                  <Sparkles
                    size={20}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">
                      Ask My Portfolio
                    </h3>

                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                      AI
                    </span>
                  </div>

                  <p
                    className={`
                      mt-0.5
                      text-xs
                      ${
                        isDark
                          ? "text-gray-400"
                          : "text-slate-500"
                      }
                    `}
                  >
                    Live portfolio assistant
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label="Close AI assistant"
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  transition
                  ${
                    isDark
                      ? "text-gray-400 hover:bg-white/10 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }
                `}
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex gap-2 px-5 pb-3">
              <ModeButton
                active={
                  activeMode ===
                  "chat"
                }
                isDark={isDark}
                icon={
                  MessageCircle
                }
                label="Ask AI"
                onClick={() =>
                  setActiveMode(
                    "chat"
                  )
                }
              />

              <ModeButton
                active={
                  activeMode ===
                  "recruiter"
                }
                isDark={isDark}
                icon={
                  BriefcaseBusiness
                }
                label="Recruiter Match"
                onClick={() =>
                  setActiveMode(
                    "recruiter"
                  )
                }
              />
            </div>
          </div>

          {/* ================================= */}
          {/* CHAT MODE */}
          {/* ================================= */}

          {activeMode ===
            "chat" && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
                <div className="space-y-5">
                  {messages.map(
                    (message) => (
                      <ChatMessage
                        key={
                          message.id
                        }
                        message={
                          message
                        }
                        isDark={
                          isDark
                        }
                      />
                    )
                  )}

                  {messages.length ===
                    1 &&
                    !loading && (
                      <div className="pt-1">
                        <p
                          className={`
                            mb-3
                            text-xs
                            font-medium
                            ${
                              isDark
                                ? "text-gray-500"
                                : "text-slate-400"
                            }
                          `}
                        >
                          Try asking:
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {suggestedQuestions.map(
                            (
                              suggestion
                            ) => (
                              <button
                                key={
                                  suggestion
                                }
                                type="button"
                                onClick={() =>
                                  askAI(
                                    suggestion
                                  )
                                }
                                className={`
                                  rounded-xl
                                  border
                                  px-3
                                  py-2
                                  text-left
                                  text-xs
                                  leading-5
                                  transition
                                  ${
                                    isDark
                                      ? "border-white/10 bg-white/5 text-gray-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
                                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                                  }
                                `}
                              >
                                {
                                  suggestion
                                }
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {loading && (
                    <div className="flex items-start gap-3">
                      <AssistantAvatar />

                      <div
                        className={`
                          flex
                          items-center
                          gap-2
                          rounded-2xl
                          rounded-tl-md
                          px-4
                          py-3
                          text-sm
                          ${
                            isDark
                              ? "bg-white/[0.06] text-gray-400"
                              : "bg-slate-100 text-slate-500"
                          }
                        `}
                      >
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />

                        Thinking...
                      </div>
                    </div>
                  )}

                  <div
                    ref={
                      messagesEndRef
                    }
                  />
                </div>
              </div>

              <div
                className={`
                  border-t
                  p-4
                  ${
                    isDark
                      ? "border-white/10 bg-[#090d1d]"
                      : "border-slate-100 bg-white"
                  }
                `}
              >
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className={`
                    flex
                    items-end
                    gap-2
                    rounded-2xl
                    border
                    p-2
                    transition
                    focus-within:ring-4
                    ${
                      isDark
                        ? "border-white/10 bg-white/5 focus-within:border-violet-500/50 focus-within:ring-violet-500/10"
                        : "border-slate-200 bg-slate-50 focus-within:border-violet-400 focus-within:bg-white focus-within:ring-violet-500/10"
                    }
                  `}
                >
                  <textarea
                    ref={
                      inputRef
                    }
                    value={
                      question
                    }
                    onChange={(
                      event
                    ) =>
                      setQuestion(
                        event.target.value
                      )
                    }
                    onKeyDown={(
                      event
                    ) => {
                      if (
                        event.key ===
                          "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();
                        askAI();
                      }
                    }}
                    placeholder="Ask about projects, skills, research..."
                    rows={1}
                    maxLength={
                      MAX_QUESTION_LENGTH
                    }
                    disabled={
                      loading
                    }
                    className={`
                      max-h-28
                      min-h-[42px]
                      flex-1
                      resize-none
                      bg-transparent
                      px-2
                      py-2.5
                      text-sm
                      outline-none
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      ${
                        isDark
                          ? "text-white placeholder:text-gray-600"
                          : "text-slate-900 placeholder:text-slate-400"
                      }
                    `}
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !question.trim()
                    }
                    aria-label="Send question"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md transition hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Send
                        size={17}
                      />
                    )}
                  </button>
                </form>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <p
                    className={`
                      text-[10px]
                      ${
                        isDark
                          ? "text-gray-600"
                          : "text-slate-400"
                      }
                    `}
                  >
                    AI responses use live
                    portfolio information.
                  </p>

                  {messages.length >
                    1 && (
                    <button
                      type="button"
                      onClick={
                        resetChat
                      }
                      className={`
                        shrink-0
                        text-[10px]
                        font-medium
                        transition
                        ${
                          isDark
                            ? "text-gray-500 hover:text-violet-400"
                            : "text-slate-400 hover:text-violet-700"
                        }
                      `}
                    >
                      New chat
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ================================= */}
          {/* RECRUITER MODE */}
          {/* ================================= */}

          {activeMode ===
            "recruiter" && (
            <div className="flex-1 overflow-y-auto p-5">

              {!recruiterResult && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/20">
                    <BriefcaseBusiness
                      size={22}
                    />
                  </div>

                  <h4 className="mt-4 text-lg font-bold">
                    AI Recruiter Match
                  </h4>

                  <p
                    className={`
                      mt-2
                      text-sm
                      leading-6
                      ${
                        isDark
                          ? "text-gray-400"
                          : "text-slate-500"
                      }
                    `}
                  >
                    Paste a job description.
                    The AI will compare the
                    requirements against
                    Reazul&apos;s live projects,
                    skills, education, research,
                    and experience.
                  </p>

                  <textarea
                    value={
                      jobDescription
                    }
                    onChange={(
                      event
                    ) =>
                      setJobDescription(
                        event.target.value
                      )
                    }
                    maxLength={
                      MAX_JOB_DESCRIPTION_LENGTH
                    }
                    rows={12}
                    placeholder="Paste the full job description here..."
                    className={`
                      mt-5
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      px-4
                      py-3
                      text-sm
                      leading-6
                      outline-none
                      transition
                      focus:ring-4
                      ${
                        isDark
                          ? "border-white/10 bg-white/5 text-white placeholder:text-gray-600 focus:border-violet-500/50 focus:ring-violet-500/10"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-violet-500/10"
                      }
                    `}
                  />

                  <div className="mt-2 flex items-start justify-between gap-4">
                    <p
                      className={`
                        text-xs
                        leading-5
                        ${
                          isDark
                            ? "text-gray-600"
                            : "text-slate-400"
                        }
                      `}
                    >
                      Include skills,
                      responsibilities and
                      requirements for a better
                      comparison.
                    </p>

                    <p
                      className={`
                        shrink-0
                        text-xs
                        ${
                          isDark
                            ? "text-gray-600"
                            : "text-slate-400"
                        }
                      `}
                    >
                      {
                        jobDescription.length
                      }
                      /6000
                    </p>
                  </div>

                  {recruiterError && (
                    <div
                      className={`
                        mt-4
                        rounded-xl
                        border
                        px-4
                        py-3
                        text-sm
                        ${
                          isDark
                            ? "border-red-500/20 bg-red-500/10 text-red-300"
                            : "border-red-200 bg-red-50 text-red-700"
                        }
                      `}
                    >
                      {
                        recruiterError
                      }
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={
                      analyzeJob
                    }
                    disabled={
                      recruiterLoading ||
                      !jobDescription.trim()
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                  >
                    {recruiterLoading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles
                          size={18}
                        />

                        Analyze Match
                      </>
                    )}
                  </button>
                </>
              )}

              {recruiterResult && (
                <div>

                  {/* ============================= */}
                  {/* RESULT HEADER */}
                  {/* ============================= */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2
                          size={21}
                        />
                      </div>

                      <div>
                        <h4 className="font-bold">
                          Recruiter Match
                        </h4>

                        <p
                          className={`
                            mt-0.5
                            text-xs
                            ${
                              isDark
                                ? "text-gray-500"
                                : "text-slate-400"
                            }
                          `}
                        >
                          Based on live portfolio data
                        </p>
                      </div>
                    </div>

                    <FitBadge
                      classification={
                        recruiterMeta.classification
                      }
                      isDark={
                        isDark
                      }
                    />
                  </div>

                  {/* ============================= */}
                  {/* SCORE CARD */}
                  {/* ============================= */}

                  <RecruiterScoreCard
                    score={
                      recruiterMeta.score
                    }
                    classification={
                      recruiterMeta.classification
                    }
                    isDark={
                      isDark
                    }
                  />

                  {/* ============================= */}
                  {/* FULL ANALYSIS */}
                  {/* ============================= */}

                  <div
                    className={`
                      mt-5
                      rounded-2xl
                      border
                      p-4
                      text-sm
                      leading-6
                      ${
                        isDark
                          ? "border-white/10 bg-white/[0.05] text-gray-300"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }
                    `}
                  >
                    <MarkdownMessage
                      content={
                        recruiterResult
                      }
                      isDark={
                        isDark
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={
                      resetRecruiter
                    }
                    className={`
                      mt-4
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      transition
                      ${
                        isDark
                          ? "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }
                    `}
                  >
                    <RotateCcw
                      size={16}
                    />

                    Analyze Another Job
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ================================= */}
      {/* FLOATING BUTTON */}
      {/* ================================= */}

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) =>
              !current
          )
        }
        aria-label={
          isOpen
            ? "Close AI assistant"
            : "Open AI assistant"
        }
        className="group fixed bottom-5 right-4 z-[101] flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 px-4 py-3 font-semibold text-white shadow-xl shadow-violet-500/25 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/30 sm:bottom-6 sm:right-6"
      >
        {isOpen ? (
          <X size={20} />
        ) : (
          <MessageCircle
            size={20}
            className="transition group-hover:rotate-6"
          />
        )}

        <span className="text-sm">
          {isOpen
            ? "Close"
            : "Ask AI"}
        </span>

        {!isOpen && (
          <Sparkles
            size={14}
            className="opacity-80"
          />
        )}
      </button>
    </>
  );
}

/* ================================= */
/* RECRUITER SCORE PARSER */
/* ================================= */

function parseRecruiterResult(
  result
) {
  if (!result) {
    return {
      score: null,
      classification: null,
    };
  }

  const scorePatterns = [
    /Score\s*:\s*\**\s*(\d{1,3})\s*(?:\/\s*100|%?)/i,
    /Fit Score\s*:\s*\**\s*(\d{1,3})/i,
    /(\d{1,3})\s*\/\s*100/i,
    /(\d{1,3})\s*%\s*(?:fit|match)?/i,
    /estimated fit score[^0-9]*(\d{1,3})/i,
  ];

  let score = null;

  for (
    const pattern of
    scorePatterns
  ) {
    const match =
      result.match(
        pattern
      );

    if (match) {
      const parsed =
        Number(
          match[1]
        );

      if (
        Number.isFinite(
          parsed
        )
      ) {
        score =
          Math.min(
            100,
            Math.max(
              0,
              parsed
            )
          );

        break;
      }
    }
  }

  const classificationMatch =
    result.match(
      /Classification\s*:\s*\**\s*(Strong|Moderate|Limited)/i
    );

  let classification =
    classificationMatch?.[1]
      ? normaliseClassification(
          classificationMatch[1]
        )
      : null;

  if (!classification) {
    const generalMatch =
      result.match(
        /\b(Strong|Moderate|Limited)\b/i
      );

    if (
      generalMatch?.[1]
    ) {
      classification =
        normaliseClassification(
          generalMatch[1]
        );
    }
  }

  if (
    !classification &&
    score !== null
  ) {
    if (score >= 75) {
      classification =
        "Strong";
    } else if (
      score >= 50
    ) {
      classification =
        "Moderate";
    } else {
      classification =
        "Limited";
    }
  }

  return {
    score,
    classification,
  };
}

/* ================================= */
/* NORMALISE CLASSIFICATION */
/* ================================= */

function normaliseClassification(
  value
) {
  const clean =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  if (
    clean === "strong"
  ) {
    return "Strong";
  }

  if (
    clean === "moderate"
  ) {
    return "Moderate";
  }

  if (
    clean === "limited"
  ) {
    return "Limited";
  }

  return null;
}

/* ================================= */
/* SCORE CARD */
/* ================================= */

function RecruiterScoreCard({
  score,
  classification,
  isDark,
}) {
  const safeScore =
    typeof score ===
      "number"
      ? score
      : null;

  const displayScore =
    safeScore !== null
      ? safeScore
      : "—";

  const percentage =
    safeScore !== null
      ? safeScore
      : 0;

  return (
    <div
      className={`
        mt-5
        rounded-2xl
        border
        p-5
        ${
          isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-slate-200 bg-slate-50"
        }
      `}
    >
      <div className="flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div
            className={`
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              ${
                classification ===
                "Strong"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : classification ===
                    "Moderate"
                    ? "bg-amber-500/10 text-amber-400"
                    : "bg-red-500/10 text-red-400"
              }
            `}
          >
            <Target
              size={21}
            />
          </div>

          <div>
            <p
              className={`
                text-xs
                font-medium
                uppercase
                tracking-wider
                ${
                  isDark
                    ? "text-gray-500"
                    : "text-slate-400"
                }
              `}
            >
              Overall Fit
            </p>

            <div className="mt-1 flex items-end gap-1">
              <span className="text-3xl font-bold">
                {
                  displayScore
                }
              </span>

              {safeScore !==
                null && (
                <span
                  className={`
                    mb-1
                    text-sm
                    ${
                      isDark
                        ? "text-gray-500"
                        : "text-slate-400"
                    }
                  `}
                >
                  /100
                </span>
              )}
            </div>
          </div>

        </div>

        <FitBadge
          classification={
            classification
          }
          isDark={
            isDark
          }
        />

      </div>

      <div className="mt-5">
        <div
          className={`
            h-3
            overflow-hidden
            rounded-full
            ${
              isDark
                ? "bg-white/[0.07]"
                : "bg-slate-200"
            }
          `}
        >
          <div
            className={`
              h-full
              rounded-full
              transition-all
              duration-700
              ${
                classification ===
                "Strong"
                  ? "bg-gradient-to-r from-emerald-500 to-green-400"
                  : classification ===
                    "Moderate"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-red-500 to-rose-400"
              }
            `}
            style={{
              width:
                `${percentage}%`,
            }}
          />
        </div>

        <div
          className={`
            mt-2
            flex
            justify-between
            text-[10px]
            ${
              isDark
                ? "text-gray-600"
                : "text-slate-400"
            }
          `}
        >
          <span>
            Limited
          </span>

          <span>
            Moderate
          </span>

          <span>
            Strong
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================= */
/* FIT BADGE */
/* ================================= */

function FitBadge({
  classification,
  isDark,
}) {
  if (!classification) {
    return (
      <span
        className={`
          rounded-full
          px-3
          py-1.5
          text-xs
          font-semibold
          ${
            isDark
              ? "bg-white/5 text-gray-400"
              : "bg-slate-100 text-slate-500"
          }
        `}
      >
        Analyzed
      </span>
    );
  }

  if (
    classification ===
    "Strong"
  ) {
    return (
      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
        Strong Match
      </span>
    );
  }

  if (
    classification ===
    "Moderate"
  ) {
    return (
      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
        Moderate Match
      </span>
    );
  }

  return (
    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
      Limited Match
    </span>
  );
}

/* ================================= */
/* MODE BUTTON */
/* ================================= */

function ModeButton({
  active,
  isDark,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2
        rounded-xl
        px-3
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "bg-violet-600 text-white shadow-md shadow-violet-500/15"
            : isDark
              ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
        }
      `}
    >
      <Icon size={15} />

      {label}
    </button>
  );
}

/* ================================= */
/* CHAT MESSAGE */
/* ================================= */

function ChatMessage({
  message,
  isDark,
}) {
  const isUser =
    message.role === "user";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-gradient-to-br from-violet-600 to-purple-600 px-4 py-3 text-sm leading-6 text-white shadow-md">
          {message.content}
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          <User size={15} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />

      <div
        className={`
          max-w-[86%]
          overflow-hidden
          rounded-2xl
          rounded-tl-md
          px-4
          py-3
          text-sm
          leading-6
          ${
            message.error
              ? isDark
                ? "border border-red-500/20 bg-red-500/10 text-red-300"
                : "border border-red-200 bg-red-50 text-red-700"
              : isDark
                ? "bg-white/[0.06] text-gray-300"
                : "bg-slate-100 text-slate-700"
          }
        `}
      >
        {message.error ? (
          message.content
        ) : (
          <MarkdownMessage
            content={
              message.content
            }
            isDark={
              isDark
            }
          />
        )}
      </div>
    </div>
  );
}

/* ================================= */
/* MARKDOWN */
/* ================================= */

function MarkdownMessage({
  content,
  isDark,
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
      ]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-2 mt-4 text-lg font-bold first:mt-0">
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2 className="mb-2 mt-4 text-base font-bold first:mt-0">
            {children}
          </h2>
        ),

        h3: ({ children }) => (
          <h3 className="mb-2 mt-3 text-sm font-bold first:mt-0">
            {children}
          </h3>
        ),

        p: ({ children }) => (
          <p className="mb-3 last:mb-0">
            {children}
          </p>
        ),

        strong: ({ children }) => (
          <strong
            className={
              isDark
                ? "font-semibold text-white"
                : "font-semibold text-slate-900"
            }
          >
            {children}
          </strong>
        ),

        ul: ({ children }) => (
          <ul className="mb-3 ml-5 list-disc space-y-1.5 last:mb-0">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="mb-3 ml-5 list-decimal space-y-1.5 last:mb-0">
            {children}
          </ol>
        ),

        li: ({ children }) => (
          <li className="pl-1">
            {children}
          </li>
        ),

        a: ({
          href,
          children,
        }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              isDark
                ? "font-medium text-violet-400 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-300"
                : "font-medium text-violet-700 underline decoration-violet-400/40 underline-offset-2 hover:text-violet-600"
            }
          >
            {children}
          </a>
        ),

        blockquote: ({
          children,
        }) => (
          <blockquote
            className={`
              my-3
              border-l-2
              pl-3
              italic
              ${
                isDark
                  ? "border-violet-500 text-gray-400"
                  : "border-violet-400 text-slate-600"
              }
            `}
          >
            {children}
          </blockquote>
        ),

        code: ({
          children,
        }) => (
          <code
            className={`
              rounded
              px-1.5
              py-0.5
              font-mono
              text-xs
              ${
                isDark
                  ? "bg-black/30 text-violet-300"
                  : "bg-slate-200 text-violet-800"
              }
            `}
          >
            {children}
          </code>
        ),

        hr: () => (
          <hr
            className={
              isDark
                ? "my-4 border-white/10"
                : "my-4 border-slate-200"
            }
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

/* ================================= */
/* ASSISTANT AVATAR */
/* ================================= */

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-500/10">
      <Bot size={16} />
    </div>
  );
}

export default PortfolioAI;