cat > app.js << 'EOF'
const $ = (id) => document.getElementById(id);

function show(el, lines) {
  el.hidden = false;
  el.textContent = "";                       // textContent = safe, no HTML injection
  lines.forEach((l) => {
    const p = document.createElement("div");
    p.textContent = l;
    el.appendChild(p);
  });
}

// ---- 1) IP geolocation (runs ONLY after the button is tapped) ----
$("guessBtn").addEventListener("click", async () => {
  const btn = $("guessBtn"), out = $("guessOut");
  btn.disabled = true;
  show(out, ["🔍 Scanning... / Ana bincike..."]);
  try {
    await new Promise((r) => setTimeout(r, 1200));   // just for the prank effect
    const res = await fetch("https://ipwho.is/");
    const d = await res.json();
    if (!d.success) throw new Error("Lookup failed");
    show(out, [
      "🎯 My guess / Hasashena:",
      "Country / Ƙasa: " + d.country,
      "Region / Yanki: " + d.region,
      "City / Birni: " + d.city,
      "(Estimate of your internet provider's area, not your address. / Kimantawa ce kawai.)"
    ]);
  } catch (e) {
    show(out, ["😅 Couldn't guess. Check your internet or try again. / Ba a samu ba; sake gwadawa."]);
  } finally {
    btn.disabled = false;
  }
});

// ---- 2) GPS (explicit browser permission) ----
$("gpsBtn").addEventListener("click", () => {
  const out = $("gpsOut");
  if (!window.isSecureContext) {
    show(out, ["🔐 GPS needs HTTPS (or localhost). / GPS yana buƙatar HTTPS."]);
    return;
  }
  if (!navigator.geolocation) {
    show(out, ["Your browser doesn't support GPS location. / Browser ɗinka ba ya goyon bayan GPS."]);
    return;
  }
  show(out, ["📡 Waiting for your permission... / Ana jiran izininka..."]);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const c = pos.coords;
      show(out, [
        "✅ Permission granted / An ba da izini",
        "Latitude: " + c.latitude.toFixed(5),
        "Longitude: " + c.longitude.toFixed(5),
        "Accuracy / Daidaito: ±" + Math.round(c.accuracy) + " meters"
      ]);
    },
    (err) => {
      const msgs = {
        1: "No problem! You chose not to share. 😊 / Babu damuwa! Ka zaɓi ba za ka bayar ba.",
        2: "Location unavailable. Turn on Location in phone settings. / Kunna Location a saitin waya.",
        3: "Timed out. Try again, ideally outdoors. / Lokaci ya ƙare; sake gwadawa."
      };
      show(out, [msgs[err.code] || "Unknown error."]);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
});
EOF
