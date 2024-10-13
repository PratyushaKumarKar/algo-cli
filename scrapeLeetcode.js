const axios = require('axios');

// Function to extract the slug from the URL
function extractSlugFromUrl(url) {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 2]; // The second-to-last part of the URL is the slug
}

// Function to clean and extract the full description from the content
function extractFullDescription(content) {
  return content
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')  // Replace HTML space encoding
    .replace(/\s+/g, ' ')     // Normalize multiple spaces
    .trim();                  // Trim any leading or trailing spaces
}

// Improved function to extract examples
function extractExamples(content) {
  // Match all examples based on "Example" keyword and extract both input/output
  const exampleMatches = content.match(/<pre><code>(.*?)<\/code><\/pre>/gs);
  let examples = [];

  if (exampleMatches) {
    examples = exampleMatches.map((example) => 
      example.replace(/<[^>]*>/g, '').trim() // Remove HTML tags and clean up
    );
  }

  return examples;
}

// Function to extract data and convert it into a structured JSON format
function extractData(problemData) {
  const description = extractFullDescription(problemData.content);

  // Extract examples using the improved method
  const examples = extractExamples(problemData.content);

  // Structuring the JSON object (removed constraints)
  const jsonData = {
    title: problemData.title,
    description: description,  // Full description, including constraints within
  };

  return jsonData;
}

// Function to fetch problem details from LeetCode and output structured JSON
async function getLeetCodeProblemDetails(url) {
  // Extract the slug from the provided URL
  const slug = extractSlugFromUrl(url);

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

    // Extract the data and convert to JSON
    const jsonData = extractData(problemData);

    return jsonData;

  } catch (error) {
    console.error('Error fetching problem details:', error.message);
    return null;
  }
}

// Export the function 
module.exports = { getLeetCodeProblemDetails };