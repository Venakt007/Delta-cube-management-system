const axios = require('axios');
require('dotenv').config();

async function testOpenAI() {
  console.log('Testing OpenAI API...\n');

  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env file!');
    console.log('\nPlease add your OpenAI API key to .env:');
    console.log('OPENAI_API_KEY=sk-your-key-here\n');
    return;
  }

  console.log('✅ API Key found:', process.env.OPENAI_API_KEY.substring(0, 20) + '...\n');

  // Test API call
  try {
    console.log('Testing API call...');
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Say "API is working!" if you can read this.'
          }
        ],
        max_tokens: 50
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ API Response:', response.data.choices[0].message.content);
    console.log('\n✅ OpenAI API is working correctly!\n');
    
    // Check model access
    console.log('Checking GPT-4 access...');
    console.log('Model used:', response.data.model);
    
    if (response.data.model.includes('gpt-4')) {
      console.log('✅ You have GPT-4 access!\n');
    } else {
      console.log('⚠️  Response used different model. You might not have GPT-4 access.');
      console.log('Try using "gpt-3.5-turbo" instead in utils/resumeParser.js\n');
    }

  } catch (error) {
    console.error('❌ API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  Authentication Error:');
      console.log('- Your API key is invalid or expired');
      console.log('- Get a new key from: https://platform.openai.com/api-keys\n');
    } else if (error.response?.status === 429) {
      console.log('\n⚠️  Rate Limit or Quota Error:');
      console.log('- You may have exceeded your quota');
      console.log('- Check usage: https://platform.openai.com/account/usage');
      console.log('- Add credits: https://platform.openai.com/account/billing\n');
    } else if (error.response?.status === 404) {
      console.log('\n⚠️  Model Not Found:');
      console.log('- You may not have access to GPT-4');
      console.log('- Try using "gpt-3.5-turbo" instead\n');
    } else {
      console.log('\n⚠️  Unknown Error:');
      console.log('- Check your internet connection');
      console.log('- Verify API key is correct');
      console.log('- Check OpenAI status: https://status.openai.com/\n');
    }
  }
}

testOpenAI();
