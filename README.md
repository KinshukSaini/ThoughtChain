# ThoughtChain 🌳

An AI-powered study assistant that visualizes your learning conversations as an interactive tree of thoughts. Built with Next.js, TypeScript, and Google's Gemini AI.

## Features

- 🤖 **AI Study Assistant** - Chat with Gemini 2.5 Flash for exam preparation
- 🌳 **Tree Visualization** - See your conversations organized as a mind map
- 🔄 **Smart Branching** - AI automatically creates nodes for different topics
- 📊 **Interactive Graph** - Click nodes to view conversation history
- 📁 **File Upload** - Share study materials with the AI
- ✨ **Markdown Support** - Rich text formatting in messages
- 🎨 **Dark Theme** - Easy on the eyes for long study sessions

## Tech Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **Visualization**: ReactFlow (@xyflow/react)
- **Markdown**: react-markdown with remark plugins

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ThoughtChain
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/bot/          # API routes for chat and tree management
│   │   ├── route.ts      # Main bot endpoint
│   │   └── bot.ts        # AI logic
│   ├── chat/             # Chat page
│   │   └── page.tsx
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/
│   ├── InputBox.tsx      # Message input component
│   ├── MessageBox.tsx    # Individual message display
│   ├── MessageSection.tsx # Message list container
│   └── TreeFlow.tsx      # Mind map visualization
```

## API Endpoints

- `GET /api/bot` - Retrieve tree structure
- `GET /api/bot?pathTo=<nodeId>` - Get path from root to specific node
- `POST /api/bot` - Add message and get AI response
- `PUT /api/bot` - Initialize chat with root node
- `DELETE /api/bot` - Reset chat tree

## How It Works

1. **Conversation Flow**: Users chat with the AI about study topics
2. **Node Decision**: AI analyzes each message to decide if a new topic branch should be created
3. **Tree Building**: Messages are organized into nodes with parent-child relationships
4. **Visualization**: ReactFlow renders the tree structure in real-time
5. **Navigation**: Users can click any node to view its conversation path

## Key Features Explained

### Automatic Node Creation

The AI uses a specialized prompt to analyze user messages and decide whether to:

- Continue in the current node
- Create a new branch for a different topic
- Generate meaningful titles for new nodes

### Path Navigation

Click any node in the tree to:

- Load the complete conversation path from root to that node
- Continue the conversation from that context
- Maintain conversation coherence

### Resizable Layout

Drag the divider between chat and tree view to adjust your workspace according to your preference.

## Configuration

### AI Model

The project uses Gemini 2.5 Flash. You can modify the model in [`src/app/api/bot/bot.ts`](src/app/api/bot/bot.ts):

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
```

### Styling

Customize colors and theme in:

- [`src/app/globals.css`](src/app/globals.css)
- Component-level styling in individual files

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Google AI SDK](https://ai.google.dev/docs)
- [ReactFlow Documentation](https://reactflow.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Deploy on Vercel

The easiest way to deploy ThoughtChain is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your `GEMINI_API_KEY` to environment variables
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

MIT License - feel free to use this project for your studies!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
