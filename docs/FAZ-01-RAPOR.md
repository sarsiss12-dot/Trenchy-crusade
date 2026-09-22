# Geliştirici Raporu — Faz 01

**Proje:** Trench Crusade: Ashen Crossing
**Teslim:** İlk oynanabilir RTS temeli, v0.1.0
**Teknoloji:** HTML5, modüler JavaScript, doğrudan WebGL 2, Web Audio

## Eklenenler

İki oynanabilir faction; kaynak kazanma, gerçek bina yerleştirme ve inşa süresi, manga üretimi, hareket, ateş, kayıp, üs yıkımı ve zafer/yenilgi döngüsü kuruldu. Harici görsel, model, ses veya kütüphane kullanılmadı.

### Yapılar

| New Antioch | Black Grail | İşlev |
|---|---|---|
| Sefer Karargâhı | Çürüme Katedrali | Başlangıç yapısı; kaybı yenilgi. Bu fazda yeniden kurulamaz. |
| Haçlı Kışlası | Kuluçka Ocağı | Piyade / ağır manga ve 3 siparişlik üretim kuyruğu |
| Mühendis Atölyesi | Et Dokuma Yuvası | Ağır manga açma, 14 m içindeki yapıları onarma |
| İkmal Deposu | Safra Sarnıcı | +2 kaynak/sn |
| Saha Hastanesi | Veba Bahçesi | 12 m içindeki çatışma dışı yaşayan askerleri iyileştirme |
| Nöbet Kulesi | Diken Nöbetçisi | 22 m menzilli otomatik savunma |
| Savaş Şapeli | Kara Kâse Sunağı | 18 m içindeki mangalara %20 hasar desteği |

Antioch taş, metal, sancak ve askeri tesisler kullanır. Grail keseler, etsi gövdeler, kaburgalar, mantarlar ve dikenlerle ayrı modeller kullanır. Stratejik yapı rolleri bu fazda paraleldir; faction yetenekleri henüz asimetrik değildir. İnşa sırasında Antioch iskele ve yükselen hacimle, Grail büyüyen organik hacimle gösterilir.

### Harita ve çatışma

112 × 112 m Kül Geçidi; paralel siper hatları, krater ve çamur bölgeleri, dört orman alanı, nehir, üç köprü, enkaz, yıkık duvarlar ve duman. Arazi hız ve hasar çarpanlarıyla oynanışı etkiler. Suyun köprüler dışında geçişi engellenir; yapılar yol bulmada engeldir.

Her manga sekiz ayrı asker görseliyle başlar. Can ve ateş çözümü manga düzeyindedir; kayıplar asker sayısını azaltır. Hastane kayıpları diriltmez. Can, temel ateş, tracer, ölüm efekti, yapı yıkımı, ağır manga ve alan destekleri bulunur. Maksimum toplam 20 manga / 160 asker.

### Kontrol ve arayüz

Dokun-seç, zemine dokun-hareket, düşmana dokun-saldır; ayrı kamera / alan seçim modları; iki parmak yakınlaştırma; minimap üzerinden kamera taşıma; seçim, sağlık ve emir yolu göstergeleri; kaynak ve üretim bilgisi; olay bildirimleri. FPS, aktif manga/asker, görünür manga/yapı, çizim grubu ve LOD sayaçları ekranda gösterilir.

### Mimari ve performans

Veri, arazi/yol bulma, simülasyon, AI, renderer, sanat, ses ve UI ayrı modüllerdir. Simülasyon sabit 20 Hz adımla çalışır. WebGL instancing, statik GPU tamponları, kamera dışı dinamik eleme, DPR sınırı ve yakın ayrıntıların dither geçişi uygulanır. Uzak LOD sade 3D'dir. 160 asker senaryosu ana sefer kaydını değiştirmez.

AI kaynak kullanır, eksik yapı rollerini kurar, asker üretir, yakın tehdide savunma verir, ikmal noktalarına yönelir ve yeterli kuvvetle düşman karargâhına saldırı emri verir. Bu davranışlar `ai.js` içinde bağımsızdır.

## Doğrulama

**17/17 test geçti.**

- 13 simülasyon testi: ilk ordu, geçitlerden yol bulma, iki faction'ın altı inşa edilebilir rolü, geçersiz yerleşimler, iptal/iade, sekiz kişilik üretim ve kapasite, ağır birlik koşulu, nokta ele geçirme/gelir, savaş/siper, karargâh zaferi, kayıt, AI ve ölüleri diriltmeyen hastane.
- 4 olay bağlantısı testi: bağımsız HTML açılışı, seçim/hareket ile kamera sürüklemesinin ayrılması, yapı seçimi–zemin–onay akışı ve performans senaryosunda kayıt koruma. Bunlar sahte DOM/WebGL ortamında çalıştırıldı; gerçek tarayıcı testi değildir.
- GLES 3 yazılım çizicisinde gerçek shader derleme/linkleme, Antioch ve Grail yapı sahneleri ile 160 askerli sahne çizimi başarılı; GL hata kodu 0.
- Görsel kontrolde arazi karolaması azaltıldı, prosedürel yüzey dokusu eklendi ve yüzey normal yönleri düzeltildi.
- Paket bağımsız HTML ve modüler kaynakları birlikte içerir.

## Bilinen sınırlar

1. **Gerçek Android cihazında FPS, çoklu dokunma, ekran çentiği ve arka plandan dönüş doğrulanmadı.** Tarayıcı ortamı yerel oyun dosyasını güvenlik politikası nedeniyle açmadı; gerçek tarayıcı UI testi tamamlanmadı. 30/60 FPS garantisi verilmez.
2. Savaş görüşü / sis yok; minimap düşmanları gösterir. Orman gizlenme yerine hasar azaltma uygular.
3. Atış görüş hattı, mermi fiziği ve bina arkasında tam koruma yok; temel menzil kontrolü kullanılır.
4. Askerler bireysel görseldir; gezinme ve sağlık manga merkezlidir. Sıkışık geçitlerde dizilim su kenarına veya dekorlara taşabilir. Formasyonlar dönüşte basitçe döner.
5. Gerçek zamanlı gölge haritası, gelişmiş iskelet animasyonu, sprite atlası, patlayan arazi ve ağır post-processing yok. Temas gölgeleri basit geometriyle verilir.
6. AI başlangıç düzeyinde; keşif, gelişmiş karşı hamle, diplomasi, araştırma ve faction'a özgü yetenekler yok. Çok uzun maç ekonomisi için ayrıca denge testi gerekir.
7. Statik harita tek gruplar halinde GPU'ya gönderilir. Yüzlerce mangaya ölçeklemek için alan indeksi, chunk culling ve yol bulma görev bütçesi gerekir.
8. APK / PWA kurulum paketi hazırlanmadı. Bu teslim ağ bağımlılığı olmayan tarayıcı oyunudur. Kayıt tarayıcı depolamasına bağlıdır; dosya kökeninde izin verilmeyebilir.

## Sonraki faz

**Faz 02 önceliği: gerçek Android kabul testi ve muharebe okunabilirliği.** Önce iki orta seviye telefonda 160 asker, seçim/kamera, köprü sıkışması ve minimize/geri dönme ölçülmeli. Bulgulara göre dokunma alanları ve LOD eşikleri ayarlanmalı; ardından görüş hattı, savaş sisi, daha iyi formasyon çözümü ve faction'a özgü birer savaş mekaniği eklenmeli. Bu fazın ölçümleri alınmadan içerik sayısını hızla artırmak önerilmez.
