// Arayüz elemanları
const yeniEkleBtn = document.getElementById("yeniEkleBtn");
const popup = document.getElementById("eklemePopup");
const kapatBtn = document.getElementById("kapatBtn");
const kaydetBtn = document.getElementById("kaydetBtn");
const gorevInput = document.getElementById("gorevInput");
const gunSecici = document.getElementById("gunSecici");
const baslangicSaati = document.getElementById("baslangicSaati");
const bitisSaati = document.getElementById("bitisSaati");
const silmePopup = document.getElementById("silmePopup");
const silmeIptalBtn = document.getElementById("silmeIptalBtn");
const silmeOnayBtn = document.getElementById("silmeOnayBtn");
const temaBtn = document.getElementById("temaBtn");

let silinecekGorevKutusu = null;
let silinecekGorevId = null;

// TEMA YÖNETİMİ
let mevcutTema = localStorage.getItem("tema") || "light";
if (mevcutTema === "dark") {
    document.body.classList.add("dark-theme");
    temaBtn.textContent = "☀️";
}

temaBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("tema", "dark");
        temaBtn.textContent = "☀️";
    } else {
        localStorage.setItem("tema", "light");
        temaBtn.textContent = "🌙";
    }
});

// BELİRGİN, CANLI VE MODERN RENK PALETİ
const renkPaleti = [
    "#FF3B30", // Kırmızı
    "#007AFF", // Mavi
    "#34C759", // Yeşil
    "#FF9500", // Turuncu
    "#AF52DE", // Mor
    "#FF2D55", // Pembe
    "#00C7BE", // Turkuaz
    "#5856D6", // Lacivert/Mor
    "#E69A8D", // Somon
    "#17A2B8"  // Cam Göbeği
];

// İsme göre her zaman aynı canlı rengi seçen algoritma
function ismeGoreRenkUret(isim) {
    let hash = 0;
    for (let i = 0; i < isim.length; i++) {
        hash = isim.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % renkPaleti.length;
    return renkPaleti[index];
}

// Verileri çekme
let planlar = JSON.parse(localStorage.getItem("haftalikPlanlar")) || [];
planlar.forEach(plan => ekranaKutuCiz(plan));

// Popup kontrolleri
yeniEkleBtn.addEventListener("click", () => popup.style.display = "flex");
kapatBtn.addEventListener("click", () => popup.style.display = "none");
silmeIptalBtn.addEventListener("click", () => {
    silmePopup.style.display = "none";
    silinecekGorevKutusu = null;
    silinecekGorevId = null;
});

// Görev silme işlemi
silmeOnayBtn.addEventListener("click", () => {
    if (silinecekGorevKutusu && silinecekGorevId) {
        silinecekGorevKutusu.remove(); 
        planlar = planlar.filter(p => p.id !== silinecekGorevId);
        localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar)); 
    }
    silmePopup.style.display = "none";
});

// Yeni görev kaydetme
kaydetBtn.addEventListener("click", () => {
    if (!gorevInput.value || !baslangicSaati.value || !bitisSaati.value) {
        alert("Lütfen tüm alanları doldur!");
        return;
    }

    const bParca = baslangicSaati.value.split(":");
    const bitParca = bitisSaati.value.split(":");
    const bDakika = parseInt(bParca[0]) * 60 + parseInt(bParca[1]);
    const bitDakika = parseInt(bitParca[0]) * 60 + parseInt(bitParca[1]);

    if (bitDakika <= bDakika) {
        alert("Bitiş saati, başlangıç saatinden sonra olmalıdır!");
        return;
    }

    const yeniPlan = {
        id: Date.now(),
        gun: gunSecici.value,
        baslangic: baslangicSaati.value,
        bitis: bitisSaati.value,
        isim: gorevInput.value.trim(), 
        baslangicDakika: bDakika,
        bitisDakika: bitDakika
    };

    planlar.push(yeniPlan);
    localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar));
    ekranaKutuCiz(yeniPlan);

    gorevInput.value = "";
    baslangicSaati.value = "";
    bitisSaati.value = "";
    popup.style.display = "none";
});

// Ekrana çizme fonksiyonu
function ekranaKutuCiz(plan) {
    const kutuYuksekligi = (plan.bitisDakika - plan.baslangicDakika) * 1.5;

    const gorevKutusu = document.createElement("div");
    gorevKutusu.className = "gorev-kutu";
    gorevKutusu.style.height = kutuYuksekligi + "px";
    gorevKutusu.style.order = plan.baslangicDakika;
    
    // Sabit paletten alınan rengi uyguluyoruz
    gorevKutusu.style.backgroundColor = ismeGoreRenkUret(plan.isim);
    
    gorevKutusu.innerHTML = `<strong style="font-size:11px; opacity:0.9;">${plan.baslangic} - ${plan.bitis}</strong><br><span style="font-size:13px; font-weight:500;">${plan.isim}</span>`;

    gorevKutusu.addEventListener("click", function() {
        silinecekGorevKutusu = this;
        silinecekGorevId = plan.id;
        silmePopup.style.display = "flex";
    });

    document.getElementById(plan.gun).appendChild(gorevKutusu);
}