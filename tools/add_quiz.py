import json
import os

# Lấy đường dẫn tuyệt đối đến thư mục chứa script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Đường dẫn đến file quiz-data.js
QUIZ_DATA_PATH = os.path.join(SCRIPT_DIR, '..', 'js', 'quiz-data.js')

def load_quiz_data():
    try:
        # Tạo thư mục js nếu chưa tồn tại
        os.makedirs(os.path.dirname(QUIZ_DATA_PATH), exist_ok=True)
        
        if os.path.exists(QUIZ_DATA_PATH):
            with open(QUIZ_DATA_PATH, 'r', encoding='utf-8') as f:
                content = f.read().replace('const quizData = ', '').rstrip(';')
                return json.loads(content)
        return {}
    except Exception as e:
        print(f"Lỗi khi đọc file: {e}")
        return {}

def save_quiz_data(data):
    try:
        with open(QUIZ_DATA_PATH, 'w', encoding='utf-8') as f:
            f.write('const quizData = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';')
        print(f"Đã lưu dữ liệu thành công vào {QUIZ_DATA_PATH}")
    except Exception as e:
        print(f"Lỗi khi lưu file: {e}")

def add_new_quiz():
    print("=== THÊM ĐỀ THI MỚI ===")
    
    # Chọn môn học
    print("\nCác môn học:")
    print("1. Toán")
    print("2. Lý")
    print("3. Hóa")
    print("4. Thêm môn học mới")
    
    choice = input("Chọn môn học (1-4): ")
    
    subjects = {'1': 'toan', '2': 'ly', '3': 'hoa'}
    if choice == '4':
        subject = input("Nhập tên môn học mới (không dấu): ").lower()
    else:
        subject = subjects.get(choice)

    # Tạo mã đề
    quiz_data = load_quiz_data()
    if subject not in quiz_data:
        quiz_data[subject] = {}
    
    exam_count = len(quiz_data[subject]) + 1
    exam_code = f"de{str(exam_count).zfill(3)}"
    
    # Thông tin đề thi
    title = input(f"\nNhập tiêu đề đề thi (VD: Đề thi {subject.title()} {exam_code}): ")
    time = int(input("Thời gian làm bài (phút): "))
    
    questions = []
    while True:
        print("\n=== Nhập câu hỏi ===")
        question = input("Câu hỏi (Enter trống để kết thúc): ")
        if not question:
            break
            
        options = []
        print("Nhập 4 đáp án (A, B, C, D):")
        for i in range(4):
            opt = input(f"Đáp án {chr(65+i)}: ")
            options.append(opt)
            
        correct = ord(input("Đáp án đúng (A/B/C/D): ").upper()) - 65
        
        questions.append({
            "id": len(questions) + 1,
            "question": question,
            "options": options,
            "correct": correct
        })
    
    # Lưu đề thi
    quiz_data[subject][exam_code] = {
        "title": title,
        "time": time,
        "questions": questions
    }
    
    save_quiz_data(quiz_data)
    print(f"\nĐã thêm đề thi {exam_code} thành công!")

if __name__ == "__main__":
    add_new_quiz()