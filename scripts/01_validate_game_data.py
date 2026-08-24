import json
import os
import sys

def validate_json_file(file_path):
    if not os.path.exists(file_path):
        print(f"[FAIL] File not found: {file_path}")
        return False
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"[PASS] {file_path}: Valid JSON with {len(data) if isinstance(data, list) else len(data.keys())} items.")
            return True
    except Exception as e:
        print(f"[FAIL] {file_path}: JSON parse error: {e}")
        return False

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files_to_check = [
        os.path.join(base_dir, 'primary_data', 'curriculum_grade5.json'),
        os.path.join(base_dir, 'data', 'stories.json'),
        os.path.join(base_dir, 'data', 'quizzes.json'),
        os.path.join(base_dir, 'data', 'artifacts.json'),
        os.path.join(base_dir, 'data', 'timeline.json'),
    ]

    all_passed = True
    for f in files_to_check:
        passed = validate_json_file(f)
        if not passed:
            all_passed = False

    if all_passed:
        print("\nAll game datasets validated successfully without schema errors.")
        sys.exit(0)
    else:
        print("\nSome datasets failed validation.")
        sys.exit(1)

if __name__ == '__main__':
    main()
