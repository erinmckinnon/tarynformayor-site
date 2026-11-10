const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// Event times are stored as Tampa local time ("2026-09-19T10:00"), so parse them without time zones.
function parts(s) {
  const m = String(s || "").match(/(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = "00", mi = "00"] = m;
  const dow = new Date(Date.UTC(+y, +mo - 1, +d)).getUTCDay();
  return { y: +y, mo: +mo, d: +d, h: +h, mi: +mi, dow };
}
function clock(p) {
  const h12 = ((p.h + 11) % 12) + 1;
  return `${h12}:${String(p.mi).padStart(2, "0")} ${p.h < 12 ? "AM" : "PM"}`;
}
function nowTampa() {
  const f = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  return f.format(new Date()).replace(" ", "T");
}

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/uploads": "uploads", "src/css": "css", "src/js": "js", "src/admin": "admin", "src/_redirects": "_redirects", "src/robots.txt": "robots.txt" });
  eleventyConfig.addWatchTarget("src/css");

  const toDate = (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v || ""));
  eleventyConfig.addCollection("news", (api) =>
    api.getFilteredByGlob("src/news/*.md").filter((p) => !p.data.draft).sort((a, b) => toDate(b.data.date).localeCompare(toDate(a.data.date)))
  );
  eleventyConfig.addCollection("events", (api) =>
    api.getFilteredByGlob("src/events/*.md").filter((p) => !p.data.draft).sort((a, b) => String(a.data.start).localeCompare(String(b.data.start)))
  );

  eleventyConfig.addFilter("upcoming", (events) => {
    const now = nowTampa();
    return events.filter((e) => String(e.data.end || e.data.start).slice(0, 16) >= now.slice(0, 10));
  });
  eleventyConfig.addFilter("past", (events) => {
    const now = nowTampa();
    return events.filter((e) => String(e.data.end || e.data.start).slice(0, 16) < now.slice(0, 10)).reverse();
  });
  eleventyConfig.addFilter("notCategory", (items, cat) => items.filter((e) => e.data.category !== cat));
  eleventyConfig.addFilter("inCategory", (items, cat) => items.filter((e) => e.data.category === cat));
  eleventyConfig.addFilter("longDate", (v) => { const p = parts(toDate(v)); return p ? `${MONTHS[p.mo - 1]} ${p.d}, ${p.y}` : ""; });
  eleventyConfig.addFilter("eventDay", (v) => { const p = parts(v); return p ? `${DAYS[p.dow]}, ${MONTHS[p.mo - 1]} ${p.d}, ${p.y}` : ""; });
  eleventyConfig.addFilter("eventMonth", (v) => { const p = parts(v); return p ? MONTHS[p.mo - 1].slice(0, 3) : ""; });
  eleventyConfig.addFilter("eventDate", (v) => { const p = parts(v); return p ? p.d : ""; });
  eleventyConfig.addFilter("eventTime", (start, end) => {
    const a = parts(start); if (!a) return "";
    const b = parts(end);
    return b && (b.h || b.mi) && (b.h !== a.h || b.mi !== a.mi) ? `${clock(a)} – ${clock(b)}` : clock(a);
  });
  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("isoDay", (v) => String(v || "").slice(0, 10));
  eleventyConfig.addFilter("youtubeId", (v) => { const m = String(v || "").match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); return m ? m[1] : String(v || "").trim(); });
  eleventyConfig.addFilter("slugify2", (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());

  return { dir: { input: "src", output: "_site", includes: "_includes", data: "_data" }, markdownTemplateEngine: false, htmlTemplateEngine: "njk" };
}
