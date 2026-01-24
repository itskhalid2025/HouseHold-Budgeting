
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { categorizeEntry } from '../src/agents/categorizationAgent.js';
// We would import other agents here too

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runCategorizationEval() {
    console.log('🧪 Starting Categorization Evaluation...');
    const datasetPath = path.join(__dirname, 'datasets', 'categorization.json');
    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

    let passed = 0;
    let total = dataset.length;

    for (const item of dataset) {
        const { input, expected } = item;
        process.stdout.write(`   Testing: "${input}"... `);

        try {
            // Call Agent
            const result = await categorizeEntry(input);
            const entry = result.entries[0]; // Assume single entry for simple tests

            // Simple exact match check (Naive)
            const matchesIntent = entry.intent === expected.intent;
            const matchesAmount = entry.amount === expected.amount;
            // Flexible category check (optional)

            const isSuccess = matchesIntent && matchesAmount;

            if (isSuccess) {
                console.log('✅ PASS');
                passed++;
            } else {
                console.log('❌ FAIL');
                console.log(`      Expected: ${JSON.stringify(expected)}`);
                console.log(`      Actual:   ${JSON.stringify({ intent: entry.intent, amount: entry.amount, category: entry.category })}`);
            }

        } catch (error) {
            console.log('❌ ERROR');
            console.error(error.message);
        }
    }

    console.log(`\n📊 Result: ${passed}/${total} passed (${((passed / total) * 100).toFixed(1)}%)`);
}

async function runAll() {
    await runCategorizationEval();
    // await runAdviceEval();
    // await runReportsEval();
}

runAll().catch(console.error);
