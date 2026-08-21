````js
import express from "express";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.static("."));

function looksLikeGameRequest(message) {
    return /(^|\s)(make|create|build|generate|design|develop|give me|i want).{0,100}(game|gameplay|platformer|shooter|horror game|rpg|racing game|clicker|pong|snake|flappy|arcade|survival)/i.test(message)
        || /\b(game|platformer|shooter|rpg|racing|clicker|pong|snake|flappy|arcade|survival)\b.{0,60}\b(play|create|make|build|generate)\b/i.test(message);
}

function cleanGameHTML(reply) {
    return reply
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
}

app.post("/chat", async (req, res) => {
    try {
        const userMessage = String(req.body.message || "");
        const mode = req.body.mode || "chat";
        const conversation = Array.isArray(req.body.conversation)
            ? req.body.conversation
            : [];

        if (!userMessage.trim()) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        const isGame = mode === "game" || looksLikeGameRequest(userMessage);

        let prompt;

        if (isGame) {
            prompt = `
You are SkidGPT's professional browser game development AI.

The user wants you to create a COMPLETE playable browser game.

USER REQUEST:
${userMessage}

CREATE A REAL GAME, NOT A DEMO.

The game must be completely self-contained in ONE HTML file.

TECHNOLOGY:
- HTML
- CSS
- Vanilla JavaScript
- Canvas when useful
- Web Audio API when useful

DO NOT require:
- Node.js
- npm
- external JavaScript libraries
- external CSS libraries
- external images
- external files
- external servers
- downloads

The HTML must work immediately when opened in a modern browser.

QUALITY REQUIREMENTS:

Create a polished game with:

- Attractive start screen
- Clear instructions
- Responsive gameplay
- Smooth controls
- Real gameplay loop
- Score system
- Difficulty progression
- Collision detection
- Win/lose conditions
- Restart system
- Good visual effects
- Animations
- Particles when appropriate
- Screen shake when appropriate
- Polished HUD
- Good typography
- Good spacing
- Mobile support when appropriate
- Keyboard controls
- Mouse controls when appropriate
- Touch controls when appropriate

Make the game actually fun.

GAME DESIGN:

Do not make the game unnecessarily simple.

Add interesting mechanics that fit the user's request.

If the game is an arcade game, include:
- Increasing difficulty
- High score
- Combo/reward mechanics when appropriate
- Game-over screen

If the game is a horror game, include:
- Atmosphere
- Lighting effects
- Tension
- Sound effects
- Enemy behavior
- A real objective

If the game is a platformer, include:
- Player physics
- Platforms
- Obstacles
- Enemies
- Level progression

Use procedural graphics or Canvas drawing instead of external assets.

AUDIO:

If useful, create sound effects using Web Audio API.

Never autoplay audio before the player interacts with the page.

CODE QUALITY:

Before returning the final HTML, internally check:

- JavaScript syntax
- Undefined variables
- Undefined functions
- Missing DOM elements
- Broken event listeners
- Broken buttons
- Broken restart logic
- Collision errors
- Game-state errors
- Mobile input problems

Make sure the game can actually start and restart.

FINAL RESPONSE:

Return ONLY the complete HTML document.

Start with:
<!DOCTYPE html>

End with:
</html>

DO NOT use Markdown code fences.

DO NOT explain anything outside the HTML.
`;
        } else {
            prompt = `
You are SkidGPT, a highly capable AI assistant.

Answer the user's request clearly and helpfully.

You are especially good at:
- Programming
- Game development
- HTML
- CSS
- JavaScript
- Unity
- C#
- Debugging
- Creative ideas
- Explaining difficult things simply

If code is requested, provide working code.

If the user asks for something to be written down, clearly format the exact text they can copy.

Use the conversation context when useful.

CONVERSATION:
${JSON.stringify(conversation.slice(-12))}

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
            reply = cleanGameHTML(reply);

            return res.json({
                type: "game",
                reply
            });
        }

        return res.json({
            type: "text",
            reply
        });

    } catch (error) {
        console.error("AI request failed:", error);

        return res.status(500).json({
            error: "AI request failed: " + error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`SkidGPT running on port ${PORT}`);
});
````
