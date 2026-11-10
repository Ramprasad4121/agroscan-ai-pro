
# 🌱 Agro AI 🤖

**The Unified AI Ecosystem for Next-Gen Agriculture**

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4-purple?logo=vite)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-cyan?logo=tailwindcss)](https://tailwindcss.com/)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [AI Integration](#-ai-integration-details)

---

## 🚀 Overview

**Agro AI** is a cutting-edge agricultural platform designed to bridge the gap between farmers, technology, and the market. It leverages **Multimodal AI** to provide real-time plant diagnosis, crop management advice, financial guidance, and market intelligence.

Unlike simple crop doctor apps, Agro AI creates a **complete ecosystem** connecting:
*   👨‍🌾 **Farmers:** for intelligent crop management.
*   🛒 **Consumers:** for direct farm-to-table access.
*   🏢 **FPOs (Farmer Producer Organizations):** for bulk trade and management.
*   🏦 **Stakeholders:** Banks, Govt Agencies, Insurance firms for seamless service delivery.

---

## ✨ Key Features

### 🤖 Core AI Capabilities
*   **Instant Plant Diagnosis (Scanner):** Snap a photo of a crop to detect diseases, pests, or nutritional deficiencies with high accuracy using Gemini Vision models. Includes comprehensive treatment and prevention advice.
*   **Kisan Voice Assistant:** A "Talk to Expert" feature supporting regional languages, allowing farmers to ask complex queries verbally.
*   **Video Field Analysis:** Upload field videos for a broader health assessment of the crop.
*   **Generative Farm Visualizer:** Visualize potential farm makeovers or crop planning using AI image generation.

### 🚜 Smart Farming Tools
*   **Crop Calendar:** Personalized schedule for sowing, irrigation, and harvesting based on crop type and start date.
*   **Water Smart:** Satellite and weather-based irrigation planning to conserve water and optimize yield.
*   **Fertilizer & Pesticide Calculators:** Precise dosage calculators to reduce input costs and chemical usage.
*   **Yield & Profit Estimator:** Predict harvest volume and potential revenue based on land size and market trends.

### 💰 Market & Finance
*   **Price Forecast:** AI-driven predictions (Sell Now vs. Hold) based on market trends.
*   **Mandi Rates:** Real-time prices from nearby marketplaces.
*   **Smart Apply:** Simplified application flows for Government Schemes, Loans, and Insurance (simulating DigiLocker integration).
*   **Agri Passport:** A unified digital identity for farmers containing land records, soil health history, and rapid financial profiling.

### 🌐 Ecosystem Connectivity
*   **Role-Based Dashboards:** Tailored interfaces for Consumers (Shopping), FPOs (Member Mgmt), and Government (Monitoring).
*   **Community & Forum:** A platform for farmers to discuss issues, rate local shops, and find labor.
*   **Drone Services:** Booking interface for aerial spraying and monitoring.
*   **Offline Support:** Intelligent image compression for low-bandwidth rural areas.

---

## 🛠 Tech Stack

*   **Frontend:** [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/) for blazing fast development
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom "Tech" theme
*   **AI Engine:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **State Management:** React Hooks & Context
*   **Internationalization:** Gemini-powered translation for 20+ languages, with a local cache

---

## ⚡ Getting Started

### Prerequisites
*   **Node.js** (v16 or higher)
*   **npm** or **yarn**
*   A free **Gemini API key** — [get one here](https://aistudio.google.com/apikey)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Ramprasad4121/agroscan-ai-pro.git
    cd agroscan-ai-pro
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure the environment**
    ```bash
    cp .env.example .env
    # then paste your key into .env
    VITE_GEMINI_API_KEY=your_key_here
    ```
    Only `VITE_GEMINI_API_KEY` is required; every AI feature (scan, chat, voice,
    visualizer, translation, market search) uses it. Without a key the app still
    runs and shows graceful fallbacks instead of failing.

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

5.  **Production build**
    ```bash
    npm run build      # type-check + bundle to dist/
    npm run preview    # serve the production build
    ```

---

## 🤖 AI Integration Details

| Feature | Model | Notes |
|---|---|---|
| Plant diagnosis | `gemini-2.5-flash` (vision) | Leaf/plant image in, structured diagnosis out |
| Agronomist chat | `gemini-2.5-pro` | Follow-up Q&A grounded in the scan result |
| Farm visualizer | `gemini-2.5-flash-image` → `gemini-3.1-flash-image` → `imagen-4.0` | Fallback chain with graceful quota messaging |
| Voice assistant | `gemini-2.5-flash-native-audio-preview` | Live bidirectional audio |
| Text-to-speech | `gemini-2.5-flash-preview-tts` | Reads diagnoses aloud |
| Translation | `gemini-2.5-flash` | Batched dictionary translation, cached in the browser |
| Market search | `gemini-2.5-flash` + Google Maps grounding | Grounded mandi rates and nearby resources |

Free-tier quotas are respected: every AI call retries with backoff, and the UI
degrades gracefully (cached or English text) instead of showing a blank screen.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">
  <p>Made with ❤️ for Farmers</p>
</div>
