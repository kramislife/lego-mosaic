Lego Mosaic Generator Requirements
- This document outlines the requirements and implementation details for the LEGO Mosaic Generator project.  


=================================== 1. Image Attachment ============================================

✅ Features
- **Image Upload**
  - Allow users to upload one image at a time, then crop/scale it with a **3x3 overlay grid**.
  - Accept common formats: `.jpg`, `.jpeg`, `.png`.
  - Support drag-and-drop or file picker.

- **Image Preview - Cropping & Scaling**
  - Display uploaded image with **3x3 grid overlay** (like Instagram/TikTok crop guides).
  - User can:
    - Zoom in/out
    - Adjust crop area while keeping 3x3 grid visible to determine what part of the image user wants
    - Note: “The 3×3 overlay grid is only for helping users crop/scale the image.”

✅ Validation Rules
  - Crop area should respect the mosaic’s target aspect ratio (based on chosen width/height in studs later).

🛠 Tools & Libraries
- **Frontend**
  - [`react-easy-crop`] → cropping & scaling with overlays.
  - `canvas` (HTML5) → to finalize cropped image output.
- **Backend (optional)**
  - [`sharp`] → resize/crop large images server-side if performance is an issue.

=============================== 2. Resolutions & Grid System ======================================

Supported Base Grid Sizes
- **16 × 16 studs**
- **32 × 32 studs**

- Users must first choose a base grid size before defining final mosaic width/height.  
- Both **square and rectangular mosaics** are supported.  

Fixed Allowed Sizes
- Width and Height can only be chosen from the following fixed values:  
  **16, 32, 48, 64, 80, 96, 112, 128**
- Maximum allowed size is **128 × 128 studs** (hard limit).  

Valid Combinations per Base Grid
- For **16 × 16 Grid**
  - Any width/height that is a multiple of 16 is allowed.
  - Valid sizes: **16, 32, 48, 64, 80, 96, 112, 128**
    - Example:  
      - 48 × 32 → (3 × 2) sections of 16 × 16 → **6 sections total**  
      - 64 × 64 → (4 × 4) sections of 16 × 16 → **16 sections total**

- For **32 × 32 Grid**
  - Any width/height that is a multiple of 32 is allowed.
  - Valid sizes: **32, 64, 96, 128**
    - Example:  
      - 64 × 32 → (2 × 1) sections of 32 × 32 → **2 sections total**  
      - 128 × 96 → (4 × 3) sections of 32 × 32 → **12 sections total**

✅ Validation Rules
- Both **width and height must divide evenly** by the chosen base grid size.  
- **Non-multiples are not allowed** (e.g., 48 width with 32 grid → invalid).  
- Do not allow sizes beyond **128 studs** in either width or height.  
- Only valid draggable/in-progress layouts can be confirmed (partial/incomplete mosaics are not allowed).  


===================== 3. Adjustments (HSV, Brightness, Contrast) ====================================

✅ Features
- **Hue (H)**
  - Shift the overall color hue of the image.
  - Range: 0° – 360°.
  - Useful for recoloring or artistic variations.

- **Saturation (S)**
  - Increase or decrease color intensity.
  - Range: -100% – +100%
  - -100% = grayscale, 0% = original, +100% = boosted colors.

- **Value / Brightness (V)**
  - Adjust overall lightness of the image.
  - Range:-100% – +100%
  - -100% = black, 0% = original, +100% = brighter.

- **Contrast**
  - Adjust difference between light and dark areas.
  - Range:-100% – +100%
  - -100% = completely flat (no contrast), 0% = original contrast, +100% = maximum contrast boost.

- UI Controls
    - Sliders for each adjustment (live preview on mosaic image).
    - Reset button for each slider to restore default values.
    - Display current numeric value beside slider for precision.
    - Default value for all sliders: **100** (original state).

- 🛠 Tools & Libraries
    - **Frontend**
    - [`glfx.js`] or [`fabric.js`] or [`sharp`] → real-time filters in canvas.
    - Or use **CSS Canvas Filters** for fast preview, then apply final calculation via canvas.
    - **Backend (optional)**
    - [`sharp`] → supports brightness, saturation, contrast for server-side processing.


====================================== 4. Pixel Display Mode ======================================

- **Pixel Display Modes**
  - Squares - Square Tile in Lego-Art-Remix
  - Circles - Round Tile in Lego-Art-Remix
  - Squares with concentric circles - Square Plate in Lego-Art-Remix
  - Circles with concentric circles - Round Plate in Lego-Art-Remix


====================================== 5. Color Management ========================================

 ✅ Features
- **LEGO Color Palette (from Bricklink or Database)**
  - Fetch official LEGO colors (stored in your database).
  - Each color entry should include:
    - Name (e.g., "Bright Red")
    - ID (Bricklink ID, LEGO ID if available)
    - Hex value (RGB)

- **Custom Colors (User-added, Local Only)**
  - Users can add new colors that do not exist in the default LEGO palette.
  - Input: color name + hex code.
  - Stored locally in the user’s browser (e.g., localStorage) and not saved to the main database.
  - User-added colors are available for pixel editing just like LEGO colors.
  - Users can export the full color list (default + custom) actually present in the mosaic as a CSV file.

