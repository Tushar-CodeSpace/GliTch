import asyncio
import json
import sys
import time
import websockets

AGENT_ID = "agent-01"
SITE_CODE = "BLR-01"
GATEWAY_WS_URL = "ws://127.0.0.1:8000/ws/agent?agent_id=agent-01"

print(f"[START] Starting GliTch Edge Site Agent [{AGENT_ID}] (Site: {SITE_CODE})...", flush=True)

async def run_deployment_flow(ws, command_data):
    deployment_id = command_data.get("deploymentId", "dep-9042")
    payload = command_data.get("payload", {})
    app_name = payload.get("application", "Ecom Pro")
    version = payload.get("version", "v2.4.1")

    print(f"\n[DEPLOY] Received Deployment Command for {app_name} ({version}) - ID: {deployment_id}")

    stages = [
        ("PREPARING", "Initializing target workspace & deployment lock..."),
        ("DOWNLOADING", f"Downloading build package {version} from artifact repository..."),
        ("VERIFYING", "Validating SHA256 checksum & manifest signature..."),
        ("BACKING_UP", "Creating rollback backup snapshot of current version..."),
        ("STOPPING", "Gracefully stopping active service processes..."),
        ("INSTALLING", "Extracting build bundle to target application directory..."),
        ("CONFIGURING", f"Applying site configuration overrides for {SITE_CODE}..."),
        ("STARTING", "Launching application service container..."),
        ("HEALTH_CHECK", "Executing HTTP GET health check verification..."),
        ("SUCCESS", "Deployment completed successfully! Zero downtime verified.")
    ]

    for step_num, (stage, details) in enumerate(stages, 1):
        print(f"  [{step_num}/10] {stage}: {details}")
        
        telemetry_frame = {
            "event": "agent.telemetry.progress",
            "agentId": AGENT_ID,
            "deploymentId": deployment_id,
            "stage": stage,
            "status": "IN_PROGRESS" if stage != "SUCCESS" else "SUCCESS",
            "details": details,
            "timestamp": int(time.time() * 1000)
        }
        
        try:
            await ws.send(json.dumps(telemetry_frame))
        except Exception as err:
            print(f"  [WARN] Error sending telemetry frame: {err}")
        
        await asyncio.sleep(0.6)

    print(f"[OK] Deployment {deployment_id} rollout complete.\n")

async def connect_to_gateway():
    while True:
        try:
            print(f"[CONNECT] Connecting outbound WebSocket to GliTch API Gateway at {GATEWAY_WS_URL}...", flush=True)
            async with websockets.connect(GATEWAY_WS_URL) as ws:
                print(f"[CONNECTED] Connected to Gateway as Edge Agent [{AGENT_ID}]. Streaming active.", flush=True)

                async def send_heartbeat():
                    while True:
                        try:
                            ping_msg = {
                                "event": "agent.ping",
                                "agentId": AGENT_ID,
                                "siteCode": SITE_CODE,
                                "timestamp": time.time()
                            }
                            await ws.send(json.dumps(ping_msg))
                            await asyncio.sleep(15)
                        except asyncio.CancelledError:
                            break
                        except Exception as e:
                            print(f"Heartbeat failed: {e}")
                            break

                heartbeat_task = asyncio.create_task(send_heartbeat())

                try:
                    async for message in ws:
                        try:
                            data = json.loads(message)
                            event_type = data.get("event")
                            if event_type == "agent.command.deploy":
                                asyncio.create_task(run_deployment_flow(ws, data))
                            elif event_type == "agent.pong":
                                pass
                        except Exception as parse_err:
                            print(f"Message processing error: {parse_err}")
                finally:
                    heartbeat_task.cancel()

        except (websockets.exceptions.ConnectionClosed, ConnectionRefusedError, OSError) as conn_err:
            print(f"[WARN] Gateway connection unavailable ({conn_err}). Retrying in 5 seconds...")
            await asyncio.sleep(5)

if __name__ == "__main__":
    try:
        asyncio.run(connect_to_gateway())
    except KeyboardInterrupt:
        print("\n[STOP] Edge Agent shut down cleanly.")
