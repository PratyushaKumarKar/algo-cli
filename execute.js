const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute a JavaScript file and capture its output
function executeJSFile(filePath) {
  const fileName = path.basename(filePath, '.js'); 

  return new Promise((resolve, reject) => {
    // Increase the maxBuffer size to handle large outputs
    exec(`node ${filePath}`, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing file: ${error.message}`);
        return reject(error);
      }

      if (stderr) {
        console.error(`Error output: ${stderr}`);
        return reject(stderr);
      }

      // Parse the output and save it to a .json file
      try {
        const outputData = JSON.parse(stdout);
        const outputFilePath = path.join(path.dirname(filePath), `${fileName}.json`);

        fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf8');
        console.log(`Output saved to: ${outputFilePath}`);

        resolve(outputFilePath); 
      } catch (parseError) {
        console.error(`Failed to parse output as JSON: ${parseError.message}`);
        reject(parseError);
      }
    });
  });
}

module.exports = { executeJSFile };