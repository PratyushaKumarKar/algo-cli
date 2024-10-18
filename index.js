const fs = require('fs');
const inquirer = require('inquirer');
require('dotenv').config();
const { getLeetCodeProblemDetails } = require('./scrapeLeetcode');
const { generateTestCases } = require('./generateTestCases');
const path = require('path');
const { executeJSFile } = require('./execute');
const { splitJsonToInputOutput } = require('./splitJson');
const xlsx = require('xlsx');

function checkOrCreateEnv() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, '');
  }

  require('dotenv').config();

  if (!process.env.ANTHROPIC_API_KEY) {
    return false;
  }

  return true;
}

function storeAPIKeyInEnv(apiKey) {
  const envPath = path.join(__dirname, '.env');
  const envContent = `ANTHROPIC_API_KEY=${apiKey}\n`;
  fs.appendFileSync(envPath, envContent);
  console.log('API key has been saved in .env file.');
}


async function processLink(link) {
  try {
    const problemData = await getLeetCodeProblemDetails(link);

    if (problemData) {
      const slug = problemData.title.toLowerCase().replace(/\s+/g, '-');
      await generateTestCases(problemData, slug);

      const filePath = path.join(__dirname, 'problems', `${slug}`, `${slug}.js`);
      const jsonFilePath = await executeJSFile(filePath);

      if (fs.existsSync(jsonFilePath)) {
        splitJsonToInputOutput(jsonFilePath);
      } else {
        console.log('JSON file not found after executing the JavaScript file.');
      }
    } else {
      console.log(`Failed to fetch data for link: ${link}`);
    }
  } catch (error) {
    console.error(`Error processing link: ${link}`, error);
  }
}

async function processLinks(links) {
  for (const link of links) {
    await processLink(link);
  }
}

async function main() {
  const apiKeyExists = checkOrCreateEnv();

  if (!apiKeyExists) {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your ANTHROPIC_API_KEY:',
        validate: (input) => input.trim() !== '' || 'API key cannot be empty!',
      },
    ]);

    storeAPIKeyInEnv(apiKey);
    require('dotenv').config();
  }

  const path = require('path');
const xlsx = require('xlsx');

const filePath = path.join(__dirname, 'leetcode_problems.xlsx');
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON
const jsonData = xlsx.utils.sheet_to_json(sheet);

// Extract URLs from the "LeetCode Problems" column (second column)
const links = jsonData.map(row => row["LeetCode Link"]);

// Filter out any undefined or empty values
const validLinks = links.filter(link => link && link.trim() !== '');

console.log('Extracted links:', validLinks);

  console.log('Starting to process LeetCode links...');
  
  await processLinks(links);
  console.log('All LeetCode problems processed successfully.');
}

main();
