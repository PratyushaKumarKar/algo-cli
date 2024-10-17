const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); 


async function generateTestCases(problemJson, slug) {
  const preprompt = `
  Given a JSON object describing a LeetCode problem, generate a JavaScript file that creates test cases for the problem. The code should generate no more than 1000 test cases, with the actual number being the minimum of 1000 and the maximum number of unique test cases possible given the problem constraints. Ensure the total size of the generated JSON is less than 1MB. Prioritize test case variety over quantity, covering edge cases and a wide range of inputs within the problem's constraints. Each test case should be an object with 'input' and 'output' properties. Store the test cases in an array called testCases and return it as a JSON string in the format: [{"input": ..., "output": ...}, ...]. Implement functions to generate inputs based on the problem's constraints and calculate the correct output for each input. Include logic to stop generating test cases if either the 1000 case limit or the 1MB size limit is reached. The response should contain only the JavaScript code, without any explanations, comments, or backticks. The code will be directly placed in a .js file, so ensure it follows these guidelines and produces a manageable set of diverse test cases within the specified limits.`;

  const requestBody = {
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: 'user',
        content: preprompt + JSON.stringify(problemJson, null, 2)
      }
    ],
    temperature: 0.6 
  };

  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, 
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const jsFileContent = response.data.choices[0].message.content;

      const directoryPath = path.join(__dirname, 'problems', slug);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const filePath = path.join(directoryPath, `${slug}.js`);
      fs.writeFileSync(filePath, jsFileContent);

      // console.log(`JavaScript file saved successfully at: ${filePath}`);
    } else {
      console.error('No choices found in the response:', response.data);
    }
  } catch (error) {
    console.error('Error generating test cases:', error.response ? error.response.data : error.message);
  }
}


module.exports = { generateTestCases };