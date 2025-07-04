// -------------------- Imports --------------------
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import RecommendedBudget from './models/recommendedBudget.js';
import postRemarks from './models/postRemarks.js';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// -------------------- App Setup --------------------
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// -------------------- Routes --------------------
app.get("/", (req, res) => {
  res.send("GradGear API is running");
});
app.post("/api/feedback", async (req, res) => {
  const { remark } = req.body;
  console.log("✅ /api/feedback route hit");

  if (!remark || typeof remark !== 'string' || remark.trim().length < 2) {
    return res.status(400).json({ error: "Invalid or empty remark" });
  }

  try {
    const newFeedback = new postRemarks({ remark: remark.trim() });
    await newFeedback.save();
    res.status(201).json({ message: "Feedback saved successfully" });
  } catch (err) {
    console.error("❌ Failed to save feedback:", err.message);
    res.status(500).json({ error: "Server error saving feedback" });
  }
});

app.get("/api/budget", async (req, res) => {
  console.log("✅ /api/budget route hit"); 
  try {
    const budgetData = await RecommendedBudget.find({});
    res.json(budgetData);
  } catch (err) {
    console.error(" Failed to fetch budget data:", err.message);
    res.status(500).json({ error: "Failed to retrieve budget data" });
  }
});



app.post('/api/infer', async (req, res) => {
  const prompt = req.body.prompt;

  // Checks if the prompt exists and is a string
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt must be a non-empty string' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant integrated into a website that helps students choose starter gear based on their college major and budget. The user will provide their major and how much they can spend.
Your task is to recommend essential items they should start with—this may include laptops, stationery, drawing tools, lab equipment, or any relevant gear based on their field of study.
For each category of gear (e.g., laptop, stationery, tools), recommend at least 2 options the user can choose from. Include a link to amazon where the name of the item was searched.
Do not add conversational fluff or greetings. Format your response using clean HTML tags like <h3>, <ul>, <li>, and <p>. Do not use \n for new lines—use HTML for structure and readability.`,
          },
          {
            role: 'user',
            content: prompt.trim(), // Promt from frontend is here.
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("Its promptin time")
    const reply = response.data?.choices?.[0]?.message?.content || '';
    res.json({ generated_text: reply });

  } catch (error) {
    console.error('Error communicating with GROQ:', error.message);
    if (error.response) {
      console.error('Groq error details:', error.response.data);
    }
    res.status(500).json({ error: 'GROQ inference failed' });
  }
});

// -------------------- Start Server --------------------
app.listen(PORT, () => {
  console.log(`✅ GradGear GROQ backend is running at http://localhost:${PORT} | PID: ${process.pid} `);
});
