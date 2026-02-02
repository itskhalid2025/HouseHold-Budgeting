# Image Analysis & Categorization Feature Guide

This guide outlines the implementation of an AI-powered image analysis feature for the HouseHold Budgeting app. The goal is to allow users to upload images (receipts, bills, invoices) which are then analyzed by Gemini to extract financial details (Amount, Date, Category, Merchant) and automatically categorized/stored without saving the actual image file.

## 1. Architecture Overview

The feature uses a "Process & Discard" approach for images:
1.  **Frontend**: User selects an image or takes a photo.
2.  **API**: Image is sent as `multipart/form-data` to the backend.
3.  **Backend**:
    -   Received via `multer` (in memory).
    -   Converted to Base64.
    -   Sent to **Gemini 2.5 Flash** (which has native vision capabilities).
    -   Gemini extracts data and returns structured JSON.
    -   Backend saves the transaction to the database (Prisma).
    -   Backend discards the image from memory.
4.  **Response**: Frontend receives the created transaction details.

---

## 2. Backend Changes

### A. Update `src/agents/categorizationAgent.js`
We need to update the `categorizeEntry` function to support image inputs alongside text and audio.

**Changes:**
-   Accept `image` (base64) and `mimeType` in the input payload.
-   Update `systemInstruction` to specifically handle visual data (receipts).
-   Add the image part to the Gemini payload.

**Prompt Adjustments:**
Add this to the system instructions:
```javascript
// ... existing instructions
**Image Analysis Rules**:
- If an image is provided, treat it as a RECEIPT, INVOICE, or BILL.
- **Amount**: Look for the "Total", "Grand Total", or the largest numeric value that represents the final payment.
- **Date**: Extract the date printed on the receipt. If missing/unreadable, use "today".
- **Description**: Use the Merchant Name (e.g., "Starbucks", "Walmart") as the description.
- **Items**: If visible, use the list of items to determine the precise Category/Subcategory.
// ...
```

### B. Update `src/controllers/smartController.js`
We can either create a new function `analyzeImage` or update `processSmartEntry` to handle generic "media" (audio/image). Given the similarity, updating `processSmartEntry` or creating a specialized wrapper is best.

**Recommendation**: specific `analyzeImage` function for clarity.

```javascript
export async function analyzeImage(req, res) {
    // 1. Validate req.file exists
    // 2. Convert req.file.buffer to base64
    // 3. Call categorizeEntry({ image: base64, mimeType: ... })
    // 4. Handle response (Create Transaction/Income/Goal)
    // 5. Return success
}
```

### C. Update `src/routes/smartRoutes.js`
Add the new endpoint.

```javascript
// Update upload limit if needed (images can be large, but 10MB is usually fine)
router.post('/analyze-image', authenticate, trackAiUsage('IMAGE_ANALYSIS'), upload.single('image'), analyzeImage);
```

---

## 3. Frontend Changes

### A. UI Update
Add an Image Upload/Camera button to the Smart Entry section.

**Location**: `frontend/src/pages/SmartEntry.jsx` (or equivalent)

**Implementation**:
```jsx
const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    // Optional: append 'text' if user wants to add context like "Split this with Bob"

    try {
        const res = await api.post('/smart/analyze-image', formData);
        // Handle success (show notification, update list)
    } catch (err) {
        // Handle error
    }
};
```

### B. Feedback
-   Show a "Scanning Receipt..." loader state.
-   Display the extracted details for user verification if possible (though the requirement implies auto-categorization).

---

## 4. Prompt Engineering (Detailed)

The prompt in `categorizeAgent.js` needs to be robust for both total extraction and granular itemization.

**Key additions to the prompt:**
> "Analyze the provided image. It is likely a receipt. 
> 1. **Merchant & Date**: Extract the Merchant Name and Date (use 'today' if missing).
> 2. **Itemization (CRITICAL)**: If the receipt lists multiple items, **DO NOT** just output the total. You must **SPLIT** the receipt into individual line items IF they belong to different categories or types (Need vs Want).
>    - **Example**: A Walmart receipt has Eggs (Need/Food), Water (Need/Food), and a Lobster (Want/Dining).
>    - **Action**: Create 3 separate entries.
>    - **Shared Data**: All 3 entries share the same Date and Merchant (Description).
> 3. **Tax/Tip**: If splitting, distribute tax/tip proportionally or add it to the largest item.
> 4. **Blurry Images**: If individual items are unreadable, fall back to the **Total Amount** as a single entry."

---

## 5. Security & Privacy
-   **No Storage**: Ensure `multer` is configured with `storage: multer.memoryStorage()` so files are never written to the disk.
-   **Privacy**: The image is sent to Gemini (Google) for processing. Ensure users are aware of this if necessary (though standard for AI features).
