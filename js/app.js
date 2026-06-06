/* =====================================================
   CONFIGURATION
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbzNIoU7sRF7I2k39QPbX21KsFXN1MLUUwbci_U9GH623QEaPV_mpf75TyMcx5MF-Z4M/exec";

/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  loadReportNumber();
  loadCustomers();
  loadModels();
  loadTechnicians();
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
  const data = await getData("models");

  const select = document.getElementById("model");

  select.innerHTML = '<option value="">Pilih Model</option>';

  data.forEach((model) => {
    select.innerHTML += `<option>${model}</option>`;
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
        beforeLinks.push(uploadResult.url);
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
        afterLinks.push(uploadResult.url);
      }
    }

    /* =====================================
       SIMPAN LAPORAN
    ===================================== */

    const formData = new FormData();

    formData.append("action", "save");

    formData.append("customer", document.getElementById("customer").value);

    formData.append("no_project", document.getElementById("noProject").value);

    formData.append(
      "nama_project",
      document.getElementById("namaProject").value,
    );

    formData.append("alamat", document.getElementById("alamat").value);

    formData.append("model_sistem", document.getElementById("model").value);

    formData.append("parameter", parameter);

    formData.append("kategori", kategori);

    formData.append("teknisi", document.getElementById("teknisi").value);

    formData.append("deskripsi", document.getElementById("deskripsi").value);

    formData.append("status", document.getElementById("status").value);

    formData.append("before_links", beforeLinks.join("\n"));

    formData.append("after_links", afterLinks.join("\n"));

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      alert("Laporan berhasil disimpan\n\n" + result.report_number);

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
