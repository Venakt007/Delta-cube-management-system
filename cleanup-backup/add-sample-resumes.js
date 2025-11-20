const pool = require('./config/db');

async function addSampleResumes() {
  console.log('📝 Adding sample resumes for testing...\n');
  
  const sampleResumes = [
    {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '555-0101',
      linkedin: 'https://linkedin.com/in/johnsmith',
      technology: 'Full Stack',
      primary_skill: 'React',
      secondary_skill: 'Node.js',
      location: 'New York',
      experience_years: 6,
      parsed_data: {
        skills: ['React', 'JavaScript', 'Node.js', 'TypeScript', 'MongoDB', 'REST', 'Git', 'AWS'],
        experience_years: 6,
        education: ['BS Computer Science']
      }
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '555-0102',
      linkedin: 'https://linkedin.com/in/sarahj',
      technology: 'Frontend',
      primary_skill: 'React',
      secondary_skill: 'Redux',
      location: 'Remote',
      experience_years: 5,
      parsed_data: {
        skills: ['React', 'Redux', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'GraphQL', 'Jest'],
        experience_years: 5,
        education: ['BS Software Engineering']
      }
    },
    {
      name: 'Mike Chen',
      email: 'mike.chen@example.com',
      phone: '555-0103',
      linkedin: 'https://linkedin.com/in/mikechen',
      technology: 'Backend',
      primary_skill: 'Node.js',
      secondary_skill: 'Python',
      location: 'San Francisco',
      experience_years: 8,
      parsed_data: {
        skills: ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'REST', 'GraphQL'],
        experience_years: 8,
        education: ['MS Computer Science']
      }
    },
    {
      name: 'Emily Davis',
      email: 'emily.d@example.com',
      phone: '555-0104',
      linkedin: 'https://linkedin.com/in/emilyd',
      technology: 'Full Stack',
      primary_skill: 'JavaScript',
      secondary_skill: 'React',
      location: 'Austin',
      experience_years: 4,
      parsed_data: {
        skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'HTML', 'CSS', 'Git'],
        experience_years: 4,
        education: ['BS Information Technology']
      }
    },
    {
      name: 'David Wilson',
      email: 'david.w@example.com',
      phone: '555-0105',
      linkedin: 'https://linkedin.com/in/davidw',
      technology: 'DevOps',
      primary_skill: 'AWS',
      secondary_skill: 'Docker',
      location: 'Seattle',
      experience_years: 7,
      parsed_data: {
        skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Python', 'Bash', 'CI/CD', 'Git'],
        experience_years: 7,
        education: ['BS Computer Engineering']
      }
    }
  ];
  
  try {
    // Get admin user ID
    const adminResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['admin']);
    const uploaderId = adminResult.rows[0]?.id || 1;
    
    for (const resume of sampleResumes) {
      // Check if already exists
      const existing = await pool.query('SELECT id FROM applications WHERE email = $1', [resume.email]);
      
      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipped: ${resume.name} (already exists)`);
        continue;
      }
      
      await pool.query(
        `INSERT INTO applications 
        (name, email, phone, linkedin, technology, primary_skill, secondary_skill, location, 
         experience_years, source, uploaded_by, parsed_data)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          resume.name,
          resume.email,
          resume.phone,
          resume.linkedin,
          resume.technology,
          resume.primary_skill,
          resume.secondary_skill,
          resume.location,
          resume.experience_years,
          'dashboard',
          uploaderId,
          JSON.stringify(resume.parsed_data)
        ]
      );
      
      console.log(`✅ Added: ${resume.name} (${resume.primary_skill}, ${resume.experience_years} years)`);
    }
    
    console.log('\n✅ Sample resumes added successfully!\n');
    
    // Show all resumes
    const allResumes = await pool.query('SELECT name, email, primary_skill, experience_years FROM applications ORDER BY id');
    console.log('📊 All resumes in database:');
    console.table(allResumes.rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addSampleResumes();
