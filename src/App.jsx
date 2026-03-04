import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────
const SUPABASE_URL = "https://xspagkuyyvqqzlrudhjf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = (() => {
  const headers = { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` };
  const api = async (path, opts = {}) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { ...headers, ...(opts.headers || {}) }, ...opts });
    if (!res.ok) { const e = await res.json().catch(() => ({})); console.error("API Error:", e); throw new Error(e.message || e.error_description || JSON.stringify(e)); }
    return res;
  };
  const authApi = async (path, body) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, { method: "POST", headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.error || data.error_description || data.msg) { console.error("Auth Error:", data); throw new Error(data.error_description || data.message || data.msg || JSON.stringify(data)); }
    return { json: () => Promise.resolve(data) };
  };
  return {
    signUp: (email, password) => authApi("signup", { email, password }),
    signIn: (email, password) => authApi("token?grant_type=password", { email, password }),
    resetPassword: (email) => authApi("recover", { email }),
    getUser: (token) => fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
    upsertUserProfile: (data, token) => api("UserProfile?on_conflict=user_id", { method: "POST", headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(data) }),
    upsertHealthProfile: (data, token) => api("HealthProfile?on_conflict=user_id", { method: "POST", headers: { ...headers, Authorization: `Bearer ${token}`, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify(data) }),
    getUserProfile: (uid, token) => api(`UserProfile?user_id=eq.${uid}&select=*`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
    getHealthProfile: (uid, token) => api(`HealthProfile?user_id=eq.${uid}&select=*`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
    getAllHealthProfiles: (token) => api(`HealthProfile?select=*`, { headers: { ...headers, Authorization: `Bearer ${token}` } }),
  };
})();

// ─── DEBUG — Remove after fixing ──────────────────────────────────
console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("ANON_KEY starts with:", SUPABASE_ANON_KEY?.slice(0, 20));

// ─── COLORS ────────────────────────────────────────────────────────
const C = { primary: "#1a7fd4", light: "#e8f4fd", accent: "#0d5fa3", white: "#ffffff", gray: "#6b7280", lightGray: "#f3f8fd", border: "#cce0f5", danger: "#ef4444", success: "#22c55e", text: "#1e293b" };

// ─── COMPONENTS ────────────────────────────────────────────────────
const Input = ({ label, type = "text", value, onChange, placeholder, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}{required && <span style={{ color: C.danger }}> *</span>}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, background: C.white, outline: "none", boxSizing: "border-box" }} />
  </div>
);

const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{label}{required && <span style={{ color: C.danger }}> *</span>}</label>
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, background: C.white, boxSizing: "border-box" }}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Btn = ({ label, onClick, style = {}, disabled, secondary, danger }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer", transition: "opacity 0.2s",
      background: danger ? C.danger : secondary ? C.light : C.primary,
      color: secondary ? C.primary : C.white, opacity: disabled ? 0.6 : 1, ...style }}>
    {label}
  </button>
);

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 18, padding: 20, boxShadow: "0 2px 16px rgba(26,127,212,0.08)", marginBottom: 16, ...style }}>{children}</div>
);

const Logo = () => (
  <div style={{ textAlign: "center", marginBottom: 24 }}>
    <div style={{ width: 64, height: 64, borderRadius: 18, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: "0 4px 18px rgba(26,127,212,0.3)" }}>
      <span style={{ fontSize: 28 }}>🏥</span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: C.primary, letterSpacing: 1 }}>HHP</div>
    <div style={{ fontSize: 12, color: C.gray, fontWeight: 500 }}>Human Health Project</div>
  </div>
);

const Alert = ({ msg, type }) => msg ? (
  <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 14, fontSize: 13, fontWeight: 500,
    background: type === "error" ? "#fef2f2" : "#f0fdf4", color: type === "error" ? C.danger : C.success, border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}` }}>{msg}</div>
) : null;

// ─── SCREENS ───────────────────────────────────────────────────────

