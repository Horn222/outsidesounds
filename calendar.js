// calendar.js - generate .ics calendar from gigs listed on the page
(function () {
  function pad(n) { return String(n).padStart(2, "0"); }

  function formatDateICS(d) {
    // All-day format: YYYYMMDD
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  }

  function escapeICS(text) {
    return String(text || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function parseGigDate(el) {
    const raw = el.getAttribute("data-date");
    if (!raw) return null;
    const parts = raw.split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, day] = parts;
    if (!y || !m || !day) return null;
    return new Date(y, m - 1, day); // local date
  }

  function textFromGig(el) {
    // Summary line: prefer the date label span, then fallback to text
    const label = el.querySelector(".gig-date span");
    const p = el.querySelector("p");
    const title = (label?.textContent || "Jon Fett Quartet Show").trim();
    const details = (p?.textContent || "").trim();
    return { title, details };
  }

  function collectGigs() {
    // Collect gigs from both upcoming and past lists (after gigs.js may have moved them)
    const nodes = Array.from(document.querySelectorAll("#gigs .gig"));
    return nodes
      .map(el => {
        const d = parseGigDate(el);
        if (!d) return null;
        const { title, details } = textFromGig(el);
        return { d, title, details };
      })
      .filter(Boolean)
      .sort((a, b) => a.d.getTime() - b.d.getTime());
  }

  function buildICS(gigs) {
    const nowUTC = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Outside Sounds//JFQ Gigs//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    gigs.forEach((g, idx) => {
      // All-day event; DTEND is next day
      const dtStart = formatDateICS(g.d);
      const next = new Date(g.d);
      next.setDate(next.getDate() + 1);
      const dtEnd = formatDateICS(next);

      const uid = `jfq-${dtStart}-${idx}@outsidesounds`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowUTC}`);
      lines.push(`DTSTART;VALUE=DATE:${dtStart}`);
      lines.push(`DTEND;VALUE=DATE:${dtEnd}`);
      lines.push(`SUMMARY:${escapeICS(g.title)}`);
      if (g.details) lines.push(`DESCRIPTION:${escapeICS(g.details)}`);
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function downloadICS(filename, content) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const btn = document.getElementById("download-ics");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const gigs = collectGigs();
    if (!gigs.length) {
      alert("No gigs found to export yet.");
      return;
    }
    const ics = buildICS(gigs);
    downloadICS("JFQ_Gigs.ics", ics);
  });
})();