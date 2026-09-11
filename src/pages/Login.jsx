import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Logo, Button, Input, COLORS } from "../components/ui";

/* Same Google Identity Services pattern as the public marketplace app —
   see public/index.html for the GSI script tag. Google-authenticated
   accounts are created as normal (non-admin) users by the backend, so
   the same is_admin check used for password login applies here too. */
function GoogleSignInButton({ onDenied }) {
  const { loginWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const handleCredential = async (response) => {
      try {
        const data = await loginWithGoogle(response.credential);
        if (!data.user?.is_admin) {
          onDenied("This account doesn't have admin access.");
          return;
        }
        navigate("/dashboard", { replace: true });
      } catch (e) {
        onDenied(e.message);
      }
    };

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: handleCredential });
      window.google.accounts.id.renderButton(buttonRef.current, { theme: "outline", size: "large", width: 336, text: "continue_with" });
    };

    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          renderButton();
        }
      }, 200);
      return () => clearInterval(interval);
    }
    
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="mt-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
    </div>
  );
}

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already signed in as an admin — no need to see the login screen again.
  if (user && user.is_admin) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (!data.user?.is_admin) {
        setError("This account doesn't have admin access.");
        return;
      }
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ backgroundColor: COLORS.bg }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6"><Logo size={40} /></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          <h1 className="text-xl font-bold text-gray-900 text-center">Admin sign in</h1>
          <p className="text-sm text-gray-500 text-center mt-1 mb-6">Sign in with your SHINEX admin account.</p>
          <form onSubmit={submit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="username" />
            <div className="relative">
              <Input label="Password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-[38px] text-gray-400">
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && <p className="text-sm text-red-500 flex items-center gap-1.5"><AlertCircle size={14} />{error}</p>}
            <Button className="w-full !py-3" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <GoogleSignInButton onDenied={setError} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-5">
          Access is controlled by your SHINEX account's admin permission — this page does not grant it.
        </p>
      </div>
    </div>
  );
}
