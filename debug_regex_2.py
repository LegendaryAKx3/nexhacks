import re

raw_summary = """TaskRunTextOutput(basis=[...], content='# U.S. Sports Now', citations=[])"""

def test_parse(text):
    print(f"Testing text: {text}")
    
    # The full pattern I used in topics.py:
    # (?:, citations=|,\s*citations=|\)$)
    pattern = r"""content=(['"])(.*?)\1(?:, citations=|,\s*citations=|\)$)"""
    match = re.search(pattern, text, re.DOTALL)
    if match:
        print("Full match found!")
        print("Group 2:", match.group(2))
    else:
        print("Full match failed.")

test_parse(raw_summary)
