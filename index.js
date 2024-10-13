const fs = require('fs');
const inquirer = require('inquirer');
require('dotenv').config(); // Load environment variables
const { getLeetCodeProblemDetails } = require('./scrapeLeetcode');
const { generateTestCases } = require('./generateTestCases');
const path = require('path');

// Function to check if .env exists and contains the API key
function checkOrCreateEnv() {
  const envPath = path.join(__dirname, '.env');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    // Create a new .env file if it doesn't exist
    fs.writeFileSync(envPath, '');
  }

  // Load the .env file and check if the API key is already stored
  require('dotenv').config();

  if (!process.env.OPENROUTER_API_KEY) {
    return false; // API key not found in .env
  }

  return true; // API key exists
}

// Function to update the .env file with the API key
function storeAPIKeyInEnv(apiKey) {
  const envPath = path.join(__dirname, '.env');
  const envContent = `OPENROUTER_API_KEY=${apiKey}\n`;
  fs.appendFileSync(envPath, envContent);
  console.log('API key has been saved in .env file.');
}

// Main CLI logic
async function main() {
  // Check if the API key exists in .env, if not, ask the user to input it
  const apiKeyExists = checkOrCreateEnv();

  if (!apiKeyExists) {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your OPENROUTER_API_KEY:',
        validate: (input) => input.trim() !== '' || 'API key cannot be empty!',
      },
    ]);

    storeAPIKeyInEnv(apiKey);

    // Reload the environment variables after updating .env
    require('dotenv').config();
  }

  // Now ask the user for the LeetCode problem URL
  const { leetCodeUrl } = await inquirer.prompt([
    {
      type: 'input',
      name: 'leetCodeUrl',
      message: 'Enter the LeetCode problem URL:',
      validate: (input) =>
        /^https:\/\/leetcode.com\/problems\/[a-zA-Z0-9-]+\//.test(input) ||
        'Please enter a valid LeetCode problem URL!',
    },
  ]);

  // Fetch problem details and generate test cases
  const problemData = await getLeetCodeProblemDetails(leetCodeUrl);
  if (problemData) {
    const slug = problemData.title.toLowerCase().replace(/\s+/g, '-');
    await generateTestCases(problemData, slug);
    console.log('Test cases generated and saved successfully.');
  } else {
    console.log('Failed to fetch LeetCode problem data. Please try again.');
  }
}

// Run the CLI
main();