
/**
 * AI Generation Pipeline using LLM APIs (Gemini or OpenAI)
 */
export async function generateWithAI(gameName, apiKey, apiType = 'gemini') {
  console.log(`Starting AI pipeline for ${gameName} using ${apiType}...`);

  // Step 1: Analyze Game & Generate Spec JSON
  const gameSpec = await analyzeGame(gameName, apiKey, apiType);
  console.log("AI analysis specs resolved:", JSON.stringify(gameSpec));

  // Step 2: Generate Source Code files
  const files = await generateCode(gameName, gameSpec, apiKey, apiType);
  return { spec: gameSpec, files };
}

async function analyzeGame(gameName, apiKey, apiType) {
  const prompt = `Analyze the game named "${gameName}".
Determine its core gameplay elements. You must return a JSON object with this exact format:
{
  "name": "Game Name",
  "genre": "Genre",
  "players": 1,
  "multiplayer": false,
  "themeColor": "#hexColor",
  "secondaryColor": "#hexColor",
  "mechanics": ["mechanic 1", "mechanic 2"],
  "rules": ["rule 1", "rule 2"],
  "winCondition": "Win condition summary"
}
Output only raw JSON. No markdown formatting, no code block wrap.`;

  const responseText = await callLLM(prompt, apiKey, apiType, true);
  try {
    return JSON.parse(cleanJsonString(responseText));
  } catch (err) {
    console.error("Failed to parse AI analysis spec, using fallback specs:", err);
    return {
      name: gameName,
      genre: "Arcade",
      players: 1,
      multiplayer: false,
      themeColor: "#10b981",
      secondaryColor: "#ec4899",
      mechanics: ["keyboard movement", "obstacle dodge"],
      rules: ["avoid hazards", "score points"],
      winCondition: "Achieve highest score possible"
    };
  }
}

async function generateCode(gameName, spec, apiKey, apiType) {
  const prompt = `Generate a complete, fully playable, and legally reusable HTML5 project for the game "${gameName}" based on these specifications:
${JSON.stringify(spec, null, 2)}

You must return a single JSON object where the keys are file names and the values are the complete, runnable file contents.
Do not use placeholder comments or "TODOs". Generate actual executable code.
Required files:
1. "package.json" - Containing npm configuration with a "test" script calling "node test.js"
2. "index.html" - A beautiful, gaming-style dark cabinet HTML layout with controls, scoreboard, canvas/gameboard, restart button, settings, victory/game-over screens, and a loading screen.
3. "style.css" - Premium CSS styling with custom color schemes matching the theme color (${spec.themeColor}) and secondary color (${spec.secondaryColor}), CRT overlays, glowing borders, animations, and responsive styling.
4. "game.js" - The core game engine. Handle state management, player inputs, game states, rendering, and sound synthesis using the Web Audio API (no copyright audio file dependencies!).
5. "test.js" - A standalone Node.js script that tests core mechanics (valid/invalid moves, scores, win/lose states) and exits with 0 on pass or 1 on fail (executable directly via node).
6. "ASSET-LICENSES.md" - Detailed listing of the licenses used.
7. "README.md" - Explaining features, installation, and commands.

Format your output as a single JSON object:
{
  "package.json": "...",
  "index.html": "...",
  "style.css": "...",
  "game.js": "...",
  "test.js": "...",
  "ASSET-LICENSES.md": "...",
  "README.md": "..."
}
Output ONLY the raw JSON object. No markdown wrappers.`;

  const responseText = await callLLM(prompt, apiKey, apiType, false);
  try {
    return JSON.parse(cleanJsonString(responseText));
  } catch (err) {
    console.error("AI code generation parse error. Raw text length:", responseText?.length);
    throw new Error("AI Code Generator returned invalid JSON. Retrying or repairing needed.");
  }
}

// Clean JSON code formatting strings
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

async function callLLM(prompt, apiKey, apiType, isLowTemp = false) {
  if (apiType === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: isLowTemp ? 0.1 : 0.7,
        responseMimeType: "application/json"
      }
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API returned error state: ${res.status} - ${errorText}`);
    }
    
    const json = await res.json();
    return json.candidates[0].content.parts[0].text;
  } else {
    // OpenAI API
    const url = 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: isLowTemp ? 0.1 : 0.7,
      response_format: { type: "json_object" }
    };
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API returned error state: ${res.status} - ${errorText}`);
    }
    
    const json = await res.json();
    return json.choices[0].message.content;
  }
}
