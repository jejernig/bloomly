# Bloomly.io - AI-Powered Instagram Content Creator

A sophisticated mobile-first web application that combines canvas-based design tools with AI-powered content generation and direct Instagram publishing, specifically designed for fashion boutiques.

## 🚀 Features

### Core Features
- **AI-Powered Content Generation**: GPT-4 for fashion-specific captions and DALL-E 3 for lifestyle images
- **Mobile-Optimized Canvas Editor**: Fabric.js with touch gestures and responsive design
- **Direct Instagram Publishing**: Instagram Graph API integration with publishing queue
- **Fashion-Focused Templates**: 15+ professionally designed templates for boutiques
- **Real-time Auto-save**: Project persistence with 30-second intervals
- **PWA Capabilities**: Offline functionality and mobile app experience

### Technical Highlights
- **Next.js 14** with App Router and TypeScript
- **Supabase** for database, authentication, storage, and Edge Functions
- **Fabric.js** for HTML5 canvas manipulation with mobile optimization
- **Tailwind CSS** for responsive, mobile-first design
- **Zustand** for state management with persistence
- **React Query** for server state management

## 🏗️ Architecture

```
Frontend (Next.js 14)
├── Canvas Editor (Fabric.js)
├── AI Integration (OpenAI)
├── Mobile-First UI (Tailwind)
└── PWA Features

Backend (Supabase)
├── PostgreSQL Database
├── Authentication & RLS
├── File Storage
├── Edge Functions
└── Real-time Subscriptions

External APIs
├── OpenAI (GPT-4, DALL-E 3)
├── Instagram Graph API
└── Cloudinary (Image optimization)
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- Supabase account
- OpenAI API account
- Instagram Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bloomly-io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Fill in your API keys and configuration
   ```

4. **Set up Supabase database**
   ```sql
   -- Run the SQL schema from the planning document
   -- Set up Row Level Security policies
   -- Create storage buckets for images
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 Mobile-First Design

The application is designed mobile-first with:
- Touch-optimized canvas controls
- Responsive breakpoints (320px - 2560px)
- Progressive Web App features
- Offline canvas editing capabilities
- Touch gestures (pinch, zoom, rotate, drag)

## 🎨 Canvas Features

### Fabric.js Integration
- **Performance Optimizations**: Tiered optimization system (10+, 20+, 50+, 100+ objects)
- **Advanced Rendering**: Object pooling, selective rendering, throttled updates at 60fps
- **Memory Management**: Viewport virtualization and dirty object tracking
- **Mobile Touch Handling**: Custom gesture recognition and multi-touch support
- **Layer Management**: Z-index controls, grouping, lock/unlock functionality
- **Undo/Redo**: 20-step history with command pattern implementation

### Supported Elements
- **Text**: Custom fonts, styling, effects, alignment
- **Images**: Upload, resize, crop, filters, opacity
- **Shapes**: Rectangles, circles, triangles with styling
- **Backgrounds**: Solid colors, gradients, images, patterns

## 🤖 AI Integration

### Content Generation
- **Fashion Captions**: Brand voice-aware caption generation
- **Hashtag Optimization**: Engagement-optimized hashtag suggestions
- **Image Generation**: DALL-E 3 for lifestyle and product scenes
- **Style Transfer**: AI-powered style application

### Cost Optimization
- Response caching (24-hour TTL)
- Prompt optimization for token efficiency
- Usage limits by subscription tier
- Quality scoring with retry logic

## 📸 Instagram Integration

### Publishing Pipeline
1. **Image Optimization**: Instagram format optimization (1080x1080, 1080x1350)
2. **API Rate Limiting**: Queue system with exponential backoff
3. **Status Tracking**: Real-time publishing status updates
4. **Error Recovery**: Automatic retry with fallback options

### Requirements
- Instagram Business Account
- Approved Instagram App
- Valid access tokens with publishing permissions

## 🗄️ Database Schema

Key tables:
- `users`: User profiles and subscription management
- `projects`: Canvas state and project metadata
- `templates`: Fashion-focused template library
- `instagram_accounts`: Connected Instagram accounts
- `ai_generations`: AI usage tracking and results
- `published_posts`: Published content with engagement data

## 🔧 Development

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── canvas/           # Canvas-specific components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── landing/          # Landing page components
├── lib/                  # Utility libraries
├── stores/               # Zustand state stores
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── styles/               # Global styles and Tailwind config
```

### Key Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run test         # Jest unit tests
npm run test:e2e     # Playwright E2E tests
npm run type-check   # TypeScript checking
```

### Testing Suite
```bash
npm run test:all       # Run all tests (unit + E2E)
npm run test:mobile    # Mobile touch interaction tests
npm run test:accessibility  # WCAG 2.2 compliance tests
npm run test:performance    # Canvas performance validation
npm run test:smoke     # Critical functionality smoke tests
npm run test:critical  # High-priority feature tests
npm run test:report    # Generate test reports
```

**Test Coverage**: 73 passing tests across 4 test suites
- **Unit Tests**: Jest with React Testing Library
- **E2E Tests**: Playwright with multi-browser support  
- **Accessibility**: axe-playwright WCAG 2.2 validation
- **Performance**: Canvas optimization validation
- **Mobile**: Touch gesture and responsive testing

## 🎯 Performance Targets & Status

- **Canvas Load Time**: <2 seconds on mobile ✅
- **AI Generation**: <30 seconds completion ✅
- **Instagram Publishing**: >98% success rate ✅
- **Mobile Lighthouse Score**: >95 ✅
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1 ✅

### Recent Performance Improvements
- **Canvas Optimization**: Enhanced performance for 10+ objects with tiered optimization
- **Memory Management**: Object pooling and selective rendering implemented
- **Rendering Pipeline**: Throttled rendering at 60fps with dirty object tracking
- **Mobile Touch**: Optimized touch handlers and gesture recognition

## 📊 Subscription Tiers

### Free Tier
- 5 AI generations/month
- 3 projects
- Basic templates
- 1 Instagram account

### Professional ($29/month)
- 100 AI generations/month
- 50 projects
- Premium templates
- 3 Instagram accounts
- Brand kits
- Analytics

### Enterprise ($99/month)
- Unlimited AI generations
- Unlimited projects
- All features
- Team collaboration
- API access

## 🚀 Deployment

The application is designed for deployment on:
- **Frontend**: Vercel (recommended) or Netlify
- **Backend**: Supabase (managed)
- **CDN**: Cloudinary for image optimization
- **Monitoring**: Vercel Analytics or similar

## 🔒 Security & Privacy

- **WCAG 2.2 Level AA** accessibility compliance
- **GDPR/CCPA** privacy compliance
- **OWASP Top 10** security standards
- **SOC 2 Type II** ready architecture
- Row Level Security (RLS) for data protection

## 🤝 Contributing

This is a commercial project. For development guidelines and contribution information, please contact the development team.

## 📄 License

Proprietary - All rights reserved. This software is the intellectual property of Bloomly.io and is protected by copyright laws.

## 📞 Support

For technical support or questions:
- Email: support@bloomly.io
- Documentation: [docs.bloomly.io](https://docs.bloomly.io)

---

**Built with ❤️ for fashion boutiques worldwide**