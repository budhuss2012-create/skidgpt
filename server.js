import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("."));

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

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "";

        const gameRequest =
            /make.*game|create.*game|build.*game|game.*for me|flappy|snake|pong|breakout|platformer/i.test(userMessage);

        let prompt;

        if (gameRequest) {
            prompt = `
You are a game-making AI.

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
- Make sure every HTML element you use actually exists.
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

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://skidgpt.onrender.com",
                    "X-Title": "SkidGPT"
                },

                body: JSON.stringify({
                    model: "openrouter/free",

                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.message ||
                `OpenRouter returned ${response.status}`
            );
        }

        const reply =
            data?.choices?.[0]?.message?.content ||
            "I didn't get a response.";

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("AI request failed:", error);

        res.status(500).json({
            error: "AI request failed: " + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SkidGPT is running on port ${PORT}`);
});
