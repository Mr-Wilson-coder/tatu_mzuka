// TatuMzuka - Enhanced Interactive Betting App Script

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
let iti; // International telephone input instance

// Initialize the application
function initializeApp() {
    initNumberGrid();
    updateDisplay();
    startTimer();
    setupPhoneInput();
    setupPinInputs();
    
    // Add some initial animation
    setTimeout(() => {
        const gameCard = document.querySelector('.game-card');
        if (gameCard) {
            gameCard.style.animation = 'slideUp 0.6s ease-out';
        }
    }, 300);
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
    const timerElements = ['header-timer', 'game-timer', 'success-timer'];
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

// Phone input setup using intl-tel-input
function setupPhoneInput() {
    const phoneInput = document.getElementById("phone-input");
    if (!phoneInput) return;

    iti = window.intlTelInput(phoneInput, {
        initialCountry: "bi", // Burundi
        preferredCountries: ["bi", "ke", "tz", "ug", "rw"],
        geoIpLookup: function (callback) {
            fetch("https://ipapi.co/json")
                .then((res) => res.json())
                .then((data) => callback(data.country_code))
                .catch(() => callback("bi"));
        },
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.5.3/build/js/utils.js",
    });

    phoneInput.addEventListener("input", () => {
        phoneNumber = iti.getNumber();
        updatePlayButton();
        
        // Add visual feedback
        if (iti.isValidNumber()) {
            phoneInput.style.borderColor = '#22c55e';
        } else {
            phoneInput.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }
    });

    phoneInput.addEventListener("blur", () => {
        if (phoneInput.value && !iti.isValidNumber()) {
            showNotification('Please enter a valid phone number', 'error');
        }
    });
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
        
        // Add entrance animation
        button.style.animationDelay = `${i * 50}ms`;
        button.style.animation = 'fadeIn 0.3s ease-out forwards';
        
        grid.appendChild(button);
    }
}

// Handle number selection with enhanced feedback
function handleNumberClick(number) {
    const numberBtn = document.querySelector(`.number-btn:nth-child(${number + 1})`);
    
    if (selectedNumbers.includes(number)) {
        selectedNumbers = selectedNumbers.filter(n => n !== number);
        // Add removal animation
        numberBtn.style.animation = 'pulse 0.3s ease-out';
    } else if (selectedNumbers.length < 3) {
        selectedNumbers.push(number);
        // Add selection animation
        numberBtn.style.animation = 'scaleIn 0.3s ease-out';
        
        // Play selection sound effect (simulated with visual feedback)
        createRippleEffect(numberBtn);
    } else {
        // Maximum numbers selected - show feedback
        showNotification('Maximum 3 numbers can be selected', 'warning');
        shakeElement(document.querySelector('.selected-numbers'));
    }
    
    updateDisplay();
}

// Create ripple effect on button click
function createRippleEffect(element) {
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Random pick functionality with animation
function randomPick() {
    selectedNumbers = [];
    const randomBtn = document.querySelector('.random-btn');
    
    // Animate button
    randomBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        randomBtn.style.transform = 'scale(1)';
    }, 150);
    
    // Generate numbers with delay for effect
    let count = 0;
    const interval = setInterval(() => {
        if (count < 3) {
            let randomNum;
            do {
                randomNum = Math.floor(Math.random() * 10);
            } while (selectedNumbers.includes(randomNum));
            
            selectedNumbers.push(randomNum);
            updateDisplay();
            count++;
        } else {
            clearInterval(interval);
        }
    }, 200);
}

// Clear selection with animation
function clearSelection() {
    const selectedElements = document.querySelectorAll('.selected-number.filled');
    selectedElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('clearing');
        }, index * 100);
    });
    
    setTimeout(() => {
        selectedNumbers = [];
        updateDisplay();
    }, 300);
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
    if (!clearBtn) return;
    
    if (selectedNumbers.length > 0) {
        clearBtn.classList.remove('hidden');
        clearBtn.style.animation = 'fadeIn 0.3s ease-out';
    } else {
        clearBtn.classList.add('hidden');
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('play-btn');
    if (!playBtn) return;

    const isValid = selectedNumbers.length === 3 && iti && iti.isValidNumber();

    if (isValid) {
        playBtn.classList.remove('disabled');
        playBtn.style.animation = 'glow 2s ease-in-out infinite alternate';
    } else {
        playBtn.classList.add('disabled');
        playBtn.style.animation = 'none';
    }
}

function updatePotentialWin() {
    const stakeInput = document.getElementById('stake-input');
    if (!stakeInput) return;

    stake = parseInt(stakeInput.value) || 230;
    
    // Ensure minimum stake
    if (stake < 230) {
        stake = 230;
        stakeInput.value = 230;
    }
    
    const potentialWin = stake * 300;
    const potentialWinElement = document.getElementById('potential-win');
    if (potentialWinElement) {
        potentialWinElement.textContent = `BIF ${potentialWin.toLocaleString()}`;
        
        // Animate potential win update
        potentialWinElement.style.animation = 'pulse 0.5s ease-out';
    }
}

