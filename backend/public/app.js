const API_BASE = '/api';
let currentToken = localStorage.getItem('token') || null;

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
    if (tabId === 'invoices') loadInvoices();
    if (tabId === 'dashboard') loadDashboard();
}

async function loadDashboard() {
    if (!currentToken) return;
    try {
        const res = await fetch(`${API_BASE}/invoices-ar`, { headers: { 'Authorization': `Bearer ${currentToken}` } });
        const invoices = await res.json();
        document.getElementById('total-invoices').textContent = invoices.length;
        const total = invoices.reduce((sum, i) => sum + (i.importeTotal || 0), 0);
        document.getElementById('total-amount').textContent = '$' + total.toFixed(2);
        const pending = invoices.filter(i => i.estadoPago === 'pendiente').length;
        document.getElementById('pending-count').textContent = pending;
    } catch (err) {}
}

async function loadInvoices() {
    if (!currentToken) return;
    try {
        const res = await fetch(`${API_BASE}/invoices-ar`, { headers: { 'Authorization': `Bearer ${currentToken}` } });
        const invoices = await res.json();
        const tbody = document.getElementById('invoices-body');
        tbody.innerHTML = invoices.map(i => `
            <tr>
                <td>${i.nroFactura}</td>
                <td>${i.tipo}</td>
                <td>${i.fechaEmision?.split('T')[0]}</td>
                <td>${i.cliente?.razonSocial || ''}</td>
                <td>$${i.importeTotal?.toFixed(2)}</td>
                <td><span class="status ${i.estadoPago}">${i.estadoPago}</span></td>
            </tr>
        `).join('');
    } catch (err) {}
}

document.getElementById('file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file || !currentToken) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/invoices-ar/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` },
        body: formData
    });
    const result = await res.json();
    document.getElementById('upload-result').innerHTML = `<p>${result.success ? 'Factura procesada' : 'Error'}</p>`;
});

document.getElementById('manual-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentToken) return;
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    const res = await fetch(`${API_BASE}/invoices-ar/manual`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (res.ok) { e.target.reset(); alert('Factura creada'); }
});

function exportCSV() {
    if (!currentToken) return;
    window.open(`${API_BASE}/invoices-ar/export/csv`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            document.getElementById('file-input').files = e.dataTransfer.files;
            document.getElementById('file-input').dispatchEvent(new Event('change'));
        }
    });
});