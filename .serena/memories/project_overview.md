# Bloomly.io - Project Overview

## Purpose
AI-powered Instagram content creator for fashion boutiques. Mobile-first web app that combines canvas-based design tools with AI content generation and direct Instagram publishing.

## Tech Stack
- **Frontend**: Next.js 14 with App Router, React 18, TypeScript (strict mode)
- **Canvas**: Fabric.js 6.0.2 with mobile touch optimizations
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS with mobile-first approach
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Integration**: OpenAI GPT-4 and DALL-E 3
- **UI Components**: Radix UI primitives with custom atomic design

## Architecture Pattern
- Atomic Design (Atoms → Molecules → Organisms → Templates → Pages)
- Mobile-first responsive design
- PWA capabilities with offline functionality
- Canvas-based editor with Fabric.js
- AI content generation pipeline
- Direct Instagram publishing integration

## Key Features
- Interactive canvas editor with drag-and-drop layers
- Mobile touch gestures (pinch, zoom, pan, rotate)
- AI-powered content generation
- Layer management system
- Real-time auto-save (30-second intervals)
- Instagram Graph API integration