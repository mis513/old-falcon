/**
 * UNIFIED EXPORT LOGISTICS SCRIPT - V20 (Updated Invoice Mapping)
 * Destination Tabs: REGISTER, RICE PO, CHA PO, FORWARDER PO, INSPECTION PO, Sheet1, MISC - DATA, VENDOR LIST - DATA, SALES CONTRACT, INVOICE, BUYER
 */

function getSheetSafe(ss, name) {
  if (!name) return null;
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;
  
  var sheets = ss.getSheets();
  var searchName = name.trim().toLowerCase();
  for (var i = 0; i < sheets.length; i++) {
    var sName = sheets[i].getName().trim().toLowerCase();
    if (sName === searchName) return sheets[i];
  }
  
  if (searchName === 'sc') return getSheetSafe(ss, 'SALES CONTRACT');
  if (searchName === 'invoice - data' || searchName === 'sheet5') return getSheetSafe(ss, 'INVOICE');
  
  return null;
}

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("Apps Script is ACTIVE. Please access via the Web App.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  if (e.parameter.action === 'getRegister') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = getSheetSafe(ss, 'REGISTER');
    if (!sheet) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    
    var values = sheet.getDataRange().getValues();
    if (values.length < 2) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
    
    var headers = values[0];
    var data = [];
    for (var i = 1; i < values.length; i++) {
      var obj = {};
      for (var j = 0; j < headers.length; j++) {
        obj[headers[j]] = values[i][j];
      }
      data.push(obj);
    }
    
    data.sort(function(a, b) {
      return new Date(b.dateSaved || 0) - new Date(a.dateSaved || 0);
    });

    return ContentService.createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData) return ContentService.createTextOutput("No data received").setMimeType(ContentService.MimeType.TEXT);
    
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.action === 'deleteRow') {
      deleteFromSheet(ss, 'REGISTER', data.id);
      if (data.type) deleteFromSheet(ss, data.type, data.id);
      return ContentService.createTextOutput("Success: Deleted").setMimeType(ContentService.MimeType.TEXT);
    }

    if (data.action === 'delete') {
      var target = data.targetSheet || 'MISC - DATA';
      var sheet = getSheetSafe(ss, target);
      return handleDelete(sheet, data);
    }

    var type = data.type || data.targetSheet;
    
    var specificSheets = ['RICE PO', 'CHA PO', 'FORWARDER PO', 'INSPECTION PO', 'ITEM LOADING', 'Sheet1', 'SC', 'SALES CONTRACT', 'INVOICE', 'INVOICE - DATA', 'Sheet5', 'BAGS PO'];
    if (specificSheets.indexOf(type) !== -1) {
      saveToSpecificSheet(ss, type, data);
    }

    var registerSheet = getSheetSafe(ss, 'REGISTER');
    if (registerSheet) {
      saveOrUpdateRegister(registerSheet, data);
    }

    var targetSheetObj = getSheetSafe(ss, type);
    if (type === 'VENDOR LIST - DATA') {
      saveVendorDetails(targetSheetObj, data);
    } else if (type === 'BUYER') {
      saveBuyerDetails(targetSheetObj, data);
    } else if (specificSheets.indexOf(type) === -1) {
      var target2 = type || 'MISC - DATA';
      saveDropdownOptions(getSheetSafe(ss, target2), data);
    }

    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function saveToSpecificSheet(ss, sheetName, data) {
  var sheet = getSheetSafe(ss, sheetName);
  if (!sheet) return;
  
  var row = [];
  var isSalesContract = (sheetName === 'SC' || sheetName === 'SALES CONTRACT');
  
  if (sheetName === 'CHA PO') {
    row = [data.chaPoNo || "", data.chaPoDate || "", data.againstSc || "", data.againstInvoice || "", data.shippingLine || "" , data.containerBookingNumber || "", data.portOfLoading || "", data.portOfDispatched || "", data.portOfArrival || "", data.vesselSailingDate || "", data.exportItem || "", data.variety || "", data.bagBrand || "", data.forwarder || "", data.quantity || "", data.riceMill || "", data.stuffingLoading || "", data.remark || "", data.id || ""];
  } else if (sheetName === 'FORWARDER PO') {
    row = [data.forwarderPo || "", data.poDate || "", data.vendorName || "", data.portOfLoading || "", data.portOfDispatched || "", data.portOfArrival || "", data.qtyCntr || "", data.vesselSailingDate || "", data.shippingLine || "", data.currency || "", data.ratePerContainer || "",data.CURRENCY || "", data.otherRate1 || "", data.otherRate1Label || "", data.otherRate1_2 || "", data.otherRate2 || "", data.otherRate2Label || "", data.otherRate2_2 || "", data.otherRate3 || "", data.otherRate3Label || "", data.otherRate3_2 || "", data.otherRate4 || "", data.otherRate4Label || "", data.otherRate4_2 || "", data.id || ""];
  } else if (sheetName === 'INSPECTION PO') {
    row = [data.inspectionPo || "", data.vendorName || "", data.poDate || "", data.falconInvoice || "", data.type || "", data.purchaseOrderNo || "", data.item || "", data.riceMill || "", data.itemVendorName || "", data.itemVendorAddress || "", data.brokerName || "", data.brand || "", data.packing || "", data.loadingSchedule || "", data.falconInvoice || "", data.id || ""];
  } else if (sheetName === 'RICE PO') {
    row = [data.purchaseOrderNo || "", data.againstSc || "", data.againstInvoice || "", data.poDate || "", data.vendorName || "", data.billingAddress || "", data.gstin || "", data.city || "", data.state || "", data.pincode || "", data.contactPersonName || "", data.contactPersonNumber || "", data.loadingLocation || "", data.itemName || "",  data.totalQuantityMt || "", data.packingSize || "", data.noOfBags || "", data.bagType || "", data.bagMarkingBrand || "", data.anySpecialInstructions || "", data.specifications || "", data.ratePerMt || "", data.totalPoValue || "", data.freightIncludedExtra || "", data.advanceAmount || "", data.paymentTerms || "", data.broker || "", data.brokerageRate || "", data.surveyorAgency || "", data.deliveryType || "", data.deliveryLocationAddress || "", data.loadingInstruction || "", data.modeOfTransport || "", data.dispatchSchedule || "", data.remark || "", data.id || ""];
  } else if (sheetName === 'ITEM LOADING' || sheetName === 'Sheet1') {
    row = [data.againstInvoice || "", data.againstPo || "", data.loadingDate || "", data.invoiceDate || "", data.invoiceNo || "", data.riceMill || "", data.item || "", data.unit || "", data.rate || "", data.brand || "", data.packing || "", data.vhNo || "", data.cntrNo || "", data.bags || "", data.qtyTon || "", data.grossWt || "", data.tareWt || "", data.netWt || "", data.wbSlipPhoto || "", data.transporterName || "", data.freight || "", data.amount || "", data.bagsWtGrams || "", data.bagsWtDedAmt || "", data.grossAmt || "", data.tdsAmount || "", data.brokerage || "", data.cdPercent || "", data.cdAmt || "", data.otherDed || "", data.otherDedAmt || "", data.netAmt || "", data.remark || "", data.id || ""];
  } else if (isSalesContract) {
    row = [
      data.salesContractNo || "", data.contractDate || "", data.otherReferences || "", data.buyer || "",
      data.consignee || "", data.firstNotifyParty || "", data.secondNotifyParty || "", data.thirdNotifyParty || "",
      data.fourthNotifyParty || "", data.fifthNotifyParty || "", data.indentor || "", data.countryOfOrigin || "",
      data.countryOfFinalDestination || "", data.finalDestination || "", data.portOfDischarge || "", data.descriptionOfGoods || "",
      data.brand || "", data.incoterms || "", data.contractQty || "", data.currency || "",
      data.ratePerMts || "", data.hsCode || "", data.totalContractualValue || "", data.termsOfPayment || "",
      data.emptyBagsWeightGrams || "", data.packingKgs || "", data.packingDetails || "", data.totalShipmentTill || "",
      data.ectnTakenBy || "", data.soldUnsold || "", data.note4 || "", data.fourthNotifyParty || "",
      data.fifthNotifyParty || "", data.id || ""
    ];
  } else if (sheetName === 'BAGS PO') {
    row = [
      data.poDate || "", 
      data.bagsPoNo || "", 
      data.vendorName || "", 
      data.falconInvReff || "", 
      data.bagMarking || "", 
      data.bagPacking || "", 
      data.bagWt || "", 
      data.bagType || "", 
      data.qty || "", 
      data.noOfBags || "", 
      data.bagMarkingPhoto || "", 
      data.deliveryAddress || "", 
      data.remark || "",
      data.id || ""
    ];
  } else if (sheetName === 'INVOICE' || sheetName === 'INVOICE - DATA' || sheetName === 'Sheet5') {
    row = [
      data['SALES CONTR/ INVOICE NO.'] || "", 
      data['INVOICE NO.'] || "",
      data['INVOICE DT.'] || "",
      data['PRE-CARRIAGE'] || "",
      data['PRE-CARRIER'] || "",
      data['NET WT. (IN MT)'] || "",
      data['HOW MUCH FC'] || "",
      data['TOTAL BAGS (I'] || "",
      data['FOB (RATES/M)'] || "",
      data['FREIGHT (RATE'] || "",
      data['INSURANCE (R'] || "",
      data['CIF'] || "",
      data['CIF Check'] || "",
      data['INVOICE AMT'] || "",
      data['CURRENCY'] || "",
      data['BUYER'] || "",
      data['BRAND'] || "",
      data['SHIPPING L'] || "",
      data.id || ""
    ];
  }

  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;

  if (isSalesContract) {
    var scNo = String(data.salesContractNo || "").trim();
    if (scNo) {
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0] || "").trim() === scNo) {
          rowIndex = i + 1;
          break;
        }
      }
    }
  } else {
    var idCol = values[0].length - 1; 
    for (var i = 1; i < values.length; i++) {
      if (values[i][idCol] == data.id) {
        rowIndex = i + 1;
        break;
      }
    }
  }

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function saveOrUpdateRegister(sheet, data) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  
  if (headers.length === 0 || (headers.length === 1 && headers[0] === "")) {
    headers = Object.keys(data).filter(function(k) { return k !== 'targetSheet'; });
    if (headers.indexOf('id') === -1) headers.push('id');
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    values = [headers];
  } else {
    var keys = Object.keys(data);
    var newKeys = keys.filter(function(k) { 
      return k !== 'targetSheet' && headers.indexOf(k) === -1; 
    });
    if (newKeys.length > 0) {
      sheet.getRange(1, headers.length + 1, 1, newKeys.length).setValues([newKeys]);
      headers = headers.concat(newKeys);
    }
  }
  
  var idCol = headers.indexOf('id');
  var rowIndex = -1;
  
  if (idCol !== -1 && data.id) {
    for (var i = 1; i < values.length; i++) {
      if (values[i][idCol] == data.id) {
        rowIndex = i + 1;
        break;
      }
    }
  }
  
  var row = headers.map(function(h) {
    return data[h] !== undefined ? data[h] : "";
  });
  
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }
}

