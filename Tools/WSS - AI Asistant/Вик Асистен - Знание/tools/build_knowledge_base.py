#!/usr/bin/env python3
"""Build the ВиК assistant knowledge base from local normative files.

The script copies originals unchanged into _source/, extracts RAR archives,
and writes one canonical Markdown file per act. It does not summarise,
rewrite, or fill in missing legal text.
"""

from __future__ import annotations

import hashlib
import html
import json
import re
import shutil
import subprocess
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

import fitz
from lxml import etree
from lxml import html as lxml_html

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS = ROOT / "_source" / "originals"
EXTRACTED = ROOT / "_source" / "extracted"
KNOWLEDGE = ROOT / "knowledge"
MANIFESTS = ROOT / "manifests"

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}

SOURCE_EXTS = {".pdf", ".doc", ".docx", ".rar", ".rtf"}

TAXONOMY = [
    ("building_water", "Сградни водопроводни инсталации", "Building water supply"),
    ("building_drainage", "Сградни канализационни инсталации", "Building drainage"),
    ("external_water", "Външни водоснабдителни мрежи", "External water supply"),
    ("external_sewer", "Външни канализационни системи", "External sewerage"),
    ("stormwater", "Дъждовни води", "Stormwater"),
    ("wastewater", "Отпадъчни води", "Wastewater"),
    ("drinking_water", "Питейна вода", "Drinking water"),
    ("groundwater", "Подземни води", "Groundwater"),
    ("water_sources", "Водоизточници", "Water sources"),
    ("sanitary_protection", "Санитарно-охранителни зони", "Sanitary protection zones"),
    ("fire_water", "Пожарогасене и противопожарна безопасност", "Fire safety"),
    ("utility_layout", "Разполагане на технически проводи", "Utility layout"),
    ("easements", "Сервитути", "Easements"),
    ("connections", "Присъединяване към ВиК системи", "Service connections"),
    ("investment_design", "Инвестиционно проектиране", "Investment design"),
    ("construction", "Строителство и устройство на територията", "Construction"),
    ("permits", "Разрешителни режими", "Permits"),
    ("discharge", "Заустване", "Discharge"),
]


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def clean_text(value: str) -> str:
    value = (
        value.replace("\u00a0", " ")
        .replace("\u200b", "")
        .replace("\u00ad", "")
        .replace("\u2028", "\n")
        .replace("\u2029", "\n")
        .replace("\x0c", "\n")
    )
    return value


def collapse_space(value: str) -> str:
    return re.sub(r"[ \t]+", " ", value).strip()


HEADING_WORDS = sorted(
    [
        "ПЪРВА", "ВТОРА", "ТРЕТА", "ЧЕТВЪРТА", "ПЕТА", "ШЕСТА", "СЕДМА", "ОСМА",
        "ДЕВЕТА", "ДЕСЕТА", "ЕДИНАДЕСЕТА", "ДВАНАДЕСЕТА", "ТРИНАДЕСЕТА",
        "ЧЕТИРИНАДЕСЕТА", "ПЕТНАДЕСЕТА", "ШЕСТНАДЕСЕТА", "СЕДЕМНАДЕСЕТА",
        "ОСЕМНАДЕСЕТА", "ДЕВЕТНАДЕСЕТА", "ДВАДЕСЕТА", "ЧАСТ", "ГЛАВА", "РАЗДЕЛ",
    ],
    key=len,
    reverse=True,
)


def segment_compact_heading(compact: str) -> str | None:
    upper = compact.upper()
    index = 0
    parts: list[str] = []
    while index < len(upper):
        match = next((word for word in HEADING_WORDS if upper.startswith(word, index)), None)
        if not match:
            return None
        parts.append(compact[index : index + len(match)])
        index += len(match)
    return " ".join(parts)


def collapse_letterspacing(line: str) -> str:
    stripped = line.strip()
    parts = re.split(r"\s{2,}", stripped)

    def from_tokens(tokens: list[str]) -> str:
        compact = "".join(tokens)
        return segment_compact_heading(compact) or " ".join(tokens)

    if len(parts) == 1:
        tokens = stripped.split()
        if len(tokens) >= 4 and all(len(token) == 1 for token in tokens):
            return from_tokens(tokens)
        if re.fullmatch(r"[А-Яа-я]{8,}", stripped):
            segmented = segment_compact_heading(stripped)
            if segmented:
                return segmented
        return stripped
    changed = False
    collapsed: list[str] = []
    for part in parts:
        tokens = part.split()
        if len(tokens) >= 2 and all(len(token) == 1 for token in tokens):
            collapsed.append(from_tokens(tokens))
            changed = True
        else:
            collapsed.append(part.strip())
    if not changed:
        return stripped
    return " ".join(collapsed)


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def article_count(text: str) -> int:
    return len(re.findall(r"Чл\.\s*\d+", text))


DROP_LINE = (
    re.compile(r"^\d{1,2}/\d{1,2}/\d{2},\s+\d{1,2}:\d{2}\s*(AM|PM)\b", re.I),
    re.compile(r"^Библиотека закони\b"),
    re.compile(r"^PAGE\s+\d+\s*$", re.I),
)

STRUCT_START = re.compile(
    r"^(Глава|ГЛАВА|ЧАСТ|Част|Раздел|РАЗДЕЛ|Чл\.|Приложение|ПРИЛОЖЕНИЕ|§)\b"
    r"|^(ПРЕХОДНИ|ДОПЪЛНИТЕЛНИ|ЗАКЛЮЧИТЕЛНИ)\b"
)


