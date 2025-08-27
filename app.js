// ---------- Util ----------
function $(id){return document.getElementById(id);}

// ---------- Categorias ----------
function getCategories(scope){
  return JSON.parse(localStorage.getItem("cats_"+scope)) || {"Geral":["Padrão"]};
}
function saveCategories(scope, cats){
  localStorage.setItem("cats_"+scope, JSON.stringify(cats));
}
function uiAddCategory(scope){
  let name = $(scope+"-new-category").value.trim();
  if(!name) return;
  let cats = getCategories(scope);
  if(!cats[name]) cats[name]=[];
  saveCategories(scope,cats);
  populateCategories(scope);
}
function uiAddSubcategory(scope){
  let name = $(scope+"-new-subcategory").value.trim();
  if(!name) return;
  let cats = getCategories(scope);
  let catSel = $(scope+"-category").value;
  if(!cats[catSel]) cats[catSel]=[];
  if(!cats[catSel].includes(name)) cats[catSel].push(name);
  saveCategories(scope,cats);
  populateCategories(scope);
}
function populateCategories(scope){
  let cats = getCategories(scope);
  let catSel = $(scope+"-category"), subSel = $(scope+"-subcategory");
  catSel.innerHTML=""; subSel.innerHTML="";
  Object.keys(cats).forEach(c=>{
    let opt=document.createElement("option"); opt.value=c; opt.textContent=c; catSel.appendChild(opt);
  });
  let firstCat = catSel.value;
  cats[firstCat].forEach(s=>{
    let opt=document.createElement("option"); opt.value=s; opt.textContent=s; subSel.appendChild(opt);
  });
}

// ---------- Finanças ----------
function getEntries(){return JSON.parse(localStorage.getItem("entries"))||[];}
function saveEntries(arr){localStorage.setItem("entries",JSON.stringify(arr));}
function addFinance(){
  let arr=getEntries();
  arr.push({
    date:$("fin-date").value,
    amount:parseFloat($("fin-amount").value)||0,
    type:$("fin-type").value,
    category:$("fin-category").value,
    subcategory:$("fin-subcategory").value
  });
  saveEntries(arr); renderFinance(); generateReports();
}
function renderFinance(){
  let arr=getEntries();
  $("finance-list").innerHTML=arr.map(e=>`<div>${e.date} - ${e.type} - ${e.amount} (${e.category}/${e.subcategory})</div>`).join("");
}
function generateReports(){
  const arr=getEntries(); const now=new Date(); let d=0,w=0,m=0;
  arr.forEach(e=>{
    let ed=new Date(e.date);
    if(ed.toDateString()==now.toDateString()) d+=e.type=="income"?e.amount:-e.amount;
    let sw=new Date(now); sw.setDate(now.getDate()-now.getDay()); let ew=new Date(sw); ew.setDate(sw.getDate()+6);
    if(ed>=sw && ed<=ew) w+=e.type=="income"?e.amount:-e.amount;
    if(ed.getMonth()==now.getMonth()&&ed.getFullYear()==now.getFullYear()) m+=e.type=="income"?e.amount:-e.amount;
  });
  $("daily-summary").innerText="Resumo diário: "+d.toFixed(2);
  $("weekly-summary").innerText="Resumo semanal: "+w.toFixed(2);
  $("monthly-summary").innerText="Resumo mensal: "+m.toFixed(2);
  $("daily-summary-r").innerText="Diário: "+d.toFixed(2);
  $("weekly-summary-r").innerText="Semanal: "+w.toFixed(2);
  $("monthly-summary-r").innerText="Mensal: "+m.toFixed(2);
}

// ---------- Corridas ----------
function getRuns(){return JSON.parse(localStorage.getItem("runs"))||[];}
function saveRuns(arr){localStorage.setItem("runs",JSON.stringify(arr));}
function addRun(){
  let arr=getRuns();
  arr.push({
    date:$("run-date").value,
    earnings:parseFloat($("run-earnings").value)||0,
    km:parseFloat($("run-km").value)||0,
    gas:parseFloat($("run-gas").value)||0,
    oil:parseFloat($("run-oil").value)||0,
    brakes:parseFloat($("run-brakes").value)||0,
    maintenance:parseFloat($("run-maintenance").value)||0,
    category:$("run-category").value,
    subcategory:$("run-subcategory").value
  });
  saveRuns(arr); renderRunsChart(); generateRunReports();
}
function backupRuns(){
  const data=getRuns(); const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="backup_corridas.json"; a.click();
}
function restoreRuns(ev){
  const f=ev.target.files[0]; if(!f) return; const r=new FileReader();
  r.onload=e=>{saveRuns(JSON.parse(e.target.result)); renderRunsChart(); generateRunReports();}; r.readAsText(f);
}
let runsChart;
function renderRunsChart(){
  let arr=getRuns(); let gas=0,oil=0,br=0,man=0;
  arr.forEach(r=>{gas+=r.gas; oil+=r.oil; br+=r.brakes; man+=r.maintenance;});
  const ctx=$("runsChart").getContext("2d"); if(runsChart) runsChart.destroy();
  runsChart=new Chart(ctx,{type:"pie",data:{labels:["Gasolina","Óleo","Freios","Manutenção"],
    datasets:[{data:[gas,oil,br,man],backgroundColor:["#f66","#6cf","#fc6","#6f6"]}]}});
}
function generateRunReports(){
  let arr=getRuns(); const now=new Date(); let d=0,w=0,m=0;
  arr.forEach(r=>{
    let rd=new Date(r.date);
    if(rd.toDateString()==now.toDateString()) d+=r.earnings;
    let sw=new Date(now); sw.setDate(now.getDate()-now.getDay()); let ew=new Date(sw); ew.setDate(sw.getDate()+6);
    if(rd>=sw && rd<=ew) w+=r.earnings;
    if(rd.getMonth()==now.getMonth()&&rd.getFullYear()==now.getFullYear()) m+=r.earnings;
  });
  $("runs-daily").innerText="Resumo diário corridas: "+d.toFixed(2);
  $("runs-weekly").innerText="Resumo semanal corridas: "+w.toFixed(2);
  $("runs-monthly").innerText="Resumo mensal corridas: "+m.toFixed(2);
}

// ---------- Navegação ----------
function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.style.display="none");
  $(tab).style.display="block";
  if(tab=="financas"){renderFinance(); generateReports();}
  if(tab=="corridas"){renderRunsChart(); generateRunReports();}
  if(tab=="reports"){generateReports();}
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded",()=>{
  populateCategories("fin"); populateCategories("run");
  showTab("financas");
});
