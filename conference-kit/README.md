# ITT Digital Hub — conference kit

Материали за бъдеща конференция, отделени от `diva-e MARKETING` и преработени по визията на [ittdigitalhub.uk](https://ittdigitalhub.uk).

## Как да ползвате папката

1. **`02-itt-branded/`** — готовите ITT файлове. Започнете оттук.
2. **`01-selected-sources/`** — копие на избраните оригинали от маркетинговата библиотека. Само за справка; не ги показвайте като ITT.

## Готови ITT файлове

| Файл | Предназначение |
|---|---|
| `02-itt-branded/powerpoint/ITT_Digital_Hub_Master.potx` | PowerPoint шаблон (43 лейаута), пренастроен към сайта |
| `02-itt-branded/powerpoint/ITT_Digital_Hub_Master.pptx` | Същият шаблон, отворен като презентация |
| `02-itt-branded/powerpoint/ITT_Digital_Hub_Conference_Starter.pptx` | Стартова колода с копие от сайта (EN) |
| `02-itt-branded/powerpoint/ITT_Poster_1.potx` … `3` | Постер шаблони, пренастроени |
| `02-itt-branded/digital/linkedin-header-1584x396.png` | LinkedIn корица |
| `02-itt-branded/digital/teams-background-1920x1080.png` | Фон за Teams / Zoom |
| `02-itt-branded/print/one-pager-a4.png` | Едностранна листовка |
| `02-itt-branded/print/badge-85x54mm.png` | Бадж (името се редактира) |
| `02-itt-branded/print/rollup-preview-1080x1920.png` | Преглед за рол-ъп |
| `02-itt-branded/icons/` | Икони, преоцветени в ITT navy / signal |
| `02-itt-branded/fonts/` | IBM Plex Sans — инсталирайте ги преди презентация |

Отворете `ITT_Digital_Hub_Master.potx` в PowerPoint: **File → Save as Template**, после **New Slide** ползва ITT лейаутите.

## Визия (от сайта)

- Хартия `#edf0fb`, мастило/marine `#040e31`, сигнал `#002cff`
- Шрифт **IBM Plex Sans** (както на сайта)
- Официални лога от `public/brand/itt-*.png`
- Тъмен hero с navy + signal glow, светли слайдове с меки бели карти

## Какво е избрано от diva-e MARKETING — и защо

**Включено (формат / шаблон, не съдържание на diva-e):**

- PPT master и icon collection
- Постер шаблони и event формати (бадж, рол-ъп, moderation cards)
- LinkedIn header, Teams фон, Word letter templates
- Пет AI колоди само като *структурна* справка (`structure-examples/`)

**Изключено нарочно:**

- Клиентски референции, `Logos Kunden`, case studies (Netto, SMA, Automotive…)
- GTM curriculum, Salesforce/Adobe/SAP at diva-e, credentials / оборот / org chart
- Снимки на служители, employer branding, офиси, песни, kudos, CoC
- Conclusion лога, proprietary шрифтове (GT Planar), Vivid Circle TIFF-ове
- 10 GB Bynder media — не е нужно за ITT колода

Клиентските истории на diva-e не са истории на ITT Digital Hub. Стартовата колода ползва само публичното копие от ittdigitalhub.uk. Липсващи факти не са дописвани.

`structure-examples/` съдържа оригинални diva-e слайдове. **Не ги представяйте като ITT.** Ползвайте ги само за подредба (mission → approach → next steps), после сменете целия текст.

## Какво още да смените преди събитието

- Име на конференцията върху title слайда
- Email / календар — на сайта още е TODO
- Портрет на Иван Томчев, когато има потвърден asset
- Печатни файлове: баджът и рол-ъпът са прегледи; за печат пратете ги на график с bleed

## Повторно генериране

```bash
python3 conference-kit/scripts/build_itt_conference_kit.py
```
