let questions = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let userAnswers = [];


// Load questions and start quiz
async function startQuiz() {
    try {
        const username = document.getElementById('username').value.trim();
        const numQuestions = parseInt(document.getElementById('num-questions').value);

        console.log('Starting quiz with:', { username, numQuestions });

        if (!username || isNaN(numQuestions) || numQuestions <= 0) {
            alert("Please enter a valid name and number of questions.");
            return;
        }
        
        // Start the quiz directly without saving user data
        await loadQuestions(numQuestions);
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
        `Question ${currentQuestionIndex + 1} of ${totalQuestions}`;

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

    // Add explanation
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'answer-explanation';
    explanationDiv.innerHTML = `
        <h3>${userAnswer === correctAnswer ? 'Correct!' : 'Incorrect!'}</h3>
        <p>${explanation}</p>
    `;
    document.getElementById('question').appendChild(explanationDiv);

    // Disable all options after answer is submitted
    document.querySelectorAll('.option-container').forEach(container => {
        container.style.pointerEvents = 'none';
    });

    // Hide submit button and show next button
    document.getElementById('submit-answer').style.display = 'none';
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            showQuestion();
        } else {
            showSummary();
        }
    }, 4000); // 4 second delay before next question
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
            <button onclick="window.location.reload()">Start Quiz Again</button>
            <a href="https://github.com/sudo-hope0529/cc-practice-quiz/issues/new?title=Feedback+@cc_practice_quiz&body=@sudo-hope0529[Krishna Dwivedi]%0A " target="_blank">
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

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-btn').addEventListener('click', startQuiz);
    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
});
