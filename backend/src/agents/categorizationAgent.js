import { traceOperation } from '../services/opikService.js';
import { generateJSON } from '../services/geminiService.js';

/**
 * Categorize one or more financial transactions/incomes from text input
 * @param {string} text - The raw text input (can contain multiple entries)
 * @returns {Promise<Object[]>} - Array of structured entries
 */
export async function categorizeEntry(inputPayload) {
    return traceOperation('categorizeEntry', async () => {
        try {
            // Handle both object wrapper and raw string (backward compatibility)
            const rawText = typeof inputPayload === 'string' ? inputPayload : (inputPayload.text || '');
            const audioData = typeof inputPayload === 'object' ? inputPayload.audio : null;
            const imageData = typeof inputPayload === 'object' ? inputPayload.image : null;
            const mimeType = typeof inputPayload === 'object' ? inputPayload.mimeType : null;

            const isAudio = !!audioData;
            const isImage = !!imageData;
            const inputLabel = isAudio ? "Audio Input" : isImage ? "Image Input (Receipt)" : "Text Input";

            // Provide current date context for relative date parsing
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 1-12
            const currentDay = now.getDate();

            console.log('📅 Date Context:', { currentDate, currentYear, currentMonth, currentDay });

            const systemInstruction = `
                You are a financial categorization expert for a household budgeting app.
                
                **IMPORTANT CONTEXT**:
                - Today's Date: ${currentDate}
                - Current Year: ${currentYear}
                - Current Month: ${currentMonth}
                - Current Day: ${currentDay}
                - Users may speak in ANY language (English, Hindi, Hinglish, Spanish, etc.).
                - You must TRANSLATE and INTERPRET the meaning to extract financial details.
                
                **Input Text**: "${!isAudio && !isImage ? rawText : '(Media File provided)'}"

                **Image Analysis Rules (CRITICAL for Images)**:
                 - If an image is provided, treat it as a RECEIPT, INVOICE, or BILL.
                 - **Merchant & Date**: Extract the Merchant Name and Date (use 'today' if missing).
                 - **Itemization (CRITICAL)**: If the receipt lists multiple items, **DO NOT** just output the total. You must **SPLIT** the receipt into individual line items IF they belong to different categories or types (Need vs Want).
                   - **Example**: A Walmart receipt has Eggs (Need/Food), Water (Need/Food), and a Lobster (Want/Dining).
                   - **Action**: Create 3 separate entries.
                   - **Shared Data**: All 3 entries share the same Date and Merchant (Description).
                 - **Tax/Tip**: If splitting, distribute tax/tip proportionally or add it to the largest item.
                 - **Blurry Images**: If individual items are unreadable, fall back to the **Total Amount** as a single entry.


                **Date Parsing Rules** (CRITICAL):
                - "yesterday" → ${new Date(now - 86400000).toISOString().split('T')[0]}
                - "today" or no date mentioned → ${currentDate}
                - "15 jan" or "jan 15" → ${currentYear}-01-15 (use current year)
                - "18" (just a day number) → ${currentYear}-${String(currentMonth).padStart(2, '0')}-18 (use current month/year)
                - "last week" → approximately 7 days ago
                - Always output dates in ISO format: YYYY-MM-DD

                **Classification Rules**:
                1. **Intent**: Determine if each entry is INCOME, EXPENSE (Need/Want), or SAVINGS.
                   - INCOME: Salary, wages, freelance, bonus, gifts received, got money.
                   - EXPENSE: Spending money on goods/services.
                   - SAVINGS: Putting money aside, investing, emergency fund.

                2. **Categories**: Map to the following hierarchy:
                   
                   **IF INCOME**:
                   - Primary (Salaries, Wages, Pension)
                   - Variable (Freelance, Bonuses, Commissions)
                   - Passive (Rental, Dividends)

                   **IF EXPENSE (NEED - Essential)**:
                   - Housing (Mortgage, Rent, Repairs)
                   - Utilities (Electric, Water, Internet, Phone)
                   - Food (Groceries, Milk, Eggs, Supplies)
                   - Transportation (Fuel, Transit, Car Payment)
                   - Healthcare (Insurance, Meds)
                   - Childcare (Tuition, Supplies)
                   - Debt (Loans, Credit Card Payments)
                   - Household Services (Maid, Cook, Driver)

                   **IF EXPENSE (WANT - Discretionary)**:
                   - Dining & Entertainment (Restaurants, Movies, Hobbies)
                   - Shopping (Clothing, Gadgets)
                   - Travel (Vacations, Trips)
                   - Gifts (Donations, Presents)
                   - Health (Gym, Barber, Salon, Wellness)

                   **IF SAVINGS**:
                   - Category: "Emergency Fund", "Sinking Funds", "Debt Payoff", "Long-Term"
                   - **SUBCATEGORY (CRITICAL)**: You MUST extract the specific name of the goal if mentioned.
                     - Input: "saved for house" -> Subcategory: "House"
                     - Input: "put money in car fund" -> Subcategory: "Car"
                     - Input: "saving for holiday" -> Subcategory: "Holiday"
                     - Input: "invested in stocks" -> Subcategory: "Stocks"

                3. **Multiple Entries**:
                   - If the user provides multiple items (separated by "then", "and", commas, or new lines), extract EACH as a separate entry.
                   - Example: "20 for milk yesterday then 50 for eggs on 15 jan" = 2 entries

                **Output JSON Schema** (Return an ARRAY):
                {
                    "entries": [
                        {
                            "intent": "INCOME" | "EXPENSE" | "SAVINGS",
                            "type": "NEED" | "WANT" | "SAVINGS" | "INCOME",
                            "amount": number,
                            "currency": "USD",
                            "description": string,
                            "category": string,
                            "subcategory": string | null,
                            "date": "YYYY-MM-DD",
                            "confidence": number (0-1)
                        }
                    ]
                }

                **Examples**:
                Input: "20 for milk yesterday then 50 spent on egg on 15 jan"
                Output: { "entries": [
                    { "intent": "EXPENSE", "type": "NEED", "amount": 20, "description": "Milk", "category": "Food", "subcategory": "Groceries", "date": "${new Date(now - 86400000).toISOString().split('T')[0]}", "confidence": 0.95 },
                    { "intent": "EXPENSE", "type": "NEED", "amount": 50, "description": "Eggs", "category": "Food", "subcategory": "Groceries", "date": "${currentYear}-01-15", "confidence": 0.95 }
                ]}

                Input: "12 for barber on 18"
                Output: { "entries": [
                    { "intent": "EXPENSE", "type": "WANT", "amount": 12, "description": "Barber", "category": "Health", "subcategory": "Barber", "date": "${currentYear}-${String(currentMonth).padStart(2, '0')}-18", "confidence": 0.9 }
                ]}

                Input: "80 spent on lavish lobster"
                Output: { "entries": [
                    { "intent": "EXPENSE", "type": "WANT", "amount": 80, "description": "Lavish lobster", "category": "Dining & Entertainment", "subcategory": "Restaurants", "date": "${currentDate}", "confidence": 0.85 }
                ]}
            `;

            let parts = [{ text: systemInstruction }];

            if (isAudio || isImage) {
                parts.push({
                    inlineData: {
                        mimeType: mimeType || (isAudio ? 'audio/webm' : 'image/jpeg'),
                        data: isAudio ? audioData : imageData
                    }
                });
                parts.push({ text: isAudio ? "\n\nAnalyze the audio above and extract the transactions." : "\n\nAnalyze the image above (Receipt/Bill) and extract the transactions/items as per the Itemization Rules." });
            }

            console.log('🤖 [AI Request] Type:', isAudio ? 'Audio (Multimodal)' : isImage ? 'Image (Vision)' : 'Text Only');

            const data = await generateJSON(parts, null, { maxTokens: 4096 });
            console.log('🤖 AI Categorization Result:', JSON.stringify(data, null, 2));

            // Ensure we always return the entries array
            const entries = data.entries || [data];
            console.log(`✅ Parsed ${entries.length} entry/entries from AI response`);
            return { entries, raw: data };

        } catch (error) {
            console.error('Categorization error:', error);
            throw error;
        }
    }, { input: inputPayload });
}
