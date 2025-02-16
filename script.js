let questions = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let userAnswers = [];


// Load questions and start quiz
async function startQuiz() {
    console.log('startQuiz function called'); // Debug log
    try {
        const username = document.getElementById('username').value.trim();
        const numQuestions = parseInt(document.getElementById('num-questions').value);

        console.log('Starting quiz with:', { username, numQuestions }); // Debug log

        if (!username || isNaN(numQuestions) || numQuestions <= 0) {
            alert("Please enter a valid name and number of questions.");
            return;
        }
        
        // Start the quiz directly without saving user data
        await loadQuestions(numQuestions);
        console.log('Questions loaded successfully'); // Debug log
        
        document.getElementById('user-input').style.display = 'none';
        document.getElementById('welcome-header').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('display-username').innerText = `User: ${username}`;
    } catch (error) {
        console.error('Error in startQuiz:', error);
        alert('Error starting quiz: ' + error.message);
    }
}

// Load and prepare questions
async function loadQuestions(numQuestions) {
    try {
        document.getElementById('quiz-container').style.opacity = '0.5'; // Loading state
        // Update the path to be relative to the repository
        const response = await fetch('./questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allQuestions = await response.json();
        
        // Add debug logging
        console.log('Loaded questions:', allQuestions);
        
        // Validate we have enough questions
        if (!Array.isArray(allQuestions) || allQuestions.length < numQuestions) {
            throw new Error(`Not enough questions available. Found: ${allQuestions.length}`);
        }
        
        questions = shuffleArray([...allQuestions]).slice(0, numQuestions);
        totalQuestions = questions.length;
        document.getElementById('quiz-container').style.opacity = '1';
        showQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert(`Error loading questions: ${error.message}`);
        resetQuiz();
    }
}

// Display current question
function showQuestion() {
    const questionElement = document.getElementById('question');
    const currentQuestion = questions[currentQuestionIndex];

    document.getElementById('total-questions').innerText = 
        `Qn ${currentQuestionIndex + 1} of ${totalQuestions}`;

    questionElement.innerHTML = `
        <p>${currentQuestion.question}</p>
        <div class="options-grid">
            ${currentQuestion.options.map((option, index) => `
                <div class="option-container" onclick="selectOption(this)" data-value="${option}">
                    ${option}
                </div>`).join('')}
        </div>
    `;

    // Hide the submit button initially
    document.getElementById('submit-answer').style.display = 'block';
}

// Add this new function to handle option selection
window.selectOption = function(element) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.option-container');
    options.forEach(option => option.classList.remove('selected'));
    
    // Add selected class to clicked option
    element.classList.add('selected');
}

// Update checkAnswer function
window.checkAnswer = function() {
    const selectedOption = document.querySelector('.option-container.selected');
    if (!selectedOption) {
        alert("Please select an answer.");
        return;
    }

    const userAnswer = selectedOption.getAttribute('data-value');
    const correctAnswer = questions[currentQuestionIndex].answer;
    const explanation = questions[currentQuestionIndex].explanation;
    
    // Save the user's answer
    userAnswers.push({
        question: questions[currentQuestionIndex].question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: userAnswer === correctAnswer
    });
    
    // Remove the selected class (blue color)
    selectedOption.classList.remove('selected');
    
    // Find the correct answer container
    const correctContainer = Array.from(document.querySelectorAll('.option-container'))
        .find(container => container.getAttribute('data-value') === correctAnswer);
    
    if (userAnswer === correctAnswer) {
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('incorrect');
        correctContainer.classList.add('correct');
    }

    // Create container for result and buttons
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    
    // Add result message
    const resultMessage = document.createElement('h3');
    resultMessage.textContent = userAnswer === correctAnswer ? 'Correct!' : 'Incorrect!';
    resultContainer.appendChild(resultMessage);
    
    // Create buttons container for better layout
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    
    // Add Show Explanation button
    const showExplanationBtn = document.createElement('button');
    showExplanationBtn.className = 'show-explanation-btn';
    showExplanationBtn.textContent = 'Show Explanation';
    buttonsContainer.appendChild(showExplanationBtn);
    
    // Add Next Question button
    const nextQuestionBtn = document.createElement('button');
    nextQuestionBtn.className = 'next-question-btn';
    nextQuestionBtn.textContent = currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Show Summary';
    buttonsContainer.appendChild(nextQuestionBtn);
    
    // Create explanation div (hidden initially)
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation-section';
    explanationDiv.style.display = 'none';
    explanationDiv.innerHTML = `
        <div class="explanation-text">
            ${formatExplanation(explanation)}
        </div>
    `;
    
    resultContainer.appendChild(buttonsContainer);
    resultContainer.appendChild(explanationDiv);
    document.getElementById('question').appendChild(resultContainer);

    // Disable all options after answer is submitted
    document.querySelectorAll('.option-container').forEach(container => {
        container.style.pointerEvents = 'none';
    });

    // Hide submit button
    document.getElementById('submit-answer').style.display = 'none';
    
    // Show Explanation button click handler
    showExplanationBtn.addEventListener('click', () => {
        explanationDiv.style.display = 'block';
        showExplanationBtn.style.display = 'none';
    });
    
    // Next Question button click handler
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            showQuestion();
        } else {
            showSummary();
        }
    });
}

