import React from 'react';
import styles from '@/assets/style/yoga-teacher-india/yogateacherindia.module.css';
import Image from 'next/image';

const AboutSection = () => {
  return (
    <section className={styles.section}>
      {/* Decorative top border */}
      <div className={styles.topBorder}></div>

      <div className={styles.container}>
        {/* Header with vintage styling */}
        <div className={styles.header}>
          <div className={styles.superTitle}>THE FOUNDER & SPIRITUAL GUIDE</div>
          <h1 className={styles.mainTitle}>YOGI CHETAN MAHESH JI</h1>
          
          {/* Om Divider */}
          <div className={styles.omDivider}>
            <div className={styles.dividerLine}></div>
            <span className={styles.omSymbol}>ॐ</span>
            <div className={styles.dividerLine}></div>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>20+</span>
            <span className={styles.statLabel}>Years Experience</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>15,000+</span>
            <span className={styles.statLabel}>Students Trained</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>12+</span>
            <span className={styles.statLabel}>Countries Visited</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>2000</span>
            <span className={styles.statLabel}>Himalayan Pilgrimage</span>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className={styles.body}>
          {/* Left Column - Image and Quote */}
          <div className={styles.bodyLeft}>
            {/* Vintage Style Image Frame */}
            <div className={styles.imageFrame}>
              <div className={styles.imageContainer}>
                <Image
                  src="/images/yogi-chetan-mahesh.jpg"
                  alt="Yogi Chetan Mahesh Ji - Spiritual Yoga Master"
                  width={500}
                  height={600}
                  className={styles.profileImage}
                  priority
                />
                <div className={styles.imageOverlay}></div>
              </div>
              <div className={styles.imageCaption}>
                <span>Himalayan Yogi • Spiritual Guide • Yoga Master</span>
              </div>
            </div>

            {/* Inspirational Quote */}
            <div className={styles.quote}>
              <span className={styles.quoteMarks}>"</span>
              <p>Yoga is not just about touching your toes, it's about what you learn on the way down</p>
              <span className={styles.quoteMarks}>"</span>
            </div>

            {/* Yoga Styles */}
            <div className={styles.stylesBlock}>
              <div className={styles.stylesTitle}>MASTER OF TRADITIONAL YOGA</div>
              <div className={styles.stylesGrid}>
                <span className={styles.styleChip}>Hatha Yoga</span>
                <span className={styles.styleChip}>Ashtanga Yoga</span>
                <span className={styles.styleChip}>Kundalini</span>
                <span className={styles.styleChip}>Pranayama</span>
                <span className={styles.styleChip}>Meditation</span>
                <span className={styles.styleChip}>Yoga Anatomy</span>
              </div>
            </div>
          </div>

          {/* Right Column - Biography Content */}
          <div className={styles.bodyRight}>
            <div className={styles.para}>
              <p>
                <span className={styles.highlight}>Yogi Chetan Mahesh Ji</span> is the founder & director of AYM Yoga School. 
                With over <span className={styles.highlight}>20 years</span> of experience in practicing and teaching Hatha yoga 
                and Ashtanga yoga, he stands as one of the most respected spiritual yoga masters in Rishikesh.
              </p>
              
              <p>
                In <span className={styles.highlight}>1999-2000</span>, he was awarded for scoring meritorious (1st) position in 
                Diploma in Yoga by Morarji Desai National Institute of Yoga. His journey took a spiritual turn in 2000 when he 
                ventured into the Himalayas with his spiritual teacher Swami Tannayananda, where he awakened his Kundalini power 
                and mastered thousands of breathing and meditation techniques.
              </p>

              <h4>International Recognition</h4>
              <p>
                In 2000, he was deputed to <span className={styles.highlight}>Germany</span> by the Government of India to teach 
                and promote yoga. He further expanded his horizons by visiting <span className={styles.highlight}>China, South Korea, 
                Hong Kong, Singapore, Japan, and Malaysia</span>, spreading the ancient wisdom of yoga across continents.
              </p>

              <h4>Academic Excellence</h4>
              <p>
                He holds a Master's degree in Yoga Anatomy, Yoga Physiology, and Teaching Methodology. His academic achievements 
                include representing Swami Vivekananda College of Delhi University as a judge at the Delhi State Yoga Championship 
                (2001) and being a certified yoga speaker at the Xth International Yoga Festival in Pondicherry (2003).
              </p>
            </div>

            {/* Accreditations */}
            <div className={styles.accreditations}>
              <div className={styles.accBadge}>✓ Certified by Yoga Alliance USA (RYT 500)</div>
              <div className={styles.accBadge}>✓ International Yoga Federation Certified</div>
              <div className={styles.accBadge}>✓ Master of Science in Yoga (2003)</div>
              <div className={styles.accBadge}>✓ Morarji Desai National Institute of Yoga - Diploma Topper</div>
            </div>

            {/* Yoga Postures Showcase */}
            <div className={styles.postureGrid}>
              <div className={styles.postureItem}>
                <span>Ekapada Koundinyasana</span>
              </div>
              <div className={styles.postureItem}>
                <span>Dragon Fly Pose</span>
              </div>
              <div className={styles.postureItem}>
                <span>Flying Pigeon Pose</span>
              </div>
              <div className={styles.postureItem}>
                <span>Hanumanasana</span>
              </div>
              <div className={styles.postureItem}>
                <span>Purna Natrajasana</span>
              </div>
              <div className={styles.postureItem}>
                <span>Vrischikasana</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className={styles.ctaRow}>
          <div className={styles.ctaText}>
            <p>Join the legacy of 15,000+ certified yoga teachers. Transform your life through authentic yogic wisdom.</p>
          </div>
          <a href="#" className={styles.ctaBtn}>
            EXPLORE TEACHER TRAINING
            <span className={styles.ctaArrow}>→</span>
          </a>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className={styles.bottomBorder}></div>
    </section>
  );
};

export default AboutSection;