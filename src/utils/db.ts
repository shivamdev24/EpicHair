import mongoose from "mongoose";
// mongoose.set("debug", true);

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};



async function db(): Promise<void> {
  if (connection.isConnected) {
    console.log("Already Connected to DB");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URL!, {
      serverSelectionTimeoutMS: 30000,
    });
    connection.isConnected = db.connection.readyState;

    console.log("Connected to DB");
  } catch (error) {
    console.error("DB Connection Failed", error);
    process.exit(1);
  }
}

export default db;



