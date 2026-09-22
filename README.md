# Trench Crusade 3D RTS — Faz 05

Tarayıcıda çalışan, native ES Modules kullanan bağımsız bir hayran RTS prototipi. **Gerçek kaynak ağacı** repo kökündeki `src/`, `data/`, `tests/` ve `docs/` dizinleridir. `Trench-Crusade-Faz05.html` yalnız build tarafından üretilen taşınabilir demo/test çıktısıdır; kaynak değildir. Orijinal Faz 04 ZIP'i binary PR diff'i oluşturmamak için repository kökündeki özgün konumunda değişmeden tutulur; standalone HTML `archive/phase-04/` altında arşivlenmiştir. Modüler ağaç kaynak sürümdür.

> Lore adları ve temaları Trench Crusade evreninden esinlenir. 60 saniyelik hazırlık, deployment zone, süreli kuşatma ve ekonomi soyutlamaları **RTS gameplay interpretation** olup resmî canon iddiası değildir.

## Çalıştırma

```bash
python3 -m http.server 8080
# http://localhost:8080/
```

Kurulum veya harici paket gerekmez. GitHub Pages ve diğer statik sunucular `index.html` → `src/main.js` ES module girişini doğrudan sunabilir.

## Varsayılan ana mod: SIEGE

New Antioch data-driven `DEFENDER`, Black Grail `ATTACKER` rolündedir. Maçın başında varsayılan 60 saniyelik **HAZIRLIK** safhası vardır. Taraflar kendi deployment zone'larında hareket eder ve inşa/hazırlık yapabilir; hasar ve düşman bölgesine geçiş engellenir. Son 10 saniye warning event'i üretir, sonra deterministic simulation tick'iyle **SAVAŞ** başlar.

Capture noktaları gelecekteki alternatif modlar için kodda tutulmuştur; SIEGE modunda çizilmez, güncellenmez ve zafer sağlamaz. Harita artık iki kesintisiz hazır siper hattı yerine yalnız kısa, terk edilmiş savaş kalıntıları içerir.

- Savunan, data'da `mainObjectiveForRole: 'DEFENDER'` olarak işaretlenen ana merkezi süre bitene dek korursa kazanır.
- Saldıran, süre bitmeden bu ana merkezi yok ederse kazanır.
- Başka bir HQ, duvar veya ilk savunma katmanının kaybı maçı tek başına bitirmez.
- Pregame seçenekleri 5, 10, 30 ve 60 dakikadır; simulation API test/dev için herhangi bir pozitif saniye değerini kabul eder.

HUD hazırlık/maç sayacını, oyuncu rolünü ve ana objective sağlığını gösterir. Seçim panelindeki `×` düğmesi mobilde seçimi açıkça bırakır; boş zemine dokunma davranışı da korunmuştur.

## Mimari

- `src/simulation/MatchFlow.js`: `SETUP`, `PREPARATION`, `WAR`, `VICTORY`, `DEFEAT`; gelecekte `FRONT_QUIET`, recovery ve special event eklenebilecek tek state sınırı.
- `data/factions.js`: faction adından bağımsız gameplay role ve deployment zone.
- `data/balance.js`: preparation, duration seçenekleri ve SIEGE/capture policy.
- `src/core/GameState.js`: sürüm 3 save; match state/timer/roller/objective/outcome, tick ve gameplay event geçmişi.
- `economies[].strategy`: New Antioch ve Black Grail için ayrı strateji hook'u. Black Grail'in nihai corpse/infection ekonomisi bu fazın kapsamı değildir.
- `economies[].population`: gelecekte civilian, recruitable population, housing, food ve command capacity ilişkisini büyütmek için başlangıç abstraction'ı.
- Squad `formation` metadata'sı ve yapı `category` metadata'sı sonraki sistemlere hook sağlar; bu faz tam formation, trench editor veya reinforcement route uygulamaz.

Match ve gameplay sonucu `Date.now` / `Math.random` kullanmaz. Sayaçlar simulation step ile ilerler. Render/VFX state gameplay save'inden ayrıdır; mevcut LOD ve havuz limitleri korunur.

## Test ve build

```bash
npm test
npm run build
```

`npm test` 79 otomatik testi çalıştırır: 67 Faz 04 regresyonu ile 12 Faz 05 source/bootstrap, preparation, damage/deployment, state transition, duration, iki victory yolu, no-capture, role validation, save/load, determinism, deselect ve strategy/population kontrolleri. Paket kurulumu gerekmez.

`npm run build`, kaynak ağacından `Trench-Crusade-Faz05.html` üretir. Python standart kütüphanesi dışında bağımlılık yoktur.

## Dizinler

```text
index.html, style.css       Canonical statik uygulama
src/                        Simulation, gameplay, input, UI, render ve VFX
 data/                      Faction, unit, building ve balance tanımları
 tests/                     Node test runner regresyon/integration testleri
 docs/                      Önceki faz raporları ve render kayıtları
 archive/phase-04/          Orijinal standalone demo arşivi
Trench-Crusade-Faz04.zip   Değiştirilmemiş kaynak teslim paketi
 build.py                   Standalone demo üreticisi
```

## Bilinen sınırlar / sonraki aday

Bu faz gerçek siper kazma, tam formasyon, otomatik cephe ikmali, civilian agents veya Black Grail infection/corpse üretimini uygulamaz. Sonraki ana aday **Faz 06 — Black Grail enfeksiyon + ceset + Thrall dönüşümü + organik ekonomi**dir.
