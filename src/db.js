import mongoose from 'mongoose';

async function connectDB() {
    if(mongoose.connections[0].readyState) {
        console.log('existing connection available');
        return
    }
    const MONGO_URI =  `mongodb+srv://${process.env.DB}:${process.env.DB}@cluster0.77onhgg.mongodb.net/paperbot?retryWrites=true&w=majority&appName=Cluster0`;

    try{
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB successfully!');
    } catch(e) {
        console.error('Error connecting to MongoDB:');
        process.exit(1); // Exit the Node.js process on connection error
    }
}

async function disconnectDB() {
    if(mongoose.connections[0].readyState) {
        await mongoose.disconnect()
        console.log("MongoDB disconnected successfully!");
    }
}

export {connectDB, disconnectDB}
