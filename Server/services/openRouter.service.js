const axios = require('axios');

const askAi = async (messages) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid input: messages should be a non-empty array.');
    }

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('Missing OPENROUTER_API_KEY in environment.');
    }

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-4o-mini',
        messages
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 seconds timeout
      }
    );

    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim()) {
      throw new Error('No content received from OpenRouter API.');
    }

    return content;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Error in askAi: Request timed out after 30 seconds');
      throw new Error('AI service request timed out. Please try again later.');
    }
    if (error.response) {
      console.error('Error in askAi:', error.response.status, error.response.data);
      throw new Error(`AI service error: ${error.response.status}. Please try again later.`);
    }
    console.error('Error in askAi:', error.message);
    throw new Error('Failed to get response from OpenRouter API. Please try again later.');
  }
};

module.exports = { askAi };
