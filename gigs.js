(function () {
  const upcoming = document.getElementById("upcoming-gigs");
  const past = document.getElementById("past-gigs");
  if (!upcoming || !past) return;

  const gigs = Array.from(upcoming.querySelectorAll(".gig"));

  // Local time, start of today
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const parseDate = (el) => {
    const d = el.getAttribute("data-date");
    const parts = (d || "").split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, day] = parts;
    if (!y || !m || !day) return null;
    return new Date(y, m - 1, day);
  };

  // Sort by date ascending
  gigs.sort((a, b) => {
    const da = parseDate(a);
    const db = parseDate(b);
    return (da?.getTime() || 0) - (db?.getTime() || 0);
  });

  // Re-append in sorted order and move past gigs
  gigs.forEach((gig) => {
    const d = parseDate(gig);
    if (!d) {
      upcoming.appendChild(gig);
      return;
    }
    if (d < now) past.appendChild(gig);
    else upcoming.appendChild(gig);
  });

  if (!past.children.length) {
    past.innerHTML = `<p style="opacity:0.8;">No past shows listed yet.</p>`;
  }
})();