# app/utils/parser.py
import re
from typing import Dict, Optional, List

def find_email(text: str) -> Optional[str]:
    """Finds the first email address in a block of text."""
    match = re.search(r'[\w\.-]+ @[\w\.-]+\.\w+', text)
    return match.group(0) if match else ""

def find_phone(text: str) -> Optional[str]:
    """Finds the first phone number in a block of text."""
    # This regex is designed to find common phone number formats
    match = re.search(r'(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?[\d\s.-]{7,15}', text)
    return match.group(0).strip() if match else ""

def parse_tier1(text: str) -> Optional[Dict]:
    """
    Attempts to parse a resume using fast, rule-based methods.
    Returns a dictionary if successful, otherwise returns None.
    """
    # Define keywords that signal the start of a section. Case-insensitive.
    section_keywords = {
        'summary': [r'summary', r'objective', r'profile'],
        'skills': [r'skills', r'technical skills', r'technologies'],
        'experience': [r'experience', r'work history', r'employment'],
        'education': [r'education', r'academic background'],
        'projects': [r'projects'],
        'certifications': [r'certifications', r'licenses & certifications']
    }

    # Build a master regex to find any of the section headers
    all_keywords = [item for sublist in section_keywords.values() for item in sublist]
    # Match whole lines that start with a keyword, are followed by optional characters, and end with a newline
    pattern = re.compile(r'^(%s)[\s:.]*$' % '|'.join(all_keywords), re.IGNORECASE | re.MULTILINE)
    
    matches = list(pattern.finditer(text))
    
    # If we can't find at least 2 major sections, the resume is too unstructured.
    # Fall back to the AI parser.
    if len(matches) < 2:
        return None

    print("Tier 1 Parser: Structured resume detected. Parsing sections.")
    
    sections = {}
    for i, match in enumerate(matches):
        # Determine which section this keyword belongs to
        section_name = ""
        for name, kws in section_keywords.items():
            if any(re.search(kw, match.group(0), re.IGNORECASE) for kw in kws):
                section_name = name
                break
        
        # The content of the section is the text between this match and the next one
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[section_name] = text[start:end].strip()

    # The header is everything before the first section match
    header_text = text[:matches[0].start()].strip()
    
    # Basic parsing of found data
    # This is a simplified example; more complex regex could parse experience items
    result = {
        "name": header_text.split('\n')[0].strip(),
        "title": header_text.split('\n')[1].strip() if len(header_text.split('\n')) > 1 else "",
        "email": find_email(header_text),
        "phone": find_phone(header_text),
        "location": "", # Could be inferred from header
        "website": "",
        "summary": sections.get('summary', ""),
        "skills": [s.strip() for s in sections.get('skills', "").split('\n') if s.strip()],
        "experience": [], # Tier 1 can be extended to parse this, but for now we leave it to AI if needed
        "education": [],
        "projects": [],
        "certifications": []
    }
    
    # If the basic parsing is good enough, return the result
    if result['name'] and result['email']:
        return result
        
    return None # Fallback to AI if basic parsing fails to get key info
