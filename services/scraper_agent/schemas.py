from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class PromptRequest(BaseModel):
    prompt: str = Field(..., description="The prompt to send to ChatGPT", example="Explain quantum physics in 2 sentences")
    timeout_seconds: Optional[int] = Field(60, description="Maximum timeout for response generation in seconds")

class PromptResponse(BaseModel):
    status: str = Field(..., example="success")
    prompt: str
    response: str
    elapsed_seconds: float
    timestamp: str

class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy")
    service: str = Field("Scraper Agent Microservice")
    browser_connected: bool
    textbox_sensed: bool
    target_url: str
    details: Optional[Dict[str, Any]] = None
