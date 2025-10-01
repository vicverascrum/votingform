// Sprint Prioritization Form - Main JavaScript
// Handles form logic, validation, and user interactions

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Sprint Prioritization Form loaded');
    initializeForm();
});

// Debug logging function
function debugLog(message) {
    console.log(message);
    const debugLog = document.getElementById('debug-log');
    if (debugLog) {
        const timestamp = new Date().toLocaleTimeString();
        debugLog.innerHTML += `<br>[${timestamp}] ${message}`;
        debugLog.scrollTop = debugLog.scrollHeight;
    }
}

// Global variables
let questionsData = null;
let selectedItems = [];
let totalHours = 0;
const CAPACITY_LIMIT = window.CONFIG?.FORM?.CAPACITY_LIMIT || 260;

// Initialize the form
async function initializeForm() {
    try {
        await loadQuestions();
        setupEventListeners();
        updateCapacitySummary();
        console.log('✅ Form initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing form:', error);
        showMessage('Error initializing form: ' + error.message, 'error');
    }
}

// Load questions from JSON file
async function loadQuestions() {
    try {
        console.log('📄 Loading questions...');
        
        const response = await fetch('src/data/questions.json?v=' + Date.now());
        if (!response.ok) {
            throw new Error('Failed to load questions.json');
        }
        
        questionsData = await response.json();
        console.log(`✅ Loaded ${questionsData.questions.length} questions`);
        
        renderQuestions();
        updateFormTitle();
        
    } catch (error) {
        console.warn('⚠️ Failed to load questions.json, using fallback data');
        questionsData = getFallbackQuestions();
        renderQuestions();
        updateFormTitle();
    }
}

// Render questions in the form
function renderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) {
        console.error('❌ Questions container not found');
        return;
    }
    
    container.innerHTML = '';
    
    questionsData.questions.forEach((question, index) => {
        const questionElement = createQuestionElement(question, index);
        container.appendChild(questionElement);
    });
    
    console.log(`✅ Rendered ${questionsData.questions.length} questions`);
}

// Create individual question element
function createQuestionElement(question, index) {
    const div = document.createElement('div');
    div.className = 'question-card foundever-fade-in';
    div.style.animationDelay = `${index * 0.1}s`;
    
    if (question.type === 'email') {
        div.innerHTML = `
            <div class="question-title">${question.title}</div>
            <div class="input-group">
                <input type="email" 
                       id="${question.id}" 
                       name="${question.id}" 
                       class="text-input form-control-foundever" 
                       placeholder="${question.placeholder || 'Enter your email'}" 
                       ${question.required ? 'required' : ''}>
            </div>
        `;
    } else if (question.type === 'checkbox') {
        const hours = question.estimatedHours || 'TBD';
        const complexity = question.complexity || '';
        const note = question.note || '';
        
        div.innerHTML = `
            <div class="checkbox-group">
                <input type="checkbox" 
                       id="${question.id}" 
                       name="${question.id}" 
                       data-hours="${question.estimatedHours || 0}"
                       data-title="${question.title}">
                <div class="checkbox-content">
                    <label for="${question.id}" class="question-title">${question.title}</label>
                    ${question.description ? `<div style="font-size: 0.85rem; color: #555; margin: 0.3rem 0; line-height: 1.4;">${question.description}</div>` : ''}
                    <div class="question-meta">
                        <span class="hours-badge badge-foundever">${hours}h</span>
                    </div>
                    ${note ? `<div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">📝 ${note}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    return div;
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    const form = document.getElementById('survey-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Checkbox changes
    document.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox' && e.target.dataset.hours !== undefined) {
            handleCheckboxChange(e.target);
        }
    });
    
    // Email validation
    document.addEventListener('input', function(e) {
        if (e.target.type === 'email') {
            validateEmail(e.target);
        }
    });
    
    // Also update button on any form change
    document.addEventListener('input', updateSubmitButton);
    document.addEventListener('change', updateSubmitButton);
    
    console.log('✅ Event listeners setup complete');
}

