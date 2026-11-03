(function(){const P=[...document.querySelectorAll("section.pj")],bar=document.querySelector(".ptabs");if(!P.length||!bar)return;
bar.innerHTML=P.map(s=>'<button role="tab" data-p="'+s.id+'">'+s.querySelector("h2").textContent.replace(/\s+/g," ").trim()+"</button>").join("");
function show(id,go){const t=P.find(s=>s.id==id)||P[0];P.forEach(s=>s.hidden=s!==t);bar.querySelectorAll("button").forEach(b=>{const on=b.dataset.p==t.id;b.classList.toggle("on",on);b.setAttribute("aria-selected",on)});
const a=bar.querySelector(".on");if(a)bar.scrollTo({left:a.offsetLeft-(bar.clientWidth-a.offsetWidth)/2,behavior:go?"smooth":"auto"});if(go)document.getElementById("projects").scrollIntoView({behavior:"smooth"})}
bar.onclick=e=>{const b=e.target.closest("button");if(b){show(b.dataset.p,true);try{history.replaceState(null,"","#"+b.dataset.p)}catch{}}};
document.querySelectorAll(".cmp .r b").forEach((b,i)=>b.onclick=()=>P[i]&&show(P[i].id,true));
const h=location.hash.slice(1);show(P.some(s=>s.id==h)?h:P[0].id,false);if(P.some(s=>s.id==h))setTimeout(()=>document.getElementById("projects").scrollIntoView(),50)})();
