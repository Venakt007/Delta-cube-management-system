const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const path = require('path');
const os = require('os');

// Dynamic skill keywords database
let skillKeywords = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue', 'Django',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
  'Docker', 'Kubernetes', 'Git', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby',
  'Go', 'Swift', 'Kotlin', 'HTML', 'CSS', 'REST', 'GraphQL', 'Jenkins',
  'Terraform', 'Ansible', 'Linux', 'Agile', 'Scrum', 'CI/CD', 'Express',
  'Spring', 'Flask', 'FastAPI', 'Laravel', 'Rails', 'ASP.NET', 'Pandas',
  'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'OpenCV',
  'Selenium', 'Jest', 'Mocha', 'Cypress', 'JUnit', 'Pytest', 'Postman'
];

// Load skills from database
async function loadSkillsFromDatabase() {
  try {
    const { pool } = require('../config/database');
    
    // Get all unique skills from applications table
    const result = await pool.query(`
      SELECT DISTINCT 
        TRIM(UNNEST(STRING_TO_ARRAY(primary_skill, ','))) as skill
      FROM applications
      WHERE primary_skill IS NOT NULL AND primary_skill != ''
      UNION
      SELECT DISTINCT 
        TRIM(UNNEST(STRING_TO_ARRAY(secondary_skill, ','))) as skill
      FROM applications
      WHERE secondary_skill IS NOT NULL AND secondary_skill != ''
    `);
    
    // Add database skills to keywords (avoid duplicates)
    result.rows.forEach(row => {
      const skill = row.skill.trim();
      if (skill && skill.length > 1 && !skillKeywords.some(k => k.toLowerCase() === skill.toLowerCase())) {
        skillKeywords.push(skill);
      }
    });
    
    console.log(`✅ Loaded ${result.rows.length} skills from database. Total keywords: ${skillKeywords.length}`);
  } catch (error) {
    console.log('⚠️  Could not load skills from database:', error.message);
  }
}

// Add new skill to keywords
function addSkillKeyword(skill) {
  const trimmed = skill.trim();
  if (trimmed && trimmed.length > 1 && !skillKeywords.some(k => k.toLowerCase() === trimmed.toLowerCase())) {
    skillKeywords.push(trimmed);
    console.log(`✅ Added new skill keyword: ${trimmed}`);
  }
}

// Extract skills using keyword matching
async function extractSkillsWithKeywords(text) {
  // Load latest skills from database (cache for 5 minutes)
  if (!extractSkillsWithKeywords.lastLoad || Date.now() - extractSkillsWithKeywords.lastLoad > 300000) {
    await loadSkillsFromDatabase();
    extractSkillsWithKeywords.lastLoad = Date.now();
  }
  
  const textLower = text.toLowerCase();
  const foundSkills = [];
  
  // Check each keyword
  skillKeywords.forEach(skill => {
    const skillLower = skill.toLowerCase();
    // Use word boundary for better matching
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textLower)) {
      foundSkills.push(skill);
    }
  });
  
  console.log(`   ✓ Found ${foundSkills.length} skills: ${foundSkills.slice(0, 5).join(', ')}${foundSkills.length > 5 ? '...' : ''}`);
  return foundSkills.slice(0, 20); // Limit to 20 skills
}

// Extract text from PDF (handles both local files and URLs)
async function extractTextFromPDF(filePath) {
  let dataBuffer;
  
  try {
    // Check if it's a URL
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log('📥 Downloading PDF from URL:', filePath);
      const response = await axios.get(filePath, { 
        responseType: 'arraybuffer',
        timeout: 30000,  // 30 second timeout
        maxContentLength: 10 * 1024 * 1024  // 10MB max
      });
      console.log(`✅ Downloaded ${response.data.byteLength} bytes`);
      dataBuffer = Buffer.from(response.data);
    } else {
      // Local file
      console.log('📂 Reading local file:', filePath);
      dataBuffer = fs.readFileSync(filePath);
      console.log(`✅ Read ${dataBuffer.length} bytes`);
    }
    
    console.log('📖 Parsing PDF...');
    const data = await pdf(dataBuffer);
    console.log(`✅ Extracted ${data.text.length} characters from PDF`);
    return data.text;
  } catch (error) {
    console.error('❌ PDF extraction error:', error.message);
    if (error.response) {
      console.error('   HTTP Status:', error.response.status);
      console.error('   HTTP Headers:', error.response.headers);
    }
    throw error;
  }
}

