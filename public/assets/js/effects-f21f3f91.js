// Real-estate motion: scroll progress (house rides the bar), parallax icons, curtain reveals, blueprint drawing, count-up numbers
(function () {
  const root = document.documentElement, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("fx-on");
  const icons = [...document.querySelectorAll(".fx svg[data-s]")]; let queued = false;
  function frame() {
    queued = false;
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
    if (reduce) return;
    icons.forEach(el => {
      const r = el.closest(".fx").parentElement.getBoundingClientRect(), c = r.top + r.height / 2 - innerHeight / 2, s = +el.dataset.s;
      el.style.transform = "translate3d(0," + (c * s).toFixed(1) + "px,0) rotate(" + (c * s * .06).toFixed(1) + "deg)";
    });
  }
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", frame); frame();
  const nums = [...document.querySelectorAll("[data-c]")];
  nums.forEach(el => { el.dataset.to = el.dataset.c; if (!reduce) el.textContent = (0).toFixed(+el.dataset.d || 0); });
  function count(el) {
    const to = +el.dataset.to, d = +el.dataset.d || 0; if (reduce) return; let t0;
    const step = t => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(d); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if (!("IntersectionObserver" in window)) { nums.forEach(el => el.textContent = (+el.dataset.to).toFixed(+el.dataset.d || 0)); document.querySelectorAll(".art,.bp,.stair").forEach(e => e.classList.add("on")); return; }
  const io = new IntersectionObserver(list => list.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("on"); if (e.target.dataset.to !== undefined) count(e.target); io.unobserve(e.target);
  }), { threshold: .25 });
  document.querySelectorAll(".art,.bp,.stair").forEach(el => io.observe(el)); nums.forEach(el => io.observe(el));
})();

// Scroll-built house, giant marquee words, magnetic spheres and 3D tilt cards
(function () {
  const root = document.documentElement, bd = document.getElementById("build"), mq = document.querySelector(".mq");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (bd && !reduce) root.classList.add("js-t");
  let q = false;
  function frame() {
    q = false;
    if (bd && !reduce) {
      const r = bd.getBoundingClientRect(), span = r.height - innerHeight;
      const t = Math.max(0, Math.min(1, -r.top / span));
      bd.style.setProperty("--t", t.toFixed(4));
      bd.dataset.step = t < .2 ? 1 : t < .45 ? 2 : t < .8 ? 3 : 4;
    }
    if (mq && !reduce) mq.style.setProperty("--mx", (scrollY * .55).toFixed(0));
  }
  addEventListener("scroll", () => { if (!q) { q = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener("resize", frame); frame();
  if (reduce || !matchMedia("(pointer: fine)").matches) return;
  const hero = document.querySelector(".hero"), sph = [...document.querySelectorAll(".sph")];
  if (hero) hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    sph.forEach(s => { const m = +s.dataset.m; s.style.translate = (x * m * 3).toFixed(1) + "px " + (y * m * 3).toFixed(1) + "px"; });
  });
  document.querySelectorAll(".acard,.team-card,.stats>div,.price").forEach(el => {
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = "perspective(900px) rotateX(" + (-y * 8).toFixed(1) + "deg) rotateY(" + (x * 10).toFixed(1) + "deg) translateY(-4px)";
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });
})();
