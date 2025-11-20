const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    resume: ['.pdf', '.doc', '.docx'],
    resumes: ['.pdf', '.doc', '.docx'], // For bulk upload
    id_proof: ['.pdf', '.jpg', '.jpeg', '.png']
  };

  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if fieldname is resume or resumes (bulk upload)
  if ((file.fieldname === 'resume' || file.fieldname === 'resumes') && allowedTypes.resume.includes(ext)) {
    cb(null, true);
  } else if (file.fieldname === 'id_proof' && allowedTypes.id_proof.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${JSON.stringify(allowedTypes[file.fieldname] || 'unknown field')}`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
