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
const backupModels = config.gemini.backupModels || [];

console.log(`\n🔍 Starting Gemini Health Check`);
console.log(`🔑 Found ${apiKeys.length} API Keys`);
console.log(`🎯 Primary Model: ${primaryModel}`);
console.log(`🛡️ Backup Models: ${backupModels.length > 0 ? backupModels.join(', ') : 'None'}`);
console.log('---------------------------------------------------\n');

async function testKey(key, index) {
    const genAI = new GoogleGenerativeAI(key);
    const results = { primary: null, backups: [] };

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

    // Test all Backup Models
    for (let i = 0; i < backupModels.length; i++) {
        const backupModel = backupModels[i];
        try {
            const model = genAI.getGenerativeModel({ model: backupModel });
            const start = Date.now();
            await model.generateContent("Hi");
            results.backups.push({
                model: backupModel,
                status: 'WORKING',
                time: Date.now() - start
            });
        } catch (err) {
            const result = {
                model: backupModel,
                status: 'ERROR',
                error: err.message
            };
            if (err.message.includes('429') || err.message.includes('quota')) {
                result.status = 'EXHAUSTED';
            }
            results.backups.push(result);
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

        console.log(`\nKey ${i + 1}:`);
        console.log(`  Primary (${primaryModel}): ${pStatus}`);
        if (result.primary.error) {
            console.log(`    └─ Error: ${result.primary.error}`);
        } else if (result.primary.time) {
            console.log(`    └─ Response time: ${result.primary.time}ms`);
        }

        // Display all backup models
        if (result.backups.length > 0) {
            result.backups.forEach((backup, idx) => {
                const bStatus = backup.status === 'WORKING' ? '✅ WORKING' : (backup.status === 'EXHAUSTED' ? '⛔ EXHAUSTED' : '❌ ERROR');
                console.log(`  Backup ${idx + 1} (${backup.model}): ${bStatus}`);
                if (backup.error) {
                    console.log(`    └─ Error: ${backup.error}`);
                } else if (backup.time) {
                    console.log(`    └─ Response time: ${backup.time}ms`);
                }
            });
        }
        console.log('');
    }
}

runCheck();
