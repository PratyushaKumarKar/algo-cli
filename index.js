const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const inquirer = require('inquirer');
const chalk = require('chalk');
const chalkAnimation = require('chalk-animation');
const fss = require('fs-extra');
const runTestCases = require('.');
require('dotenv').config();

function extractSlugFromUrl(url) {
  if (!url) {
    throw new Error("URL is undefined or empty.");
  }
  const urlParts = url.split('/');

  if (urlParts.length < 3) {
    throw new Error("Invalid URL format. Please provide a correct LeetCode problem URL.");
  }
  return urlParts[urlParts.length - 3];
}

async function getLeetCodeProblemDetails() {

  function checkOrCreateEnv() {
    const envPath = path.join(__dirname, '.env');

    if (!fs.existsSync(envPath)) {
      // Create a new .env file if it doesn't exist
      fs.writeFileSync(envPath, '');
    }

    require('dotenv').config();
  
    if (!process.env.OPENROUTER_API_KEY) {
      return false; 
    }
  
    return true; 
  };

  function storeAPIKeyInEnv(apiKey) {
    const envPath = path.join(__dirname, '.env');
    const envContent = `OPENROUTER_API_KEY=${apiKey}\n`;
    fs.appendFileSync(envPath, envContent);
  }

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


  const res = await inquirer.prompt({
    name: 'problemURL',
    type: 'input',
    message: chalkAnimation.rainbow('Please enter the problem URL'),
    default() {
      return 'No url provided';
    },
  });

  const URL = res.problemURL;

  if (!URL || !URL.includes('leetcode.com/problems/')) {
    console.error(chalk.red('Invalid URL. Please provide a valid LeetCode problem URL.'));
    return;
  }

  let slug;

  try {
    slug = extractSlugFromUrl(URL);
  } catch (error) {
    console.error(chalk.red(error.message));
    return;
  }

  const query = `
    query getQuestionDetail($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        content
        exampleTestcases
      }
    }
  `;

  const variables = {
    titleSlug: slug,
  };

  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query: query,
      variables: variables
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': `https://leetcode.com/problems/${slug}/`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36'
      }
    });

    const problemData = response.data.data.question;

    const $ = cheerio.load(problemData.content);

    const description = problemData.content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const constraintValues = $('ul').text().trim();

    // console.log('Title:', problemData.title);
    // console.log('Description:', description);
    // console.log('Example Testcases:', problemData.exampleTestcases);
    // console.log('Constraints:', constraintValues);

    const jsonData = {
      title: problemData.title,
      description: description,
    };

    // console.log(jsonData);

    await fsFunc(jsonData, slug);
    await runTestCases(slug);

  } catch (error) {
    console.error('Error fetching problem details:', error.message);
  }
}

async function fsFunc(jsonData, slug) {
  try {
    const preprompt = `
    You are given a JSON object describing a LeetCode problem.Generate a JavaScript file that creates 1000 test cases for the problem.Each test case should be an object with an input (matching the problem’s input format) and the correct output (based on the problem’s solution).Store the test cases in an array called testCases.Ensure the inputs cover a wide range within the problem’s constraints.Log the testCases array in the format:
    [{input: ...,output:... },{input: ...,output:... },...] Don't Explain or write anything other than the Code in your response.And remove backticks because the code is directly getting placed in js file so make sure there's nothing other than the code
    `;

    const requestBody = {
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: 'user',
          content: preprompt + JSON.stringify(jsonData, null, 2)
        }
      ],
      temperature: 0.7
    };

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', requestBody, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const jsFileContent = response.data.choices[0].message.content;
    
      const dirPath = path.join(__dirname, slug);
      const filePath = path.join(dirPath, 'index.js');
    
      try {
        await fss.ensureDir(dirPath);
    
        await fss.outputFile(filePath, jsFileContent);
      } catch (err) {
        console.error('Error creating folder or writing file:', err);
      }
    }
  } catch (error) {
    console.error('Error generating test cases:', error.response ? error.response.data : error.message);
  }
};

getLeetCodeProblemDetails();

