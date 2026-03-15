import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));

app.post('/api/chat', async (req, res) => {
  const { conversation } = req.body;
  try {
    if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }]
    }));

    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { temperature: 0.9 },
      systemInstruction: "Jawab hanya menggunakan bahasa Indonesia."
    });

    const result = await model.generateContent({ contents });
    res.status(200).json({ result: result.response.text() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});