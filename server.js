import express from "express";

const app = express();

app.use(express.json());
app.use(express.static("."));

const personality = `
You are SkidGPT, a friendly and capable AI assistant.

Be helpful, natural, and easy to understand.
When explaining technical things, use clear step-by-step instructions.
Do not pretend you performed actions that you cannot actually perform.
`;

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message || "";

        const gameRequest =
            /make.*game|create.*game|build.*game|game.*for me|make me a game|create me a game|platformer|shooter|rpg|horror game|survival game|racing game|clicker|flappy|snake|pong|breakout/i.test(userMessage);

        let prompt;

        if (gameRequest) {
            prompt = `
You are SkidGPT Game Creator.

The user wants you to create a COMPLETE, POLISHED, PLAYABLE browser game.

USER REQUEST:
${userMessage}

========================
IMPORTANT GAME RULES
========================

Create the game as ONE self-contained HTML file.

The response MUST contain ONLY the complete HTML document.

Start with:
<!DOCTYPE html>

Do NOT put explanations before or after the HTML.

Do NOT use Markdown code fences.

========================
TECHNICAL REQUIREMENTS
========================

- Use HTML, CSS, and vanilla JavaScript.
- Put all CSS inside <style>.
- Put all JavaScript inside <script>.
- Do not require a backend.
- Do not require Node.js.
- Do not use external JavaScript libraries.
- Do not use external CSS libraries.
- Do not require external images.
- Do not require external files.
- Do not use external URLs for assets.
- The HTML must work when saved as a single .html file and opened in a browser.
- Use Canvas when it is useful for gameplay.
- Make the game responsive.
- Support desktop keyboard/mouse controls.
- If appropriate, also add touch controls for phones.
- Make sure the game works without an internet connection.

========================
GAME QUALITY
========================

Do NOT make the game a tiny demo.

Build an actual playable game with:

- A title screen.
- A clear Start Game button.
- A visible HUD.
- Score when appropriate.
- Health/lives when appropriate.
- A game-over screen when appropriate.
- Restart functionality.
- Increasing difficulty or progression.
- Clear player feedback.
- Good collision detection.
- Smooth movement.
- Interesting gameplay.
- Clear objectives.
- A win condition when appropriate.
- A lose condition when appropriate.

Only add features that make sense for the requested game.

========================
VISUAL QUALITY
========================

Make the game look polished.

Use:

- Good spacing.
- Clear typography.
- Attractive UI.
- Animations.
- Screen effects when appropriate.
- Particles when appropriate.
- Shadows/glows when appropriate.
- Background effects when appropriate.
- Different visual states for menus, gameplay, winning, and losing.

Do NOT make everything a collection of plain text boxes.

Create visual elements using CSS, Canvas, SVG, or JavaScript-generated graphics so the game remains self-contained.

========================
GAMEPLAY
========================

Before generating the code, internally design:

1. The core gameplay loop.
2. Player controls.
3. Objectives.
4. Enemy or obstacle behavior if needed.
5. Collision rules.
6. Scoring/progression.
7. Difficulty progression.
8. Win/lose conditions.
9. UI.
10. Restart behavior.

Then implement all of them.

Make sure the gameplay actually matches the user's request.

========================
CODE RELIABILITY
========================

This is extremely important.

Before returning the HTML, internally check the code for:

- Undefined variables.
- Undefined functions.
- Missing HTML elements.
- Broken event listeners.
- Incorrect IDs.
- Syntax errors.
- Infinite loops.
- Incorrect collision calculations.
- Buttons that do nothing.
- Restart buttons that fail.
- Game states that cannot transition.
- JavaScript errors caused by missing elements.
- Features that depend on unavailable files.

Make the game robust.

========================
AUDIO
========================

If sound improves the game, use the Web Audio API.

Do NOT require audio files.

Generate simple sounds programmatically.

Do not autoplay audio before the user interacts with the page.

========================
MOBILE
========================

If the game makes sense on mobile:

- Add touch controls.
- Make buttons large enough to tap.
- Prevent unwanted page scrolling during gameplay.
- Scale the game to different screen sizes.

========================
PERFORMANCE
========================

Keep the game reasonably lightweight.

Use requestAnimationFrame for real-time gameplay.

Avoid unnecessarily huge amounts of code.

Avoid creating thousands of DOM elements every frame.

========================
FINAL REQUIREMENT
========================

Return ONLY the complete HTML file.

No explanation.
No Markdown.
No comments outside the HTML.

The user should be able to copy your response into:

game.html

and immediately play it.
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
