/**
 * Script to make all existing Cloudinary files public
 * Run this once in Render shell to fix 401 errors on old uploads
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function makeFilesPublic() {
  try {
    console.log('🔍 Fetching all files from recruitment-uploads folder...');
    
    // Get all raw files (PDFs, DOCX)
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'recruitment-uploads',
      max_results: 500
    });
    
    console.log(`📦 Found ${result.resources.length} files`);
    
    let updated = 0;
    let failed = 0;
    
    for (const resource of result.resources) {
      try {
        console.log(`🔄 Updating: ${resource.public_id}`);
        
        // Update access mode to public
        await cloudinary.uploader.explicit(resource.public_id, {
          type: 'upload',
          resource_type: 'raw',
          access_mode: 'public'
        });
        
        updated++;
        console.log(`✅ Updated: ${resource.public_id}`);
      } catch (error) {
        failed++;
        console.error(`❌ Failed to update ${resource.public_id}:`, error.message);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Total files: ${result.resources.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log('\n✅ Done! All files should now be publicly accessible.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the script
makeFilesPublic();
