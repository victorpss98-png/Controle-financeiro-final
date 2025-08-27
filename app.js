
// Alternar abas
function showTab(tab) {
  document.querySelectorAll('.tab').forEach(el => el.style.display = 'none');
  document.getElementById(tab).style.display = 'block';
  if (tab === 'financas') updateFinanceSummaries();
  if (tab === 'corridas') { updateRideSummaries(); renderRideChart(); }
}

// ================= Finanças =================
let finances = JSON.parse(localStorage.getItem('finances')) || [];

document.getElementById('finance-form').addEventListener('submit', e => {
  e.preventDefault();
  const entry = {
    date: document.getElementById('finance-date').value,
    category: document.getElementById('finance-category').value,
    subcategory: document.getElementById('finance-subcategory').value,
    amount: parseFloat(document.getElementById('finance-amount').value),
    type: document.getElementById('finance-type').value
  };
  finances.push(entry);
  localStorage.setItem('finances', JSON.stringify(finances));
  renderFinances();
  updateFinanceSummaries();
  e.target.reset();
});

function deleteFinance(index) {
  finances.splice(index, 1);
  localStorage.setItem('finances', JSON.stringify(finances));
  renderFinances();
  updateFinanceSummaries();
}

function renderFinances() {
  const list = document.getElementById('finance-list');
  list.innerHTML = '';
  finances.forEach((f, i) => {
    const li = document.createElement('li');
    li.textContent = `${f.date} - ${f.category}/${f.subcategory} - ${f.type} R$${f.amount}`;
    const btn = document.createElement('button');
    btn.textContent = '🗑';
    btn.className = 'delete-btn';
    btn.onclick = () => deleteFinance(i);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function updateFinanceSummaries() {
  let daily = 0, weekly = 0, monthly = 0;
  const now = new Date();
  finances.forEach(f => {
    let d = new Date(f.date);
    let val = f.type === 'income' ? f.amount : -f.amount;
    if (d.toDateString() === now.toDateString()) daily += val;
    let startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    let endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
    if (d >= startOfWeek && d <= endOfWeek) weekly += val;
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthly += val;
  });
  document.getElementById('finance-daily').textContent = 'Resumo diário: R$' + daily.toFixed(2);
  document.getElementById('finance-weekly').textContent = 'Resumo semanal: R$' + weekly.toFixed(2);
  document.getElementById('finance-monthly').textContent = 'Resumo mensal: R$' + monthly.toFixed(2);
}

// ================= Corridas =================
let rides = JSON.parse(localStorage.getItem('rides')) || [];

document.getElementById('ride-form').addEventListener('submit', e => {
  e.preventDefault();
  const entry = {
    date: document.getElementById('ride-date').value,
    gains: parseFloat(document.getElementById('ride-gains').value),
    km: parseFloat(document.getElementById('ride-km').value),
    gas: parseFloat(document.getElementById('ride-gas').value),
    oil: parseFloat(document.getElementById('ride-oil').value),
    brakes: parseFloat(document.getElementById('ride-brakes').value),
    maint: parseFloat(document.getElementById('ride-maint').value)
  };
  rides.push(entry);
  localStorage.setItem('rides', JSON.stringify(rides));
  renderRides();
  updateRideSummaries();
  renderRideChart();
  e.target.reset();
});

function deleteRide(index) {
  rides.splice(index, 1);
  localStorage.setItem('rides', JSON.stringify(rides));
  renderRides();
  updateRideSummaries();
  renderRideChart();
}

function renderRides() {
  const list = document.getElementById('ride-list');
  list.innerHTML = '';
  rides.forEach((r, i) => {
    const li = document.createElement('li');
    li.textContent = `${r.date} - Ganhos R$${r.gains} - KM ${r.km}`;
    const btn = document.createElement('button');
    btn.textContent = '🗑';
    btn.className = 'delete-btn';
    btn.onclick = () => deleteRide(i);
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function updateRideSummaries() {
  let daily = 0, weekly = 0, monthly = 0;
  const now = new Date();
  rides.forEach(r => {
    let d = new Date(r.date);
    let val = r.gains - (r.gas + r.oil + r.brakes + r.maint);
    if (d.toDateString() === now.toDateString()) daily += val;
    let startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    let endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
    if (d >= startOfWeek && d <= endOfWeek) weekly += val;
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) monthly += val;
  });
  document.getElementById('ride-daily').textContent = 'Resumo diário: R$' + daily.toFixed(2);
  document.getElementById('ride-weekly').textContent = 'Resumo semanal: R$' + weekly.toFixed(2);
  document.getElementById('ride-monthly').textContent = 'Resumo mensal: R$' + monthly.toFixed(2);
}

// Backup e Restauração Corridas
function backupRides() {
  const data = JSON.stringify(rides);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rides_backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
function restoreRides() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      rides = JSON.parse(reader.result);
      localStorage.setItem('rides', JSON.stringify(rides));
      renderRides();
      updateRideSummaries();
      renderRideChart();
    };
    reader.readAsText(file);
  };
  input.click();
}

// Gráfico de gastos Corridas
let rideChart;
function renderRideChart() {
  const ctx = document.getElementById('ride-chart').getContext('2d');
  if (rideChart) rideChart.destroy();
  let totalGas = rides.reduce((sum, r) => sum + r.gas, 0);
  let totalOil = rides.reduce((sum, r) => sum + r.oil, 0);
  let totalBrakes = rides.reduce((sum, r) => sum + r.brakes, 0);
  let totalMaint = rides.reduce((sum, r) => sum + r.maint, 0);
  rideChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Gasolina', 'Óleo', 'Freios', 'Manutenção'],
      datasets: [{
        data: [totalGas, totalOil, totalBrakes, totalMaint]
      }]
    }
  });
}

// Inicialização
renderFinances();
updateFinanceSummaries();
renderRides();
updateRideSummaries();
renderRideChart();
