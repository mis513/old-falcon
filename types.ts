
export interface LoadingEntry {
  id: string;
  againstInvoice: string;
  againstPo: string;
  againstSc: string;
  loadingDate: string;
  invoiceDate: string;
  invoiceNo: string;
  riceMill: string;
  item: string;
  unit: string;
  rate: number;
  brand: string;
  packing: number;
  vhNo: string;
  cntrNo: string;
  bags: number;
  qtyTon: number;
  grossWt: number;
  tareWt: number;
  netWt: number;
  wbSlipPhoto: string;
  transporterName: string;
  freight: number;
  amount: number;
  bagsWtGrams: number;
  bagsWtDedAmt: number;
  grossAmt: number;
  tdsAmount: number;
  brokerageRate: number;
  brokerage: number;
  cdPercent: number;
  cdAmt: number;
  otherDed: string;
  otherDedAmt: number;
  netAmt: number;
  remark: string;
  broker: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  riceMill: string;
  item: string;
  packing: number;
  brand: string;
  totalQty: number;
  rate: number;
  broker: string;
}

export type ColumnKey = keyof LoadingEntry;

export interface ColumnDefinition {
  key: ColumnKey;
  label: string;
  visible: boolean;
  align?: 'left' | 'right' | 'center';
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: ColumnKey | 'sno' | null;
  direction: SortDirection;
}