def drop_chrome(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if stripped == "Държавен вестник":
        return True
    return any(pattern.match(stripped) for pattern in DROP_LINE)


def classify(line: str) -> str | None:
    if re.match(r"^(ЧАСТ|Част)\b", line):
        return "part"
    if re.match(r"^(Глава|ГЛАВА)\b", line):
        return "chapter"
    if re.match(r"^(Раздел|РАЗДЕЛ)\b", line):
        return "section"
    if re.match(r"^(Приложение|ПРИЛОЖЕНИЕ)\s*№", line):
        return "annex"
    if re.match(r"^(ПРЕХОДНИ|ДОПЪЛНИТЕЛНИ|ЗАКЛЮЧИТЕЛНИ)\b", line):
        return "closing"
    if re.match(r"^§\s*\d+", line):
        return "paragraph_sign"
    if re.match(r"^Чл\.\s*\d+", line):
        return "article"
    return None


def is_title_follow(line: str) -> bool:
    if classify(line) or STRUCT_START.match(line):
        return False
    letters = re.findall(r"[А-Яа-яA-Za-z]", line)
    if len(letters) < 3 or len(line) > 180:
        return False
    upper = sum(1 for char in letters if char.isupper())
    return upper / len(letters) > 0.8


def split_label(kind: str, line: str) -> tuple[str, str]:
    if kind == "article":
        match = re.match(r"^(Чл\.\s*\d+[а-я]?\.?)\s*(.*)$", line)
    elif kind == "paragraph_sign":
        match = re.match(r"^(§\s*\d+\.?)\s*(.*)$", line)
    elif kind == "annex":
        match = re.match(r"^((?:Приложение|ПРИЛОЖЕНИЕ)\s*№\s*\d+[а-я]?\.?)\s*(.*)$", line)
    else:
        return line, ""
    if not match:
        return line, ""
    label, rest = match.group(1).strip(), match.group(2).strip()
    if kind in {"chapter", "part", "section", "closing", "annex"} and len(line) <= 220:
        return line, ""
    if kind == "annex" and len(line) <= 220:
        return line, ""
    return label, rest


def heading_levels(has_part: bool) -> dict[str, int]:
    if has_part:
        return {
            "part": 2,
            "chapter": 3,
            "section": 4,
            "article": 5,
            "annex": 2,
            "closing": 2,
            "paragraph_sign": 5,
        }
    return {
        "part": 2,
        "chapter": 2,
        "section": 3,
        "article": 4,
        "annex": 2,
        "closing": 2,
        "paragraph_sign": 4,
    }


def render_lines(lines: list[str], levels: dict[str, int]) -> str:
    output: list[str] = []
    index = 0
    while index < len(lines):
        line = collapse_letterspacing(clean_text(lines[index]))
        line = collapse_space(line)
        if line.startswith(("Част", "ЧАСТ", "Глава", "ГЛАВА")):
            line = re.sub(r"\.([А-ЯA-Z])", r". \1", line)
        if not line or drop_chrome(line):
            index += 1
            continue
        kind = classify(line)
        if kind in {"chapter", "part", "section"} and index + 1 < len(lines):
            nxt = collapse_space(collapse_letterspacing(clean_text(lines[index + 1])))
            if nxt and is_title_follow(nxt) and nxt not in line:
                line = f"{line.rstrip('.')} . {nxt}".replace(" . ", ". ")
                if line.startswith(("Глава", "ГЛАВА", "Част", "ЧАСТ", "Раздел", "РАЗДЕЛ")):
                    line = re.sub(r"\s+\.", ".", line)
                index += 1
        if kind:
            label, rest = split_label(kind, line)
            output.append(f"{'#' * levels[kind]} {label}")
            if rest:
                output.append(rest)
        else:
            output.append(line)
        index += 1
    return "\n\n".join(output)


def join_wrapped(lines: list[str]) -> list[str]:
    joined: list[str] = []
    for raw in lines:
        line = collapse_space(clean_text(raw))
        if not line or drop_chrome(line):
            continue
        if not joined:
            joined.append(line)
            continue
        previous = joined[-1]
        hyphen = re.search(r"[А-Яа-яA-Za-z]-$", previous) and re.match(r"^[а-яa-z]", line)
        continuation = (
            not classify(line)
            and not classify(previous)
            and not STRUCT_START.match(line)
            and re.match(r"^[а-я]", line)
            and not re.search(r"[.:;!?]$", previous)
            and not re.match(r"^\(\d+\)", line)
            and not re.match(r"^\d+\.", line)
            and not re.match(r"^[а-я]\)", line)
        )
        if hyphen:
            joined[-1] = previous[:-1] + line
        elif continuation:
            joined[-1] = previous + " " + line
        else:
            joined.append(line)
    return joined


def md_table(rows: list[list[str]]) -> str:
    cleaned: list[list[str]] = []
    for row in rows:
        cleaned.append(
            [
                collapse_space((cell or "").replace("|", "\\|")).replace("\n", "<br>")
                for cell in row
            ]
        )
    cleaned = [row for row in cleaned if any(cell.strip() for cell in row)]
    if not cleaned:
        return ""
    width = max(len(row) for row in cleaned)
    if width < 2:
        return "\n\n".join(cell for row in cleaned for cell in row if cell.strip())
    padded = [row + [""] * (width - len(row)) for row in cleaned]
    title_row = sum(1 for cell in padded[0] if cell.strip()) <= 1 and len(padded) > 2
    if title_row or width > 14:
        return html_table(padded)
    header = "| " + " | ".join(padded[0]) + " |"
    rule = "| " + " | ".join("---" for _ in padded[0]) + " |"
    body = ["| " + " | ".join(row) + " |" for row in padded[1:]]
    return "\n".join([header, rule, *body])


def html_table(rows: list[list[str]]) -> str:
    parts = ["<table>"]
    for row in rows:
        cells = "".join(
                f"<td>{html.escape(cell).replace('&lt;br&gt;', '<br>')}</td>" for cell in row
            )
        parts.append(f"<tr>{cells}</tr>")
    parts.append("</table>")
    return "\n".join(parts)


def replace_equations(text: str) -> tuple[str, int]:
    pattern = re.compile(r"EMBED\s+Equation(?:\.\d+)?\s*,?\s*(?:\(\s*(\d+)\s*\))?")

    def repl(match: re.Match[str]) -> str:
        number = match.group(1)
        label = f" ({number})" if number else ""
        return (
            f"[ФОРМУЛА{label}: няма текстово извлечение от обект Equation Editor; "
            "виж оригиналния файл]"
        )

    updated, count = pattern.subn(repl, text)
    return updated, count


def headerish(row: list[str]) -> bool:
    nonempty = [collapse_space(cell.replace("\n", " ")) for cell in row if cell and cell.strip()]
    if len(nonempty) < 2:
        return False
    short = [cell for cell in nonempty if len(cell) <= 90]
    if len(short) < 2:
        return False
    if sum(len(cell) for cell in nonempty) / len(nonempty) > 120:
        return False
    return True


def table_ok(table) -> bool:
    data = table.extract()
    if table.row_count < 3 or not (2 <= table.col_count <= 12):
        return False
    rows = [[(cell or "").strip() for cell in row] for row in data]
    if not any(headerish(row) for row in rows[:3]):
        return False
    cells = [cell for row in rows for cell in row]
    nonempty = [cell for cell in cells if cell]
    if not cells or len(nonempty) / len(cells) < 0.4:
        return False
    blob = " ".join(nonempty)
    if "Чл." in blob:
        return False
    return True


def pdf_plain_lines(page) -> list[str]:
    words = page.get_text("words")
    grouped: list[list[tuple]] = []
    for word in sorted(words, key=lambda item: (item[1], item[0])):
        if not grouped or abs(word[1] - grouped[-1][0][1]) > 2.0:
            grouped.append([word])
        else:
            grouped[-1].append(word)
    lines = []
    for group in grouped:
        group.sort(key=lambda item: item[0])
        text = " ".join(item[4] for item in group if item[4].strip())
        if text.strip():
            lines.append(text)
    return lines


def pdf_blocks(path: Path, use_tables: bool) -> tuple[list[tuple], int]:
    document = fitz.open(path)
    blocks: list[tuple] = []
    tables_used = 0
    for page in document:
        accepted = []
        if use_tables:
            for table in page.find_tables().tables:
                if table_ok(table):
                    accepted.append(table)
        words = []
        for word in page.get_text("words"):
            if any(center_inside(word, table.bbox) for table in accepted):
                continue
            words.append(word)
        grouped: list[list[tuple]] = []
        for word in sorted(words, key=lambda item: (item[1], item[0])):
            if not grouped or abs(word[1] - grouped[-1][0][1]) > 2.0:
                grouped.append([word])
            else:
                grouped[-1].append(word)
        line_events = []
        for group in grouped:
            group.sort(key=lambda item: item[0])
            text = " ".join(item[4] for item in group if item[4].strip())
            if text.strip():
                line_events.append((group[0][1], 1, text))
        events = list(line_events)
        for table in accepted:
            rows = [[cell or "" for cell in row] for row in table.extract()]
            rendered = md_table(rows)
            if rendered:
                events.append((table.bbox[1], 0, rendered))
                tables_used += 1
        events.sort(key=lambda item: (item[0], item[1]))
        buffer: list[str] = []

        def flush() -> None:
            if buffer:
                blocks.append(("lines", join_wrapped(buffer)))
                buffer.clear()

        for _y, kind, payload in events:
            if kind == 1:
                buffer.append(payload)
            else:
                flush()
                blocks.append(("table", payload))
        flush()
    return blocks, tables_used


def center_inside(word, bbox) -> bool:
    cx = (word[0] + word[2]) / 2
    cy = (word[1] + word[3]) / 2
    x0, y0, x1, y1 = bbox
    return x0 - 1 <= cx <= x1 + 1 and y0 - 1 <= cy <= y1 + 1


def docx_para_text(paragraph) -> str:
    parts: list[str] = []
    for node in paragraph.iter():
        tag = etree.QName(node).localname
        if tag == "t" and node.text:
            parts.append(node.text)
        elif tag == "tab":
            parts.append(" ")
        elif tag == "br":
            parts.append("\n")
    return "".join(parts)


def docx_cell_text(cell) -> str:
    lines = []
    for paragraph in cell.xpath("./w:p", namespaces=NS):
        text = collapse_space(docx_para_text(paragraph))
        if text:
            lines.append(text)
    return " ".join(lines)


def docx_table_html(table) -> str:
    rows = []
    for tr in table.xpath("./w:tr", namespaces=NS):
        cells = []
        for tc in tr.xpath("./w:tc", namespaces=NS):
            grid = tc.xpath("./w:tcPr/w:gridSpan", namespaces=NS)
            colspan = int(grid[0].get(f"{{{W}}}val")) if grid else 1
            merge = tc.xpath("./w:tcPr/w:vMerge", namespaces=NS)
            vmerge = None
            if merge:
                vmerge = merge[0].get(f"{{{W}}}val") or "continue"
            cells.append(
                {
                    "text": docx_cell_text(tc),
                    "colspan": colspan,
                    "vmerge": vmerge,
                    "rowspan": 1,
                    "skip": False,
                }
            )
        rows.append(cells)
    for row_index, row in enumerate(rows):
        for col_index, cell in enumerate(row):
            if cell["vmerge"] != "restart":
                continue
            span = 1
            for next_index in range(row_index + 1, len(rows)):
                if col_index < len(rows[next_index]) and rows[next_index][col_index]["vmerge"] == "continue":
                    span += 1
                    rows[next_index][col_index]["skip"] = True
                else:
                    break
            cell["rowspan"] = span
    parts = ["<table>"]
    for row in rows:
        parts.append("<tr>")
        for cell in row:
            if cell["skip"]:
                continue
            attrs = []
            if cell["colspan"] > 1:
                attrs.append(f' colspan="{cell["colspan"]}"')
            if cell["rowspan"] > 1:
                attrs.append(f' rowspan="{cell["rowspan"]}"')
            parts.append(f"<td{''.join(attrs)}>{html.escape(cell['text'])}</td>")
        parts.append("</tr>")
    parts.append("</table>")
    return "\n".join(parts)


def docx_blocks(path: Path) -> tuple[list[tuple], int, int]:
    with zipfile.ZipFile(path) as archive:
        root = etree.fromstring(archive.read("word/document.xml"))
    body = root.xpath("//w:body", namespaces=NS)[0]
    blocks: list[tuple] = []
    formulas = 0
    figures = 0
    for child in body:
        name = etree.QName(child).localname
        if name == "p":
            text, count = replace_equations(docx_para_text(child))
            has_figure = bool(child.xpath(".//w:drawing|.//w:pict|.//w:object", namespaces=NS))
            if has_figure and not collapse_space(text):
                figures += 1
                blocks.append(
                    (
                        "lines",
                        ["[ФИГУРА: не е извлечена като текст; виж оригиналния файл]"],
                    )
                )
            formulas += count
            lines = [collapse_space(line) for line in clean_text(text).splitlines()]
            lines = [line for line in lines if line]
            if lines:
                blocks.append(("lines", lines))
        elif name == "tbl":
            merged = bool(child.xpath(".//w:gridSpan|.//w:vMerge", namespaces=NS))
            if merged:
                blocks.append(("table", docx_table_html(child)))
            else:
                rows = []
                for tr in child.xpath("./w:tr", namespaces=NS):
                    rows.append(
                        [docx_cell_text(tc) for tc in tr.xpath("./w:tc", namespaces=NS)]
                    )
                rendered = md_table(rows)
                if rendered:
                    blocks.append(("table", rendered))
    return blocks, formulas, figures


def html_blocks(path: Path) -> tuple[list[tuple], int]:
    completed = subprocess.run(
        ["textutil", "-convert", "html", "-stdout", str(path)],
        check=True,
        capture_output=True,
    )
    document = lxml_html.fromstring(completed.stdout)
    body = document.find("body")
    if body is None:
        body = document
    formulas = 0

    def walk(node) -> list[tuple]:
        nonlocal formulas
        found: list[tuple] = []
        for child in node:
            if not isinstance(child.tag, str):
                continue
            tag = child.tag.lower()
            if tag in {"head", "style", "script"}:
                continue
            if tag == "table":
                rows = []
                for tr in child.xpath("./thead/tr|./tbody/tr|./tfoot/tr|./tr"):
                    cells = [
                        collapse_space(td.text_content())
                        for td in tr.xpath("./th|./td")
                    ]
                    if any(cells):
                        rows.append(cells)
                rendered = md_table(rows)
                if rendered:
                    found.append(("table", rendered))
                continue
            if tag == "p":
                text, count = replace_equations(child.text_content())
                formulas += count
                lines = [collapse_space(line) for line in clean_text(text).splitlines()]
                lines = [line for line in lines if line and not drop_chrome(line)]
                if lines:
                    found.append(("lines", lines))
                continue
            found.extend(walk(child))
        return found

    return walk(body), formulas


def blocks_to_markdown(blocks: list[tuple]) -> tuple[str, int]:
    flat_lines: list[str] = []
    for kind, payload in blocks:
        if kind == "lines":
            flat_lines.extend(payload)
    has_part = any(
        classify(collapse_space(collapse_letterspacing(clean_text(line)))) == "part"
        for line in flat_lines
    )
    levels = heading_levels(has_part)
    chunks: list[str] = []
    table_count = 0
    for kind, payload in blocks:
        if kind == "lines":
            rendered = render_lines(payload, levels)
            if rendered:
                chunks.append(rendered)
        elif kind == "table" and payload:
            chunks.append(payload)
            table_count += 1
    return "\n\n".join(chunks), table_count


def plain_text_from_blocks(blocks: list[tuple]) -> str:
    parts = []
    for kind, payload in blocks:
        if kind == "lines":
            parts.extend(payload)
    return "\n".join(parts)


def extract_header_meta(text: str) -> dict[str, str]:
    lines = [collapse_space(line) for line in text.splitlines() if collapse_space(line)]
    stop = re.compile(
        r"^(?:Глава|ГЛАВА|ЧАСТ|Част|Раздел|РАЗДЕЛ|Чл\.|§\s*\d|Приложение|ПРИЛОЖЕНИЕ)"
    )
    head: list[str] = []
    for line in lines[:80]:
        normalized = collapse_letterspacing(line)
        if stop.match(line) or stop.match(normalized):
            break
        head.append(line)
    header = re.sub(r"\s+", " ", " ".join(head)).strip()
    header = re.split(r"\s+(?=Чл\.|Глава|ГЛАВА|Част|ЧАСТ|Раздел|РАЗДЕЛ)", header, maxsplit=1)[0]
    effective = ""
    match = re.search(r"[Вв] сила от\s+(\d{1,2}\.\d{1,2}\.\d{4}\s*г\.?)", header)
    if match:
        effective = collapse_space(match.group(1))
    dv = ""
    match = re.search(r"(\(?\s*Обн\..*)$", header, re.I)
    if match:
        dv = match.group(1).strip()
    if not dv:
        match = re.search(r"брой:\s*\d+,\s*от дата\s+\d{1,2}\.\d{1,2}\.\d{4}\s*г\.?", header)
        if match:
            dv = match.group(0)
    last = ""
    scope = dv or header
    if re.search(r"изм|доп\.|попр", scope, re.I):
        cites = re.findall(r"бр\.?\s*\d+\s*от\s+[^,;)]+", scope, re.I)
        if cites:
            last = collapse_space(cites[-1])
    return {
        "effective_date": effective,
        "dv_reference": dv,
        "last_amendment": last,
    }


def raw_pdf_text(path: Path) -> str:
    document = fitz.open(path)
    return "\n".join("\n".join(pdf_plain_lines(page)) for page in document)


def raw_docx_text(path: Path) -> str:
    blocks, _formulas, _figures = docx_blocks(path)
    return plain_text_from_blocks(blocks)


def raw_doc_text(path: Path) -> str:
    completed = subprocess.run(
        ["textutil", "-convert", "txt", "-stdout", str(path)],
        check=True,
        capture_output=True,
    )
    return completed.stdout.decode("utf-8", "replace")


def front_matter(record: dict, meta: dict[str, str]) -> str:
    domains = "\n".join(f"  - {domain}" for domain in record["domains"])
    notes = record.get("notes", "")
    lines = [
        "---",
        f"id: {record['id']}",
        f"title: {yaml_quote(record['title'])}",
        f"type: {yaml_quote(record['type'])}",
        f"number: {yaml_quote(record['number'])}",
        f"year: {record['year']}",
        "domain:",
        domains,
        'jurisdiction: "BG"',
        'language: "bg"',
        'status: "unknown"',
        'status_confidence: "document_only"',
        f"source_file: {yaml_quote(record['source_file'])}",
        f"source_institution: {yaml_quote(record['source_institution'])}",
        f"dv_reference: {yaml_quote(meta['dv_reference'])}",
        f"effective_date: {yaml_quote(meta['effective_date'])}",
        f"last_amendment: {yaml_quote(meta['last_amendment'])}",
        f"has_annexes: {'true' if record['has_annexes'] else 'false'}",
        f"priority: {yaml_quote(record['priority'])}",
        f"notes: {yaml_quote(notes)}",
        "---",
        "",
        f"# {record['title']}",
        "",
        "<!-- knowledge-note: machine-extracted text; normative wording is not rewritten; unresolved formulas and figures stay marked and point at the original file -->",
        "",
    ]
    return "\n".join(lines)


def build_pdf(path: Path, source_articles: int) -> dict:
    blocks, tables = pdf_blocks(path, True)
    body, table_count = blocks_to_markdown(blocks)
    kept = article_count(body)
    warnings = []
    if source_articles and kept + max(2, int(source_articles * 0.05)) < source_articles:
        blocks, tables = pdf_blocks(path, False)
        body, table_count = blocks_to_markdown(blocks)
        warnings.append(
            "PDF таблиците са оставени като линейен текст, защото табличното извличане махаше членове."
        )
        tables = 0
    return {
        "body": body,
        "plain": plain_text_from_blocks(blocks),
        "formulas": 0,
        "figures": 0,
        "tables": table_count,
        "warnings": warnings,
    }


def build_docx(path: Path) -> dict:
    blocks, formulas, figures = docx_blocks(path)
    body, tables = blocks_to_markdown(blocks)
    warnings = []
    if formulas:
        warnings.append(f"Неизвлечени формули Equation Editor: {formulas}.")
    if figures:
        warnings.append(f"Неизвлечени фигури/обекти: {figures}.")
    return {
        "body": body,
        "plain": plain_text_from_blocks(blocks),
        "formulas": formulas,
        "figures": figures,
        "tables": tables,
        "warnings": warnings,
    }


def bell_spans(text: str) -> list[tuple[int, int]]:
    start = text.find("\x07")
    end = text.rfind("\x07")
    if start < 0 or end < start:
        return []
    return [(start, end + 1)]


def _bell_cells(region: str) -> list[str]:
    cells = []
    for raw in region.split("\x07"):
        lines = [collapse_space(line) for line in raw.split("\n") if collapse_space(line)]
        cells.append("<br>".join(lines))
    return cells


def _index_runs(cells: list[str]) -> list[tuple[int, int]]:
    runs = []
    index = 0
    while index < len(cells):
        if cells[index] != "1":
            index += 1
            continue
        end = index
        expected = 1
        while end < len(cells) and cells[end] == str(expected):
            end += 1
            expected += 1
        if expected - 1 >= 4:
            runs.append((index, end))
            index = end
        else:
            index += 1
    return runs


def _row_score(width: int, data: list[str]) -> int:
    if width < 4:
        return 0
    usable = len(data) - (len(data) % width)
    score = 0
    for offset in range(0, usable, width):
        row = data[offset : offset + width]
        blob = " ".join(row[:3])
        if re.search(r"\d+\.", blob):
            score += 1
    return score


def _transpose_if_columnar(row: list[str]) -> list[list[str]] | None:
    filled = [cell for cell in row if cell]
    if len(filled) < 3 or any(cell.count("<br>") < 5 for cell in filled):
        return None
    columns = [cell.split("<br>") for cell in row]
    height = max(len(column) for column in columns)
    if height < 5 or any(len(column) not in {height, 0} for column in columns):
        return None
    return [
        [column[line] if line < len(column) else "" for column in columns]
        for line in range(height)
    ]


def recover_bell_region(region: str) -> str | None:
    # Equal-width rows separated by a blank cell marker are reliable.
    parsed: list[list[str]] = []
    for part in region.split("\x07\x07"):
        row = [cell for cell in _bell_cells(part) if cell or True]
        while row and not row[0]:
            row.pop(0)
        while row and not row[-1]:
            row.pop()
        if row and all(cell.count("<br>") < 3 for cell in row):
            parsed.append(row)
    widths = [len(row) for row in parsed if len(row) >= 4]
    if widths:
        common, count = Counter(widths).most_common(1)[0]
        rows = [row for row in parsed if len(row) == common]
        if common >= 4 and count >= 5 and count >= len(parsed) * 0.6:
            return md_table(rows)

    cells = _bell_cells(region)
    runs = _index_runs(cells)
    if not runs:
        return None
    tables: list[str] = []
    for position, (start, end) in enumerate(runs):
        width_hint = end - start
        data_end = runs[position + 1][0] if position + 1 < len(runs) else len(cells)
        data = cells[end:data_end]
        while data and not data[-1]:
            data.pop()
        best_width = 0
        best_score = 0
        for width in range(width_hint, width_hint + 3):
            score = _row_score(width, data)
            if score > best_score:
                best_score = score
                best_width = width
        if best_width and best_score >= 3:
            usable = len(data) - (len(data) % best_width)
            rows = [data[offset : offset + best_width] for offset in range(0, usable, best_width)]
            transposed = _transpose_if_columnar(rows[0]) if len(rows) == 1 else None
            tables.append(md_table(transposed or rows))
            continue
        chunk = cells[start:data_end]
        transposed = _transpose_if_columnar(chunk[end - start :]) if False else None
        columnar = [cell for cell in data if cell.count("<br>") >= 5]
        if len(columnar) >= 3:
            probe = _transpose_if_columnar(columnar)
            if probe:
                tables.append(md_table(probe))
                continue
        return None
    return "\n\n".join(tables) if tables else None


def numeric_retention(source: str, rendered: str) -> float:
    pattern = re.compile(r"\d+(?:,\d+)?")
    found = pattern.findall(source)
    if len(found) < 15:
        return 1.0
    source_counts = Counter(found)
    rendered_counts = Counter(pattern.findall(rendered))
    lost = sum(max(0, source_counts[token] - rendered_counts[token]) for token in source_counts)
    return 1 - lost / sum(source_counts.values())


def blocks_from_bell_text(text: str) -> list[tuple]:
    blocks: list[tuple] = []
    cursor = 0
    for start, end in bell_spans(text):
        prose = [collapse_space(line) for line in text[cursor:start].splitlines() if collapse_space(line)]
        if prose:
            blocks.append(("lines", prose))
        region = text[start:end]
        table = recover_bell_region(region)
        if table and numeric_retention(region, table) < 0.98:
            table = None
        if table:
            blocks.append(("table", table))
        else:
            verbatim = region.replace("\x07", " | ")
            blocks.append(
                (
                    "table",
                    "\n".join(
                        [
                            "Таблицата не е пренаредена в решетка, защото автоматичното подравняване не запазва всички стойности. Следва пълният текст на клетките от оригиналния файл.",
                            "",
                            "```text",
                            verbatim.strip(),
                            "```",
                        ]
                    ),
                )
            )
        cursor = end
    tail = [collapse_space(line) for line in text[cursor:].splitlines() if collapse_space(line)]
    if tail:
        blocks.append(("lines", tail))
    return blocks


def build_doc(path: Path) -> dict:
    raw = raw_doc_text(path)
    raw, formulas = replace_equations(raw)
    warnings = []
    if "\x07" in raw:
        blocks = blocks_from_bell_text(raw)
        warnings.append(
            "Сложните Word таблици са възстановени от клетъчните разделители на текста, без добавени стойности."
        )
    else:
        blocks, html_formulas = html_blocks(path)
        formulas += html_formulas
    body, tables = blocks_to_markdown(blocks)
    if "не е пренаредена в решетка" in body:
        warnings.append(
            "Част от таблиците са запазени като пълен клетъчен текст, без пренареждане, защото решетката не се възстановява надеждно."
        )
    if formulas:
        warnings.append(f"Неизвлечени формули Equation Editor: {formulas}.")
    return {
        "body": body,
        "plain": plain_text_from_blocks(blocks) if "\x07" not in raw else raw.replace("\x07", " "),
        "formulas": formulas,
        "figures": 0,
        "tables": tables,
        "warnings": warnings,
    }


def attach_pdf_figures(path: Path, body: str, asset_dir: Path, stem: str) -> tuple[str, int]:
    document = fitz.open(path)
    placed = []
    for page_index, page in enumerate(document):
        words = len(page.get_text("words"))
        page_area = page.rect.width * page.rect.height or 1
        for info in page.get_image_info(xrefs=True):
            if (info.get("width") or 0) < 400 or (info.get("height") or 0) < 250:
                continue
            bbox = info["bbox"]
            area = max(0, bbox[2] - bbox[0]) * max(0, bbox[3] - bbox[1])
            if area / page_area > 0.65 and words > 120:
                continue
            placed.append((info["xref"], page_index))
    counts = Counter(item[0] for item in placed)
    kept = []
    seen = set()
    for xref, page_index in placed:
        if counts[xref] > 2 or xref in seen:
            continue
        seen.add(xref)
        kept.append((xref, page_index))
    if not kept:
        return body, 0
    asset_dir.mkdir(parents=True, exist_ok=True)
    lines = [
        "",
        "## Графични приложения без текстов слой",
        "",
        "Следните изображения са в оригиналния PDF и нямат отделен текстов слой. Стойностите от тях не са преписвани.",
        "",
    ]
    for number, (xref, page_index) in enumerate(kept, start=1):
        image = document.extract_image(xref)
        filename = f"{stem}-figure-{number}.{image['ext']}"
        (asset_dir / filename).write_bytes(image["image"])
        lines.extend(
            [
                f"### Изображение {number}, страница {page_index + 1} на PDF",
                "",
                f"![Изображение {number} от оригиналния PDF, страница {page_index + 1}](assets/{filename})",
                "",
            ]
        )
    return body + "\n" + "\n".join(lines), len(kept)


def convert_file(path: Path, source_articles: int) -> dict:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return build_pdf(path, source_articles)
    if suffix == ".docx":
        return build_docx(path)
    if suffix in {".doc", ".rtf"}:
        return build_doc(path)
    raise ValueError(f"Unsupported file: {path}")


def source_articles_for(path: Path) -> int:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        return article_count(raw_pdf_text(path))
    if suffix == ".docx":
        return article_count(raw_docx_text(path))
    return article_count(raw_doc_text(path))


def relocate_originals() -> list[dict]:
    ORIGINALS.mkdir(parents=True, exist_ok=True)
    records = []
    for path in sorted(ROOT.iterdir()):
        if not path.is_file() or path.suffix.lower() not in SOURCE_EXTS:
            continue
        dest = ORIGINALS / path.name
        source_hash = sha256(path)
        if dest.exists():
            if sha256(dest) != source_hash:
                raise SystemExit(f"Refusing to replace different file: {dest.name}")
        else:
            shutil.copy2(path, dest)
            if sha256(dest) != source_hash:
                raise SystemExit(f"Copy hash mismatch: {dest.name}")
        path.unlink()
        records.append(dest)
    if not records and not any(ORIGINALS.iterdir()):
        raise SystemExit("No source files found.")
    return [item for item in sorted(ORIGINALS.iterdir()) if item.is_file()]


def extract_archives() -> None:
    EXTRACTED.mkdir(parents=True, exist_ok=True)
    marker = EXTRACTED / "ViK sgradi 17.06.DV.doc"
    annex_dir = EXTRACTED / "Приложения към Наредба №4"
    if marker.exists() and annex_dir.exists() and len(list(annex_dir.glob("*.doc"))) >= 12:
        return
    for archive in sorted(ORIGINALS.glob("*.rar")):
        subprocess.run(["bsdtar", "-xf", str(archive), "-C", str(EXTRACTED)], check=True)


def annex_number(path: Path) -> int:
    match = re.search(r"(\d+)", path.name)
    return int(match.group(1)) if match else 999


CATALOG = [
    {
        "id": "naredba-4-2005-sgradni-vik",
        "title": "Наредба № 4 от 17 юни 2005 г. за проектиране, изграждане и експлоатация на сградни водопроводни и канализационни инсталации",
        "short_title": "Наредба № 4/2005 — сградни ВиК инсталации",
        "type": "наредба",
        "number": "4",
        "year": 2005,
        "domains": ["building_water", "building_drainage"],
        "priority": "P0",
        "folder": "01_sgradni_vik",
        "filename": "naredba-4-2005-sgradni-vodoprovodni-kanalizacionni-instalacii.md",
        "source_institution": "Министерство на регионалното развитие и благоустройството",
        "expect": "сградни водопроводни и канализационни инсталации",
        "text_form": "promulgation_only",
        "has_annexes": True,
        "bundle": "ordinance4",
        "notes": "Файлът представя текста с обнародване в ДВ, бр. 53 от 2005 г. и поправка в бр. 56 от 2005 г. По-късна консолидация не се съдържа в източника и не е допълвана. Приложения № 1–12 са извлечени от отделния архив и са добавени след основния текст. Формулите Equation Editor и графичните символи не са възстановени.",
    },
    {
        "id": "rd-02-20-8-2013",
        "title": "Наредба № РД-02-20-8 от 17 май 2013 г. за проектиране, изграждане и експлоатация на канализационни системи",
        "short_title": "Наредба № РД-02-20-8/2013 — канализационни системи",
        "type": "наредба",
        "number": "РД-02-20-8",
        "year": 2013,
        "domains": ["external_sewer", "wastewater", "stormwater"],
        "priority": "P0",
        "folder": "03_kanalizatsiya",
        "filename": "rd-02-20-8-2013-kanalizacionni-sistemi.md",
        "source_institution": "министър на регионалното развитие и благоустройството",
        "expect": "КАНАЛИЗАЦИОННИ СИСТЕМИ",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "4_0f6748bdc66651849c3c41596b2368e35.docx",
        "notes": "Текстът във файла съдържа заглавна бележка с изменения до поправката в ДВ, бр. 65 от 2024 г. Дали това е последната официална редакция не е проверявано извън файла.",
    },
    {
        "id": "naredba-8-1999",
        "title": "Наредба № 8 от 28 юли 1999 г. за правила и норми за разполагане на технически проводи и съоръжения в населени места",
        "short_title": "Наредба № 8/1999 — технически проводи",
        "type": "наредба",
        "number": "8",
        "year": 1999,
        "domains": ["utility_layout"],
        "priority": "P0",
        "folder": "04_tehnicheska_infrastruktura",
        "filename": "naredba-8-1999-tehnicheski-provodi.md",
        "source_institution": "министър на регионалното развитие и благоустройството",
        "expect": "ТЕХНИЧЕСКИ ПРОВОДИ",
        "text_form": "promulgation_only",
        "has_annexes": True,
        "source_name": "наредба-8-от-1999-г-за-правила-и-норми-за-разполагане-на-технически-проводи-и-съоръжения-в-населени-места.pdf",
        "notes": "Заглавната бележка сочи само обнародване в ДВ, бр. 72 от 1999 г. Във файла няма маркирани последващи изменения. Статусът спрямо по-късни актове не е установен.",
    },
    {
        "id": "rd-02-20-1-2020",
        "title": "Наредба № РД-02-20-1 от 5 март 2020 г. за условията и реда за определяне на размерите и разположението на сервитутните ивици и на специалния режим за упражняване на сервитутите на водоснабдителните и канализационните проводи (мрежи) и съоръжения извън населените места и селищните образувания",
        "short_title": "Наредба № РД-02-20-1/2020 — сервитутни ивици",
        "type": "наредба",
        "number": "РД-02-20-1",
        "year": 2020,
        "domains": ["easements", "external_water", "external_sewer"],
        "priority": "P0",
        "folder": "04_tehnicheska_infrastruktura",
        "filename": "rd-02-20-1-2020-servitutni-ivici.md",
        "source_institution": "Министерство на регионалното развитие и благоустройството",
        "expect": "сервитутните ивици",
        "text_form": "gazette_publication",
        "has_annexes": True,
        "source_name": "Държавен вестник.pdf",
        "notes": "Източникът е публикация в Държавен вестник, бр. 29 от 27.3.2020 г., а не отделно обозначен консолидиран текст. Служебният колонтитул от записа на страницата не е част от акта.",
    },
    {
        "id": "naredba-4-2004-prisaedinyavane",
        "title": "Наредба № 4 от 14 септември 2004 г. за условията и реда за присъединяване на потребителите и за ползване на водоснабдителните и канализационните системи",
        "short_title": "Наредба № 4/2004 — присъединяване към ВиК",
        "type": "наредба",
        "number": "4",
        "year": 2004,
        "domains": ["connections"],
        "priority": "P0",
        "folder": "05_prisaedinyavane",
        "filename": "naredba-4-2004-prisaedinyavane-vik.md",
        "source_institution": "министър на регионалното развитие и благоустройството",
        "expect": "ПРИСЪЕДИНЯВАНЕ НА ПОТРЕБИТЕЛИТЕ",
        "text_form": "consolidated_in_file",
        "has_annexes": False,
        "source_name": "Наредба № 4 от 14 септември 2004 г. за условията и реда за присъединяване на потребителите и за ползване н1a36d2c1833c86cffe802a330e26bb12.docx",
        "notes": "Заглавната бележка във файла изброява изменения до ДВ, бр. 70 от 2019 г. Дали има по-късна редакция не е установено извън файла.",
    },
    {
        "id": "naredba-4-2001-investicionni-proekti",
        "title": "Наредба № 4 от 21 май 2001 г. за обхвата и съдържанието на инвестиционните проекти",
        "short_title": "Наредба № 4/2001 — инвестиционни проекти",
        "type": "наредба",
        "number": "4",
        "year": 2001,
        "domains": ["investment_design", "construction"],
        "priority": "P1",
        "folder": "06_investitsionno_proektirane",
        "filename": "naredba-4-2001-investicionni-proekti.md",
        "source_institution": "министър на регионалното развитие и благоустройството",
        "expect": "ИНВЕСТИЦИОННИТЕ ПРОЕКТИ",
        "text_form": "consolidated_in_file",
        "has_annexes": False,
        "source_name": "Наредба инветиционни проекти70ae1836aabe37bd404232174c1799f2.doc",
        "notes": "Заглавната бележка във файла изброява изменения до ДВ, бр. 44 от 2017 г. Дали има по-късна редакция не е установено извън файла.",
    },
    {
        "id": "zut",
        "title": "Закон за устройство на територията",
        "short_title": "ЗУТ",
        "type": "закон",
        "number": "",
        "year": 2001,
        "domains": ["construction", "investment_design", "permits"],
        "priority": "P1",
        "folder": "07_zut_i_stroitelstvo",
        "filename": "zut.md",
        "source_institution": "",
        "expect": "ЗАКОН ЗА УСТРОЙСТВО НА ТЕРИТОРИЯТА",
        "text_form": "consolidated_in_file",
        "has_annexes": False,
        "source_name": "ЗАКОН ЗА УСТРОЙСТВО НА ТЕРИТОРИЯТА1db4631404ede7c63c35e70ecdc31498.docx",
        "notes": "Консолидиран текст според заглавната бележка във файла. Издател не е изрично посочен в началото на файла. Актуалността не е проверявана извън файла.",
    },
    {
        "id": "naredba-1-2003-nomenklatura-stroeji",
        "title": "Наредба № 1 от 30 юли 2003 г. за номенклатурата на видовете строежи",
        "short_title": "Наредба № 1/2003 — номенклатура на строежите",
        "type": "наредба",
        "number": "1",
        "year": 2003,
        "domains": ["construction"],
        "priority": "P2",
        "folder": "07_zut_i_stroitelstvo",
        "filename": "naredba-1-2003-nomenklatura-vidove-stroeji.md",
        "source_institution": "министър на регионалното развитие и благоустройството",
        "expect": "НОМЕНКЛАТУРАТА НА ВИДОВЕТЕ СТРОЕЖИ",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "НАРЕДБА № 1 от 30 юли 2003 г. за номенклатурата на видовете строежиf004bb4d7d70fda218fd000e7d57e0a5.docx",
        "notes": "Заглавната бележка във файла изброява изменения до ДВ, бр. 56 от 2017 г.",
    },
    {
        "id": "naredba-3-2003-aktove-protokoli",
        "title": "Наредба № 3 от 31 юли 2003 г. за съставяне на актове и протоколи по време на строителството",
        "short_title": "Наредба № 3/2003 — актове и протоколи",
        "type": "наредба",
        "number": "3",
        "year": 2003,
        "domains": ["construction"],
        "priority": "P2",
        "folder": "07_zut_i_stroitelstvo",
        "filename": "naredba-3-2003-aktove-i-protokoli.md",
        "source_institution": "министър на регионалното развитие и благоустройството",
        "expect": "АКТОВЕ И ПРОТОКОЛИ",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "Наредба № 3 от 31 юли 2003 г. за съставяне на актове и протоколи по време на строителствотоf1e6837254f5655698280f20ab74e0f7.docx",
        "notes": "Заглавната бележка във файла изброява изменения до ДВ, бр. 56 от 2017 г. Образците в приложенията са част от същия файл.",
    },
    {
        "id": "zakon-za-vodite",
        "title": "Закон за водите",
        "short_title": "Закон за водите",
        "type": "закон",
        "number": "",
        "year": 1999,
        "domains": ["permits", "water_sources", "groundwater", "drinking_water", "wastewater", "discharge"],
        "priority": "P0",
        "folder": "08_vodi_i_razreshitelni",
        "filename": "zakon-za-vodite.md",
        "source_institution": "",
        "expect": "ЗАКОН за водите",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "zakon_za_vodite_16062026.pdf",
        "notes": "Консолидиран текст според заглавната бележка във файла, включително цитираното изменение в ДВ, бр. 55 от 16.06.2026 г. Издател не е изрично посочен в началото. Актуалността не е проверявана извън файла.",
    },
    {
        "id": "naredba-iz-1971-2009",
        "title": "Наредба № Iз-1971 от 29 октомври 2009 г. за строително-технически правила и норми за осигуряване на безопасност при пожар",
        "short_title": "Наредба № Iз-1971/2009 — пожарна безопасност",
        "type": "наредба",
        "number": "Iз-1971",
        "year": 2009,
        "domains": ["fire_water", "construction"],
        "priority": "P1",
        "folder": "09_pozharna_bezopasnost",
        "filename": "naredba-iz-1971-2009-pojarna-bezopasnost.md",
        "source_institution": "министър на вътрешните работи и министър на регионалното развитие и благоустройството",
        "expect": "БЕЗОПАСНОСТ ПРИ ПОЖАР",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "НАРЕДБА № Iз-1971 ОТ 29 ОКТОМВРИ 2009 Г. ЗА СТРОИТЕЛНО-ТЕХНИЧЕСКИ ПРАВИЛА И НОРМИ ЗА ОСИГУРЯВАНЕ НА b492fc78d245f9a373fc8de4a3036d28.docx",
        "notes": "Целият акт е включен, без отделяне на ВиК разпоредби. Заглавната бележка във файла стига до ДВ, бр. 46 от 2025 г.",
    },
    {
        "id": "naredba-9-2001",
        "title": "Наредба № 9 от 16 март 2001 г. за качеството на водата, предназначена за питейно-битови цели",
        "short_title": "Наредба № 9/2001 — качество на питейната вода",
        "type": "наредба",
        "number": "9",
        "year": 2001,
        "domains": ["drinking_water"],
        "priority": "P0",
        "folder": "10_piteyna_voda_i_soz",
        "filename": "naredba-9-2001-kachestvo-piteyna-voda.md",
        "source_institution": "министър на здравеопазването, министър на регионалното развитие и благоустройството и министър на околната среда и водите",
        "expect": "ПРЕДНАЗНАЧЕНА ЗА ПИТЕЙНО-БИТОВИ ЦЕЛИ",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "naredba_9_dop_23_01_2026.pdf",
        "notes": "Заглавната бележка във файла изброява изменения до ДВ, бр. 9 от 23 януари 2026 г. Името на файла съвпада с тази дата, но актът не е сверяван с официален регистър.",
    },
    {
        "id": "naredba-3-2000-soz",
        "title": "Наредба № 3 от 16.10.2000 г. за условията и реда за проучване, проектиране, утвърждаване и експлоатация на санитарно-охранителните зони около водоизточниците и съоръженията за питейно-битово водоснабдяване и около водоизточниците на минерални води, използвани за лечебни, профилактични, питейни и хигиенни нужди",
        "short_title": "Наредба № 3/2000 — санитарно-охранителни зони",
        "type": "наредба",
        "number": "3",
        "year": 2000,
        "domains": ["sanitary_protection", "drinking_water", "water_sources", "groundwater"],
        "priority": "P0",
        "folder": "10_piteyna_voda_i_soz",
        "filename": "naredba-3-2000-sanitarno-ohranitelni-zoni.md",
        "source_institution": "министър на околната среда и водите, министър на здравеопазването и министър на регионалното развитие и благоустройството",
        "expect": "санитарно-охранителните зони",
        "text_form": "promulgation_only",
        "has_annexes": True,
        "source_name": "N3_SOZ.pdf",
        "notes": "Източникът е извлек с означение „Библиотека закони - АПИС“. Заглавието сочи само обнародване в ДВ, бр. 88 от 27.10.2000 г. По-късни изменения на наредбата не са установени от файла и не са добавяни.",
    },
    {
        "id": "naredba-6-2000",
        "title": "Наредба № 6 от 9 ноември 2000 г. за емисионни норми за допустимото съдържание на вредни и опасни вещества в отпадъчните води, зауствани във водни обекти",
        "short_title": "Наредба № 6/2000 — емисионни норми",
        "type": "наредба",
        "number": "6",
        "year": 2000,
        "domains": ["wastewater", "discharge"],
        "priority": "P0",
        "folder": "11_otpadachni_vodi",
        "filename": "naredba-6-2000-emisii-otpadachni-vodi.md",
        "source_institution": "Министерство на околната среда и водите, Министерство на регионалното развитие и благоустройството, Министерство на здравеопазването и Министерство на икономиката",
        "expect": "ЕМИСИОННИ НОРМИ",
        "text_form": "consolidated_in_file",
        "has_annexes": True,
        "source_name": "Наредба_№6_за_емисионни_норми_за_допустимото_съдържание_на_вредни_и_опасни_вещества_в_отпадъчните_води,_зауствани_във_водни_обекти.pdf",
        "notes": "Заглавната бележка във файла сочи обнародване в ДВ, бр. 97 от 2000 г. и изменение в ДВ, бр. 24 от 2004 г. По-късни изменения не са установени от файла.",
    },
    {
        "id": "naredba-7-2000",
        "title": "Наредба № 7 от 14 ноември 2000 г. за условията и реда за заустване на производствени отпадъчни води в канализационните системи на населените места",
        "short_title": "Наредба № 7/2000 — заустване в канализация",
        "type": "наредба",
        "number": "7",
        "year": 2000,
        "domains": ["wastewater"],
        "priority": "P0",
        "folder": "11_otpadachni_vodi",
        "filename": "naredba-7-2000-zastavane-v-kanalizatsiya.md",
        "source_institution": "Министерство на околната среда и водите, Министерство на регионалното развитие и благоустройството и Министерство на здравеопазването",
        "expect": "КАНАЛИЗАЦИОННИТЕ СИСТЕМИ НА НАСЕЛЕНИТЕ МЕСТА",
        "text_form": "promulgation_only",
        "has_annexes": True,
        "source_name": "Наредба_№7_за_условията_и_реда_за_заустване_на_производствени_отпадъчни_води_в_канализационните_системи_на_населените_места.pdf",
        "notes": "Заглавната бележка сочи само обнародване в ДВ, бр. 98 от 1 декември 2000 г. По-късни изменения не са установени от файла.",
    },
    {
        "id": "naredba-2-2011-razreshitelni-zaustvane",
        "title": "Наредба № 2 от 8 юни 2011 г. за издаване на разрешителни за заустване на отпадъчни води във водни обекти и определяне на индивидуалните емисионни ограничения на точкови източници на замърсяване",
        "short_title": "Наредба № 2/2011 — разрешителни за заустване",
        "type": "наредба",
        "number": "2",
        "year": 2011,
        "domains": ["discharge", "permits", "wastewater"],
        "priority": "P1",
        "folder": "11_otpadachni_vodi",
        "filename": "naredba-2-2011-razreshitelni-zaustvane.md",
        "source_institution": "Министерство на околната среда и водите",
        "expect": "разрешителни за заустване",
        "text_form": "gazette_publication",
        "has_annexes": True,
        "source_name": "Държавен вестник 2.pdf",
        "notes": "Източникът е публикация в Държавен вестник, бр. 47 от 21.6.2011 г. Във файла няма маркирани последващи изменения. Служебният колонтитул от записа на страницата не е част от акта.",
    },
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
        "source_institution": "Министерство на околната среда и водите, Министерство на регионалното развитие и благоустройството, Министерство на здравеопазването и Министерство на икономиката и енергетиката",
        "expect": "ОПАЗВАНЕ НА ПОДЗЕМНИТЕ ВОДИ",
        "text_form": "promulgation_only",
        "has_annexes": True,
        "source_name": "naredba1-ot-10-10-2007g-prouchvane-polzvane-opzvane-podzemni-vodi.doc",
        "notes": "Заглавната бележка сочи само обнародване в ДВ, бр. 87 от 30 октомври 2007 г. и влизане в сила от 30.10.2007 г. Във файла няма маркирани последващи изменения на акта.",
    },
]


