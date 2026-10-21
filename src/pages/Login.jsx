import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to redirect after successful login — defaults to Home
  const redirectTo = location.state?.from?.pathname || '/';

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'login') {
      const result = login(formData.email, formData.password);
      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setErrorMsg(result.error);
      }
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setErrorMsg('Please fill in all fields.');
        return;
      }
      const result = register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate(redirectTo, { replace: true });
      } else {
        setErrorMsg(result.error);
      }
    }
  };

  return (
    <div style={{ maxWidth: '380px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px' }}>
      
      {/* Show a context banner if the user was redirected here */}
      {location.state?.from && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#8a6400',
          padding: '10px 12px',
          borderRadius: '4px',
          fontSize: '13px',
          marginBottom: '20px'
        }}>
          Please sign in to access <strong>{location.state.from.pathname}</strong>
        </div>
      )}

      <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {mode === 'login' ? <LogIn size={22} /> : <UserPlus size={22} />}
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mode === 'register' && (
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />

        {errorMsg && <p style={{ color: '#c40000', fontSize: '13px', margin: 0 }}>{errorMsg}</p>}

        <button type="submit" className="add-to-cart-btn" style={{ padding: '10px', fontWeight: 'bold' }}>
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '18px', fontSize: '13px', textAlign: 'center' }}>
        {mode === 'login' ? (
          <>Don't have an account?{' '}
            <span onClick={() => { setMode('register'); setErrorMsg(''); }} style={{ color: '#007185', cursor: 'pointer', fontWeight: 'bold' }}>
              Create one
            </span>
          </>
        ) : (
          <>Already have an account?{' '}
            <span onClick={() => { setMode('login'); setErrorMsg(''); }} style={{ color: '#007185', cursor: 'pointer', fontWeight: 'bold' }}>
              Sign in
            </span>
          </>
        )}
      </p>
    </div>
  );
}