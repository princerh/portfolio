import {
  Loader2,
  Mail,
  MapPin,
  Send,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../services/supabase";
import { useTheme } from "../context/ThemeContext";

const COOLDOWN_SECONDS = 30;
const MINIMUM_FORM_TIME = 3;

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [sending, setSending] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const formStartedAt = useRef(
    Date.now()
  );

  const { theme } = useTheme();

  const isDark =
    theme === "dark";

  useEffect(() => {
    formStartedAt.current =
      Date.now();
  }, []);

  /* ================================= */
  /* FORM FIELD UPDATE */
  /* ================================= */

  function updateField(
    field,
    value
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* ================================= */
  /* EMAIL VALIDATION */
  /* ================================= */

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );
  }

  /* ================================= */
  /* COOLDOWN */
  /* ================================= */

  function getRemainingCooldown() {
    const lastSubmission =
      localStorage.getItem(
        "portfolio-contact-last-submit"
      );

    if (!lastSubmission) {
      return 0;
    }

    const timestamp =
      Number(lastSubmission);

    if (
      Number.isNaN(timestamp)
    ) {
      localStorage.removeItem(
        "portfolio-contact-last-submit"
      );

      return 0;
    }

    const elapsed =
      (Date.now() - timestamp) /
      1000;

    return Math.max(
      0,
      Math.ceil(
        COOLDOWN_SECONDS -
          elapsed
      )
    );
  }

  /* ================================= */
  /* SUBMIT MESSAGE */
  /* ================================= */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    /*
     * Prevent unrealistically fast
     * submissions.
     */

    const secondsSpent =
      (Date.now() -
        formStartedAt.current) /
      1000;

    if (
      secondsSpent <
      MINIMUM_FORM_TIME
    ) {
      setErrorMessage(
        "Please wait a moment before sending your message."
      );

      return;
    }

    /*
     * Browser cooldown.
     */

    const remainingCooldown =
      getRemainingCooldown();

    if (
      remainingCooldown > 0
    ) {
      setErrorMessage(
        `Please wait ${remainingCooldown} seconds before sending another message.`
      );

      return;
    }

    /*
     * Clean input.
     */

    const cleanName =
      form.name.trim();

    const cleanEmail =
      form.email.trim();

    const cleanSubject =
      form.subject.trim();

    const cleanMessage =
      form.message.trim();

    /*
     * Validate name.
     */

    if (
      cleanName.length < 2
    ) {
      setErrorMessage(
        "Please enter your name."
      );

      return;
    }

    if (
      cleanName.length > 100
    ) {
      setErrorMessage(
        "Name is too long."
      );

      return;
    }

    /*
     * Validate email.
     */

    if (
      !validateEmail(
        cleanEmail
      )
    ) {
      setErrorMessage(
        "Please enter a valid email address."
      );

      return;
    }

    if (
      cleanEmail.length > 254
    ) {
      setErrorMessage(
        "Email address is too long."
      );

      return;
    }

    /*
     * Validate subject.
     */

    if (
      cleanSubject.length > 200
    ) {
      setErrorMessage(
        "Subject is too long."
      );

      return;
    }

    /*
     * Validate message.
     */

    if (
      cleanMessage.length < 10
    ) {
      setErrorMessage(
        "Please enter a slightly longer message."
      );

      return;
    }

    if (
      cleanMessage.length > 5000
    ) {
      setErrorMessage(
        "Your message is too long."
      );

      return;
    }

    setSending(true);

    try {
      const { error } =
        await supabase
          .from(
            "contact_messages"
          )
          .insert({
            name:
              cleanName,

            email:
              cleanEmail,

            subject:
              cleanSubject ||
              null,

            message:
              cleanMessage,
          });

      if (error) {
        throw error;
      }

      /*
       * Save submission time.
       */

      localStorage.setItem(
        "portfolio-contact-last-submit",
        String(Date.now())
      );

      setSuccessMessage(
        "Your message has been sent successfully."
      );

      /*
       * Clear form.
       */

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      /*
       * Restart form timer.
       */

      formStartedAt.current =
        Date.now();
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  /* ================================= */
  /* DARK THEME */
  /* ================================= */

  if (isDark) {
    return (
      <section
        id="contact"
        className="relative overflow-hidden px-6 py-24 lg:px-8"
      >
        {/* Background */}

        <div className="pointer-events-none absolute left-[-120px] top-[20%] h-[380px] w-[380px] rounded-full bg-purple-600/10 blur-[130px]" />

        <div className="pointer-events-none absolute bottom-[-120px] right-[-100px] h-[350px] w-[350px] rounded-full bg-pink-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl">

          {/* Header */}

          <div className="mx-auto mb-14 max-w-3xl text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-purple-400">
              Get In Touch
            </p>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">

              Contact{" "}

              <span className="gradient-text">
                Me
              </span>

            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Have a project,
              opportunity or
              collaboration in mind?
              Feel free to send me a
              message.
            </p>

          </div>

          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

            {/* LEFT SIDE */}

            <div className="glass-card h-fit rounded-3xl p-6 sm:p-8">

              <h3 className="text-2xl font-semibold">
                Let&apos;s connect
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                I&apos;m open to
                discussing software
                engineering, AI/ML,
                research,
                collaborations and
                professional
                opportunities.
              </p>

              <div className="mt-8 space-y-5">

                <DarkContactInfo
                  icon={Mail}
                  title="Email"
                  value="Send me a message using the form"
                />

                <DarkContactInfo
                  icon={MapPin}
                  title="Location"
                  value="Melbourne, Australia"
                />

              </div>

            </div>

            {/* CONTACT FORM */}

            <form
              onSubmit={handleSubmit}
              className="glass-card rounded-3xl p-6 sm:p-8"
            >

              {successMessage && (
                <div className="mb-6 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">

                <DarkInputField
                  label="Name"
                  value={form.name}
                  onChange={(value) =>
                    updateField(
                      "name",
                      value
                    )
                  }
                  placeholder="Your name"
                  maxLength={100}
                  required
                />

                <DarkInputField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateField(
                      "email",
                      value
                    )
                  }
                  placeholder="your@email.com"
                  maxLength={254}
                  required
                />

              </div>

              <div className="mt-6">

                <DarkInputField
                  label="Subject"
                  value={form.subject}
                  onChange={(value) =>
                    updateField(
                      "subject",
                      value
                    )
                  }
                  placeholder="Project opportunity"
                  maxLength={200}
                />

              </div>

              <div className="mt-6">

                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm text-gray-300"
                >
                  Message

                  <span className="ml-1 text-purple-400">
                    *
                  </span>
                </label>

                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={(event) =>
                    updateField(
                      "message",
                      event.target.value
                    )
                  }
                  rows={7}
                  minLength={10}
                  maxLength={5000}
                  required
                  placeholder="Write your message here..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
                />

                <p className="mt-2 text-right text-xs text-gray-600">
                  {form.message.length}
                  /5000
                </p>

              </div>

              <button
                type="submit"
                disabled={sending}
                className="gradient-button mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >

                {sending ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Sending...
                  </>
                ) : (
                  <>
                    <Send
                      size={18}
                    />

                    Send Message
                  </>
                )}

              </button>

              <p className="mt-4 text-xs leading-5 text-gray-600">
                A short cooldown is applied
                between messages to reduce
                repeated spam submissions.
              </p>

            </form>

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
      id="contact"
      className="relative overflow-hidden bg-[#f8fafc] px-6 py-24 text-slate-900 lg:px-8"
    >

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-180px] top-[10%] h-[400px] w-[400px] rounded-full bg-violet-100/70 blur-[120px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[400px] w-[400px] rounded-full bg-blue-100/60 blur-[120px]" />

      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="mx-auto mb-14 max-w-3xl text-center">

          <div className="mb-4 inline-flex rounded-full border border-violet-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 shadow-sm">
            Get In Touch
          </div>

          <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

            Let&apos;s build something{" "}

            <span className="text-violet-700">
              meaningful
            </span>

          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-600">
            Have a project, opportunity,
            research idea or collaboration
            in mind? Send me a message and
            let&apos;s start a conversation.
          </p>

        </div>

        {/* ================================= */}
        {/* CONTENT */}
        {/* ================================= */}

        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">

          {/* ================================= */}
          {/* LEFT */}
          {/* ================================= */}

          <div className="h-fit rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-8">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">

              <Mail
                size={25}
              />

            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">
              Let&apos;s connect
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              I&apos;m open to discussing
              software engineering,
              artificial intelligence,
              machine learning, research,
              collaborations and
              professional opportunities.
            </p>

            <div className="my-7 h-px bg-slate-100" />

            <div className="space-y-5">

              <LightContactInfo
                icon={Mail}
                title="Email"
                value="Send me a message using the form"
              />

              <LightContactInfo
                icon={MapPin}
                title="Location"
                value="Melbourne, Australia"
              />

            </div>

            {/* Availability */}

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">

              <div className="flex items-center gap-3">

                <span className="relative flex h-3 w-3">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />

                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />

                </span>

                <div>

                  <p className="text-sm font-semibold text-emerald-800">
                    Open to opportunities
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Feel free to reach out for
                    relevant projects and
                    collaborations.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-8"
          >

            <div className="mb-7">

              <h3 className="text-xl font-bold text-slate-900">
                Send me a message
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in the form below and
                your message will be sent
                directly to me.
              </p>

            </div>

            {/* Success */}

            {successMessage && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {successMessage}
              </div>
            )}

            {/* Error */}

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Name + Email */}

            <div className="grid gap-6 md:grid-cols-2">

              <LightInputField
                label="Name"
                value={form.name}
                onChange={(value) =>
                  updateField(
                    "name",
                    value
                  )
                }
                placeholder="Your name"
                maxLength={100}
                required
              />

              <LightInputField
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) =>
                  updateField(
                    "email",
                    value
                  )
                }
                placeholder="your@email.com"
                maxLength={254}
                required
              />

            </div>

            {/* Subject */}

            <div className="mt-6">

              <LightInputField
                label="Subject"
                value={form.subject}
                onChange={(value) =>
                  updateField(
                    "subject",
                    value
                  )
                }
                placeholder="Project opportunity"
                maxLength={200}
              />

            </div>

            {/* Message */}

            <div className="mt-6">

              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Message

                <span className="ml-1 text-violet-600">
                  *
                </span>
              </label>

              <textarea
                id="contact-message"
                value={form.message}
                onChange={(event) =>
                  updateField(
                    "message",
                    event.target.value
                  )
                }
                rows={7}
                minLength={10}
                maxLength={5000}
                required
                placeholder="Write your message here..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />

              <div className="mt-2 flex items-center justify-between gap-4">

                <p className="text-xs text-slate-400">
                  Minimum 10 characters
                </p>

                <p className="text-xs text-slate-400">
                  {form.message.length}
                  /5000
                </p>

              </div>

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={sending}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-700/15 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50 sm:w-auto"
            >

              {sending ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Sending...
                </>
              ) : (
                <>
                  <Send
                    size={18}
                  />

                  Send Message
                </>
              )}

            </button>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              A short cooldown is applied
              between messages to reduce
              repeated spam submissions.
            </p>

          </form>

        </div>

      </div>

    </section>
  );
}


/* ================================= */
/* DARK INPUT FIELD */
/* ================================= */

function DarkInputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
}) {
  const inputId =
    `contact-${label
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  return (
    <div>

      <label
        htmlFor={inputId}
        className="mb-2 block text-sm text-gray-300"
      >
        {label}

        {required && (
          <span className="ml-1 text-purple-400">
            *
          </span>
        )}

      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/60"
      />

    </div>
  );
}


/* ================================= */
/* LIGHT INPUT FIELD */
/* ================================= */

function LightInputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
}) {
  const inputId =
    `contact-${label
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

  return (
    <div>

      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-violet-600">
            *
          </span>
        )}

      </label>

      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
      />

    </div>
  );
}


/* ================================= */
/* DARK CONTACT INFO */
/* ================================= */

function DarkContactInfo({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">

        <Icon size={20} />

      </div>

      <div>

        <p className="text-sm font-medium text-gray-300">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          {value}
        </p>

      </div>

    </div>
  );
}


/* ================================= */
/* LIGHT CONTACT INFO */
/* ================================= */

function LightContactInfo({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">

        <Icon size={19} />

      </div>

      <div>

        <p className="text-sm font-semibold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {value}
        </p>

      </div>

    </div>
  );
}

export default Contact;