import { getEmbeddings } from "@/src/cohereServices"
import { connectDB } from "@/src/db"
import MyFileModel from "@/src/models/myFile"
import pinecone, {initialize} from "@/src/pinecone"
import { getCompletion } from "@/src/openaiServices"

export default async function handler(req, res) {
    // Check if the request method is POST
    if (req.method !== 'POST') {
        return res.status(400).json({message: 'Invalid request'})
    }

    const {id, query} = req.body
    // Connect to the mongodb database
    await connectDB()

    // query the model by id
    const myFile = await MyFileModel.findById(id)
    if (!myFile) {
        return res.status(400).json({message: 'Invalid file id'})
    }

    // generate cohere embeddings
    const queryEmbedding = await getEmbeddings(query)

    // initialize pinecone
    await initialize()
    // connect to pinecone index
    const index = await pinecone.Index(myFile.vectorIndex)

    // query the pinecone db
    const queryRequest = {
        vector: queryEmbedding, 
        topK: 5,
        includeValues: true,
        includeMetadata: true,
    }
    const result = await index.query({queryRequest})

    // get the metadata from the result
    let contexts = result['matches'].map(item => item['metadata'].text)
    contexts = contexts.join("\n\n--\n\n")

    // build the prompt with acctual query and pinecone returned metadata
    const promptStart = `Answer the question based on the context below: \n\n`
    const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`

    const prompt = `${promptStart} ${contexts} ${promptEnd}`

    // get the answer from openai
    const answer = await getCompletion(prompt)

    console.log('--completion--', response)

    // return the answer to the client
    return res.status(200).json({response: answer})
}