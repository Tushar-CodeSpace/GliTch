import { useState } from "react";
import { GitBranch, GitCommit, Clock, CheckCircle2, XCircle, Play, RotateCcw, Bot } from "lucide-react";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import type { PipelineItem, PipelineStatus } from "../../types/devops";

type Props = {
  pipelines: PipelineItem[];
  onTriggerPipeline: (name: string) => void;
  onAskGlitch: (query: string) => void;
};

export function PipelinesView({ pipelines, onTriggerPipeline, onAskGlitch }: Props) {
  const [triggering, setTriggering] = useState<string | null>(null);

  function getStatusIcon(status: PipelineStatus) {
    switch (status) {
      case "success": return <CheckCircle2 size={16} className="text-accent" />;
      case "failed": return <XCircle size={16} className="text-red-400" />;
      case "running": return <RotateCcw size={16} className="text-amber-400 spin" />;
      default: return <Clock size={16} className="text-muted" />;
    }
  }

  function handleTrigger(name: string) {
    setTriggering(name);
    setTimeout(() => {
      onTriggerPipeline(name);
      setTriggering(null);
    }, 1500);
  }

  return (
    <div className="devops-subview">
      <div className="subview-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> CONTINUOUS DELIVERY</div>
          <h1>Pipelines & <span className="text-accent">CI/CD.</span></h1>
          <p>Automated build gates, canary rollouts, and infrastructure verification orchestrated by Glitch.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => handleTrigger("production-deploy")}
          disabled={triggering !== null}
        >
          {triggering ? <RotateCcw size={14} className="spin" /> : <Play size={14} />}
          <span>{triggering ? "Deploying..." : "Run Fast Deploy"}</span>
        </Button>
      </div>

      <div className="pipelines-list">
        {pipelines.length === 0 && (
          <Panel className="empty-state-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
            <GitBranch size={36} className="text-muted" style={{ margin: "0 auto 1rem auto", display: "block" }} />
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Active Pipelines Found</h3>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto" }}>
              Continuous delivery pipelines and build telemetry will populate here once triggered or linked to your repository.
            </p>
          </Panel>
        )}
        {pipelines.map((pipe) => {
          return (
            <Panel key={pipe.id} className="pipeline-card">
              <div className="pipeline-card-header">
                <div className="pipeline-title-group">
                  <div className="pipeline-status-icon">
                    {getStatusIcon(pipe.status)}
                  </div>
                  <div>
                    <div className="pipeline-name-row">
                      <h3>{pipe.name}</h3>
                      <span className="pipeline-id-tag">{pipe.id}</span>
                      <span className={`pipe-status-tag ${pipe.status}`}>{pipe.status.toUpperCase()}</span>
                    </div>
                    <div className="pipeline-meta-row">
                      <span><GitBranch size={12} /> {pipe.branch}</span>
                      <span><GitCommit size={12} /> {pipe.commit}</span>
                      <span><Clock size={12} /> {pipe.duration}</span>
                      <span>Triggered by <strong>{pipe.triggeredBy}</strong></span>
                      <span className="pipe-time">{pipe.updatedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="pipeline-header-actions">
                  <Button
                    variant="secondary"
                    className="retry-pipe-btn"
                    disabled={triggering === pipe.name}
                    onClick={() => handleTrigger(pipe.name)}
                  >
                    <RotateCcw size={12} className={triggering === pipe.name ? "spin" : ""} />
                    {triggering === pipe.name ? "Running..." : "Trigger Run"}
                  </Button>
                  <button
                    className="pipe-glitch-btn"
                    title="Ask Glitch to analyze pipeline failures"
                    onClick={() => onAskGlitch(`Analyze pipeline ${pipe.name} status and optimize build duration`)}
                  >
                    <Bot size={13} />
                  </button>
                </div>
              </div>

              {/* Step Progression Visualizer */}
              <div className="pipeline-steps-flow">
                {pipe.steps.map((step, idx) => (
                  <div key={idx} className={`pipeline-step-node step-${step.status}`}>
                    <div className="step-circle">
                      {step.status === "success" && <CheckCircle2 size={12} />}
                      {step.status === "failed" && <XCircle size={12} />}
                      {step.status === "running" && <RotateCcw size={12} className="spin" />}
                      {step.status === "queued" && <Clock size={12} />}
                    </div>
                    <div className="step-label">
                      <span>{step.name}</span>
                      {step.duration && <small>{step.duration}</small>}
                    </div>
                    {idx < pipe.steps.length - 1 && <div className="step-connector" />}
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
