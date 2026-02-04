import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../utils/config.js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars manually because we might run this as checkGeminiHealth.js script
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Re-read config in case it didn't pick up from the standard import context
// (Though config.js likely handles it, being safe)

const apiKeys = config.gemini.apiKeys;
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
