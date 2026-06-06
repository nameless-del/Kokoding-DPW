// ==========================================
// BAB 1: VARIABEL DATA (State Management)
// Menyimpan data sementara selama aplikasi berjalan
// ==========================================
let totalStock = 0;
let totalBalance = 0;
let stockHistory = [];   // Array untuk tabel riwayat stok
let financeHistory = []; // Array untuk tabel riwayat keuangan

const ASSUMED_DAILY_USAGE = 15; // Asumsi pengeluaran 15kg/hari untuk prediksi


// ==========================================
// BAB 2: FUNGSI PEMBARUAN LAYAR (UI Updates)
// Bertugas mengubah teks dan tabel di HTML sesuai data terbaru
// ==========================================

// Fungsi A: Memperbarui Kartu Dashboard & Logika Notifikasi
function updateDashboard() {
    // Update Angka
    document.getElementById('current-stock').innerText = `${totalStock} Kg`;
    document.getElementById('current-balance').innerText = `Rp ${totalBalance.toLocaleString('id-ID')}`;

    // Update Warna Notifikasi Stok
    const alertCard = document.getElementById('notification-card');
    const alertMsg = document.getElementById('stock-notification');
    
    if (totalStock === 0) {
        alertMsg.innerText = "🚨 Stok kosong!";
        alertCard.className = "card danger";
    } else if (totalStock < 50) {
        alertMsg.innerText = "⚠️ Stok menipis (< 50 Kg)";
        alertCard.className = "card warning";
    } else {
        alertMsg.innerText = "✅ Stok aman.";
        alertCard.className = "card success";
    }

    // Update Prediksi Hari
    const predMsg = document.getElementById('stock-prediction');
    predMsg.innerText = totalStock > 0 
        ? `💡 Prediksi: Habis dalam ±${Math.ceil(totalStock / ASSUMED_DAILY_USAGE)} hari.` 
        : "-";
}

// Fungsi B: Menggambar Ulang Tabel Riwayat
function renderTables() {
    const stockTbody = document.querySelector('#stock-table tbody');
    stockTbody.innerHTML = ''; // Kosongkan tabel stok
    
    stockHistory.forEach(item => {
        const sign = item.type === 'masuk' ? '+' : '-';
        const color = item.type === 'masuk' ? 'text-green' : 'text-red';
        stockTbody.innerHTML += `<tr><td>${item.date}</td><td>${item.type}</td><td class="${color}">${sign} ${item.amount} Kg</td></tr>`;
    });

    const financeTbody = document.querySelector('#finance-table tbody');
    financeTbody.innerHTML = ''; // Kosongkan tabel keuangan
    
    financeHistory.forEach(item => {
        const sign = item.type === 'masuk' ? '+' : '-';
        const color = item.type === 'masuk' ? 'text-green' : 'text-red';
        financeTbody.innerHTML += `<tr><td>${item.date}</td><td>${item.desc}</td><td class="${color}">${sign} Rp ${item.amount.toLocaleString('id-ID')}</td></tr>`;
    });
}


// ==========================================
// BAB 3: AKSI & EVENT LISTENER (User Interaction)
// Menangkap aksi klik atau submit dari pengguna
// ==========================================

// Aksi 1: Mendapatkan Waktu Saat Ini (Helper)
const getWaktu = () => new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

// Aksi 2: Submit Form Stok
document.getElementById('form-stock').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('stock-type').value;
    const amount = parseFloat(document.getElementById('stock-amount').value);

    // Validasi pencegah minus
    if (type === 'keluar' && amount > totalStock) return alert("Gagal: Stok tidak cukup!");

    // Hitung & Simpan
    type === 'masuk' ? (totalStock += amount) : (totalStock -= amount);
    stockHistory.unshift({ date: getWaktu(), type, amount });

    this.reset();
    updateDashboard();
    renderTables();
});

// Aksi 3: Submit Form Keuangan
document.getElementById('form-finance').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('finance-type').value;
    const amount = parseFloat(document.getElementById('finance-amount').value);
    const desc = document.getElementById('finance-desc').value;

    // Validasi pencegah minus
    if (type === 'keluar' && amount > totalBalance) return alert("Gagal: Saldo tidak cukup!");

    // Hitung & Simpan
    type === 'masuk' ? (totalBalance += amount) : (totalBalance -= amount);
    financeHistory.unshift({ date: getWaktu(), type, amount, desc });

    this.reset();
    updateDashboard();
    renderTables();
});

// Aksi 4: Sistem Navigasi Menu (Single Page Application Logic)
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Matikan semua menu yang aktif
        document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        
        // Aktifkan menu yang diklik saja
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

// Aksi 5: Simulasi Login
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Login berhasil!");
    document.querySelector('button[data-target="view-dashboard"]').click(); // Auto-pindah ke dashboard
});

// Aksi 6: Tombol Reset
document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm("Yakin hapus semua data?")) {
        totalStock = 0; totalBalance = 0; stockHistory = []; financeHistory = [];
        updateDashboard(); renderTables();
    }
});

// Jalankan update UI pertama kali saat web dibuka
updateDashboard();