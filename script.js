let questions = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let userAnswers = [];


async function startQuiz() {
    try {
        const username = document.getElementById('username').value.trim();
        const numQuestions = parseInt(document.getElementById('num-questions').value);

        console.log('Starting quiz with:', { username, numQuestions });

        if (!username || isNaN(numQuestions) || numQuestions <= 0) {
            alert("Please enter a valid name and number of questions.");
            return;
        }
        
        await loadQuestions(numQuestions, username);
        
        document.getElementById('user-input').style.display = 'none';
        document.getElementById('welcome-header').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('display-username').innerText = `User: ${username}`;
    } catch (error) {
        alert('Error starting quiz: ' + error.message);
    }
}

async function loadQuestions(numQuestions, username) {
    try {
        document.getElementById('quiz-container').style.opacity = '0.5'; 
        const response = await fetch('./questions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const allQuestions = await response.json();

        
        if (typeof processtext === 'function') {
            const qm = await processtext(username);
            if (Array.isArray(qm) && qm.length > 0) {
                allQuestions.push(...qm);
            } 
        }
                    

        if (!Array.isArray(allQuestions) || allQuestions.length < numQuestions) {
            throw new Error(`Not enough questions available. Found: ${allQuestions.length}`);
        }
        
        questions = shuffleArray([...allQuestions]).slice(0, numQuestions);
        totalQuestions = questions.length;
        document.getElementById('quiz-container').style.opacity = '1';


        showQuestion();
    } catch (error) {
        alert(`Error loading questions: ${error.message}`);
        resetQuiz();
    }
}

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

    document.getElementById('submit-answer').style.display = 'block';
}

window.selectOption = function(element) {
    const options = document.querySelectorAll('.option-container');
    options.forEach(option => option.classList.remove('selected'));
    
    element.classList.add('selected');
}

window.checkAnswer = function() {
    const selectedOption = document.querySelector('.option-container.selected');
    if (!selectedOption) {
        alert("Please select an answer.");
        return;
    }

    const userAnswer = selectedOption.getAttribute('data-value');
    const correctAnswer = questions[currentQuestionIndex].answer;
    const explanation = questions[currentQuestionIndex].explanation;
    
    userAnswers.push({
        question: questions[currentQuestionIndex].question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        isCorrect: userAnswer === correctAnswer
    });
    
    selectedOption.classList.remove('selected');
    
    const correctContainer = Array.from(document.querySelectorAll('.option-container'))
        .find(container => container.getAttribute('data-value') === correctAnswer);
    
    if (userAnswer === correctAnswer) {
        selectedOption.classList.add('correct');
    } else {
        selectedOption.classList.add('incorrect');
        correctContainer.classList.add('correct');
    }

    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    
    const resultMessage = document.createElement('h3');
    resultMessage.textContent = userAnswer === correctAnswer ? 'Correct!' : 'Incorrect!';
    resultContainer.appendChild(resultMessage);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    
    const showExplanationBtn = document.createElement('button');
    showExplanationBtn.className = 'show-explanation-btn';
    showExplanationBtn.textContent = 'Show Explanation';
    buttonsContainer.appendChild(showExplanationBtn);
    
    const nextQuestionBtn = document.createElement('button');
    nextQuestionBtn.className = 'next-question-btn';
    nextQuestionBtn.textContent = currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Show Summary';
    buttonsContainer.appendChild(nextQuestionBtn);
    
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

    document.querySelectorAll('.option-container').forEach(container => {
        container.style.pointerEvents = 'none';
    });

    document.getElementById('submit-answer').style.display = 'none';
    
    showExplanationBtn.addEventListener('click', () => {
        explanationDiv.style.display = 'block';
        showExplanationBtn.style.display = 'none';
    });
    
    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            showQuestion();
        } else {
            showSummary();
        }
    });
}

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

function resetQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    questions = [];
    
    const currentUsername = document.getElementById('display-username').innerText.replace('User: ', '');
    
    document.getElementById('user-input').style.display = 'block';
    document.getElementById('welcome-header').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    
    if (!currentUsername) {
        document.getElementById('username').value = '';
    } else {
        document.getElementById('username').value = currentUsername;
    }
    
    document.getElementById('num-questions').value = '';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function checkOrientation() {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    if (isMobile && window.innerWidth < 490 && window.innerHeight > window.innerWidth) {
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

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-btn');
    
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            startQuiz();
        });
    }
    
    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    
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

    const showDataBtn = document.getElementById('show-data-info');
    const dataInfo = document.getElementById('data-info');

    showDataBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        
        if (dataInfo.style.display === 'none') {
            dataInfo.style.display = 'block';
            showDataBtn.textContent = 'Hide info🤫';
        } else {
            dataInfo.style.display = 'none';
            showDataBtn.textContent = 'Know🧐 what we do with your info 🤔';
        }
    });

    document.addEventListener('click', function(event) {
        if (!dataInfo.contains(event.target) && !showDataBtn.contains(event.target)) {
            dataInfo.style.display = 'none';
            showDataBtn.textContent = 'Know🧐 what we do with your info 🤔';
        }
    });

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
});

function formatExplanation(explanation) {
    const segments = explanation.split(/(?<=[.!?])\s+(?=[A-Z])/);
    
    return segments.map(segment => {
        if (segment.match(/(?:^|\s)[A-Da-d][\).]/m)) {
            const hasAcronym = segment.match(/\([A-Z]+\)/);
            if (hasAcronym) {
                return `<p>${segment.trim()}</p>`;
            }
            
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
        
        if (segment.trim().match(/^[A-Da-d][\).]$/)) {
            return `
                <div class="option-explanation">
                    <p class="option-letter">${segment.trim()}</p>
                    <p class="option-detail"></p>
                </div>
            `;
        }
        
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
        
        if (segment.includes(':')) {
            const [intro, content] = segment.split(':');
            return `
                <p class="explanation-intro">${intro.trim()}:</p>
                <div class="explanation-content">
                    <p>${content.trim()}</p>
                </div>
            `;
        }
        
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