- **Color Editing (per pixel)**
  - Clicking a color in the palette activates it as a "paint tool. Note that the first color display in the color list is the default one"
  - Users can click on individual pixels in the mosaic to recolor them.
  - Support multi-selection (select multiple pixels and apply a color at once).
  - Undo/redo support for pixel edits.

- **Additional Tools**
  - Eyedropper Tool → Click a pixel to pick its color and set it as the active paint color.
  - Eraser Tool → Erase edits on a pixel, restoring it to the original generated color.
  - Bulk Erase/Trash Icon (Clear All Edits) → Remove all user edits at once, returning the mosaic to the auto-generated state.

✅ Validation Rules
- Prevent duplicate color names within the same palette.
- Ensure valid hex codes (`#RRGGBB`).
- When swapping colors, ensure at least 1 pixel of the source color exists.

🛠 Tools & Libraries

- **Frontend**
  - **Native HTML color input** → built-in color picker for custom colors.
  - Pixel editing: [`konva.js`] or [`fabric.js`] → for interactive pixel-level editing.
  - Color distance algorithms:
    - Euclidean distance in RGB
    - Or more accurate: CIEDE2000 (via `color-diff` library).
- **Backend**
  - Only needed to fetch the official LEGO palette.
  - No backend storage needed for user-added colors.

🖥 Implementation Notes
- When generating mosaic:
  - Map image pixels to the nearest LEGO color from the selected palette.
  - Users can paint/edit pixels using either database LEGO colors or their custom local colors.
  - Eyedropper, eraser, and bulk erase must respect edits vs. original mapping.
  - Exported CSV includes all colors displayed in the mosaic, whether default or user-added.
  - User-added colors remain temporary and device-specific, but can be exported/imported via CSV.


## ========================== 6. Pixel Preview & Export ============================================ 

✅ Features  

- **Pixelated Preview**  
  - Display the uploaded and adjusted image in mosaic/pixel form.  
  - Live preview updates instantly when adjustments, palette changes, or edits (paint, eyedropper, eraser) are applied.  
  - Maintain a history stack to allow undo/redo of user actions.  

- **Per-Pixel Editing**  
  - Tools available:  
    - **Paint Tool** → apply selected palette color to pixels.  
    - **Eyedropper Tool** → pick the color from any pixel and set it as the active paint color.  
    - **Eraser Tool** → remove edits on a pixel and restore its original auto-mapped LEGO color.  
    - **Bulk Erase (Clear All Edits)** → restore the entire mosaic to its original generated state.  
  - Support multi-select (drag or shift-click) to recolor or erase multiple pixels at once.  
  - Undo/redo support for all editing actions.  

- **Parts/Color List Export**  
  - Generate a summary of required parts/colors based on the **current state of the mosaic (including edits)**:  
    - Color name  
    - Color ID  
    - Hex value  
    - Quantity (count of pixels of that color)  
  - Export formats:  
    - **CSV** → best for user review and sharing.  
    - **Bricklink XML** → import directly into Bricklink for part ordering.  

- **Image Export**  
  - Export final mosaic as `.png, .jpeg, .jpg`.  
  - Options:  
    - Include or hide grid lines.  
    - Export with or without user edits.  

- **Instruction Export (PDF)**  
  - Generate **LEGO-style building instructions** similar to LEGO Art mosaics.  
  - Divide mosaic into grids of **16×16** or **32×32** (user chooses).  
  - Each page includes:  
    - Pixel grid (with numbers and grid lines).  
    - Pixel color mapping (based on current edited mosaic).  
    - Section number and page number.  
  - Final pages include:  
    - Parts legend (color, ID, quantity).  
    - Assembly overview of the whole mosaic.  

✅ Validation Rules  
- Mosaic must have valid resolution (multiples of base grid).  
- Must not allow export if no image was uploaded.  
- Prevent exporting empty or zero-color mosaics.  
- Exported data (CSV/XML/PDF) must always reflect **the current edited state** (not just the original auto-generated version).  
- For Bricklink XML: validate against schema (all parts must have valid IDs).  

🛠 Tools & Libraries  
- **Frontend**  
  - HTML5 Canvas / WebGL → render pixel preview and edits.  
  - [`konva.js`] or [`fabric.js`] → pixel interaction (paint, eyedropper, eraser, multi-select).  
- **Export**  
  - [`html2canvas`] → PNG export.  
  - [`pdf-lib`] or [`jspdf`] → generate instruction-style PDFs.  
  - Custom CSV/Bricklink XML generators.  

🖥 Implementation Notes  
- Store **two states**:  
  1. Original mosaic (auto-mapped from LEGO palette).  
  2. Current mosaic (with user edits).  
- Exports (CSV, XML, PDF, image) must use the **current mosaic state** unless the user explicitly chooses “Export Original.”  
- Undo/redo stacks should be lightweight (only store pixel deltas, not entire image each time).  
- PDF pagination: 1 section (16×16 or 32×32 grid) = 1 page.  
- Eraser tool resets only edited pixels, not original auto-generated mapping. Bulk erase restores everything.  