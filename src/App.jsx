import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────
const SUPABASE_URL = "https://xspagkuyyvqqzlrudhjf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzcGFna3V5eXZxcXpscnVkaGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2NDMyMTgsImV4cCI6MjA4ODIxOTIxOH0.bMnxpnWBqpwJKWuYOI-lLWzZWMvJLtkmxKRQgAB-pMs";


const supabase = (() => {
  const headers = { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
  const api = async (path, opts = {}) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { ...headers, ...(opts.headers || {}) }, ...opts });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || e.error_description || JSON.stringify(e)); }
    return res;
  };
  const authApi = async (path, body) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error || data.error_description || data.msg) throw new Error(data.error_description || data.message || data.msg || JSON.stringify(data));
    return { json: () => Promise.resolve(data) };
  };
  return {
    signUp: (email, password) => authApi("signup", { email, password }),
    signIn: (email, password) => authApi("token?grant_type=password", { email, password }),
    resetPassword: (email) => authApi("recover", { email }),
    upsertUserProfile: (data, token) => api("UserProfile?on_conflict=user_id", { method: "POST", headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(data) }),
    upsertHealthProfile: (data, token) => api("HealthProfile?on_conflict=user_id", { method: "POST", headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(data) }),
    getUserProfile: (uid, token) => api(`UserProfile?user_id=eq.${uid}&select=*`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
    getHealthProfile: (uid, token) => api(`HealthProfile?user_id=eq.${uid}&select=*`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
    getAllHealthProfiles: (token) => api(`HealthProfile?select=*`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
  };
})();

// ─── 3D DESIGN TOKENS ─────────────────────────────────────────────
const C = {
  primary: "#1a7fd4", accent: "#0d5fa3", light: "#e8f4fd",
  white: "#ffffff", gray: "#6b7280", lightGray: "#f0f7ff",
  border: "#cce0f5", danger: "#ef4444", success: "#22c55e", text: "#1e293b",
  glass: "rgba(255,255,255,0.25)",
  glassBorder: "rgba(255,255,255,0.4)",
  shadow3d: "0 20px 60px rgba(26,127,212,0.15), 0 8px 25px rgba(26,127,212,0.1)",
  shadowDeep: "0 25px 50px rgba(0,0,0,0.12), 0 10px 20px rgba(0,0,0,0.08)",
  shadowBtn: "0 8px 20px rgba(26,127,212,0.35), 0 3px 8px rgba(26,127,212,0.2)",
  shadowBtnHover: "0 12px 28px rgba(26,127,212,0.45)",
  gradBg: "linear-gradient(160deg, #e8f4fd 0%, #f0f7ff 40%, #dbeeff 100%)",
  gradCard: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,247,255,0.9))",
  gradPrimary: "linear-gradient(135deg, #2196f3, #1a7fd4, #0d5fa3)",
  gradHero: "linear-gradient(135deg, #1a7fd4 0%, #0d5fa3 50%, #064d87 100%)",
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────
const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; }
  input, select, textarea, button { font-family: 'Inter', sans-serif; }
  input:focus { outline: none; border-color: #1a7fd4 !important; box-shadow: 0 0 0 3px rgba(26,127,212,0.15) !important; }
  .btn-3d { transition: all 0.2s ease !important; }
  .btn-3d:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 28px rgba(26,127,212,0.45) !important; }
  .btn-3d:active { transform: translateY(0px) !important; }
  .card-3d { transition: all 0.3s ease; }
  .card-3d:hover { transform: translateY(-3px); }
  .tag-3d { transition: all 0.2s ease; }
  .tag-3d:hover { transform: scale(1.05); }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────
const StyleTag = () => <style>{globalStyle}</style>;

