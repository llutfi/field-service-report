/* =====================================================
   CONFIGURATION
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbzzk_iy2viYWTpPisHSZVT6_okXsq9E6IPGotqO0H_wCAGjU8CBRQmP5tod1fwf0BWFLg/exec";

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

  // kode simpan laporan
}
