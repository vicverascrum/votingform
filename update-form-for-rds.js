// Update this in your main.js or aws-integration.js
// Replace the existing AWS integration with this simple API call

// Configuration - UPDATE THIS URL
const API_URL = 'https://your-server.com/api.php'; // Replace with your server URL

// Updated submit function
async function submitFormData(formData) {
    try {
        showMessage('Enviando datos...', 'info');
        
        const response = await fetch(`${API_URL}?action=submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                selectedItems: formData.selectedItems,
                totalHours: formData.totalHours,
                sprintNumber: 24,
                submissionDate: new Date().toISOString()
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ Votación enviada correctamente', 'success');
            // Reset form or redirect
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            throw new Error(result.error || 'Error desconocido');
        }
        
    } catch (error) {
        console.error('Submit error:', error);
        showMessage(`❌ Error: ${error.message}`, 'error');
    }
}

// Function to load results (for dashboard)
async function loadAllResults() {
    try {
        const response = await fetch(`${API_URL}?action=results`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Load results error:', error);
        throw error;
    }
}

// Function to load stats
async function loadStats() {
    try {
        const response = await fetch(`${API_URL}?action=stats`);
        const data = await response.json();
        
        if (data.success) {
            return data.stats;
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Load stats error:', error);
        throw error;
    }
}
