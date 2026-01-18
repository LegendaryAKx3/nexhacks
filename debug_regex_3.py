import re

raw_summary = """TaskRunTextOutput(basis=[...], content='# U.S. Sports Now', confidence='medium')"""

def test_parse(text):
    print(f"Testing text: {text}")
    
    # New flexible pattern
    # Matches , word=  OR  ) at end
    pattern = r"""content=(['"])(.*?)\1(?:,\s*[a-zA-Z_]\w*=|\)$)"""
    
    match = re.search(pattern, text, re.DOTALL)
    if match:
        print("Full match found!")
        print("Group 2:", match.group(2))
    else:
        print("Full match failed.")

test_parse(raw_summary)
