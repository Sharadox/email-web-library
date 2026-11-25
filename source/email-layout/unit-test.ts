// @vitest-environment happy-dom
/// <reference lib="dom" />
import { expect, test } from "vitest";
import { EMAIL_COLORS, EMAIL_FONT, EMAIL_SPACES, emailLayout } from "@sharadox/email-web-library/email-layout";
import type { EmailContent, EmailDesign } from "@sharadox/email-web-library/email-layout/type";

const design: EmailDesign = {
  name: "Acme & Co",
  logo: { width: 30, height: 30 },
  wordmark: true,
  signature: [{ text: "acme.com", href: "https://acme.com" }, { text: "Lisbon" }],
};

const content: EmailContent = {
  language: "en",
  preview: "Ana sent a message",
  eyebrow: "Contact",
  heading: "Thank you, Ana <Sá>.",
  paragraphs: ["Your message has reached us.", "Feel free to reply."],
  rows: [
    { label: "Name", value: "Ana" },
    { label: "Email", value: "ana@example.com", href: "mailto:ana@example.com" },
    { label: "Needs", value: ["Website", "Hosting"] },
    { label: "Message", value: "Hello\nthere", keepLines: true },
  ],
  closing: "Best regards,",
};

const { light, dark } = EMAIL_COLORS;

/** The email as a document, to check what it shows rather than how its html is spelled. */
const render = (...given: Parameters<typeof emailLayout>) =>
  new DOMParser().parseFromString(emailLayout(...given), "text/html");

/** The innermost element whose own text is exactly `text`. */
const byText = (document: Document, text: string) =>
  [...document.body.querySelectorAll<HTMLElement>("*")].find((element) =>
    [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent === text),
  )!;

/** A detail's label and value, and the cell holding both, by its label. */
const detail = (document: Document, label: string) => {
  const labelElement = byText(document, label);
  return {
    label: labelElement,
    value: labelElement.nextElementSibling as HTMLElement,
    cell: labelElement.parentElement!,
  };
};

const color = (element: Element) => (element as HTMLElement).style.color.toUpperCase();

test("lays out everything given, escaped, in a centered column 600 pixels wide with 16 pixels around it", () => {
  const document = render(content, design, { light: true, dark: true });
  expect(document.documentElement.lang).toBe("en");
  const column = document.querySelector<HTMLElement>('table[width="600"]')!;
  expect(column.getAttribute("align")).toBe("center");
  expect(column.style.maxWidth).toBe("600px");
  expect(column.querySelector("td")!.style.padding).toBe("16px");
  expect(document.querySelector("h1")!.textContent).toBe("Thank you, Ana <Sá>.");
  expect(document.body.innerHTML).not.toContain("<Sá>");
  expect(document.body.textContent).toContain("Ana sent a message");
  const logo = document.querySelector<HTMLImageElement>('img[src="cid:logo"]')!;
  expect([logo.getAttribute("width"), logo.getAttribute("height"), logo.alt]).toEqual(["30", "30", "Acme & Co"]);
  expect(byText(document, "Acme & Co").tagName).toBe("TD");
});

test("has no background, and draws in Geist or the device's own sans", () => {
  const document = render(content, design, { light: true, dark: true });
  const backgrounds = [...document.body.querySelectorAll<HTMLElement>("*")].filter(
    (element) => element.style.backgroundColor,
  );
  expect(backgrounds).toEqual([]);
  expect(EMAIL_FONT.startsWith("Geist,")).toBe(true);
  for (const text of ["Contact", "Name", "Ana", "Your message has reached us."])
    expect(byText(document, text).closest<HTMLElement>("[style*='font-family']")!.style.fontFamily).toContain("Geist");
});

test("draws the heading, values, company's name and site strong, the labels and the rest soft", () => {
  const document = render(content, design, false);
  expect(color(document.querySelector("h1")!)).toBe(light.strong);
  expect(color(byText(document, "Contact"))).toBe(light.soft);
  expect(color(detail(document, "Name").label)).toBe(light.soft);
  expect(color(detail(document, "Name").value)).toBe(light.strong);
  expect(color(byText(document, "ana@example.com"))).toBe(light.strong);
  expect(color(byText(document, "Your message has reached us."))).toBe(light.soft);
  expect(color(byText(document, "Acme & Co"))).toBe(light.strong);
  const company = document.querySelector("b")!;
  expect([company.textContent, color(company)]).toEqual(["Acme & Co", light.strong]);
  expect(color(company.parentElement!)).toBe(light.soft);
  expect(company.parentElement!.textContent).toBe("Best regards,Acme & Co.");
  const site = document.querySelector<HTMLAnchorElement>('a[href="https://acme.com"]')!;
  expect([site.textContent, color(site)]).toEqual(["acme.com", light.strong]);
  expect(site.parentElement!.textContent).toBe("acme.com · Lisbon");
  for (const element of document.querySelectorAll(".strong, .soft"))
    expect([light.strong, light.soft]).toContain(color(element));
});

