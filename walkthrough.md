# Image Analysis Feature Verification

## Changes Implemented
1.  **Backend**:
    -   Added `/api/smart/analyze-image` endpoint.
    -   Updated `smartController.js` to handle image uploads and split receipts into itemized transactions (Need vs Want).
    -   Updated `categorizationAgent.js` to use Gemini Vision for image analysis.
    -   Configured 5-key rotation for Gemini API.
2.  **Frontend**:
    -   Updated `api.js` with `analyzeImage` function.
    -   Updated `GlobalSmartEntry.jsx` to include a "Scan Receipt" option (Camera/Upload).

## How to Test
1.  **Navigate** to the **Smart Entry** menu (usually the floating "+" button on mobile or dashboard).
2.  **Select** the new "**Scan Receipt**" option.
3.  **Upload** 1 or more receipt images/PDFs (Max 25MB total).
    -   **Mobile**: Tap "Scan" to take a photo, or "Upload" to select multiple files from Gallery/Storage.
    -   **Desktop**: Drag & Drop multiple files onto the "Drop Receipts / PDF" zone on the Dashboard.
4.  **Wait** for the analysis to complete.
5.  **Verify** that:
    -   Multiple receipts are processed correctly.
    -   A single multi-page PDF is analyzed as one document (or multiple receipts if distinct).
    -   Transactions are created and itemized properly.

## Database & Logs
-   Check `AiUsageLog` table to see new `IMAGE_ANALYSIS` entries.
-   Check `Transaction` table for the new records (should have `aiCategorized: true`).
