// ==========================================
// BAB 1: VARIABEL DATA (State Management)
// ==========================================
// Penjelasan: Ini adalah tempat penyimpanan data sementara (State) di dalam memori peramban (browser).
// Karena kita belum menggunakan database, semua data akan direset saat halaman di-refresh.

let totalStock = 0;      // Menyimpan total berat kakao saat ini
let totalBalance = 0;    // Menyimpan total uang/saldo saat ini
let stockHistory = [];   // Array untuk menyimpan daftar objek riwayat transaksi stok
let financeHistory = []; // Array untuk menyimpan daftar objek riwayat transaksi keuangan


// ==========================================
// BAB 2: FUNGSI PEMBARUAN LAYAR & DATA (Dynamic Rendering)
// ==========================================

// --- 1. Fungsi Penghitungan Ulang (Recalculate) ---
// Penjelasan: Fungsi ini memastikan perhitungan tidak pernah salah atau minus.
// Alih-alih mengurangkan data yang dihapus, fungsi ini akan menghitung ulang dari angka 0 
// berdasarkan sisa data yang masih ada di dalam Array history.
function recalculateData() {
    totalStock = 0; // Kembalikan ke 0 dulu
    stockHistory.forEach(item => {
        if (item.type === 'masuk') totalStock += item.amount; // Jika masuk, tambah stok
        else totalStock -= item.amount;                       // Jika keluar, kurangi stok
    });

    totalBalance = 0; // Kembalikan ke 0 dulu
    financeHistory.forEach(item => {
        if (item.type === 'masuk') totalBalance += item.amount; // Jika masuk, tambah saldo
        else totalBalance -= item.amount;                       // Jika keluar, kurangi saldo
    });
}

// --- 2. Fungsi Memperbarui Dashboard Utama ---
// Penjelasan: Fungsi ini bertugas memanipulasi DOM (Document Object Model) untuk mengubah 
// teks angka, warna peringatan, dan menghitung prediksi di halaman Dashboard.
function updateDashboard() {
    // Menampilkan angka terbaru ke layar
    document.getElementById('current-stock').innerText = `${totalStock} Kg`;
    document.getElementById('current-balance').innerText = `Rp ${totalBalance.toLocaleString('id-ID')}`;

    // Logika Warna Notifikasi Stok (Merah, Kuning, Hijau)
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

    // Logika Sistem Prediksi Cerdas (Metode Rata-Rata)
    const predMsg = document.getElementById('stock-prediction');
    if (totalStock > 0) {
        let totalKeluar = 0, jumlahTransaksiKeluar = 0;
        
        // Membaca riwayat untuk mencari tahu total kakao yang sudah pernah dikeluarkan
        stockHistory.forEach(item => {
            if (item.type === 'keluar') {
                totalKeluar += item.amount; 
                jumlahTransaksiKeluar++;
            }
        });

        // Jika sudah ada riwayat pengeluaran, hitung rata-ratanya
        if (jumlahTransaksiKeluar > 0) {
            let rataRataPengeluaran = totalKeluar / jumlahTransaksiKeluar;
            // Membulatkan hasil pembagian ke atas menggunakan Math.ceil
            let estimasiSisa = Math.ceil(totalStock / rataRataPengeluaran);
            predMsg.innerText = `💡 Prediksi: Rata-rata pengeluaran ${rataRataPengeluaran.toFixed(1)} Kg. Stok diestimasi habis dalam ±${estimasiSisa} kali transaksi ke depan.`;
        } else {
            predMsg.innerText = `💡 Prediksi: Belum ada data historis pengeluaran.`;
        }
    } else {
        predMsg.innerText = "-"; // Kosongkan prediksi jika stok 0
    }
}

// --- 3. Fungsi Menggambar Ulang Tabel (Render Tables) ---
// Penjelasan: Fungsi ini bertugas mencetak elemen baris <tr> dan <td> ke dalam HTML 
// secara dinamis berdasarkan isi dari Array history.
function renderTables() {
    // Render Tabel Stok
    const stockTbody = document.querySelector('#stock-table tbody');
    stockTbody.innerHTML = ''; // Bersihkan isi tabel lama sebelum mencetak yang baru
    stockHistory.forEach(item => {
        const sign = item.type === 'masuk' ? '+' : '-';
        const color = item.type === 'masuk' ? 'text-green' : 'text-red';
        
        // Template Literal HTML untuk membuat baris baru beserta Checkbox ID
        stockTbody.innerHTML += `
            <tr>
                <td><input type="checkbox" class="check-stock" value="${item.id}"></td>
                <td>${item.date}</td><td>${item.type.toUpperCase()}</td>
                <td class="${color}">${sign} ${item.amount} Kg</td>
            </tr>`;
    });

    // Render Tabel Keuangan
    const financeTbody = document.querySelector('#finance-table tbody');
    financeTbody.innerHTML = ''; // Bersihkan isi tabel lama
    financeHistory.forEach(item => {
        const sign = item.type === 'masuk' ? '+' : '-';
        const color = item.type === 'masuk' ? 'text-green' : 'text-red';
        
        financeTbody.innerHTML += `
            <tr>
                <td><input type="checkbox" class="check-finance" value="${item.id}"></td>
                <td>${item.date}</td><td>${item.desc}</td>
                <td class="${color}">${sign} Rp ${item.amount.toLocaleString('id-ID')}</td>
            </tr>`;
    });
}


