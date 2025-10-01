// Export Local Data Functions

// Export to CSV
function exportToCSV() {
    const data = JSON.parse(localStorage.getItem('sprint24_submissions') || '[]');
    
    if (data.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const headers = ['ID', 'Email', 'Submission Date', 'Items Count', 'Total Hours', 'Capacity Used', 'Selected Items'];
    const rows = data.map(submission => [
        submission.id,
        submission.email,
        submission.submissionDate,
        submission.selectedItems.length,
        submission.totalHours,
        submission.capacityUsed + '%',
        submission.selectedItems.map(item => `${item.title} (${item.hours}h)`).join('; ')
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint24-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`📊 Exported ${data.length} submissions to CSV`);
}

// Export to JSON
function exportToJSON() {
    const data = JSON.parse(localStorage.getItem('sprint24_submissions') || '[]');
    
    if (data.length === 0) {
        alert('No hay datos para exportar');
        return;
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint24-submissions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`📊 Exported ${data.length} submissions to JSON`);
}

// Show statistics
function showStats() {
    const data = JSON.parse(localStorage.getItem('sprint24_submissions') || '[]');
    
    if (data.length === 0) {
        alert('No hay datos guardados');
        return;
    }
    
    const stats = {
        totalSubmissions: data.length,
        totalHours: data.reduce((sum, s) => sum + s.totalHours, 0),
        avgHours: Math.round(data.reduce((sum, s) => sum + s.totalHours, 0) / data.length),
        mostSelectedItems: {}
    };
    
    // Count item selections
    data.forEach(submission => {
        submission.selectedItems.forEach(item => {
            stats.mostSelectedItems[item.title] = (stats.mostSelectedItems[item.title] || 0) + 1;
        });
    });
    
    console.log('📊 Sprint 24 Statistics:', stats);
    alert(`📊 Estadísticas Sprint 24:
    
Total submissions: ${stats.totalSubmissions}
Total hours: ${stats.totalHours}h
Average hours: ${stats.avgHours}h

Top 3 items más seleccionados:
${Object.entries(stats.mostSelectedItems)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([item, count], i) => `${i+1}. ${item}: ${count} veces`)
    .join('\n')}`);
}

// Add export buttons to page (hidden by default)
function addExportButtons() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const exportDiv = document.createElement('div');
    exportDiv.style.cssText = 'margin: 2rem 0; text-align: center;';
    exportDiv.innerHTML = `
        <!-- Hidden admin toggle -->
        <div id="admin-toggle" style="margin: 1rem 0;">
            <small style="color: #999; cursor: pointer; font-size: 0.7rem;" onclick="toggleAdminPanel()">⚙️</small>
        </div>
        
        <!-- Hidden admin panel -->
        <div id="admin-panel" style="display: none; padding: 1rem; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
            <h4 style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">Admin Tools</h4>
            <button onclick="showStats()" style="margin: 0.2rem; padding: 0.4rem 0.8rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📈 Stats</button>
            <button onclick="exportToCSV()" style="margin: 0.2rem; padding: 0.4rem 0.8rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📄 CSV</button>
            <button onclick="exportToJSON()" style="margin: 0.2rem; padding: 0.4rem 0.8rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">📋 JSON</button>
            <button onclick="window.open('view-data.html', '_blank')" style="margin: 0.2rem; padding: 0.4rem 0.8rem; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">👁️ View</button>
        </div>
    `;
    
    container.appendChild(exportDiv);
}

// Toggle admin panel
function toggleAdminPanel() {
    const panel = document.getElementById('admin-panel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addExportButtons, 1000); // Wait for other elements to load
});
