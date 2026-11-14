"use client";
import { useId, useRef, useState } from "react";
import { CalendarDays, MapPin, X } from "lucide-react";

// Text input with a suggestion list that opens directly beneath it. Any text
// may still be typed; suggestions only help.
export function SuggestInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const query = value.trim().toLowerCase();
  const matches = (
    query
      ? [
          ...options.filter((o) => o.toLowerCase().startsWith(query)),
          ...options.filter(
            (o) =>
              !o.toLowerCase().startsWith(query) &&
              o.toLowerCase().includes(query),
          ),
        ].filter((o) => o.toLowerCase() !== query)
      : options
  ).slice(0, 7);
  const shown = open && matches.length > 0;
  const choose = (option: string) => {
    onChange(option);
    setOpen(false);
    setActive(-1);
  };
  return (
    <div className="field full suggest">
      <label htmlFor={id}>{label}</label>
      <div className="suggest-box">
        <MapPin size={17} aria-hidden="true" />
        <input
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={shown}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={
            shown && active >= 0 ? `${id}-option-${active}` : undefined
          }
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              if (matches.length)
                setActive(
                  (active + (e.key === "ArrowDown" ? 1 : -1) + matches.length) %
                    matches.length,
                );
            } else if (e.key === "Enter" && shown && active >= 0) {
              e.preventDefault();
              choose(matches[active]);
            } else if (e.key === "Escape") setOpen(false);
          }}
        />
        {shown && (
          <ul className="suggest-list" id={`${id}-list`} role="listbox">
            {matches.map((option, i) => (
              <li
                key={option}
                id={`${id}-option-${i}`}
                role="option"
                aria-selected={i === active}
                // Keep focus in the input so the tap is not lost to blur.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}

const readable = (value: string) =>
  new Date(value + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
// A date control that looks the same on every device. The real date input
// sits invisibly on top, so a tap opens the phone or browser's own calendar.
export function DateField({
  label,
  name,
  value,
  onChange,
  min,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  error?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="field date-field">
      <label htmlFor={id}>{label}</label>
      <div className={`date-box${value ? " has-value" : ""}`}>
        <CalendarDays size={18} aria-hidden="true" />
        <span aria-hidden="true">
          {value ? readable(value) : "Select a date"}
        </span>
        <input
          ref={input}
          id={id}
          name={name}
          type="date"
          value={value}
          min={min}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => {
            try {
              input.current?.showPicker?.();
            } catch {
              // Browsers without showPicker open their calendar on tap.
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="date-clear"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => onChange("")}
          >
            <X size={16} />
          </button>
        )}
      </div>
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
