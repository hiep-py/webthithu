document.addEventListener("DOMContentLoaded", function () {
  const result = JSON.parse(localStorage.getItem("quizResult"));
  const examData = JSON.parse(localStorage.getItem("currentExam"));

  if (!result || !examData) {
    alert("Không tìm thấy thông tin bài thi!");
    window.location.href = "../index.html";
    return;
  }

  document.getElementById("exam-title").textContent = examData.examInfo.title;
  const container = document.getElementById("questions-review");

  examData.examInfo.questions.forEach((question, index) => {
    const userAnswer = result.answers[index];
    const isCorrect = userAnswer === question.correct;

    const questionDiv = document.createElement("div");
    questionDiv.className = "question-review";
    questionDiv.innerHTML = `
            <h3>Câu ${index + 1}: ${question.question}</h3>
            <div class="options-review">
                ${question.options
                  .map(
                    (option, i) => `
                    <div class="option-review ${
                      i === userAnswer ? "option-selected" : ""
                    } 
                                            ${
                                              i === question.correct
                                                ? "option-correct"
                                                : ""
                                            }">
                        ${String.fromCharCode(65 + i)}. ${option}
                        ${i === question.correct ? " ✓" : ""}
                        ${
                          i === userAnswer && i !== question.correct ? " ✗" : ""
                        }
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="answer-status ${isCorrect ? "correct" : "incorrect"}">
                ${isCorrect ? "✓ Đúng" : "✗ Sai"}
            </div>
        `;
    container.appendChild(questionDiv);
  });
});
