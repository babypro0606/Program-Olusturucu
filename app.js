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
const gunIslemPopup = document.getElementById("gunIslemPopup");
const islemGunBaslik = document.getElementById("islemGunBaslik");
const kopyalaBtn = document.getElementById("kopyalaBtn");
const yapistirBtn = document.getElementById("yapistirBtn");
const gunuTemizleBtn = document.getElementById("gunuTemizleBtn");
const gunIslemIptalBtn = document.getElementById("gunIslemIptalBtn");

// YENİ: Renk Değiştirme Bağlantıları
const renkPopup = document.getElementById("renkPopup");
const renkPaletiAlani = document.getElementById("renkPaletiAlani");
const renkIptalBtn = document.getElementById("renkIptalBtn");

let silinecekGorevKutusu = null;
let silinecekGorevId = null;
let renkDegisecekPlanId = null;

// Tema
let mevcutTema = localStorage.getItem("tema") || "light";
if (mevcutTema === "dark") { document.body.classList.add("dark-theme"); temaBtn.textContent = "☀️"; }
temaBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    localStorage.setItem("tema", document.body.classList.contains("dark-theme") ? "dark" : "light");
    temaBtn.textContent = document.body.classList.contains("dark-theme") ? "☀️" : "🌙";
});

// Renk Paleti ve Algoritma
const renkPaleti = ["#FF3B30", "#007AFF", "#34C759", "#FF9500", "#AF52DE", "#FF2D55", "#00C7BE", "#5856D6", "#E69A8D", "#17A2B8"];
function ismeGoreRenkUret(isim) {
    let hash = 0;
    for (let i = 0; i < isim.length; i++) hash = isim.charCodeAt(i) + ((hash << 5) - hash);
    return renkPaleti[Math.abs(hash) % renkPaleti.length];
}

// Renk Seçeneklerini Menüye Ekle
renkPaleti.forEach(renk => {
    const daire = document.createElement("div");
    daire.className = "renk-daire";
    daire.style.backgroundColor = renk;
    daire.addEventListener("click", () => {
        if (renkDegisecekPlanId) {
            const plan = planlar.find(p => p.id === renkDegisecekPlanId);
            if (plan) {
                plan.ozelRenk = renk; // Özel rengi plana kaydet
                localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar));
                
                // Ekranı temizle ve güncel renklerle tekrar çiz
                document.querySelectorAll(".gorev-kutu").forEach(k => k.remove());
                planlar.forEach(p => ekranaKutuCiz(p));
            }
        }
        renkPopup.style.display = "none";
    });
    renkPaletiAlani.appendChild(daire);
});
renkIptalBtn.addEventListener("click", () => renkPopup.style.display = "none");

// Veri Çekme
let planlar = JSON.parse(localStorage.getItem("haftalikPlanlar")) || [];
planlar.forEach(plan => ekranaKutuCiz(plan));

// Gün Kopyalama İşlemleri
let seciliIslemGunu = null;  
let kopyalananGun = null;    
let basiliTutmaZamanlayici;  
document.querySelectorAll(".gun-baslik").forEach(baslik => {
    const gunId = baslik.parentElement.id; 
    const gunIsmi = baslik.textContent;    
    baslik.addEventListener("touchstart", () => basiliTutmaZamanlayici = setTimeout(() => popupAc(gunId, gunIsmi), 600));
    baslik.addEventListener("mousedown", () => basiliTutmaZamanlayici = setTimeout(() => popupAc(gunId, gunIsmi), 600));
    const iptalEt = () => clearTimeout(basiliTutmaZamanlayici);
    baslik.addEventListener("touchend", iptalEt);
    baslik.addEventListener("mouseup", iptalEt);
    baslik.addEventListener("mouseleave", iptalEt);
    baslik.addEventListener("contextmenu", (e) => e.preventDefault());
});

