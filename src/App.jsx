import { useState } from 'react';
import Header from './components/Header';
import TranslationForm from './components/TranslationForm';
import Footer from './components/Footer';

function App() {
  const [translationComplete, setTranslationComplete] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);

  const handleTranslationComplete = (result) => {
    setTranslationResult(result);
    setTranslationComplete(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <TranslationForm 
          onTranslationComplete={handleTranslationComplete} 
          translationComplete={translationComplete}
          translationResult={translationResult}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App;