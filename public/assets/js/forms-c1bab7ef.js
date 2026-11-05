(function(){const eq=document.getElementById("eq"),f=eq.querySelector("form"),fl=f.querySelector(".fl"),ok=f.querySelector(".ok"),el=f.elements,M={};let T="customer";
["dehradun","aero","aditya","vinayak","ahilya","khatu","ghaziabad"].forEach(id=>{const h=document.querySelector("#"+id+" h2");if(h)M[id]=h.textContent.replace(/\s+/g," ").trim()});
el.property.innerHTML='<option value="">Select a property</option>'+Object.entries(M).flatMap(([k,v])=>k=="aditya"?["Aditya (any project)","Aditya · City Apartments","Aditya · City Grace","Aditya · Luxuria Estate","Aditya · Urban Homes","Aditya · Rosemont Residency"]:[v]).map(v=>"<option>"+v+"</option>").join("")+"<option>Not sure — suggest me</option>";
function open(m,sec,nm,prop){T=m;f.reset();fl.hidden=false;ok.hidden=true;f.querySelector(".er").textContent="";
eq.querySelectorAll(".cu").forEach(e=>e.hidden=m!="customer");eq.querySelectorAll(".pa").forEach(e=>e.hidden=m!="partner");
fl.querySelector("h3").textContent=m=="partner"?"Become a Channel Partner":"Enquire about a property";
fl.querySelector("p").textContent=m=="partner"?"Share a few details and our team will get in touch about the programme.":"Tell us a little — our sales team will call you shortly.";
if(M[sec])el.property.value=sec=="aditya"?"Aditya (any project)":M[sec];if(nm){const q=nm.toLowerCase(),o=[...el.property.options].find(o=>o.value&&(q.includes(o.text.toLowerCase())||o.text.toLowerCase().includes(q)));if(o)el.property.value=o.value}if(prop)el.property.value=prop;document.getElementById("mn").classList.remove("o");eq.classList.add("on");setTimeout(()=>el.name.focus(),50)}
const close=()=>eq.classList.remove("on");
document.addEventListener("click",e=>{const b=e.target.closest("button.btn,button.cta,button.a,button.b");
if(b&&!b.closest("figure,.mg,#eq")){e.preventDefault();e.stopPropagation();const s=b.closest("section[id]"),rw=b.closest(".cmp .r");open(/partner/i.test(b.textContent)||(s&&s.id=="partner")?"partner":"customer",s&&s.id,rw&&rw.querySelector("b").textContent,b.dataset.prop)}
else if(e.target===eq||e.target.closest("#eq .cl"))close()},true);
document.addEventListener("keydown",e=>e.key=="Escape"&&close());
f.onsubmit=async e=>{e.preventDefault();const er=f.querySelector(".er"),s=f.querySelector("[type=submit]");er.textContent="";
if(!el.name.value.trim()||el.phone.value.replace(/\D/g,"").length<10){er.textContent="Please enter your name and a valid 10-digit phone number.";return}
s.disabled=true;s.textContent="Sending…";
const payload={...Object.fromEntries(new FormData(f)),type:T};try{const r=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}),j=await r.json().catch(()=>({}));
if(!r.ok)throw new Error(j.error||"Could not send");try{localStorage.setItem("a1q",JSON.stringify(JSON.parse(localStorage.getItem("a1q")||"[]").filter(p=>p.phone!=payload.phone)))}catch{}fl.hidden=true;ok.hidden=false;setTimeout(close,4500)}
catch(x){const net=x.message=="Failed to fetch"||/Server error/.test(x.message);if(net){try{const q=JSON.parse(localStorage.getItem("a1q")||"[]");q.push(payload);localStorage.setItem("a1q",JSON.stringify(q))}catch{}}er.textContent=net?"Sorry, we couldn't submit your enquiry right now. Please try again in a moment.":x.message}
s.disabled=false;s.textContent="Submit"};
addEventListener("load",()=>{try{const q=JSON.parse(localStorage.getItem("a1q")||"[]");if(!q.length)return;localStorage.removeItem("a1q");q.forEach(p=>fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)}).then(r=>{if(!r.ok)throw 0}).catch(()=>{const r=JSON.parse(localStorage.getItem("a1q")||"[]");r.push(p);localStorage.setItem("a1q",JSON.stringify(r))}))}catch{}})})();
