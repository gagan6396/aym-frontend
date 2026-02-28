"use client";

import { useState } from "react";
import styles from "@/assets/style/Auth/login.module.css";

export default function LoginPage() {
  const [isActive, setIsActive] = useState(false);

  return (
    <main className={styles.pageWrapper}>
      <div
        className={`${styles.authWrapper} ${isActive ? styles.panelActive : ""}`}
        id="authWrapper"
      >
        {/* Register Form */}
        <div className={`${styles.authFormBox} ${styles.registerFormBox}`}>
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Create Account</h1>
            <div className={styles.omDividerSmall}>
              <span className={styles.omLineBar} />
              <span className={styles.omChar}>ॐ</span>
              <span className={styles.omLineBar} />
            </div>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href="#" aria-label="Google"><i className="fab fa-google" /></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
            </div>
            <span>or use your email for registration</span>
            <input type="text" placeholder="Full Name" required />
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
            <div className={styles.mobileSwitch}>
              <p>Already have an account?</p>
              <button type="button" onClick={() => setIsActive(false)}>Sign In</button>
            </div>
          </form>
        </div>

        {/* Login Form */}
        <div className={`${styles.authFormBox} ${styles.loginFormBox}`}>
          <form onSubmit={(e) => e.preventDefault()}>
            <h1>Sign In</h1>
            <div className={styles.omDividerSmall}>
              <span className={styles.omLineBar} />
              <span className={styles.omChar}>ॐ</span>
              <span className={styles.omLineBar} />
            </div>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
              <a href="#" aria-label="Google"><i className="fab fa-google" /></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>
            </div>
            <span>or use your account</span>
            <input type="email" placeholder="Email Address" required />
            <input type="password" placeholder="Password" required />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
            <div className={styles.mobileSwitch}>
              <p>Don&apos;t have an account?</p>
              <button type="button" onClick={() => setIsActive(true)}>Sign Up</button>
            </div>
          </form>
        </div>

        {/* Sliding Overlay Panel */}
        <div className={styles.slidePanelWrapper}>
          <div className={styles.slidePanel}>
            <div className={`${styles.panelContent} ${styles.panelContentLeft}`}>
              <h1>Welcome Back!</h1>
              <p>Stay connected by logging in with your credentials and continue your spiritual journey</p>
              <button className={styles.transparentBtn} type="button" onClick={() => setIsActive(false)}>
                Sign In
              </button>
            </div>
            <div className={`${styles.panelContent} ${styles.panelContentRight}`}>
              <h1>Namaste!</h1>
              <p>Begin your amazing yoga journey by creating an account with us today</p>
              <button className={styles.transparentBtn} type="button" onClick={() => setIsActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}