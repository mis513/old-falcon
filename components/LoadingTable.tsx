import React, { memo } from 'react';
import { LoadingEntry, ColumnDefinition, ColumnKey, SortConfig } from '../types';
import { Trash2, Edit3, ArrowUp, ArrowDown, Image as ImageIcon, EyeOff } from 'lucide-react';

interface LoadingTableProps {
  entries: LoadingEntry[];
  columns: ColumnDefinition[];
  onDelete?: (id: string) => void;
  onHideRow?: (id: string) => void;
  sortConfig: SortConfig;
  onSort: (key: ColumnKey | 'sno') => void;
}

const LoadingTable: React.FC<LoadingTableProps> = ({ entries, columns, onDelete, onHideRow, sortConfig, onSort }) => {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);

  const formatQty = (val: number) => 
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3, minimumFractionDigits: 0 }).format(val);

  const totals = entries.reduce((acc, curr) => {
    const rawGross = curr.grossAmt || 0;
    const calcNet = rawGross + (curr.tdsAmount || 0) - (curr.otherDedAmt || 0) - (curr.cdAmt || 0) - (curr.brokerage || 0);
    
    return {
      qty: acc.qty + (curr.qtyTon || 0),
      bags: acc.bags + (curr.bags || 0),
      amount: acc.amount + (curr.amount || 0),
      dedAmt: acc.dedAmt + (curr.bagsWtDedAmt || 0),
      grossAmt: acc.grossAmt + rawGross,
      tds: acc.tds + (curr.tdsAmount || 0),
      cdAmt: acc.cdAmt + (curr.cdAmt || 0),
      brokerage: acc.brokerage + (curr.brokerage || 0),
      otherDedAmt: acc.otherDedAmt + (curr.otherDedAmt || 0),
      netAmt: acc.netAmt + calcNet,
      netWt: acc.netWt + (curr.netWt || 0),
      grossWt: acc.grossWt + (curr.grossWt || 0),
    };
  }, { qty: 0, bags: 0, amount: 0, dedAmt: 0, grossAmt: 0, tds: 0, cdAmt: 0, brokerage: 0, otherDedAmt: 0, netAmt: 0, netWt: 0, grossWt: 0 });

  const renderCell = (entry: LoadingEntry, colKey: string) => {
    const val = (entry as any)[colKey];
    
    switch (colKey) {
      case 'loadingDate':
        return <span className="text-slate-600 font-bold text-[14px]">{val || '-'}</span>;
      case 'vhNo':
        return <span className="font-black text-slate-900 uppercase text-[15px]">{val || '-'}</span>;
      case 'qtyTon':
      case 'grossWt':
      case 'tareWt':
      case 'netWt':
        return <span className="font-black text-slate-900 text-[15px]">{formatQty(Number(val))}</span>;
      case 'rate':
      case 'bags':
      case 'amount':
      case 'grossAmt':
      case 'freight':
        return <span className="font-black text-slate-900 text-[15px]">{colKey === 'bags' ? val : formatCurrency(Number(val))}</span>;
      case 'bagsWtDedAmt':
      case 'otherDedAmt':
      case 'cdAmt':
        return <span className="text-rose-600 font-black text-[15px]">{formatCurrency(Number(val))}</span>;
      case 'brokerage':
      case 'brokerageRate':
      case 'tdsAmount':
        return <span className="text-blue-600 font-black text-[15px]">{formatCurrency(Number(val))}</span>;
      case 'netAmt':
        const calculatedNet = (entry.grossAmt || 0) + (entry.tdsAmount || 0) - (entry.otherDedAmt || 0) - (entry.cdAmt || 0) - (entry.brokerage || 0);
        return <span className="text-emerald-600 font-black text-[16px]">{formatCurrency(calculatedNet)}</span>;
      case 'wbSlipPhoto':
        if (!val) return '-';
        if (val.startsWith('data:image')) {
          return (
            <button 
              onClick={() => {
                const w = window.open("");
                if (w) w.document.write(`
                  <body style="margin:0; padding:0; background:#f1f5f9; display:flex; justify-content:center; align-items:flex-start; min-height:100vh;">
                    <div style="margin: 0.5cm; background:white; padding:0.5cm; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px;">
                      <img src="${val}" style="max-width: 100%; display:block;" />
                    </div>
                  </body>
                `);
              }} 
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              <ImageIcon size={14} /> VIEW
            </button>
          );
        }
        return (
          <button 
            onClick={() => {
              const w = window.open("");
              if (w) {
                if (val.toLowerCase().endsWith('.pdf')) {
                  w.document.write(`
                    <body style="margin:0; padding:0; background:#f1f5f9; overflow:hidden;">
                      <div style="margin: 0.5cm; height: calc(100vh - 1cm); background:white; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px; overflow:hidden;">
                        <iframe src="${val}" style="width: 100%; height: 100%; border: none;"></iframe>
                      </div>
                    </body>
                  `);
                } else {
                  w.document.write(`
                    <body style="margin:0; padding:0; background:#f1f5f9; display:flex; justify-content:center; align-items:flex-start; min-height:100vh;">
                      <div style="margin: 0.5cm; background:white; padding:0.5cm; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px;">
                        <img src="${val}" style="max-width: 100%; display:block;" />
                      </div>
                    </body>
                  `);
                }
              }
            }} 
            className="text-blue-500 hover:underline flex items-center gap-1"
          >
            <ImageIcon size={14} /> VIEW
          </button>
        );
      default:
        return <span className="text-slate-700 font-bold uppercase text-[14px]">{String(val || '-')}</span>;
    }
  };

  const SortIcon = ({ colKey }: { colKey: string }) => {
    if (sortConfig.key !== colKey) return null;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp size={12} className="ml-1 text-slate-950 inline" strokeWidth={4} /> : 
      <ArrowDown size={12} className="ml-1 text-slate-950 inline" strokeWidth={4} />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#fbbf24]">
            <tr className="font-black text-slate-900 uppercase">
              <th onClick={() => onSort('sno')} className="px-4 py-3.5 text-left text-[12px] cursor-pointer hover:bg-amber-500 transition-all border-r border-amber-500/30">
                S. NO. <SortIcon colKey="sno" />
              </th>
              {columns.map(col => (
                <th key={col.key} onClick={() => onSort(col.key)} className={`py-3.5 ${col.align === 'right' ? 'text-right pl-4 pr-16' : 'text-left px-4'} text-[12px] cursor-pointer hover:bg-amber-500 transition-all border-r border-amber-500/30 last:border-0 col-hide ${!col.visible ? 'hidden' : ''}`}>
                  <div className={`flex items-center ${col.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    {col.label} <SortIcon colKey={col.key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3.5 text-center text-[12px] actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {entries.map((entry, index) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-2.5 text-left border-r border-slate-100">
                  <span className="font-black text-slate-400 text-[14px]">{index + 1}</span>
                </td>
                {columns.map(col => (
                  <td key={col.key} className={`py-2.5 whitespace-nowrap ${col.align === 'right' ? 'text-right pl-4 pr-16' : 'text-left px-4'} border-r border-slate-100 last:border-0 col-hide ${!col.visible ? 'hidden' : ''}`}>
                    {renderCell(entry, col.key)}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center actions-column">
                  <div className="flex justify-center gap-2 opacity-10 group-hover:opacity-100 transition-all">
                    <button onClick={() => onHideRow?.(entry.id)} className="p-1 text-slate-400 hover:text-amber-600 transition-colors" title="Hide Row"><EyeOff size={16} /></button>
                    <button className="p-1 text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={16} /></button>
                    <button onClick={() => onDelete?.(entry.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xl bg-slate-50/50">
                  NO LOADS FOUND FOR THIS SELECTION
                </td>
              </tr>
            )}
          </tbody>
          {entries.length > 0 && (
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-black text-slate-900">
              <tr>
                <td className="px-4 py-4 border-r border-slate-200"></td>
                {columns.map((col, idx) => {
                  if (idx === 0) return <td key={col.key} className={`px-4 py-4 text-left text-slate-500 text-[14px] col-hide ${!col.visible ? 'hidden' : ''}`}>TOTALS</td>;
                  
                  let totalVal: any = null;
                  let colorClass = "text-slate-900";

                  if (col.key === 'qtyTon') totalVal = formatQty(totals.qty);
                  if (col.key === 'bags') totalVal = totals.bags;
                  if (col.key === 'amount') totalVal = formatCurrency(totals.amount);
                  if (col.key === 'bagsWtDedAmt') { totalVal = formatCurrency(totals.dedAmt); colorClass = "text-rose-700"; }
                  if (col.key === 'grossAmt') totalVal = formatCurrency(totals.grossAmt);
                  if (col.key === 'tdsAmount') { totalVal = formatCurrency(totals.tds); colorClass = "text-blue-700"; }
                  if (col.key === 'cdAmt') { totalVal = formatCurrency(totals.cdAmt); colorClass = "text-rose-700"; }
                  if (col.key === 'brokerage') { totalVal = formatCurrency(totals.brokerage); colorClass = "text-blue-700"; }
                  if (col.key === 'brokerageRate') { totalVal = formatQty(totals.qty > 0 ? totals.brokerage / totals.qty : 0); colorClass = "text-blue-700"; }
                  if (col.key === 'otherDedAmt') { totalVal = formatCurrency(totals.otherDedAmt); colorClass = "text-rose-700"; }
                  if (col.key === 'netAmt') { totalVal = formatCurrency(totals.netAmt); colorClass = "text-emerald-700"; }
                  if (col.key === 'netWt') totalVal = formatQty(totals.netWt);
                  if (col.key === 'grossWt') totalVal = formatQty(totals.grossWt);

                  return (
                    <td key={col.key} className={`py-4 ${col.align === 'right' ? 'text-right pl-4 pr-16' : 'text-left px-4'} ${colorClass} text-[16px] col-hide ${!col.visible ? 'hidden' : ''}`}>
                      {totalVal !== null ? totalVal : ''}
                    </td>
                  );
                })}
                <td className="bg-slate-100 border-l border-slate-200"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default memo(LoadingTable);