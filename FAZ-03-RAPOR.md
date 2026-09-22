# GELİŞTİRİCİ RAPORU — TRENCH CRUSADE FAZ 03
## MİMARİ STABİLİZASYON VE MODÜLERLEŞTİRME

### 1. Eski mimarideki ana sorunlar

Faz 02 çalışıyordu ancak `simulation.js` gameplay state, entity üretimi, ekonomi, inşa, hareket, savaş, ölüm, capture, AI ve save işlemlerini aynı sınıfta topluyordu. `main.js` oyun yaşam döngüsü, touch/mouse girişi, doğrudan state değişimi, HUD, minimap, overlay, kayıt ve test senaryolarını birlikte yönetiyordu. Renderer; kamera, shader, mesh, batch ve GPU buffer sorumluluklarını aynı dosyada taşıyordu. Unit, building, faction ve denge değerleri tek veri dosyasındaydı. Bu yapı yeni faction ve network komutları eklenirken core dallanmasını ve regresyon riskini büyütüyordu.

### 2. Yeni klasör yapısı

Kod `core`, `simulation`, `world`, `units`, `combat`, `buildings`, `factions`, `effects`, `render`, `input`, `ui`, `ai` ve `audio` katmanlarına ayrıldı. Unit/building/faction/balance tanımları kökteki `data/` altında tutuluyor. `index.html` yalnızca canvas/UI markup, stylesheet ve `src/main.js` module entry içeriyor. `src/main.js` iki satırlık composition bootstrap’tır.

### 3. Oluşturulan modüller

- Core: `Game`, `GameState`, `Config`, `Time`, `EventBus`, `DeterministicRNG`
- Simulation: `Simulation`, `SimulationClock`, `EconomySystem`, `CaptureSystem`
- Units: `Squad`, `UnitManager`, `MovementSystem`, `FormationSystem`
- Combat: `CombatSystem`, `DamageSystem`, `DeathSystem`, `ProjectileSystem`
- Buildings: `Building`, `BuildingManager`, `ConstructionSystem`
- Effects: `EffectCoordinator`, `EffectPool`, `ParticleSystem`, `SmokeSystem`, `DecalSystem`, `CorpseManager`, `ExplosionSystem`, `VisualEvents`
- Render: `Renderer`, `Camera`, `Batch`, `MeshFactory`, `Materials`, `Lighting`, `LODManager` ve art modülleri
- Input/UI: serializable command’lar, `CommandSystem`, `SelectionSystem`, `TouchControls`, HUD, minimap, build menu, notifications, overlay ve performance panel
- AI/Audio: `AIController`, `AIOrders`, `AudioManager`

Eski kısa import yolları uyumluluk re-export dosyaları olarak tutuldu; mevcut testlerin ve dış kullanımın kırılması önlendi.

### 4. Simulation/render ayrımı

HP, konum, cooldown, üretim, faction state, AI ve victory yalnızca simulation katmanında değişir. Simulation render mesh’i, WebGL buffer’ı, kamera veya particle nesnesi saklamaz. Savaş sonucu sabit kapasiteli tek yönlü `VisualEvents` kuyruğuna yazılır. Render/effect katmanı bu olayları tüketir ve simulation state’e geri yazmaz. Save JSON içinde render referansı bulunmadığı otomatik testle doğrulandı.

### 5. Faction mimarisi

`Faction`, `FactionRegistry` ve faction başına hook modülleri eklendi. New Antioch ve Black Grail aynı Faz 02 değerlerini kullanıyor; bu fazda gameplay farkı eklenmedi. Registry, izin verilen unit/building listelerini ve gelecekteki ekonomi/inşa strategy anahtarlarını taşır. Görsel profile ek olarak render tarafında ayrı faction visual registry vardır. Yeni ekonomi veya infection davranışı core içine faction kimliği kontrolleri yaymadan hook üzerinden eklenebilir.

### 6. Data-driven sistem

`data/units.js`, `data/buildings.js`, `data/factions.js` ve `data/balance.js` oluşturuldu. Faz 02’nin HP, hasar, menzil, hız, maliyet, süre, gelir, capture, cover, hareket ve effect limitleri aynen korundu. Lookup map’leri hot path içinde tekrarlanan aramaları azaltır. Yapı state’i save uyumluluğu için yalnızca eski serialize alanlarını taşır.

