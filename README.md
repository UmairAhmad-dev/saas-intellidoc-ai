# 🚀 IntelliDoc AI

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-ReactJS-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![ChromaDB](https://img.shields.io/badge/Vector_DB-ChromaDB-FC6D26?style=for-the-badge&logo=git&logoColor=white)](https://www.trychroma.com/)

An intelligent, full-stack **Retrieval-Augmented Generation (RAG)** document engine. IntelliDoc AI allows you to drop in heavy, multi-page PDF files and query them using conversational language, instantly extracting contextually verified answers without manual scrolling.

---

## 🧠 System Architecture

The core pipeline divides heavy document parsing into an intelligent local-to-cloud layout:

### 1. The Local Semantic Space (Vector Indexing)
* **Text Processing:** Extracted text strings are segmented chunk-by-chunk along with their accurate PDF page metadata.
* **Deep Learning Embeddings:** Text segments are converted into 384-dimensional dense vectors locally using the **`all-MiniLM-L6-v2`** SentenceTransformer (a BERT-based Bi-Encoder model).
* **Vector Storage:** Embeddings are written into **ChromaDB**, which manages lightning-fast context lookups using an approximate nearest neighbor algorithm.

### 2. The Cloud Intelligence Layer (Context Synthesis)
* **Prompt Injection:** When you query the app, the engine searches ChromaDB for the top two matching text blocks and bundles them into an automated structure.
* **LLM Completion:** The pipeline passes the query and matches through a secure cloud inference loop to the advanced **`Qwen2.5-7B-Instruct`** Large Language Model to compile clear, brief answers.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS (for modern UI responsiveness)
* **Backend Framework:** FastAPI, Uvicorn production runtime
* **AI Ecosystem:** SentenceTransformers, Hugging Face Hub Engine
* **Secure Environment:** Python-Dotenv, PyPDF tracking

---

## 💻 Local Installation & Setup

### ⚙️ Prerequisites
* **Node.js** & **npm** installed.
* **Python 3.10+** environment active.
* A standard **Hugging Face User Access Read Token** (Classic).

### 🛡️ Step 1: Environment Isolation
To secure your production keys against leakage, create a private file named `.env` inside your `/backend` directory. 
```text
HF_TOKEN=hf_your_actual_working_token_here# SaaS Intellidoc AI
