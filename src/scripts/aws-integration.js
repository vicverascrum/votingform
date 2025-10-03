// RDS Database Integration for Sprint Prioritization Form
// Updated to use new RDS API instead of AWS Lambda
// VERSION: 2.1.0 - RDS Integration

window.AWSIntegration = (function() {
    'use strict';
    
    // ✅ Nueva configuración para RDS API con HTTPS
    const API_URL = 'https://44.223.24.11/api-simple.php';
    const VERSION = '2.1.1-HTTPS';
    
    console.log('🔧 RDS Integration initialized');
    console.log('📡 API URL:', API_URL);
    console.log('🏷️ Version:', VERSION);
    
    // Mostrar versión en la página
    document.addEventListener('DOMContentLoaded', function() {
        const versionEl = document.createElement('div');
        versionEl.id = 'version-info';
        versionEl.style.cssText = 'position: fixed; bottom: 10px; right: 10px; background: rgba(0,123,255,0.8); color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; z-index: 9999;';
        versionEl.textContent = `v${VERSION}`;
        document.body.appendChild(versionEl);
    });
    
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
    
    // Submit data to RDS Database
    async function submitToAWS(data) {
        console.log('📤 Submitting to RDS Database:', data);
        console.log('🌐 Current protocol:', window.location.protocol);
        console.log('🌐 Current host:', window.location.host);
        
        try {
            // Preparar datos para la nueva API
            const dataToSend = {
                email: data.email,
                totalHours: data.totalHours,
                selectedQuestions: formatSelectedQuestions(data.selectedItems)
            };
            
            console.log('📊 Formatted data:', dataToSend);
            
            const response = await fetch(`${API_URL}?action=submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            });
            
            console.log('📊 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ RDS response:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Submission failed');
            }
            
            return {
                success: true,
                message: result.message,
                id: result.id
            };
            
        } catch (error) {
            console.error('❌ RDS submission error:', error);
            
            // Detectar errores CORS
            if (error.message.includes('CORS') || error.message.includes('fetch')) {
                console.error('🚨 CORS Error detected - GitHub Pages (HTTPS) cannot access HTTP API');
                throw new Error('CORS Error: GitHub Pages requires HTTPS API. Contact admin to enable HTTPS on server.');
            }
            
            throw error;
        }
    }
    
    // Query data from RDS Database
    async function queryFromAWS() {
        console.log('📥 Querying from RDS Database');
        
        try {
            const response = await fetch(`${API_URL}?action=results`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Query response:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Query failed');
            }
            
            return {
                success: true,
                data: result.data,
                count: result.count
            };
            
        } catch (error) {
            console.error('❌ RDS query error:', error);
            throw error;
        }
    }
    
    // Test API connection
    async function testConnection() {
        console.log('🧪 Testing RDS API connection');
        
        try {
            const response = await fetch(`${API_URL}?action=test`);
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ API connection successful:', result);
                return true;
            } else {
                console.error('❌ API test failed:', result);
                return false;
            }
            
        } catch (error) {
            console.error('❌ Connection test error:', error);
            return false;
        }
    }
    
    // Public API
    return {
        submit: submitToAWS,
        submitToAWS: submitToAWS,  // Mantener compatibilidad con main.js
        query: queryFromAWS,
        test: testConnection
    };
})();

// Test connection on load
document.addEventListener('DOMContentLoaded', function() {
    if (window.AWSIntegration) {
        window.AWSIntegration.test();
    }
});

console.log('🔗 RDS Database Integration loaded successfully');
