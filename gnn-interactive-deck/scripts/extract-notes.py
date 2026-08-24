import json
import pathlib
import zipfile
import xml.etree.ElementTree as ET

project_root = pathlib.Path(__file__).resolve().parent.parent
deck_path = project_root.parent / "output" / "gnn" / "GNNs_Visual_Lecture_Integrated_v1.pptx"
output_path = project_root / "src" / "slide-notes.json"

namespaces = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}

notes = []
with zipfile.ZipFile(deck_path) as archive:
    for slide_number in range(1, 63):
        xml = archive.read(f"ppt/notesSlides/notesSlide{slide_number}.xml")
        root = ET.fromstring(xml)
        lines = []
        for shape in root.findall(".//p:sp", namespaces):
            body = shape.find(".//p:ph[@type='body']", namespaces)
            if body is None:
                continue
            for paragraph in shape.findall(".//a:p", namespaces):
                text = "".join(node.text or "" for node in paragraph.findall(".//a:t", namespaces)).strip()
                if text:
                    lines.append(text)
        notes.append("\n".join(lines))

output_path.write_text(json.dumps(notes, ensure_ascii=True, indent=2) + "\n", encoding="utf-8")
print(f"Extracted {len(notes)} speaker-note blocks into {output_path}")
