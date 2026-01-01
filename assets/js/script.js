/* ================================
   ARC FELTÖLTÉS + AI ELEMZÉS
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("faceUploadForm");
  const input = document.getElementById("faceImage");
  const preview = document.getElementById("facePreview");
  const resultBox = document.getElementById("aiResult");

  if (!form || !input || !preview || !resultBox) return;

  // KÉP ELŐNÉZET
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  // FELTÖLTÉS → BACKEND → VÁLASZ
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = input.files[0];
    if (!file) {
      resultBox.innerHTML = "❌ Nincs kép kiválasztva";
      resultBox.style.display = "block";
      return;
    }

    resultBox.innerHTML = "⏳ Elemzés folyamatban...";
    resultBox.style.display = "block";

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:3000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.error) {
        resultBox.innerHTML = "❌ Elemzés sikertelen";
        return;
      }

      resultBox.innerHTML = `
        <h4>AI elemzés eredménye</h4>
        <pre style="white-space:pre-wrap; font-size:0.9em;">
${JSON.stringify(data, null, 2)}
        </pre>
      `;
    } catch (err) {
      resultBox.innerHTML = "❌ Nem érhető el a szerver";
    }
  });
});
