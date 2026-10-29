import { Fingerprint, Key, Lock } from "lucide-react";

export type AuthMethod = "password" | "biometric" | "token";

type Props = {
  selected: AuthMethod;
  onSelect: (method: AuthMethod) => void;
};

export function AuthMethodSelector({ selected, onSelect }: Props) {
  return (
    <div className="auth-method-selector-container">
      <div className="auth-tab-bar" role="tablist" aria-label="Authentication Methods">
        {/* Password Tab - Functional */}
        <button
          type="button"
          role="tab"
          aria-selected={selected === "password"}
          className={`auth-tab-btn ${selected === "password" ? "active" : ""}`}
          onClick={() => onSelect("password")}
        >
          <Lock size={13} className="tab-glyph" />
          <span>Password</span>
        </button>

        {/* Biometric Tab - Disabled with explanation */}
        <button
          type="button"
          role="tab"
          aria-selected={selected === "biometric"}
          className={`auth-tab-btn disabled ${selected === "biometric" ? "active" : ""}`}
          onClick={() => onSelect("biometric")}
          title="Hardware biometric authentication (Touch ID / FIDO2) will be enabled in a future release."
        >
          <Fingerprint size={13} className="tab-glyph" />
          <span>Biometric</span>
          <span className="tab-pill-disabled">SOON</span>
        </button>

        {/* Token Tab - Disabled with explanation */}
        <button
          type="button"
          role="tab"
          aria-selected={selected === "token"}
          className={`auth-tab-btn disabled ${selected === "token" ? "active" : ""}`}
          onClick={() => onSelect("token")}
          title="CLI personal access token authorization is currently disabled on local endpoint."
        >
          <Key size={13} className="tab-glyph" />
          <span>Token</span>
          <span className="tab-pill-disabled">SOON</span>
        </button>
      </div>

      {/* Explanatory note if user clicks Biometric or Token */}
      {selected === "biometric" && (
        <div className="method-notice-box" role="alert">
          <Fingerprint size={14} className="text-accent" />
          <span>Biometric authentication requires host Secure Enclave drivers (disabled in this build). Please sign in via Password.</span>
        </div>
      )}

      {selected === "token" && (
        <div className="method-notice-box" role="alert">
          <Key size={14} className="text-accent" />
          <span>Local daemon token provider not configured. Please authenticate with local password or enter via Demo Mode.</span>
        </div>
      )}
    </div>
  );
}
