  # 🌱 AgroScan AI Pro 🤖
  
  **The Unified AI Ecosystem for Next-Gen Agriculture**
  
  [![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-4-purple?logo=vite)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-cyan?logo=tailwindcss)](https://tailwindcss.com/)
  
  [Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [AI Integration](#-ai-integration-details)

</div>

---

## 🚀 Overview

**AgroScan AI Pro** is a cutting-edge agricultural platform designed to bridge the gap between farmers, technology, and the market. It leverages **Multimodal AI** to provide real-time plant diagnosis, crop management advice, financial guidance, and market intelligence. 

Unlike simple crop doctor apps, AgroScan AI Pro creates a **complete ecosystem** connecting:
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
*   **Internationalization:** Custom logic supporting 20+ languages

---

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   **Node.js** (v16 or higher)
*   **npm** or **yarn**
*   A **Google Gemini API Key** (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/agroscan-ai-pro.git
    cd agroscan-ai-pro
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your API Key:
    ```env
    VITE_GEMINI_API_KEY=your_actual_api_key_here
    ```
    *(Note: Ensure your code uses the correct env variable name. The project currently may use a direct integration or proxy.)*

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

---

## 🧠 AI Integration Details

AgroScan AI Pro uses the **Gemini 1.5 Flash** model for its speed and multimodal capabilities.

*   **Image Analysis:** The `Scanner` component compresses user images effectively for low bandwidth (reducing 5MB -> ~200KB) before sending them to Gemini for analysis.
*   **Prompt Engineering:** We use specialized system prompts (located in `services/gemini.ts` implied) to enforce structured JSON outputs for diagnosis, ensuring reliability in the UI.
*   **Multilingual:** The AI is prompted to respond in the user's selected language, breaking literacy barriers.

---

## 📱 Screenshots

| **Plant Diagnosis** | **Market Insights** |
|:---:|:---:|
| <img src="https://via.placeholder.com/300x600?text=Diagnosis+Screen" alt="Diagnosis" width="200"/> | <img src="https://via.placeholder.com/300x600?text=Market+Screen" alt="Market" width="200"/> |

| **Voice Assistant** | **Dashboard** |
|:---:|:---:|
| <img src="https://via.placeholder.com/300x600?text=Voice+Assistant" alt="Voice" width="200"/> | <img src="https://via.placeholder.com/300x600?text=Dashboard" alt="Dashboard" width="200"/> |

*(Replace these placeholders with actual screenshots of your app)*

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Made with ❤️ for Farmers</p>
</div>
