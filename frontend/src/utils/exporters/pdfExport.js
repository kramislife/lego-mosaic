import jsPDF from "jspdf";
import { PIXEL_MODES } from "@/constant/pixelConfig";

// Generates a PDF instruction guide for the LEGO mosaic.
export const exportMosaicToPDF = ({
  width,
  height,
  sectionSize = 32,
  imagePalette = [],
  customPaletteUsage = [],
  totalPixels = 0,
  pixelGrid = [],
  pixelMode = PIXEL_MODES.SQUARE_TILE,
}) => {
  // Validate data
  if (!width || !height || !pixelGrid.length) {
    throw new Error("Missing required data for PDF export");
  }

  // Calculate sections
  const sectionsWide = Math.ceil(width / sectionSize);
  const sectionsHigh = Math.ceil(height / sectionSize);
  const totalSections = sectionsWide * sectionsHigh;
  const totalPages = totalSections + 2; // +1 for overview page, +1 for instructions/layout page

  // Combine and sort colors by usage (highest to lowest)
  const allColors = [...customPaletteUsage, ...imagePalette]
    .filter((color) => color.count > 0)
    .sort((a, b) => b.count - a.count);

  // Assign color numbers (1 to N)
  const colorNumberMap = new Map();
  const numberToColor = new Map();
  allColors.forEach((color, index) => {
    const number = index + 1;
    colorNumberMap.set(color.id, number);
    numberToColor.set(number, { name: color.name, hex: color.hex });
  });

  // Create PDF
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page 1: Overview
  generateOverviewPage(doc, {
    width,
    height,
    sectionSize,
    sectionsWide,
    sectionsHigh,
    totalSections,
    totalPixels,
    allColors,
    colorNumberMap,
    pixelMode,
  });

  // Page 2: Layout Guide
  generateLayoutGuidePage(doc, {
    sectionsWide,
    sectionsHigh,
    totalSections,
  });

  const pixelMatrix = buildPixelMatrix(pixelGrid, width, height, colorNumberMap);

  generateSectionPages(doc, {
    width,
    height,
    sectionSize,
    sectionsWide,
    sectionsHigh,
    pixelMatrix,
    pixelMode,
    numberToColor,
  });

  // Save PDF
  doc.save(`LEGO-Mosaic-Instructions(${width}x${height}).pdf`);
};

/**
 * Generates the overview page (Page 1)
 */