test("shows a list a dot per line, keeps a message's line breaks, and draws lines only between details", () => {
  const document = render(content, design, false);
  expect(detail(document, "Needs").value.innerHTML).toBe("•&nbsp;Website<br>•&nbsp;Hosting");
  const message = detail(document, "Message").value;
  expect([message.textContent, message.style.whiteSpace]).toEqual(["Hello\nthere", "pre-wrap"]);
  const cells = ["Name", "Email", "Needs", "Message"].map((label) => detail(document, label).cell);
  expect(cells[0]!.style.borderTop).toBe("");
  for (const cell of cells.slice(1)) expect(cell.style.borderTop.toUpperCase()).toBe(`1PX SOLID ${light.line}`);
  expect(document.body.innerHTML).not.toContain("border-left");
});

test("uses only the spaces 4, 8, 16 and 32", () => {
  const document = render(content, design, { light: true, dark: true });
  const spaces = new Set<number>();
  for (const element of document.body.querySelectorAll<HTMLElement>("*"))
    for (const side of ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"] as const) {
      const value = Number.parseInt(element.style[side] || "0", 10);
      if (value) spaces.add(value);
    }
  expect(spaces.size).toBeGreaterThan(1);
  expect([...spaces].every((space) => (Object.values(EMAIL_SPACES) as number[]).includes(space))).toBe(true);
});

test("turns white and light gray in a dark theme, where the mail app honors it, Outlook.com included", () => {
  const document = render(content, design, { light: true, dark: true });
  expect(document.querySelector('meta[name="color-scheme"]')!.getAttribute("content")).toBe("light dark");
  const rules = document.querySelector("style")!.textContent!;
  expect(rules).toContain(`@media (prefers-color-scheme:dark){.strong{color:${dark.strong}!important}`);
  expect(rules).toContain(`.soft{color:${dark.soft}!important}`);
  expect(rules).toContain(`.line{border-color:${dark.line}!important}`);
  expect(rules).toContain(`[data-ogsc] .strong{color:${dark.strong}!important}`);
  expect(rules).toContain(".logo-light{display:none!important}.logo-dark{display:block!important");
  const darkLogo = document.querySelector<HTMLElement>(".logo-dark")!;
  expect(darkLogo.style.display).toBe("none");
  expect(darkLogo.querySelector("img")!.getAttribute("src")).toBe("cid:logo-dark");
});

test("without a logo it writes the name; a logo it doesn't carry isn't drawn; without wordmark it stands alone", () => {
  const plain = render({ language: "pt", preview: "P", eyebrow: "E", heading: "H" }, { name: "Plain" }, true);
  expect(plain.querySelector("img")).toBeNull();
  expect(byText(plain, "Plain").tagName).toBe("TD");
  expect(plain.querySelector("p")).toBeNull();
  expect(plain.querySelector(".line")).toBeNull();
  expect(byText(render(content, { ...design, wordmark: false }, false), "Acme & Co")).toBeTruthy();
  const alone = render(content, { ...design, wordmark: false }, true);
  expect(alone.querySelector('img[src="cid:logo"]')).not.toBeNull();
  expect(alone.querySelector('img[src="cid:logo-dark"]')).toBeNull();
  // The name is only in the sign-off then, not beside the logo.
  expect(byText(alone, "Acme & Co").tagName).toBe("B");
});

test("signs off right after the heading when there are no details, and leaves out what isn't given", () => {
  const document = render({ ...content, rows: [], paragraphs: [] }, design, false);
  expect(byText(document, "Best regards,").closest("td")!.style.paddingTop).toBe("32px");
  expect(render({ ...content, closing: undefined }, design, false).body.textContent).not.toContain("Best regards");
  expect(render(content, { ...design, signature: [] }, false).body.textContent).not.toContain("acme.com");
});

test("shows a one-time code as one box per character, each outlined in the line color, under its label", () => {
  const document = render({ ...content, rows: [], code: { label: "Code", value: "123456" } }, design, {
    light: false,
    dark: false,
  });
  const boxes = [...document.querySelectorAll<HTMLElement>("td.code-box")];
  expect(boxes.map(({ textContent }) => textContent)).toEqual(["1", "2", "3", "4", "5", "6"]);
  for (const box of boxes) {
    expect(box.classList.contains("line")).toBe(true);
    expect(box.style.border.toUpperCase()).toContain(light.line);
    expect(color(box)).toBe(light.strong);
    expect(box.style.fontFamily).toContain("monospace");
  }
  const label = byText(document, "Code");
  expect(label.compareDocumentPosition(boxes[0]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(document.body.textContent).not.toContain("123 456");
  // A screen reader reads the whole code at once, not six cells.
  const group = boxes[0]!.closest<HTMLElement>("[role=img]")!;
  expect(group.getAttribute("aria-label")).toBe("Code: 1 2 3 4 5 6");
  expect(boxes[0]!.closest("[aria-hidden]")).toBeNull();
});

test("leaves the code out when none is given", () => {
  expect(render(content, design, { light: false, dark: false }).querySelector("td.code-box")).toBeNull();
});
