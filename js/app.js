/* =====================================================
   CONFIGURATION
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyTrPVvRouvtg-R6IMbZhsGK1kJoxUzbHyWbqBa-eHDmQz6RtMcbtf-iihmjq4VqNqnjg/exec";

/* =====================================
   PDF
===================================== */

let latestPdfUrl = "";

/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  loadReportNumber();
  loadCustomers();
  loadModels();
  loadTechnicians();
  loadContracts();
  loadProjects();
  loadLocations();
  getGPSLocation();
});

/* =====================================================
   API HELPER
===================================================== */

async function getData(action) {
  const response = await fetch(`${API_URL}?action=${action}`);

  return await response.json();
}

/* =====================================================
   LOAD REPORT NUMBER
===================================================== */

async function loadReportNumber() {
  const data = await getData("nextNumber");

  document.getElementById("reportNumber").value = data.number;
}

/* =====================================================
   LOAD CUSTOMER MASTER
===================================================== */

async function loadCustomers() {
  const data = await getData("customers");

  const select = document.getElementById("customer");

  select.innerHTML = '<option value="">Pilih Customer</option>';

  data.forEach((customer) => {
    select.innerHTML += `<option>${customer}</option>`;
  });
}

/* =====================================================
   LOAD MODEL MASTER
===================================================== */

async function loadModels() {
  const models = await getData("models");

  const container = document.getElementById("alatanContainer");

  container.innerHTML = "";

  models.forEach((model) => {
    container.innerHTML += `
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          value="${model}"
          class="alatan-checkbox"
        />
        <span>${model}</span>
      </label>
    `;
  });
}

/* =====================================================
   LOAD TECHNICIAN MASTER
===================================================== */

async function loadTechnicians() {
  const data = await getData("technicians");

  const select = document.getElementById("teknisi");

  select.innerHTML = '<option value="">Pilih Teknisi</option>';

  data.forEach((teknisi) => {
    select.innerHTML += `<option>${teknisi}</option>`;
  });
}

/* =====================================================
   LOAD Contracts MASTER
===================================================== */
async function loadContracts() {
  const response = await fetch(API_URL + "?action=contracts");

  const data = await response.json();

  const select = document.getElementById("noProject");

  select.innerHTML = '<option value="">Pilih Kontrak</option>';

  data.forEach((item) => {
    select.innerHTML += `
      <option value="${item}">
        ${item}
      </option>
    `;
  });
}

/* =====================================================
   LOAD Locations PROJECT
===================================================== */

async function loadProjects() {
  const response = await fetch(API_URL + "?action=projects");

  const data = await response.json();

  const select = document.getElementById("namaProject");

  select.innerHTML = '<option value="">Pilih Project</option>';

  data.forEach((project) => {
    select.innerHTML += `
      <option value="${project}">
        ${project}
      </option>
    `;
  });
}

/* =====================================================
   LOAD Locations MASTER
===================================================== */
async function loadLocations() {
  try {
    // Pastikan action=locations (sesuai handler doGet di Code.gs lo)
    const response = await fetch(`${API_URL}?action=locations`);
    const locations = await response.json();

    const select = document.getElementById("lokasi");
    if (!select) return;

    select.innerHTML = '<option value="">-- Pilih Lokasi / Plant --</option>';

    if (Array.isArray(locations)) {
      locations.forEach((loc) => {
        if (loc) {
          const option = document.createElement("option");
          option.value = loc;
          option.textContent = loc;
          select.appendChild(option);
        }
      });
    }
  } catch (error) {
    console.error("Gagal memuat master lokasi:", error);
  }
}

/* =====================================================
   GPS & LOCATION TOGGLE MANAGEMENT
===================================================== */

function toggleLocationMode() {
  const mode = document.querySelector(
    'input[name="location_mode"]:checked',
  ).value;
  const gpsContainer = document.getElementById("gps_container");
  const manualContainer = document.getElementById("manual_location_container");

  if (mode === "gps") {
    if (gpsContainer) gpsContainer.classList.remove("hidden");
    if (manualContainer) manualContainer.classList.add("hidden");
    getGPSLocation();
  } else {
    if (gpsContainer) gpsContainer.classList.add("hidden");
    if (manualContainer) manualContainer.classList.remove("hidden");
  }
}

