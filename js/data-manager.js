/**
 * Data Manager Module
 * Handles all data operations for the Bill Splitter application
 */

class DataManager {
    constructor() {
        this.participantCount = 4;
        this.participantNames = ['Alice', 'Bob', 'Charlie', 'Diana'];
        this.bills = this.createDefaultBills();
        this.isGrouped = false;
        this.version = '2.0';
        
        // Event listeners for data changes
        this.listeners = {
            dataChanged: [],
            participantChanged: [],
            billChanged: []
        };
    }

    /**
     * Create default bills for demonstration
     * @returns {Array} Array of default bill objects
     */
    createDefaultBills() {
        return [
            { 
                id: this.generateId(),
                whoPaid: 0, 
                amount: 100, 
                notes: 'Dinner for everyone', 
                participants: [true, true, true, true], 
                dateAdded: new Date('2024-01-01') 
            },
            { 
                id: this.generateId(),
                whoPaid: 1, 
                amount: 30, 
                notes: 'Drinks', 
                participants: [true, true, true, true], 
                dateAdded: new Date('2024-01-01') 
            },
            { 
                id: this.generateId(),
                whoPaid: 2, 
                amount: 40, 
                notes: 'Dessert', 
                participants: [true, true, true, true], 
                dateAdded: new Date('2024-01-01') 
            },
            { 
                id: this.generateId(),
                whoPaid: 3, 
                amount: 20, 
                notes: 'Tip', 
                participants: [true, true, true, true], 
                dateAdded: new Date('2024-01-01') 
            }
        ];
    }

