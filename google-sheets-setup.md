# Google Sheets Setup - SOLUCIÓN DEFINITIVA

## Pasos para configurar (5 minutos):

1. **Crear Google Sheet**:
   - Ve a: https://sheets.google.com
   - Crea nueva hoja: "VotingForm Submissions"
   - Columnas: Email | Total Hours | Selected Questions | Timestamp

2. **Crear Google Apps Script**:
   - En la hoja: Extensions → Apps Script
   - Pega este código:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    data.email,
    data.totalHours,
    data.selectedQuestions,
    new Date().toISOString()
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true, id: Date.now()}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Desplegar**:
   - Deploy → New deployment
   - Type: Web app
   - Execute as: Me
   - Who has access: Anyone
   - Copiar URL y reemplazar en aws-integration.js

## ✅ VENTAJAS:
- HTTPS nativo
- Funciona desde GitHub Pages
- Datos en Google Sheets (fácil exportar)
- Gratis y confiable