function getGPSLocation() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById("latitude").value = position.coords.latitude;
      document.getElementById("longitude").value = position.coords.longitude;
    },
    (error) => console.log("GPS Error:", error),
  );
}
window.toggleLocationMode = toggleLocationMode;
window.getGPSLocation = getGPSLocation;
/* =====================================================
   FORM SUBMIT EVENT
===================================================== */

document.getElementById("reportForm").addEventListener("submit", saveReport);

/* =====================================================
   SAVE REPORT
===================================================== */

async function saveReport(e) {
  e.preventDefault();

  const saveBtn = document.getElementById("saveBtn");

  saveBtn.disabled = true;
  saveBtn.innerHTML = "⏳ Menyimpan...";

  try {
    const parameter = [
      ...document.querySelectorAll('input[name="parameter"]:checked'),
    ]
      .map((item) => item.value)
      .join(", ");

    const kategori = [
      ...document.querySelectorAll('input[name="kategori"]:checked'),
    ]
      .map((item) => item.value)
      .join(", ");

    /* =====================================
       UPLOAD FOTO BEFORE
    ===================================== */

    const beforeLinks = [];

    for (const file of beforePhotos) {
      const base64 = await fileToBase64(file);

      const uploadData = new FormData();

      uploadData.append("action", "upload");

      uploadData.append("fileName", file.name);

      uploadData.append("file", base64.split(",")[1]);

      const uploadResponse = await fetch(API_URL, {
        method: "POST",
        body: uploadData,
      });

      const text = await uploadResponse.text();

      console.log("UPLOAD BEFORE:", text);

      let uploadResult = {};

      try {
        uploadResult = JSON.parse(text);
      } catch (err) {
        console.error("UPLOAD BEFORE BUKAN JSON:", text);
      }

      if (uploadResult.success) {
        beforeLinks.push(uploadResult.direct_url);
      }
    }

    /* =====================================
       UPLOAD FOTO AFTER
    ===================================== */

    const afterLinks = [];

    for (const file of afterPhotos) {
      const base64 = await fileToBase64(file);

      const uploadData = new FormData();

      uploadData.append("action", "upload");

      uploadData.append("fileName", file.name);

      uploadData.append("file", base64.split(",")[1]);

      const uploadResponse = await fetch(API_URL, {
        method: "POST",
        body: uploadData,
      });

      const text = await uploadResponse.text();

      console.log("UPLOAD AFTER:", text);

      let uploadResult = {};

      try {
        uploadResult = JSON.parse(text);
      } catch (err) {
        console.error("UPLOAD AFTER BUKAN JSON:", text);
      }

      if (uploadResult.success) {
        afterLinks.push(uploadResult.direct_url);
      }
    }

    /* =====================================
        SIMPAN LAPORAN
    ===================================== */

    const formData = new FormData();
    // 1. Ambil nilai input tanggal manual dari HTML
    const tanggalInput = document.getElementById("tanggal_manual").value;

    // 2. Format tanggal dari YYYY-MM-DD menjadi DD/MM/YYYY
    let formattedDate = "";
    if (tanggalInput) {
      const [year, month, day] = tanggalInput.split("-");
      formattedDate = `${day}/${month}/${year}`;
    }

    // 3. Masukkan ke dalam formData yang akan dikirim ke backend
    formData.append("tanggal_manual", formattedDate);

    formData.append("action", "save");

    formData.append("customer", document.getElementById("customer").value);

    formData.append("no_project", document.getElementById("noProject").value);

    formData.append(
      "nama_project",
      document.getElementById("namaProject").value,
    );

    const locationMode = document.querySelector(
      'input[name="location_mode"]:checked',
    ).value;
    let finalAlamat = "";
    let finalLat = "";
    let finalLong = "";

    if (locationMode === "gps") {
      finalLat = document.getElementById("latitude").value;
      finalLong = document.getElementById("longitude").value;
      finalAlamat = finalLat && finalLong ? `${finalLat}, ${finalLong}` : "-";
    } else {
      finalAlamat = document.getElementById("lokasi").value || "-";
      finalLat = "-";
      finalLong = "-";
    }

    formData.append("alamat", finalAlamat);

    const alatan = Array.from(
      document.querySelectorAll(".alatan-checkbox:checked"),
    ).map((el) => el.value);

    formData.append("model_sistem", alatan.join(", "));

    formData.append("parameter", parameter);

    formData.append("kategori", kategori);

    formData.append("teknisi", document.getElementById("teknisi").value);

    // Format dan Hitung Pekerja
    const rawPekerja = document.getElementById("pekerja").value.trim();
    const arrPekerja = rawPekerja
      ? rawPekerja
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const formattedPekerja =
      arrPekerja.length > 0
        ? `${arrPekerja.join("\n")} - ${arrPekerja.length} orang`
        : "";

    // Format dan Hitung Pengawas
    const rawPengawas = document.getElementById("pengawas").value.trim();
    const arrPengawas = rawPengawas
      ? rawPengawas
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    const formattedPengawas =
      arrPengawas.length > 0
        ? `${arrPengawas.join("\n")} - ${arrPengawas.length} orang`
        : "";

    // Masukkan ke FormData
    formData.append("pekerja", formattedPekerja);
    formData.append("pengawas", formattedPengawas);

    formData.append("deskripsi", document.getElementById("deskripsi").value);

    formData.append(
      "rencana_kerja",
      document.getElementById("rencana_kerja").value,
    );

    formData.append("status", document.getElementById("status").value);

    formData.append("latitude", finalLat);

    formData.append("longitude", finalLong);

    formData.append("before_links", beforeLinks.join("\n"));

    formData.append("after_links", afterLinks.join("\n"));

    // Ambil Gambar Tanda Tangan (Base64)
    let signatureBase64 = "";
    if (!isSignatureEmpty) {
      signatureBase64 = canvas.toDataURL("image/png");
    }
    formData.append("signature", signatureBase64);

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      latestPdfUrl = result.pdf_url || "";

      // 1. Ambil File ID Google Drive
      const fileId = getGoogleDriveFileId(latestPdfUrl);

      if (fileId) {
        // 2. Buat URL Preview dan URL Download
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        // 3. Tampilkan PDF di Modal Preview
        showPdfPreviewModal(previewUrl, downloadUrl, result.report_number);
      } else {
        alert("Laporan berhasil disimpan, tetapi URL PDF tidak valid.");
      }

      // 4. Reset Form & UI
      document.getElementById("reportForm").reset();

      beforePhotos = [];
      afterPhotos = [];

      renderBeforePhotos();
      renderAfterPhotos();

      loadReportNumber();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error(error);

    alert("Gagal menyimpan laporan");
  }

  saveBtn.disabled = false;

  saveBtn.innerHTML = "SIMPAN LAPORAN";
}

