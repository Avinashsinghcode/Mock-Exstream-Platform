import fs from 'fs';
import path from 'path';

const NUM_POLICIES = 100; // Each policy will have multiple MODs, so ~300 records total
const OUTPUT_DIR = path.join(process.cwd(), 'database');
const SEED_FILE = path.join(OUTPUT_DIR, 'seed_db.json');

const documentTypes = ['AP', 'NB', 'RN'];
const sources = ['BDQ', 'FFQ', 'BCV', 'BWR'];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

function generateData() {
  const jobs = [];
  let idCounter = 1;

  for (let i = 0; i < NUM_POLICIES; i++) {
    const policyNumber = String(randomInt(1000000, 9999999));
    const mco = String(randomInt(10, 99));
    const symbol = `G${String(randomInt(1, 9)).padStart(2, '0')}`;
    const boundPolicy = `${symbol} ${policyNumber} 00`;
    const quotePolicyBase = `Q${randomInt(10, 99)} ${randomInt(1000000, 9999999)}`;
    const docType = randomElement(documentTypes);
    const source = randomElement(sources);
    
    // Generate 2 to 5 MOD versions for this policy
    const numMods = randomInt(2, 5);
    const correctModIndex = randomInt(0, numMods - 1);
    
    for (let j = 0; j < numMods; j++) {
      const modStr = String(j + 1).padStart(2, '0');
      const isCorrect = j === correctModIndex;
      
      jobs.push({
        id: idCounter++,
        mco,
        symbol,
        policyNumber,
        boundPolicy,
        quotePolicy: `${quotePolicyBase} ${modStr}`,
        mod: modStr,
        documentType: docType,
        dateTime: `03-05-2026 02:${String(randomInt(0, 59)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`,
        source,
        status: 'FAILED',
        resultMessage: '',
        processedTime: '',
        _correctMod: isCorrect // Internal flag to determine correctness during regeneration
      });
    }
  }

  return jobs;
}

function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const data = generateData();
  fs.writeFileSync(SEED_FILE, JSON.stringify(data, null, 2));
  console.log(`Generated ${data.length} records in ${SEED_FILE}`);
}

main();
