import {Configuration, OpenAIApi} from 'openai';

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

// export const getEmbeddings = async (text) => {
//     const response = await openai.createEmbedding({
//         model: 'text-embedding-ada-002',
//         input: text
//     })
//     return response.data.data[0].embedding
// }

// export const getCompletion = async(prompt) => {
//     const completion = await openai.createCompletion({
//         model: 'text-davinci-003',
//         prompt: prompt,
//         max_tokens: 500, 
//         temperature: 0
//     })
//     return completion.data.choices[0].text
// }

///OpenAI only used for LLM 
export const getCompletion = async (prompt) => {
    try {
      const completion = await openai.createCompletion({
        model: 'text-davinci-003', 
        prompt: prompt,
        max_tokens: 500,
        temperature: 0,
      });
  
      return completion.data.choices[0].text;
    } catch (err) {
      console.error('OpenAI Completion Error:', err.message);
      throw err;
    }
}