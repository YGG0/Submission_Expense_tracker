/**
 * ========================================================
 * Expense Tracker App — main.js
 * ========================================================
 * Tulis seluruh kode JavaScript kamu di sini.
 */

// TODO [Basic] Buat variabel array untuk menyimpan semua data transaksi, contoh: let transactions = []
let transactions = [];
let editingId = null;
let searchKeyword = "";

const STORAGE_KEY = "expense-tracker-transactions";
const TRANSACTION_UPDATED = "transaction:updated";

// TODO [Basic] Buat fungsi untuk menghasilkan ID unik secara otomatis, contoh: gunakan +new Date()
function generateId() {
  return +new Date() + Math.floor(Math.random() * 1000);
}

/**
 * ========================================================
 * Kriteria 1: Memanipulasi DOM untuk Form dan Daftar Transaksi
 * ========================================================
 */
// TODO [Basic] Ambil elemen kontainer incomeList dan expenseList dari DOM
const incomeList = document.getElementById("incomeList");
const expenseList = document.getElementById("expenseList");

const transactionForm = document.getElementById("transactionForm");
const titleInput = document.getElementById("transactionFormTitleInput");
const amountInput = document.getElementById("transactionFormAmountInput");
const dateInput = document.getElementById("transactionFormDateInput");
const typeSelect = document.getElementById("transactionFormTypeSelect");
const submitButton = transactionForm.querySelector(
  '[data-testid="transactionFormSubmitButton"]'
);
const searchInput = document.getElementById("searchTransactionFormTitleInput");
const searchForm = document.getElementById("searchTransactionForm");

const balanceEl = document.querySelector(".tracker-summary__balance-amount");
const incomeTotalEl = document.querySelector(
  ".tracker-summary__stat-amount--income"
);
const expenseTotalEl = document.querySelector(
  ".tracker-summary__stat-amount--expense"
);

function formatRupiah(amount) {
  return "Rp" + Number(amount).toLocaleString("id-ID");
}

/**
 * TODO [Basic]:
 * Buat fungsi untuk menampilkan (render) semua transaksi ke layar:
 *  - Kosongkan kontainer terlebih dahulu sebelum mengisi ulang
 *  - Gunakan perulangan, buat setiap elemen kartu dengan document.createElement()
 *  - Pastikan setiap elemen memiliki atribut data-testid yang sesuai (lihat panduan di rubrik)
 *  - Masukkan kartu ke kontainer yang tepat: income → incomeList, expense → expenseList
 */
function createTransactionElement(tx) {
  const item = document.createElement("div");
  item.setAttribute("data-testid", "transactionItem");
  item.classList.add("tracker-transaction-item");
  item.dataset.id = tx.id;

  const icon = document.createElement("div");
  icon.classList.add(
    "tracker-transaction-item__icon",
    tx.type === "income"
      ? "tracker-transaction-item__icon--income"
      : "tracker-transaction-item__icon--expense"
  );
  icon.textContent = tx.type === "income" ? "💰" : "💸";

  const detail = document.createElement("div");
  detail.classList.add("tracker-transaction-item__detail");

  const titleEl = document.createElement("h3");
  titleEl.setAttribute("data-testid", "transactionItemTitle");
  titleEl.classList.add("tracker-transaction-item__title");
  titleEl.textContent = tx.title;

  const dateEl = document.createElement("p");
  dateEl.setAttribute("data-testid", "transactionItemDate");
  dateEl.classList.add("tracker-transaction-item__date");
  dateEl.textContent = `Tanggal: ${tx.date}`;

  const typeEl = document.createElement("p");
  typeEl.setAttribute("data-testid", "transactionItemType");
  typeEl.classList.add("tracker-transaction-item__date");
  typeEl.textContent = `Tipe: ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}`;

  detail.append(titleEl, dateEl, typeEl);

  const right = document.createElement("div");
  right.classList.add("tracker-transaction-item__right");

  const amountEl = document.createElement("p");
  amountEl.setAttribute("data-testid", "transactionItemAmount");
  amountEl.classList.add(
    "tracker-transaction-item__amount",
    tx.type === "income"
      ? "tracker-transaction-item__amount--income"
      : "tracker-transaction-item__amount--expense"
  );
  amountEl.textContent = `Nominal: ${formatRupiah(tx.amount)}`;

  const actions = document.createElement("div");
  actions.classList.add("tracker-transaction-item__actions");

  const editTypeBtn = document.createElement("button");
  editTypeBtn.setAttribute("data-testid", "transactionItemEditTypeButton");
  editTypeBtn.classList.add("tracker-transaction-item__btn");
  editTypeBtn.textContent = "Ubah Tipe";
  editTypeBtn.addEventListener("click", () => handleToggleType(tx.id));

  const editBtn = document.createElement("button");
  editBtn.setAttribute("data-testid", "transactionItemEditButton");
  editBtn.classList.add("tracker-transaction-item__btn");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => handleEdit(tx.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.setAttribute("data-testid", "transactionItemDeleteButton");
  deleteBtn.classList.add("tracker-transaction-item__btn");
  deleteBtn.textContent = "Hapus";
  deleteBtn.addEventListener("click", () => handleDelete(tx.id));

  actions.append(editTypeBtn, editBtn, deleteBtn);
  right.append(amountEl, actions);
  item.append(icon, detail, right);

  return item;
}

function renderTransactions() {
  incomeList.innerHTML = "";
  expenseList.innerHTML = "";

  const keyword = searchKeyword.toLowerCase().trim();
  const filtered = transactions.filter((tx) =>
    tx.title.toLowerCase().includes(keyword)
  );

  filtered.forEach((tx) => {
    const el = createTransactionElement(tx);
    if (tx.type === "income") {
      incomeList.appendChild(el);
    } else {
      expenseList.appendChild(el);
    }
  });
}

// TODO [Basic] Tambahkan event listener 'submit' pada form, panggil e.preventDefault() di dalamnya
// TODO [Basic] Di dalam handler submit, ambil nilai input lalu tambahkan sebagai objek transaksi baru ke array
transactionForm.addEventListener("submit", handleFormSubmit);

function handleFormSubmit(e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const date = dateInput.value;
  const type = typeSelect.value;

  /**
   * TODO [Skilled]:
   * Tambahkan validasi input sebelum menyimpan data:
   *  - Tampilkan alert() dan hentikan proses jika judul kosong
   *  - Tampilkan alert() dan hentikan proses jika nominal kurang dari 1
   */
  if (!title) {
    alert("Judul transaksi tidak boleh kosong!");
    return;
  }
  if (!amount || amount < 1) {
    alert("Nominal harus minimal 1 Rupiah!");
    return;
  }
  if (!date) {
    alert("Tanggal harus diisi!");
    return;
  }

  if (editingId !== null) {
    const index = transactions.findIndex((tx) => tx.id === editingId);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        title,
        amount,
        date,
        type,
      };
    }
  } else {
    transactions.push({
      id: generateId(),
      title,
      amount,
      date,
      type,
    });
  }

  saveToStorage();
  resetForm();
  notifyUpdate();
}

