import { createDocumentHandler } from '../lib/documentProcessor.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const documentHandler = createDocumentHandler();
      
      // Process the uploaded document
      const result = await documentHandler.processDocument(
        req.body.fileBuffer,
        req.body.targetLanguage,
        req.body.fileName
      );
      
      res.status(200).json({
        success: true,
        downloadUrl: result.downloadUrl,
        fileName: result.fileName
      });
    } catch (error) {
      console.error('Translation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process document',
        details: error.message
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}