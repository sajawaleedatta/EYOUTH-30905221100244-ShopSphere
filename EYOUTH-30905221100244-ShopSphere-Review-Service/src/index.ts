import "dotenv/config";
import connectMongoDB from "./config/mongodb";
import app from "./app";

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectMongoDB();

  app.listen(PORT, () => {
    console.log(`Review Service running on port ${PORT}`);
  });
};

start();
