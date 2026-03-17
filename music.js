// music.js - simple filter for the music portfolio cards
(function () {
  const grid = document.getElementById("musicGrid");
  if (!grid) return;

  const buttons = Array.from(document.querySelectorAll(".filter-btn"));
  const cards = Array.from(grid.querySelectorAll(".music-card"));

  function setActive(btn) {
    buttons.forEach(b => b.classList.toggle("active", b === btn));
  }

  function applyFilter(tag) {
    cards.forEach(card => {
      const tags = (card.getAttribute("data-tags") || "").split(/\s+/).filter(Boolean);
      const show = (tag === "all") || tags.includes(tag);
      card.classList.toggle("is-hidden", !show);
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tag = btn.getAttribute("data-filter") || "all";
      setActive(btn);
      applyFilter(tag);
    });
  });

  applyFilter("all");
})();