function deleteFromSheet(ss, sheetName, id) {
  var sheet = getSheetSafe(ss, sheetName);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  var idCol = values[0].indexOf('id');
  if (idCol === -1) idCol = values[0].length - 1;
  
  for (var i = values.length - 1; i >= 1; i--) {
    if (values[i][idCol] == id) {
      sheet.deleteRow(i + 1);
    }
  }
}

function saveVendorDetails(sheet, data) {
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  var colC = sheet.getRange(1, 3, lastRow > 0 ? lastRow + 100 : 100, 1).getValues(); 
  var targetRow = -1;
  for (var r = 1; r < colC.length; r++) {
    if (colC[r][0] === "" || colC[r][0] === null) {
      targetRow = r + 1;
      break;
    }
  }
  if (targetRow === -1) targetRow = (lastRow > 0 ? lastRow : 1) + 1;

  var row = [
    data['SR. NO.'] || "", data['VENDOR CATEGORY'] || "", data['VENDOR NAME'] || "", data['GSTIN'] || "",
    data['EMAIL'] || "", data['CONTACT PERSON'] || "", data['PHONE NO'] || "", data['ADDRESS LINE 1'] || "",
    data['ADDRESS LINE 2'] || "", data['LOADING LOCATION'] || "", data['CITY'] || "", data['PIN CODE'] || "",
    data['STATE'] || "", data['CURRENCY'] || "", data['BANK'] || "", data['BANK BRANCH'] || "", data['IFSC'] || "",
    data['AC NO.'] || "", data['BANK 2'] || "", data['BANK 2 BRANCH'] || "", data['BANK 2 IFSC'] || "",
    data['BANK 2 AC. NO.'] || "", data['BANK 2 SWIFT'] || "", data['REMARKS'] || "", data.id || ""
  ];
  
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
}

