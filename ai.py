# app/utils/ai.py

import httpx
from typing import List, Dict, Any, Optional, Set
import json
import asyncio
import re
from collections import Counter

from ..config import settings

# --- Configuration ---
API_URL = "https://openrouter.ai/api/v1/chat/completions"

class OpenRouterError(RuntimeError):
    """Custom exception for AI API errors."""
    pass

# Section-specific configurations for optimal bullet generation
SECTION_CONFIGS = {
    "experience": {
        "min_bullets": 3,
        "max_bullets": 5,
        "min_words_per_bullet": 15,
        "max_words_per_bullet": 35,
        "style": "achievement-focused",
        "requires_metrics": True,
        "example": "Led cross-functional team of 8 engineers to deliver microservices architecture, reducing API response time by 45% and cutting infrastructure costs by $120K annually"
    },
    "summary": {
        "min_bullets": 2,
        "max_bullets": 3,
        "min_words_per_bullet": 20,
        "max_words_per_bullet": 40,
        "style": "value-proposition",
        "requires_metrics": False,
        "example": "Results-driven software engineer with 5+ years building scalable cloud solutions, specializing in Python, AWS, and microservices architecture"
    },
    "projects": {
        "min_bullets": 2,
        "max_bullets": 4,
        "min_words_per_bullet": 18,
        "max_words_per_bullet": 38,
        "style": "technical-showcase",
        "requires_metrics": True,
        "example": "Built real-time data pipeline processing 2M+ events/day using Apache Kafka and Spark, achieving 99.9% reliability"
    },
    "skills": {
        "min_bullets": 1,
        "max_bullets": 1,
        "min_words_per_bullet": 10,
        "max_words_per_bullet": 50,
        "style": "categorized-list",
        "requires_metrics": False,
        "example": "Languages: Python, JavaScript, Go | Frameworks: React, Django, FastAPI | Cloud: AWS, Docker, Kubernetes"
    }
}

async def _call_openrouter(
    messages: List[Dict[str, str]],
    model: str,
    response_format: Optional[Dict[str, str]] = None,
    temperature: float = 0.1,
) -> str:
    """Internal function to make a call to the OpenRouter API."""
    api_key = settings.OPENROUTER_API_KEY
    if not api_key:
        raise OpenRouterError("OPENROUTER_API_KEY environment variable is not set.")

    headers = {"Authorization": f"Bearer {api_key}"}
    payload: Dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": 4096,
    }
    if response_format:
        payload["response_format"] = response_format

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(API_URL, headers=headers, json=payload, timeout=120.0)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 429:
                raise OpenRouterError("You have exceeded your daily limit for free models. Please try again tomorrow or add credits to your OpenRouter account.")
            raise OpenRouterError(f"API request failed with status {exc.response.status_code}: {exc.response.text}")
        except httpx.TimeoutException:
            raise OpenRouterError(f"API request timed out for model {model}.")
        except Exception as e:
            raise OpenRouterError(f"An unexpected error occurred during the API call: {e}")

async def chat_json(messages: List[Dict[str, str]], temperature: float = 0.1) -> Dict[str, Any]:
    """Sends a request to the OpenRouter API expecting a JSON response with fallback logic."""
    try:
        response_text = await _call_openrouter(
            messages,
            model=settings.OPENROUTER_MODEL,
            response_format={"type": "json_object"},
            temperature=temperature,
        )
    except OpenRouterError as e:
        if not settings.OPENROUTER_FALLBACK_MODEL:
            raise e  # Re-raise the original error if no fallback is configured
        
        print(f"Primary model failed: {e}. Retrying with fallback model: {settings.OPENROUTER_FALLBACK_MODEL}")
        try:
            response_text = await _call_openrouter(
                messages,
                model=settings.OPENROUTER_FALLBACK_MODEL,
                response_format={"type": "json_object"},
                temperature=temperature,
            )
        except OpenRouterError as fallback_e:
            raise OpenRouterError(f"Primary and fallback models failed. Last error: {fallback_e}")

    try:
        return json.loads(response_text, strict=False)
    except json.JSONDecodeError:
        raise OpenRouterError(f"Failed to parse JSON from AI response. Raw response: {response_text}")

