const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Validate Cloudinary credentials
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Cloudinary credentials are missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
}

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary configured successfully');
} catch (error) {
  console.error('❌ Cloudinary configuration failed:', error.message);
  throw error;
}

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on field name
    let folder = 'recruitment-uploads';
    
    if (file.fieldname === 'resume' || file.fieldname === 'resumes') {
      folder = 'recruitment-uploads/resumes';
    } else if (file.fieldname === 'id_proof') {
      folder = 'recruitment-uploads/id-proofs';
    } else if (file.fieldname === 'edited_resume') {
      folder = 'recruitment-uploads/edited-resumes';
    }
    
    // Determine resource type based on file extension
    const ext = require('path').extname(file.originalname).toLowerCase();
    const isDocument = ['.pdf', '.doc', '.docx'].includes(ext);
    const resourceType = isDocument ? 'raw' : 'image';
    
    const params = {
      folder: folder,
      resource_type: resourceType,
      public_id: `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      use_filename: false
    };
    
    // Only add allowed_formats for images (not for raw files)
    if (!isDocument) {
      params.allowed_formats = ['jpg', 'jpeg', 'png'];
    }
    
    return params;
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      resume: ['.pdf', '.doc', '.docx'],
      resumes: ['.pdf', '.doc', '.docx'],
      edited_resume: ['.pdf', '.doc', '.docx'],
      id_proof: ['.pdf', '.jpg', '.jpeg', '.png']
    };

    const ext = require('path').extname(file.originalname).toLowerCase();
    const fieldAllowedTypes = allowedTypes[file.fieldname] || [];
    
    if (fieldAllowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}. Allowed: ${fieldAllowedTypes.join(', ')}`));
    }
  }
});

module.exports = upload;
