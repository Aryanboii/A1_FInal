const $=s=>document.querySelector(s),ST=["New","Contacted","Site Visit","Negotiation","Won","Lost"],COL={New:"#0284c7",Contacted:"#7c3aed","Site Visit":"#d97706",Negotiation:"#db2777",Won:"#16a34a",Lost:"#64748b"};let L=[],tab="all",sel=0,VR=[];const S=new Set();
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),fd=i=>new Date(i+"Z").toLocaleString("en-IN",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit"});
const show=v=>{$("#lg").hidden=v;$("#app").hidden=!v};
async function api(u,m,b){const r=await fetch(u,{method:m||"GET",headers:{"Content-Type":"application/json"},body:b?JSON.stringify(b):undefined});if(r.status===401&&u!="/api/login"){show(0);throw 0}const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Error");return j}
const load=async()=>{L=await api("/api/leads");draw()};
const intr=l=>esc(l.type=="partner"?[l.profession,l.experience].filter(Boolean).join(" · "):l.property)||"—";
function draw(){const day=new Date().toDateString(),n=f=>L.filter(f).length;
$("#k").innerHTML=[["Total leads",L.length],["New",n(l=>l.status=="New")],["Today",n(l=>new Date(l.created_at+"Z").toDateString()==day)],["Customers",n(l=>l.type=="customer")],["Channel partners",n(l=>l.type=="partner")],["Won",n(l=>l.status=="Won")]].map(([a,b])=>`<div class="c"><small>${a}</small><h3>${b}</h3></div>`).join("");
const q=$("#q").value.toLowerCase(),s=$("#fs").value,R=L.filter(l=>(tab=="all"||l.type==tab)&&(!s||l.status==s)&&(!q||[l.name,l.phone,l.email,l.property,l.profession].join(" ").toLowerCase().includes(q)));
$("#tr").innerHTML=R.map(l=>`<tr onclick="op(${l.id})"><td onclick="event.stopPropagation()"><input type="checkbox" class="ck" value="${l.id}"${S.has(l.id)?" checked":""} style="width:auto;margin:0"></td><td><b>${esc(l.name)}</b><br><small>${esc(l.phone)}${l.email?" · "+esc(l.email):""}</small></td><td><span class="bd ${l.type}">${l.type=="partner"?"Partner":"Customer"}</span></td><td>${intr(l)}</td><td onclick="event.stopPropagation()"><select class="st" style="color:${COL[l.status]}" onchange="up(${l.id},{status:this.value})">${ST.map(x=>`<option${x==l.status?" selected":""}>${x}</option>`).join("")}</select></td><td>${esc(l.assigned)||"—"}</td><td>${l.source=="manual"?"Manual":"Website"}</td><td>${fd(l.created_at)}</td><td onclick="event.stopPropagation()"><button class="btn" style="color:#dc2626;padding:4px 10px" onclick="del(${l.id})">Delete</button></td></tr>`).join("")||'<tr><td colspan="9" class="em">No leads found</td></tr>';
VR=R.map(l=>l.id);for(const i of[...S])if(!L.some(l=>l.id==i))S.delete(i);$("#ca").checked=!!VR.length&&VR.every(i=>S.has(i));$("#bd").hidden=!S.size;$("#bd").textContent="Delete selected ("+S.size+")"}
function op(id){sel=id;const l=L.find(x=>x.id==id);if(!l)return cl();const p=String(l.phone).replace(/\D/g,"").slice(-10);
$("#dr").hidden=0;$("#dr").innerHTML=`<button class="x" onclick="cl()">×</button><h2>${esc(l.name)}</h2><span class="bd ${l.type}">${l.type=="partner"?"Channel partner":"Customer"}</span>
<div class="ac"><a class="btn p" href="tel:${p}">Call</a><a class="btn" target="_blank" href="https://wa.me/91${p}">WhatsApp</a></div>
<dl><dt>Phone</dt><dd>${esc(l.phone)}</dd><dt>Email</dt><dd>${esc(l.email)||"—"}</dd><dt>${l.type=="partner"?"Profession":"Property"}</dt><dd>${esc(l.type=="partner"?l.profession:l.property)||"—"}</dd>${l.type=="partner"?`<dt>Experience</dt><dd>${esc(l.experience)||"—"}</dd>`:""}<dt>Source</dt><dd>${l.source=="manual"?"Added manually":"Website form"}</dd><dt>Received</dt><dd>${fd(l.created_at)}</dd></dl>
${l.message?`<h4>Message</h4><pre>${esc(l.message)}</pre>`:""}<h4>Status</h4><select onchange="up(${l.id},{status:this.value})">${ST.map(x=>`<option${x==l.status?" selected":""}>${x}</option>`).join("")}</select>
<h4>Assigned to</h4><input value="${esc(l.assigned)}" placeholder="Sales team member" onchange="up(${l.id},{assigned:this.value})"><h4>Notes</h4>${l.notes?`<pre>${esc(l.notes)}</pre>`:""}<textarea id="nt" rows="3" placeholder="Add a note (call outcome, next step…)"></textarea>
<button class="btn p" onclick="up(${l.id},{note:$('#nt').value})">Add note</button> <button class="btn" style="color:#dc2626" onclick="del(${l.id})">Delete</button>`}
const cl=()=>{sel=0;$("#dr").hidden=1};
const up=async(id,b)=>{await api("/api/leads/"+id,"PATCH",b);await load();if(sel)op(sel)};
const del=async id=>{if(confirm("Delete this lead permanently?")){await api("/api/leads/"+id,"DELETE");cl();load()}};
$("#fs").innerHTML='<option value="">All statuses</option>'+ST.map(x=>`<option>${x}</option>`).join("");$("#fs").onchange=$("#q").oninput=draw;
$("#tr").onchange=e=>{if(e.target.classList.contains("ck")){const i=+e.target.value;e.target.checked?S.add(i):S.delete(i);draw()}};
$("#ca").onchange=e=>{VR.forEach(i=>e.target.checked?S.add(i):S.delete(i));draw()};
$("#bd").onclick=async()=>{if(!confirm("Permanently delete "+S.size+" selected lead(s)?"))return;await api("/api/leads/delete","POST",{ids:[...S]});if(S.has(sel))cl();S.clear();load()};
$("#tb").onclick=e=>{const t=e.target.dataset.t;if(!t)return;tab=t;document.querySelectorAll("#tb button").forEach(b=>b.classList.toggle("on",b.dataset.t==t));draw()};
$("#ad").onclick=()=>{$("#mf").reset();$("#mt").onchange();$("#me").textContent="";$("#md").hidden=0};
$("#mt").onchange=()=>{const p=$("#mt").value=="partner";document.querySelectorAll("#mf .cu").forEach(e=>e.hidden=p);document.querySelectorAll("#mf .pa").forEach(e=>e.hidden=!p)};
$("#mf").onsubmit=async e=>{e.preventDefault();try{await api("/api/leads","POST",{...Object.fromEntries(new FormData(e.target)),source:"manual"});$("#md").hidden=1;load()}catch(x){$("#me").textContent=x.message}};
$("#lf").onsubmit=async e=>{e.preventDefault();try{await api("/api/login","POST",{user:$("#u").value,pass:$("#pw").value});show(1);load()}catch(x){$("#le").textContent=x.message}};
$("#lo").onclick=async()=>{await api("/api/logout","POST");show(0)};$("#ex").onclick=()=>location.href="/api/export.csv";
api("/api/me").then(r=>{if(r.ok){show(1);load()}else show(0)});setInterval(()=>{if(!$("#app").hidden)load().catch(()=>{})},20000);
