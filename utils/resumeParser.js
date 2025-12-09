const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const axios = require('axios');
const path = require('path');
const os = require('os');

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

  // Extract email - multiple patterns for better detection
  const emailPatterns = [
    /\b[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}\b/g,  // Standard
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // More lenient
    /[\w\.-]+@[\w\.-]+\.\w{2,}/g  // Very lenient
  ];
  
  for (const pattern of emailPatterns) {
    const emailMatches = text.match(pattern);
    if (emailMatches && emailMatches.length > 0) {
      // Validate email format
      for (const email of emailMatches) {
        // Must have @ and . in correct positions
        if (email.includes('@') && email.includes('.')) {
          const parts = email.split('@');
          if (parts.length === 2 && parts[0].length > 0 && parts[1].includes('.')) {
            const domain = parts[1].split('.');
            // Domain must have at least 2 parts and TLD must be 2+ chars
            if (domain.length >= 2 && domain[domain.length - 1].length >= 2) {
              parsed.email = email.toLowerCase();
              console.log(`   ✓ Found email: ${parsed.email}`);
              break;
            }
          }
        }
      }
      if (parsed.email) break;
    }
  }
  
  if (!parsed.email) {
    console.log('   ✗ No valid email found in text');
    console.log(`   Text sample: ${text.substring(0, 200)}...`);
  }

  // Extract phone - multiple patterns for better detection
  const phonePatterns = [
    /\+91[-\s]?[6-9]\d{9}\b/g,  // Indian mobile with +91
    /\b[6-9]\d{9}\b/g,  // Indian mobile without country code (exactly 10 digits)
    /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,  // US format
    /\b\d{10}\b/g,  // Any 10 digits
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g  // International format
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatches = text.match(pattern);
    if (phoneMatches && phoneMatches.length > 0) {
      for (const phone of phoneMatches) {
        const trimmed = phone.trim();
        // Extract only digits to validate length
        const digits = trimmed.replace(/\D/g, '');
        // Must be 10 digits (or 12 with country code)
        if (digits.length === 10 || (digits.length === 12 && digits.startsWith('91'))) {
          parsed.phone = trimmed;
          console.log(`   ✓ Found phone: ${parsed.phone} (${digits.length} digits)`);
          break;
        }
      }
      if (parsed.phone) break;
    }
  }
  
  if (!parsed.phone) {
    console.log('   ✗ No valid 10-digit phone found in text');
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

  // Extract skills (common tech keywords)
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue', 'Django',
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP',
    'Docker', 'Kubernetes', 'Git', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby',
    'Go', 'Swift', 'Kotlin', 'HTML', 'CSS', 'REST', 'GraphQL', 'Jenkins',
    'Terraform', 'Ansible', 'Linux', 'Agile', 'Scrum', 'CI/CD'
  ];
  
  const textLower = text.toLowerCase();
  commonSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      parsed.skills.push(skill);
    }
  });

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

// Main resume parser function with tiered approach
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

    // Step 2: Try Tier 1 - Structured parsing (fast, no AI)
    const tier1Result = parseResumeStructured(text);
    if (tier1Result) {
      console.log('✅ Tier 1 parsing successful!');
      return tier1Result;
    }

    // Step 3: Try Tier 2 - Basic regex parsing (no AI)
    console.log('🔍 Tier 1 failed, trying Tier 2...');
    const tier2Result = parseResumeBasic(text);
    
    // If Tier 2 got good data, return it
    if (tier2Result && tier2Result.name !== 'Unknown' && tier2Result.email) {
      console.log('✅ Tier 2 parsing successful!');
      return tier2Result;
    }

    // Step 4: Try Tier 3 - AI parsing (slow, costs money)
    console.log('🔍 Tier 2 insufficient, trying Tier 3 (AI)...');
    const tier3Result = await parseResumeWithAI(text);
    
    if (tier3Result) {
      console.log('✅ Tier 3 (AI) parsing successful!');
      return tier3Result;
    }

    // Step 5: Return best effort from Tier 2
    console.log('⚠️  All tiers attempted, returning Tier 2 result');
    return tier2Result;

  } catch (error) {
    console.error('❌ Resume parsing error:', error.message);
    return null;
  }
}

module.exports = { parseResume };
