// ImportClientModal.jsx
import Papa from 'papaparse';
import { useState } from 'react';
import axios from '../api/axios';
import { NoSymbolIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Download, FileText } from 'lucide-react';

export default function ImportClientModal({ onClose, onImport, dark }) {
  const [step, setStep] = useState(1);
  const [csvFile, setCsvFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [validatedRows, setValidatedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const requiredFields = ['client_name', 'email_or_phone', 'service', 'middleman_name', 'plan', 'price', 'start_date', 'expiry_date'];

  const handleFileUpload = (file) => {
    // const file = e.target.files[0];
    if (!file || file.size > 25 * 1024 * 1024) return alert("Max file size 25MB");
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return alert("Invalid Format. Only CSV files are allowed.");
    }
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const rows = res.data;
        const cols = Object.keys(rows[0]);
        setColumns(cols);
        setSelectedCols(cols);
        setCsvData(rows);
        // setStep(2);
      },
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const fileSelected = Boolean(csvFile);

  const toggleColumn = (col) => {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  const handleValidateAndPreview = () => {
    const result = csvData.map(row => {
      const missing = requiredFields.filter(f => !row[f] || row[f].trim() === '');
      // return { ...row, _missing: missing };
      const errorMessage = missing.length > 0 ? `Missing: ${missing.join(', ')}` : '';
      return { ...row, _missing: missing, _errorMessage: errorMessage };
    });
    setValidatedRows(result);
    setStep(3);
  };

  // const handleFinalImport = async () => {
  //   // const valid = validatedRows.filter(row => row._missing.length === 0);
  //   const valid = validatedRows.filter(row => row._missing.length === 0).map(row => {
  //     const filtered = {};
  //     selectedCols.forEach(col => {
  //       filtered[col] = row[col] || null;
  //     });
  //     return filtered;
  //   });
  //   try {
  //     await axios.post('/clients/import', { clients: valid });  // Backend route
  //     alert('Import successful');
  //     onClose();
  //     onImport(); // Refresh table
  //   } catch (err) {
  //     alert("Failed to import clients");
  //     console.log(err);
  //   }
  // };
  const handleFinalImport = async () => {
    const BATCH_SIZE = 500; // adjust as needed
    const total = validatedRows.length;

    const valid = validatedRows
      .filter(row => row._missing.length === 0)
      .map(row => {
        const filtered = {};
        selectedCols.forEach(col => {
          filtered[col] = row[col] || null;
        });
        return filtered;
      });

    if (valid.length === 0) {
      alert("No valid clients to import.");
      return;
    }

    try {
      setIsLoading(true);           // if you're using a loading state
      setImportProgress(0);         // optional: progress state

      for (let i = 0; i < valid.length; i += BATCH_SIZE) {
        const batch = valid.slice(i, i + BATCH_SIZE);
        await axios.post('/clients/import', { clients: batch }, { withCredentials: true });

        // Optional progress update
        const progress = Math.round(((i + batch.length) / valid.length) * 100);
        setImportProgress(progress);
      }

      alert('✅ Import successful!');
      onClose();
      onImport(); // Refresh table
    } catch (err) {
      alert("❌ Failed to import clients");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={`${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"}  rounded-lg p-6 w-full max-w-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Import Clients</h2>
          <button onClick={onClose}>
            <XMarkIcon className={`w-5 h-5 font-bold ${dark ? "text-slate-300" : "text-blue-900"} hover:text-red-500 cursor-pointer`} />
          </button>
        </div>

        {step === 1 && (
          <div className='p-6 mx-auto my-2'>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`flex flex-col items-center justify-center ${dark ? "bg-gray-800 text-slate-300" : "bg-white text-blue-900"}  rounded-lg p-6 w-full shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]`}>

              {fileSelected ? (
                <FileText size={30} className={dark ? 'text-white' : 'text-indigo-900'} />
              ) : (
                <Download size={30} className={dark ? 'text-white' : 'text-indigo-900'} />
              )}

              {csvFile && (
                <div className={`mt-4 mb-4 ${dark ? "text-slate-300" : "text-indigo-900"} font-normal`}>
                  File selected: {csvFile.name}
                </div>
              )}

              {!fileSelected && (
                <p className={` ${dark ? "text-slate-300" : "text-indigo-900"} font-normal mt-4 mb-4`}>
                  Drag and drop file to import
                </p>
              )}

              <label
                htmlFor="csvFile"
                className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}
              >
                {fileSelected ? 'Replace file' : 'Choose file'}
              </label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              <p className="text-xs text-gray-400 mt-4">•maximum file size: 25 mb  •file format: csv</p>

            </div>
            <p className={` ${dark ? "text-slate-300" : "text-neutral-500"} font-normal mt-4 mb-2 text-sm`}>Download a <a href="/sample.csv" download className={`${dark ? "text-blue-300 hover:text-blue-400" : "text-blue-500 hover:text-blue-700"}`}>sample.csv</a> and compare it to your import file to ensure you have the file perfect for the import.</p>
            <div className="mt-6 text-center">
              <button
                className={`px-4 py-2 rounded font-medium border ${csvFile ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} cursor-pointer` : `opacity-50 ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} cursor-not-allowed`
                  }`}
                disabled={!csvFile}
                onClick={() => setStep(2)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className={`mb-2 ${dark ? "text-slate-300" : "text-blue-900"}`}>Your selected file: {csvFile.name}</h3>
            <h4 className={`mb-2 font-medium ${dark ? "text-slate-300" : "text-blue-900"}`}>Columns to include:</h4>
            <div className="grid grid-cols-3 gap-2">
              {columns.map(col => (
                <label key={col}>
                  <input
                    type="checkbox"
                    checked={selectedCols.includes(col)}
                    onChange={() => toggleColumn(col)}
                    className={`${dark ? 'accent-gray-500' : 'accent-indigo-600'} mr-2`}
                  />
                  {col}
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setStep(1)} className={`px-4 py-2 font-medium border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent rounded`}>Previous</button>
              <button onClick={handleValidateAndPreview} className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4 className="font-medium mb-2">
              {validatedRows.some(r => r._errorMessage)
                ? `${validatedRows.filter(r => !r._errorMessage).length} of ${validatedRows.length} rows are ready to be imported.`
                : 'Final Preview'}
            </h4>
            <div className="max-h-80 overflow-auto">
              <table className="table-auto w-full text-xs">
                <thead className={`sticky top-0 text-slate-400 border-b ${dark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"}`}>
                  <tr>
                    {selectedCols.map(col => (
                      <th key={col} className={`px-2 py-1 text-slate-400 border-r ${dark ? 'border-gray-700' : 'border-gray-300'} `}>{col}
                      </th>
                    ))}
                    {validatedRows.some(r => r._errorMessage) && <th className={`px-2 py-1 text-slate-400 border-r ${dark ? 'border-gray-700' : 'border-gray-300'} `}>Error</th>}
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.map((row, i) => (
                    <tr key={i} className={row._missing.length > 0 ? `${dark ? "bg-gray-500" : "bg-red-100"}` : ''}>
                      {selectedCols.map(col => (
                        <td key={col} className={`px-2 text-center  ${dark ? "text-slate-300" : "text-blue-950"}`}>{row[col] || '-'}</td>
                      ))}
                      {row._errorMessage && (
                        <td className={`${dark ? "text-red-900" : "text-red-600"} text-center px-2`}>⚠️ {row._errorMessage}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isLoading && (
              <div className="mt-2 w-full">
                <p className="text-sm mb-1">Importing... {importProgress}%</p>
                <div className="w-full bg-gray-300 rounded h-2 overflow-hidden">
                  <div className="bg-green-500 h-2" style={{ width: `${importProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-center gap-2">
              <button onClick={() => setStep(2)} className={`px-4 py-2 font-medium border ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent rounded`}>Previous</button>
              {validatedRows.every(r => r._missing.length === 0) && (
                <button onClick={handleFinalImport} className={`px-4 py-2 font-medium border ${dark ? 'bg-gray-700 text-slate-300 border-gray-700 hover:bg-gray-600' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'} rounded`}>Import Now</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