async def chat_text(messages: List[Dict[str, str]], temperature: float = 0.5) -> str:
    """Sends a request to the OpenRouter API expecting a plain text response with fallback logic."""
    try:
        response_text = await _call_openrouter(
            messages,
            model=settings.OPENROUTER_MODEL,
            temperature=temperature,
        )
    except OpenRouterError as e:
        if not settings.OPENROUTER_FALLBACK_MODEL:
            raise e # Re-raise the original error if no fallback is configured

        print(f"Primary model failed: {e}. Retrying with fallback model: {settings.OPENROUTER_FALLBACK_MODEL}")
        try:
            response_text = await _call_openrouter(
                messages,
                model=settings.OPENROUTER_FALLBACK_MODEL,
                temperature=temperature,
            )
        except OpenRouterError as fallback_e:
            raise OpenRouterError(f"Primary and fallback models failed. Last error: {fallback_e}")

    return response_text.strip()

# --- UNIVERSAL AI PARSING TASK ---


async def parse_resume_to_json_async(text: str) -> Dict[str, Any]:
    """
    Universal AI parser with advanced structure detection and validation.
    Handles PDFs, DOCX, plain text, and unstructured formats.
    """
    
    # Preprocessing: Clean and normalize text
    text = text.strip()
    text = re.sub(r'\n{3,}', '\n\n', text)  # Reduce excessive newlines
    text = re.sub(r' {2,}', ' ', text)  # Reduce excessive spaces
    
    prompt = f"""You are an elite resume parsing AI with 99.9% accuracy. Parse the following resume into STRICT JSON format.

**PARSING RULES (CRITICAL - FOLLOW EXACTLY):**

1. **SECTION DETECTION**: Identify sections using these patterns:
   - Contact Info: Usually at the top (name, email, phone, location)
   - Summary/Objective: Keywords like "Summary", "Profile", "About", "Objective"
   - Experience: Keywords like "Experience", "Work History", "Employment", "Career"
   - Education: Keywords like "Education", "Academic", "Degree"
   - Skills: Keywords like "Skills", "Technologies", "Tools", "Expertise"
   - Projects: Keywords like "Projects", "Portfolio"
   - Certifications: Keywords like "Certifications", "Licenses", "Awards"

2. **DATA EXTRACTION PRECISION**:
   - Extract EXACTLY as written - do not rephrase
   - If a field is missing, use empty string "" or empty array []
   - For work experience: Extract job title, company, dates, and all bullet points
   - For education: Extract degree, institution, graduation date
   - For skills: Extract ALL mentioned skills (technical, soft, tools)

3. **BULLET POINTS**: Preserve all bullet points under experience/projects
   - Combine multi-line bullets into single strings
   - Keep original formatting and numbers

4. **DATE PARSING**: Extract dates in original format
   - Examples: "Jan 2020 - Present", "2019-2021", "June 2022"

5. **NO HALLUCINATION**: 
   - If you cannot find data for a field, leave it empty
   - DO NOT guess or infer information
   - DO NOT create placeholder text

**EXACT JSON SCHEMA (OUTPUT ONLY THIS - NO EXTRA TEXT):**
```json
{{
  "name": "",
  "title": "",
  "location": "",
  "email": "",
  "phone": "",
  "website": "",
  "summary": "",
  "skills": [],
  "experience": [
    {{
      "role": "",
      "company": "",
      "period": "",
      "details": ""
    }}
  ],
  "education": [
    {{
      "degree": "",
      "institution": "",
      "period": ""
    }}
  ],
  "projects": [
    {{
      "name": "",
      "details": "",
      "link": ""
    }}
  ],
  "certifications": [
    {{
      "name": "",
      "issuer": "",
      "link": ""
    }}
  ]
}}
```

**RESUME TEXT:**
---
{text}
---

**YOUR RESPONSE (JSON ONLY - NO MARKDOWN, NO EXPLANATION):**"""
    
    try:
        result = await chat_json([{"role": "user", "content": prompt}], temperature=0.0)
        
        # Validation layer
        validated_result = validate_parsed_resume(result)
        return validated_result
        
    except Exception as e:
        print(f"AI parsing error: {str(e)}")
        return {"error": f"Failed to parse resume: {str(e)}"}


