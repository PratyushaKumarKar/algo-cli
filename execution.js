const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runTestCases(problemSlug) {
  const dirPath = path.join(__dirname, problemSlug);
  const filePath = path.join(dirPath, 'index.js');

  try {

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
  } catch (err) {
    console.error('Error executing script or saving test cases:', err);
  }
}

module.exports = { runTestCases }