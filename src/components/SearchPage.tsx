import { useState, useEffect } from 'react';

interface SearchPageProps {
  onGenerateComplete: (results: any[]) => void;
}

export default function SearchPage({ onGenerateComplete }: SearchPageProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<number>>(new Set());
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  // Form state
  const [policyNumber, setPolicyNumber] = useState('');
  const [symbol, setSymbol] = useState('');
  const [policy, setPolicy] = useState('');
  const [mod, setMod] = useState('');
  const [docType, setDocType] = useState('Select an option');
  const [policyDate, setPolicyDate] = useState('03-05-2026');
  const [isAll, setIsAll] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (isAll) {
        params.append('all', 'true');
      } else {
        if (policyNumber) params.append('policyNumber', policyNumber);
        if (symbol) params.append('symbol', symbol);
        if (policy) params.append('policy', policy);
        if (mod) params.append('mod', mod);
        if (docType !== 'Select an option') params.append('docType', docType);
        if (policyDate) params.append('policyDate', policyDate);
      }

      const res = await fetch(`/api/failed-jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data);
      setCurrentPage(1);
      setSelectedJobIds(new Set());
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedJobIds.size === 0) return;
    
    try {
      const res = await fetch('/api/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobIds: Array.from(selectedJobIds) }),
      });
      const data = await res.json();
      if (data.success) {
        onGenerateComplete(data.results);
      }
    } catch (error) {
      console.error('Generate failed', error);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/reset-database', { method: 'POST' });
      alert('Database reset successfully');
      setJobs([]);
      setSelectedJobIds(new Set());
    } catch (error) {
      console.error('Reset failed', error);
    }
  };

  const handleAck = () => {
    alert('Failed Quote Worksheet(s) Acknowledged');
  };

  const toggleJobSelection = (id: number) => {
    const newSelected = new Set(selectedJobIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedJobIds(newSelected);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    const newSelected = new Set(selectedJobIds);
    currentJobs.forEach(job => newSelected.add(job.id));
    setSelectedJobIds(newSelected);
  };

  const handleUnselectAll = () => {
    const newSelected = new Set(selectedJobIds);
    currentJobs.forEach(job => newSelected.delete(job.id));
    setSelectedJobIds(newSelected);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <button 
          onClick={handleReset}
          data-testid="reset-env-btn"
          className="bg-red-600 text-white px-3 py-1 text-xs rounded hover:bg-red-700"
        >
          Reset Test Environment
        </button>
      </div>

      {/* Acknowledge Section */}
      <section>
        <div className="bg-gray-300 text-center font-bold py-1 mb-2">
          Acknowledge All Failed Quote Worksheets
        </div>
        <div className="text-center">
          <button 
            onClick={handleAck}
            className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-4 py-1 text-sm rounded"
          >
            ACK Failed Quote Worksheet(s)
          </button>
        </div>
      </section>

      {/* Search Section */}
      <section>
        <div className="bg-gray-300 text-center font-bold py-1 mb-2">
          Search for Failed Print Jobs
        </div>
        <div className="text-center mb-4 text-sm">
          Input a specific policy number or check the All box to retrieve the first 1000 failed jobs
        </div>
        
        <div className="flex flex-wrap justify-center items-end gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">Policy Number:</span>
            <div className="flex flex-col">
              <span className="text-blue-700 text-xs font-bold text-center">Symbol</span>
              <input 
                type="text" 
                value={symbol} 
                onChange={e => setSymbol(e.target.value)}
                className="border border-gray-400 w-16 px-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700 text-xs font-bold text-center">Policy</span>
              <input 
                type="text" 
                value={policy} 
                onChange={e => setPolicy(e.target.value)}
                className="border border-gray-400 w-24 px-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-blue-700 text-xs font-bold text-center">Mod</span>
              <input 
                type="text" 
                value={mod} 
                onChange={e => setMod(e.target.value)}
                className="border border-gray-400 w-12 px-1"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-blue-700 text-xs font-bold text-center">Doc Type</span>
            <select 
              value={docType} 
              onChange={e => setDocType(e.target.value)}
              className="border border-gray-400 px-1 py-[2px]"
            >
              <option>Select an option</option>
              <option>AP</option>
              <option>NB</option>
              <option>RN</option>
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-blue-700 text-xs font-bold text-center">Policy Date</span>
            <input 
              type="text" 
              value={policyDate} 
              onChange={e => setPolicyDate(e.target.value)}
              className="border border-gray-400 w-28 px-1"
            />
          </div>

          <div className="flex items-center gap-1 mb-1">
            <input 
              type="checkbox" 
              id="all-checkbox"
              checked={isAll}
              onChange={e => setIsAll(e.target.checked)}
            />
            <label htmlFor="all-checkbox">All</label>
          </div>
        </div>

        <div className="text-center">
          <button 
            onClick={handleSearch}
            data-testid="search-btn"
            disabled={isSearching}
            className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-6 py-1 text-sm rounded disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </section>

      {/* Generate Section */}
      <section>
        <div className="bg-gray-300 text-center font-bold py-1 mb-2">
          Generate Failed Print Jobs
        </div>
        <div className="text-center mb-4 text-sm">
          Select jobs from table below then click Generate
        </div>
        <div className="flex justify-center gap-2 mb-6">
          <button 
            onClick={handleSelectAll}
            data-testid="select-all-btn"
            className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-4 py-1 text-sm rounded"
          >
            Select All
          </button>
          <button 
            onClick={handleUnselectAll}
            data-testid="unselect-all-btn"
            className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-4 py-1 text-sm rounded"
          >
            Unselect All
          </button>
          <button 
            onClick={handleGenerate}
            data-testid="generate-btn"
            disabled={selectedJobIds.size === 0}
            className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-4 py-1 text-sm rounded disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </section>

      {/* Table Section */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <select 
              value={entriesPerPage} 
              onChange={e => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-400 px-1"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries per page</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Search:</span>
            <input type="text" className="border border-gray-400 px-1" />
          </div>
        </div>

        <div className="text-center font-bold text-gray-700 mb-2">
          List of failed print jobs (Maximum displayed = 1000)
        </div>

        <div className="overflow-x-auto border border-gray-300">
          <table className="w-full text-left border-collapse" data-testid="failed-jobs-table">
            <thead>
              <tr className="border-b border-gray-300 text-blue-700">
                <th className="p-2 font-bold w-16 text-center">Select</th>
                <th className="p-2 font-bold">MCO</th>
                <th className="p-2 font-bold">Bound Policy</th>
                <th className="p-2 font-bold">Quote/Policy</th>
                <th className="p-2 font-bold">Document Type</th>
                <th className="p-2 font-bold">Date and Time</th>
                <th className="p-2 font-bold">Source</th>
              </tr>
            </thead>
            <tbody>
              {currentJobs.length > 0 ? (
                currentJobs.map((job, index) => (
                  <tr key={job.id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-2 text-center">
                      <input 
                        type="checkbox" 
                        data-testid="job-checkbox"
                        checked={selectedJobIds.has(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                      />
                    </td>
                    <td className="p-2">{job.mco}</td>
                    <td className="p-2">{job.boundPolicy}</td>
                    <td className="p-2">{job.quotePolicy}</td>
                    <td className="p-2">{job.documentType}</td>
                    <td className="p-2">{job.dateTime}</td>
                    <td className="p-2">{job.source}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No data available in table
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm">
            Showing {jobs.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, jobs.length)} of {jobs.length} entries
          </div>
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button 
              className="px-3 py-1 border border-gray-300 bg-blue-600 text-white rounded"
            >
              {currentPage}
            </button>
            <button 
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={endIndex >= jobs.length}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
