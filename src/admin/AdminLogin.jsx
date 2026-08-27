import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();

  const {
    login,
    user,
    loading,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate(
        "/admin/dashboard",
        { replace: true }
      );
    }
  }, [user, loading, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSubmitting(true);

    const { error } = await login(
      email,
      password
    );

    if (error) {
      setErrorMessage(
        error.message ||
          "Unable to sign in."
      );

      setSubmitting(false);

      return;
    }

    navigate(
      "/admin/dashboard",
      { replace: true }
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 text-white">
      {/* Background glow */}

      <div className="pointer-events-none absolute right-[10%] top-[10%] h-[300px] w-[300px] rounded-full bg-purple-600/20 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[10%] left-[10%] h-[300px] w-[300px] rounded-full bg-pink-500/10 blur-[120px]" />

      <div className="glass-card relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl">
        {/* Header */}

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 shadow-lg shadow-purple-500/20">
            <LockKeyhole size={26} />
          </div>

          <h1 className="text-3xl font-bold">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your portfolio
          </p>
        </div>

        {/* Error */}

        {errorMessage && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Email */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-gray-300"
            >
              Email
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-purple-500/60">
              <Mail
                size={18}
                className="shrink-0 text-gray-500"
              />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-600"
                required
              />
            </div>
          </div>

          {/* Password */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm text-gray-300"
            >
              Password
            </label>

            <div className="flex items-center rounded-xl border border-white/10 bg-white/5 px-4 transition focus-within:border-purple-500/60">
              <LockKeyhole
                size={18}
                className="shrink-0 text-gray-500"
              />

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full bg-transparent px-3 py-3 text-white outline-none placeholder:text-gray-600"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="text-gray-500 transition hover:text-gray-300"
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={submitting}
            className="gradient-button flex w-full items-center justify-center rounded-xl py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>

                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <a
          href="/"
          className="mt-6 block text-center text-sm text-gray-500 transition hover:text-purple-400"
        >
          ← Back to portfolio
        </a>
      </div>
    </div>
  );
}

export default AdminLogin;