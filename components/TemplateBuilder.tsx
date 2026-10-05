import React, { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { 
  Plus, Save, FolderOpen, Eye, Edit3, Trash2, Type, Table as TableIcon, 
  Grid, Move, Maximize2, ChevronLeft, Download, FileDown, Image as ImageIcon, Tag,
  RotateCcw, RefreshCcw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface Block {
  id: string;
  type: 'text' | 'table' | 'label' | 'box';
  content: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  fontSize: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  border?: string;
  padding?: number;
}

interface Template {
  id: string;
  name: string;
  blocks: Block[];
  backgroundImage?: string;
}

const GRID_SIZE = 10;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1131; // A4 ratio approx

const DEFAULT_BLOCKS: Block[] = [
  // Main Border
  { id: 'border', type: 'box', content: '', x: 0, y: 0, width: 800, height: 1131, fontSize: 0, border: '2px solid #0369a1' },
  
  // Title
  { id: 'title', type: 'text', content: 'COMMERCIAL INVOICE', x: 0, y: 0, width: 800, height: 30, fontSize: 10, fontWeight: 'black', textAlign: 'center', border: '1px solid #0369a1', backgroundColor: '#e0f2fe' },
  
  // Exporter Section
  { id: 'exporter-box', type: 'box', content: '', x: 0, y: 30, width: 800, height: 120, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'exporter-label', type: 'text', content: 'Exporter:', x: 5, y: 35, width: 60, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'exporter-name', type: 'text', content: 'FALCON OVERSEAS', x: 0, y: 55, width: 800, height: 25, fontSize: 18, fontWeight: 'black', textAlign: 'center', color: '#0369a1' },
  { id: 'exporter-details', type: 'text', content: 'GSTN: 27AAHFF8191L2ZS    HELPLINE: +91-7304269930\nEMAIL: falcon390overseas@gmail.com\nADDRESS: FALCON OVERSEAS, C/O KD INK MFG. CO., VIJAY NAGAR, BALAGHAT ROAD, GONDIA-441614, MAHARASHTRA, INDIA.', x: 0, y: 85, width: 800, height: 60, fontSize: 8, textAlign: 'center', fontWeight: 'bold' },

  // Row 1: Invoice Details
  { id: 'inv-no-box', type: 'box', content: '', x: 0, y: 150, width: 120, height: 50, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'inv-no-label', type: 'text', content: 'Invoice No.', x: 0, y: 150, width: 120, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'inv-no-val', type: 'label', content: '{{invoiceNo}}', x: 5, y: 170, width: 110, height: 25, fontSize: 10, fontWeight: 'bold' },

  { id: 'date-box', type: 'box', content: '', x: 120, y: 150, width: 120, height: 50, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'date-label', type: 'text', content: 'Date', x: 120, y: 150, width: 120, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'date-val', type: 'label', content: '{{invoiceDate}}', x: 125, y: 170, width: 110, height: 25, fontSize: 10, fontWeight: 'bold' },

  { id: 'sc-box', type: 'box', content: '', x: 240, y: 150, width: 240, height: 50, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'sc-label', type: 'text', content: 'Sales Contract', x: 240, y: 150, width: 240, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'sc-val', type: 'label', content: '{{scNo}}', x: 245, y: 170, width: 230, height: 25, fontSize: 10, fontWeight: 'bold' },

  { id: 'ref-box', type: 'box', content: '', x: 480, y: 150, width: 320, height: 50, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'ref-label', type: 'text', content: 'Other Reference(s)', x: 480, y: 150, width: 320, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'ref-val', type: 'label', content: '{{otherReferences}}', x: 485, y: 170, width: 310, height: 25, fontSize: 8 },

  // Row 2: Consignee & 1st Notify
  { id: 'consignee-box', type: 'box', content: '', x: 0, y: 200, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'consignee-label', type: 'text', content: 'Consignee:', x: 0, y: 200, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'consignee-val', type: 'label', content: '{{consignee}}', x: 5, y: 220, width: 390, height: 85, fontSize: 10 },

  { id: 'notify1-box', type: 'box', content: '', x: 400, y: 200, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'notify1-label', type: 'text', content: '1st Notify Party:', x: 400, y: 200, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'notify1-val', type: 'label', content: '{{notifyParty1}}', x: 405, y: 220, width: 390, height: 85, fontSize: 10 },

  // Row 3: 2nd & 3rd Notify
  { id: 'notify2-box', type: 'box', content: '', x: 0, y: 310, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'notify2-label', type: 'text', content: '2nd Notify Party:', x: 0, y: 310, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'notify2-val', type: 'label', content: '{{notifyParty2}}', x: 5, y: 330, width: 390, height: 85, fontSize: 10 },

  { id: 'notify3-box', type: 'box', content: '', x: 400, y: 310, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'notify3-label', type: 'text', content: '3rd Notify Party:', x: 400, y: 310, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'notify3-val', type: 'label', content: '{{notifyParty3}}', x: 405, y: 330, width: 390, height: 85, fontSize: 10 },

  // Row 4: 4th & 5th Notify
  { id: 'notify4-box', type: 'box', content: '', x: 0, y: 420, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'notify4-label', type: 'text', content: '4th Notify Party:', x: 0, y: 420, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'notify4-val', type: 'label', content: '{{notifyParty4}}', x: 5, y: 440, width: 390, height: 85, fontSize: 10 },

  { id: 'notify5-box', type: 'box', content: '', x: 400, y: 420, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'notify5-label', type: 'text', content: '5th Notify Party:', x: 400, y: 420, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'notify5-val', type: 'label', content: '{{notifyParty5}}', x: 405, y: 440, width: 390, height: 85, fontSize: 10 },

  // Row 5: Logistics
  { id: 'pre-carriage-box', type: 'box', content: '', x: 0, y: 530, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'pre-carriage-label', type: 'text', content: 'Pre-Carriage By', x: 0, y: 530, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'pre-carriage-val', type: 'label', content: '{{preCarriageBy}}', x: 5, y: 545, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'pre-carrier-box', type: 'box', content: '', x: 200, y: 530, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'pre-carrier-label', type: 'text', content: 'Pre-Carrier', x: 200, y: 530, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'pre-carrier-val', type: 'label', content: '{{preCarrier}}', x: 205, y: 545, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'vessel-box', type: 'box', content: '', x: 400, y: 530, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'vessel-label', type: 'text', content: 'Vessel/Voyage No.', x: 400, y: 530, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'vessel-val', type: 'label', content: '{{vesselVoyage}}', x: 405, y: 545, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'pod-box', type: 'box', content: '', x: 600, y: 530, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'pod-label', type: 'text', content: 'Port of Discharge', x: 600, y: 530, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'pod-val', type: 'label', content: '{{portOfDischarge}}', x: 605, y: 545, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  // Row 6: Origin & Loading
  { id: 'origin-box', type: 'box', content: '', x: 0, y: 570, width: 266, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'origin-label', type: 'text', content: 'Country of Origin of Goods', x: 0, y: 570, width: 266, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'origin-val', type: 'label', content: '{{originCountry}}', x: 5, y: 585, width: 256, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'pol-box', type: 'box', content: '', x: 266, y: 570, width: 266, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'pol-label', type: 'text', content: 'Port of Loading', x: 266, y: 570, width: 266, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'pol-val', type: 'label', content: '{{portOfLoading}}', x: 271, y: 585, width: 256, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'payment-box', type: 'box', content: '', x: 532, y: 570, width: 268, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'payment-label', type: 'text', content: 'Terms of Payment', x: 532, y: 570, width: 268, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'payment-val', type: 'label', content: '{{paymentTerms}}', x: 537, y: 585, width: 258, height: 20, fontSize: 8, textAlign: 'center' },

  // Row 7: Destination & Docs
  { id: 'country-final-dest-box', type: 'box', content: '', x: 0, y: 610, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'country-final-dest-label', type: 'text', content: 'Country of Final Destination', x: 0, y: 610, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'country-final-dest-val', type: 'label', content: '{{countryOfFinalDestination}}', x: 5, y: 625, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'dest-box', type: 'box', content: '', x: 200, y: 610, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'dest-label', type: 'text', content: 'Final Destination', x: 200, y: 610, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'dest-val', type: 'label', content: '{{finalDestination}}', x: 205, y: 625, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'bl-box', type: 'box', content: '', x: 400, y: 610, width: 200, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'bl-label', type: 'text', content: 'BL No.', x: 400, y: 610, width: 200, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'bl-val', type: 'label', content: '{{blNo}}', x: 405, y: 625, width: 190, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'incoterms-box', type: 'box', content: '', x: 600, y: 610, width: 100, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'incoterms-label', type: 'text', content: 'Incoterms', x: 600, y: 610, width: 100, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'incoterms-val', type: 'label', content: '{{incoterms}}', x: 605, y: 625, width: 90, height: 20, fontSize: 8, textAlign: 'center' },

  { id: 'sb-box', type: 'box', content: '', x: 700, y: 610, width: 100, height: 40, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'sb-label', type: 'text', content: 'SB No.', x: 700, y: 610, width: 100, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'sb-val', type: 'label', content: '{{sbNo}}', x: 705, y: 625, width: 90, height: 20, fontSize: 8, textAlign: 'center' },

  // Table
  { id: 'main-table', type: 'table', content: 'MARKS NO. | DESCRIPTION OF GOODS | QUANTITY (NET WT. IN MTS) | RATE/MTS | AMOUNT\nBRAND | {{itemName}} | {{quantity}} | {{rate}} | {{amount}}\n | HS CODE: {{hsCode}} | | | ', x: 0, y: 650, width: 800, height: 200, fontSize: 10, border: '1px solid #0369a1' },
  
  // Footer
  { id: 'total-box', type: 'box', content: '', x: 0, y: 850, width: 800, height: 30, fontSize: 0, border: '1px solid #0369a1', backgroundColor: '#e0f2fe' },
  { id: 'total-label', type: 'text', content: 'Total', x: 0, y: 850, width: 560, height: 30, fontSize: 8, fontWeight: 'black', textAlign: 'right', padding: 10 },
  { id: 'total-val', type: 'text', content: '{{amount}}', x: 560, y: 850, width: 240, height: 30, fontSize: 8, fontWeight: 'black', textAlign: 'left', padding: 10 },

  { id: 'words-box', type: 'box', content: '', x: 0, y: 880, width: 400, height: 80, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'words-label', type: 'text', content: 'Amount (in words):', x: 0, y: 880, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'words-val', type: 'label', content: '{{amountInWords}}', x: 5, y: 900, width: 390, height: 55, fontSize: 8, fontWeight: 'bold' },

  { id: 'bank-box', type: 'box', content: '', x: 0, y: 960, width: 400, height: 110, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'bank-label', type: 'text', content: 'Bank Details', x: 0, y: 960, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'bank-val', type: 'text', content: 'BANK NAME: {{bankName}}\nBRANCH: {{branchName}}\nA/C NO: {{accountNo}}\nSWIFT: {{swiftCode}}\nINTERMEDIARY BANK: {{intermediaryBank}}\nSWIFT: {{swiftCodeIntermediary}}', x: 5, y: 980, width: 390, height: 85, fontSize: 7 },

  { id: 'rate-breakup-box', type: 'box', content: '', x: 400, y: 880, width: 400, height: 190, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'rate-breakup-label', type: 'text', content: 'Rate Breakup', x: 400, y: 880, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1', textAlign: 'center' },
  { id: 'fob-label', type: 'text', content: 'FOB', x: 400, y: 895, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', padding: 5 },
  { id: 'fob-val', type: 'label', content: '{{fobRate}}', x: 600, y: 895, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', textAlign: 'right', padding: 5 },
  { id: 'freight-label', type: 'text', content: 'FREIGHT', x: 400, y: 925, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', padding: 5 },
  { id: 'freight-val', type: 'label', content: '{{freightRate}}', x: 600, y: 925, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', textAlign: 'right', padding: 5 },
  { id: 'insurance-label', type: 'text', content: 'INSURANCE', x: 400, y: 955, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', padding: 5 },
  { id: 'insurance-val', type: 'label', content: '{{insuranceRate}}', x: 600, y: 955, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', textAlign: 'right', padding: 5 },
  { id: 'commission-label', type: 'text', content: 'COMMISSION', x: 400, y: 985, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', padding: 5 },
  { id: 'commission-val', type: 'label', content: '{{commission}}', x: 600, y: 985, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', textAlign: 'right', padding: 5 },
  { id: 'cif-label', type: 'text', content: 'CIF', x: 400, y: 1015, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', padding: 5, fontWeight: 'black' },
  { id: 'cif-val', type: 'label', content: '{{cif}}', x: 600, y: 1015, width: 200, height: 30, fontSize: 7, border: '1px solid #0369a1', textAlign: 'right', padding: 5, fontWeight: 'black' },

  { id: 'declaration-box', type: 'box', content: '', x: 0, y: 1070, width: 400, height: 61, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'declaration-label', type: 'text', content: 'Declaration:', x: 0, y: 1070, width: 400, height: 15, fontSize: 7, fontWeight: 'bold', backgroundColor: '#e0f2fe', border: '1px solid #0369a1' },
  { id: 'declaration-val', type: 'text', content: 'WE DECLARE THAT THIS COMMERCIAL INVOICE SHOWS ACTUAL PRICE OF GOODS DESCRIBED & THAT ALL PARTICULARS ARE TRUE & CORRECT.', x: 5, y: 1085, width: 390, height: 40, fontSize: 7 },

  { id: 'sign-box', type: 'box', content: '', x: 400, y: 1070, width: 400, height: 61, fontSize: 0, border: '1px solid #0369a1' },
  { id: 'sign-label', type: 'text', content: 'FOR, FALCON OVERSEAS', x: 400, y: 1075, width: 400, height: 20, fontSize: 8, fontWeight: 'black', textAlign: 'center', color: '#0369a1' },
  { id: 'sign-line', type: 'text', content: 'Authorised Signatory', x: 400, y: 1110, width: 400, height: 20, fontSize: 8, fontWeight: 'bold', textAlign: 'center' }
];

interface TemplateBuilderProps {
  invoiceNoList: string[];
  invoiceDetailsList: any[];
  scDetailsList: any[];
  registerData: any[];
  onSaveInvoice?: (invoiceData: any) => void;
  onImportAI?: (base64: string, mimeType: string) => Promise<Block[]>;
  initialData?: any;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ 
  invoiceNoList, 
  invoiceDetailsList, 
  scDetailsList, 
  registerData,
  onSaveInvoice,
  onImportAI,
  initialData
}) => {
  const [mode, setMode] = useState<'design' | 'preview'>('design');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('Falcon Commercial Invoice');
  const [showGrid, setShowGrid] = useState(true);
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for preview data
  const [previewData, setPreviewData] = useState({
    invoiceNo: 'FQ/02/26-27',
    invoiceDate: '04/04/2026',
    scNo: 'SC/2024/789',
    exporter: 'FALCON OVERSEAS',
    consignee: 'GLOBAL TRADING LLC\n123 BUSINESS BAY, DUBAI, UAE',
    notifyParty1: 'NOOR AL QASAR GENERAL TRADING LLC\nOFFICE 402, AL REEM TOWER, DUBAI',
    notifyParty2: '',
    notifyParty3: '',
    notifyParty4: '',
    notifyParty5: 'NOOR AL QASAR GENERAL TRADING LLC\nOFFICE 402, AL REEM TOWER, DUBAI',
    preCarriageBy: 'BY ROAD',
    preCarrier: 'TRUCK',
    vesselVoyage: 'MSC EMMA / 241W',
    portOfDischarge: 'JEBEL ALI',
    originCountry: 'INDIA',
    portOfLoading: 'MUNDRA',
    paymentTerms: '100% ADVANCE',
    finalDestination: 'DUBAI, UAE',
    blNo: 'MUNDXB123456',
    incoterms: 'CIF',
    sbNo: '9876543',
    itemName: 'INDIAN LONG GRAIN WHITE RICE',
    quantity: '270.000 MTS',
    rate: '419.00',
    amount: '113,130.00',
    amountInWords: 'ONE HUNDRED THIRTEEN THOUSAND ONE HUNDRED THIRTY DOLLARS ONLY',
    bankName: 'BANK OF INDIA',
    branchName: 'RAILTOLY GONDIA - 441 614 (M.S.) INDIA',
    accountNo: '920620110000722',
    swiftCode: 'BKIDINBBGON',
    ifscCode: 'BKID0009206',
    otherReferences: '',
    sbDate: '',
    portCode: '',
    hsCode: '10063010',
    branchDetails: 'RAILTOLY GONDIA - 441 614 (M.S.) INDIA',
    intermediaryBank: 'BANK OF INDIA NEW YORK, USA',
    swiftCodeIntermediary: 'BKIDUS33',
    fobRate: '110,000.00',
    freightRate: '2,500.00',
    insuranceRate: '630.00',
    commission: '0.00',
    cif: '113,130.00',
    countryOfFinalDestination: 'UAE'
  });

  // Effect to load initialData if provided
  useEffect(() => {
    if (initialData) {
      if (initialData.blocks) setBlocks(initialData.blocks);
      if (initialData.data) setPreviewData(initialData.data);
      if (initialData.templateName) setTemplateName(initialData.templateName);
      if (initialData.invoiceNo) setSelectedInvoiceNo(initialData.invoiceNo);
      setMode('preview'); // Default to preview mode for loaded invoices
    }
  }, [initialData]);

  // Effect to populate data when invoice is selected
  useEffect(() => {
    if (!selectedInvoiceNo) return;

    const inv = invoiceDetailsList.find(i => String(i.invoiceNo || '').trim() === selectedInvoiceNo.trim()) ||
                registerData.find(r => r.type === 'INVOICE' && String(r.invoiceNo || '').trim() === selectedInvoiceNo.trim());

    if (inv) {
      const scNo = String(inv.againstSc || '').trim();
      const sc = scDetailsList.find(s => String(s.salesContractNo || '').trim() === scNo) ||
                 registerData.find(r => r.type === 'SALES CONTRACT' && String(r.salesContractNo || '').trim() === scNo);

      const newData = {
        ...previewData,
        invoiceNo: String(inv.invoiceNo || ''),
        invoiceDate: String(inv.invoiceDate || ''),
        scNo: scNo,
        consignee: String(inv.consignee || sc?.consignee || ''),
        notifyParty1: String(inv.firstNotifyParty || sc?.firstNotifyParty || ''),
        notifyParty2: String(inv.secondNotifyParty || sc?.secondNotifyParty || ''),
        notifyParty3: String(inv.thirdNotifyParty || sc?.thirdNotifyParty || ''),
        notifyParty4: String(inv.fourthNotifyParty || sc?.fourthNotifyParty || ''),
        notifyParty5: String(inv.fifthNotifyParty || sc?.fifthNotifyParty || ''),
        preCarriageBy: String(inv.preCarriageBy || ''),
        preCarrier: String(inv.preCarrier || ''),
        vesselVoyage: String(inv.vesselVoyageNo || ''),
        portOfDischarge: String(inv.pod || inv.portOfDischarge || sc?.portOfDischarge || ''),
        originCountry: String(inv.countryOfOrigin || sc?.countryOfOrigin || 'INDIA'),
        portOfLoading: String(inv.pol || inv.portOfLoading || sc?.portOfLoading || ''),
        paymentTerms: String(inv.termsOfPayment || sc?.termsOfPayment || ''),
        finalDestination: String(inv.finalDestination || sc?.finalDestination || ''),
        blNo: String(inv.blNo || ''),
        incoterms: String(inv.incoterms || sc?.incoterms || ''),
        sbNo: String(inv.sbNo || ''),
        sbDate: String(inv.sbDate || ''),
        itemName: String(inv.descriptionOfGoods || sc?.descriptionOfGoods || ''),
        quantity: `${inv.netWtMt || inv.contractQty || sc?.contractQty || '0'} MTS`,
        rate: String(inv.invRate || inv.ratePerMts || sc?.ratePerMts || '0'),
        amount: String(inv.invoiceAmt || inv.totalContractualValue || sc?.totalContractualValue || '0'),
        otherReferences: String(inv.otherReferences || sc?.otherReferences || ''),
        hsCode: String(inv.hsCode || sc?.hsCode || ''),
        fobRate: String(inv.fobRate || ''),
        freightRate: String(inv.freightRate || ''),
        insuranceRate: String(inv.insuranceRate || ''),
        commission: String(inv.commission || sc?.commission || '0.00'),
        cif: String(inv.cif || ''),
        countryOfFinalDestination: String(inv.countryOfFinalDestination || sc?.countryOfFinalDestination || ''),
      };
      setPreviewData(newData);
    }
  }, [selectedInvoiceNo, invoiceDetailsList, scDetailsList, registerData]);

  useEffect(() => {
    const saved = localStorage.getItem('invoice_template');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBlocks(parsed.blocks || []);
        setTemplateName(parsed.name || 'Falcon Commercial Invoice');
      } catch (e) {
        setBlocks(DEFAULT_BLOCKS);
      }
    } else {
      setBlocks(DEFAULT_BLOCKS);
    }
  }, []);

  const saveTemplate = () => {
    const template: Template = {
      id: 'default',
      name: templateName,
      blocks
    };
    localStorage.setItem('invoice_template', JSON.stringify(template));
    alert('Template saved successfully!');
  };

  const loadTemplate = () => {
    const saved = localStorage.getItem('invoice_template');
    if (saved) {
      const parsed = JSON.parse(saved);
      setBlocks(parsed.blocks || []);
      setTemplateName(parsed.name || 'Falcon Commercial Invoice');
    }
  };

  const addBlock = (type: 'text' | 'table' | 'label' | 'box') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'table' ? 'SR. NO. | DESCRIPTION | QTY | RATE | AMOUNT\n1 | ITEM | 0 | 0 | 0' : (type === 'box' ? '' : `New ${type}`),
      x: 50,
      y: 50,
      width: type === 'table' ? 400 : 200,
      height: type === 'table' ? 150 : (type === 'box' ? 100 : 40),
      fontSize: type === 'box' ? 0 : 14,
      color: '#000000',
      border: type === 'box' ? '1px solid black' : undefined
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const replacePlaceholders = (content: string) => {
    let result = content;
    Object.entries(previewData).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value !== undefined && value !== null ? String(value) : '');
    });
    return result;
  };

  const downloadAsImage = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    const link = document.createElement('a');
    link.download = `${templateName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadAsPDF = async () => {
    if (!canvasRef.current) return;
    const canvas = await html2canvas(canvasRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [CANVAS_WIDTH, CANVAS_HEIGHT]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    pdf.save(`${templateName}.pdf`);
  };

  const exportTemplateJSON = () => {
    const template: Template = {
      id: 'export',
      name: templateName,
      blocks
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.blocks) {
            setBlocks(json.blocks);
            if (json.name) setTemplateName(json.name);
            alert('Template imported successfully!');
          }
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    } else if (file.type.startsWith('image/')) {
      if (!onImportAI) {
        alert('AI Import not configured');
        return;
      }
      
      setIsImporting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const aiBlocks = await onImportAI(base64, file.type);
        if (aiBlocks && aiBlocks.length > 0) {
          setBlocks(aiBlocks);
          alert('AI Template generated successfully! You can now edit the blocks.');
        } else {
          alert('Failed to generate template from image. Please try a clearer image.');
        }
        setIsImporting(false);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderBlockContent = (block: Block) => {
    const content = mode === 'preview' ? replacePlaceholders(block.content) : block.content;
    
    if (block.type === 'table') {
      const rows = content.split('\n');
      return (
        <table className="w-full border-collapse border border-black text-sm h-full">
          <tbody>
            {rows.map((row, i) => {
              if (row.includes('---')) return null;
              const cols = row.split('|');
              return (
                <tr key={i}>
                  {cols.map((col, j) => (
                    <td key={j} className="border border-black p-1 font-bold uppercase text-[10px]">
                      {col.trim()}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    return (
      <div 
        style={{ 
          fontSize: `${block.fontSize}px`, 
          fontWeight: block.fontWeight,
          textAlign: block.textAlign,
          color: block.color,
          backgroundColor: block.backgroundColor,
          border: block.border,
          padding: block.padding ? `${block.padding}px` : undefined
        }}
        className={`w-full h-full overflow-hidden break-words font-bold uppercase flex ${block.textAlign === 'center' ? 'items-center justify-center' : (block.textAlign === 'right' ? 'items-center justify-end' : 'items-start justify-start')}`}
      >
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-black uppercase">Invoice Template Builder</h1>
            <input 
              type="text" 
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-xs font-bold text-slate-500 bg-transparent border-none focus:ring-0 p-0 uppercase"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Invoice</label>
            <select 
              value={selectedInvoiceNo}
              onChange={(e) => setSelectedInvoiceNo(e.target.value)}
              className="bg-slate-100 border-none rounded-xl px-4 py-1.5 text-xs font-black focus:ring-2 focus:ring-slate-900/20"
            >
              <option value="">Choose Invoice...</option>
              {invoiceNoList.map(no => (
                <option key={no} value={no}>{no}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
            <button 
              onClick={() => setMode('design')}
              className={`px-4 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-2 ${mode === 'design' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Edit3 size={14} /> DESIGN
            </button>
            <button 
              onClick={() => setMode('preview')}
              className={`px-4 py-1.5 rounded-md text-xs font-black transition-all flex items-center gap-2 ${mode === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Eye size={14} /> PREVIEW
            </button>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 px-4 ${isImporting ? 'animate-pulse' : ''}`}
              title="Import Template (JSON or Image)"
              disabled={isImporting}
            >
              {isImporting ? <RefreshCcw size={18} className="animate-spin" /> : <FileDown size={18} className="rotate-180" />}
              <span className="text-[10px] font-black uppercase">IMPORT</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileImport} 
              accept=".json,image/*" 
              className="hidden" 
            />
            <button 
              onClick={exportTemplateJSON}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              title="Export Template JSON"
            >
              <FileDown size={18} />
            </button>
            <button 
              onClick={downloadAsImage}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              title="Download as Image"
            >
              <ImageIcon size={18} />
            </button>
            <button 
              onClick={downloadAsPDF}
              className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
              title="Download as PDF"
            >
              <FileDown size={18} />
            </button>
          </div>

          <button 
            onClick={saveTemplate}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Save size={16} /> SAVE TEMPLATE
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {mode === 'design' && (
          <div className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 overflow-y-auto z-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Add Elements</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={() => addBlock('text')}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-sm font-bold group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <Type size={18} className="text-slate-900" />
                  </div>
                  TEXT BLOCK
                </button>
                <button 
                  onClick={() => addBlock('label')}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-sm font-bold group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <Tag size={18} className="text-slate-900" />
                  </div>
                  LABEL BLOCK
                </button>
                <button 
                  onClick={() => addBlock('table')}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-sm font-bold group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <TableIcon size={18} className="text-slate-900" />
                  </div>
                  TABLE BLOCK
                </button>
                <button 
                  onClick={() => addBlock('box')}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-sm font-bold group"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                    <Maximize2 size={18} className="text-slate-900" />
                  </div>
                  BOX / LINE
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Canvas Settings</h3>
              <button 
                onClick={() => setShowGrid(!showGrid)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-sm font-bold ${showGrid ? 'bg-slate-50 border-slate-900 text-slate-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <div className="flex items-center gap-3">
                  <Grid size={18} /> SHOW GRID
                </div>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${showGrid ? 'bg-slate-900' : 'bg-slate-300'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${showGrid ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </button>
            </div>

            {selectedBlockId && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Edit Element</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Content</label>
                    <textarea 
                      value={blocks.find(b => b.id === selectedBlockId)?.content || ''}
                      onChange={(e) => updateBlock(selectedBlockId, { content: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 outline-none min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Bg Color</label>
                      <input 
                        type="color" 
                        value={blocks.find(b => b.id === selectedBlockId)?.backgroundColor || '#ffffff'}
                        onChange={(e) => updateBlock(selectedBlockId, { backgroundColor: e.target.value })}
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-1 py-1 cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Border</label>
                      <input 
                        type="text" 
                        value={blocks.find(b => b.id === selectedBlockId)?.border || ''}
                        onChange={(e) => updateBlock(selectedBlockId, { border: e.target.value })}
                        placeholder="1px solid black"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteBlock(selectedBlockId)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-sm font-black"
                  >
                    <Trash2 size={16} /> DELETE ELEMENT
                  </button>
                </div>
              </div>
            )}

            <div className="mt-auto space-y-2">
              <button 
                onClick={loadTemplate}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all text-xs font-black uppercase tracking-widest"
              >
                <FolderOpen size={16} /> LOAD TEMPLATE
              </button>

              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the template to default? All custom changes will be lost.')) {
                    setBlocks(DEFAULT_BLOCKS);
                    localStorage.removeItem('invoice_template');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all text-xs font-black uppercase tracking-widest"
              >
                <RotateCcw size={16} /> RESET TO DEFAULT
              </button>
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-12 flex justify-center bg-slate-100 custom-scrollbar">
          <div 
            id="invoice-template-canvas"
            ref={canvasRef}
            className="relative bg-white shadow-2xl overflow-hidden"
            style={{ 
              width: `${CANVAS_WIDTH}px`, 
              height: `${CANVAS_HEIGHT}px`,
              backgroundImage: showGrid && mode === 'design' ? 'radial-gradient(#cbd5e1 1px, transparent 0)' : 'none',
              backgroundSize: `${GRID_SIZE * 2}px ${GRID_SIZE * 2}px`,
              backgroundPosition: '-1px -1px'
            }}
          >
            {/* Fixed Background Image Simulation - Removed to make structure editable */}
            <div className="absolute inset-0 z-0 pointer-events-none">
            </div>

            {/* Blocks */}
            {blocks.map((block) => (
              mode === 'design' ? (
                <Rnd
                  key={block.id}
                  size={{ width: block.width, height: block.height }}
                  position={{ x: block.x, y: block.y }}
                  onDragStop={(e, d) => updateBlock(block.id, { x: d.x, y: d.y })}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    updateBlock(block.id, {
                      width: ref.style.width,
                      height: ref.style.height,
                      ...position,
                    });
                  }}
                  dragGrid={[GRID_SIZE, GRID_SIZE]}
                  resizeGrid={[GRID_SIZE, GRID_SIZE]}
                  bounds="parent"
                  className={`z-10 ${selectedBlockId === block.id ? 'ring-2 ring-slate-900' : 'hover:ring-1 hover:ring-slate-300'}`}
                  onClick={() => setSelectedBlockId(block.id)}
                >
                  <div className="w-full h-full bg-white/50 backdrop-blur-[1px] border border-black flex items-center justify-center relative group">
                    {renderBlockContent(block)}
                    <div className="absolute -top-2 -left-2 bg-slate-900 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Move size={10} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 size={10} />
                    </div>
                  </div>
                </Rnd>
              ) : (
                <div
                  key={block.id}
                  style={{
                    position: 'absolute',
                    left: block.x,
                    top: block.y,
                    width: block.width,
                    height: block.height,
                    zIndex: 10
                  }}
                >
                  {renderBlockContent(block)}
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default TemplateBuilder;
