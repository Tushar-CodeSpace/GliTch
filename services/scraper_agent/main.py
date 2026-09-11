from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time

from schemas import PromptRequest, PromptResponse, HealthResponse
from browser_agent import agent_instance

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Launch Playwright & sense prompt input
    print("[Scraper Agent Microservice] Starting up Playwright agent...")
    sensed = await agent_instance.initialize()
    if sensed:
        print("[Scraper Agent Microservice] Health check PASSED: Textbox sensed successfully.")
    else:
        print("[Scraper Agent Microservice] Warning: Textbox sensing returned false.")
    yield
    # Shutdown: Close browser resources
    print("[Scraper Agent Microservice] Shutting down Playwright agent...")
    await agent_instance.close()

app = FastAPI(
    title="GliTch Scraper Agent Microservice",
    description="Web Scraping Agent powered by FastAPI, uv, and Playwright",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "Scraper Agent Microservice",
        "health": "/health",
        "docs": "/docs",
        "prompt_api": "/api/v1/prompt"
    }

@app.get("/health", response_model=HealthResponse)
@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    is_healthy = agent_instance.textbox_sensed and agent_instance.browser is not None
    if not is_healthy:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Microservice initializing or textbox not sensed yet"
        )
    return HealthResponse(
        status="healthy",
        service="Scraper Agent Microservice",
        browser_connected=agent_instance.browser is not None,
        textbox_sensed=agent_instance.textbox_sensed,
        target_url=agent_instance.target_url,
        details={"active_selector": agent_instance.active_selector}
    )

@app.post("/api/v1/prompt", response_model=PromptResponse)
async def execute_prompt(req: PromptRequest):
    if not agent_instance.textbox_sensed:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Scraper Agent is not healthy (textbox not sensed)"
        )
    
    try:
        response_text, elapsed = await agent_instance.send_prompt(
            prompt=req.prompt,
            timeout_seconds=req.timeout_seconds or 60
        )
        
        return PromptResponse(
            status="success",
            prompt=req.prompt,
            response=response_text,
            elapsed_seconds=elapsed,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process prompt through scraper agent: {str(e)}"
        )
