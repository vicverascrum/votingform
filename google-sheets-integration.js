// Google Sheets Integration
// 1. Crear Google Apps Script en sheets.google.com
// 2. Usar este código en el Apps Script:

/*
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  // Agregar fila con datos
  sheet.appendRow([
    new Date(),
    data.email,
    data.selectedItems.length,
    data.totalHours,
    data.capacityUsed + '%',
    JSON.stringify(data.selectedItems)
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({success: true}));
}
*/

// 3. Agregar esta función al main.js:
async function submitToGoogleSheets(data) {
    const GOOGLE_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error enviando a Google Sheets:', error);
        throw error;
    }
}
