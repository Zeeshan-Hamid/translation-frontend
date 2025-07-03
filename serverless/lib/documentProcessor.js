import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { chunkDocument, fixCapitalization } from '../../src/utils/documentUtils';

// OpenRouter API integration for translation
const translateWithOpenRouter = async (text, targetLanguage) => {
  // This would be your actual OpenRouter API integration
  // For demo purposes, we'll return the text with a prefix
  return `[Translated to ${targetLanguage}] ${text}`;
};

export const createDocumentHandler = () => {
  return {
    async processDocument(fileBuffer, targetLanguage, fileName) {
      try {
        // Extract text from the Word document
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        const text = result.value;
        
        // Chunk the document for processing
        const chunks = chunkDocument(text);
        
        // Process each chunk
        const translatedChunks = await Promise.all(
          chunks.map(chunk => translateWithOpenRouter(chunk, targetLanguage))
        );
        
        // Join the translated chunks
        const translatedText = translatedChunks.join('\n\n');
        
        // Fix capitalization issues
        const correctedText = fixCapitalization(translatedText);
        
        // Create a new document
        const doc = new Document({
          sections: [{
            properties: {},
            children: correctedText.split('\n\n').map(paragraph => 
              new Paragraph({
                children: [new TextRun(paragraph)]
              })
            )
          }]
        });
        
        // Generate document buffer
        const buffer = await Packer.toBuffer(doc);
        
        // In a real application, you would upload this buffer to storage
        // and return a download URL
        
        return {
          success: true,
          fileName: `${fileName}_translated.docx`,
          downloadUrl: 'https://example.com/download/file.docx', // Mock URL
        };
      } catch (error) {
        console.error('Document processing error:', error);
        throw new Error(`Failed to process document: ${error.message}`);
      }
    }
  };
};