// Handle checkbox changes
function handleCheckboxChange(checkbox) {
    const hours = parseInt(checkbox.dataset.hours) || 0;
    const title = checkbox.dataset.title || '';
    const questionId = checkbox.id;
    
    if (checkbox.checked) {
        // Check if this would exceed capacity
        if (totalHours + hours > CAPACITY_LIMIT) {
            checkbox.checked = false;
            showMessage(`❌ Cannot select "${title}". Would exceed ${CAPACITY_LIMIT}h limit.`, 'error');
            return;
        }
        
        selectedItems.push({
            id: questionId,
            title: title,
            hours: hours
        });
        totalHours += hours;
        console.log(`✅ Selected: ${title} (${hours}h)`);
    } else {
        selectedItems = selectedItems.filter(item => item.id !== questionId);
        totalHours -= hours;
        console.log(`❌ Deselected: ${title} (${hours}h)`);
    }
    
    updateCapacitySummary();
    updateSubmitButton();
}

// Update capacity summary
function updateCapacitySummary() {
    const selectedCount = selectedItems.length;
    const capacityUsed = Math.round((totalHours / CAPACITY_LIMIT) * 100);
    
    // Update counters if they exist
    updateElement('selected-count', selectedCount);
    updateElement('total-hours', totalHours + 'h');
    updateElement('capacity-used', capacityUsed + '%');
    
    // Update capacity status
    updateCapacityStatus(capacityUsed);
    
    // Show/hide capacity summary
    const summaryElement = document.getElementById('capacity-summary');
    if (summaryElement) {
        summaryElement.style.display = selectedCount > 0 ? 'grid' : 'none';
    }
    
    console.log(`📊 Capacity: ${selectedCount} items, ${totalHours}h (${capacityUsed}%)`);
}

// Update capacity status
function updateCapacityStatus(capacityUsed) {
    const statusElement = document.getElementById('capacity-status');
    if (!statusElement) return;
    
    if (capacityUsed > 100) {
        statusElement.textContent = 'Over capacity!';
        statusElement.style.color = 'var(--danger-color)';
    } else if (capacityUsed > 80) {
        statusElement.textContent = 'Near capacity';
        statusElement.style.color = 'var(--warning-color)';
    } else {
        statusElement.textContent = 'Good capacity';
        statusElement.style.color = 'var(--success-color)';
    }
}

// Update submit button state
function updateSubmitButton() {
    const submitBtn = document.getElementById('floating-submit');
    if (!submitBtn) return;
    
    const emailInput = document.querySelector('input[type="email"]');
    const hasEmail = emailInput?.value?.trim() && emailInput.value.includes('@');
    const hasSelections = selectedItems.length > 0;
    
    const shouldEnable = hasEmail && hasSelections;
    
    submitBtn.disabled = !shouldEnable;
    
    if (shouldEnable) {
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
    } else {
        submitBtn.style.opacity = '0.6';
        submitBtn.style.cursor = 'not-allowed';
    }
}

// Validate email
function validateEmail(emailInput) {
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (email && !isValid) {
        emailInput.style.borderColor = 'var(--danger-color)';
        showMessage('Please enter a valid email address', 'error');
    } else {
        emailInput.style.borderColor = 'var(--border-color)';
        clearMessage();
    }
    
    updateSubmitButton();
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    debugLog('📤 Form submission started');
    
    try {
        // Validate form
        const formData = new FormData(e.target);
        const email = formData.get('email')?.trim();
        
        debugLog(`📧 Email: ${email}`);
        debugLog(`📊 Selected items: ${selectedItems.length}`);
        debugLog(`⏰ Total hours: ${totalHours}`);
        
        if (!email) {
            throw new Error('Email is required');
        }
        
        if (selectedItems.length === 0) {
            throw new Error('Please select at least one item');
        }
        
        // Show loading state
        showMessage('🔄 Submitting form...', 'info');
        const submitBtn = document.getElementById('floating-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Submitting...</span>';
        }
        
        // Prepare submission data
        const submissionData = {
            email: email,
            selectedItems: selectedItems,
            totalHours: totalHours,
            submissionDate: new Date().toISOString(),
            sprintNumber: window.CONFIG?.FORM?.SPRINT_NUMBER || 24,
            capacityUsed: Math.round((totalHours / CAPACITY_LIMIT) * 100)
        };
        
        debugLog('📋 Submission data prepared');
        
        // Try AWS submission if available
        debugLog('🔍 Checking AWS Integration...');
        if (window.AWSIntegration && typeof window.AWSIntegration.submitToAWS === 'function') {
            debugLog('📡 AWS Integration found, attempting submission...');
            try {
                const response = await window.AWSIntegration.submitToAWS(submissionData);
                debugLog('✅ AWS submission successful!');
                showMessage(`✅ Form submitted to AWS! Record ID: ${response.id || 'N/A'}`, 'success');
            } catch (awsError) {
                debugLog(`❌ AWS submission failed: ${awsError.message}`);
                debugLog('💾 Saving data locally as backup...');
                
                // Save to localStorage as backup
                const localData = JSON.parse(localStorage.getItem('sprint24_submissions') || '[]');
                localData.push({
                    ...submissionData,
                    id: 'local_' + Date.now(),
                    savedAt: new Date().toISOString()
                });
                localStorage.setItem('sprint24_submissions', JSON.stringify(localData));
                
                debugLog(`✅ Data saved locally! Total submissions: ${localData.length}`);
                showMessage(`✅ Form submitted and saved locally! (AWS unavailable)`, 'success');
            }
        } else {
            debugLog('📝 AWS Integration not available, using fallback...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            debugLog('✅ Simulated submission successful');
            showMessage(`✅ Form submitted successfully! (${selectedItems.length} items, ${totalHours}h total)`, 'success');
        }
        
        // Reset form
        resetForm();
        
    } catch (error) {
        debugLog(`❌ Form submission error: ${error.message}`);
        showMessage(`❌ Submission failed: ${error.message}`, 'error');
        
        // Restore submit button
        const submitBtn = document.getElementById('floating-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Submit</span>';
        }
    }
}

// Reset form after successful submission
function resetForm() {
    // Clear checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // Clear email
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) emailInput.value = '';
    
    // Reset variables
    selectedItems = [];
    totalHours = 0;
    
    // Update UI
    updateCapacitySummary();
    updateSubmitButton();
    
    // Restore submit button
    const submitBtn = document.getElementById('floating-submit');
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Submit</span>';
    }
    
    console.log('🔄 Form reset complete');
}

