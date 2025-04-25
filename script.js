// Global variables
const quizState = {
    conversionType: null,
    correctAnswer: "",
    scoreCorrect: 0,
    scoreTotal: 0
};

// DOM Elements - Main Menu
const mainMenuSection = document.getElementById('main-menu');
const ipToBinButton = document.getElementById('ip-to-bin-btn');
const binToIpButton = document.getElementById('bin-to-ip-btn');

// DOM Elements - Quiz Section
const quizSection = document.getElementById('quiz-section');
const quizTypeHeader = document.getElementById('quiz-type-header');
const questionText = document.getElementById('question-text');
const answerInputs = [
    document.getElementById('input-1'),
    document.getElementById('input-2'),
    document.getElementById('input-3'),
    document.getElementById('input-4')
];
const feedbackText = document.getElementById('feedback-text');
const scoreDisplay = document.getElementById('score-display');
const submitButton = document.getElementById('submit-btn');
const newQuestionButton = document.getElementById('new-question-btn');
const quizMenuButton = document.getElementById('quiz-menu-btn');

// Colors
const colors = {
    primary: "#54546d",
    correct: "#98bb6c",
    incorrect: "#e46876"
};

// Event Listeners
ipToBinButton.addEventListener('click', () => startQuiz('ip_to_bin'));
binToIpButton.addEventListener('click', () => startQuiz('bin_to_ip'));
submitButton.addEventListener('click', checkAnswer);
newQuestionButton.addEventListener('click', newQuestion);
quizMenuButton.addEventListener('click', showMainMenu);

// Handle Enter key on inputs
answerInputs.forEach((input, index) => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkAnswer();
        } else if (event.key === 'Tab' && !event.shiftKey) {
            // Focus next input when Tab is pressed
            if (index < answerInputs.length - 1) {
                event.preventDefault();
                answerInputs[index + 1].focus();
            }
        }
    });
    
    // Add input validation
    input.addEventListener('input', (event) => {
        const value = event.target.value;
        
        if (quizState.conversionType === 'ip_to_bin') {
            // Only allow 0s and 1s
            event.target.value = value.replace(/[^01]/g, '');
        } else {
            // Only allow digits and ensure max value is 255
            event.target.value = value.replace(/\D/g, '');
            if (parseInt(value) > 255) {
                event.target.value = '255';
            }
        }
    });
});

// Add Escape key listener for returning to main menu
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        showMainMenu();
    }
});

// Helper Functions
function generateRandomIp() {
    return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
}

function ipToBinary(ip) {
    return ip.split('.')
        .map(octet => parseInt(octet).toString(2).padStart(8, '0'))
        .join('');
}

function showSection(section) {
    [mainMenuSection, quizSection].forEach(
        s => s.classList.add('hidden-section')
    );
    section.classList.remove('hidden-section');
}

// Main Functions
function startQuiz(conversionType) {
    quizState.conversionType = conversionType;
    quizState.scoreCorrect = 0;
    quizState.scoreTotal = 0;
    
    // Update quiz type header
    quizTypeHeader.textContent = conversionType === 'ip_to_bin' 
        ? "IPv4 to Binary Conversion Quiz" 
        : "Binary to IPv4 Conversion Quiz";
    
    // Update score display
    scoreDisplay.textContent = `Score: ${quizState.scoreCorrect}/${quizState.scoreTotal}`;
    
    // Clear feedback text
    feedbackText.textContent = '';
    
    // Update input field separators
    const separators = document.querySelectorAll('.separator');
    if (conversionType === 'ip_to_bin') {
        separators.forEach(sep => sep.textContent = ' ');
    } else {
        separators.forEach(sep => sep.textContent = '.');
    }
    
    // Update max length and placeholder for input fields
    answerInputs.forEach(input => {
        if (conversionType === 'ip_to_bin') {
            input.maxLength = 8;
            input.placeholder = "11111111";
        } else {
            input.maxLength = 3;
            input.placeholder = "255";
        }
    });
    
    showSection(quizSection);
    newQuestion();
}

function newQuestion() {
    // Clear all input fields
    answerInputs.forEach(input => {
        input.value = '';
        input.style.backgroundColor = colors.primary;
    });
    
    // Clear feedback
    feedbackText.textContent = '';
    feedbackText.style.color = '';
    
    // Set focus to first input
    answerInputs[0].focus();
    
    // Generate question based on conversion type
    if (quizState.conversionType === 'ip_to_bin') {
        const ip = generateRandomIp();
        quizState.correctAnswer = ipToBinary(ip);
        questionText.textContent = `Convert this IP address to binary:\n${ip}`;
    } else {
        const ip = generateRandomIp();
        const binary = ipToBinary(ip);
        const formattedBinary = binary.match(/.{1,8}/g).join(' ');
        quizState.correctAnswer = ip;
        questionText.textContent = `Convert this binary to IPv4:\n${formattedBinary}`;
    }
}

function checkAnswer() {
    let isCorrect = false;
    
    // Reset input background colors
    answerInputs.forEach(input => {
        input.style.backgroundColor = colors.primary;
    });
    
    if (quizState.conversionType === 'ip_to_bin') {
        // Split the correct binary answer into 8-bit segments
        const binarySegments = quizState.correctAnswer.match(/.{1,8}/g);
        
        // Compare each segment
        let allCorrect = true;
        for (let i = 0; i < answerInputs.length; i++) {
            const inputValue = answerInputs[i].value.padStart(8, '0');
            if (inputValue !== binarySegments[i]) {
                allCorrect = false;
                answerInputs[i].style.backgroundColor = colors.incorrect;
            }
        }
        
        isCorrect = allCorrect;
    } else {
        // Split the correct IP into octets
        const correctOctets = quizState.correctAnswer.split('.');
        
        // Compare each octet
        let allCorrect = true;
        for (let i = 0; i < answerInputs.length; i++) {
            const inputValue = answerInputs[i].value;
            if (!inputValue || inputValue !== correctOctets[i]) {
                allCorrect = false;
                answerInputs[i].style.backgroundColor = colors.incorrect;
            }
        }
        
        isCorrect = allCorrect;
    }
    
    // Update score
    quizState.scoreTotal += 1;
    if (isCorrect) {
        quizState.scoreCorrect += 1;
        feedbackText.textContent = "Correct!";
        feedbackText.style.color = colors.correct;
    } else {
        feedbackText.textContent = "Incorrect! Fix the highlighted fields.";
        feedbackText.style.color = colors.incorrect;
    }
    
    // Update score display
    scoreDisplay.textContent = `Score: ${quizState.scoreCorrect}/${quizState.scoreTotal}`;
}

function showMainMenu() {
    // Reset scores
    quizState.scoreCorrect = 0;
    quizState.scoreTotal = 0;
    
    showSection(mainMenuSection);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Show main menu on load
    showMainMenu();
});
