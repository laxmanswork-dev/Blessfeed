// Updated Structure snippet for Login.jsx
return (
  <div className="login-bg">
    <div className="login-card">
      <header className="brand-header">
        <h1 className="brand">BLESSFEED</h1>
        <p className="tagline">A moment for yourself</p>
      </header>

      {savedToken && savedUser && (
        <div className="resume-section" style={{ marginBottom: '24px' }}>
          <button className="login-submit-btn" onClick={() => navigate("/")}>
            Continue as {savedUser.split('@')[0]}
          </button>
          <div className="divider"><span>OR SIGN IN</span></div>
        </div>
      )}

      <form className="login-form" onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email address" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        {error && <p className="error-text" style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center' }}>{error}</p>}
        
        <button type="submit" className="login-submit-btn" disabled={loading}>
          {loading ? "Aligning..." : "Sign In"}
        </button>
      </form>

      <div className="divider"><span>OR</span></div>

      <button 
        className="google-btn" 
        onClick={() => window.location.href = `${API_URL}/api/auth/google`}
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" width="18" alt="" />
        Continue with Google
      </button>
    </div>
  </div>
);