function saveBuyerDetails(sheet, data) {
  if (!sheet) return;
  var lastRow = sheet.getLastRow();
  var colB = sheet.getRange(1, 2, lastRow > 0 ? lastRow + 100 : 100, 1).getValues(); 
  var targetRow = -1;
  for (var r = 1; r < colB.length; r++) {
    if (colB[r][0] === "" || colB[r][0] === null) {
      targetRow = r + 1;
      break;
    }
  }
  if (targetRow === -1) targetRow = (lastRow > 0 ? lastRow : 1) + 1;

  var srNo = targetRow - 1;
  var row = [srNo, data['NAME'] || "", data['LINE 1'] || "", data['LINE 2'] || ""];
  sheet.getRange(targetRow, 1, 1, row.length).setValues([row]);
}

function saveDropdownOptions(sheet, data) {
  if (!sheet) return;
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) lastCol = 1; 
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  for (var key in data) {
    if (['targetSheet', 'id', 'dateSaved', 'action'].indexOf(key) === -1) {
      var colIndex = -1;
      for (var h = 0; h < headers.length; h++) {
        if (String(headers[h]).trim().toLowerCase() === String(key).trim().toLowerCase()) {
          colIndex = h + 1;
          break;
        }
      }
      if (colIndex === -1) {
        lastCol++;
        colIndex = lastCol;
        sheet.getRange(1, colIndex).setValue(key); 
        headers.push(key); 
      }
      if (colIndex !== -1) {
        var lastRow = sheet.getLastRow();
        var colData = sheet.getRange(1, colIndex, lastRow > 0 ? lastRow + 50 : 50, 1).getValues();
        var firstEmptyRow = -1;
        for (var r = 0; r < colData.length; r++) {
          if (colData[r][0] === "" || colData[r][0] === null) {
            firstEmptyRow = r + 1;
            break;
          }
        }
        if (firstEmptyRow === -1) firstEmptyRow = (lastRow > 0 ? lastRow : 1) + 1;
        sheet.getRange(firstEmptyRow, colIndex).setValue(data[key]);
      }
    }
  }
}

