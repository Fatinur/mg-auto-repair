import { useState } from "react";
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiPhone,
  FiTool,
} from "react-icons/fi";
import { supabase } from "../lib/supabase";

const initialForm = {
  name: "",
  phone: "",
  service: "",
  vehicle: "",
  message: "",
  serviceType: "Shop service",
};

const services = [
  "Engine Repair",
  "Brake Service",
  "Oil Change",
  "Transmission Repair",
  "Vehicle Diagnostics",
  "General Maintenance",
  "Mobile Mechanic",
  "Other",
];

const fieldClass =
  "mt-2 w-full rounded-lg border border-white/10 bg-[#08090b] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#e32636] disabled:cursor-not-allowed disabled:opacity-60";

export default function RepairRequestForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (status === "submitting") return;

    const name = form.name.trim();
    const phone = form.phone.trim();
    const digits = phone.replace(/\D/g, "");

    if (name.length < 2) {
      setStatus("error");
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (digits.length < 7 || digits.length > 15) {
      setStatus("error");
      setErrorMessage(
        "Please enter a valid phone number, including your area or country code."
      );
      return;
    }

    if (!form.service) {
      setStatus("error");
      setErrorMessage("Please select the service you need.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const request = {
      name,
      phone,
      service: form.service,
      service_type: form.serviceType,
      vehicle: form.vehicle.trim() || null,
      message: form.message.trim() || null,
    };

    try {
      const { data, error } = await supabase
        .from("repair_requests")
        .insert(request)
        .select("id")
        .single();

      if (error) throw error;

      if (!data?.id) {
        throw new Error("The request could not be confirmed.");
      }

      setForm({ ...initialForm });
      setStatus("success");
    } catch (error) {
      console.error("Repair request submission failed:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });

      setErrorMessage(
        error.code === "42501"
          ? "Your request couldn't be saved because database permissions need attention. Please call the shop."
          : "We couldn't submit your request. Please try again or call the shop directly."
      );

      setStatus("error");
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <section
      id="contact"
      className="border-t border-white/10 bg-[#08090b] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="mb-4 flex items-center gap-3 text-xs font-bold tracking-[3px] text-[#e32636] uppercase">
            <span className="h-px w-8 bg-[#e32636]" />
            Get In Touch
          </p>

          <h2 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
            Let's talk about{" "}
            <span className="text-zinc-500">your vehicle.</span>
          </h2>

          <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 sm:text-base">
            Tell us what's happening with your vehicle. Share a few details
            and get in touch with M&G Auto Repair to discuss your needs.
          </p>

          <a
            href="tel:+17206886007"
            className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-white transition-colors hover:text-[#e32636]"
          >
            <span className="grid size-11 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-[#e32636]">
              <FiPhone size={19} />
            </span>

            <span>
              <span className="block text-xs font-medium text-zinc-500">
                Call M&G Auto Repair
              </span>
              <span className="mt-1 block">+1 (720) 688-6007</span>
            </span>
          </a>

          <div className="mt-10 flex items-start gap-3 border-t border-white/10 pt-6">
            <FiTool className="mt-1 shrink-0 text-[#e32636]" size={19} />
            <p className="text-xs leading-6 text-zinc-500">
              Submitting a request does not confirm an appointment. The shop
              must confirm availability and next steps.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 bg-[#0d0e12] p-5 sm:p-8"
        >
          <div className="mb-7">
            <h3 className="text-xl font-semibold text-white">
              Request a repair
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Fields marked * are required.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm text-zinc-300">
              Your name *
              <input
                className={fieldClass}
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={100}
                disabled={isSubmitting}
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Phone number *
              <input
                className={fieldClass}
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="Your phone number"
                value={form.phone}
                onChange={handleChange}
                required
                minLength={7}
                maxLength={30}
                disabled={isSubmitting}
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Service needed *
              <select
                className={fieldClass}
                name="service"
                value={form.service}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Select a service
                </option>

                {services.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-zinc-300">
              Preferred service type *
              <select
                className={fieldClass}
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option>Shop service</option>
                <option>Mobile mechanic</option>
                <option>Not sure yet</option>
              </select>
            </label>

            <label className="block text-sm text-zinc-300 sm:col-span-2">
              Vehicle year, make and model
              <input
                className={fieldClass}
                type="text"
                name="vehicle"
                placeholder="e.g. 2018 Honda Accord"
                value={form.vehicle}
                onChange={handleChange}
                maxLength={150}
                disabled={isSubmitting}
              />
            </label>

            <label className="block text-sm text-zinc-300 sm:col-span-2">
              What's happening with your vehicle?
              <textarea
                className={`${fieldClass} min-h-32 resize-y`}
                name="message"
                placeholder="Describe the issue, warning lights, noises, or service needed..."
                value={form.message}
                onChange={handleChange}
                maxLength={2000}
                rows={4}
                disabled={isSubmitting}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#e32636] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#c91d2c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Repair Request
                <FiArrowUpRight size={18} />
              </>
            )}
          </button>

          {status === "success" && (
            <p
              role="status"
              className="mt-4 flex items-start gap-2 text-sm leading-6 text-emerald-400"
            >
              <FiCheckCircle className="mt-1 shrink-0" />
              Your request was submitted successfully. The shop will contact
              you to discuss availability and confirm next steps.
            </p>
          )}

          {status === "error" && (
            <p
              role="alert"
              className="mt-4 text-sm leading-6 text-red-400"
            >
              {errorMessage}
            </p>
          )}

          <p className="mt-4 text-xs leading-5 text-zinc-600">
            Submitting a request does not book or confirm an appointment.
          </p>
        </form>
      </div>
    </section>
  );
}