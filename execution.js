const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);


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


async function runTestCases(problemSlug) {

  const dirPath = path.join(__dirname, 'problems/'+ problemSlug);
  const filePath = path.join(dirPath, 'index.js');
  
  try {
    console.log("asdasdasd")

    if (!await fs.pathExists(dirPath) || !await fs.pathExists(filePath)) {
      console.error(`Directory or file for problem '${problemSlug}' not found.`);
      return;
    }

    console.log(`Executing ${filePath} to generate test cases...`);
    const { stdout, stderr } = await execPromise(`node "${filePath}"`);
    
    if (stderr) {
      console.error(`Error executing the script: ${stderr}`);
    } else {
      console.log(`Test cases generated successfully.`);
      const testcasesPath = path.join(dirPath, 'testcases.json');

      await fs.outputFile(testcasesPath, stdout);
      console.log(`Test cases saved to ${testcasesPath}`);
    }

    const jsonFilePath = path.join(__dirname, 'problems',problemSlug,'testcases.json');
    
    splitJsonToInputOutput(jsonFilePath);

  } catch (err) {
    console.error('Error executing script or saving test cases:', err);
  }
}

module.exports = { runTestCases }