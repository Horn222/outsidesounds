(function () {
  const upcoming = document.getElementById("upcoming-gigs");
  const past = document.getElementById("past-gigs");
  if (!upcoming || !past) return;

  const gigs = Array.from(upcoming.querySelectorAll(".gig"));

  // Start of today in LOCAL time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function parseDate(el) {
    const d = el.getAttribute("data-date");
    const parts = (d || "").split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, day] = parts;
    if (!y || !m || !day) return null;
    return new Date(y, m - 1, day);
  }

  const upcomingGigs = [];
  const pastGigs = [];

  gigs.forEach((gig) => {
    const d = parseDate(gig);

    // If date is broken, keep it in upcoming so it doesn't disappear
    if (!d) {
      upcomingGigs.push({ gig, d: null });
      return;
    }

    // IMPORTANT: today stays upcoming
    if (d < today) pastGigs.push({ gig, d });
    else upcomingGigs.push({ gig, d });
  });

  // Sort upcoming ascending (null dates last)
  upcomingGigs.sort((a, b) => {
    if (!a.d && !b.d) return 0;
    if (!a.d) return 1;
    if (!b.d) return -1;
    return a.d.getTime() - b.d.getTime();
  });

  // Sort past descending (most recent first)
  pastGigs.sort((a, b) => b.d.getTime() - a.d.getTime());

  // Re-render
  upcomingGigs.forEach(({ gig }) => upcoming.appendChild(gig));
  pastGigs.forEach(({ gig }) => past.appendChild(gig));

  if (!past.children.length) {
    past.innerHTML = `<p style="opacity:0.8;">No past shows listed yet.</p>`;
  }
})();