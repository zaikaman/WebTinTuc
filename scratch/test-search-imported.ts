import { searchArticles } from '../server/repositories/article.repository';

async function main() {
  const query = "Đường";
  console.log(`Searching repository for: "${query}"`);
  const res = await searchArticles(query);
  if (res) {
    console.log(`Found count: ${res.meta.total}`);
    console.log("Items:");
    res.items.forEach((item: any) => {
      console.log(`- [ID: ${item.id}] Title: "${item.title}"`);
    });
  }
}

main().catch(console.error);
