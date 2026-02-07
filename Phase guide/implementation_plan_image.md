# Implementation Plan - Image Analysis UI Enhancements

## Goal Description
Enhance the user interface for the Image Analysis feature on both Desktop and Mobile platforms. 
1.  **Desktop**: Add a drag-and-drop zone for receipt uploads on the Dashboard, positioned to the left of the "Smart Voice" button.
2.  **Mobile**: Update the Smart Entry menu (+) to show 3 clear options (Image, Voice, Text). The Image option should default to Camera but allow Gallery selection.
3.  **Backend**: Increase file size limit to 25MB and support various image formats (JPG, PNG, HEIC, PDF).

## User Review Required
> [!IMPORTANT]
> **File Types**: PDF processing requires ensuring Gemini can handle PDF inputs via the current `inlineData` method or if we need to parse it first. Gemini 1.5 Flash supports PDF via the API, but `inlineData` with `application/pdf` usually works. I will enable it but if Gemini rejects it, we might need a PDF-to-Image converter library (like `pdf-poppler`) which is complex for this environment.
> **Assumption**: I will assume direct PDF upload to Gemini works (it is supported in the API).

## Proposed Changes

### Backend
#### [MODIFY] [smartRoutes.js](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/routes/smartRoutes.js)
-   Update `multer` configuration:
    -   Increase `limits.fileSize` to 25MB.
    -   Change `upload.single('image')` to **`upload.array('images', 10)`** (Limit 10 files).

#### [MODIFY] [smartController.js](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/controllers/smartController.js)
-   Update `analyzeImage` to handle `req.files` (array) instead of `req.file`.
-   Map all files to Gemini `inlineData` parts.
-   Gemini can handle multiple images in one prompt context, allowing it to correlate data (e.g., if a bill spans 2 pages).

#### [MODIFY] [categorizationAgent.js](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/backend/src/agents/categorizationAgent.js)
-   Update `categorizeEntry` to accept an array of media items.
-   Construct `parts` payload with multiple `inlineData` objects.

### Frontend
#### [MODIFY] [DashboardDesktop.jsx](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/pages/desktop/DashboardDesktop.jsx)
-   Update dropzone to accept multiple files logic.
-   Call API with all selected files.

#### [MODIFY] [GlobalSmartEntry.jsx](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/components/mobile/GlobalSmartEntry.jsx)
-   Add `multiple` attribute to the file input.
-   Update handler to convert `FileList` to array.

#### [MODIFY] [api.js](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/api/api.js)
-   Update `analyzeImage` to iterate over files and append to `FormData` with same key `'images'`.

#### [MODIFY] [DashboardDesktop.css](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/pages/desktop/DashboardDesktop.css)
-   Style the new Drop Zone (dashed border, centering, hover effects).

#### [MODIFY] [GlobalSmartEntry.jsx](file:///c:/Users/KHALID/Downloads/HouseHold%20Budgeting/frontend/src/components/mobile/GlobalSmartEntry.jsx)
-   Ensure the "Camera" button triggers the file input with `accept="image/*,application/pdf"`.
-   The default behavior of `<input type="file" accept="image/*" capture="environment">` is to open the camera on mobile. The user *can* usually opt out to gallery depending on OS.
-   **Refinement**: To explicitly show "Camera" vs "Gallery", we usually need two buttons or trust the OS selector. The user asked for "default open camera but have option for gallery". Providing `capture="environment"` usually forces camera. To allow gallery, we might need a separate button "Upload File" without `capture` attribute, or remove `capture` and let user choose in the OS sheet.
-   **Decision**: I will create two sub-options or a single "Scan/Upload" that opens the OS picker (which has both Camera and Gallery). If I use `capture`, it often *forces* camera.
    -   *User Request*: "default open camera... should have option when camera is open of gallery too".
    -   *Constraint*: Web Apps cannot control the native camera UI to add a "Gallery" button *inside* the camera view.
    -   *Solution*: I will add **two buttons** in the Image mode: "Take Photo" (Camera) and "Upload File" (Gallery/PDF). Or I will remove `capture` which opens the choice sheet (Camera/Files).
    -   *Selected Approach*: "Scan Receipt" -> Opens a sub-menu or just the file picker without `capture` (User chooses Camera or Library). *Correction*: User specifically asked "default open camera". This is hard in PWA. I will use `capture="environment"` for a "Camera" button and a separate "Gallery" button if needed, OR just standard file picker which offers choice.
    -   *Compromise*: I will add a **"Scan"** button (Camera) and an **"Upload"** button (File Picker) in the "Image Mode" view.

## Verification Plan

### Automated Tests
-   None available for UI drag-and-drop.

### Manual Verification
1.  **Desktop**:
    -   Drag a >10MB image onto the new drop zone. Verify it uploads.
    -   Click the drop zone to open file explorer. Select a PDF. Verify upload.
2.  **Mobile**:
    -   Open Smart Entry (+).
    -   Select "Scan Receipt".
    -   Verify two options appear or the default behavior matches expectation.
    -   Test "Take Photo" (should trigger camera).
    -   Test "Upload" (should trigger gallery).
