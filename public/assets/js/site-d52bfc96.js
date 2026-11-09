document.querySelectorAll("[data-c]").forEach(e=>e.textContent=Number(e.dataset.c).toFixed(Number(e.dataset.d||0)));
const ov=document.getElementById("ov"),oc=document.getElementById("oc"),ot=document.getElementById("ot");
function show(h,t){oc.innerHTML=h;ot.textContent=t;ov.style.display="flex"}
function hide(){ov.style.display="none";oc.innerHTML=""}
document.getElementById("ox").onclick=hide;ov.onclick=e=>{if(e.target===ov)hide()};
document.querySelectorAll(".vt").forEach(b=>b.onclick=()=>show('<video src="'+b.dataset.v+'" controls autoplay playsinline style="max-width:100%;max-height:84vh;border-radius:14px;background:#000"></video>',b.querySelector("b").textContent));
document.querySelectorAll(".mg figure button,.dt").forEach(b=>b.onclick=()=>show('<img src="'+b.querySelector("img").src+'" style="max-width:100%;max-height:84vh;border-radius:14px">',(b.querySelector("b")||b.parentElement.querySelector("figcaption")).textContent));
document.addEventListener("keydown",e=>e.key==="Escape"&&hide());

// Mobile menu: the Menu button opens / closes the full-screen menu
(function () {
  const mb = document.getElementById("mb"), mn = document.getElementById("mn");
  if (!mb || !mn) return;
  const set = open => {
    mn.classList.toggle("o", open);
    mb.setAttribute("aria-expanded", open);
    mb.textContent = open ? "Close" : "Menu";
  };
  mb.onclick = () => set(!mn.classList.contains("o"));
  mn.querySelectorAll("a").forEach(a => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", e => e.key === "Escape" && set(false));
})();
