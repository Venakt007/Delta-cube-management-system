/**
 * Script to verify Cloudinary file access and fix ACL issues
 * Run this in Render shell to check if files are truly public
 */

require('dotenv').config();
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function verifyAndFixAccess() {
  try {
    console.log('🔍 Fetching files from Cloudinary...\n');
    
    // Get all raw files
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: 'recruitment-uploads/resumes',
      max_results: 10  // Test with first 10 files
    });
    
    console.log(`📦 Testing ${result.resources.length} files\n`);
    
    let publicCount = 0;
    let privateCount = 0;
    let errorCount = 0;
    
    for (const resource of result.resources) {
      const url = resource.secure_url;
      const publicId = resource.public_id;
      const accessMode = resource.access_mode || 'unknown';
      
      console.log(`\n📄 File: ${publicId}`);
      console.log(`   Access Mode: ${accessMode}`);
      console.log(`   URL: ${url}`);
      
      // Try to download without authentication
      try {
        const response = await axios.head(url, { timeout: 5000 });
        
        if (response.status === 200) {
          console.log(`   ✅ PUBLIC - Can download without auth`);
          publicCount++;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`   ❌ PRIVATE - Got 401 error`);
          console.log(`   🔧 Attempting to fix...`);
          
          try {
            // Try to update access mode
            await cloudinary.uploader.explicit(publicId, {
              type: 'upload',
              resource_type: 'raw',
              access_mode: 'public',
              invalidate: true  // Clear CDN cache
            });
            
            console.log(`   ✅ Fixed! Set to public and cleared cache`);
            
            // Wait a moment for propagation
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Test again
            const retryResponse = await axios.head(url, { timeout: 5000 });
            if (retryResponse.status === 200) {
              console.log(`   ✅ Verified - Now accessible!`);
              publicCount++;
            } else {
              console.log(`   ⚠️  Still having issues`);
              privateCount++;
            }
          } catch (fixError) {
            console.log(`   ❌ Failed to fix: ${fixError.message}`);
            errorCount++;
          }
        } else {
          console.log(`   ⚠️  Error: ${error.message}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n\n📊 Summary:');
    console.log(`   ✅ Public & Accessible: ${publicCount}`);
    console.log(`   ❌ Still Private: ${privateCount}`);
    console.log(`   ⚠️  Errors: ${errorCount}`);
    console.log(`   📦 Total Tested: ${result.resources.length}`);
    
    if (privateCount > 0 || errorCount > 0) {
      console.log('\n⚠️  Some files are still not accessible!');
      console.log('\n💡 Try these solutions:');
      console.log('   1. Wait 5-10 minutes for Cloudinary CDN to propagate changes');
      console.log('   2. Run this script again: node verify-cloudinary-access.js');
      console.log('   3. Check Cloudinary dashboard → Media Library → Select files → Manage → Access Control');
      console.log('   4. Make sure upload preset has "Access mode: Public" setting');
    } else {
      console.log('\n✅ All files are publicly accessible!');
      console.log('   You can now test parsing: node test-render-parsing.js');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the script
verifyAndFixAccess();
