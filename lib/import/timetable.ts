"use client";

export type ImportedUnit = {
  code: string;
  name: string;
  unitType: "technical" | "conceptual" | "practical" | "mathematical" | "online" | "mixed";
  delivery: string;
};

const COURSE_CODE = /\b[A-Z]{2,5}\s?\d{4}\b/g;
const NOISE = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Online|Service|September - December 2026 Timetable|Bsc IT Year 1 Semester 1|Signed)$/i;

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").replace(/\s+([,.:])/g, "$1").trim();
}

function classifyDelivery(segment: string) {
  const lower = segment.toLowerCase();
  const hasOnline = /\bonline\b/.test(lower);
  const hasLab = /\blab\b/.test(lower);
  const hasLecture = /\blec\b|\blecture\b/.test(lower);

  if (hasOnline && (hasLab || hasLecture)) return "Online + in-person";
  if (hasOnline) return "Online";
  if (hasLab && hasLecture) return "Lecture + lab";
  if (hasLab) return "Lab";
  if (hasLecture) return "Lecture";
  return "Not specified";
}

function classifyUnitType(delivery: string) {
  if (delivery === "Online") return "online" as const;
  if (delivery === "Lab") return "practical" as const;
  if (delivery === "Lecture + lab" || delivery === "Online + in-person") return "mixed" as const;
  return "conceptual" as const;
}

function extractCandidateRecords(text: string) {
  const matches = [...text.matchAll(COURSE_CODE)];
  const records: ImportedUnit[] = [];

  for (let index = 0; index < matches.length; index += 1) {
    const code = normalizeText(matches[index][0]).replace(/\s+(?=\d)/, " ");
    const start = matches[index].index ?? 0;
    const end = matches[index + 1]?.index ?? text.length;
    const segment = normalizeText(text.slice(start, end));

    const afterCode = normalizeText(
      segment
        .replace(new RegExp("^" + code.replace(" ", "\\s+") + "\\s*"), "")
        .replace(NOISE, ""),
    );

    const name = normalizeText(
      afterCode.split(/\b(?:Group\s+[AB]|Lab\s+\d+|Lec(?:ture)?|Online|Service|CTC\s+LH\s+\d+|Hall\s+\d+|Room\s+\w+)\b/i)[0],
    );

    if (!name || name.length < 4) continue;

    const delivery = classifyDelivery(segment);
    records.push({ code, name, delivery, unitType: classifyUnitType(delivery) });
  }

  return records;
}

export async function extractTimetableUnits(file: File): Promise<ImportedUnit[]> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;

  let text = "";
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += " " + content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
  }

  const grouped = new Map<string, ImportedUnit>();

  for (const record of extractCandidateRecords(normalizeText(text))) {
    const existing = grouped.get(record.code);

    if (!existing) {
      grouped.set(record.code, record);
      continue;
    }

    const deliveries = new Set(
      [existing.delivery, record.delivery]
        .flatMap((value) => value.split(" + "))
        .filter((value) => value !== "Not specified"),
    );

    const delivery =
      deliveries.size === 0
        ? "Not specified"
        : deliveries.size === 1
          ? [...deliveries][0]
          : [...deliveries].sort().join(" + ");

    grouped.set(record.code, {
      code: record.code,
      name: existing.name.length >= record.name.length ? existing.name : record.name,
      delivery,
      unitType: classifyUnitType(delivery),
    });
  }

  return [...grouped.values()].sort((a, b) => a.code.localeCompare(b.code));
}
