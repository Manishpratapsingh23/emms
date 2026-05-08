// PDF Knowledge Base Processor
// Reads PDF files from /server/knowledge_base/ directory and extracts text for RAG
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the knowledge_base directory
const KB_DIR = path.join(__dirname, '..', '..', 'knowledge_base');
const CACHE_FILE = path.join(KB_DIR, '.cache.json');

// Ensure knowledge_base directory exists
if (!fs.existsSync(KB_DIR)) {
  fs.mkdirSync(KB_DIR, { recursive: true });
}

/**
 * Extract text from a PDF file using pdf-parse
 */
async function extractTextFromPDF(filePath) {
  try {
    // Dynamic import for pdf-parse
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error parsing PDF ${filePath}:`, error.message);
    return '';
  }
}

/**
 * Split long text into smaller chunks for better RAG retrieval
 */
function chunkText(text, chunkSize = 1500, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length) break;
  }
  return chunks;
}

/**
 * Determine the category of a document based on filename
 */
function categorizeDocument(filename) {
  const lower = filename.toLowerCase();
  if (lower.includes('leave')) return 'Leave Policies';
  if (lower.includes('hr') || lower.includes('human')) return 'HR Rules';
  if (lower.includes('payroll') || lower.includes('salary')) return 'Payroll Rules';
  if (lower.includes('attendance')) return 'Company Policies';
  if (lower.includes('onboarding') || lower.includes('welcome')) return 'Onboarding Docs';
  if (lower.includes('sop') || lower.includes('procedure')) return 'Internal SOPs';
  if (lower.includes('tech') || lower.includes('guide') || lower.includes('manual')) return 'Technical Documentation';
  if (lower.includes('department')) return 'Department Documents';
  if (lower.includes('policy') || lower.includes('policies')) return 'Company Policies';
  return 'Company Policies';
}

/**
 * Determine access level based on filename/content
 */
function determineAccessLevel(filename, content) {
  const lower = filename.toLowerCase();
  const contentLower = content.toLowerCase();
  if (lower.includes('admin') || lower.includes('confidential') || lower.includes('internal-sop')) return 'admin';
  if (contentLower.includes('admin only') || contentLower.includes('confidential')) return 'admin';
  return 'all';
}

/**
 * Process all PDFs in the knowledge_base directory
 * Returns an array of document objects ready for RAG
 */
export async function processAllPDFs() {
  const documents = [];

  if (!fs.existsSync(KB_DIR)) {
    console.log('Knowledge base directory not found. Creating it...');
    fs.mkdirSync(KB_DIR, { recursive: true });
    return documents;
  }

  // Check cache
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } catch (e) {
      cache = {};
    }
  }

  const files = fs.readdirSync(KB_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));

  if (files.length === 0) {
    console.log('No PDF files found in knowledge_base/ directory.');
    return documents;
  }

  console.log(`Found ${files.length} PDF file(s) in knowledge_base/. Processing...`);

  let cacheUpdated = false;

  for (const file of files) {
    const filePath = path.join(KB_DIR, file);
    const stat = fs.statSync(filePath);
    const fileKey = `${file}_${stat.mtimeMs}`;

    // Check if already cached
    if (cache[fileKey]) {
      documents.push(...cache[fileKey]);
      console.log(`  ✓ ${file} (from cache)`);
      continue;
    }

    console.log(`  Processing: ${file}...`);
    const text = await extractTextFromPDF(filePath);

    if (!text || text.trim().length === 0) {
      console.log(`  ✗ ${file} - No text extracted`);
      continue;
    }

    const category = categorizeDocument(file);
    const accessLevel = determineAccessLevel(file, text);
    const chunks = chunkText(text);

    const fileDocs = chunks.map((chunk, index) => ({
      id: `pdf-${file.replace(/\.pdf$/i, '')}-${index}`,
      title: `${file.replace(/\.pdf$/i, '')} (Part ${index + 1})`,
      category: category,
      accessLevel: accessLevel,
      content: chunk,
      source: file
    }));

    documents.push(...fileDocs);
    cache[fileKey] = fileDocs;
    cacheUpdated = true;
    console.log(`  ✓ ${file} - ${chunks.length} chunk(s) created`);
  }

  // Save cache
  if (cacheUpdated) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  }

  return documents;
}

/**
 * Get the path to the knowledge_base directory (for external use)
 */
export function getKnowledgeBasePath() {
  return KB_DIR;
}
