import { testConnection } from '../src/services/geminiService.js';
import config from '../src/utils/config.js';

async function runTest() {
    console.log('--- Gemini Configuration ---');
    console.log('Model:', config.gemini.model);
    console.log('Keys configured:', config.gemini.apiKeys.length);

    console.log('\n--- Testing Connection ---');
    try {
        const result = await testConnection();
        console.log('Result:', JSON.stringify(result, null, 2));

        if (result.success) {
            console.log('\n✅ Gemini connection successful!');
        } else {
            console.log('\n❌ Gemini connection failed:', result.error);
        }
    } catch (err) {
        console.error('\n💥 Unexpected error:', err);
    }
}

runTest();
