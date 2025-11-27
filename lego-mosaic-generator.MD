Lego Mosaic Generator Requirements

- This document outlines the requirements and implementation details for the LEGO Mosaic Generator project.

=================================== 1. Image Attachment ============================================

✅ Features

- **Image Upload**

  - Allow users to upload one image at a time, then crop/scale it with a **3x3 overlay grid**.
  - Accept common formats: `.jpg`, `.jpeg`, `.png`.

- **Image Preview - Cropping & Scaling**
  - Display uploaded image with **3x3 grid overlay** (like Instagram/TikTok crop guides).
  - Crop area should respect the mosaic’s target aspect ratio (based on chosen width/height).

=============================== 2. Resolutions & Grid System ======================================

Supported Base Grid Sizes

- **16 × 16 studs**
- **32 × 32 studs**

- Both **square and rectangular mosaics** are supported.
- Maximum allowed size is **384 × 384 studs** (hard limit).

Valid Combinations per Base Grid

- For **16 × 16 Grid**

  - Any width/height that is a multiple of 16 is allowed.
  - Valid sizes: **16, 32, 48, 64, 80, 96, 112, 128... 384**
    - Example:
      - 48 × 32 → (3 × 2) sections of 16 × 16 → **6 sections total**
      - 64 × 64 → (4 × 4) sections of 16 × 16 → **16 sections total**

- For **32 × 32 Grid**
  - Any width/height that is a multiple of 32 is allowed.
  - Valid sizes: **32, 64, 96, 128... 384**
    - Example:
      - 64 × 32 → (2 × 1) sections of 32 × 32 → **2 sections total**
      - 128 × 96 → (4 × 3) sections of 32 × 32 → **12 sections total**

✅ Validation Rules

- Both **width and height must divide evenly** by the chosen base grid size.
- **Non-multiples are not allowed** (e.g., 48 width with 32 grid → invalid).
- Do not allow sizes beyond **384 studs** in either width or height.

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
  - **Reset Filter** button to reset all adjustments.

====================================== 4. Pixel Display Mode ======================================

- **Pixel Display Modes**
  - Round Tiles 
  - Squares Tiles
  - Squares Plates
  - Round Plates

================================== 5. Color and Pixel Management ==================================

✅ Features

- **LEGO Color Palette (from Bricklink or Database store name in colorConfig.js)**

  - Each color entry should include:
    - Name (e.g., "Bright Red")
    - Hex value (RGB)

- **Custom Colors (User-added, Local Only)**

  - Users can add new colors that do not exist in the default LEGO palette.
  - Input: color name + hex code.
  - Stored locally in the user’s browser (e.g., localStorage).
  - User-added colors are available for pixel editing just like LEGO colors.
  - Users can export the full color list (default + custom) actually present in the mosaic as a CSV file.

- **Color Editing (per pixel)**

  - Clicking a color in the palette activates it as a "paint tool. Note that the first color display in the color list is the default one"
  - Users can click on individual pixels in the mosaic to recolor them.
  - Support multi-selection (select multiple pixels and apply a color at once).
  - **Reset Canvas** button reset all the changes made in the canvas.

- **Additional Tools**
  - Dropper → Click a pixel to pick its color and set it as the active paint color.
  - Eraser → Erase edits on a pixel, restoring it to the original generated color.
  - Reset Canvas → Remove all user edits at once.

- **Pixel Mode Editing (per pixel)**

  - Display a select button for the pixel mode.
  - Allow editing each pixel with a different pixel mode in a canvas.
  

✅ Validation Rules

- Prevent duplicate color names within the same palette.
- Ensure valid hex codes (`#RRGGBB`).
- When swapping colors, ensure at least 1 pixel of the source color exists.


🖥 Implementation Notes

- When generating mosaic:
  - Map image pixels to the nearest LEGO color from the selected palette.
  - Users can paint/edit pixels using Bricklink colors or their custom local colors.
  - Dropper, eraser, and reset canvas must respect edits vs. original mapping.
  - Exported CSV includes all colors displayed in the mosaic, whether default or user-added.
  - User-added colors remain temporary and device-specific, but can be exported/imported via CSV.

## ========================== 6. Pixel Preview & Export ============================================

✅ Features

- **Pixelated Preview**

  - Display the uploaded and adjusted image in mosaic/pixel form.
  - Live preview updates instantly when adjustments, palette changes, or edits (paint, eyedropper, eraser) are applied.
  - Maintain a history stack to allow undo/redo of user actions.

- **Image Export**

  - Export final mosaic as `.png, .jpeg, .jpg`.

- **Instruction Export (PDF)**
  - Display pixels based on **16×16** or **32×32** (user chooses).
  - Each page includes:
    - Page 1: Mosaic Information (Dimensions, Total Studs, Section Size, Total Colors, Total Sections)
            : Color Legends
    - Page 2: Mosaic Instructions and Section Number Box Image
    - Page 3 and so on: Display each page a section based on the chosen studs of the user. 