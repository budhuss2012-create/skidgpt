import express from "express";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("."));

function looksLikeGameRequest(message) {
    return (
        /(^|\s)(make|create|build|generate|code|design|develop|give me|i want).{0,80}(game|gameplay|platformer|shooter|horror game|rpg|racing game|clicker|pong|snake|flappy|arcade|survival game)/i.test(message) ||
        /\b(game|platformer|shooter|rpg|racing|clicker|pong|snake|flappy|arcade|survival)\b.{0,50}\b(play|create|make|build|generate)\b/i.test(message)
    );
}

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "";

        if (!userMessage.trim()) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        const isGame = looksLikeGameRequest(userMessage);

        let prompt;

        if (isGame) {
            prompt = `
You are SkidGPT Game Creator.

The user wants a playable browser game.

USER REQUEST:
${userMessage}

Create a polished, complete game that runs entirely in a browser.

Return ONLY a complete HTML document.

Start with:
<!DOCTYPE html>

End with:
</html>

Do NOT use Markdown code fences.
Do NOT explain the code.
Do NOT put anything before or after the HTML.

The game must be completely self-contained.

Use:
- HTML
- CSS
- Vanilla JavaScript
- Canvas when useful
- Web Audio API when useful

Do NOT require:
- Node.js
- external JavaScript libraries
- external CSS libraries
- external images
- external files
- a backend
- downloads

The user should be able to open the HTML and immediately play.

Make it a REAL GAME, not a tiny demonstration.

Include appropriate features such as:
- Start screen
- Clear controls
- Gameplay loop
- Score
- Health/lives when appropriate
- Enemies
- Obstacles
- Increasing difficulty
- Collision detection
- Win/lose conditions
- Restart button
- Animations
- Particles
- Screen effects
- Polished UI
- Responsive layout
- Mobile controls when appropriate

Only use features that make sense for the requested game.

Make the visuals polished and intentional.

Make the game fun to actually play.

Before returning the HTML, check for:
- JavaScript syntax errors
- Undefined variables
- Undefined functions
- Missing elements
- Broken buttons
- Broken restart logic
- Broken collision detection
- Broken game states
- Missing event listeners

Do not autoplay audio before user interaction.

FINAL OUTPUT:
ONLY the complete HTML document.
`;
        } else {
            prompt = `
You are SkidGPT, a helpful and intelligent AI assistant.

Answer the user's question clearly and naturally.

If the user asks about programming or game development,
give useful practical instructions and working code when appropriate.

USER:
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

        let reply =
            data?.choices?.[0]?.message?.content ||
            "I didn't get a response.";

        if (isGame) {
            reply = reply
                .replace(/^```html\s*/i, "")
                .replace(/^```\s*/i, "")
                .replace(/\s*```$/i, "")
                .trim();

            return res.json({
                type: "game",
                reply: reply
            });
        }

        return res.json({
            type: "text",
            reply: reply
        });

    } catch (error) {
        console.error("AI request failed:", error);

        return res.status(500).json({
            error: "AI request failed: " + error.message
        });
    }
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "SkidGPT"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SkidGPT running on port ${PORT}`);
});
