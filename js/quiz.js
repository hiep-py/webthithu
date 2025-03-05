let currentQuestion = 0;
let examData = null;
let answers = [];
let timeLeft = 0;
let timerInterval;

// Thêm các tính năng:
// Hiển thị số câu đã làm/tổng số câu
// Đánh dấu câu chưa làm
// Xác nhận khi thoát trang
// Tự động lưu câu trả lời

window.onbeforeunload = function () {
  return "Bạn có chắc muốn rời khỏi bài thi?";
};

function updateProgress() {
  const answered = answers.filter((a) => a !== undefined).length;
  document.getElementById(
    "progress"
  ).textContent = `${answered}/${questions.length} câu`;
}

// Khởi tạo bài thi
function initializeQuiz() {
  const examString = localStorage.getItem("currentExam");
  if (!examString) {
    alert("Không tìm thấy thông tin bài thi!");
    window.location.href = "../index.html";
    return;
  }

  examData = JSON.parse(examString);
  const exam = examData.examInfo;

  // Khởi tạo mảng câu trả lời
  answers = new Array(exam.questions.length).fill(null);

  // Cập nhật tiêu đề
  document.getElementById("quiz-title").textContent = exam.title;

  // Khởi tạo thời gian
  timeLeft = exam.time * 60; // Chuyển phút thành giây
  startTimer();

  // Hiển thị câu hỏi đầu tiên
  showQuestion(0);
}

// Hiển thị câu hỏi
function showQuestion(index) {
  const question = examData.examInfo.questions[index];
  const container = document.getElementById("question-container");

  container.innerHTML = `
        <div class="question">
            <h3>Câu ${index + 1}: ${question.question}</h3>
            <div class="options">
                ${question.options
                  .map(
                    (option, i) => `
                    <div class="option ${
                      answers[index] === i ? "selected" : ""
                    }" 
                         onclick="selectAnswer(${index}, ${i})">
                        ${String.fromCharCode(65 + i)}. ${option}
                    </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;

  // Cập nhật số câu hỏi
  document.getElementById("question-number").textContent = `Câu ${index + 1}/${
    examData.examInfo.questions.length
  }`;

  // Cập nhật trạng thái nút
  updateNavigationButtons();
}

// Xử lý chọn đáp án
function selectAnswer(questionIndex, answerIndex) {
  answers[questionIndex] = answerIndex;
  showQuestion(questionIndex);
}

// Cập nhật timer
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("timer").textContent = `${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

// Nút điều hướng
document.getElementById("prev-btn").addEventListener("click", () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    showQuestion(currentQuestion);
  }
});

document.getElementById("next-btn").addEventListener("click", () => {
  if (currentQuestion < examData.examInfo.questions.length - 1) {
    currentQuestion++;
    showQuestion(currentQuestion);
  }
});

// Nộp bài
document.getElementById("submit-btn").addEventListener("click", () => {
  if (confirm("Bạn có chắc chắn muốn nộp bài?")) {
    submitQuiz();
  }
});

function submitQuiz() {
  clearInterval(timerInterval);

  // Tính điểm
  const score = calculateScore();

  // Lưu kết quả
  localStorage.setItem(
    "quizResult",
    JSON.stringify({
      score: score,
      answers: answers,
      timeSpent: examData.examInfo.time * 60 - timeLeft,
    })
  );

  // Chuyển đến trang kết quả
  window.location.href = "ketqua.html";
}

function calculateScore() {
  let correct = 0;
  answers.forEach((answer, index) => {
    if (answer === examData.examInfo.questions[index].correct) {
      correct++;
    }
  });
  return (correct / examData.examInfo.questions.length) * 10;
}

// Khởi tạo bài thi khi tải trang
window.addEventListener("load", initializeQuiz);