// Extract text from DOCX (handles both local files and URLs)
async function extractTextFromDOCX(filePath) {
  try {
    // Check if it's a URL
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log('📥 Downloading DOCX from URL:', filePath);
      const response = await axios.get(filePath, { 
        responseType: 'arraybuffer',
        timeout: 30000,
        maxContentLength: 10 * 1024 * 1024
      });
      console.log(`✅ Downloaded ${response.data.byteLength} bytes`);
      const buffer = Buffer.from(response.data);
      console.log('📖 Parsing DOCX...');
      const result = await mammoth.extractRawText({ buffer: buffer });
      console.log(`✅ Extracted ${result.value.length} characters from DOCX`);
      return result.value;
    } else {
      // Local file
      console.log('📂 Reading local file:', filePath);
      const result = await mammoth.extractRawText({ path: filePath });
      console.log(`✅ Extracted ${result.value.length} characters from DOCX`);
      return result.value;
    }
  } catch (error) {
    console.error('❌ DOCX extraction error:', error.message);
    if (error.response) {
      console.error('   HTTP Status:', error.response.status);
    }
    throw error;
  }
}

// Parse resume using OpenAI
async function parseResumeWithAI(text) {
  try {
    // Try GPT-3.5-turbo first (cheaper and more accessible)
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',  // Changed from gpt-4 to gpt-3.5-turbo
        messages: [
          {
            role: 'system',
            content: 'You are a resume parser. Extract structured information from resumes and return valid JSON only.'
          },
          {
            role: 'user',
            content: `Parse this resume and extract the following information in JSON format:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "location": "location/city",
  "skills": ["skill1", "skill2", ...],
  "experience_years": number,
  "education": ["degree1", "degree2", ...],
  "certifications": ["cert1", "cert2", ...],
  "availability": "immediate/notice period",
  "linkedin": "linkedin url if present",
  "summary": "brief professional summary"
}

Resume text:
${text}

Return ONLY the JSON object, no additional text.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    const content = response.data.choices[0].message.content.trim();
    // Remove markdown code blocks if present
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const parsed = JSON.parse(jsonStr);
    
    console.log('✅ Resume parsed successfully:', parsed.name);
    parsed.tier = 'tier3';
    parsed.confidence = 'high';
    return parsed;
  } catch (error) {
    console.error('❌ AI parsing error:', error.response?.data || error.message);
    
    // Log specific error details
    if (error.response?.status === 401) {
      console.error('⚠️  Invalid API key');
    } else if (error.response?.status === 429) {
      console.error('⚠️  Rate limit or quota exceeded');
    } else if (error.response?.status === 404) {
      console.error('⚠️  Model not found - check API access');
    }
    
    // Return basic parsing as fallback
    return parseResumeBasic(text);
  }
}

// Tier 1: Structured parsing (fast, rule-based, no AI)
function parseResumeStructured(text) {
  console.log('🔍 Tier 1: Attempting structured parsing...');
  
  // Define section keywords (case-insensitive)
  const sectionKeywords = {
    summary: ['summary', 'objective', 'profile', 'about'],
    skills: ['skills', 'technical skills', 'technologies', 'expertise', 'competencies'],
    experience: ['experience', 'work history', 'employment', 'work experience', 'professional experience'],
    education: ['education', 'academic', 'qualifications'],
    projects: ['projects', 'portfolio'],
    certifications: ['certifications', 'certificates', 'licenses']
  };

  // Build regex to find section headers
  const allKeywords = Object.values(sectionKeywords).flat();
  const sectionPattern = new RegExp(`^(${allKeywords.join('|')})\\s*:?\\s*$`, 'gmi');
  
  const matches = [];
  let match;
  while ((match = sectionPattern.exec(text)) !== null) {
    matches.push({ keyword: match[1].toLowerCase(), start: match.index, end: match.index + match[0].length });
  }

  // If less than 2 sections found, resume is too unstructured
  if (matches.length < 2) {
    console.log('⚠️  Tier 1: Not enough structure detected, falling back to Tier 2');
    return null;
  }

  console.log(`✅ Tier 1: Found ${matches.length} sections, parsing...`);

  // Extract sections
  const sections = {};
  for (let i = 0; i < matches.length; i++) {
    const sectionName = matches[i].keyword;
    const start = matches[i].end;
    const end = i + 1 < matches.length ? matches[i + 1].start : text.length;
    const content = text.substring(start, end).trim();
    
    // Map keyword to section category
    for (const [category, keywords] of Object.entries(sectionKeywords)) {
      if (keywords.includes(sectionName)) {
        sections[category] = content;
        break;
      }
    }
  }

  // Extract header (everything before first section)
  const headerText = text.substring(0, matches[0].start).trim();
  const headerLines = headerText.split('\n').filter(line => line.trim());

  // Parse header for contact info
  const parsed = {
    name: 'Unknown',
    email: '',
    phone: '',
    location: '',
    skills: [],
    experience_years: 0,
    education: [],
    certifications: [],
    availability: '',
    linkedin: '',
    summary: ''
  };

  // Extract name (usually first line)
  if (headerLines.length > 0) {
    const firstLine = headerLines[0].trim();
    if (firstLine.length < 60 && !firstLine.includes('@') && !firstLine.match(/\d{3}/)) {
      parsed.name = firstLine;
    }
  }

  // Extract email from header
  const emailMatch = headerText.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) parsed.email = emailMatch[0];

  // Extract phone from header
  const phoneMatch = headerText.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);
  if (phoneMatch) parsed.phone = phoneMatch[0].trim();

  // Extract LinkedIn from header
  const linkedinMatch = headerText.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) parsed.linkedin = 'https://' + linkedinMatch[0];

  // Extract location from header (common patterns)
  const locationMatch = headerText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)/);
  if (locationMatch) parsed.location = locationMatch[0];

  // Parse summary
  if (sections.summary) {
    parsed.summary = sections.summary.substring(0, 200);
  }

  // Parse skills
  if (sections.skills) {
    const skillLines = sections.skills.split('\n').filter(line => line.trim());
    const allSkills = [];
    
    skillLines.forEach(line => {
      // Split by common separators
      const skills = line.split(/[,;|•·]/).map(s => s.trim()).filter(s => s && s.length > 1 && s.length < 30);
      allSkills.push(...skills);
    });
    
    parsed.skills = allSkills.slice(0, 20); // Limit to 20 skills
  }

  // Parse experience years
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (expMatch) {
    parsed.experience_years = parseInt(expMatch[1]);
  } else if (sections.experience) {
    // Try to count years from experience section
    const yearMatches = sections.experience.match(/\d{4}/g);
    if (yearMatches && yearMatches.length >= 2) {
      const years = yearMatches.map(y => parseInt(y)).sort();
      const totalYears = years[years.length - 1] - years[0];
      if (totalYears > 0 && totalYears < 50) {
        parsed.experience_years = totalYears;
      }
    }
  }

  // Parse education
  if (sections.education) {
    const eduLines = sections.education.split('\n').filter(line => line.trim() && line.length > 5);
    parsed.education = eduLines.slice(0, 5);
  }

  // Parse certifications
  if (sections.certifications) {
    const certLines = sections.certifications.split('\n').filter(line => line.trim() && line.length > 3);
    parsed.certifications = certLines.slice(0, 10);
  }

  // Validate: Must have at least name and email
  if (parsed.name !== 'Unknown' && parsed.email) {
    console.log('✅ Tier 1: Successfully parsed:', parsed.name);
    parsed.tier = 'tier1';
    parsed.confidence = 'high';
    return parsed;
  }

  console.log('⚠️  Tier 1: Missing critical data, falling back to Tier 2');
  return null;
}

// Tier 2: Basic regex parsing (fallback, no AI)
function parseResumeBasic(text) {
  console.log('🔍 Tier 2: Using basic regex parsing (no AI)');
  
  const parsed = {
    name: 'Unknown',
    email: '',
    phone: '',
    location: '',
    skills: [],
    experience_years: 0,
    education: [],
    certifications: [],
    availability: '',
    linkedin: '',
    summary: ''
  };

  // Extract email - Simple and effective: find anything with @domain.com
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const emailMatches = text.match(emailPattern);
  
  if (emailMatches && emailMatches.length > 0) {
    // Take the first valid email
    for (const email of emailMatches) {
      const cleanEmail = email.toLowerCase().trim();
      // Basic validation: must have @ and at least one . after @
      if (cleanEmail.includes('@') && cleanEmail.split('@')[1].includes('.')) {
        parsed.email = cleanEmail;
        console.log(`   ✓ Found email: ${parsed.email}`);
        break;
      }
    }
  }
  
  // Fallback: Look for "Email:" or "E-mail:" label
  if (!parsed.email) {
    const emailLabelMatch = text.match(/(?:email|e-mail|mail)\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailLabelMatch) {
      parsed.email = emailLabelMatch[1].toLowerCase().trim();
      console.log(`   ✓ Found email with label: ${parsed.email}`);
    }
  }
  
  if (!parsed.email) {
    console.log('   ✗ No valid email found in text');
    console.log(`   Text sample: ${text.substring(0, 200)}...`);
  }

  // Extract phone - Multiple patterns for better detection
  // Pattern 1: +91 followed by 10 digits
  // Pattern 2: 10 consecutive digits
  // Pattern 3: Formatted numbers like (123) 456-7890 or 123-456-7890
  const phonePatterns = [
    /\+91[-\s]?[6-9]\d{9}/g,  // +91 followed by valid Indian mobile
    /[6-9]\d{9}/g,  // 10-digit Indian mobile (starts with 6-9)
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,  // Formatted: 123-456-7890
    /\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}/g  // Formatted: (123) 456-7890
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatches = text.match(pattern);
    if (phoneMatches && phoneMatches.length > 0) {
      for (const phone of phoneMatches) {
        const digits = phone.replace(/\D/g, ''); // Remove all non-digits
        // Must be exactly 10 digits (or 12 with +91)
        if (digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))) {
          parsed.phone = phone.trim();
          console.log(`   ✓ Found phone: ${parsed.phone} (${digits.length} digits)`);
          break;
        }
      }
      if (parsed.phone) break;
    }
  }
  
  // Fallback: Look for "Phone:" or "Mobile:" label
  if (!parsed.phone) {
    const phoneLabelMatch = text.match(/(?:phone|mobile|contact|cell|tel|telephone)\s*:?\s*([\d\s\-+()]{10,})/i);
    if (phoneLabelMatch) {
      const digits = phoneLabelMatch[1].replace(/\D/g, '');
      if (digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))) {
        parsed.phone = phoneLabelMatch[1].trim();
        console.log(`   ✓ Found phone with label: ${parsed.phone}`);
      }
    }
  }
  
  if (!parsed.phone) {
    console.log('   ✗ No valid 10-digit phone found in text');
    console.log(`   Text sample for phone: ${text.substring(0, 500).replace(/\n/g, ' ')}`);
  }

  // Extract name - more lenient but still sensible
  const lines = text.split('\n').filter(line => line.trim());
  for (const line of lines.slice(0, 15)) {  // Check first 15 lines
    const trimmed = line.trim();
    
    // Skip lines with email or phone
    if (trimmed.includes('@') || trimmed.match(/\d{10}/)) {
      continue;
    }
    
    // Name validation rules (more lenient):
    // 1. Length: 3-60 characters
    // 2. Should be 1-5 words (increased from 4)
    // 3. Mostly letters (allow some special chars like . or ')
    
    if (trimmed.length >= 3 && trimmed.length <= 60) {
      const words = trimmed.split(/\s+/);
      
      // Name should be 1-5 words
      if (words.length >= 1 && words.length <= 5) {
        // Each word should be mostly letters
        const validWords = words.filter(word => {
          // Allow letters, dots, apostrophes
          return word.length >= 2 && /^[A-Za-z][A-Za-z.']*$/.test(word);
        });
        
        // At least 50% of words should be valid
        if (validWords.length >= Math.ceil(words.length * 0.5) && validWords.length >= 1) {
          // Prefer lines where first word starts with capital
          if (/^[A-Z]/.test(trimmed)) {
            parsed.name = trimmed;
            console.log(`   ✓ Found name: ${parsed.name}`);
            break;
          } else if (parsed.name === 'Unknown') {
            // Store as backup if no better option
            parsed.name = trimmed;
          }
        }
      }
    }
  }
  
  // If still no name, try to extract from email
  if (parsed.name === 'Unknown' && parsed.email) {
    const emailName = parsed.email.split('@')[0];
    const cleanName = emailName.replace(/[._-]/g, ' ').replace(/\d+/g, '').trim();
    if (cleanName.length > 0) {
      // Capitalize first letter of each word
      parsed.name = cleanName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      console.log(`   ✓ Extracted name from email: ${parsed.name}`);
    }
  }
  
  if (parsed.name === 'Unknown') {
    console.log('   ✗ No valid name found');
    console.log(`   First 5 lines: ${lines.slice(0, 5).join(' | ')}`);
  }

  // Extract skills using dynamic keyword system
  const skills = await extractSkillsWithKeywords(text);
  parsed.skills = skills;

  // Extract experience years
  const expMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  if (expMatch) {
    parsed.experience_years = parseInt(expMatch[1]);
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) parsed.linkedin = 'https://' + linkedinMatch[0];

  // Extract location (city, state/country pattern)
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s*([A-Z]{2}|[A-Z][a-z]+)/);
  if (locationMatch) parsed.location = locationMatch[0];

  console.log('✅ Tier 2: Basic parsing complete:', parsed.name);
  parsed.tier = 'tier2';
  parsed.confidence = 'medium';
  return parsed;
}

// Main resume parser function with comprehensive multi-level fallback
async function parseResume(filePath) {
  try {
    console.log('\n📄 Parsing resume:', filePath);
    
    let text = '';
    const ext = filePath.toLowerCase();

    // Step 1: Extract text from file
    if (ext.endsWith('.pdf')) {
      console.log('📖 Extracting text from PDF...');
      text = await extractTextFromPDF(filePath);
    } else if (ext.endsWith('.docx') || ext.endsWith('.doc')) {
      console.log('📖 Extracting text from DOCX...');
      text = await extractTextFromDOCX(filePath);
    } else {
      throw new Error('Unsupported file format');
    }

    if (!text || text.trim().length < 50) {
      console.error('❌ Extracted text too short or empty');
      return null;
    }

    console.log(`✅ Extracted ${text.length} characters`);

    // Initialize result with empty values
    let result = {
      name: '',
      email: '',
      phone: '',
      location: '',
      skills: [],
      experience_years: 0,
      education: [],
      certifications: [],
      availability: '',
      linkedin: '',
      summary: '',
      tier: 'multi-level',
      confidence: 'low'
    };

    // LEVEL 1: Try AI parsing first (if available)
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      console.log('🤖 LEVEL 1: Trying AI parsing...');
      try {
        const aiResult = await parseResumeWithAI(text);
        if (aiResult) {
          result = { ...result, ...aiResult };
          console.log('✅ AI parsing completed');
        }
      } catch (error) {
        console.log('⚠️  AI parsing failed, continuing with fallbacks');
      }
    }

    // LEVEL 2: Try structured parsing
    console.log('🔍 LEVEL 2: Trying structured parsing...');
    const structuredResult = parseResumeStructured(text);
    if (structuredResult) {
      // Merge results, keeping AI data if better
      if (!result.name && structuredResult.name !== 'Unknown') result.name = structuredResult.name;
      if (!result.email && structuredResult.email) result.email = structuredResult.email;
      if (!result.phone && structuredResult.phone) result.phone = structuredResult.phone;
      if (structuredResult.skills.length > result.skills.length) result.skills = structuredResult.skills;
      if (structuredResult.experience_years > 0) result.experience_years = structuredResult.experience_years;
    }

    // LEVEL 3: Try basic regex parsing
    console.log('🔍 LEVEL 3: Trying basic regex parsing...');
    const basicResult = parseResumeBasic(text);
    if (basicResult) {
      if (!result.name && basicResult.name !== 'Unknown') result.name = basicResult.name;
      if (!result.email && basicResult.email) result.email = basicResult.email;
      if (!result.phone && basicResult.phone) result.phone = basicResult.phone;
      if (basicResult.skills.length > result.skills.length) result.skills = basicResult.skills;
      if (!result.experience_years && basicResult.experience_years > 0) result.experience_years = basicResult.experience_years;
    }

    // LEVEL 4: Label-based extraction (look for "Name:", "Email:", etc.)
    console.log('🔍 LEVEL 4: Label-based extraction...');
    if (!result.name) {
      const nameMatch = text.match(/(?:name|candidate)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i);
      if (nameMatch) {
        result.name = nameMatch[1].trim();
        console.log(`   ✓ Found name with label: ${result.name}`);
      }
    }
    
    if (!result.email) {
      const emailMatch = text.match(/(?:email|e-mail|mail)\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      if (emailMatch) {
        result.email = emailMatch[1].toLowerCase().trim();
        console.log(`   ✓ Found email with label: ${result.email}`);
      }
    }
    
    if (!result.phone) {
      const phoneMatch = text.match(/(?:phone|mobile|contact|cell)\s*:?\s*([\d\s\-+()]{10,})/i);
      if (phoneMatch) {
        const digits = phoneMatch[1].replace(/\D/g, '');
        if (digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))) {
          result.phone = phoneMatch[1].trim();
          console.log(`   ✓ Found phone with label: ${result.phone}`);
        }
      }
    }

    // FINAL FALLBACK: Use filename ONLY as last resort
    if (!result.name || result.name === 'Unknown') {
      // Extract from first few lines of text
      const lines = text.split('\n').filter(l => l.trim()).slice(0, 10);
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip lines with @ or numbers
        if (trimmed.includes('@') || /\d{5,}/.test(trimmed)) continue;
        // Check if it looks like a name (2-4 words, mostly letters)
        const words = trimmed.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          const validWords = words.filter(w => /^[A-Z][a-z]+$/.test(w));
          if (validWords.length >= 2) {
            result.name = trimmed;
            console.log(`   ✓ Found name in first lines: ${result.name}`);
            break;
          }
        }
      }
    }
    
    // Absolute last resort: use filename
    if (!result.name) {
      const filename = filePath.split('/').pop().split('\\').pop();
      result.name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
      console.log(`   ⚠️  Using filename as name: ${result.name}`);
    }

    // Set confidence based on what we found
    const hasEmail = result.email && !result.email.includes('placeholder');
    const hasPhone = result.phone && result.phone !== '0000000000';
    const hasName = result.name && !result.name.includes('resume');
    
    if (hasEmail && hasPhone && hasName) {
      result.confidence = 'high';
    } else if ((hasEmail || hasPhone) && hasName) {
      result.confidence = 'medium';
    } else {
      result.confidence = 'low';
    }

    console.log('✅ Final result:', {
      name: result.name,
      email: result.email || 'NOT FOUND',
      phone: result.phone || 'NOT FOUND',
      skills: result.skills.length,
      confidence: result.confidence
    });

    return result;

  } catch (error) {
    console.error('❌ Resume parsing error:', error.message);
    return null;
  }
}

module.exports = { parseResume, addSkillKeyword };
