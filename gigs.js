(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  monthEnd.setHours(23, 59, 59, 999);

  function parseDate(el) {
    const raw = el.getAttribute("data-date");
    if (!raw) return null;

    const [year, month, day] = raw.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  function sortGigs(gigs) {
    return gigs.sort((a, b) => parseDate(a) - parseDate(b));
  }

  function cloneGig(gig, extraClass) {
    const clone = gig.cloneNode(true);
    if (extraClass) clone.classList.add(extraClass);
    return clone;
  }

  function fillSection(containerId, gigs, emptyText, extraClass) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    if (!gigs.length) {
      container.innerHTML = `<p class="gig-empty">${emptyText}</p>`;
      return;
    }

    sortGigs(gigs).forEach(gig => {
      container.appendChild(cloneGig(gig, extraClass));
    });
  }

  const bandGroups = document.querySelectorAll(".band-group");

  bandGroups.forEach(group => {
    const gigs = Array.from(group.querySelectorAll(".gig"));
    sortGigs(gigs).forEach(gig => group.appendChild(gig));
  });

  const allGigs = Array.from(document.querySelectorAll(".band-group .gig"));

  const upcomingGigs = allGigs.filter(gig => {
    const d = parseDate(gig);
    return d && d >= today;
  });

  const thisWeekGigs = upcomingGigs.filter(gig => {
    const d = parseDate(gig);
    return d >= weekStart && d <= weekEnd;
  });

  const thisMonthGigs = upcomingGigs.filter(gig => {
    const d = parseDate(gig);
    return d >= monthStart && d <= monthEnd;
  });

  const nextGig = sortGigs([...upcomingGigs]).slice(0, 1);

  fillSection("next-gig", nextGig, "No upcoming shows currently listed.", "next-show");
  fillSection("this-week-gigs", thisWeekGigs, "No shows scheduled this week.", "this-week");
  fillSection("this-month-gigs", thisMonthGigs, "No shows scheduled this month.", "this-month");
  fillSection("all-upcoming-gigs", upcomingGigs, "No upcoming shows currently listed.", "upcoming-show");

  document.querySelectorAll(".band-group .gig").forEach(gig => {
    const d = parseDate(gig);
    if (!d) return;

    if (d >= weekStart && d <= weekEnd) {
      gig.classList.add("this-week");
    }

    if (d.getTime() === parseDate(nextGig[0] || document.createElement("div"))?.getTime()) {
      gig.classList.add("next-show");
    }
  });
})();
