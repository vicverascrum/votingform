// Script para sincronizar datos locales con la base de datos
// Se ejecuta desde un entorno local que puede acceder a la API

(function() {
    'use strict';
    
    // Función para sincronizar datos pendientes
    async function syncPendingVotes() {
        const pendingVotes = JSON.parse(localStorage.getItem('votingform-submissions') || '[]');
        
        if (pendingVotes.length === 0) {
            console.log('✅ No hay votos pendientes para sincronizar');
            return;
        }
        
        console.log(`📤 Sincronizando ${pendingVotes.length} votos pendientes...`);
        
        const results = [];
        
        for (const vote of pendingVotes) {
            try {
                const response = await fetch('http://44.223.24.11/api-simple.php?action=submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: vote.email,
                        totalHours: vote.totalHours,
                        selectedQuestions: vote.selectedQuestions
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    console.log(`✅ Voto sincronizado: ${vote.email} -> ID: ${result.id}`);
                    results.push({ ...vote, synced: true, dbId: result.id });
                } else {
                    console.error(`❌ Error sincronizando: ${vote.email} -> ${result.error}`);
                    results.push({ ...vote, synced: false, error: result.error });
                }
                
            } catch (error) {
                console.error(`❌ Error de red: ${vote.email} -> ${error.message}`);
                results.push({ ...vote, synced: false, error: error.message });
            }
        }
        
        // Limpiar votos sincronizados exitosamente
        const stillPending = results.filter(r => !r.synced);
        localStorage.setItem('votingform-submissions', JSON.stringify(stillPending));
        
        const syncedCount = results.filter(r => r.synced).length;
        console.log(`🎉 Sincronización completa: ${syncedCount}/${pendingVotes.length} votos guardados en BD`);
        
        return results;
    }
    
    // Exponer función globalmente
    window.syncPendingVotes = syncPendingVotes;
    
    // Auto-sincronizar si estamos en entorno local
    if (!window.location.hostname.includes('github.io')) {
        console.log('🏠 Entorno local detectado - auto-sincronizando...');
        setTimeout(syncPendingVotes, 2000);
    }
    
})();
