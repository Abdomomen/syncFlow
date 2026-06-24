import mongoose from "mongoose";

const DB_URI = process.env.MONGO_URL;

if (!DB_URI) {
    throw new Error("Please provide a valid DB_URI");
}

let cashed= global.mongoose;

if (!cashed) {
    cashed= global.mongoose = { conn: null };
}

async function connectDB() {
    if (cashed.conn) {
        return cashed.conn;
    }

    if (!cashed.promise){
        cashed.promise = mongoose.connect(DB_URI, {
        bufferCommands: false,
        });
    }

    try {
        cashed.conn= await cashed.promise;
    } catch (e) {
        cashed.promise= null
        throw e
    }

    return cashed.conn
}

export default connectDB;