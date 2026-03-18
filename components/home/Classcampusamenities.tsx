"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../../assets/style/Home/Classcampusamenities.module.css";
import api from "@/lib/api";

/* ─────────────────────────────────────────
   Type
───────────────────────────────────────── */
interface SectionData {
  /* Class Size */
  classSizeSuperLabel: string;
  classSizeTitle: string;
  classSizeWelcomeText: string;
  classSizeHighlight: string;
  classSizePara: string;
  classSizeImage: string;

  /* Campus */
  campusSuperLabel: string;
  campusTitle: string;
  campusHighlight: string;
  campusPara: string;
  campusImages: string[];        // array — we use [0]

  /* Amenities */
  amenitiesSuperLabel: string;
  amenitiesTitle: string;
  amenitiesMainPara: string;
  amenitiesSubLabel: string;
  amenities: string[];
  amenityMosaicTag: string;
  amenityImage: string;
}

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export const ClassCampusAmenities: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [data, setData] = useState<SectionData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/class-campus-amenities");
        if (res.data.success && res.data.data?.length > 0) {
          setData(res.data.data[0]);
        }
      } catch (err) {
        console.error("ClassCampusAmenities fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── Intersection observer (runs after data loads) ── */
  useEffect(() => {
    if (!data) return;
    const els = sectionRef.current?.querySelectorAll(`.${styles.reveal}`);
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add(styles.revealed);
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [data]);

  /* ── Loading state ── */
  if (loading) return null; // or a skeleton — returns nothing until data arrives

  /* ── No data ── */
  if (!data) return null;

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.topBorder} />

      <div className={styles.container}>
        {/* ══════════════════════════════════════
            TOP ROW — Class Size + Campus
        ══════════════════════════════════════ */}
        <div className={styles.topRow}>

          {/* ── AYM CLASS SIZE ── */}
          <div className={`${styles.classBlock} ${styles.reveal}`}>
            <div className={styles.blockHeader}>
              <p className={styles.superLabel}>{data.classSizeSuperLabel}</p>
              <h2 className={styles.blockTitle}>{data.classSizeTitle}</h2>
              <div className={styles.titleBar} />
            </div>

            <div className={styles.classImgWrap}>
              <div className={styles.classImgFrame}>
                <img
                  src={data.classSizeImage}
                  alt="AYM Yoga Class Group"
                  className={styles.classImg}
                />
                <div className={styles.classImgOverlay}>
                  <span className={styles.welcomeScript}>
                    {data.classSizeWelcomeText}
                  </span>
                </div>
                <span className={styles.cornerTL} aria-hidden="true" />
                <span className={styles.cornerBR} aria-hidden="true" />
              </div>
            </div>

            {/* HTML from JoditEditor — rendered safely (admin-only input) */}
            <div
              className={styles.blockPara}
              dangerouslySetInnerHTML={{ __html: data.classSizePara }}
            />
          </div>

          {/* ── Vertical divider ── */}
          <div className={styles.vertDivider} aria-hidden="true">
            <span className={styles.vertLine} />
            <span className={styles.vertOm}>ॐ</span>
            <span className={styles.vertLine} />
          </div>

          {/* ── AYM YOGA CAMPUS ── */}
          <div
            className={`${styles.campusBlock} ${styles.reveal}`}
            style={{ "--d": "0.15s" } as React.CSSProperties}
          >
            <div className={styles.blockHeader}>
              <p className={styles.superLabel}>{data.campusSuperLabel}</p>
              <h2 className={styles.blockTitle}>{data.campusTitle}</h2>
              <div className={styles.titleBar} />
            </div>

            {/* Single campus image (index 0) */}
            {data.campusImages?.[0] && (
              <div className={styles.campusThumb}>
                <img
                  src={data.campusImages[0]}
                  alt="AYM Yoga Campus"
                  className={styles.campusThumbImg}
                />
              </div>
            )}

            {/* HTML from JoditEditor */}
            <div
              className={styles.blockPara}
              dangerouslySetInnerHTML={{ __html: data.campusPara }}
            />
          </div>
        </div>

        {/* ── Mid ornament ── */}
        <div className={styles.midOrnament}>
          <span className={styles.ornLine} />
          <span className={styles.ornPattern}>✦ 卐 ✦ ॐ ✦ 卐 ✦</span>
          <span className={styles.ornLine} />
        </div>

        {/* ══════════════════════════════════════
            AMENITIES ROW
        ══════════════════════════════════════ */}
        <div className={styles.amenitiesRow}>

          {/* Left — text */}
          <div className={`${styles.amenitiesLeft} ${styles.reveal}`}>
            <div className={styles.blockHeader}>
              <p className={styles.superLabel}>{data.amenitiesSuperLabel}</p>
              <h2 className={styles.amenitiesTitle}>{data.amenitiesTitle}</h2>
              <div className={styles.titleBar} />
            </div>

            {/* HTML from JoditEditor */}
            <div
              className={styles.amenPara}
              dangerouslySetInnerHTML={{ __html: data.amenitiesMainPara }}
            />

            {data.amenitiesSubLabel && (
              <p className={styles.blockParaSm}>{data.amenitiesSubLabel}</p>
            )}

            <ul className={styles.amenityList}>
              {data.amenities.map((item, i) => (
                <li
                  key={i}
                  className={`${styles.amenityItem} ${styles.reveal}`}
                  style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}
                >
                  <span className={styles.bullet} aria-hidden="true">ॐ</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — room image */}
          <div
            className={`${styles.amenitiesRight} ${styles.reveal}`}
            style={{ "--d": "0.12s" } as React.CSSProperties}
          >
            <div className={styles.amenityMosaic}>
              <img
                src={data.amenityImage}
                alt="Furnished Room"
                className={styles.mosaicImg}
              />
              {data.amenityMosaicTag && (
                <div className={styles.mosaicMainOverlay}>
                  <span className={styles.mosaicTag}>{data.amenityMosaicTag}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBorder} />
    </section>
  );
};

export default ClassCampusAmenities;