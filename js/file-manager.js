/**
 * File Manager Module
 * Handles file operations for saving and loading data
 */

class FileManager {
    constructor(dataManager, calculationEngine) {
        this.dataManager = dataManager;
        this.calculationEngine = calculationEngine;
        this.fileInput = null;
        
        this.initializeFileInput();
    }

    /**
     * Initialize hidden file input for JSON loading
     */
    initializeFileInput() {
        this.fileInput = document.getElementById('jsonFileInput');
        if (this.fileInput) {
            this.fileInput.addEventListener('change', this.handleFileLoad.bind(this));
        }
    }

    /**
     * Save current data to JSON file
     */
    saveToJSON() {
        try {
            const dataToSave = this.dataManager.exportData();
            const jsonString = JSON.stringify(dataToSave, null, 2);
            
            this.downloadFile(
                jsonString,
                `bill-splitter-data-${new Date().toISOString().split('T')[0]}.json`,
                'application/json'
            );
            
            this.showNotification('Data saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data: ' + error.message, 'error');
        }
    }

    /**
     * Load data from JSON file
     */
    loadFromJSON() {
        if (this.fileInput) {
            this.fileInput.click();
        }
    }

    /**
     * Handle file selection and loading
     * @param {Event} event - File input change event
     */
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.validateFileType(file)) {
            this.showNotification('Please select a valid JSON file.', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (this.dataManager.importData(data)) {
                    this.showNotification('Data loaded successfully!', 'success');
                    // Trigger UI update
                    window.dispatchEvent(new CustomEvent('dataImported'));
                } else {
                    this.showNotification('Error loading file: Invalid data format.', 'error');
                }
            } catch (error) {
                console.error('Error loading JSON:', error);
                this.showNotification('Error loading file: ' + error.message, 'error');
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Error reading file.', 'error');
        };
        
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    /**
     * Validate file type
     * @param {File} file - File to validate
     * @returns {boolean} Validation result
     */
    validateFileType(file) {
        return file.name.toLowerCase().endsWith('.json') && 
               file.type === 'application/json' || 
               file.type === 'text/plain' || 
               file.type === '';
    }

    /**
     * Export results to text file
     */
    exportResultsToText() {
        try {
            const results = this.calculationEngine.calculateResults();
            const textContent = this.calculationEngine.exportResultsToText(results);
            
            this.downloadFile(
                textContent,
                'bill-splitter-results.txt',
                'text/plain'
            );
            
            this.showNotification('Results exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting results:', error);
            this.showNotification('Error exporting results: ' + error.message, 'error');
        }
    }

    /**
     * Export results to CSV format
     */
    exportResultsToCSV() {
        try {
            const results = this.calculationEngine.calculateResults();
            const csvContent = this.generateCSVContent(results);
            
            this.downloadFile(
                csvContent,
                `bill-splitter-results-${new Date().toISOString().split('T')[0]}.csv`,
                'text/csv'
            );
            
            this.showNotification('CSV exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting CSV:', error);
            this.showNotification('Error exporting CSV: ' + error.message, 'error');
        }
    }

    /**
     * Generate CSV content from results
     * @param {Object} results - Calculation results
     * @returns {string} CSV content
     */
    generateCSVContent(results) {
        const { participantNames, totalSpent, totalOwed, balances } = results;
        
        let csv = 'Participant,Total Paid,Total Owed,Balance\n';
        
        for (let i = 0; i < participantNames.length; i++) {
            const name = participantNames[i];
            const paid = totalSpent[i].toFixed(2);
            const owed = totalOwed[i].toFixed(2);
            const balance = balances[i].toFixed(2);
            
            csv += `"${name}",${paid},${owed},${balance}\n`;
        }
        
        return csv;
    }

    /**
     * Export bills to CSV format
     */
    exportBillsToCSV() {
        try {
            const csvContent = this.generateBillsCSVContent();
            
            this.downloadFile(
                csvContent,
                `bill-splitter-bills-${new Date().toISOString().split('T')[0]}.csv`,
                'text/csv'
            );
            
            this.showNotification('Bills exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting bills:', error);
            this.showNotification('Error exporting bills: ' + error.message, 'error');
        }
    }

    /**
     * Generate CSV content for bills
     * @returns {string} CSV content
     */
    generateBillsCSVContent() {
        const { bills, participantNames } = this.dataManager;
        
        let csv = 'Date,Who Paid,Amount,Notes,Participants\n';
        
        bills.forEach(bill => {
            const date = bill.dateAdded.toLocaleDateString();
            const whoPaid = participantNames[bill.whoPaid] || `P${bill.whoPaid + 1}`;
            const amount = bill.amount.toFixed(2);
            const notes = bill.notes || '';
            const participants = bill.participants
                .map((isParticipant, index) => isParticipant ? participantNames[index] : null)
                .filter(name => name)
                .join('; ');
            
            csv += `"${date}","${whoPaid}",${amount},"${notes}","${participants}"\n`;
        });
        
        return csv;
    }

    /**
     * Download a file
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL object
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: '10000',
            maxWidth: '300px',
            wordWrap: 'break-word',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#27ae60';
                break;
            case 'error':
                notification.style.backgroundColor = '#e74c3c';
                break;
            case 'info':
            default:
                notification.style.backgroundColor = '#3498db';
                break;
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Confirm before loading data (if current data exists)
     * @returns {Promise<boolean>} User confirmation
     */
    confirmLoadData() {
        const { bills, participantCount } = this.dataManager;
        
        if (bills.length > 0 || participantCount > 4) {
            return new Promise((resolve) => {
                const confirmed = confirm(
                    'This will replace your current data. Are you sure you want to continue?'
                );
                resolve(confirmed);
            });
        }
        
        return Promise.resolve(true);
    }

    /**
     * Get file size in human readable format
     * @param {number} bytes - File size in bytes
     * @returns {string} Human readable file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Validate JSON file content
     * @param {string} content - File content
     * @returns {Object} Validation result
     */
    validateJSONContent(content) {
        try {
            const data = JSON.parse(content);
            
            // Check for required fields
            const requiredFields = ['participantCount', 'participantNames', 'bills'];
            const missingFields = requiredFields.filter(field => !(field in data));
            
            if (missingFields.length > 0) {
                return {
                    isValid: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                };
            }
            
            // Validate data types
            if (typeof data.participantCount !== 'number' || data.participantCount < 2) {
                return {
                    isValid: false,
                    error: 'Invalid participant count'
                };
            }
            
            if (!Array.isArray(data.participantNames) || data.participantNames.length !== data.participantCount) {
                return {
                    isValid: false,
                    error: 'Invalid participant names array'
                };
            }
            
            if (!Array.isArray(data.bills)) {
                return {
                    isValid: false,
                    error: 'Invalid bills array'
                };
            }
            
            return {
                isValid: true,
                data: data
            };
            
        } catch (error) {
            return {
                isValid: false,
                error: 'Invalid JSON format: ' + error.message
            };
        }
    }
}

// Export for use in other modules
window.FileManager = FileManager;