def validate_parsed_resume(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates and cleans the AI-parsed resume data.
    Ensures all required fields exist and are properly formatted.
    """
    # Default structure
    validated = {
        "name": "",
        "title": "",
        "location": "",
        "email": "",
        "phone": "",
        "website": "",
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": []
    }
    
    # Merge with parsed data
    for key in validated.keys():
        if key in data:
            validated[key] = data[key]
    
    # Clean string fields
    for key in ["name", "title", "location", "email", "phone", "website", "summary"]:
        if isinstance(validated[key], str):
            validated[key] = validated[key].strip()
    
    # Validate arrays
    for key in ["skills", "experience", "education", "projects", "certifications"]:
        if not isinstance(validated[key], list):
            validated[key] = []
    
    # Validate experience entries
    for exp in validated["experience"]:
        if "role" not in exp:
            exp["role"] = ""
        if "company" not in exp:
            exp["company"] = ""
        if "period" not in exp:
            exp["period"] = ""
        if "details" not in exp:
            exp["details"] = ""

    # Validate education entries
    for edu in validated["education"]:
        if "degree" not in edu:
            edu["degree"] = ""
        if "institution" not in edu:
            edu["institution"] = ""
        if "period" not in edu:
            edu["period"] = ""

    # Validate projects entries
    for proj in validated["projects"]:
        if "name" not in proj:
            proj["name"] = ""
        if "details" not in proj:
            proj["details"] = ""
        if "link" not in proj:
            proj["link"] = ""

    # Validate certifications entries
    for cert in validated["certifications"]:
        if "name" not in cert:
            cert["name"] = ""
        if "issuer" not in cert:
            cert["issuer"] = ""
        if "link" not in cert:
            cert["link"] = ""
    
    return validated


# --- OTHER AI TASKS ---

async def calculate_keyword_match_score(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Hybrid keyword matching algorithm: AI for job description, rules for resume.
    Returns match percentage and missing keywords.
    """
    
    # Extract keywords using the appropriate method for each text
    job_keywords = await extract_keywords_from_job_description(job_description)
    resume_keywords = extract_keywords_from_resume(resume_text)
    
    # Find matching and missing keywords
    matched_keywords = job_keywords.intersection(resume_keywords)
    missing_keywords = job_keywords - resume_keywords
    
    # Calculate match percentage
    if len(job_keywords) == 0:
        match_percentage = 100 if len(resume_keywords) > 0 else 0
    else:
        match_percentage = (len(matched_keywords) / len(job_keywords)) * 100
    
    return {
        "match_percentage": round(match_percentage, 1),
        "matched_keywords": sorted(list(matched_keywords)),
        "missing_keywords": sorted(list(missing_keywords))[:15],  # Show top 15 missing
        "total_job_keywords": len(job_keywords),
        "total_matched": len(matched_keywords)
    }


async def extract_keywords_from_job_description(text: str) -> Set[str]:
    """
    Uses AI to extract relevant keywords from a job description.
    Focuses on identifying key skills, technologies, and qualifications.
    """
    if not text or not text.strip():
        return set()

    prompt = f"""You are an expert ATS and recruitment analyst. Your task is to extract the most critical keywords from this job description.

**JOB DESCRIPTION:**
---
{text[:4000]}
---

**INSTRUCTIONS:**
1.  **Identify Core Requirements:** Focus on essential skills, technologies, programming languages, frameworks, qualifications, and key responsibilities.
2.  **Extract Exact Terms:** Pull the keywords exactly as they appear in the text.
3.  **Prioritize:** Identify the top 20-30 most important keywords that an ATS would screen for.
4.  **Categorize (for your reference):** Think in terms of "Technical Skills" (e.g., Python, React, AWS), "Soft Skills" (e.g., communication, leadership), and "Qualifications" (e.g., "Master's degree", "5+ years of experience").
5.  **Clean the Output:**
    -   Return a flat list of unique keywords.
    -   Convert all keywords to lowercase.
    -   Do NOT include generic words or stopwords (e.g., "the", "and", "a", "with", "experience").
    -   Do NOT include company-specific names unless they are also a technology.

**OUTPUT FORMAT:**
Return a single JSON object with one key, "keywords", which is an array of strings.

**EXAMPLE OUTPUT:**
```json
{{
  "keywords": ["python", "django", "react", "aws", "restful apis", "microservices", "agile methodologies", "team leadership", "bachelor's degree"]
}}
```

**YOUR RESPONSE (JSON ONLY):**
"""
    try:
        result = await chat_json([{"role": "user", "content": prompt}], temperature=0.0)
        keywords = result.get("keywords", [])
        
        # Further clean and normalize
        cleaned_keywords = set()
        for kw in keywords:
            kw_lower = kw.lower().strip()
            # Basic validation
            if len(kw_lower) > 2 and len(kw_lower) < 50:
                cleaned_keywords.add(kw_lower)
        
        return cleaned_keywords
        
    except Exception as e:
        print(f"AI keyword extraction failed: {str(e)}. Falling back to basic extraction.")
        # Fallback to a simplified version of the original rule-based extractor
        text_lower = text.lower()
        text_lower = re.sub(r'[^\w\s\.]', ' ', text_lower)
        words = text_lower.split()
        stop_words = {'the', 'a', 'an', 'and', 'or', 'in', 'on', 'for', 'with', 'is', 'of'}
        return {word for word in words if len(word) > 2 and word not in stop_words and not word.isdigit()}


def extract_keywords_from_resume(text: str) -> Set[str]:
    """
    Rule-based keyword extraction for resumes. It's faster and sufficient
    for matching against AI-extracted job keywords.
    """
    text = text.lower()
    text = re.sub(r'[^\w\s\.]', ' ', text)
    words = text.split()
    
    # A smaller, more targeted stop word list is fine here
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
        'with', 'by', 'as', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    }
    
    keywords = {
        word for word in words 
        if len(word) > 2 and word not in stop_words and not word.isdigit()
    }
    
    # Add bigrams for context
    bigrams = []
    for i in range(len(words) - 1):
        if words[i] not in stop_words and words[i+1] not in stop_words:
            bigram = f"{words[i]} {words[i+1]}"
            if len(bigram) > 6:
                bigrams.append(bigram)
    
    bigram_counts = Counter(bigrams)
    for bigram, count in bigram_counts.most_common(20):
        keywords.add(bigram)
        
    return keywords


