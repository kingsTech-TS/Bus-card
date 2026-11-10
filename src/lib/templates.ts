import type { DesignElement, DesignSchema, Template } from "@/types";
import { DEFAULT_BLEED } from "./editor";

/**
 * Built-in template library. Designs use the same 1050×600 (3.5"×2" @ 300 DPI)
 * coordinate space and element schema as the editor and the backend.
 */

const W = 1050;
const H = 600;

type El = Omit<DesignElement, "id">;

interface TextOpts {
  font?: string;
  fill?: string;
  weight?: "normal" | "bold" | "italic" | "italic bold";
  align?: "left" | "center" | "right";
  width?: number;
  rotation?: number;
  opacity?: number;
}

function text(content: string, x: number, y: number, fontSize: number, o: TextOpts = {}): El {
  return {
    type: "text",
    content,
    x,
    y,
    fontSize,
    fontFamily: o.font ?? "Inter",
    fill: o.fill ?? "#111827",
    fontWeight: o.weight ?? "normal",
    textAlign: o.align ?? "left",
    width: o.width ?? 600,
    rotation: o.rotation ?? 0,
    opacity: o.opacity ?? 1,
  } as El;
}

/** Text centred horizontally on the card. */
function center(content: string, y: number, fontSize: number, o: TextOpts = {}): El {
  const width = o.width ?? 900;
  return text(content, (W - width) / 2, y, fontSize, { ...o, width, align: "center" });
}

function shape(shapeType: string, x: number, y: number, width: number, height: number, fill: string, o: { opacity?: number; rotation?: number } = {}): El {
  return { type: "shape", shapeType, x, y, width, height, fill, opacity: o.opacity ?? 1, rotation: o.rotation ?? 0 } as El;
}

const rect = (x: number, y: number, w: number, h: number, fill: string, o?: { opacity?: number; rotation?: number }) => shape("rect", x, y, w, h, fill, o);
const circle = (x: number, y: number, size: number, fill: string, o?: { opacity?: number }) => shape("circle", x, y, size, size, fill, o);

function qr(value: string, x: number, y: number, size: number, fill = "#000000"): El {
  return { type: "qr", value, data: "", x, y, width: size, height: size, fill } as El;
}

function design(slug: string, background: string, elements: El[]): DesignSchema {
  return {
    width: W,
    height: H,
    dpi: 300,
    background,
    bleed_area: DEFAULT_BLEED,
    elements: elements.map((el, i) => ({ ...el, id: `${slug}-${i}`, zIndex: i, isVisible: true, isLocked: false }) as DesignElement),
  };
}

function template(slug: string, title: string, category: string, tags: string[], background: string, elements: El[]): Template {
  return { id: `builtin-${slug}`, title, category, tags, source: "builtin", design: design(slug, background, elements) };
}

