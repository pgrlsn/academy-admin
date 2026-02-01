import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';
import './LoginPage.css';

type LoginStep = 'phone' | 'otp';

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<LoginStep>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate phone number
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      if (cleanNumber.length !== 10) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const response = await authApi.sendOtp(cleanNumber);
      if (response.status.code === 200) {
        setReferenceId(response.response.referenceId);
        setStep('otp');
      } else {
        throw new Error(response.status.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (otp.length !== 4) {
        throw new Error('Please enter a valid 4-digit OTP');
      }

      const response = await authApi.login({
        number: phoneNumber.replace(/\D/g, ''),
        otp,
        referenceId,
        loginFrom: 'desktop',
      });

      if (response.response.valid) {
        const { token, userBO } = response.response;
        if (!token || !userBO?.id) {
          throw new Error('User not found. Ensure your account has admin/desktop access.');
        }

        try {
          login(token, userBO);
          navigate(from, { replace: true });
        } catch (authError) {
          // Role check failed
          setError(authError instanceof Error ? authError.message : 'Access denied');
        }
      } else {
        throw new Error(
          response.response.exception || response.status.message || 'Invalid OTP'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setError('');
  };

  return (
    <div className="login-container">
      {/* Left Panel - Brand */}
      <div className="login-brand-panel">
        <div className="decorative-shape" />
        <div className="decorative-shape-2" />
        <div className="login-brand-content">
          <div className="login-brand-icon">
            <span>LSN</span>
          </div>
          <h1 className="login-brand-title">Training Academy</h1>
          <p className="login-brand-subtitle">
            Empowering riders with knowledge and skills for excellence on every delivery
          </p>
          <div className="login-features">
            <div className="login-feature-item">
              <span className="login-feature-icon">1</span>
              <span>Manage training videos and quizzes</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">2</span>
              <span>Track rider progress and completion</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-icon">3</span>
              <span>Configure mandatory training tracks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access the admin dashboard</p>
          </div>

          {/* Step Indicator */}
          <div className="login-step-indicator">
            <div className={`step-dot ${step === 'phone' ? 'active' : 'completed'}`} />
            <div className={`step-line ${step === 'otp' ? 'active' : ''}`} />
            <div className={`step-dot ${step === 'otp' ? 'active' : ''}`} />
          </div>

          {error && <div className="error-message">{error}</div>}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="login-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your 10-digit number"
                  maxLength={10}
                  disabled={isLoading}
                  required
                />
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <p className="otp-sent-message">
                  OTP sent to {phoneNumber}
                </p>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  disabled={isLoading}
                  required
                />
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button type="button" className="back-button" onClick={handleBack} disabled={isLoading}>
                Change Number
              </button>
            </form>
          )}

          <div className="login-footer">
            <p>Only authorized administrators can access this portal.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
