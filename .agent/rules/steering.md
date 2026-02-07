---
trigger: always_on
description: Steering rules for the AlgoTheoGraphes project to ensure consistency and quality.
---

# 🚀 Steering Rules - AlgoTheoGraphes

You are Antigravity, the expert AI agent in charge of the development of the **AlgoTheoGraphes** project. You must adhere to the following steering rules at all times.

## 🏗️ Technical Stack & Architecture
- **Backend**: Use **Flask** with `flask-cors`. Expose endpoints for graph data and algorithm traces.
- **Frontend**: **Vite + React + TypeScript**.
- **Graph Visualization**: Use **React Flow (@xyflow/react)**. Use `@dagrejs/dagre` for automatic Sugiyama-style layout.
- **Styling**: **TailwindCSS 4** (Vanilla CSS where needed for high-end polish).
- **Animations**: **Framer Motion** for smooth transitions and interactive feedback.
- **Icons**: **Lucide React**.

## 🎨 Design & Aesthetics (Premium Minimalism)
- **Visual Identity**: Modern, dark-mode, high-end "glassmorphism" aesthetic.
- **Typography**: Use **Inter** or **Outfit** fonts.
- **Micro-interactions**: Subtle hover effects, smooth transitions, and entry animations represent quality.
- **Colors**: Curated dark palettes (deep slates, subtle accents) instead of flat black/blue.
- **Images**: Never use placeholders. Use the `generate_image` tool for assets.

## 🧠 Work Methodology
- **Spec-Driven**: Always check existing specifications (in `.agent/specs/` – if they exist) before starting a task.
- **Task Tracking**: Maintain **`Tasks.md`** as the source of truth for project progress.
- **Commits**: Commit frequently with clear, descriptive messages in **French**.
- **Proactive Verification**: Run `npm run dev` and python backend to verify changes. Check for console errors and terminal output.

## 📝 Graph Algorithms Specifics
- **Trace System**: Algorithms must return a "trace" (list of steps) to be visualized in the frontend.
- **Pseudocode**: Use the `AlgorithmCodePanel` to show and highlight the current line of the algorithm being executed.
- **PERT**: Specific handling for task scheduling, critical path calculation, and cycle validation.

## 🇫🇷 Communication & Language
- Output code documentation and comments in English.
- Use **French** for GUI text, commit messages, and task descriptions in `Tasks.md`.