function popupAc(gunId, gunIsmi) {
    seciliIslemGunu = gunId;
    islemGunBaslik.textContent = gunId + " Günü";
    yapistirBtn.style.display = kopyalananGun ? "block" : "none";
    if (kopyalananGun) yapistirBtn.textContent = `(${kopyalananGun}) Buraya Yapıştır`;
    gunIslemPopup.style.display = "flex";
}
kopyalaBtn.addEventListener("click", () => { kopyalananGun = seciliIslemGunu; gunIslemPopup.style.display = "none"; });
yapistirBtn.addEventListener("click", () => {
    if (!kopyalananGun || !seciliIslemGunu) return;
    const kopyalananPlanlar = planlar.filter(p => p.gun === kopyalananGun);
    kopyalananPlanlar.forEach((plan, index) => {
        const yeniPlan = { ...plan, id: Date.now() + index, gun: seciliIslemGunu };
        planlar.push(yeniPlan);
        ekranaKutuCiz(yeniPlan);
    });
    localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar));
    kopyalananGun = null;
    gunIslemPopup.style.display = "none";
});
gunuTemizleBtn.addEventListener("click", () => {
    if (confirm(`${seciliIslemGunu} günündeki tüm planları silmek istediğine emin misin?`)) {
        document.getElementById(seciliIslemGunu).querySelectorAll(".gorev-kutu").forEach(kutu => kutu.remove());
        planlar = planlar.filter(p => p.gun !== seciliIslemGunu);
        localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar));
        gunIslemPopup.style.display = "none";
    }
});
gunIslemIptalBtn.addEventListener("click", () => gunIslemPopup.style.display = "none");

// Normal Form ve Silme Kontrolleri
yeniEkleBtn.addEventListener("click", () => popup.style.display = "flex");
kapatBtn.addEventListener("click", () => popup.style.display = "none");
silmeIptalBtn.addEventListener("click", () => { silmePopup.style.display = "none"; silinecekGorevKutusu = null; silinecekGorevId = null; });
silmeOnayBtn.addEventListener("click", () => {
    if (silinecekGorevKutusu && silinecekGorevId) {
        silinecekGorevKutusu.remove(); 
        planlar = planlar.filter(p => p.id !== silinecekGorevId);
        localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar)); 
    }
    silmePopup.style.display = "none";
});

// Yeni Görev Ekleme
kaydetBtn.addEventListener("click", () => {
    if (!gorevInput.value || !baslangicSaati.value || !bitisSaati.value) return alert("Lütfen tüm alanları doldur!");
    const bParca = baslangicSaati.value.split(":"), bitParca = bitisSaati.value.split(":");
    const bDakika = parseInt(bParca[0]) * 60 + parseInt(bParca[1]), bitDakika = parseInt(bitParca[0]) * 60 + parseInt(bitParca[1]);
    if (bitDakika <= bDakika) return alert("Bitiş saati, başlangıç saatinden sonra olmalıdır!");
    
    const yeniPlan = { id: Date.now(), gun: gunSecici.value, baslangic: baslangicSaati.value, bitis: bitisSaati.value, isim: gorevInput.value.trim(), baslangicDakika: bDakika, bitisDakika: bitDakika };
    planlar.push(yeniPlan);
    localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar));
    ekranaKutuCiz(yeniPlan);
    gorevInput.value = ""; baslangicSaati.value = ""; bitisSaati.value = ""; popup.style.display = "none";
});

// Ekrana Çizme ve Görev Üzeri Etkileşimler
function ekranaKutuCiz(plan) {
    const gorevKutusu = document.createElement("div");
    gorevKutusu.className = "gorev-kutu";
    gorevKutusu.style.height = ((plan.bitisDakika - plan.baslangicDakika) * 1.5) + "px";
    gorevKutusu.style.order = plan.baslangicDakika;
    gorevKutusu.style.backgroundColor = plan.ozelRenk || ismeGoreRenkUret(plan.isim);
    gorevKutusu.innerHTML = `<strong style="font-size:11px; opacity:0.9;">${plan.baslangic} - ${plan.bitis}</strong><br><span style="font-size:13px; font-weight:500;">${plan.isim}</span>`;

    let uzunBasildi = false;
    let basmaZamanlayici;

    // Görev Uzun Basma İşlemleri (Renk Seçimi)
    const basla = () => { uzunBasildi = false; basmaZamanlayici = setTimeout(() => { uzunBasildi = true; renkDegisecekPlanId = plan.id; renkPopup.style.display = "flex"; }, 600); };
    const durdur = () => clearTimeout(basmaZamanlayici);

    gorevKutusu.addEventListener("touchstart", basla);
    gorevKutusu.addEventListener("mousedown", basla);
    gorevKutusu.addEventListener("touchend", durdur);
    gorevKutusu.addEventListener("mouseup", durdur);
    gorevKutusu.addEventListener("mouseleave", durdur);
    gorevKutusu.addEventListener("contextmenu", (e) => e.preventDefault());

    // Görev Kısa Tıklama İşlemi (Silme)
    gorevKutusu.addEventListener("click", function() {
        if (uzunBasildi) return; // Uzun basıldıysa silme ekranını açma
        silinecekGorevKutusu = this;
        silinecekGorevId = plan.id;
        silmePopup.style.display = "flex";
    });

    document.getElementById(plan.gun).appendChild(gorevKutusu);
}
