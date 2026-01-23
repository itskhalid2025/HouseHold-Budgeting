import { traceOperation } from '../services/opikService.js';
import { generateJSON } from '../services/geminiService.js';

/**
 * Categorize one or more financial transactions/incomes from text input
 * @param {string} text - The raw text input (can contain multiple entries)
 * @returns {Promise<Object[]>} - Array of structured entries
 */
export async function categorizeEntry(text) {
    return traceOperation('categorizeEntry', async () => {
        try {
            // Provide current date context for relative date parsing
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 1-12
            const currentDay = now.getDate();

            console.log('📅 Date Context:', { currentDate, currentYear, currentMonth, currentDay });

            const prompt = `
                You are a financial categorization expert for a household budgeting app.
                
                **IMPORTANT CONTEXT**:
                - Today's Date: ${currentDate}
                - Current Year: ${currentYear}
                - Current Month: ${currentMonth}
                - Current Day: ${currentDay}

                Analyze the following input text and extract ALL financial entries mentioned.
                The user may mention MULTIPLE transactions in one message.

                **Input Text**: "${text}"

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
                   - Emergency Fund
                   - Long-Term (Investments, Education)
                   - Sinking Funds (Car, Holiday, Vacation)

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

            console.log('🤖 [AI Prompt Preview]:', prompt.substring(0, 300) + '...');

            const data = await generateJSON(prompt, null, { maxTokens: 4096 });
            console.log('🤖 AI Categorization Result:', JSON.stringify(data, null, 2));

            // Ensure we always return the entries array
            const entries = data.entries || [data];
            console.log(`✅ Parsed ${entries.length} entry/entries from AI response`);
            return { entries, raw: data };

        } catch (error) {
            console.error('Categorization error:', error);
            throw error;
        }
    }, { input: text });
}
