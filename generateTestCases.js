const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function generateTestCases(problemJson, slug) {
  const preprompt = `You are given a JSON object describing a LeetCode problem. Generate and return a JavaScript file that when run ,creates 50 test cases for the problem correctly and returns it in {{input:... , output:... },{input2:... , output2:... }...} format. Ensure the inputs cover a wide range within the problem’s constraints.Don't Explain or write anything other than the Code in your response because your response is directly getting placed in a .js file so make sure there's nothing other than the code.`
  const requestData = {
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 4096,
    messages: [
      { role: "user", content: preprompt + JSON.stringify(problemJson, null, 2)}
    ]
  };

  const apiUrl = 'https://api.anthropic.com/v1/messages';
  
  try {
   
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    if (response && response.data && response.data.content && response.data.content.length > 0) {
      const jsFileContent = response.data.content[0].text;

      console.log(jsFileContent + "\n this is jsFileContent")

      const directoryPath = path.join(__dirname, 'problems', slug);
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
      }

      const filePath = path.join(directoryPath, `${slug}.js`);
      fs.writeFileSync(filePath, jsFileContent);

      console.log(`JavaScript file saved successfully at: ${filePath}`);
    } else {
      console.error('No valid choices found in the response:', response.data);
    }
  } catch (error) {
    console.error('Error generating test cases:', error.response ? error.response.data : error.message);
  }
}

module.exports = { generateTestCases };