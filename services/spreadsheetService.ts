import Papa from 'papaparse';
import { LoadingEntry, PurchaseOrder } from '../types';

const SHEET_ID = '193rm1gvSoU8LKhn068ULl2Fa4NEPhCgXzw-7QfB5Rmo';
const GID_ITEM_LOADING = '0';
const GID_RICE_PO = '102188136';
const GID_SC_SHEET = '133687646'; 
const GID_INVOICE_SHEET = '711580275'; 
const GID_VENDOR_SHEET = '657346689'; 
const GID_PARTIES_MASTER_SHEET = '896492418'; 
const GID_DATA_SHEET = '1127896305'; 
const GID_REGISTER_SHEET = '1895935147'; 
const GID_BAGS_PO = '1001787788'; 

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_ITEM_LOADING}`;
const RICE_PO_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_RICE_PO}`;
const SC_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_SC_SHEET}`;
const INVOICE_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_INVOICE_SHEET}`;
const VENDOR_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_VENDOR_SHEET}`;
const PARTIES_MASTER_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_PARTIES_MASTER_SHEET}`;
const DATA_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_DATA_SHEET}`;
const REGISTER_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_REGISTER_SHEET}`;

const HARDCODED_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwAmB6CjqYar97KlN8ngln7874iF-Kf2q6hpJuuDewnhbRigmJGW8fkPw_9NxklktprA/exec';

export interface VendorDetail {
  name: string;
  gstin: string;
  contactPerson: string;
  phone: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  currency?: string;
}

export class SpreadsheetService {
  static getActiveUrl(): string | null {
    return HARDCODED_APPS_SCRIPT_URL;
  }

