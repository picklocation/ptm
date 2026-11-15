"use client";
import { useState, useRef } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  MessageCircle,
  Send,
} from "lucide-react";
import Link from "next/link";
import { SuggestInput, DateField } from "./form-controls";
type Props = {
  itemId: string;
  itemTitle: string;
  destination: string;
  kind: string;
  whatsappEnabled: boolean;
  preferWhatsApp?: boolean;
  // Place names from the published catalogue, offered as suggestions.
  places?: string[];
  popular?: string[];
};
const tripKinds = [
  ["holiday", "Holiday"],
  ["road-trip", "Europe road trip"],
  ["resort", "Resort or stay"],
] as const;
export function EnquiryForm(p: Props) {
  const [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [result, setResult] = useState<{
      id: string;
      whatsappUrl: string | null;
      method: string;
    } | null>(null);
  const start = useRef(Date.now()),
    requestId = useRef(""),
    heading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const [d, setD] = useState({
    name: "",
    email: "",
    phone: "",
    destination: p.destination,
    kind: p.kind || "holiday",
    startDate: "",
    endDate: "",
    flexible: true,
    adults: 2,
    children: 0,
    childAges: "",
    rooms: 1,
    departure: "",
    budget: "",
    currency: "INR",
    budgetBasis: "total",
    preferences: "",
    vehicle: "",
    mealPlan: "",
    contactMethod: p.preferWhatsApp ? "whatsapp" : "phone",
    consent: false,
    website: "",
  });
  const today = new Date().toISOString().slice(0, 10);
  function change(key: string, value: unknown) {
    setD((old) => ({ ...old, [key]: value }));
    setErrors((old) => ({ ...old, [key]: "" }));
  }
  function field(
    key: keyof typeof d,
    label: string,
    type = "text",
    full = false,
  ) {
    return (
      <label className={`field ${full ? "full" : ""}`} key={key}>
        {label}
        <input
          name={key}
          type={type}
          value={String(d[key])}
          onChange={(e) =>
            change(
              key,
              type === "number" ? Number(e.target.value) : e.target.value,
            )
          }
          min={
            type === "number"
              ? key === "children"
                ? 0
                : 1
              : type === "date"
                ? new Date().toISOString().slice(0, 10)
                : undefined
          }
          max={type === "number" ? 100 : undefined}
          autoComplete={
            key === "name"
              ? "name"
              : key === "email"
                ? "email"
                : key === "phone"
                  ? "tel"
                  : undefined
          }
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `${key}-error` : undefined}
        />
        {errors[key] && (
          <span className="field-error" id={`${key}-error`}>
            {errors[key]}
          </span>
        )}
      </label>
    );
  }
  function stepper(key: "adults" | "children" | "rooms", label: string) {
    const min = key === "children" ? 0 : 1;
    const value = Number(d[key]) || min;
    return (
      <div className="field" role="group" aria-label={label} key={key}>
        {label}
        <div className="stepper">
          <button
            type="button"
            aria-label={`Fewer ${label.toLowerCase()}`}
            disabled={value <= min}
            onClick={() => change(key, Math.max(min, value - 1))}
          >
            −
          </button>
          <output aria-live="polite">{value}</output>
          <button
            type="button"
            aria-label={`More ${label.toLowerCase()}`}
            disabled={value >= 30}
            onClick={() => change(key, Math.min(30, value + 1))}
          >
            +
          </button>
        </div>
      </div>
    );
  }
  function advance() {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (d.destination.trim().length < 2)
        errs.destination = "Tell us a destination or enter “Help me choose”.";
      if (!d.flexible && !d.startDate)
        errs.startDate = "Choose a date or select flexible dates.";
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      setError("Please check your trip details.");
      setTimeout(() => errorSummary.current?.focus(), 0);
      return;
    }
    setStep(step + 1);
    setError("");
    setTimeout(() => heading.current?.focus(), 0);
  }
  async function submit(method: "submit" | "whatsapp") {
    const errs: Record<string, string> = {};
    if (d.name.trim().length < 2) errs.name = "Please enter your name.";
    if (!/^\+?[\d\s()-]{7,25}$/.test(d.phone.trim()))
      errs.phone = "Enter a valid phone number with country code.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim()))
      errs.email = "Enter a valid email address.";
    if (!d.consent)
      errs.consent = "Please confirm before sending your enquiry.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      setError("Please check your details.");
      setTimeout(() => errorSummary.current?.focus(), 0);
      return;
    }
    setBusy(true);
    setError("");
    setErrors({});
    if (!requestId.current) requestId.current = crypto.randomUUID();
    try {
      const r = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...d,
          name: d.name.trim(),
          phone: d.phone.trim(),
          email: d.email.trim(),
          contactMethod: method === "whatsapp" ? "whatsapp" : d.contactMethod,
          itemId: p.itemId,
          requestId: requestId.current,
          startedAt: start.current,
          method,
        }),
      });
      const json = await r.json();
      if (!r.ok) {
        setErrors(json.fields || {});
        const keys = Object.keys(json.fields || {});
        if (
          keys.some((key) =>
            ["destination", "startDate", "adults", "children"].includes(key),
          )
        )
          setStep(0);
        throw new Error(
          json.error || "Your enquiry could not be saved. Please retry.",
        );
      }
      setResult({ ...json, method });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Please retry. Your form details are still here.",
      );
      setTimeout(() => errorSummary.current?.focus(), 0);
    } finally {
      setBusy(false);
    }
  }
  if (result) {
    const firstName = d.name.trim().split(/\s+/)[0];
    const travellers = `${d.adults} ${d.adults === 1 ? "adult" : "adults"}${
      d.children
        ? `, ${d.children} ${d.children === 1 ? "child" : "children"}`
        : ""
    }`;
    const viaWhatsApp = result.method === "whatsapp" && !!result.whatsappUrl;
    return (
      <div className="enquiry-form success-panel" role="status">
        <div className="success-icon">
          <Check size={30} />
        </div>
        <h2>Thank you{firstName ? `, ${firstName}` : ""}.</h2>
        <p className="success-lead">
          We’ve received your enquiry
          {d.destination ? ` for ${d.destination}` : ""}. Our team will be in
          touch to plan it with you.
        </p>
        <dl className="success-summary">
          {p.itemTitle && (
            <div>
              <dt>Package</dt>
              <dd>{p.itemTitle}</dd>
            </div>
          )}
          <div>
            <dt>Destination</dt>
            <dd>{d.destination}</dd>
          </div>
          <div>
            <dt>Travellers</dt>
            <dd>{travellers}</dd>
          </div>
          <div>
            <dt>Dates</dt>
            <dd>
              {d.startDate
                ? new Date(d.startDate + "T00:00:00").toLocaleDateString(
                    "en-GB",
                    { day: "numeric", month: "short", year: "numeric" },
                  )
                : "Flexible"}
              {d.startDate && d.flexible ? " · flexible" : ""}
            </dd>
          </div>
        </dl>
        <ol className="success-steps">
          <li>
            <strong>We read your request</strong>A travel planner looks at where
            you want to go and who is travelling.
          </li>
          <li>
            <strong>We get in touch</strong>
            We call or message you on {d.phone.trim()} or write to{" "}
            {d.email.trim()}.
          </li>
          <li>
            <strong>You receive a personal quote</strong>
            Nothing is booked or charged until you confirm it.
          </li>
        </ol>
        <div className="success-actions">
          {viaWhatsApp && (
            <a
              className="button"
              href={result.whatsappUrl!}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              Continue on WhatsApp
            </a>
          )}
          <Link
            href="/holidays"
            className={viaWhatsApp ? "button secondary" : "button"}
          >
            Keep exploring
            <ArrowRight size={17} />
          </Link>
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
        {viaWhatsApp && (
          <p className="small-note">
            Your message is ready in WhatsApp; tap Send there. Your enquiry is
            already saved even if you don’t send it.
          </p>
        )}
        {result.method === "whatsapp" && !result.whatsappUrl && (
          <p className="small-note">
            WhatsApp isn’t available right now, but your enquiry is safely saved
            and the team will contact you.
          </p>
        )}
      </div>
    );
  }
  return (
    <form
      className="enquiry-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 1) advance();
        else submit("submit");
      }}
      noValidate
    >
      <div className="steps" aria-label={`Step ${step + 1} of 2`}>
        {["Your trip", "Your details"].map((s, i) => (
          <span className={i <= step ? "active" : ""} key={s}>
            <b>{i < step ? <Check size={13} /> : i + 1}</b>
            {s}
          </span>
        ))}
      </div>
      {p.itemTitle && (
        <div className="notice">
          Enquiring about: <strong>{p.itemTitle}</strong>
        </div>
      )}
      <h2 ref={heading} tabIndex={-1} className="form-title">
        {["Where are we taking you?", "A little hello goes a long way."][step]}
      </h2>
      <p className="form-subtitle">
        {
          [
            "Nothing needs to be set in stone. A little inspiration is enough.",
            "Three details and you’re done. Your enquiry goes straight to our team.",
          ][step]
        }
      </p>
      {error && (
        <div
          className="error-box"
          role="alert"
          ref={errorSummary}
          tabIndex={-1}
        >
          {error}
          {Object.entries(errors).filter(([, v]) => v).length > 0 && (
            <ul>
              {Object.entries(errors)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <li key={k}>{v}</li>
                ))}
            </ul>
          )}
        </div>
      )}
      <div className="form-grid">
        {step === 0 && (
          <>
            <SuggestInput
              label="Where would you like to go?"
              name="destination"
              value={d.destination}
              onChange={(value) => change("destination", value)}
              options={p.places || []}
              placeholder="Type a place, e.g. Munnar"
              error={errors.destination}
            />
            <div className="field full">
              <span className="field-hint">Or tap a popular choice</span>
              <div className="quick-picks">
                {[...(p.popular || []), "Help me choose"].map((place) => (
                  <button
                    type="button"
                    key={place}
                    aria-pressed={d.destination === place}
                    onClick={() => change("destination", place)}
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>
            <div className="field full" role="group" aria-label="Kind of trip">
              Your kind of trip
              <div className="pill-group">
                {tripKinds.map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={d.kind === value}
                    onClick={() => change("kind", value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <DateField
              label="Preferred start date"
              name="startDate"
              value={d.startDate}
              min={today}
              error={errors.startDate}
              onChange={(value) => {
                change("startDate", value);
                // An end date before the new start date no longer makes sense.
                if (value && d.endDate && d.endDate < value)
                  change("endDate", "");
              }}
            />
            <label className="checkbox field full">
              <input
                type="checkbox"
                checked={d.flexible}
                onChange={(e) => change("flexible", e.target.checked)}
              />
              My dates are flexible / not decided yet
            </label>
            {stepper("adults", "Adults")}
            {stepper("children", "Children")}
          </>
        )}
        {step === 1 && (
          <>
            {field("name", "Your name", "text", true)}
            {field("phone", "Phone / WhatsApp with country code", "tel", true)}
            {field("email", "Email", "email", true)}
            <div className="field full">
              <dl className="review-list">
                <div>
                  <dt>Destination</dt>
                  <dd>{d.destination}</dd>
                </div>
                <div>
                  <dt>Travellers</dt>
                  <dd>
                    {d.adults} adults
                    {d.children ? `, ${d.children} children` : ""}
                  </dd>
                </div>
                <div>
                  <dt>Dates</dt>
                  <dd>
                    {d.startDate || "To be decided"}
                    {d.flexible ? " · flexible" : ""}
                  </dd>
                </div>
              </dl>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={d.consent}
                  onChange={(e) => change("consent", e.target.checked)}
                />
                <span>
                  I agree to be contacted about this enquiry and have read the{" "}
                  <Link href="/privacy" target="_blank" className="underline">
                    privacy information
                  </Link>
                  .
                </span>
              </label>
              {errors.consent && (
                <span className="field-error">
                  Please confirm before sending your enquiry.
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <label className="honey" aria-hidden="true">
        Leave this empty
        <input
          tabIndex={-1}
          autoComplete="off"
          value={d.website}
          onChange={(e) => change("website", e.target.value)}
        />
      </label>
      <div className="form-actions">
        {step > 0 && (
          <button
            type="button"
            className="button secondary"
            disabled={busy}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        )}
        {step < 1 ? (
          <button className="button">
            Continue
            <ArrowRight size={17} />
          </button>
        ) : (
          <div className="submit-actions" style={{ flex: 3 }}>
            <button className="button" disabled={busy}>
              <Send size={16} />
              {busy ? "Saving your enquiry…" : "Submit enquiry"}
            </button>
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => submit("whatsapp")}
            >
              <MessageCircle size={17} />
              Submit & continue on WhatsApp
            </button>
          </div>
        )}
      </div>
      {step === 1 && (
        <p className="form-fineprint">
          Both options save your enquiry securely.{" "}
          {p.whatsappEnabled
            ? "You send the prepared message in WhatsApp."
            : "WhatsApp will be available when the business number is configured."}
        </p>
      )}
    </form>
  );
}
