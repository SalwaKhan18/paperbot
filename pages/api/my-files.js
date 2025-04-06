import { connectDB } from "@/src/db";
import MyFileModel from "@/src/models/myFile";

export default async function handler(req, res) {
    try{
        await connectDB()
        const files = await MyFileModel.find({})
        return res.json(files)
    } catch (e) {
        return res.status(500).json({message: 'Error fetching files.'})
    }
}