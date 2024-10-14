const fs = require('fs');
const path = require('path');


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

  testCases.forEach((testCase, index) => {
    const inputFilePath = path.join(inputDir, `${index}.txt`);
    const outputFilePath = path.join(outputDir, `${index}.txt`);

    fs.writeFileSync(inputFilePath, testCase.input.toString(), 'utf8');

    fs.writeFileSync(outputFilePath, testCase.output.toString(), 'utf8');
  });

  console.log(`Successfully split ${testCases.length} test cases into input and output directories.`);
};

const jsonFilePath = path.join(__dirname, 'problems','zigzag-conversion','testcases.json');

module.exports = { splitJsonToInputOutput }