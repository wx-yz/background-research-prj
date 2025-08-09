import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Summarize endpoint: accepts { query }
// In Choreo, use the connection named 'OpenAIConn' to make calls to OpenAI.
// Locally, this will fall back to OPENAI_API_KEY if present.
app.post('/api/summarize', async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Build the prompt
    const system = 'You are an analyst. Given a company and vertical, produce a concise, structured summary highlighting investments, acquisitions, partnerships, joint ventures, notable products, and strategic moves. Keep it under 250 words. Use bullets and emojis where fitting.';

    // In Choreo: OpenAIConn provides injected credentials. Read from env assuming the connection maps variables.
    const apiKey = process.env.CHOREO_OPENAICONN_OPENAI_API_KEY;
    const serviceUrl = process.env.CHOREO_OPENAICONN_SERVICEURL;

    let summaryText = '';

    if (!apiKey) {
      // If no key (e.g., when running inside Choreo with a managed connection), attempt the platform connection URL.
      // For local dev without a key, return a mocked response so UI is testable.
      summaryText = `🧾 Mock Summary\n\n• Investments: Example Capital in HealthTech A, Series B in Diagnostics B\n• Partnerships: Collaboration with Pharma C on wearable trials\n• JVs: Joint venture with Provider D for telemedicine\n• Products: Health wearable ecosystem; ResearchKit expansions\n• Strategy: Doubling down on preventive care, AI diagnostics, and remote monitoring`;
    } else {
      // Call OpenAI chat completions
      const completion = await fetch(serviceUrl + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: query }
          ],
          temperature: 0.4,
          max_tokens: 400
        })
      });

      if (!completion.ok) {
        const text = await completion.text();
        throw new Error(`OpenAI error ${completion.status}: ${text}`);
      }
      const data = await completion.json();
      summaryText = data?.choices?.[0]?.message?.content?.trim() || '';
    }

    res.json({ summary: summaryText });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
