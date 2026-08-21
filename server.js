import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json());
app.use(express.static("."));

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// ================================
// MY AI PERSONALITY
// ================================

const personality = `
You are SkidGPT, a friendly personal AI assistant.

Your personality:
- Be friendly, helpful, and easy to understand.
- Talk naturally, like a real conversational AI.
- You can use emojis naturally when they fit the conversation.
- Do NOT spam emojis.
- Be encouraging when helping the user.
- Keep simple questions reasonably short.
- When the user is confused, explain things step-by-step.
- When giving technical instructions, make them easy to follow.
- Never pretend you did something that you did not do.
`;

// ================================
// CHAT
// ================================

app.post("/chat", async (req, res) => {

    try {

        const userMessage = req.body.message || "";

        const conversation = Array.isArray(req.body.conversation)
            ? req.body.conversation
            : [];

        // ================================
        // DETECT GAME REQUESTS
        // ================================

        const gameRequest =
            /make.*game|create.*game|build.*game|game.*for me|flappy|snake|pong|breakout|platformer/i.test(userMessage);

        let prompt;

        // ================================
        // GAME MODE
        // ================================

        if (gameRequest) {

            prompt = `
You are SkidGPT, a game-making AI.

The user wants you to create a simple playable browser game.

IMPORTANT:
- Create ONE complete HTML file.
- Put ALL CSS inside <style>.
- Put ALL JavaScript inside <script>.
- Do not use external libraries.
- Do not use external images, files, or websites.
- The game must work by opening the HTML file in a browser.
- Make the game actually playable.
- Include controls.
- Include a restart button or restart system.
- Make sure every JavaScript function you call actually exists.
- Make sure the HTML elements you use actually exist.
- Put the <script> near the bottom of the HTML.
- Do not use undefined variables or functions.
- Do not use code that depends on external files.
- Keep the game simple enough to work reliably.
- Do NOT explain the code before or after it.
- Return ONLY the complete HTML code.
- Start with <!DOCTYPE html>.

USER REQUEST:
${userMessage}
`;

        } else {

            prompt = `
${personality}

USER MESSAGE:
${userMessage}
`;

        }

        // ================================
        // SEND TO OPENAI
        // ================================

        const response = await client.responses.create({

            model: "gpt-5.6-luna",

            input: prompt

        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {

        console.error("AI request failed:", error);

        res.status(500).json({
            error: "AI request failed: " + error.message
        });

    }

});

// ================================
// START SERVER
// ================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `SkidGPT is running on port ${PORT}`
    );

});
