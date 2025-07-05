import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

// This service would integrate with your serverless backend
const TranslationService = {
  // Function to translate the document
  translateDocument: async (file, targetLanguage, fileName, progressCallback) => {
    const formData = new FormData();
    formData.append('file', file);
    // Use the language value as required by backend (no capitalization)
    formData.append('language', targetLanguage);

    try {
      // For demo purposes, we can simulate progress
      progressCallback(30);

      const response = await axios.post(
        'https://759e-2a01-4f9-2a-d83-00-2.ngrok-free.app/translate',
        formData,
        {
          // Do NOT set Content-Type manually!
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Update progress from 30% to 90% during upload
            progressCallback(30 + (percentCompleted * 60) / 100);
          },
        }
      );
      
      // Finalizing progress
      progressCallback(100);

      // Return the entire response object since it contains the base64 content
      return response.data;
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
  
  downloadAsDocx: async (apiResponse, fileName) => {
    try {
      // Extract the base64 content from the API response
      const base64Content = apiResponse.content;
      // Convert base64 to binary (same as your HTML example)
      const byteCharacters = atob(base64Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: apiResponse.content_type });
      // Use the filename from the API if present, otherwise fallback
      const downloadName = apiResponse.filename || `${fileName}_translated.docx`;
      saveAs(blob, downloadName);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw new Error('Failed to download the translated document');
    }
  },
  
  // This function is no longer used for download but kept for its prompts
  getTranslationPrompt: (language, chunk) => {
    const prompts = {
      english: `Here is a passage of a manuscript that we want to translate into contemporary English to make it easily readable for everyone. This is the original English version of one of the passages:\n[DOCUMENT_CHUNK]\nCan you rephrase this text into simpler English at an 8th-grade reading level? Please rewrite it and do not plagiarize. Do not give an answer, only give the translated text. Make sure that the reading experience "flows", for example by not using the same words & sentence structures too often. Only translate, do not mention anything else. Please format the text properly without separating lines between the passages and exactly in the same structure it was so I can easily copy/paste it entirely into the manuscript of the book. You can remove numbers if that makes the reading experience better. You must translate/rewrite everything exactly and not shorten it. Keep the quotes in their formatted way if applicable.`,
      
      dutch: `Here is a passage of a manuscript that we want to translate into simple Dutch to make it easily readable for everyone. This is the original text:\n[DOCUMENT_CHUNK]\nCan you translate this text into simple Dutch at an 8th-grade reading level (8e klas niveau)? Please translate it accurately and do not plagiarize. Do not give an answer, only give the translated text in Dutch.`,
      
      spanish: `Here is a passage of a manuscript that we want to translate into simple Spanish to make it easily readable for everyone. This is the original text:\n[DOCUMENT_CHUNK]\nCan you translate this text into simple Spanish at an 8th-grade reading level (nivel de 8o grado)? Please translate it accurately and do not plagiarize. Do not give an answer, only give the translated text in Spanish.`,
      
      german: `Here is a passage of a manuscript that we want to translate into simple German to make it easily readable for everyone. This is the original text:\n[DOCUMENT_CHUNK]\nCan you translate this text into simple German at an 8th-grade reading level (8. Klasse Niveau)? Please translate it accurately and do not plagiarize. Do not give an answer, only give the translated text in German.`
    };
    
    return prompts[language].replace('[DOCUMENT_CHUNK]', chunk);
  },
};

export default TranslationService;