// Fetches my most recently read books from Goodreads and writes Assets/books.json.
// Run from the repo root: node scripts/fetch-goodreads.js
const fs = require("fs");

// How many books to show on the site — change this number only.
const BOOK_COUNT = 18;

const FEED =
  `https://www.goodreads.com/review/list_rss/98654958?shelf=read&sort=date_read&order=d&per_page=${BOOK_COUNT}`;

function field(block, tag) {
  const m = block.match(
    new RegExp(`<${tag}>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?</${tag}>`, "s")
  );
  return m ? m[1].trim() : "";
}

async function main() {
  const res = await fetch(FEED);
  if (!res.ok) throw new Error(`Goodreads responded ${res.status}`);
  const xml = await res.text();

  const books = xml
    .split("<item>")
    .slice(1)
    .slice(0, BOOK_COUNT)
    .map((b) => ({
      title: field(b, "title"),
      author: field(b, "author_name"),
      image: field(b, "book_large_image_url"),
      url: "https://www.goodreads.com/book/show/" + field(b, "book_id"),
      readAt: field(b, "user_read_at"),
    }));

  if (books.length === 0) {
    throw new Error("No books parsed — the feed layout may have changed");
  }

  fs.writeFileSync("Assets/books.json", JSON.stringify(books, null, 2) + "\n");
  console.log(`Wrote ${books.length} books to Assets/books.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
