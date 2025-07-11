import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use('/api/users', userRouter);
app.use('/api/image', imageRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the IMAGIFY API...!');
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
  }
};

startServer();
