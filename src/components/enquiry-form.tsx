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
type Props = {
  itemId: string;
  itemTitle: string;
  destination: string;
  kind: string;
  whatsappEnabled: boolean;
};
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
    contactMethod: "phone",
    consent: false,
    website: "",
  });
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
  function advance() {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (d.destination.trim().length < 2)
        errs.destination = "Tell us a destination or enter “Help me choose”.";
      if (!d.flexible && !d.startDate)
        errs.startDate = "Choose a date or select flexible dates.";
      if (d.startDate && d.endDate && d.endDate < d.startDate)
        errs.endDate = "End date must follow your start date.";
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
            [
              "destination",
              "startDate",
              "endDate",
              "adults",
              "children",
              "departure",
            ].includes(key),
          )
        )
          setStep(0);
        else if (
          keys.some((key) =>
            [
              "budget",
              "currency",
              "preferences",
              "rooms",
              "vehicle",
              "mealPlan",
            ].includes(key),
          )
        )
          setStep(1);
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
  if (result)
    return (
      <div className="enquiry-form success-panel" role="status">
        <div className="success-icon">
          <Check size={30} />
        </div>
        <h2>
          Your next chapter
          <br />
          starts here.
        </h2>
        <p>Your enquiry has been saved. Keep this reference:</p>
        <strong>{result.id}</strong>
        <p>
          The team can now review your travel ideas. This is an enquiry, not a
          confirmed booking.
        </p>
        {result.method === "whatsapp" && result.whatsappUrl && (
          <>
            <a
              className="button"
              href={result.whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
              Continue on WhatsApp
            </a>
            <p className="small-note">
              Your summary is ready. Tap Send in WhatsApp to send it. Your
              enquiry is already saved even if you don’t send a message.
            </p>
          </>
        )}
        {result.method === "whatsapp" && !result.whatsappUrl && (
          <p>
            WhatsApp is not configured yet. Your enquiry is safely saved for the
            team.
          </p>
        )}
        <Link href="/holidays" className="text-link">
          Keep exploring
          <ArrowRight size={17} />
        </Link>
      </div>
    );
  return (
    <form
      className="enquiry-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 2) advance();
        else submit("submit");
      }}
      noValidate
    >
      <div className="steps" aria-label={`Step ${step + 1} of 3`}>
        {["Your trip", "The details", "Let’s connect"].map((s, i) => (
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
        {
          [
            "Where are we taking you?",
            "Make it feel like you.",
            "A little hello goes a long way.",
          ][step]
        }
      </h2>
      <p className="form-subtitle">
        {
          [
            "Nothing needs to be set in stone. A little inspiration is enough.",
            "Share what matters. You can leave optional details for later.",
            "Your enquiry goes straight to our team.",
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
            {field("destination", "Where would you like to go?", "text", true)}
            <label className="field full">
              Your kind of trip
              <select
                value={d.kind}
                onChange={(e) => change("kind", e.target.value)}
              >
                <option value="holiday">Customised holiday</option>
                <option value="road-trip">Europe road trip</option>
                <option value="resort">Kerala resort stay</option>
              </select>
            </label>
            {field("startDate", "Preferred start date", "date")}
            {field("endDate", "End date (optional)", "date")}
            <label className="checkbox field full">
              <input
                type="checkbox"
                checked={d.flexible}
                onChange={(e) => change("flexible", e.target.checked)}
              />
              My dates are flexible / not decided yet
            </label>
            {field("adults", "Adults", "number")}
            {field("children", "Children", "number")}
            {d.children > 0 &&
              field("childAges", "Children’s ages (optional)", "text", true)}
            {field("departure", "Departure city (optional)", "text", true)}
          </>
        )}
        {step === 1 && (
          <>
            {field("budget", "Budget (optional)", "text")}
            <label className="field">
              Currency
              <select
                value={d.currency}
                onChange={(e) => change("currency", e.target.value)}
              >
                {["INR", "EUR", "USD", "GBP", "AED"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field full">
              Budget is
              <select
                value={d.budgetBasis}
                onChange={(e) => change("budgetBasis", e.target.value)}
              >
                <option value="total">For the whole group</option>
                <option value="per person">Per person</option>
              </select>
            </label>
            {d.kind === "road-trip" &&
              field(
                "vehicle",
                "Vehicle, luggage & preferred stops (optional)",
                "text",
                true,
              )}
            {d.kind === "resort" && (
              <>
                {field("rooms", "Rooms", "number")}
                {field("mealPlan", "Meal plan preference (optional)")}
              </>
            )}
            <label className="field full">
              What would make this trip special? (optional)
              <textarea
                value={d.preferences}
                onChange={(e) => change("preferences", e.target.value)}
                placeholder="A honeymoon, a family adventure, a slower pace, a particular stay…"
                rows={5}
              />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            {field("name", "Your name", "text", true)}
            {field("phone", "Phone / WhatsApp with country code", "tel", true)}
            {field("email", "Email (optional unless preferred)", "email", true)}
            <label className="field full">
              How should we get in touch?
              <select
                value={d.contactMethod}
                onChange={(e) => change("contactMethod", e.target.value)}
              >
                <option value="phone">Phone</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
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
                {d.budget && (
                  <div>
                    <dt>Budget</dt>
                    <dd>
                      {d.currency} {d.budget} · {d.budgetBasis}
                    </dd>
                  </div>
                )}
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
        {step < 2 ? (
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
      {step === 2 && (
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
