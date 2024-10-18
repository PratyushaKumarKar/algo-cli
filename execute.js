const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function executeJSFile(filePath) {
  const fileName = path.basename(filePath, '.js'); 

  return new Promise((resolve) => {
    exec(`node ${filePath}`, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing file ${filePath}: ${error.message}`);
        return resolve(`Error in file ${filePath}: ${error.message}`);
      }

      if (stderr) {
        console.error(`Error output in file ${filePath}: ${stderr}`);
        return resolve(`Error output in file ${filePath}: ${stderr}`);
      }

      try {
        const outputData = JSON.parse(stdout);
        const outputFilePath = path.join(path.dirname(filePath), `${fileName}.json`);

        fs.writeFileSync(outputFilePath, JSON.stringify(outputData, null, 2), 'utf8');
        console.log(`Output saved to: ${outputFilePath}`);

        resolve(outputFilePath); 
      } catch (parseError) {
        console.error(`Failed to parse output as JSON for file ${filePath}: ${parseError.message}`);
        resolve(`Failed to parse output as JSON for file ${filePath}: ${parseError.message}`);
      }
    });
  });
}

module.exports = { executeJSFile };
