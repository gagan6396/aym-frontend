import React from "react";
import styles from "@/assets/style/Accreditationsection/Accreditationsection.module.css";

/* ── Data ── */
const yogaAllianceCerts = [
  { type: "RYS 200", since: "Feb 11, 2011", valid: "Feb 26, 2025" },
  { type: "RYS 300", since: "Feb 11, 2011", valid: "Feb 26, 2025" },
];

const ycbDetails = {
  name: "Association for Yoga and Meditation School (AYM Yoga School)",
  address: "Uppar Tapovan, Baba Balaknath Temple Street, Rishikesh, Uttarkhand",
  certNo: "YCB/20/YI/000003",
  issued: "12.03.2020",
  validFrom: "February 2020",
  validUpto: "January 2025",
  ceo: "Dr. I. V. Basavaraddi",
};

/* ── Sub-components ── */
const OmDivider = () => (
  <div className={styles.omDivider}>
    <span className={styles.divLine} />
    <span className={styles.omSun}>☀</span>
    <span className={styles.divLine} />
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.sectionTitleWrap}>
    <OmDivider />
    <h3 className={styles.sectionTitle}>{children}</h3>
  </div>
);

/* ── Main Component ── */
export const AccreditationSection: React.FC = () => {
  return (
    <section className={styles.section}>
      {/* ══════════════════════════════════════════
          PART 1 — Registered Yoga School Header
      ══════════════════════════════════════════ */}
      <div className={styles.container}>
        <h2 className={styles.mainTitle}>
          Registered Yoga School in Rishikesh - Indian Yoga Association
        </h2>

        <div className={styles.introParagraphs}>
          <p>
            The <strong>Indian Yoga Association</strong>, also known as the
            Association for Yoga and Meditation, is a national non-profit
            organisation registered under the Societies Registration Act with the
            Government of India. The Association manages the AYM Yoga School,
            which offers teacher training programs in Rishikesh, Goa, and many
            other locations, coming soon. It is registered with the Yoga
            Certification Board, under the Ministry of AYUSH, Government of India
            and <strong>Yoga Alliance, USA</strong>.
          </p>
          <p>
            AYM is a Registered Yoga Alliance Yoga Teacher Training School offers
            200 hour, 300 hour and 500 hour yoga alliance certification in
            Rishikesh India and graduates can register them with Yoga Alliance USA
            as RYT 200 and RYT 500 after graduation from AYM yoga alliance yoga
            school. To register you need to login to yoga alliance website —{" "}
            <a
              href="https://www.yogaalliance.org"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              www.yogaalliance.org
            </a>{" "}
            and make your account and fill required information. After verification
            of your graduation certification from AYM yoga alliance ttc in
            rishikesh, you will get registered.
          </p>
        </div>

        <OmDivider />

        {/* Registered banner */}
        <div className={styles.registeredBanner}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerLogo}>
              <div className={styles.logoCircle}>
                <span className={styles.logoInner}>AYM</span>
                <span className={styles.logoSubtext}>Association for Yoga and Meditation</span>
              </div>
            </div>
            <p className={styles.bannerSchoolName}>AYM Yoga School</p>
          </div>
          <div className={styles.bannerCenter}>
            <div className={styles.yogi}>🧘</div>
            <p className={styles.bannerTagline}>
              Registered With<br />
              <strong>Yoga Alliance</strong><br />
              USA
            </p>
          </div>
          <div className={styles.badgesGrid}>
            {["RYS 200", "RYS 500", "RYS 300"].map((b) => (
              <div key={b} className={styles.rysBadge}>
                <span className={styles.rysLabel}>{b.split(" ")[0]}</span>
                <span className={styles.rysNum}>{b.split(" ")[1]}</span>
                <span className={styles.rysYa}>yoga alliance</span>
                <div className={styles.rysRing} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PART 2 — Yoga Alliance Certificates
      ══════════════════════════════════════════ */}
      <div className={styles.container}>
        <SectionTitle>YOGA ALLIANCE, USA - RYS 200, 300</SectionTitle>

        <div className={styles.certGrid}>
          {yogaAllianceCerts.map((cert) => (
            <div key={cert.type} className={styles.certCard}>
              {/* Yoga Alliance logo mock */}
              <div className={styles.yaLogoWrap}>
                <div className={styles.yaFlower}>✿</div>
                <div className={styles.yaLogoText}>
                  <span className={styles.yaWord}>yoga</span>
                  <span className={styles.yaAlliance}>ALLIANCE</span>
                </div>
              </div>
              <div className={styles.certBanner}>CERTIFICATE OF REGISTRATION</div>
              <div className={styles.certBody}>
                <h4 className={styles.certOrg}>Association For Yoga and Meditation</h4>
                <p className={styles.certSub}>
                  Association For Yoga &amp; Meditation — {cert.type}
                </p>
                <p className={styles.certMeta}>RYS Member Since: {cert.since}</p>
                <p className={styles.certMeta}>Training Program Valid Through: {cert.valid}</p>
                <div className={styles.certFootRow}>
                  <div className={styles.certSig}>
                    <span className={styles.sigLine}>~Shannon~</span>
                    <p className={styles.sigName}>Shannon Roche</p>
                    <p className={styles.sigTitle}>President and Chief Executive Officer</p>
                  </div>
                  <div className={styles.rysStamp}>
                    <span className={styles.stampRing}>
                      <span className={styles.stampRYS}>RYS</span>
                      <span className={styles.stampNum}>{cert.type.split(" ")[1]}</span>
                      <span className={styles.stampYa}>yoga alliance</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PART 3 — Yoga Certification Board
      ══════════════════════════════════════════ */}
      <div className={styles.container}>
        <SectionTitle>Yoga Certification Board</SectionTitle>

        <div className={styles.ycbCard}>
          <div className={styles.ycbHeader}>
            <div className={styles.ycbHeaderLeft}>
              <div className={styles.ycbEmblem}>🏛️</div>
            </div>
            <div className={styles.ycbHeaderCenter}>
              <h3 className={styles.ycbBoardTitle}>YOGA CERTIFICATION BOARD</h3>
              <p className={styles.ycbMinistry}>MINISTRY OF AYUSH, GOVERNMENT OF INDIA</p>
              <div className={styles.ycbOrnament}>〰〰〰</div>
              <p className={styles.ycbSubhead}>ACCREDITATION CERTIFICATE</p>
              <h4 className={styles.ycbInstType}>YOGA INSTITUTION</h4>
              <div className={styles.ycbOrnament}>—❋—</div>
            </div>
            <div className={styles.ycbHeaderRight}>
              <div className={styles.ycbAyushLogo}>
                <span>Ministry of AYUSH</span>
                <span>Government of India</span>
              </div>
            </div>
          </div>

          <div className={styles.ycbContent}>
            <p className={styles.ycbBody}>
              This is to certify that <em>Association for Yoga and Meditation School (AYM Yoga School),
              Uppar Tapovan, Baba Balaknath Temple Street, Rishikesh, Uttarkhand</em> has been assessed
              as per the YCB guidelines for accreditation of the institute and approved as a Yoga
              Institution. Validity of the certificate is subject to continued compliance to the prescribed
              YCB guidelines for accreditation and scope of work.
            </p>

            <div className={styles.ycbScope}>
              <h5 className={styles.ycbScopeTitle}>SCOPE OF WORK</h5>
              <ul className={styles.ycbScopeList}>
                <li>
                  To run courses equivalent to certifications offered by the YCB for Yoga professionals
                  under these categories — Yoga Volunteer, Yoga Protocol Instructor, Yoga Wellness
                  Instructor and Yoga Teacher &amp; Evaluator.
                </li>
                <li>To conduct assessment for its own candidates as per YCB guidelines.</li>
              </ul>
            </div>

            <div className={styles.ycbFooter}>
              <div className={styles.ycbMeta}>
                <span>Issue Date: {ycbDetails.issued}</span>
                <span>Certificate No.: {ycbDetails.certNo}</span>
                <span>Valid from: {ycbDetails.validFrom}</span>
                <span>Valid upto: {ycbDetails.validUpto}</span>
              </div>
              <div className={styles.ycbCeoSig}>
                <span className={styles.ycbSigLine}>~ Dr. Basavaraddi ~</span>
                <p className={styles.ycbCeoName}>{ycbDetails.ceo}</p>
                <p className={styles.ycbCeoTitle}>Chief Executive Officer</p>
              </div>
            </div>

            <div className={styles.ycbAddress}>
              Yoga Certification Board, Ministry of AYUSH, Govt. of India, 68, Ashok Road, New Delhi - 110001
              | Ph.: +91-11-23354634, 23354695 | Email: ycb18-mdniy@nic.in | Website: www.yogacertificationboard.nic.in
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PART 4 — International Yoga Federation
      ══════════════════════════════════════════ */}
      <div className={styles.container}>
        <SectionTitle>International yoga Federation</SectionTitle>

        <div className={styles.iyfBody}>
          <p>
            Association for Yoga and Meditation school in rishikesh is also member and affiliated to
            International Yoga Federation is the largest yoga organization in the world and is open to
            all yogis and yoga organizations. IYF supports the minimum international standards for yoga
            teachers from 1987. Graduates from AYM Yoga School in rishikesh can also registered with
            International Yoga Federation and can get International Yoga teacher Card. For registration,
            graduated need to login to their website and has to create their account after filling needed
            information, you will get registered.
          </p>
        </div>

        <OmDivider />

        {/* IYF + IRYA stamp */}
        <div className={styles.iyfStampWrap}>
          <div className={styles.iyfStamp}>
            <div className={styles.stampBorder}>
              <div className={styles.iyfCircle}>
                <span className={styles.iyfCircleText}>IYF</span>
                <span className={styles.iyfCircleSub}>International Yoga Federation</span>
              </div>
              <div className={styles.iryaCircle}>
                <span className={styles.iryaLabel}>IRYA</span>
                <span className={styles.iryaNum}>500</span>
              </div>
              <p className={styles.irya500Sub}>International Registered Yoga Association</p>
            </div>
          </div>
        </div>

        <OmDivider />

        <div className={styles.iyfFooterNotes}>
          <p>
            200 hour, 300 hour and 500-hour yoga alliance certification in india at AYM school is also
            recognized by Indian Yoga Alliance.
          </p>
          <p>
            Association for yoga and meditation is also lifetime member of Yoga Alliance International
            visit,{" "}
            <a
              href="http://www.yogaallianceinternational.net"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              http://www.yogaallianceinternational.net
            </a>
          </p>
          <p>
            International Quality Management System has recognized Association for Yoga and Meditation
            for its 200-hour, 300-hour and 500-hour yoga teacher training in rishikesh India.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AccreditationSection;