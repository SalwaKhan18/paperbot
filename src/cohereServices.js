// cohereServices.js
import cohere from 'cohere-ai';

cohere.init(process.env.COHERE_API_KEY);

export const getEmbeddings = async (text) => {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: 'embed-english-v3.0', // or 'embed-multilingual-v3.0'
    });

    return response.body.embeddings[0];
  } catch (err) {
    console.error('Cohere Embedding Error:', err.message);
    throw err;
  }
};
