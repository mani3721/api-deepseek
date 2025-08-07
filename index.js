const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/generate/json', async (req, res) => {
    try {
        const { message, model = "deepseek/deepseek-chat-v3-0324:free" } = req.body;

        // Validate input
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        // Prepare the payload for OpenRouter API
        const payload = {
            model: model,
            messages: [
                {
                    role: "user",
                    content: message
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'DeepSeek Chat API'
            }
        });

        const aiResponse = response.data.choices[0]?.message?.content;

        if (!aiResponse) {
            return res.status(500).json({
                success: false,
                error: 'No response from AI model'
            });
        }

        res.json({
            success: true,
            data: {
                message: aiResponse,
                model: model,
                usage: response.data.usage
            }
        });

    } catch (error) {
        console.error('Error in chat API:', error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            error: error.response?.data?.error?.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.listen(process.env.PORT, () => {console.log(`Server is running on port ${process.env.PORT}`)});