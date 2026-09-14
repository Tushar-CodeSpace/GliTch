import asyncio
import websockets

async def test():
    url = "ws://127.0.0.1:8000/ws/telemetry"
    print(f"Connecting to {url}...")
    try:
        async with websockets.connect(url) as ws:
            print("Successfully connected to /ws/telemetry!")
    except Exception as e:
        print(f"Error on /ws/telemetry: {type(e).__name__}: {e}")

    url2 = "ws://127.0.0.1:8000/ws/agent"
    print(f"Connecting to {url2}...")
    try:
        async with websockets.connect(url2) as ws:
            print("Successfully connected to /ws/agent!")
    except Exception as e:
        print(f"Error on /ws/agent: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