def write_taxonomy() -> None:
    payload = {
        "version": 1,
        "description": "Контролиран речник за ВиК knowledge base. Един документ може да има повече от един domain.",
        "domains": [
            {"id": domain_id, "label_bg": label_bg, "label_en": label_en}
            for domain_id, label_bg, label_en in TAXONOMY
        ],
    }
    (MANIFESTS / "taxonomy.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def write_human_manifest(documents: list[dict]) -> None:
    def table(rows: list[dict]) -> str:
        lines = [
            "| ID | Документ | Област | Приоритет | Версия/ДВ | Статус | Source |",
            "| --- | --- | --- | --- | --- | --- | --- |",
        ]
        for row in rows:
            version = row["last_amendment"] or row["dv_reference"][:80]
            lines.append(
                "| {id} | {title} | {domains} | {priority} | {version} | {status} | {source} |".format(
                    id=row["id"],
                    title=row["short_title"].replace("|", "\\|"),
                    domains=", ".join(row["domains"]),
                    priority=row["priority"],
                    version=version.replace("|", "\\|"),
                    status=f"{row['status']} / {row['status_confidence']}",
                    source=row["source_file"],
                )
            )
        return "\n".join(lines)

    groups = {
        "P0": [row for row in documents if row["priority"] == "P0"],
        "P1": [row for row in documents if row["priority"] == "P1"],
        "P2": [row for row in documents if row["priority"] == "P2"],
    }
    review = [row for row in documents if row["issues"]]
    parts = [
        "# ВиК knowledge manifest",
        "",
        "Статусът на всеки акт е `unknown`: от файловете се вижда какво съдържа конкретният източник, но не е правена проверка спрямо официален регистър дали текстът е последната редакция.",
        "",
        "## Core / P0",
        "",
        table(groups["P0"]),
        "",
        "## Extended / P1",
        "",
        table(groups["P1"]),
        "",
        "## Supporting / P2",
        "",
        table(groups["P2"]),
        "",
        "## Needs review",
        "",
    ]
    if review:
        for row in review:
            parts.append(f"- **{row['id']}** — " + " ".join(row["issues"]))
    else:
        parts.append("Няма документи с автоматично отбелязан проблем.")
    parts.extend(
        [
            "",
            "## Duplicates",
            "",
            "Не са открити два пълни файла с един и същ нормативен акт. Наредба № 4 от 2001 г., Наредба № 4 от 2004 г. и Наредба № 4 от 2005 г. са различни актове. Двата файла „Държавен вестник“ са различни публикации. Приложенията към Наредба № 4/2005 г. са част от същия акт, не отделни дубликати.",
            "",
            "## Missing or incomplete content",
            "",
            "- В корпуса няма нормативен акт за проектиране, изграждане и експлоатация на външни водоснабдителни системи. Папката `knowledge/02_vodosnabdyavane/` е празна нарочно.",
            "- Няма пълни текстове на стандарти БДС, БДС EN или EN.",
            "- Наредба № 4/2005 г.: формулите от Equation Editor и графичните символи в приложенията не са пренесени като текст. Оригиналните `.doc` файлове са в `_source/extracted/`.",
            "- Актове със `text_form: promulgation_only` или `gazette_publication` не трябва да се третират като доказано пълен консолидиран текст.",
            "",
        ]
    )
    (MANIFESTS / "KNOWLEDGE_MANIFEST.md").write_text("\n".join(parts), encoding="utf-8")


def gap_readme() -> None:
    folder = KNOWLEDGE / "02_vodosnabdyavane"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "README.md").write_text(
        "\n".join(
            [
                "# 02 — Водоснабдяване",
                "",
                "В локалния корпус няма нормативен документ, който да урежда проектирането на външни водоснабдителни системи.",
                "",
                "Тази папка е оставена празна, за да се вижда липсата. Не е добавян текст от памет или от външен източник.",
                "",
            ]
        ),
        encoding="utf-8",
    )


