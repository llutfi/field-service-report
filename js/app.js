const API_URL =
  "https://script.google.com/macros/s/AKfycbyPu0haVpEgK6BKaTKvSD8dWR-BqIx_p0V5_PlY5Y5VtGjzl82N5jMfKVneHHsI5EEn7A/exec";

const form = document.getElementById("reportForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    no_laporan: "FSR-" + Date.now(),

    tanggal: document.getElementById("tanggal").value,

    customer: document.getElementById("customer").value,

    no_project: document.getElementById("no_project").value,

    nama_project: document.getElementById("nama_project").value,

    alamat: document.getElementById("alamat").value,

    model_sistem: document.getElementById("model_sistem").value,

    parameter: document.getElementById("parameter").value,

    kategori: document.getElementById("kategori").value,

    deskripsi: document.getElementById("deskripsi").value,

    hasil: document.getElementById("hasil").value,
  };

  try {
    await fetch(API_URL, {
      method: "POST",

      body: JSON.stringify(data),
    });

    alert("Laporan berhasil disimpan");

    form.reset();
  } catch (err) {
    alert("Gagal menyimpan");
  }
});