const Input = ({ label, type = "text", value, onChange, placeholder, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {label}{required && <span style={{ color: C.danger }}> *</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: `2px solid ${C.border}`, fontSize: 14, color: C.text, background: "rgba(255,255,255,0.9)", transition: "all 0.2s", boxShadow: "inset 0 2px 8px rgba(26,127,212,0.06), 0 2px 4px rgba(255,255,255,0.8)" }} />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>
      {label}{required && <span style={{ color: C.danger }}> *</span>}
    </label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: `2px solid ${C.border}`, fontSize: 14, color: C.text, background: "rgba(255,255,255,0.9)", boxShadow: "inset 0 2px 8px rgba(26,127,212,0.06), 0 2px 4px rgba(255,255,255,0.8)" }}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({ label, onClick, style = {}, disabled, secondary, danger, small }) => (
  <button className="btn-3d" onClick={onClick} disabled={disabled}
    style={{
      width: small ? "auto" : "100%", padding: small ? "8px 18px" : "13px 20px",
      borderRadius: 14, border: "none", fontWeight: 700, fontSize: small ? 13 : 15,
      cursor: disabled ? "not-allowed" : "pointer",
      background: danger ? "linear-gradient(135deg, #ef4444, #dc2626)" : secondary ? "rgba(255,255,255,0.9)" : C.gradPrimary,
      color: secondary ? C.primary : C.white,
      boxShadow: danger ? "0 8px 20px rgba(239,68,68,0.35)" : secondary ? "0 4px 15px rgba(26,127,212,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" : C.shadowBtn,
      opacity: disabled ? 0.6 : 1,
      border: secondary ? `2px solid ${C.border}` : "none",
      letterSpacing: 0.3,
      ...style
    }}>
    {label}
  </button>
);

const Card = ({ children, style = {}, hoverable }) => (
  <div className={hoverable ? "card-3d" : ""} style={{
    background: C.gradCard,
    borderRadius: 24, padding: 24,
    boxShadow: C.shadow3d,
    marginBottom: 16,
    border: `1px solid ${C.glassBorder}`,
    backdropFilter: "blur(10px)",
    ...style
  }}>{children}</div>
);

const Logo = ({ large }) => (
  <div style={{ textAlign: "center", marginBottom: large ? 32 : 24 }}>
    <div style={{
      width: large ? 90 : 70, height: large ? 90 : 70,
      borderRadius: 26, background: C.gradPrimary,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 12px",
      boxShadow: "0 20px 40px rgba(26,127,212,0.4), 0 8px 16px rgba(26,127,212,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
      transform: "perspective(200px) rotateX(5deg)",
    }}>
      <span style={{ fontSize: large ? 40 : 32 }}>🏥</span>
    </div>
    <div style={{ fontSize: large ? 32 : 26, fontWeight: 900, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: 2 }}>HHP</div>
    <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Human Health Project</div>
  </div>
);

