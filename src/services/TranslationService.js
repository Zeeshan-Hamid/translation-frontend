import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver'; // The docx package uses this for downloads

// This service would integrate with your serverless backend
const TranslationService = {
  // Function to translate the document
  translateDocument: async (file, targetLanguage, fileName, progressCallback) => {
    const formData = new FormData();
    formData.append('file', file);
    // Capitalize the first letter for the API
    const language = targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1);
    formData.append('language', language);

    try {
      // For demo purposes, we can simulate progress
      progressCallback(30);

      const response = await axios.post('https://759e-2a01-4f9-2a-d83-00-2.ngrok-free.app/translate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Update progress from 30% to 90% during upload
          progressCallback(30 + (percentCompleted * 60) / 100);
        },
      });
      
      // Finalizing progress
      progressCallback(100);

      // The API returns an object; we only need the translated text.
      return response.data.translated_text;
    } catch (error) {
      console.error('API Translation error:', error);
      throw new Error(error.response?.data?.error || 'Failed to translate document');
    }
  },
  
  downloadAsPdf: (text, fileName) => {
    const doc = new jsPDF({ unit: 'pt' });
    const margin = 40; // in points
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;
    let y = 50; // starting y position, in points

    doc.setFontSize(12);
    const lineHeight = doc.getFontSize() * 1.15; // Set line height for book-like spacing

    const paragraphs = text.split('\n');

    paragraphs.forEach(paragraph => {
      const lines = doc.splitTextToSize(paragraph.trim(), usableWidth);
      
      lines.forEach(line => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = 50; // Reset y for new page
        }
        // Justify text for a book-like appearance
        doc.text(line, margin, y, { align: 'justify' });
        y += lineHeight;
      });

      // Add a smaller space after a paragraph
      if (paragraph.trim() !== '') {
          y += lineHeight / 2;
      }
    });
    
    doc.save(`${fileName}_translated.pdf`);
  },
  
  downloadAsDocx: async (text, fileName) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: text.split('\n\n').map(paragraph => 
          new Paragraph({
            children: [new TextRun(paragraph)],
            spacing: { after: 200 }, // Add space after paragraphs
          })
        ),
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}_translated.docx`);
  },
  

};

export default TranslationService;