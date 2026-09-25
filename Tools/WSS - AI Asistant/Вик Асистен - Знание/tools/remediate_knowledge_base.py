#!/usr/bin/env python3
"""Add official downloads and mark incomplete content. Does not rebuild every act."""

from __future__ import annotations

import importlib.util
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("kb", ROOT / "tools" / "build_knowledge_base.py")
kb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kb)

RETRIEVED = "2026-09-24"


def write_act(record: dict, pdf: Path, meta_overrides: dict | None = None) -> dict:
    source_articles = kb.article_count(kb.raw_pdf_text(pdf))
    converted = kb.convert_file(pdf, source_articles)
    body, figures = kb.attach_pdf_figures(
        pdf, converted["body"], ROOT / "knowledge" / record["folder"] / "assets", record["id"]
    )
    plain = converted["plain"]
    collapsed = re.sub(r"\s+", "", (plain + body).lower())
    if re.sub(r"\s+", "", record["expect"].lower()) not in collapsed:
        raise SystemExit(f"Identity check failed for {record['id']}")
    meta = kb.extract_header_meta(plain)
    if meta_overrides:
        meta.update({key: value for key, value in meta_overrides.items() if key in meta})
        record["notes"] = meta_overrides.get("notes", record["notes"])
    if figures:
        converted["warnings"].append(
            f"Графични приложения без текстов слой: {figures}. Стойностите не са преписвани."
        )
    kept = kb.article_count(body)
    if source_articles and kept + max(3, int(source_articles * 0.08)) < source_articles:
        raise SystemExit(f"Article loss for {record['id']}: {kept} vs {source_articles}")
    destination = ROOT / "knowledge" / record["folder"] / record["filename"]
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(kb.front_matter(record, meta) + body + "\n", encoding="utf-8")
    return {
        "meta": meta,
        "warnings": converted["warnings"],
        "tables": converted["tables"],
        "source_article_count": source_articles,
        "knowledge_article_count": kept,
        "knowledge_file": str(destination.relative_to(ROOT)),
        "sha256": kb.sha256(pdf),
    }


def scan_limitations(path: Path, document_id: str) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    location = "документ"
    grouped: dict[tuple[str, str], dict] = {}
    for line in text.splitlines():
        heading = re.match(r"^#{2,6}\s+(.*)", line)
        if heading:
            location = heading.group(1).strip()
        kind = None
        if "[ФОРМУЛА" in line:
            kind = "equation"
        elif "[ФИГУРА" in line:
            kind = "figure"
        if not kind:
            continue
        key = (location, kind)
        item = grouped.setdefault(
            key,
            {
                "location": location,
                "type": kind,
                "count": 0,
                "status": "not_machine_extracted",
                "source_asset_available": True,
                "safe_for_text_answer": True,
                "safe_for_numeric_answer": False,
            },
        )
        item["count"] += 1
    limitations = list(grouped.values())
    if "не е пренаредена в решетка" in text:
        limitations.append(
            {
                "location": "приложения с клетъчен текст",
                "type": "table",
                "status": "preserved_as_cell_text",
                "source_asset_available": True,
                "safe_for_text_answer": True,
                "safe_for_numeric_answer": False,
                "note": "Автоматичната решетка губеше стойности, затова клетките са запазени без подравняване.",
            }
        )
    if "Графични приложения без текстов слой" in text or "assets/" in text:
        limitations.append(
            {
                "location": "графични приложения",
                "type": "diagram",
                "status": "image_only",
                "source_asset_available": True,
                "safe_for_text_answer": True,
                "safe_for_numeric_answer": False,
                "note": "Числовите стойности не са преписвани от изображението.",
            }
        )
    return limitations


def completeness(limitations: list[dict]) -> dict:
    types = sorted({item["type"] for item in limitations})
    partial = bool(types)
    return {
        "content_completeness": "partial" if partial else "complete",
        "missing_content_types": types,
        "requires_source_asset": partial,
        "safe_for_textual_rag": True,
        "safe_for_numeric_answer": not partial,
    }