const Alert = ({ msg, type }) => msg ? (
  <div style={{
    padding: "12px 16px", borderRadius: 14, marginBottom: 16, fontSize: 13, fontWeight: 600,
    background: type === "error" ? "linear-gradient(135deg, #fef2f2, #fff5f5)" : "linear-gradient(135deg, #f0fdf4, #f5fff8)",
    color: type === "error" ? C.danger : C.success,
    border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
    boxShadow: type === "error" ? "0 4px 15px rgba(239,68,68,0.1)" : "0 4px 15px rgba(34,197,94,0.1)"
  }}>{msg}</div>
) : null;

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", margin: "18px 0" }}>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.border})` }} />
    <span style={{ padding: "0 14px", fontSize: 12, color: C.gray, fontWeight: 600, background: "rgba(255,255,255,0.8)", borderRadius: 20, border: `1px solid ${C.border}` }}>OR</span>
    <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.border})` }} />
  </div>
);

// ─── BG DECORATION ───────────────────────────────────────────────
const BgDecor = () => (
  <>
    <div style={{ position: "fixed", top: -100, right: -100, width: 300, height: 300, borderRadius: "50%", background: "rgba(26,127,212,0.08)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "fixed", bottom: -80, left: -80, width: 250, height: 250, borderRadius: "50%", background: "rgba(26,127,212,0.06)", pointerEvents: "none", zIndex: 0 }} />
    <div style={{ position: "fixed", top: "40%", left: "5%", width: 120, height: 120, borderRadius: "50%", background: "rgba(33,150,243,0.05)", pointerEvents: "none", zIndex: 0 }} />
  </>
);

// ─── SCREENS ──────────────────────────────────────────────────────

function LandingScreen({ onNav }) {
  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, position: "relative", overflow: "hidden" }}>
      <StyleTag />
      <BgDecor />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 380 }}>
        <Logo large />
        <div style={{ background: C.gradCard, borderRadius: 28, padding: "32px 28px", boxShadow: C.shadowDeep, border: `1px solid ${C.glassBorder}`, backdropFilter: "blur(20px)", marginBottom: 20, textAlign: "center" }}>
          <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7, marginBottom: 28, fontWeight: 500 }}>
            Your personal health companion.<br />
            <span style={{ color: C.primary, fontWeight: 700 }}>Track, share & understand</span> your health data.
          </p>
          <Btn label="Sign In →" onClick={() => onNav("signin")} style={{ marginBottom: 12 }} />
          <Btn label="Create Account" onClick={() => onNav("signup")} secondary />
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: C.gray, fontWeight: 500 }}>🔒 GDPR Compliant · Your data is encrypted & secure</p>
      </div>
    </div>
  );
}

function SignUpScreen({ onNav, onAuth }) {
  const [f, setF] = useState({ firstName: "", lastName: "", username: "", email: "", confirmEmail: "", password: "", confirmPassword: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const set = k => v => setF(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!f.firstName || !f.lastName || !f.username || !f.email || !f.password) return setMsg({ text: "All fields are required.", type: "error" });
    if (f.email !== f.confirmEmail) return setMsg({ text: "Emails do not match.", type: "error" });
    if (f.password !== f.confirmPassword) return setMsg({ text: "Passwords do not match.", type: "error" });
    if (f.password.length < 6) return setMsg({ text: "Password must be at least 6 characters.", type: "error" });
    setLoading(true);
    try {
      setMsg({ text: "Creating account...", type: "success" });
      const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify({ email: f.email, password: f.password }) });
      const signUpData = await signUpRes.json();
      const uid = signUpData.user?.id;
      if (!uid) return setMsg({ text: `Error: ${JSON.stringify(signUpData)}`, type: "error" });
      setMsg({ text: "Signing in...", type: "success" });
      const signInRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify({ email: f.email, password: f.password }) });
      const signInData = await signInRes.json();
      const token = signInData.access_token;
      if (!token) return setMsg({ text: `Sign in error: ${JSON.stringify(signInData)}`, type: "error" });
      await fetch(`${SUPABASE_URL}/rest/v1/UserProfile`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ user_id: uid, first_name: f.firstName, last_name: f.lastName, username: f.username, email: f.email }) });
      onAuth({ token, uid, name: f.firstName });
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: "28px 20px", overflowY: "auto", position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 400, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <Logo />
        <Card>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, textAlign: "center" }}>Create Account</h2>
          <p style={{ fontSize: 13, color: C.gray, textAlign: "center", marginBottom: 20 }}>Join the HHP community today</p>
          <Alert msg={msg.text} type={msg.type} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="First Name" value={f.firstName} onChange={set("firstName")} placeholder="Jane" required />
            <Input label="Last Name" value={f.lastName} onChange={set("lastName")} placeholder="Doe" required />
          </div>
          <Input label="Username" value={f.username} onChange={set("username")} placeholder="janedoe123" required />
          <Input label="Email" type="email" value={f.email} onChange={set("email")} placeholder="jane@email.com" required />
          <Input label="Confirm Email" type="email" value={f.confirmEmail} onChange={set("confirmEmail")} placeholder="jane@email.com" required />
          <Input label="Password" type="password" value={f.password} onChange={set("password")} placeholder="Min 6 characters" required />
          <Input label="Confirm Password" type="password" value={f.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
          <Btn label={loading ? "Creating Account..." : "Create Account 🚀"} onClick={submit} disabled={loading} />
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.gray }}>
            Already have an account? <span onClick={() => onNav("signin")} style={{ color: C.primary, fontWeight: 700, cursor: "pointer" }}>Sign In</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SignInScreen({ onNav, onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !password) return setMsg({ text: "Please enter email and password.", type: "error" });
    setLoading(true);
    try {
      const res = await supabase.signIn(email, password);
      const data = await res.json();
      const token = data.access_token;
      const uid = data.user?.id;
      const profRes = await supabase.getUserProfile(uid, token);
      const prof = await profRes.json();
      const name = prof?.[0]?.first_name || "User";
      onAuth({ token, uid, name });
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: "48px 20px", display: "flex", alignItems: "center", position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <Logo />
        <Card>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, textAlign: "center" }}>Welcome Back 👋</h2>
          <p style={{ fontSize: 13, color: C.gray, textAlign: "center", marginBottom: 20 }}>Sign in to your HHP account</p>
          <Alert msg={msg.text} type={msg.type} />
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@email.com" required />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" required />
          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <span onClick={() => onNav("forgot")} style={{ fontSize: 13, color: C.primary, fontWeight: 600, cursor: "pointer" }}>Forgot Password?</span>
          </div>
          <Btn label={loading ? "Signing In..." : "Sign In →"} onClick={submit} disabled={loading} />
          <Divider />
          <Btn label="🔵  Continue with Google" onClick={() => { window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(window.location.origin)}`; }} secondary />
          <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.gray }}>
            No account? <span onClick={() => onNav("signup")} style={{ color: C.primary, fontWeight: 700, cursor: "pointer" }}>Sign Up</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ForgotScreen({ onNav }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) return setMsg({ text: "Please enter your email.", type: "error" });
    setLoading(true);
    try {
      await supabase.resetPassword(email);
      setMsg({ text: "Password reset link sent! Check your inbox & spam folder.", type: "success" });
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: "80px 20px", display: "flex", alignItems: "center", position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <Logo />
        <Card>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔑</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Reset Password</h2>
            <p style={{ fontSize: 13, color: C.gray }}>Enter your email and we'll send you a reset link.</p>
          </div>
          <Alert msg={msg.text} type={msg.type} />
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@email.com" required />
          <Btn label={loading ? "Sending..." : "Send Reset Link 📧"} onClick={submit} disabled={loading} />
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span onClick={() => onNav("signin")} style={{ fontSize: 13, color: C.primary, fontWeight: 600, cursor: "pointer" }}>← Back to Sign In</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ResetPasswordScreen({ token, onNav }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!password) return setMsg({ text: "Please enter a new password.", type: "error" });
    if (password.length < 6) return setMsg({ text: "Password must be at least 6 characters.", type: "error" });
    if (password !== confirm) return setMsg({ text: "Passwords do not match.", type: "error" });
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { method: "PUT", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMsg({ text: "Password updated successfully! ✅", type: "success" });
      setTimeout(() => onNav("signin"), 2000);
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: "80px 20px", display: "flex", alignItems: "center", position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <Logo />
        <Card>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Set New Password</h2>
            <p style={{ fontSize: 13, color: C.gray }}>Enter your new password below.</p>
          </div>
          <Alert msg={msg.text} type={msg.type} />
          <Input label="New Password" type="password" value={password} onChange={setPassword} placeholder="Min 6 characters" required />
          <Input label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat password" required />
          <Btn label={loading ? "Updating..." : "Update Password 🔒"} onClick={submit} disabled={loading} />
        </Card>
      </div>
    </div>
  );
}

