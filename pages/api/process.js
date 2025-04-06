import { connectDB, disconnectDB } from "@/src/db"
import MyFileModel from "@/src/models/myFile"
import * as PDFJS from "pdfjs-dist/legacy/build/pdf"
import { getEmbeddings } from "@/src/cohereServices"
import pinecone, { initialize } from "@/src/pinecone"


export default async function handler(req, res) {
    // check if the request method is POST
    if(req.method !== 'POST'){
        return res.status(400).json({message: "Invalid Request"})
    }

    try{
        // connect to mongodb
        await connectDB()

        // query by file name
        const {id} = req.body
        const myFile  = await MyFileModel.findById(id)

        if(!myFile){
            return res.status(400).json({message: "Invalid File"})
        }
        if(myFile.isProcessed){
            return res.status(400).json({message: "File already processed"})
        }

        // read the file from s3 bucket/url and iterate through each page
        let vectors = []
        let myFileData = await fetch(myFile.fileUrl)

        if(myFileData.ok){
            let pdfDoc = await PDFJS.getDocument(await myFileData.arrayBuffer()).promise
            const numPages = pdfDoc.numPages

            for (let i = 0; i < numPages; i++) {
                let page = await pdfDoc.getPage(i+1)
                let textContext = await page.getTextContent()
                const text = textContext.items.map(item => item.str).join("")
                
                // get the embeddings for the text(OPENAI)
                const embedding = await getEmbeddings(text)
                
                // create a array named vector and push our vectors/embeddings into it
                vectors.push({
                    id: `page${i+1}`,
                    values: embedding,
                    metadata: {
                        text,
                        pageNum: i+1
                    }
                })
            }
            // initialize pinecone 
            await initialize()
            
            // connect to pinecone index
            const index = pinecone.Index(myFile.vectorIndex)
            
            // upsert the vectors into pinecone index
            await index.upsert({
                upsertRequest: {
                    vectors
                }
            })

            // update the file in mongodb to true
            myFile.isProcessed = true
            await myFile.save()
            
            return res.status(200).json({message: "File processed successfully"})
        } else {
            return res.status(500).json ({message: "Error processing file"})
        }
    } catch (e){
        console.log(e)
		return res.status(500).json({message: e.message})
    }
}