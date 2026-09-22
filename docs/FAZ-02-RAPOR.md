# Geliştirici Raporu — Faz 02

**Trench Crusade: Ashen Crossing · Grafik, atmosfer ve savaş hissi · v0.2.0**

Bu fazın odağı mevcut savaşın görsel geri bildirimidir. Ekonomi, inşa, üretim, hasar, hareket, kazanma koşulu ve kontrol yerleşimi korunmuştur. Yeni faction, silah mekaniği veya teknoloji ağacı eklenmemiştir. Tüm geometri, yüzey ayrıntıları, duman ve sesler kodla üretilir.

## Geliştirilenler

- Her asker kaybında yaklaşık 0,68 saniyelik devrilme/çökme. Canlı ve ölü asker aynı model kurucusunu kullanır. Cesetler kaliteye göre 25–60 saniye kalır; son 5 saniyede solar. Uzak görünüm iki sade parçaya iner.
- Namlu parlaması, kısa mermi izi, vuruş parlaması, kıvılcım, toprak sıçraması, toz ve kısa silah dumanı. Ağır atışlarda küçük/orta patlama, yapı kaybında daha büyük ateş/toz/parça dağılımı.
- Bina yıkımında yaklaşık 1,15 saniyelik çökme, ardından faction'a göre taş/metal veya organik enkaz. Karargâh yıkımını görebilmek için sonuç penceresi 1,8 saniye sonra açılır; sonuç belli olduğunda savaş hesabı durur.
- Darbe, yanık, kararma ve organik kalıntı izleri. İzler 80–210 saniye yaşar ve son 12 saniyede solar. Görsel krater kenarları kullanılır; gerçek arazi geometrisi/yol bulma değiştirilmez.
- Sağlam, hasarlı (%68 altı) ve kritik (%30 altı) bina görünümü; kararma, çatlak/hasar parçaları, isabet tepkisi ve duman. Organik yapılarda hafif hacim hareketi.
- Koyu ve lekeli zemin, kırık tel örgüler, köprü başı ikmal döküntüleri, yanmış ağaçlar, devrik gövdeler ve harabe parçaları. Harita geçişleri korunur; yeni dekorlar çarpışma engeli değildir.
- Antioch askerlerinde miğfer, tunik/haç, omuz zırhı ve ağır silah; yapılarda payanda ve askerî ayrıntılar. Grail'de kambur gövde, kaburgalar, keseler, kemiksi uzantılar ve hastalık rengi. Ayrım uzak LOD'da da korunur.
- Seçim köşeleri, saldırı hedefi işareti, çok hafif yıkım ekran kenarı tepkisi, daha okunaklı bildirim ve panel hiyerarşisi. Kamera titremesi eklenmedi; dokunmatik hedefleme korunur.
- Koddan üretilen atış/patlama sesleri, ortak gürültü tamponu ve en fazla 6 eşzamanlı ses. Ses varsayılan kapalıdır.

## Havuzlar ve performans

| Kalite | Parçacık | Duman | Ceset | Zemin izi | Ceset ömrü | İz ömrü |
|---|---:|---:|---:|---:|---:|---:|
| Düşük | 144 | 36 | 48 | 80 | 25 sn | 80 sn |
| Orta — varsayılan | 320 | 72 | 96 | 160 | 45 sn | 150 sn |
| Yüksek | 560 | 120 | 144 | 240 | 60 sn | 210 sn |

Havuz slotları başlangıçta ayrılır ve tekrar kullanılır. Havuz dolarsa eski öğe yeni öğeye yer verir; bu durumda ömür dolmadan kaldırılabilir. Efekt yoğunluğu düşürülürken yeni havuz yaratılmaz. Görsel olay kuyruğu 256 olayla sınırlıdır. Görünür yakın tarihli yapı enkazı en fazla 32 adettir ve 180 saniyeyi aşınca çizilmez; bu sınır oyun nesnelerini silmez.

