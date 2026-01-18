import re

raw_summary = """TaskRunTextOutput(basis=[FieldBasis(field='content', reasoning="The report is largely well-supported...", citations=[Citation(url='https://www.espn.com/', excerpts=[], title='ESPN')]), confidence='medium')], content='# U.S. Sports Now: Playoff Jolts...\n\n## Executive Summary\nAs of January 18, 2026...')"""

def test_parse(text):
    print(f"Testing text of length {len(text)}")
    # The current regex
    pattern = r"""content=(['"])(.*?)\1(?:, citations=|,\s*citations=|\)$) """
    match = re.search(pattern, text, re.DOTALL)
    if match:
        print("Match found!")
        print("Content start:", match.group(2)[:50])
    else:
        print("No match found.")

test_parse(raw_summary)
