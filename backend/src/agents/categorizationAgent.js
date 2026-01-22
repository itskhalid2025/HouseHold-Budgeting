import { traceOperation } from '../services/opikService.js';
import { generateJSON } from '../services/geminiService.js';

/**
 * Categorize a financial transaction or income from text input
 * @param {string} text - The raw text input (e.g., "Spent 50 on food", "Got 2000 salary")
 * @returns {Promise<Object>} - Structured data { intent, amount, description, category, subcategory, confidence }
 */
export async function categorizeEntry(text) {
    return traceOperation('categorizeEntry', async () => {
        try {
            const prompt = `
                You are a financial categorization expert for a household budgeting app.
                Analyze the following input text and extract the structured data.

                **Input Text**: "${text}"

                **Classification Rules**:
                1. **Intent**: Determine if this is an INCOME, EXPENSE (Need/Want), or SAVINGS contribution.
                   - INCOME: Salary, wages, freelance, bonus, gifts received.
                   - EXPENSE: Spending money on goods/services.
                   - SAVINGS: Putting money aside, investing, emergency fund.

                2. **Categories**: Map to the following hierarchy based on the intent:
                   
                   **IF INCOME**:
                   - Primary (Salaries, Wages, Pension)
                   - Variable (Freelance, Bonuses, Commissions)
                   - Passive (Rental, Dividends)

                   **IF EXPENSE (NEED - Essential)**:
                   - Housing (Mortgage, Rent, Repairs)
                   - Utilities (Electric, Water, Internet, Phone)
                   - Food (Groceries, Supplies)
                   - Transportation (Fuel, Transit, Car Payment)
                   - Healthcare (Insurance, Meds)
                   - Childcare (Tuition, Supplies)
                   - Debt (Loans, Credit Card Payments)

                   **IF EXPENSE (WANT - Discretionary)**:
                   - Dining & Entertainment (Restaurants, Movies, Hobbies)
                   - Shopping (Clothing, Gadgets)
                   - Travel (Vacations, Trips)
                   - Gifts (Donations, Presents)

                   **IF SAVINGS**:
                   - Emergency Fund
                   - Long-Term (Investments, Education)
                   - Sinking Funds (Car, Holiday, Planned Repairs)

                3. **Extraction**:
                   - Amount: Extract numeric value.
                   - Description: Short summary of what it is.
                   - Date: If mentioned (e.g., "yesterday", "on Friday"), specifically extract it in ISO YYYY-MM-DD format. If not mentioned, return null (backend will default to today).

                **Output JSON Schema Reference**:
                {
                    "intent": "INCOME" | "EXPENSE" | "SAVINGS",
                    "type": "NEED" | "WANT" | "SAVINGS" | "INCOME",
                    "amount": number,
                    "currency": "USD",
                    "description": string,
                    "category": string,
                    "subcategory": string | null,
                    "date": string | null,
                    "confidence": number
                }
            `;

            const data = await generateJSON(prompt);
            console.log('🤖 AI Categorization:', data);

            return data;

        } catch (error) {
            console.error('Categorization error:', error);
            throw error;
        }
    }, { input: text });
}
