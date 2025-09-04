/**
 * Calculation Engine Module
 * Handles all bill splitting calculations and result generation
 */

class CalculationEngine {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Calculate bill splitting results
     * @returns {Object} Calculation results
     */
    calculateResults() {
        const { participantCount, participantNames, bills } = this.dataManager;
        
        // Initialize arrays for calculations
        const totalSpent = new Array(participantCount).fill(0);
        const totalOwed = new Array(participantCount).fill(0);
        
        // Process each bill
        bills.forEach(bill => {
            if (bill.amount > 0) {
                // Add to who paid
                totalSpent[bill.whoPaid] += bill.amount;
                
                // Calculate how many participants are involved
                const participantCount = bill.participants.filter(p => p).length;
                if (participantCount > 0) {
                    const amountPerPerson = bill.amount / participantCount;
                    
                    // Add to what each participant owes
                    bill.participants.forEach((isParticipant, index) => {
                        if (isParticipant) {
                            totalOwed[index] += amountPerPerson;
                        }
                    });
                }
            }
        });
        
        // Calculate balances
        const balances = totalSpent.map((spent, index) => spent - totalOwed[index]);
        
        // Calculate total amount
        const totalAmount = totalSpent.reduce((sum, amount) => sum + amount, 0);
        
        // Generate payment instructions
        const paymentInstructions = this.generatePaymentInstructions(balances, participantNames);
        
        return {
            totalSpent,
            totalOwed,
            balances,
            totalAmount,
            participantCount,
            participantNames,
            paymentInstructions,
            billCount: bills.length
        };
    }

    /**
     * Generate optimal payment instructions
     * @param {Array} balances - Array of balances for each participant
     * @param {Array} participantNames - Array of participant names
     * @returns {Array} Array of payment instructions
     */
    generatePaymentInstructions(balances, participantNames) {
        const instructions = [];
        const creditors = [];
        const debtors = [];
        
        // Separate creditors and debtors
        balances.forEach((balance, index) => {
            if (balance > 0.01) {
                creditors.push({ index, amount: balance, name: participantNames[index] });
            } else if (balance < -0.01) {
                debtors.push({ index, amount: Math.abs(balance), name: participantNames[index] });
            }
        });
        
        // Sort by amount (highest first)
        creditors.sort((a, b) => b.amount - a.amount);
        debtors.sort((a, b) => b.amount - a.amount);
        
        // Generate payment instructions
        let creditorIndex = 0;
        let debtorIndex = 0;
        
        while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
            const creditor = creditors[creditorIndex];
            const debtor = debtors[debtorIndex];
            
            const paymentAmount = Math.min(creditor.amount, debtor.amount);
            
            if (paymentAmount > 0.01) {
                instructions.push({
                    from: debtor.name,
                    to: creditor.name,
                    amount: paymentAmount
                });
                
                creditor.amount -= paymentAmount;
                debtor.amount -= paymentAmount;
            }
            
            if (creditor.amount < 0.01) {
                creditorIndex++;
            }
            if (debtor.amount < 0.01) {
                debtorIndex++;
            }
        }
        
