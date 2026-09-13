import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Loader2,
  MessageCircle,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

function AIAnalyticsManager() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* ======================================= */
  /* LOAD AI USAGE LOGS */
  /* ======================================= */

  const loadAnalytics = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const {
          data,
          error: fetchError,
        } = await supabase
          .from("ai_usage_logs")
          .select(
            "id, visitor_id, request_type, created_at"
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(1000);

        if (fetchError) {
          throw fetchError;
        }

        setLogs(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "AI analytics loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load AI analytics."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  /* ======================================= */
  /* CALCULATE ANALYTICS */
  /* ======================================= */

  const analytics = useMemo(() => {
    const now = new Date();

    const startOfToday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

    const sevenDaysAgo =
      new Date(
        now.getTime() -
          7 *
            24 *
            60 *
            60 *
            1000
      );

    const todayLogs =
      logs.filter((log) => {
        const createdAt =
          new Date(
            log.created_at
          );

        return (
          createdAt >=
          startOfToday
        );
      });

    const weekLogs =
      logs.filter((log) => {
        const createdAt =
          new Date(
            log.created_at
          );

        return (
          createdAt >=
          sevenDaysAgo
        );
      });

    const chatRequests =
      logs.filter(
        (log) =>
          log.request_type ===
          "chat"
      ).length;

    const recruiterRequests =
      logs.filter(
        (log) =>
          log.request_type ===
          "recruiter"
      ).length;

    const uniqueVisitors =
      new Set(
        logs
          .map(
            (log) =>
              log.visitor_id
          )
          .filter(Boolean)
      ).size;

    return {
      total: logs.length,
      today: todayLogs.length,
      week: weekLogs.length,
      chat: chatRequests,
      recruiter:
        recruiterRequests,
      visitors:
        uniqueVisitors,
    };
  }, [logs]);

  /* ======================================= */
  /* LOADING */
  /* ======================================= */

  if (loading) {
    return (
      <div className="glass-card flex min-h-[420px] items-center justify-center rounded-3xl p-8">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-purple-400"
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading AI analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-purple-400">
            AI Assistant
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            AI Analytics
          </h2>

          <p className="mt-3 max-w-2xl text-gray-500">
            Monitor how visitors use your
            portfolio AI assistant and
            Recruiter Match feature.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadAnalytics(true)
          }
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm font-medium text-purple-300 transition hover:border-purple-500/30 hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ================================= */}
      {/* ERROR */}
      {/* ================================= */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ================================= */}
      {/* STATISTICS */}
      {/* ================================= */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnalyticsCard
          title="Total Requests"
          value={analytics.total}
          description="All logged AI requests"
          icon={BarChart3}
        />

        <AnalyticsCard
          title="Today"
          value={analytics.today}
          description="Requests since midnight"
          icon={CalendarDays}
        />

        <AnalyticsCard
          title="Last 7 Days"
          value={analytics.week}
          description="Recent AI activity"
          icon={Bot}
        />

        <AnalyticsCard
          title="Ask AI"
          value={analytics.chat}
          description="Portfolio chat requests"
          icon={MessageCircle}
        />

        <AnalyticsCard
          title="Recruiter Match"
          value={
            analytics.recruiter
          }
          description="Job match analyses"
          icon={
            BriefcaseBusiness
          }
        />

        <AnalyticsCard
          title="Unique Visitors"
          value={
            analytics.visitors
          }
          description="Anonymous browser IDs"
          icon={Users}
        />
      </div>

      {/* ================================= */}
      {/* USAGE BREAKDOWN */}
      {/* ================================= */}

      <div className="glass-card mt-8 rounded-3xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <BarChart3
              size={22}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              Usage Breakdown
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Distribution between Ask AI
              and Recruiter Match.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          <UsageBar
            label="Ask AI"
            value={
              analytics.chat
            }
            total={
              analytics.total
            }
          />

          <UsageBar
            label="Recruiter Match"
            value={
              analytics.recruiter
            }
            total={
              analytics.total
            }
          />
        </div>
      </div>

      {/* ================================= */}
      {/* RECENT ACTIVITY */}
      {/* ================================= */}

      <div className="glass-card mt-8 rounded-3xl p-6 sm:p-8">
        <div>
          <h3 className="text-xl font-semibold">
            Recent AI Activity
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Latest successful AI requests
            recorded by your portfolio.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <Bot
              size={34}
              className="mx-auto text-gray-600"
            />

            <p className="mt-4 font-medium text-gray-400">
              No AI activity yet
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Activity will appear here
              after visitors use Ask AI or
              Recruiter Match.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead className="bg-white/[0.04]">
                  <tr className="text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-4 font-medium">
                      Type
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Visitor
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Date
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Time
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs
                    .slice(0, 20)
                    .map((log) => {
                      const date =
                        new Date(
                          log.created_at
                        );

                      return (
                        <tr
                          key={log.id}
                          className="border-t border-white/10 text-sm transition hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <RequestTypeBadge
                              type={
                                log.request_type
                              }
                            />
                          </td>

                          <td className="px-5 py-4 font-mono text-xs text-gray-500">
                            {shortVisitorId(
                              log.visitor_id
                            )}
                          </td>

                          <td className="px-5 py-4 text-gray-400">
                            {date.toLocaleDateString(
                              undefined,
                              {
                                day: "2-digit",
                                month:
                                  "short",
                                year:
                                  "numeric",
                              }
                            )}
                          </td>

                          <td className="px-5 py-4 text-gray-400">
                            {date.toLocaleTimeString(
                              undefined,
                              {
                                hour:
                                  "2-digit",
                                minute:
                                  "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================================= */}
      {/* PRIVACY */}
      {/* ================================= */}

      <div className="mt-6 rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-5">
        <p className="text-sm leading-6 text-emerald-200/80">
          AI analytics stores only the
          anonymous visitor ID, request
          type, and request time. Full
          visitor questions and Recruiter
          Match job descriptions are not
          stored.
        </p>
      </div>
    </>
  );
}

/* ======================================= */
/* ANALYTICS CARD */
/* ======================================= */

function AnalyticsCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="glass-card group rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-purple-500/30">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 transition group-hover:bg-purple-500/20">
        <Icon size={21} />
      </div>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}

/* ======================================= */
/* USAGE BAR */
/* ======================================= */

function UsageBar({
  label,
  value,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round(
          (value / total) *
            100
        )
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-300">
          {label}
        </span>

        <span className="text-gray-500">
          {value} ({percentage}%)
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500"
          style={{
            width:
              `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ======================================= */
/* REQUEST TYPE BADGE */
/* ======================================= */

function RequestTypeBadge({
  type,
}) {
  const recruiter =
    type === "recruiter";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        recruiter
          ? "bg-fuchsia-500/10 text-fuchsia-300"
          : "bg-violet-500/10 text-violet-300"
      }`}
    >
      {recruiter ? (
        <BriefcaseBusiness
          size={13}
        />
      ) : (
        <MessageCircle
          size={13}
        />
      )}

      {recruiter
        ? "Recruiter"
        : "Ask AI"}
    </span>
  );
}

/* ======================================= */
/* SHORT VISITOR ID */
/* ======================================= */

function shortVisitorId(
  visitorId
) {
  if (!visitorId) {
    return "Unknown";
  }

  if (
    visitorId.length <=
    12
  ) {
    return visitorId;
  }

  return `${visitorId.slice(
    0,
    8
  )}...`;
}

export default AIAnalyticsManager;