def build() -> None:
    MANIFESTS.mkdir(parents=True, exist_ok=True)
    originals = relocate_originals()
    extract_archives()
    write_taxonomy()
    gap_readme()

    original_by_name = {path.name: path for path in originals}
    documents = []
    audit_files = []

    for path in originals:
        audit_files.append(
            {
                "path": str(path.relative_to(ROOT)),
                "sha256": sha256(path),
                "bytes": path.stat().st_size,
                "role": "archive" if path.suffix.lower() == ".rar" else "original",
                "canonical_id": "",
            }
        )

    extracted_files = [path for path in EXTRACTED.rglob("*") if path.is_file() and not path.name.startswith(".")]
    for path in extracted_files:
        audit_files.append(
            {
                "path": str(path.relative_to(ROOT)),
                "sha256": sha256(path),
                "bytes": path.stat().st_size,
                "role": "extracted",
                "canonical_id": "naredba-4-2005-sgradni-vik",
            }
        )

    for record in CATALOG:
        if record.get("bundle") == "ordinance4":
            main = EXTRACTED / "ViK sgradi 17.06.DV.doc"
            annexes = sorted((EXTRACTED / "Приложения към Наредба №4").glob("*.doc"), key=annex_number)
            if not main.exists() or len(annexes) != 12:
                raise SystemExit("Ordinance 4 extraction is incomplete.")
            pieces = []
            warnings = []
            formulas = 0
            tables = 0
            plain_parts = []
            source_articles = 0
            for path in [main, *annexes]:
                source_articles += source_articles_for(path)
                converted = convert_file(path, source_articles_for(path))
                rel = str(path.relative_to(ROOT))
                pieces.append(f"<!-- source-part: {rel} -->\n\n{converted['body']}")
                warnings.extend(converted["warnings"])
                formulas += converted["formulas"]
                tables += converted["tables"]
                plain_parts.append(converted["plain"])
            body = "\n\n".join(pieces)
            plain = "\n".join(plain_parts)
            record["source_file"] = str(main.relative_to(ROOT))
            record["related_source_files"] = [
                "_source/originals/6ef4c283138e140f9958d8db5250e93f.rar",
                "_source/originals/d7911f2fda86c3946344b87f54765247.rar",
                *[str(path.relative_to(ROOT)) for path in annexes],
            ]
        else:
            source = original_by_name[record["source_name"]]
            source_articles = source_articles_for(source)
            converted = convert_file(source, source_articles)
            body = converted["body"]
            plain = converted["plain"]
            warnings = list(converted["warnings"])
            formulas = converted["formulas"]
            tables = converted["tables"]
            record["source_file"] = str(source.relative_to(ROOT))
            record["related_source_files"] = []
            if source.suffix.lower() == ".pdf":
                body, figure_count = attach_pdf_figures(
                    source,
                    body,
                    KNOWLEDGE / record["folder"] / "assets",
                    record["id"],
                )
                if figure_count:
                    warnings.append(
                        f"Графични приложения без текстов слой: {figure_count}. Стойностите не са преписвани."
                    )
        if record["expect"].lower() not in (plain + body).lower() and record["expect"] not in body:
            # PDF case may differ in spacing; compare collapsed.
            collapsed = re.sub(r"\s+", "", (plain + body).lower())
            if re.sub(r"\s+", "", record["expect"].lower()) not in collapsed:
                raise SystemExit(f"Identity check failed for {record['id']}")
        meta = extract_header_meta(plain)
        if record["text_form"] == "promulgation_only" and meta["last_amendment"]:
            warnings.append(
                "Открит е маркер за изменение в заглавната част при документ, описан като първоначална публикация. Провери метаданните."
            )
        kept = article_count(body)
        if source_articles and kept + max(3, int(source_articles * 0.08)) < source_articles:
            warnings.append(
                f"Броят членове в Markdown ({kept}) е по-нисък от източника ({source_articles})."
            )
        record["issues"] = warnings
        record["formula_placeholders"] = formulas
        record["table_count"] = tables
        record["source_article_count"] = source_articles
        record["knowledge_article_count"] = kept
        destination = KNOWLEDGE / record["folder"] / record["filename"]
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(front_matter(record, meta) + body + "\n", encoding="utf-8")
        manifest_row = {
            "id": record["id"],
            "title": record["title"],
            "short_title": record["short_title"],
            "type": record["type"],
            "number": record["number"],
            "year": record["year"],
            "domains": record["domains"],
            "priority": record["priority"],
            "status": "unknown",
            "status_confidence": "document_only",
            "source_file": record["source_file"],
            "related_source_files": record["related_source_files"],
            "knowledge_file": str(destination.relative_to(ROOT)),
            "source_institution": record["source_institution"],
            "dv_reference": meta["dv_reference"],
            "effective_date": meta["effective_date"],
            "last_amendment": meta["last_amendment"],
            "has_annexes": record["has_annexes"],
            "machine_readable": True,
            "text_form": record["text_form"],
            "notes": record["notes"],
            "issues": warnings,
            "formula_placeholders": formulas,
            "table_count": tables,
            "source_article_count": source_articles,
            "knowledge_article_count": kept,
        }
        documents.append(manifest_row)
        for item in audit_files:
            if item["path"] == record["source_file"] or item["path"] in record["related_source_files"]:
                item["canonical_id"] = record["id"]

    for item in audit_files:
        if item["role"] == "archive":
            item["canonical_id"] = item["canonical_id"] or "naredba-4-2005-sgradni-vik"
        if not item["canonical_id"]:
            raise SystemExit(f"Unidentified source file: {item['path']}")

    manifest = {
        "version": 1,
        "generator": "tools/build_knowledge_base.py",
        "status_policy": "status is unknown unless verified outside the file. document_only means the citation was read from the file.",
        "documents": documents,
    }
    (MANIFESTS / "knowledge_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (MANIFESTS / "source_checksums.json").write_text(
        json.dumps({"files": audit_files}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    write_human_manifest(documents)
    problems = quality_check(documents, audit_files)
    summary = {
        "documents": len(documents),
        "problems": problems,
        "article_counts": [
            {
                "id": row["id"],
                "source": row["source_article_count"],
                "knowledge": row["knowledge_article_count"],
                "formulas": row["formula_placeholders"],
                "tables": row["table_count"],
            }
            for row in documents
        ],
    }
    (MANIFESTS / "build_summary.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if problems:
        raise SystemExit(1)


def quality_check(documents: list[dict], audit_files: list[dict]) -> list[str]:
    problems = []
    ids = [row["id"] for row in documents]
    if len(ids) != len(set(ids)):
        problems.append("duplicate ids")
    for row in documents:
        if not row["id"]:
            problems.append("missing id")
        knowledge = ROOT / row["knowledge_file"]
        source = ROOT / row["source_file"]
        if not knowledge.exists() or knowledge.stat().st_size < 500:
            problems.append(f"missing or empty knowledge file {row['knowledge_file']}")
            continue
        if not source.exists():
            problems.append(f"missing source {row['source_file']}")
        text = knowledge.read_text(encoding="utf-8")
        if "\ufffd" in text:
            problems.append(f"replacement characters in {row['id']}")
        letters = re.findall(r"[A-Za-zА-Яа-я]", text)
        cyrillic = re.findall(r"[А-Яа-я]", text)
        if letters and len(cyrillic) / len(letters) < 0.45:
            problems.append(f"low cyrillic ratio in {row['id']}")
        if row["knowledge_article_count"] == 0:
            problems.append(f"no articles in {row['id']}")
    for item in audit_files:
        if not (ROOT / item["path"]).exists():
            problems.append(f"audit path missing {item['path']}")
        if not item["canonical_id"]:
            problems.append(f"unidentified {item['path']}")
    try:
        json.loads((MANIFESTS / "knowledge_manifest.json").read_text(encoding="utf-8"))
        json.loads((MANIFESTS / "taxonomy.json").read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        problems.append(f"invalid json: {exc}")
    return problems


if __name__ == "__main__":
    build()
