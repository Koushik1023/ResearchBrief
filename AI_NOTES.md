AI Notes
Use of AI in This Project

This project was developed with assistance from an AI coding assistant (Google DeepMind Antigravity). Below is a clear and transparent breakdown of how AI was used and where manual engineering and verification were applied.

AI-Assisted Areas

Prompt engineering and structured output design
AI assistance was used to iteratively design the system prompt in backend/services/llm.py. The goal was to consistently produce structured JSON outputs containing:

key points

conflicting claims

verification checklist

topic tags

Several iterations were required to improve reliability and reduce formatting errors.

Initial FastAPI scaffolding
AI helped generate the initial backend structure, including router setup and the application lifespan pattern.

Pydantic schema design
AI assisted in drafting nested response models, which were later refined and validated for correctness.

Manually Implemented and Verified Areas

Content extraction pipeline
The integration of trafilatura was manually validated across multiple real-world sources such as Wikipedia, major news websites, and blogs. I also verified that the BeautifulSoup fallback correctly handles JavaScript-heavy or partially paywalled pages.

LLM output robustness
I identified and resolved edge cases in Groq model responses. Specifically, I implemented logic to strip markdown code fences and ensure valid JSON parsing.

CORS configuration
The middleware configuration was manually tested in both development and production environments to ensure secure and correct communication between the frontend and backend.

Database session management
The asynchronous SQLAlchemy session lifecycle (get_db) was implemented and validated to ensure sessions are correctly created, yielded, and closed.

Input validation and frontend logic
URL validation was implemented using the native JavaScript URL constructor instead of regex for higher reliability and maintainability.

Routing and application flow
All frontend routing, navigation logic, and state transitions were manually designed and implemented using React Router.

LLM Provider and Model Selection

Provider: Groq
Model: llama-3.3-70b-versatile

Rationale for choosing Groq

Groq’s specialized LPU hardware provides very low latency, which improves responsiveness in a research workflow where users expect quick results.

The selected model demonstrates strong instruction-following capability and produces consistent structured outputs, which is critical for multi-document synthesis.

It supports a large context window, enabling synthesis across multiple sources.

The Python SDK is stable, actively maintained, and supports asynchronous workflows.

Why not other providers

OpenAI and Gemini were evaluated but not selected due to:

Higher cost barriers for a public demo environment.

Latency differences that negatively affect the perceived user experience.

Groq’s free tier allows accessible testing without requiring payment credentials.