function generateOverviewPage(doc, params) {
  const {
    width,
    height,
    sectionSize,
    sectionsWide,
    sectionsHigh,
    totalSections,
    totalPixels,
    allColors,
    colorNumberMap,
    pixelMode,
  } = params;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin + 4;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("LEGO Mosaic Studio", margin, yPos);
  yPos += 12;

  // Mosaic Information (3 columns) - Compact layout
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const colWidth = contentWidth / 3;
  const col1X = margin;
  const col2X = margin + colWidth;
  const col3X = margin + colWidth * 2;
  let infoY = yPos + 3;

  // Column 1
  doc.setFont("helvetica", "bold");
  doc.text("Dimensions:", col1X, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(`${width} x ${height}`, col1X + 28, infoY);
  doc.setFont("helvetica", "bold");
  doc.text("Total Studs:", col1X, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(totalPixels.toLocaleString(), col1X + 28, infoY + 7);

  // Column 2
  doc.setFont("helvetica", "bold");
  doc.text("Section Size:", col2X, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(`${sectionSize} x ${sectionSize}`, col2X + 28, infoY);
  doc.setFont("helvetica", "bold");
  doc.text("Total Colors:", col2X, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(allColors.length.toString(), col2X + 28, infoY + 7);

  // Column 3
  doc.setFont("helvetica", "bold");
  doc.text("Pixel Style:", col3X, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(getPixelModeLabel(pixelMode), col3X + 28, infoY);
  doc.setFont("helvetica", "bold");
  doc.text("Total Sections:", col3X, infoY + 7);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${totalSections.toLocaleString()} (${sectionsWide} x ${sectionsHigh})`,
    col3X + 28,
    infoY + 7
  );

  yPos = infoY + 22;

  // Color Legend
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Color Legends", margin, yPos);
  yPos += 12;

  // Calculate columns dynamically - exactly 20 colors per column (except last)
  const maxColorsPerColumn = 20;
  const totalColors = allColors.length;
  const numColumns = Math.ceil(totalColors / maxColorsPerColumn);

  // Calculate column width with tighter spacing
  const columnSpacing = 4;
  const availableWidth = contentWidth - (numColumns - 1) * columnSpacing;
  const columnWidth = availableWidth / numColumns;

  // Calculate box size based on text height for proper alignment
  const countFontHeight = 8.5 * 0.35;
  const nameFontHeight = 7.5 * 0.35;
  const textSpacing = 1;
  const totalTextHeight = countFontHeight + nameFontHeight + textSpacing;
  const boxPadding = 0.5;
  const boxSize = totalTextHeight + boxPadding * 2;
  const rowHeight = Math.max(11, boxSize + 2);
  const textOffsetX = boxSize + 2;

  // Distribute colors across columns - exactly 20 per column (except last)
  let maxRows = 0;
  for (let colIndex = 0; colIndex < numColumns; colIndex++) {
    const columnX = margin + colIndex * (columnWidth + columnSpacing);
    let columnY = yPos;

    // Get colors for this column - first columns get 20, last gets remainder
    const startIndex = colIndex * maxColorsPerColumn;
    const endIndex = Math.min(startIndex + maxColorsPerColumn, totalColors);
    const columnColors = allColors.slice(startIndex, endIndex);
    
    // Track max rows for final yPos calculation
    maxRows = Math.max(maxRows, columnColors.length);

    columnColors.forEach((color) => {
      const colorNumber = colorNumberMap.get(color.id);

      // Draw color box
      doc.setFillColor(color.hex);
      doc.rect(columnX, columnY - boxSize, boxSize, boxSize, "F");

      // Draw border
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.1);
      doc.rect(columnX, columnY - boxSize, boxSize, boxSize, "S");

      // Calculate box center for vertical alignment
      const boxCenterX = columnX + boxSize / 2;
      const boxTop = columnY - boxSize;
      const boxCenterY = boxTop + boxSize / 2;
      
      // Color number inside box - properly centered
      doc.setFontSize(10);
      doc.setFont("helvetica", "semibold");
      // Check if color is dark to use white text, otherwise use black
    const rgb = hexToRgb(color.hex);
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      const textColor = brightness < 128 ? 255 : 0;
      doc.setTextColor(textColor, textColor, textColor);
      // Center text vertically: font height is approximately fontSize * 0.35mm
      const numberFontHeight = 6.5 * 0.35;
      doc.text(
        colorNumber.toString(),
        boxCenterX,
        boxCenterY + numberFontHeight / 2,
        { align: "center" }
      );

      // Count and name to the right - vertically centered relative to box
      const textX = columnX + textOffsetX;
      
      // Calculate text positions to center the entire text block with the box
      // jsPDF text Y position is the baseline (bottom of text)
      // We want the text block centered on boxCenterY
      const textBlockTop = boxCenterY - totalTextHeight / 2;
      
      // Count text baseline: top of block + font height
      const countY = textBlockTop + countFontHeight;
      
      // Name text baseline: count baseline + spacing + name font height
      const nameY = countY + textSpacing + nameFontHeight;
      
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`X ${color.count}`, textX, countY);
      doc.setFontSize(8);
      doc.text(color.name || "Custom", textX, nameY);

      columnY += rowHeight;
    });
  }

  // Calculate the maximum Y position across all columns
  yPos = yPos + maxRows * rowHeight + 6; // Reduced spacing
}

/**
 * Generates the layout guide page (Page 2)
 */
function generateLayoutGuidePage(doc, params) {
  const { sectionsWide, sectionsHigh } = params;

  doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin + 4;

  // Mosaic Instructions (relocated here)
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Mosaic Instructions", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const allInstructions = [
    "• Start by reviewing this layout grid so you know where every section will live.",
    "• Check the color legend on Page 1 to learn which LEGO color matches each number.",
    "• Gather the studs listed for the section you are building so everything is on hand.",
    "• Build each section row by row from left to right, verifying the number on every stud.",
    "• Place finished sections on a flat surface and keep them in numerical order.",
    "• When assembling the final mosaic, align the sections using this layout and press gently.",
    "• If a section looks off, compare it with the layout grid before moving forward.",
  ];
  allInstructions.forEach((note) => {
    doc.text(note, margin, yPos);
    yPos += 5;
  });

  yPos += 4;

  // Calculate available space for section grid (maximize)
  const sectionAvailableHeight = pageHeight - yPos - margin;
  const sectionAvailableWidth = contentWidth;

  // Calculate optimal box size and spacing dynamically
  // Gap adjusts to available space so fewer sections get bigger boxes
  const minBoxSize = 6;
  const maxBoxSize = 30;
  const gap = sectionsWide === 1 && sectionsHigh === 1 ? 0 : Math.max(
    1,
    Math.min(4, Math.min(sectionAvailableWidth, sectionAvailableHeight) * 0.02)
  );

  const horizontalBoxCapacity =
    (sectionAvailableWidth - gap * (sectionsWide - 1)) / sectionsWide;
  const verticalBoxCapacity =
    (sectionAvailableHeight - gap * (sectionsHigh - 1)) / sectionsHigh;

  let sectionBoxSize = Math.min(
    maxBoxSize,
    horizontalBoxCapacity,
    verticalBoxCapacity
  );
  sectionBoxSize = Math.max(minBoxSize, sectionBoxSize);

  // Center the grid both horizontally and vertically
  const totalGridWidth =
    sectionsWide * sectionBoxSize + gap * (sectionsWide - 1);
  const totalGridHeight =
    sectionsHigh * sectionBoxSize + gap * (sectionsHigh - 1);
  const startX = margin + (sectionAvailableWidth - totalGridWidth) / 2;
  const startY = yPos + (sectionAvailableHeight - totalGridHeight) / 2;

  let sectionX = startX;
  let sectionY = startY;
  let sectionNumber = 1; // Section numbers start from 1

  // Adjust font size based on box size
  const fontSize = Math.max(6, Math.min(10, sectionBoxSize * 0.6));

  for (let row = 0; row < sectionsHigh; row++) {
    for (let col = 0; col < sectionsWide; col++) {
      // Draw section box
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(sectionX, sectionY, sectionBoxSize, sectionBoxSize, "S");

      // Section number inside - properly centered
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", "bold");
      const boxCenterX = sectionX + sectionBoxSize / 2;
      const boxCenterY = sectionY + sectionBoxSize / 2;
      const fontHeight = fontSize * 0.35;
      doc.text(
        sectionNumber.toString(),
        boxCenterX,
        boxCenterY + fontHeight / 2,
        { align: "center" }
      );

      sectionNumber++;
      sectionX += sectionBoxSize + gap;
    }
    sectionX = startX;
    sectionY += sectionBoxSize + gap;
  }

  // No page number for instructions/layout page
}

function buildPixelMatrix(pixels, width, height, colorNumberMap) {
  const matrix = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      number: null,
      hex: "#ffffff",
    }))
  );

  pixels.forEach((pixel) => {
    if (
      pixel &&
      Number.isInteger(pixel.x) &&
      Number.isInteger(pixel.y) &&
      pixel.x >= 0 &&
      pixel.x < width &&
      pixel.y >= 0 &&
      pixel.y < height
    ) {
      matrix[pixel.y][pixel.x] = {
        number: colorNumberMap.get(pixel.colorId) || null,
        hex: pixel.hex || "#ffffff",
      };
    }
  });

  return matrix;
}

function generateSectionPages(doc, params) {
  const {
    width,
    height,
    sectionSize,
    sectionsWide,
    sectionsHigh,
    pixelMatrix,
    pixelMode,
    numberToColor,
  } = params;

  const totalSections = sectionsWide * sectionsHigh;

  for (let sectionIndex = 0; sectionIndex < totalSections; sectionIndex += 1) {
    const sectionCol = sectionIndex % sectionsWide;
    const sectionRow = Math.floor(sectionIndex / sectionsWide);
    const startX = sectionCol * sectionSize;
    const startY = sectionRow * sectionSize;
    const endX = Math.min(startX + sectionSize, width);
    const endY = Math.min(startY + sectionSize, height);

    const sectionMatrix = extractSectionMatrix({
      pixelMatrix,
      startX,
      startY,
      endX,
      endY,
    });

    const sectionColors = getSectionColorUsage(sectionMatrix, numberToColor);

    drawSectionPage(doc, {
      sectionIndex,
      sectionMatrix,
      gridCols: endX - startX,
      gridRows: endY - startY,
      pixelMode,
      sectionColors,
    });
  }
}

function extractSectionMatrix({ pixelMatrix, startX, startY, endX, endY }) {
  const rows = [];
  for (let y = startY; y < endY; y += 1) {
    const row = [];
    for (let x = startX; x < endX; x += 1) {
      row.push(pixelMatrix[y]?.[x] || { number: null, hex: "#ffffff" });
    }
    rows.push(row);
  }
  return rows;
}

function getSectionColorUsage(sectionMatrix, numberToColor) {
  const map = new Map();
  sectionMatrix.forEach((row) => {
    row.forEach((cell) => {
      if (!cell?.number) return;
      const number = cell.number;
      const existing = map.get(number);
      if (existing) {
        existing.count += 1;
      } else {
        const colorInfo = numberToColor.get(number) || {};
        map.set(number, {
          number,
          name: colorInfo.name || `Color ${number}`,
          hex: colorInfo.hex || cell.hex || "#ffffff",
          count: 1,
        });
      }
    });
  });
  return Array.from(map.values()).sort((a, b) => a.number - b.number);
}

function drawSectionPage(doc, params) {
  const {
    sectionIndex,
    sectionMatrix,
    gridCols,
    gridRows,
    pixelMode,
    sectionColors,
  } = params;

  doc.addPage();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let yPos = margin + 4;

  // Ensure header text is black and visible
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`Section ${sectionIndex + 1}`, margin, yPos);
  yPos += 12;

  const legendHeight = renderSectionColorLegend(doc, {
    x: margin,
    y: yPos,
    maxWidth: pageWidth - margin * 2,
    colors: sectionColors,
  });

  if (legendHeight > 0) {
    yPos += legendHeight + 6;
  }

  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - yPos - margin - 8;

  const cellSize = Math.max(
    4,
    Math.min(availableWidth / gridCols, availableHeight / gridRows)
  );

  const gridWidth = gridCols * cellSize;
  const gridHeight = gridRows * cellSize;
  const gridX = margin + (availableWidth - gridWidth) / 2;
  const gridY = yPos + (availableHeight - gridHeight) / 2;

  sectionMatrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellX = gridX + colIndex * cellSize;
      const cellY = gridY + rowIndex * cellSize;
      const hex = cell?.hex || "#ffffff";

      drawPixelShape(doc, {
        mode: pixelMode,
        x: cellX,
        y: cellY,
        size: cellSize,
        hex,
      });

      if (cell?.number) {
        const textColor = getContrastingTextColor(hex);
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        const fontSize = Math.max(6, cellSize * 0.45);
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "bold");
        doc.text(
          cell.number.toString(),
          cellX + cellSize / 2,
          cellY + cellSize / 2,
          { align: "center", baseline: "middle" }
        );
      }
    });
  });

}

function renderSectionColorLegend(doc, { x, y, maxWidth, colors }) {
  if (!colors?.length) return 0;

  const displayColors = colors.slice(0, 48);
  const columnCount = Math.min(5, Math.ceil(displayColors.length / 6));
  const columnSpacing = 10;
  const columnWidth =
    columnCount > 0
      ? (maxWidth - columnSpacing * (columnCount - 1)) / columnCount
      : maxWidth;

  const boxSize = 8;
  const rowSpacing = 10;
  let maxHeight = 0;

  for (let col = 0; col < columnCount; col += 1) {
    const perColumn = Math.ceil(displayColors.length / columnCount);
    const columnColors = displayColors.slice(col * perColumn, (col + 1) * perColumn);
    let columnY = y;
    const columnX = x + col * (columnWidth + columnSpacing);

    columnColors.forEach((color) => {
      doc.setFillColor(color.hex);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(columnX, columnY, boxSize, boxSize, "FD");

      const { r, g, b } = getContrastingTextColor(color.hex);
      doc.setTextColor(r, g, b);
      doc.setFontSize(8);
      doc.setFont("helvetica", "semibold");
      doc.text(
        color.number.toString(),
        columnX + boxSize / 2,
        columnY + boxSize / 2,
        { align: "center", baseline: "middle" }
      );

      const textX = columnX + boxSize + 2;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica");
      doc.text(`X ${color.count}`, textX, columnY + 3);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(color.name, textX, columnY + 3 + 4);

      columnY += rowSpacing;
    });

    maxHeight = Math.max(maxHeight, columnY - y);
  }

  return maxHeight + 4;
}

function getContrastingTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
}

function drawPixelShape(doc, { mode, x, y, size, hex }) {
  const normalizedMode = normalisePixelMode(mode);
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const circleRadius = size / 2;
  const innerRadius = size * 0.32;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);

  switch (normalizedMode) {
    case PIXEL_MODES.ROUND_TILE:
      doc.setFillColor(hex);
      doc.circle(centerX, centerY, circleRadius, "FD");
      break;
    case PIXEL_MODES.ROUND_PLATE:
      doc.setFillColor(hex);
      doc.circle(centerX, centerY, circleRadius, "F");
      doc.setLineWidth(0.25);
      doc.circle(centerX, centerY, innerRadius, "S");
      break;
    case PIXEL_MODES.SQUARE_PLATE:
      doc.setFillColor(hex);
      doc.rect(x, y, size, size, "FD");
      doc.setLineWidth(0.25);
      doc.circle(centerX, centerY, innerRadius, "S");
      break;
    case PIXEL_MODES.SQUARE_TILE:
    default:
      doc.setFillColor(hex);
      doc.rect(x, y, size, size, "FD");
      break;
  }
}

function normalisePixelMode(mode) {
  switch (mode) {
    case PIXEL_MODES.CIRCLE:
      return PIXEL_MODES.ROUND_TILE;
    case PIXEL_MODES.SQUARE:
      return PIXEL_MODES.SQUARE_TILE;
    case PIXEL_MODES.CONCENTRIC_CIRCLE:
      return PIXEL_MODES.ROUND_PLATE;
    case PIXEL_MODES.CONCENTRIC_SQUARE:
      return PIXEL_MODES.SQUARE_PLATE;
    default:
      return mode;
  }
}

function getPixelModeLabel(mode) {
  const normalized = normalisePixelMode(mode);
  switch (normalized) {
    case PIXEL_MODES.ROUND_TILE:
      return "Round Tiles";
    case PIXEL_MODES.SQUARE_PLATE:
      return "Square Plates";
    case PIXEL_MODES.ROUND_PLATE:
      return "Round Plates";
    case PIXEL_MODES.SQUARE_TILE:
    default:
      return "Square Tiles";
  }
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}