// Sprint Prioritization Form - Main JavaScript (FIXED VERSION)
// Fixed: Now includes complexity and estimatedHours in selectedItems

'use strict';

// Debug mode
const DEBUG = true;
function debugLog(message) {
    if (DEBUG) {
        console.log(`🐛 [DEBUG] ${message}`);
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
        const response = await fetch('src/data/questions.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        questionsData = await response.json();
        console.log('✅ Questions loaded:', questionsData.questions?.length || 0);
        
        renderQuestions();
        updateFormTitle();
        
    } catch (error) {
        console.error('❌ Error loading questions:', error);
        throw new Error('Failed to load questions: ' + error.message);
    }
}

// Render questions in the DOM
function renderQuestions() {
    const container = document.getElementById('questions-container');
    if (!container || !questionsData?.questions) {
        console.error('❌ Questions container or data not found');
        return;
    }
    
    let html = '<div class="card-foundever-body">';
    
    // Add email field first
    const emailQuestion = questionsData.questions.find(q => q.type === 'email');
    if (emailQuestion) {
        html += `
            <div class="question-item email-question">
                <label class="question-title" for="email">${emailQuestion.title}</label>
                <input type="email" id="email" name="email" 
                       placeholder="${emailQuestion.placeholder}" 
                       required class="form-input">
            </div>
        `;
    }
    
    // Add other questions
    questionsData.questions.forEach((question, index) => {
        if (question.type === 'checkbox') {
            html += `
                <div class="question-item" data-question-id="${question.id}">
                    <div class="question-header">
                        <label class="checkbox-container">
                            <input type="checkbox" value="${question.id}" 
                                   onchange="handleQuestionChange(this)">
                            <span class="checkmark"></span>
                            <span class="question-number">${index}</span>
                            <span class="question-title">${question.title}</span>
                            <span class="question-hours">${question.estimatedHours}</span>
                            <span class="question-complexity">${question.complexity}</span>
                        </label>
                    </div>
                    <div class="question-description">${question.description}</div>
                    <div class="question-meta">
                        <span class="hours-badge">${question.estimatedHours}h</span>
                        <span class="complexity-badge complexity-${question.complexity?.toLowerCase()}">${question.complexity}</span>
                        <span class="category-badge">${question.category}</span>
                    </div>
                    <div class="priority-selector" id="priority_${question.id}" style="display: none;">
                        <label for="priority_select_${question.id}">Priority:</label>
                        <select id="priority_select_${question.id}" onchange="handlePriorityChange('${question.id}')">
                            <option value="">Select priority...</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    console.log('✅ Questions rendered successfully');
}

// 🔧 FIXED: Handle question selection with complete data
function handleQuestionChange(checkbox) {
    const questionId = checkbox.value;
    const questionContainer = checkbox.closest('.question-item');
    const questionNumber = questionContainer.querySelector('.question-number')?.textContent || '';
    const title = questionContainer.querySelector('.question-title')?.textContent || '';
    const hours = parseInt(questionContainer.querySelector('.question-hours')?.textContent) || 0;
    
    // 🔧 FIX: Get complete question data including complexity and estimatedHours
    const questionData = questionsData?.questions?.find(q => q.id === questionId);
    const complexity = questionData?.complexity || 'Unknown';
    const estimatedHours = questionData?.estimatedHours || 0;
    
    const prioritySelect = document.getElementById(`priority_${questionId}`);
    
    if (checkbox.checked) {
        // Show priority dropdown
        if (prioritySelect) {
            prioritySelect.style.display = 'block';
            console.log('✅ Showing priority dropdown for:', questionId);
        }
        
        // 🔧 FIX: Include complete data in selectedItems
        selectedItems.push({
            id: questionId,
            questionNumber: questionNumber,
            title: title,
            hours: hours,
            complexity: complexity,           // ✅ Fixed: Added complexity
            estimatedHours: estimatedHours,   // ✅ Fixed: Added estimatedHours
            priority: ''
        });
        totalHours += hours;
        console.log(`✅ Selected: ${questionNumber}. ${title} (${hours}h, ${complexity})`);
    } else {
        // Hide priority dropdown
        if (prioritySelect) {
            prioritySelect.style.display = 'none';
            prioritySelect.value = '';
        }
        
        selectedItems = selectedItems.filter(item => item.id !== questionId);
        totalHours -= hours;
        console.log(`❌ Deselected: ${questionNumber}. ${title} (${hours}h)`);
    }
    
    updateCapacitySummary();
    updateSubmitButton();
}

// Handle priority changes
function handlePriorityChange(questionId) {
    const prioritySelect = document.getElementById(`priority_select_${questionId}`);
    const priority = prioritySelect.value;
    
    const item = selectedItems.find(item => item.id === questionId);
    if (item) {
        item.priority = priority;
        console.log(`🎯 Priority set: ${item.title} = ${priority}`);
    }
    
    updateSubmitButton();
}

// Update capacity summary
function updateCapacitySummary() {
    const selectedCount = selectedItems.length;
    const capacityUsed = Math.round((totalHours / CAPACITY_LIMIT) * 100);
    
    updateElement('selected-count', selectedCount);
    updateElement('total-hours', totalHours + 'h');
    updateElement('capacity-used', capacityUsed + '%');
    
    updateCapacityStatus(capacityUsed);
    
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
    
    if (capacityUsed <= 50) {
        statusElement.textContent = 'Light Load';
        statusElement.className = 'text-foundever-success';
    } else if (capacityUsed <= 80) {
        statusElement.textContent = 'Good Capacity';
        statusElement.className = 'text-foundever-primary';
    } else if (capacityUsed <= 100) {
        statusElement.textContent = 'Near Capacity';
        statusElement.className = 'text-foundever-warning';
    } else {
        statusElement.textContent = 'Over Capacity';
        statusElement.className = 'text-foundever-danger';
    }
}

// Update submit button state
function updateSubmitButton() {
    const submitBtn = document.getElementById('floating-submit');
    if (!submitBtn) return;
    
    const emailInput = document.querySelector('input[type="email"]');
    const hasEmail = emailInput?.value?.trim() && emailInput.value.includes('@');
    const hasSelections = selectedItems.length > 0;
    const allHavePriorities = selectedItems.every(item => item.priority && item.priority !== '');
    
    const shouldEnable = hasEmail && hasSelections && allHavePriorities;
    
    submitBtn.disabled = !shouldEnable;
    submitBtn.style.opacity = shouldEnable ? '1' : '0.6';
    submitBtn.style.cursor = shouldEnable ? 'pointer' : 'not-allowed';
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('survey-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Email validation
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) {
        emailInput.addEventListener('input', () => {
            validateEmail(emailInput);
            updateSubmitButton();
        });
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const email = formData.get('email')?.trim();
        
        if (!email || selectedItems.length === 0) {
            throw new Error('Please fill all required fields');
        }
        
        showMessage('🔄 Submitting form...', 'info');
        const submitBtn = document.getElementById('floating-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Submitting...</span>';
        }
        
        const submissionData = {
            email: email,
            selectedItems: selectedItems,
            totalHours: totalHours,
            submissionDate: new Date().toISOString(),
            sprintNumber: window.CONFIG?.FORM?.SPRINT_NUMBER || 24,
            capacityUsed: Math.round((totalHours / CAPACITY_LIMIT) * 100)
        };
        
        if (window.AWSIntegration && typeof window.AWSIntegration.submitToAWS === 'function') {
            const response = await window.AWSIntegration.submitToAWS(submissionData);
            showMessage(`✅ Form submitted successfully! Record ID: ${response.id || 'N/A'}`, 'success');
        } else {
            await new Promise(resolve => setTimeout(resolve, 1500));
            showMessage(`✅ Form submitted successfully! (${selectedItems.length} items, ${totalHours}h total)`, 'success');
        }
        
        resetForm();
        
    } catch (error) {
        showMessage(`❌ Submission failed: ${error.message}`, 'error');
        
        const submitBtn = document.getElementById('floating-submit');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Submit Form</span>';
        }
    }
}

// Reset form
function resetForm() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('.priority-selector').forEach(ps => ps.style.display = 'none');
    
    const emailInput = document.querySelector('input[type="email"]');
    if (emailInput) emailInput.value = '';
    
    selectedItems = [];
    totalHours = 0;
    
    updateCapacitySummary();
    updateSubmitButton();
    
    const submitBtn = document.getElementById('floating-submit');
    if (submitBtn) {
        submitBtn.innerHTML = '<span class="btn-icon">📝</span><span class="btn-text">Submit</span>';
    }
}

// Utility functions
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
}

function validateEmail(emailInput) {
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    emailInput.style.borderColor = email && !isValid ? 'var(--danger-color)' : 'var(--border-color)';
    
    if (email && !isValid) {
        showMessage('Please enter a valid email address', 'error');
    } else {
        clearMessage();
    }
}

function updateFormTitle() {
    const titleElement = document.getElementById('form-title');
    if (titleElement && questionsData?.formTitle) {
        titleElement.textContent = questionsData.formTitle;
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('result-message') || createMessageDiv();
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
}

function clearMessage() {
    const messageDiv = document.getElementById('result-message');
    if (messageDiv) messageDiv.style.display = 'none';
}

function createMessageDiv() {
    const div = document.createElement('div');
    div.id = 'result-message';
    div.style.cssText = 'padding: 10px; margin: 10px 0; border-radius: 5px; display: none;';
    document.querySelector('.container').appendChild(div);
    return div;
}

// Global exports
if (typeof window !== 'undefined') {
    window.SprintForm = {
        initializeForm,
        loadQuestions,
        handleFormSubmit,
        selectedItems: () => selectedItems,
        totalHours: () => totalHours
    };
    
    window.handleQuestionChange = handleQuestionChange;
    window.handlePriorityChange = handlePriorityChange;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
} else {
    initializeForm();
}

console.log('🔧 Main.js loaded with PRIORITY FIX - complexity and estimatedHours now included');
