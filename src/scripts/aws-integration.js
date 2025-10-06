window.AWSIntegration = (function() {
    'use strict';
    
    const API_URL = window.location.origin + window.location.pathname.replace(/\/$/, '');
    const VERSION = '3.1.0-PRIORITY-FIXED';
    
    console.log('🔧 Lambda Integration initialized (PRIORITY FIXED)');
    console.log('📡 API URL:', API_URL);
    console.log('🏷️ Version:', VERSION);
    
    // 🔧 FIXED: Submit data with correct priority formatting
    async function submitToAWS(data) {
        console.log('📤 Submitting to RDS Database via Lambda:', data);
        
        const alertDiv = document.createElement('div');
        alertDiv.style.cssText = 'position: fixed; top: 50px; left: 10px; background: #007bff; color: white; padding: 10px; border-radius: 5px; z-index: 10000; max-width: 300px;';
        alertDiv.textContent = 'Enviando voto a base de datos...';
        document.body.appendChild(alertDiv);
        
        try {
            const dataToSend = {
                email: data.email,
                totalHours: data.totalHours,
                selectedQuestions: formatSelectedQuestions(data.selectedItems) // 🔧 Fixed formatting
            };
            
            console.log('📊 Formatted data:', dataToSend);
            alertDiv.textContent = 'Conectando a Lambda...';
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            console.log('📊 Response status:', response.status);
            alertDiv.textContent = `Respuesta recibida: ${response.status}`;
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Lambda response:', result);
            
            alertDiv.style.background = '#28a745';
            alertDiv.textContent = '✅ Voto guardado en base de datos!';
            
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 3000);
            
            return result;
            
        } catch (error) {
            console.error('❌ AWS submission error:', error);
            
            alertDiv.style.background = '#dc3545';
            alertDiv.textContent = `❌ Error: ${error.message}`;
            
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 5000);
            
            throw error;
        }
    }
    
    // 🔧 FIXED: Format selected questions with correct data
    function formatSelectedQuestions(selectedItems) {
        if (!selectedItems || selectedItems.length === 0) {
            return 'Ninguna pregunta seleccionada';
        }
        
        return selectedItems.map((item, index) => {
            const priority = index + 1;
            // 🔧 FIX: Use the correct properties from selectedItems
            const complexity = item.complexity || 'Unknown';
            const hours = item.estimatedHours ? `${item.estimatedHours}h` : 'TBD';
            
            return `${priority}. ${item.id} (${complexity}) - ${hours}`;
        }).join(', ');
    }
    
    // Test API connection
    async function testConnection() {
        console.log('🧪 Testing Lambda API connection');
        
        try {
            const response = await fetch(API_URL);
            console.log('✅ Connection test successful:', response.status);
            return { success: true, status: response.status };
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Public API
    return {
        submitToAWS,
        testConnection,
        formatSelectedQuestions,
        version: VERSION
    };
})();

console.log('🔧 AWS Integration loaded with PRIORITY FIX');