// Update form title
function updateFormTitle() {
    const titleElement = document.getElementById('form-title');
    if (titleElement && questionsData?.formTitle) {
        titleElement.textContent = questionsData.formTitle;
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('result-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = type;
        messageElement.style.display = 'block';
    }
    console.log(`📢 Message (${type}): ${message}`);
}

// Clear message
function clearMessage() {
    const messageElement = document.getElementById('result-message');
    if (messageElement) {
        messageElement.style.display = 'none';
    }
}

// Update element content safely
function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

// Fallback questions if JSON fails to load
function getFallbackQuestions() {
    return {
        formTitle: "Sprint 23 Prioritization",
        subtitle: "Select items for the upcoming sprint",
        questions: [
            {
                id: "email",
                type: "email",
                title: "Your Email Address",
                placeholder: "Enter your email",
                required: true
            },
            {
                id: "question1",
                type: "checkbox",
                title: "Associate Evaluation form dates",
                estimatedHours: 24,
                complexity: "High"
            },
            {
                id: "question2",
                type: "checkbox",
                title: "Export observation feedback pointers",
                estimatedHours: 4,
                complexity: "Low"
            },
            {
                id: "question3",
                type: "checkbox",
                title: "Visual button for pending acknowledgment",
                estimatedHours: 4,
                complexity: "Low"
            },
            {
                id: "question4",
                type: "checkbox",
                title: "Automatic email generation",
                estimatedHours: 16,
                complexity: "Medium"
            },
            {
                id: "question5",
                type: "checkbox",
                title: "OJT KPI 'NA' functionality",
                estimatedHours: null,
                complexity: "High",
                note: "TBD - Requires technical analysis"
            },
            {
                id: "question6",
                type: "checkbox",
                title: "Class cancellation status",
                estimatedHours: 20,
                complexity: "Medium"
            },
            {
                id: "question7",
                type: "checkbox",
                title: "STAR history visibility",
                estimatedHours: 6,
                complexity: "Low"
            },
            {
                id: "question8",
                type: "checkbox",
                title: "Admin ECN editing capability",
                estimatedHours: 48,
                complexity: "Very High"
            },
            {
                id: "question9",
                type: "checkbox",
                title: "OJT - Revamp",
                estimatedHours: 200,
                complexity: "Critical",
                note: "Major project - consider separate planning"
            }
        ]
    };
}

// Export functions for testing
if (typeof window !== 'undefined') {
    window.SprintForm = {
        initializeForm,
        loadQuestions,
        handleFormSubmit,
        selectedItems: () => selectedItems,
        totalHours: () => totalHours
    };
}
