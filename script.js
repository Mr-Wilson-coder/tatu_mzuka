// Initialize Lucide icons and app
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
    initializeApp();
});

// Game state
let selectedNumbers = [];
let stake = 230;
let phoneNumber = '';
let timeLeft = 699; // 11:39 in seconds

// Initialize the application
function initializeApp() {
    initNumberGrid();
    updateDisplay();
    startTimer();
    setupPhoneInput();
    setupPinInputs();
}

// Timer functionality
function startTimer() {
    setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
}

function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update all timer displays
    const timerElements = ['header-timer', 'game-timer'];
    timerElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = timeString;
    });
    
    timeLeft--;
    if (timeLeft < 0) {
        timeLeft = 1800; // Reset to 30 minutes
        showDrawResult();
    }
}

// Phone input setup
function setupPhoneInput() {
    const phoneInput = document.getElementById('phone-input');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            phoneNumber = e.target.value;
            updatePlayButton();
        });
    }
}

// Initialize number grid
function initNumberGrid() {
    const grid = document.getElementById('number-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    for (let i = 0; i <= 9; i++) {
        const button = document.createElement('button');
        button.className = 'number-btn';
        button.textContent = i;
        button.onclick = () => handleNumberClick(i);
        grid.appendChild(button);
    }
}

// Handle number selection
function handleNumberClick(number) {
    if (selectedNumbers.includes(number)) {
        selectedNumbers = selectedNumbers.filter(n => n !== number);
    } else if (selectedNumbers.length < 3) {
        selectedNumbers.push(number);
    }
    updateDisplay();
}

// Random pick functionality
function randomPick() {
    selectedNumbers = [];
    while (selectedNumbers.length < 3) {
        const randomNum = Math.floor(Math.random() * 10);
        if (!selectedNumbers.includes(randomNum)) {
            selectedNumbers.push(randomNum);
        }
    }
    updateDisplay();
}

// Clear selection
function clearSelection() {
    selectedNumbers = [];
    updateDisplay();
}

// Update all displays
function updateDisplay() {
    updateSelectedNumbers();
    updateNumberGrid();
    updateClearButton();
    updatePlayButton();
    updatePotentialWin();
}

function updateSelectedNumbers() {
    for (let i = 0; i < 3; i++) {
        const element = document.getElementById(`selected-${i}`);
        if (!element) continue;
        
        if (selectedNumbers[i] !== undefined) {
            element.textContent = selectedNumbers[i];
            element.className = 'selected-number filled';
        } else {
            element.textContent = '?';
            element.className = 'selected-number empty';
        }
    }
}

function updateNumberGrid() {
    const buttons = document.querySelectorAll('.number-btn');
    buttons.forEach((btn, index) => {
        btn.className = 'number-btn';
        if (selectedNumbers.includes(index)) {
            btn.classList.add('selected');
        }
        btn.disabled = !selectedNumbers.includes(index) && selectedNumbers.length >= 3;
    });
}

function updateClearButton() {
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        if (selectedNumbers.length > 0) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (!playBtn) return;
    
    const isValid = selectedNumbers.length === 3 && phoneNumber.length === 8;
    
    if (isValid) {
        playBtn.classList.remove('disabled');
    } else {
        playBtn.classList.add('disabled');
    }
}

// Update potential win calculation
function updatePotentialWin() {
    const stakeInput = document.getElementById('stake-input');
    if (stakeInput) {
        stake = parseInt(stakeInput.value) || 230;
        const potentialWin = stake * 300;
        const potentialWinElement = document.getElementById('potential-win');
        if (potentialWinElement) {
            potentialWinElement.textContent = `BIF ${potentialWin.toLocaleString()}!`;
        }
    }
}

// Handle play game - show PIN modal
function handlePlayGame() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn.classList.contains('disabled')) return;
    
    if (selectedNumbers.length !== 3) {
        alert('Please select 3 numbers first!');
        return;
    }
    
    if (phoneNumber.length !== 8) {
        alert('Please enter a valid 8-digit phone number!');
        return;
    }
    
    showPinModal();
}

// PIN Modal functionality
function showPinModal() {
    const modal = document.getElementById('pin-modal');
    if (!modal) return;
    
    // Update transaction details
    document.getElementById('transaction-amount').textContent = `BIF ${stake.toLocaleString()}`;
    document.getElementById('transaction-numbers').textContent = selectedNumbers.join('-');
    document.getElementById('transaction-phone').textContent = `+257 ${phoneNumber}`;
    
    // Clear PIN inputs
    document.querySelectorAll('.pin-input').forEach(input => {
        input.value = '';
    });
    
    modal.classList.add('active');
    document.getElementById('pin-1').focus();
}

function closePinModal() {
    const modal = document.getElementById('pin-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Setup PIN inputs
function setupPinInputs() {
    const pinInputs = document.querySelectorAll('.pin-input');
    
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // Move to next input
            if (e.target.value && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                pinInputs[index - 1].focus();
            }
        });
    });
}

// Confirm transaction
function confirmTransaction() {
    const pinInputs = document.querySelectorAll('.pin-input');
    const pin = Array.from(pinInputs).map(input => input.value).join('');
    
    if (pin.length !== 4) {
        alert('Please enter a complete 4-digit PIN!');
        return;
    }
    
    // Simulate transaction
    closePinModal();
    
    // Show success message
    setTimeout(() => {
        alert(`🎉 Game played successfully!\n\nNumbers: ${selectedNumbers.join('-')}\nAmount: BIF ${stake.toLocaleString()}\nPhone: +257 ${phoneNumber}\n\nGood luck! Results in ${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`);
        
        // Reset game
        selectedNumbers = [];
        document.getElementById('phone-input').value = '';
        phoneNumber = '';
        updateDisplay();
    }, 500);
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab content
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Add active class to clicked nav link
    const navLinks = document.querySelectorAll(`[onclick="switchTab('${tabName}')"]`);
    navLinks.forEach(link => link.classList.add('active'));
    
    // Close mobile menu
    closeMobileMenu();
}

// Mobile menu functionality
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileNav && menuIcon && closeIcon) {
        if (mobileNav.classList.contains('hidden')) {
            mobileNav.classList.remove('hidden');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
        } else {
            closeMobileMenu();
        }
    }
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileNav && menuIcon && closeIcon) {
        mobileNav.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

// Show draw results (simulation)
function showDrawResult() {
    const winningNumbers = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
    ];
    
    console.log(`🎲 New Draw Results: ${winningNumbers.join('-')}`);
    
    // You could show a notification or update the results tab here
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closePinModal();
    }
});

// Prevent form submission on Enter
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.target.classList.contains('pin-input')) {
        event.preventDefault();
        confirmTransaction();
    }
});