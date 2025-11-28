type Attrs = Record<string, string | null>;

function attrsToString(attrs: Attrs): string {
  return Object.entries(attrs)
    .map(([key, value]) =>
      value === null || value === "" ? key : `${key}="${value}"`
    )
    .join(" ");
}

interface Section {
  text: string;
  attributes: Attrs;
}

export function makeChatSectionsDynamic(sections: { [key: string]: Section }): string {
  return `
    <div id="root" class="container" data-role="chat-root" aria-live="polite">
      ${Object.entries(sections)
        .map(
          ([key, { text, attributes }]) =>
            `<div data-section="${key}" ${attrsToString(attributes)}>${text}</div>`
        )
        .join("\n")}
    </div>
  `;
}