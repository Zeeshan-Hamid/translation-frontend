import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX, FiDownload, FiFileText, FiCheck } from 'react-icons/fi';
import ProgressBar from './ProgressBar';
import TranslationService from '../services/TranslationService';

const TranslationForm = ({ onTranslationComplete, translationComplete, translationResult }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [error, setError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState('docx');
  
  const fileInputRef = useRef(null);

  const onDrop = acceptedFiles => {
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile) {
      if (selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile);
        setFileName(selectedFile.name.replace(/\.[^/.]+$/, ''));
        setError('');
      } else {
        setError('Please upload a Word or PDF document (.doc, .docx, or .pdf)');
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf']
    }
  });

  const handleRemoveFile = () => {
    setFile(null);
    setFileName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please upload a Word document');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setProgressStatus('Uploading and parsing files...');

    try {
      // Simulate progress steps
      const updateProgress = (value, status) => {
        setProgress(value);
        setProgressStatus(status);
      };

      setTimeout(() => updateProgress(10, 'Uploading and parsing files...'), 500);
      setTimeout(() => updateProgress(20, 'Analyzing document structure...'), 1500);
      setTimeout(() => updateProgress(30, 'Preparing translation chunks...'), 2500);
      
      // Start translation process
      const result = await TranslationService.translateDocument(
        file, 
        targetLanguage, 
        fileName,
        (progress) => {
          updateProgress(30 + (progress * 70 / 100), 'Translating content...');
        }
      );
      
      updateProgress(100, 'Finalizing...');
      
      // Complete process
      setTimeout(() => {
        setIsLoading(false);
        onTranslationComplete(result);
      }, 500);
      
    } catch (err) {
      setError('Error processing your document. Please try again.');
      setIsLoading(false);
      console.error('Translation error:', err);
    }
  };

  if (translationComplete && translationResult) {
    return (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Translation Complete</h2>
        
        <div className="bg-white rounded-lg shadow-card p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <FiCheck className="text-green-500 text-2xl" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-center mb-2">Your document has been translated!</h3>
          <p className="text-gray-600 text-center mb-8">
            Your document has been successfully translated to {targetLanguage === 'english' ? 'simplified English' : targetLanguage}.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FiFileText className="text-primary mr-2" />
                <span className="font-medium">{fileName}_translated.docx</span>
              </div>
              <span className="text-sm text-gray-500">Ready to download</span>
            </div>
            
            <button 
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
              onClick={() => TranslationService.downloadAsDocx(translationResult, fileName)}
            >
              <FiDownload className="mr-2" />
              Download Translated Document
            </button>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="text-primary hover:text-primary-dark font-medium transition-colors"
              onClick={() => window.location.reload()}
            >
              Translate another document
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-2">Create Translation Task</h2>
      <p className="text-gray-600 text-center mb-8">
        Translate an entire WORD document into any language you want in just one minute.
      </p>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-card p-8">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Book File
          </label>
          <div
            {...getRootProps()}
            className={`drop-zone ${isDragActive ? 'active' : ''} ${file ? 'border-green-300 bg-green-50' : ''}`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            
            {file ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiFileText className="text-gray-500 text-xl mr-3" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="text-gray-500 hover:text-red-500"
                >
                  <FiX className="text-xl" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <FiUploadCloud className="mx-auto text-gray-400 text-5xl mb-3" />
                <p className="text-gray-600 mb-1">Drag and drop your WORD document here</p>
                <p className="text-gray-500 text-sm mb-3">or</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
                >
                  Browse Files
                </button>
                <p className="text-gray-500 text-xs mt-3">Supported formats: .doc, .docx, .pdf</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="targetFileName" className="block text-gray-700 font-medium mb-2">
            Target File Name
          </label>
          <input
            type="text"
            id="targetFileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Please enter the target file name..."
            className="w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div className="mb-8">
          <label htmlFor="targetLanguage" className="block text-gray-700 font-medium mb-2">
            Target Language
          </label>
          <div className="relative">
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="appearance-none w-full px-4 py-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="english">Contemporary English</option>
              <option value="dutch">Dutch</option>
              <option value="spanish">Spanish</option>
              <option value="german">German</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mb-6">
            <ProgressBar progress={progress} status={progressStatus} />
          </div>
        ) : (
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-md transition-colors"
            disabled={!file || isLoading}
          >
            Start Translation
          </button>
        )}
      </form>
    </div>
  );
};

export default TranslationForm;