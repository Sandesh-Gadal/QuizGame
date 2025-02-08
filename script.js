// script.js
const quizContainer = document.getElementById("quiz-container");
const levelHeader = document.getElementById("level");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const checkAnswerButton = document.getElementById("check-answer");
const resultContainer = document.getElementById("result-container");

let currentLevel = 1;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let questions = [];

// Fetch quiz data from API using a CORS proxy
async function fetchQuizData(level) {
    try {
        const response = await fetch(`https://corsproxy.io/?https://api-ghz-v2.azurewebsites.net/api/v2/quiz?level=${level}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Quiz Data:", data); // Print data to console for debugging
        questions = data.test.question;
        console.log("Questions:", questions); // Print questions to console for debugging
        loadQuestion();
    } catch (error) {
        console.error("Error fetching quiz data:", error);
        quizContainer.innerHTML = `<p>Failed to load quiz data. Please try again later.</p>`;
    }
}

// Load the current question
function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    levelHeader.textContent = `Level ${currentLevel} > Question ${currentQuestionIndex + 1}`;
    questionText.textContent = currentQuestion.question;

    answersContainer.innerHTML = "";
    currentQuestion.answers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.textContent = answer;
        button.className = "answer";
        button.dataset.index = index;
        button.setAttribute("tabindex", "0"); // Make button focusable
        button.addEventListener("click", () => selectAnswer(index));
        button.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                selectAnswer(index);
            }
        });
        answersContainer.appendChild(button);
    });
    checkAnswerButton.disabled = true;
}

// Handle answer selection
function selectAnswer(selectedIndex) {
    const buttons = document.querySelectorAll(".answer");
    buttons.forEach(button => button.classList.remove("selected"));
    const selectedButton = buttons[selectedIndex];
    selectedButton.classList.add("selected");
    selectedButton.focus(); // Focus on selected button
    checkAnswerButton.disabled = false;
}

// Check the selected answer
checkAnswerButton.addEventListener("click", () => {
    const selectedButton = document.querySelector(".answer.selected");
    if (!selectedButton) return;
    
    const selectedIndex = parseInt(selectedButton.dataset.index);
    const correctIndex = questions[currentQuestionIndex].test_answer;

    const resultLabel = document.createElement("span");
    resultLabel.classList.add("result-label");
    
    if (selectedIndex === correctIndex) {
        selectedButton.classList.add("correct");
        resultLabel.textContent = " - Correct";
        correctAnswers++;
    } else {
        selectedButton.classList.add("incorrect");
        document.querySelector(`.answer[data-index='${correctIndex}']`).classList.add("correct");
        resultLabel.textContent = " - Wrong";
    }
    selectedButton.appendChild(resultLabel);

    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        setTimeout(() => loadQuestion(), 2000);
    } else {
        displayResult();
    }
});

// Display the quiz result
function displayResult() {
    quizContainer.innerHTML = `
        <h2>You have successfully completed the quiz.</h2>
        <p>You got ${correctAnswers} out of ${questions.length} correct answers.</p>
        <button id="retake-quiz">Retake Quiz</button>
        <button id="next-level">Go to Next Level</button>
    `;
    
    document.getElementById("retake-quiz").addEventListener("click", restartQuiz);
    document.getElementById("next-level").addEventListener("click", nextLevel);
}

// Restart the quiz
function restartQuiz() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    fetchQuizData(currentLevel);
    loadQuestion();
}

// Move to the next level
function nextLevel() {
    currentLevel++;
    currentQuestionIndex = 0;
    correctAnswers = 0;
    fetchQuizData(currentLevel);
}

// Initialize the quiz
fetchQuizData(currentLevel);
