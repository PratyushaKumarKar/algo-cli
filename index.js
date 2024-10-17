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

  if (!process.env.OPENROUTER_API_KEY) {
    return false;
  }

  return true;
}

function storeAPIKeyInEnv(apiKey) {
  const envPath = path.join(__dirname, '.env');
  const envContent = `OPENROUTER_API_KEY=${apiKey}\n`;
  fs.appendFileSync(envPath, envContent);
  console.log('API key has been saved in .env file.');
}


async function processLink(link) {
  try {
    const problemData = await getLeetCodeProblemDetails(link);

    if (problemData) {
      const slug = problemData.title.toLowerCase().replace(/\s+/g, '-');
      await generateTestCases(problemData, slug);
      // console.log(`Created JS file for ${slug} successfully.`);

      const filePath = path.join(__dirname, 'problems', `${slug}`, `${slug}.js`);
      const jsonFilePath = await executeJSFile(filePath);
      // console.log('Created JSON successfully.');

      if (fs.existsSync(jsonFilePath)) {
        splitJsonToInputOutput(jsonFilePath);
        // console.log('Split JSON into input/output successfully.');
      } else {
        // console.log('JSON file not found after executing the JavaScript file.');
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
        message: 'Enter your OPENROUTER_API_KEY:',
        validate: (input) => input.trim() !== '' || 'API key cannot be empty!',
      },
    ]);

    storeAPIKeyInEnv(apiKey);
    require('dotenv').config();
  }

  const filePath = path.join(__dirname, 'leetcode_problems.xlsx');
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  const links = jsonData.map(row => row["Link"]);

  // console.log('Starting to process LeetCode links...');
  
  await processLinks(links);
  console.log('All LeetCode problems processed successfully.');
}

main();
