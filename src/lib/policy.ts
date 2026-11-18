// Minimal markup for policy pages, so the text can be written (and edited in
// admin) as plain text: "# Heading" lines, "- " bullet lines, and paragraphs
// separated by blank lines. Everything is rendered as plain text nodes.
export type PolicyBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parsePolicy(text: string): PolicyBlock[] {
  const blocks: PolicyBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (paragraph.length)
      blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    if (list.length) blocks.push({ type: "list", items: list });
    paragraph = [];
    list = [];
  };
  for (const raw of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) flush();
    else if (/^#{1,3}\s+/.test(line)) {
      flush();
      blocks.push({ type: "heading", text: line.replace(/^#{1,3}\s+/, "") });
    } else if (/^[-•]\s+/.test(line)) {
      if (paragraph.length) flush();
      list.push(line.replace(/^[-•]\s+/, ""));
    } else {
      if (list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  return blocks;
}
