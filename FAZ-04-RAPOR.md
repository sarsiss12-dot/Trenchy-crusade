# GELİŞTİRİCİ RAPORU — TRENCH CRUSADE FAZ 04
## NEW ANTIOCH EKONOMİ + İNŞA SİSTEMİ

### 1. Eklenen ekonomi modeli

New Antioch’un tek pasif ikmal sayısı, faction strategy üzerinden çalışan üç kaynaklı aktif lojistik ekonomisine dönüştürüldü. `FactionEconomyStrategy`, `NewAntiochEconomy`, `LegacyBlackGrailEconomy` ve `EconomyRegistry` sınırı kuruldu. New Antioch kaynak kazanmak için sahadan yük taşıyor; Black Grail’in Faz 03 pasif `Öz` ekonomisi ayrı strategy ile korunuyor. Ekonomi gameplay frame’ine değil sabit simulation tick’ine bağlıdır.

### 2. Kaynak tipleri

- **İkmal:** mühimmat, yiyecek ve genel cephe ihtiyaçları; birlik ve yapı maliyetlerinde kullanılır.
- **Malzeme:** metal, makine parçası ve tahkimat malzemesi; inşa ve tamirde kullanılır.
- **İnsan gücü:** yeni manga üretimini sınırlayan personel kaynağıdır.

Başlangıç stokları, depolama kapasiteleri, maliyetler ve toplama değerleri data/config katmanındadır. Eski `resources[0]` alanı kayıt geçişi ve bazı salt-okunur göstergeler için ikmal stokuna ayna olarak tutulur; kaynak doğruluğunun kaynağı `economies[0].stock`tur.

### 3. Resource node sistemi

`data/resources.js` ve `ResourceNodeManager` ile 12 deterministik kaynak noktası eklendi: dört ikmal yığını, dört metal/enkaz alanı ve dört stratejik insan gücü noktası. Her nokta miktar, tükenme durumu, toplama süresi, taşıma miktarı ve farklı prosedürel 3D siluet taşır. Noktalar minimap’te görünür, bina footprint’i tarafından kapatılamaz ve save/load içinde saklanır.

Yakın hedef sorgusu 48 m ile sınırlandırıldı; auto-gather tüm haritayı her frame taramaz. Arama periyodu merkezi balance değeridir.

### 4. Mühendis sistemi

New Antioch’a beş kişilik **Muharebe Mühendisi** mangası eklendi. Normal piyadeden düşük ateş gücüne, ayrı çanta/alet siluetine ve worker state’ine sahiptir. Şantiye kurar, mevcut şantiyeye yardım eder, kaynak toplar/taşır ve dost yapıları onarır. Değerleri `data/units.js` içindedir; Mühendislik Atölyesi üretir.

### 5. Gathering state machine

Lojistik akışı şu state’lerle uygulanmıştır:

`IDLE → MOVING_TO_RESOURCE → GATHERING → RETURNING → DELIVERING`

İnşa ve tamir görevleri aynı serializable worker state üzerinde `CONSTRUCTING` ve `REPAIRING` durumlarını kullanır. Kargo türü/miktarı, node, depo, timer, auto-gather türü ve arama cooldown’ı GameState içinde saklanır. Teslim yalnız tamamlanmış HQ/uygun depoda hesaba geçer. Durdurulan ekip elde yük varsa önce teslim rotasına döner.

### 6. Construction sistemi

Akış artık `BuildCommand → ücret kontrolü → şantiye → mühendis yaklaşımı → tick tabanlı progress → completion` şeklindedir. New Antioch şantiyesi yakında atanmış canlı mühendis yokken ilerlemez. En fazla üç mühendis katkı verir; katsayılar `1.00 + 0.65 + 0.40` ile diminishing returns uygular.

Şantiye görseli dört okunur aşamaya ayrıldı: kazık/temel, iskele ve malzeme, yükselen gövde, tamamlanmış yapı. Ghost geçerliliği renk yanında çizgi/işaret ve metinle belirtilir. Nehir, siper, harita sınırı, ana geçit, kaynak alanı, kontrol noktası, birlik ve diğer footprint’ler placement tarafından reddedilir.

### 7. Yeni/yenilenen binalar

New Antioch ailesi sekiz çekirdek yapıdan oluşur:

1. Komuta Karargâhı
2. Haçlı Kışlası
3. Mühendislik Atölyesi
4. İkmal Deposu
5. Malzeme Deposu
6. Saha Hastanesi
7. Gözetleme Karakolu
8. Tahkimli Ateş Mevzisi

Her yapı ayrı footprint, maliyet, rol ve prosedürel siluete sahiptir. `requires` verisiyle küçük prerequisite zinciri kuruldu. Gözetleme yapısının görüş desteği için veri/hook mevcuttur; tam fog-of-war bu fazda bilinçli olarak eklenmedi.

### 8. Production queue

Kışla piyade ve ağır piyade; Mühendislik Atölyesi muharebe mühendisi üretir. Yapılar üç öğe ile sınırlı gerçek kuyruk, tick tabanlı ilerleme, kalan süre, iptal/iade ve rally noktası taşır. Ağır piyade için tamamlanmış Mühendislik Atölyesi gerekir. UI seçili yapıda sıra uzunluğunu, aktif birliği ve kalan süreyi gösterir.

### 9. Repair sistemi

`RepairCommand` hasarlı tamamlanmış dost yapıyı mühendis hedefine dönüştürür. Tamir zaman alır, HP başına Malzeme tüketir, maksimum HP’yi aşmaz ve son hasardan sonra kısa combat delay boyunca durur. İş/onarım parçacıkları mevcut pool sistemine event olarak gönderilir; gameplay sonucu render tarafından değiştirilmez.