Kamera dışındaki geçici efektler üretilmez; ölüm/zemin kayıtları sınırlar içinde korunur. Ceset ve asker LOD'u, instancing, tekrar kullanılan çizim listeleri ve büyüdükten sonra `bufferSubData` ile güncellenen GPU tamponları uygulanır. Duman geometri oluşturmaz; shader'da üretilen yumuşak kenarlı billboard'lar ayrı, derinlik yazmayan ve arkadan öne sıralı bir geçişte çizilir. Ekran çözünürlüğü ayarı ile efekt yoğunluğu birbirinden bağımsızdır.

Menüde **Efekt yoğunluğu: Düşük / Orta / Yüksek** ve **Efekt testi · 160 asker çatışması** vardır. Test senaryosu ana sefer kaydını değiştirmez. Performans paneli aktif parçacık/duman/iz/ceset sayılarını gösterir ve saniyede en fazla 4 kez güncellenir. FPS gerçek kare aralığından hesaplanır; simülasyonun zaman adımı sınırı FPS değerini yapay olarak yükseltmez.

## Modüler yapı ve kayıt

Yeni `visual-events.js`, `effects.js`, `effect-art.js`, `soldier-art.js` ve `atmosphere.js` dosyaları görsel sorumlulukları ayırır. Simülasyon görsel olay üretir; efekt sistemi olayları tüketir ve oyun durumuna müdahale etmez. Hasar sayıları efekt kalitesinden bağımsızdır.

Faz 01 kayıt biçimi ve depolama anahtarı korunur. Yeni kayıtlarda uzun ömürlü ceset/iz bilgileri isteğe bağlı `visuals` alanında tutulur; eski kayıtlar bu alan olmadan açılır. Geçici mermi, duman ve patlama kayda eklenmez. Duraklatma efekt ömrünü de durdurur. Dosyayı farklı tarayıcı kökeninde açmak eski yerel kaydı otomatik taşımaz.

## Doğrulama

- **31/31 otomatik test geçti:** 13 simülasyon, 10 efekt/kapasite ve 8 sahte DOM olay bağlantısı testi.
- Faz 01 ve Faz 02 simülasyonları her faction için 180 saniye çalıştırıldı; serileştirilmiş durumlar birebir eşleşti.
- Kısmi asker kaybı, yinelenmeyen ölüm olayı, dolu havuz geri dönüşümü, yoğunluk değişimi, ölüm/iz sönmesi, kayıt dönüşü, duraklatma, 160 asker testinde kayıt koruma ve sonuç ekranı gecikmesi denetlendi.
- GLES 3 yazılım çizicisinde yeni shader'lar derlenip bağlandı; iki faction ve çatışma/yıkım sahneleri çizildi. GL hata kodu 0.
- Paket içindeki PNG'ler bu çizicinin sahne çıktılarıdır; gerçek tarayıcı arayüz ekran görüntüsü veya cihaz FPS kanıtı değildir.

## Bilinen eksikler

Gerçek Android cihazı ve gerçek tarayıcı UI testi bu ortamda tamamlanamadı; önceki yerel sayfa erişim kısıtı geçerlidir. Bu nedenle 30/60 FPS garantisi verilmez. Saydam duman, özellikle yüksek çözünürlük ve yüksek yoğunlukta GPU doldurma maliyetini artırabilir; orta ayar varsayılandır.

Ölümler prosedürel devrilmedir; fizik tabanlı ragdoll yoktur. Duman hacimsel değildir. İzler düz yüzey geometrisidir; kraterler araziyi gerçekten kazmaz. Yanıklar ve dekorlar hareketi etkilemez. Görüş hattı, savaş sisi ve bireysel asker yol bulması önceki fazdaki kapsamda kalır. Havuz baskısında eski kalıntılar erken silinebilir. Statik çevrede bölgesel eleme henüz yoktur.

## Sonraki mantıklı görsel adım

Önce orta seviye Android'de 160 asker çatışmasını ölçmek; düşük/orta yoğunlukta FPS, dokunmatik tepki ve arka plandan dönüşü doğrulamak. Sonuca göre duman ekran alanı bütçesi ve LOD eşikleri ayarlanmalı. Ardından silah geri tepmesi/yeniden doldurma, daha belirgin vuruş yönü ve kontrollü ek bina yıkım varyantları geliştirilmelidir.
