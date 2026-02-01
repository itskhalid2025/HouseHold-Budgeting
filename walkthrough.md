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
3.  **Upload** a receipt image (e.g., a Walmart receipt with food and non-food items).
4.  **Wait** for the "Analyzing Receipt..." process to complete.
5.  **Verify** that:
    -   The receipt is split into multiple transactions if applicable (e.g., Eggs as Need/Food, Lobster as Want/Dining).
    -   The correct Date and Merchant Name are applied to all entries.
    -   The transactions appear in your Dashboard/Transactions list.

## Database & Logs
-   Check `AiUsageLog` table to see new `IMAGE_ANALYSIS` entries.
-   Check `Transaction` table for the new records (should have `aiCategorized: true`).