  static async fetchRemoteData(): Promise<LoadingEntry[]> {
    try {
      const response = await fetch(`${CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return this.parseRawData(csvText);
    } catch (e) {
      return [];
    }
  }

  static async fetchContractNumbers(): Promise<string[]> {
    try {
      const response = await fetch(`${SC_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = Object.keys(results.data[0] || {});
            const contractCol = headers.find(k => {
              const normalized = k.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
              return normalized === 'SALESCONTRACTNO' || normalized === 'CONTRACTNOSC' || normalized === 'SCNO' || normalized === 'CONTRACTNO' || normalized === 'SALESCONTRACT' || normalized === 'CONTRACT';
            });
            if (!contractCol) { resolve([]); return; }
            const contracts = (results.data as any[]).map(row => String(row[contractCol] || '').trim()).filter(val => val !== '' && val !== 'null');
            resolve(Array.from(new Set(contracts)).sort());
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchSalesContractDetails(): Promise<any[]> {
    try {
      const response = await fetch(`${SC_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as any[]);
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchInvoiceNumbers(): Promise<string[]> {
    try {
      const response = await fetch(`${INVOICE_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const invoiceCol = Object.keys(results.data[0] || {}).find(k => {
              const nk = k.toLowerCase();
              return nk.includes('invoice no') || nk.includes('inv no') || nk.includes('inv. no') || nk.includes('inv#') || nk.includes('invoice #') || nk.includes('invoiceno') || nk.includes('invoice number') || nk === 'invoice';
            });
            if (!invoiceCol) { resolve([]); return; }
            const invoices = (results.data as any[]).map(row => String(row[invoiceCol] || '').trim()).filter(val => val !== '' && val !== 'null');
            resolve(Array.from(new Set(invoices)).sort());
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchInvoiceDetails(): Promise<any[]> {
    try {
      const response = await fetch(`${INVOICE_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as any[]);
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchRicePoDetails(): Promise<any[]> {
    try {
      const response = await fetch(`${RICE_PO_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as any[]);
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchBagsPoDetails(): Promise<any[]> {
    try {
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID_BAGS_PO}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data as any[]);
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchRicePoNumbers(): Promise<string[]> {
    try {
      const response = await fetch(`${RICE_PO_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const poCol = Object.keys(results.data[0] || {}).find(k => k.toLowerCase().includes('purchase order no'));
            if (!poCol) { resolve([]); return; }
            const pos = (results.data as any[]).map(row => String(row[poCol] || '').trim()).filter(val => val !== '' && val !== 'null');
            resolve(Array.from(new Set(pos)).sort());
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchVendorList(): Promise<VendorDetail[]> {
    try {
      const response = await fetch(`${VENDOR_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as any[];
            const vendors: VendorDetail[] = data.map(row => {
              const findKey = (search: string) => Object.keys(row).find(k => k.toLowerCase().trim() === search.toLowerCase().trim() || k.toLowerCase().includes(search.toLowerCase()));
              
              // Try "NAME" first as per the new sheet structure
              const nameKey = findKey('NAME') || findKey('VENDOR NAME');
              const addr1Key = findKey('LINE 1') || findKey('ADDRESS LINE 1');
              const addr2Key = findKey('LINE 2') || findKey('ADDRESS LINE 2');
              
              const addr1 = String(row[addr1Key || ''] || '').trim();
              const addr2 = String(row[addr2Key || ''] || '').trim();
              
              return {
                name: String(row[nameKey || ''] || '').trim(),
                gstin: String(row[findKey('GSTIN') || ''] || '').trim(),
                contactPerson: String(row[findKey('CONTACT PERS') || ''] || '').trim(),
                phone: String(row[findKey('PHONE NO') || ''] || '').trim(),
                address: `${addr1}${addr1 && addr2 ? ', ' : ''}${addr2}`,
                addressLine1: addr1,
                addressLine2: addr2,
                city: String(row[findKey('CITY') || ''] || '').trim(),
                state: String(row[findKey('STATE') || ''] || '').trim(),
                pincode: String(row[findKey('PIN CODE') || ''] || '').trim(),
                currency: String(row[findKey('CURRENCY') || ''] || '').trim()
              };
            }).filter(v => v.name !== '');
            resolve(vendors);
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchItemNames(): Promise<string[]> {
    return this.fetchDataColumn('ITEM NAME');
  }

  static async fetchVarieties(): Promise<string[]> {
    return this.fetchDataColumn('VARIETY');
  }

  static async fetchBrands(): Promise<string[]> {
    return this.fetchDataColumn('BRAND');
  }

  static async fetchPackingSizes(): Promise<string[]> {
    return this.fetchDataColumn('PACKING SIZE');
  }

  static async fetchSpecifications(): Promise<string[]> {
    return this.fetchDataColumn('SPECIFICATION');
  }

  static async fetchDeliveryTypes(): Promise<string[]> {
    return this.fetchDataColumn('DELIVERY TYPE');
  }

  static async fetchModesOfTransport(): Promise<string[]> {
    return this.fetchDataColumn('MODER OF TRANSPORT');
  }

  static async fetchBagTypes(): Promise<string[]> {
    return this.fetchDataColumn('BAG TYPE');
  }

  static async fetchPaymentTerms(): Promise<string[]> {
    return this.fetchDataColumn('PAYMENT TEARMS');
  }

  static async fetchBrokers(): Promise<string[]> {
    return this.fetchDataColumn('BROKER');
  }

  static async fetchPortsOfDischarge(): Promise<string[]> {
    return this.fetchDataColumn('PORT OF DISCHARGE');
  }

  static async fetchPortsOfLoading(): Promise<string[]> {
    return this.fetchDataColumn('PORT OF LOADING');
  }

  static async fetchPortsOfArrival(): Promise<string[]> {
    return this.fetchDataColumn('PORT OF ARRIVAL');
  }

  static async fetchShippingLines(): Promise<string[]> {
    return this.fetchDataColumn('SHIPPING LINE');
  }

  static async fetchCurrencies(): Promise<string[]> {
    return this.fetchDataColumn('CURRENCY');
  }

  static async fetchParties(): Promise<string[]> {
    return this.fetchDataColumn('PARTIES');
  }

  static async fetchHsCodes(): Promise<string[]> {
    return this.fetchDataColumn('HS CODE');
  }

  static async fetchCommodityWeights(): Promise<{ commodity: string, weight: string }[]> {
    try {
      const response = await fetch(`${DATA_CSV_URL}&t=${Date.now()}`);
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = Object.keys(results.data[0] || {});
            const itemCol = headers.find(k => 
              k.toLowerCase().trim() === 'item name' || 
              k.toLowerCase().includes('item name')
            );
            const weightCol = headers.find(k => 
              k.toLowerCase().trim() === 'empty bags weight (in grams)' || 
              k.toLowerCase().includes('empty bags weight')
            );
            
            if (!itemCol || !weightCol) { resolve([]); return; }
            
            const mapping = (results.data as any[]).map(row => ({
              commodity: String(row[itemCol] || '').trim(),
              weight: String(row[weightCol] || '').trim()
            })).filter(item => item.commodity !== '');
            
            resolve(mapping);
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchPartiesMasterList(): Promise<string[]> {
    try {
      const response = await fetch(`${PARTIES_MASTER_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as any[];
            const findKey = (search: string) => Object.keys(data[0] || {}).find(k => k.toLowerCase().trim() === search.toLowerCase().trim() || k.toLowerCase().includes(search.toLowerCase()));
            const nameKey = findKey('NAME') || findKey('VENDOR NAME');
            const names = data.map(row => String(row[nameKey || ''] || '').trim()).filter(val => val !== '');
            resolve(Array.from(new Set(names)).sort());
          }
        });
      });
    } catch (e) { return []; }
  }

  static getColumnMapping(label: string): string {
    const columnMap: Record<string, string> = {
      'ITEM NAME': 'ITEM NAME',
      'VARIETY': 'VARIETY',
      'BRAND': 'BRAND',
      'BRAND / MARKING': 'BRAND',
      'PACKING SIZE': 'PACKING SIZE',
      'PACKING': 'PACKING SIZE',
      'SPECIFICATION': 'SPECIFICATION',
      'SPECIFICATIONS': 'SPECIFICATION',
      'DELIVERY TYPE': 'DELIVERY TYPE',
      'MODE OF TRANSPORT': 'MODER OF TRANSPORT',
      'MODER OF TRANSPORT': 'MODER OF TRANSPORT',
      'BAG TYPE': 'BAG TYPE ',
      'PAYMENT TERMS': 'PAYMENT TEARMS',
      'PAYMENT TEARMS': 'PAYMENT TEARMS',
      'BROKER': 'BROKER',
      'BROKER NAME': 'BROKER',
      'PORT OF DISCHARGE': 'PORT OF DISCHARGE',
      'PORT OF LOADING': 'PORT OF LOADING',
      'PORT OF ARRIVAL': 'PORT OF ARRIVAL',
      'SHIPPING LINE': 'SHIPPING LINE',
      'CURRENCY': 'CURRENCY',
      'PARTIES': 'PARTIES',
      'PARTY': 'PARTIES',
      'BUYER': 'PARTIES',
      'CONSIGNEE': 'PARTIES'
    };
    return columnMap[label] || label;
  }

  static async fetchCustomCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${DATA_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (!results.data || results.data.length === 0) {
              resolve([]);
              return;
            }
            const headers = Object.keys(results.data[0] || {});
            const defaultCats = [
              'VENDOR DETAILS', 'PARTIES', 'ITEM NAME', 'VARIETY', 'BRAND', 'PACKING SIZE', 'SPECIFICATION', 
              'DELIVERY TYPE', 'MODER OF TRANSPORT', 'BAG TYPE', 'PAYMENT TEARMS', 
              'BROKER', 'PORT OF DISCHARGE', 'PORT OF LOADING', 'PORT OF ARRIVAL', 'SHIPPING LINE', 'CURRENCY'
            ];
            // Filter out default categories and empty headers
            const customCats = headers
              .map(h => h.trim().toUpperCase())
              .filter(h => h !== '' && !defaultCats.includes(h) && h !== 'ID' && h !== 'DATESAVED');
            resolve(Array.from(new Set(customCats)));
          }
        });
      });
    } catch (e) { return []; }
  }

  static async fetchDataColumn(columnName: string): Promise<string[]> {
    try {
      const response = await fetch(`${DATA_CSV_URL}&t=${Date.now()}`, { method: 'GET' });
      if (!response.ok) return [];
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const headers = Object.keys(results.data[0] || {});
            const col = headers.find(k => 
              k.toLowerCase().trim() === columnName.toLowerCase().trim() ||
              k.toLowerCase().includes(columnName.toLowerCase())
            );
            if (!col) { resolve([]); return; }
            const items = (results.data as any[]).map(row => String(row[col] || '').trim()).filter(val => val !== '' && val !== 'null');
            resolve(Array.from(new Set(items)).sort());
          }
        });
      });
    } catch (e) { return []; }
  }

  static async saveVendorDetail(data: Record<string, any>): Promise<{ success: boolean; message: string }> {
    const url = this.getActiveUrl();
    if (!url) return { success: false, message: 'Deployment URL missing.' };

    const entryId = data.id || `vendor-${Date.now()}`;
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          ...data,
          id: entryId,
          targetSheet: 'VENDOR LIST - DATA',
          dateSaved: new Date().toISOString()
        }),
      });
      return { success: true, message: 'Vendor details saved successfully.' };
    } catch (error) {
      return { success: false, message: 'Network Error.' };
    }
  }

  static async saveDropdownOption(label: string, value: string, formData?: any): Promise<{ success: boolean; message: string }> {
    let url = this.getActiveUrl();
    if (!url) return { success: false, message: 'Deployment URL missing.' };

    let targetSheet = 'MISC - DATA';
    let dataToSave: any = {
      id: `dropdown-${Date.now()}`,
      dateSaved: new Date().toISOString()
    };

    if (label === 'VENDOR NAME') {
      targetSheet = 'VENDOR LIST - DATA';
      dataToSave['VENDOR NAME'] = value;
      if (formData) {
        dataToSave['GSTIN'] = formData.gstin || '';
        dataToSave['CONTACT PERSON'] = formData.contactPersonName || '';
        dataToSave['PHONE NO'] = formData.contactPersonNumber || '';
        dataToSave['ADDRESS LINE 1'] = formData.billingAddress || '';
        dataToSave['CITY'] = formData.city || '';
        dataToSave['STATE'] = formData.state || '';
        dataToSave['PIN CODE'] = formData.pincode || '';
      }
    } else if (label === 'AGAINST SC' || label === 'SALES CONTRACT NO.') {
      targetSheet = 'SALES CONTRACT';
      dataToSave['CONTRACT NO / SC'] = value;
    } else if (label === 'AGAINST INVOICE' || label === 'INVOICE NO.') {
      targetSheet = 'INVOICE';
      dataToSave['INVOICE NO.'] = value;
      if (formData) {
        dataToSave['SALES CONTR/ INVOICE NO.'] = formData.againstSc || '';
        dataToSave['INVOICE NO.'] = value;
        dataToSave['INVOICE DT.'] = formData.invoiceDate || '';
        dataToSave['PRE-CARRIAGE'] = formData.preCarriageBy || '';
        dataToSave['PRE-CARRIER'] = formData.preCarrier || '';
        dataToSave['NET WT. (IN MT)'] = formData.netWtMt || '';
        dataToSave['HOW MUCH FC'] = formData.fclBreakBulk || '';
        dataToSave['TOTAL BAGS (I'] = formData.totalBags || '';
        dataToSave['FOB (RATES/M)'] = formData.fobRate || '';
        dataToSave['FREIGHT (RATE'] = formData.freightRate || '';
        dataToSave['INSURANCE (R'] = formData.insuranceRate || '';
        dataToSave['CIF'] = formData.cif || '';
        dataToSave['CIF Check'] = formData.cifCheck || '';
        dataToSave['INVOICE AMT'] = formData.invoiceAmt || '';
        dataToSave['CURRENCY'] = formData.currency || '';
        dataToSave['BUYER'] = formData.buyer || '';
        dataToSave['BRAND'] = formData.brand || '';
        dataToSave['SHIPPING L'] = formData.shippingLine || '';
        
        // Keep other fields if they exist in the form but not in the screenshot's visible columns
        dataToSave['PORT OF LOADING (POL)'] = formData.pol || '';
        dataToSave['CUT OFF POL'] = formData.cutOffPol || '';
        dataToSave['PORT OF DISPATCHED(POD)'] = formData.pod || '';
        dataToSave['VESSEL ETD'] = formData.vesselEtd || '';
        dataToSave['SB NO.'] = formData.sbNo || '';
        dataToSave['SB DATE'] = formData.sbDate || '';
        dataToSave['PORT CODE'] = formData.portCode || '';
        dataToSave['RODTEP AMT'] = formData.rodtepAmt || '';
        dataToSave['SB.FOREX RATE'] = formData.sbForexRate || '';
        dataToSave['BL NO.'] = formData.blNo || '';
        dataToSave['VESSEL/VOYAG NO'] = formData.vesselVoyageNo || '';
        dataToSave['(POA) PORT OF ARRIVAL'] = formData.poa || '';
        dataToSave['VESSEL/ETA'] = formData.vesselEta || '';
        dataToSave['REMARK'] = formData.remark || '';
        dataToSave['SCRIPT COMPLETED'] = formData.scriptCompleted || '';
        dataToSave['INV RATE'] = formData.invRate || '';
        dataToSave['INV QTY'] = formData.invQty || '';
      }
    } else if (label === 'PARTIES') {
      targetSheet = 'BUYER';
      dataToSave['NAME'] = value;
      if (formData) {
        dataToSave['SR. NO.'] = formData['SR. NO.'] || '';
        dataToSave['LINE 1'] = formData['LINE 1'] || '';
        dataToSave['LINE 2'] = formData['LINE 2'] || '';
      }
    } else {
      targetSheet = 'MISC - DATA';
      const columnName = this.getColumnMapping(label);
      dataToSave[columnName] = value;
    }

    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...dataToSave, id: dataToSave.id, targetSheet }),
      });
      return { success: true, message: `Option saved to ${targetSheet}!` };
    } catch (error) {
      return { success: false, message: 'Network Error.' };
    }
  }

  static async deleteDropdownOption(label: string, value: string): Promise<{ success: boolean; message: string }> {
    const url = this.getActiveUrl();
    if (!url) return { success: false, message: 'Deployment URL missing.' };

    let targetSheet = 'MISC - DATA';
    let columnName = this.getColumnMapping(label);

    if (label === 'VENDOR NAME') {
      targetSheet = 'VENDOR LIST - DATA';
    } else if (label === 'AGAINST SC') {
      targetSheet = 'SC';
      columnName = 'CONTRACT NO / SC';
    } else if (label === 'AGAINST INVOICE') {
      targetSheet = 'INVOICE';
      columnName = 'INVOICE NO.';
    } else if (label === 'PARTIES') {
      targetSheet = 'BUYER';
      columnName = 'NAME';
    }

    try {
      // Note: The Google Apps Script must be configured to handle { action: 'delete' }
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ 
          action: 'delete', 
          targetSheet, 
          columnName, 
          value 
        }),
      });
      return { success: true, message: `Delete request sent for "${value}" in ${columnName}.` };
    } catch (error) {
      return { success: false, message: 'Network Error.' };
    }
  }

  static async savePoEntry(data: Record<string, any>): Promise<{ success: boolean; message: string; id?: string }> {
    return this.saveGenericEntry({ ...data, type: 'RICE PO', dateSaved: new Date().toISOString() }, 'REGISTER');
  }

  static async saveChaEntry(data: Record<string, any>): Promise<{ success: boolean; message: string; id?: string }> {
    return this.saveGenericEntry({ ...data, type: 'CHA PO', dateSaved: new Date().toISOString() }, 'REGISTER');
  }

  static async saveForwarderEntry(data: Record<string, any>): Promise<{ success: boolean; message: string; id?: string }> {
    return this.saveGenericEntry({ ...data, type: 'FORWARDER PO', dateSaved: new Date().toISOString() }, 'REGISTER');
  }

  static async saveInspectionEntry(data: Record<string, any>): Promise<{ success: boolean; message: string; id?: string }> {
    return this.saveGenericEntry({ ...data, type: 'INSPECTION PO', dateSaved: new Date().toISOString() }, 'REGISTER');
  }

  static async saveBagsEntry(data: Record<string, any>): Promise<{ success: boolean; message: string; id?: string }> {
    return this.saveGenericEntry({ ...data, type: 'BAGS PO', dateSaved: new Date().toISOString() }, 'BAGS PO');
  }

  static async saveItemLoadingEntry(data: Record<string, any>): Promise<{ success: boolean; message: string; id?: string }> {
    return this.saveGenericEntry({ ...data, type: 'ITEM LOADING', dateSaved: new Date().toISOString() }, 'REGISTER');
  }

  static async fetchRegister(): Promise<any[]> {
    try {
      // Try CSV first, it's more reliable for reading and doesn't have CORS issues
      const csvResponse = await fetch(`${REGISTER_CSV_URL}&t=${Date.now()}`);
      if (csvResponse.ok) {
        const csvText = await csvResponse.text();
        return new Promise((resolve) => {
          Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
              const data = results.data as any[];
              const validData = data.filter(row => row.id || row.ID || row['PO NUMBER / ID']);
              const groupedData = this.groupItemLoadingEntries(validData);
              localStorage.setItem('po_register', JSON.stringify(groupedData));
              resolve(groupedData);
            },
            error: () => resolve(this.getLocalRegister())
          });
        });
      }
    } catch (e) {
      console.warn('CSV fetch failed, trying Apps Script fallback...');
    }

    const url = this.getActiveUrl();
    if (!url) return this.getLocalRegister();

    try {
      const response = await fetch(`${url}?action=getRegister&t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        const groupedData = this.groupItemLoadingEntries(data);
        localStorage.setItem('po_register', JSON.stringify(groupedData));
        return groupedData;
      }
    } catch (e) {
      // Silently fallback to local storage to avoid console errors
    }

    return this.getLocalRegister();
  }

  private static groupItemLoadingEntries(data: any[]): any[] {
    const grouped: Record<string, any> = {};
    const result: any[] = [];

    for (const row of data) {
      if (row.type === 'ITEM LOADING') {
        if (row.loadingRows && (typeof row.loadingRows === 'string' || Array.isArray(row.loadingRows))) {
          let parsed = row.loadingRows;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch(e) { parsed = []; }
          }
          result.push({ ...row, loadingRows: parsed, groupId: row.groupId || row.id });
          continue;
        }

        const groupKey = row.groupId || row.id;
        
        if (!grouped[groupKey]) {
          grouped[groupKey] = { 
            ...row, 
            loadingRows: [], 
            id: groupKey, 
            groupId: groupKey 
          };
          result.push(grouped[groupKey]);
        }
        
        grouped[groupKey].loadingRows.push({
          id: row.id,
          loadingDate: row.loadingDate || '',
          vhNo: row.vhNo || '',
          cntrNo: row.cntrNo || '',
          bags: row.bags || '',
          qtyTon: row.qtyTon || '',
          grossWt: row.grossWt || '',
          tareWt: row.tareWt || '',
          netWt: row.netWt || '',
          wbSlipPhoto: row.wbSlipPhoto || '',
          transporterName: row.transporterName || '',
          freight: row.freight || '',
          otherDed: row.otherDed || '',
          otherDedAmt: row.otherDedAmt || '',
          remark: row.remark || '',
          amount: row.amount || '',
          bagsWtDedAmt: row.bagsWtDedAmt || '',
          grossAmt: row.grossAmt || '',
          tdsAmount: row.tdsAmount || '',
          cdAmt: row.cdAmt || '',
          netAmt: row.netAmt || '',
          brokerage: row.brokerage || ''
        });
      } else {
        result.push(row);
      }
    }
    return result;
  }

  static async saveGenericEntry(data: Record<string, any>, sheetName: string): Promise<{ success: boolean; message: string; id?: string }> {
    const url = this.getActiveUrl();
    let entryId = data.id || `reg-${Date.now()}`;
    
    if (!url) return { success: false, message: 'Deployment URL missing.', id: entryId };
    
    try {
      // We send the data to Google Sheets
      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ ...data, id: entryId, targetSheet: sheetName }),
      });
      
      return { success: true, message: `Data synced to ${sheetName}!`, id: entryId };
    } catch (error) {
      return { success: false, message: 'Network Error.', id: entryId };
    }
  }

  static getLocalRegister() {
    try {
      return JSON.parse(localStorage.getItem('po_register') || '[]');
    } catch (e) {
      return [];
    }
  }

  static async deleteFromRegister(id: string, type: string) {
    const url = this.getActiveUrl();
    if (!url) return;

    try {
      // Revert to POST with no-cors for Google Apps Script mutations.
      // This is the most reliable way to send data to Apps Script without CORS issues.
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ 
          action: 'deleteRow', 
          targetSheet: 'REGISTER', // Always delete from the REGISTER sheet
          id: id 
        }),
      });
      
      // Also update local storage immediately to prevent "coming back" on next fetch
      const local = this.getLocalRegister();
      const filtered = local.filter((item: any) => item.id !== id);
      localStorage.setItem('po_register', JSON.stringify(filtered));
      
    } catch (e) {
      console.error('Failed to delete from Sheets', e);
    }
  }

  static parseRawData(rawData: string): Promise<LoadingEntry[]> {
    return new Promise((resolve, reject) => {
      let lines = rawData.split(/\r?\n/);
      let startIdx = 0;
      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const lower = lines[i].toLowerCase();
        if (lower.includes('po') || lower.includes('vh') || lower.includes('loading date')) {
          startIdx = i;
          break;
        }
      }
      Papa.parse(lines.slice(startIdx).join('\n'), {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const mappedData = (results.data as any[]).map((row, index) => {
            const find = (keys: string[]) => {
              const fKey = Object.keys(row).find(k => keys.map(x => x.toLowerCase().replace(/[.\s]/g, '')).includes(k.toLowerCase().replace(/[.\s]/g, '')));
              return fKey ? row[fKey] : undefined;
            };
            const parseNum = (v: any) => (typeof v === 'number' ? v : parseFloat(String(v || '0').replace(/[^\d.-]/g, '')) || 0);
            return {
              id: `entry-${index}-${Date.now()}`,
              againstInvoice: String(find(['AGAINST INVOICE']) || ''),
              againstPo: String(find(['AGAINST PO', 'PURCHASE ORDER NO']) || 'UNASSIGNED'),
              againstSc: String(find(['AGAINST SC']) || ''),
              loadingDate: String(find(['LOADING DATE']) || ''),
              invoiceDate: String(find(['INVOICE DATE']) || ''),
              invoiceNo: String(find(['INVOICE NO.']) || ''),
              riceMill: String(find(['RICE MILL', 'VENDOR NAME']) || ''),
              item: String(find(['ITEM', 'ITEM NAME']) || ''),
              unit: String(find(['UNIT']) || 'TON'),
              rate: parseNum(find(['RATE'])),
              brand: String(find(['BRAND', 'BAG MARKING BRAND']) || ''),
              packing: parseNum(find(['PACKING', 'PACKING SIZE'])),
              vhNo: String(find(['VH. NO.']) || ''),
              cntrNo: String(find(['CNTR. NO.']) || ''),
              bags: parseNum(find(['BAGS'])),
              qtyTon: parseNum(find(['QTY (IN TON)', 'TOTAL QUANTITY MT'])),
              grossWt: parseNum(find(['GROSS WT.'])),
              tareWt: parseNum(find(['TARE WT.'])),
              netWt: parseNum(find(['NET WT.'])),
              wbSlipPhoto: String(find(['WB SLIP PHOTO']) || ''),
              transporterName: String(find(['TRANSPORTER NAME']) || ''),
              freight: parseNum(find(['FREIGHT'])),
              amount: parseNum(find(['AMOUNT'])),
              bagsWtGrams: parseNum(find(['BAGS WT. (IN GRAMS)'])) || 120,
              bagsWtDedAmt: parseNum(find(['BAGS WT. DED. AMT.'])),
              grossAmt: parseNum(find(['GROSS AMT'])),
              tdsAmount: parseNum(find(['TDS @ 0.1%'])),
              brokerageRate: parseNum(find(['BROKERAGE RATE', 'BROKRAGE RS 100/MT'])),
              brokerage: parseNum(find(['BROKERAGE AMT.', 'BROKERAGE AMOUNT'])) || parseNum(find(['BROKRAGE RS 100/MT'])),
              cdPercent: parseNum(find(['CD %'])),
              cdAmt: parseNum(find(['CD AMT.'])),
              otherDed: String(find(['OTHER DED.']) || ''),
              otherDedAmt: parseNum(find(['OTHER DED. AMT.'])),
              netAmt: parseNum(find(['NET AMT'])),
              remark: String(find(['REMARK']) || ''),
              broker: String(find(['BROKER', 'BROKER NAME']) || ''),
            } as LoadingEntry;
          }).filter(e => (e.vhNo && e.vhNo.trim() !== '') || (e.againstSc && e.againstSc.trim() !== '') || (e.againstPo && e.againstPo !== 'UNASSIGNED'));
          resolve(mappedData);
        }
      });
    });
  }

  static derivePurchaseOrders(entries: LoadingEntry[], registerData: any[] = []): PurchaseOrder[] {
    const poMap = new Map<string, PurchaseOrder>();
    
    // Add POs from loading entries
    entries.forEach(e => {
      if (!poMap.has(e.againstPo)) {
        poMap.set(e.againstPo, { id: `po-${e.againstPo}`, poNumber: e.againstPo, riceMill: e.riceMill, item: e.item, packing: e.packing, brand: e.brand, totalQty: 0, rate: e.rate, broker: e.broker });
      }
      poMap.get(e.againstPo)!.totalQty += e.qtyTon;
    });
    
    return Array.from(poMap.values());
  }
}