def calculate_resume_completeness_score(parsed_resume: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates completeness score based on resume structure.
    Checks for essential sections and content quality.
    """
    
    scores = {
        "contact_info": 0,
        "summary": 0,
        "experience": 0,
        "education": 0,
        "skills": 0,
        "additional": 0
    }
    
    max_scores = {
        "contact_info": 15,  # Name, email, phone
        "summary": 10,       # Professional summary
        "experience": 35,    # Work experience with details
        "education": 15,     # Educational background
        "skills": 15,        # Technical/professional skills
        "additional": 10     # Projects, certifications
    }
    
    # 1. Contact Information (15 points)
    if parsed_resume.get("name"):
        scores["contact_info"] += 5
    if parsed_resume.get("email"):
        scores["contact_info"] += 5
    if parsed_resume.get("phone"):
        scores["contact_info"] += 5
    
    # 2. Summary (10 points)
    summary = parsed_resume.get("summary", "")
    if summary and len(summary) > 50:
        scores["summary"] = 10
    elif summary and len(summary) > 20:
        scores["summary"] = 5
    
    # 3. Experience (35 points)
    experience = parsed_resume.get("experience", [])
    if len(experience) >= 3:
        scores["experience"] += 15  # Has multiple experiences
    elif len(experience) >= 1:
        scores["experience"] += 10
    
    # Check if experiences have detailed descriptions
    detailed_count = sum(1 for exp in experience if len(exp.get("details", "")) > 100)
    if detailed_count >= 2:
        scores["experience"] += 20
    elif detailed_count >= 1:
        scores["experience"] += 10
    
    # 4. Education (15 points)
    education = parsed_resume.get("education", [])
    if len(education) >= 1:
        scores["education"] = 15
    
    # 5. Skills (15 points)
    skills = parsed_resume.get("skills", [])
    if len(skills) >= 10:
        scores["skills"] = 15
    elif len(skills) >= 5:
        scores["skills"] = 10
    elif len(skills) >= 1:
        scores["skills"] = 5
    
    # 6. Additional Sections (10 points)
    projects = parsed_resume.get("projects", [])
    certifications = parsed_resume.get("certifications", [])
    
    if len(projects) >= 2:
        scores["additional"] += 5
    elif len(projects) >= 1:
        scores["additional"] += 3
    
    if len(certifications) >= 2:
        scores["additional"] += 5
    elif len(certifications) >= 1:
        scores["additional"] += 2
    
    total_score = sum(scores.values())
    total_max = sum(max_scores.values())
    
    return {
        "total_score": total_score,
        "max_score": total_max,
        "percentage": round((total_score / total_max) * 100, 1),
        "breakdown": scores
    }


async def analyze_resume_async(
    resume_text: str, 
    job_description: str,
    parsed_resume: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    HYBRID ATS SCORING: Combines rule-based + AI analysis.
    
    Scoring Breakdown:
    - 40% Keyword Match (Rule-based)
    - 30% Resume Completeness (Rule-based)
    - 30% AI Qualitative Analysis
    
    Returns:
        {
            "atsScore": float,
            "missingKeywords": list,
            "scoreBreakdown": dict,
            "recommendations": list
        }
    """
    
    if not job_description or not job_description.strip():
        return {
            "atsScore": 0,
            "missingKeywords": [],
            "scoreBreakdown": {},
            "recommendations": ["Add a job description to calculate ATS score"]
        }
    
    try:
        # PHASE 1: Hybrid Keyword Matching (40 points)
        keyword_analysis = await calculate_keyword_match_score(resume_text, job_description)
        keyword_score = (keyword_analysis["match_percentage"] / 100) * 40
        
        # PHASE 2: Resume Completeness Check (30 points)
        completeness_score = 0
        if parsed_resume:
            completeness_analysis = calculate_resume_completeness_score(parsed_resume)
            completeness_score = (completeness_analysis["percentage"] / 100) * 30
        else:
            # Fallback: Basic completeness check
            completeness_score = 15 if len(resume_text) > 500 else 10
        
        # PHASE 3: AI Qualitative Analysis (30 points)
        ai_score = await get_ai_quality_score(resume_text, job_description)
        
        # Calculate Final ATS Score
        final_score = round(keyword_score + completeness_score + ai_score, 1)
        
        # Cap at 100
        final_score = min(final_score, 100.0)
        
        # Generate recommendations
        recommendations = generate_recommendations(
            final_score,
            keyword_analysis,
            parsed_resume
        )
        
        return {
            "atsScore": final_score,
            "missingKeywords": keyword_analysis["missing_keywords"],
            "scoreBreakdown": {
                "keywordMatch": round(keyword_score, 1),
                "completeness": round(completeness_score, 1),
                "aiQuality": round(ai_score, 1),
                "keywordDetails": {
                    "matched": keyword_analysis["total_matched"],
                    "total": keyword_analysis["total_job_keywords"]
                }
            },
            "recommendations": recommendations
        }
        
    except Exception as e:
        print(f"ATS analysis error: {str(e)}")
        return {
            "atsScore": 0,
            "missingKeywords": [],
            "scoreBreakdown": {},
            "recommendations": ["Error calculating ATS score. Please try again."]
        }


async def get_ai_quality_score(resume_text: str, job_description: str) -> float:
    """
    Uses AI to assess qualitative factors like relevance and presentation.
    Returns a score out of 30 points.
    """
    
    prompt = f"""You are an ATS (Applicant Tracking System) analyzer. Evaluate how well this resume matches the job description.

**JOB DESCRIPTION:**
{job_description[:1000]}

**RESUME:**
{resume_text[:2000]}

**EVALUATION CRITERIA:**
1. Relevance of experience to the job requirements (0-10 points)
2. Quality of achievement descriptions and metrics (0-10 points)
3. Professional presentation and clarity (0-10 points)

**RESPOND WITH ONLY A JSON OBJECT:**
{{
  "relevance_score": <0-10>,
  "quality_score": <0-10>,
  "presentation_score": <0-10>,
  "total": <0-30>
}}
"""

    try:
        result = await chat_json([{"role": "user", "content": prompt}], temperature=0.1)
        return float(result.get("total", 15))  # Default to middle score
    except Exception as e:
        print(f"AI quality score error: {str(e)}")
        return 15.0  # Default fallback


def generate_recommendations(
    score: float, 
    keyword_analysis: Dict, 
    parsed_resume: Dict
) -> List[str]:
    """
    Generates actionable recommendations based on ATS score.
    """
    recommendations = []
    
    # Score-based recommendations
    if score < 60:
        recommendations.append("⚠️ Your ATS score is below 60%. Significant improvements needed.")
    elif score < 80:
        recommendations.append("✓ Good start! A few improvements can boost your score above 80%.")
    else:
        recommendations.append("✓ Excellent! Your resume is well-optimized for ATS.")
    
    # Keyword recommendations
    missing_count = len(keyword_analysis.get("missing_keywords", []))
    matched_count = keyword_analysis.get("total_matched", 0)
    
    if missing_count > 5:
        top_missing = keyword_analysis["missing_keywords"][:3]
        recommendations.append(
            f"📌 Add these high-priority keywords: {', '.join(top_missing)}"
        )
    
    if matched_count < 10:
        recommendations.append(
            "📌 Include more relevant keywords from the job description"
        )
    
    # Structure recommendations
    if parsed_resume:
        if not parsed_resume.get("summary"):
            recommendations.append("📝 Add a professional summary at the top")
        
        if len(parsed_resume.get("skills", [])) < 5:
            recommendations.append("🔧 List more technical skills relevant to the role")
        
        experience = parsed_resume.get("experience", [])
        if len(experience) < 2:
            recommendations.append("💼 Add more work experience entries if applicable")
        
        # Check for quantifiable achievements
        has_metrics = any(
            bool(re.search(r'\d+[%$]|\d+\+', exp.get("details", "")))
            for exp in experience
        )
        if not has_metrics:
            recommendations.append("📊 Add quantifiable achievements (numbers, percentages)")
    
    return recommendations[:5]  # Return top 5 recommendations

async def generate_bullet_points_async(

    text: str, 

    missing_keywords: List[str] = None,

    section_type: str = "experience"

) -> str:

    """

    ENHANCED: Generates perfectly formatted, context-aware bullet points.

    

    Features:

    - Adaptive bullet count based on section type

    - Quality validation (metrics, action verbs, length)

    - Strategic keyword integration

    - Professional formatting

    """

    

    # Get configuration for this section type

    config = SECTION_CONFIGS.get(section_type, SECTION_CONFIGS["experience"])

    

    # Build advanced prompt with section-specific instructions

    prompt = build_bullet_prompt(text, missing_keywords, config, section_type)

    

    try:

        # Generate bullets

        result = await chat_text(

            [{"role": "user", "content": prompt}], 

            temperature=0.35  # Balanced creativity

        )

        

        # Validate and format output

        validated_bullets = validate_and_format_bullets(

            result, 

            config,

            missing_keywords

        )

        

        # Quality check - if bullets are too weak, regenerate

        quality_score = assess_bullet_quality(validated_bullets, config)

        

        if quality_score < 0.6 and section_type == "experience":

            print(f"Bullet quality too low ({quality_score:.2f}), regenerating...")

            return await regenerate_with_emphasis(text, missing_keywords, config)

        

        return validated_bullets

        

    except Exception as e:

        print(f"Bullet generation error: {str(e)}")

        return generate_fallback_bullets(text, config)





def build_bullet_prompt(

    text: str,

    missing_keywords: List[str],

    config: Dict[str, Any],

    section_type: str

) -> str:

    """

    Builds an advanced, section-specific prompt for bullet generation.

    """

    

    # Keyword integration instructions

    keyword_instruction = ""

    if missing_keywords and len(missing_keywords) > 0:

        priority_keywords = missing_keywords[:5]

        quoted_keywords = ', '.join([f'"{kw}"' for kw in priority_keywords])
        keyword_instruction = f"""

**🎯 KEYWORD INTEGRATION (CRITICAL):**

Naturally incorporate AT LEAST 3 of these high-value keywords:

{quoted_keywords}



Rules:

- Use exact keyword matches where possible

- Integrate them contextually (don't force)

- Prioritize the first 3 keywords

"""



        # Section-specific instructions



        style_instructions = {



            "experience": f"""



    **ACHIEVEMENT FORMULA:** Use the X-Y-Z pattern:



    "Accomplished \[X\] by doing \[Y\], resulting in \[Z\]"



    



    **MUST INCLUDE:**



    - Strong action verb (Led, Architected, Implemented, Designed, Optimized)



    - Quantifiable impact (%, $, time saved, users affected)



    - Business value or technical achievement



    



    **EXAMPLES:**



    - Architected microservices platform handling 50K+ requests/sec, improving system reliability from 95% to 99.9%



    - Led team of 6 developers to deliver mobile app 3 weeks ahead of schedule, achieving 100K+ downloads in first month



    - Optimized database queries reducing average response time by 70% and cutting AWS costs by $45K annually



    """,



            "summary": f"""



    **SUMMARY STYLE:** Professional value proposition



    



    **STRUCTURE:**



    - Start with role + years of experience



    - Highlight 2-3 core specializations



    - Mention key achievements or unique value



    



    **EXAMPLES:**



    - Senior software engineer with 7+ years architecting scalable cloud solutions, specializing in distributed systems and real-time data processing



    - Full-stack developer expert in React and Node.js, with proven track record of delivering high-traffic applications serving 1M+ users



    """,



            "projects": f"""



    **PROJECT SHOWCASE:** Technical depth + business impact



    



    **MUST INCLUDE:**



    - Technologies/stack used



    - Scale or complexity indicators



    - Measurable outcomes



    



    **EXAMPLES:**



    - Built serverless e-commerce platform using AWS Lambda and DynamoDB, processing 10K+ daily transactions with 99.99% uptime



    - Developed ML-powered recommendation engine using TensorFlow, increasing user engagement by 35% and revenue by $2M



    """



        }



    prompt = f"""You are an elite resume writer creating ATS-optimized bullet points.



**SECTION TYPE:** {section_type.upper()}

**USER CONTEXT:** {text}



{keyword_instruction}



{style_instructions.get(section_type, style_instructions["experience"])}



**FORMATTING REQUIREMENTS:**

- Generate {config['min_bullets']}-{config['max_bullets']} bullet points

- Each bullet: {config['min_words_per_bullet']}-{config['max_words_per_bullet']} words

- Start each with a strong action verb (avoid weak verbs like "helped", "assisted", "worked on")

- Use past tense for previous roles, present tense for current roles

- Include numbers/metrics wherever possible



**OUTPUT FORMAT:**

Return ONLY the bullet points, each starting with a hyphen (-).

NO introductions, explanations, or extra text.



**EXAMPLE OUTPUT:**

{config['example']}



**YOUR RESPONSE (BULLETS ONLY):**"""



    return prompt





def validate_and_format_bullets(

    text: str,

    config: Dict[str, Any],

    missing_keywords: List[str] = None

) -> str:

    """

    ENHANCED: Validates bullet points for quality, format, and keyword usage.

    """

    

    # Clean the text

    text = text.strip()

    

    # Remove markdown code blocks if present

    text = re.sub(r'```[\w]*\n?', '', text)

    

    # Split into lines

    lines = [line.strip() for line in text.split('\n') if line.strip()]

    

    # Extract bullet points

    bullets = []

    for line in lines:

        # Remove bullet markers

        cleaned = re.sub(r'^[-•*]\s*', '', line)

        cleaned = re.sub(r'^\d+[\.)]\s*', '', cleaned)

        

        # Skip if too short or too long

        word_count = len(cleaned.split())

        if word_count < config['min_words_per_bullet'] - 5:

            continue

        if word_count > config['max_words_per_bullet'] + 10:

            # Truncate intelligently

            words = cleaned.split()

            cleaned = ' '.join(words[:config['max_words_per_bullet']]) + '...'

        

        # Check for action verb at start

        if not starts_with_strong_verb(cleaned):

            # Try to fix by adding a verb

            cleaned = f"Delivered {cleaned}"

        

        bullets.append(cleaned)

    

    # Ensure we have the right number of bullets

    if len(bullets) < config['min_bullets']:

        # Add generic fallback if needed

        while len(bullets) < config['min_bullets']:

            bullets.append("Contributed to team success through consistent delivery of high-quality results")

    

    if len(bullets) > config['max_bullets']:

        bullets = bullets[:config['max_bullets']]

    

    # Format with proper bullets and check capitalization

    formatted_bullets = []

    for bullet in bullets:

        # Ensure first letter is capitalized

        bullet = bullet[0].upper() + bullet[1:] if len(bullet) > 1 else bullet

        

        # Ensure it ends with proper punctuation (optional - ATS often prefers no periods)

        # bullet = bullet.rstrip('.') + '.'  # Uncomment if you want periods

        

        formatted_bullets.append(f"- {bullet}")

    

    result = '\n'.join(formatted_bullets)

    

    # Keyword usage check

    if missing_keywords:

        keyword_count = count_keyword_usage(result, missing_keywords[:5])

        print(f"✓ Keyword integration: {keyword_count}/5 keywords used")

    

    return result





def starts_with_strong_verb(text: str) -> bool:

    """

    Checks if text starts with a strong action verb.

    """

    strong_verbs = {

        'achieved', 'architected', 'automated', 'built', 'created', 'delivered',

        'deployed', 'designed', 'developed', 'drove', 'enabled', 'engineered',

        'enhanced', 'established', 'executed', 'generated', 'implemented',

        'improved', 'increased', 'launched', 'led', 'managed', 'optimized',

        'orchestrated', 'pioneered', 'reduced', 'resolved', 'scaled',

        'spearheaded', 'streamlined', 'transformed', 'accelerated', 'collaborated',

        'coordinated', 'directed', 'facilitated', 'mentored', 'supervised'

    }

    

    first_word = text.split()[0].lower() if text.split() else ""

    return first_word in strong_verbs





def assess_bullet_quality(bullets: str, config: Dict[str, Any]) -> float:

    """

    Assesses the quality of generated bullets.

    Returns a score from 0.0 to 1.0.

    """

    

    score = 0.0

    bullet_list = [b.replace('- ', '').strip() for b in bullets.split('\n') if b.strip()]

    

    if not bullet_list:

        return 0.0

    

    # Check 1: Do bullets start with strong verbs? (30%)

    strong_verb_count = sum(1 for b in bullet_list if starts_with_strong_verb(b))

    score += (strong_verb_count / len(bullet_list)) * 0.3

    

    # Check 2: Do bullets have quantifiable metrics? (40%)

    if config.get('requires_metrics', False):

        metric_pattern = r'\d+[%$KMB+]|\d+\+|\d+x|\d+ [a-z]+'

        metric_count = sum(1 for b in bullet_list if re.search(metric_pattern, b))

        score += (metric_count / len(bullet_list)) * 0.4

    else:

        score += 0.4  # Not required for this section

    

    # Check 3: Are bullets the right length? (30%)

    length_check = sum(

        1 for b in bullet_list 

        if config['min_words_per_bullet'] <= len(b.split()) <= config['max_words_per_bullet']

    )

    score += (length_check / len(bullet_list)) * 0.3

    

    return score





async def regenerate_with_emphasis(

    text: str,

    missing_keywords: List[str],

    config: Dict[str, Any]

) -> str:

    """

    Regenerates bullets with stronger emphasis on quality metrics.

    """

    

    prompt = f"""Generate {config['min_bullets']} EXCEPTIONAL resume bullets for: "{text}"



**MANDATORY REQUIREMENTS:**

1. MUST start with a strong action verb (Led, Architected, Delivered, etc.)

2. MUST include quantifiable metrics (numbers, %, $, time, scale)

3. MUST be {config['min_words_per_bullet']}-{config['max_words_per_bullet']} words each



**Keywords to incorporate:** {', '.join(missing_keywords[:3]) if missing_keywords else 'N/A'}



**Output format:** Each line starts with a hyphen (-). No other text.



GENERATE NOW:"""



    result = await chat_text([{"role": "user", "content": prompt}], temperature=0.3)

    return validate_and_format_bullets(result, config, missing_keywords)





def generate_fallback_bullets(text: str, config: Dict[str, Any]) -> str:

    """

    Generates basic fallback bullets if AI generation fails.

    """

    return f"""- Delivered results in {text}

- Collaborated effectively with cross-functional team
- Contributed to project success through consistent high-quality work"""

def count_keyword_usage(text: str, keywords: List[str]) -> int:

    """Counts how many keywords from the list appear in the text."""

    text_lower = text.lower()

    count = 0

    for keyword in keywords:

        if keyword.lower() in text_lower:

            count += 1

    return count


async def rewrite_text_async(
    text: str, 
    tone: str = "impactful",
    missing_keywords: List[str] = None
) -> str:
    """
    Rewrites text with improved tone and optional keyword integration.
    
    Args:
        text: Original text to rewrite
        tone: Desired tone (impactful, professional, technical)
        missing_keywords: Optional keywords to integrate
    
    Returns:
        Rewritten text
    """
    
    keyword_instruction = ""
    if missing_keywords and len(missing_keywords) > 0:
        top_keywords = missing_keywords[:3]
        keyword_instruction = f"""
**BONUS OBJECTIVE:** If contextually appropriate, try to naturally incorporate one or more of these keywords:
{', '.join(top_keywords)}
(Only add them if they fit naturally - do not force them)
"""
    
    prompt = f"""You are an expert resume editor. Rewrite the following text to make it more {tone}, professional, and impactful.

**ORIGINAL TEXT:**
{text}

{keyword_instruction}

**REWRITING GUIDELINES:**
1. Strengthen action verbs (avoid weak verbs like "helped", "worked on")
2. Add quantifiable metrics if the context allows (or keep existing ones)
3. Make it more concise - remove filler words
4. Use active voice, not passive voice
5. Maintain the core meaning and truth of the original text
6. Keep it to 2-4 lines maximum

**OUTPUT:**
Return ONLY the rewritten text. No explanations, no preambles.
If the text has multiple bullet points, maintain that structure.

**YOUR RESPONSE:**"""

    try:
        result = await chat_text(
            [{"role": "user", "content": prompt}], 
            temperature=0.4
        )
        
        # Clean up the result
        result = result.strip()
        
        # If the result is too long, truncate intelligently
        if len(result) > len(text) * 2:
            # Take first few sentences
            sentences = result.split('. ')
            result = '. '.join(sentences[:3])
            if not result.endswith('.'):
                result += '.'
        
        return result
        
    except Exception as e:
        print(f"Rewrite error: {str(e)}")
        return text  # Return original if rewrite fails