### 7. Input/command mimarisi

Touch/fare katmanı artık doğrudan move/build/train/cancel/rally state’i değiştirmez. Akış `TouchControls → SelectionSystem → CommandSystem → Simulation` şeklindedir. `MoveCommand`, `AttackCommand`, `BuildCommand`, `StopCommand`, `TrainCommand`, `CancelCommand` ve `SetRallyCommand` düz JSON objeleridir. Dispatcher komutları eşzamanlı uygular; bu, Faz 02 hissini korurken ileride tick tabanlı queue için temiz bir sınır sağlar.

### 8. Multiplayer hazırlıkları

Multiplayer veya networking eklenmedi. Gameplay hot path’inde `Math.random` yoktur. Merkezi deterministic RNG altyapısı oluşturuldu. Komutlar entity referansı yerine kimlik ve primitive veri taşır. `GameState` JSON serializable’dır; render state dışarıdadır. Bu düzen replay, lockstep/authoritative command transport, save/load ve debug snapshot geliştirmeleri için temel sağlar.

### 9. Efekt sisteminin yeni yapısı

Faz 02’deki muzzle flash, tracer, impact, dirt/spark, patlama, duman, corpse, decal ve bina yıkım efektleri korunmuştur. Combat yalnızca görsel olay üretir. Pool’lar ayrı particle/smoke/decal/corpse modülleriyle `EffectCoordinator` altında birleşir. Low/medium/high hard limitleri merkezi balance config’den okunur. Uzun ömürlü corpse/decal save edilir; canlı tracer ve duman yeniden oluşturulmaz.

### 10. Performans sonucu

160 asker senaryosu, effect limitleri, LOD ve tekrar kullanılan GPU/CPU buffer yolu korunmuştur. Object pool kapasitesi çalışma sırasında büyümez; command history 64, VisualEvents 256 kayıtla sınırlıdır. Node üzerinde 160 asker ve 1.200 simulation step için yedi koşunun medyanında Faz 02 **21,19 ms**, Faz 03 **14,43 ms** ölçüldü. Bu sentetik CPU testi gerçek Android FPS ölçümü değildir; refactor sonrasında belirgin bir simulation gerilemesi olmadığını gösterir.

### 11. Test sonucu

**47/47 otomatik test geçti.** Faz 02’nin 31 testi kaybedilmedi. Ek architecture testleri command serialization/dispatch, faction registry, data tanımları, save izolasyonu, event sözlüğü, merkezi effect limitleri, LOD, gameplay alanında `Math.random` bulunmaması ve 160 asker state’ini doğrular. New Antioch ve Black Grail için Faz 02 ile 180 saniyelik simulation çıktısı bayt düzeyinde eşittir. Bağımsız HTML sahte DOM/WebGL entegrasyonunda açılır, render çağrısı üretir ve tüm ana UI senaryolarını tamamlar.

### 12. Bilinen eksikler

- Gerçek orta seviye Android cihazda uzun süreli FPS, termal throttling ve WebGL context restore testi yapılmadı.
- Multiplayer transport, replay ve authoritative tick queue bilinçli olarak uygulanmadı.
- `ProjectileSystem` hitscan davranışı için genişleme noktasıdır; travel-time projectile yoktur.
- `Game` composition root hâlâ yaşam döngüsü ve üst seviye input bağlama kodunu içerir; gameplay kuralları bu dosyada değildir. Bir sonraki altyapı fazında lifecycle/save ve scenario launcher daha da ayrılabilir.
- Statik harita mesh’i hâlâ tek parça; büyük haritalar için chunk culling gerekir.

### 13. Sonraki faz için öneri

Önce gerçek Android profil kaydı alınmalı ve sabit simulation tick için command queue/replay log prototipi eklenmelidir. Ardından faction hook sınırları bozulmadan New Antioch ekonomi sistemi veya Black Grail infection/corpse ekonomisinden yalnızca biri dikey bir feature dilimi olarak uygulanmalıdır. Her yeni sistem state serialization ve deterministic command testleriyle birlikte geliştirilmelidir.
