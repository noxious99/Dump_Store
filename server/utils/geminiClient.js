// Thin wrapper around the Gemini REST API (generativelanguage.googleapis.com).
// Node 18+ ships a global fetch, so no SDK dependency is needed.
//
// Usage:
//   const out = await generateJson({ system, prompt, schema });
// `schema` is a Gemini responseSchema — the model is forced to return JSON
// matching it, which we parse and return. Throws on missing key, timeout,
// HTTP error, blocked response, or unparseable output. Callers are expected
// to catch and fall back to a non-AI path.

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 12000;

const isConfigured = () => Boolean(process.env.GEMINI_API_KEY);

const generateJson = async ({ system, prompt, schema, temperature = 0.6, model = DEFAULT_MODEL }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini is not configured (GEMINI_API_KEY missing)');
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            temperature,
            responseMimeType: 'application/json',
            ...(schema ? { responseSchema: schema } : {}),
        },
    };
    if (system) {
        body.systemInstruction = { parts: [{ text: system }] };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let res;
    try {
        res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw new Error('Gemini request timed out');
        throw new Error(`Gemini request failed: ${err.message}`);
    } finally {
        clearTimeout(timer);
    }

    if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Gemini HTTP ${res.status}: ${detail.slice(0, 300)}`);
    }

    const data = await res.json();

    const candidate = data?.candidates?.[0];
    const finish = candidate?.finishReason;
    if (finish && finish !== 'STOP' && finish !== 'MAX_TOKENS') {
        throw new Error(`Gemini stopped early (${finish})`);
    }

    const text = candidate?.content?.parts?.map((p) => p.text).join('') ?? '';
    if (!text.trim()) {
        throw new Error('Gemini returned an empty response');
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error('Gemini returned non-JSON output');
    }
};

module.exports = { generateJson, isConfigured, DEFAULT_MODEL };
