const axios = require('axios');


function extractSlugFromUrl(url) {
  const regex = /^https:\/\/leetcode.com\/problems\/([a-zA-Z0-9-]+)\//;
  const match = url.match(regex);
  const slug = match[1]
  return slug;
}

function extractFullDescription(content) {
  return content
    .replace(/<[^>]*>/g, '') 
    .replace(/&nbsp;/g, ' ')  
    .replace(/\s+/g, ' ')     
    .trim();                  
}

// function extractExamples(content) {
//   const exampleMatches = content.match(/<pre><code>(.*?)<\/code><\/pre>/gs);
//   let examples = [];

//   if (exampleMatches) {
//     examples = exampleMatches.map((example) => 
//       example.replace(/<[^>]*>/g, '').trim() 
//     );
//   }

//   return examples;
// }


function extractData(problemData) {
  const description = extractFullDescription(problemData.content);

  // const examples = extractExamples(problemData.content);

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