/* =====================================
   HELPER & MODAL PREVIEW FUNCTIONS
===================================== */

// Fungsi untuk mengambil File ID Google Drive
function getGoogleDriveFileId(url) {
  const match =
    url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Fungsi untuk menampilkan Pop-Up Modal Preview PDF
function showPdfPreviewModal(previewUrl, downloadUrl, reportNumber) {
  document.getElementById("modalReportTitle").innerText =
    "Preview Laporan: " + reportNumber;
  document.getElementById("pdfPreviewIframe").src = previewUrl;
  // document.getElementById("btnDownloadPdf").href = downloadUrl;

  document.getElementById("pdfModal").style.display = "flex";
}

// Fungsi untuk menutup Pop-Up Modal
function closePdfModal() {
  document.getElementById("pdfModal").style.display = "none";
  document.getElementById("pdfPreviewIframe").src = "";
}

/* =====================================================
   PHOTO MANAGEMENT
===================================================== */

let beforePhotos = [];
let afterPhotos = [];

/* =====================================================
   BEFORE PHOTO
===================================================== */

document.getElementById("beforePhoto").addEventListener("change", function (e) {
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    if (beforePhotos.length < 5) {
      beforePhotos.push(file);
    }
  });

  renderBeforePhotos();

  this.value = "";
});

