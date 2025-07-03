/**
 * Utility functions for document processing
 */

// Intelligent document chunking
export const chunkDocument = (text, maxChunkSize = 100000) => {
  // Simple paragraph-based chunking algorithm
  // In a real implementation, this would be more sophisticated
  // to handle tables, images, and other complex document structures
  
  const paragraphs = text.split('\n\n');
  const chunks = [];
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if ((currentChunk.length + paragraph.length) > maxChunkSize) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// Fix capitalization issues (e.g., "HELLO WORLD" -> "Hello World")
export const fixCapitalization = (text) => {
  // Split text by sentence boundaries
  return text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => {
      // Skip if sentence is already properly capitalized or empty
      if (!sentence || sentence.length < 2) return sentence;
      
      // Check if sentence is ALL CAPS
      if (sentence === sentence.toUpperCase()) {
        // Convert to sentence case
        return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
      }
      
      return sentence;
    })
    .join(' ');
};

// Extract text content from Word document
export const extractTextFromWordDocument = async (fileBuffer) => {
  // In a real implementation, this would use mammoth.js to extract text
  // from a Word document while preserving structure information
  
  // For demo purposes, we'll return a placeholder
  return "Document content would be extracted here using mammoth.js";
};

// Reconstruct Word document with translated text
export const reconstructWordDocument = async (originalDocumentBuffer, translatedContent) => {
  // In a real implementation, this would use docx.js to rebuild the document
  // with the translated text, preserving all formatting
  
  // For demo purposes, we'll return a placeholder
  return new Uint8Array([0]); // Dummy buffer
};