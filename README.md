# HabitForge AI 🚀

> AI-powered habit visualization and transformation platform that helps users build better habits through intelligent insights and visual progress tracking.

## 📋 Overview

HabitForge AI is a modern web application that leverages Google's Gemini AI to provide personalized habit recommendations, visual progress tracking, and actionable insights. Built with React, TypeScript, and Express.js, it offers an intuitive interface for habit formation and maintenance.

## ✨ Features

- **AI-Powered Habit Analysis** - Intelligent habit recommendations using Gemini AI
- **Visual Progress Tracking** - Dynamic visualizations of habit progress
- **Custom Habit Creation** - Add and analyze personalized habits
- **Multiple Art Styles** - Various visualization styles for habit tracking
- **Actionable Insights** - AI-generated tips and strategies
- **Progress Comparison** - Before/after habit transformation views
- **Responsive Design** - Optimized for desktop and mobile devices
- **Real-time Analytics** - Live habit performance metrics

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Node.js, Express.js
- **AI Integration**: Google Gemini AI
- **Build Tool**: esbuild
- **Deployment**: Google Cloud Run, Docker

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habitforge-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   ```bash
   cp .env.local .env
   # Edit .env and add your GEMINI_API_KEY
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:8080
   ```

## 🐳 Docker Deployment

### Build and Run Locally
```bash
# Build Docker image
docker build -t habitforge-ai .

# Run container
docker run -p 8080:8080 -e GEMINI_API_KEY=your_api_key habitforge-ai
```

## ☁️ Cloud Run Deployment

### Deploy with gcloud CLI
```bash
# Deploy to Cloud Run
gcloud run deploy habitforge-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_actual_api_key \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

### Deploy with Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to Cloud Run
3. Click "Create Service"
4. Select "Deploy one revision from a source repository"
5. Connect your GitHub repository
6. Set environment variable: `GEMINI_API_KEY=your_api_key`
7. Configure resources and deploy

### Advanced Cloud Run Configuration
```bash
# Deploy with custom settings
gcloud run deploy habitforge-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_api_key \
  --memory 2Gi \
  --cpu 2 \
  --min-instances 0 \
  --max-instances 20 \
  --concurrency 100 \
  --timeout 300 \
  --port 8080
```

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run build` - Build frontend assets
- `npm run dev` - Start development server

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `PORT` | Server port (default: 8080) | No |

## 📁 Project Structure

```
habitforge-ai/
├── components/          # React components
│   ├── IconComponents.tsx
│   └── Spinner.tsx
├── services/           # API services
│   └── geminiService.ts
├── assets/            # Static assets
│   ├── types.ts
│   └── header-img.png
├── App.tsx            # Main React component
├── index.tsx          # React entry point
├── server.js          # Express server
├── constants.ts       # App constants
├── Dockerfile         # Docker configuration
└── package.json       # Dependencies
```

## 🔒 Security

- Environment variables for sensitive data
- CORS protection enabled
- Input validation and sanitization
- Secure API key handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review Cloud Run logs for deployment issues

---

**Built with ❤️ using Google Gemini AI**
