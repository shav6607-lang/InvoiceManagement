import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { lightTheme } from '../theme';
import velBg from '../assets/vel_background.png';

export const AuthLayout: React.FC = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />

      {/* ── Full-screen background image ── */}
      <div className="auth-bg" />

      {/* ── Full-screen dark overlay ── */}
      <div className="auth-overlay" />

      {/* ── Page content ── */}
      <div className="auth-root">

        {/* Left — branding */}
        <div className="auth-brand-content">
          <h1 className="auth-brand-title">Sri Madeshwara Stone Crusher</h1>
          <h2 className="auth-brand-subtitle">Invoice Management</h2>
          <p className="auth-brand-tagline">
            Streamline your invoices with precision &amp; grace
          </p>
          <div className="auth-brand-divider" />
          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <span className="auth-feature-icon">✦</span>
              <span>Fast Invoice Generation</span>
            </div>
            <div className="auth-brand-feature">
              <span className="auth-feature-icon">✦</span>
              <span>Real-time Tracking</span>
            </div>
            <div className="auth-brand-feature">
              <span className="auth-feature-icon">✦</span>
              <span>Secure &amp; Reliable</span>
            </div>
          </div>
        </div>

        {/* Right — login card (glassmorphism) */}
        <div className="auth-form-panel">
          <Outlet />
        </div>
      </div>

      <style>{`
        /* ══════════════════════════════════════════
           FULL-SCREEN BACKGROUND
        ══════════════════════════════════════════ */
        .auth-bg {
          position: fixed;
          inset: -15%;
          z-index: 0;
          background-image: url('${velBg}');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
          transform: rotate(-10deg) scale(1.3);
          transform-origin: center center;
        }

        /* ══════════════════════════════════════════
           DARK GRADIENT OVERLAY (over entire screen)
        ══════════════════════════════════════════ */
        .auth-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            120deg,
            rgba(5, 3, 18, 0.82) 0%,
            rgba(15, 8, 40, 0.70) 45%,
            rgba(30, 10, 10, 0.60) 100%
          );
        }

        /* ══════════════════════════════════════════
           ROOT FLEX LAYOUT (sits above bg + overlay)
        ══════════════════════════════════════════ */
        .auth-root {
          position: relative;
          z-index: 2;
          min-height: 100vh;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          padding: 48px 80px;
          box-sizing: border-box;
          gap: 40px;
        }

        /* ══════════════════════════════════════════
           LEFT — BRANDING
        ══════════════════════════════════════════ */
        .auth-brand-content {
          flex: 1 1 auto;
          text-align: left;
          animation: fadeInLeft 0.9s ease forwards;
          max-width: 520px;
        }

        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .auth-brand-logo {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 0 28px 0;
          box-shadow:
            0 0 0 4px rgba(245,158,11,0.20),
            0 0 50px rgba(245,158,11,0.55),
            0 0 100px rgba(245,158,11,0.25);
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(245,158,11,0.20),
              0 0 50px rgba(245,158,11,0.55),
              0 0 100px rgba(245,158,11,0.25);
          }
          50% {
            box-shadow:
              0 0 0 8px rgba(245,158,11,0.15),
              0 0 70px rgba(245,158,11,0.75),
              0 0 140px rgba(245,158,11,0.40);
          }
        }

        .auth-brand-icon {
          font-size: 40px;
          color: #fff;
        }

        .auth-brand-title {
          font-family: 'Inter', sans-serif;
          font-size: clamp(2.4rem, 4vw, 3.6rem);
          font-weight: 800;
          color: #fef3c7;
          margin: 0 0 8px;
          letter-spacing: -1px;
          line-height: 1.1;
          text-shadow: 0 4px 30px rgba(245,158,11,0.5);
        }

        .auth-brand-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 600;
          color: #fbbf24;
          margin: 0 0 20px;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .auth-brand-tagline {
          font-size: 1rem;
          color: rgba(255,255,255,0.68);
          margin: 0 0 36px;
          font-style: italic;
          max-width: 380px;
          line-height: 1.6;
        }

        .auth-brand-divider {
          width: 70px;
          height: 3px;
          background: linear-gradient(90deg, #f59e0b, #ef4444);
          border-radius: 2px;
          margin: 0 0 32px;
        }

        .auth-brand-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .auth-brand-feature {
          display: flex;
          align-items: center;
          gap: 14px;
          color: rgba(255,255,255,0.88);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .auth-feature-icon {
          color: #fbbf24;
          font-size: 0.7rem;
        }

        /* ══════════════════════════════════════════
           RIGHT — LOGIN CARD (frosted glass)
        ══════════════════════════════════════════ */
        .auth-form-panel {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeInRight 0.9s ease forwards;
        }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ══════════════════════════════════════════
           TABLET  ≤ 1024px  → stack, center form
        ══════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .auth-root {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 24px;
            text-align: center;
          }

          .auth-brand-content {
            text-align: center;
            max-width: 560px;
          }

          .auth-brand-logo {
            margin: 0 auto 24px;
          }

          .auth-brand-divider {
            margin: 0 auto 28px;
          }

          .auth-brand-features {
            align-items: center;
          }

          .auth-brand-tagline {
            margin-left: auto;
            margin-right: auto;
          }

          .auth-form-panel {
            width: 100%;
            max-width: 480px;
          }
        }

        /* ══════════════════════════════════════════
           MOBILE  ≤ 600px
        ══════════════════════════════════════════ */
        @media (max-width: 600px) {
          .auth-root {
            padding: 36px 16px;
            gap: 28px;
          }

          .auth-brand-logo {
            width: 64px;
            height: 64px;
          }

          .auth-brand-icon {
            font-size: 28px;
          }

          .auth-brand-title {
            font-size: 2rem;
          }

          .auth-brand-subtitle {
            font-size: 0.85rem;
          }

          .auth-brand-tagline {
            font-size: 0.85rem;
          }

          .auth-brand-features {
            display: none;
          }

          .auth-form-panel {
            width: 100%;
          }
        }
      `}</style>
    </ThemeProvider>
  );
};