// Handle Play Game - Enhanced with modal flow
function handlePlayGame() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn.classList.contains('disabled')) {
        if (selectedNumbers.length !== 3) {
            showNotification('Please select 3 numbers', 'error');
            shakeElement(document.querySelector('.selected-numbers'));
        } else if (!iti.isValidNumber()) {
            showNotification('Please enter a valid phone number', 'error');
            document.getElementById('phone-input').focus();
        }
        return;
    }

    phoneNumber = iti.getNumber();

    // Validate stake
    if (stake < 230) {
        showNotification('Minimum stake is 230 BIF', 'error');
        document.getElementById('stake-input').focus();
        return;
    }
    if (stake > 22924) {
        showNotification('Maximum stake is 22,924 BIF', 'error');
        document.getElementById('stake-input').focus();
        return;
    }

    // Show confirm modal
    showConfirmModal();
}

// Show Confirm Bet Modal
function showConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (!modal) return;

    // Update modal content
    document.getElementById('confirm-phone').textContent = phoneNumber;
    document.getElementById('confirm-numbers').textContent = selectedNumbers.join('-');
    document.getElementById('confirm-stake').textContent = `BIF ${stake.toLocaleString()}`;
    document.getElementById('confirm-winnings').textContent = `BIF ${(stake * 300).toLocaleString()}`;

    modal.classList.add('active');
    
    // Add entrance animation
    const modalContent = modal.querySelector('.modal');
    modalContent.style.animation = 'slideUp 0.3s ease-out';
}

function closeConfirmModal() {
    const modal = document.getElementById('confirm-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Proceed to PIN entry
function proceedToPIN() {
    closeConfirmModal();
    
    setTimeout(() => {
        showPinModal();
    }, 200);
}

// PIN Modal with enhanced UX
function showPinModal() {
    const modal = document.getElementById('pin-modal');
    if (!modal) return;

    // Update transaction details
    document.getElementById('transaction-amount').textContent = `BIF ${stake.toLocaleString()}`;
    document.getElementById('transaction-numbers').textContent = selectedNumbers.join('-');
    document.getElementById('transaction-phone').textContent = phoneNumber;

    // Clear PIN inputs
    document.querySelectorAll('.pin-input').forEach(input => {
        input.value = '';
        input.classList.remove('filled');
    });
    
    modal.classList.add('active');
    
    // Focus first PIN input
    setTimeout(() => {
        document.getElementById('pin-1').focus();
    }, 300);
    
    // Add entrance animation
    const modalContent = modal.querySelector('.modal');
    modalContent.style.animation = 'slideUp 0.3s ease-out';
}

function closePinModal() {
    const modal = document.getElementById('pin-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Enhanced PIN input setup
function setupPinInputs() {
    const pinInputs = document.querySelectorAll('.pin-input');
    
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', e => {
            // Only allow numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            if (e.target.value) {
                e.target.classList.add('filled');
                
                // Auto-advance to next input
                if (index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
                
                // Auto-submit when all fields are filled
                if (index === pinInputs.length - 1) {
                    const allFilled = Array.from(pinInputs).every(input => input.value);
                    if (allFilled) {
                        setTimeout(() => {
                            confirmTransaction();
                        }, 500);
                    }
                }
            } else {
                e.target.classList.remove('filled');
            }
        });
        
        input.addEventListener('keydown', e => {
            // Handle backspace
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                pinInputs[index - 1].focus();
                pinInputs[index - 1].classList.remove('filled');
            }
            
            // Handle enter key
            if (e.key === 'Enter') {
                e.preventDefault();
                confirmTransaction();
            }
        });
        
        // Add focus/blur animations
        input.addEventListener('focus', () => {
            input.style.borderColor = '#ff6b35';
            input.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                input.style.boxShadow = 'none';
            }
        });
    });
}

// Enhanced transaction confirmation
function confirmTransaction() {
    const pinInputs = document.querySelectorAll('.pin-input');
    const pin = Array.from(pinInputs).map(input => input.value).join('');
    
    if (pin.length !== 4) {
        showNotification('Please enter a complete 4-digit PIN', 'error');
        shakeElement(document.querySelector('.pin-inputs'));
        return;
    }

    // Add loading state
    const confirmBtn = document.querySelector('.modal-btn.confirm');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'Processing...';
    confirmBtn.disabled = true;

    // Simulate processing delay
    setTimeout(() => {
        closePinModal();
        
        setTimeout(() => {
            showSuccessModal();
            resetGame();
        }, 300);
        
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
    }, 2000);
}