def patch_front_matter(path: Path, extra: dict) -> None:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise SystemExit(f"Missing front matter: {path}")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise SystemExit(f"Unclosed front matter: {path}")
    block = text[4:end]
    lines = [line for line in block.splitlines() if not line.startswith(tuple(f"{key}:" for key in extra))]
    for key, value in extra.items():
        if isinstance(value, bool):
            rendered = "true" if value else "false"
        elif isinstance(value, list):
            if not value:
                lines.append(f"{key}: []")
                continue
            lines.append(f"{key}:")
            lines.extend(f"  - {item}" for item in value)
            continue
        else:
            rendered = kb.yaml_quote(str(value))
        lines.append(f"{key}: {rendered}")
    path.write_text("---\n" + "\n".join(lines) + text[end:], encoding="utf-8")


def main() -> None:
    downloaded = ROOT / "_source" / "downloaded"
    water_pdf = downloaded / "naredba-rd-02-20-2-2024-mrrb.pdf"
    ground_pdf = downloaded / "naredba-1-2007-podzemni-vodi-moew.pdf"
    water = write_act(
        {
            "id": "rd-02-20-2-2024",
            "title": "Наредба № РД-02-20-2 от 3 юли 2024 г. за проектиране, изграждане и експлоатация на водоснабдителни системи",
            "short_title": "Наредба № РД-02-20-2/2024 — водоснабдителни системи",
            "type": "наредба",
            "number": "РД-02-20-2",
            "year": 2024,
            "domains": ["external_water", "water_supply", "water_sources", "pumping", "reservoirs"],
            "priority": "P0",
            "folder": "02_vodosnabdyavane",
            "filename": "rd-02-20-2-2024-vodosnabditelni-sistemi.md",
            "source_file": "_source/downloaded/naredba-rd-02-20-2-2024-mrrb.pdf",
            "source_institution": "Министерство на регионалното развитие и благоустройството",
            "expect": "водоснабдителни системи",
            "has_annexes": True,
            "notes": "Официален файл от сайта на МРРБ, обн. ДВ, бр. 61 от 2024 г. В § 9 е записано, че наредбата влиза в сила четири месеца след обнародването, а приложение № 13 — от 01.07.2025 г. Календарната дата не е изписана в самия файл и не е изчислявана. В този преглед не е намерено изменение на тази наредба; отделната Наредба № РД-02-20-2 от 2015 г. е за пътни тунели.",
        },
        water_pdf,
        {"effective_date": "", "last_amendment": ""},
    )
    ground = write_act(
        {
            "id": "naredba-1-2007-podzemni-vodi",
            "title": "Наредба № 1 от 10 октомври 2007 г. за проучване, ползване и опазване на подземните води",
            "short_title": "Наредба № 1/2007 — подземни води",
            "type": "наредба",
            "number": "1",
            "year": 2007,
            "domains": ["groundwater", "water_sources"],
            "priority": "P0",
            "folder": "12_podzemni_vodi",
            "filename": "naredba-1-2007-podzemni-vodi.md",
            "source_file": "_source/downloaded/naredba-1-2007-podzemni-vodi-moew.pdf",
            "source_institution": "министър на околната среда и водите, министър на регионалното развитие и благоустройството, министър на здравеопазването и министър на икономиката и енергетиката",
            "expect": "подземните води",
            "has_annexes": True,
            "notes": "Canonical текстът е официалният PDF на МОСВ. Заглавната бележка стига до ДВ, бр. 102 от 23.12.2016 г. По-късно изменение не е намерено в този преглед и не е добавяно. Предишният локален файл е първоначалната публикация от 2007 г. и остава в _source/originals като historical source.",
        },
        ground_pdf,
    )
    (ROOT / "knowledge" / "02_vodosnabdyavane" / "README.md").write_text(
        "\n".join(
            [
                "# 02 — Водоснабдяване",
                "",
                "Каноничният акт е `rd-02-20-2-2024-vodosnabditelni-sistemi.md`.",
                "",
                "Оригиналът е официалният PDF на МРРБ в `_source/downloaded/`.",
                "",
            ]
        ),
        encoding="utf-8",
    )

    manifest_path = ROOT / "manifests" / "knowledge_manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    by_id = {row["id"]: row for row in manifest["documents"]}

    provenance = {
        "rd-02-20-2-2024": {
            "source_url": "https://www.mrrb.bg/static/media/ups/articles/attachments/Наредба РД-02-20-21971393f81f5a9c7410c89bba59bd1ef.pdf",
            "source_page": "https://www.mrrb.bg/bg/naredba-rd-02-20-2-ot-2024-g-za-proektirane-izgrajdane-i-eksploataciya-na-vodosnabditelni-sistemi/",
            "source_domain": "mrrb.bg",
            "source_type": "official",
            "institution": "Министерство на регионалното развитие и благоустройството",
            "retrieved_at": RETRIEVED,
            "filename": "naredba-rd-02-20-2-2024-mrrb.pdf",
            "sha256": water["sha256"],
            "why_canonical": "Официален файл на издателя. В прегледа не е намерено по-ново изменение на тази наредба.",
        },
        "naredba-1-2007-podzemni-vodi": {
            "source_url": "https://www.moew.government.bg/static/media/ups/tiny/Vodi/zakonodatelstvo/Naredba%201%20podzemni%20vodi%202007.pdf",
            "source_page": "https://www.moew.government.bg/",
            "source_domain": "moew.government.bg",
            "source_type": "official",
            "institution": "Министерство на околната среда и водите",
            "retrieved_at": RETRIEVED,
            "filename": "naredba-1-2007-podzemni-vodi-moew.pdf",
            "sha256": ground["sha256"],
            "why_canonical": "Официален PDF с изменения до ДВ, бр. 102 от 23.12.2016 г. Заменя локалния текст само с първоначалното обнародване.",
        },
    }
    (ROOT / "manifests" / "web_provenance.json").write_text(
        json.dumps({"retrieved_at": RETRIEVED, "documents": provenance}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    water_row = {
        "id": "rd-02-20-2-2024",
        "title": "Наредба № РД-02-20-2 от 3 юли 2024 г. за проектиране, изграждане и експлоатация на водоснабдителни системи",
        "short_title": "Наредба № РД-02-20-2/2024 — водоснабдителни системи",
        "type": "наредба",
        "number": "РД-02-20-2",
        "year": 2024,
        "domains": ["external_water", "water_supply", "water_sources", "pumping", "reservoirs"],
        "priority": "P0",
        "status": "unknown",
        "status_confidence": "document_only",
        "source_file": "_source/downloaded/naredba-rd-02-20-2-2024-mrrb.pdf",
        "related_source_files": [],
        "knowledge_file": water["knowledge_file"],
        "source_institution": "Министерство на регионалното развитие и благоустройството",
        "dv_reference": water["meta"]["dv_reference"],
        "effective_date": "",
        "last_amendment": "",
        "has_annexes": True,
        "machine_readable": True,
        "text_form": "promulgation_only",
        "notes": "Официален файл от МРРБ. Влизане в сила: четири месеца след обнародването, съгласно § 9 от файла. Датата не е изчислявана.",
        "issues": water["warnings"],
        "formula_placeholders": 0,
        "table_count": water["tables"],
        "source_article_count": water["source_article_count"],
        "knowledge_article_count": water["knowledge_article_count"],
        "web_provenance": provenance["rd-02-20-2-2024"],
        "content_currency": "promulgation_2024",
        "requires_manual_verification": True,
    }
    old = by_id["naredba-1-2007-podzemni-vodi"]
    old.update(
        {
            "source_file": "_source/downloaded/naredba-1-2007-podzemni-vodi-moew.pdf",
            "knowledge_file": ground["knowledge_file"],
            "dv_reference": ground["meta"]["dv_reference"],
            "effective_date": ground["meta"]["effective_date"],
            "last_amendment": ground["meta"]["last_amendment"],
            "text_form": "consolidated_in_file",
            "notes": "Canonical е PDF на МОСВ до ДВ, бр. 102/2016 г. Локалният DOC от 2007 г. е historical.",
            "issues": ground["warnings"],
            "table_count": ground["tables"],
            "source_article_count": ground["source_article_count"],
            "knowledge_article_count": ground["knowledge_article_count"],
            "historical_sources": [
                {
                    "source_file": "_source/originals/naredba1-ot-10-10-2007g-prouchvane-polzvane-opzvane-podzemni-vodi.doc",
                    "role": "superseded_promulgation_text",
                    "note": "Първоначално обнародване от 2007 г. без по-късните изменения, отбелязани в PDF на МОСВ.",
                }
            ],
            "web_provenance": provenance["naredba-1-2007-podzemni-vodi"],
            "content_currency": "consolidated_through_2016_in_file",
            "requires_manual_verification": True,
        }
    )
    documents = [row for row in manifest["documents"] if row["id"] != "rd-02-20-2-2024"]
    documents.append(water_row)
    documents.sort(key=lambda row: (row["priority"], row["id"]))

    limitation_docs = []
    for row in documents:
        path = ROOT / row["knowledge_file"]
        limitations = scan_limitations(path, row["id"])
        flags = completeness(limitations)
        row.update(flags)
        if row["id"] not in {"rd-02-20-2-2024", "naredba-1-2007-podzemni-vodi"}:
            recent_in_file = {
                "rd-02-20-8-2013",
                "zakon-za-vodite",
                "naredba-9-2001",
                "naredba-iz-1971-2009",
                "zut",
            }
            if row["id"] in recent_in_file:
                row.setdefault("content_currency", "as_cited_in_file")
                row.setdefault("requires_manual_verification", False)
            else:
                row.setdefault("content_currency", "possibly_outdated")
                row.setdefault("requires_manual_verification", True)
        patch_front_matter(
            path,
            {
                "content_completeness": flags["content_completeness"],
                "missing_content_types": flags["missing_content_types"],
                "requires_source_asset": flags["requires_source_asset"],
                "safe_for_textual_rag": flags["safe_for_textual_rag"],
                "safe_for_numeric_answer": flags["safe_for_numeric_answer"],
                "content_currency": row["content_currency"],
                "requires_manual_verification": row["requires_manual_verification"],
            },
        )
        if limitations:
            limitation_docs.append({"document_id": row["id"], "limitations": limitations})

    manifest["documents"] = documents
    manifest["remediation"] = {
        "retrieved_at": RETRIEVED,
        "note": "status остава unknown. Новите файлове са официални PDF. Непълното съдържание е в content_limitations.json.",
    }
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ROOT / "manifests" / "content_limitations.json").write_text(
        json.dumps({"version": 1, "documents": limitation_docs}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    kb.write_human_manifest(documents)
    taxonomy = json.loads((ROOT / "manifests" / "taxonomy.json").read_text(encoding="utf-8"))
    existing = {item["id"] for item in taxonomy["domains"]}
    for item in [
        {"id": "water_supply", "label_bg": "Водоснабдителни системи", "label_en": "Water supply systems"},
        {"id": "pumping", "label_bg": "Помпени станции", "label_en": "Pumping stations"},
        {"id": "reservoirs", "label_bg": "Регулиращи водонапорни съоръжения", "label_en": "Storage reservoirs"},
    ]:
        if item["id"] not in existing:
            taxonomy["domains"].append(item)
    (ROOT / "manifests" / "taxonomy.json").write_text(
        json.dumps(taxonomy, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        json.dumps(
            {
                "water_articles": water["knowledge_article_count"],
                "water_source_articles": water["source_article_count"],
                "water_dv": water["meta"]["dv_reference"][:180],
                "ground_articles": ground["knowledge_article_count"],
                "ground_source_articles": ground["source_article_count"],
                "ground_last": ground["meta"]["last_amendment"],
                "limitation_docs": len(limitation_docs),
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
