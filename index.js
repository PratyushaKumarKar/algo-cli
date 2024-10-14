const fs = require('fs');
const inquirer = require('inquirer');
require('dotenv').config(); 
const { getLeetCodeProblemDetails } = require('./scrapeLeetcode');
const { generateTestCases } = require('./generateTestCases');
const path = require('path');
const { executeJSFile } = require('./execute');
const { splitJsonToInputOutput } = require('./splitJson'); 


function checkOrCreateEnv() {
  const envPath = path.join(__dirname, '.env');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {

    fs.writeFileSync(envPath, '');
  }

  require('dotenv').config();

  if (!process.env.OPENROUTER_API_KEY) {
    return false; 
  }

  return true; 
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

    
    require('dotenv').config();
  }

  //ask the user for the LeetCode problem URL
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
    console.log('Created JS file successfully.');

    const filePath = path.join(__dirname, 'problems', `${slug}`, `${slug}.js`); 
    const jsonFilePath = await executeJSFile(filePath); 
    console.log('Created JSON successfully.');

    if (fs.existsSync(jsonFilePath)) {
      splitJsonToInputOutput(jsonFilePath); 
      console.log('Split JSON into input/output successfully.');
    } else {
      console.log('JSON file not found after executing the JavaScript file.');
    }

  } else {
    console.log('Failed to fetch LeetCode problem data. Please try again.');
  }
}

main();