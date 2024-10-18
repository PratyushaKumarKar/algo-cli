const axios = require('axios');


function extractSlugFromUrl(url) {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL provided to extractSlugFromUrl:', url);
    return null;
  }
  const match = url.match(/\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

function extractFullDescription(content) {
  return content
    .replace(/<[^>]*>/g, '') 
    .replace(/&nbsp;/g, ' ')  
    .replace(/\s+/g, ' ')     
    .trim();                  
}

function extractData(problemData) {
  const description = extractFullDescription(problemData.content);

  const jsonData = {
    title: problemData.title,
    description: description,
  };

  return jsonData;
}

async function getLeetCodeProblemDetails(url) {
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

    const jsonData = extractData(problemData);
    return jsonData;

  } catch (error) {
    console.error('Error fetching problem details:', error.message);
    return null;
  }
}

module.exports = { getLeetCodeProblemDetails };