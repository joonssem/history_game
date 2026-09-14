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

def validate_artifact_comparison_site_fields(file_path):
    """대조실 라운드 3 (2026-09-14): docs/plans/artifact_site_source_policy.md §2-1이
    요구하는 checkedAt/hasPhoto가 유적 관련 필드마다 실제로 있는지 확인한다.
    두 위치를 본다 — (1) artifactA/B.site(유물에 딸린 유적 링크),
    (2) artifactA/B 자체가 kind:"site"인 경우(유적이 비교 대상 그 자체)."""
    if not os.path.exists(file_path):
        return True  # validate_json_file already reports missing files
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            comparisons = json.load(f)
    except Exception:
        return True  # JSON 파싱 오류는 validate_json_file이 이미 보고함

    missing = []
    for cmp in comparisons:
        cmp_id = cmp.get('id', '(id 없음)')
        for side in ('artifactA', 'artifactB'):
            art = cmp.get(side)
            if not isinstance(art, dict):
                continue
            targets = []
            if isinstance(art.get('site'), dict):
                targets.append((f"{cmp_id}.{side}.site", art['site']))
            if art.get('kind') == 'site':
                targets.append((f"{cmp_id}.{side}", art))
            for label, obj in targets:
                if 'checkedAt' not in obj:
                    missing.append(f"{label}.checkedAt")
                if 'hasPhoto' not in obj:
                    missing.append(f"{label}.hasPhoto")

    if missing:
        print(f"[FAIL] {file_path}: 유적 출처 필드(checkedAt/hasPhoto) 누락 {len(missing)}건: {', '.join(missing)}")
        return False
    print(f"[PASS] {file_path}: 유적 출처 필드(checkedAt/hasPhoto) 전부 존재.")
    return True

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    files_to_check = [
        os.path.join(base_dir, 'primary_data', 'curriculum_grade5.json'),
        os.path.join(base_dir, 'data', 'stories.json'),
        os.path.join(base_dir, 'data', 'quizzes.json'),
        os.path.join(base_dir, 'data', 'artifacts.json'),
        os.path.join(base_dir, 'data', 'artifactComparisons.json'),
        os.path.join(base_dir, 'data', 'timeline.json'),
    ]

    all_passed = True
    for f in files_to_check:
        passed = validate_json_file(f)
        if not passed:
            all_passed = False

    comparisons_path = os.path.join(base_dir, 'data', 'artifactComparisons.json')
    if not validate_artifact_comparison_site_fields(comparisons_path):
        all_passed = False

    if all_passed:
        print("\nAll game datasets validated successfully without schema errors.")
        sys.exit(0)
    else:
        print("\nSome datasets failed validation.")
        sys.exit(1)

if __name__ == '__main__':
    main()
