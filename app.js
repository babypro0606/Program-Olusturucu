// Mevcut bağlantılar...
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

// YENİ: Kopyala-Yapıştır Popup Bağlantıları
const gunIslemPopup = document.getElementById("gunIslemPopup");
const islemGunBaslik = document.getElementById("islemGunBaslik");
const kopyalaBtn = document.getElementById("kopyalaBtn");
const yapistirBtn = document.getElementById("yapistirBtn");
const gunIslemIptalBtn = document.getElementById("gunIslemIptalBtn");

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

// RENK PALETİ
const renkPaleti = ["#FF3B30", "#007AFF", "#34C759", "#FF9500", "#AF52DE", "#FF2D55", "#00C7BE", "#5856D6", "#E69A8D", "#17A2B8"];

function ismeGoreRenkUret(isim) {
    let hash = 0;
    for (let i = 0; i < isim.length; i++) {
        hash = isim.charCodeAt(i) + ((hash << 5) - hash);
    }
    return renkPaleti[Math.abs(hash) % renkPaleti.length];
}

// Verileri çekme
let planlar = JSON.parse(localStorage.getItem("haftalikPlanlar")) || [];
planlar.forEach(plan => ekranaKutuCiz(plan));


// ----------------------------------------------------
// YENİ ÖZELLİK: GÜN BAŞLIKLARINA BASILI TUTMA (LONG PRESS)
// ----------------------------------------------------
let seciliIslemGunu = null;  // Hangi gün başlığına tıklandı?
let kopyalananGun = null;    // Hangi günün verileri kopyalandı?
let basiliTutmaZamanlayici;  // Parmağı ekranda tutma süresini sayar

document.querySelectorAll(".gun-baslik").forEach(baslik => {
    const gunId = baslik.parentElement.id; // Örneğin: "Pazartesi"
    const gunIsmi = baslik.textContent;    // Örneğin: "Pzt"

    // Mobil ekranlarda dokunma başladığında sayacı başlat (600 milisaniye)
    baslik.addEventListener("touchstart", () => {
        basiliTutmaZamanlayici = setTimeout(() => popupAc(gunId, gunIsmi), 600);
    });
    // Bilgisayarda tıklama başladığında
    baslik.addEventListener("mousedown", () => {
        basiliTutmaZamanlayici = setTimeout(() => popupAc(gunId, gunIsmi), 600);
    });

    // Parmak çekilirse veya fare kayarsa işlemi iptal et
    const iptalEt = () => clearTimeout(basiliTutmaZamanlayici);
    baslik.addEventListener("touchend", iptalEt);
    baslik.addEventListener("touchmove", iptalEt);
    baslik.addEventListener("mouseup", iptalEt);
    baslik.addEventListener("mouseleave", iptalEt);
});

// Basılı tutma başarılı olursa menüyü aç
function popupAc(gunId, gunIsmi) {
    seciliIslemGunu = gunId;
    islemGunBaslik.textContent = gunId + " Günü"; // Pzt yerine Pazartesi yazsın
    
    // Eğer daha önceden bir gün kopyalanmışsa Yapıştır butonunu göster
    if (kopyalananGun) {
        yapistirBtn.style.display = "block";
        yapistirBtn.textContent = `(${kopyalananGun}) Buraya Yapıştır`;
    } else {
        yapistirBtn.style.display = "none";
    }
    
    gunIslemPopup.style.display = "flex";
}

// Kopyala Butonuna Basıldığında
kopyalaBtn.addEventListener("click", () => {
    kopyalananGun = seciliIslemGunu; // Seçilen günü kopyalanan olarak hafızaya al
    gunIslemPopup.style.display = "none"; // Popup'ı kapat
});

// Yapıştır Butonuna Basıldığında
yapistirBtn.addEventListener("click", () => {
    if (!kopyalananGun || !seciliIslemGunu) return;
    
    // Kopyalanan günün tüm planlarını bul
    const kopyalananPlanlar = planlar.filter(p => p.gun === kopyalananGun);
    
    // Kopyalanan her bir planı yeni güne göre çoğalt
    kopyalananPlanlar.forEach((plan, index) => {
        const yeniPlan = {
            ...plan, // Eski özellikleri al
            id: Date.now() + index, // Orijinaliyle karışmasın diye yeni kimlik no ver
            gun: seciliIslemGunu // Günü, yapıştırmak istediğimiz yeni gün ile değiştir
        };
        planlar.push(yeniPlan);
        ekranaKutuCiz(yeniPlan);
    });
    
    // Yeni görevlerle birlikte hafızaya kaydet
    localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar));
    
    // İşlem bittikten sonra kopyalama hafızasını sıfırla ve pencereyi kapat
    kopyalananGun = null;
    gunIslemPopup.style.display = "none";
});

// Vazgeç butonu
gunIslemIptalBtn.addEventListener("click", () => gunIslemPopup.style.display = "none");
// ----------------------------------------------------


// Popup kontrolleri
yeniEkleBtn.addEventListener("click", () => popup.style.display = "flex");
kapatBtn.addEventListener("click", () => popup.style.display = "none");
silmeIptalBtn.addEventListener("click", () => {
    silmePopup.style.display = "none";
    silinecekGorevKutusu = null;
    silinecekGorevId = null;
});

// Görev silme
silmeOnayBtn.addEventListener("click", () => {
    if (silinecekGorevKutusu && silinecekGorevId) {
        silinecekGorevKutusu.remove(); 
        planlar = planlar.filter(p => p.id !== silinecekGorevId);
        localStorage.setItem("haftalikPlanlar", JSON.stringify(planlar)); 
    }
    silmePopup.style.display = "none";
});

// Yeni görev ekleme
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

function ekranaKutuCiz(plan) {
    const kutuYuksekligi = (plan.bitisDakika - plan.baslangicDakika) * 1.5;

    const gorevKutusu = document.createElement("div");
    gorevKutusu.className = "gorev-kutu";
    gorevKutusu.style.height = kutuYuksekligi + "px";
    gorevKutusu.style.order = plan.baslangicDakika;
    
    gorevKutusu.style.backgroundColor = ismeGoreRenkUret(plan.isim);
    
    gorevKutusu.innerHTML = `<strong style="font-size:11px; opacity:0.9;">${plan.baslangic} - ${plan.bitis}</strong><br><span style="font-size:13px; font-weight:500;">${plan.isim}</span>`;

    gorevKutusu.addEventListener("click", function() {
        silinecekGorevKutusu = this;
        silinecekGorevId = plan.id;
        silmePopup.style.display = "flex";
    });

    document.getElementById(plan.gun).appendChild(gorevKutusu);
}
