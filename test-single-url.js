/**
 * Test if a specific Cloudinary URL is accessible
 * Usage: node test-single-url.js <cloudinary-url>
 */

const axios = require('axios');

async function testUrl(url) {
  if (!url) {
    console.log('❌ Please provide a URL');
    console.log('Usage: node test-single-url.js <cloudinary-url>');
    process.exit(1);
  }
  
  console.log('🔍 Testing URL access...');
  console.log(`URL: ${url}\n`);
  
  try {
    // Try HEAD request first (faster)
    console.log('1️⃣ Testing with HEAD request...');
    const headResponse = await axios.head(url, { timeout: 10000 });
    console.log(`   Status: ${headResponse.status}`);
    console.log(`   Content-Type: ${headResponse.headers['content-type']}`);
    console.log(`   Content-Length: ${headResponse.headers['content-length']} bytes`);
    console.log(`   ✅ URL is accessible!\n`);
    
    // Try GET request to download
    console.log('2️⃣ Testing with GET request (download)...');
    const getResponse = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 30000 
    });
    console.log(`   Status: ${getResponse.status}`);
    console.log(`   Downloaded: ${getResponse.data.byteLength} bytes`);
    console.log(`   ✅ File can be downloaded!\n`);
    
    console.log('✅ SUCCESS! This URL is working correctly.');
    console.log('   The parser should be able to download and parse this file.');
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    
    if (error.response) {
      console.log(`   HTTP Status: ${error.response.status}`);
      console.log(`   Headers:`, error.response.headers);
      
      if (error.response.status === 401) {
        console.log('\n⚠️  Got 401 Unauthorized error!');
        console.log('   This means the file is PRIVATE and not accessible without authentication.');
        console.log('\n💡 Solutions:');
        console.log('   1. Run: node fix-cloudinary-access.js');
        console.log('   2. Wait 5-10 minutes for CDN propagation');
        console.log('   3. Run: node verify-cloudinary-access.js');
        console.log('   4. Check Cloudinary dashboard → Media Library → Access Control');
      } else if (error.response.status === 404) {
        console.log('\n⚠️  Got 404 Not Found error!');
        console.log('   This file does not exist in Cloudinary.');
      }
    } else {
      console.log('   Network error or timeout');
    }
  }
}

// Get URL from command line argument
const url = process.argv[2];
testUrl(url);
