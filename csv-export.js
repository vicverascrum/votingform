// CSV Export functionality
function downloadAsCSV(data) {
    const csvData = [
        // Headers
        ['Timestamp', 'Email', 'Items Selected', 'Total Hours', 'Capacity Used', 'Selected Items'],
        // Data row
        [
            new Date().toISOString(),
            data.email,
            data.selectedItems.length,
            data.totalHours,
            data.capacityUsed + '%',
            data.selectedItems.map(item => `${item.title} (${item.hours}h)`).join('; ')
        ]
    ];
    
    const csvContent = csvData.map(row => 
        row.map(field => `"${field}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint24-submission-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Agregar al main.js después del envío exitoso:
// downloadAsCSV(submissionData);
