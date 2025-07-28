import fs from 'fs';
import path from 'path';

const RAG_PATH = path.join(process.cwd(), 'rag_pdf_chunks.json');

// Load chunks once
let ragData: { chunk: string }[] | null = null;
function loadRagData() {
  if (!ragData) {
    ragData = JSON.parse(fs.readFileSync(RAG_PATH, 'utf-8'));
  }
  return ragData;
}

export async function getRelevantChunks(query: string, topN: number): Promise<string[]> {
  const data = loadRagData();
  const queryWords = query.toLowerCase().split(/\s+/);
  const scored = data.map(({ chunk }) => {
    const chunkText = chunk.toLowerCase();
    const score = queryWords.reduce((acc, word) => acc + (chunkText.includes(word) ? 1 : 0), 0);
    return { chunk, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map(s => s.chunk);
} 