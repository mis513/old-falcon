import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  RefreshCw, Database, ChevronDown, PlusCircle, AlertCircle, X, Settings2, 
  CheckCircle2, FileText, Camera, LayoutGrid, BrainCircuit, ChevronLeft, ChevronRight,
  ClipboardList, User, Users, Zap, Package, CreditCard, Truck, MessageSquare, Save, Info,
  MapPin, Hash, Calendar, Phone, Briefcase, FileCheck, Layers, Check, Link, Settings,
  Globe, Landmark, IndianRupee, Scale, Clock, FileInput, Tag, Trash2, ShieldCheck,
  Ship, MapPinned, ListTodo, ClipboardEdit, Copy, Anchor, Navigation, Waves, SearchCheck,
  Container, Building2, AnchorIcon, MapIcon, ClipboardCheck, Search, DollarSign,
  Coins, ReceiptIndianRupee, Shield, FileSearch, FileDown, Image as ImageIcon, Wand2,
  Percent, ExternalLink, Box, ArrowUp, ArrowDown, Plus, Minus, Menu, FilePlus, Calculator,
  FolderOpen
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PurchaseOrder, LoadingEntry, ColumnDefinition, ColumnKey, SortConfig } from './types';
import LoadingTable from './components/LoadingTable';
import TemplateBuilder from './components/TemplateBuilder';
import InvoicePage from './components/InvoicePage';
import { GeminiService } from './services/geminiService';
import { SpreadsheetService, VendorDetail } from './services/spreadsheetService';

const INITIAL_COLUMNS: ColumnDefinition[] = [
  { key: 'againstInvoice', label: 'AGAINST INVOICE', visible: false },
  { key: 'againstPo', label: 'AGAINST PO', visible: false },
  { key: 'loadingDate', label: 'LOADING DATE', visible: true },
  { key: 'invoiceDate', label: 'INVOICE DATE', visible: false },
  { key: 'invoiceNo', label: 'INVOICE NO.', visible: false },
  { key: 'riceMill', label: 'RICE MILL', visible: false },
  { key: 'item', label: 'ITEM', visible: false },
  { key: 'unit', label: 'UNIT', visible: false },
  { key: 'rate', label: 'RATE', visible: true, align: 'right' },
  { key: 'brand', label: 'BRAND', visible: false },
  { key: 'packing', label: 'PACKING', visible: false },
  { key: 'vhNo', label: 'VH. NO.', visible: true },
  { key: 'cntrNo', label: 'CNTR. NO.', visible: false },
  { key: 'qtyTon', label: 'QTY (IN TON)', visible: true, align: 'right' },
  { key: 'bags', label: 'BAGS', visible: true, align: 'right' },
  { key: 'grossWt', label: 'GROSS WT.', visible: false, align: 'right' },
  { key: 'tareWt', label: 'TARE WT.', visible: false, align: 'right' },
  { key: 'netWt', label: 'NET WT.', visible: false, align: 'right' },
  { key: 'wbSlipPhoto', label: 'WB SLIP PHOTO', visible: false },
  { key: 'transporterName', label: 'TRANSPORTER NAME', visible: false },
  { key: 'freight', label: 'FREIGHT', visible: false, align: 'right' },
  { key: 'amount', label: 'AMOUNT', visible: true, align: 'right' },
  { key: 'bagsWtGrams', label: 'BAGS WT. (IN GRAMS)', visible: false, align: 'right' },
  { key: 'bagsWtDedAmt', label: 'BAGS WT. DED. AMT.', visible: true, align: 'right' },
  { key: 'grossAmt', label: 'GROSS AMT', visible: true, align: 'right' },
  { key: 'tdsAmount', label: 'TDS @ 0.1%', visible: true, align: 'right' },
  { key: 'brokerageRate', label: 'BROKRAGE RS 100/MT', visible: false, align: 'right' },
  { key: 'brokerage', label: 'BROKERAGE AMT.', visible: true, align: 'right' },
  { key: 'cdPercent', label: 'CD %', visible: false, align: 'right' },
  { key: 'cdAmt', label: 'CD AMT.', visible: true, align: 'right' },
  { key: 'otherDed', label: 'OTHER DED.', visible: true },
  { key: 'otherDedAmt', label: 'OTHER DED. AMT.', visible: true, align: 'right' },
  { key: 'netAmt', label: 'NET AMT', visible: true, align: 'right' },
  { key: 'remark', label: 'REMARK', visible: false },
];

const INDIAN_STATES = [
  "ANDHRA PRADESH", "ARUNACHAL PRADESH", "ASSAM", "BIHAR", "CHHATTISGARH", "GOA", "GUJARAT", "HARYANA", "HIMACHAL PRADESH", "JHARKHAND", "KARNATAKA", "KERALA", "MADHYA PRADESH", "MAHARASHTRA", "MANIPUR", "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUNJAB", "RAJASTHAN", "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA", "UTTAR PRADESH", "UTTARAKHAND", "WEST BENGAL", "ANDAMAN AND NICOBAR", "CHANDIGARH", "DADRA AND NAGAR HAVELI", "DELHI", "JAMMU AND KASHMIR", "LADAKH", "LAKSHADWEEP", "PUDUCHERRY"
];

const INDIAN_PORTS = [
  "MUNDRA", "KANDLA", "NHAVA SHEVA (JNPT)", "MUMBAI", "CHENNAI", "VISAKHAPATNAM", 
  "KOLKATA", "HALDIA", "COCHIN", "MORMUGOO", "PARADIP", "PIPAVAV", "KRISHNAPATNAM",
  "ICD TUGHLAKABAD", "ICD LONI", "ICD DADRI", "ICD LUDHIANA", "ICD NAGPUR", "ICD RAIPUR"
];

const INTERNATIONAL_PORTS = [
  "JEBEL ALI, UAE", "SINGAPORE", "SHANGHAI, CHINA", "ROTTERDAM, NETHERLANDS", 
  "COLOMBO, SRI LANKA", "CHITTAGONG, BANGLADESH", "PORT KLANG, MALAYSIA", "BUSAN, SOUTH KOREA",
  "DURBAN, SOUTH AFRICA", "MOMBASA, KENYA", "DAKAR, SENEGAL", "LOME, TOGO", "ANTWERP, BELGIUM", "HAMBURG, GERMANY"
];

const SHIPPING_LINES = [
  "MAERSK LINE", "MSC", "CMA CGM", "HAPAG-LLOYD", "ONE", "EVERGREEN", "COSCO", "ZIM", "WAN HAI", "HMM", "YANG MING"
];

const INITIAL_WHITE_RICE_STATE = {
  purchaseOrderNo: '', againstSc: '', againstInvoice: '', poDate: '', vendorName: '', billingAddress: '', gstin: '', city: '', state: '', pincode: '', contactPersonName: '', contactPersonNumber: '', loadingLocation: '', itemName: '', variety: '', totalQuantityMt: '', packingSize: '', noOfBags: '', bagType: '', bagMarkingBrand: '', anySpecialInstructions: '', specifications: '', ratePerMt: '', totalPoValue: '', freightIncludedExtra: '', advanceAmount: '', paymentTerms: '', broker: '', brokerageRate: '', surveyorAgency: '', deliveryType: '', deliveryLocationAddress: '', loadingInstruction: '', modeOfTransport: '', dispatchSchedule: '', remark: '', inspectionRequired: 'NO',
};

const INITIAL_CHA_FORM_STATE = {
  chaPoNo: '', chaPoDate: '', vendorName: '', againstSc: '', againstInvoice: '', containerBookingNumber: '', shippingLine: '', portOfLoading: '', portOfDispatched: '', portOfArrival: '', vesselSailingDate: '', exportItem: '', variety: '', bagBrand: '', forwarder: '', quantity: '', riceMill: '', stuffingLoading: '', remark: '',
};

const INITIAL_FORWARDER_FORM_STATE = {
  forwarderPo: '', vendorName: '', poDate: '', portOfLoading: '', portOfDispatched: '', portOfArrival: '', qtyCntr: '', vesselSailingDate: '', shippingLine: '', currency: '', ratePerContainer: '', ratePerContainerLabel: 'RATE [CNTR]', ratePerContainerCurrency: '',
  otherRate1: '', otherRate1Label: 'OTHER RATE 1', otherRate1_2: '', otherRate1Currency: '',
  otherRate2: '', otherRate2Label: 'OTHER RATE 2', otherRate2_2: '', otherRate2Currency: '',
  otherRate3: '', otherRate3Label: 'OTHER RATE 3', otherRate3_2: '', otherRate3Currency: '',
  otherRate4: '', otherRate4Label: 'OTHER RATE 4', otherRate4_2: '', otherRate4Currency: '',
};

const INITIAL_INSPECTION_FORM_STATE = {
  inspectionPo: '',
  vendorName: '',
  poDate: '',
  inspectionType: '',
  purchaseOrderNo: '',
  item: '',
  riceMill: '',
  quantity: '',
  itemVendorAddress: '',
  brokerName: '',
  brand: '',
  packing: '',
  remarkAfterPacking: '',
  loadingSchedule: '',
  falconInvoiceReff: '',
  falconInvoice: '',
};

const INITIAL_BAGS_FORM_STATE = {
  bagsPoNo: '',
  poDate: '',
  vendorName: '',
  falconInvReff: '',
  bagMarking: '',
  bagPacking: '',
  bagWt: '',
  bagType: '',
  qty: '',
  noOfBags: '',
  bagMarkingPhoto: '',
  deliveryVendor: '',
  deliveryQty: '',
  deliveryAddress: '',
  remark: '',
};

const INITIAL_BANK_PO_STATE = {
  bankPoNo: '',
  poDate: '',
  vendorName: '',
  againstSc: '',
  againstInvoice: '',
  bankName: '',
  branchName: '',
  accountNo: '',
  ifscCode: '',
  swiftCode: '',
  intermediaryBank: '',
  swiftCodeIntermediary: '',
  remark: '',
};

const INITIAL_ITEM_LOADING_STATE = {
  againstInvoice: '', againstPo: '', loadingDate: '', invoiceDate: '', invoiceNo: '', riceMill: '', item: '', unit: '', rate: '', brand: '', packing: '', 
  loadingRows: [{ 
    loadingDate: '', vhNo: '', cntrNo: '', bags: '', qtyTon: '', grossWt: '', tareWt: '', netWt: '',
    wbSlipPhoto: '', transporterName: '', freight: '', otherDed: '', otherDedAmt: '', remark: ''
  }],
  amount: '', bagsWtGrams: '', bagsWtDedAmt: '', grossAmt: '', tdsAmount: '', brokerageRate: '', cdPercent: '', cdAmt: '', netAmt: '',
};

const INITIAL_VENDOR_FORM_STATE = {
  'SR. NO.': '',
  'VENDOR CATEGORY': '',
  'VENDOR NAME': '',
  'GSTIN': '',
  'EMAIL': '',
  'CONTACT PERSON': '',
  'PHONE NO': '',
  'ADDRESS LINE 1': '',
  'ADDRESS LINE 2': '',
  'LOADING LOCATION': '',
  'CITY': '',
  'PIN CODE': '',
  'STATE': '',
  'CURRENCY': '',
  'BANK': '',
  'BANK BRANCH': '',
  'IFSC': '',
  'AC NO.': '',
  'BANK 2': '',
  'BANK 2 BRANCH': '',
  'BANK 2 IFSC': '',
  'BANK 2 AC. NO.': '',
  'BANK 2 SWIFT': '',
  'REMARKS': ''
};

const INITIAL_PARTIES_FORM_STATE = {
  'SR. NO.': '',
  'NAME': '',
  'LINE 1': '',
  'LINE 2': ''
};

const INITIAL_SALES_CONTRACT_STATE = {
  id: '', salesContractNo: '', contractDate: '', otherReferences: '', buyer: '', consignee: '', firstNotifyParty: '', secondNotifyParty: '', thirdNotifyParty: '', fourthNotifyParty: '', fifthNotifyParty: '', indentor: '', countryOfOrigin: 'INDIA', countryOfFinalDestination: '', finalDestination: '', portOfLoading: '', portOfDischarge: '', descriptionOfGoods: '', brand: '', incoterms: '', contractQty: '', currency: '', ratePerMts: '', hsCode: '', totalContractualValue: '', termsOfPayment: '', emptyBagsWeightGrams: '', packingKgs: '', packingDetails: '', totalShipmentTill: '', ectnTakenBy: '', soldUnsold: '', note4: '',
  specMoisture: '', specDamaged: '', specForeignMatter: '', specBlackTipped: '', specAvgGrainLength: ''
};

const IMGBB_API_KEY = (import.meta as any).env?.VITE_IMGBB_API_KEY || '720b7041fa5d70b7410023a1a9807579';

const uploadImage = async (base64DataUrl: string): Promise<string | null> => {
  try {
    const base64Data = base64DataUrl.split(',')[1];
    if (!base64Data) {
      console.error('Invalid base64 data');
      return null;
    }
    
    // Try ImgBB first
    if (IMGBB_API_KEY && IMGBB_API_KEY !== 'your_api_key') {
      try {
        const form = new FormData();
        form.append('key', IMGBB_API_KEY);
        form.append('image', base64Data);

        const res = await fetch('https://api.imgbb.com/1/upload', {
          method: 'POST',
          body: form
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.data && data.data.url) {
            return data.data.url;
          }
        } else {
          console.error('ImgBB upload failed with status:', res.status, await res.text());
        }
      } catch (e) {
        console.error('ImgBB upload error:', e);
      }
    }

    // Fallback to Cloudinary demo endpoint
    console.log('Falling back to Cloudinary demo endpoint...');
    const cloudinaryForm = new FormData();
    cloudinaryForm.append('upload_preset', 'docs_upload_example_us');
    cloudinaryForm.append('file', base64DataUrl);

    const cloudinaryRes = await fetch('https://api.cloudinary.com/v1_1/demo/image/upload', {
      method: 'POST',
      body: cloudinaryForm
    });

    if (cloudinaryRes.ok) {
      const cloudinaryData = await cloudinaryRes.json();
      if (cloudinaryData && cloudinaryData.secure_url) {
        return cloudinaryData.secure_url;
      }
    } else {
      console.error('Cloudinary upload failed with status:', cloudinaryRes.status, await cloudinaryRes.text());
    }

  } catch (e) {
    console.error('Image upload failed:', e);
  }
  return null;
};

const INITIAL_INVOICE_FORM_STATE = {
  againstSc: '',
  // Sales Contract Reference Fields (Read-only in UI)
  contractDate: '', otherReferences: '', buyer: '', consignee: '', firstNotifyParty: '', secondNotifyParty: '', thirdNotifyParty: '', fourthNotifyParty: '', fifthNotifyParty: '', indentor: '', countryOfOrigin: 'INDIA', countryOfFinalDestination: '', finalDestination: '', portOfLoading: '', portOfDischarge: '', descriptionOfGoods: '', brand: '', incoterms: '', contractQty: '', currency: '', ratePerMts: '', hsCode: '', totalContractualValue: '', termsOfPayment: '', emptyBagsWeightGrams: '', packingKgs: '', packingDetails: '', totalShipmentTill: '', ectnTakenBy: '', soldUnsold: '', note4: '',
  // Invoice Fields
  invoiceNo: '',
  invoiceDate: '',
  preCarriageBy: '',
  preCarrier: '',
  netWtMt: '',
  fclBreakBulk: '',
  totalBags: '',
  fobRate: '',
  freightRate: '',
  insuranceRate: '',
  cif: '',
  cifCheck: '',
  invoiceAmt: '',
  shippingLine: '',
  pol: '',
  cutOffPol: '',
  pod: '',
  vesselEtd: '',
  sbNo: '',
  sbDate: '',
  portCode: '',
  rodtepAmt: '',
  sbForexRate: '',
  blNo: '',
  vesselVoyageNo: '',
  poa: '',
  vesselEta: '',
  remark: '',
  scriptCompleted: '',
  invRate: '',
  invQty: ''
};

const geminiService = new GeminiService();

