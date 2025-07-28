const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const PDF_PATH = path.join(__dirname, '../public/Film_and_TV_Entertainment_Career_Guide.pdf');
const OUTPUT_PATH = path.join(__dirname, '../rag_pdf_chunks.json');
const CHUNK_SIZE = 200; // words per chunk

function chunkText(text: string, chunkSize: number) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}

async function main() {
  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const data = await pdfParse(pdfBuffer);
  const allText = data.text.replace(/\n{2,}/g, '\n');
  const chunks = chunkText(allText, CHUNK_SIZE).filter((chunk: string) => chunk.trim().length > 0);

  console.log(`Extracted ${chunks.length} chunks from PDF.`);

  const results = chunks.map((chunk: string) => ({ chunk }));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Saved ${results.length} chunks to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 