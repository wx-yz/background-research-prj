# Background Research Application

A comprehensive application for analyzing companies and their investments, joint ventures, and strategic partnerships across various verticals using AI-powered insights.

## 🏗️ Architecture

This application consists of two main components:

### Frontend (React)
- **Location**: `/frontend`
- **Technology**: React 18 with modern hooks
- **Authentication**: Choreo Managed Authentication (BFF pattern)
- **UI/UX**: Beautiful, responsive design with gradient themes and emojis
- **Features**:
  - Secure login/logout with Choreo managed auth
  - Dynamic API endpoint configuration via config.js
  - Real-time query analysis
  - Formatted results display with emojis

### Backend (Node.js)
- **Location**: `/backend`
- **Technology**: Node.js with Express
- **AI Integration**: OpenAI GPT-4o-mini via Choreo OpenAIConn connection
- **Features**:
  - RESTful API with comprehensive error handling
  - Health check endpoint
  - Structured AI prompts for consistent analysis
  - Security middleware (helmet, cors)

## 🚀 Deployment

### Prerequisites
1. Choreo account with access to BackgroundResearchProj project
2. OpenAI connection named 'OpenAIConn' configured in Choreo
3. Git repository connected to Choreo

### Frontend Deployment
The frontend is configured as a Web Application component with:
- **Build Command**: `npm run build`
- **Static Files**: Served from `build/` directory
- **Managed Authentication**: Enabled for secure user access
- **Config**: Dynamic API endpoint via `/public/config.js`

### Backend Deployment  
The backend is configured as a Service component with:
- **Entry Point**: `server.js`
- **Port**: 8080 (configurable via PORT env var)
- **OpenAI Integration**: Via OpenAIConn connection
- **Health Check**: Available at `/health`

## 📋 API Endpoints

### Backend Service
- `GET /` - Service information
- `GET /health` - Health check
- `POST /analyze` - Main analysis endpoint
  ```json
  {
    "query": "Tell me about Microsoft's investments in cloud computing..."
  }
  ```

### Frontend Integration
- Uses Choreo's BFF pattern with `/choreo-apis/` prefix
- Automatic authentication token injection
- Error handling and loading states

## 🔧 Configuration

### Frontend Config (`public/config.js`)
```javascript
window.config = {
    apiUrl: 'https://api.example.com'  // Auto-configured by Choreo
};
```

### Backend Environment Variables
```bash
PORT=8080
OPENAI_API_KEY=your-key        # Injected by OpenAIConn
OPENAI_ENDPOINT=your-endpoint  # Injected by OpenAIConn
```

## 🔐 Authentication Flow

1. User clicks "Login" button
2. Redirects to `/auth/login` (handled by Choreo)
3. After authentication, user data available via:
   - Cookie: `userinfo` (base64 encoded)
   - Endpoint: `/auth/userinfo`
4. Logout via `/auth/logout?session_hint=${session_hint}`

## 🎨 Features

### User Experience
- 🎯 **Intuitive Interface**: Clean, modern design with clear call-to-actions
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🎨 **Visual Feedback**: Loading states, error messages, and success indicators
- 😊 **Emojis & Icons**: Enhanced visual appeal and easy scanning

### Analysis Capabilities
- 💰 **Investment Analysis**: Detailed investment and acquisition tracking
- 🤝 **Partnership Mapping**: Joint ventures and strategic partnerships
- 🏢 **Corporate Structure**: Subsidiaries and portfolio companies
- 📈 **Market Intelligence**: Position, share, and competitive analysis
- 🚀 **Strategic Insights**: Future initiatives and growth opportunities
- 📊 **Financial Metrics**: Revenue, growth, and performance data

## 🛠️ Development

### Local Development Setup
```bash
# Frontend
cd frontend
npm install
npm start

# Backend  
cd backend
npm install
npm run dev
```

### Testing
- Frontend: React Testing Library
- Backend: Health check and error handling
- Integration: Choreo deployment validation

## 📦 Dependencies

### Frontend
- React 18+
- js-cookie for authentication
- CSS3 with modern features

### Backend
- Express.js for API framework
- OpenAI SDK for AI integration
- Helmet for security
- CORS for cross-origin requests

## 🔄 CI/CD Pipeline

1. **Code Push**: Commit to connected Git branch
2. **Auto Build**: Choreo detects changes and builds components
3. **Security Scan**: Automated security and vulnerability checks
4. **Deploy**: Automatic deployment to Development environment  
5. **Promotion**: Manual promotion to Production environment

## 📈 Monitoring & Observability

- Health check endpoints for uptime monitoring
- Request/response logging
- Error tracking and alerting
- Performance metrics via Choreo dashboard

## 🔐 Security

- **Managed Authentication**: Choreo BFF pattern
- **HTTPS**: All communications encrypted
- **Input Validation**: Request sanitization and validation
- **Rate Limiting**: Built-in API protection
- **Security Headers**: Helmet.js middleware

## 📞 Support

For deployment or configuration issues:
1. Check Choreo dashboard for build/deployment logs
2. Verify OpenAIConn connection configuration
3. Review application logs for error details
4. Contact development team for assistance
