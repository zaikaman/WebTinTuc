const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    process.env[key] = val;
  }
});

// Import using require after env vars are populated
const { searchArticles } = require('../server/repositories/article.repository');

async function main() {
  const query = "Đường";
  console.log(`Searching repository for accented: "${query}"`);
  const res = await searchArticles(query);
  if (res) {
    console.log(`Found count: ${res.meta.total}`);
    console.log("Items:");
    res.items.forEach((item) => {
      console.log(`- [ID: ${item.id}] Title: "${item.title}"`);
    });
  }
}

main().catch(console.error);
