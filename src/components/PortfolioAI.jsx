import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

const MAX_QUESTION_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 10;

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
    "Hi! I'm the AI assistant for this portfolio. Ask me about Reazul's projects, AI/ML skills, research, education, or experience.",
};

function PortfolioAI() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isOpen, setIsOpen] =
    useState(false);

  const [question, setQuestion] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState([initialMessage]);

  const messagesEndRef =
    useRef(null);

  const inputRef =
    useRef(null);

  /* ================================= */
  /* AUTO SCROLL */
  /* ================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ================================= */
  /* AUTO FOCUS */
  /* ================================= */

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 200);

    return () =>
      clearTimeout(timer);
  }, [isOpen]);

  /* ================================= */
  /* BUILD CHAT HISTORY */
  /* ================================= */

  function buildHistory() {
    return messages
      .filter(
        (message) =>
          message.id !== "welcome" &&
          !message.error &&
          (
            message.role === "user" ||
            message.role === "assistant"
          )
      )
      .slice(-MAX_HISTORY_MESSAGES)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));
  }

  /* ================================= */
  /* ASK AI */
  /* ================================= */

  async function askAI(
    customQuestion
  ) {
    const cleanQuestion =
      String(
        customQuestion ?? question
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
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Please keep your question under 1,000 characters.",
            error: true,
          },
        ]
      );

      return;
    }

    /*
     * Get previous conversation BEFORE
     * adding the new user message.
     */
    const history =
      buildHistory();

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: cleanQuestion,
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
            id: crypto.randomUUID(),
            role: "assistant",
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
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              error.message ||
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
  /* SUBMIT */
  /* ================================= */

  function handleSubmit(
    event
  ) {
    event.preventDefault();
    askAI();
  }

  /* ================================= */
  /* RESET */
  /* ================================= */

  function resetChat() {
    setMessages([
      initialMessage,
    ]);

    setQuestion("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  return (
    <>
      {/* ================================= */}
      {/* CHAT WINDOW */}
      {/* ================================= */}

      {isOpen && (
        <div
          className={`
            fixed
            bottom-24
            right-4
            z-[100]
            flex
            h-[min(620px,calc(100vh-130px))]
            w-[calc(100vw-32px)]
            max-w-[410px]
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

          {/* HEADER */}

          <div
            className={`
              flex
              items-center
              justify-between
              gap-4
              border-b
              px-5
              py-4
              ${
                isDark
                  ? "border-white/10"
                  : "border-slate-100"
              }
            `}
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-gradient-to-br
                  from-violet-600
                  to-fuchsia-500
                  text-white
                  shadow-lg
                  shadow-violet-500/20
                "
              >
                <Sparkles size={20} />
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="font-bold">
                    Ask My Portfolio
                  </h3>

                  <span
                    className="
                      rounded-full
                      bg-emerald-500/10
                      px-2
                      py-0.5
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-emerald-500
                    "
                  >
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
                  Portfolio assistant
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

          {/* ================================= */}
          {/* MESSAGES */}
          {/* ================================= */}

          <div
            className="
              flex-1
              overflow-y-auto
              px-4
              py-5
              sm:px-5
            "
          >

            <div className="space-y-5">

              {messages.map(
                (message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isDark={isDark}
                  />
                )
              )}

              {/* Suggestions */}

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
                            {suggestion}
                          </button>
                        )
                      )}

                    </div>

                  </div>
                )}

              {/* Loading */}

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

          {/* ================================= */}
          {/* INPUT */}
          {/* ================================= */}

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
                ref={inputRef}
                value={question}
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
                disabled={loading}
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
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-500
                  text-white
                  shadow-md
                  transition
                  hover:scale-[1.04]
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                  disabled:hover:scale-100
                "
              >
                {loading ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={17} />
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
                AI responses are based on
                live portfolio information.
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
        className="
          group
          fixed
          bottom-5
          right-4
          z-[101]
          flex
          items-center
          gap-2
          rounded-full
          bg-gradient-to-r
          from-violet-600
          via-purple-600
          to-fuchsia-500
          px-4
          py-3
          font-semibold
          text-white
          shadow-xl
          shadow-violet-500/25
          transition
          duration-300
          hover:-translate-y-1
          hover:shadow-2xl
          hover:shadow-violet-500/30
          sm:bottom-6
          sm:right-6
        "
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

        <div
          className="
            max-w-[82%]
            whitespace-pre-wrap
            rounded-2xl
            rounded-tr-md
            bg-gradient-to-br
            from-violet-600
            to-purple-600
            px-4
            py-3
            text-sm
            leading-6
            text-white
            shadow-md
          "
        >
          {message.content}
        </div>

        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-violet-600
            text-white
          "
        >
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
/* MARKDOWN RENDERER */
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
          <h1 className="mb-2 mt-3 text-lg font-bold first:mt-0">
            {children}
          </h1>
        ),

        h2: ({ children }) => (
          <h2 className="mb-2 mt-3 text-base font-bold first:mt-0">
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
          <ul className="mb-3 ml-5 list-disc space-y-1 last:mb-0">
            {children}
          </ul>
        ),

        ol: ({ children }) => (
          <ol className="mb-3 ml-5 list-decimal space-y-1 last:mb-0">
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
    <div
      className="
        flex
        h-8
        w-8
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-gradient-to-br
        from-violet-600
        to-fuchsia-500
        text-white
        shadow-md
        shadow-violet-500/10
      "
    >
      <Bot size={16} />
    </div>
  );
}

export default PortfolioAI;