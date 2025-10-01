// AWS Integration for Sprint Prioritization Form
// Handles communication with AWS Lambda and DynamoDB

window.AWSIntegration = (function() {
    'use strict';
    
    // Configuration
    const CONFIG = window.CONFIG || {};
    const API_BASE_URL = CONFIG.AWS?.API_BASE_URL || 'https://dubo90gxce.execute-api.us-east-1.amazonaws.com/prod';
    const ENDPOINTS = CONFIG.AWS?.ENDPOINTS || { SUBMIT: '/submit', QUERY: '/query' };
    
    console.log('🔧 AWS Integration initialized');
    console.log('📡 API Base URL:', API_BASE_URL);
    
    // Submit data to AWS Lambda
    async function submitToAWS(data) {
        console.log('📤 Submitting to AWS:', data);
        
        try {
            const response = await fetch(API_BASE_URL + ENDPOINTS.SUBMIT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            console.log('📊 Response status:', response.status);
            console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ AWS response:', result);
            
            if (!result.success) {
                throw new Error(result.error || 'Submission failed');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ AWS submission error:', error);
            throw error;
        }
    }
    
    // Query data from AWS
    async function queryFromAWS(params = {}) {
        console.log('🔍 Querying AWS:', params);
        
        try {
            const queryString = new URLSearchParams(params).toString();
            const url = API_BASE_URL + ENDPOINTS.QUERY + (queryString ? '?' + queryString : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('📊 Query response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ AWS query result:', result);
            
            return result;
            
        } catch (error) {
            console.error('❌ AWS query error:', error);
            throw error;
        }
    }
    
    // Test AWS connection
    async function testAWSConnection() {
        console.log('🧪 Testing AWS connection...');
        
        const testData = {
            email: 'test@foundever.com',
            selectedItems: [{
                id: 'test',
                title: 'Connection Test',
                hours: 1
            }],
            totalHours: 1,
            submissionDate: new Date().toISOString(),
            sprintNumber: 23,
            testMode: true
        };
        
        try {
            const result = await submitToAWS(testData);
            console.log('✅ AWS connection test successful');
            return { success: true, result };
        } catch (error) {
            console.error('❌ AWS connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Prepare form data for AWS submission
    function prepareFormDataForAWS(formData, questions) {
        console.log('🔧 Preparing form data for AWS...');
        
        const email = formData.get('email');
        const selectedItems = [];
        let totalHours = 0;
        
        // Process each question
        questions.forEach(question => {
            if (question.type === 'checkbox') {
                const isSelected = formData.has(question.id);
                if (isSelected) {
                    const hours = question.estimatedHours || 0;
                    selectedItems.push({
                        id: question.id,
                        title: question.title,
                        estimatedHours: hours,
                        complexity: question.complexity || 'Unknown'
                    });
                    totalHours += hours;
                }
            }
        });
        
        const submissionData = {
            email: email,
            selectedItems: selectedItems,
            totalHours: totalHours,
            submissionDate: new Date().toISOString(),
            sprintNumber: CONFIG.FORM?.SPRINT_NUMBER || 23,
            capacityUsed: Math.round((totalHours / (CONFIG.FORM?.CAPACITY_LIMIT || 260)) * 100),
            formVersion: CONFIG.FORM?.VERSION || '2.0.0'
        };
        
        console.log('📄 Prepared AWS data:', submissionData);
        return submissionData;
    }
    
    // Handle AWS errors gracefully
    function handleAWSError(error) {
        console.error('🚨 AWS Error Handler:', error);
        
        let userMessage = 'An error occurred while processing your request.';
        
        if (error.message.includes('fetch')) {
            userMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('HTTP 4')) {
            userMessage = 'Invalid request. Please check your input and try again.';
        } else if (error.message.includes('HTTP 5')) {
            userMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('timeout')) {
            userMessage = 'Request timeout. Please try again.';
        }
        
        return {
            success: false,
            error: error.message,
            userMessage: userMessage,
            timestamp: new Date().toISOString()
        };
    }
    
    // Get submission statistics
    async function getSubmissionStats() {
        try {
            const result = await queryFromAWS({ stats: true });
            return result;
        } catch (error) {
            console.error('❌ Error getting submission stats:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Validate AWS configuration
    function validateAWSConfig() {
        const issues = [];
        
        if (!API_BASE_URL) {
            issues.push('API_BASE_URL not configured');
        }
        
        if (!ENDPOINTS.SUBMIT) {
            issues.push('SUBMIT endpoint not configured');
        }
        
        if (!ENDPOINTS.QUERY) {
            issues.push('QUERY endpoint not configured');
        }
        
        if (issues.length > 0) {
            console.warn('⚠️ AWS Configuration issues:', issues);
            return { valid: false, issues };
        }
        
        console.log('✅ AWS Configuration valid');
        return { valid: true };
    }
    
    // Initialize AWS integration
    function initialize() {
        console.log('🚀 Initializing AWS Integration...');
        
        const configCheck = validateAWSConfig();
        if (!configCheck.valid) {
            console.error('❌ AWS Integration initialization failed:', configCheck.issues);
            return false;
        }
        
        console.log('✅ AWS Integration ready');
        return true;
    }
    
    // Public API
    return {
        submitToAWS,
        queryFromAWS,
        testAWSConnection,
        prepareFormDataForAWS,
        handleAWSError,
        getSubmissionStats,
        validateAWSConfig,
        initialize,
        
        // Configuration getters
        getAPIBaseURL: () => API_BASE_URL,
        getEndpoints: () => ENDPOINTS
    };
})();

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    if (window.AWSIntegration) {
        window.AWSIntegration.initialize();
    }
});

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.AWSIntegration;
}
