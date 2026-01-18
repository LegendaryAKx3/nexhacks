import re

raw_summary = """TaskRunTextOutput(basis=[FieldBasis(field='content', reasoning="The report is largely well-supported...", citations=[Citation(url='https://www.espn.com/', excerpts=[], title='ESPN')]), confidence='medium')], content='# U.S. Sports Now')"""

def test_parse(text):
    print(f"Testing text: {text}")
    
    # Try just finding content=
    # Use triple quotes to avoid quoting hell
    m1 = re.search(r"""content=(['"])""", text)
    if m1:
        print(f"Found content start with quote: {m1.group(1)}")
    else:
        print("Did not find content start")

    # The full pattern
    pattern = r"""content=(['"])(.*?)\1(?:\)$)"""
    match = re.search(pattern, text, re.DOTALL)
    if match:
        print("Full match found!")
        print("Group 2:", match.group(2))
    else:
        print("Full match failed.")

test_parse(raw_summary)
