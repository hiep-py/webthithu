import json
import os
import re
import glob

class QuizParser:
    GRADES = range(6, 13)  # Lớp 6 đến lớp 12
    SUBJECTS = {
        'toan': 'Toán học',
        'ly': 'Vật lý',
        'hoa': 'Hóa học',
        'sinh': 'Sinh học',
        'van': 'Ngữ văn',
        'su': 'Lịch sử',
        'dia': 'Địa lý',
        'anh': 'Tiếng Anh'
    }

    def __init__(self):
        self.script_dir = os.path.dirname(os.path.abspath(__file__))
        self.quiz_data_path = os.path.join(self.script_dir, '..', 'js', 'quiz-data.js')
        self.quizzes_dir = os.path.join(self.script_dir, '..', 'quizzes')

    def parse_quiz_file(self, file_path):
        # Đảm bảo file tồn tại
        if not os.path.exists(file_path):
            print(f"Lỗi: Không tìm thấy file '{file_path}'")
            print(f"Thư mục hiện tại: {os.getcwd()}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Phân tích thông tin cơ bản
        header_match = re.search(r'@Quiz\s*{(.*?)}', content, re.DOTALL)
        if not header_match:
            raise ValueError("Không tìm thấy thông tin đề thi (@Quiz)")

        header = self._parse_header(header_match.group(1))
        
        # Phân tích các câu hỏi
        questions = []
        question_blocks = re.finditer(r'Q(\d+)\s*{(.*?)}', content, re.DOTALL)
        
        for q_match in question_blocks:
            q_num = int(q_match.group(1))
            q_content = q_match.group(2)
            questions.append(self._parse_question(q_num, q_content))

        # Tạo đề thi mới
        quiz_data = self._load_existing_data()
        subject = header['subject']
        
        if subject not in quiz_data:
            quiz_data[subject] = {}
            
        quiz_data[subject][header['code']] = {
            "title": header['title'],
            "time": header['time'],
            "description": header.get('description', ''),
            "questions": questions
        }

        self._save_quiz_data(quiz_data)
        print(f"Đã thêm đề thi {header['code']} thành công!")

    def _parse_header(self, header_text):
        header = {}
        for line in header_text.strip().split('\n'):
            line = line.strip()
            if ':' in line:
                key, value = line.split(':', 1)
                header[key.strip()] = value.strip()
        return header

    def _parse_question(self, q_num, q_content):
        # Tách các dòng và giữ nguyên xuống dòng trong câu hỏi
        lines = [line.strip() for line in q_content.strip().split('\n') if line.strip()]
        
        # Tìm vị trí đáp án đầu tiên
        options_start = -1
        for i, line in enumerate(lines):
            if line.startswith('A.') or line.startswith('*A.'):
                options_start = i
                break
        
        if options_start == -1:
            raise ValueError(f"Câu {q_num}: Không tìm thấy đáp án bắt đầu bằng 'A.'")
        
        # Giữ nguyên định dạng xuống dòng trong câu hỏi
        question = '\n'.join(lines[:options_start])
        
        # Xử lý các đáp án
        options = []
        correct = None
        
        for i, line in enumerate(lines[options_start:options_start + 4]):
            if not (line.startswith(f"{chr(65+i)}.") or line.startswith(f"*{chr(65+i)}.")):
                raise ValueError(f"Câu {q_num}: Đáp án {chr(65+i)} không đúng định dạng")
            
            if line.startswith('*'):
                correct = i
                option_text = line[2:].strip()
            else:
                option_text = line[2:].strip()
            
            options.append(option_text)
        
        return {
            "id": q_num,
            "question": question,
            "options": options,
            "correct": correct
        }

    def _load_existing_data(self):
        try:
            if os.path.exists(self.quiz_data_path):
                with open(self.quiz_data_path, 'r', encoding='utf-8') as f:
                    content = f.read().replace('const quizData = ', '').rstrip(';')
                    return json.loads(content)
            return {}
        except Exception as e:
            print(f"Lỗi khi đọc file: {e}")
            return {}

    def _save_quiz_data(self, data):
        try:
            with open(self.quiz_data_path, 'w', encoding='utf-8') as f:
                f.write('const quizData = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';')
        except Exception as e:
            print(f"Lỗi khi lưu file: {e}")

    def process_multiple_files(self, mode='all'):
        try:
            # Get all quiz files
            all_quiz_files = glob.glob(os.path.join(self.quizzes_dir, '*.quiz'))
            
            # Load existing quiz data
            existing_data = self._load_existing_data()
            existing_codes = set()
            
            # Get existing quiz codes
            for subject_data in existing_data.values():
                existing_codes.update(subject_data.keys())
            
            if mode == 'all':
                # Process all files that aren't in quiz-data.js
                new_files = []
                for file_path in all_quiz_files:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        header_match = re.search(r'@Quiz\s*{(.*?)}', content, re.DOTALL)
                        if header_match:
                            header = self._parse_header(header_match.group(1))
                            if header.get('code') not in existing_codes:
                                new_files.append(file_path)
                
                if not new_files:
                    print("\nKhông có file mới để thêm!")
                    return
                
                print(f"\nTìm thấy {len(new_files)} file mới:")
                for i, file in enumerate(new_files, 1):
                    print(f"{i}. {os.path.basename(file)}")
                
                confirm = input("\nThêm tất cả file mới? (y/n): ")
                if confirm.lower() == 'y':
                    successful = []
                    failed = []
                    for file in new_files:
                        try:
                            self.parse_quiz_file(file)
                            successful.append(os.path.basename(file))
                        except Exception as e:
                            failed.append((os.path.basename(file), str(e)))
                    
                    self._print_results(successful, failed)
                
            else:
                # Show list of all quiz files
                if not all_quiz_files:
                    print("\nKhông tìm thấy file .quiz nào!")
                    return
                    
                print("\nDanh sách file .quiz:")
                for i, file in enumerate(all_quiz_files, 1):
                    filename = os.path.basename(file)
                    status = "✓" if self._is_file_processed(file, existing_codes) else "NEW"
                    print(f"{i}. [{status}] {filename}")
                
                while True:
                    choice = input("\nChọn số thứ tự file (0 để thoát): ")
                    if choice == '0':
                        break
                        
                    try:
                        index = int(choice) - 1
                        if 0 <= index < len(all_quiz_files):
                            self.parse_quiz_file(all_quiz_files[index])
                        else:
                            print("Số không hợp lệ!")
                    except ValueError:
                        print("Vui lòng nhập số!")

        except Exception as e:
            print(f"Lỗi: {e}")

    def _is_file_processed(self, file_path, existing_codes):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                header_match = re.search(r'@Quiz\s*{(.*?)}', content, re.DOTALL)
                if header_match:
                    header = self._parse_header(header_match.group(1))
                    return header.get('code') in existing_codes
        except:
            return False
        return False

    def _print_results(self, successful, failed):
        print("\nKết quả:")
        print(f"Thành công: {len(successful)} file")
        for file in successful:
            print(f"✓ {file}")
        
        if failed:
            print(f"\nThất bại: {len(failed)} file")
            for file, error in failed:
                print(f"✗ {file}: {error}")

def main():
    parser = QuizParser()
    
    while True:
        print("\n=== HỆ THỐNG QUẢN LÝ ĐỀ THI ===")
        print("1. Thêm tất cả file mới")
        print("2. Chọn file cụ thể")
        print("3. Xem danh sách đề thi")
        print("4. Thoát")
        
        choice = input("\nChọn chức năng (1-4): ")
        
        if choice == '1':
            parser.process_multiple_files(mode='all')
        elif choice == '2':
            parser.process_multiple_files(mode='select')
        elif choice == '3':
            quiz_files = glob.glob(os.path.join(parser.quizzes_dir, '*.quiz'))
            print("\nDanh sách đề thi:")
            for i, file in enumerate(quiz_files, 1):
                print(f"{i}. {os.path.basename(file)}")
        elif choice == '4':
            break

if __name__ == "__main__":
    main()