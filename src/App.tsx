/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import SearchPage from './components/SearchPage';
import ResultsPage from './components/ResultsPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'search' | 'results'>('search');
  const [results, setResults] = useState<any[]>([]);

  const handleGenerateComplete = (newResults: any[]) => {
    setResults(newResults);
    setCurrentPage('results');
  };

  const handleReturn = () => {
    setCurrentPage('search');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-sm text-gray-800">
      <header className="bg-blue-900 text-white font-bold text-center py-2 text-lg uppercase">
        {currentPage === 'search' ? 'EXSTREAM DOCUMENT REGENERATING' : 'EXSTREAM DOCUMENT REGENERATING RESULTS'}
      </header>
      
      <main className="max-w-7xl mx-auto p-4">
        {currentPage === 'search' ? (
          <SearchPage onGenerateComplete={handleGenerateComplete} />
        ) : (
          <ResultsPage results={results} onReturn={handleReturn} />
        )}
      </main>
    </div>
  );
}