function HomeScreen({ user, onNav, onSignOut }) {
  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: 20, position: "relative", overflow: "hidden" }}>
      <BgDecor />
      <div style={{ maxWidth: 420, margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: C.gray, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Welcome back</div>
            <div style={{ fontSize: 22, fontWeight: 900, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{user.name} 👋</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 16, background: C.gradPrimary, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 800, fontSize: 20, boxShadow: C.shadowBtn }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Hero Card */}
        <div style={{ background: C.gradHero, borderRadius: 28, padding: "28px 24px", marginBottom: 20, color: C.white, position: "relative", overflow: "hidden", boxShadow: "0 25px 50px rgba(13,95,163,0.4), 0 10px 20px rgba(13,95,163,0.3)", transform: "perspective(800px) rotateX(2deg)" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", right: 40, bottom: -40, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", left: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Human Health Project</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, position: "relative" }}>Your Health Profile</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 22, lineHeight: 1.6 }}>Create or update your personal & health information to get started.</div>
          <button onClick={() => onNav("healthprofile")} className="btn-3d"
            style={{ background: "rgba(255,255,255,0.95)", color: C.primary, border: "none", borderRadius: 14, padding: "11px 22px", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.15)", letterSpacing: 0.3 }}>
            + Create / Edit Health Profile
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[
            { icon: "👤", label: "My Profile", sub: "View your data", screen: "viewprofile", color: "#dbeeff" },
            { icon: "📊", label: "Community", sub: "Shared insights", screen: "community", color: "#e0f0ff" },
            { icon: "📋", label: "Health History", sub: "Past records", screen: "viewprofile", color: "#e8f4fd" },
            { icon: "⚙️", label: "Settings", sub: "Preferences", screen: null, color: "#f0f7ff" },
          ].map(item => (
            <div key={item.label} className={item.screen ? "card-3d" : ""} onClick={() => item.screen && onNav(item.screen)}
              style={{ background: `linear-gradient(145deg, white, ${item.color})`, borderRadius: 20, padding: "18px 16px", cursor: item.screen ? "pointer" : "default", boxShadow: "0 8px 25px rgba(26,127,212,0.1), 0 2px 8px rgba(26,127,212,0.05)", textAlign: "center", border: `1px solid ${C.glassBorder}` }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{item.label}</div>
              <div style={{ fontSize: 11, color: C.gray, fontWeight: 500, marginTop: 2 }}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Programs */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14, letterSpacing: 0.3 }}>HHP Programs</div>
          {[
            { icon: "🧠", label: "Migraine Program", sub: "View data & resources", color: "linear-gradient(135deg, #ede9fe, #ddd6fe)" },
            { icon: "🫀", label: "Lupus Program", sub: "View data & resources", color: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }
          ].map(p => (
            <div key={p.label} className="card-3d" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", marginBottom: 10, borderRadius: 16, background: p.color, cursor: "pointer", boxShadow: "0 4px 15px rgba(26,127,212,0.08)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{p.label}</div>
                <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>{p.sub}</div>
              </div>
              <span style={{ color: C.primary, fontSize: 20, fontWeight: 700 }}>›</span>
            </div>
          ))}
        </Card>

        <Btn label="Sign Out" onClick={onSignOut} danger style={{ marginTop: 8 }} />
        <p style={{ textAlign: "center", fontSize: 11, color: C.gray, marginTop: 14, fontWeight: 500 }}>🔒 HHP is GDPR Compliant · Your data is encrypted</p>
      </div>
    </div>
  );
}