const App: React.FC = () => {
  const [activePage, setActivePage] = useState(6);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [loadingEntries, setLoadingEntries] = useState<LoadingEntry[]>([]);
  const [columns, setColumns] = useState<ColumnDefinition[]>(INITIAL_COLUMNS);
  const [hiddenRowIds, setHiddenRowIds] = useState<Set<string>>(new Set());
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [selectedSavedInvoice, setSelectedSavedInvoice] = useState<any | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPoDropdown, setShowPoDropdown] = useState(false);
  const [showSalesDropdown, setShowSalesDropdown] = useState(false);
  const [showPdfDropdown, setShowPdfDropdown] = useState(false);
  
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (activePage === 6 || activePage === 10) {
      SpreadsheetService.fetchRegister().then(setRegisterData);
    }
  }, [activePage]);

  const [scContractList, setScContractList] = useState<string[]>([]);
  const [scDetailsList, setScDetailsList] = useState<any[]>([]);
  const [invoiceNoList, setInvoiceNoList] = useState<string[]>([]);
  const [invoiceDetailsList, setInvoiceDetailsList] = useState<any[]>([]);
  const [ricePoNumbersList, setRicePoNumbersList] = useState<string[]>([]);
  const [ricePoDetailsList, setRicePoDetailsList] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<VendorDetail[]>([]);
  const [itemNamesList, setItemNamesList] = useState<string[]>([]);
  const [brandsList, setBrandsList] = useState<string[]>([]);
  const [deliveryTypesList, setDeliveryTypesList] = useState<string[]>([]);
  const [specificationsList, setSpecificationsList] = useState<string[]>([]);
  const [modesOfTransportList, setModesOfTransportList] = useState<string[]>([]);
  const [bagTypesList, setBagTypesList] = useState<string[]>([]);
  const [paymentTermsList, setPaymentTermsList] = useState<string[]>([]);
  const [brokersList, setBrokersList] = useState<string[]>([]);
  const [varietyList, setVarietyList] = useState<string[]>([]);
  const [portOfDischargeList, setPortOfDischargeList] = useState<string[]>([]);
  const [portOfLoadingList, setPortOfLoadingList] = useState<string[]>([]);
  const [portOfArrivalList, setPortOfArrivalList] = useState<string[]>([]);
  const [shippingLineList, setShippingLineList] = useState<string[]>([]);
  const [packingSizeList, setPackingSizeList] = useState<string[]>([]);
  const [currencyList, setCurrencyList] = useState<string[]>([]);
  const [hsCodeList, setHsCodeList] = useState<string[]>([]);
  const [emptyBagsWeightList, setEmptyBagsWeightList] = useState<string[]>([]);
  const [bagsPoNumbersList, setBagsPoNumbersList] = useState<string[]>([]);
  const [bagsPoDetailsList, setBagsPoDetailsList] = useState<any[]>([]);
  const [commodityWeights, setCommodityWeights] = useState<{ commodity: string, weight: string }[]>([]);
  const [partiesList, setPartiesList] = useState<string[]>([]);
  const [countryList, setCountryList] = useState<string[]>(["INDIA", "USA", "UAE", "UK", "CHINA", "SINGAPORE", "MALAYSIA", "SAUDI ARABIA", "OMAN", "KUWAIT", "QATAR", "VIETNAM", "THAILAND"]);
  
  const [dataCategories, setDataCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_categories');
    const defaultCats = [
      'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
      'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
      'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
    ];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return [...defaultCats, ...parsed.filter((c: string) => !defaultCats.includes(c))];
      } catch (e) {
        return defaultCats;
      }
    }
    return defaultCats;
  });
  const [customCategoryData, setCustomCategoryData] = useState<Record<string, string[]>>({});

  const [activeDataCategory, setActiveDataCategory] = useState<string>('VENDOR DETAILS');
  const [newDataValue, setNewDataValue] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  useEffect(() => {
    const defaultCats = [
      'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
      'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
      'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
    ];
    const customCats = dataCategories.filter(c => !defaultCats.includes(c));
    localStorage.setItem('custom_categories', JSON.stringify(customCats));
  }, [dataCategories]);

  useEffect(() => {
    const defaultCats = [
      'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
      'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
      'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
    ];
    if (!defaultCats.includes(activeDataCategory)) {
      SpreadsheetService.fetchDataColumn(activeDataCategory).then(data => {
        setCustomCategoryData(prev => ({ ...prev, [activeDataCategory]: data }));
      });
    }
  }, [activeDataCategory]);

  const [formData, setFormData] = useState(INITIAL_WHITE_RICE_STATE);
  const [chaFormData, setChaFormData] = useState(INITIAL_CHA_FORM_STATE);
  const [forwarderFormData, setForwarderFormData] = useState(INITIAL_FORWARDER_FORM_STATE);
  const [inspectionFormData, setInspectionFormData] = useState<any>(INITIAL_INSPECTION_FORM_STATE);
  const [bagsFormData, setBagsFormData] = useState<any>(INITIAL_BAGS_FORM_STATE);
  const [itemLoadingFormData, setItemLoadingFormData] = useState<any>(INITIAL_ITEM_LOADING_STATE);
  const [vendorFormData, setVendorFormData] = useState<any>(INITIAL_VENDOR_FORM_STATE);
  const [partiesFormData, setPartiesFormData] = useState<any>(INITIAL_PARTIES_FORM_STATE);
  const [invoiceFormData, setInvoiceFormData] = useState<any>(INITIAL_INVOICE_FORM_STATE);
  const [salesFormData, setSalesFormData] = useState(INITIAL_SALES_CONTRACT_STATE);
  const [bankFormData, setBankFormData] = useState<any>(INITIAL_BANK_PO_STATE);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCustomOptions, setUserCustomOptions] = useState<Record<string, string[]>>({});
  const [openMultiSelect, setOpenMultiSelect] = useState<string | null>(null);
  const [openSingleSelect, setOpenSingleSelect] = useState<string | null>(null);
  const [selectSearchQuery, setSelectSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [logoBase64, setLogoBase64] = useState<string>('');
  const [registerData, setRegisterData] = useState<any[]>([]);
  const [selectedSalesContract, setSelectedSalesContract] = useState<any | null>(null);

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      setLogoBase64(canvas.toDataURL('image/png'));
    };
    img.src = '/logo.png';
  }, []);

  const handleClearAllRegister = useCallback(async () => {
    if (!confirm('Are you sure you want to delete ALL records from the register? This action cannot be undone.')) return;
    
    setIsSyncing(true);
    try {
      const originalData = [...registerData];
      // 1. Immediate UI update
      setRegisterData([]);
      localStorage.setItem('po_register', '[]');

      // 2. Sequential deletion with confirmation
      // We use a for...of loop to ensure we wait for each request to finish
      for (const entry of originalData) {
        try {
          await SpreadsheetService.deleteFromRegister(entry.id, entry.type);
          // Small delay to prevent hitting Google's rate limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (e) {
          console.warn(`Failed to delete entry ${entry.id}, skipping...`);
        }
      }
      
      // 3. Extended wait for Google Sheets to settle (4 seconds instead of 2)
      // Google Sheets is eventually consistent; it needs time to reflect deletions in the API
      setTimeout(async () => {
        const updated = await SpreadsheetService.fetchRegister();
        // Ensure we don't accidentally restore old data if fetch fails or returns stale data
        if (updated && updated.length > 0 && originalData.length > 0) {
          // Double check if any of the "deleted" IDs are still there
          const deletedIds = new Set(originalData.map(d => d.id));
          const trulyNewData = updated.filter(item => !deletedIds.has(item.id));
          setRegisterData(trulyNewData);
          localStorage.setItem('po_register', JSON.stringify(trulyNewData));
        } else {
          setRegisterData(updated || []);
        }
        setIsSyncing(false);
        alert('All records have been cleared from the register.');
      }, 4000);
      
    } catch (err) {
      console.error('Clear all failed:', err);
      alert('An error occurred while clearing the register. Please refresh and try again.');
      setIsSyncing(false);
      SpreadsheetService.fetchRegister().then(setRegisterData);
    }
  }, [registerData]);

  // Load saved invoices from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('falcon_saved_invoices');
    if (saved) {
      try {
        setSavedInvoices(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved invoices', e);
      }
    }
  }, []);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('falcon_saved_invoices', JSON.stringify(savedInvoices));
  }, [savedInvoices]);

  const handleSaveInvoice = (invoiceData: any) => {
    const newInvoice = {
      ...invoiceData,
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString()
    };
    setSavedInvoices(prev => [newInvoice, ...prev]);
    setActivePage(13); // Redirect to parent page
  };

  const handleDeleteSavedInvoice = (id: string) => {
    setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const handleRemoteSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const [data, scList, scDetails, invList, invDetails, ricePoList, ricePoDetails, venList, itemList, brandList, delTypeList, specList, transportList, bagList, payList, brkList, varList, pDischarge, pLoading, pArrival, sLines, pSizes, currList, hsList, pList, regData, customCats, emptyBagsList, weights, bagsPoDetails] = await Promise.all([
        SpreadsheetService.fetchRemoteData(), SpreadsheetService.fetchContractNumbers(), SpreadsheetService.fetchSalesContractDetails(), SpreadsheetService.fetchInvoiceNumbers(), SpreadsheetService.fetchInvoiceDetails(), SpreadsheetService.fetchRicePoNumbers(), SpreadsheetService.fetchRicePoDetails(), SpreadsheetService.fetchVendorList(), SpreadsheetService.fetchItemNames(), SpreadsheetService.fetchBrands(), SpreadsheetService.fetchDeliveryTypes(), SpreadsheetService.fetchSpecifications(), SpreadsheetService.fetchModesOfTransport(), SpreadsheetService.fetchBagTypes(), SpreadsheetService.fetchPaymentTerms(), SpreadsheetService.fetchBrokers(), SpreadsheetService.fetchVarieties(), SpreadsheetService.fetchPortsOfDischarge(), SpreadsheetService.fetchPortsOfLoading(), SpreadsheetService.fetchPortsOfArrival(), SpreadsheetService.fetchShippingLines(), SpreadsheetService.fetchPackingSizes(), SpreadsheetService.fetchCurrencies(), SpreadsheetService.fetchHsCodes(), SpreadsheetService.fetchPartiesMasterList(), SpreadsheetService.fetchRegister(), SpreadsheetService.fetchCustomCategories(), SpreadsheetService.fetchDataColumn('EMPTY BAGS WEIGHT (IN GRAMS)'), SpreadsheetService.fetchCommodityWeights(), SpreadsheetService.fetchBagsPoDetails()
      ]);
      setLoadingEntries(data);
      const pos = SpreadsheetService.derivePurchaseOrders(data, regData);
      setPurchaseOrders(pos);
      
      setSelectedPoId(curr => {
        if (pos.length > 0 && !curr) return pos[0].id;
        return curr;
      });

      const ricePoFromReg = Array.from(new Set(regData.filter((r: any) => r.type === 'RICE PO').map((r: any) => String(r.purchaseOrderNo)).filter(Boolean))) as string[];
      const combinedRicePoList = Array.from(new Set([...ricePoList, ...ricePoFromReg])).sort();
      
      const scFromReg = Array.from(new Set(regData.filter((r: any) => r.type === 'SALES CONTRACT' && r.salesContractNo).map((r: any) => String(r.salesContractNo)).filter(Boolean))) as string[];
      const combinedScList = Array.from(new Set([...scList, ...scFromReg])).sort();
      
      const invFromReg = Array.from(new Set(regData.filter((r: any) => r.type === 'INVOICE' && r.invoiceNo).map((r: any) => String(r.invoiceNo)).filter(Boolean))) as string[];
      const combinedInvList = Array.from(new Set([...invList, ...invFromReg])).sort();

      const bagsPoFromSheet = Array.from(new Set(bagsPoDetails.map((r: any) => {
        const poCol = Object.keys(r).find(k => k.toLowerCase().includes('po no') || k.toLowerCase().includes('bags po no'));
        return poCol ? String(r[poCol] || '').trim() : '';
      }).filter(Boolean))) as string[];
      const bagsPoFromReg = Array.from(new Set(regData.filter((r: any) => r.type === 'BAGS PO' && r.bagsPoNo).map((r: any) => String(r.bagsPoNo)).filter(Boolean))) as string[];
      const combinedBagsPoList = Array.from(new Set([...bagsPoFromSheet, ...bagsPoFromReg])).sort();
      
      setScContractList(combinedScList); setScDetailsList(scDetails); setInvoiceNoList(combinedInvList); setInvoiceDetailsList(invDetails); setRicePoNumbersList(combinedRicePoList); setRicePoDetailsList(ricePoDetails); setVendorsList(venList); setItemNamesList(itemList); setBrandsList(brandList); setDeliveryTypesList(delTypeList); setSpecificationsList(specList); setModesOfTransportList(transportList); setBagTypesList(bagList); setPaymentTermsList(payList); setBrokersList(brkList);
      setVarietyList(varList); setPortOfDischargeList(pDischarge); setPortOfLoadingList(pLoading); setPortOfArrivalList(pArrival); setShippingLineList(sLines); setPackingSizeList(pSizes); setCurrencyList(currList); setHsCodeList(hsList); setPartiesList(pList); setEmptyBagsWeightList(emptyBagsList); setCommodityWeights(weights);
      setBagsPoNumbersList(combinedBagsPoList);
      setBagsPoDetailsList(bagsPoDetails);
      setRegisterData(regData);
      
      if (customCats && customCats.length > 0) {
        setDataCategories(prev => {
          const defaultCats = [
            'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
            'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
            'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
          ];
          const combined = [...new Set([...defaultCats, ...prev.filter(c => !defaultCats.includes(c)), ...customCats])];
          return combined;
        });
      }
      
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Sync failed:', err);
    } finally { 
      setIsSyncing(false); 
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => { 
    handleRemoteSync(); 
    const interval = setInterval(handleRemoteSync, 60000);
    return () => clearInterval(interval);
  }, [handleRemoteSync]);

  const selectedPo = useMemo(() => purchaseOrders.find(po => po.id === selectedPoId) || purchaseOrders[0], [selectedPoId, purchaseOrders]);

  const toggleColumn = useCallback((key: ColumnKey) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  }, []);

  const moveColumn = useCallback((index: number, direction: 'up' | 'down') => {
    setColumns(prev => {
      const newCols = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newCols.length) return prev;
      [newCols[index], newCols[targetIndex]] = [newCols[targetIndex], newCols[index]];
      return newCols;
    });
  }, []);

  const handleInputChange = useCallback((field: any, value: string, form: 'main' | 'cha' | 'forwarder' | 'inspection' | 'vendor' | 'itemLoading' | 'sales' | 'parties' | 'invoice' | 'bags' = 'main') => {
    if (form === 'main') {
      setFormData(prev => {
        const next = { ...prev, [field]: value };
        if (field === 'totalQuantityMt' || field === 'ratePerMt') {
          const qty = parseFloat(next.totalQuantityMt) || 0;
          const rate = parseFloat(next.ratePerMt) || 0;
          next.totalPoValue = (qty * rate).toFixed(2);
        }
        if (field === 'totalQuantityMt' || field === 'packingSize') {
          const qty = parseFloat(next.totalQuantityMt) || 0;
          const pack = parseFloat(next.packingSize) || 0;
          if (pack > 0) next.noOfBags = Math.ceil((qty * 1000) / pack).toString();
        }
        return next;
      });
    }
    else if (form === 'cha') setChaFormData(p => ({ ...p, [field]: value }));
    else if (form === 'forwarder') setForwarderFormData(p => ({ ...p, [field]: value }));
    else if (form === 'inspection') setInspectionFormData((p: any) => ({ ...p, [field]: value }));
    else if (form === 'bags') {
      setBagsFormData((prev: any) => {
        let next = { ...prev, [field]: value };

        if (field === 'bagsPoNo' && value) {
          const findInList = (list: any[]) => list.find(r => {
            const poCol = Object.keys(r).find(k => k.toLowerCase().includes('po no') || k.toLowerCase().includes('bags po no'));
            const poVal = poCol ? String(r[poCol] || '').trim() : '';
            return poVal.toUpperCase() === value.trim().toUpperCase();
          });

          const entry = findInList(bagsPoDetailsList) || findInList(registerData.filter(r => r.type === 'BAGS PO'));
          
          if (entry) {
            const getVal = (keys: string[]) => {
              for (const k of keys) {
                const foundKey = Object.keys(entry).find(ek => ek.toLowerCase().trim() === k.toLowerCase().trim() || ek.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
                if (foundKey) return String(entry[foundKey] || '').trim();
              }
              return '';
            };

            next.poDate = getVal(['poDate', 'PO DATE', 'DATE']);
            next.vendorName = getVal(['vendorName', 'VENDOR NAME', 'VENDOR']);
            next.falconInvReff = getVal(['falconInvReff', 'FALCON INV REFF', 'FALCON INV']);
            next.bagMarking = getVal(['bagMarking', 'BAG MARKING', 'MARKING']);
            next.bagPacking = getVal(['bagPacking', 'BAG PACKING', 'PACKING']);
            next.bagWt = getVal(['bagWt', 'BAG WT', 'WEIGHT']);
            next.bagType = getVal(['bagType', 'BAG TYPE', 'TYPE']);
            next.qty = getVal(['qty', 'QTY', 'QUANTITY']);
            next.noOfBags = getVal(['noOfBags', 'NO OF BAGS', 'BAGS']);
            next.bagMarkingPhoto = getVal(['bagMarkingPhoto', 'BAG MARKING PHOTO', 'PHOTO']);
            next.deliveryVendor = getVal(['deliveryVendor', 'DELIVERY VENDOR', 'DELIVERY ADDRESS dropdown']);
            next.deliveryQty = getVal(['deliveryQty', 'DELIVERY QTY']);
            next.deliveryAddress = getVal(['deliveryAddress', 'DELIVERY ADDRESS']);
            next.remark = getVal(['remark', 'REMARK']);
          }
        }

        if (field === 'qty' || field === 'bagPacking' || field === 'bagsPoNo') {
          const qty = parseFloat(next.qty) || 0;
          const packing = parseFloat(next.bagPacking) || 0;
          if (packing > 0) {
            next.noOfBags = Math.ceil((qty * 1000) / packing).toString();
          } else {
            next.noOfBags = '0';
          }
        }
        // Update deliveryAddress based on deliveryVendor
        if (field === 'deliveryVendor' || field === 'bagsPoNo') {
          const pairs = (next.deliveryVendor || '').split(', ').filter(Boolean).map((item: string) => {
            const match = item.match(/^(.*) \((.*)\)$/);
            if (match) return { name: match[1], qty: match[2] };
            return { name: item, qty: '' };
          });
          
          if (pairs.length > 0) {
            const lines = pairs.map(p => {
              const vendor = vendorsList.find(v => v.name === p.name);
              const addrParts = [
                vendor?.addressLine1,
                vendor?.addressLine2,
                vendor?.city,
                vendor?.pincode,
                vendor?.state
              ].filter(Boolean).map(s => String(s).trim()).filter(Boolean).join(' ');
              return `${p.name}${p.qty ? ` (${p.qty})` : ''}\n${addrParts}`;
            });
            next.deliveryAddress = lines.join('\n\n');
          } else {
            next.deliveryAddress = '';
          }
        }
        return next;
      });
    }
    else if (form === 'vendor') setVendorFormData((p: any) => ({ ...p, [field]: value }));
    else if (form === 'parties') setPartiesFormData((p: any) => ({ ...p, [field]: value }));
    else if (form === 'invoice') {
      setInvoiceFormData((prev: any) => {
        let next = { ...prev, [field]: value };
        
        const populateFromSc = (scNo: string, state: any) => {
          if (!scNo) return state;
          const savedSc = registerData.find(r => r.type === 'SALES CONTRACT' && String(r.salesContractNo || '').trim().toUpperCase() === scNo.trim().toUpperCase());
          const sc = scDetailsList.find(item => {
            const scNoKey = Object.keys(item).find(k => {
              const normalized = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              return ['SALESCONTRACTNO', 'CONTRACTNOSC', 'SCNO', 'CONTRACTNO', 'SALESCONTRACT', 'CONTRACT', 'SALESCONTRACTNUMBER', 'SCNUMBER', 'CONTRACTNO'].includes(normalized);
            });
            const scNoVal = scNoKey ? String(item[scNoKey] || '').trim() : '';
            return scNoVal.toUpperCase() === scNo.trim().toUpperCase();
          });

          if (savedSc || sc) {
            const getVal = (keys: string[]) => {
              const normalizedSearchKeys = keys.map(k => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''));
              const checkRecord = (record: any) => {
                if (!record) return '';
                for (const searchKey of normalizedSearchKeys) {
                  const foundKey = Object.keys(record).find(k => {
                    const normalizedK = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                    return normalizedK === searchKey || normalizedK.includes(searchKey) || searchKey.includes(normalizedK);
                  });
                  if (foundKey) {
                    const val = String(record[foundKey] || '').trim();
                    if (val && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'undefined' && val !== '-') return val;
                  }
                }
                return '';
              };
              let val = checkRecord(savedSc);
              if (!val) val = checkRecord(sc);
              return val;
            };

            state.contractDate = getVal(['CONTRACT DATE', 'DATE', 'SC DATE', 'SALES CONTRACT DATE', 'CONTRACT DT', 'CONTRACT DT.', 'CONTRACT DATE.', 'SC DATE.', 'DATE OF CONTRACT', 'SC DT']);
            state.otherReferences = getVal(['OTHER REFERENCE(S)', 'OTHER REFERENCES', 'OTHER REFS', 'REFS', 'REFERENCE', 'OTHER REF', 'OTHER REF.', 'OTHER REFERENCE', 'REF', 'REF.']);
            state.buyer = getVal(['BUYER', 'BUYER NAME', 'CUSTOMER', 'CLIENT', 'PARTY', 'PARTY NAME', 'BUYER NAME.', 'CUSTOMER NAME', 'CLIENT NAME', "BUYER'S NAME"]);
            state.consignee = getVal(['CONSIGNEE', 'CONSIGNEE NAME', 'RECEIVER', 'SHIP TO', 'SHIP TO NAME', 'CONSIGNEE NAME.', 'RECEIVER NAME', "CONSIGNEE'S NAME"]);
            state.firstNotifyParty = getVal(['1ST NOTIFY PARTY', '1ST NOTIFY', 'NOTIFY PARTY 1', 'NOTIFY 1', 'NOTIFY PARTY', 'NOTIFY', '1ST NOTIFY NAME', 'NOTIFY 1 NAME', 'NOTIFY PARTY 1 NAME']);
            state.secondNotifyParty = getVal(['2ND NOTIFY PARTY', '2ND NOTIFY', 'NOTIFY PARTY 2', 'NOTIFY 2', '2ND NOTIFY NAME', 'NOTIFY 2 NAME', 'NOTIFY PARTY 2 NAME']);
            state.thirdNotifyParty = getVal(['3RD NOTIFY PARTY', '3RD NOTIFY', 'NOTIFY PARTY 3', 'NOTIFY 3', '3RD NOTIFY NAME', 'NOTIFY 3 NAME', 'NOTIFY PARTY 3 NAME']);
            state.fourthNotifyParty = getVal(['4TH NOTIFY PARTY', '4TH NOTIFY', 'NOTIFY PARTY 4', 'NOTIFY 4', '4TH NOTIFY NAME', 'NOTIFY 4 NAME', 'NOTIFY PARTY 4 NAME']);
            state.fifthNotifyParty = getVal(['5TH NOTIFY PARTY', '5TH NOTIFY', 'NOTIFY PARTY 5', 'NOTIFY 5', '5TH NOTIFY NAME', 'NOTIFY 5 NAME', 'NOTIFY PARTY 5 NAME']);
            state.indentor = getVal(['INDENTOR', 'INDENTOR NAME', 'AGENT', 'BROKER', 'INDENTOR NAME.', 'AGENT NAME', 'BROKER NAME']);
            state.countryOfOrigin = getVal(['COUNTRY OF ORIGIN OF GOODS', 'COUNTRY OF ORIGIN', 'ORIGIN', 'ORIGIN COUNTRY', 'COUNTRY', 'ORIGIN OF GOODS', 'COUNTRY OF ORIGIN.']) || 'INDIA';
            state.countryOfFinalDestination = getVal(['COUNTRY OF FINAL DESTINATION', 'FINAL DEST COUNTRY', 'DESTINATION COUNTRY', 'DEST COUNTRY', 'FINAL DESTINATION COUNTRY', 'COUNTRY OF FINAL DESTINATION.']);
            state.finalDestination = getVal(['FINAL DESTINATION', 'DESTINATION', 'FINAL DEST', 'DEST', 'PLACE OF DELIVERY', 'FINAL DESTINATION.', 'DESTINATION NAME', 'PLACE OF FINAL DELIVERY']);
            state.portOfLoading = getVal(['PORT OF LOADING', 'POL', 'PORT OF LOADING (POL)', 'LOADING PORT', 'PORT OF LOAD', 'PORT', 'LOADING', 'LOAD PORT', 'LOAD PORT NAME', 'LOADING PORT NAME', 'PORT OF LOADING NAME', 'SHIPMENT PORT', 'PORT OF SHIPMENT', 'POL NAME', 'LOADING_PORT', 'PORT_OF_LOADING', 'PORT OF LOADING.']);
            state.portOfDischarge = getVal(['PORT OF DISCHARGE', 'POD', 'PORT OF DISCHARGE (POD)', 'DISCHARGE PORT', 'DISCHARGE', 'DISCHARGE PORT NAME', 'PORT OF DISCHARGE NAME', 'POD NAME', 'DISCHARGE_PORT', 'PORT_OF_DISCHARGE', 'PORT OF DISCHARGE.']);
            state.descriptionOfGoods = getVal(['DESCRIPTION OF GOODS', 'GOODS DESC', 'ITEM DESCRIPTION', 'DESCRIPTION', 'GOODS', 'ITEM', 'COMMODITY', 'GOODS DESCRIPTION', 'DESCRIPTION OF GOODS.']);
            state.brand = getVal(['BRAND', 'MARKING', 'BRAND NAME', 'MARKS', 'BRANDING', 'MARKS & NOS', 'BRAND NAME.']);
            state.incoterms = getVal(['INCOTERMS', 'INCOTERM', 'TERMS', 'INCO TERMS', 'DELIVERY TERMS', 'TERMS OF DELIVERY', 'INCOTERMS.']);
            state.contractQty = getVal(['CONTRACT QTY.', 'CONTRACT QTY', 'QUANTITY', 'QTY', 'CONTRACT QUANTITY', 'TOTAL QTY', 'NET WT', 'NET WEIGHT', 'CONTRACT QTY.']);
            state.currency = getVal(['CURRENCY', 'CURR', 'SYMBOL', 'CUR', 'CURR.', 'CURRENCY NAME']);
            state.ratePerMts = getVal(['RATE/MTS', 'RATE PER MTS', 'RATE', 'RATE/MT', 'PRICE', 'UNIT PRICE', 'UNIT RATE', 'RATE PER MT', 'RATE/MTS.']);
            state.hsCode = getVal(['HS CODE', 'HSCODE', 'HS_CODE', 'ITC HS', 'HS', 'H.S. CODE', 'HS CODE.']);
            state.totalContractualValue = getVal(['TOTAL CONTRACTUAL VALUE', 'TOTAL VALUE', 'VALUE', 'CONTRACT VALUE', 'TOTAL AMT', 'AMOUNT', 'TOTAL AMOUNT', 'TOTAL CONTRACTUAL VALUE.']);
            state.termsOfPayment = getVal(['TERMS OF PAYMENT', 'PAYMENT TERMS', 'PAYMENT', 'PAYMENT METHOD', 'PAYMENT CONDITION', 'PAYMENT TERMS & CONDITIONS', 'TERMS OF PAYMENT.']);
            state.totalShipmentTill = getVal(['TOTAL SHIPMENT TILL', 'SHIPMENT TILL', 'LATEST SHIPMENT DATE', 'SHIPMENT DATE', 'TOTAL SHIPMENT', 'LATEST SHIPMENT', 'SHIPMENT TILL DATE', 'SHIPMENT TILL DATE.', 'TOTAL SHIPMENT TILL.']);
            state.emptyBagsWeightGrams = getVal(['EMPTY BAGS WEIGHT (IN GRAMS)', 'EMPTY BAGS WEIGHT (GRAMS)', 'EMPTY BAGS WT', 'BAG WT', 'EMPTY BAGS WEIGHT', 'EMPTY BAG WT', 'BAG WEIGHT', 'EMPTY BAG WT GRAMS', 'EMPTY BAGS WT.', 'EMPTY BAGS WEIGHT (IN GRAMS).']);
            state.packingKgs = getVal(['PACKING (IN KGS)', 'PACKING KGS', 'PACKING (KGS)', 'PACKING KG', 'PACKING IN KGS', 'PACKING IN KG', 'PACKING WT', 'PACKING WEIGHT', 'PACKING SIZE', 'PACKING SIZE (KGS)', 'PACKING SIZE (KG)', 'PACKING', 'BAG SIZE', 'PACKING KGS.', 'PACKING (IN KGS.)']);
            state.packingDetails = getVal(['PACKING DETAILS', 'PACKING', 'PACKING DETAIL', 'PACKING TYPE', 'BAG TYPE', 'PACKING DESC', 'PACKING DETAILS.', 'PACKING DETAIL.']);
            state.ectnTakenBy = getVal(['ECTN HAS TO BE TAKEN BY', 'ECTN TAKEN BY', 'ECTN BY', 'ECTN TAKEN', 'ECTN', 'ECTN BY.', 'ECTN TAKEN BY.']);
            state.soldUnsold = getVal(['SOLD / UNSOLD', 'SOLD/UNSOLD', 'STATUS', 'SALE STATUS', 'SOLD', 'SOLD STATUS', 'SOLD / UNSOLD.']);
            state.note4 = getVal(['NOTE 4', 'NOTES', 'REMARK', 'REMARKS', 'NOTE', 'COMMENTS', 'REMARKS.', 'NOTE 4.']);

            // Editable fields
            state.pod = getVal(['PORT OF DISCHARGE', 'POD', 'DISCHARGE PORT', 'PORT OF DISCHARGE (POD)', 'POD NAME', 'DISCHARGE_PORT']) || state.portOfDischarge;
            state.pol = getVal(['PORT OF LOADING', 'POL', 'LOADING PORT', 'PORT OF LOADING (POL)', 'POL NAME', 'LOADING_PORT']) || state.portOfLoading;
            state.preCarriageBy = getVal(['PRE-CARRIAGE BY', 'PRE CARRIAGE', 'PRE-CARRIAGE', 'PRE CARRIAGE BY']);
            state.preCarrier = getVal(['PRE-CARRIER', 'PRE CARRIER NAME', 'PRE CARRIER']);
            state.netWtMt = getVal(['NET WT', 'NET WEIGHT', 'QUANTITY', 'NET WT. (IN MT)']) || state.contractQty;
            state.invQty = getVal(['INV QTY', 'INVOICE QTY', 'QUANTITY', 'INV. QTY']) || state.contractQty;
            state.invRate = getVal(['INV RATE', 'INVOICE RATE', 'RATE', 'INV. RATE']) || state.ratePerMts;
            state.fobRate = getVal(['FOB RATE', 'FOB', 'FOB (RATES/MTS)', 'FOB RATE MT', 'FOB (RATES/M)']);
            state.freightRate = getVal(['FREIGHT RATE', 'FREIGHT', 'FREIGHT (RATES/MTS)', 'FREIGHT RATE MT', 'FREIGHT (RATE)']);
            state.insuranceRate = getVal(['INSURANCE RATE', 'INSURANCE', 'INSURANCE (RATES/MTS)', 'INSURANCE RATE MT', 'INSURANCE (RATE)']);
            state.cif = getVal(['CIF', 'CIF RATE', 'CIF VALUE', 'CIF AMT']);
            state.shippingLine = getVal(['SHIPPING LINE', 'LINE', 'CARRIER', 'SHIPPING LINE NAME']);
            state.vesselEtd = getVal(['VESSEL ETD', 'ETD', 'ETD DATE', 'VESSEL ETD.']);
            state.vesselEta = getVal(['VESSEL ETA', 'ETA', 'ETA DATE', 'VESSEL ETA.']);
            state.vesselVoyageNo = getVal(['VESSEL/VOYAG NO', 'VESSEL', 'VOYAGE', 'VESSEL NAME', 'VESSEL VOYAGE NO', 'VESSEL / VOYAGE']);
            state.sbNo = getVal(['SB NO.', 'SB NO', 'SB', 'SHIPPING BILL NO', 'SB NUMBER']);
            state.sbDate = getVal(['SB DATE', 'SB DATE.', 'SHIPPING BILL DATE', 'SB DATE']);
            state.blNo = getVal(['BL NO.', 'BL NO', 'BL', 'BILL OF LADING NO', 'BL NUMBER']);

            const inv_qty = parseFloat(state.invQty) || parseFloat(state.contractQty) || 0;
            const pkg = parseFloat(state.packingKgs) || 0;
            if (inv_qty > 0 && pkg > 0) {
              state.totalBags = Math.ceil((inv_qty * 1000) / pkg).toString();
            }

            if (!state.totalContractualValue) {
              const q = parseFloat(state.contractQty) || 0;
              const r = parseFloat(state.ratePerMts) || 0;
              if (q > 0 && r > 0) state.totalContractualValue = (q * r).toFixed(2);
            }

            if (!state.invoiceAmt) {
              const q = parseFloat(state.invQty) || parseFloat(state.contractQty) || 0;
              const r = parseFloat(state.invRate) || parseFloat(state.ratePerMts) || 0;
              if (q > 0 && r > 0) state.invoiceAmt = (q * r).toFixed(2);
            }
          }
          return state;
        };

        if (field === 'invoiceNo' && value) {
          // Reset to initial state when switching invoices to prevent stale data persistence
          next = { ...INITIAL_INVOICE_FORM_STATE, invoiceNo: value };
          const savedInv = registerData.find(r => r.type === 'INVOICE' && String(r.invoiceNo || '').trim().toUpperCase() === value.trim().toUpperCase());
          const inv = invoiceDetailsList.find(item => {
            const invNoKey = Object.keys(item).find(k => {
              const nk = k.toLowerCase();
              return nk.includes('invoice no') || nk.includes('inv no') || nk.includes('invoice #') || nk.includes('invoiceno') || nk === 'invoice';
            });
            const invNo = invNoKey ? String(item[invNoKey] || '').trim() : '';
            return invNo.toUpperCase() === value.trim().toUpperCase();
          });

          if (savedInv || inv) {
            const getVal = (keys: string[]) => {
              const normalizedSearchKeys = keys.map(k => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''));
              const checkRecord = (record: any) => {
                if (!record) return '';
                for (const searchKey of normalizedSearchKeys) {
                  const foundKey = Object.keys(record).find(k => {
                    const normalizedK = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                    return normalizedK === searchKey || normalizedK.includes(searchKey) || searchKey.includes(normalizedK);
                  });
                  if (foundKey) {
                    const val = String(record[foundKey] || '').trim();
                    if (val && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'undefined' && val !== '-') return val;
                  }
                }
                return '';
              };
              let val = checkRecord(savedInv);
              if (!val) val = checkRecord(inv);
              return val;
            };

            const scNo = getVal(['SALES CONTR/ INVOICE NO.', 'AGAINST SC', 'SC NO', 'CONTRACT NO', 'SALES CONTRACT NO', 'SALES CONTRACT NO.', 'SC NO.', 'CONTRACT NO.', 'SALES CONTRACT NUMBER', 'SC NUMBER', 'CONTRACT']);
            if (scNo) {
              next.againstSc = scNo;
              next = populateFromSc(scNo, next);
            }

            // Now overwrite with Invoice specific data
            next.invoiceDate = getVal(['INVOICE DT.', 'INVOICE DATE', 'DATE', 'INV DATE', 'INV DT', 'INV. DATE', 'INV. DT.', 'INVOICE DT', 'DATE OF INVOICE', 'INVOICE DT.']);
            next.preCarriageBy = getVal(['PRE-CARRIAGE', 'PRE-CARRIAGE BY', 'PRE CARRIAGE BY', 'PRE CARRIAGE', 'PRE-CARRIAGE BY.', 'PRE CARRIAGE BY.', 'PRE-CARRIAGE BY']);
            next.preCarrier = getVal(['PRE-CARRIER', 'PRE CARRIER NAME', 'PRE CARRIER', 'PRE-CARRIER.', 'PRE CARRIER.', 'PRE CARRIER']);
            next.shippingLine = getVal(['SHIPPING L', 'SHIPPING LINE', 'LINE', 'SHIPPING LINE NAME', 'CARRIER', 'SHIPPING LINE.', 'SHIPPING LINE']);
            next.fclBreakBulk = getVal(['HOW MUCH FC', 'FCL/BREAK BULK', 'FCL', 'BREAK BULK', 'FCL / BREAK BULK', 'FCL / BREAK BULK.', 'HOW MUCH FCL']);
            next.pol = getVal(['PORT OF LOADING (POL)', 'POL', 'PORT OF LOADING', 'LOADING PORT', 'PORT OF LOAD', 'POL NAME', 'PORT OF LOADING (POL)']);
            next.cutOffPol = getVal(['CUT OFF POL', 'CUT OFF', 'CUT-OFF POL', 'CUT-OFF', 'CUT OFF DATE', 'CUT OFF POL']);
            next.pod = getVal(['PORT OF DISPATCHED(POD)', 'POD', 'PORT OF DISPATCHED', 'PORT OF DISCHARGE', 'DISCHARGE PORT', 'PORT OF DISCHARGE (POD)', 'POD NAME', 'PORT OF DISPATCHED (POD)']);
            next.poa = getVal(['(POA) PORT OF ARRIVAL', 'POA', 'PORT OF ARRIVAL', 'ARRIVAL PORT', 'PORT OF ARRIVAL (POA)', 'POA NAME', '(POA) PORT OF ARRIVAL']);
            next.netWtMt = getVal(['NET WT. (IN MT)', 'NET WT', 'NET WT MTS', 'NET WEIGHT', 'NET WT.', 'NET WT MT', 'NET WT (MT)', 'NET WT. (IN MTS)', 'NET WT. (IN MT)']);
            next.totalBags = getVal(['TOTAL BAGS (I', 'TOTAL BAGS', 'BAGS', 'TOTAL NO OF BAGS', 'NO OF BAGS', 'TOTAL BAGS.', 'TOTAL BAGS (I)']);
            next.invQty = getVal(['INV QTY', 'INVOICE QTY', 'QUANTITY', 'QTY', 'INV. QTY', 'INV. QUANTITY', 'INV QTY']);
            next.invRate = getVal(['INV RATE', 'INVOICE RATE', 'RATE', 'INV. RATE', 'INV. PRICE', 'PRICE', 'INV RATE']);
            next.fobRate = getVal(['FOB (RATES/M)', 'FOB RATE', 'FOB', 'FOB (RATES/MTS)', 'FOB (RATE/MT)', 'FOB RATE MT', 'FOB (RATES/MTS.)', 'FOB (RATES/M)']);
            next.freightRate = getVal(['FREIGHT (RATE', 'FREIGHT RATE', 'FREIGHT', 'FREIGHT (RATES/MTS)', 'FREIGHT RATE MT', 'FREIGHT (RATES/MTS.)', 'FREIGHT (RATE)']);
            next.insuranceRate = getVal(['INSURANCE (R', 'INSURANCE RATE', 'INSURANCE', 'INSURANCE (RATES/MTS)', 'INSURANCE RATE MT', 'INSURANCE (RATES/MTS.)', 'INSURANCE (RATE)']);
            next.cif = getVal(['CIF', 'CIF RATE', 'CIF (RATES/MTS)', 'CIF VALUE', 'CIF AMT', 'CIF (RATES/MTS.)', 'CIF']);
            next.cifCheck = getVal(['CIF Check', 'CIF CHECK', 'CIF CHECK']);
            next.invoiceAmt = getVal(['INVOICE AMT', 'INV AMT', 'TOTAL INVOICE VALUE', 'INVOICE AMOUNT', 'AMOUNT', 'INV. AMT', 'INV. AMOUNT', 'TOTAL VALUE', 'TOTAL AMOUNT', 'INVOICE AMT']);
            next.sbNo = getVal(['SB NO.', 'SB NO', 'SB NUMBER', 'SHIPPING BILL NO', 'SB', 'S/B NO', 'S/B NO.', 'SHIPPING BILL NO.', 'SB NO.']);
            next.sbDate = getVal(['SB DATE', 'SB DATE.', 'SHIPPING BILL DATE', 'S/B DATE', 'S/B DATE.', 'SHIPPING BILL DATE.', 'SB DATE']);
            next.blNo = getVal(['BL NO.', 'BL NO', 'BILL OF LADING NO', 'BL NUMBER', 'BL', 'B/L NO', 'B/L NO.', 'BILL OF LADING NO.', 'BL NO.']);
            next.vesselVoyageNo = getVal(['VESSEL/VOYAG NO', 'VESSEL VOYAGE NO', 'VESSEL', 'VOYAGE', 'VESSEL NAME', 'VOYAGE NO', 'VESSEL / VOYAGE', 'VESSEL/VOYAG NO']);
            next.vesselEta = getVal(['VESSEL/ETA', 'VESSEL ETA', 'ETA', 'VESSEL ETA.', 'ETA DATE', 'ETA.', 'VESSEL/ETA']);
            next.vesselEtd = getVal(['VESSEL ETD', 'ETD', 'VESSEL ETD.', 'ETD DATE', 'ETD.', 'VESSEL ETD']);
            next.portCode = getVal(['PORT CODE', 'PORT CODE NO', 'PORT CODE.', 'PORT CODE']);
            next.rodtepAmt = getVal(['RODTEP AMT', 'RODTEP', 'RODTEP AMOUNT', 'RODTEP AMT']);
            next.sbForexRate = getVal(['SB.FOREX RATE', 'SB FOREX RATE', 'FOREX RATE', 'SB FOREX', 'SB.FOREX RATE']);
            next.scriptCompleted = getVal(['SCRIPT COMPLETED', 'SCRIPT', 'SCRIPT COMPLETED']);
            next.remark = getVal(['REMARK', 'REMARKS', 'NOTE', 'NOTES', 'COMMENTS', 'REMARKS.', 'REMARK']);

            // Also populate SC Reference fields from Invoice record if available (overwriting SC data)
            next.contractDate = getVal(['CONTRACT DATE', 'SC DATE', 'CONTRACT DT', 'DATE', 'CONTRACT DATE.', 'CONTRACT DATE']) || next.contractDate;
            next.buyer = getVal(['BUYER', 'BUYER NAME', 'CUSTOMER', 'CLIENT', 'PARTY', 'BUYER']) || next.buyer;
            next.consignee = getVal(['CONSIGNEE', 'CONSIGNEE NAME', 'RECEIVER', 'SHIP TO', 'CONSIGNEE']) || next.consignee;
            next.contractQty = getVal(['CONTRACT QTY', 'QUANTITY', 'QTY', 'CONTRACT QUANTITY', 'CONTRACT QTY.', 'CONTRACT QTY']) || next.contractQty;
            next.currency = getVal(['CURRENCY', 'CURR', 'SYMBOL', 'CURR.', 'CURRENCY']) || next.currency;
            next.ratePerMts = getVal(['RATE/MTS', 'RATE PER MTS', 'RATE', 'PRICE', 'RATE/MT', 'RATE/MTS']) || next.ratePerMts;
            next.totalContractualValue = getVal(['TOTAL CONTRACTUAL VALUE', 'TOTAL VALUE', 'VALUE', 'AMOUNT', 'TOTAL AMT', 'TOTAL CONTRACTUAL VALUE']) || next.totalContractualValue;
            next.finalDestination = getVal(['FINAL DESTINATION', 'DESTINATION', 'DEST', 'FINAL DEST', 'FINAL DESTINATION']) || next.finalDestination;
            next.portOfLoading = getVal(['PORT OF LOADING', 'POL', 'LOADING PORT', 'POL NAME', 'PORT OF LOADING']) || next.portOfLoading;
            next.portOfDischarge = getVal(['PORT OF DISCHARGE', 'POD', 'DISCHARGE PORT', 'POD NAME', 'PORT OF DISCHARGE']) || next.portOfDischarge;
            next.descriptionOfGoods = getVal(['DESCRIPTION OF GOODS', 'GOODS DESC', 'DESCRIPTION', 'GOODS', 'DESCRIPTION OF GOODS']) || next.descriptionOfGoods;
            next.brand = getVal(['BRAND', 'BRAND NAME', 'MARKS', 'BRAND']) || next.brand;
            next.incoterms = getVal(['INCOTERMS', 'INCOTERM', 'TERMS', 'INCOTERMS']) || next.incoterms;
            next.hsCode = getVal(['HS CODE', 'HSCODE', 'HS', 'H.S. CODE', 'HS CODE']) || next.hsCode;
            next.termsOfPayment = getVal(['TERMS OF PAYMENT', 'PAYMENT TERMS', 'PAYMENT', 'TERMS OF PAYMENT']) || next.termsOfPayment;
            next.totalShipmentTill = getVal(['TOTAL SHIPMENT TILL', 'SHIPMENT TILL', 'SHIPMENT DATE', 'LATEST SHIPMENT DATE', 'TOTAL SHIPMENT TILL']) || next.totalShipmentTill;
            next.packingDetails = getVal(['PACKING DETAILS', 'PACKING TYPE', 'BAG TYPE', 'PACKING DESC', 'PACKING DETAILS']) || next.packingDetails;
            next.packingKgs = getVal(['PACKING KGS', 'PACKING KG', 'BAG SIZE', 'PACKING KGS.', 'PACKING KGS']) || next.packingKgs;
            next.emptyBagsWeightGrams = getVal(['EMPTY BAGS WT', 'BAG WT', 'EMPTY BAGS WEIGHT', 'EMPTY BAGS WT.', 'EMPTY BAGS WT']) || next.emptyBagsWeightGrams;
            next.countryOfOrigin = getVal(['COUNTRY OF ORIGIN', 'ORIGIN', 'ORIGIN COUNTRY', 'COUNTRY OF ORIGIN']);
            next.countryOfFinalDestination = getVal(['COUNTRY OF FINAL DESTINATION', 'DESTINATION COUNTRY', 'FINAL DEST COUNTRY', 'COUNTRY OF FINAL DESTINATION']);
            next.indentor = getVal(['INDENTOR', 'AGENT', 'BROKER', 'INDENTOR']);
            next.firstNotifyParty = getVal(['1ST NOTIFY PARTY', 'NOTIFY 1', 'NOTIFY PARTY', '1ST NOTIFY PARTY']);
            next.secondNotifyParty = getVal(['2ND NOTIFY PARTY', 'NOTIFY 2', '2ND NOTIFY PARTY']);
            next.thirdNotifyParty = getVal(['3RD NOTIFY PARTY', 'NOTIFY 3', '3RD NOTIFY PARTY']);
            next.fourthNotifyParty = getVal(['4TH NOTIFY PARTY', 'NOTIFY 4', '4TH NOTIFY PARTY']);
            next.fifthNotifyParty = getVal(['5TH NOTIFY PARTY', 'NOTIFY 5', '5TH NOTIFY PARTY']);
            next.otherReferences = getVal(['OTHER REFERENCES', 'REFS', 'REFERENCE', 'OTHER REF', 'OTHER REFERENCES']);
            next.ectnTakenBy = getVal(['ECTN BY', 'ECTN TAKEN BY', 'ECTN BY']);
            next.soldUnsold = getVal(['SOLD/UNSOLD', 'STATUS', 'SOLD', 'SOLD/UNSOLD']);
            next.note4 = getVal(['NOTE 4', 'REMARK', 'NOTES', 'NOTE 4']);
          }
        } else if (field === 'againstSc') {
          if (value) {
            next = populateFromSc(value, next);
          } else {
            // Clear SC reference fields if SC No is cleared
            const scFields = ['contractDate', 'otherReferences', 'buyer', 'consignee', 'firstNotifyParty', 'secondNotifyParty', 'thirdNotifyParty', 'fourthNotifyParty', 'fifthNotifyParty', 'indentor', 'countryOfOrigin', 'countryOfFinalDestination', 'finalDestination', 'portOfLoading', 'portOfDischarge', 'descriptionOfGoods', 'brand', 'incoterms', 'contractQty', 'currency', 'ratePerMts', 'hsCode', 'totalContractualValue', 'termsOfPayment', 'emptyBagsWeightGrams', 'packingKgs', 'packingDetails', 'totalShipmentTill', 'ectnTakenBy', 'soldUnsold', 'note4'];
            scFields.forEach(f => next[f] = INITIAL_INVOICE_FORM_STATE[f as keyof typeof INITIAL_INVOICE_FORM_STATE]);
          }
        }
        return next;
      });
    }
    else if (form === 'sales') {
      setSalesFormData(prev => {
        let next = { ...prev, [field]: value };
        
        if (field === 'salesContractNo') {
          if (value) {
            // Reset to initial state when switching SCs to prevent stale data persistence
            next = { ...INITIAL_SALES_CONTRACT_STATE, salesContractNo: value };
          const savedSc = registerData.find(r => r.type === 'SALES CONTRACT' && String(r.salesContractNo || '').trim().toUpperCase() === value.trim().toUpperCase());
          const sc = scDetailsList.find(item => {
            const scNoKey = Object.keys(item).find(k => {
              const normalized = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              return ['SALESCONTRACTNO', 'CONTRACTNOSC', 'SCNO', 'CONTRACTNO', 'SALESCONTRACT', 'CONTRACT', 'SALESCONTRACTNUMBER', 'SCNUMBER', 'SALESCONTRACTNO'].includes(normalized);
            });
            const scNo = scNoKey ? String(item[scNoKey] || '').trim() : '';
            return scNo.toUpperCase() === value.trim().toUpperCase();
          });
          
          if (savedSc || sc) {
            const getVal = (keys: string[]) => {
              const normalizedSearchKeys = keys.map(k => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''));
              
              const checkRecord = (record: any) => {
                if (!record) return '';
                // Try to find the first non-empty value among all matching keys
                for (const searchKey of normalizedSearchKeys) {
                  const foundKey = Object.keys(record).find(k => {
                    const normalizedK = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                    return normalizedK === searchKey || normalizedK.includes(searchKey) || searchKey.includes(normalizedK);
                  });
                  if (foundKey) {
                    const val = String(record[foundKey] || '').trim();
                    if (val && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'undefined' && val !== '-') return val;
                  }
                }
                return '';
              };

              let val = checkRecord(savedSc);
              if (!val) val = checkRecord(sc);
              return val;
            };
            
            next.id = (savedSc && savedSc.id) || (sc && sc.id) || next.id;
            next.contractDate = getVal(['CONTRACT DATE', 'DATE', 'SC DATE', 'SALES CONTRACT DATE', 'CONTRACT DT', 'CONTRACT DT.', 'CONTRACT DATE.', 'SC DATE.', 'DATE OF CONTRACT']);
            next.otherReferences = getVal(['OTHER REFERENCE(S)', 'OTHER REFERENCES', 'OTHER REFS', 'REFS', 'REFERENCE', 'OTHER REF', 'OTHER REF.', 'OTHER REFERENCE', 'REF', 'REF.']);
            next.buyer = getVal(['BUYER', 'BUYER NAME', 'CUSTOMER', 'CLIENT', 'PARTY', 'PARTY NAME', 'BUYER NAME.', 'CUSTOMER NAME', 'CLIENT NAME']);
            next.consignee = getVal(['CONSIGNEE', 'CONSIGNEE NAME', 'RECEIVER', 'SHIP TO', 'SHIP TO NAME', 'CONSIGNEE NAME.', 'RECEIVER NAME']);
            next.firstNotifyParty = getVal(['1ST NOTIFY PARTY', '1ST NOTIFY', 'NOTIFY PARTY 1', 'NOTIFY 1', 'NOTIFY PARTY', 'NOTIFY', '1ST NOTIFY NAME', 'NOTIFY 1 NAME']);
            next.secondNotifyParty = getVal(['2ND NOTIFY PARTY', '2ND NOTIFY', 'NOTIFY PARTY 2', 'NOTIFY 2', '2ND NOTIFY NAME', 'NOTIFY 2 NAME']);
            next.thirdNotifyParty = getVal(['3RD NOTIFY PARTY', '3RD NOTIFY', 'NOTIFY PARTY 3', 'NOTIFY 3', '3RD NOTIFY NAME', 'NOTIFY 3 NAME']);
            next.fourthNotifyParty = getVal(['4TH NOTIFY PARTY', '4TH NOTIFY', 'NOTIFY PARTY 4', 'NOTIFY 4', '4TH NOTIFY NAME', 'NOTIFY 4 NAME']);
            next.fifthNotifyParty = getVal(['5TH NOTIFY PARTY', '5TH NOTIFY', 'NOTIFY PARTY 5', 'NOTIFY 5', '5TH NOTIFY NAME', 'NOTIFY 5 NAME']);
            next.indentor = getVal(['INDENTOR', 'INDENTOR NAME', 'AGENT', 'BROKER', 'INDENTOR NAME.', 'AGENT NAME', 'BROKER NAME']);
            next.countryOfOrigin = getVal(['COUNTRY OF ORIGIN OF GOODS', 'COUNTRY OF ORIGIN', 'ORIGIN', 'ORIGIN COUNTRY', 'COUNTRY', 'ORIGIN OF GOODS', 'COUNTRY OF ORIGIN.']) || 'INDIA';
            next.countryOfFinalDestination = getVal(['COUNTRY OF FINAL DESTINATION', 'FINAL DEST COUNTRY', 'DESTINATION COUNTRY', 'DEST COUNTRY', 'FINAL DESTINATION COUNTRY', 'COUNTRY OF FINAL DESTINATION.']);
            next.finalDestination = getVal(['FINAL DESTINATION', 'DESTINATION', 'FINAL DEST', 'DEST', 'PLACE OF DELIVERY', 'FINAL DESTINATION.', 'DESTINATION NAME']);
            next.portOfLoading = getVal(['PORT OF LOADING', 'POL', 'PORT OF LOADING (POL)', 'LOADING PORT', 'PORT OF LOAD', 'PORT', 'LOADING', 'LOAD PORT', 'LOAD PORT NAME', 'LOADING PORT NAME', 'PORT OF LOADING NAME', 'SHIPMENT PORT', 'PORT OF SHIPMENT', 'POL NAME', 'LOADING_PORT', 'PORT_OF_LOADING', 'PORT OF LOADING.']);
            next.portOfDischarge = getVal(['PORT OF DISCHARGE', 'POD', 'PORT OF DISCHARGE (POD)', 'DISCHARGE PORT', 'DISCHARGE', 'DISCHARGE PORT NAME', 'PORT OF DISCHARGE NAME', 'POD NAME', 'DISCHARGE_PORT', 'PORT_OF_DISCHARGE', 'PORT OF DISCHARGE.']);
            next.descriptionOfGoods = getVal(['DESCRIPTION OF GOODS', 'GOODS DESC', 'ITEM DESCRIPTION', 'DESCRIPTION', 'GOODS', 'ITEM', 'COMMODITY', 'GOODS DESCRIPTION', 'DESCRIPTION OF GOODS.']);
            next.brand = getVal(['BRAND', 'MARKING', 'BRAND NAME', 'MARKS', 'BRANDING', 'MARKS & NOS', 'BRAND NAME.']);
            next.incoterms = getVal(['INCOTERMS', 'INCOTERM', 'TERMS', 'INCO TERMS', 'DELIVERY TERMS', 'TERMS OF DELIVERY', 'INCOTERMS.']);
            next.contractQty = getVal(['CONTRACT QTY.', 'CONTRACT QTY', 'QUANTITY', 'QTY', 'CONTRACT QUANTITY', 'TOTAL QTY', 'NET WT', 'NET WEIGHT', 'CONTRACT QTY.']);
            next.currency = getVal(['CURRENCY', 'CURR', 'SYMBOL', 'CUR', 'CURR.', 'CURRENCY NAME']);
            next.ratePerMts = getVal(['RATE/MTS', 'RATE PER MTS', 'RATE', 'RATE/MT', 'PRICE', 'UNIT PRICE', 'UNIT RATE', 'RATE PER MT', 'RATE/MTS.']);
            next.hsCode = getVal(['HS CODE', 'HSCODE', 'HS_CODE', 'ITC HS', 'HS', 'H.S. CODE', 'HS CODE.']);
            next.totalContractualValue = getVal(['TOTAL CONTRACTUAL VALUE', 'TOTAL VALUE', 'VALUE', 'CONTRACT VALUE', 'TOTAL AMT', 'AMOUNT', 'TOTAL AMOUNT', 'TOTAL CONTRACTUAL VALUE.']);
            next.termsOfPayment = getVal(['TERMS OF PAYMENT', 'PAYMENT TERMS', 'PAYMENT', 'PAYMENT METHOD', 'PAYMENT CONDITION', 'PAYMENT TERMS & CONDITIONS', 'TERMS OF PAYMENT.']);
            next.emptyBagsWeightGrams = getVal(['EMPTY BAGS WEIGHT (IN GRAMS)', 'EMPTY BAGS WEIGHT (GRAMS)', 'EMPTY BAGS WT', 'BAG WT', 'EMPTY BAGS WEIGHT', 'EMPTY BAG WT', 'BAG WEIGHT', 'EMPTY BAG WT GRAMS', 'EMPTY BAGS WT.', 'EMPTY BAGS WEIGHT (IN GRAMS).']);
            next.packingKgs = getVal(['PACKING (IN KGS)', 'PACKING KGS', 'PACKING (KGS)', 'PACKING KG', 'PACKING IN KGS', 'PACKING IN KG', 'PACKING WT', 'PACKING WEIGHT', 'PACKING SIZE', 'PACKING SIZE (KGS)', 'PACKING SIZE (KG)', 'PACKING', 'BAG SIZE', 'PACKING KGS.', 'PACKING (IN KGS.)']);
            next.packingDetails = getVal(['PACKING DETAILS', 'PACKING', 'PACKING DETAIL', 'PACKING TYPE', 'BAG TYPE', 'PACKING DESC', 'PACKING DETAILS.', 'PACKING DETAIL.']);
            next.totalShipmentTill = getVal(['TOTAL SHIPMENT TILL', 'SHIPMENT TILL', 'LATEST SHIPMENT DATE', 'SHIPMENT DATE', 'TOTAL SHIPMENT', 'LATEST SHIPMENT', 'SHIPMENT TILL DATE', 'SHIPMENT TILL DATE.', 'TOTAL SHIPMENT TILL.']);
            next.ectnTakenBy = getVal(['ECTN HAS TO BE TAKEN BY', 'ECTN TAKEN BY', 'ECTN BY', 'ECTN TAKEN', 'ECTN', 'ECTN BY.', 'ECTN TAKEN BY.']);
            next.soldUnsold = getVal(['SOLD / UNSOLD', 'SOLD/UNSOLD', 'STATUS', 'SALE STATUS', 'SOLD', 'SOLD STATUS', 'SOLD / UNSOLD.']);
            next.note4 = getVal(['NOTE 4', 'NOTES', 'REMARK', 'REMARKS', 'NOTE', 'COMMENTS', 'REMARKS.', 'NOTE 4.']);

            // Editable fields
            next.pod = getVal(['PORT OF DISCHARGE', 'POD', 'DISCHARGE PORT', 'PORT OF DISCHARGE (POD)', 'POD NAME', 'DISCHARGE_PORT']) || next.portOfDischarge;
            next.pol = getVal(['PORT OF LOADING', 'POL', 'LOADING PORT', 'PORT OF LOADING (POL)', 'POL NAME', 'LOADING_PORT']) || next.portOfLoading;
            next.preCarriageBy = getVal(['PRE-CARRIAGE BY', 'PRE CARRIAGE', 'PRE-CARRIAGE', 'PRE CARRIAGE BY']);
            next.preCarrier = getVal(['PRE-CARRIER', 'PRE CARRIER NAME', 'PRE CARRIER']);
            next.netWtMt = getVal(['NET WT', 'NET WEIGHT', 'QUANTITY', 'NET WT. (IN MT)']) || next.contractQty;
            next.invQty = getVal(['INV QTY', 'INVOICE QTY', 'QUANTITY', 'INV. QTY']) || next.contractQty;
            next.invRate = getVal(['INV RATE', 'INVOICE RATE', 'RATE', 'INV. RATE']) || next.ratePerMts;
            next.fobRate = getVal(['FOB RATE', 'FOB', 'FOB (RATES/MTS)', 'FOB RATE MT', 'FOB (RATES/M)']);
            next.freightRate = getVal(['FREIGHT RATE', 'FREIGHT', 'FREIGHT (RATES/MTS)', 'FREIGHT RATE MT', 'FREIGHT (RATE)']);
            next.insuranceRate = getVal(['INSURANCE RATE', 'INSURANCE', 'INSURANCE (RATES/MTS)', 'INSURANCE RATE MT', 'INSURANCE (RATE)']);
            next.cif = getVal(['CIF', 'CIF RATE', 'CIF VALUE', 'CIF AMT']);
            next.shippingLine = getVal(['SHIPPING LINE', 'LINE', 'CARRIER', 'SHIPPING LINE NAME']);
            next.vesselEtd = getVal(['VESSEL ETD', 'ETD', 'ETD DATE', 'VESSEL ETD.']);
            next.vesselEta = getVal(['VESSEL ETA', 'ETA', 'ETA DATE', 'VESSEL ETA.']);
            next.vesselVoyageNo = getVal(['VESSEL/VOYAG NO', 'VESSEL', 'VOYAGE', 'VESSEL NAME', 'VESSEL VOYAGE NO', 'VESSEL / VOYAGE']);
            next.sbNo = getVal(['SB NO.', 'SB NO', 'SB', 'SHIPPING BILL NO', 'SB NUMBER']);
            next.sbDate = getVal(['SB DATE', 'SB DATE.', 'SHIPPING BILL DATE', 'SB DATE']);
            next.blNo = getVal(['BL NO.', 'BL NO', 'BL', 'BILL OF LADING NO', 'BL NUMBER']);

            const inv_qty = parseFloat(next.invQty) || parseFloat(next.contractQty) || 0;
            const pkg = parseFloat(next.packingKgs) || 0;
            if (inv_qty > 0 && pkg > 0) {
              next.totalBags = Math.ceil((inv_qty * 1000) / pkg).toString();
            }

            if (!next.totalContractualValue) {
              const q = parseFloat(next.contractQty) || 0;
              const r = parseFloat(next.ratePerMts) || 0;
              if (q > 0 && r > 0) next.totalContractualValue = (q * r).toFixed(2);
            }

            if (!next.invoiceAmt) {
              const q = parseFloat(next.invQty) || parseFloat(next.contractQty) || 0;
              const r = parseFloat(next.invRate) || parseFloat(next.ratePerMts) || 0;
              if (q > 0 && r > 0) next.invoiceAmt = (q * r).toFixed(2);
            }
          }
        } else {
          next = { ...INITIAL_SALES_CONTRACT_STATE };
        }
      }

        if (field === 'descriptionOfGoods' && value) {
          // Auto-populate empty bags weight from data bank mapping
          const mapping = commodityWeights.find(w => w.commodity === value);
          if (mapping) {
            next.emptyBagsWeightGrams = mapping.weight;
          }
        }

        if (field === 'contractQty' || field === 'ratePerMts') {
          const qty = parseFloat(next.contractQty) || 0;
          const rate = parseFloat(next.ratePerMts) || 0;
          next.totalContractualValue = (qty * rate).toFixed(2);
        }
        return next;
      });
    }
    else if (form === 'itemLoading') {
      if (typeof field === 'object' && field.rowIdx !== undefined) {
        setItemLoadingFormData((p: any) => {
          const rows = [...(p.loadingRows || [])];
          rows[field.rowIdx] = { ...rows[field.rowIdx], [field.id]: value };
          
          if (['qtyTon', 'bags', 'grossWt', 'tareWt', 'otherDedAmt'].includes(field.id)) {
            const qty = parseFloat(field.id === 'qtyTon' ? value : rows[field.rowIdx].qtyTon) || 0;
            const rate = parseFloat(p.rate) || 0;
            const packing = parseFloat(p.packing) || 0;
            const bagsWtGrams = parseFloat(p.bagsWtGrams) || 0;
            const cdPercent = parseFloat(p.cdPercent) || 0;
            const brokerageRate = parseFloat(p.brokerageRate) || 0;
            const otherDedAmt = parseFloat(field.id === 'otherDedAmt' ? value : rows[field.rowIdx].otherDedAmt) || 0;
            
            const amount = qty * rate;
            rows[field.rowIdx].amount = amount.toFixed(2);
            
            let bagsNum = 0;
            if (field.id === 'qtyTon') {
              if (packing > 0) {
                bagsNum = Math.ceil((qty * 1000) / packing);
                rows[field.rowIdx].bags = bagsNum.toString();
              } else {
                rows[field.rowIdx].bags = '0';
              }
            } else if (field.id === 'bags') {
              bagsNum = parseFloat(value) || 0;
              // value is already set in rows[field.rowIdx] at the top of this block
            } else {
              bagsNum = parseFloat(rows[field.rowIdx].bags) || 0;
            }
            
            const bagsWtDedAmt = (((bagsWtGrams / 1000) * bagsNum) / 1000) * rate;
            rows[field.rowIdx].bagsWtDedAmt = bagsWtDedAmt.toFixed(2);
            const grossAmt = amount - bagsWtDedAmt;
            rows[field.rowIdx].grossAmt = grossAmt.toFixed(2);
            
            const tdsAmount = amount * 0.001;
            rows[field.rowIdx].tdsAmount = tdsAmount.toFixed(2);
            
            const cdAmt = amount * (cdPercent / 100);
            rows[field.rowIdx].cdAmt = cdAmt.toFixed(2);
            
            const brokerageAmt = qty * brokerageRate;
            rows[field.rowIdx].brokerage = brokerageAmt.toFixed(2);
            
            const netAmt = grossAmt + tdsAmount - brokerageAmt - otherDedAmt - cdAmt;
            rows[field.rowIdx].netAmt = netAmt.toFixed(2);
            
            const grossWt = parseFloat(field.id === 'grossWt' ? value : rows[field.rowIdx].grossWt) || 0;
            const tareWt = parseFloat(field.id === 'tareWt' ? value : rows[field.rowIdx].tareWt) || 0;
            const netWt = grossWt - tareWt;
            rows[field.rowIdx].netWt = netWt.toFixed(2);
          }
          
          return { ...p, loadingRows: rows };
        });
      } else {
        setItemLoadingFormData((p: any) => {
          const next = { ...p, [field]: value };
          if (['rate', 'packing', 'bagsWtGrams', 'cdPercent', 'brokerageRate'].includes(field)) {
            const rate = parseFloat(next.rate) || 0;
            const packing = parseFloat(next.packing) || 0;
            const bagsWtGrams = parseFloat(next.bagsWtGrams) || 0;
            const cdPercent = parseFloat(next.cdPercent) || 0;
            const brokerageRate = parseFloat(next.brokerageRate) || 0;
            
            next.loadingRows = (next.loadingRows || []).map((row: any) => {
              const qty = parseFloat(row.qtyTon) || 0;
              let bags = row.bags;
              let bagsNum = parseFloat(bags) || 0;
              if (field === 'packing') {
                bagsNum = packing > 0 ? Math.ceil((qty * 1000) / packing) : 0;
                bags = bagsNum.toString();
              }
              const amount = qty * rate;
              const bagsWtDedAmt = (((bagsWtGrams / 1000) * bagsNum) / 1000) * rate;
              const grossAmt = amount - bagsWtDedAmt;
              
              const tdsAmount = amount * 0.001;
              const cdAmt = amount * (cdPercent / 100);
              
              const brokerageAmt = qty * brokerageRate;
              const otherDedAmt = parseFloat(row.otherDedAmt) || 0;
              const netAmt = grossAmt + tdsAmount - brokerageAmt - otherDedAmt - cdAmt;
              
              return { 
                ...row, 
                amount: amount.toFixed(2), 
                bags, 
                bagsWtDedAmt: bagsWtDedAmt.toFixed(2), 
                grossAmt: grossAmt.toFixed(2),
                tdsAmount: tdsAmount.toFixed(2),
                cdAmt: cdAmt.toFixed(2),
                brokerage: brokerageAmt.toFixed(2),
                netAmt: netAmt.toFixed(2)
              };
            });
          }
          return next;
        });
      }
    }
  }, [scDetailsList]);

  const captureCloneModifications = (clonedDoc: Document) => {
    if (activePage === 12) return; // Skip modifications for TemplateBuilder as it's already styled
    
    const activeId = activePage === 1 ? 'dashboard-content' : 
                     activePage === 2 ? 'rice-po-pdf-template' :
                     activePage === 3 ? 'cha-pdf-template' :
                     activePage === 4 ? 'forwarder-pdf-template' :
                     activePage === 5 ? 'inspection-pdf-template' :
                     activePage === 7 ? 'sales-contract-pdf-template' :
                     activePage === 11 ? 'bags-pdf-template' :
                     activePage === 12 ? 'invoice-template-canvas' :
                     'item-loading-export';
    
    const el = clonedDoc.getElementById(activeId);
    if (el) {
      // Ensure the entire clone document can expand but stays tight
      if (clonedDoc.documentElement) {
        if ([2, 3, 4, 5, 7, 11].includes(activePage)) {
          clonedDoc.documentElement.style.width = '1000px';
        } else {
          clonedDoc.documentElement.style.width = 'fit-content';
        }
        clonedDoc.documentElement.style.height = 'fit-content';
        clonedDoc.documentElement.style.minWidth = '0';
      }
      if (clonedDoc.body) {
        if ([2, 3, 4, 5, 11].includes(activePage)) {
          clonedDoc.body.style.width = '1000px';
        } else {
          clonedDoc.body.style.width = 'fit-content';
        }
        clonedDoc.body.style.height = 'fit-content';
        clonedDoc.body.style.minWidth = '0';
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
      }

      // Ensure all parents of the element can expand but stay tight
      let parent = el.parentElement;
      while (parent) {
        parent.style.width = 'fit-content';
        parent.style.minWidth = '0';
        parent.style.maxWidth = 'none';
        parent.style.overflow = 'visible';
        parent.style.padding = '0';
        parent.style.margin = '0';
        parent = parent.parentElement;
      }

      el.style.backgroundColor = '#ffffff';
      el.style.backgroundImage = 'none';
      el.style.padding = '0'; 
      el.style.borderRadius = '0px';
      el.style.border = 'none';
      el.style.boxShadow = 'none';
      el.style.width = 'fit-content';
      el.style.height = 'fit-content';
      el.style.minWidth = '0';
      el.style.minHeight = '0';
      el.style.margin = '0';
      el.style.display = 'inline-block';
      
      if (activePage === 1) {
        el.style.width = 'fit-content';
        el.style.minWidth = '0';
        el.style.maxWidth = 'none';
        el.style.padding = '0'; 
        el.style.display = 'inline-block'; 
        el.style.margin = '0'; 
        el.style.borderRadius = '0px'; 
        el.style.border = 'none'; 
        el.style.boxShadow = 'none'; 
        el.style.overflow = 'visible';
        el.style.backgroundColor = '#ffffff';

        // Target LoadingTable specific containers
        const loadingTableOuters = el.querySelectorAll('.bg-white.rounded-xl.shadow-lg');
        loadingTableOuters.forEach(ltoNode => {
          const lto = ltoNode as HTMLElement;
          lto.style.width = 'fit-content';
          lto.style.minWidth = '0';
          lto.style.maxWidth = 'none';
          lto.style.borderRadius = '0px';
          lto.style.boxShadow = 'none';
          lto.style.border = 'none';
          lto.style.overflow = 'visible';
          lto.style.margin = '0';
          lto.style.padding = '0';
          lto.style.backgroundColor = '#ffffff';
        });

        const tables = el.querySelectorAll('table');
        tables.forEach(tNode => {
          const t = tNode as HTMLElement;
          t.style.width = 'max-content';
          t.style.minWidth = 'max-content';
          t.style.tableLayout = 'auto';
          t.style.borderCollapse = 'collapse';
          t.style.margin = '0';
          t.style.padding = '0';

          const cells = t.querySelectorAll('td, th');
          cells.forEach(c => {
            const cell = c as HTMLElement;
            cell.style.paddingLeft = '15px';
            cell.style.paddingRight = '15px';
          });
        });

        const tableContainers = el.querySelectorAll('.overflow-x-auto');
        tableContainers.forEach(tcNode => {
          const tc = tcNode as HTMLElement;
          tc.style.overflow = 'visible';
          tc.style.width = 'fit-content';
          tc.style.minWidth = '0';
          tc.style.maxWidth = 'none';
          tc.style.display = 'block';
          tc.style.padding = '0';
          tc.style.margin = '0';
          
          if (tc.parentElement) {
            const tcp = tc.parentElement as HTMLElement;
            tcp.style.width = 'fit-content';
            tcp.style.minWidth = '0';
            tcp.style.maxWidth = 'none';
            tcp.style.overflow = 'visible';
            tcp.style.padding = '0';
            tcp.style.margin = '0';
          }
        });
      } else {
        el.style.width = 'fit-content';
        el.style.minWidth = '0';
        el.style.maxWidth = 'none';
        el.style.margin = '0';
        el.style.display = 'inline-block';
      }

      const buttonsToHide = el.querySelectorAll('button');
      buttonsToHide.forEach(btn => { (btn as HTMLElement).style.display = 'none'; });

      if (activePage !== 1) {
        const themeColor = activePage === 2 ? '#fbbf24' : 
                           activePage === 3 ? '#6366f1' : 
                           activePage === 4 ? '#10b981' : 
                           activePage === 5 ? '#f43f5e' :
                           activePage === 8 ? '#3b82f6' :
                           activePage === 11 ? '#a855f7' :
                           '#f43f5e';
        
        const themeBg = activePage === 2 ? '#fffbeb' : 
                        activePage === 3 ? '#eef2ff' : 
                        activePage === 4 ? '#ecfdf5' : 
                        activePage === 5 ? '#fff1f2' :
                        activePage === 8 ? '#eff6ff' :
                        activePage === 11 ? '#faf5ff' :
                        '#fff1f2';

        el.style.width = 'fit-content';
        el.style.minWidth = '1100px'; // Adjusted for A4 portrait
        el.style.margin = '0 auto';
        el.style.padding = '1cm'; // Increased padding to match image
        el.style.boxSizing = 'border-box';
        el.style.display = 'flex';
        el.style.flexDirection = 'column';
        el.style.backgroundColor = '#ffffff';
        el.style.color = '#000000';
        el.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        el.style.overflow = 'visible';
        // el.style.border = '1px solid #000'; // Removed black border as requested
        
        /* 
        const originalHeader = el.querySelector('.flex.items-center.justify-between');
        if (originalHeader) {
          originalHeader.remove();
        }
        */
        
        const allSpaced = el.querySelectorAll('[class*="space-y-"]');
        allSpaced.forEach(e => {
          e.className = e.className.replace(/space-y-(16|12|10|8|6|4|2|1\.5)\b/g, '');
        });
        
        const containers = el.querySelectorAll('.bg-slate-50, .border-slate-100, .rounded-\\[4rem\\], .rounded-\\[1\\.5rem\\], .shadow-sm, .border-\\[6px\\]');
        containers.forEach((c) => {
          const container = c as HTMLElement;
          container.style.backgroundColor = 'transparent';
          container.style.border = 'none';
          container.style.boxShadow = 'none';
          container.style.padding = '0';
          container.style.borderRadius = '0';
          container.style.marginBottom = '20px'; // Increased to match image
          container.style.marginTop = '0';
          container.style.gap = '20px'; // Increased to match image
          container.style.width = '100%';
          container.style.maxWidth = 'none';
          
          if (container.classList.contains('grid')) {
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(12, minmax(0, 1fr))';
            container.style.gap = '20px'; // Increased to match image
          }
        });

        // Ensure grid spans are preserved
        el.querySelectorAll('[class*="md:col-span-"]').forEach(item => {
          const element = item as HTMLElement;
          const classes = Array.from(element.classList);
          const spanClass = classes.find(cl => cl.startsWith('md:col-span-'));
          if (spanClass) {
            const span = spanClass.split('-').pop();
            element.style.gridColumn = `span ${span} / span ${span}`;
          }
        });

        // Add red divider lines only between main sections for reports
        if (activePage !== 1) {
          const mainSections = Array.from(el.children).filter(child => {
            const element = child as HTMLElement;
            return element.classList.contains('space-y-3') || 
                   element.classList.contains('bg-slate-50') ||
                   element.querySelector('.bg-slate-50') !== null;
          });
          
          mainSections.forEach((section, idx) => {
            if (idx < mainSections.length - 1 && idx < 5) { // Increased limit slightly
              const divider = clonedDoc.createElement('div');
              divider.style.width = '100%';
              divider.style.height = '6px';
              divider.style.backgroundColor = '#991b1b'; // Dark Red
              divider.style.marginTop = '20px'; // Adjusted to match image
              divider.style.marginBottom = '20px'; // Adjusted to match image
              divider.style.display = 'block';
              divider.style.clear = 'both';
              if (section.parentNode) {
                section.parentNode.insertBefore(divider, section.nextSibling);
              }
            }
          });
        }

        // Remove all borders and shadows from all elements except header/footer
        el.querySelectorAll('*').forEach(item => {
          const element = item as HTMLElement;
          element.style.boxShadow = 'none';
          
          // Hide all icons (SVGs) except in header/footer
          if (element.tagName === 'SVG' && 
              !element.closest('.falcon-header') && 
              !element.closest('.falcon-footer')) {
            element.style.display = 'none';
          }
          
          // Hide icon containers
          if (element.classList.contains('absolute') && 
              (element.classList.contains('left-3') || element.classList.contains('left-4')) && 
              element.querySelector('svg')) {
            element.style.display = 'none';
          }

          if (!element.classList.contains('falcon-header') && 
              !element.classList.contains('falcon-footer') &&
              !element.classList.contains('falcon-forwarder-rates-grid')) {
            element.style.border = 'none';
            element.style.borderBottom = 'none';
            element.style.borderTop = 'none';
            element.style.borderLeft = 'none';
            element.style.borderRight = 'none';
          }
        });

        if (![2, 3, 4, 5, 7, 11].includes(activePage)) {
          const header = clonedDoc.createElement('div');
          header.classList.add('falcon-header');
          header.style.marginBottom = '15px';
          header.style.borderBottom = '2px solid #003399';
          header.style.paddingBottom = '10px';
          header.style.display = 'flex';
          header.style.justifyContent = 'space-between';
          header.style.alignItems = 'center';
          
          header.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
              <div class="falcon-logo" style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
                <img src="${logoBase64 || '/logo.png'}" alt="Falcon Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
              </div>
              <div style="border-left: 2px solid #003399; padding-left: 20px; display: flex; align-items: center; height: 40px;">
                <h1 style="font-size: 24px; font-weight: 900; color: #000000; margin: 0; line-height: 1; letter-spacing: 0.05em; font-family: 'Roboto', -apple-system, system-ui, sans-serif; white-space: nowrap; text-transform: uppercase;">FALCON OVERSEAS</h1>
              </div>
            </div>
          `;
          el.prepend(header);

          // Add a formal footer
          const footer = clonedDoc.createElement('div');
          footer.classList.add('falcon-footer');
          footer.style.marginTop = 'auto';
          footer.style.paddingTop = '10px';
          footer.style.borderTop = '1px solid #003399';
          footer.style.display = 'flex';
          footer.style.justifyContent = 'center';
          
          footer.innerHTML = `
            <p style="font-size: 16px; font-weight: 900; color: #000000; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0;">THIS IS A SYSTEM GENERATED PO</p>
          `;
          el.appendChild(footer);
        }

        // Hide the entire original header block that contains titles
        const allTitles = el.querySelectorAll('h2, p, h3');
        allTitles.forEach(t => {
          const title = t as HTMLElement;
          const text = title.innerText.toUpperCase();
          if (text.includes('RICE PO') || 
              text.includes('CHA PO') || 
              text.includes('FORWARDER PO') || 
              text.includes('INSPECTION PO') || 
              text.includes('ITEM LOADING') || 
              text.includes('PROCUREMENT MANAGEMENT SYSTEM')) {
            // Hide the title and its container to save space
            let container = title.parentElement;
            while (container && !container.classList.contains('flex') && !container.classList.contains('grid')) {
              container = container.parentElement;
            }
            if (container) container.style.display = 'none';
            title.style.display = 'none';
          }
        });

        const sectionTitles = el.querySelectorAll('h3, h4');
        sectionTitles.forEach(t => {
          const title = t as HTMLElement;
          title.style.display = 'none';
        });

        // Keep section titles as requested - REVERTED: User now wants them removed
      }

      const selects = el.querySelectorAll('select');
      selects.forEach(sel => {
        const val = sel.options[sel.selectedIndex]?.text || '-';
        const replacement = clonedDoc.createElement('div');
        replacement.innerText = val;
        replacement.style.width = '100%';
        replacement.style.minHeight = activePage === 1 ? '46px' : '24px';
        replacement.style.height = 'auto';
        replacement.style.backgroundColor = 'transparent';
        replacement.style.border = 'none';
        replacement.style.borderBottom = 'none';
        replacement.style.borderRadius = '0';
        replacement.style.padding = activePage === 1 ? '0.8rem 1rem' : '4px 0';
        replacement.style.fontSize = activePage === 1 ? '16px' : '22px';
        replacement.style.lineHeight = '1.2';
        replacement.style.fontWeight = '700';
        replacement.style.color = '#000000';
        replacement.style.display = 'block';
        replacement.style.whiteSpace = 'normal';
        replacement.style.wordBreak = 'break-word';
        replacement.style.overflow = 'visible';
        replacement.style.textOverflow = 'clip';
        replacement.style.letterSpacing = '0.01em';
        
        if (sel.parentElement) {
          sel.parentElement.insertBefore(replacement, sel);
          sel.remove();
        }
      });

      // Target custom select divs and multi-select displays
      const customSelects = el.querySelectorAll('.h-\\[38px\\], .min-h-\\[38px\\], .min-h-\\[54px\\], .min-h-\\[60px\\], .falcon-custom-dropdown');
      customSelects.forEach(cs => {
        const div = cs as HTMLElement;
        div.style.backgroundColor = 'transparent';
        div.style.border = 'none';
        div.style.borderBottom = 'none';
        div.style.borderRadius = '0';
        div.style.boxShadow = 'none';
        div.style.padding = activePage === 1 ? '0.8rem 1rem' : '2px 0'; // Tightened for image look
        div.style.color = '#000000';
        div.style.fontWeight = '700';
        div.style.fontSize = activePage === 1 ? '16px' : '20px'; // Adjusted for image look
        div.style.lineHeight = '1.1'; // Tightened for image look
        div.style.minHeight = activePage === 1 ? '46px' : '24px';
        div.style.height = 'auto';
        div.style.letterSpacing = '0.01em';
        div.style.whiteSpace = 'normal';
        div.style.wordBreak = 'break-word';
        div.style.overflow = 'visible';
        div.style.textOverflow = 'clip';
        div.style.display = 'block';
        div.classList.remove('whitespace-nowrap', 'overflow-hidden', 'overflow-ellipsis', 'pl-10', 'pl-11');
        
        // Hide the chevron icon in custom dropdowns
        const chevron = div.querySelector('svg');
        if (chevron) chevron.remove();

        const text = div.innerText.trim();
        if (text === 'SELECT...' || text === 'SELECT MULTIPLE...' || text === 'CURRENCY...') {
          div.innerText = '-';
        }
      });

      const inputs = el.querySelectorAll('input');
      inputs.forEach(inp => {
        let val = inp.value || '-';
        if (inp.type === 'date' && val !== '-') {
          val = formatDate(val);
        } else if (inp.type === 'file') {
          const dataUrl = inp.getAttribute('data-url');
          if (dataUrl && dataUrl.startsWith('http')) {
            val = dataUrl;
          } else if (dataUrl && dataUrl.startsWith('data:image')) {
            val = 'IMAGE ATTACHED';
          } else if (dataUrl === 'UPLOADING...') {
            val = 'UPLOADING...';
          } else {
            val = '-';
          }
        }
        const replacement = clonedDoc.createElement('div');
        replacement.innerText = val;
        replacement.style.width = '100%';
        replacement.style.minHeight = activePage === 1 ? '46px' : '24px';
        replacement.style.height = 'auto';
        replacement.style.backgroundColor = 'transparent';
        replacement.style.border = 'none';
        replacement.style.borderBottom = 'none';
        replacement.style.borderRadius = '0';
        replacement.style.padding = activePage === 1 ? '0.8rem 1rem' : '2px 0'; // Tightened for image look
        replacement.style.fontSize = activePage === 1 ? '16px' : '20px'; // Adjusted for image look
        replacement.style.lineHeight = '1.1'; // Tightened for image look
        replacement.style.fontWeight = '700';
        replacement.style.color = '#000000';
        replacement.style.display = 'block';
        replacement.style.whiteSpace = 'normal';
        replacement.style.wordBreak = 'break-word';
        replacement.style.overflow = 'visible';
        replacement.style.textOverflow = 'clip';
        replacement.style.letterSpacing = '0.01em';
        replacement.classList.remove('pl-10', 'pl-11');

        if (inp.parentElement) {
          inp.parentElement.insertBefore(replacement, inp);
          inp.remove();
        }

        // Hide replacement if original input was invisible or is a rate label
        if (inp.classList.contains('invisible') || inp.style.visibility === 'hidden' || inp.classList.contains('falcon-rate-label-input')) {
          replacement.style.display = 'none';
        }
      });

      const allElements = el.querySelectorAll('*');
      allElements.forEach(node => {
        const element = node as HTMLElement;
        element.style.boxShadow = 'none';
        element.style.textShadow = 'none';
        (element.style as any).webkitFontSmoothing = 'antialiased';
        (element.style as any).mozOsxFontSmoothing = 'grayscale';
        
        if (activePage !== 1) {
          // Keep icons and titles as requested
        }

        if (element.classList.contains('falcon-forwarder-ports-grid')) {
          element.style.marginTop = '40px';
        }

        if (element.classList.contains('falcon-forwarder-rates-grid')) {
          element.style.marginTop = '60px';
          element.style.borderTop = '2px solid #003399';
          element.style.paddingTop = '25px';
          element.style.gap = '30px';
        }

        if (element.classList.contains('falcon-inspection-grid')) {
          element.style.marginTop = '30px';
        }

        if (element.classList.contains('h-[54px]') || element.classList.contains('h-[38px]')) {
          element.style.height = 'auto';
          element.style.display = 'block';
          element.style.minHeight = activePage === 1 ? '46px' : '24px';
          element.style.padding = activePage === 1 ? '0.8rem 1rem' : '4px 0';
          element.style.backgroundColor = 'transparent';
          element.style.border = 'none';
          element.style.borderBottom = 'none';
          element.style.overflow = 'visible';
          
          const span = element.querySelector('span');
          if (span) {
            span.style.fontSize = activePage === 1 ? '16px' : '20px'; // Adjusted for image look
            span.style.lineHeight = '1.1'; // Tightened for image look
            span.style.fontWeight = '700';
            span.style.color = '#000000';
          }
        }

        // Force high-contrast black and consistent font size for text nodes
        if (element.childNodes.length > 0 && Array.from(element.childNodes).some(n => n.nodeType === Node.TEXT_NODE)) {
          if (!['LABEL', 'H3', 'H4', 'H5'].includes(element.tagName) && 
              !element.classList.contains('falcon-header') && 
              !element.classList.contains('falcon-footer')) {
            element.style.color = '#000000';
            if (activePage !== 1) {
              element.style.fontSize = '20px'; // Adjusted for image look
              element.style.lineHeight = '1.1'; // Tightened for image look
              element.style.fontWeight = '700';
            }
          }
        }

        if (element.tagName === 'LABEL' || element.tagName === 'H3' || element.tagName === 'H4' || element.tagName === 'H5') {
          element.style.color = '#991b1b'; // Dark Red
          element.style.fontSize = activePage === 1 ? '12px' : '13px'; // Adjusted for image look
          element.style.fontWeight = '900';
          element.style.opacity = '1';
          element.style.marginBottom = activePage === 1 ? '6px' : '4px'; // Tightened to match image
          element.style.letterSpacing = '0.05em';
          element.style.textTransform = 'uppercase';
          element.style.border = 'none';
          element.style.backgroundColor = 'transparent';
          element.style.overflow = 'visible';
        }
      });

      if (activePage !== 1) {
        // Already handled watermark above
      }

      if ([1, 8].includes(activePage)) {
        const container = el.querySelector('.bg-slate-100, .bg-white');
        if (container) {
          (container as HTMLElement).style.backgroundColor = '#ffffff';
          (container as HTMLElement).style.padding = '20px';
        }
        
        // Ensure table is fully expanded in the clone
        const tableWrappers = el.querySelectorAll('.overflow-x-auto, .overflow-hidden');
        tableWrappers.forEach(w => {
          const wrapper = w as HTMLElement;
          wrapper.style.overflow = 'visible';
          wrapper.style.width = 'auto';
          wrapper.style.maxWidth = 'none';
          wrapper.style.display = 'block';
        });

        const tables = el.querySelectorAll('table');
        tables.forEach(t => {
          (t as HTMLElement).style.width = 'max-content';
          (t as HTMLElement).style.minWidth = '100%';
          (t as HTMLElement).style.tableLayout = 'auto'; // Force auto layout to prevent clipping
          (t as HTMLElement).style.borderCollapse = 'collapse';
        });

        // Explicitly preserve colors for export
        const redTexts = el.querySelectorAll('.text-rose-600, .text-rose-700');
        redTexts.forEach(t => { (t as HTMLElement).style.color = '#e11d48'; });
        
        const blueTexts = el.querySelectorAll('.text-blue-600, .text-blue-700');
        blueTexts.forEach(t => { (t as HTMLElement).style.color = '#2563eb'; });
        
        const greenTexts = el.querySelectorAll('.text-emerald-600, .text-emerald-700');
        greenTexts.forEach(t => { (t as HTMLElement).style.color = '#059669'; });

        const amberHeaders = el.querySelectorAll('.bg-\\[\\#fbbf24\\]');
        amberHeaders.forEach(h => { (h as HTMLElement).style.backgroundColor = '#fbbf24'; });
      }

      if ([2, 3, 4, 5].includes(activePage)) {
        // For PO forms, ensure they are fully expanded and clean
        const formContainer = el.querySelector('.bg-white, .bg-slate-50');
        if (formContainer) {
          (formContainer as HTMLElement).style.boxShadow = 'none';
          (formContainer as HTMLElement).style.border = 'none';
          (formContainer as HTMLElement).style.width = '100%';
        }

        // Hide buttons and icons that shouldn't be in the PDF
        const actionButtons = el.querySelectorAll('button');
        actionButtons.forEach(b => {
          if (b.innerText.includes('CLEAR') || b.innerText.includes('FINALIZE') || b.innerText.includes('SAVE')) {
            b.style.display = 'none';
          }
        });
      }
      
      el.classList.remove('animate-fadeIn');
    }
  };

  const getActiveElementId = () => {
    switch (activePage) {
      case 1: return 'dashboard-content';
      case 2: return 'white-rice-export';
      case 3: return 'cha-export';
      case 4: return 'forwarder-export';
      case 5: return 'inspection-export';
      case 7: return 'sales-contract-export';
      case 8: return 'item-loading-export';
      case 10: return 'invoice-export';
      case 11: return 'bags-export';
      case 12: return 'invoice-template-canvas';
      case 15: return 'bank-export';
      default: return 'dashboard-content';
    }
  };

  const getFilenameForActivePage = () => {
    let filename = '';
    if (activePage === 1) {
      const po = purchaseOrders.find(p => p.id === selectedPoId);
      filename = po ? po.poNumber : 'Dashboard';
    } else if (activePage === 2) {
      filename = formData.purchaseOrderNo || 'RicePO';
    } else if (activePage === 3) {
      filename = chaFormData.chaPoNo || 'CHA_PO';
    } else if (activePage === 4) {
      filename = forwarderFormData.forwarderPo || 'Forwarder_PO';
    } else if (activePage === 5) {
      filename = inspectionFormData.inspectionPo || 'Inspection_PO';
    } else if (activePage === 7) {
      filename = salesFormData.salesContractNo || 'Sales_Contract';
    } else if (activePage === 8) {
      filename = itemLoadingFormData.againstPo || 'Item_Loading';
    } else if (activePage === 11) {
      filename = bagsFormData.bagsPoNo || 'Bags_PO';
    } else if (activePage === 15) {
      filename = bankFormData.bankPoNo || 'Bank_PO';
    } else if (activePage === 10) {
      filename = invoiceFormData.invoiceNo || 'Invoice';
    } else if (activePage === 12) {
      filename = 'Falcon_Commercial_Invoice';
    } else {
      filename = `Export_${new Date().getTime()}`;
    }
    return filename.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || `Export_${new Date().getTime()}`;
  };

  const handleDownloadPDF = async () => {
    let elementId = getActiveElementId();
    let filename = getFilenameForActivePage();
    
    // Map to new IDs
    const poMap: Record<number, string> = {
      2: 'rice-print-container',
      3: 'cha-print-container',
      4: 'forwarder-print-container',
      5: 'inspection-print-container',
      7: 'sales-contract-print-container',
      11: 'bags-print-container',
      15: 'bank-print-container'
    };
    
    if (poMap[activePage]) {
      elementId = poMap[activePage];
    }

    const element = document.getElementById(elementId);
    if (!element) return;
    
    setIsSyncing(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      pdf.save(`${filename}.pdf`);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const handleDownloadImage = async () => {
    let elementId = getActiveElementId();
    
    // Map to new IDs
    const poMap: Record<number, string> = {
      2: 'rice-print-container',
      3: 'cha-print-container',
      4: 'forwarder-print-container',
      5: 'inspection-print-container',
      7: 'sales-contract-print-container',
      11: 'bags-print-container',
      15: 'bank-print-container'
    };
    
    if (poMap[activePage]) {
      elementId = poMap[activePage];
    }

    const element = document.getElementById(elementId);
    if (!element) return;
    
    setIsSyncing(true);
    try {
      const canvas = await html2canvas(element, { 
        scale: 4, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: captureCloneModifications,
        imageTimeout: 0,
        logging: false,
        scrollX: 0,
        scrollY: 0
      });
      
      const filename = getFilenameForActivePage();

      let finalDataUrl = canvas.toDataURL('image/png', 1.0);

      const margin = 16; // Add a small margin
      
      // Determine target aspect ratio (A4)
      const a4Ratio = 210 / 297;
      const contentRatio = canvas.width / canvas.height;
      
      let targetWidth, targetHeight;
      
      if (contentRatio > 1) { // Landscape
        // A4 landscape ratio is 297 / 210
        const targetRatio = 297 / 210;
        if (contentRatio > targetRatio) {
          // Content is wider than A4 landscape
          targetWidth = canvas.width + (margin * 2);
          targetHeight = targetWidth / targetRatio;
        } else {
          // Content is taller than A4 landscape
          targetHeight = canvas.height + (margin * 2);
          targetWidth = targetHeight * targetRatio;
        }
      } else { // Portrait
        const targetRatio = 210 / 297;
        if (contentRatio > targetRatio) {
          // Content is wider than A4 portrait
          targetWidth = canvas.width + (margin * 2);
          targetHeight = targetWidth / targetRatio;
        } else {
          // Content is taller than A4 portrait
          targetHeight = canvas.height + (margin * 2);
          targetWidth = targetHeight * targetRatio;
        }
      }

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = targetWidth;
      finalCanvas.height = targetHeight;
      const ctx = finalCanvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        // Center the content
        const xOffset = (targetWidth - canvas.width) / 2;
        const yOffset = (targetHeight - canvas.height) / 2;
        ctx.drawImage(canvas, xOffset, yOffset);
        finalDataUrl = finalCanvas.toDataURL('image/png', 1.0);
      }

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = finalDataUrl;
      link.click();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsSyncing(false); 
    }
  };

  const handleSort = useCallback((key: ColumnKey | 'sno') => {
    setSortConfig(prev => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        if (prev.direction === 'desc') return { key: null, direction: null };
      }
      return { key, direction: 'asc' };
    });
  }, []);

  const toggleRowVisibility = useCallback((id: string) => {
    setHiddenRowIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resetHiddenRows = useCallback(() => {
    setHiddenRowIds(new Set());
  }, []);

  const filteredEntries = useMemo(() => {
    if (!selectedPo) return [];
    let entries = loadingEntries.filter(e => e.againstPo === selectedPo.poNumber);
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      entries = entries.filter(e => 
        String(e.vhNo || '').toLowerCase().includes(t) || 
        String(e.item || '').toLowerCase().includes(t) || 
        String(e.remark || '').toLowerCase().includes(t) ||
        String(e.riceMill || '').toLowerCase().includes(t) ||
        String(e.invoiceNo || '').toLowerCase().includes(t)
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      const { key, direction } = sortConfig;
      entries = [...entries].sort((a, b) => {
        if (key === 'sno') return 0;
        const aVal = (a as any)[key as string];
        const bVal = (b as any)[key as string];
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        const comparison = aVal < bVal ? -1 : 1;
        return direction === 'asc' ? comparison : -comparison;
      });
    }
    return entries;
  }, [loadingEntries, selectedPo, searchTerm, sortConfig]);

  const renderInputField = (id: any, label: string, placeholder = "", type = "text", span = "col-span-1", icon?: any, form: any = 'main', rowIdx?: number, readOnly = false) => {
    const currentForm = form === 'main' ? formData : 
                        form === 'cha' ? chaFormData : 
                        form === 'forwarder' ? forwarderFormData : 
                        form === 'inspection' ? inspectionFormData : 
                        form === 'itemLoading' ? itemLoadingFormData : 
                        form === 'sales' ? salesFormData :
                        form === 'invoice' ? invoiceFormData :
                        form === 'parties' ? partiesFormData :
                        form === 'bags' ? bagsFormData :
                        vendorFormData;
    
    let value = '';
    if (form === 'itemLoading' && rowIdx !== undefined) {
      value = currentForm.loadingRows?.[rowIdx]?.[id] || '';
    } else {
      value = (currentForm[id] as string) || '';
    }

    return (
      <div className={`space-y-1 ${span}`}>
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">{label}</label>
        <div className="relative group">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10">{React.cloneElement(icon, { size: 16 })}</div>}
          <input 
            value={type === 'file' ? undefined : value} 
            data-url={type === 'file' ? value : undefined}
            onChange={async (e) => {
              if (readOnly) return;
              if (type === 'file' && e.target.files && e.target.files.length > 0) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64String = reader.result as string;
                  
                  // Check file size (approximate from base64)
                  const sizeInBytes = (base64String.length * 3) / 4;
                  const sizeInMB = sizeInBytes / (1024 * 1024);
                  
                  if (sizeInMB > 10) {
                    alert('File is too large (max 10MB). Please choose a smaller file.');
                    return;
                  }

                  // Show uploading state
                  if (form === 'itemLoading' && rowIdx !== undefined) {
                    handleInputChange({ id, rowIdx }, 'UPLOADING...', form);
                  } else {
                    handleInputChange(id, 'UPLOADING...', form);
                  }

                  // Only upload to freeimage if it's an image
                  if (file.type.startsWith('image/')) {
                    const url = await uploadImage(base64String);
                    if (url) {
                      if (form === 'itemLoading' && rowIdx !== undefined) {
                        handleInputChange({ id, rowIdx }, url, form);
                      } else {
                        handleInputChange(id, url, form);
                      }
                      return;
                    }
                  }
                  
                  // For PDFs or if image upload failed, store as base64 (or just keep as is)
                  if (form === 'itemLoading' && rowIdx !== undefined) {
                    handleInputChange({ id, rowIdx }, base64String, form);
                  } else {
                    handleInputChange(id, base64String, form);
                  }
                };
                reader.readAsDataURL(file);
                return;
              }
              if (form === 'itemLoading' && rowIdx !== undefined) {
                handleInputChange({ id, rowIdx }, e.target.value, form);
              } else {
                handleInputChange(id, e.target.value, form);
              }
            }} 
            type={type} 
            accept={type === 'file' ? 'image/*,application/pdf' : undefined}
            capture={type === 'file' && !id.toString().toLowerCase().includes('pdf') ? 'environment' : undefined}
            placeholder={placeholder || 'TYPE HERE...'} 
            readOnly={readOnly}
            className={`w-full h-[44px] md:h-[38px] ${readOnly ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 group-hover:border-slate-300'} border rounded-lg ${icon ? 'pl-10' : 'px-3'} pr-3 font-bold transition-all text-[13px] outline-none shadow-sm placeholder:text-slate-300 ${type === 'file' ? 'pt-2.5 md:pt-1.5 text-xs' : ''}`} 
          />
          {type === 'file' && value && value !== 'UPLOADING...' && value.startsWith('http') && (
            <button onClick={() => {
              const w = window.open("");
              if (w) {
                if (value.toLowerCase().endsWith('.pdf')) {
                  w.document.write(`
                    <body style="margin:0; padding:0; background:#f1f5f9; overflow:hidden;">
                      <div style="margin: 0.5cm; height: calc(100vh - 1cm); background:white; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px; overflow:hidden;">
                        <iframe src="${value}" style="width: 100%; height: 100%; border: none;"></iframe>
                      </div>
                    </body>
                  `);
                } else {
                  w.document.write(`
                    <body style="margin:0; padding:0; background:#f1f5f9; display:flex; justify-content:center; align-items:flex-start; min-height:100vh;">
                      <div style="margin: 0.5cm; background:white; padding:0.5cm; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px;">
                        <img src="${value}" style="max-width: 100%; display:block;" />
                      </div>
                    </body>
                  `);
                }
              }
            }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 hover:underline bg-white px-1">
              VIEW LINK
            </button>
          )}
          {type === 'file' && value && value !== 'UPLOADING...' && value.startsWith('data:image') && (
            <button onClick={() => {
              const w = window.open("");
              if (w) w.document.write(`
                <body style="margin:0; padding:0; background:#f1f5f9; display:flex; justify-content:center; align-items:flex-start; min-height:100vh;">
                  <div style="margin: 0.5cm; background:white; padding:0.5cm; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px;">
                    <img src="${value}" style="max-width: 100%; display:block;" />
                  </div>
                </body>
              `);
            }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 hover:underline bg-white px-1">
              VIEW IMAGE
            </button>
          )}
          {type === 'file' && value && value !== 'UPLOADING...' && value.startsWith('data:application/pdf') && (
            <button onClick={() => {
              const w = window.open("");
              if (w) w.document.write(`
                <body style="margin:0; padding:0; background:#f1f5f9; overflow:hidden;">
                  <div style="margin: 0.5cm; height: calc(100vh - 1cm); background:white; box-shadow:0 0 20px rgba(0,0,0,0.1); border-radius:8px; overflow:hidden;">
                    <iframe src="${value}" style="width: 100%; height: 100%; border: none;"></iframe>
                  </div>
                </body>
              `);
            }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 hover:underline bg-white px-1">
              VIEW PDF
            </button>
          )}
          {type === 'file' && value === 'UPLOADING...' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500 bg-white px-1">
              UPLOADING...
            </span>
          )}
        </div>
      </div>
    );
  };

  const deleteCustomOption = (id: string, option: string) => {
    setUserCustomOptions(prev => ({
      ...prev,
      [id]: (prev[id] || []).filter(o => o !== option)
    }));
  };

  const renderSelectField = (id: any, label: string, options: string[], span = "col-span-1", icon?: any, form: any = 'main', onSelect?: (v: string) => void, readOnly = false) => {
    const customs = userCustomOptions[id] || [];
    const all = Array.from(new Set([...options, ...customs]));
    const currentForm = form === 'main' ? formData : 
                        form === 'cha' ? chaFormData : 
                        form === 'forwarder' ? forwarderFormData : 
                        form === 'inspection' ? inspectionFormData : 
                        form === 'itemLoading' ? itemLoadingFormData : 
                        form === 'sales' ? salesFormData :
                        form === 'invoice' ? invoiceFormData :
                        form === 'parties' ? partiesFormData :
                        form === 'bags' ? bagsFormData :
                        vendorFormData;
    const currentVal = currentForm[id] != null ? String(currentForm[id]) : '';
    const isOpen = openSingleSelect === id && !readOnly;
    
    // Show all options if the input is focused/clicked, otherwise filter by currentVal
    const filteredOptions = all.filter(o => {
      if (!isOpen) return true;
      if (!currentVal) return true;
      
      // If the dropdown is open, we want to show all options if the current value 
      // is an exact match, so the user can easily switch to a different one.
      const isExactMatch = all.some(opt => String(opt).trim().toLowerCase() === currentVal.trim().toLowerCase());
      if (isExactMatch) return true;
      
      return String(o || '').toLowerCase().includes(currentVal.toLowerCase());
    });

    // Actually, let's make it so that if they click the chevron or the input, 
    // it shows the full list if they haven't started typing *after* opening.
    // But for now, let's just ensure the list is populated.

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (readOnly) return;
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          e.preventDefault();
          setHighlightedIndex(-1);
          setOpenSingleSelect(id);
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          const option = filteredOptions[highlightedIndex];
          if (onSelect) onSelect(option);
          else handleInputChange(id, option, form);
          setOpenSingleSelect(null);
        } else {
          setOpenSingleSelect(null);
        }
      } else if (e.key === 'Escape') {
        setOpenSingleSelect(null);
      }
    };

    return (
      <div key={`single-${form}-${id}`} className={`space-y-1 ${span} relative ${isOpen ? 'z-[1000]' : 'z-0'}`}>
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">{label}</label>
        <div className={`relative group ${isOpen ? 'z-50' : 'z-0'}`}>
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">{React.cloneElement(icon, { size: 16 })}</div>}
          <input 
            value={currentVal}
            readOnly={readOnly}
            autoComplete="off"
            onClick={() => {
              if (readOnly) return;
              setHighlightedIndex(-1);
              setOpenSingleSelect(id);
            }}
            onFocus={() => {
              if (readOnly) return;
              setHighlightedIndex(-1);
              setOpenSingleSelect(id);
            }}
            onChange={(e) => {
              if (readOnly) return;
              handleInputChange(id, e.target.value, form);
              if (!isOpen) setOpenSingleSelect(id);
            }}
            onKeyDown={handleKeyDown}
            placeholder={readOnly ? "AUTO-FILLED" : "TYPE OR SELECT..."}
            className={`w-full h-[44px] md:h-[38px] ${readOnly ? 'bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 group-hover:border-slate-300'} border rounded-lg ${icon ? 'pl-10' : 'px-3'} pr-8 font-bold transition-all text-[13px] shadow-sm outline-none`}
          />
          {!readOnly && (
            <ChevronDown 
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHighlightedIndex(-1);
                setOpenSingleSelect(isOpen ? null : id);
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              size={14} 
            />
          )}
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenSingleSelect(null)}></div>
            <div 
              ref={dropdownRef}
              className="absolute top-[100%] left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1001] max-h-64 overflow-y-auto p-2 animate-fadeIn"
            >
              <div 
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleInputChange(id, "", form); setOpenSingleSelect(null); }}
                className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-sm font-bold text-slate-400 italic"
              >
                CLEAR SELECTION
              </div>
              {all.length === 0 && (
                <div className="p-4 text-slate-400 text-center font-bold text-xs italic">
                  NO OPTIONS AVAILABLE. TYPE TO ADD NEW.
                </div>
              )}
              {all.length > 0 && filteredOptions.length === 0 && (
                <div className="p-3 text-sm font-bold text-slate-400 text-center">
                  PRESS ENTER OR CLICK OUTSIDE TO KEEP "{currentVal}"
                </div>
              )}
              {filteredOptions.map((option, index) => (
                <div 
                  key={`${option}-${index}`} 
                  data-index={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onSelect) onSelect(option);
                    else handleInputChange(id, option, form);
                    setOpenSingleSelect(null);
                  }}
                  onTouchStart={(e) => {
                    // For mobile touch devices
                    if (onSelect) onSelect(option);
                    else handleInputChange(id, option, form);
                    setOpenSingleSelect(null);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors group ${highlightedIndex === index ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                >
                  <div 
                    className={`flex-1 text-sm font-bold ${currentVal === option ? 'text-amber-500' : 'text-slate-900'}`}
                  >
                    {option}
                  </div>
                  {customs.includes(option) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteCustomOption(id, option); }}
                      className="p-1 text-slate-300 hover:text-blue-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              {currentVal.trim() && !all.some(opt => String(opt).trim().toLowerCase() === currentVal.trim().toLowerCase()) && (
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const val = currentVal.trim();
                    setUserCustomOptions(prev => ({ ...prev, [id]: Array.from(new Set([...(prev[id] || []), val])) }));
                    SpreadsheetService.saveDropdownOption(label, val, currentForm);
                    setOpenSingleSelect(null);
                  }}
                  className="w-full text-left px-5 py-3 text-sm font-black text-emerald-600 hover:bg-emerald-50 transition-colors uppercase tracking-widest border-t border-slate-100 mt-1"
                >
                  + SAVE "{currentVal}" TO DROPDOWN
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMultiSelectField = (id: any, label: string, options: string[], span = "col-span-1", icon?: any, form: any = 'main') => {
    const currentForm = form === 'main' ? formData : 
                        form === 'cha' ? chaFormData : 
                        form === 'forwarder' ? forwarderFormData : 
                        form === 'inspection' ? inspectionFormData : 
                        form === 'itemLoading' ? itemLoadingFormData : 
                        form === 'sales' ? salesFormData :
                        form === 'invoice' ? invoiceFormData :
                        form === 'parties' ? partiesFormData :
                        form === 'bags' ? bagsFormData :
                        vendorFormData;
    const currentVal = currentForm[id] != null ? String(currentForm[id]) : '';
    const selectedArray = currentVal ? currentVal.split(', ').filter(Boolean) : [];
    const isOpen = openMultiSelect === id;

    const toggleOption = (option: string) => {
      let nextArray;
      if (selectedArray.includes(option)) {
        nextArray = selectedArray.filter(o => o !== option);
      } else {
        nextArray = [...selectedArray, option];
      }
      handleInputChange(id, nextArray.join(', '), form);
    };

    const filteredOptions = options.filter(o => String(o || '').toLowerCase().includes(selectSearchQuery.toLowerCase()));

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        toggleOption(filteredOptions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setOpenMultiSelect(null);
      }
    };

    return (
      <div key={`multi-${form}-${id}`} className={`space-y-1 ${span} relative ${isOpen ? 'z-[1000]' : 'z-0'}`}>
        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block ml-1">{label}</label>
        <div className={`relative group ${isOpen ? 'z-50' : 'z-0'}`}>
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">{React.cloneElement(icon, { size: 16 })}</div>}
          <div 
            tabIndex={0}
            onClick={() => {
              setSelectSearchQuery('');
              setHighlightedIndex(-1);
              setOpenMultiSelect(isOpen ? null : id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectSearchQuery('');
                setHighlightedIndex(-1);
                setOpenMultiSelect(isOpen ? null : id);
              }
            }}
            className={`w-full min-h-[38px] bg-white border border-slate-200 rounded-lg ${icon ? 'pl-10' : 'px-3'} pr-8 py-2 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all text-[13px] cursor-pointer shadow-sm flex items-center overflow-hidden whitespace-nowrap overflow-ellipsis group-hover:border-slate-300`}
          >
            {selectedArray.length > 0 ? selectedArray.join(', ') : 'SELECT MULTIPLE...'}
          </div>
          <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} size={14} />
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenMultiSelect(null)}></div>
            <div 
              ref={dropdownRef}
              className="absolute top-[100%] left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1001] max-h-64 overflow-y-auto p-2 animate-fadeIn"
            >
              <div className="p-2 border-b border-slate-100 mb-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={selectSearchQuery}
                  onChange={(e) => {
                    setSelectSearchQuery(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>
              {options.length === 0 && <div className="p-4 text-slate-400 text-center font-bold text-xs">NO OPTIONS AVAILABLE</div>}
              {filteredOptions.map((option, index) => (
                <div 
                  key={`${option}-${index}`} 
                  data-index={index}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); toggleOption(option); }}
                  onTouchStart={(e) => { toggleOption(option); }}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors group ${highlightedIndex === index ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedArray.includes(option) ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-300 group-hover:border-amber-400'}`}>
                    {selectedArray.includes(option) && <Check size={14} strokeWidth={4} />}
                  </div>
                  <span className={`text-sm font-bold ${selectedArray.includes(option) ? 'text-slate-900' : 'text-slate-600'}`}>{option}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMultiSelectWithQuantity = (id: any, label: string, options: string[], span = "col-span-1", icon?: any, form: any = 'main') => {
    const currentForm = form === 'main' ? formData : 
                        form === 'cha' ? chaFormData : 
                        form === 'forwarder' ? forwarderFormData : 
                        form === 'inspection' ? inspectionFormData : 
                        form === 'itemLoading' ? itemLoadingFormData : 
                        form === 'sales' ? salesFormData :
                        form === 'invoice' ? invoiceFormData :
                        form === 'parties' ? partiesFormData :
                        form === 'bags' ? bagsFormData :
                        vendorFormData;
    const currentVal = currentForm[id] != null ? String(currentForm[id]) : '';
    
    const selectedPairs = currentVal.split(', ').filter(Boolean).map(item => {
      const match = item.match(/^(.*) \((.*)\)$/);
      if (match) return { name: match[1], qty: match[2] };
      return { name: item, qty: '' };
    });

    const isOpen = openMultiSelect === id;

    const updateValue = (pairs: {name: string, qty: string}[]) => {
      const str = pairs.map(p => p.qty ? `${p.name} (${p.qty})` : p.name).join(', ');
      handleInputChange(id, str, form);
    };

    const toggleOption = (option: string) => {
      const existing = selectedPairs.find(p => p.name === option);
      if (existing) {
        updateValue(selectedPairs.filter(p => p.name !== option));
      } else {
        updateValue([...selectedPairs, { name: option, qty: '' }]);
      }
    };

    const updateQty = (name: string, qty: string) => {
      updateValue(selectedPairs.map(p => p.name === name ? { ...p, qty } : p));
    };

    const filteredOptions = options.filter(o => String(o || '').toLowerCase().includes(selectSearchQuery.toLowerCase()));

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        toggleOption(filteredOptions[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setOpenMultiSelect(null);
      }
    };

    return (
      <div key={`multi-qty-${form}-${id}`} className={`space-y-1.5 ${span} relative ${isOpen ? 'z-[1000]' : 'z-0'}`}>
        <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block ml-1">{label}</label>
        <div className={`relative group ${isOpen ? 'z-50' : 'z-0'}`}>
          {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">{icon}</div>}
          <div 
            tabIndex={0}
            onClick={() => {
              setSelectSearchQuery('');
              setHighlightedIndex(-1);
              setOpenMultiSelect(isOpen ? null : id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectSearchQuery('');
                setHighlightedIndex(-1);
                setOpenMultiSelect(isOpen ? null : id);
              }
            }}
            className={`w-full min-h-[54px] bg-white border border-slate-200 rounded-xl ${icon ? 'pl-11' : 'px-4'} pr-10 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all text-[14px] cursor-pointer shadow-sm flex items-center overflow-hidden whitespace-nowrap overflow-ellipsis`}
          >
            {selectedPairs.length > 0 ? selectedPairs.map(p => p.qty ? `${p.name} (${p.qty})` : p.name).join(', ') : 'SELECT MILLS & QTY...'}
          </div>
          <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} size={18} />
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenMultiSelect(null)}></div>
            <div 
              ref={dropdownRef}
              className="absolute top-[100%] left-0 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1001] max-h-80 overflow-y-auto p-2 animate-fadeIn"
            >
              <div className="p-2 border-b border-slate-100 mb-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={selectSearchQuery}
                  onChange={(e) => {
                    setSelectSearchQuery(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-amber-400"
                />
              </div>
              {filteredOptions.map((option, index) => {
                const pair = selectedPairs.find(p => p.name === option);
                const isSelected = !!pair;
                return (
                  <div 
                    key={`${option}-${index}`} 
                    data-index={index}
                    className={`flex flex-col gap-2 p-3 rounded-xl transition-colors group ${isSelected ? 'bg-amber-50/30' : ''} ${highlightedIndex === index ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3 cursor-pointer" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); toggleOption(option); }} onTouchStart={(e) => { toggleOption(option); }}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-amber-400 border-amber-400 text-slate-950' : 'border-slate-300 group-hover:border-amber-400'}`}>
                        {isSelected && <Check size={14} strokeWidth={4} />}
                      </div>
                      <span className={`text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{option}</span>
                    </div>
                    {isSelected && (
                      <div className="ml-8 flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder="Enter Qty (e.g. 5 fcl)..."
                          value={pair.qty}
                          onChange={(e) => updateQty(option, e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-400"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderForwarderRateSlot = (field: string) => {
    const labelField = `${field}Label`;
    const secondBoxField = `${field}_2`;
    const currencyField = `${field}Currency`;
    const currentFormData = forwarderFormData as Record<string, any>;
    return (
      <div className="space-y-1.5 col-span-1">
        <input 
          value={currentFormData[labelField] as string || ''}
          onChange={(e) => handleInputChange(labelField, e.target.value, 'forwarder')}
          className={`text-[10px] font-black text-slate-900 uppercase tracking-widest block w-full bg-transparent border-none focus:ring-0 p-0 ml-1 outline-none placeholder:text-slate-300 falcon-rate-label-input ${field === 'ratePerContainer' ? 'invisible' : ''}`}
          placeholder="WRITE SOME THING..."
          disabled={field === 'ratePerContainer'}
        />
        {field === 'ratePerContainer' ? (
          <>
            <div className="h-[54px] w-full flex items-center px-4 bg-slate-50/50 border border-slate-200/60 rounded-xl">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">RATE(CNTR)</span>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10">
                <Coins size={20}/>
              </div>
              <input 
                value={currentFormData[field] as string || ''}
                onChange={(e) => handleInputChange(field, e.target.value, 'forwarder')}
                placeholder="0.00"
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 px-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all text-[14px] outline-none shadow-sm placeholder:text-slate-300"
              />
            </div>
          </>
        ) : (
          <>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10">
                <MessageSquare size={20}/>
              </div>
              <input 
                value={currentFormData[field] as string || ''}
                onChange={(e) => handleInputChange(field, e.target.value, 'forwarder')}
                placeholder="TYPE HERE..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 px-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all text-[14px] outline-none shadow-sm placeholder:text-slate-300"
              />
            </div>
            <div className="relative">
              <input 
                value={currentFormData[secondBoxField] as string || ''}
                onChange={(e) => handleInputChange(secondBoxField, e.target.value, 'forwarder')}
                placeholder="TYPE HERE..."
                className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-[14px] outline-none shadow-sm placeholder:text-slate-300"
              />
            </div>
          </>
        )}
        <div className="relative">
          <div 
            tabIndex={0}
            onClick={() => {
              setSelectSearchQuery('');
              setHighlightedIndex(-1);
              setOpenSingleSelect(openSingleSelect === currencyField ? null : currencyField);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectSearchQuery('');
                setHighlightedIndex(-1);
                setOpenSingleSelect(openSingleSelect === currencyField ? null : currencyField);
              }
            }}
            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3.5 font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all text-[14px] outline-none shadow-sm cursor-pointer flex items-center justify-between group falcon-custom-dropdown"
          >
            <span className={currentFormData[currencyField] ? 'text-slate-900' : 'text-slate-300'}>
              {currentFormData[currencyField] || 'CURRENCY...'}
            </span>
            <ChevronDown className={`text-slate-400 transition-transform ${openSingleSelect === currencyField ? 'rotate-180' : ''}`} size={16} />
          </div>

          {openSingleSelect === currencyField && (
            <>
              <div className="fixed inset-0 z-[1000]" onClick={() => setOpenSingleSelect(null)}></div>
              <div className="absolute bottom-full left-0 w-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[1001] max-h-60 overflow-y-auto p-2 animate-fadeIn">
                <div className="p-2 border-b border-slate-100 mb-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    value={selectSearchQuery}
                    onChange={(e) => setSelectSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {currencyList.filter(c => String(c || '').toLowerCase().includes(selectSearchQuery.toLowerCase())).map((option, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      handleInputChange(currencyField, option, 'forwarder');
                      setOpenSingleSelect(null);
                    }}
                    className="flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors group"
                  >
                    <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600">{option}</span>
                    {currentFormData[currencyField] === option && <Check size={16} className="text-emerald-500" />}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${activePage === 1 ? 'bg-[#0f172a]' : 'bg-white'} font-sans transition-colors duration-500 selection:bg-amber-400 selection:text-slate-950`}>
      <header className="bg-[#111827]/80 backdrop-blur-xl p-3 md:p-4 sticky top-0 z-50 border-b border-slate-800/50">
        <div className="max-w-[1800px] mx-auto flex justify-between items-center px-2 md:px-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div 
              onClick={() => setActivePage(1)}
              className="bg-white p-1.5 md:p-2 rounded-xl text-slate-950 shadow-lg shadow-amber-400/20 active:scale-95 transition-transform cursor-pointer flex items-center justify-center" 
              style={{ width: '38px', height: '38px', minWidth: '38px' }}
            >
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className="cursor-pointer active:scale-95 transition-transform" onClick={() => setActivePage(1)}>
              <h1 className="text-lg md:text-2xl font-black uppercase text-white">SYSTEM</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">{loadingEntries.length} LOADS SYNCED</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1f2937]/50 px-3 py-1.5 rounded-2xl border border-slate-700/50">
              <button 
                onClick={() => {
                  setActivePage(6);
                  setShowPoDropdown(false);
                  setShowSalesDropdown(false);
                }} 
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${activePage === 6 ? 'bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/20 translate-y-[-1px]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                REGISTER
              </button>

              <button 
                onClick={() => {
                  setActivePage(14);
                  setShowPoDropdown(false);
                  setShowSalesDropdown(false);
                }} 
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${activePage === 14 ? 'bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/20 translate-y-[-1px]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                INVOICE
              </button>

              <div className="relative">
                <button 
                  onClick={() => {
                  setShowSalesDropdown(!showSalesDropdown);
                  setShowPoDropdown(false);
                }} 
                  className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 flex items-center gap-2 ${[7, 10].includes(activePage) ? 'bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/20 translate-y-[-1px]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  SAL CON <ChevronDown size={14} className={`transition-transform ${showSalesDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSalesDropdown && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowSalesDropdown(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-[#1f2937] border border-slate-700 rounded-xl shadow-2xl z-[101] overflow-hidden animate-fadeIn">
                      <button
                        onClick={() => {
                        setActivePage(7);
                        setShowSalesDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase transition-colors ${activePage === 7 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                      CREATE SAL CON
                    </button>
                    <button
                      onClick={() => {
                        setActivePage(10);
                        setShowSalesDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase transition-colors ${activePage === 10 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                      CREATE INV
                    </button>
                    </div>
                  </>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => {
                  setShowPoDropdown(!showPoDropdown);
                  setShowSalesDropdown(false);
                }} 
                  className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 flex items-center gap-2 ${[1, 2, 3, 4, 5, 8, 11].includes(activePage) ? 'bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/20 translate-y-[-1px]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  PO <ChevronDown size={14} className={`transition-transform ${showPoDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showPoDropdown && (
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setShowPoDropdown(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-48 bg-[#1f2937] border border-slate-700 rounded-xl shadow-2xl z-[101] overflow-hidden animate-fadeIn">
                      {[
                        {p:2, n:'RICE PO'},
                        {p:3, n:'CHA PO'},
                        {p:4, n:'FWDR PO'},
                        {p:5, n:'INSP PO'},
                        {p:11, n:'BAGS'},
                        {p:15, n:'BANK PO'},
                        {p:8, n:'ITEM LOAD'}
                      ].map(sub => (
                        <button
                          key={sub.p}
                          onClick={() => {
                            setActivePage(sub.p);
                            setShowPoDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase transition-colors ${activePage === sub.p ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                        >
                          {sub.n}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button 
                onClick={() => {
                  setActivePage(9);
                  setShowPoDropdown(false);
                  setShowSalesDropdown(false);
                }} 
                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${activePage === 9 ? 'bg-amber-400 text-slate-950 shadow-xl shadow-amber-400/20 translate-y-[-1px]' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                DATA BANK
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 bg-[#1f2937] text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase border border-slate-700 hover:bg-slate-700 transition-all group">
                <FileDown size={14} className="text-slate-400 group-hover:scale-110 transition-transform" /> PDF
              </button>
              <button onClick={handleDownloadImage} className="flex items-center gap-2 bg-[#1f2937] text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase border border-slate-700 hover:bg-slate-700 transition-all group">
                <ImageIcon size={14} className="text-teal-400 group-hover:scale-110 transition-transform" /> IMAGE
              </button>
              <button onClick={handleRemoteSync} disabled={isSyncing} className="flex flex-col items-center bg-[#1f2937] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-slate-700 hover:bg-slate-700 transition-all min-w-[80px]">
                <span className="flex items-center gap-1.5"><RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} /> REFRESH</span>
                <span className="text-[8px] text-slate-500 mt-0.5">{lastSync || '00:00:00 PM'}</span>
              </button>
              <button onClick={() => setActivePage(8)} className="flex items-center gap-2 bg-amber-400 text-slate-950 px-5 py-3 rounded-xl text-[11px] font-black uppercase border border-amber-500 shadow-xl shadow-amber-400/20 active:scale-95 transition-all">
                <PlusCircle size={18} /> NEW LOAD
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex xl:hidden items-center gap-2">
            <button onClick={handleRemoteSync} disabled={isSyncing} className="p-2 text-slate-400 hover:text-white transition-colors">
              <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 bg-amber-400 text-slate-950 rounded-lg shadow-lg shadow-amber-400/20 active:scale-95 transition-transform"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar Menu */}
        {isMobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] xl:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="fixed top-0 right-0 h-full w-[280px] bg-[#111827] border-l border-slate-800 z-[70] shadow-2xl xl:hidden flex flex-col animate-slideInRight">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-black text-white uppercase">NAVIGATION</h2>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button 
                  onClick={() => { setActivePage(6); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase transition-all ${activePage === 6 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <LayoutGrid size={18} /> REGISTER
                </button>

                <button 
                  onClick={() => { setActivePage(14); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase transition-all ${activePage === 14 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <FileText size={18} /> INVOICE
                </button>

                <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">SAL CON</div>
                <button 
                  onClick={() => { setActivePage(7); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase transition-all ${activePage === 7 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <FilePlus size={18} /> CREATE SAL CON
                </button>
                <button 
                  onClick={() => { setActivePage(10); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase transition-all ${activePage === 10 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <PlusCircle size={18} /> CREATE INV
                </button>

                <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">PO</div>
                {[
                  {p:2, n:'RICE PO', i: <FileText size={18}/>},
                  {p:3, n:'CHA PO', i: <Truck size={18}/>},
                  {p:4, n:'FWDR PO', i: <Ship size={18}/>},
                  {p:5, n:'INSP PO', i: <Search size={18}/>},
                  {p:11, n:'BAGS', i: <Package size={18}/>},
                  {p:15, n:'BANK PO', i: <Landmark size={18}/>},
                  {p:8, n:'ITEM LOAD', i: <Package size={18}/>}
                ].map(sub => (
                  <button
                    key={sub.p}
                    onClick={() => { setActivePage(sub.p); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase transition-all ${activePage === sub.p ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {sub.i} {sub.n}
                  </button>
                ))}

                <div className="pt-4 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">MASTER DATA</div>
                <button 
                  onClick={() => { setActivePage(9); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-black uppercase transition-all ${activePage === 9 ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                  <Database size={18} /> DATA BANK
                </button>
              </div>
              <div className="p-4 border-t border-slate-800 grid grid-cols-2 gap-2">
                <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all">
                  <FileDown size={14} className="text-slate-400" /> PDF
                </button>
                <button onClick={handleDownloadImage} className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all">
                  <ImageIcon size={14} className="text-teal-400" /> IMAGE
                </button>
              </div>
            </div>
          </>
        )}
      </header>

      <main className="flex-1 max-w-[1850px] mx-auto w-full p-4">
        {activePage === 1 ? (
          <div id="dashboard-content" className="space-y-4 animate-fadeIn p-3 md:p-4 bg-slate-100 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-2xl transition-all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative overflow-visible group hover:shadow-md transition-all min-h-[100px] flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 pl-1">ACTIVE PO SELECTION</label>
                <div className="relative">
                  <select 
                    value={selectedPoId} 
                    onChange={(e) => setSelectedPoId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-black text-slate-900 focus:ring-2 focus:ring-amber-400/20 outline-none appearance-none cursor-pointer"
                  >
                    {purchaseOrders.map(po => <option key={po.id} value={po.id}>{po.poNumber}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all min-h-[100px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">RICE MILL</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-[12px] font-black text-slate-900 leading-relaxed break-words min-h-[48px] flex items-center">
                  {selectedPo?.riceMill || '-'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all min-h-[100px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">ITEM DESCRIPTION</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-[12px] font-black text-slate-900 leading-relaxed break-words min-h-[48px] flex items-center">
                  {selectedPo?.item || '-'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all min-h-[100px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">BROKER NAME</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-[12px] font-black text-slate-900 leading-relaxed break-words min-h-[48px] flex items-center">
                  {selectedPo?.broker || '-'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all min-h-[100px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">PACKING</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-[12px] font-black text-slate-900 leading-relaxed break-words min-h-[48px] flex items-center">
                  {selectedPo?.packing ? `${selectedPo.packing} KG` : '-'}
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all min-h-[100px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pl-1">BRAND</label>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 text-[12px] font-black text-slate-900 leading-relaxed break-words min-h-[48px] flex items-center">
                  {selectedPo?.brand || '-'}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 md:p-5 rounded-2xl md:rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="bg-amber-100 p-2 md:p-2.5 rounded-xl text-amber-600">
                  <LayoutGrid size={20} md:size={24} strokeWidth={3} />
                </div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase">EXPORT ITEM LOADING TABLE</h2>
              </div>
              <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none flex gap-2">
                  <button 
                    onClick={() => setShowColumnFilter(!showColumnFilter)}
                    className={`w-full flex items-center justify-center gap-2 ${showColumnFilter ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'} px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase border border-slate-200 hover:bg-amber-500 hover:text-white transition-all shadow-sm`}
                  >
                    <Settings2 size={14} md:size={16} /> FILTERS
                  </button>
                  {hiddenRowIds.size > 0 && (
                    <button 
                      onClick={resetHiddenRows}
                      className="flex items-center justify-center gap-2 bg-rose-50 text-rose-600 px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase border border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    >
                      <RefreshCw size={14} md:size={16} /> RESET ROWS ({hiddenRowIds.size})
                    </button>
                  )}
                  {showColumnFilter && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
                      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Toggle Columns</span>
                        <button onClick={() => setShowColumnFilter(false)} className="text-slate-400 hover:text-slate-900"><X size={16} /></button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto p-2 grid grid-cols-1 gap-1">
                        {columns.map((col, idx) => (
                          <div key={col.key} className="flex items-center gap-1 group/item">
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveColumn(idx, 'up'); }}
                                disabled={idx === 0}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20"
                              >
                                <ArrowUp size={12} strokeWidth={3} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveColumn(idx, 'down'); }}
                                disabled={idx === columns.length - 1}
                                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-20"
                              >
                                <ArrowDown size={12} strokeWidth={3} />
                              </button>
                            </div>
                            <button 
                              onClick={() => toggleColumn(col.key)}
                              className={`flex-1 flex items-center justify-between px-4 py-2.5 rounded-xl text-[12px] font-bold transition-all ${col.visible ? 'bg-amber-50 text-amber-700' : 'text-slate-400 hover:bg-slate-50'}`}
                            >
                              <span>{col.label}</span>
                              {col.visible && <Check size={14} strokeWidth={4} />}
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-100">
                        <button 
                          onClick={() => setColumns(prev => prev.map(c => ({ ...c, visible: true })))}
                          className="w-full py-2 text-[10px] font-black text-amber-600 uppercase tracking-widest hover:bg-white rounded-lg transition-all"
                        >
                          Show All Columns
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* AI ANALYST button hidden */}
                <div className="bg-slate-100 px-5 py-2.5 rounded-xl flex items-center gap-3 border border-slate-200 shadow-sm"><span className="text-xl font-black text-slate-900">{filteredEntries.length}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RECORDS</span></div>
              </div>
            </div>

            <div className="overflow-x-auto pb-2 -mx-2 px-2">
              <LoadingTable 
                entries={filteredEntries.filter(e => !hiddenRowIds.has(e.id))} 
                columns={columns} 
                sortConfig={sortConfig} 
                onSort={handleSort} 
                onHideRow={toggleRowVisibility}
              />
            </div>
          </div>
        ) : activePage === 12 ? (
          <TemplateBuilder 
            invoiceNoList={invoiceNoList}
            invoiceDetailsList={invoiceDetailsList}
            scDetailsList={scDetailsList}
            registerData={registerData}
            onSaveInvoice={handleSaveInvoice}
            initialData={selectedSavedInvoice}
            onImportAI={async (base64, mimeType) => {
              return await geminiService.extractTemplateFromImage(base64, mimeType);
            }}
          />
        ) : activePage === 13 ? (
          <div className="space-y-6 animate-fadeIn p-4 md:p-8 bg-white rounded-[2rem] border border-slate-200 shadow-xl min-h-[600px]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-2xl text-amber-600">
                  <FolderOpen size={28} strokeWidth={3} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase">SAVED INVOICES</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manage and download your generated invoices</p>
                </div>
              </div>
              <button 
                onClick={() => setActivePage(12)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
              >
                <Plus size={16} /> CREATE NEW INVOICE
              </button>
            </div>

            {savedInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <FileText size={80} strokeWidth={1} className="mb-4 opacity-20" />
                <p className="text-sm font-black uppercase tracking-widest">No saved invoices found</p>
                <button 
                  onClick={() => setActivePage(12)}
                  className="mt-4 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                >
                  Go to Builder to save your first invoice
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedInvoices.map((inv) => (
                  <div key={inv.id} className="group bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 hover:border-amber-400 hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-900 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <button 
                        onClick={() => handleDeleteSavedInvoice(inv.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase mb-1">{inv.templateName || 'Invoice'}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Invoice No:</span>
                        <span className="text-slate-900">{inv.invoiceNo}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Saved On:</span>
                        <span className="text-slate-900">{inv.timestamp}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          setSelectedSavedInvoice(inv);
                          setActivePage(12);
                        }}
                        className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100 transition-all"
                      >
                        EDIT
                      </button>
                      <button 
                        className="w-full py-2.5 bg-amber-400 text-slate-950 rounded-xl text-[10px] font-black uppercase hover:bg-amber-500 transition-all shadow-md shadow-amber-400/10"
                      >
                        DOWNLOAD
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activePage === 14 ? (
          <InvoicePage />
        ) : activePage === 2 ? (
          <div id="white-rice-export" className="animate-fadeIn max-w-[1600px] mx-auto px-2 md:px-4 py-4 space-y-3 pb-40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-amber-400 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] text-slate-950 shadow-2xl shadow-amber-400/30 ring-4 ring-amber-400/10">
                  <FileText size={32} className="md:w-10 md:h-10" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase leading-none">RICE PO</h2>
                  <p className="text-amber-500 font-black tracking-[0.2em] md:tracking-[0.5em] text-[8px] md:text-[10px] ml-1 uppercase">PROCUREMENT MANAGEMENT SYSTEM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setFormData(INITIAL_WHITE_RICE_STATE)} className="flex-1 lg:flex-none bg-slate-100 text-slate-900 px-4 md:px-8 h-14 md:h-20 rounded-[1rem] md:rounded-[1.5rem] border-2 border-slate-200 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-xl hover:bg-slate-200">
                  <Trash2 size={18} className="md:w-6 md:h-6" /> CLEAR
                </button>
                <button disabled={isSubmitting} onClick={() => { 
                  setIsSubmitting(true); 
                  SpreadsheetService.savePoEntry(formData)
                    .then(r => { 
                      alert(r.message); 
                      if (r.success) { 
                        setFormData(INITIAL_WHITE_RICE_STATE); 
                        handleRemoteSync().then(() => setActivePage(6)); 
                      }
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }} className="flex-[2] lg:flex-none bg-amber-400 text-slate-950 px-6 md:px-10 h-14 md:h-20 rounded-[1rem] md:rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-4 text-sm md:text-xl hover:bg-amber-300 group">
                  {isSubmitting ? <RefreshCw size={18} className="animate-spin md:w-6 md:h-6" /> : <Save size={18} className="md:w-6 md:h-6" />} 
                  FINALIZE PO
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">BASIC PO & VENDOR INFORMATION</h3>
              <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                {renderSelectField("purchaseOrderNo", "PURCHASE ORDER NO.", ricePoNumbersList, "col-span-1", <Tag size={20}/>, 'main', (val) => {
                  const savedPo = registerData.find(r => r.type === 'RICE PO' && String(r.purchaseOrderNo) === val);
                  if (savedPo) {
                    setFormData(savedPo);
                  } else {
                    const poDetails = ricePoDetailsList.find((e: any) => {
                      const poKey = Object.keys(e).find(k => {
                        const nk = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                        return nk.includes('PURCHASEORDERNO') || nk === 'PONO' || nk === 'PO';
                      });
                      return poKey && String(e[poKey]).trim() === val;
                    });
                    if (poDetails) {
                      const getValue = (keys: string[]) => {
                        const normalizedSearchKeys = keys.map(k => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''));
                        const exactKey = Object.keys(poDetails).find(k => {
                          const nk = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                          return normalizedSearchKeys.includes(nk);
                        });
                        if (exactKey && (poDetails[exactKey] !== undefined && poDetails[exactKey] !== null)) return poDetails[exactKey];
                        
                        const partialKey = Object.keys(poDetails).find(k => {
                          const nk = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                          return normalizedSearchKeys.some(sk => nk.includes(sk));
                        });
                        return (partialKey && (poDetails[partialKey] !== undefined && poDetails[partialKey] !== null)) ? poDetails[partialKey] : '';
                      };
                      
                      const vendor = vendorsList.find(x => x.name === (getValue(['VENDOR NAME', 'RICE MILL']) || ''));
                      
                      setFormData((p: any) => ({
                        ...p,
                        purchaseOrderNo: val,
                        vendorName: getValue(['VENDOR NAME', 'RICE MILL']) || p.vendorName,
                        itemName: getValue(['ITEM NAME', 'ITEM']) || p.itemName,
                        poDate: getValue(['PO DATE', 'DATE']) || p.poDate,
                        gstin: vendor ? vendor.gstin : p.gstin,
                        billingAddress: vendor ? vendor.address : p.billingAddress,
                        contactPersonName: vendor ? vendor.contactPerson : p.contactPersonName,
                        contactPersonNumber: vendor ? vendor.phone : p.contactPersonNumber,
                        city: vendor ? vendor.city : p.city,
                        state: vendor ? vendor.state : p.state,
                        pincode: vendor ? vendor.pincode : p.pincode,
                        variety: getValue(['VARIETY']) || p.variety,
                        totalQuantityMt: getValue(['TOTAL QUANTITY', 'QUANTITY', 'QTY', 'TOTAL QUANTITY MT', 'TOTAL QUANTITY (MT)', 'MT', 'TONS', 'TON']) || p.totalQuantityMt,
                        packingSize: getValue(['PACKING SIZE', 'PACKING']) || p.packingSize,
                        noOfBags: getValue(['NO OF BAGS', 'BAGS']) || p.noOfBags,
                        bagType: getValue(['BAG TYPE']) || p.bagType,
                        bagMarkingBrand: getValue(['BAG MARKING BRAND', 'BRAND', 'MARKING']) || p.bagMarkingBrand,
                        specifications: getValue(['SPECIFICATIONS']) || p.specifications,
                        ratePerMt: getValue(['RATE PER MT', 'RATE']) || p.ratePerMt,
                        totalPoValue: getValue(['TOTAL PO VALUE', 'TOTAL VALUE']) || p.totalPoValue,
                        freightIncludedExtra: getValue(['FREIGHT']) || p.freightIncludedExtra,
                        advanceAmount: getValue(['ADVANCE AMOUNT', 'ADVANCE']) || p.advanceAmount,
                        paymentTerms: getValue(['PAYMENT TERMS']) || p.paymentTerms,
                        broker: getValue(['BROKER']) || p.broker,
                        brokerageRate: getValue(['BROKERAGE RATE', 'BROKERAGE']) || p.brokerageRate,
                        surveyorAgency: getValue(['SURVEYOR AGENCY', 'SURVEYOR']) || p.surveyorAgency,
                        deliveryType: getValue(['DELIVERY TYPE']) || p.deliveryType,
                        deliveryLocationAddress: getValue(['DELIVERY LOCATION', 'LOCATION']) || p.deliveryLocationAddress,
                        loadingInstruction: getValue(['LOADING INSTRUCTION']) || p.loadingInstruction,
                        modeOfTransport: getValue(['MODE OF TRANSPORT', 'TRANSPORT']) || p.modeOfTransport,
                        dispatchSchedule: getValue(['DISPATCH SCHEDULE', 'SCHEDULE']) || p.dispatchSchedule,
                        remark: getValue(['REMARK', 'REMARKS']) || p.remark,
                      }));
                    } else {
                      setFormData((p: any) => ({ ...p, purchaseOrderNo: val }));
                    }
                  }
                })}
                {renderMultiSelectField("againstSc", "AGAINST SC", scContractList, "col-span-1", <Layers size={20}/>)}
                {renderMultiSelectField("againstInvoice", "AGAINST INVOICE", invoiceNoList, "col-span-1", <FileSearch size={20}/>)}
                {renderInputField("poDate", "PO DATE", "", "date", "col-span-1", <Calendar size={20}/>)}
                {renderSelectField("vendorName", "VENDOR NAME", vendorsList.map(v => v.name), "md:col-span-2", <Landmark size={20}/>, 'main', (v) => {
                  const vendor = vendorsList.find(x => x.name === v);
                  if (vendor) setFormData(p => ({ ...p, vendorName: v, gstin: vendor.gstin, billingAddress: vendor.address, contactPersonName: vendor.contactPerson, contactPersonNumber: vendor.phone, city: vendor.city, state: vendor.state, pincode: vendor.pincode }));
                })}
                {renderInputField("gstin", "GSTIN", "", "text", "md:col-span-1", <FileCheck size={20}/>)}
                {renderInputField("contactPersonName", "CONTACT PERSON", "", "text", "md:col-span-1", <User size={20}/>)}
                {renderInputField("contactPersonNumber", "PHONE", "", "tel", "md:col-span-1", <Phone size={20}/>)}
                {renderInputField("billingAddress", "BILLING ADDRESS", "", "text", "md:col-span-2", <MapPin size={20}/>)}
                {renderInputField("city", "CITY", "", "text", "md:col-span-1", <MapPinned size={20}/>)}
                {renderSelectField("state", "STATE", INDIAN_STATES, "md:col-span-1", <Globe size={20}/>)}
                {renderInputField("pincode", "PINCODE", "", "text", "md:col-span-1", <Hash size={20}/>)}
                {renderSelectField("inspectionRequired", "INSPECTION REQUIRED?", ["YES", "NO"], "md:col-span-1", <ShieldCheck size={20}/>)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">ITEM & PACKING SPECIFICATIONS</h3>
              <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInputField("loadingLocation", "LOADING LOCATION", "", "text", "col-span-1", <MapPin size={20}/>)}
                {renderSelectField("itemName", "ITEM NAME", itemNamesList, "col-span-1", <Package size={20}/>)}
                {renderSelectField("variety", "VARIETY", varietyList, "col-span-1", <ListTodo size={20}/>)}
                {renderInputField("totalQuantityMt", "TOTAL QTY (MT)", "0.00", "number", "col-span-1", <Scale size={20}/>)}
                {renderSelectField("packingSize", "PACKING SIZE", packingSizeList.length > 0 ? packingSizeList : ["50", "25", "20", "10", "5"], "col-span-1", <Scale size={20}/>)}
                {renderInputField("noOfBags", "NO. OF BAGS", "", "text", "col-span-1", <Hash size={20}/>)}
                {renderSelectField("bagType", "BAG TYPE", bagTypesList, "col-span-1", <Package size={20}/>)}
                {renderSelectField("bagMarkingBrand", "BRAND / MARKING", brandsList, "col-span-1", <Tag size={20}/>)}
                {renderInputField("anySpecialInstructions", "SPECIAL INSTRUCTIONS", "", "text", "col-span-1", <MessageSquare size={20}/>)}
                {renderSelectField("specifications", "SPECIFICATIONS", specificationsList, "col-span-3", <ClipboardEdit size={20}/>)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">FINANCIAL DETAILS (₹)</h3>
              <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                {renderInputField("ratePerMt", "RATE (₹ PER MT)", "0.00", "number", "col-span-1", <IndianRupee size={20}/>)}
                {renderInputField("totalPoValue", "TOTAL PO VALUE (₹)", "0.00", "number", "col-span-1")}
                {renderSelectField("freightIncludedExtra", "FREIGHT INCLUDED / EXTRA", ["INCLUDED", "EXTRA"], "col-span-1", <Truck size={20}/>)}
                {renderInputField("advanceAmount", "ADVANCE AMOUNT", "0.00", "number", "col-span-1", <CreditCard size={20}/>)}
                {renderSelectField("paymentTerms", "PAYMENT TERMS", paymentTermsList, "col-span-4", <FileCheck size={20}/>)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">BROKER & SURVEYOR INFORMATION</h3>
              <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderSelectField("broker", "BROKER NAME", brokersList, "col-span-1", <Briefcase size={20}/>)}
                {renderInputField("surveyorAgency", "SURVEYOR AGENCY", "AGENCY NAME...", "text", "col-span-1", <SearchCheck size={20}/>)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">LOGISTICS & DISPATCH INFORMATION</h3>
              <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
                {renderSelectField("deliveryType", "DELIVERY TYPE", deliveryTypesList, "md:col-span-4", <MapPinned size={20}/>)}
                {renderInputField("deliveryLocationAddress", "DELIVERY LOCATION ADDRESS", "EXACT LOCATION...", "text", "md:col-span-8", <Navigation size={20}/>)}
                {renderInputField("loadingInstruction", "LOADING INSTRUCTION", "INSTRUCTIONS...", "text", "md:col-span-6", <ClipboardList size={20}/>)}
                {renderSelectField("modeOfTransport", "MODE OF TRANSPORT", modesOfTransportList, "md:col-span-6", <Truck size={20}/>)}
                {renderInputField("dispatchSchedule", "DISPATCH SCHEDULE", "TIMELINE...", "text", "md:col-span-12", <Clock size={20}/>)}
                {renderInputField("remark", "REMARK", "ADDITIONAL NOTES...", "text", "md:col-span-12", <MessageSquare size={20}/>)}
              </div>
            </div>
          </div>
        ) : activePage === 3 ? (
          <div id="cha-export" className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-4 space-y-4 pb-40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-indigo-500 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] text-white shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-500/10">
                  <Ship className="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-none">CHA PO</h2>
                  <p className="text-indigo-500 font-black tracking-[0.5em] text-[8px] md:text-[10px] ml-1 uppercase">CUSTOMS & LOGISTICS SYSTEM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => setChaFormData(INITIAL_CHA_FORM_STATE)} className="flex-1 md:flex-none bg-slate-100 text-slate-900 px-4 md:px-8 h-12 md:h-20 rounded-xl md:rounded-[1.5rem] border-2 border-slate-200 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-xl hover:bg-slate-200">
                  <Trash2 className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" /> CLEAR
                </button>
                <button disabled={isSubmitting} onClick={() => { 
                  setIsSubmitting(true); 
                  SpreadsheetService.saveChaEntry(chaFormData)
                    .then(r => { 
                      alert(r.message); 
                      if (r.success) { 
                        setChaFormData(INITIAL_CHA_FORM_STATE); 
                        handleRemoteSync().then(() => setActivePage(6)); 
                      }
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }} className="flex-[2] md:flex-none bg-indigo-500 text-white px-6 md:px-10 h-12 md:h-20 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-4 text-sm md:text-xl hover:bg-indigo-400 group">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save className="w-[18px] h-[18px] md:w-[24px] md:h-[24px] group-hover:translate-y-[-2px] transition-transform" />} 
                  FINALIZE CHA
                </button>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] border-4 md:border-[8px] border-slate-100 p-4 md:p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
              {renderSelectField("chaPoNo", "CHA PO NO", Array.from(new Set(registerData.filter(r => r.type === 'CHA PO').map(r => String(r.chaPoNo)).filter(Boolean))) as string[], "md:col-span-2", <Tag size={20}/>, 'cha', (val) => {
                const savedPo = registerData.find(r => r.type === 'CHA PO' && String(r.chaPoNo) === val);
                if (savedPo) {
                  setChaFormData(savedPo);
                } else {
                  setChaFormData((p: any) => ({ ...p, chaPoNo: val }));
                }
              })}
              {renderInputField("chaPoDate", "CHA PO DATE", "", "date", "md:col-span-2", <Calendar size={20}/>, 'cha')}
              {renderSelectField("vendorName", "VENDOR NAME", vendorsList.map(v => v.name), "md:col-span-4", <Building2 size={20}/>, 'cha')}
              {renderMultiSelectField("againstSc", "AGAINST SC", scContractList, "md:col-span-2", <Layers size={20}/>, 'cha')}
              {renderMultiSelectField("againstInvoice", "AGAINST INVOICE", invoiceNoList, "md:col-span-2", <FileText size={20}/>, 'cha')}
            </div>
            <div className="bg-slate-50 rounded-[2rem] border-[8px] border-slate-100 p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4">
              {renderInputField("containerBookingNumber", "BOOKING NO", "# #", "text", "md:col-span-4", <Hash size={20}/>, 'cha')}
              {renderSelectField("shippingLine", "SHIPPING LINE", shippingLineList, "md:col-span-4", <Anchor size={20}/>, 'cha')}
              {renderSelectField("portOfLoading", "PORT OF LOADING", portOfLoadingList, "md:col-span-4", <MapPin size={20}/>, 'cha')}
              
              {renderSelectField("portOfDispatched", "PORT OF DISPATCH", portOfDischargeList, "md:col-span-4", <Navigation size={20}/>, 'cha')}
              {renderSelectField("portOfArrival", "PORT OF ARRIVAL", portOfArrivalList, "md:col-span-4", <Anchor size={20}/>, 'cha')}
              {renderInputField("vesselSailingDate", "VESSEL SAILING DATE", "", "date", "md:col-span-4", <Clock size={20}/>, 'cha')}
              {renderSelectField("exportItem", "EXPORT ITEM", itemNamesList, "md:col-span-4", <Package size={20}/>, 'cha')}
              {renderSelectField("variety", "VARIETY", varietyList, "md:col-span-4", <ListTodo size={20}/>, 'cha')}
              {renderSelectField("bagBrand", "BRAND", brandsList, "md:col-span-4", <Tag size={20}/>, 'cha')}
              {renderSelectField("forwarder", "FORWARDER", vendorsList.map(v => v.name), "md:col-span-4", <Truck size={20}/>, 'cha')}
              {renderInputField("quantity", "QUANTITY(TON)", "TYPE HERE...", "text", "md:col-span-8", <Scale size={20}/>, 'cha')}
              {renderSelectField("stuffingLoading", "CONTAINERSTUFFING / TRUCK LOADING", ["CONTAINER STUFFING", "TRUCK LOADING", "BOTH"], "md:col-span-12", <Truck size={20}/>, 'cha')}
              
              {renderMultiSelectWithQuantity("riceMill", "RICE MILL", vendorsList.map(v => v.name), "md:col-span-12", <Building2 size={20}/>, 'cha')}
              {renderInputField("remark", "REMARK", "NOTES...", "text", "md:col-span-12", <MessageSquare size={20}/>, 'cha')}
            </div>
          </div>
        ) : activePage === 4 ? (
          <div id="forwarder-export" className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-4 space-y-3 pb-40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-emerald-500 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] text-white shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500/10">
                  <Globe className="w-[30px] h-[30px] md:w-[40px] md:h-[40px]" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-none">FORWARDER PO</h2>
                  <p className="text-emerald-500 font-black tracking-[0.5em] text-[8px] md:text-[10px] ml-1 uppercase">OCEAN FREIGHT SYSTEM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => setForwarderFormData(INITIAL_FORWARDER_FORM_STATE)} className="flex-1 md:flex-none bg-slate-100 text-slate-900 px-4 md:px-8 h-12 md:h-20 rounded-xl md:rounded-[1.5rem] border-2 border-slate-200 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-xl hover:bg-slate-200">
                  <Trash2 className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" /> CLEAR
                </button>
                <button disabled={isSubmitting} onClick={() => { 
                  setIsSubmitting(true); 
                  SpreadsheetService.saveForwarderEntry(forwarderFormData)
                    .then(r => { 
                      alert(r.message); 
                      if (r.success) { 
                        setForwarderFormData(INITIAL_FORWARDER_FORM_STATE); 
                        handleRemoteSync().then(() => setActivePage(6)); 
                      }
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }} className="flex-[2] md:flex-none bg-emerald-500 text-white px-6 md:px-10 h-12 md:h-20 rounded-xl md:rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-4 text-sm md:text-xl hover:bg-emerald-400 group">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" />} 
                  FINALIZE FWD
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-2xl md:rounded-[2rem] border-4 md:border-[8px] border-slate-100 p-4 md:p-8 shadow-sm space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {renderSelectField("forwarderPo", "FORWARDER PO", Array.from(new Set(registerData.filter(r => r.type === 'FORWARDER PO').map(r => String(r.forwarderPo)).filter(Boolean))) as string[], "col-span-1", <Tag size={20}/>, 'forwarder', (val) => {
                  const savedPo = registerData.find(r => r.type === 'FORWARDER PO' && String(r.forwarderPo) === val);
                  if (savedPo) {
                    setForwarderFormData(savedPo);
                  } else {
                    setForwarderFormData((p: any) => ({ ...p, forwarderPo: val }));
                  }
                })}
                {renderInputField("poDate", "PO DATE", "dd/mm/yyyy", "date", "col-span-1", <Calendar size={20}/>, 'forwarder')}
                {renderSelectField("vendorName", "VENDOR NAME", vendorsList.map(v => v.name), "col-span-1", <Building2 size={20}/>, 'forwarder')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 falcon-forwarder-ports-grid">
                {renderSelectField("portOfLoading", "PORT OF LOADING", portOfLoadingList, "col-span-1", <MapPin size={20}/>, 'forwarder')}
                {renderSelectField("portOfDispatched", "PORT OF DISPATCHED", portOfDischargeList, "col-span-1", <Navigation size={20}/>, 'forwarder')}
                {renderSelectField("portOfArrival", "PORT OF ARRIVAL", portOfArrivalList, "col-span-1", <AnchorIcon size={20}/>, 'forwarder')}
                {renderInputField("qtyCntr", "QTY [CNTR]", "0", "number", "col-span-1", <Box size={20}/>, 'forwarder')}
                
                {renderInputField("vesselSailingDate", "VESSEL SAILING DATE", "dd/mm/yyyy", "date", "col-span-1", <Clock size={20}/>, 'forwarder')}
                {renderSelectField("shippingLine", "SHIPPING LINE", shippingLineList, "col-span-1", <Anchor size={20}/>, 'forwarder')}
                {renderSelectField("currency", "CHA", vendorsList.map(v => v.name), "md:col-span-2", <User size={20}/>, 'forwarder')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 falcon-forwarder-rates-grid">
                {renderForwarderRateSlot('ratePerContainer')}
                {renderForwarderRateSlot('otherRate1')}
                {renderForwarderRateSlot('otherRate2')}
                {renderForwarderRateSlot('otherRate3')}
                {renderForwarderRateSlot('otherRate4')}
              </div>
            </div>
          </div>
        ) : activePage === 5 ? (
          <div id="inspection-export" className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-4 space-y-3 pb-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="bg-blue-600 p-4 rounded-[1.5rem] text-white shadow-2xl shadow-blue-600/30 ring-4 ring-blue-600/10">
                  <ShieldCheck size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-6xl font-black text-slate-900 uppercase leading-none">INSPECTION PO</h2>
                  <p className="text-blue-600 font-black tracking-[0.5em] text-[10px] ml-1 uppercase">QUALITY CONTROL SYSTEM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setInspectionFormData(INITIAL_INSPECTION_FORM_STATE)} className="bg-slate-100 text-slate-900 px-8 h-20 rounded-[1.5rem] border-2 border-slate-200 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 text-xl hover:bg-slate-200">
                  <Trash2 size={24} /> CLEAR
                </button>
                <button disabled={isSubmitting} onClick={() => { 
                  setIsSubmitting(true); 
                  SpreadsheetService.saveInspectionEntry(inspectionFormData)
                    .then(r => { 
                      alert(r.message); 
                      if (r.success) { 
                        setInspectionFormData(INITIAL_INSPECTION_FORM_STATE); 
                        handleRemoteSync().then(() => setActivePage(6)); 
                      }
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }} className="bg-blue-600 text-white px-10 h-20 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-4 text-xl hover:bg-blue-500 group">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />} 
                  FINALIZE INS
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-4 falcon-inspection-grid">
              {renderSelectField("inspectionPo", "INSPECTION PO", Array.from(new Set(registerData.filter(r => r.type === 'INSPECTION PO').map(r => String(r.inspectionPo)).filter(Boolean))) as string[], "col-span-1 md:col-span-2", <Tag size={20}/>, 'inspection', (val) => {
                const savedPo = registerData.find(r => r.type === 'INSPECTION PO' && String(r.inspectionPo) === val);
                if (savedPo) {
                  setInspectionFormData(savedPo);
                } else {
                  setInspectionFormData((p: any) => ({ ...p, inspectionPo: val }));
                }
              })}
              {renderSelectField("vendorName", "VENDOR NAME", vendorsList.map(v => v.name), "col-span-1 md:col-span-2", <Building2 size={20}/>, 'inspection')}
              {renderInputField("poDate", "PO DATE", "", "date", "col-span-1 md:col-span-2", <Calendar size={20}/>, 'inspection')}
              {renderSelectField("falconInvoiceReff", "FALCON INVOICE REFF", invoiceNoList, "col-span-1 md:col-span-2", <FileText size={20}/>, 'inspection')}
              {renderSelectField("inspectionType", "INSPECTION TYPE", ["PSI", "PSI+TRUCK LOADER", "PSI +TRUCK LOADER +CNTR STUFFING", "CNTR STUFFING+PSI"], "col-span-1 md:col-span-2", <Shield size={20}/>, 'inspection')}
              {renderSelectField("falconInvoice", "FALCON INVOICE", invoiceNoList, "col-span-1 md:col-span-2", <FileText size={20}/>, 'inspection')}
            </div>

            <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 falcon-inspection-grid">
              {renderSelectField("purchaseOrderNo", "PURCHASE ORDER NO.", ricePoNumbersList, "col-span-1", <Tag size={20}/>, 'inspection', (val) => {
                const savedRicePo = registerData.find(r => r.type === 'RICE PO' && String(r.purchaseOrderNo) === val);
                if (savedRicePo) {
                  setInspectionFormData((p: any) => ({
                    ...p,
                    purchaseOrderNo: val,
                    item: savedRicePo.itemName || p.item,
                    riceMill: savedRicePo.vendorName || p.riceMill,
                    quantity: savedRicePo.totalQuantityMt || p.quantity,
                    brand: savedRicePo.bagMarkingBrand || p.brand,
                    packing: savedRicePo.packingSize || p.packing,
                    itemVendorAddress: savedRicePo.billingAddress || p.itemVendorAddress,
                    brokerName: savedRicePo.broker || p.brokerName,
                  }));
                  return;
                }

                const poDetails = ricePoDetailsList.find((e: any) => {
                  const poKey = Object.keys(e).find(k => {
                    const nk = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                    return nk.includes('PURCHASEORDERNO') || nk === 'PONO' || nk === 'PO';
                  });
                  return poKey && String(e[poKey]).trim() === val;
                });
                if (poDetails) {
                  const getValue = (keys: string[]) => {
                    const normalizedSearchKeys = keys.map(k => k.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    const exactKey = Object.keys(poDetails).find(k => {
                      const nk = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                      return normalizedSearchKeys.includes(nk);
                    });
                    if (exactKey && (poDetails[exactKey] !== undefined && poDetails[exactKey] !== null)) return poDetails[exactKey];
                    
                    const partialKey = Object.keys(poDetails).find(k => {
                      const nk = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
                      return normalizedSearchKeys.some(sk => nk.includes(sk));
                    });
                    return (partialKey && (poDetails[partialKey] !== undefined && poDetails[partialKey] !== null)) ? poDetails[partialKey] : '';
                  };
                  setInspectionFormData((p: any) => ({
                    ...p,
                    purchaseOrderNo: val,
                    item: getValue(['ITEM NAME', 'ITEM']) || p.item,
                    riceMill: getValue(['VENDOR NAME', 'RICE MILL']) || p.riceMill,
                    falconInvoiceReff: getValue(['AGAINST INVOICE', 'INVOICE NO', 'INVOICE NO.']) || p.falconInvoiceReff,
                    falconInvoice: getValue(['AGAINST INVOICE', 'INVOICE NO', 'INVOICE NO.']) || p.falconInvoice,
                    quantity: getValue(['TOTAL QUANTITY', 'TOTAL QTY', 'QUANTITY', 'QTY', 'TOTAL QUANTITY MT', 'TOTAL QUANTITY (MT)', 'MT', 'TONS', 'TON']) || p.quantity,
                    itemVendorAddress: getValue(['BILLING ADDRESS', 'ADDRESS']) || p.itemVendorAddress,
                    brokerName: getValue(['BROKER', 'BROKER NAME']) || p.brokerName,
                    brand: getValue(['BAG MARKING BRAND', 'BRAND', 'BAG BRAND', 'MARKING']) || p.brand,
                    packing: getValue(['PACKING SIZE', 'PACKING']) || p.packing
                  }));
                } else {
                  setInspectionFormData((p: any) => ({ ...p, purchaseOrderNo: val }));
                }
              })}
              {renderSelectField("item", "ITEM NAME", itemNamesList, "col-span-1", <Package size={20}/>, 'inspection')}
              {renderSelectField("riceMill", "RICE MILL", vendorsList.map(v => v.name), "col-span-1", <Building2 size={20}/>, 'inspection')}
              {renderInputField("quantity", "QUANTITY", "0.00", "text", "col-span-1", <Scale size={20}/>, 'inspection')}
              {renderInputField("itemVendorAddress", "VENDOR ADDRESS", "", "text", "col-span-1", <MapPin size={20}/>, 'inspection')}
              {renderSelectField("brokerName", "BROKER NAME", brokersList, "col-span-1", <User size={20}/>, 'inspection')}
              {renderSelectField("brand", "BRAND", brandsList, "col-span-1", <Tag size={20}/>, 'inspection')}
              {renderSelectField("packing", "PACKING", packingSizeList.length > 0 ? packingSizeList : ["50 KG", "25 KG", "20 KG", "10 KG", "5 KG"], "col-span-1", <Box size={20}/>, 'inspection')}
              {renderInputField("remarkAfterPacking", "REMARK AFTER PACKING", "NOTES...", "text", "col-span-1", <MessageSquare size={20}/>, 'inspection')}
            </div>

            <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 falcon-inspection-grid">
              {renderInputField("loadingSchedule", "LOADING SCHEDULE", "ASAP / DATE...", "text", "col-span-3", <Clock size={20}/>, 'inspection')}
            </div>
          </div>
        ) : activePage === 11 ? (
          <div id="bags-export" className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-4 space-y-6 pb-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="bg-purple-500 p-4 rounded-[1.5rem] text-white shadow-2xl shadow-purple-500/30 ring-4 ring-purple-500/10">
                  <Package size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-6xl font-black text-slate-900 uppercase leading-none">BAGS PO</h2>
                  <p className="text-purple-500 font-black tracking-[0.5em] text-[10px] ml-1 uppercase">BAG PROCUREMENT SYSTEM</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setBagsFormData(INITIAL_BAGS_FORM_STATE)} className="bg-slate-100 text-slate-900 px-8 h-20 rounded-[1.5rem] border-2 border-slate-200 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-3 text-xl hover:bg-slate-200">
                  <Trash2 size={24} /> CLEAR
                </button>
                <button disabled={isSubmitting} onClick={() => { 
                  setIsSubmitting(true); 
                  SpreadsheetService.saveBagsEntry(bagsFormData)
                    .then(r => { 
                      alert(r.message); 
                      if (r.success) { 
                        setBagsFormData(INITIAL_BAGS_FORM_STATE); 
                        handleRemoteSync().then(() => setActivePage(6)); 
                      }
                    })
                    .finally(() => {
                      setIsSubmitting(false);
                    });
                }} className="bg-purple-500 text-white px-10 h-20 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-4 text-xl hover:bg-purple-600 group">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />} 
                  FINALIZE BAGS PO
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Section 1 */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-purple-500 pl-3">SECTION 1: BASIC DETAILS</h3>
                <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderInputField("poDate", "DATE", "", "date", "col-span-1", <Calendar size={20}/>, 'bags')}
                  {renderSelectField("bagsPoNo", "PO. NO.", bagsPoNumbersList, "col-span-1", <Tag size={20}/>, 'bags')}
                  {renderSelectField("vendorName", "VENDOR NAME", vendorsList.map(v => v.name), "col-span-1 md:col-span-1", <User size={20}/>, 'bags')}
                  {renderSelectField("falconInvReff", "FALCON INV. REFF", invoiceNoList, "col-span-1", <FileText size={20}/>, 'bags')}
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-purple-500 pl-3">SECTION 2: BAG SPECIFICATIONS</h3>
                <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                  {renderInputField("bagMarking", "BAG MARKING", "", "text", "col-span-1", <Tag size={20}/>, 'bags')}
                  {renderSelectField("bagPacking", "BAG PACKING", ["25", "50"], "col-span-1", <Package size={20}/>, 'bags')}
                  {renderSelectField("bagWt", "BAG WT.", emptyBagsWeightList, "col-span-1", <Scale size={20}/>, 'bags')}
                  {renderSelectField("bagType", "BAG TYPE", bagTypesList, "col-span-1", <Box size={20}/>, 'bags')}
                  {renderInputField("qty", "QTY", "", "text", "col-span-1", <Scale size={20}/>, 'bags')}
                  {renderInputField("noOfBags", "NO OF BAGS", "", "text", "col-span-1", <Hash size={20}/>, 'bags')}
                  {renderInputField("bagMarkingPhoto", "BAG MARKING PHOTO", "", "file", "col-span-1 md:col-span-2", <Camera size={20}/>, 'bags')}
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-purple-500 pl-3">SECTION 3: DELIVERY</h3>
                <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {renderMultiSelectWithQuantity("deliveryVendor", "DELIVERY ADDRESS", vendorsList.map(v => v.name), "col-span-1", <User size={20}/>, 'bags')}
                  </div>
                  <div className="bg-white/50 p-4 rounded-xl border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ADDRESS 1</p>
                    <div className="space-y-2">
                      {(bagsFormData.deliveryVendor || '').split(', ').filter(Boolean).map((item: string, idx: number) => {
                        const match = item.match(/^(.*) \((.*)\)$/);
                        const name = match ? match[1] : item;
                        const qty = match ? match[2] : '';
                        const vendor = vendorsList.find(v => v.name === name);
                        return (
                          <div key={idx} className="border-b border-slate-100 last:border-0 pb-2 last:pb-0">
                            <p className="text-xs font-black text-indigo-600 uppercase">{name}{qty ? ` (${qty})` : ''}</p>
                            <p className="text-lg font-bold text-slate-900">
                              {[
                                vendor?.addressLine1,
                                vendor?.addressLine2,
                                vendor?.city,
                                vendor?.pincode,
                                vendor?.state
                              ].filter(Boolean).map(s => String(s).trim()).filter(Boolean).join(' ') || '-'}
                            </p>
                          </div>
                        );
                      })}
                      {!(bagsFormData.deliveryVendor || '').split(', ').filter(Boolean).length && (
                        <p className="text-lg font-bold text-slate-900">-</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-purple-500 pl-3">SECTION 4: ADDITIONAL</h3>
                <div className="bg-slate-50 rounded-[1.5rem] border-[6px] border-slate-100 p-5 shadow-sm">
                  {renderInputField("remark", "REMARK", "", "text", "w-full", <MessageSquare size={20}/>, 'bags')}
                </div>
              </div>
            </div>
          </div>
        ) : activePage === 15 ? (
          <div id="bank-po-export" className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* TOP BAR */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-sky-200">
                  <Landmark size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none uppercase">CREATE BANK PO</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Financial Management</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setBankFormData(INITIAL_BANK_PO_STATE)}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                  Clear
                </button>
                <button 
                  onClick={() => setActivePage(1)}
                  className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!bankFormData.bankPoNo) {
                      alert("Please enter Bank PO Number");
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      const res = await SpreadsheetService.saveGenericEntry(
                        { ...bankFormData, dateSaved: new Date().toISOString(), type: "BANK PO" }, 
                        "REGISTER"
                      );
                      if (res.success) {
                        alert("Bank PO saved successfully!");
                        setBankFormData(INITIAL_BANK_PO_STATE);
                        handleRemoteSync().then(() => setActivePage(6)); 
                      } else {
                        alert("Failed to save: " + res.message);
                      }
                    } catch (error) {
                      alert("Error saving: " + (error as Error).message);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }} className="bg-sky-600 text-white px-10 h-20 rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center gap-4 text-xl hover:bg-sky-700 group">
                  {isSubmitting ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />} 
                  FINALIZE BANK PO
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-10">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Section 1: Basic Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-sky-500 pl-3">SECTION 1: BASIC DETAILS</h3>
                  <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
                    {renderInputField("bankPoNo", "BANK PO NO", "", "text", "col-span-1", <Tag size={20}/>, 'bank')}
                    {renderInputField("poDate", "PO DATE", "", "date", "col-span-1", <Calendar size={20}/>, 'bank')}
                    {renderSelectField("vendorName", "VENDOR NAME", vendorsList.map(v => v.name), "col-span-1", <User size={20}/>, 'bank')}
                    {renderSelectField("againstSc", "AGAINST SC", scContractList, "col-span-1", <FileText size={20}/>, 'bank')}
                    {renderSelectField("againstInvoice", "AGAINST INVOICE", invoiceNoList, "col-span-1", <FileText size={20}/>, 'bank')}
                  </div>
                </div>

                {/* Section 2: Bank Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-sky-500 pl-3">SECTION 2: BANK DETAILS</h3>
                  <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("bankName", "BANK NAME", "", "text", "col-span-1", <Landmark size={20}/>, 'bank')}
                    {renderInputField("branchName", "BRANCH NAME", "", "text", "col-span-1", <MapPin size={20}/>, 'bank')}
                    {renderInputField("accountNo", "ACCOUNT NO", "", "text", "col-span-1", <Hash size={20}/>, 'bank')}
                    {renderInputField("ifscCode", "IFSC CODE", "", "text", "col-span-1", <ShieldCheck size={20}/>, 'bank')}
                    {renderInputField("swiftCode", "SWIFT CODE", "", "text", "col-span-1", <Globe size={20}/>, 'bank')}
                  </div>
                </div>

                {/* Section 3: Intermediary Bank */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-sky-500 pl-3">SECTION 3: INTERMEDIARY BANK</h3>
                  <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderInputField("intermediaryBank", "INTERMEDIARY BANK", "", "text", "col-span-1", <Landmark size={20}/>, 'bank')}
                    {renderInputField("swiftCodeIntermediary", "SWIFT CODE (INTERMEDIARY)", "", "text", "col-span-1", <Globe size={20}/>, 'bank')}
                  </div>
                </div>

                {/* Section 4: Remarks */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-sky-500 pl-3">SECTION 4: ADDITIONAL</h3>
                  <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
                    {renderInputField("remark", "REMARK", "", "text", "w-full", <MessageSquare size={20}/>, 'bank')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activePage === 7 ? (
          <div id="sales-contract-export" className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* TOP BAR */}
            <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <FileText size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none uppercase">CREATE SAL CON</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Trade Management</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSalesFormData(INITIAL_SALES_CONTRACT_STATE)}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-widest"
                >
                  <Trash2 size={16} />
                  Clear
                </button>
                <button 
                  onClick={() => setActivePage(1)}
                  className="px-6 py-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!salesFormData.salesContractNo) {
                      alert("Please enter Sales Contract Number");
                      return;
                    }
                    setIsSubmitting(true); 
                    try {
                      const res = await SpreadsheetService.saveGenericEntry(
                        { ...salesFormData, dateSaved: new Date().toISOString(), type: "SALES CONTRACT" }, 
                        "SALES CONTRACT"
                      );
                      if (res.success) {
                        alert("Sales Contract saved successfully!");
                        setSalesFormData(INITIAL_SALES_CONTRACT_STATE);
                        handleRemoteSync();
                      } else {
                        alert("Failed to save: " + res.message);
                      }
                    } catch (error) {
                      alert("Error saving: " + (error as Error).message);
                    } finally {
                      setIsSubmitting(false); 
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 flex items-center gap-3 rounded-2xl"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Save Contract
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-10">
              <div className="max-w-7xl mx-auto">
                {/* FORM CONTENT */}
                <div className="space-y-6 md:space-y-8">
                  <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200 shadow-xl p-6 md:p-12 space-y-8 md:space-y-12">
                    {/* SECTION 1: IDENTITY */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                      {renderSelectField("salesContractNo", "SAL CON NO.", scContractList, "col-span-1", <Tag size={20}/>, 'sales')}
                      {renderInputField("contractDate", "CONTRACT DATE", "", "date", "col-span-1", null, 'sales')}
                      {renderInputField("otherReferences", "OTHER REFERENCE(S)", "Ref...", "text", "col-span-1", null, 'sales')}
                    </div>

                    {/* SECTION 2: PARTIES */}
                    <div className="space-y-6 md:space-y-8 pt-6 md:pt-8 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {renderSelectField("buyer", "BUYER", partiesList, "col-span-1", null, 'sales')}
                        {renderSelectField("consignee", "CONSIGNEE", partiesList, "col-span-1", null, 'sales')}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {renderSelectField("firstNotifyParty", "1ST NOTIFY PARTY", partiesList, "col-span-1", null, 'sales')}
                        {renderSelectField("secondNotifyParty", "2ND NOTIFY PARTY", partiesList, "col-span-1", null, 'sales')}
                        {renderSelectField("thirdNotifyParty", "3RD NOTIFY PARTY", partiesList, "col-span-1", null, 'sales')}
                        {renderSelectField("fourthNotifyParty", "4TH NOTIFY PARTY", partiesList, "col-span-1", null, 'sales')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {renderSelectField("fifthNotifyParty", "5TH NOTIFY PARTY", partiesList, "col-span-1", null, 'sales')}
                        {renderSelectField("indentor", "INDENTOR", vendorsList.map(v => v.name), "col-span-1", null, 'sales')}
                      </div>
                    </div>

                    {/* SECTION 3: LOGISTICS */}
                    <div className="space-y-8 pt-8 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {renderInputField("countryOfOrigin", "COUNTRY OF ORIGIN OF GOODS", "INDIA", "text", "col-span-1", null, 'sales', undefined, true)}
                        {renderSelectField("countryOfFinalDestination", "COUNTRY OF FINAL DESTINATION", portOfArrivalList, "col-span-1", null, 'sales')}
                        {renderSelectField("finalDestination", "FINAL DESTINATION", portOfArrivalList, "col-span-1", null, 'sales')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {renderSelectField("portOfLoading", "PORT OF LOADING", portOfLoadingList, "col-span-1", null, 'sales')}
                        {renderSelectField("portOfDischarge", "PORT OF DISCHARGE", portOfDischargeList, "col-span-1", null, 'sales')}
                        {renderSelectField("descriptionOfGoods", "DESCRIPTION OF GOODS", itemNamesList, "col-span-1", null, 'sales')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {renderSelectField("brand", "BRAND", brandsList, "col-span-1", null, 'sales')}
                        {renderSelectField("incoterms", "INCOTERMS", ["FOB", "CIF", "CFR", "EXW", "DDP", "DDU"], "col-span-1", null, 'sales')}
                        {renderInputField("contractQty", "CONTRACT QTY.", "0.00", "number", "col-span-1", null, 'sales')}
                      </div>
                    </div>

                    {/* SECTION 4: FINANCIALS */}
                    <div className="space-y-8 pt-8 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {renderSelectField("currency", "CURRENCY", currencyList, "col-span-1", null, 'sales')}
                        {renderInputField("ratePerMts", "RATE/MTS", "0.00", "number", "col-span-1", null, 'sales')}
                        {renderSelectField("hsCode", "HS CODE", hsCodeList, "col-span-1", null, 'sales')}
                        {renderInputField("totalContractualValue", "TOTAL CONTRACTUAL VALUE", "0.00", "number", "col-span-1", null, 'sales')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {renderSelectField("termsOfPayment", "TERMS OF PAYMENT", paymentTermsList, "col-span-1", null, 'sales')}
                        {renderInputField("totalShipmentTill", "TOTAL SHIPMENT TILL", "", "date", "col-span-1", null, 'sales')}
                      </div>
                    </div>

                    {/* SECTION 5: PACKING & OTHER */}
                    <div className="space-y-8 pt-8 border-t border-slate-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {renderSelectField("emptyBagsWeightGrams", "EMPTY BAGS WEIGHT (IN GRAMS)", emptyBagsWeightList, "col-span-1", null, 'sales')}
                        {renderSelectField("packingKgs", "PACKING (IN KGS)", packingSizeList, "col-span-1", null, 'sales')}
                        {renderSelectField("packingDetails", "PACKING DETAILS", bagTypesList, "col-span-1", null, 'sales')}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {renderSelectField("ectnTakenBy", "ECTN HAS TO BE TAKEN BY", ["THE BUYER", "THE SELLER"], "col-span-1", null, 'sales')}
                        {renderSelectField("soldUnsold", "SOLD/UNSOLD", ["SOLD", "UNSOLD"], "col-span-1", null, 'sales')}
                        {renderInputField("note4", "NOTE 4", "...", "text", "col-span-1", null, 'sales')}
                      </div>
                    </div>

                    {/* SECTION 6: SPECIFICATIONS */}
                    <div className="space-y-8 pt-8 border-t border-slate-100">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <Scale size={18} className="text-indigo-600" />
                        SPECIFICATIONS
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                        {renderInputField("specMoisture", "MOISTURE (%)", "14% MAX", "text", "col-span-1", null, 'sales')}
                        {renderInputField("specDamaged", "DAMAGED (%)", "2% MAX", "text", "col-span-1", null, 'sales')}
                        {renderInputField("specForeignMatter", "FOREIGN MATTER (%)", "1% MAX", "text", "col-span-1", null, 'sales')}
                        {renderInputField("specBlackTipped", "BLACK TIPPED (%)", "0.5% MAX", "text", "col-span-1", null, 'sales')}
                        {renderInputField("specAvgGrainLength", "AVG. GRAIN LENGTH (MM)", "6.00 MM", "text", "col-span-1", null, 'sales')}
                      </div>
                    </div>
                  </div>

                  {/* FOOTER SUMMARY */}
                  <div className="bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-2xl shadow-indigo-900/20">
                    <div className="flex flex-col gap-2 items-center md:items-start">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Contract Value</span>
                      <div className="flex items-baseline gap-2 md:gap-3">
                        <span className="text-indigo-400 font-black text-xl md:text-2xl">{salesFormData.currency || 'USD'}</span>
                        <span className="text-4xl md:text-6xl font-black">
                          {parseFloat(salesFormData.totalContractualValue || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-8 md:gap-12">
                      <div className="text-center md:text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1 md:mb-2">Quantity</span>
                        <span className="text-xl md:text-2xl font-black">{salesFormData.contractQty || '0'} MT</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1 md:mb-2">Rate</span>
                        <span className="text-xl md:text-2xl font-black">{salesFormData.ratePerMts || '0'} /MT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activePage === 10 ? (
          <div id="invoice-export" className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-8 space-y-8 pb-40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-amber-400 p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] text-slate-950 shadow-2xl shadow-amber-400/30 ring-4 ring-amber-400/10">
                  <FilePlus size={32} className="md:w-10 md:h-10" strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase leading-none">CREATE INVOICE</h2>
                  <p className="text-amber-500 font-black tracking-[0.2em] md:tracking-[0.5em] text-[8px] md:text-[10px] ml-1 uppercase">NEW INVOICE REGISTRATION SYSTEM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <button onClick={() => setInvoiceFormData(INITIAL_INVOICE_FORM_STATE)} className="flex-1 lg:flex-none bg-slate-100 text-slate-900 px-4 md:px-8 h-14 md:h-20 rounded-[1rem] md:rounded-[1.5rem] border-2 border-slate-200 font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 text-sm md:text-xl hover:bg-slate-200">
                  <Trash2 size={18} className="md:w-6 md:h-6" /> CLEAR
                </button>
                <button 
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!invoiceFormData.invoiceNo) {
                      alert('Please enter an invoice number.');
                      return;
                    }
                    setIsSubmitting(true);
                    try {
                      const res = await SpreadsheetService.saveDropdownOption('AGAINST INVOICE', invoiceFormData.invoiceNo, invoiceFormData);
                      alert(res.message);
                      if (res.success) {
                        setInvoiceFormData(INITIAL_INVOICE_FORM_STATE);
                        handleRemoteSync();
                      }
                    } catch (e) {
                      alert('Failed to save invoice.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="flex-[2] lg:flex-none bg-slate-900 text-white px-6 md:px-10 h-14 md:h-20 rounded-[1rem] md:rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-4 text-sm md:text-xl hover:bg-slate-800 group"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin md:w-6 md:h-6" /> : <Save className="md:w-6 md:h-6" />} SAVE INVOICE
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* SECTION 0: SALES CONTRACT REFERENCE (READ-ONLY) */}
              <div className="space-y-4 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">SALES CONTRACT REFERENCE (READ-ONLY)</h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select SC No. to view details</span>
                </div>
                <div className="bg-slate-50/50 rounded-[2rem] border-4 border-slate-100 p-6 shadow-inner">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {renderSelectField('againstSc', 'SALES CONTRACT NO.', scContractList, 'col-span-1 md:col-span-2 lg:col-span-2', <FileText size={18}/>, 'invoice')}
                    {renderInputField('contractDate', 'CONTRACT DATE', '', 'date', 'col-span-1', <Calendar size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('buyer', 'BUYER', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('consignee', 'CONSIGNEE', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('contractQty', 'CONTRACT QTY', '', 'text', 'col-span-1', <Scale size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('currency', 'CURRENCY', '', 'text', 'col-span-1', <DollarSign size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('ratePerMts', 'RATE/MTS', '', 'text', 'col-span-1', <IndianRupee size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('totalContractualValue', 'TOTAL VALUE', '', 'text', 'col-span-1', <Calculator size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('portOfLoading', 'PORT OF LOADING', '', 'text', 'col-span-1', <Anchor size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('portOfDischarge', 'PORT OF DISCHARGE', '', 'text', 'col-span-1', <Anchor size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('finalDestination', 'FINAL DESTINATION', '', 'text', 'col-span-1', <MapPin size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('descriptionOfGoods', 'GOODS DESC', '', 'text', 'col-span-1', <Package size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('brand', 'BRAND', '', 'text', 'col-span-1', <Tag size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('incoterms', 'INCOTERMS', '', 'text', 'col-span-1', <FileText size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('hsCode', 'HS CODE', '', 'text', 'col-span-1', <Hash size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('termsOfPayment', 'PAYMENT TERMS', '', 'text', 'col-span-1', <CreditCard size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('totalShipmentTill', 'SHIPMENT TILL', '', 'text', 'col-span-1', <Calendar size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('packingDetails', 'PACKING', '', 'text', 'col-span-1', <Package size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('packingKgs', 'PACKING KGS', '', 'text', 'col-span-1', <Package size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('emptyBagsWeightGrams', 'EMPTY BAGS WT', '', 'text', 'col-span-1', <Scale size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('countryOfOrigin', 'ORIGIN', '', 'text', 'col-span-1', <Globe size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('countryOfFinalDestination', 'FINAL DEST COUNTRY', '', 'text', 'col-span-1', <Globe size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('indentor', 'INDENTOR', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('firstNotifyParty', '1ST NOTIFY', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('secondNotifyParty', '2ND NOTIFY', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('thirdNotifyParty', '3RD NOTIFY', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('fourthNotifyParty', '4TH NOTIFY', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('fifthNotifyParty', '5TH NOTIFY', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('otherReferences', 'OTHER REFS', '', 'text', 'col-span-1', <FileText size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('ectnTakenBy', 'ECTN BY', '', 'text', 'col-span-1', <User size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('soldUnsold', 'SOLD/UNSOLD', '', 'text', 'col-span-1', <Check size={18}/>, 'invoice', undefined, true)}
                    {renderInputField('note4', 'NOTE 4', '', 'text', 'col-span-1', <FileText size={18}/>, 'invoice', undefined, true)}
                  </div>
                </div>
              </div>

              {/* SECTION 1: BASIC INVOICE INFO */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">BASIC INVOICE INFO</h3>
                <div className="bg-white rounded-[2rem] border-4 border-slate-50 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderSelectField('invoiceNo', 'INVOICE NO.', invoiceNoList, 'col-span-1', <Hash size={18}/>, 'invoice')}
                  {renderInputField('invoiceDate', 'INVOICE DATE', '', 'date', 'col-span-1', <Calendar size={18}/>, 'invoice')}
                </div>
              </div>

              {/* SECTION 2: SHIPMENT & LOGISTICS */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">SHIPMENT & LOGISTICS</h3>
                <div className="bg-white rounded-[2rem] border-4 border-slate-50 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInputField('preCarriageBy', 'PRE-CARRIAGE BY', 'ROAD/RAIL', 'text', 'col-span-1', <Truck size={18}/>, 'invoice')}
                  {renderInputField('preCarrier', 'PRE-CARRIER', 'NAME...', 'text', 'col-span-1', <Truck size={18}/>, 'invoice')}
                  {renderInputField('shippingLine', 'SHIPPING LINE', 'LINE NAME...', 'text', 'col-span-1', <Ship size={18}/>, 'invoice')}
                  {renderInputField('fclBreakBulk', 'FCL/BREAK BULK', 'QTY...', 'text', 'col-span-1', <Package size={18}/>, 'invoice')}
                  {renderInputField('pol', 'PORT OF LOADING (POL)', 'PORT...', 'text', 'col-span-1', <Anchor size={18}/>, 'invoice')}
                  {renderInputField('cutOffPol', 'CUT OFF POL', '', 'date', 'col-span-1', <Clock size={18}/>, 'invoice')}
                  {renderInputField('pod', 'PORT OF DISPATCHED (POD)', 'PORT...', 'text', 'col-span-1', <MapPin size={18}/>, 'invoice')}
                  {renderInputField('poa', 'PORT OF ARRIVAL (POA)', 'PORT...', 'text', 'col-span-1', <MapPinned size={18}/>, 'invoice')}
                </div>
              </div>

              {/* SECTION 3: WEIGHT & QUANTITY */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">WEIGHT & QUANTITY</h3>
                <div className="bg-white rounded-[2rem] border-4 border-slate-50 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInputField('netWtMt', 'NET WT. (IN MTS)', '0.000', 'number', 'col-span-1', <Scale size={18}/>, 'invoice')}
                  {renderInputField('totalBags', 'TOTAL BAGS', '0', 'number', 'col-span-1', <Hash size={18}/>, 'invoice')}
                  {renderInputField('invQty', 'INV QTY', '0', 'number', 'col-span-1', <Layers size={18}/>, 'invoice')}
                  {renderInputField('invRate', 'INV RATE', '0.00', 'number', 'col-span-1', <IndianRupee size={18}/>, 'invoice')}
                </div>
              </div>

              {/* SECTION 4: FINANCIALS */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">FINANCIALS</h3>
                <div className="bg-white rounded-[2rem] border-4 border-slate-50 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderInputField('fobRate', 'FOB (RATES/MTS)', '0.00', 'number', 'col-span-1', <DollarSign size={18}/>, 'invoice')}
                  {renderInputField('freightRate', 'FREIGHT (RATES/MTS)', '0.00', 'number', 'col-span-1', <Truck size={18}/>, 'invoice')}
                  {renderInputField('insuranceRate', 'INSURANCE (RATES/MTS)', '0.00', 'number', 'col-span-1', <ShieldCheck size={18}/>, 'invoice')}
                  {renderInputField('cif', 'CIF', '0.00', 'number', 'col-span-1', <Calculator size={18}/>, 'invoice')}
                  {renderInputField('cifCheck', 'CIF CHECK', '0.00', 'number', 'col-span-1', <CheckCircle2 size={18}/>, 'invoice')}
                  {renderInputField('invoiceAmt', 'INVOICE AMT', '0.00', 'number', 'col-span-1', <IndianRupee size={18}/>, 'invoice')}
                </div>
              </div>

              {/* SECTION 5: SHIPPING DOCUMENTS & TRACKING */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-amber-400 pl-3">SHIPPING DOCUMENTS & TRACKING</h3>
                <div className="bg-white rounded-[2rem] border-4 border-slate-50 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderInputField('sbNo', 'SB NO.', '...', 'text', 'col-span-1', <FileText size={18}/>, 'invoice')}
                  {renderInputField('sbDate', 'SB DATE', '', 'date', 'col-span-1', <Calendar size={18}/>, 'invoice')}
                  {renderInputField('portCode', 'PORT CODE', '...', 'text', 'col-span-1', <Hash size={18}/>, 'invoice')}
                  {renderInputField('rodtepAmt', 'RODTEP AMT', '0.00', 'number', 'col-span-1', <IndianRupee size={18}/>, 'invoice')}
                  {renderInputField('sbForexRate', 'SB.FOREX RATE', '0.00', 'number', 'col-span-1', <RefreshCw size={18}/>, 'invoice')}
                  {renderInputField('blNo', 'BL NO.', '...', 'text', 'col-span-1', <FileText size={18}/>, 'invoice')}
                  {renderInputField('vesselVoyageNo', 'VESSEL/VOYAG NO', '...', 'text', 'col-span-1', <Ship size={18}/>, 'invoice')}
                  {renderInputField('vesselEtd', 'VESSEL ETD', '', 'date', 'col-span-1', <Clock size={18}/>, 'invoice')}
                  {renderInputField('vesselEta', 'VESSEL ETA', '', 'date', 'col-span-1', <Clock size={18}/>, 'invoice')}
                  {renderInputField('scriptCompleted', 'SCRIPT COMPLETED', '...', 'text', 'col-span-1', <Check size={18}/>, 'invoice')}
                  {renderInputField('remark', 'REMARK', 'NOTES...', 'text', 'col-span-1', <MessageSquare size={18}/>, 'invoice')}
                </div>
              </div>
            </div>
          </div>
        ) : activePage === 8 ? (
          <div id="item-loading-export" className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-4 space-y-4 pb-40">
            {/* ITEM LOADING HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 border-b border-slate-100 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg text-white">
                  <Truck size={20} />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase">ITEM LOADING</h2>
                  <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">LOGISTICS & LOADING SYSTEM</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setActivePage(1)}
                  className="bg-white text-slate-700 px-3 md:px-4 h-9 md:h-10 rounded-lg border border-slate-200 font-bold uppercase tracking-wider text-[10px] md:text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <LayoutGrid size={14} />
                  DASHBOARD
                </button>

                <button 
                  onClick={() => setItemLoadingFormData(INITIAL_ITEM_LOADING_STATE)} 
                  className="bg-white text-slate-700 px-3 md:px-4 h-9 md:h-10 rounded-lg border border-slate-200 font-bold uppercase tracking-wider text-[10px] md:text-xs hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  CLEAR
                </button>

                <button 
                  disabled={isSubmitting} 
                  onClick={async () => {
                    setIsSubmitting(true); 
                    try {
                      const groupId = itemLoadingFormData.groupId || `grp-${Date.now()}`;
                      const { loadingRows, ...commonData } = itemLoadingFormData;
                      
                      // Find rows to delete (if editing and a row was removed)
                      const originalEntry = registerData.find(r => r.groupId === groupId || r.id === groupId);
                      if (originalEntry && originalEntry.loadingRows) {
                        const originalRowIds = originalEntry.loadingRows.map((r: any) => r.id).filter(Boolean);
                        const currentRowIds = loadingRows.map((r: any) => r.id).filter(Boolean);
                        const rowsToDelete = originalRowIds.filter((id: string) => !currentRowIds.includes(id));
                        
                        for (const id of rowsToDelete) {
                          await SpreadsheetService.deleteFromRegister(id, 'ITEM LOADING');
                        }
                      }

                      const results = [];
                      for (let index = 0; index < loadingRows.length; index++) {
                        const row = loadingRows[index];
                        const rowId = row.id || `reg-${Date.now()}-${index}`;
                        const result = await SpreadsheetService.saveItemLoadingEntry({ 
                          ...commonData, 
                          ...row, 
                          id: rowId,
                          groupId: groupId 
                        });
                        results.push(result);
                        // Small delay to prevent Google Apps Script concurrent write issues
                        if (index < loadingRows.length - 1) {
                          await new Promise(resolve => setTimeout(resolve, 500));
                        }
                      }
                      
                      const allSuccess = results.every(r => r.success);
                      alert(allSuccess ? "All entries saved successfully!" : "Some entries failed to save.");
                      if (allSuccess) { 
                        setItemLoadingFormData(INITIAL_ITEM_LOADING_STATE); 
                        handleRemoteSync().then(() => setActivePage(6));
                      } 
                    } catch (error) {
                      alert("Error saving entry: " + (error as Error).message);
                    } finally {
                      setIsSubmitting(false); 
                    }
                  }} 
                  className="bg-blue-600 text-white px-6 h-10 rounded-lg font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                  FINALIZE LOADING
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* SECTION 1: CORE DETAILS */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                {renderSelectField("againstInvoice", "AGAINST INVOICE", invoiceNoList, "col-span-1", <FileText size={16}/>, 'itemLoading')}
                {renderSelectField("againstPo", "AGAINST PO", ricePoNumbersList, "col-span-1", <ClipboardList size={16}/>, 'itemLoading', (val) => {
                  const poDetails = ricePoDetailsList.find((e: any) => {
                    const poKey = Object.keys(e).find(k => k.trim().toUpperCase().includes('PURCHASE ORDER NO'));
                    return poKey && String(e[poKey]).trim() === val;
                  });
                  if (poDetails) {
                    const getValue = (keys: string[]) => {
                      const exactKey = Object.keys(poDetails).find(k => keys.includes(k.trim().toUpperCase()));
                      if (exactKey && poDetails[exactKey]) return poDetails[exactKey];
                      const partialKey = Object.keys(poDetails).find(k => {
                        const upperK = k.trim().toUpperCase();
                        return keys.some(key => upperK.includes(key));
                      });
                      return partialKey ? poDetails[partialKey] : '';
                    };
                    setItemLoadingFormData((p: any) => {
                      const newRate = getValue(['RATE']) || p.rate;
                      const newPacking = getValue(['PACKING SIZE', 'PACKING']) || p.packing;
                      const newBrokerageRate = getValue(['BROKERAGE RATE', 'BROKERAGE']) || p.brokerageRate;
                      const next = {
                        ...p,
                        againstPo: val,
                        riceMill: getValue(['VENDOR NAME', 'RICE MILL']) || p.riceMill,
                        item: getValue(['ITEM NAME', 'ITEM']) || p.item,
                        unit: getValue(['UNIT']) || p.unit,
                        rate: newRate,
                        brand: getValue(['BRAND', 'BRAND / MARKING']) || p.brand,
                        packing: newPacking,
                        againstInvoice: getValue(['AGAINST INVOICE', 'INVOICE NO', 'INVOICE NO.']) || p.againstInvoice,
                        invoiceDate: getValue(['PO DATE', 'DATE']) || p.invoiceDate,
                        brokerageRate: newBrokerageRate,
                      };
                      
                      const parsedRate = parseFloat(newRate) || 0;
                      const parsedPacking = parseFloat(newPacking) || 0;
                      const bagsWtGrams = parseFloat(p.bagsWtGrams) || 0;
                      const cdPercent = parseFloat(p.cdPercent) || 0;
                      const brokerageRate = parseFloat(newBrokerageRate) || 0;
                      next.loadingRows = (next.loadingRows || []).map((row: any) => {
                        const qty = parseFloat(row.qtyTon) || 0;
                        let bags = row.bags;
                        let bagsNum = parseFloat(bags) || 0;
                        if (parsedPacking > 0) {
                          bagsNum = Math.ceil((qty * 1000) / parsedPacking);
                          bags = bagsNum.toString();
                        } else {
                          bags = '0';
                        }
                        const amount = qty * parsedRate;
                        const bagsWtDedAmt = (((bagsWtGrams / 1000) * bagsNum) / 1000) * parsedRate;
                        const grossAmt = amount - bagsWtDedAmt;
                        
                        const tdsAmount = amount * 0.001;
                        const cdAmt = amount * (cdPercent / 100);
                        
                        const brokerageAmt = qty * brokerageRate;
                        const otherDedAmt = parseFloat(row.otherDedAmt) || 0;
                        const netAmt = grossAmt + tdsAmount - brokerageAmt - otherDedAmt - cdAmt;
                        
                        return { 
                          ...row, 
                          amount: amount.toFixed(2), 
                          bags, 
                          bagsWtDedAmt: bagsWtDedAmt.toFixed(2), 
                          grossAmt: grossAmt.toFixed(2),
                          tdsAmount: tdsAmount.toFixed(2),
                          cdAmt: cdAmt.toFixed(2),
                          brokerage: brokerageAmt.toFixed(2),
                          netAmt: netAmt.toFixed(2)
                        };
                      });
                      
                      return next;
                    });
                  } else {
                    handleInputChange('againstPo', val, 'itemLoading');
                  }
                })}
                {renderInputField("invoiceDate", "INVOICE DATE", "", "date", "col-span-1", <Calendar size={16}/>, 'itemLoading')}
                {renderInputField("invoiceNo", "INVOICE NO.", "INV-...", "text", "col-span-1", <Hash size={16}/>, 'itemLoading')}
                {renderSelectField("riceMill", "RICE MILL", vendorsList.map(v => v.name), "col-span-1", <Building2 size={16}/>, 'itemLoading')}
                
                {renderSelectField("item", "ITEM", itemNamesList, "col-span-1", <Package size={16}/>, 'itemLoading')}
                {renderSelectField("unit", "UNIT", ["MT", "KG", "PCS", "TON"], "col-span-1", <Scale size={16}/>, 'itemLoading')}
                {renderInputField("rate", "RATE", "0.00", "number", "col-span-1", <IndianRupee size={16}/>, 'itemLoading')}
                {renderSelectField("brand", "BRAND", brandsList, "col-span-1", <Tag size={16}/>, 'itemLoading')}
                {renderSelectField("packing", "PACKING", packingSizeList, "col-span-1", <Box size={16}/>, 'itemLoading')}
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderInputField("cdPercent", "CD %", "0.00", "number", "col-span-1", <Percent size={16}/>, 'itemLoading')}
                {renderInputField("bagsWtGrams", "BAGS WT. (IN GRAMS)", "0", "number", "col-span-1", <Scale size={16}/>, 'itemLoading')}
                {renderInputField("brokerageRate", "BROKRAGE RS 100/MT", "0.00", "number", "col-span-1", <IndianRupee size={16}/>, 'itemLoading')}
              </div>

              {/* SECTION 3: LOADING LOGS & SUMMARY */}
              <div className="space-y-3">
                {itemLoadingFormData.loadingRows?.map((row: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3 md:p-4 shadow-sm relative group flex flex-col md:flex-row gap-3 md:gap-4">
                    {/* Row Number */}
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold text-sm">
                      {idx + 1}
                    </div>
                    
                    {/* Row Content */}
                    <div className="flex-grow space-y-3">
                      {/* Loading Details */}
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-3">
                        <div className="col-span-2 md:col-span-1">
                          {renderInputField("loadingDate", "LOADING DATE", "", "date", "w-full", <Calendar size={14}/>, 'itemLoading', idx)}
                        </div>
                        {renderInputField("vhNo", "VH. NO.", "VH-...", "text", "col-span-1", <Truck size={14}/>, 'itemLoading', idx)}
                        {renderInputField("cntrNo", "CNTR. NO.", "CNTR-...", "text", "col-span-1", <Container size={14}/>, 'itemLoading', idx)}
                        {renderInputField("qtyTon", "QTY (IN TON)", "0.00", "number", "col-span-1", <Scale size={14}/>, 'itemLoading', idx)}
                        {renderInputField("bags", "BAGS", "0", "number", "col-span-1", <Layers size={14}/>, 'itemLoading', idx)}
                        {renderInputField("grossWt", "GROSS WT.", "0.00", "number", "col-span-1", <Scale size={14}/>, 'itemLoading', idx)}
                        {renderInputField("tareWt", "TARE WT.", "0.00", "number", "col-span-1", <Scale size={14}/>, 'itemLoading', idx)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-3">
                        {renderInputField("netWt", "NET WT.", "0.00", "number", "col-span-1", <Scale size={14}/>, 'itemLoading', idx, true)}
                        {renderInputField("wbSlipPhoto", "WB SLIP PHOTO", "", "file", "col-span-1", <Camera size={14}/>, 'itemLoading', idx)}
                        <div className="col-span-2 md:col-span-1">
                          {renderInputField("transporterName", "TRANSPORTER NAME", "NAME...", "text", "w-full", <Truck size={14}/>, 'itemLoading', idx)}
                        </div>
                        {renderInputField("freight", "FREIGHT", "0.00", "number", "col-span-1", <IndianRupee size={14}/>, 'itemLoading', idx)}
                        {renderInputField("otherDed", "OTHER DED.", "REASON...", "text", "col-span-1", <AlertCircle size={14}/>, 'itemLoading', idx)}
                        {renderInputField("otherDedAmt", "OTHER DED. AMT.", "0.00", "number", "col-span-1", <IndianRupee size={14}/>, 'itemLoading', idx)}
                        <div className="col-span-2 md:col-span-1">
                          {renderInputField("remark", "REMARK", "NOTES...", "text", "w-full", <MessageSquare size={14}/>, 'itemLoading', idx)}
                        </div>
                      </div>

                      {/* Summary Fields (Now integrated into the row, light background) */}
                      <div className="bg-slate-50 rounded-xl p-2 md:p-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 border border-slate-100">
                        {renderInputField("amount", "AMOUNT", "0.00", "number", "col-span-1", <IndianRupee size={14} className="text-slate-400"/>, 'itemLoading', idx, true)}
                        {renderInputField("bagsWtDedAmt", "BAGS WT. DED. AMT.", "0.00", "number", "col-span-1", <IndianRupee size={14} className="text-slate-400"/>, 'itemLoading', idx, true)}
                        {renderInputField("grossAmt", "GROSS AMT", "0.00", "number", "col-span-1", <IndianRupee size={14} className="text-slate-400"/>, 'itemLoading', idx, true)}
                        {renderInputField("tdsAmount", "TDS @ 0.1%", "0.00", "number", "col-span-1", <Percent size={14} className="text-slate-400"/>, 'itemLoading', idx, true)}
                        {renderInputField("cdAmt", "CD AMT.", "0.00", "number", "col-span-1", <IndianRupee size={14} className="text-slate-400"/>, 'itemLoading', idx, true)}
                        {renderInputField("netAmt", "NET AMT", "0.00", "number", "col-span-1", <IndianRupee size={14} className="text-slate-400"/>, 'itemLoading', idx, true)}
                      </div>
                    </div>
                    
                    {itemLoadingFormData.loadingRows.length > 1 && (
                      <button 
                        onClick={() => {
                          setItemLoadingFormData((p: any) => ({
                            ...p,
                            loadingRows: p.loadingRows.filter((_: any, i: number) => i !== idx)
                          }));
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Minus size={14} />
                      </button>
                    )}
                  </div>
                ))}

                <button 
                  onClick={() => {
                    setItemLoadingFormData((p: any) => ({
                      ...p,
                      loadingRows: [...p.loadingRows, { 
                        loadingDate: p.loadingDate || '', vhNo: '', cntrNo: '', bags: '', qtyTon: '', grossWt: '', tareWt: '', netWt: '',
                        wbSlipPhoto: '', transporterName: '', freight: '', otherDed: '', otherDedAmt: '', remark: '',
                        amount: '', bagsWtDedAmt: '', grossAmt: '', tdsAmount: '', cdAmt: '', netAmt: '', brokerage: ''
                      }]
                    }));
                  }}
                  className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-bold hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> ADD LOADING ROW {itemLoadingFormData.loadingRows?.length + 1}
                </button>
              </div>
            </div>
          </div>
        ) : activePage === 6 ? (
          <div className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-4 space-y-4 pb-40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-amber-400 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] text-slate-950 shadow-2xl shadow-amber-400/30 ring-4 ring-amber-400/10">
                  <Database size={30} md:size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase leading-none">REGISTER</h2>
                  <p className="text-amber-500 font-black tracking-[0.5em] text-[8px] md:text-[10px] ml-1 uppercase">SAVED PURCHASE ORDERS</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative group w-full md:w-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" size={18} />
                  <input 
                    type="text"
                    placeholder="SEARCH REGISTER..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 md:py-3 font-bold text-slate-900 focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all text-sm outline-none shadow-sm placeholder:text-slate-300 w-full md:min-w-[300px]"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl md:rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="p-4 md:p-6">Date Saved</th>
                      <th className="p-4 md:p-6">Type</th>
                      <th className="p-4 md:p-6">PO Number / ID</th>
                      <th className="p-4 md:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                  {registerData
                    .filter((entry: any) => {
                      if (!searchTerm.trim()) return true;
                      const t = searchTerm.toLowerCase();
                      const poNo = String(
                        entry.type === 'ITEM LOADING' ? entry.againstPo : 
                        entry.type === 'INSPECTION PO' ? entry.inspectionPo :
                        entry.type === 'CHA PO' ? entry.chaPoNo :
                        entry.type === 'FORWARDER PO' ? entry.forwarderPo :
                        (entry.purchaseOrderNo || entry.invoiceNo || entry.id || '')
                      ).toLowerCase();
                      const vendor = String(entry.vendorName || entry.itemVendorName || '').toLowerCase();
                      const item = String(entry.itemName || entry.item || '').toLowerCase();
                      return poNo.includes(t) || vendor.includes(t) || item.includes(t);
                    })
                    .sort((a: any, b: any) => new Date(b.dateSaved || 0).getTime() - new Date(a.dateSaved || 0).getTime())
                    .map((entry: any, idx: number) => {
                      const handleEditItemLoading = (entry: any) => {
                        let parsedLoadingRows = INITIAL_ITEM_LOADING_STATE.loadingRows;
                        if (entry.loadingRows) {
                          if (typeof entry.loadingRows === 'string') {
                            try { parsedLoadingRows = JSON.parse(entry.loadingRows); } catch(e) {}
                          } else if (Array.isArray(entry.loadingRows)) {
                            parsedLoadingRows = entry.loadingRows;
                          }
                        } else {
                          // Migrate old entry
                          parsedLoadingRows = [{
                            loadingDate: entry.loadingDate || '',
                            vhNo: entry.vhNo || '',
                            cntrNo: entry.cntrNo || '',
                            bags: entry.bags || '',
                            qtyTon: entry.qtyTon || '',
                            grossWt: entry.grossWt || '',
                            tareWt: entry.tareWt || '',
                            netWt: entry.netWt || '',
                            wbSlipPhoto: entry.wbSlipPhoto || '',
                            transporterName: entry.transporterName || '',
                            freight: entry.freight || '',
                            otherDed: entry.otherDed || '',
                            otherDedAmt: entry.otherDedAmt || '',
                            remark: entry.remark || ''
                          }];
                        }
                        
                        let calculatedBrokerageRate = '';
                        if (parsedLoadingRows && parsedLoadingRows.length > 0) {
                          const firstRow = parsedLoadingRows[0];
                          const qty = parseFloat(firstRow.qtyTon) || 0;
                          const amt = parseFloat((firstRow as any).brokerage) || 0;
                          if (qty > 0) {
                            calculatedBrokerageRate = (amt / qty).toFixed(2);
                          } else if (amt > 0) {
                            calculatedBrokerageRate = amt.toFixed(2);
                          }
                        }
                        
                        setItemLoadingFormData({ ...entry, loadingRows: parsedLoadingRows, brokerageRate: calculatedBrokerageRate });
                        setActivePage(8);
                      };

                      return (
                    <tr 
                      key={`${entry.id}-${idx}`} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => {
                        if (entry.type === 'RICE PO') {
                          setFormData(entry);
                          setActivePage(2);
                        } else if (entry.type === 'CHA PO') {
                          setChaFormData(entry);
                          setActivePage(3);
                        } else if (entry.type === 'FORWARDER PO') {
                          setForwarderFormData(entry);
                          setActivePage(4);
                        } else if (entry.type === 'INSPECTION PO') {
                          setInspectionFormData(entry);
                          setActivePage(5);
                        } else if (entry.type === 'ITEM LOADING') {
                          handleEditItemLoading(entry);
                        }
                      }}
                    >
                      <td className="p-6 text-sm font-medium text-slate-600">
                        {new Date(entry.dateSaved).toLocaleString()}
                      </td>
                      <td className="p-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">
                          {entry.type}
                        </span>
                      </td>
                      <td className="p-6 text-sm font-bold text-slate-900">
                        {entry.type === 'ITEM LOADING' ? (entry.againstPo || entry.id) : 
                         entry.type === 'INSPECTION PO' ? (entry.inspectionPo || entry.id) :
                         entry.type === 'CHA PO' ? (entry.chaPoNo || entry.id) :
                         entry.type === 'FORWARDER PO' ? (entry.forwarderPo || entry.id) :
                         (entry.purchaseOrderNo || entry.invoiceNo || entry.id)}
                      </td>
                      <td className="p-6 text-right space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (entry.type === 'RICE PO') {
                              setFormData(entry);
                              setActivePage(2);
                            } else if (entry.type === 'CHA PO') {
                              setChaFormData(entry);
                              setActivePage(3);
                            } else if (entry.type === 'FORWARDER PO') {
                              setForwarderFormData(entry);
                              setActivePage(4);
                            } else if (entry.type === 'INSPECTION PO') {
                              setInspectionFormData(entry);
                              setActivePage(5);
                            } else if (entry.type === 'ITEM LOADING') {
                              handleEditItemLoading(entry);
                            }
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-sm uppercase tracking-wider"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this record?')) {
                              // Optimistic update
                              const originalData = [...registerData];
                              setRegisterData(prev => prev.filter(item => item.id !== entry.id));
                              
                              try {
                                if (entry.type === 'ITEM LOADING' && entry.loadingRows && entry.loadingRows.length > 0 && entry.loadingRows[0].id) {
                                  for (const row of entry.loadingRows) {
                                    if (row.id) {
                                      await SpreadsheetService.deleteFromRegister(row.id, entry.type);
                                    }
                                  }
                                } else {
                                  await SpreadsheetService.deleteFromRegister(entry.id, entry.type);
                                }
                                // Wait 2 seconds before fetching to allow Sheets to update fully
                                setTimeout(async () => {
                                  const updated = await SpreadsheetService.fetchRegister();
                                  // Only update if we actually got data back to avoid clearing the register on network blips
                                  if (updated && updated.length > 0) {
                                    setRegisterData(updated.filter((item: any) => item.id !== entry.id));
                                  } else if (updated && updated.length === 0 && originalData.length === 1) {
                                    // If it was the last item and now it's empty, that's fine
                                    setRegisterData([]);
                                  }
                                  // If updated is empty but we had many items, it's likely a fetch error, so we keep the optimistic state
                                }, 2000);
                              } catch (err) {
                                console.error('Delete failed:', err);
                                setRegisterData(originalData);
                                alert('Failed to delete the record. Please try again.');
                              }
                            }
                          }}
                          className="text-rose-600 hover:text-rose-800 font-bold text-sm uppercase tracking-wider"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                  {registerData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">
                        No saved records found in the register.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        ) : activePage === 9 ? (
          <div className="animate-fadeIn max-w-[1600px] mx-auto px-4 py-6 md:py-12 space-y-8 md:space-y-12 pb-60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="bg-indigo-600 p-3 md:p-5 rounded-xl md:rounded-2xl text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-600/10">
                  <Database size={24} md:size={40} strokeWidth={2.5} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase leading-none">DATA BANK</h2>
                  <p className="text-indigo-500 font-black tracking-[0.5em] text-[8px] md:text-[10px] ml-1 md:ml-2 uppercase">MASTER DATA MANAGEMENT</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="lg:col-span-1 space-y-2">
                <div className="flex items-center justify-between mb-2 md:mb-4 ml-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CATEGORIES</h3>
                    <button 
                      onClick={() => setIsAddCategoryModalOpen(true)}
                      className="bg-indigo-100 text-indigo-600 hover:bg-indigo-200 px-3 py-1 rounded-md text-[10px] font-bold transition-colors border border-indigo-200"
                    >
                      ADD
                    </button>
                  </div>
                </div>
                <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 pr-2 gap-2 custom-scrollbar lg:max-h-[600px]">
                  {dataCategories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setActiveDataCategory(cat)}
                      className={`whitespace-nowrap lg:whitespace-normal text-left px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all ${activeDataCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 lg:translate-x-2' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-6">
                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-4 md:border-8 border-slate-50 p-4 md:p-8 shadow-sm space-y-6 md:space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h4 className="text-xl md:text-2xl font-black text-slate-900 uppercase">MANAGE {activeDataCategory}</h4>
                    {activeDataCategory !== 'VENDOR DETAILS' && activeDataCategory !== 'PARTIES' && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input 
                          type="text"
                          placeholder={`Add New ${activeDataCategory}...`}
                          value={newDataValue}
                          onChange={(e) => setNewDataValue(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 md:px-6 py-2.5 md:py-3 text-sm font-bold text-slate-900 outline-none focus:border-indigo-500 w-full sm:min-w-[250px]"
                        />
                        <button 
                          onClick={async () => {
                            if (!newDataValue.trim()) return;
                            const res = await SpreadsheetService.saveDropdownOption(activeDataCategory, newDataValue.trim());
                            alert(res.message);
                            if (res.success) {
                              setNewDataValue('');
                              // Wait 3 seconds for spreadsheet to update before refreshing
                              await new Promise(resolve => setTimeout(resolve, 3000));
                              handleRemoteSync();
                              
                              const defaultCats = [
                                'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
                                'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
                                'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
                              ];
                              if (!defaultCats.includes(activeDataCategory)) {
                                SpreadsheetService.fetchDataColumn(activeDataCategory).then(data => {
                                  setCustomCategoryData(prev => ({ ...prev, [activeDataCategory]: data }));
                                });
                              }
                            }
                          }}
                          className="bg-indigo-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-lg hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          <PlusCircle size={18} /> ADD DATA
                        </button>
                      </div>
                    )}
                  </div>

                  {activeDataCategory === 'VENDOR DETAILS' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {renderInputField('SR. NO.', 'SR. NO.', '01', 'text', 'col-span-1', <Hash size={18}/>, 'vendor')}
                        {renderSelectField('VENDOR CATEGORY', 'VENDOR CATEGORY', ["CHA", "RICE MILL", "RICE BROKER", "FUMIGATION", "BAGS", "FREIGHT FORWARDER", "TECHNICAL SERVICE"], 'col-span-1', <Briefcase size={18}/>, 'vendor')}
                        {renderInputField('VENDOR NAME', 'VENDOR NAME', 'NAME...', 'text', 'col-span-1', <User size={18}/>, 'vendor')}
                        {renderInputField('GSTIN', 'GSTIN', '22AAAAA...', 'text', 'col-span-1', <FileText size={18}/>, 'vendor')}
                        {renderInputField('EMAIL', 'EMAIL', 'EMAIL...', 'email', 'col-span-1', <Globe size={18}/>, 'vendor')}
                        {renderInputField('CONTACT PERSON', 'CONTACT PERSON', 'NAME...', 'text', 'col-span-1', <User size={18}/>, 'vendor')}
                        {renderInputField('PHONE NO', 'PHONE NO', 'PHONE...', 'tel', 'col-span-1', <Phone size={18}/>, 'vendor')}
                        {renderInputField('ADDRESS LINE 1', 'ADDRESS LINE 1', 'ADDRESS...', 'text', 'col-span-1', <MapPin size={18}/>, 'vendor')}
                        {renderInputField('ADDRESS LINE 2', 'ADDRESS LINE 2', 'ADDRESS...', 'text', 'col-span-1', <MapPin size={18}/>, 'vendor')}
                        {renderInputField('LOADING LOCATION', 'LOADING LOCATION', 'LOCATION...', 'text', 'col-span-1', <MapPinned size={18}/>, 'vendor')}
                        {renderInputField('CITY', 'CITY', 'CITY...', 'text', 'col-span-1', <MapIcon size={18}/>, 'vendor')}
                        {renderInputField('PIN CODE', 'PIN CODE', '440001', 'text', 'col-span-1', <Hash size={18}/>, 'vendor')}
                        {renderInputField('STATE', 'STATE', 'MAHARASHTRA', 'text', 'col-span-1', <MapPinned size={18}/>, 'vendor')}
                        {renderSelectField('CURRENCY', 'CURRENCY', currencyList, 'col-span-1', <DollarSign size={18}/>, 'vendor')}
                        {renderInputField('BANK', 'BANK', 'BANK NAME...', 'text', 'col-span-1', <Landmark size={18}/>, 'vendor')}
                        {renderInputField('BANK BRANCH', 'BANK BRANCH', 'BRANCH...', 'text', 'col-span-1', <Landmark size={18}/>, 'vendor')}
                        {renderInputField('IFSC', 'IFSC', 'IFSC...', 'text', 'col-span-1', <Shield size={18}/>, 'vendor')}
                        {renderInputField('AC NO.', 'AC NO.', 'ACCOUNT NO...', 'text', 'col-span-1', <CreditCard size={18}/>, 'vendor')}
                        {renderInputField('BANK 2', 'BANK 2', 'BANK NAME...', 'text', 'col-span-1', <Landmark size={18}/>, 'vendor')}
                        {renderInputField('BANK 2 BRANCH', 'BANK 2 BRANCH', 'BRANCH...', 'text', 'col-span-1', <Landmark size={18}/>, 'vendor')}
                        {renderInputField('BANK 2 IFSC', 'BANK 2 IFSC', 'IFSC...', 'text', 'col-span-1', <Shield size={18}/>, 'vendor')}
                        {renderInputField('BANK 2 AC. NO.', 'BANK 2 AC. NO.', 'ACCOUNT NO...', 'text', 'col-span-1', <CreditCard size={18}/>, 'vendor')}
                        {renderInputField('BANK 2 SWIFT', 'BANK 2 SWIFT', 'SWIFT...', 'text', 'col-span-1', <Globe size={18}/>, 'vendor')}
                        {renderInputField('REMARKS', 'REMARKS', 'NOTES...', 'text', 'md:col-span-3', <MessageSquare size={18}/>, 'vendor')}
                      </div>
                      <div className="flex justify-end">
                        <button 
                          disabled={isSubmitting}
                          onClick={async () => {
                            setIsSubmitting(true);
                            const res = await SpreadsheetService.saveVendorDetail(vendorFormData);
                            alert(res.message);
                            if (res.success) {
                              setVendorFormData(INITIAL_VENDOR_FORM_STATE);
                              handleRemoteSync();
                            }
                            setIsSubmitting(false);
                          }}
                          className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all flex items-center gap-3"
                        >
                          {isSubmitting ? <RefreshCw className="animate-spin" /> : <Save />} SAVE VENDOR DETAILS
                        </button>
                      </div>

                      <div className="mt-12 pt-12 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                          <h5 className="text-xl font-black text-slate-900 uppercase">EXISTING VENDORS ({vendorsList.length})</h5>
                          <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" size={16} />
                            <input 
                              type="text"
                              placeholder="SEARCH VENDORS..."
                              value={selectSearchQuery}
                              onChange={(e) => setSelectSearchQuery(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 min-w-[250px]"
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <th className="p-4">Vendor Name</th>
                                  <th className="p-4">GSTIN</th>
                                  <th className="p-4">City / State</th>
                                  <th className="p-4">Currency</th>
                                  <th className="p-4">Contact</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {vendorsList
                                  .filter(v => !selectSearchQuery || String(v.name || '').toLowerCase().includes(selectSearchQuery.toLowerCase()) || String(v.gstin || '').toLowerCase().includes(selectSearchQuery.toLowerCase()))
                                  .slice(0, 100)
                                  .map((vendor, idx) => (
                                  <tr key={idx} className="hover:bg-white transition-colors">
                                    <td className="p-4 text-sm font-bold text-slate-900">{vendor.name}</td>
                                    <td className="p-4 text-xs font-medium text-slate-500">{vendor.gstin}</td>
                                    <td className="p-4 text-xs font-medium text-slate-500">{vendor.city}, {vendor.state}</td>
                                    <td className="p-4 text-xs font-bold text-indigo-600">{vendor.currency || '-'}</td>
                                    <td className="p-4 text-xs font-medium text-slate-500">{vendor.phone}</td>
                                  </tr>
                                ))}
                                {vendorsList.length === 0 && (
                                  <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400 text-sm italic">No vendors found.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : activeDataCategory === 'PARTIES' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInputField('SR. NO.', 'SR. NO.', '01', 'text', 'col-span-1', <Hash size={18}/>, 'parties')}
                        {renderInputField('NAME', 'NAME', 'PARTY NAME...', 'text', 'col-span-1', <User size={18}/>, 'parties')}
                        {renderInputField('LINE 1', 'LINE 1', 'ADDRESS LINE 1...', 'text', 'col-span-1', <MapPin size={18}/>, 'parties')}
                        {renderInputField('LINE 2', 'LINE 2', 'ADDRESS LINE 2...', 'text', 'col-span-1', <MapPin size={18}/>, 'parties')}
                      </div>
                      <div className="flex justify-end">
                        <button 
                          disabled={isSubmitting}
                          onClick={async () => {
                            if (!partiesFormData['NAME']) {
                              alert('Please enter a party name.');
                              return;
                            }
                            setIsSubmitting(true);
                            const res = await SpreadsheetService.saveDropdownOption('PARTIES', partiesFormData['NAME'], partiesFormData);
                            alert(res.message);
                            if (res.success) {
                              setPartiesFormData(INITIAL_PARTIES_FORM_STATE);
                              handleRemoteSync();
                            }
                            setIsSubmitting(false);
                          }}
                          className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all flex items-center gap-3"
                        >
                          {isSubmitting ? <RefreshCw className="animate-spin" /> : <Save />} SAVE PARTY DETAILS
                        </button>
                      </div>

                      <div className="mt-12 pt-12 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                          <h5 className="text-xl font-black text-slate-900 uppercase">EXISTING PARTIES ({partiesList.length})</h5>
                          <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10" size={16} />
                            <input 
                              type="text"
                              placeholder="SEARCH PARTIES..."
                              value={selectSearchQuery}
                              onChange={(e) => setSelectSearchQuery(e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 min-w-[250px]"
                            />
                          </div>
                        </div>
                        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="max-h-[400px] overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                              <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  <th className="p-4">Party Name</th>
                                  <th className="p-4 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {partiesList
                                  .filter(p => !selectSearchQuery || String(p || '').toLowerCase().includes(selectSearchQuery.toLowerCase()))
                                  .slice(0, 100)
                                  .map((party, idx) => (
                                  <tr key={idx} className="hover:bg-white transition-colors">
                                    <td className="p-4 text-sm font-bold text-slate-900">{party}</td>
                                    <td className="p-4 text-right">
                                      <button 
                                        disabled={isDeleting === party}
                                        onClick={async () => {
                                          if (confirm(`Are you sure you want to delete "${party}"?`)) {
                                            setIsDeleting(party);
                                            const res = await SpreadsheetService.deleteDropdownOption('PARTIES', party);
                                            alert(res.message);
                                            if (res.success) {
                                              await new Promise(resolve => setTimeout(resolve, 3000));
                                              await handleRemoteSync();
                                            }
                                            setIsDeleting(null);
                                          }
                                        }}
                                        className={`p-2 rounded-lg transition-all ${isDeleting === party ? 'text-slate-300' : 'text-slate-400 hover:bg-slate-100'}`}
                                      >
                                        {isDeleting === party ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {partiesList.length === 0 && (
                                  <tr>
                                    <td colSpan={2} className="p-8 text-center text-slate-400 text-sm italic">No parties found.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {(activeDataCategory === 'ITEM NAME' ? itemNamesList :
                        activeDataCategory === 'VARIETY' ? varietyList :
                        activeDataCategory === 'BRAND' ? brandsList :
                        activeDataCategory === 'PACKING SIZE' ? packingSizeList :
                        activeDataCategory === 'SPECIFICATION' ? specificationsList :
                        activeDataCategory === 'DELIVERY TYPE' ? deliveryTypesList :
                        activeDataCategory === 'MODER OF TRANSPORT' ? modesOfTransportList :
                        activeDataCategory === 'BAG TYPE' ? bagTypesList :
                        activeDataCategory === 'PAYMENT TEARMS' ? paymentTermsList :
                        activeDataCategory === 'BROKER' ? brokersList :
                        activeDataCategory === 'PORT OF DISCHARGE' ? portOfDischargeList :
                        activeDataCategory === 'PORT OF LOADING' ? portOfLoadingList :
                        activeDataCategory === 'PORT OF ARRIVAL' ? portOfArrivalList :
                        activeDataCategory === 'CURRENCY' ? currencyList :
                        activeDataCategory === 'PARTIES' ? partiesList :
                        activeDataCategory === 'SHIPPING LINE' ? shippingLineList :
                        customCategoryData[activeDataCategory] || []).map((item, idx) => (
                        <div key={`${item}-${idx}`} className="group bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-200 hover:bg-indigo-50/30 transition-all">
                          <span className="text-sm font-bold text-slate-700">{item}</span>
                          <button 
                            disabled={isDeleting === item}
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${item}" from ${activeDataCategory}?`)) {
                                setIsDeleting(item);
                                const res = await SpreadsheetService.deleteDropdownOption(activeDataCategory, item);
                                alert(res.message);
                                if (res.success) {
                                  // Wait 3 seconds for spreadsheet to update before refreshing
                                  await new Promise(resolve => setTimeout(resolve, 3000));
                                  await handleRemoteSync();
                                  
                                  const defaultCats = [
                                    'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
                                    'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
                                    'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
                                  ];
                                  if (!defaultCats.includes(activeDataCategory)) {
                                    SpreadsheetService.fetchDataColumn(activeDataCategory).then(data => {
                                      setCustomCategoryData(prev => ({ ...prev, [activeDataCategory]: data }));
                                    });
                                  }
                                }
                                setIsDeleting(null);
                              }
                            }}
                            className={`p-2 rounded-lg transition-all ${isDeleting === item ? 'text-slate-300' : 'text-slate-400 hover:bg-slate-100'}`}
                          >
                            {isDeleting === item ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Rice PO PDF Template */}
        <div id="rice-print-container" className="fixed-print-container">
          <div className="export-header">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="export-header-logo" 
              />
            ) : (
              <FileText size={60} className="text-sky-700" />
            )}
            <div className="export-header-divider"></div>
            <h1 className="export-header-title">
              FALCON OVERSEAS
            </h1>
          </div>

          <div className="export-divider-blue"></div>

          <div className="flex-1 flex flex-col">
            {/* Section 1: General Info */}
            <div className="export-section-grid grid-cols-4">
              <div className="export-field">
                <p className="export-label">PURCHASE ORDER NO.</p>
                <p className="export-value">{formData.purchaseOrderNo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">AGAINST SC</p>
                <p className="export-value">{formData.againstSc || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">AGAINST INVOICE</p>
                <p className="export-value">{formData.againstInvoice || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PO DATE</p>
                <p className="export-value">{formatDate(formData.poDate)}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">VENDOR NAME</p>
                <p className="export-value">{formData.vendorName || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">GSTIN</p>
                <p className="export-value">{formData.gstin || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">CONTACT PERSON</p>
                <p className="export-value">{formData.contactPersonName || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">PHONE</p>
                <p className="export-value">{formData.contactPersonNumber || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BILLING ADDRESS</p>
                <p className="export-value">{formData.billingAddress || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">CITY</p>
                <p className="export-value">{formData.city || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">STATE</p>
                <p className="export-value">{formData.state || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PINCODE</p>
                <p className="export-value">{formData.pincode || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">INSPECTION REQUIRED?</p>
                <p className="export-value">{formData.inspectionRequired || 'NO'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 2: Item Details */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">LOADING LOCATION</p>
                <p className="export-value">{formData.loadingLocation || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">ITEM NAME</p>
                <p className="export-value">{formData.itemName || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VARIETY</p>
                <p className="export-value">{formData.variety || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">TOTAL QTY (MT)</p>
                <p className="export-value">{formData.totalQuantityMt || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PACKING SIZE</p>
                <p className="export-value">{formData.packingSize || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">NO. OF BAGS</p>
                <p className="export-value">{formData.noOfBags || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">BAG TYPE</p>
                <p className="export-value">{formData.bagType || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BRAND / MARKING</p>
                <p className="export-value">{formData.bagMarkingBrand || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">SPECIAL INSTRUCTIONS</p>
                <p className="export-value">{formData.anySpecialInstructions || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">SPECIFICATIONS</p>
                <p className="export-value">{formData.specifications || '-'}</p>
              </div>
            </div>

            <div className="export-divider-blue"></div>

            {/* Section 3: Financials */}
            <div className="export-section-grid grid-cols-4">
              <div className="export-field">
                <p className="export-label">RATE (₹ PER MT)</p>
                <p className="export-value">{formData.ratePerMt || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">TOTAL PO VALUE (₹)</p>
                <p className="export-value">{formData.totalPoValue || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">FREIGHT INCLUDED / EXTRA</p>
                <p className="export-value">{formData.freightIncludedExtra || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">ADVANCE AMOUNT</p>
                <p className="export-value">{formData.advanceAmount || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">PAYMENT TERMS</p>
                <p className="export-value">{formData.paymentTerms || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 4: Broker/Surveyor */}
            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">BROKER NAME</p>
                <p className="export-value">{formData.broker || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">SURVEYOR AGENCY</p>
                <p className="export-value">{formData.surveyorAgency || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 5: Delivery */}
            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">DELIVERY TYPE</p>
                <p className="export-value">{formData.deliveryType || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">DELIVERY LOCATION ADDRESS</p>
                <p className="export-value">{formData.deliveryLocationAddress || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">LOADING INSTRUCTION</p>
                <p className="export-value">{formData.loadingInstruction || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">MODE OF TRANSPORT</p>
                <p className="export-value">{formData.modeOfTransport || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">DISPATCH SCHEDULE</p>
                <p className="export-value">{formData.dispatchSchedule || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">REMARK</p>
                <p className="export-value">{formData.remark || '-'}</p>
              </div>
            </div>

            <div className="export-divider-blue"></div>

            <div className="export-footer">
              <p className="export-footer-text">THIS IS A SYSTEM GENERATED PO</p>
            </div>
          </div>
        </div>

        {/* Hidden PDF Template for CHA PO */}
        <div id="cha-print-container" className="fixed-print-container">
          <div className="export-header">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="export-header-logo" 
              />
            ) : (
              <Ship size={60} className="text-sky-700" />
            )}
            <div className="export-header-divider"></div>
            <h1 className="export-header-title">
              FALCON OVERSEAS - CHA PO
            </h1>
          </div>

          <div className="export-divider-blue"></div>

          <div className="flex-1 flex flex-col">
            {/* Section 1: General Info */}
            <div className="export-section-grid grid-cols-4">
              <div className="export-field">
                <p className="export-label">CHA PO NO</p>
                <p className="export-value">{chaFormData.chaPoNo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">CHA PO DATE</p>
                <p className="export-value">{formatDate(chaFormData.chaPoDate)}</p>
              </div>
              <div className="export-field">
                <p className="export-label">AGAINST SC</p>
                <p className="export-value">{chaFormData.againstSc || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">AGAINST INVOICE</p>
                <p className="export-value">{chaFormData.againstInvoice || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">VENDOR NAME</p>
                <p className="export-value">{chaFormData.vendorName || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 2: Shipping Details */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">BOOKING NO</p>
                <p className="export-value">{chaFormData.containerBookingNumber || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">SHIPPING LINE</p>
                <p className="export-value">{chaFormData.shippingLine || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PORT OF LOADING</p>
                <p className="export-value">{chaFormData.portOfLoading || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">PORT OF DISPATCH</p>
                <p className="export-value">{chaFormData.portOfDispatched || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PORT OF ARRIVAL</p>
                <p className="export-value">{chaFormData.portOfArrival || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VESSEL SAILING DATE</p>
                <p className="export-value">{formatDate(chaFormData.vesselSailingDate)}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 3: Item Details */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">EXPORT ITEM</p>
                <p className="export-value">{chaFormData.exportItem || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VARIETY</p>
                <p className="export-value">{chaFormData.variety || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BRAND</p>
                <p className="export-value">{chaFormData.bagBrand || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">FORWARDER</p>
                <p className="export-value">{chaFormData.forwarder || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">QUANTITY(TON)</p>
                <p className="export-value">{chaFormData.quantity || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 4: Logistics */}
            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">CONTAINERSTUFFING / TRUCK LOADING</p>
                <p className="export-value">{chaFormData.stuffingLoading || '-'}</p>
              </div>

              <div className="export-field">
                <p className="export-label">RICE MILL</p>
                <p className="export-value">{chaFormData.riceMill || '-'}</p>
              </div>

              <div className="export-field">
                <p className="export-label">REMARK</p>
                <p className="export-value">{chaFormData.remark || '-'}</p>
              </div>
            </div>

            <div className="export-divider-blue"></div>

            <div className="export-footer">
              <p className="export-footer-text">THIS IS A SYSTEM GENERATED PO</p>
            </div>
          </div>
        </div>

        {/* Forwarder PO PDF Template */}
        <div id="forwarder-print-container" className="fixed-print-container">
          <div className="export-header">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="export-header-logo" 
              />
            ) : (
              <Truck size={60} className="text-sky-700" />
            )}
            <div className="export-header-divider"></div>
            <h1 className="export-header-title">
              FALCON OVERSEAS - FORWARDER PO
            </h1>
          </div>

          <div className="export-divider-blue"></div>

          <div className="flex-1 flex flex-col">
            {/* Section 1: General Info */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">FORWARDER PO NO</p>
                <p className="export-value">{forwarderFormData.forwarderPo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PO DATE</p>
                <p className="export-value">{formatDate(forwarderFormData.poDate)}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VENDOR NAME</p>
                <p className="export-value">{forwarderFormData.vendorName || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 2: Shipping Details */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">PORT OF LOADING</p>
                <p className="export-value">{forwarderFormData.portOfLoading || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PORT OF DISPATCH</p>
                <p className="export-value">{forwarderFormData.portOfDispatched || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PORT OF ARRIVAL</p>
                <p className="export-value">{forwarderFormData.portOfArrival || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">QTY (CNTR)</p>
                <p className="export-value">{forwarderFormData.qtyCntr || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VESSEL SAILING DATE</p>
                <p className="export-value">{formatDate(forwarderFormData.vesselSailingDate)}</p>
              </div>
              <div className="export-field">
                <p className="export-label">SHIPPING LINE</p>
                <p className="export-value">{forwarderFormData.shippingLine || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 3: Financials */}
            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">{forwarderFormData.ratePerContainerLabel || 'RATE [CNTR]'}</p>
                <p className="export-value">{forwarderFormData.currency} {forwarderFormData.ratePerContainer || '-'}</p>
              </div>
              {forwarderFormData.otherRate1 && (
                <div className="export-field">
                  <p className="export-label">{forwarderFormData.otherRate1Label || 'OTHER RATE 1'}</p>
                  <p className="export-value">{forwarderFormData.otherRate1Currency} {forwarderFormData.otherRate1 || '-'}</p>
                </div>
              )}
            </div>

            <div className="export-section-grid grid-cols-2">
              {forwarderFormData.otherRate2 && (
                <div className="export-field">
                  <p className="export-label">{forwarderFormData.otherRate2Label || 'OTHER RATE 2'}</p>
                  <p className="export-value">{forwarderFormData.otherRate2Currency} {forwarderFormData.otherRate2 || '-'}</p>
                </div>
              )}
              {forwarderFormData.otherRate3 && (
                <div className="export-field">
                  <p className="export-label">{forwarderFormData.otherRate3Label || 'OTHER RATE 3'}</p>
                  <p className="export-value">{forwarderFormData.otherRate3Currency} {forwarderFormData.otherRate3 || '-'}</p>
                </div>
              )}
            </div>

            <div className="export-section-grid grid-cols-1">
              {forwarderFormData.otherRate4 && (
                <div className="export-field">
                  <p className="export-label">{forwarderFormData.otherRate4Label || 'OTHER RATE 4'}</p>
                  <p className="export-value">{forwarderFormData.otherRate4Currency} {forwarderFormData.otherRate4 || '-'}</p>
                </div>
              )}
            </div>

            <div className="export-divider-blue"></div>

            <div className="export-footer">
              <p className="export-footer-text">THIS IS A SYSTEM GENERATED PO</p>
            </div>
          </div>
        </div>

        {/* Inspection PO PDF Template */}
        <div id="inspection-print-container" className="fixed-print-container">
          <div className="export-header">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="export-header-logo" 
              />
            ) : (
              <ClipboardCheck size={60} className="text-sky-700" />
            )}
            <div className="export-header-divider"></div>
            <h1 className="export-header-title">
              FALCON OVERSEAS - INSPECTION PO
            </h1>
          </div>

          <div className="export-divider-blue"></div>

          <div className="flex-1 flex flex-col">
            {/* Section 1 */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">INSPECTION PO</p>
                <p className="export-value">{inspectionFormData.inspectionPo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VENDOR NAME</p>
                <p className="export-value">{inspectionFormData.vendorName || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PO DATE</p>
                <p className="export-value">{formatDate(inspectionFormData.poDate)}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">FALCON INVOICE REFF</p>
                <p className="export-value">{inspectionFormData.falconInvoiceReff || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">INSPECTION TYPE</p>
                <p className="export-value">{inspectionFormData.inspectionType || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">FALCON INVOICE</p>
                <p className="export-value">{inspectionFormData.falconInvoice || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 2 */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">PURCHASE ORDER NO.</p>
                <p className="export-value">{inspectionFormData.purchaseOrderNo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">ITEM NAME</p>
                <p className="export-value">{inspectionFormData.item || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">RICE MILL</p>
                <p className="export-value">{inspectionFormData.riceMill || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">VENDOR NAME (RICE )</p>
                <p className="export-value">{inspectionFormData.riceMill || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VENDOR ADDRESS</p>
                <p className="export-value">{inspectionFormData.itemVendorAddress || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BROKER NAME</p>
                <p className="export-value">{inspectionFormData.brokerName || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">BRAND</p>
                <p className="export-value">{inspectionFormData.brand || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PACKING</p>
                <p className="export-value">{inspectionFormData.packing || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 3 */}
            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">LOADING SCHEDULE</p>
                <p className="export-value">{inspectionFormData.loadingSchedule || '-'}</p>
              </div>
            </div>

            <div className="export-divider-blue"></div>

            <div className="export-footer">
              <p className="export-footer-text">THIS IS A SYSTEM GENERATED PO</p>
            </div>
          </div>
        </div>

        {/* Bags PO PDF Template */}
        <div id="bags-print-container" className="fixed-print-container">
          <div className="export-header">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="export-header-logo" 
              />
            ) : (
              <Package size={60} className="text-sky-700" />
            )}
            <div className="export-header-divider"></div>
            <h1 className="export-header-title">
              FALCON OVERSEAS - BAGS PO
            </h1>
          </div>

          <div className="export-divider-blue"></div>

          <div className="flex-1 flex flex-col">
            {/* Section 1: General Info */}
            <div className="export-section-grid grid-cols-4">
              <div className="export-field">
                <p className="export-label">PO DATE</p>
                <p className="export-value">{formatDate(bagsFormData.poDate)}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PO. NO.</p>
                <p className="export-value">{bagsFormData.bagsPoNo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VENDOR NAME</p>
                <p className="export-value">{bagsFormData.vendorName || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">FALCON INV. REFF</p>
                <p className="export-value">{bagsFormData.falconInvReff || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 2: Bag Details */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">BAG MARKING</p>
                <p className="export-value">{bagsFormData.bagMarking || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BAG PACKING</p>
                <p className="export-value">{bagsFormData.bagPacking || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BAG WT.</p>
                <p className="export-value">{bagsFormData.bagWt || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">BAG TYPE</p>
                <p className="export-value">{bagsFormData.bagType || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">QTY</p>
                <p className="export-value">{bagsFormData.qty || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">NO OF BAGS</p>
                <p className="export-value">{bagsFormData.noOfBags || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 3: Delivery Address & Photo */}
            <div className="export-section-grid grid-cols-2 gap-4">
              <div className="export-field">
                <p className="export-label">DELIVERY ADDRESS & QUANTITY</p>
                <div className="mt-2 space-y-2">
                  {(bagsFormData.deliveryVendor || '').split(', ').filter(Boolean).map((item: string, idx: number) => {
                    const match = item.match(/^(.*) \((.*)\)$/);
                    const name = match ? match[1] : item;
                    const qty = match ? match[2] : '';
                    const vendor = vendorsList.find(v => v.name === name);
                    return (
                      <div key={idx} className="flex justify-between items-start border-b border-slate-100 pb-1">
                        <div className="flex-1">
                          <p className="export-value">{name}</p>
                          <p className="text-[10px] text-slate-500">
                            {[
                              vendor?.addressLine1,
                              vendor?.addressLine2,
                              vendor?.city,
                              vendor?.state,
                              vendor?.pincode
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="export-label">QTY</p>
                          <p className="export-value">{qty}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="export-field">
                <p className="export-label">BAG MARKING PHOTO</p>
                {bagsFormData.bagMarkingPhoto ? (
                  <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden h-40 flex items-center justify-center bg-slate-50">
                    <img 
                      src={bagsFormData.bagMarkingPhoto} 
                      alt="Bag Marking" 
                      className="max-h-full max-w-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="mt-2 border-2 border-dashed border-slate-200 rounded-lg h-40 flex flex-col items-center justify-center text-slate-300">
                    <Camera size={32} />
                    <p className="text-[10px] font-bold mt-2">NO PHOTO ATTACHED</p>
                  </div>
                )}
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 4: Remarks */}
            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">REMARK</p>
                <p className="export-value">{bagsFormData.remark || '-'}</p>
              </div>
            </div>

            <div className="export-divider-blue"></div>

            <div className="export-footer">
              <p className="export-footer-text">THIS IS A SYSTEM GENERATED PO</p>
            </div>
          </div>
        </div>

        {/* Bank PO PDF Template */}
        <div id="bank-print-container" className="fixed-print-container">
          <div className="export-header">
            {logoBase64 ? (
              <img 
                src={logoBase64} 
                alt="Logo" 
                className="export-header-logo" 
              />
            ) : (
              <Building2 size={60} className="text-sky-700" />
            )}
            <div className="export-header-divider"></div>
            <h1 className="export-header-title">
              FALCON OVERSEAS - BANK PO
            </h1>
          </div>

          <div className="export-divider-blue"></div>

          <div className="flex-1 flex flex-col">
            {/* Section 1: General Info */}
            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">BANK PO NO</p>
                <p className="export-value">{bankFormData.bankPoNo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">PO DATE</p>
                <p className="export-value">{formatDate(bankFormData.poDate)}</p>
              </div>
              <div className="export-field">
                <p className="export-label">VENDOR NAME</p>
                <p className="export-value">{bankFormData.vendorName || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">AGAINST SC</p>
                <p className="export-value">{bankFormData.againstSc || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">AGAINST INVOICE</p>
                <p className="export-value">{bankFormData.againstInvoice || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 2: Bank Details */}
            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">BANK NAME</p>
                <p className="export-value">{bankFormData.bankName || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">BRANCH NAME</p>
                <p className="export-value">{bankFormData.branchName || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-3">
              <div className="export-field">
                <p className="export-label">ACCOUNT NO</p>
                <p className="export-value">{bankFormData.accountNo || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">IFSC CODE</p>
                <p className="export-value">{bankFormData.ifscCode || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">SWIFT CODE</p>
                <p className="export-value">{bankFormData.swiftCode || '-'}</p>
              </div>
            </div>

            <div className="export-section-grid grid-cols-2">
              <div className="export-field">
                <p className="export-label">INTERMEDIARY BANK</p>
                <p className="export-value">{bankFormData.intermediaryBank || '-'}</p>
              </div>
              <div className="export-field">
                <p className="export-label">SWIFT CODE (INTERMEDIARY)</p>
                <p className="export-value">{bankFormData.swiftCodeIntermediary || '-'}</p>
              </div>
            </div>

            <div className="export-divider-red"></div>

            {/* Section 3: Remarks */}
            <div className="export-section-grid grid-cols-1">
              <div className="export-field">
                <p className="export-label">REMARK</p>
                <p className="export-value">{bankFormData.remark || '-'}</p>
              </div>
            </div>

            <div className="export-divider-blue"></div>

            <div className="export-footer">
              <p className="export-footer-text">THIS IS A SYSTEM GENERATED PO</p>
            </div>
          </div>
        </div>

        {/* Hidden PDF Template for Sales Contract */}
        <div id="sales-contract-print-container" className="fixed-print-container">
          {/* Header */}
          <div className="relative mb-4">
            <h1 className="text-center text-2xl font-black underline underline-offset-4 mb-4">SALES CONTRACT</h1>
            <div className="grid grid-cols-2 text-[11px] font-bold leading-tight">
              <div className="space-y-0.5">
                <p><span className="text-sky-700">GSTN:</span> 27AAHFF8191L2ZS</p>
                <p><span className="text-sky-700">HELPLINE:</span> +91-7304269930</p>
                <p><span className="text-sky-700">EMAIL:</span> FALCON390OVERSEAS@GMAIL.COM</p>
              </div>
              <div className="text-right">
                <p className="uppercase text-sky-700">ADDRESS:</p>
                <p>FALCON OVERSEAS, C/O KD INK MFG. CO.,</p>
                <p>VIJAY NAGAR, BALAGHAT ROAD, GONDIA-441614,</p>
                <p>MAHARASHTRA, INDIA.</p>
              </div>
            </div>
          </div>

          <div className="border-t-[1.5px] border-sky-700 pt-1.5 mb-3">
            <div className="grid grid-cols-3 text-[12px] font-black">
              <div><span className="text-sky-700">CONTRACT NO.:</span> {salesFormData.salesContractNo || '-'}</div>
              <div className="text-center"><span className="text-sky-700">DATE:</span> {formatDate(salesFormData.contractDate)}</div>
              <div className="text-right"><span className="text-sky-700">OTHER REFERENCE(S):</span> {salesFormData.otherReferences || '-'}</div>
            </div>
          </div>

          <div className="border-t-[1.5px] border-sky-700 pt-1.5 mb-4">
            <p className="text-center text-[11px] font-black mb-3">THIS IS TO CONFIRM THE FOLLOWING BUSINESS MADE ON ABOVE MENTIONED DATE BETWEEN</p>
            
            <div className="grid grid-cols-2 gap-12 mb-3">
              <div className="text-center">
                <p className="text-[13px] font-black mb-1 underline">FALCON OVERSEAS, INDIA</p>
                <p className="text-[9px] font-bold">(HEREAFTER REFERRED TO AS THE SELLER) ON THE ONE PART</p>
              </div>
              <div className="text-center">
                <p className="text-[13px] font-black mb-1 underline">{salesFormData.buyer || '-'}</p>
                <p className="text-[9px] font-bold">(HEREAFTER REFERRED TO AS BUYER) ON THE OTHER PART</p>
              </div>
            </div>

            <div className="border-y-[1.5px] border-sky-700 py-1.5">
              <p className="text-center text-[10px] font-black leading-tight">
                IT IS HEREBY AGREED THAT THE SELLER IS SELLING, AND THE BUYER IS BUYING, IN ACCORDANCE WITH THE TERMS AND CONDITIONS STIPULATED HEREINAFTER.
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-x-12 text-[11px] leading-snug">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">COMMODITY:</p>
                <p className="font-bold">{salesFormData.descriptionOfGoods || '-'}</p>
              </div>
              
              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">SPECIFICATIONS:</p>
                <div className="grid grid-cols-2 gap-y-0.5 font-bold">
                  <p className="text-sky-700">MOISTURE:</p><p>{salesFormData.specMoisture || '-'}</p>
                  <p className="text-sky-700">DAMAGED / DISCOLOURED:</p><p>{salesFormData.specDamaged || '-'}</p>
                  <p className="text-sky-700">FOREIGN MATTER:</p><p>{salesFormData.specForeignMatter || '-'}</p>
                  <p className="text-sky-700">BLACK & BLACK-TIPPED:</p><p>{salesFormData.specBlackTipped || '-'}</p>
                  <p className="text-sky-700">AVERAGE GRAIN LENGTH:</p><p>{salesFormData.specAvgGrainLength || '-'}</p>
                </div>
              </div>

              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">PACKAGING/MARKING:</p>
                <p className="font-bold">
                  {salesFormData.packingKgs ? `${salesFormData.packingKgs} KGS BAG.` : '-'} 
                  ({salesFormData.packingKgs} KGS ONE SIDE {salesFormData.packingDetails} NET), 
                  BRAND {salesFormData.brand || '-'}, BAG WT {salesFormData.emptyBagsWeightGrams || '-'} GRAM
                </p>
              </div>

              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">HSN CODE: <span className="font-bold no-underline text-slate-900">{salesFormData.hsCode || '-'}</span></p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">QUANTITY:</p>
                <p className="font-bold">{salesFormData.contractQty || '-'} MT (5% MORE OR LESS) IN 10 CONTAINERS OF 27 MT EACH</p>
              </div>

              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">PRICE/VALUE:</p>
                <p className="font-bold">{salesFormData.currency || 'USD'} {salesFormData.ratePerMts || '-'} PMT {salesFormData.incoterms || '-'} {salesFormData.portOfDischarge || '-'}</p>
              </div>

              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">TOTAL CONTRACTUAL VALUE: <span className="font-bold no-underline text-slate-900">{salesFormData.currency || 'USD'} {parseFloat(salesFormData.totalContractualValue || '0').toLocaleString()}</span></p>
              </div>

              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">PAYMENT TERMS:</p>
                <p className="font-bold uppercase">{salesFormData.termsOfPayment || '-'}</p>
              </div>

              <div>
                <p className="font-black underline uppercase mb-0.5 text-sky-700">PORT OF DISCHARGE:</p>
                <p className="font-bold uppercase">{salesFormData.portOfDischarge || '-'}</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mt-6 text-[10px] space-y-1.5">
            <p className="font-black underline text-sky-700">NOTE:</p>
            <p className="font-bold">1. IF ECTN IS APPLICABLE THEN IT HAS TO BE TAKEN BY {salesFormData.ectnTakenBy || 'THE SELLER'}</p>
            <p className="font-bold">2. IF THE INDIAN GOVERNMENT LIFT OR AMENDS THE EXPORT DUTY THEN THE CURRENT MARKET RATE WILL BE APPLICABLE TO BOTH PARTIES.</p>
            <p className="font-bold">3. TOTAL SHIPMENT TILL {formatDate(salesFormData.totalShipmentTill)}</p>
            <p className="font-bold leading-tight">4. {salesFormData.note4 || 'IN CASE OF VESSEL DELAY OR CHANGE IN SHIPMENT SCHEDULE DUE TO WAR OR FORCE MAJEURE, PRICE MAY BE REVISED AND REVISED SHIPMENT TIMELINE SHALL BE ACCEPTABLE TO THE BUYER.'}</p>
          </div>

          {/* Clauses */}
          <div className="mt-5 text-[9px] space-y-2.5 font-bold leading-tight">
            <div>
              <p className="font-black underline uppercase mb-0.5 text-sky-700">FORCE MAJEURE:</p>
              <p>THE FULFILMENT OF THIS CONTRACT IS SUBJECT TO GAFTA FORCE MAJEURE PRACTICE. ANY ACT OF GODLIKE LOCKOUTS, LOCKDOWNS, STRIKES, WAR OR ANY SUCH ISSUE SHALL BE CONSIDERED AS FORCE MAJEURE AND SHALL NOT BIND EITHER OF THE PARTIES FOR THE FULFILMENT OF THIS CONTRACT.</p>
            </div>
            <div>
              <p className="font-black underline uppercase mb-0.5 text-sky-700">ARBITRATION:</p>
              <p>SHOULD ANY DISPUTE ARISE BETWEEN THE CONTRACTING PARTIES TO WHICH NO AGREEMENT CAN BE REACHED, THESE DISPUTES SHALL BE SETTLED BY ARBITRATION, WHICH SHALL TAKE PLACE IN ANY COURT OR ANY ARBITRATION CENTRE IN INDIA AS PER GAFTA RULES NO.125. ARBITRATION WILL TAKE PLACE IN THE ENGLISH LANGUAGE ONLY. THE SETTLEMENT AWARDED BY THE ASSIGNED COURT OR ARBITRATION CENTRE IN INDIA WILL BE FINAL. ALL THE COSTS OF LEGAL PROCEEDING WILL BE BORNE BY THE LOSING PARTY.</p>
            </div>
            <div>
              <p className="font-black underline uppercase mb-0.5 text-sky-700">GOVERNING CONTRACT(S):</p>
              <p>ALL OTHER TERMS AND CONDITIONS AS PER GAFTA 120 WERE NOT IN CONFLICT WITH TERMS CONTAINED HEREIN INCLUDING ARBITRATION RULE NUMBER 125 OF GAFTA LONDON OF WHICH BOTH PARTIES ADMIT FULL NOTICE AND KNOWLEDGE. THIS CLAUSE APPLIES REGARDLESS OF WHETHER THE BUYER AND SELLER ARE MEMBERS OF GAFTA OR NOT.</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-10 grid grid-cols-2 text-[11px] font-black mt-auto">
            <div>
              <p className="mb-12 text-sky-700">SELLER</p>
              <p className="uppercase">FALCON OVERSEAS</p>
            </div>
            <div className="text-right">
              <p className="mb-12 text-sky-700">BUYER</p>
              <p className="uppercase">{salesFormData.buyer || '-'}</p>
            </div>
          </div>
          <div className="export-divider-blue mt-4"></div>
        </div>
      </main>
      <footer className={`py-10 text-center border-t ${activePage === 1 ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'} text-[11px] font-black uppercase tracking-[1em] animate-pulse`}>LOGISTICS DATA TERMINAL 2026 • CONNECTED</footer>

      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-black">ADD NEW FIELD</h3>
              <button onClick={() => setIsAddCategoryModalOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Name</label>
                <input 
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="e.g. INCOTERMS"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Dropdown Name</label>
                <input 
                  type="text"
                  value={newCategoryValue}
                  onChange={e => setNewCategoryValue(e.target.value)}
                  placeholder="e.g. CIF COTONOU"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                />
              </div>
              <button
                onClick={async () => {
                  if (!newCategoryName.trim() || !newCategoryValue.trim()) {
                    alert('Please fill in both fields');
                    return;
                  }
                  setIsSavingCategory(true);
                  try {
                    const formattedCat = newCategoryName.trim().toUpperCase();
                    const formattedVal = newCategoryValue.trim().toUpperCase();
                    
                    await SpreadsheetService.saveDropdownOption(formattedCat, formattedVal);
                    
                    if (!dataCategories.includes(formattedCat)) {
                      setDataCategories(prev => [...prev, formattedCat]);
                    }
                    
                    // Update custom category data
                    setCustomCategoryData(prev => {
                      const existing = prev[formattedCat] || [];
                      if (!existing.includes(formattedVal)) {
                        return { ...prev, [formattedCat]: [...existing, formattedVal].sort() };
                      }
                      return prev;
                    });
                    
                    setActiveDataCategory(formattedCat);
                    setIsAddCategoryModalOpen(false);
                    setNewCategoryName('');
                    setNewCategoryValue('');
                    
                    // Refresh data
                    handleRemoteSync();
                  } catch (e) {
                    console.error(e);
                    alert('Failed to save category');
                  } finally {
                    setIsSavingCategory(false);
                  }
                }}
                disabled={isSavingCategory}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSavingCategory ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    SAVING...
                  </>
                ) : (
                  'SAVE FIELD'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;