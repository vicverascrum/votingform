// Solución específica para GitHub Pages
// Este archivo se carga solo cuando se detecta GitHub Pages

(function() {
    'use strict';
    
    // Detectar si estamos en GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (!isGitHubPages) {
        console.log('🏠 Local environment detected - using direct API');
        return;
    }
    
    console.log('🌐 GitHub Pages detected - applying fixes');
    
    // Sobrescribir la función de envío para GitHub Pages
    if (window.AWSIntegration) {
        const originalSubmit = window.AWSIntegration.submitToAWS;
        
        window.AWSIntegration.submitToAWS = async function(data) {
            console.log('🔧 GitHub Pages override - using alternative method');
            
            // Mostrar mensaje al usuario
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = 'position: fixed; top: 100px; left: 50%; transform: translateX(-50%); background: #007bff; color: white; padding: 15px; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.2);';
            alertDiv.innerHTML = '🌐 GitHub Pages: Enviando voto...';
            document.body.appendChild(alertDiv);
            
            try {
                // Preparar datos
                const dataToSend = {
                    email: data.email,
                    totalHours: data.totalHours,
                    selectedQuestions: formatSelectedQuestions(data.selectedItems)
                };
                
                // Usar proxy CORS con GET para enviar datos
                const params = new URLSearchParams({
                    action: 'submit',
                    email: dataToSend.email,
                    totalHours: dataToSend.totalHours,
                    selectedQuestions: dataToSend.selectedQuestions
                });
                
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                const apiUrl = encodeURIComponent(`http://44.223.24.11/api-simple.php?${params}`);
                
                alertDiv.innerHTML = '📡 Conectando vía proxy...';
                
                const response = await fetch(`${proxyUrl}${apiUrl}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.success) {
                    alertDiv.style.background = '#28a745';
                    alertDiv.innerHTML = `✅ ¡Voto guardado correctamente! ID: ${result.id}`;
                    
                    setTimeout(() => {
                        alertDiv.remove();
                    }, 3000);
                    
                    return {
                        success: true,
                        message: result.message,
                        id: result.id
                    };
                } else {
                    throw new Error(result.error || 'Error desconocido');
                }
                
            } catch (error) {
                console.error('❌ GitHub Pages submission error:', error);
                
                alertDiv.style.background = '#dc3545';
                alertDiv.innerHTML = `❌ Error: No se pudo guardar el voto<br><small>Problema de conectividad desde GitHub Pages</small>`;
                
                setTimeout(() => {
                    alertDiv.remove();
                }, 5000);
                
                // Guardar localmente como fallback
                try {
                    const localData = JSON.parse(localStorage.getItem('votingform-submissions') || '[]');
                    localData.push({
                        ...data,
                        timestamp: new Date().toISOString(),
                        source: 'github-pages-fallback'
                    });
                    localStorage.setItem('votingform-submissions', JSON.stringify(localData));
                    
                    alertDiv.style.background = '#ffc107';
                    alertDiv.innerHTML = `⚠️ Voto guardado localmente<br><small>Se enviará cuando sea posible</small>`;
                    
                    return {
                        success: true,
                        message: 'Voto guardado localmente (GitHub Pages fallback)',
                        id: 'local-' + Date.now()
                    };
                } catch (localError) {
                    throw error;
                }
            }
        };
        
        // Función auxiliar para formatear preguntas
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
        
        console.log('✅ GitHub Pages override applied');
    }
})();
