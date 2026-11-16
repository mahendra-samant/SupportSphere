import { Outlet } from "react-router-dom";
import "./AuthLayout.css";

function AuthLayout() {
  return (
    <main className="ss-auth-page">
      <section className="ss-auth-story" aria-label="About SupportSphere">
        <div className="ss-auth-brand">
          <span className="ss-auth-mark">SS</span>
          <span>SupportSphere</span>
        </div>

        <div className="ss-auth-story-copy">
          <span className="ss-auth-eyebrow">SUPPORT, IN SYNC</span>
          <h1>Every request deserves a clear resolution.</h1>
          <p>
            Bring customer conversations, team ownership and issue tracking
            together in one calm, organized workspace.
          </p>

          <div className="ss-auth-benefits">
            <div className="ss-auth-benefit">
              <span className="ss-auth-benefit-icon">01</span>
              <span>
                <strong>Stay organized</strong>
                <small>Keep every request in one place.</small>
              </span>
            </div>
            <div className="ss-auth-benefit">
              <span className="ss-auth-benefit-icon">02</span>
              <span>
                <strong>Work as one team</strong>
                <small>Make ownership and progress visible.</small>
              </span>
            </div>
            <div className="ss-auth-benefit">
              <span className="ss-auth-benefit-icon">03</span>
              <span>
                <strong>Resolve with confidence</strong>
                <small>Move issues forward with clarity.</small>
              </span>
            </div>
          </div>
        </div>

        <div className="ss-auth-story-footer">
          <span className="ss-auth-footer-dot" />
          One workspace. Better support experiences.
        </div>
        <div className="ss-auth-orbit ss-auth-orbit-one" />
        <div className="ss-auth-orbit ss-auth-orbit-two" />
      </section>

      <section className="ss-auth-main">
        <div className="ss-auth-card">
          <div className="ss-auth-card-heading">
            <span className="ss-auth-card-kicker">YOUR WORKSPACE</span>
            <h2>Welcome back</h2>
            <p>Sign in with your account to continue.</p>
          </div>

          <Outlet />

          <div className="ss-auth-secure-note">
            <span aria-hidden="true">●</span>
            Secure access to your SupportSphere workspace
          </div>
        </div>
        <p className="ss-auth-copyright">© {new Date().getFullYear()} SupportSphere</p>
      </section>
    </main>
  );
}

export default AuthLayout;
