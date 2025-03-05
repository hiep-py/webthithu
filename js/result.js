/* filepath: /d:/hoccodeweb/webthithu/quiz-web-static/js/result.js */
document.addEventListener("DOMContentLoaded", function () {
  const result = JSON.parse(localStorage.getItem("quizResult"));
  const examData = JSON.parse(localStorage.getItem("currentExam"));

  if (!result || !examData) {
    alert("Không tìm thấy kết quả bài thi!");
    window.location.href = "../index.html";
    return;
  }

  // Hiển thị tên đề thi
  document.getElementById("exam-title").textContent = examData.examInfo.title;

  // Hiển thị điểm số
  document.getElementById("score").textContent = result.score.toFixed(1);

  // Hiển thị số câu đúng
  const totalQuestions = examData.examInfo.questions.length;
  const correctAnswers = Math.round((result.score * totalQuestions) / 10);
  document.getElementById("correct-answers").textContent = correctAnswers;
  document.getElementById("total-questions").textContent = totalQuestions;

  // Hiển thị thời gian làm bài
  const timeSpent = Math.round(result.timeSpent / 60);
  document.getElementById("time-taken").textContent = timeSpent;
});

function reviewAnswers() {
  window.location.href = "review.html";
}
