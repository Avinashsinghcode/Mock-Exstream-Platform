interface ResultsPageProps {
  results: any[];
  onReturn: () => void;
}

export default function ResultsPage({ results, onReturn }: ResultsPageProps) {
  return (
    <div className="space-y-6">
      <div className="text-center my-6">
        <button 
          onClick={onReturn}
          data-testid="return-btn"
          className="border border-gray-400 bg-gray-100 hover:bg-gray-200 px-4 py-1 text-sm rounded"
        >
          Return to Regenerating Page
        </button>
      </div>

      <div className="bg-blue-900 h-2 w-full mb-6"></div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center font-bold text-lg mb-2">
          Regenerated print jobs
        </div>

        <div className="border-2 border-gray-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800 font-bold">
                <th className="p-2 border-r border-gray-400">Bound Policy</th>
                <th className="p-2 border-r border-gray-400">Quote Policy</th>
                <th className="p-2 border-r border-gray-400">Document type</th>
                <th className="p-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-b border-gray-400">
                  <td className="p-2 border-r border-gray-400">{result.boundPolicy}</td>
                  <td className="p-2 border-r border-gray-400">{result.quotePolicy}</td>
                  <td className="p-2 border-r border-gray-400">{result.documentType}</td>
                  <td className="p-2">
                    <span className={result.result.includes('successfully') ? 'text-blue-600 underline' : 'text-gray-800'}>
                      {result.result}
                    </span>
                  </td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No results to display
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
