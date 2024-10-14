const fs = require('fs');
const path = require('path');

// Function to split JSON into input and output directories
function splitJsonToInputOutput(jsonFilePath) {
  
  const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
  const testCases = JSON.parse(jsonData);

  
  const inputDir = path.join(path.dirname(jsonFilePath), 'input');
  const outputDir = path.join(path.dirname(jsonFilePath), 'output');

  if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Iterate over the test cases and create text files for each input and output
  testCases.forEach((testCase, index) => {
    const inputFilePath = path.join(inputDir, `${index}.txt`);
    const outputFilePath = path.join(outputDir, `${index}.txt`);

    const inputContent = typeof testCase.input === 'object' ? JSON.stringify(testCase.input, null, 2) : testCase.input.toString();
    fs.writeFileSync(inputFilePath, inputContent, 'utf8');

    const outputContent = typeof testCase.output === 'object' ? JSON.stringify(testCase.output, null, 2) : testCase.output.toString();
    fs.writeFileSync(outputFilePath, outputContent, 'utf8');
  });

  console.log(`Successfully split ${testCases.length} test cases into input and output directories.`);
}
module.exports = {splitJsonToInputOutput} ;