### 10. Force cap

Eski manga sayısı sınırı, asker ağırlıklı **Kuvvet Kapasitesi** sistemine dönüştürüldü. Canlı birlikler ve üretim kuyruğundaki rezervler cap’e dahildir. HQ, Kışla, Atölye, İkmal Deposu ve Gözetleme Karakolu data değerleriyle kapasite sağlar. HUD gerçek `kullanılan / toplam` değerini gösterir. Bu hem denge hem mobil görünür-unit bütçesi için genişleme noktasıdır.

### 11. Command mimarisi

Mevcut `Input → CommandSystem → Simulation` akışı korunmuştur. Yeni düz JSON komutları:

- `GatherCommand`
- `RepairCommand`
- `AssistConstructionCommand`
- `SetAutoGatherCommand`
- mühendis kimlikleri taşıyan genişletilmiş `BuildCommand`

UI simulation state’e doğrudan ekonomi/inşa yazmaz. Komutların tamamı JSON round-trip testinden geçer ve entity referansı yerine primitive kimlik taşır.

### 12. Save/load değişiklikleri

GameState sürümü 2’ye çıkarıldı. Kaynak stok/kapasite/teslim toplamları, resource node miktarları, worker state, kargo, auto-gather tercihi, şantiye ilerlemesi, atanmış mühendisler, production queue ve force cap’i üreten yapı state’i serialize edilir. Faz 03 sürüm-1 kayıtları yeni ekonomi ve deterministik node düzenine migrate edilir. Render objeleri hâlâ GameState’e girmez.

### 13. Determinism sonucu

Aynı başlangıç state’i, aynı command stream ve aynı 800 simulation tick’i iki bağımsız instance’ta çalıştırıldığında serialize edilmiş bütün state bayt düzeyinde eşittir. New Antioch lojistik akışı ve Black Grail akışı için ayrı determinism testleri geçmiştir. Gameplay hot path taraması `Math.random` içermediğini doğrular; ekonomi, inşa, üretim ve tamir `Date.now` kullanmaz.

### 14. Performance değerlendirmesi

Resource sorguları mesafe sınırı ve aralıklı auto-search kullanır. Construction yalnız atanmış en fazla üç mühendis üzerinde hesap yapar. Efektler mevcut pool/hard-limit düzenini korur. Resource görselleri statik sayıdadır; yeni event’ler mevcut particle/smoke havuzlarını kullanır. Per-frame tam kaynak×işçi taraması ve yük fizik simülasyonu yoktur.

Aynı çalışma ortamında 160 asker / 1.200 simulation tick / dokuz koşu sentetik CPU testinde:

- Faz 03 medyanı: **28,55 ms**
- Faz 04 medyanı: **25,40 ms**

Bu ölçüm gerçek Android FPS değildir; yeni simulation sistemlerinin test ortamında belirgin regresyon oluşturmadığını gösterir. Kullanıcının talebi gereği bu faz manuel cihaz testi beklenmeden tamamlandı.

### 15. Test sayısı ve sonuçları

**67/67 otomatik test geçti.** Faz 03’ün 47 test alanı korunup değişen ekonomi sözleşmesine uyarlandı; 20 yeni Faz 04 testi eklendi. Kapsam: node üretimi, gather/return/delivery, depletion, auto-gather, engineer requirement, construction pause/progress/completion, diminishing returns, insufficient resource, prerequisite, production, cap, repair/combat delay, save/load, migration, determinism, command serialization ve Black Grail regresyonu. Bağımsız HTML sahte DOM/WebGL üzerinde açılır, render çağrısı üretir ve ana mobil event akışlarını hatasız tamamlar.

### 16. Black Grail regresyon sonucu

Black Grail yeniden tasarlanmadı. Eski `Öz` geliri, otomatik organik büyüme, mevcut unit listesi, yapı ailesi, AI, savaş ve efekt sistemi korunur. Black Grail’e New Antioch’un üç kaynağı veya mühendis zorunluluğu uygulanmaz. Ayrı `LegacyBlackGrailEconomy` strategy’si sonraki fazda enfeksiyon/ceset ekonomisiyle değiştirilebilecek sınırı sağlar.

### 17. Bilinen eksikler

- Gerçek orta seviye Android cihazda FPS, termal throttling ve uzun maç testi yapılmadı.
- Gözetleme Karakolu için tam fog-of-war/görüş ağı uygulanmadı; yalnız rol ve genişleme hook’u var.
- Mühendisler şu an hem construction hem logistics görevini üstleniyor; ayrı kamyon/lojistik birlik yok.
- Repair malzeme bittiğinde güvenle bekler ancak özel “malzeme tükendi” bildirimi üretmez.
- Auto-gather 48 m yerel arama alanı kullanır; uzağa yeni sektör görevi vermek için oyuncunun node’a dokunması gerekir.
- Black Grail’in enfeksiyon, ceset tüketimi ve organik büyüme ekonomisi bilinçli olarak bu fazın dışında bırakıldı.
- Gerçek network transport, replay UI ve authoritative command queue henüz uygulanmadı.

### 18. Sonraki faz önerisi

Sonraki dikey dilim Black Grail’e tamamen ayrı **enfeksiyon / ceset / organik büyüme ekonomisi** eklemelidir. Mevcut `FactionEconomyStrategy`, faction data, serializable commands ve deterministic tick sınırları kullanılmalı; New Antioch’un üç kaynak modeli Black Grail’e kopyalanmamalıdır. Bu fazdan önce veya onunla birlikte gerçek Android profil kaydı alınması önerilir; ancak Faz 04 teslimi buna bağlı değildir.
