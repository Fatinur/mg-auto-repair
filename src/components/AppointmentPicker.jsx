import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiX } from "react-icons/fi";

export default function AppointmentPicker({ date, time, onConfirm }) {
  const [activePicker, setActivePicker] = useState(null);
  const [selectedDate, setSelectedDate] = useState(date || "");
  const [selectedTime, setSelectedTime] = useState(time || "");

  useEffect(() => {
    setSelectedDate(date || "");
    setSelectedTime(time || "");
  }, [date, time]);

  useEffect(() => {
    if (!activePicker) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActivePicker(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePicker]);

  function confirmSelection() {
    if (activePicker === "date" && !selectedDate) return;
    if (activePicker === "time" && !selectedTime) return;

    onConfirm(selectedDate, selectedTime);
    setActivePicker(null);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#08090b] px-4 py-4 text-left text-white transition hover:border-[#e32636] focus:border-[#e32636] focus:outline-none";

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-300">
            Appointment date
          </label>

          <button
            type="button"
            onClick={() => setActivePicker("date")}
            className={inputClass}
          >
            <span className="flex items-center gap-3">
              <FiCalendar className="shrink-0 text-[#e32636]" />

              {selectedDate
                ? new Date(
                    `${selectedDate}T12:00:00`
                  ).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Choose a date"}
            </span>
          </button>
        </div>

        <div>
          <label className="text-sm text-zinc-300">
            Appointment time
          </label>

          <button
            type="button"
            onClick={() => setActivePicker("time")}
            className={inputClass}
          >
            <span className="flex items-center gap-3">
              <FiClock className="shrink-0 text-[#e32636]" />

              {selectedTime
                ? new Date(
                    `2000-01-01T${selectedTime}`
                  ).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Choose a time"}
            </span>
          </button>
        </div>
      </div>

      {activePicker && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setActivePicker(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-picker-title"
            className="my-auto w-full max-w-md rounded-2xl border border-white/10 bg-[#101115] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[2px] text-[#e32636]">
                  M&G AUTO REPAIR
                </p>

                <h2
                  id="appointment-picker-title"
                  className="mt-2 text-2xl font-bold text-white"
                >
                  {activePicker === "date"
                    ? "Choose a date"
                    : "Choose a time"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setActivePicker(null)}
                aria-label="Close picker"
                className="rounded-lg border border-white/10 p-3 text-zinc-300 hover:bg-white/10"
              >
                <FiX />
              </button>
            </div>

            <p className="mt-2 text-sm text-zinc-400">
              {activePicker === "date"
                ? "Select the appointment day."
                : "Select the appointment time."}
            </p>

            {activePicker === "date" ? (
              <input
                autoFocus
                type="date"
                value={selectedDate}
                min={today}
                onChange={(event) =>
                  setSelectedDate(event.target.value)
                }
                className="mt-6 block min-h-14 w-full rounded-xl border border-white/10 bg-[#08090b] px-4 py-4 text-white outline-none focus:border-[#e32636] [color-scheme:dark]"
              />
            ) : (
              <input
                autoFocus
                type="time"
                value={selectedTime}
                onChange={(event) =>
                  setSelectedTime(event.target.value)
                }
                className="mt-6 block min-h-14 w-full rounded-xl border border-white/10 bg-[#08090b] px-4 py-4 text-white outline-none focus:border-[#e32636] [color-scheme:dark]"
              />
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setActivePicker(null)}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmSelection}
                disabled={
                  activePicker === "date"
                    ? !selectedDate
                    : !selectedTime
                }
                className="flex-1 rounded-xl bg-[#e32636] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#c91d2c] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirm
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}