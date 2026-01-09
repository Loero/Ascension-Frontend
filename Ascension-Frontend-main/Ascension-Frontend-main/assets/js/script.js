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

/* ================================
   KEZDŐLAP: SPLASH + AUDIO KEZELÉS
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const splash = document.getElementById("splash");
  const pageAudio = document.getElementById("page-audio");
  const pillAudio = document.getElementById("pill-audio");
  const volumeBtn = document.getElementById("volume-toggle");

  if (!splash || !pageAudio || !volumeBtn) return; // csak a kezdőlapon fut

  let started = false;

  async function startExperience() {
    if (started) return;
    started = true;

    // Rejtse el az overlay-t
    splash.style.opacity = "0";
    // Engedjük látszani az oldalt és indítsuk az animációkat
    document.body.classList.add("page-loaded");
    document.body.classList.remove("splash-visible");
    setTimeout(() => {
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
    }, 300);

    try {
      // Elsőként rövid "pill" hang, ha van
      if (pillAudio) {
        pillAudio.currentTime = 0;
        await pillAudio.play().catch(() => {});
      }
      // Háttérzene
      pageAudio.muted = false;
      pageAudio.volume = 0.5;
      await pageAudio.play().catch(() => {
        // Ha nem sikerül azonnal, maradjon elérhető a gombbal
      });
      updateVolumeButton();
    } catch (e) {
      // Ignoráljuk a böngésző autoplay blokkját, a gomb megoldja
    }
  }

  function updateVolumeButton() {
    // Állapot osztályok (CSS ikonokhoz)
    if (pageAudio.paused || pageAudio.muted) {
      volumeBtn.classList.add("muted");
      volumeBtn.classList.remove("playing");
    } else {
      volumeBtn.classList.remove("muted");
      volumeBtn.classList.add("playing");
    }
  }

  // Splash kattintás / billentyű
  splash.addEventListener("click", startExperience);
  splash.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") startExperience();
  });

  // Hangerő gomb: play/pause + mute toggle
  volumeBtn.addEventListener("click", async () => {
    // Ha még nem indult semmi, indítsuk el a zenét
    if (!started) await startExperience();

    if (pageAudio.paused) {
      pageAudio.muted = false;
      await pageAudio.play().catch(() => {});
    } else {
      // Néma helyett használjunk pause-t, hogy egyértelmű legyen
      pageAudio.pause();
    }
    updateVolumeButton();
  });
});
