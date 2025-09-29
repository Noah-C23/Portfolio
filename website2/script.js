// 🔬 Global variables
let questions = [];
let quizQuestions = [];
let currentIndex = 0;
let score = 0;

// Unique storage key for this project
const STORAGE_KEY = "chemQuiz_scores";

// 📌 Load questions from JSON when page loads
fetch("chemistry_questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data;
        console.log("Questions loaded:", questions.length);
    })
    .catch(error => console.error("Error loading questions:", error));

// 📌 Start quiz with chosen number of questions
function startQuiz(num) {
    if (questions.length === 0) {
        alert("Questions are still loading. Please wait a moment and try again.");
        return;
    }

    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("quiz-screen").classList.remove("hidden");

    // Random selection
    quizQuestions = shuffleArray([...questions]).slice(0, num);
    currentIndex = 0;
    score = 0;
    showQuestion();
}

// 📌 Show a question
function showQuestion() {
    const q = quizQuestions[currentIndex];
    document.getElementById("question-text").textContent = q.question;

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";
    q.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice;
        btn.onclick = () => checkAnswer(choice, q.answer);
        choicesDiv.appendChild(btn);
    });

    document.getElementById("progress").textContent =
        `Question ${currentIndex + 1} of ${quizQuestions.length}`;
}

// 📌 Check answer
function checkAnswer(selected, correct) {
    if (selected === correct) score++;
    currentIndex++;
    if (currentIndex < quizQuestions.length) {
        showQuestion();
    } else {
        endQuiz();
    }
}

// 📌 End quiz
function endQuiz() {
    document.getElementById("quiz-screen").classList.add("hidden");
    document.getElementById("result-screen").classList.remove("hidden");
    document.getElementById("final-score").textContent =
        `You scored ${score} out of ${quizQuestions.length}`;
}

// 📌 Save score to localStorage
function saveScore() {
    const name = document.getElementById("player-name").value.trim() || "Anonymous";
    let scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    scores.push({ name, score, total: quizQuestions.length });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 10); // keep top 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    loadLeaderboard();
    resetQuiz();
}

// 📌 Load leaderboard
function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const list = document.getElementById("leaderboard-list");
    list.innerHTML = "";
    scores.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.name} - ${s.score}/${s.total}`;
        list.appendChild(li);
    });
}

// 📌 Reset quiz to setup
function resetQuiz() {
    document.getElementById("result-screen").classList.add("hidden");
    document.getElementById("setup-screen").classList.remove("hidden");
    document.getElementById("player-name").value = "";
}

// 📌 Reset leaderboard
function resetLeaderboard() {
    localStorage.removeItem(STORAGE_KEY);
    loadLeaderboard();
}

// 📌 Shuffle helper
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// Initialize leaderboard on page load
window.onload = loadLeaderboard;