// ==========================================
// BAB 3: AKSI & EVENT LISTENER (User Interaction)
// ==========================================

// --- Helper Functions (Fungsi Bantuan Pembantu) ---
// Membuat format tanggal & jam Indonesia saat ini
const getWaktu = () => new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });

// Membuat ID acak (misal: "x8k9m2p") untuk menandai setiap baris data agar bisa dihapus spesifik
const generateId = () => Math.random().toString(36).substr(2, 9); 


// --- Aksi 1: Saat Form Pencatatan Stok Disubmit ---
document.getElementById('form-stock').addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah halaman web melakukan refresh otomatis
    
    // Mengambil nilai dari inputan form
    const type = document.getElementById('stock-type').value;
    const amount = parseFloat(document.getElementById('stock-amount').value);

    // Validasi Logika: Cegah pengguna mengeluarkan stok lebih dari yang dimiliki
    if (type === 'keluar' && amount > totalStock) return alert("Gagal: Stok tidak cukup!");

    // Masukkan data baru ke urutan paling atas (unshift) di dalam Array
    stockHistory.unshift({ id: generateId(), date: getWaktu(), type, amount });
    
    // Jalankan urutan pembaruan: Hitung ulang -> Perbarui Angka -> Cetak Tabel -> Kosongkan Form
    recalculateData(); updateDashboard(); renderTables(); this.reset();
});

// --- Aksi 2: Saat Form Pencatatan Keuangan Disubmit ---
document.getElementById('form-finance').addEventListener('submit', function(e) {
    e.preventDefault();
    const type = document.getElementById('finance-type').value;
    const amount = parseFloat(document.getElementById('finance-amount').value);
    const desc = document.getElementById('finance-desc').value;

    if (type === 'keluar' && amount > totalBalance) return alert("Gagal: Saldo tidak cukup!");

    financeHistory.unshift({ id: generateId(), date: getWaktu(), type, amount, desc });
    
    recalculateData(); updateDashboard(); renderTables(); this.reset();
});

// --- Aksi 3: Fitur Hapus Riwayat Stok (CRUD - Delete) ---
document.getElementById('btn-del-stock').addEventListener('click', () => {
    // Deteksi checkbox mana saja yang sedang dicentang oleh pengguna
    const checkedBoxes = document.querySelectorAll('.check-stock:checked');
    if (checkedBoxes.length === 0) return alert("Silakan centang minimal satu data untuk dihapus.");
    if (!confirm("Yakin ingin menghapus riwayat stok terpilih?")) return;

    // Kumpulkan semua ID unik dari checkbox yang dicentang ke dalam sebuah Array
    const idsToDelete = Array.from(checkedBoxes).map(box => box.value);
    
    // Proses Penghapusan: Timpa array lama dengan array baru yang TIDAK berisi ID yang dihapus
    stockHistory = stockHistory.filter(item => !idsToDelete.includes(item.id));

    // Perbarui seluruh tampilan
    recalculateData(); updateDashboard(); renderTables();
});

// --- Aksi 4: Fitur Hapus Riwayat Keuangan (CRUD - Delete) ---
document.getElementById('btn-del-finance').addEventListener('click', () => {
    const checkedBoxes = document.querySelectorAll('.check-finance:checked');
    if (checkedBoxes.length === 0) return alert("Silakan centang minimal satu data untuk dihapus.");
    if (!confirm("Yakin ingin menghapus riwayat keuangan terpilih?")) return;

    const idsToDelete = Array.from(checkedBoxes).map(box => box.value);
    financeHistory = financeHistory.filter(item => !idsToDelete.includes(item.id));

    recalculateData(); updateDashboard(); renderTables();
});

// --- Aksi 5: Sistem Navigasi Single Page Application (SPA) ---
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Hilangkan class 'active' dari semua tombol dan halaman
        document.querySelectorAll('.active').forEach(el => el.classList.remove('active'));
        
        // Berikan class 'active' hanya pada tombol yang diklik dan halaman tujuannya
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    });
});

// --- Aksi 6: Simulasi Login ---
document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault(); 
    alert("Login berhasil!");
    // Pura-pura mengklik tombol navigasi Dashboard agar otomatis pindah halaman
    document.querySelector('button[data-target="view-dashboard"]').click(); 
});

// --- Aksi 7: Tombol Reset Seluruh Sistem ---
document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm("Yakin hapus semua data dari awal?")) {
        // Kosongkan seluruh Array, lalu hitung ulang
        stockHistory = []; financeHistory = [];
        recalculateData(); updateDashboard(); renderTables();
    }
});

// --- Inisialisasi Awal ---
// Jalankan fungsi updateDashboard saat web pertama kali dibuka agar angka tidak kosong
updateDashboard();
