// CÓDIGO FINAL PARA INTEGRAR TU FORMULARIO DE GITHUB PAGES
// Copia este código en tu archivo aws-integration.js

// ✅ URL DE LA API FUNCIONANDO
const API_URL = 'http://44.223.24.11/api-simple.php';

// Función principal para enviar datos a la base de datos
async function submitToDatabase(formData) {
    try {
        showMessage('Enviando votación a la base de datos...', 'info');
        
        // Preparar datos para enviar
        const dataToSend = {
            email: formData.email,
            totalHours: formData.totalHours,
            selectedQuestions: formatSelectedQuestions(formData.selectedItems)
        };
        
        console.log('Enviando datos:', dataToSend);
        
        // Enviar a la API
        const response = await fetch(`${API_URL}?action=submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage(`✅ Votación guardada correctamente (ID: ${result.id})`, 'success');
            
            // Mostrar confirmación
            setTimeout(() => {
                if (confirm('¿Quieres ver todos los resultados de votación?')) {
                    window.open('results-dashboard.html', '_blank');
                }
            }, 2000);
            
            return true;
            
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error al enviar:', error);
        showMessage(`❌ Error: ${error.message}`, 'error');
        return false;
    }
}

// Función para formatear las preguntas seleccionadas
function formatSelectedQuestions(selectedItems) {
    if (!selectedItems || selectedItems.length === 0) {
        return 'Ninguna pregunta seleccionada';
    }
    
    return selectedItems.map((item, index) => {
        const priority = index + 1;
        const complexity = item.complexity || 'Unknown';
        const hours = item.estimatedHours ? `${item.estimatedHours}h` : 'TBD';
        
        return `${priority}. ${item.id} (${complexity}) - ${hours}`;
    }).join(', ');
}

// Función para cargar todos los resultados
async function loadAllResults() {
    try {
        const response = await fetch(`${API_URL}?action=results`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`Cargados ${data.count} resultados:`, data.data);
            return data.data;
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Error al cargar resultados:', error);
        return [];
    }
}

// REEMPLAZA tu función de envío actual con esta:
async function submitFormData(formData) {
    return await submitToDatabase(formData);
}

// Función de prueba (opcional)
async function testAPI() {
    try {
        const response = await fetch(`${API_URL}?action=test`);
        const result = await response.json();
        console.log('Test API:', result);
        return result.success;
    } catch (error) {
        console.error('Error en test:', error);
        return false;
    }
}

console.log('🔗 Integración con base de datos RDS lista');
console.log('📊 API URL:', API_URL);
console.log('✅ Para probar: testAPI()');

// INSTRUCCIONES DE USO:
// 1. Copia todo este código
// 2. Pégalo en tu archivo aws-integration.js (reemplazando el código AWS anterior)
// 3. ¡Ya está! Tu formulario se conectará automáticamente a la base de datos
