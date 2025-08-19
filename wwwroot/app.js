class MemoryStressTesterApp {
    constructor() {
        this.memoryData = [];
        this.chartContext = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupChart();
        this.refreshMemoryStatus();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        // Memory slider sync
        const memoryAmount = document.getElementById('memoryAmount');
        const memorySlider = document.getElementById('memorySlider');
        
        memoryAmount.addEventListener('input', (e) => {
            memorySlider.value = Math.min(e.target.value, 2048);
        });
        
        memorySlider.addEventListener('input', (e) => {
            memoryAmount.value = e.target.value;
        });

        // Buttons
        document.getElementById('allocateBtn').addEventListener('click', () => this.allocateMemory());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllocations());
        document.getElementById('stressTestBtn').addEventListener('click', () => this.runStressTest());
        document.getElementById('refreshStatus').addEventListener('click', () => this.refreshMemoryStatus());
        document.getElementById('clearResults').addEventListener('click', () => this.clearResults());
    }

    setupChart() {
        const canvas = document.getElementById('memoryChart');
        this.chartContext = canvas.getContext('2d');
        this.drawChart();
    }

    drawChart() {
        if (!this.chartContext) return;

        const canvas = this.chartContext.canvas;
        const ctx = this.chartContext;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const padding = 60;
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        
        // Draw axes
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();

        if (this.memoryData.length === 0) {
            // Draw placeholder text
            ctx.fillStyle = '#718096';
            ctx.font = '16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Memory usage will be displayed here', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Find max value for scaling
        const maxMemory = Math.max(...this.memoryData.map(d => d.memory));
        const scale = maxMemory > 0 ? chartHeight / (maxMemory * 1.1) : 1;

        // Draw data points
        const pointSpacing = chartWidth / Math.max(this.memoryData.length - 1, 1);
        
        ctx.strokeStyle = '#667eea';
        ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        ctx.lineWidth = 3;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, padding, 0, padding + chartHeight);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
        gradient.addColorStop(1, 'rgba(102, 126, 234, 0.05)');
        
        // Draw area
        ctx.beginPath();
        ctx.moveTo(padding, padding + chartHeight);
        
        this.memoryData.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = padding + chartHeight - (point.memory * scale);
            
            if (index === 0) {
                ctx.lineTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw line
        ctx.beginPath();
        this.memoryData.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = padding + chartHeight - (point.memory * scale);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.strokeStyle = '#667eea';
        ctx.stroke();
        
        // Draw points
        ctx.fillStyle = '#667eea';
        this.memoryData.forEach((point, index) => {
            const x = padding + (index * pointSpacing);
            const y = padding + chartHeight - (point.memory * scale);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#718096';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(`${Math.round(maxMemory)} MB`, padding - 10, padding + 5);
        ctx.fillText('0 MB', padding - 10, padding + chartHeight + 5);
    }

    async allocateMemory() {
        if (this.isLoading) return;
        
        const memoryAmount = parseInt(document.getElementById('memoryAmount').value);
        const thresholdAmount = parseInt(document.getElementById('thresholdAmount').value);
        
        if (isNaN(memoryAmount) || memoryAmount <= 0) {
            this.showToast('Please enter a valid memory amount', 'error');
            return;
        }

        this.setLoading(true);
        
        try {
            const response = await fetch('/api/memory/allocate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    megabytesToAllocate: memoryAmount,
                    thresholdMB: thresholdAmount
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.addResult({
                    type: 'success',
                    operation: 'Memory Allocation',
                    message: `Successfully allocated ${memoryAmount} MB`,
                    details: `Current memory: ${data.currentMemoryMB} MB | Time: ${data.allocationTimeMs?.toFixed(2)} ms`,
                    timestamp: new Date()
                });
                this.showToast(`Successfully allocated ${memoryAmount} MB`, 'success');
            } else {
                // This is a 500 error as expected when threshold is exceeded
                this.addResult({
                    type: 'error',
                    operation: 'Memory Allocation (500 Error)',
                    message: data.message || `Failed to allocate ${memoryAmount} MB`,
                    details: data.details ? 
                        `Current: ${data.details.currentMemoryMB} MB | Threshold: ${data.details.thresholdMB} MB | OOM: ${data.details.isOutOfMemory}` :
                        'Server returned 500 error',
                    timestamp: new Date()
                });
                this.showToast(data.error || 'Memory allocation failed with 500 error', 'error');
            }
            
            await this.refreshMemoryStatus();
            
        } catch (error) {
            console.error('Error:', error);
            this.addResult({
                type: 'error',
                operation: 'Memory Allocation',
                message: 'Network or server error occurred',
                details: error.message,
                timestamp: new Date()
            });
            this.showToast('Failed to allocate memory: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async clearAllocations() {
        if (this.isLoading) return;
        
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/memory/clear', {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.addResult({
                    type: 'success',
                    operation: 'Clear Allocations',
                    message: 'All memory allocations cleared',
                    details: 'Garbage collection forced',
                    timestamp: new Date()
                });
                this.showToast('Memory allocations cleared successfully', 'success');
                await this.refreshMemoryStatus();
            } else {
                throw new Error(data.error || 'Failed to clear allocations');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showToast('Failed to clear allocations: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async runStressTest() {
        if (this.isLoading) return;
        
        const iterations = parseInt(document.getElementById('stressIterations').value);
        const mbPerIteration = parseInt(document.getElementById('stressMBPerIteration').value);
        const delay = parseInt(document.getElementById('stressDelay').value);
        const thresholdAmount = parseInt(document.getElementById('thresholdAmount').value);
        
        if (isNaN(iterations) || iterations <= 0 || isNaN(mbPerIteration) || mbPerIteration <= 0) {
            this.showToast('Please enter valid stress test parameters', 'error');
            return;
        }

        this.setLoading(true);
        this.showStressProgress(true);
        
        try {
            const response = await fetch('/api/memory/stress-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    iterations: iterations,
                    megabytesPerIteration: mbPerIteration,
                    delayBetweenAllocationsMs: delay,
                    thresholdMB: thresholdAmount
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                this.addResult({
                    type: 'success',
                    operation: 'Stress Test',
                    message: `Completed ${data.completedIterations}/${data.totalIterations} iterations`,
                    details: `${mbPerIteration} MB per iteration with ${delay}ms delay`,
                    timestamp: new Date()
                });
                this.showToast(`Stress test completed: ${data.completedIterations}/${data.totalIterations} iterations`, 'success');
            } else {
                // 500 error expected when threshold exceeded
                this.addResult({
                    type: 'error',
                    operation: 'Stress Test (500 Error)',
                    message: data.message || 'Stress test triggered 500 error',
                    details: `Completed ${data.completedIterations || 0}/${data.totalIterations || iterations} iterations before failure`,
                    timestamp: new Date()
                });
                this.showToast(data.error || 'Stress test failed with 500 error', 'warning');
            }
            
            await this.refreshMemoryStatus();
            
        } catch (error) {
            console.error('Error:', error);
            this.addResult({
                type: 'error',
                operation: 'Stress Test',
                message: 'Network or server error during stress test',
                details: error.message,
                timestamp: new Date()
            });
            this.showToast('Stress test failed: ' + error.message, 'error');
        } finally {
            this.setLoading(false);
            this.showStressProgress(false);
        }
    }

    async refreshMemoryStatus() {
        try {
            const response = await fetch('/api/memory/status');
            const data = await response.json();
            
            if (response.ok) {
                this.updateMemoryDisplay(data);
                this.updateMemoryChart(data.totalAllocatedMB);
            } else {
                console.error('Failed to fetch memory status:', data);
            }
        } catch (error) {
            console.error('Error fetching memory status:', error);
        }
    }

    updateMemoryDisplay(status) {
        document.getElementById('totalMemory').textContent = `${status.totalAllocatedMB} MB`;
        document.getElementById('workingSet').textContent = `${status.workingSetMB} MB`;
        document.getElementById('managedMemory').textContent = `${status.managedMemoryMB} MB`;
        document.getElementById('activeAllocations').textContent = status.activeAllocations;
        document.getElementById('gen0Collections').textContent = status.generation0Collections;
        document.getElementById('gen1Collections').textContent = status.generation1Collections;
        document.getElementById('gen2Collections').textContent = status.generation2Collections;
    }

    updateMemoryChart(memoryMB) {
        this.memoryData.push({
            memory: memoryMB,
            timestamp: new Date()
        });
        
        // Keep only last 50 data points
        if (this.memoryData.length > 50) {
            this.memoryData.shift();
        }
        
        this.drawChart();
    }

    addResult(result) {
        const resultsContainer = document.getElementById('results');
        const noResults = resultsContainer.querySelector('.no-results');
        
        if (noResults) {
            noResults.remove();
        }
        
        const resultElement = document.createElement('div');
        resultElement.className = `result-item ${result.type}`;
        resultElement.innerHTML = `
            <div class="result-header">
                <div class="result-status">
                    <i class="fas ${result.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                    ${result.operation}
                </div>
                <div class="result-time">${result.timestamp.toLocaleTimeString()}</div>
            </div>
            <div class="result-details">
                <div><strong>Message:</strong> ${result.message}</div>
                ${result.details ? `<div><strong>Details:</strong> ${result.details}</div>` : ''}
            </div>
        `;
        
        resultsContainer.insertBefore(resultElement, resultsContainer.firstChild);
        
        // Limit to 10 results
        const results = resultsContainer.querySelectorAll('.result-item');
        if (results.length > 10) {
            results[results.length - 1].remove();
        }
    }

    clearResults() {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-info-circle"></i>
                No operations performed yet. Start allocating memory to see results.
            </div>
        `;
    }

    setLoading(loading) {
        this.isLoading = loading;
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = loading ? 'flex' : 'none';
        
        // Disable buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = loading);
    }

    showStressProgress(show) {
        const progressContainer = document.getElementById('stressProgress');
        progressContainer.style.display = show ? 'block' : 'none';
        
        if (show) {
            // Simulate progress
            let progress = 0;
            const progressBar = document.getElementById('stressProgressBar');
            const progressText = document.getElementById('stressProgressText');
            
            const interval = setInterval(() => {
                progress += 2;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
            }, 100);
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">
                    <i class="fas ${icon}"></i>
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => this.removeToast(toast), 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => this.removeToast(toast));
    }

    removeToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }

    startAutoRefresh() {
        // Auto refresh memory status every 5 seconds
        setInterval(() => {
            if (!this.isLoading) {
                this.refreshMemoryStatus();
            }
        }, 5000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryStressTesterApp();
});