function LandingScreen({ onNav }) {
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.light} 0%, ${C.white} 60%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Logo />
      <p style={{ textAlign: "center", color: C.gray, fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>Your personal health companion.<br />Track, share, and understand your health data.</p>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <Btn label="Sign In" onClick={() => onNav("signin")} style={{ marginBottom: 12 }} />
        <Btn label="Create Account" onClick={() => onNav("signup")} secondary />
        <p style={{ textAlign: "center", fontSize: 12, color: C.gray, marginTop: 20 }}>By continuing, you agree to our Terms & Privacy Policy (GDPR Compliant)</p>
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
      const res = await supabase.signUp(f.email, f.password);
      const data = await res.json();
      const uid = data.user?.id;
      // Try to sign in immediately after signup
      const signInRes = await supabase.signIn(f.email, f.password);
      const signInData = await signInRes.json();
      const token = signInData.access_token;
      if (token && uid) {
        await supabase.upsertUserProfile({ user_id: uid, first_name: f.firstName, last_name: f.lastName, username: f.username, email: f.email }, token);
        onAuth({ token, uid, name: f.firstName });
      } else {
        setMsg({ text: "Account created! Please sign in.", type: "success" });
        setTimeout(() => onNav("signin"), 2000);
      }
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: "32px 20px", overflowY: "auto" }}>
      <div style={{ maxWidth: 400, margin: "0 auto" }}>
        <Logo />
        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 18, textAlign: "center" }}>Create Account</h2>
          <Alert msg={msg.text} type={msg.type} />
          <Input label="First Name" value={f.firstName} onChange={set("firstName")} placeholder="Jane" required />
          <Input label="Last Name" value={f.lastName} onChange={set("lastName")} placeholder="Doe" required />
          <Input label="Username" value={f.username} onChange={set("username")} placeholder="janedoe123" required />
          <Input label="Email" type="email" value={f.email} onChange={set("email")} placeholder="jane@email.com" required />
          <Input label="Confirm Email" type="email" value={f.confirmEmail} onChange={set("confirmEmail")} placeholder="jane@email.com" required />
          <Input label="Password" type="password" value={f.password} onChange={set("password")} placeholder="Min 6 characters" required />
          <Input label="Confirm Password" type="password" value={f.confirmPassword} onChange={set("confirmPassword")} placeholder="Repeat password" required />
          <Btn label={loading ? "Creating Account..." : "Sign Up"} onClick={submit} disabled={loading} />
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.gray }}>
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
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: "48px 20px", display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <Logo />
        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 18, textAlign: "center" }}>Welcome Back</h2>
          <Alert msg={msg.text} type={msg.type} />
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@email.com" required />
          <Input label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" required />
          <div style={{ textAlign: "right", marginBottom: 14 }}>
            <span onClick={() => onNav("forgot")} style={{ fontSize: 13, color: C.primary, fontWeight: 600, cursor: "pointer" }}>Forgot Password?</span>
          </div>
          <Btn label={loading ? "Signing In..." : "Sign In"} onClick={submit} disabled={loading} />
          <div style={{ display: "flex", alignItems: "center", margin: "16px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ padding: "0 12px", fontSize: 12, color: C.gray }}>OR</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
          <Btn label="🔵  Continue with Google" onClick={() => setMsg({ text: "Google Sign-In requires Supabase OAuth setup in your project dashboard.", type: "error" })} secondary />
          <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: C.gray }}>
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
      setMsg({ text: "Password reset link sent! Check your email.", type: "success" });
    } catch(err) { setMsg({ text: `Error: ${err.message}`, type: "error" }); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: "80px 20px", display: "flex", alignItems: "center" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <Logo />
        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6, textAlign: "center" }}>Reset Password</h2>
          <p style={{ fontSize: 13, color: C.gray, textAlign: "center", marginBottom: 18 }}>Enter your email and we'll send you a reset link.</p>
          <Alert msg={msg.text} type={msg.type} />
          <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="jane@email.com" required />
          <Btn label={loading ? "Sending..." : "Send Reset Link"} onClick={submit} disabled={loading} />
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <span onClick={() => onNav("signin")} style={{ fontSize: 13, color: C.primary, fontWeight: 600, cursor: "pointer" }}>← Back to Sign In</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HomeScreen({ user, onNav, onSignOut }) {
  return (
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, color: C.gray }}>Welcome back,</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{user.name} 👋</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 800, fontSize: 18 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, borderRadius: 20, padding: "24px 20px", marginBottom: 20, color: C.white, position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>Human Health Project</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Your Health Profile</div>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 20 }}>Create or update your personal & health information to get started.</div>
          <button onClick={() => onNav("healthprofile")}
            style={{ background: C.white, color: C.primary, border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            + Create / Edit Health Profile
          </button>
          <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { icon: "👤", label: "My Profile", screen: "viewprofile" },
            { icon: "📊", label: "Community Data", screen: "community" },
            { icon: "📋", label: "Health History", screen: "viewprofile" },
            { icon: "⚙️", label: "Settings", screen: null },
          ].map(item => (
            <div key={item.label} onClick={() => item.screen && onNav(item.screen)}
              style={{ background: C.white, borderRadius: 16, padding: "18px 14px", cursor: item.screen ? "pointer" : "default", boxShadow: "0 2px 10px rgba(26,127,212,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.label}</div>
            </div>
          ))}
        </div>

        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 12 }}>HHP Programs</div>
          {[{ icon: "🧠", label: "Migraine Program", color: "#ede9fe" }, { icon: "🫀", label: "Lupus Program", color: "#fce7f3" }].map(p => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{p.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{p.label}</div>
                <div style={{ fontSize: 12, color: C.gray }}>View data & resources</div>
              </div>
              <span style={{ color: C.primary, fontSize: 18 }}>›</span>
            </div>
          ))}
        </Card>

        <Btn label="Sign Out" onClick={onSignOut} danger style={{ marginTop: 8 }} />
        <p style={{ textAlign: "center", fontSize: 11, color: C.gray, marginTop: 12 }}>HHP is GDPR Compliant · Your data is encrypted</p>
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

  const toggleCondition = (c) => setHealth(p => ({ ...p, conditions: p.conditions.includes(c) ? p.conditions.filter(x => x !== c) : [...p.conditions, c] }));
  const toggleSymptom = (s) => setHealth(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }));

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
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => onNav("home")} style={{ background: C.light, border: "none", borderRadius: 10, padding: "8px 12px", color: C.primary, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Health Profile</div>
        </div>

        <div style={{ display: "flex", marginBottom: 24, gap: 8 }}>
          {[1, 2].map(s => (
            <div key={s} onClick={() => setStep(s)} style={{ flex: 1, height: 6, borderRadius: 4, cursor: "pointer", background: step >= s ? C.primary : C.border, transition: "background 0.3s" }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.gray, marginBottom: 16, fontWeight: 600 }}>Step {step} of 2 — {step === 1 ? "Personal Information" : "Health Information"}</div>

        <Alert msg={msg.text} type={msg.type} />

        {step === 1 && (
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginBottom: 16 }}>👤 Personal Information</div>
            <Input label="Date of Birth" type="date" value={personal.dob} onChange={setP("dob")} required />
            <Select label="Gender" value={personal.gender} onChange={setP("gender")} options={["Male", "Female", "Non-binary", "Prefer not to say"]} required />
            <Input label="Phone Number" type="tel" value={personal.phone} onChange={setP("phone")} placeholder="+1 (555) 000-0000" />
            <Input label="Address" value={personal.address} onChange={setP("address")} placeholder="123 Main St" />
            <Input label="City" value={personal.city} onChange={setP("city")} placeholder="New York" />
            <Input label="State" value={personal.state} onChange={setP("state")} placeholder="NY" />
            <Input label="ZIP Code" value={personal.zip} onChange={setP("zip")} placeholder="10001" />
            <Btn label="Next: Health Information →" onClick={() => setStep(2)} />
          </Card>
        )}

        {step === 2 && (
          <Card>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.primary, marginBottom: 16 }}>🏥 Health Information</div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Health Conditions <span style={{ color: C.danger }}>*</span></label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {conditions.map(c => (
                  <div key={c} onClick={() => toggleCondition(c)}
                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `2px solid ${health.conditions.includes(c) ? C.primary : C.border}`, background: health.conditions.includes(c) ? C.light : C.white, color: health.conditions.includes(c) ? C.primary : C.gray }}>
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>Current Symptoms</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {symptoms.map(s => (
                  <div key={s} onClick={() => toggleSymptom(s)}
                    style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `2px solid ${health.symptoms.includes(s) ? C.accent : C.border}`, background: health.symptoms.includes(s) ? "#e0f0ff" : C.white, color: health.symptoms.includes(s) ? C.accent : C.gray }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Height (cm)" value={health.height} onChange={setH("height")} placeholder="170" />
              <Input label="Weight (kg)" value={health.weight} onChange={setH("weight")} placeholder="70" />
            </div>
            <Input label="Blood Pressure" value={health.blood_pressure} onChange={setH("blood_pressure")} placeholder="120/80 mmHg" />
            <Select label="Blood Type" value={health.blood_type} onChange={setH("blood_type")} options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]} />
            <Input label="Allergies" value={health.allergies} onChange={setH("allergies")} placeholder="Penicillin, Peanuts..." />
            <Input label="Current Medications" value={health.medications} onChange={setH("medications")} placeholder="List medications..." />
            <Select label="Smoking Status" value={health.smoking} onChange={setH("smoking")} options={["Never", "Former", "Current"]} />
            <Select label="Alcohol Consumption" value={health.alcohol} onChange={setH("alcohol")} options={["None", "Occasional", "Moderate", "Heavy"]} />
            <Select label="Exercise Frequency" value={health.exercise} onChange={setH("exercise")} options={["Sedentary", "1-2x/week", "3-4x/week", "5+x/week"]} />
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>Additional Notes</label>
              <textarea value={health.notes} onChange={e => setH("notes")(e.target.value)} placeholder="Any other health notes..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.text, minHeight: 80, resize: "vertical", boxSizing: "border-box" }} />
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
        setUp(ur?.[0]);
        setHp(hr?.[0]);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const Row = ({ label, val }) => val ? (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ fontSize: 13, color: C.gray, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: C.text, fontWeight: 600, maxWidth: "60%", textAlign: "right" }}>{val}</span>
    </div>
  ) : null;

  return (
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => onNav("home")} style={{ background: C.light, border: "none", borderRadius: 10, padding: "8px 12px", color: C.primary, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>My Health Profile</div>
        </div>

        {loading ? <div style={{ textAlign: "center", color: C.gray, padding: 40 }}>Loading...</div> :
          !up && !hp ? (
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>No Profile Yet</div>
              <div style={{ color: C.gray, fontSize: 13, marginBottom: 16 }}>Create your health profile to get started.</div>
              <Btn label="Create Health Profile" onClick={() => onNav("healthprofile")} />
            </Card>
          ) : (
            <>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 8 }}>👤 Personal Information</div>
                <Row label="Name" val={`${up?.first_name || ""} ${up?.last_name || ""}`} />
                <Row label="Username" val={up?.username} />
                <Row label="Email" val={up?.email} />
                <Row label="Date of Birth" val={up?.dob} />
                <Row label="Gender" val={up?.gender} />
                <Row label="Phone" val={up?.phone} />
                <Row label="Address" val={up?.address} />
              </Card>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 8 }}>🏥 Health Information</div>
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

  const conditionCount = {};
  const symptomCount = {};
  const exerciseCount = {};
  data.forEach(p => {
    (p.conditions || "").split(",").filter(Boolean).forEach(c => { conditionCount[c.trim()] = (conditionCount[c.trim()] || 0) + 1; });
    (p.symptoms || "").split(",").filter(Boolean).forEach(s => { symptomCount[s.trim()] = (symptomCount[s.trim()] || 0) + 1; });
    if (p.exercise) exerciseCount[p.exercise] = (exerciseCount[p.exercise] || 0) + 1;
  });

  const Bar = ({ label, count, max, color }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text, fontWeight: 600, marginBottom: 4 }}>
        <span>{label}</span><span>{count}</span>
      </div>
      <div style={{ height: 10, background: C.border, borderRadius: 6 }}>
        <div style={{ height: "100%", width: `${Math.round((count / max) * 100)}%`, background: color || C.primary, borderRadius: 6, transition: "width 0.5s" }} />
      </div>
    </div>
  );

  const condEntries = Object.entries(conditionCount).sort((a, b) => b[1] - a[1]);
  const sympEntries = Object.entries(symptomCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxC = condEntries[0]?.[1] || 1;
  const maxS = sympEntries[0]?.[1] || 1;
  const colors = ["#1a7fd4", "#0d5fa3", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

  return (
    <div style={{ minHeight: "100vh", background: C.lightGray, padding: 20 }}>
      <div style={{ maxWidth: 420, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => onNav("home")} style={{ background: C.light, border: "none", borderRadius: 10, padding: "8px 12px", color: C.primary, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Community Health Data</div>
        </div>

        <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, borderRadius: 16, padding: 16, marginBottom: 16, color: C.white, textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 800 }}>{data.length}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Patients Sharing Data Anonymously</div>
        </div>

        {loading ? <div style={{ textAlign: "center", color: C.gray, padding: 40 }}>Loading community data...</div> :
          data.length === 0 ? (
            <Card style={{ textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
              <div style={{ color: C.gray, fontSize: 14 }}>No community data yet. Be the first to submit your health profile!</div>
            </Card>
          ) : (
            <>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 14 }}>📊 Health Conditions Distribution</div>
                {condEntries.map(([c, n], i) => <Bar key={c} label={c} count={n} max={maxC} color={colors[i % colors.length]} />)}
              </Card>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 14 }}>🩺 Most Reported Symptoms</div>
                {sympEntries.map(([s, n], i) => <Bar key={s} label={s} count={n} max={maxS} color={colors[i % colors.length]} />)}
              </Card>
              <Card>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginBottom: 14 }}>🏃 Exercise Frequency</div>
                {Object.entries(exerciseCount).map(([e, n], i) => <Bar key={e} label={e} count={n} max={Math.max(...Object.values(exerciseCount))} color={colors[i % colors.length]} />)}
              </Card>
            </>
          )}
        <p style={{ textAlign: "center", fontSize: 11, color: C.gray, marginTop: 8 }}>All data shown is anonymous & aggregated · GDPR Compliant</p>
      </div>
    </div>
  );
}

// ─── APP ───────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);

  const onAuth = (u) => { setUser(u); setScreen("home"); };
  const onSignOut = () => { setUser(null); setScreen("landing"); };
  const onNav = (s) => setScreen(s);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 480, margin: "0 auto", background: C.lightGray, minHeight: "100vh" }}>
      {screen === "landing" && <LandingScreen onNav={onNav} />}
      {screen === "signup" && <SignUpScreen onNav={onNav} onAuth={onAuth} />}
      {screen === "signin" && <SignInScreen onNav={onNav} onAuth={onAuth} />}
      {screen === "forgot" && <ForgotScreen onNav={onNav} />}
      {screen === "home" && user && <HomeScreen user={user} onNav={onNav} onSignOut={onSignOut} />}
      {screen === "healthprofile" && user && <HealthProfileScreen user={user} onNav={onNav} onSaved={() => setScreen("home")} />}
      {screen === "viewprofile" && user && <ViewProfileScreen user={user} onNav={onNav} />}
      {screen === "community" && user && <CommunityScreen user={user} onNav={onNav} />}
    </div>
  );
}
