(function () {
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatDateTimeICS(d) {
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      "00"
    );
  }

  function escapeICS(text) {
    return String(text || "")
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function parseGigDateTime(el) {
    const rawDate = el.getAttribute("data-date");
    const rawStart = el.getAttribute("data-start");
    const rawEnd = el.getAttribute("data-end");

    if (!rawDate) return null;

    const [year, month, day] = rawDate.split("-").map(Number);
    if (!year || !month || !day) return null;

    if (!rawStart || !rawEnd) {
      return {
        start: new Date(year, month - 1, day, 19, 0),
        end: new Date(year, month - 1, day, 23, 0)
      };
    }

    const [startHour, startMinute] = rawStart.split(":").map(Number);
    const [endHour, endMinute] = rawEnd.split(":").map(Number);

    const start = new Date(year, month - 1, day, startHour, startMinute);
    const end = new Date(year, month - 1, day, endHour, endMinute);

    if (end <= start) {
      end.setDate(end.getDate() + 1);
    }

    return { start, end };
  }

  function textFromGig(el) {
    const titleText = el.querySelector(".gig-date span")?.textContent || "Live Show";
    const details = el.querySelector("p")?.textContent || "";

    const bandMatch = details.match(/^(.*?)\s•/);
    const band = bandMatch ? bandMatch[1].trim() : "Live Show";

    const venueMatch = details.match(/•\s(.*?)\s—/);
    const venue = venueMatch ? venueMatch[1].trim() : "";

    const summary = venue ? `${band} - ${venue}` : band;

    return {
      summary,
      details: `${titleText} | ${details}`.trim()
    };
  }

  function collectGigs() {
    const nodes = Array.from(document.querySelectorAll("#gigs .band-group .gig"));

    return nodes
      .map(el => {
        const when = parseGigDateTime(el);
        if (!when) return null;

        const text = textFromGig(el);

        return {
          start: when.start,
          end: when.end,
          summary: text.summary,
          details: text.details
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.start - b.start);
  }

  function buildICS(gigs) {
    const nowUTC =
      new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Outside Sound Studios//Live Gigs//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];

    gigs.forEach((g, idx) => {
      const uid = `outside-sounds-${formatDateTimeICS(g.start)}-${idx}@outsidesoundstudios.com`;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${nowUTC}`);
      lines.push(`DTSTART:${formatDateTimeICS(g.start)}`);
      lines.push(`DTEND:${formatDateTimeICS(g.end)}`);
      lines.push(`SUMMARY:${escapeICS(g.summary)}`);
      lines.push(`DESCRIPTION:${escapeICS(g.details)}`);
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  function downloadICS(filename, content) {
    const blob = new Blob([content], {
      type: "text/calendar;charset=utf-8"
    });

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
    downloadICS("Outside_Sound_Studios_Gigs.ics", ics);
  });
})();
