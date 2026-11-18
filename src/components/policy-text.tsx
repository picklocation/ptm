import { parsePolicy } from "@/lib/policy";
// Renders policy text (see parsePolicy) as headings, paragraphs and lists.
export function PolicyText({ text }: { text: string }) {
  return (
    <div className="policy-text">
      {parsePolicy(text).map((block, i) =>
        block.type === "heading" ? (
          <h2 key={i}>{block.text}</h2>
        ) : block.type === "list" ? (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{block.text}</p>
        ),
      )}
    </div>
  );
}
