Mosaic Documentation

**Hooks** (`src/hooks/`)

- `useMosaic.js` - Main hook file that combines all mosaic features
- `useMosaicEngine.js` - Handles pixelation and rendering logic
- `mosaic/useImageUpload.js` - Manages image file selection, cropping, and preview
- `mosaic/useGridResolution.js` - Controls grid size (width, height, base grid)
- `mosaic/useAdjustmentFilter.js` - Manages image adjustments (hue, saturation, brightness, contrast)
- `mosaic/usePixelMode.js` - Tracks selected pixel shape mode (square, circle, etc.)
- `mosaic/useColorManagement.js` - Handles color palette (built-in + custom), selection, and export

------------------------------------------------------------------------------------------------

**Utils** (`src/utils/`)

1. image (`utils/image/`)

   - `imageValidator.js` - Validates file types (JPG, PNG)
   - `cropHelper.js` - Computes centered crop regions
   - `imageCropper.js` - Crops image using canvas at high quality

2. grid (`utils/grid/`)

   - `gridCalculator.js` - Calculates allowed sizes and grid dimensions (cols/rows)
   - `gridSizeClamp.js` - Clamps values to valid grid sizes

3. adjustment (`utils/adjustment/`)

   - `adjustmentFilter.js` - Generates CSS filter string from adjustment values

4. colors (`utils/colors/`)

   - `colorValidator.js` - Validates hex codes and color names
   - `colorMatcher.js` - Matches sampled RGB to nearest palette color - **YOU**
   - `paletteMerge.js` - Merges built-in and custom colors, computes counts

5. mosaic (`utils/mosaic/`)

- `pixelateImage.js` - Converts image into 2D mosaic grid with matched colors - **YOU**
- `drawMosaic.js` - Renders mosaic grid to canvas using pixel renderers - **YOU**

6. pixels (`utils/pixels/`) - **YOU**

   - `squarePixel.js` - Draws square shape
   - `circlePixel.js` - Draws circle shape
   - `concentricSquarePixel.js` - Draws concentric square pattern
   - `concentricCirclePixel.js` - Draws concentric circle pattern

7. exporters (`utils/exporters/`)
   - `csvExporter.js` - Generic CSV export utility
   - `pngExporter.js` - PNG export (for future use)
   - `pdfExport.js` - PDF export (for future use)

-----------------------------------------------------------------------------------------------

**Connection Flow**

1. `User uploads image`
   ↓
2. `useImageUpload.js`
   - Validates file (imageValidator.js)
   - Loads image → sets imageSrc
   - User crops → calls cropHelper.js → imageCropper.js
   - Returns: croppedImageUrl
     ↓
3. `useGridResolution.js`
   - User sets width/height
   - gridCalculator.js computes cols/rows
   - gridSizeClamp.js ensures valid sizes
     ↓
4. `useMosaicEngine.js` (arrange pixelation)
   - Receives: croppedImageUrl, cols/rows, palette, adjustments, pixelMode
   - Calls pixelateImage.js:
     - Samples image per cell
     - Gets average RGB per cell
     - Calls colorMatcher.js → matches to nearest palette color
     - Returns: mosaicGrid (2D array)
   - Calls drawMosaic.js:
     - Takes mosaicGrid
     - Uses pixelMode to select renderer (squarePixel.js, circlePixel.js, etc.)
     - Draws to canvas
       ↓
5. `Preview.jsx`
   - displays the rendered canvas

---------------------------------------------------------------------------------------------

**Color Management Flow**

1. `useColorManagement.js`
   - Loads LEGO_COLORS from constant
   - Loads custom colors from localStorage
   - paletteMerge.js → merges into full palette
     ↓
2. `User adds custom color`
   - Inputs name and hex
   - colorValidator.js validates hex and name
   - Saves to localStorage
   - paletteMerge.js updates palette
     ↓
3. `User exports colors`
   - csvExporter.js generates CSV file
   - Downloads to user

-------------------------------------------------------------------------------------------------

**Adjustment Flow**

1. `User adjusts image` (hue, saturation, brightness, contrast)
   ↓
2. `useAdjustmentFilter.js`
   - adjustmentFilter.js generates CSS filter string
   - Applied to image preview (before pixelation)
     ↓
3. `When pixelating, adjustments can be applied to sampled RGB`
   - pixelateImage.js receives adjustment function
   - Applies to each cell's sampled color before matching
