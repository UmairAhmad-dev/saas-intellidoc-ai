import os
import io
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
from huggingface_hub import InferenceClient
import chromadb
import pypdf
from dotenv import load_dotenv  # 💡 Added explicit environment system mapping

# Explicitly parse and inject variables from the local secure .env file
load_dotenv()

app = FastAPI(
    title="IntelliDoc AI Production Server",
    description="Optimized RAG Engine with Serverless LLM Context Synthesis",
    version="2.6.0"
)

# Enable CORS for seamless frontend tracking configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------------
# HUGGING FACE AI ENGINE INITIALIZATION & AUTHENTICATION
# -------------------------------------------------------------------------
HF_API_TOKEN = os.getenv("HF_TOKEN", "")

# Force explicit environment variable coverage for the runtime session
os.environ["HF_TOKEN"] = HF_API_TOKEN
os.environ["HUGGINGFACEHUB_API_TOKEN"] = HF_API_TOKEN

print("\n--- BOOTING LIVE PRODUCTION ENGINE ---")
try:
    # Initialize using the token parameter directly
    hf_client = InferenceClient(token=HF_API_TOKEN)
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    chroma_client = chromadb.Client()
    collection = chroma_client.get_or_create_collection(name="user_pdf_vault")
    print("✅ All Core ML Engines and Vector Spaces Ready!")
except Exception as e:
    print(f"❌ Critical Boot Error: {str(e)}")
print("--------------------------------------\n")


@app.get("/")
def home():
    return {"status": "Production pipeline fully active"}


@app.post("/api/upload")
async def process_pdf_document(file: UploadFile = File(...)):
    global collection
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
            
        file_bytes = await file.read()
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted_chunks = []
        
        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text() or ""
            if text.strip():
                extracted_chunks.append({"text": text.strip(), "page": page_num + 1})
        
        if not extracted_chunks:
            raise HTTPException(status_code=400, detail="This PDF contains no readable text strings.")

        docs = [c["text"] for c in extracted_chunks]
        metas = [{"page": c["page"]} for c in extracted_chunks]
        ids = [f"id_{i}" for i in range(len(docs))]
        
        # Generate semantic embeddings locally via SentenceTransformer
        vectors = embedding_model.encode(docs).tolist()
        
        # Reset local vector workspace safely
        try:
            chroma_client.delete_collection("user_pdf_vault")
        except:
            pass
            
        collection = chroma_client.create_collection("user_pdf_vault")
        collection.add(documents=docs, embeddings=vectors, metadatas=metas, ids=ids)
        return {"status": "Success", "total_ai_chunks": len(docs)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/query")
async def find_relevant_answers(payload: dict):
    user_question = payload.get("query", "").strip()
    if not user_question:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    # Pre-define fallback tracking states
    matched_paragraphs = []
    source_pages = []
    targeted_answer = "Initial state - pipeline execution structural break."

    try:
        # 1. Local ChromaDB Vector Search Lookup
        query_vector = embedding_model.encode([user_question]).tolist()[0]
        search_results = collection.query(query_embeddings=[query_vector], n_results=2)
        
        if search_results and search_results['documents'] and search_results['documents'][0]:
            matched_paragraphs = search_results['documents'][0]
            source_pages = [item.get("page", 1) for item in search_results['metadatas'][0]]

        context_string = "\n\n".join(matched_paragraphs)

        # 2. Remote Serverless Inference Loop via Verified Qwen Chat Model
        print(f"\n[AI REQUEST] Processing payload query through Qwen-2.5 pipeline...")
        
        response = hf_client.chat_completion(
            model="Qwen/Qwen2.5-7B-Instruct",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert resume assistant. Answer the user question accurately, cleanly, and briefly based only on the context provided."
                },
                {
                    "role": "user", 
                    "content": f"Context Text:\n{context_string}\n\nQuestion: {user_question}"
                }
            ],
            max_tokens=120,
            temperature=0.2
        )
        
        targeted_answer = response.choices[0].message.content.strip()
        print("✅ [AI RESPONSE RECOVERY SUCCESSFUL]")

    except Exception as error:
        print("\n❌ !!! CRITICAL QUERY ROUTE EXCEPTION !!! ❌")
        traceback.print_exc()
        targeted_answer = f"⚠️ Pipeline Internal Error: {str(error)}"

    # 3. Explicit dictionary structure mapping for React expectations
    return {
        "user_query": user_question,
        "ai_answer": targeted_answer,
        "matched_contexts": matched_paragraphs,
        "source_pages": source_pages
    }