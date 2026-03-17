(function () {
  const upcoming = document.getElementById("upcoming-gigs");
  const past = document.getElementById("past-gigs");
  if (!upcoming || !past) return;

  const gigs = Array.from(document.querySelectorAll("#upcoming-gigs .gig, #past-gigs .gig"));

  // Start of today in LOCAL time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function parseDate(el) {
    const d = el.getAttribute("data-date");
    const parts = (d || "").split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, day] = parts;
    if (!y || !m || !day) return null;

    const parsed = new Date(y, m - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const upcomingGigs = [];
  const pastGigs = [];

  gigs.forEach((gig) => {
    const d = parseDate(gig);

    if (!d) {
      upcomingGigs.push({ gig, d: null });
      return;
    }

    if (d < today) pastGigs.push({ gig, d });
    else upcomingGigs.push({ gig, d });
  });

  upcomingGigs.sort((a, b) => {
    if (!a.d && !b.d) return 0;
    if (!a.d) return 1;
    if (!b.d) return -1;
    return a.d.getTime() - b.d.getTime();
  });

  pastGigs.sort((a, b) => b.d.getTime() - a.d.getTime());

  upcoming.querySelectorAll(".gig").forEach((el) => el.remove());
  past.querySelectorAll(".gig").forEach((el) => el.remove());

  upcomingGigs.forEach(({ gig }) => upcoming.appendChild(gig));
  pastGigs.forEach(({ gig }) => past.appendChild(gig));

  let emptyMsg = past.querySelector(".past-empty-message");

  if (!pastGigs.length) {
    if (!emptyMsg) {
      emptyMsg = document.createElement("p");
      emptyMsg.className = "past-empty-message";
      emptyMsg.style.opacity = "0.8";
      emptyMsg.textContent = "No past shows listed yet.";
      past.appendChild(emptyMsg);
    }
  } else if (emptyMsg) {
    emptyMsg.remove();
  }
})();
