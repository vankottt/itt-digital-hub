# Анализатор на населени места

Работещ V1 уеб инструмент за автоматичен предварителен анализ на български села и малки населени места. Интерфейсът е изцяло на български и не изисква платени API ключове, регистрация или собствен GIS сървър.

> Резултатите са ориентировъчни и зависят от пълнотата на отворените данни. Приложението не е кадастрална система, геодезически инструмент или официален източник за предназначение на земя.

## Инсталация

Необходим е Node.js 22+.

```bash
npm install
```

## Стартиране

```bash
npm run dev
```

Отворете [http://127.0.0.1:5173](http://127.0.0.1:5173).

Production build и локален preview:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

## Проверки

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev
```

## Архитектура

- React 19 + Vite + TypeScript
- Leaflet + React Leaflet за интерактивната карта
- Leaflet Draw за корекция на границата
- Turf.js за clustering, buffer, clipping, intersection, union, difference, площи и дължини
- `osmtogeojson` за преобразуване на Overpass JSON до GeoJSON
- Без backend, база данни, authentication или платена услуга

Основният pipeline е:

1. Nominatim търсене с debounce, локален cache и ограничаване на честотата.
2. Overpass заявка само в радиус 2,8 km около избраното населено място.
3. Проверка на наличната settlement геометрия.
4. Fallback граница от dominant building cluster.
5. Класификация и clipping до границата.
6. Премахване на overlaps по deterministic priority.
7. Изчисляване на „Други“ като математически остатък.
8. KPI, профил, confidence, карта и export.

## Източници на данни

- [OpenStreetMap](https://www.openstreetmap.org/copyright) — basemap и обектни данни
- [Nominatim](https://nominatim.org/) — търсене и геокодиране
- [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API) — сгради, улици, land-use, natural features и POI

Приложението използва публичните услуги умерено: търсенето е с 700 ms debounce, минимум 1,1 s между заявки, cache и обработка на rate limits; Overpass отговорите се кешират за текущата browser сесия и има резервен endpoint.

## Автоматична граница

Правилата са централизирани в `src/config.ts`.

1. Ако Nominatim предоставя Polygon/MultiPolygon, той се приема само когато площта, центърът и съотношението спрямо building cluster са разумни.
2. В противен случай сградните центроиди се групират с deterministic пространствено свързване (260 m).
3. Избира се най-големият клъстер в разумна близост до settlement координатата.
4. Изолирани ферми, складове и самотни къщи извън dominant cluster не участват.
5. Върху центроидите се прави concave hull, fallback bbox hull, 115 m buffer и simplify.
6. При липса на достатъчно сгради се използва ясно обозначена компактна резервна зона; confidence се понижава.

Уличната мрежа никога не разширява границата.

## Жилищна методика

- Приоритетно се използва `landuse=residential`.
- Допълва се с 24 m deterministic buffer около сгради, които изрично са класифицирани като жилищни.
- `building=yes` не се приема автоматично за жилищна сграда и остава „Неопределена“.
- Резултатът се clip-ва до границата и от него се изваждат категориите с по-висок приоритет.

## Категории и приоритет

Седемте взаимно изключващи се категории са:

1. Водни площи
2. Улици / транспорт
3. Индустриални / търговски площи
4. Жилищни площи
5. Земеделски площи
6. Зелени площи
7. Други

Последователно се прилагат `intersection`, `union` и `difference`. „Други“ е `Analysis Boundary − Union(всички класифицирани категории)`, поради което сборът е 100% с минимална визуална разлика единствено от закръгляване.

## Улици

Пътищата се clip-ват до границата. Дължината се изчислява по centerline геометрията. Ако няма надежден `width`, се използват централизирани ширини:

- motorway 18 m
- trunk 14 m
- primary 11 m
- secondary 9 m
- tertiary 7 m
- unclassified 5,5 m
- residential 5 m
- living_street 4 m
- service 3,5 m

Пешеходни пътеки, стъпала и велоалеи не участват в автомобилната пътна площ.

## Сгради

Използват се реалните OSM footprints. Класификацията различава:

- вероятно жилищни;
- индустриални / търговски;
- други известни;
- неопределени.

Площта на сградите е отделен KPI overlay, а не осма land-use категория.

## Надеждност на данните

„Висока / Средна / Ниска“ е прозрачна heuristic оценка, не научно измерена accuracy. Използва:

- наличност и брой на сградите;
- дял класифицирани сгради;
- дял територия с изрично предназначение;
- дял „Други“;
- дял неопределени сгради;
- качество на метода за границата.

UI показва конкретните причини и проценти.

## Export

- CSV с machine-friendly колони и UTF-8 BOM за съвместимост с Excel.
- GeoJSON FeatureCollection с граница, седемте категории, сгради, road centerlines и POI. Файлът е подходящ за QGIS и друг стандартен GIS софтуер.

## Тестове

Focused Vitest проверки покриват:

- dominant cluster и отдалечен outlier;
- union, intersection и difference;
- overlap removal и 7 категории = 100%;
- building classification и `building=yes` unknown поведение;
- road length/area/density в интеграционния pipeline;
- profile и confidence през пълни и непълни данни;
- CSV и GeoJSON;
- липса на сгради, улици и land-use.

Ръчният browser QA е изпълнен с реални данни за Крушаре (Сливен), Арбанаси (Велико Търново) и Смилян (Смолян), включително retry след Overpass 504, responsive 390 × 844 и export downloads.

## Ограничения

- Качеството пряко зависи от OSM покритието и tagging-а за конкретното село.
- Публичните Nominatim/Overpass услуги могат временно да бъдат натоварени или недостъпни.
- Land-use buffers и default road widths са еднакви методически оценки, не теренно измерване.
- Малко или непълно картографирано село може да има голям дял „Други“ или много неопределени сгради.
- Не се използват сателитни изображения, кадастрални данни или computer vision във V1.
- Не е оптимизирано за София, цели общини или country-scale анализ.

## Основни файлове

- `src/config.ts` — всички параметри, thresholds, категории и цветове
- `src/services/search.ts` — Nominatim търсене, rate limiting и cache
- `src/services/overpass.ts` — пространствено филтрирани Overpass данни и fallback
- `src/services/analysis.ts` — целият анализ, KPI, profile и confidence
- `src/lib/geometry.ts` — clustering и геометрични операции
- `src/lib/classification.ts` — land-use и building правила
- `src/lib/export.ts` — CSV/GeoJSON
- `src/components/MapView.tsx` — карта, POI и редакция на границата
- `src/components/ResultsPanel.tsx` — таблица, chart, KPI и export действия

