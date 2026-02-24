'use client';

import React, { useState } from 'react';
import styles from '../../assets/style/Contact-us/ContactPage.module.css';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 👇 Yaha backend API call laga sakte ho
    console.log(form);

    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });

    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className={styles.section}>
      <div className={styles.topBorder} />
      <div className={styles.bgWatermark}>ॐ</div>

      <div className={`${styles.corner} ${styles.cornerTL}`} />
      <div className={`${styles.corner} ${styles.cornerTR}`} />
      <div className={`${styles.corner} ${styles.cornerBL}`} />
      <div className={`${styles.corner} ${styles.cornerBR}`} />

      <div className={styles.container}>
        {/* ================= HEADER ================= */}
        <div className={styles.header}>
          <h1 className={styles.title}>Connect With AYM Yoga School</h1>
          <div className={styles.divider}>
            <span />
            <span className={styles.om}>ॐ</span>
            <span />
          </div>
          <p className={styles.subtitle}>
            We are here to guide you on your transformative yoga journey.
          </p>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className={styles.grid}>
          {/* ===== LEFT : FORM ===== */}
          <div className={styles.formCard}>
            <h2 className={styles.cardTitle}>Send Us a Message</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Message*</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className={styles.submitBtn}>
                Submit
              </button>

              {submitted && (
                <p className={styles.success}>
                  Thank you 🙏 Our team will contact you within 24 hours.
                </p>
              )}
            </form>
          </div>

          {/* ===== RIGHT : CONTACT INFO ===== */}
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>How to Reach Us</h2>

            <div className={styles.infoItem}>
              <span>🏫</span>
              <div>
                <h4>AYM Yoga School</h4>
                <p>Upper Tapovan, Rishikesh, Uttarakhand 249192</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>📞</span>
              <div>
                <h4>Phone</h4>
                <p>+91 75002 77709</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>✉️</span>
              <div>
                <h4>Email</h4>
                <p>aymindia@gmail.com</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <span>🕘</span>
              <div>
                <h4>Office Hours</h4>
                <p>9:00 AM – 6:00 PM (IST)</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= MAP ================= */}
        <div className={styles.mapSection}>
          <h2>Visit Us in Rishikesh</h2>
          <div className={styles.mapWrapper}>
            <iframe
              src="https://maps.google.com/maps?q=Upper%20Tapovan%20Rishikesh&t=&z=13&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className={styles.bottomBorder} />
    </section>
  );
};

export default ContactPage;