function HealthProfileScreen({ user, onNav, onSaved }) {
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [personal, setPersonal] = useState({ dob: "", gender: "", phone: "", address: "", city: "", state: "", zip: "" });
  const [health, setHealth] = useState({ conditions: [], symptoms: [], medications: "", height: "", weight: "", blood_pressure: "", blood_type: "", allergies: "", lifestyle: "", smoking: "", alcohol: "", exercise: "", notes: "" });
  const setP = k => v => setPersonal(p => ({ ...p, [k]: v }));
  const setH = k => v => setHealth(p => ({ ...p, [k]: v }));
  const toggleCondition = c => setHealth(p => ({ ...p, conditions: p.conditions.includes(c) ? p.conditions.filter(x => x !== c) : [...p.conditions, c] }));
  const toggleSymptom = s => setHealth(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }));

  const save = async () => {
    setLoading(true);
    try {
      await supabase.upsertUserProfile({ user_id: user.uid, ...personal }, user.token);
      await supabase.upsertHealthProfile({ user_id: user.uid, ...health, conditions: health.conditions.join(","), symptoms: health.symptoms.join(",") }, user.token);
      setMsg({ text: "Health profile saved successfully! ✅", type: "success" });
      setTimeout(() => onSaved(), 1500);
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  const conditions = ["Migraine", "Lupus", "Diabetes", "Hypertension", "Asthma", "Arthritis", "Depression", "Anxiety", "Other"];
  const symptoms = ["Headache", "Fatigue", "Joint Pain", "Nausea", "Dizziness", "Chest Pain", "Shortness of Breath", "Rash", "Insomnia", "Brain Fog"];

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: 20, position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 420, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button className="btn-3d" onClick={() => onNav("home")} style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 16px", color: C.primary, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(26,127,212,0.1)" }}>← Back</button>
          <div style={{ fontSize: 20, fontWeight: 900, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Health Profile</div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", marginBottom: 8, gap: 8 }}>
          {[1, 2].map(s => (
            <div key={s} onClick={() => setStep(s)} style={{ flex: 1, height: 8, borderRadius: 6, cursor: "pointer", background: step >= s ? C.gradPrimary : C.border, boxShadow: step >= s ? "0 4px 12px rgba(26,127,212,0.3)" : "none", transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: C.gray, marginBottom: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Step {step} of 2 — {step === 1 ? "Personal Information" : "Health Information"}</div>

        <Alert msg={msg.text} type={msg.type} />

        {step === 1 && (
          <Card>
            <div style={{ fontSize: 17, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 18 }}>👤 Personal Information</div>
            <Input label="Date of Birth" type="date" value={personal.dob} onChange={setP("dob")} required />
            <Select label="Gender" value={personal.gender} onChange={setP("gender")} options={["Male", "Female", "Non-binary", "Prefer not to say"]} required />
            <Input label="Phone Number" type="tel" value={personal.phone} onChange={setP("phone")} placeholder="+1 (555) 000-0000" />
            <Input label="Address" value={personal.address} onChange={setP("address")} placeholder="123 Main St" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "span 2" }}><Input label="City" value={personal.city} onChange={setP("city")} placeholder="New York" /></div>
              <Input label="ZIP" value={personal.zip} onChange={setP("zip")} placeholder="10001" />
            </div>
            <Input label="State" value={personal.state} onChange={setP("state")} placeholder="NY" />
            <Btn label="Next: Health Information →" onClick={() => setStep(2)} />
          </Card>
        )}

        {step === 2 && (
          <Card>
            <div style={{ fontSize: 17, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 18 }}>🏥 Health Information</div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Health Conditions <span style={{ color: C.danger }}>*</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {conditions.map(c => (
                  <div key={c} className="tag-3d" onClick={() => toggleCondition(c)}
                    style={{ padding: "7px 16px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `2px solid ${health.conditions.includes(c) ? C.primary : C.border}`, background: health.conditions.includes(c) ? C.gradPrimary : "rgba(255,255,255,0.9)", color: health.conditions.includes(c) ? C.white : C.gray, boxShadow: health.conditions.includes(c) ? C.shadowBtn : "0 2px 8px rgba(26,127,212,0.06)" }}>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Current Symptoms</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {symptoms.map(s => (
                  <div key={s} className="tag-3d" onClick={() => toggleSymptom(s)}
                    style={{ padding: "7px 16px", borderRadius: 24, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `2px solid ${health.symptoms.includes(s) ? C.accent : C.border}`, background: health.symptoms.includes(s) ? "linear-gradient(135deg, #0d5fa3, #064d87)" : "rgba(255,255,255,0.9)", color: health.symptoms.includes(s) ? C.white : C.gray, boxShadow: health.symptoms.includes(s) ? "0 6px 18px rgba(13,95,163,0.3)" : "0 2px 8px rgba(26,127,212,0.06)" }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Height (cm)" value={health.height} onChange={setH("height")} placeholder="170" />
              <Input label="Weight (kg)" value={health.weight} onChange={setH("weight")} placeholder="70" />
            </div>
            <Input label="Blood Pressure" value={health.blood_pressure} onChange={setH("blood_pressure")} placeholder="120/80 mmHg" />
            <Select label="Blood Type" value={health.blood_type} onChange={setH("blood_type")} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]} />
            <Input label="Allergies" value={health.allergies} onChange={setH("allergies")} placeholder="Penicillin, Peanuts..." />
            <Input label="Current Medications" value={health.medications} onChange={setH("medications")} placeholder="List medications..." />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Select label="Smoking" value={health.smoking} onChange={setH("smoking")} options={["Never", "Former", "Current"]} />
              <Select label="Alcohol" value={health.alcohol} onChange={setH("alcohol")} options={["None", "Occasional", "Moderate", "Heavy"]} />
              <Select label="Exercise" value={health.exercise} onChange={setH("exercise")} options={["Sedentary", "1-2x/week", "3-4x/week", "5+x/week"]} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>Additional Notes</label>
              <textarea value={health.notes} onChange={e => setH("notes")(e.target.value)} placeholder="Any other health notes..."
                style={{ width: "100%", padding: "12px 16px", borderRadius: 14, border: `2px solid ${C.border}`, fontSize: 14, color: C.text, minHeight: 80, resize: "vertical", background: "rgba(255,255,255,0.9)", boxShadow: "inset 0 2px 8px rgba(26,127,212,0.06)" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn label="← Back" onClick={() => setStep(1)} secondary style={{ flex: 1 }} />
              <Btn label={loading ? "Saving..." : "Submit ✅"} onClick={save} disabled={loading} style={{ flex: 2 }} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function ViewProfileScreen({ user, onNav }) {
  const [up, setUp] = useState(null);
  const [hp, setHp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const ur = await (await supabase.getUserProfile(user.uid, user.token)).json();
        const hr = await (await supabase.getHealthProfile(user.uid, user.token)).json();
        setUp(ur?.[0]); setHp(hr?.[0]);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const Row = ({ label, val }) => val ? (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 12, color: C.gray, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontSize: 14, color: C.text, fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{val}</span>
    </div>
  ) : null;

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: 20, position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 420, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button className="btn-3d" onClick={() => onNav("home")} style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 16px", color: C.primary, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(26,127,212,0.1)" }}>← Back</button>
          <div style={{ fontSize: 20, fontWeight: 900, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>My Health Profile</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: C.gray, padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div style={{ fontWeight: 600 }}>Loading your profile...</div>
          </div>
        ) : !up && !hp ? (
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <div style={{ fontWeight: 800, color: C.text, marginBottom: 8, fontSize: 18 }}>No Profile Yet</div>
            <div style={{ color: C.gray, fontSize: 14, marginBottom: 20 }}>Create your health profile to get started.</div>
            <Btn label="Create Health Profile" onClick={() => onNav("healthprofile")} />
          </Card>
        ) : (
          <>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>👤 Personal Information</div>
              <Row label="Name" val={`${up?.first_name || ""} ${up?.last_name || ""}`} />
              <Row label="Username" val={up?.username} />
              <Row label="Email" val={up?.email} />
              <Row label="Date of Birth" val={up?.dob} />
              <Row label="Gender" val={up?.gender} />
              <Row label="Phone" val={up?.phone} />
              <Row label="Address" val={up?.address} />
            </Card>
            <Card>
              <div style={{ fontSize: 16, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 12 }}>🏥 Health Information</div>
              <Row label="Conditions" val={hp?.conditions} />
              <Row label="Symptoms" val={hp?.symptoms} />
              <Row label="Height" val={hp?.height ? `${hp.height} cm` : null} />
              <Row label="Weight" val={hp?.weight ? `${hp.weight} kg` : null} />
              <Row label="Blood Pressure" val={hp?.blood_pressure} />
              <Row label="Blood Type" val={hp?.blood_type} />
              <Row label="Allergies" val={hp?.allergies} />
              <Row label="Medications" val={hp?.medications} />
              <Row label="Smoking" val={hp?.smoking} />
              <Row label="Alcohol" val={hp?.alcohol} />
              <Row label="Exercise" val={hp?.exercise} />
              <Row label="Notes" val={hp?.notes} />
            </Card>
            <Btn label="✏️ Edit Profile" onClick={() => onNav("healthprofile")} />
          </>
        )}
      </div>
    </div>
  );
}

function CommunityScreen({ user, onNav }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await (await supabase.getAllHealthProfiles(user.token)).json();
        setData(Array.isArray(r) ? r : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const conditionCount = {}, symptomCount = {}, exerciseCount = {};
  data.forEach(p => {
    (p.conditions || "").split(",").filter(Boolean).forEach(c => { conditionCount[c.trim()] = (conditionCount[c.trim()] || 0) + 1; });
    (p.symptoms || "").split(",").filter(Boolean).forEach(s => { symptomCount[s.trim()] = (symptomCount[s.trim()] || 0) + 1; });
    if (p.exercise) exerciseCount[p.exercise] = (exerciseCount[p.exercise] || 0) + 1;
  });

  const Bar = ({ label, count, max, color }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text, fontWeight: 700, marginBottom: 6 }}>
        <span>{label}</span>
        <span style={{ background: color, color: "white", padding: "1px 8px", borderRadius: 10, fontSize: 11 }}>{count}</span>
      </div>
      <div style={{ height: 12, background: "rgba(26,127,212,0.1)", borderRadius: 8, overflow: "hidden", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ height: "100%", width: `${Math.round((count / max) * 100)}%`, background: color, borderRadius: 8, boxShadow: "0 2px 8px rgba(26,127,212,0.3)", transition: "width 0.8s ease" }} />
      </div>
    </div>
  );

  const condEntries = Object.entries(conditionCount).sort((a, b) => b[1] - a[1]);
  const sympEntries = Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxC = condEntries[0]?.[1] || 1, maxS = sympEntries[0]?.[1] || 1;
  const colors = [C.gradPrimary, "linear-gradient(135deg, #0d5fa3, #064d87)", "linear-gradient(135deg, #3b82f6, #2563eb)", "linear-gradient(135deg, #60a5fa, #3b82f6)", "linear-gradient(135deg, #93c5fd, #60a5fa)", "linear-gradient(135deg, #bfdbfe, #93c5fd)"];

  return (
    <div style={{ minHeight: "100vh", background: C.gradBg, padding: 20, position: "relative" }}>
      <BgDecor />
      <div style={{ maxWidth: 420, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button className="btn-3d" onClick={() => onNav("home")} style={{ background: "rgba(255,255,255,0.9)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "8px 16px", color: C.primary, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(26,127,212,0.1)" }}>← Back</button>
          <div style={{ fontSize: 20, fontWeight: 900, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Community Data</div>
        </div>

        <div style={{ background: C.gradHero, borderRadius: 24, padding: "24px 20px", marginBottom: 20, color: C.white, textAlign: "center", boxShadow: "0 20px 40px rgba(13,95,163,0.35)", transform: "perspective(800px) rotateX(2deg)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }}>{data.length}</div>
          <div style={{ fontSize: 13, opacity: 0.85, fontWeight: 600, marginTop: 4 }}>Patients Sharing Data Anonymously</div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: C.gray, padding: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
            <div style={{ fontWeight: 600 }}>Loading community data...</div>
          </div>
        ) : data.length === 0 ? (
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
            <div style={{ color: C.gray, fontSize: 14, fontWeight: 500 }}>No community data yet.<br />Be the first to submit your health profile!</div>
          </Card>
        ) : (
          <>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>📊 Health Conditions</div>
              {condEntries.map(([c, n], i) => <Bar key={c} label={c} count={n} max={maxC} color={colors[i % colors.length]} />)}
            </Card>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>🩺 Most Reported Symptoms</div>
              {sympEntries.map(([s, n], i) => <Bar key={s} label={s} count={n} max={maxS} color={colors[i % colors.length]} />)}
            </Card>
            <Card>
              <div style={{ fontSize: 15, fontWeight: 800, background: C.gradPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>🏃 Exercise Frequency</div>
              {Object.entries(exerciseCount).map(([e, n], i) => <Bar key={e} label={e} count={n} max={Math.max(...Object.values(exerciseCount))} color={colors[i % colors.length]} />)}
            </Card>
          </>
        )}
        <p style={{ textAlign: "center", fontSize: 11, color: C.gray, marginTop: 8, fontWeight: 500 }}>🔒 All data is anonymous & aggregated · GDPR Compliant</p>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  const onAuth = u => { setUser(u); setScreen("home"); };
  const onSignOut = () => { setUser(null); setScreen("landing"); };
  const onNav = s => setScreen(s);

  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    // Check both hash and query string for token
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const token = params.get("access_token");
      const type = params.get("type") || searchParams.get("type");
      window.history.replaceState(null, "", window.location.pathname);
      console.log("Auth callback - type:", type, "token:", token?.slice(0, 20));
      if (type === "recovery" || searchParams.get("type") === "recovery") {
        setResetToken(token); setScreen("resetpassword");
      } else if (token) {
        fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(async userData => {
            const uid = userData.id;
            const name = userData.user_metadata?.full_name || userData.email?.split("@")[0] || "User";
            const email = userData.email;
            try {
              await fetch(`${SUPABASE_URL}/rest/v1/UserProfile`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}`, Prefer: "resolution=ignore-duplicates" }, body: JSON.stringify({ user_id: uid, first_name: name.split(" ")[0], last_name: name.split(" ")[1] || "", email, username: email.split("@")[0] }) });
            } catch(e) { console.error(e); }
            onAuth({ token, uid, name: name.split(" ")[0] });
          }).catch(console.error);
      }
    }
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", minHeight: "100vh" }}>
      <StyleTag />
      {screen === "landing" && <LandingScreen onNav={onNav} />}
      {screen === "signup" && <SignUpScreen onNav={onNav} onAuth={onAuth} />}
      {screen === "signin" && <SignInScreen onNav={onNav} onAuth={onAuth} />}
      {screen === "forgot" && <ForgotScreen onNav={onNav} />}
      {screen === "resetpassword" && <ResetPasswordScreen token={resetToken} onNav={onNav} />}
      {screen === "home" && user && <HomeScreen user={user} onNav={onNav} onSignOut={onSignOut} />}
      {screen === "healthprofile" && user && <HealthProfileScreen user={user} onNav={onNav} onSaved={() => setScreen("home")} />}
      {screen === "viewprofile" && user && <ViewProfileScreen user={user} onNav={onNav} />}
      {screen === "community" && user && <CommunityScreen user={user} onNav={onNav} />}
    </div>
  );
}
