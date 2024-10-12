const axios = require('axios');

// Function to extract the slug from the URL
function extractSlugFromUrl(url) {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 2]; // The second-to-last part of the URL is the slug
}

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

    console.log('Title:', problemData.title);
    console.log('Description:', problemData.content);
    console.log('Example Testcases:', problemData.exampleTestcases);

  } catch (error) {
    console.error('Error fetching problem details:', error.message);
  }
}

// Example usage with a full URL
getLeetCodeProblemDetails('https://leetcode.com/problems/two-sum/');