import { Folder } from "lucide-react";

type Props = {
  onClick: () => void;
  disabled?: boolean;
};

export function DemoModeButton({ onClick, disabled = false }: Props) {
  return (
    <button
      type="button"
      className="terminal-demomode-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label="Continue in Demo Mode"
    >
      <Folder size={14} className="demomode-icon" />
      <span className="demomode-text">[ Continue in Demo Mode → ]</span>
    </button>
  );
}
