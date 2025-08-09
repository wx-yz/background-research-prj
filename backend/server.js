const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'background-research-backend'
  });
});

// Main analysis endpoint
app.post('/analyze', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        error: 'Query is required',
        message: 'Please provide a research query in the request body'
      });
    }

    console.log('Received query:', query);

    // Get OpenAI connection details from environment variables
    // These should be injected by Choreo's OpenAIConn connection
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const openaiEndpoint = process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1';

    if (!openaiApiKey) {
      console.error('OpenAI API key not found in environment variables');
      return res.status(500).json({
        error: 'Configuration error',
        message: 'OpenAI connection not properly configured'
      });
    }

    // Initialize OpenAI client
    const { OpenAI } = require('openai');
    const openai = new OpenAI({
      apiKey: openaiApiKey,
      baseURL: openaiEndpoint
    });

    // Create a comprehensive prompt for company research
    const systemPrompt = `You are an expert business intelligence analyst specializing in company research, investments, and market analysis. 

Your task is to provide comprehensive research summaries about companies and their activities in specific verticals or industries. Focus on:

1. 💰 **Investments & Acquisitions**: Recent investments, acquisitions, and funding rounds
2. 🤝 **Joint Ventures & Partnerships**: Strategic partnerships, joint ventures, and collaborative initiatives  
3. 🏢 **Subsidiaries & Portfolio Companies**: Key subsidiaries and portfolio companies
4. 📈 **Market Position**: Market share, competitive position, and industry standing
5. 🚀 **Strategic Initiatives**: Key strategic initiatives and future plans
6. 📊 **Financial Highlights**: Revenue, growth metrics, and financial performance
7. 🌐 **Geographic Presence**: Global footprint and regional operations
8. 🔮 **Future Outlook**: Growth prospects and market opportunities

Format your response with clear sections, bullet points, and relevant emojis to make it engaging and easy to read. Provide specific examples, dollar amounts, dates, and company names where possible.

If you don't have specific information, clearly state what information is not available and suggest what types of sources might have more detailed information.`;

    const userPrompt = `Please provide a comprehensive background research summary for the following query:

${query}

Please structure your response with clear headings and include relevant emojis to make it visually appealing and easy to scan.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user", 
          content: userPrompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const summary = completion.choices[0].message.content;

    console.log('Generated summary length:', summary.length);

    res.json({
      summary,
      query,
      timestamp: new Date().toISOString(),
      metadata: {
        model: "gpt-4o-mini",
        tokens_used: completion.usage?.total_tokens || 0
      }
    });

  } catch (error) {
    console.error('Error processing query:', error);
    
    let errorMessage = 'An error occurred while processing your request';
    let statusCode = 500;

    if (error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.code === 'invalid_api_key') {
      errorMessage = 'OpenAI API configuration error';
      statusCode = 500;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
      statusCode = 408;
    }

    res.status(statusCode).json({
      error: 'Analysis failed',
      message: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({
    service: 'Background Research Backend',
    version: '1.0.0',
    description: 'Backend API for company and investment research analysis',
    endpoints: {
      'GET /health': 'Health check endpoint',
      'POST /analyze': 'Main research analysis endpoint'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Background Research Backend running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Analysis endpoint: http://localhost:${PORT}/analyze`);
});

module.exports = app;