    /**
     * Generate unique ID for bills
     * @returns {string} Unique identifier
     */
    generateId() {
        return 'bill_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Update participant count with validation
     * @param {number} newCount - New participant count
     * @returns {boolean} Success status
     */
    updateParticipantCount(newCount) {
        if (!this.validateParticipantCount(newCount)) {
            return false;
        }

        const oldCount = this.participantCount;
        this.participantCount = newCount;

        // Adjust participant names array
        this.adjustParticipantNames();
        
        // Adjust bills array
        this.adjustBillsForParticipantCount();

        this.notifyListeners('participantChanged', { oldCount, newCount });
        this.notifyListeners('dataChanged');
        
        return true;
    }

    /**
     * Validate participant count
     * @param {number} count - Count to validate
     * @returns {boolean} Validation result
     */
    validateParticipantCount(count) {
        return Number.isInteger(count) && count >= 2 && count <= 20;
    }

    /**
     * Adjust participant names array for new count
     */
    adjustParticipantNames() {
        if (this.participantNames.length < this.participantCount) {
            while (this.participantNames.length < this.participantCount) {
                this.participantNames.push(`Participant ${this.participantNames.length + 1}`);
            }
        } else if (this.participantNames.length > this.participantCount) {
            this.participantNames = this.participantNames.slice(0, this.participantCount);
        }
    }

    /**
     * Adjust bills array for new participant count
     */
    adjustBillsForParticipantCount() {
        this.bills.forEach(bill => {
            // Adjust whoPaid if it's now out of range
            if (bill.whoPaid >= this.participantCount) {
                bill.whoPaid = 0;
            }
            
            // Adjust participants array
            if (bill.participants.length < this.participantCount) {
                while (bill.participants.length < this.participantCount) {
                    bill.participants.push(true);
                }
            } else if (bill.participants.length > this.participantCount) {
                bill.participants = bill.participants.slice(0, this.participantCount);
            }
        });
    }

    /**
     * Update participant name
     * @param {number} index - Participant index
     * @param {string} name - New name
     */
    updateParticipantName(index, name) {
        if (index >= 0 && index < this.participantCount) {
            this.participantNames[index] = name || `Participant ${index + 1}`;
            this.notifyListeners('participantChanged', { index, name });
            this.notifyListeners('dataChanged');
        }
    }

    /**
     * Add a new bill
     * @param {Object} billData - Bill data
     * @returns {Object} Created bill
     */
    addBill(billData = {}) {
        const newBill = {
            id: this.generateId(),
            whoPaid: billData.whoPaid || 0,
            amount: billData.amount || 0,
            notes: billData.notes || '',
            participants: billData.participants || new Array(this.participantCount).fill(true),
            dateAdded: billData.dateAdded || new Date()
        };

        this.bills.push(newBill);
        this.notifyListeners('billChanged', { action: 'add', bill: newBill });
        this.notifyListeners('dataChanged');
        
        return newBill;
    }

    /**
     * Update an existing bill
     * @param {string} billId - Bill ID
     * @param {Object} updates - Updates to apply
     * @returns {boolean} Success status
     */
    updateBill(billId, updates) {
        const billIndex = this.bills.findIndex(bill => bill.id === billId);
        if (billIndex === -1) return false;

        this.bills[billIndex] = { ...this.bills[billIndex], ...updates };
        this.notifyListeners('billChanged', { action: 'update', bill: this.bills[billIndex] });
        this.notifyListeners('dataChanged');
        
        return true;
    }

    /**
     * Remove a bill
     * @param {string} billId - Bill ID
     * @returns {boolean} Success status
     */
    removeBill(billId) {
        const billIndex = this.bills.findIndex(bill => bill.id === billId);
        if (billIndex === -1) return false;

        const removedBill = this.bills.splice(billIndex, 1)[0];
        this.notifyListeners('billChanged', { action: 'remove', bill: removedBill });
        this.notifyListeners('dataChanged');
        
        return true;
    }

    /**
     * Move a bill to a new position
     * @param {string} billId - Bill ID
     * @param {number} newIndex - New position
     * @returns {boolean} Success status
     */
    moveBill(billId, newIndex) {
        const currentIndex = this.bills.findIndex(bill => bill.id === billId);
        if (currentIndex === -1 || newIndex < 0 || newIndex >= this.bills.length) {
            return false;
        }

        const [movedBill] = this.bills.splice(currentIndex, 1);
        this.bills.splice(newIndex, 0, movedBill);
        
        this.notifyListeners('billChanged', { action: 'move', bill: movedBill, newIndex });
        this.notifyListeners('dataChanged');
        
        return true;
    }

    /**
     * Sort bills by criteria
     * @param {string} sortBy - Sort criteria
     * @param {string} direction - Sort direction ('asc' or 'desc')
     */
    sortBills(sortBy, direction = 'asc') {
        this.bills.sort((a, b) => {
            let aVal, bVal;
            
            switch(sortBy) {
                case 'whoPaid':
                    aVal = this.participantNames[a.whoPaid] || `P${a.whoPaid + 1}`;
                    bVal = this.participantNames[b.whoPaid] || `P${b.whoPaid + 1}`;
                    break;
                case 'amount':
                    aVal = a.amount;
                    bVal = b.amount;
                    break;
                case 'notes':
                    aVal = (a.notes || '').toLowerCase();
                    bVal = (b.notes || '').toLowerCase();
                    break;
                case 'date':
                    aVal = a.dateAdded;
                    bVal = b.dateAdded;
                    break;
                default:
                    return 0;
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.notifyListeners('billChanged', { action: 'sort', sortBy, direction });
        this.notifyListeners('dataChanged');
    }


    /**
     * Ungroup bills (restore original order)
     */
    ungroupBills() {
        if (!this.isGrouped) return;
        
        this.sortBills('date', 'asc');
        this.isGrouped = false;
        this.notifyListeners('dataChanged');
    }

    /**
     * Get all data for export
     * @returns {Object} Complete application data
     */
    exportData() {
        return {
            participantCount: this.participantCount,
            participantNames: [...this.participantNames],
            bills: this.bills.map(bill => ({
                ...bill,
                dateAdded: bill.dateAdded.toISOString()
            })),
            isGrouped: this.isGrouped,
            version: this.version,
            savedAt: new Date().toISOString()
        };
    }

    /**
     * Import data from external source
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    importData(data) {
        try {
            // Validate data structure
            if (!this.validateImportedData(data)) {
                throw new Error('Invalid data structure');
            }

            // Import data
            this.participantCount = data.participantCount;
            this.participantNames = [...data.participantNames];
            this.bills = data.bills.map(bill => ({
                ...bill,
                dateAdded: new Date(bill.dateAdded)
            }));
            this.isGrouped = data.isGrouped || false;

            this.notifyListeners('dataChanged');
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * Validate imported data structure
     * @param {Object} data - Data to validate
     * @returns {boolean} Validation result
     */
    validateImportedData(data) {
        return data && 
               typeof data.participantCount === 'number' &&
               Array.isArray(data.participantNames) &&
               Array.isArray(data.bills) &&
               data.participantNames.length === data.participantCount;
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    addEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    removeEventListener(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Notify all listeners of an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    notifyListeners(event, data = null) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Get current state summary
     * @returns {Object} State summary
     */
    getStateSummary() {
        return {
            participantCount: this.participantCount,
            billCount: this.bills.length,
            totalAmount: this.bills.reduce((sum, bill) => sum + (bill.amount || 0), 0),
            isGrouped: this.isGrouped
        };
    }
}

// Export for use in other modules
window.DataManager = DataManager;
