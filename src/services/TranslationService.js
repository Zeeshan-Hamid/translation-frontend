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
    // Parse the markdown text and create properly formatted docx elements
    const children = parseMarkdownToDocxElements(text);

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Normal',
            name: 'Normal',
            run: {
              size: 24, // 12pt font
              font: 'Calibri',
            },
            paragraph: {
              spacing: { 
                after: 240, // 12pt spacing after paragraphs
                line: 276, // 1.15 line spacing
              }
            }
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            run: {
              size: 36, // 18pt font
              bold: true,
              font: 'Calibri',
            },
            paragraph: {
              spacing: { before: 400, after: 240 }
            }
          },
          {
            id: 'Heading2',
            name: 'Heading 2',
            run: {
              size: 32, // 16pt font
              bold: true,
              font: 'Calibri',
            },
            paragraph: {
              spacing: { before: 320, after: 240 }
            }
          },
          {
            id: 'Heading3',
            name: 'Heading 3',
            run: {
              size: 28, // 14pt font
              bold: true,
              font: 'Calibri',
            },
            paragraph: {
              spacing: { before: 280, after: 240 }
            }
          }
        ]
      },
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${fileName}_translated.docx`);
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

// Helper function to parse markdown into DOCX elements
function parseMarkdownToDocxElements(markdownText) {
  const elements = [];
  
  // Split by newlines to process each line
  const lines = markdownText.split('\n');
  let inList = false;
  let listItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines but add spacing paragraph
    if (line === '') {
      if (inList) {
        // End the list
        elements.push(...listItems);
        listItems = [];
        inList = false;
      }
      continue;
    }
    
    // Heading 1: # Heading
    if (line.startsWith('# ')) {
      if (inList) {
        elements.push(...listItems);
        listItems = [];
        inList = false;
      }
      elements.push(new Paragraph({
        text: line.substring(2),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 240 }
      }));
    } 
    // Heading 2: ## Heading
    else if (line.startsWith('## ')) {
      if (inList) {
        elements.push(...listItems);
        listItems = [];
        inList = false;
      }
      elements.push(new Paragraph({
        text: line.substring(3),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 320, after: 240 }
      }));
    } 
    // Heading 3: ### Heading
    else if (line.startsWith('### ')) {
      if (inList) {
        elements.push(...listItems);
        listItems = [];
        inList = false;
      }
      elements.push(new Paragraph({
        text: line.substring(4),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 280, after: 240 }
      }));
    }
    // List item
    else if (line.startsWith('- ') || line.startsWith('* ') || 
             line.match(/^\d+\.\s/)) {
      const listItemText = line.startsWith('- ') || line.startsWith('* ') ? 
                          line.substring(2) : 
                          line.replace(/^\d+\.\s/, '');
      
      inList = true;
      listItems.push(new Paragraph({
        text: listItemText,
        bullet: { level: 0 },
        spacing: { before: 80, after: 80 }
      }));
    }
    // Regular paragraph with formatting
    else {
      if (inList) {
        elements.push(...listItems);
        listItems = [];
        inList = false;
      }
      
      // Process text formatting (bold, italic)
      const textRuns = processTextFormatting(line);
      
      elements.push(new Paragraph({
        children: textRuns,
        spacing: { after: 240 }
      }));
    }
  }
  
  // Add any remaining list items
  if (inList && listItems.length > 0) {
    elements.push(...listItems);
  }
  
  return elements;
}

// Helper to process text formatting like bold and italic
function processTextFormatting(text) {
  const parts = [];
  let currentText = '';
  let inBold = false;
  let inItalic = false;
  
  for (let i = 0; i < text.length; i++) {
    // Bold with ** or __
    if ((text.substring(i, i + 2) === '**' || text.substring(i, i + 2) === '__') && 
        (i === 0 || text[i-1] !== '\\')) {
      if (currentText) {
        parts.push(new TextRun({
          text: currentText,
          bold: inBold,
          italic: inItalic
        }));
        currentText = '';
      }
      inBold = !inBold;
      i++; // Skip the second character
    } 
    // Italic with * or _
    else if ((text[i] === '*' || text[i] === '_') && 
             text[i+1] !== '*' && text[i+1] !== '_' && 
             (i === 0 || text[i-1] !== '\\')) {
      if (currentText) {
        parts.push(new TextRun({
          text: currentText,
          bold: inBold,
          italic: inItalic
        }));
        currentText = '';
      }
      inItalic = !inItalic;
    } 
    else {
      currentText += text[i];
    }
  }
  
  // Add any remaining text
  if (currentText) {
    parts.push(new TextRun({
      text: currentText,
      bold: inBold,
      italic: inItalic
    }));
  }
  
  return parts.length > 0 ? parts : [new TextRun(text)];
}

export default TranslationService;