/**
 * TODO [Advanced]:
 * Setiap kali data transaksi berubah, perbarui Panel Dasbor:
 *  - Hitung total pemasukan, total pengeluaran, dan saldo (pemasukan - pengeluaran)
 *  - Tampilkan hasilnya ke elemen yang sesuai di HTML
 */
function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === "income") totalIncome += Number(tx.amount);
    else totalExpense += Number(tx.amount);
  });

  const balance = totalIncome - totalExpense;

  balanceEl.textContent = formatRupiah(balance);
  incomeTotalEl.textContent = formatRupiah(totalIncome);
  expenseTotalEl.textContent = formatRupiah(totalExpense);
}

/**
 * ========================================================
 * Kriteria 2: Mengelola Penyimpanan Data (Web Storage API)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Data transaksi disimpan ke localStorage menggunakan JSON.stringify(), dan dimuat kembali saat halaman dibuka menggunakan JSON.parse().
 *  - Tombol "Hapus" berfungsi: transaksi yang dihapus langsung hilang dari layar dan dari localStorage.
 */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  transactions = raw ? JSON.parse(raw) : [];
}

function handleDelete(id) {
  transactions = transactions.filter((tx) => tx.id !== id);
  saveToStorage();
  notifyUpdate();
}

/**
 * TODO [Skilled]:
 * Tombol "Edit" berfungsi: saat ditekan, formulir (#transactionForm) secara otomatis terisi dengan data transaksi yang dipilih.
 *  - Pengguna dapat mengubah data lalu menyimpan perubahan.
 *  - Formulir kembali ke mode "Tambah" setelah pembaruan selesai.
 */
function handleEdit(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;

  titleInput.value = tx.title;
  amountInput.value = tx.amount;
  dateInput.value = tx.date;
  typeSelect.value = tx.type;

  editingId = id;
  submitButton.textContent = "Perbarui";
  transactionForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function resetForm() {
  transactionForm.reset();
  editingId = null;
  submitButton.textContent = "Simpan";
}

/**
 * TODO [Advanced]:
 * Gunakan Custom Event sebagai penghubung antara perubahan data dan pembaruan tampilan:
 *  - Kirim sinyal dengan document.dispatchEvent(new Event('transaction:updated')) setiap kali data berubah
 *  - Pasang satu listener untuk event tersebut yang memanggil fungsi render dan update dasbor
 */
function notifyUpdate() {
  document.dispatchEvent(new Event(TRANSACTION_UPDATED));
}

document.addEventListener(TRANSACTION_UPDATED, () => {
  renderTransactions();
  updateDashboard();
});

/**
 * ========================================================
 * Kriteria 3: Fitur Interaktif (Pindah Kategori dan Pencarian)
 * ========================================================
 */
/**
 * TODO [Basic]:
 * Tambahkan tombol "Ubah Tipe" pada setiap kartu transaksi:
 *  - Saat diklik, ubah tipe transaksi: 'income' → 'expense' atau 'expense' → 'income'
 *  - Simpan perubahan ke localStorage dan perbarui tampilan
 */
function handleToggleType(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;
  tx.type = tx.type === "income" ? "expense" : "income";
  saveToStorage();
  notifyUpdate();
}

/**
 * TODO [Skilled]:
 * Tambahkan event listener 'input' pada kolom pencarian:
 *  - Filter array transaksi berdasarkan kecocokan kata kunci dengan judul transaksi
 *  - Tampilkan hanya transaksi yang judulnya mengandung kata kunci tersebut
 */
searchInput.addEventListener("input", (e) => {
  searchKeyword = e.target.value;
  renderTransactions();
});

/**
 * TODO [Advanced]:
 * Pastikan fitur pencarian berjalan dengan baik di semua kondisi:
 *  - Saat kolom pencarian dikosongkan, tampilkan kembali seluruh daftar transaksi
 */
searchForm.addEventListener("submit", (e) => e.preventDefault());

function init() {
  loadFromStorage();
  dateInput.valueAsDate = new Date();
  renderTransactions();
  updateDashboard();
}

init();