// Show quiz summary
function showSummary() {
    const correctCount = userAnswers.filter(answer => answer.isCorrect).length;
    const score = ((correctCount/totalQuestions) * 100).toFixed(2);
    
    const summary = `
        <h2>Quiz Summary</h2>
        <p>Total Questions: ${totalQuestions}</p>
        <p>Correct Answers: ${correctCount}</p>
        <p>Wrong Answers: ${totalQuestions - correctCount}</p>
        <p>Score: ${score}%</p>
        <div class="button-group">
            <button onclick="window.location.reload()" class="st-quiz-again-btn">Start Quiz Again</button>
            <a href="https://github.com/sudo-hope0529/cc-practice-quiz/issues/new?title=Feedback+@cc_practice_quiz&body=@sudo-hope0529[Krishna Dwivedi]%0A" target="_blank">
                <button class="feedback-btn">Give Feedback on GitHub</button>
            </a>
        </div>
    `;

    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = summary;
}

// Reset quiz state
function resetQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    questions = [];
    
    // Get the current username
    const currentUsername = document.getElementById('display-username').innerText.replace('User: ', '');
    
    document.getElementById('user-input').style.display = 'block';
    document.getElementById('welcome-header').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    
    // Only reset the username field if there's no previous username
    if (!currentUsername) {
        document.getElementById('username').value = '';
    } else {
        document.getElementById('username').value = currentUsername;
    }
    
    document.getElementById('num-questions').value = '';
}

// Utility function to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Add this function at the top of your file
function checkOrientation() {
    // Check if the device is mobile and in portrait mode
    if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        const orientationMessage = document.getElementById('orientation-message');
        if (!orientationMessage) {
            const message = document.createElement('div');
            message.id = 'orientation-message';
            message.innerHTML = `
                <div class="orientation-alert">
                    <p>📱 For better visibility, please rotate your device to landscape mode 🔄</p>
                </div>
            `;
            document.body.insertBefore(message, document.body.firstChild);
        }
    } else {
        const orientationMessage = document.getElementById('orientation-message');
        if (orientationMessage) {
            orientationMessage.remove();
        }
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Debug log
    const startButton = document.getElementById('start-btn');
    console.log('Start button found:', !!startButton); // Debug log
    
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            console.log('Start button clicked'); // Debug log
            startQuiz();
        });
    }
    
    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    
    // Add Enter key handling
    function handleEnterKey(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const numQuestions = document.getElementById('num-questions').value;
            if (username && numQuestions) {
                startQuiz();
            }
        }
    }

    document.getElementById('username').addEventListener('keypress', handleEnterKey);
    document.getElementById('num-questions').addEventListener('keypress', handleEnterKey);

    // Add data info button functionality
    const showDataBtn = document.getElementById('show-data-info');
    const dataInfo = document.getElementById('data-info');

    showDataBtn.addEventListener('click', function(event) {
        console.log('Show data info button clicked'); // Debug log
        event.stopPropagation(); // Prevent event from bubbling up
        
        if (dataInfo.style.display === 'none') {
            dataInfo.style.display = 'block';
            showDataBtn.textContent = 'Hide info🤫';
        } else {
            dataInfo.style.display = 'none';
            showDataBtn.textContent = 'Know🧐 what we do with your info 🤔';
        }
    });

    // Close info box when clicking outside
    document.addEventListener('click', function(event) {
        if (!dataInfo.contains(event.target) && !showDataBtn.contains(event.target)) {
            dataInfo.style.display = 'none';
            showDataBtn.textContent = 'Know🧐 what we do with your info 🤔';
        }
    });

    // Add orientation check
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
});

