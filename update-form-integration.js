// Código para actualizar tu formulario de GitHub Pages
// Reemplaza la función de envío en tu aws-integration.js

// CONFIGURACIÓN - CAMBIA ESTA URL POR LA DE TU SERVIDOR
const API_URL = 'https://tu-servidor.com/api-simple.php'; // ⚠️ CAMBIAR ESTA URL

// Función actualizada para enviar datos a la base de datos
async function submitToDatabase(formData) {
    try {
        showMessage('Enviando votación...', 'info');
        
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
            showMessage('✅ Votación guardada correctamente en la base de datos', 'success');
            
            // Opcional: mostrar ID del voto
            console.log('Voto guardado con ID:', result.id);
            
            // Limpiar formulario después de 2 segundos
            setTimeout(() => {
                if (confirm('¿Quieres enviar otra votación?')) {
                    window.location.reload();
                } else {
                    // Opcional: redirigir a página de resultados
                    window.open('results-dashboard.html', '_blank');
                }
            }, 2000);
            
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Error al enviar:', error);
        showMessage(`❌ Error: ${error.message}`, 'error');
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
        
        return `${item.id} (${complexity}) - ${hours}`;
    }).join(', ');
}

// Función para cargar resultados (opcional)
async function loadResultsFromDatabase() {
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

// INSTRUCCIONES DE INTEGRACIÓN:
// 1. Sube api-simple.php a un servidor con PHP (puede ser AWS EC2, hosting compartido, etc.)
// 2. Cambia la variable API_URL arriba por la URL real de tu servidor
// 3. En tu archivo aws-integration.js, reemplaza la función de envío por submitToDatabase()
// 4. Ejemplo de uso en tu formulario:
//
//    // En lugar de la función AWS actual, usa:
//    submitToDatabase({
//        email: emailValue,
//        totalHours: totalHoursValue,
//        selectedItems: selectedItemsArray
//    });

console.log('🔗 Integración con base de datos lista');
console.log('⚠️  Recuerda cambiar API_URL por la URL real de tu servidor');
