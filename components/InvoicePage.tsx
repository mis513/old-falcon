import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, RefreshCw, ChevronDown, Loader2, AlertCircle } from 'lucide-react';

const SPREADSHEET_ID = '193rm1gvSoU8LKhn068ULl2Fa4NEPhCgXzw-7QfB5Rmo';
const SHEET_GID = '904258323';
// This is the unique ID from your "Publish to web" screenshot
const PUBLISHED_ID = '2PACX-1vRSCqrXrTb9Awl6kaxpYONPm7_3EJQFtl4m91uKvaAOiy-2tR0dGeCg3Q16yDhOsAF9cXForzSXq7N1l';
const WEB_APP_URL = 'WEB_APP_URL';

const InvoicePage: React.FC = () => {
  const [invoiceNumbers, setInvoiceNumbers] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const fetchInvoiceNumbers = async () => {
    if (WEB_APP_URL === 'WEB_APP_URL') {
      console.warn('WEB_APP_URL is not configured. Please update it in InvoicePage.tsx');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(WEB_APP_URL);
      
      // Check if the response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error('Server returned HTML instead of JSON. Ensure your Apps Script is deployed as a Web App and set to "Anyone".');
      }

      const data = await response.json();
      setInvoiceNumbers(data);
    } catch (error) {
      console.error('Error fetching invoice numbers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch invoice numbers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceNumbers();
  }, []);

  const handleInvoiceSelect = async (invoiceNo: string) => {
    setSelectedInvoice(invoiceNo);
    if (!invoiceNo) return;

    setIsUpdating(true);
    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceNo }),
      });
      
      // Reload iframe after a short delay to allow Apps Script to process
      setTimeout(() => {
        setIframeKey(prev => prev + 1);
        setIsUpdating(false);
      }, 2000);
    } catch (error) {
      console.error('Error updating invoice:', error);
      setIsUpdating(false);
    }
  };

  const previewPDF = () => {
    const pdfUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=pdf&gid=${SHEET_GID}`;
    window.open(pdfUrl, '_blank');
  };

  const openSheet = () => {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit#gid=${SHEET_GID}`;
    window.open(sheetUrl, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn p-4 md:p-8 bg-white rounded-[2rem] border border-slate-200 shadow-xl min-h-[800px] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="bg-sky-100 p-4 rounded-2xl text-sky-600 shadow-sm">
            <FileText size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase">Invoice Management</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select and preview your invoices directly from Google Sheets</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
              <AlertCircle size={12} />
              {error}
            </div>
          )}
          {WEB_APP_URL === 'WEB_APP_URL' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 animate-pulse">
              <RefreshCw size={12} className="animate-spin" />
              Configuration Required: Set WEB_APP_URL in InvoicePage.tsx
            </div>
          )}
          <div className="relative flex-1 md:flex-none min-w-[240px]">
            <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">
              Select Invoice Number
            </label>
            <div className="relative">
              <select
                value={selectedInvoice}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                disabled={isLoading || isUpdating}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 appearance-none focus:border-sky-500 focus:ring-0 transition-all disabled:opacity-50"
              >
                <option value="">Choose Invoice...</option>
                {invoiceNumbers.map((no, idx) => (
                  <option key={idx} value={no}>{no}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronDown size={18} />}
              </div>
            </div>
          </div>

          <button
            onClick={previewPDF}
            className="flex-1 md:flex-none bg-slate-900 text-white px-6 py-3.5 rounded-xl text-xs font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
          >
            <ExternalLink size={16} /> PREVIEW PDF
          </button>

          <button
            onClick={openSheet}
            className="flex-1 md:flex-none bg-emerald-500 text-white px-6 py-3.5 rounded-xl text-xs font-black hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95"
          >
            <ExternalLink size={16} /> OPEN SHEET
          </button>
          
          <button
            onClick={() => setIframeKey(prev => prev + 1)}
            className="p-3.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all active:scale-95"
            title="Refresh Preview"
          >
            <RefreshCw size={18} className={isUpdating ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 rounded-3xl border-4 border-slate-100 overflow-hidden relative min-h-[600px] shadow-inner">
        {isUpdating && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-slate-100">
              <Loader2 size={48} className="text-sky-500 animate-spin" strokeWidth={3} />
              <div className="text-center">
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Updating Sheet...</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Please wait while we sync the data</p>
              </div>
            </div>
          </div>
        )}
        <iframe
          key={iframeKey}
          src={`https://docs.google.com/spreadsheets/d/e/${PUBLISHED_ID}/pubhtml?gid=${SHEET_GID}&single=true&widget=false&headers=false&chrome=false`}
          className="w-full h-full border-none"
          title="Invoice Preview"
        />
      </div>
    </div>
  );
};

export default InvoicePage;