// Function to format the explanation text
function formatExplanation(explanation) {
    // Split the explanation into logical segments
    const segments = explanation.split(/(?<=[.!?])\s+(?=[A-Z])/);
    
    return segments.map(segment => {
        // Handle text with single letters (A., B., C., etc.) or (a), b), c)) followed by explanation
        if (segment.match(/(?:^|\s)[A-Da-d][\).]/m)) {
            // First, check if there's a parenthetical acronym with letter inside
            const hasAcronym = segment.match(/\([A-Z]+\)/);
            if (hasAcronym) {
                return `<p>${segment.trim()}</p>`;
            }
            
            // Handle the lettered point
            const parts = segment.split(/([A-Da-d][\).])/);
            if (parts.length > 1) {
                return `
                    <div class="option-explanation">
                        <p class="option-letter">${parts[1]}</p>
                        <p class="option-detail">${parts[2] ? parts[2].trim() : ''}</p>
                    </div>
                `;
            }
        }
        
        // Handle standalone letters (like "b)" without text)
        if (segment.trim().match(/^[A-Da-d][\).]$/)) {
            return `
                <div class="option-explanation">
                    <p class="option-letter">${segment.trim()}</p>
                    <p class="option-detail"></p>
                </div>
            `;
        }
        
        // Handle text with lettered/numbered points (a), b), c), etc.)
        if (segment.match(/[a-d]\)/i)) {
            const parts = segment.split(/([a-d]\))/i).filter(Boolean);
            if (parts.length > 1) {
                const intro = parts[0].trim();
                const points = [];
                
                for (let i = 1; i < parts.length; i += 2) {
                    const point = (i + 1 < parts.length) ? parts[i] + parts[i + 1] : parts[i];
                    points.push(point);
                }
                
                return `
                    <p>${intro}</p>
                    <ul class="explanation-points">
                        ${points.map(point => `<li>${point.trim()}</li>`).join('')}
                    </ul>
                `;
            }
        }
        
        // Handle points after colons
        if (segment.includes(':')) {
            const [intro, content] = segment.split(':');
            return `
                <p class="explanation-intro">${intro.trim()}:</p>
                <div class="explanation-content">
                    <p>${content.trim()}</p>
                </div>
            `;
        }
        
        // Regular paragraph
        return `<p>${segment.trim()}</p>`;
    }).join('');
}

function displayQuestion() {
    if (currentQuestionIndex < currentQuestions.length) {
        const question = currentQuestions[currentQuestionIndex];
        document.getElementById('question-text').innerText = question.question;
        document.getElementById('current-question').innerText = `Question ${currentQuestionIndex + 1}`;
        
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-container';
            optionElement.innerHTML = `
                <input type="radio" name="answer" value="${option}" id="option${index}">
                <label for="option${index}">${option}</label>
            `;
            optionsContainer.appendChild(optionElement);
        });

        // Update the explanation section with formatted text
        const explanationSection = document.getElementById('explanation');
        if (explanationSection) {
            explanationSection.innerHTML = `
                <div class="explanation-section">
                    <h3>Explanation:</h3>
                    <div class="explanation-text">
                        ${formatExplanation(question.explanation)}
                    </div>
                </div>
            `;
        }
        
        document.getElementById('submit-answer').style.display = 'block';
        document.getElementById('next-question').style.display = 'none';
        
        if (explanationSection) {
            explanationSection.style.display = 'none';
        }
    } else {
        showResults();
    }
}