function handleDelete(sheet, data) {
  if (!sheet) return ContentService.createTextOutput("Error: Sheet not found").setMimeType(ContentService.MimeType.TEXT);
  var colName = String(data.columnName).trim().toLowerCase();
  var valueToDelete = String(data.value).trim().toLowerCase();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colIndex = -1;
  for (var h = 0; h < headers.length; h++) {
    if (String(headers[h]).trim().toLowerCase() === colName) {
      colIndex = h + 1;
      break;
    }
  }
  if (colIndex > 0) {
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return ContentService.createTextOutput("Success: Sheet empty").setMimeType(ContentService.MimeType.TEXT);
    var range = sheet.getRange(2, colIndex, lastRow - 1, 1);
    var values = range.getValues();
    var deletedCount = 0;
    for (var i = 0; i < values.length; i++) {
      if (String(values[i][0]).trim().toLowerCase() === valueToDelete) {
        sheet.getRange(i + 2, colIndex).clearContent();
        deletedCount++;
      }
    }
    return ContentService.createTextOutput("Success: Deleted " + deletedCount + " items").setMimeType(ContentService.MimeType.TEXT);
  }
  return ContentService.createTextOutput("Error: Column '" + data.columnName + "' not found").setMimeType(ContentService.MimeType.TEXT);
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT);
}
