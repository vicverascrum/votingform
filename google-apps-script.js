// Google Apps Script para manejar la base de datos compartida
// Copia este código en script.google.com

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'submit') {
      return submitData(data);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'get') {
      return getData();
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function submitData(data) {
  try {
    // Obtener o crear la hoja de cálculo
    const sheet = getOrCreateSheet();
    
    // Agregar los datos
    sheet.appendRow([
      new Date(data.timestamp),
      data.email,
      data.selectedItems,
      data.totalHours,
      data.capacityPercentage
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getData() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    // Remover el header y convertir a objetos
    const results = data.slice(1).map(row => ({
      timestamp: row[0],
      email: row[1],
      selectedItems: row[2],
      totalHours: row[3],
      capacityPercentage: row[4]
    }));
    
    // Ordenar por fecha (más recientes primero)
    results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return ContentService
      .createTextOutput(JSON.stringify(results))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  const spreadsheetName = 'Sprint 24 - Resultados Compartidos';
  const sheetName = 'Resultados';
  
  // Buscar spreadsheet existente
  const files = DriveApp.getFilesByName(spreadsheetName);
  let spreadsheet;
  
  if (files.hasNext()) {
    spreadsheet = SpreadsheetApp.open(files.next());
  } else {
    // Crear nuevo spreadsheet
    spreadsheet = SpreadsheetApp.create(spreadsheetName);
  }
  
  // Obtener o crear la hoja
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Agregar headers
    sheet.getRange(1, 1, 1, 5).setValues([[
      'Timestamp',
      'Email',
      'Selected Items',
      'Total Hours',
      'Capacity %'
    ]]);
    
    // Formatear headers
    const headerRange = sheet.getRange(1, 1, 1, 5);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f8f9fa');
  }
  
  return sheet;
}

// Función para limpiar datos (opcional)
function clearAllData() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
}

// Función para obtener estadísticas (opcional)
function getStats() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return {totalSubmissions: 0, averageHours: 0, maxHours: 0};
    }
    
    const hours = data.slice(1).map(row => row[3]);
    const totalSubmissions = hours.length;
    const averageHours = hours.reduce((a, b) => a + b, 0) / totalSubmissions;
    const maxHours = Math.max(...hours);
    
    return {
      totalSubmissions,
      averageHours: Math.round(averageHours),
      maxHours
    };
    
  } catch (error) {
    return {error: error.toString()};
  }
}
