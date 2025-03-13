document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener('message', function(event) {
        if (event.data.type === 'SHOW_BILLS') {
            const body = document.getElementById('body');
            const billsList = document.getElementById('bills-list');
            const emptyState = document.getElementById('empty-state');
            const totalCount = document.getElementById('total-count');
            
            body.classList.remove('hidden');
            billsList.innerHTML = '';
            
            totalCount.textContent = event.data.bills.length;
            
            if (event.data.bills.length === 0) {
                emptyState.classList.remove('hidden');
                billsList.classList.add('hidden');
            } else {
                emptyState.classList.add('hidden');
                billsList.classList.remove('hidden');
                
                event.data.bills.forEach(bill => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="bill-detail">${bill.label}</span>
                        <span class="bill-amount-value">$${formatNumber(bill.amount)}</span>
                        <button onclick="payBill(${bill.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                                <line x1="2" x2="22" y1="10" y2="10"></line>
                            </svg>
                            Pay
                        </button>
                    `;
                    billsList.appendChild(li);
                });
            }
        } else if (event.data.type === 'HIDE_BILLS') {
            const body = document.getElementById('body');
            body.classList.add('hidden');
        }
    });
});

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function payBill(billId) {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.7';
    });
    
    const clickedButton = document.querySelector(`button[onclick="payBill(${billId})"]`);
    if (clickedButton) {
        clickedButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            Processing
        `;
    }
    
    try {
        fetch(`https://${GetParentResourceName()}/payBill`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ billId: billId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                if (clickedButton) {
                    clickedButton.style.background = 'linear-gradient(135deg,rgb(16, 151, 185),rgb(5, 145, 150))';
                    clickedButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M20 6 9 17l-5-5"></path>
                        </svg>
                        Paid
                    `;
                }
                
                setTimeout(() => {
                    fetch(`https://${GetParentResourceName()}/getBills`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8',
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        window.postMessage({ type: 'SHOW_BILLS', bills: data.bills }, '*');
                    })
                    .catch(error => console.error('Error fetching updated bills:', error));
                }, 1000);
            } else {
                // showError('No tienes dinero suficiente para pagar la factura');
                resetButtons();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Payment failed');
            resetButtons();
        });
    } catch (error) {
        console.error('Error:', error);
        showError('Payment failed');
        resetButtons();
    }
}

function resetButtons() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.disabled = false;
        button.style.opacity = '1';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
            Pay
        `;
    });
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="12"></line>
            <line x1="12" x2="12.01" y1="16" y2="16"></line>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function closeUI() {
    try {
        fetch(`https://${GetParentResourceName()}/closeUI`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ action: 'close' })
        })
        .catch(error => {
            console.error('Error closing UI:', error);
        })
        .finally(() => {
            const body = document.getElementById('body');
            body.classList.add('hidden');
        });
    } catch (error) {
        console.error('Error in closeUI function:', error);
        const body = document.getElementById('body');
        body.classList.add('hidden');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeUI();
    }
});

const style = document.createElement('style');
style.textContent = `
    .error-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        transition: opacity 0.3s;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);