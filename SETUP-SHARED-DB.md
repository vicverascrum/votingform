# 🚀 Configuración Rápida - Base de Datos Compartida

## ⚡ Solución Inmediata para Ver Resultados de Todos

### 📋 **Pasos de Configuración (5 minutos)**

#### 1. **Crear Google Apps Script**
1. Ve a [script.google.com](https://script.google.com)
2. Clic en "Nuevo proyecto"
3. Copia el código de `google-apps-script.js`
4. Pégalo en el editor
5. Guarda el proyecto como "Sprint24-SharedDB"

#### 2. **Desplegar el Script**
1. Clic en "Desplegar" → "Nueva implementación"
2. Tipo: "Aplicación web"
3. Ejecutar como: "Yo"
4. Acceso: "Cualquier persona"
5. Clic en "Desplegar"
6. **Copia la URL del script** (algo como: `https://script.google.com/macros/s/ABC123.../exec`)

#### 3. **Configurar el HTML**
1. Abre `shared-results.html`
2. Reemplaza `YOUR_SCRIPT_ID` con tu URL del script
3. Guarda el archivo

#### 4. **Usar la Solución**
1. Abre `shared-results.html` en tu navegador
2. Los usuarios pueden enviar sus resultados
3. Todos pueden ver los resultados de todos

---

## 🔧 **Integración con Formulario Existente**

### **Opción A: Botón de Envío Adicional**
Agrega este código al formulario principal:

```javascript
// Agregar al final de main.js
function sendToSharedDB(formData) {
    const sharedData = {
        action: 'submit',
        email: formData.email,
        selectedItems: formData.selectedItems.map(item => item.title).join(', '),
        totalHours: formData.totalHours,
        timestamp: new Date().toISOString(),
        capacityPercentage: Math.round((formData.totalHours / 260) * 100)
    };
    
    fetch('TU_SCRIPT_URL_AQUI', {
        method: 'POST',
        mode: 'no-cors',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(sharedData)
    });
}
```

### **Opción B: Envío Automático**
Modifica la función de envío existente para incluir el envío compartido.

---

## 📊 **Características de la Solución**

### ✅ **Ventajas**
- **Implementación inmediata** (5 minutos)
- **Gratis** (usa Google Sheets)
- **Acceso compartido** para todo el equipo
- **Actualización en tiempo real**
- **No requiere servidor** adicional

### 📈 **Funcionalidades**
- Ver todos los resultados en tabla
- Actualización automática cada 30 segundos
- Envío manual de resultados
- Cálculo automático de % de capacidad
- Ordenamiento por fecha

### 🔍 **Datos Almacenados**
- Timestamp de envío
- Email del usuario
- Items seleccionados
- Total de horas
- Porcentaje de capacidad

---

## 🚨 **Implementación de Emergencia (2 minutos)**

Si necesitas algo **INMEDIATO**:

1. **Crea un Google Sheet** manualmente
2. **Comparte el link** con el equipo
3. **Pide a cada usuario** que copie sus resultados manualmente
4. **Columnas sugeridas**: Email | Items | Horas | Fecha

---

## 🔄 **Migración Futura**

Esta solución es temporal. Para producción considera:
- AWS DynamoDB (ya configurado)
- Base de datos SQL
- Firebase Realtime Database

---

## 📞 **Soporte Rápido**

Si tienes problemas:
1. Verifica que el script esté desplegado como "aplicación web"
2. Asegúrate de que el acceso sea "cualquier persona"
3. Copia exactamente la URL del script
4. Prueba primero con `shared-results.html`

**¡Solución lista en 5 minutos!** 🚀
