/**
 * Main Application Controller
 * Coordinates all modules and handles application lifecycle
 */

class BillSplitterApp {
    constructor() {
        this.dataManager = null;
        this.calculationEngine = null;
        this.uiManager = null;
        this.fileManager = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            this.initializeModules();
            this.setupGlobalEventHandlers();
            this.initializeUI();
            
            this.isInitialized = true;
            console.log('Bill Splitter App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Initialize all modules
     */
    initializeModules() {
        // Initialize data manager
        this.dataManager = new DataManager();
        
        // Initialize calculation engine
        this.calculationEngine = new CalculationEngine(this.dataManager);
        
        // Initialize UI manager
        this.uiManager = new UIManager(this.dataManager, this.calculationEngine);
        
        // Initialize file manager
        this.fileManager = new FileManager(this.dataManager, this.calculationEngine);
    }

    /**
     * Setup global event handlers
     */
    setupGlobalEventHandlers() {
        // Handle data import events
        window.addEventListener('dataImported', () => {
            this.uiManager.generateParticipantNames();
            this.uiManager.generateBillsTable();
            this.uiManager.calculateAndDisplayResults();
        });

        // Handle window resize for responsive updates
        window.addEventListener('resize', this.debounce(() => {
            this.uiManager.calculateAndDisplayResults();
        }, 250));

        // Handle beforeunload to warn about unsaved changes
        window.addEventListener('beforeunload', (e) => {
            // You could add logic here to detect unsaved changes
            // For now, we'll let the browser handle it
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeyboardShortcuts.bind(this));
    }

    /**
     * Initialize the UI
     */
    initializeUI() {
        this.uiManager.initialize();
        this.setupButtonEventHandlers();
    }

    /**
     * Setup button event handlers
     */
    setupButtonEventHandlers() {
        // Participant management
        this.setupButtonHandler('updateParticipantCount', () => {
            this.uiManager.handleParticipantCountChange();
        });

        // Bill management
        this.setupButtonHandler('addBillRow', () => {
            this.uiManager.addBillRow();
        });


        // Table operations


        // Sorting
        this.setupSortHandlers();

        // File operations
        this.setupButtonHandler('saveToJSON', () => {
            this.fileManager.saveToJSON();
        });

        this.setupButtonHandler('loadFromJSON', () => {
            this.fileManager.loadFromJSON();
        });

        this.setupButtonHandler('exportResults', () => {
            this.fileManager.exportResultsToText();
        });

        // Manual toggle
        this.setupButtonHandler('toggleManual', () => {
            this.uiManager.toggleManual();
        });
    }

    /**
     * Setup button handler for a specific function
     * @param {string} functionName - Function name
     * @param {Function} handler - Event handler
     */
    setupButtonHandler(functionName, handler) {
        // Handle onclick attributes in HTML
        window[functionName] = handler;
    }

    /**
     * Setup sort handlers
     */
    setupSortHandlers() {
        const sortOptions = ['whoPaid', 'amount', 'notes', 'date'];
        
        sortOptions.forEach(sortBy => {
            window[`sortTable_${sortBy}`] = () => {
                this.uiManager.sortTable(sortBy);
            };
        });
    }

    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleGlobalKeyboardShortcuts(event) {
        // Ctrl/Cmd + S: Save JSON
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.fileManager.saveToJSON();
            return;
        }

        // Ctrl/Cmd + O: Load JSON
        if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
            event.preventDefault();
            this.fileManager.loadFromJSON();
            return;
        }

        // Ctrl/Cmd + E: Export results
        if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
            event.preventDefault();
            this.fileManager.exportResultsToText();
            return;
        }

        // Ctrl/Cmd + N: Add new bill
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.uiManager.addBillRow();
            return;
        }

        // Escape: Close any open modals or reset focus
        if (event.key === 'Escape') {
            this.handleEscapeKey();
            return;
        }
    }

    /**
     * Handle escape key press
     */
    handleEscapeKey() {
        // Close any open notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Reset focus to a safe element
        const safeElement = document.querySelector('input, button, select');
        if (safeElement) {
            safeElement.focus();
        }
    }

    /**
     * Show error message to user
     * @param {string} message - Error message
     */
    showError(message) {
        console.error(message);
        
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>⚠️ Error</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        // Style the error notification
        Object.assign(errorDiv.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000'
        });
        
        const errorContent = errorDiv.querySelector('.error-content');
        Object.assign(errorContent.style, {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        });
        
        document.body.appendChild(errorDiv);
    }

    /**
     * Get application state
     * @returns {Object} Application state
     */
    getState() {
        if (!this.isInitialized) {
            return { initialized: false };
        }

        return {
            initialized: true,
            data: this.dataManager.getStateSummary(),
            ui: {
                isCalculating: this.uiManager.isCalculating,
                isGrouped: this.dataManager.isGrouped
            }
        };
    }

    /**
     * Reset application to default state
     */
    reset() {
        if (confirm('Are you sure you want to reset the application? This will clear all data.')) {
            // Reinitialize data manager with default values
            this.dataManager = new DataManager();
            this.calculationEngine = new CalculationEngine(this.dataManager);
            this.uiManager.dataManager = this.dataManager;
            this.uiManager.calculationEngine = this.calculationEngine;
            this.fileManager.dataManager = this.dataManager;
            this.fileManager.calculationEngine = this.calculationEngine;
            
            // Refresh UI
            this.uiManager.generateParticipantNames();
            this.uiManager.generateBillsTable();
            this.uiManager.calculateAndDisplayResults();
            
            this.fileManager.showNotification('Application reset successfully!', 'success');
        }
    }

    /**
     * Debounce function for performance
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get application version and info
     * @returns {Object} Application info
     */
    getAppInfo() {
        return {
            name: 'Bill Splitter',
            version: '2.0.0',
            description: 'A modern, feature-rich bill splitting application',
            author: 'Victor Lü',
            initialized: this.isInitialized,
            modules: {
                dataManager: !!this.dataManager,
                calculationEngine: !!this.calculationEngine,
                uiManager: !!this.uiManager,
                fileManager: !!this.fileManager
            }
        };
    }
}

// Initialize the application when the script loads
let app;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new BillSplitterApp();
        window.billSplitterApp = app; // Make available globally for debugging
    });
} else {
    app = new BillSplitterApp();
    window.billSplitterApp = app; // Make available globally for debugging
}

// Export for use in other modules
window.BillSplitterApp = BillSplitterApp;
