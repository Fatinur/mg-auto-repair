
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiCalendar,
  FiLogOut,
  FiPhone,
  FiRefreshCw,
  FiSave,
  FiClock,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";
import AppointmentPicker from "../components/AppointmentPicker";

const statuses = [
  "new",
  "contacted",
  "scheduled",
  "completed",
  "declined",
  "cancelled",
];

const requestPeriods = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

function formatDate(value) {
  if (!value) return "Not set";

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toLocalInputValue(value) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function getAppointmentParts(value) {
  if (!value) {
    return {
      appointment_date: "",
      appointment_time: "",
    };
  }

  const localValue = toLocalInputValue(value);

  return {
    appointment_date: localValue.slice(0, 10),
    appointment_time: localValue.slice(11, 16),
  };
}

function isWithinRequestPeriod(createdAt, period) {
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) return false;

  const now = new Date();

  // Local midnight today.
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Tomorrow at local midnight.
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );

  if (period === "today") {
    return createdDate >= start && createdDate < end;
  }

  if (period === "week") {
    // Monday is the first day of the week.
    const daysSinceMonday = (now.getDay() + 6) % 7;

    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - daysSinceMonday
    );

    const nextWeekStart = new Date(weekStart);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    return createdDate >= weekStart && createdDate < nextWeekStart;
  }

  if (period === "month") {
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const nextMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );

    return createdDate >= monthStart && createdDate < nextMonthStart;
  }

  return true;
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestPeriod, setRequestPeriod] = useState("week");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      if (userData.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data, error: queryError } = await supabase
        .from("repair_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      const loadedRequests = data || [];

      setRequests(loadedRequests);

      const nextDrafts = {};

      for (const request of loadedRequests) {
        nextDrafts[request.id] = {
          status: request.status,
          ...getAppointmentParts(request.appointment_at),
          internal_notes: request.internal_notes || "",
        };
      }

      setDrafts(nextDrafts);
    } catch (err) {
      console.error("Unable to load repair requests:", err);
      setError(
        "Could not load requests. Check your connection and admin permissions."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRequests();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadRequests]);

  function updateDraft(id, field, value) {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  }

  async function saveRequest(request) {
    const draft = drafts[request.id];

    if (!draft) return;

    setSavingId(request.id);
    setError("");
    setNotice("");

    try {
      const hasDate = Boolean(draft.appointment_date);
      const hasTime = Boolean(draft.appointment_time);

      if (hasDate !== hasTime) {
        throw new Error(
          "Choose both a date and a time, or clear both fields."
        );
      }

      const appointmentAt =
        hasDate && hasTime
          ? new Date(
              `${draft.appointment_date}T${draft.appointment_time}`
            )
          : null;

      if (appointmentAt && Number.isNaN(appointmentAt.getTime())) {
        throw new Error(
          "Please choose a valid appointment date and time."
        );
      }

      if (draft.status === "scheduled" && !appointmentAt) {
        throw new Error(
          "Choose both an appointment date and time before marking this request as scheduled."
        );
      }

      const { data, error: updateError } = await supabase
        .from("repair_requests")
        .update({
          status: draft.status,
          appointment_at: appointmentAt
            ? appointmentAt.toISOString()
            : null,
          internal_notes: draft.internal_notes.trim() || null,
        })
        .eq("id", request.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setRequests((current) =>
        current.map((item) => (item.id === request.id ? data : item))
      );

      setDrafts((current) => ({
        ...current,
        [request.id]: {
          status: data.status,
          ...getAppointmentParts(data.appointment_at),
          internal_notes: data.internal_notes || "",
        },
      }));

      setNotice(`Request for ${request.name} was saved.`);
    } catch (err) {
      console.error("Unable to save repair request:", err);
      setError(err.message || "Could not save this request.");
    } finally {
      setSavingId(null);
    }
  }

  async function markCompleted(appointment) {
    setSavingId(appointment.id);
    setError("");
    setNotice("");

    try {
      const { data, error: updateError } = await supabase
        .from("repair_requests")
        .update({ status: "completed" })
        .eq("id", appointment.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setRequests((current) =>
        current.map((request) =>
          request.id === appointment.id ? data : request
        )
      );

      setDrafts((current) => ({
        ...current,
        [appointment.id]: {
          ...current[appointment.id],
          status: "completed",
        },
      }));

      setNotice(`Appointment for ${appointment.name} marked as completed.`);
    } catch (err) {
      console.error("Unable to complete appointment:", err);
      setError(err.message || "Could not mark this appointment as completed.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSignOut() {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("Could not sign out. Please try again.");
      return;
    }

    navigate("/admin/login", { replace: true });
  }

  const totalRequestsForPeriod = requests.filter((request) =>
    isWithinRequestPeriod(request.created_at, requestPeriod)
  ).length;

  const newCount = requests.filter(
    (request) => request.status === "new"
  ).length;

  const scheduledCount = requests.filter(
    (request) => request.status === "scheduled"
  ).length;

  const upcomingAppointments = requests
    .filter(
      (request) =>
        request.status === "scheduled" &&
        request.appointment_at &&
        new Date(request.appointment_at).getTime() >= Date.now()
    )
    .sort(
      (a, b) =>
        new Date(a.appointment_at) - new Date(b.appointment_at)
    );

  return (
    <main className="min-h-screen bg-[#08090b] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[3px] text-[#e32636]">
              M&G AUTO REPAIR
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Repair requests
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Review customer requests and manage appointments.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={loadRequests}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm transition hover:bg-white/5 disabled:opacity-50"
            >
              <FiRefreshCw />
              Refresh
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm transition hover:border-red-500/40 hover:text-red-400"
            >
              <FiLogOut />
              Sign out
            </button>
          </div>
        </header>

        <section className="mt-7 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-400">Total requests</p>

              <select
                value={requestPeriod}
                onChange={(event) => setRequestPeriod(event.target.value)}
                aria-label="Filter total requests by time period"
                className="rounded-lg border border-white/10 bg-[#08090b] px-3 py-2 text-xs text-white outline-none transition focus:border-[#e32636]"
              >
                {requestPeriods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="mt-3 text-3xl font-bold">
              {totalRequestsForPeriod}
            </p>

            <p className="mt-2 text-xs text-zinc-500">
              Requests submitted{" "}
              {requestPeriods
                .find((period) => period.value === requestPeriod)
                ?.label.toLowerCase()}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-5">
            <p className="text-sm text-zinc-400">New requests</p>
            <p className="mt-3 text-3xl font-bold text-[#e32636]">
              {newCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0d0e12] p-5">
            <p className="text-sm text-zinc-400">Scheduled</p>
            <p className="mt-3 text-3xl font-bold">{scheduledCount}</p>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400"
          >
            {notice}
          </p>
        )}

        {!loading && (
          <section className="mt-8 rounded-xl border border-white/10 bg-[#0d0e12] p-5 sm:p-7">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[2px] text-[#e32636]">
                  Schedule
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Upcoming appointments
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                  All future appointments, ordered by date and time.
                </p>
              </div>

              <span className="w-fit rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300">
                {upcomingAppointments.length} upcoming
              </span>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="mt-6 rounded-lg border border-dashed border-white/10 px-4 py-10 text-center">
                <FiCalendar className="mx-auto text-2xl text-zinc-500" />

                <p className="mt-3 font-medium text-zinc-300">
                  No upcoming appointments
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Schedule a request below and save your changes.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#08090b] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 gap-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#e32636]/10 text-[#e32636]">
                        <FiCalendar className="text-xl" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold">
                          {appointment.name}
                        </h3>

                        <p className="mt-1 text-sm text-zinc-300">
                          {formatDate(appointment.appointment_at)}
                        </p>

                        <p className="mt-1 break-words text-sm text-zinc-500">
                          {appointment.service}
                          {appointment.vehicle
                            ? ` · ${appointment.vehicle}`
                            : ""}
                        </p>

                        <p className="mt-1 text-xs capitalize text-zinc-500">
                          {appointment.service_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-3">
                      <a
                        href={`tel:${appointment.phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm font-semibold transition hover:border-[#e32636] hover:text-[#e32636]"
                      >
                        <FiPhone />
                        Call customer
                      </a>

                      <button
                        type="button"
                        onClick={() => markCompleted(appointment)}
                        disabled={savingId === appointment.id}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FiCheckCircle />
                        {savingId === appointment.id
                          ? "Updating..."
                          : "Mark Completed"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {loading ? (
          <p className="py-16 text-center text-sm text-zinc-400">
            Loading repair requests...
          </p>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-[#0d0e12] px-5 py-16 text-center">
            <h2 className="text-xl font-semibold">No requests yet</h2>

            <p className="mt-2 text-sm text-zinc-400">
              New customer submissions will appear here.
            </p>
          </div>
        ) : (
          <section className="mt-8 space-y-5">
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                All repair requests
              </h2>

              <p className="mt-2 text-sm text-zinc-400">
                Update each request's status, appointment, and internal notes.
              </p>
            </div>

            {requests.map((request) => {
              const draft = drafts[request.id];

              if (!draft) return null;

              return (
                <article
                  key={request.id}
                  className="rounded-xl border border-white/10 bg-[#0d0e12] p-5 sm:p-7"
                >
                  <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {request.name}
                        </h3>

                        <span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize text-zinc-300">
                          {request.status}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-zinc-500">
                        Submitted {formatDate(request.created_at)}
                      </p>
                    </div>

                    <a
                      href={`tel:${request.phone.replace(/[^\d+]/g, "")}`}
                      className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#e32636] px-4 py-3 text-sm font-bold transition hover:bg-[#c91d2c]"
                    >
                      <FiPhone />
                      Call {request.name.split(" ")[0]}
                    </a>
                  </div>

                  <div className="grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-zinc-500">Phone number</p>
                      <p className="mt-2 break-words text-sm">
                        {request.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Service needed</p>
                      <p className="mt-2 text-sm">{request.service}</p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Service type</p>
                      <p className="mt-2 text-sm">
                        {request.service_type}
                      </p>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-zinc-500">Vehicle</p>
                      <p className="mt-2 text-sm">
                        {request.vehicle || "Not provided"}
                      </p>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3">
                      <p className="text-xs text-zinc-500">
                        Customer's description
                      </p>

                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {request.message ||
                          "No additional details provided."}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 border-t border-white/10 pt-6 lg:grid-cols-3">
                    <label className="block text-sm text-zinc-300">
                      Request status

                      <select
                        value={draft.status}
                        onChange={(event) =>
                          updateDraft(
                            request.id,
                            "status",
                            event.target.value
                          )
                        }
                        className="mt-2 w-full rounded-lg border border-white/10 bg-[#08090b] px-3 py-3 text-white outline-none focus:border-[#e32636]"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="lg:col-span-2">
                      <span className="mb-3 flex items-center gap-2 text-sm text-zinc-300">
                        <FiCalendar />
                        Appointment scheduling
                      </span>

                      <AppointmentPicker
                        date={draft.appointment_date}
                        time={draft.appointment_time}
                        onConfirm={(date, time) => {
                          updateDraft(
                            request.id,
                            "appointment_date",
                            date
                          );

                          updateDraft(
                            request.id,
                            "appointment_time",
                            time
                          );
                        }}
                      />

                      <p className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
                        <FiClock />

                        {draft.appointment_date &&
                        draft.appointment_time
                          ? "Selected appointment: " +
                            new Date(
                              `${draft.appointment_date}T${draft.appointment_time}`
                            ).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Choose both a date and a time."}
                      </p>
                    </div>

                    <label className="block text-sm text-zinc-300 lg:col-span-3">
                      Internal staff notes

                      <textarea
                        rows={3}
                        maxLength={3000}
                        value={draft.internal_notes}
                        onChange={(event) =>
                          updateDraft(
                            request.id,
                            "internal_notes",
                            event.target.value
                          )
                        }
                        placeholder="Record call outcomes or other internal details..."
                        className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-[#08090b] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#e32636]"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-zinc-500">
                      {request.appointment_at
                        ? `Saved appointment: ${formatDate(
                            request.appointment_at
                          )}`
                        : "No appointment saved yet"}
                    </p>

                    <button
                      type="button"
                      onClick={() => saveRequest(request)}
                      disabled={savingId === request.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                    >
                      <FiSave />

                      {savingId === request.id
                        ? "Saving..."
                        : "Save changes"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
