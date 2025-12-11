import * as XLSX from "xlsx";
import { isValidHex } from "@/utils/colors/colorValidator";

// Parse CSV text and extract colors
function parseCSV(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line);

  if (lines.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headerLine = lines[0];
  const headers = headerLine
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));

  const nameIndex = headers.findIndex((h) => h.toLowerCase() === "color name");
  const hexIndex = headers.findIndex((h) => h.toLowerCase() === "hex code");

  if (nameIndex === -1 || hexIndex === -1) {
    throw new Error('CSV must contain "Color Name" and "Hex Code" columns');
  }

  const colors = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = [];
    let current = "";
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());

    const name = values[nameIndex]?.replace(/^"|"$/g, "").trim();
    const hex = values[hexIndex]?.replace(/^"|"$/g, "").trim();

    if (name && hex) {
      colors.push({ name, hex });
    }
  }

  return colors;
}

// Parse Excel file and extract colors
function parseExcel(fileData) {
  const workbook = XLSX.read(fileData, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("Excel file has no sheets");
  }

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (jsonData.length === 0) {
    throw new Error("Excel file is empty");
  }

  const headers = jsonData[0].map((h) =>
    String(h || "").trim().toLowerCase()
  );

  const nameIndex = headers.findIndex((h) => h === "color name");
  const hexIndex = headers.findIndex((h) => h === "hex code");

  if (nameIndex === -1 || hexIndex === -1) {
    throw new Error('Excel must contain "Color Name" and "Hex Code" columns');
  }

  const colors = [];

  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    const name = String(row[nameIndex] || "").trim();
    const hex = String(row[hexIndex] || "").trim();

    if (name && hex) {
      colors.push({ name, hex });
    }
  }

  return colors;
}

// Validate and normalize colors
function validateColors(colors) {
  const validated = [];
  const seenNames = new Set();

  for (const c of colors) {
    const name = (c.name || "").trim();
    let hex = (c.hex || "").trim();

    if (!name || !hex) continue;

    if (!hex.startsWith("#")) {
      hex = "#" + hex;
    }

    if (!isValidHex(hex)) {
      console.warn(`Invalid hex skipped: ${hex}`);
      continue;
    }

    const lowerName = name.toLowerCase();
    if (seenNames.has(lowerName)) {
      console.warn(`Duplicate color skipped: ${name}`);
      continue;
    }

    seenNames.add(lowerName);
    validated.push({ name, hex: hex.toUpperCase() });
  }

  return validated;
}

// Main import function
export function importColorsFromFile(file) {
  return new Promise((resolve, reject) => {
    const name = file.name.toLowerCase();
    const isCSV = name.endsWith(".csv");
    const isExcel =
      name.endsWith(".xlsx") ||
      name.endsWith(".xls") ||
      name.endsWith(".xlsm");

    if (!isCSV && !isExcel) {
      reject(new Error("File must be CSV or Excel (.csv/.xlsx/.xls/.xlsm)"));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        let colors;

        if (isCSV) {
          colors = parseCSV(e.target.result);
        } else {
          colors = parseExcel(e.target.result);
        }

        resolve(validateColors(colors));
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));

    if (isCSV) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

export default importColorsFromFile;
