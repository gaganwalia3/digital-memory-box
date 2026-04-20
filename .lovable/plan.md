

# Digital Gift Box — Implementation Plan

## Overview
A frontend-only app where users create a multi-slide digital gift box, generate a shareable Base64-encoded link, and recipients view an animated gift-opening experience.

## Pages

### 1. Create Page (`/`)
- Clean white canvas with centered gift box editor
- **Toolbar**: "Add Slide" button, slide counter
- **Slide Cards**: Editable text + image upload (base64) per slide, with add/remove animations via Framer Motion
- **Preview Area**: Horizontal scrollable card list with soft shadows and rounded corners
- **Generate Link**: Encodes slides to Base64, appends as `?data=...` query param, copies to clipboard with toast confirmation

### 2. View Page (`/view`)
- Pastel gradient background
- **Gift Box Animation**: Floating box (continuous up/down via Framer Motion) with "Someone special sent you this 💝" text
- **On Click**: Lid opens with scale/rotate animation, then slides reveal one-by-one as cards
- **Slide Navigation**: Next/Prev buttons with fade/slide transitions between cards

## Design
- Soft pastel color palette (pinks, lavenders, warm whites)
- Rounded cards with soft box shadows
- Mobile-responsive layout
- Framer Motion for all animations (float, open, slide transitions)

## Technical Approach
- Slides stored in React state as `Array<{ text: string, image: string }>`
- Base64 encoding/decoding of JSON for URL sharing
- Framer Motion + AnimatePresence for all transitions
- No backend — everything is URL-encoded

## File Structure
- `src/pages/Index.tsx` — Create page
- `src/pages/ViewGift.tsx` — View page
- `src/components/gift/SlideEditor.tsx` — Individual slide editing card
- `src/components/gift/GiftBox.tsx` — Animated gift box component
- `src/components/gift/SlideViewer.tsx` — Slide display with navigation

