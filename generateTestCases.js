const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Function to send JSON to OpenRouter API and receive the JavaScript file
async function generateTestCases(problemJson, slug) {
  const preprompt = `
  You are given a JSON object describing a LeetCode problem.Generate a JavaScript file that creates 1000 test cases for the problem.Each test case should be an object with an input (matching the problem’s input format) and the correct output (based on the problem’s solution).Store the test cases in an array called testCases.Ensure the inputs cover a wide range within the problem’s constraints.Log the testCases array in the format:
  [{input: ...,output:... },{input: ...,output:... },...] Don't Explain or write anything other than the Code in your response.
  `;

  const requestBody = {
    model: "openai/gpt-4o-mini", // change to the one you want
    messages: [
      {
        role: 'user',
        content: preprompt + JSON.stringify(problemJson, null, 2)
      }
    ],
    temperature: 0.7 // Adjust this as needed
  };

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use the API key from .env
        'Content-Type': 'application/json'
      }
    });

    // Check if the response contains choices
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const jsFileContent = response.data.choices[0].message.content;

      // Create a new directory with the title-slug name
      const directoryPath = path.join(__dirname, 'problems', slug);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      // Save the JavaScript file in the created directory
      const filePath = path.join(directoryPath, `${slug}.js`);
      fs.writeFileSync(filePath, jsFileContent);

      console.log(`JavaScript file saved successfully at: ${filePath}`);
    } else {
      // Log response for debugging if no choices are found
      console.error('No choices found in the response:', response.data);
    }
  } catch (error) {
    // Enhanced error handling and logging
    console.error('Error generating test cases:', error.response ? error.response.data : error.message);
  }
}

// Export the generateTestCases function for use in the CLI
module.exports = { generateTestCases };