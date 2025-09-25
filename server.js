const express = require('express');
const { GoogleGenAI, Modality, Type } = require('@google/genai');
const path = require('path');
const cors = require('cors');

const app = express();
// Allow large image payloads for base64 strings
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

// --- SECURE API INITIALIZATION ---
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY environment variable not set. Please set it during Cloud Run deployment.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- SERVE THE REACT APP ---
// Serve static files from the root directory (for index.html)
app.use(express.static(path.join(__dirname)));
// Serve the compiled JS from the 'dist' directory
app.use('/dist', express.static(path.join(__dirname, 'dist')));
// Serve assets from the 'assets' directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// --- SECURE API ENDPOINTS ---

const generateImageFromPrompt = async (base64Data, mimeType, prompt) => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: [{
            parts: [
                { inlineData: { data: base64Data, mimeType: mimeType } },
                { text: prompt },
            ],
        }],
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("API did not return an image.");
};

app.post('/api/create-avatar', async (req, res) => {
  try {
    const { base64Data, mimeType, style } = req.body;
    const prompt = `Transform this photo into a stylized avatar in the style of ${style}. It is crucial to maintain the person's key facial features and essence, but render it in a clean, artistic, and privacy-preserving ${style} format. The final image should be a high-quality, polished portrait.`;
    const imageUrl = await generateImageFromPrompt(base64Data, mimeType, prompt);
    res.json({ imageUrl });
  } catch (error) {
    console.error("Avatar Creation Error:", error);
    res.status(500).json({ error: 'Failed to generate avatar.' });
  }
});

app.post('/api/visualize-habit', async (req, res) => {
    try {
        const { avatarBase64WithHeader, habits, timeframe, habitType } = req.body;
        const [header, data] = avatarBase64WithHeader.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';

        const getTimeframeIntensityPrompt = (tf) => {
            switch (tf.id) {
                case '21d': return 'The changes are subtle but foundational, hinting at the new direction.';
                case '3m': return 'The transformation is now clearly visible, reflecting consistent effort.';
                case '6m': return 'Display a significant, deeply integrated transformation. The positive changes are now a core part of their appearance.';
                case '1y': return 'Illustrate a profound and lasting change. The person radiates health and the effects of the habit are undeniable.';
                case '5y': return 'Show the ultimate long-term impact. This is the complete embodiment of the habit, showing years of dedication.';
                default: return 'The changes should be noticeable.';
            }
        };

        const timeIntensityPrompt = getTimeframeIntensityPrompt(timeframe);
        const combinedHabitName = habits.map(h => h.name).join(' + ');
        const combinedPromptDetail = habits.map(h => `- ${h.name}: ${h.prompt_detail}`).join('\n        ');
        const combinedBackgroundDetail = habits.map(h => `- ${h.name}: ${h.background_detail}`).join('\n        ');
        const MENTAL_AURA_HABITS = ['meditation', 'reading', 'learning', 'productivity', 'hard_work'];
        const hasAuraHabit = habits.some(h => MENTAL_AURA_HABITS.includes(h.id));
        
        const auraInstruction = (habitType === 'positive' && hasAuraHabit)
            ? `**Visualize the Mental Aura:** The habits being practiced affect mental state. Visualize this with a subtle artistic effect, not a literal halo. For example, a soft glow of focus, a calm light for peace. The effect should be subtle and integrated seamlessly into the art style.`
            : '';

        const backgroundInstruction = habits.length > 1
            ? `Subtly weave together the environmental cues from the habits involved:\n ${combinedBackgroundDetail}`
            : `Alter the background to match the habit's theme as described here:\n ${habits[0].background_detail}`;

        const prompt = `
As a world-class artist and habit psychology expert, your task is to visualize the cumulative impact of specific habits on a person over time. You will modify the provided avatar image based on the following detailed profile.

**Habit Profile:**
- **Habit(s):** "${combinedHabitName}"
- **Time Commitment:** ${timeframe.name}

**Artistic & Coaching Direction:**

**Impact Intensity (${timeframe.name}):** ${timeIntensityPrompt} The changes must be believable and appropriate for this duration.

**Physiological & Expressive Manifestations:** Based on the habits, render the physical changes. Refer to these specific details:
${combinedPromptDetail}

**Smile & Expression:** The expression is key. It should reflect the inner state associated with the habit. For positive habits, create a genuine, serene, or confident smile. For negative habits, the expression should convey fatigue, strain, or low mood, avoiding overly dramatic caricatures.

${auraInstruction}

**Creative Mandates:**

- **Authenticity Over Exaggeration:** The transformation must be grounded in realism. The goal is an inspiring (or cautionary) look into the future, not a fantasy illustration. Maintain the core identity of the person in the avatar.

- **Environmental Storytelling:** The background should subtly support the narrative. ${backgroundInstruction} The background should complement the person, not distract from them.

Based on all these instructions, render the transformed portrait.
`.trim().replace(/^\s*[\r\n]/gm, "");


        const imageUrl = await generateImageFromPrompt(data, mimeType, prompt);
        res.json({ imageUrl });

    } catch (error) {
        console.error("Visualize Habit Error:", error);
        res.status(500).json({ error: 'Failed to visualize habit.' });
    }
});

app.post('/api/analyze-custom-habit', async (req, res) => {
    try {
        const { habitName } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the user-provided habit: "${habitName}". Determine if it's broadly positive or negative for well-being. Generate a concise, inspiring description, and detailed prompts for an AI image generator to visualize its effects. The prompts should be creative and evocative. Respond ONLY with a JSON object. Example: {"isNegative": false, "name": "...", "description": "...", "prompt_detail": "...", "background_detail": "..."}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isNegative: { type: Type.BOOLEAN, description: "Is this a negative habit?" },
                        name: { type: Type.STRING, description: "A catchy name for the habit." },
                        description: { type: Type.STRING, description: "A brief description." },
                        prompt_detail: { type: Type.STRING, description: "Detailed prompt for AI image generator about the person." },
                        background_detail: { type: Type.STRING, description: "Detailed prompt for AI image generator about the background." },
                    },
                    required: ["isNegative", "name", "description", "prompt_detail", "background_detail"],
                },
            },
        });
        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        res.json({ ...parsed, isCustom: true });
    } catch (error) {
        console.error("Analyze Custom Habit Error:", error);
        res.status(500).json({ error: 'Failed to analyze custom habit.' });
    }
});

app.post('/api/get-habit-insights', async (req, res) => {
    try {
        const { habit } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are an expert wellness and productivity coach. Provide clear, concise, and motivating insights for the habit: "${habit.name}". Respond ONLY with a JSON object.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        habitName: { type: Type.STRING },
                        benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 key benefits." },
                        challenges: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 common challenges." },
                        proTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable pro-tips." },
                    },
                    required: ["habitName", "benefits", "challenges", "proTips"],
                },
            },
        });
        const jsonString = response.text.trim();
        res.json(JSON.parse(jsonString));
    } catch (error) {
        console.error("Get Habit Insights Error:", error);
        res.status(500).json({ error: 'Could not generate insights.' });
    }
});

app.post('/api/get-actionable-tip', async (req, res) => {
    try {
        const { habit } = req.body;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a helpful and encouraging wellness coach. A user is working on the habit of "${habit.name}". Based on this habit, provide one short, simple, and actionable tip (less than 150 characters) they can implement today.`,
        });
        res.json({ tip: response.text });
    } catch (error) {
        console.error("Get Actionable Tip Error:", error);
        res.status(500).json({ error: 'Could not generate a tip.' });
    }
});

// --- CATCH-ALL FOR SPA ROUTING ---
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- START THE SERVER ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});