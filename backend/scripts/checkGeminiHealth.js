import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from the backend root (one level up from scripts/)
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

console.log(`📝 Loading env from: ${envPath}`);
console.log(`🔑 GEMINI_API_KEY present in process.env: ${!!process.env.GEMINI_API_KEY}`);

// Use dynamic import to ensure dotenv.config has finished BEFORE config.js is loaded
const { default: config } = await import('../src/utils/config.js');

const apiKeys = config.gemini.apiKeys;
console.log(`📦 Config gemini.apiKeys length: ${apiKeys?.length}`);
const primaryModel = config.gemini.model;
const backupModel = config.gemini.modelBackup;

console.log(`\n🔍 Starting Gemini Health Check`);
console.log(`🔑 Found ${apiKeys.length} API Keys`);
console.log(`🎯 Primary Model: ${primaryModel}`);
console.log(`🛡️ Backup Model: ${backupModel}`);
console.log('---------------------------------------------------\n');

async function testKey(key, index) {
    const genAI = new GoogleGenerativeAI(key);
    const results = {};

    // Test Primary
    try {
        const model = genAI.getGenerativeModel({ model: primaryModel });
        const start = Date.now();
        await model.generateContent("Hi");
        results.primary = { status: 'WORKING', time: Date.now() - start };
    } catch (err) {
        results.primary = { status: 'ERROR', error: err.message };
        if (err.message.includes('429') || err.message.includes('quota')) {
            results.primary.status = 'EXHAUSTED';
        }
    }

    // Test Backup
    if (backupModel) {
        try {
            const model = genAI.getGenerativeModel({ model: backupModel });
            const start = Date.now();
            await model.generateContent("Hi");
            results.backup = { status: 'WORKING', time: Date.now() - start };
        } catch (err) {
            results.backup = { status: 'ERROR', error: err.message };
            if (err.message.includes('429') || err.message.includes('quota')) {
                results.backup.status = 'EXHAUSTED';
            }
        }
    }

    return results;
}

async function runCheck() {
    for (let i = 0; i < apiKeys.length; i++) {
        process.stdout.write(`Testing Key #${i + 1}... `);
        const result = await testKey(apiKeys[i], i);
        process.stdout.write(`Done\n`);

        const pStatus = result.primary.status === 'WORKING' ? '✅ WORKING' : (result.primary.status === 'EXHAUSTED' ? '⛔ EXHAUSTED' : '❌ ERROR');
        const bStatus = result.backup ? (result.backup.status === 'WORKING' ? '✅ WORKING' : (result.backup.status === 'EXHAUSTED' ? '⛔ EXHAUSTED' : '❌ ERROR')) : 'N/A';

        console.log(`Key ${i + 1}: ${primaryModel} [${pStatus}] | ${backupModel} [${bStatus}]`);
        if (result.primary.error) console.log(`   └─ Primary Error: ${result.primary.error}`);
        if (result.backup && result.backup.error) console.log(`   └─ Backup Error: ${result.backup.error}`);
        console.log('');
    }
}

runCheck();