function renderBeforePhotos() {
  const container = document.getElementById("beforePreviewContainer");

  container.innerHTML = "";

  beforePhotos.forEach((file, index) => {
    const imageUrl = URL.createObjectURL(file);

    container.innerHTML += `
      <div class="relative">

        <img
          src="${imageUrl}"
          class="w-full h-32 object-cover rounded-xl border-2 border-black"
        >

        <button
          type="button"
          onclick="removeBeforePhoto(${index})"
          class="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded"
        >
          ✕
        </button>

      </div>
    `;
  });
}

function removeBeforePhoto(index) {
  beforePhotos.splice(index, 1);

  renderBeforePhotos();
}

/* =====================================================
   AFTER PHOTO
===================================================== */

document.getElementById("afterPhoto").addEventListener("change", function (e) {
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    if (afterPhotos.length < 5) {
      afterPhotos.push(file);
    }
  });

  renderAfterPhotos();

  this.value = "";
});

function renderAfterPhotos() {
  const container = document.getElementById("afterPreviewContainer");

  container.innerHTML = "";

  afterPhotos.forEach((file, index) => {
    const imageUrl = URL.createObjectURL(file);

    container.innerHTML += `
      <div class="relative">

        <img
          src="${imageUrl}"
          class="w-full h-32 object-cover rounded-xl border-2 border-black"
        >

        <button
          type="button"
          onclick="removeAfterPhoto(${index})"
          class="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded"
        >
          ✕
        </button>

      </div>
    `;
  });
}

function removeAfterPhoto(index) {
  afterPhotos.splice(index, 1);

  renderAfterPhotos();
}

/* =====================================================
   FILE TO BASE64
===================================================== */
async function fileToBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.readAsDataURL(file);
  });
}

/* =====================================
   DOWNLOAD PDF
===================================== */

document.getElementById("pdfBtn").addEventListener("click", function () {
  if (!latestPdfUrl) {
    alert(
      "Belum ada PDF yang dibuat.\n\nSilakan simpan laporan terlebih dahulu.",
    );

    return;
  }

  window.open(latestPdfUrl, "_blank");
});

// =====================================
// LOGIKA CANVAS TANDA TANGAN
// =====================================
const canvas = document.getElementById("signatureCanvas");
const ctx = canvas.getContext("2d");
let isDrawing = false;
let isSignatureEmpty = true;

// Setup awal gaya garis
function setStyle() {
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

// Menyesuaikan ukuran buffer canvas dengan ukuran asli layar HP/Browser
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;

  // Set ukuran internal buffer canvas sesuai ukuran elemen CSS di layar
  canvas.width = rect.width;
  canvas.height = rect.height;
  setStyle(); // Reset style setelah resize
}

// Jalankan saat load & saat layar HP di-rotate
window.addEventListener("load", resizeCanvas);
window.addEventListener("resize", resizeCanvas);

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // Kalkulasi skala jika CSS width beda dengan internal canvas width
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

function startDrawing(e) {
  // Cegah scroll halaman di HP saat mulai menyentuh canvas
  if (e.type === "touchstart") e.preventDefault();

  isDrawing = true;
  isSignatureEmpty = false;
  const pos = getPos(e);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(e) {
  if (!isDrawing) return;
  if (e.cancelable) e.preventDefault(); // Mencegah layar HP scroll saat garis ditarik

  const pos = getPos(e);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

// Event Listener Mouse (Desktop)
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

// Event Listener Touchscreen (HP)
canvas.addEventListener("touchstart", startDrawing, { passive: false });
canvas.addEventListener("touchmove", draw, { passive: false });
canvas.addEventListener("touchend", stopDrawing);

// Tombol Reset Canvas
document.getElementById("clearSignatureBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  isSignatureEmpty = true;
});
