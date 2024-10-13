const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env

// const { getLeetCodeProblemDetails } = require('./scrapeLeetcode'); // Import from scrapeLeetcode.js

// Function to send JSON to OpenRouter API and receive the JavaScript file
async function generateTestCases(problemJson, slug) {
  const preprompt = `
  You will be provided with a JSON object containing the details of a LeetCode problem. Your task is to generate a JavaScript file that creates an array of 1000 test cases based on the problem's description and constraints. Each test case should be formatted as a tuple (input, output) and stored in an array. The input should match the problem's input type, and the output should be the correct solution for that input according to the problem statement.
  Here are the requirements for the JavaScript file:
  1. Create an array called testCases that stores 1000 test cases.
  2. Each test case should be an object with two properties: input and output.
  3. The input should be based on the problem's description, and the output should represent the correct solution for that specific input.
  4. Ensure that you generate a wide variety of inputs, respecting the problem's constraints.
  5. The final output of the script should log the testCases array in a format like:
     [
       { input: ..., output: ... },
       { input: ..., output: ... },
       ...
     ]
  Use the following JSON object as the problem description:
  `;

  const requestBody = {
    "prompt": preprompt + JSON.stringify(problemJson, null, 2),
    "model": "claude-sonnet-3.5",
    "temperature": 0.7, // Adjust as needed
  };

  try {
    const response = await axios.post('https://api.openrouter.com/v1/completion', requestBody, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use the API key from .env
        'Content-Type': 'application/json'
      }
    });

    const jsFileContent = response.data.choices[0].text;

    // Create a new directory with the title-slug name
    const directoryPath = path.join(__dirname, 'algo-cli/problems', slug);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Save the JavaScript file in the created directory
    const filePath = path.join(directoryPath, 'generateTestCases.js');
    fs.writeFileSync(filePath, jsFileContent);

    console.log(`JavaScript file saved successfully at: ${filePath}`);
  } catch (error) {
    console.error('Error generating test cases:', error);
  }
}

module.exports = { generateTestCases };

// // Function to combine scraping and generating test cases
// async function processLeetCodeProblem(url) {
//   // Fetch LeetCode problem details
//   const problemData = await getLeetCodeProblemDetails(url);
  
//   if (problemData) {
//     const slug = problemData.title.toLowerCase().replace(/\s+/g, '-');
//     await generateTestCases(problemData, slug);
//   } else {
//     console.log('Failed to fetch LeetCode problem data');
//   }
// }

// // Example usage
// processLeetCodeProblem('https://leetcode.com/problems/house-robber/');