export const BUILTIN_TEMPLATES: Template[] = [
  // ── Corporate ──────────────────────────────────────────────────────────────
  template("classic-corporate", "Classic Corporate", "Corporate", ["navy", "professional", "sales"], "#ffffff", [
    rect(0, 0, 28, H, "#1e3a8a"),
    text("Jordan Ellis", 90, 130, 64, { font: "Montserrat", weight: "bold", fill: "#0f172a" }),
    text("Senior Account Manager", 90, 215, 30, { fill: "#475569" }),
    rect(90, 285, 90, 6, "#1e3a8a"),
    text("+1 (555) 214-7788", 90, 340, 24, { fill: "#334155" }),
    text("jordan@northwind.co", 90, 382, 24, { fill: "#334155" }),
    text("northwind.co", 90, 424, 24, { fill: "#334155" }),
    text("NORTHWIND", 620, 480, 32, { font: "Montserrat", weight: "bold", fill: "#1e3a8a", align: "right", width: 360 }),
  ]),
  template("consultant-split", "Consultant Split", "Corporate", ["teal", "two-tone", "consulting"], "#ffffff", [
    rect(525, 0, 525, H, "#0f766e"),
    text("Sofia Ramirez", 70, 200, 54, { font: "Poppins", weight: "bold", fill: "#0f172a", width: 440 }),
    text("Management Consultant", 70, 275, 28, { fill: "#0f766e", width: 440 }),
    rect(70, 335, 70, 5, "#0f766e"),
    text("Phone", 590, 150, 20, { fill: "#99f6e4", weight: "bold" }),
    text("+1 (312) 555-0187", 590, 178, 26, { fill: "#ffffff", width: 400 }),
    text("Email", 590, 250, 20, { fill: "#99f6e4", weight: "bold" }),
    text("sofia@clearpath.co", 590, 278, 26, { fill: "#ffffff", width: 400 }),
    text("Web", 590, 350, 20, { fill: "#99f6e4", weight: "bold" }),
    text("clearpath.co", 590, 378, 26, { fill: "#ffffff", width: 400 }),
  ]),
  template("legal-trust", "Legal Trust", "Corporate", ["law", "attorney", "gold", "dark"], "#1c1917", [
    rect(60, 60, 930, 3, "#c8a24a"),
    rect(60, 537, 930, 3, "#c8a24a"),
    center("HALE & PARTNERS LLP", 110, 24, { font: "Georgia", fill: "#c8a24a", weight: "bold" }),
    center("Catherine Hale, Esq.", 220, 58, { font: "Georgia", fill: "#fafaf9" }),
    center("Attorney at Law · Corporate Litigation", 300, 26, { font: "Georgia", fill: "#d6d3d1", weight: "italic" }),
    center("(212) 555-0146   ·   c.hale@halepartners.com", 430, 22, { fill: "#a8a29e" }),
  ]),
  template("architect-lines", "Architect Lines", "Corporate", ["architecture", "lines", "clean"], "#fafafa", [
    rect(80, 80, 890, 2, "#171717"),
    rect(80, 518, 890, 2, "#171717"),
    rect(80, 80, 2, 440, "#171717"),
    text("Hugo Lindqvist", 130, 170, 56, { font: "Montserrat", fill: "#171717" }),
    text("ARCHITECT, RIBA", 130, 250, 24, { font: "Montserrat", fill: "#737373", weight: "bold" }),
    text("+46 8 555 019 22\nhugo@lindqvist.studio\nlindqvist.studio", 560, 360, 22, { fill: "#262626", align: "right", width: 380 }),
  ]),

  // ── Minimalist ─────────────────────────────────────────────────────────────
  template("minimal-white", "Minimal White", "Minimalist", ["simple", "clean", "designer"], "#ffffff", [
    text("Mia Chen", 90, 90, 58, { weight: "bold", fill: "#111111" }),
    text("Product Designer", 90, 168, 28, { fill: "#6b7280" }),
    circle(900, 90, 60, "#111827"),
    text("mia@chen.design", 90, 420, 22, { fill: "#111111" }),
    text("+1 (646) 555-0123", 90, 458, 22, { fill: "#111111" }),
    text("chen.design", 90, 496, 22, { fill: "#111111" }),
  ]),
  template("swiss-red", "Swiss Red", "Minimalist", ["swiss", "monogram", "red"], "#f5f5f4", [
    rect(650, 0, 400, H, "#dc2626"),
    text("LW", 650, 200, 170, { font: "Oswald", weight: "bold", fill: "#ffffff", width: 400, align: "center" }),
    text("Lukas Weber", 70, 150, 54, { font: "Oswald", weight: "bold", fill: "#1c1917", width: 540 }),
    text("Graphic Designer", 70, 225, 28, { fill: "#57534e", width: 540 }),
    text("lukas@weber.ch\n+41 44 555 01 23\nweber.ch", 70, 380, 22, { fill: "#1c1917", width: 540 }),
  ]),
  template("noir-centered", "Noir Centered", "Minimalist", ["black", "centered", "writer"], "#000000", [
    center("JAMES CARTER", 220, 60, { font: "Montserrat", weight: "bold", fill: "#ffffff" }),
    center("Copywriter & Brand Voice", 305, 26, { fill: "#a3a3a3" }),
    center("jamescarter.co", 480, 22, { fill: "#737373" }),
  ]),
  template("soft-sand", "Soft Sand", "Minimalist", ["beige", "calm", "neutral"], "#f3ede4", [
    rect(80, 300, 890, 2, "#a8a29e"),
    text("Noah Bennett", 80, 170, 54, { font: "Lora", fill: "#44403c" }),
    text("Ceramic Artist", 80, 240, 26, { font: "Lora", weight: "italic", fill: "#78716c" }),
    text("noah@clayhouse.studio", 80, 350, 22, { fill: "#57534e" }),
    text("@clayhouse.studio", 80, 390, 22, { fill: "#57534e" }),
    text("Portland, OR", 600, 350, 22, { fill: "#57534e", align: "right", width: 370 }),
  ]),

  // ── Tech ───────────────────────────────────────────────────────────────────
  template("tech-orbit", "Tech Orbit", "Tech", ["dark", "developer", "gradient"], "#0f172a", [
    circle(760, -140, 440, "#6366f1", { opacity: 0.9 }),
    circle(880, 330, 300, "#22d3ee", { opacity: 0.7 }),
    text("Priya Natarajan", 80, 170, 58, { font: "Poppins", weight: "bold", fill: "#ffffff", width: 640 }),
    text("Full-Stack Engineer", 80, 250, 28, { fill: "#a5b4fc" }),
    text("priya@devstack.io", 80, 380, 22, { fill: "#cbd5e1" }),
    text("github.com/priyan", 80, 418, 22, { fill: "#cbd5e1" }),
    text("+1 (415) 555-0199", 80, 456, 22, { fill: "#cbd5e1" }),
  ]),
  template("terminal", "Terminal", "Tech", ["code", "devops", "green", "qr"], "#111827", [
    text("> whoami", 80, 90, 26, { font: "Courier New", fill: "#6b7280" }),
    text("sam_okafor", 80, 135, 60, { font: "Courier New", weight: "bold", fill: "#22c55e" }),
    text("// DevOps Engineer", 80, 220, 26, { font: "Courier New", fill: "#9ca3af" }),
    text("$ mail sam@cloudops.dev\n$ call +1 206 555 0102\n$ open cloudops.dev", 80, 360, 22, { font: "Courier New", fill: "#d1d5db", width: 620 }),
    qr("https://cloudops.dev", 810, 350, 170, "#14532d"),
  ]),
  template("startup-violet", "Startup Violet", "Tech", ["startup", "founder", "purple"], "#ffffff", [
    rect(0, 0, 350, H, "#7c3aed"),
    shape("star", 125, 180, 100, 100, "#ffffff"),
    text("NovaLabs", 0, 320, 36, { font: "Poppins", weight: "bold", fill: "#ffffff", width: 350, align: "center" }),
    text("Ethan Brooks", 420, 170, 50, { font: "Poppins", weight: "bold", fill: "#1f2937", width: 580 }),
    text("Co-founder & CEO", 420, 240, 28, { fill: "#7c3aed" }),
    text("ethan@novalabs.ai", 420, 360, 22, { fill: "#4b5563" }),
    text("+1 (650) 555-0177", 420, 398, 22, { fill: "#4b5563" }),
    text("novalabs.ai", 420, 436, 22, { fill: "#4b5563" }),
  ]),
  template("data-bars", "Data Bars", "Tech", ["data", "analytics", "chart"], "#0b1120", [
    rect(720, 400, 50, 110, "#0ea5e9", { opacity: 0.5 }),
    rect(790, 330, 50, 180, "#0ea5e9", { opacity: 0.65 }),
    rect(860, 250, 50, 260, "#0ea5e9", { opacity: 0.8 }),
    rect(930, 160, 50, 350, "#38bdf8"),
    text("Dr. Wei Zhang", 80, 140, 54, { font: "Roboto", weight: "bold", fill: "#f8fafc" }),
    text("Data Scientist · ML Lead", 80, 215, 28, { fill: "#38bdf8" }),
    text("wei.zhang@insightful.ai\n+1 (617) 555-0164\ninsightful.ai", 80, 370, 22, { fill: "#94a3b8" }),
  ]),

  // ── Creative ───────────────────────────────────────────────────────────────
  template("creative-pop", "Creative Pop", "Creative", ["colorful", "playful", "artist"], "#fde047", [
    circle(760, 70, 230, "#ec4899"),
    shape("triangle", 880, 360, 170, 170, "#3b82f6", { rotation: 12 }),
    shape("star", 640, 380, 130, 130, "#f97316"),
    text("Ruby Alvarez", 80, 160, 64, { font: "Poppins", weight: "bold", fill: "#111827", width: 560 }),
    text("Illustrator & Muralist", 80, 245, 28, { fill: "#111827" }),
    text("hi@rubyalvarez.art\n@ruby.paints", 80, 390, 24, { fill: "#111827", width: 500 }),
  ]),
  template("studio-mono", "Studio Mono", "Creative", ["photography", "dark", "big type"], "#18181b", [
    rect(80, 100, 70, 8, "#f43f5e"),
    text("OTTO", 72, 120, 190, { font: "Oswald", weight: "bold", fill: "#fafafa", width: 700 }),
    text("Otto Brandt — Photographer", 80, 360, 28, { fill: "#a1a1aa", width: 700 }),
    text("otto@brandt.photo   ·   +49 30 5550 1234", 80, 470, 22, { fill: "#d4d4d8", width: 900 }),
  ]),
  template("pastel-play", "Pastel Play", "Creative", ["pastel", "teacher", "kids"], "#ede9fe", [
    circle(-60, 420, 260, "#c4b5fd"),
    circle(820, -60, 280, "#fbcfe8"),
    circle(900, 420, 140, "#a7f3d0"),
    shape("star", 150, 70, 70, 70, "#fcd34d"),
    center("Ms. Hannah Lee", 210, 58, { font: "Poppins", weight: "bold", fill: "#4c1d95" }),
    center("Art Teacher · Little Painters Club", 290, 26, { fill: "#6d28d9" }),
    center("hannah@littlepainters.org  ·  (408) 555-0110", 410, 22, { fill: "#5b21b6" }),
  ]),

  // ── Elegant & Luxury ───────────────────────────────────────────────────────
  template("midnight-executive", "Midnight Executive", "Luxury", ["gold", "dark", "finance"], "#0b0f19", [
    rect(475, 268, 100, 3, "#d4af37"),
    center("Alexander Grant", 170, 68, { font: "Playfair Display", fill: "#f8fafc" }),
    center("MANAGING PARTNER", 295, 24, { fill: "#d4af37", weight: "bold" }),
    center("+44 20 7946 0958   ·   a.grant@grantcapital.com", 420, 22, { fill: "#cbd5e1" }),
    center("GRANT CAPITAL", 475, 20, { fill: "#d4af37", weight: "bold" }),
  ]),
  template("black-marble", "Black & Gold", "Luxury", ["jewelry", "gold", "monogram"], "#111111", [
    shape("diamond", 475, 80, 100, 100, "#d4af37"),
    center("V", 98, 52, { font: "Playfair Display", weight: "bold", fill: "#111111", width: 100 }),
    center("Valentina Rossi", 230, 60, { font: "Playfair Display", weight: "italic", fill: "#f5f5f4" }),
    center("Fine Jewelry Atelier", 310, 26, { font: "Lora", fill: "#d4af37" }),
    center("Via Montenapoleone 8, Milano  ·  +39 02 5550 1847", 440, 21, { fill: "#a8a29e" }),
  ]),
  template("elegant-serif", "Elegant Serif", "Elegant", ["serif", "interior", "cream"], "#faf7f2", [
    shape("diamond", 510, 265, 30, 30, "#a16207"),
    rect(330, 279, 160, 2, "#a16207"),
    rect(560, 279, 160, 2, "#a16207"),
    center("Isabella Moreau", 160, 62, { font: "Playfair Display", weight: "italic", fill: "#3f3f46" }),
    center("Interior Designer", 320, 26, { font: "Lora", fill: "#a16207" }),
    center("isabella@moreau-interiors.fr   ·   +33 1 55 50 12 34", 440, 22, { font: "Lora", fill: "#52525b" }),
  ]),
  template("rose-boutique", "Rose Boutique", "Elegant", ["pink", "florist", "wedding"], "#fce7f3", [
    circle(-110, -110, 400, "#fbcfe8"),
    circle(840, 380, 340, "#f9a8d4"),
    center("Bloom & Co.", 190, 66, { font: "Playfair Display", weight: "bold", fill: "#9d174d" }),
    center("Florist · Events · Weddings", 285, 26, { fill: "#be185d" }),
    center("hello@bloomandco.com  ·  (305) 555-0133", 400, 22, { fill: "#831843" }),
  ]),

  // ── Bold ───────────────────────────────────────────────────────────────────
  template("bold-statement", "Bold Statement", "Bold", ["yellow", "strategist", "high contrast"], "#111827", [
    rect(0, 0, 380, H, "#facc15"),
    text("HELLO, I'M", 60, 170, 28, { weight: "bold", fill: "#111827", width: 300 }),
    text("Nadia Ross", 60, 210, 64, { font: "Oswald", weight: "bold", fill: "#111827", width: 300 }),
    text("Brand Strategist", 440, 180, 38, { font: "Oswald", weight: "bold", fill: "#facc15", width: 560 }),
    text("nadia@rossbrands.com\n+1 (718) 555-0151\nrossbrands.com", 440, 290, 24, { fill: "#e5e7eb", width: 560 }),
  ]),
  template("fitness-energy", "Fitness Energy", "Bold", ["gym", "trainer", "red"], "#dc2626", [
    shape("triangle", 640, 120, 520, 520, "#111111", { rotation: -8 }),
    text("COACH DRE", 70, 150, 80, { font: "Oswald", weight: "bold", fill: "#ffffff", width: 620 }),
    text("Personal Trainer · Strength & HIIT", 70, 260, 26, { fill: "#fee2e2", width: 620 }),
    text("Book a session:\n(702) 555-0190\n@coachdre.fit", 70, 370, 24, { weight: "bold", fill: "#ffffff", width: 520 }),
  ]),

  // ── Industry ───────────────────────────────────────────────────────────────
  template("real-estate-pro", "Real Estate Pro", "Real Estate", ["realtor", "green", "qr"], "#ffffff", [
    rect(0, 0, W, 170, "#065f46"),
    text("HOMESTEAD REALTY", 80, 62, 36, { font: "Montserrat", weight: "bold", fill: "#ffffff", width: 800 }),
    text("Marcus Bell", 80, 220, 52, { font: "Montserrat", weight: "bold", fill: "#064e3b" }),
    text("Licensed Realtor®", 80, 290, 26, { fill: "#6b7280" }),
    text("(480) 555-0128\nmarcus@homesteadrealty.com", 80, 380, 22, { fill: "#374151" }),
    qr("https://homesteadrealty.com/marcus", 810, 320, 180, "#065f46"),
  ]),
  template("health-clinic", "Health Clinic", "Healthcare", ["doctor", "medical", "blue"], "#f0f9ff", [
    rect(0, 520, W, 80, "#0284c7"),
    rect(880, 90, 44, 140, "#0284c7"),
    rect(832, 138, 140, 44, "#0284c7"),
    text("Dr. Amara Okoye", 80, 130, 54, { font: "Poppins", weight: "bold", fill: "#0c4a6e" }),
    text("Family Physician, MD", 80, 205, 26, { fill: "#0369a1" }),
    text("(503) 555-0175\nappointments@riversideclinic.org", 80, 300, 22, { fill: "#334155" }),
    text("Riverside Family Clinic", 80, 543, 26, { weight: "bold", fill: "#ffffff" }),
  ]),
  template("daily-grind", "Daily Grind Café", "Food & Drink", ["coffee", "cafe", "warm"], "#3f2a1d", [
    shape("hexagon", 495, 80, 60, 60, "#fbbf24"),
    center("The Daily Grind", 165, 66, { font: "Playfair Display", weight: "bold", fill: "#fef3c7" }),
    center("Specialty Coffee & Pastries", 260, 26, { fill: "#fbbf24" }),
    center("12 Market St, Portland  ·  (503) 555-0142", 390, 22, { fill: "#fde68a" }),
    center("Open daily 7am – 6pm", 430, 22, { fill: "#fde68a" }),
  ]),
  template("green-leaf", "Green Leaf", "Wellness", ["eco", "landscaping", "nature"], "#f0fdf4", [
    shape("hexagon", 800, 60, 160, 160, "#86efac"),
    shape("hexagon", 880, 200, 110, 110, "#22c55e"),
    shape("hexagon", 760, 230, 80, 80, "#15803d"),
    text("GreenLeaf Landscaping", 80, 160, 46, { font: "Montserrat", weight: "bold", fill: "#14532d", width: 640 }),
    text("Oliver Grant · Owner", 80, 230, 26, { fill: "#15803d" }),
    text("(919) 555-0106\noliver@greenleaf.land\ngreenleaf.land", 80, 360, 22, { fill: "#166534" }),
  ]),
  template("serene-yoga", "Serene Yoga", "Wellness", ["yoga", "calm", "teal"], "#ecfeff", [
    circle(425, 60, 200, "#a5f3fc", { opacity: 0.8 }),
    circle(475, 110, 100, "#0891b2", { opacity: 0.85 }),
    center("Leah Kim", 300, 56, { font: "Lora", fill: "#164e63" }),
    center("Yoga & Mindfulness Instructor", 375, 26, { font: "Lora", weight: "italic", fill: "#0e7490" }),
    center("leah@serenespace.yoga  ·  @serenespace", 470, 22, { fill: "#155e75" }),
  ]),
];

export const TEMPLATE_CATEGORIES = Array.from(new Set(BUILTIN_TEMPLATES.map((t) => t.category!)));
