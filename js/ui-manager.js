/**
 * UI Manager Module
 * Handles all user interface operations and DOM manipulation
 */

class UIManager {
    constructor(dataManager, calculationEngine) {
        this.dataManager = dataManager;
        this.calculationEngine = calculationEngine;
        this.isCalculating = false;
        this.calculationIndicator = null;
        
        // Bind methods to maintain context
        this.handleParticipantCountChange = this.handleParticipantCountChange.bind(this);
        this.handleParticipantNameChange = this.handleParticipantNameChange.bind(this);
        this.handleBillChange = this.handleBillChange.bind(this);
        this.handleBillDelete = this.handleBillDelete.bind(this);
        this.handleBillMove = this.handleBillMove.bind(this);
        
        this.initializeEventListeners();
    }

    /**
     * Initialize the UI
     */
    initialize() {
        this.createCalculationIndicator();
        this.generateParticipantNames();
        this.generateBillsTable();
        this.calculateAndDisplayResults();
    }

    /**
     * Create calculation indicator
     */
    createCalculationIndicator() {
        this.calculationIndicator = document.createElement('div');
        this.calculationIndicator.className = 'calculating';
        this.calculationIndicator.textContent = '🔄 Calculating...';
        document.body.appendChild(this.calculationIndicator);
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Data change listeners
        this.dataManager.addEventListener('dataChanged', () => {
            this.debounce(this.calculateAndDisplayResults.bind(this), 300)();
        });

        this.dataManager.addEventListener('participantChanged', () => {
            this.updateBillsTableHeaders();
            this.updateBillsTableSelects();
        });

        this.dataManager.addEventListener('billChanged', () => {
            this.updateBillsTableBody();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            this.handleParticipantCountChange();
        }
    }

    /**
     * Generate participant name inputs
     */
    generateParticipantNames() {
        const container = document.getElementById('participantNames');
        if (!container) return;

        container.innerHTML = '';
        
        const namesDiv = document.createElement('div');
        namesDiv.className = 'participant-name-inputs';
        
        for (let i = 0; i < this.dataManager.participantCount; i++) {
            const inputDiv = document.createElement('div');
            inputDiv.className = 'participant-name-input';
            
            const label = document.createElement('label');
            label.textContent = `P${i + 1}:`;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Participant ${i + 1}`;
            input.value = this.dataManager.participantNames[i] || '';
            input.addEventListener('input', (e) => {
                this.dataManager.updateParticipantName(i, e.target.value);
            });
            
            inputDiv.appendChild(label);
            inputDiv.appendChild(input);
            namesDiv.appendChild(inputDiv);
        }
        
        container.appendChild(namesDiv);
    }

    /**
     * Generate bills table
     */
    generateBillsTable() {
        this.updateBillsTableHeaders();
        this.updateBillsTableBody();
    }

    /**
     * Update table headers
     */
    updateBillsTableHeaders() {
        const headerRow = document.getElementById('tableHeaderRow');
        if (!headerRow) return;
        
        // Remove existing participant headers (keep first three: Delete, Who Paid, Amount, Notes)
        const existingHeaders = headerRow.querySelectorAll('th');
        for (let i = 4; i < existingHeaders.length; i++) {
            existingHeaders[i].remove();
        }
        
        // Add new participant headers
        for (let i = 0; i < this.dataManager.participantCount; i++) {
            const th = document.createElement('th');
            th.textContent = this.dataManager.participantNames[i] || `P${i + 1}`;
            headerRow.appendChild(th);
        }
    }

    /**
     * Update table body
     */
    updateBillsTableBody() {
        const tbody = document.getElementById('billsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        this.dataManager.bills.forEach((bill, index) => {
            const row = this.createBillRow(bill, index);
            tbody.appendChild(row);
        });
    }

    /**
     * Create a bill row
     * @param {Object} bill - Bill object
     * @param {number} index - Row index
     * @returns {HTMLElement} Table row element
     */
    createBillRow(bill, index) {
        const row = document.createElement('tr');
        row.setAttribute('data-bill-id', bill.id);
        row.draggable = true;
        
        // Add drag and drop event listeners
        this.addDragAndDropListeners(row);
        
        // Actions column (first)
        const actionsCell = this.createActionsCell(bill, index);
        row.appendChild(actionsCell);
        
        // Who paid column
        const whoPaidCell = this.createWhoPaidCell(bill);
        row.appendChild(whoPaidCell);
        
        // Amount column
        const amountCell = this.createAmountCell(bill);
        row.appendChild(amountCell);
        
        // Notes column
        const notesCell = this.createNotesCell(bill);
        row.appendChild(notesCell);
        
        // Participant checkboxes
        for (let i = 0; i < this.dataManager.participantCount; i++) {
            const checkboxCell = this.createParticipantCheckboxCell(bill, i);
            row.appendChild(checkboxCell);
        }
        
        return row;
    }

    /**
     * Create who paid cell
     * @param {Object} bill - Bill object
     * @returns {HTMLElement} Table cell
     */
    createWhoPaidCell(bill) {
        const cell = document.createElement('td');
        const select = document.createElement('select');
        select.className = 'table-select';
        select.addEventListener('change', (e) => {
            this.dataManager.updateBill(bill.id, { whoPaid: parseInt(e.target.value) });
        });
        
        for (let i = 0; i < this.dataManager.participantCount; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = this.dataManager.participantNames[i] || `P${i + 1}`;
            option.selected = bill.whoPaid === i;
            select.appendChild(option);
        }
        
        cell.appendChild(select);
        return cell;
    }

    /**
     * Create amount cell
     * @param {Object} bill - Bill object
     * @returns {HTMLElement} Table cell
     */
    createAmountCell(bill) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'table-input';
        input.step = '0.01';
        input.min = '0';
        input.placeholder = '0.00';
        input.value = bill.amount || '';
        input.addEventListener('input', (e) => {
            this.dataManager.updateBill(bill.id, { amount: parseFloat(e.target.value) || 0 });
        });
        
        cell.appendChild(input);
        return cell;
    }

    /**
     * Create notes cell
     * @param {Object} bill - Bill object
     * @returns {HTMLElement} Table cell
     */
    createNotesCell(bill) {
        const cell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'table-input';
        input.placeholder = 'e.g., groceries, dinner...';
        input.value = bill.notes || '';
        input.addEventListener('input', (e) => {
            this.dataManager.updateBill(bill.id, { notes: e.target.value });
        });
        
        cell.appendChild(input);
        return cell;
    }

    /**
     * Create participant checkbox cell
     * @param {Object} bill - Bill object
     * @param {number} participantIndex - Participant index
     * @returns {HTMLElement} Table cell
     */
    createParticipantCheckboxCell(bill, participantIndex) {
        const cell = document.createElement('td');
        const checkboxContainer = document.createElement('div');
        checkboxContainer.className = 'checkbox-container';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'table-checkbox';
        checkbox.checked = bill.participants[participantIndex] || false;
        checkbox.addEventListener('change', (e) => {
            const newParticipants = [...bill.participants];
            newParticipants[participantIndex] = e.target.checked;
            this.dataManager.updateBill(bill.id, { participants: newParticipants });
        });
        
        checkboxContainer.appendChild(checkbox);
        cell.appendChild(checkboxContainer);
        return cell;
    }

    /**
     * Create actions cell
     * @param {Object} bill - Bill object
     * @param {number} index - Row index
     * @returns {HTMLElement} Table cell
     */
    createActionsCell(bill, index) {
        const cell = document.createElement('td');
        cell.className = 'actions-cell';
        
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'actions-container';
        
        // Delete button only
        const deleteBtn = this.createActionButton('−', 'Delete this row', 'btn-danger', () => {
            this.dataManager.removeBill(bill.id);
        });
        
        actionsContainer.appendChild(deleteBtn);
        cell.appendChild(actionsContainer);
        
        return cell;
    }

    /**
     * Create action button
     * @param {string} text - Button text
     * @param {string} title - Button title
     * @param {string} className - CSS class
     * @param {Function} onClick - Click handler
     * @returns {HTMLElement} Button element
     */
    createActionButton(text, title, className, onClick) {
        const button = document.createElement('button');
        button.className = `btn btn-sm ${className}`;
        button.innerHTML = text;
        button.title = title;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * Add drag and drop listeners to a row
     * @param {HTMLElement} row - Table row
     */
    addDragAndDropListeners(row) {
        row.addEventListener('dragstart', this.handleDragStart.bind(this));
        row.addEventListener('dragover', this.handleDragOver.bind(this));
        row.addEventListener('drop', this.handleDrop.bind(this));
        row.addEventListener('dragend', this.handleDragEnd.bind(this));
    }

    /**
     * Handle drag start
     * @param {DragEvent} e - Drag event
     */
    handleDragStart(e) {
        this.draggedRow = e.target;
        e.target.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    /**
     * Handle drag over
     * @param {DragEvent} e - Drag event
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handle drop
     * @param {DragEvent} e - Drag event
     */
    handleDrop(e) {
        e.preventDefault();
        if (this.draggedRow !== e.target) {
            const draggedBillId = this.draggedRow.getAttribute('data-bill-id');
            const dropBillId = e.target.getAttribute('data-bill-id');
            
            if (draggedBillId && dropBillId) {
                const dropIndex = this.dataManager.bills.findIndex(bill => bill.id === dropBillId);
                this.dataManager.moveBill(draggedBillId, dropIndex);
            }
        }
    }

    /**
     * Handle drag end
     * @param {DragEvent} e - Drag event
     */
    handleDragEnd(e) {
        e.target.style.opacity = '1';
        this.draggedRow = null;
    }

    /**
     * Update bills table selects when participant names change
     */
    updateBillsTableSelects() {
        const selects = document.querySelectorAll('#billsTable .table-select');
        selects.forEach((select, selectIndex) => {
            const billIndex = Math.floor(selectIndex / this.dataManager.participantCount);
            if (billIndex < this.dataManager.bills.length) {
                const bill = this.dataManager.bills[billIndex];
                const currentValue = bill.whoPaid;
                
                select.innerHTML = '';
                for (let i = 0; i < this.dataManager.participantCount; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = this.dataManager.participantNames[i] || `P${i + 1}`;
                    option.selected = currentValue === i;
                    select.appendChild(option);
                }
            }
        });
    }

    /**
     * Handle participant count change
     */
    handleParticipantCountChange() {
        const countInput = document.getElementById('participantCount');
        if (!countInput) return;

        const newCount = parseInt(countInput.value);
        if (this.dataManager.updateParticipantCount(newCount)) {
            this.generateParticipantNames();
            this.generateBillsTable();
        } else {
            alert('Please enter a valid number between 2 and 20');
        }
    }

    /**
     * Handle participant name change
     * @param {number} index - Participant index
     * @param {string} name - New name
     */
    handleParticipantNameChange(index, name) {
        this.dataManager.updateParticipantName(index, name);
    }

    /**
     * Handle bill change
     * @param {string} billId - Bill ID
     * @param {Object} updates - Updates to apply
     */
    handleBillChange(billId, updates) {
        this.dataManager.updateBill(billId, updates);
    }

    /**
     * Handle bill delete
     * @param {string} billId - Bill ID
     */
    handleBillDelete(billId) {
        if (this.dataManager.bills.length > 1) {
            this.dataManager.removeBill(billId);
        } else {
            alert('You need at least one bill to calculate splits.');
        }
    }

    /**
     * Handle bill move
     * @param {number} index - Current index
     * @param {string} direction - Move direction
     */
    handleBillMove(index, direction) {
        const bill = this.dataManager.bills[index];
        if (!bill) return;

        let newIndex;
        if (direction === 'up' && index > 0) {
            newIndex = index - 1;
        } else if (direction === 'down' && index < this.dataManager.bills.length - 1) {
            newIndex = index + 1;
        } else {
            return;
        }

        this.dataManager.moveBill(bill.id, newIndex);
    }

    /**
     * Add a new bill row
     */
    addBillRow() {
        this.dataManager.addBill();
    }


    /**
     * Sort table by criteria
     * @param {string} sortBy - Sort criteria
     */
    sortTable(sortBy) {
        const sortDirection = this.getCurrentSortDirection(sortBy);
        this.dataManager.sortBills(sortBy, sortDirection);
        this.updateSortButtons(sortBy, sortDirection);
    }

    /**
     * Get current sort direction for a column
     * @param {string} sortBy - Sort criteria
     * @returns {string} Sort direction
     */
    getCurrentSortDirection(sortBy) {
        const button = document.querySelector(`[onclick="sortTable('${sortBy}')"]`);
        return button?.getAttribute('data-direction') === 'asc' ? 'desc' : 'asc';
    }

    /**
     * Update sort buttons
     * @param {string} sortBy - Sort criteria
     * @param {string} direction - Sort direction
     */
    updateSortButtons(sortBy, direction) {
        // Reset all buttons
        document.querySelectorAll('.sort-controls button').forEach(btn => {
            btn.removeAttribute('data-direction');
            btn.classList.remove('btn-active');
        });
        
        // Set active button
        const currentBtn = document.querySelector(`[onclick="sortTable('${sortBy}')"]`);
        if (currentBtn) {
            currentBtn.setAttribute('data-direction', direction);
            currentBtn.classList.add('btn-active');
        }
    }



    /**
     * Toggle manual section
     */
    toggleManual() {
        const content = document.getElementById('manualContent');
        const btn = document.getElementById('collapseBtn');
        
        if (!content || !btn) return;
        
        const icon = btn.querySelector('.collapse-icon');
        const isHidden = content.classList.contains('hidden');
        
        if (isHidden) {
            content.classList.remove('hidden');
            if (icon) icon.textContent = '−';
            btn.setAttribute('aria-expanded', 'true');
            btn.title = 'Collapse manual';
        } else {
            content.classList.add('hidden');
            if (icon) icon.textContent = '+';
            btn.setAttribute('aria-expanded', 'false');
            btn.title = 'Expand manual';
        }
    }

    /**
     * Calculate and display results
     */
    calculateAndDisplayResults() {
        this.showCalculatingIndicator();
        
        try {
            const validation = this.calculationEngine.validateInputs();
            if (!validation.isValid) {
                this.displayValidationErrors(validation.errors);
                this.hideCalculatingIndicator();
                return;
            }
            
            const results = this.calculationEngine.calculateResults();
            this.displayResults(results);
            this.hideCalculatingIndicator();
            
        } catch (error) {
            console.error('Error calculating results:', error);
            this.hideCalculatingIndicator();
        }
    }

    /**
     * Display validation errors
     * @param {Array} errors - Array of error messages
     */
    displayValidationErrors(errors) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        resultsSection.style.display = 'block';
        
        const summary = document.getElementById('summary');
        if (summary) {
            summary.innerHTML = `
                <h3>❌ Validation Errors</h3>
                <ul>
                    ${errors.map(error => `<li>${error}</li>`).join('')}
                </ul>
            `;
        }
    }

    /**
     * Display calculation results
     * @param {Object} results - Calculation results
     */
    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        resultsSection.style.display = 'block';
        
        this.updateSummary(results);
        this.updateDetailedResults(results);
    }

    /**
     * Update summary section
     * @param {Object} results - Calculation results
     */
    updateSummary(results) {
        const summary = document.getElementById('summary');
        if (!summary) return;
        
        const summaryData = this.calculationEngine.calculateSummary(results);
        
        summary.innerHTML = `
            <h3>📊 Summary</h3>
            <div class="summary-item">
                <span>Total bills:</span>
                <span>$${summaryData.totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Number of participants:</span>
                <span>${summaryData.participantCount}</span>
            </div>
            <div class="summary-item">
                <span>Number of bills:</span>
                <span>${summaryData.billCount}</span>
            </div>
            <div class="summary-item">
                <span>Average per person:</span>
                <span>$${summaryData.averagePerPerson.toFixed(2)}</span>
            </div>
        `;
    }

    /**
     * Update detailed results section
     * @param {Object} results - Calculation results
     */
    updateDetailedResults(results) {
        const resultsGrid = document.getElementById('resultsGrid');
        if (!resultsGrid) return;
        
        resultsGrid.innerHTML = '';
        
        for (let i = 0; i < results.participantCount; i++) {
            const breakdown = this.calculationEngine.getParticipantBreakdown(i, results);
            const resultCard = this.createResultCard(results.participantNames[i], breakdown);
            resultsGrid.appendChild(resultCard);
        }
    }

    /**
     * Create result card for a participant
     * @param {string} participantName - Participant name
     * @param {Object} breakdown - Participant breakdown
     * @returns {HTMLElement} Result card element
     */
    createResultCard(participantName, breakdown) {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        let cardContent = `
            <h3>${participantName}</h3>
            <p><strong>Total paid:</strong> $${breakdown.spent.toFixed(2)}</p>
            <p><strong>Total owed:</strong> $${breakdown.owed.toFixed(2)}</p>
            <p><strong>Balance:</strong> <span class="amount ${breakdown.balance >= 0 ? 'positive' : ''}">$${breakdown.balance.toFixed(2)}</span></p>
        `;
        
        if (breakdown.paymentsFrom.length > 0) {
            cardContent += '<h4>Owes to:</h4><ul class="owed-list">';
            breakdown.paymentsFrom.forEach(payment => {
                cardContent += `<li>${payment.to}: <span class="amount">$${payment.amount.toFixed(2)}</span></li>`;
            });
            cardContent += '</ul>';
        } else if (breakdown.paymentsTo.length > 0) {
            cardContent += '<h4>Owed by:</h4><ul class="owed-list">';
            breakdown.paymentsTo.forEach(payment => {
                cardContent += `<li>${payment.from}: <span class="amount positive">$${payment.amount.toFixed(2)}</span></li>`;
            });
            cardContent += '</ul>';
        } else if (breakdown.isBalanced) {
            cardContent += '<p class="no-owed">✅ Balanced - no money owed or owed to</p>';
        }
        
        card.innerHTML = cardContent;
        return card;
    }

    /**
     * Show calculating indicator
     */
    showCalculatingIndicator() {
        if (this.calculationIndicator) {
            this.calculationIndicator.classList.add('show');
        }
    }

    /**
     * Hide calculating indicator
     */
    hideCalculatingIndicator() {
        if (this.calculationIndicator) {
            setTimeout(() => {
                this.calculationIndicator.classList.remove('show');
            }, 500);
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
}

// Export for use in other modules
window.UIManager = UIManager;