// Show success modal with celebration
function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    // Update success details
    document.getElementById('success-numbers').textContent = `Numbers: ${selectedNumbers.join('-')}`;
    document.getElementById('success-amount').textContent = `Stake: BIF ${stake.toLocaleString()}`;
    document.getElementById('success-winnings').textContent = `Potential Win: BIF ${(stake * 300).toLocaleString()}`;

    modal.classList.add('active');
    
    // Add celebration animation
    const modalContent = modal.querySelector('.modal');
    modalContent.style.animation = 'celebrate 0.6s ease-out';
    
    // Create confetti effect (simulated with CSS animation)
    createConfettiEffect();
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Create confetti effect
function createConfettiEffect() {
    const colors = ['#ff6b35', '#4f46e5', '#22c55e', '#f59e0b'];
    const modal = document.querySelector('#success-modal .modal');
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '2px';
        confetti.style.animation = `confetti 3s ease-out forwards`;
        confetti.style.animationDelay = Math.random() * 0.3 + 's';
        
        modal.appendChild(confetti);
        
        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

// Reset game after successful bet
function resetGame() {
    selectedNumbers = [];
    document.getElementById('phone-input').value = '';
    document.getElementById('stake-input').value = '230';
    stake = 230;
    phoneNumber = '';
    
    if (iti) {
        iti.setNumber('');
    }
    
    updateDisplay();
}

// Utility Functions

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#22c55e'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Shake element animation
function shakeElement(element) {
    if (!element) return;
    
    element.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        element.style.animation = 'none';
    }, 500);
}

// Tab switching with animation
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected tab
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
        tabContent.classList.add('active');
        tabContent.style.animation = 'fadeIn 0.3s ease-out';
    }
    
    // Add active class to corresponding nav links
    const navLinks = document.querySelectorAll(`[onclick="switchTab('${tabName}')"]`);
    navLinks.forEach(link => link.classList.add('active'));
    
    closeMobileMenu();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mobile menu functions
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobile-nav');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    
    if (mobileNav && menuIcon && closeIcon) {
        if (mobileNav.classList.contains('hidden')) {
            mobileNav.classList.remove('hidden');
            menuIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            mobileNav.style.animation = 'slideDown 0.3s ease-out';
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

// Auth functions
function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const name = document.getElementById('signup-name').value;
    const phone = document.getElementById('signup-phone').value;
    const email = document.getElementById('signup-email').value;
    const dob = document.getElementById('signup-dob').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    const termsAccepted = document.getElementById('terms-check').checked;
    
    // Basic validation
    if (!name || !phone || !email || !dob || !password || !confirmPassword) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }
    
    // Age verification
    const birthDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18) {
        showNotification('You must be 18 or older to create an account', 'error');
        return;
    }
    
    // Simulate signup process
    const submitBtn = event.target.querySelector('.auth-btn');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Account created successfully! Please sign in.', 'success');
        switchTab('login');
        
        // Reset form
        event.target.reset();
        submitBtn.textContent = 'CREATE ACCOUNT';
        submitBtn.disabled = false;
    }, 2000);
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    if (!username || !password) {
        showNotification('Please enter your username and password', 'error');
        return;
    }
    
    // Simulate login process
    const submitBtn = event.target.querySelector('.auth-btn');
    submitBtn.textContent = 'Signing In...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Welcome back! Logged in successfully.', 'success');
        switchTab('home');
        
        // Reset form
        event.target.reset();
        submitBtn.textContent = 'SIGN IN';
        submitBtn.disabled = false;
    }, 1500);
}

// Show draw results simulation
function showDrawResult() {
    const winningNumbers = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10)
    ];
    
    showNotification(`🎲 New Draw Results: ${winningNumbers.join('-')}`, 'info');
    console.log(`🎲 New Draw Results: ${winningNumbers.join('-')}`);
}

// Event Listeners

// Close modals by clicking outside
document.addEventListener('click', event => {
    if (event.target.classList.contains('modal-overlay')) {
        if (event.target.id === 'confirm-modal') closeConfirmModal();
        if (event.target.id === 'pin-modal') closePinModal();
        if (event.target.id === 'success-modal') closeSuccessModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', event => {
    // ESC to close modals
    if (event.key === 'Escape') {
        closeConfirmModal();
        closePinModal();
        closeSuccessModal();
    }
    
    // Enter to confirm in PIN modal
    if (event.key === 'Enter' && document.getElementById('pin-modal').classList.contains('active')) {
        event.preventDefault();
        confirmTransaction();
    }
});

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes glow {
        from {
            box-shadow: 0 0 5px rgba(255, 107, 53, 0.5);
        }
        to {
            box-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes celebrate {
        0% { transform: scale(0.8) rotate(-5deg); }
        50% { transform: scale(1.1) rotate(2deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
    
    @keyframes confetti {
        0% { transform: translateY(-10px) rotateZ(0deg); opacity: 1; }
        100% { transform: translateY(400px) rotateZ(720deg); opacity: 0; }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideDown {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

function showSignup() {
    document.getElementById('signupOverlay').style.display = 'flex';
}

function hideSignup() {
    document.getElementById('signupOverlay').style.display = 'none';
}

function handleSignup(event) {
    event.preventDefault(); // Prevent form submission
    
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }
    
    // Simulate successful signup
    alert("Account created successfully!");
    hideSignup(); // Hide the signup overlay after successful signup
}