        return instructions;
    }

    /**
     * Calculate summary statistics
     * @param {Object} results - Calculation results
     * @returns {Object} Summary statistics
     */
    calculateSummary(results) {
        const { totalAmount, participantCount, billCount, balances } = results;
        
        const averagePerPerson = participantCount > 0 ? totalAmount / participantCount : 0;
        const maxBalance = Math.max(...balances);
        const minBalance = Math.min(...balances);
        const balancedParticipants = balances.filter(b => Math.abs(b) < 0.01).length;
        
        return {
            totalAmount,
            averagePerPerson,
            maxBalance,
            minBalance,
            balancedParticipants,
            participantCount,
            billCount
        };
    }

    /**
     * Validate calculation inputs
     * @returns {Object} Validation result
     */
    validateInputs() {
        const { participantCount, bills } = this.dataManager;
        const errors = [];
        const warnings = [];
        
        // Check participant count
        if (participantCount < 2) {
            errors.push('At least 2 participants are required');
        }
        
        if (participantCount > 20) {
            warnings.push('Large number of participants may make calculations complex');
        }
        
        // Check bills
        if (bills.length === 0) {
            errors.push('At least one bill is required');
        }
        
        // Check for bills with no participants
        bills.forEach((bill, index) => {
            const participantCount = bill.participants.filter(p => p).length;
            if (participantCount === 0) {
                errors.push(`Bill ${index + 1} has no participants selected`);
            }
        });
        
        // Check for negative amounts
        bills.forEach((bill, index) => {
            if (bill.amount < 0) {
                errors.push(`Bill ${index + 1} has a negative amount`);
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Get detailed breakdown for a specific participant
     * @param {number} participantIndex - Participant index
     * @param {Object} results - Calculation results
     * @returns {Object} Participant breakdown
     */
    getParticipantBreakdown(participantIndex, results) {
        const { totalSpent, totalOwed, balances, paymentInstructions } = results;
        const { bills } = this.dataManager;
        
        const spent = totalSpent[participantIndex];
        const owed = totalOwed[participantIndex];
        const balance = balances[participantIndex];
        
        // Get bills this participant paid for
        const billsPaid = bills.filter(bill => bill.whoPaid === participantIndex);
        
        // Get bills this participant is involved in
        const billsInvolved = bills.filter(bill => bill.participants[participantIndex]);
        
        // Get payment instructions involving this participant
        const paymentsTo = paymentInstructions.filter(p => p.to === this.dataManager.participantNames[participantIndex]);
        const paymentsFrom = paymentInstructions.filter(p => p.from === this.dataManager.participantNames[participantIndex]);
        
        return {
            spent,
            owed,
            balance,
            billsPaid,
            billsInvolved,
            paymentsTo,
            paymentsFrom,
            isBalanced: Math.abs(balance) < 0.01
        };
    }

    /**
     * Export calculation results to text format
     * @param {Object} results - Calculation results
     * @returns {string} Formatted text
     */
    exportResultsToText(results) {
        const { participantNames, totalAmount, participantCount, billCount } = results;
        const summary = this.calculateSummary(results);
        
        let text = 'BILL SPLITTER RESULTS\n';
        text += '='.repeat(50) + '\n\n';
        
        // Add summary
        text += 'SUMMARY:\n';
        text += `Total bills: $${totalAmount.toFixed(2)}\n`;
        text += `Number of participants: ${participantCount}\n`;
        text += `Number of bills: ${billCount}\n`;
        text += `Average per person: $${summary.averagePerPerson.toFixed(2)}\n`;
        text += `Balanced participants: ${summary.balancedParticipants}\n\n`;
        
        // Add bills breakdown
        text += 'BILLS BREAKDOWN:\n';
        this.dataManager.bills.forEach((bill, index) => {
            const whoPaidName = participantNames[bill.whoPaid] || `Participant ${bill.whoPaid + 1}`;
            text += `\nBill ${index + 1}:\n`;
            text += `  Paid by: ${whoPaidName}\n`;
            text += `  Amount: $${bill.amount.toFixed(2)}\n`;
            text += `  Notes: ${bill.notes || 'No notes'}\n`;
            text += `  Date Added: ${bill.dateAdded.toLocaleDateString()}\n`;
            text += `  Participants: `;
            const participants = [];
            bill.participants.forEach((isParticipant, pIndex) => {
                if (isParticipant) {
                    participants.push(participantNames[pIndex] || `P${pIndex + 1}`);
                }
            });
            text += participants.join(', ') + '\n';
        });
        
        text += '\n' + '='.repeat(50) + '\n\n';
        
        // Add detailed results
        text += 'PARTICIPANT RESULTS:\n';
        participantNames.forEach((name, index) => {
            const breakdown = this.getParticipantBreakdown(index, results);
            text += `\n${name}:\n`;
            text += `  Total paid: $${breakdown.spent.toFixed(2)}\n`;
            text += `  Total owed: $${breakdown.owed.toFixed(2)}\n`;
            text += `  Balance: $${breakdown.balance.toFixed(2)}\n`;
            
            if (breakdown.paymentsFrom.length > 0) {
                text += `  Owes to:\n`;
                breakdown.paymentsFrom.forEach(payment => {
                    text += `    ${payment.to}: $${payment.amount.toFixed(2)}\n`;
                });
            }
            
            if (breakdown.paymentsTo.length > 0) {
                text += `  Owed by:\n`;
                breakdown.paymentsTo.forEach(payment => {
                    text += `    ${payment.from}: $${payment.amount.toFixed(2)}\n`;
                });
            }
        });
        
        return text;
    }
}

// Export for use in other modules
window.CalculationEngine = CalculationEngine;
