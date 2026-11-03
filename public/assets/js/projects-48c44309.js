(function () {
  // Project quick-links: every project stays visible, the buttons only scroll to the section.
  const P = [...document.querySelectorAll("section.pj")], bar = document.querySelector(".ptabs");
  if (!P.length || !bar) return;
  bar.innerHTML = P.map(s => '<button role="tab" data-p="' + s.id + '">' + s.querySelector("h2").textContent.replace(/\s+/g, " ").trim() + "</button>").join("");
  function go(id) {
    const t = document.getElementById(id); if (!t) return;
    t.scrollIntoView({ behavior: "smooth" });
    try { history.replaceState(null, "", "#" + id); } catch {}
  }
  bar.onclick = e => { const b = e.target.closest("button"); if (b) go(b.dataset.p); };
  document.querySelectorAll(".cmp .r b").forEach((b, i) => b.onclick = () => P[i] && go(P[i].id));
})();
