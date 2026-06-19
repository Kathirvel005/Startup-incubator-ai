# AI Startup Incubator Hub 🚀

An ultra-modern, interactive **AI-powered Startup Incubator** dashboard designed to analyze business ideas, estimate viability scores, construct double-entry budgets, outline roadmaps, assess competitor landscapes, and generate professional PDF reports. 

This project runs fully in **offline sandbox mode** out-of-the-box (using an advanced keyword matching heuristics simulator), and automatically connects to the official **Google Gemini API** when an API key is specified in the environment file.

---

## Key Features & Visual Mechanics

### 🎨 Frontend Experiences
*   ✨ **Animated Gradient Background**: Slow-evolving neon color sweeps utilizing keyframes.
*   🌑 **Premium Dark Mode**: High-contrast, glowing UI utilizing deep slate blues, space blacks, and fluorescent accents.
*   🫧 **Glassmorphism design**: Full usage of `backdrop-filter: blur(14px)` and fine translucent borders for standard panels.
*   🌀 **Quantum Loader & Progress Bar**: Interactive loader tracking analytical stages.
*   📈 **Meter Live Counter**: Smooth number transitions counting up from zero to final scores (Feasibility, Innovation, Risk).
*   🎯 **Animated Risk Gauge**: Responsive vector SVG gauge containing a needle indicator that shifts dynamically.
*   🃏 **Hover 3D Cards**: Immersive perspective-based card rotation tracking active mouse pointer offsets.
*   🪐 **Interactive Particle Background**: High-performance HTML5 Canvas simulation rendering linked molecular lines.
*   ✍️ **Typing AI Effect**: Smart characters printing dynamically line-by-line simulating active AI reasoning.
*   💬 **Floating AI Chat Bubble**: Dedicated viewport letting users query their reports and plan launch actions.

### ⚙️ Backend Core
*   🖥️ **Express Server Router**: High-efficiency server hosting index view and processing request responses.
*   💡 **Dynamic Gemini API Service**: Seamless connection using Google's Gen AI client framework.
*   📄 **PDFKit Layout Assembler**: Pure JS document compilation server pipeline exporting reports containing vector shapes, metadata tags, and footer numbering.

---

## Folder Architecture

```text
├── public/                 # Static Assets (Frontend)
│   ├── css/
│   │   └── style.css       # Design variables, Glassmorphism, Animations
│   ├── js/
│   │   ├── app.js          # Client orchestrator, gauges, counter logic
│   │   ├── chat.js         # Bubble panels toggles, message records
│   │   └── particles.js    # Canvas particle background physics
│   └── index.html          # Main HTML structure, SEO elements
├── .env                    # System port and API keys
├── .env.example            # Environment template config
├── package.json            # Node modules dependencies and scripts
└── server.js               # Node.js backend & PDF/Chat API routes
```

---

## Installation & Startup

Follow these simple steps to run the project locally on your machine:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+ is recommended for optimal performance).

### 2. Install Dependencies
Open your command terminal in this directory and execute:
```bash
npm install
```

### 3. Setup API Key (Optional)
If you want real Gemini AI responses, retrieve an API key from Google AI Studio and place it in your `.env` file:
```env
PORT=5000
GEMINI_API_KEY=AIzaSy...your_gemini_key_here
```
*Note: If `GEMINI_API_KEY` is left blank, the app will auto-detect this and load the fully functional mockup heuristics simulator. Perfect for classroom projects or quick local demos!*

### 4. Boot Up the Server
Run the local dev server:
```bash
npm start
```

### 5. Access the Web App
Open your browser and navigate to:
```text
http://localhost:5000
```
Pitched ideas will compile details in under 2 seconds!

---

## API Documentation

### `POST /api/analyze`
Submits startup details for AI scoring.
*   **Request Body**:
    ```json
    {
      "idea": "An AI-based drone mapping service for solar farms.",
      "amount": "45000",
      "platform": "Hardware/IoT"
    }
    ```
*   **Response Body**: Structured metrics JSON.

### `POST /api/chat`
Answers context-based startup questions.
*   **Request Body**: `{ message, history, context }`

### `POST /api/download-pdf`
Builds and streams a premium PDF report download.
