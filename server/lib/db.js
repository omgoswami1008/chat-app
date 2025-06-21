import mongoose from 'mongoose'


// Function to connect the mongodb database


export const connectDB = async () => {
    try {

        mongoose.connection.on('connected', () => console.log("DataBase Connected"));
        await mongoose.connect(`${process.env.MONGODB_URL}chat-app`)
    } catch (error) {
        console.log(error)
    }
}