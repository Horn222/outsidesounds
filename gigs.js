(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  function parseDate(el) {
    const raw = el.getAttribute("data-date");
    if (!raw) return null;
    const parts = raw.split("-").map(Number);
    if (parts.length !== 3) return null;
    const [y, m, d] = parts;
    return new Date(y, m - 1, d);
  }

  function sortContainer(container) {
    const gigs = Array.from(container.querySelectorAll(".gig"));
    gigs.sort((a, b) => parseDate(a) - parseDate(b));
    gigs.forEach(gig => container.appendChild(gig));
  }

  const bandGroups = document.querySelectorAll(".band-group");
  bandGroups.forEach(sortContainer);

  const thisWeekWrap = document.getElementById("this-week-gigs");
  if (thisWeekWrap) {
    const allGigs = Array.from(document.querySelectorAll(".band-group .gig"));
    const weekGigs = allGigs.filter(gig => {
      const d = parseDate(gig);
      return d && d >= weekStart && d <= weekEnd;
    });

    if (weekGigs.length) {
      thisWeekWrap.innerHTML = "";
      weekGigs
        .sort((a, b) => parseDate(a) - parseDate(b))
        .forEach(gig => {
          const clone = gig.cloneNode(true);
          clone.classList.add("this-week");
          thisWeekWrap.appendChild(clone);
        });
    }
  }

  document.querySelectorAll(".gig").forEach(gig => {
    const d = parseDate(gig);
    if (!d) return;
    if (d >= weekStart && d <= weekEnd) {
      gig.classList.add("this-week");
    }
  });
})();
