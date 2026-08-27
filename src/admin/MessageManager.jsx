import {
  Loader2,
  Mail,
  MailOpen,
  Trash2,
} from "lucide-react";

import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function MessageManager() {
  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [selectedMessage, setSelectedMessage] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  async function loadMessages() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data, error } =
        await supabase
          .from("contact_messages")
          .select("*");

      if (error) {
        throw error;
      }

      setMessages(data || []);
    } catch (error) {
      console.error(
        "Message loading error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to load messages."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(message) {
    const confirmed =
      window.confirm(
        `Delete message from "${message.name}"?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(message.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } =
        await supabase
          .from("contact_messages")
          .delete()
          .eq("id", message.id);

      if (error) {
        throw error;
      }

      if (
        selectedMessage?.id ===
        message.id
      ) {
        setSelectedMessage(null);
      }

      setSuccessMessage(
        "Message deleted successfully."
      );

      await loadMessages();
    } catch (error) {
      console.error(
        "Message delete error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Unable to delete message."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={34}
            className="mx-auto animate-spin text-purple-400"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Header */}

      <div className="mb-8">
        <p className="text-sm font-medium text-purple-400">
          Contact
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
          Messages
        </h2>

        <p className="mt-3 text-gray-500">
          Messages submitted through your
          public portfolio contact form.
        </p>
      </div>

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

      <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">

        {/* Message list */}

        <div className="glass-card h-fit rounded-3xl p-5">

          <div className="mb-4 flex items-center justify-between">

            <h3 className="font-semibold">
              Inbox
            </h3>

            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
              {messages.length}
            </span>

          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center">
              <Mail
                size={40}
                className="mx-auto text-gray-600"
              />

              <p className="mt-4 text-sm text-gray-500">
                No messages yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {messages.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() =>
                    setSelectedMessage(message)
                  }
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedMessage?.id ===
                    message.id
                      ? "border-purple-500/40 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:border-purple-500/20 hover:bg-purple-500/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MailOpen
                      size={18}
                      className="mt-0.5 shrink-0 text-purple-400"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {message.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {message.email}
                      </p>

                      <p className="mt-2 truncate text-sm text-gray-400">
                        {message.subject ||
                          "No subject"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}

            </div>
          )}

        </div>

        {/* Message detail */}

        <div className="glass-card min-h-[400px] rounded-3xl p-6 sm:p-8">

          {!selectedMessage ? (
            <div className="flex min-h-[330px] flex-col items-center justify-center text-center">

              <Mail
                size={48}
                className="text-gray-600"
              />

              <h3 className="mt-4 text-lg font-semibold">
                Select a message
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Choose a message from the
                inbox to read it.
              </p>

            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">

                <div>
                  <p className="text-sm text-purple-400">
                    From
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {selectedMessage.name}
                  </h3>

                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="mt-2 inline-block text-sm text-gray-400 transition hover:text-purple-400"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      selectedMessage
                    )
                  }
                  disabled={
                    deletingId ===
                    selectedMessage.id
                  }
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deletingId ===
                  selectedMessage.id ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  Delete
                </button>

              </div>

              <div className="mt-8 border-t border-white/10 pt-6">

                <p className="text-xs uppercase tracking-[0.15em] text-gray-600">
                  Subject
                </p>

                <h4 className="mt-2 text-lg font-medium">
                  {selectedMessage.subject ||
                    "No subject"}
                </h4>

              </div>

              <div className="mt-7">

                <p className="text-xs uppercase tracking-[0.15em] text-gray-600">
                  Message
                </p>

                <p className="mt-3 whitespace-pre-wrap leading-8 text-gray-400">
                  {selectedMessage.message}
                </p>

              </div>

              <div className="mt-8">

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${
                    selectedMessage.subject ||
                    "Your portfolio message"
                  }`}
                  className="gradient-button inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
                >
                  <Mail size={17} />
                  Reply by Email
                </a>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default MessageManager;