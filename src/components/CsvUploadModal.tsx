import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ColumnMapping } from '../types/finance';
import { parseCSVFile, convertRowsToTransactions } from '../utils/csvParser';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({ isOpen, onClose }) => {
  const { setTransactions, addTransactions } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '',
    description: '',
    amount: '',
  });
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');

  if (!isOpen) return null;

  const handleProcessFile = async (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    try {
      const result = await parseCSVFile(selectedFile);
      setHeaders(result.headers);
      setRawRows(result.rawRows);
      setMapping(result.detectedMapping);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CSV file.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!mapping.date || !mapping.description || (!mapping.amount && !mapping.debitAmount && !mapping.creditAmount)) {
      setError('Please map Date, Description, and Amount columns.');
      return;
    }

    const converted = convertRowsToTransactions(rawRows, mapping, file?.name || 'Uploaded File');
    if (converted.length === 0) {
      setError('No valid transactions could be extracted with the selected mapping.');
      return;
    }

    if (importMode === 'replace') {
      setTransactions(converted);
    } else {
      addTransactions(converted);
    }

    onClose();
  };

  // Preview generated transactions
  const previewList = rawRows.slice(0, 4).map((row, idx) => {
    const rawDate = row[mapping.date] || '';
    const desc = row[mapping.description] || '';
    let amt = 0;
    if (mapping.debitAmount && row[mapping.debitAmount]) {
      amt = Math.abs(parseFloat(row[mapping.debitAmount].replace(/[^0-9.-]/g, '')) || 0);
    } else if (mapping.creditAmount && row[mapping.creditAmount]) {
      amt = Math.abs(parseFloat(row[mapping.creditAmount].replace(/[^0-9.-]/g, '')) || 0);
    } else if (mapping.amount && row[mapping.amount]) {
      amt = Math.abs(parseFloat(row[mapping.amount].replace(/[^0-9.-]/g, '')) || 0);
    }
    return { idx, rawDate, desc, amt };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Import Bank Statement CSV</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Processed locally in memory • Compatible with Chase, Amex, BoA, Wells Fargo & more
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                Click or drag & drop bank CSV file here
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Standard format with Date, Description, and Amount columns
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* File Info Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white truncate">{file.name}</span>
                  <span className="text-slate-500">({rawRows.length} rows detected)</span>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setRawRows([]);
                    setHeaders([]);
                  }}
                  className="text-xs text-red-500 hover:underline shrink-0"
                >
                  Change File
                </button>
              </div>

              {/* Column Mapping Selector */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Detected Column Mapping
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Date Column</label>
                    <select
                      value={mapping.date}
                      onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Description Column</label>
                    <select
                      value={mapping.description}
                      onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Amount Column</label>
                    <select
                      value={mapping.amount}
                      onChange={(e) => setMapping({ ...mapping, amount: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Select or Split --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Split Debit / Credit Mapping */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <div className="font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Split Outflow / Inflow columns (Optional):
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block mb-1">Debit / Outflow</span>
                      <select
                        value={mapping.debitAmount || ''}
                        onChange={(e) => setMapping({ ...mapping, debitAmount: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="">None</option>
                        {headers.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <span className="block mb-1">Credit / Inflow</span>
                      <select
                        value={mapping.creditAmount || ''}
                        onChange={(e) => setMapping({ ...mapping, creditAmount: e.target.value })}
                        className="w-full px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="">None</option>
                        {headers.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Preview Rows */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Parsed Sample Preview
                </h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {previewList.map((p) => (
                    <div key={p.idx} className="p-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{p.desc || 'Empty'}</div>
                        <div className="text-[11px] text-slate-500">{formatDate(p.rawDate)}</div>
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(p.amt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Import Options */}
              <div className="flex items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-medium">Import Strategy:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Replace existing dataset</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Append to existing</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {file && (
            <button
              onClick={handleConfirmImport}
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
            >
              <span>Process & Visualize Flow</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
