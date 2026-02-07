import { generateDailyInsight } from './src/agents/dailyInsightAgent.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
    console.log('Testing daily insight generation...');
    const result = await generateDailyInsight();
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
}

test();
