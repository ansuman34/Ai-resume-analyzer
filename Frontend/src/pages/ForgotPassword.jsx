import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Background from "../components/Background";
import "../styles/auth.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSubmitStatus(null);

    // Validate email format on frontend first
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setSubmitStatus("error");
        // Handle validation errors array
        if (data.errors && Array.isArray(data.errors)) {
          setErrorMessage(data.errors.map(err => err.msg).join(', '));
        } else {
          setErrorMessage(data.error || 'Failed to process password reset request');
        }
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage('Network error. Please try again.');
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <Background />
      <div className="content-wrapper">
        <Link to="/" className="auth-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Home
        </Link>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <h1 className="auth-logo">ResuMax</h1>
            <h2>Reset Your Password</h2>
            <p>Enter the email address associated with your account, and we'll send you a link to reset your password.</p>
          </div>

          {submitStatus === "success" && (
            <motion.div
              className="success-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                color: '#22c55e',
                textAlign: 'center',
                fontSize: '14px'
              }}
            >
              ✓ Password reset email sent! Check your inbox and follow the link to reset your password.
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {submitStatus === "error" && errorMessage && (
              <div style={{
                color: '#ef4444',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isSubmitting || submitStatus === "success"}
              />
            </div>

            <motion.button
              type="submit"
              className="btn-auth-submit"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              disabled={isSubmitting || submitStatus === "success"}
              style={{ opacity: isSubmitting || submitStatus === "success" ? 0.7 : 1 }}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '12px' }}>
              Don't have an account?
            </p>
            <Link to="/register" style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s',
              display: 'block',
              marginBottom: '16px'
            }}>
              Create a new account
            </Link>
            <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '12px' }}>
              Remember your password?
            </p>
            <Link to="/login" style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}>
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
