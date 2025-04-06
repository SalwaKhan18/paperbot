import { s3Upload } from "@/src/s3services";
import formidable from 'formidable';
import {connectDB, disconnectDB} from '@/src/db';
import slugify from "slugify";
import pinecone, {initialize} from "@/src/pinecone";
//import { createIndex } from "@pinecone-database/pinecone/dist/control";
import MyFileModel from "@/src/models/myFile"

export const config = {
    api: {
        bodyParser: false
    }
}

const createIndex = async (indexName) => {
    const indexes = await pinecone.listIndexes()
    if (!indexes.includes(indexName)){
        await pinecone.createIndex({
            createRequest: {
                name: indexName,
                dimension: 1536
            }
        })
    } else {
        throw new Error('Index with this name already exists.')
    }
}

export default async function handler(req, res){
    // only allow POST method
    if (req.method !== 'POST') {
        return res.status(400).json({message: 'Method not allowed'})
    }

    // connect to mongodb
    try {
        await connectDB()

        // parse the incoming form data
        let form = new formidable.IncomingForm()
        form.parse(req, async(error, Fields, files) => {
            if (error) {
                console.log('Failed to parse form data:')
                return res.status(500).json({message: 'Failed to parse form data'})
            }

            const file = files.file

            if(!file) {
                return res.status(400).json({message: 'No file uploaded'})
            }

            // upload file to s3 bucket
            let data = await s3Upload(process.env,S3_BUCKET, file)
            const fileNameNoExt = file.name.split(".")[0]
            const fileNameSlug = slugify(fileNameNoExt, {
                lower: true, strict: true
            })

            // initialize pinecone
            await initialize()

            // create pinecone index if not exists
            await createIndex(fileNameSlug)

            // save the file details in MongoDB
            const myFile = new MyFileModel({
                fileName: file.name,
                fileUrl: data.Location,
                vectorIndex: fileNameSlug
            })
            await myFile.save()

            // return success response
            return res.status(200).json({message: "File uploaded and index created successfully"})
        })
    }catch (e){
        console.log('---error---', e)
        return res.status(500).json({message: e.message})
    }
}