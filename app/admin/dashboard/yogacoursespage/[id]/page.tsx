"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/assets/style/Admin/dashboard/yogacoursespage/Yogacoursessection.module.css";
// import api from "@/lib/api";

/* ══════════════════════════════════════════════════════
   TYPES  (identical to Add page)
══════════════════════════════════════════════════════ */
interface CourseSectionHeader { eyebrow: string; sectionTitle: string; sectionDesc: string; }
interface CourseItem { _id?: string; hours: string; days: string; name: string; style: string; duration: string; certificate: string; feeShared: string; feePrivate: string; color: string; imgUrl: string; detailsLink: string; bookLink: string; }
interface WhoSection { eyebrow: string; sectionTitle: string; para1: string; para2: string; para3: string; para4: string; para5: string; chips: string[]; quoteText: string; quoteAttrib: string; }
interface TeachersSectionHeader { eyebrow: string; sectionTitle: string; introPara1: string; introPara1Highlight: string; introPara2: string; introPara2Highlight: string; ctaBtnText: string; ctaBtnLink: string; }
interface FounderSection { eyebrow: string; name: string; imgUrl: string; imgPreview: string; imgAlt: string; para1: string; para2: string; para3: string; para3Highlight: string; detailsBtnText: string; detailsBtnLink: string; bookBtnText: string; bookBtnLink: string; }
interface TeacherItem { _id?: string; name: string; surname: string; imgUrl: string; imgPreview: string; }
type Errors<T> = Partial<Record<keyof T, string>>;

/* ── Constants ── */
const CERT_OPTIONS  = ["100 Hour", "200 RYT", "300 RYT", "500 RYT"];
const STYLE_OPTIONS = ["Ashtanga / Hatha", "Hatha / Ashtanga Yoga", "Multi-Style Yoga", "Hatha / Multi-Style", "Kundalini Yoga", "Yin Yoga", "Vinyasa Flow"];
type TabId = "courses" | "who" | "teachersHeader" | "founder" | "teachers";

/* ══════════════════════════════════════════════════════
   MOCK DATA  (replace with real API calls)
══════════════════════════════════════════════════════ */
const MOCK_HEADER: CourseSectionHeader = {
  eyebrow: "Sacred Path of Yoga",
  sectionTitle: "Join Our Yoga Teacher Training in Rishikesh",
  sectionDesc: "Ready to embark on a transformative path with the power of Yoga? Join us today and discover clarity, peace of mind, and an overall healthy, happy spirit with the Indian Association for Yoga and Meditation.",
};
const MOCK_COURSES: CourseItem[] = [
  { _id: "c1", hours: "100 HOUR YOGA", days: "14 Days Program", name: "Beginner Yoga Course",     style: "Ashtanga / Hatha",      duration: "14 Days", certificate: "100 Hour", feeShared: "500",  feePrivate: "550",  color: "#8B5E3C", imgUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&q=80", detailsLink: "#", bookLink: "#" },
  { _id: "c2", hours: "200 HOUR YOGA", days: "24 Days Program", name: "Foundation Yoga Course",   style: "Hatha / Ashtanga Yoga", duration: "24 Days", certificate: "200 RYT",  feeShared: "749",  feePrivate: "899",  color: "#2D5A27", imgUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&q=80", detailsLink: "#", bookLink: "#" },
  { _id: "c3", hours: "300 HOUR YOGA", days: "28 Days Program", name: "Intermediate Yoga Course", style: "Multi-Style Yoga",      duration: "28 Days", certificate: "300 RYT",  feeShared: "849",  feePrivate: "999",  color: "#1A4A6B", imgUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80", detailsLink: "#", bookLink: "#" },
  { _id: "c4", hours: "500 HOUR YOGA", days: "56 Days Program", name: "Advanced Yoga Course",     style: "Hatha / Multi-Style",   duration: "56 Days", certificate: "500 RYT",  feeShared: "1649", feePrivate: "1949", color: "#7B3F00", imgUrl: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=600&q=80", detailsLink: "#", bookLink: "#" },
];
const MOCK_WHO: WhoSection = {
  eyebrow: "Open to All Seekers",
  sectionTitle: "Who Can Join Yoga TTC in Rishikesh?",
  para1: "An internationally certified hatha yoga teacher training course in Rishikesh does not limit itself to those who wish to pursue it as a vocation. It is suited for everyone who wants to learn and deepen their Yoga practice.",
  para2: "As you become part of yoga training in India, you will slowly uncover its benefits to your body and the peace you feel in your mind. Anyone between the age of 18–50 can be a part of our yoga retreats in Rishikesh.",
  para3: "Whether you want to become a yoga teacher, maintain an active lifestyle, lose weight or just experience the positivity that this ancient practice brings to life, you can choose to enrol for our yoga certification course in Rishikesh. Students, working professionals or individuals from other walks of life can explore this holistic Rishikesh yoga lifestyle.",
  para4: "Several of our yoga teachers accelerated their personal and spiritual growth by spreading the knowledge of authentic and traditional forms of Yoga. Once you start sharing and teaching others, it is a relearning of the Yogic techniques opening up newer avenues for yourself.",
  para5: "With a certified yoga course from Rishikesh, you can also explore it as a career opportunity. Seek solace in helping others better their bodies and mind. With a Yoga Alliance certificate, you can teach yoga globally. It's an asset to become a certified Yoga professional in India and abroad.",
  chips: ["Age 18–50 Welcome", "All Levels", "Career Opportunity", "Global Certification", "Mind & Body Growth", "Spiritual Awakening"],
  quoteText: "Yoga is the journey of the self, through the self, to the self.",
  quoteAttrib: "— Bhagavad Gita",
};
const MOCK_TEACHERS_HEADER: TeachersSectionHeader = {
  eyebrow: "Masters of the Ancient Art",
  sectionTitle: "Our Experienced Yoga Teachers",
  introPara1: "AYM has a highly qualified team of Yoga professionals who conduct hatha yoga teacher training in Rishikesh. They impart their yogic wisdom and teach students to form deeper connections with themselves. You will learn from expert yogis who have mastered the art and movements throughout their years of dedicated practice.",
  introPara1Highlight: "hatha yoga teacher training in Rishikesh",
  introPara2: "Our aim goes beyond just yoga teacher training — we are committed to promoting the practice of yoga in institutes across India. To support this vision, we also offer online yoga instructor courses in Rishikesh. Our certified yoga teachers form the pillars of strength that uphold AYM's reputation as the best yoga school in Rishikesh.",
  introPara2Highlight: "online yoga instructor courses in Rishikesh",
  ctaBtnText: "Our Teachers' Information",
  ctaBtnLink: "#",
};
const MOCK_FOUNDER: FounderSection = {
  eyebrow: "Founder of AYM Yoga School",
  name: "Yogi Chetan Mahesh",
  imgUrl: "",
  imgPreview: "",
  imgAlt: "Yogi Chetan Mahesh — Founder of AYM Yoga School",
  para1: "Yogi Chetan Mahesh, founder-director of AYM school has over 20 years of experience in teaching and practicing Hatha Yoga and Ashtanga Yoga.",
  para2: "His mastery of yogic practice serves as an extension for students to learn the best tips and techniques to perform yoga better. He and his group of teachers have taught more than 15,000 students at AYM, who are now successful yoga teachers. He is considered one of the best yoga instructors in India.",
  para3: "Achieving a significant milestone in his yogic journey, he is also a Gold Medal recipient in a district-level Yoga competition.",
  para3Highlight: "Gold Medal recipient",
  detailsBtnText: "Know More About Yogi Chetan Mahesh",
  detailsBtnLink: "#",
  bookBtnText: "Book Now",
  bookBtnLink: "#",
};
const MOCK_TEACHERS: TeacherItem[] = [
  { _id: "t1", name: "Dr. Mahesh",  surname: "Bhatt",   imgUrl: "", imgPreview: "" },
  { _id: "t2", name: "Yogi Deepak", surname: "Bisht",   imgUrl: "", imgPreview: "" },
  { _id: "t3", name: "Dr. Hemlata", surname: "Saklani", imgUrl: "", imgPreview: "" },
  { _id: "t4", name: "Yogi Ajay",   surname: "Kumar",   imgUrl: "", imgPreview: "" },
];

/* ══════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════ */
export default function EditYogaCoursesPage() {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [activeTab, setActiveTab]     = useState<TabId>("courses");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTab, setSavedTab]         = useState<TabId | null>(null);

  /* ── Form States ── */
  const [sectionHeader, setSectionHeader] = useState<CourseSectionHeader>({ eyebrow: "", sectionTitle: "", sectionDesc: "" });
  const [headerErrors, setHeaderErrors]   = useState<Errors<CourseSectionHeader>>({});
  const [courses, setCourses]             = useState<CourseItem[]>([]);
  const [courseErrors, setCourseErrors]   = useState<Errors<CourseItem>[]>([]);

  const [who, setWho]             = useState<WhoSection>({ eyebrow: "", sectionTitle: "", para1: "", para2: "", para3: "", para4: "", para5: "", chips: [], quoteText: "", quoteAttrib: "" });
  const [whoErrors, setWhoErrors] = useState<Errors<WhoSection>>({});

  const [teachersHeader, setTeachersHeader] = useState<TeachersSectionHeader>({ eyebrow: "", sectionTitle: "", introPara1: "", introPara1Highlight: "", introPara2: "", introPara2Highlight: "", ctaBtnText: "", ctaBtnLink: "" });
  const [thErrors, setThErrors]             = useState<Errors<TeachersSectionHeader>>({});

  const [founder, setFounder]           = useState<FounderSection>({ eyebrow: "", name: "", imgUrl: "", imgPreview: "", imgAlt: "", para1: "", para2: "", para3: "", para3Highlight: "", detailsBtnText: "", detailsBtnLink: "", bookBtnText: "", bookBtnLink: "" });
  const [founderErrors, setFounderErrors] = useState<Errors<FounderSection>>({});

  const [teachers, setTeachers]           = useState<TeacherItem[]>([]);
  const [teacherErrors, setTeacherErrors] = useState<Errors<TeacherItem>[]>([]);

  /* ── Fetch on mount ── */
  useEffect(() => {
    // Simulated API fetch — replace with:
    // const [hdr, crs, who, th, fnd, tch] = await Promise.all([
    //   api.get("/yoga-section/courses"),
    //   api.get("/yoga-section/who"),
    //   api.get("/yoga-section/teachersHeader"),
    //   api.get("/yoga-section/founder"),
    //   api.get("/yoga-section/teachers"),
    // ]);
    setTimeout(() => {
      setSectionHeader(MOCK_HEADER);
      setCourses(MOCK_COURSES);
      setWho(MOCK_WHO);
      setTeachersHeader(MOCK_TEACHERS_HEADER);
      setFounder(MOCK_FOUNDER);
      setTeachers(MOCK_TEACHERS);
      setPageLoading(false);
    }, 700);
  }, []);

  /* ══════════ HELPERS ══════════ */
  const setHdr = (k: keyof CourseSectionHeader, v: string) => { setSectionHeader((p) => ({ ...p, [k]: v })); setHeaderErrors((p) => ({ ...p, [k]: undefined })); };
  const updateCourse = (i: number, k: keyof CourseItem, v: string) => setCourses((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const addCourse    = () => { if (courses.length < 6) setCourses((p) => [...p, { hours: "", days: "", name: "", style: "", duration: "", certificate: "", feeShared: "", feePrivate: "", color: "#8B5E3C", imgUrl: "", detailsLink: "#", bookLink: "#" }]); };
  const removeCourse = (i: number) => setCourses((p) => p.filter((_, idx) => idx !== i));

  const setW = (k: keyof WhoSection, v: string) => { setWho((p) => ({ ...p, [k]: v })); setWhoErrors((p) => ({ ...p, [k]: undefined })); };
  const updateChip = (i: number, v: string) => setWho((p) => { const c = [...p.chips]; c[i] = v; return { ...p, chips: c }; });
  const addChip    = () => { if (who.chips.length < 8) setWho((p) => ({ ...p, chips: [...p.chips, ""] })); };
  const removeChip = (i: number) => setWho((p) => ({ ...p, chips: p.chips.filter((_, idx) => idx !== i) }));

  const setTH = (k: keyof TeachersSectionHeader, v: string) => { setTeachersHeader((p) => ({ ...p, [k]: v })); setThErrors((p) => ({ ...p, [k]: undefined })); };
  const setF  = (k: keyof FounderSection, v: string) => { setFounder((p) => ({ ...p, [k]: v })); setFounderErrors((p) => ({ ...p, [k]: undefined })); };
  const handleFounderImg = (file: File | null) => {
    if (!file) return;
    const r = new FileReader(); r.onload = (e) => setFounder((p) => ({ ...p, imgPreview: e.target?.result as string })); r.readAsDataURL(file);
  };
  const updateTeacher = (i: number, k: keyof TeacherItem, v: string) => setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const handleTeacherImg = (i: number, file: File | null) => {
    if (!file) return;
    const r = new FileReader(); r.onload = (e) => setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], imgPreview: e.target?.result as string }; return a; }); r.readAsDataURL(file);
  };
  const addTeacher    = () => { if (teachers.length < 10) setTeachers((p) => [...p, { name: "", surname: "", imgUrl: "", imgPreview: "" }]); };
  const removeTeacher = (i: number) => setTeachers((p) => p.filter((_, idx) => idx !== i));

  /* ══════════ VALIDATIONS ══════════ */
  const validateCourses = (): boolean => {
    let ok = true;
    const he: Errors<CourseSectionHeader> = {};
    if (!sectionHeader.eyebrow.trim())     { he.eyebrow     = "Required"; ok = false; }
    if (!sectionHeader.sectionTitle.trim()){ he.sectionTitle = "Required"; ok = false; }
    if (!sectionHeader.sectionDesc.trim()) { he.sectionDesc  = "Required"; ok = false; }
    setHeaderErrors(he);
    const ce = courses.map((c) => {
      const e: Errors<CourseItem> = {};
      if (!c.hours.trim())       { e.hours       = "Required"; ok = false; }
      if (!c.days.trim())        { e.days        = "Required"; ok = false; }
      if (!c.name.trim())        { e.name        = "Required"; ok = false; }
      if (!c.style.trim())       { e.style       = "Required"; ok = false; }
      if (!c.duration.trim())    { e.duration    = "Required"; ok = false; }
      if (!c.certificate.trim()) { e.certificate = "Required"; ok = false; }
      if (!c.feeShared.trim())   { e.feeShared   = "Required"; ok = false; }
      if (!c.feePrivate.trim())  { e.feePrivate  = "Required"; ok = false; }
      if (!c.imgUrl.trim())      { e.imgUrl      = "Required"; ok = false; }
      else if (!/^https?:\/\/.+/.test(c.imgUrl.trim())) { e.imgUrl = "Valid URL required"; ok = false; }
      return e;
    });
    setCourseErrors(ce);
    return ok;
  };
  const validateWho = (): boolean => {
    let ok = true;
    const e: Errors<WhoSection> = {};
    if (!who.eyebrow.trim())      { e.eyebrow      = "Required"; ok = false; }
    if (!who.sectionTitle.trim()) { e.sectionTitle  = "Required"; ok = false; }
    if (!who.para1.trim())        { e.para1         = "Required"; ok = false; }
    if (!who.para2.trim())        { e.para2         = "Required"; ok = false; }
    if (!who.para3.trim())        { e.para3         = "Required"; ok = false; }
    if (!who.para4.trim())        { e.para4         = "Required"; ok = false; }
    if (!who.para5.trim())        { e.para5         = "Required"; ok = false; }
    if (!who.quoteText.trim())    { e.quoteText      = "Required"; ok = false; }
    if (!who.quoteAttrib.trim())  { e.quoteAttrib    = "Required"; ok = false; }
    if (who.chips.some((c) => !c.trim())) { e.chips = "All chip labels must be filled"; ok = false; }
    setWhoErrors(e);
    return ok;
  };
  const validateTeachersHeader = (): boolean => {
    let ok = true;
    const e: Errors<TeachersSectionHeader> = {};
    if (!teachersHeader.eyebrow.trim())             { e.eyebrow             = "Required"; ok = false; }
    if (!teachersHeader.sectionTitle.trim())        { e.sectionTitle        = "Required"; ok = false; }
    if (!teachersHeader.introPara1.trim())          { e.introPara1          = "Required"; ok = false; }
    if (!teachersHeader.introPara1Highlight.trim()) { e.introPara1Highlight = "Required"; ok = false; }
    if (!teachersHeader.introPara2.trim())          { e.introPara2          = "Required"; ok = false; }
    if (!teachersHeader.introPara2Highlight.trim()) { e.introPara2Highlight = "Required"; ok = false; }
    if (!teachersHeader.ctaBtnText.trim())          { e.ctaBtnText          = "Required"; ok = false; }
    if (!teachersHeader.ctaBtnLink.trim())          { e.ctaBtnLink          = "Required"; ok = false; }
    setThErrors(e);
    return ok;
  };
  const validateFounder = (): boolean => {
    let ok = true;
    const e: Errors<FounderSection> = {};
    if (!founder.eyebrow.trim())        { e.eyebrow        = "Required"; ok = false; }
    if (!founder.name.trim())           { e.name           = "Required"; ok = false; }
    if (!founder.imgAlt.trim())         { e.imgAlt         = "Required"; ok = false; }
    if (!founder.para1.trim())          { e.para1          = "Required"; ok = false; }
    if (!founder.para2.trim())          { e.para2          = "Required"; ok = false; }
    if (!founder.para3.trim())          { e.para3          = "Required"; ok = false; }
    if (!founder.para3Highlight.trim()) { e.para3Highlight = "Required"; ok = false; }
    if (!founder.detailsBtnText.trim()) { e.detailsBtnText = "Required"; ok = false; }
    if (!founder.detailsBtnLink.trim()) { e.detailsBtnLink = "Required"; ok = false; }
    if (!founder.bookBtnText.trim())    { e.bookBtnText    = "Required"; ok = false; }
    if (!founder.bookBtnLink.trim())    { e.bookBtnLink    = "Required"; ok = false; }
    setFounderErrors(e);
    return ok;
  };
  const validateTeachers = (): boolean => {
    let ok = true;
    const errs = teachers.map((t) => {
      const e: Errors<TeacherItem> = {};
      if (!t.name.trim())    { e.name    = "Required"; ok = false; }
      if (!t.surname.trim()) { e.surname = "Required"; ok = false; }
      return e;
    });
    setTeacherErrors(errs);
    return ok;
  };

  /* ══════════ SUBMIT ══════════ */
  const handleSubmitTab = async (tab: TabId) => {
    const validators: Record<TabId, () => boolean> = {
      courses: validateCourses, who: validateWho,
      teachersHeader: validateTeachersHeader, founder: validateFounder, teachers: validateTeachers,
    };
    if (!validators[tab]()) return;
    try {
      setIsSubmitting(true);
      const payload: Record<TabId, any> = {
        courses:        { sectionHeader, courses: courses.map((c) => ({ ...c, fee: `${c.feeShared} USD / ${c.feePrivate} USD` })) },
        who:            who,
        teachersHeader: teachersHeader,
        founder:        founder,
        teachers:       teachers,
      };
      // await api.put(`/yoga-section/${tab}`, payload[tab]);
      console.log(`[EDIT][${tab}]`, payload[tab]);
      setSavedTab(tab);
      setTimeout(() => setSavedTab(null), 2500);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── tab error flags ── */
  const tabErr: Record<TabId, boolean> = {
    courses:        Object.keys(headerErrors).length > 0 || courseErrors.some((e) => Object.keys(e).length > 0),
    who:            Object.keys(whoErrors).length > 0,
    teachersHeader: Object.keys(thErrors).length > 0,
    founder:        Object.keys(founderErrors).length > 0,
    teachers:       teacherErrors.some((e) => Object.keys(e).length > 0),
  };
  const TAB_LABELS: Record<TabId, string> = {
    courses: "① Courses", who: "② Who Section",
    teachersHeader: "③ Teachers Intro", founder: "④ Founder", teachers: "⑤ Teachers Grid",
  };

  /* ── Inline field components ── */
  const TA = ({ label, hint, val, err, onCh, ph, rows = 3, max = 600, req = true }:
    { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; ph: string; rows?: number; max?: number; req?: boolean }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}</label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.inputWrap} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <textarea className={`${styles.input} ${styles.textarea}`} placeholder={ph} value={val} maxLength={max} rows={rows} onChange={(e) => onCh(e.target.value)} />
        <span className={`${styles.charCount} ${styles.charCountBottom}`}>{val.length}/{max}</span>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
  const TXT = ({ label, hint, val, err, onCh, ph, max = 150, req = true }:
    { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; ph: string; max?: number; req?: boolean }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}</label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.inputWrap} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <input type="text" className={styles.input} placeholder={ph} value={val} maxLength={max} onChange={(e) => onCh(e.target.value)} />
        <span className={styles.charCount}>{val.length}/{max}</span>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
  const LINK = ({ label, hint, val, err, onCh, ph, req = false }:
    { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; ph: string; req?: boolean }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}</label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <span className={styles.inputPrefix}>🔗</span>
        <input type="text" className={`${styles.input} ${styles.inputPrefixed}`} placeholder={ph} value={val} onChange={(e) => onCh(e.target.value)} />
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );

  /* ── Loading skeleton ── */
  if (pageLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.skeletonField} style={{ animationDelay: `${i * 0.1}s` }} />)}
        </div>
      </div>
    );
  }

  /* ── Saved toast ── */
  const SavedToast = ({ tab }: { tab: TabId }) => (
    savedTab === tab ? (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 1rem", background: "rgba(74,140,42,0.1)", border: "1px solid rgba(74,140,42,0.3)", borderRadius: 8, fontFamily: "'Cormorant Garamond', serif", fontSize: "0.88rem", color: "#2a5e1e", fontStyle: "italic" }}>
        ✓ Saved successfully
      </div>
    ) : null
  );

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.breadcrumbSep}>›</span>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard/yoga-courses")}>Yoga Courses</button>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Edit Page Content</span>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.editBadge}>✏️ Edit mode — changes save per section</div>
        <h1 className={styles.pageTitle}>Edit — Yoga Courses &amp; Teachers Page</h1>
        <p className={styles.pageSubtitle}>All sections pre-filled with current live data. Save each tab independently.</p>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabNav}>
        {(Object.keys(TAB_LABELS) as TabId[]).map((tab) => (
          <button key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""} ${tabErr[tab] ? styles.tabBtnError : ""}`}
            onClick={() => setActiveTab(tab)}>
            {tabErr[tab] && <span className={styles.tabDot} />}
            {savedTab === tab ? "✓ " : ""}{TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB 1 — COURSES SECTION
      ══════════════════════════════════════════════════ */}
      {activeTab === "courses" && (
        <div className={styles.formCard}>

          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Header</h3></div>
            <TXT label="Eyebrow Text" hint='Small text above the heading — e.g. "Sacred Path of Yoga"' val={sectionHeader.eyebrow} err={headerErrors.eyebrow} onCh={(v) => setHdr("eyebrow", v)} ph="e.g. Sacred Path of Yoga" max={80} />
            <TXT label="Section Title (H2)" hint="Main heading of the courses section" val={sectionHeader.sectionTitle} err={headerErrors.sectionTitle} onCh={(v) => setHdr("sectionTitle", v)} ph="e.g. Join Our Yoga Teacher Training in Rishikesh" />
            <TA  label="Section Description" hint="Paragraph below the heading (sectionDesc)" val={sectionHeader.sectionDesc} err={headerErrors.sectionDesc} onCh={(v) => setHdr("sectionDesc", v)} ph="Ready to embark on a transformative path…" max={400} rows={3} />
          </div>

          <div className={styles.formDivider} />

          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Course Cards</h3>
              <span className={styles.sectionBadge}>{courses.length}/6</span>
            </div>
            <div className={styles.certsList}>
              {courses.map((c, i) => (
                <div key={c._id || i} className={styles.certCard}>
                  <div className={styles.certCardHeader}>
                    <span className={styles.certCardNum}>{i + 1}</span>
                    <span className={styles.certCardTitle}>Course #{i + 1} — {c.name || "Untitled"}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => removeCourse(i)} disabled={courses.length <= 1}>✕ Remove</button>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Course Name<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Full name shown on card</p>
                        <div className={`${styles.inputWrap} ${courseErrors[i]?.name ? styles.inputError : ""} ${c.name && !courseErrors[i]?.name ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={100} placeholder="e.g. Beginner Yoga Course" value={c.name} onChange={(e) => updateCourse(i, "name", e.target.value)} />
                        </div>
                        {courseErrors[i]?.name && <p className={styles.errorMsg}>⚠ {courseErrors[i].name}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Hours Label<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Badge on image — e.g. 100 HOUR YOGA</p>
                        <div className={`${styles.inputWrap} ${courseErrors[i]?.hours ? styles.inputError : ""} ${c.hours && !courseErrors[i]?.hours ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={30} placeholder="e.g. 100 HOUR YOGA" value={c.hours} onChange={(e) => updateCourse(i, "hours", e.target.value)} />
                        </div>
                        {courseErrors[i]?.hours && <p className={styles.errorMsg}>⚠ {courseErrors[i].hours}</p>}
                      </div>
                    </div>
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Days Label<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Image tag — e.g. 14 Days Program</p>
                        <div className={`${styles.inputWrap} ${courseErrors[i]?.days ? styles.inputError : ""} ${c.days && !courseErrors[i]?.days ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={30} placeholder="e.g. 14 Days Program" value={c.days} onChange={(e) => updateCourse(i, "days", e.target.value)} />
                        </div>
                        {courseErrors[i]?.days && <p className={styles.errorMsg}>⚠ {courseErrors[i].days}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Duration<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Meta value — e.g. 14 Days</p>
                        <div className={`${styles.inputWrap} ${courseErrors[i]?.duration ? styles.inputError : ""} ${c.duration && !courseErrors[i]?.duration ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={20} placeholder="e.g. 14 Days" value={c.duration} onChange={(e) => updateCourse(i, "duration", e.target.value)} />
                        </div>
                        {courseErrors[i]?.duration && <p className={styles.errorMsg}>⚠ {courseErrors[i].duration}</p>}
                      </div>
                    </div>
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Course Style<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Type of yoga taught</p>
                        <select className={`${styles.select} ${courseErrors[i]?.style ? styles.inputError : ""}`} value={c.style} onChange={(e) => updateCourse(i, "style", e.target.value)}>
                          <option value="">— Select Style —</option>
                          {STYLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        {courseErrors[i]?.style && <p className={styles.errorMsg}>⚠ {courseErrors[i].style}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Certificate<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>International certification level</p>
                        <select className={`${styles.select} ${courseErrors[i]?.certificate ? styles.inputError : ""}`} value={c.certificate} onChange={(e) => updateCourse(i, "certificate", e.target.value)}>
                          <option value="">— Select —</option>
                          {CERT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        {courseErrors[i]?.certificate && <p className={styles.errorMsg}>⚠ {courseErrors[i].certificate}</p>}
                      </div>
                    </div>
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Shared Room Fee (USD)<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Shared accommodation price</p>
                        <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${courseErrors[i]?.feeShared ? styles.inputError : ""} ${c.feeShared && !courseErrors[i]?.feeShared ? styles.inputSuccess : ""}`}>
                          <span className={styles.inputPrefix}>$</span>
                          <input type="number" className={`${styles.input} ${styles.inputPrefixed}`} placeholder="500" value={c.feeShared} onChange={(e) => updateCourse(i, "feeShared", e.target.value)} />
                        </div>
                        {courseErrors[i]?.feeShared && <p className={styles.errorMsg}>⚠ {courseErrors[i].feeShared}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Private Room Fee (USD)<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Private accommodation price</p>
                        <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${courseErrors[i]?.feePrivate ? styles.inputError : ""} ${c.feePrivate && !courseErrors[i]?.feePrivate ? styles.inputSuccess : ""}`}>
                          <span className={styles.inputPrefix}>$</span>
                          <input type="number" className={`${styles.input} ${styles.inputPrefixed}`} placeholder="550" value={c.feePrivate} onChange={(e) => updateCourse(i, "feePrivate", e.target.value)} />
                        </div>
                        {courseErrors[i]?.feePrivate && <p className={styles.errorMsg}>⚠ {courseErrors[i].feePrivate}</p>}
                      </div>
                    </div>
                    {c.feeShared && c.feePrivate && (
                      <div style={{ marginBottom: "1rem" }}><span className={styles.feeBadge}>Preview: {c.feeShared} USD / {c.feePrivate} USD</span></div>
                    )}
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Card Image URL<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Unsplash or CDN URL</p>
                        <div className={styles.imgUrlRow}>
                          <div className={styles.imgUrlField}>
                            <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${courseErrors[i]?.imgUrl ? styles.inputError : ""} ${c.imgUrl && !courseErrors[i]?.imgUrl ? styles.inputSuccess : ""}`}>
                              <span className={styles.inputPrefix}>🖼</span>
                              <input type="text" className={`${styles.input} ${styles.inputPrefixed}`} placeholder="https://images.unsplash.com/…" value={c.imgUrl} onChange={(e) => updateCourse(i, "imgUrl", e.target.value)} />
                            </div>
                            {courseErrors[i]?.imgUrl && <p className={styles.errorMsg}>⚠ {courseErrors[i].imgUrl}</p>}
                          </div>
                          {c.imgUrl && !courseErrors[i]?.imgUrl
                            ? <img src={c.imgUrl} alt="preview" className={styles.imgUrlThumb} onError={(e) => (e.currentTarget.style.display = "none")} />
                            : <div className={styles.imgUrlThumbPlaceholder}>🖼</div>}
                        </div>
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Accent Color</label>
                        <p className={styles.fieldHint}>Card overlay gradient (--card-color)</p>
                        <div className={styles.colorInputWrap}>
                          <div className={styles.colorSwatch} style={{ background: c.color, position: "relative" }}>
                            <input type="color" value={c.color} onChange={(e) => updateCourse(i, "color", e.target.value)} style={{ position: "absolute", opacity: 0, width: "100%", height: "100%", cursor: "pointer" }} />
                          </div>
                          <input type="text" className={styles.colorHexInput} value={c.color} maxLength={7} onChange={(e) => updateCourse(i, "color", e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div className={styles.twoCol}>
                      <LINK label='"More Details" Button Link' hint='href for the "More Details" button' val={c.detailsLink} onCh={(v) => updateCourse(i, "detailsLink", v)} ph="/courses/beginner or #" />
                      <LINK label='"Book Now" Button Link' hint='href for the "Book Now" button' val={c.bookLink} onCh={(v) => updateCourse(i, "bookLink", v)} ph="/book or #" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {courses.length < 6 && <button type="button" className={styles.addBtn} onClick={addCourse}>+ Add Course Card</button>}
          </div>

          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/yoga-courses" className={styles.cancelBtn}>← Back to List</Link>
            <div className={styles.actionsRight}>
              <SavedToast tab="courses" />
              <button type="button" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} onClick={() => handleSubmitTab("courses")} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Update Courses Section</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 2 — WHO SECTION
      ══════════════════════════════════════════════════ */}
      {activeTab === "who" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Head</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Eyebrow" hint='Small label above heading' val={who.eyebrow} err={whoErrors.eyebrow} onCh={(v) => setW("eyebrow", v)} ph="e.g. Open to All Seekers" max={80} />
              <TXT label="Section Title (H2)" hint="Main heading" val={who.sectionTitle} err={whoErrors.sectionTitle} onCh={(v) => setW("sectionTitle", v)} ph="e.g. Who Can Join Yoga TTC in Rishikesh?" />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Left Column — 5 Body Paragraphs</h3></div>
            <TA label="Paragraph 1" hint="About the course not being limited to vocational learners" val={who.para1} err={whoErrors.para1} onCh={(v) => setW("para1", v)} ph="An internationally certified hatha yoga teacher training course…" />
            <TA label="Paragraph 2" hint="Age 18–50, body & mind benefits, yoga retreats" val={who.para2} err={whoErrors.para2} onCh={(v) => setW("para2", v)} ph="As you become part of yoga training in India…" />
            <TA label="Paragraph 3" hint="Career reasons — yoga teacher, lifestyle, all walks of life" val={who.para3} err={whoErrors.para3} onCh={(v) => setW("para3", v)} ph="Whether you want to become a yoga teacher…" />
            <TA label="Paragraph 4" hint="Teachers' personal & spiritual growth, sharing knowledge" val={who.para4} err={whoErrors.para4} onCh={(v) => setW("para4", v)} ph="Several of our yoga teachers accelerated their personal and spiritual growth…" />
            <TA label="Paragraph 5" hint="Career opportunity, Yoga Alliance certificate, teach globally" val={who.para5} err={whoErrors.para5} onCh={(v) => setW("para5", v)} ph="With a certified yoga course from Rishikesh…" />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Right Decor — Feature Chips</h3>
              <span className={styles.sectionBadge}>{who.chips.length}/8</span>
            </div>
            <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>The ✦ chip items shown in the decorative right column</p>
            {whoErrors.chips && <p className={styles.errorMsg} style={{ marginBottom: "0.8rem" }}>⚠ {whoErrors.chips}</p>}
            <div className={styles.badgesList}>
              {who.chips.map((chip, i) => (
                <div key={i} className={styles.badgeRow}>
                  <div className={styles.badgeIndex}>{i + 1}</div>
                  <div className={`${styles.inputWrap}`} style={{ flex: 1 }}>
                    <input type="text" className={styles.input} placeholder="e.g. Age 18–50 Welcome" value={chip} maxLength={40} onChange={(e) => updateChip(i, e.target.value)} />
                  </div>
                  <button type="button" className={styles.removeBadgeBtn} onClick={() => removeChip(i)} disabled={who.chips.length <= 1}>✕</button>
                </div>
              ))}
            </div>
            {who.chips.filter((c) => c.trim()).length > 0 && (
              <div className={styles.badgePreview}>
                {who.chips.filter((c) => c.trim()).map((c, i) => (
                  <div key={i} className={styles.badgeChip}><span className={styles.badgeChipIcon}>✦</span>{c}</div>
                ))}
              </div>
            )}
            {who.chips.length < 8 && <button type="button" className={styles.addBtn} onClick={addChip}>+ Add Chip</button>}
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Right Decor — Quote Block</h3></div>
            <TA label="Quote Text" hint='Shown with " " marks added by frontend — do not add quotes here' val={who.quoteText} err={whoErrors.quoteText} onCh={(v) => setW("quoteText", v)} ph="Yoga is the journey of the self, through the self, to the self." max={200} rows={2} />
            <TXT label="Quote Attribution" hint='Author / source — e.g. "— Bhagavad Gita"' val={who.quoteAttrib} err={whoErrors.quoteAttrib} onCh={(v) => setW("quoteAttrib", v)} ph="— Bhagavad Gita" max={80} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/yoga-courses" className={styles.cancelBtn}>← Back to List</Link>
            <div className={styles.actionsRight}>
              <SavedToast tab="who" />
              <button type="button" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} onClick={() => handleSubmitTab("who")} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Update Who Section</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 3 — TEACHERS SECTION HEADER
      ══════════════════════════════════════════════════ */}
      {activeTab === "teachersHeader" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Head</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Eyebrow" hint='Small label above heading' val={teachersHeader.eyebrow} err={thErrors.eyebrow} onCh={(v) => setTH("eyebrow", v)} ph="e.g. Masters of the Ancient Art" max={80} />
              <TXT label="Section Title (H2)" hint="Main heading" val={teachersHeader.sectionTitle} err={thErrors.sectionTitle} onCh={(v) => setTH("sectionTitle", v)} ph="e.g. Our Experienced Yoga Teachers" />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Intro Paragraphs (teachersIntro)</h3></div>
            <TA label="Intro Paragraph 1" hint="About the team — contains a bold keyword" val={teachersHeader.introPara1} err={thErrors.introPara1} onCh={(v) => setTH("introPara1", v)} ph="AYM has a highly qualified team of Yoga professionals…" rows={4} />
            <TXT label="Paragraph 1 — Bold Highlight Text" hint="Exact phrase inside para 1 wrapped in <strong> — must match exactly" val={teachersHeader.introPara1Highlight} err={thErrors.introPara1Highlight} onCh={(v) => setTH("introPara1Highlight", v)} ph="e.g. hatha yoga teacher training in Rishikesh" max={120} />
            <TA label="Intro Paragraph 2" hint="About online courses — contains a bold keyword" val={teachersHeader.introPara2} err={thErrors.introPara2} onCh={(v) => setTH("introPara2", v)} ph="Our aim goes beyond just yoga teacher training…" rows={4} />
            <TXT label="Paragraph 2 — Bold Highlight Text" hint="Exact phrase inside para 2 wrapped in <strong> — must match exactly" val={teachersHeader.introPara2Highlight} err={thErrors.introPara2Highlight} onCh={(v) => setTH("introPara2Highlight", v)} ph="e.g. online yoga instructor courses in Rishikesh" max={120} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>"Our Teachers' Information" CTA Button</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Button Text" hint="Label on the CTA button" val={teachersHeader.ctaBtnText} err={thErrors.ctaBtnText} onCh={(v) => setTH("ctaBtnText", v)} ph="e.g. Our Teachers' Information" max={80} />
              <LINK label="Button Link" hint="href for the CTA button" val={teachersHeader.ctaBtnLink} err={thErrors.ctaBtnLink} onCh={(v) => setTH("ctaBtnLink", v)} ph="/teachers or #" req />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/yoga-courses" className={styles.cancelBtn}>← Back to List</Link>
            <div className={styles.actionsRight}>
              <SavedToast tab="teachersHeader" />
              <button type="button" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} onClick={() => handleSubmitTab("teachersHeader")} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Update Teachers Intro</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 4 — FOUNDER
      ══════════════════════════════════════════════════ */}
      {activeTab === "founder" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Founder Identity</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Eyebrow / Role Label" hint='Small text above name — e.g. "Founder of AYM Yoga School"' val={founder.eyebrow} err={founderErrors.eyebrow} onCh={(v) => setF("eyebrow", v)} ph="e.g. Founder of AYM Yoga School" max={80} />
              <TXT label="Founder Name (H3)" hint="Full display name" val={founder.name} err={founderErrors.name} onCh={(v) => setF("name", v)} ph="e.g. Yogi Chetan Mahesh" max={80} />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Founder Photo</h3></div>
            <div className={styles.twoCol}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Upload New Photo</label>
                <p className={styles.fieldHint}>Replaces existing photo — 500×600px recommended</p>
                <label className={`${styles.uploadArea} ${styles.uploadAreaSm}`}>
                  <input type="file" accept="image/*" className={styles.fileInput} onChange={(e) => handleFounderImg(e.target.files?.[0] || null)} />
                  {founder.imgPreview
                    ? <img src={founder.imgPreview} alt="preview" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
                    : <><span className={styles.uploadIcon}>🧘</span><span className={styles.uploadText}>Click to upload new photo</span><span className={styles.uploadSubtext}>Current photo will be replaced</span></>}
                </label>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Or Update Image URL</label>
                <p className={styles.fieldHint}>External URL to founder photo</p>
                <div className={`${styles.inputWrap} ${styles.inputWithPrefix}`}>
                  <span className={styles.inputPrefix}>🔗</span>
                  <input type="text" className={`${styles.input} ${styles.inputPrefixed}`} placeholder="https://…/founder.webp" value={founder.imgUrl} onChange={(e) => setF("imgUrl", e.target.value)} />
                </div>
                {founder.imgUrl && <img src={founder.imgUrl} alt="preview" style={{ marginTop: 8, width: 70, height: 80, objectFit: "cover", borderRadius: 6, border: "1.5px solid #e8d5b5" }} onError={(e) => (e.currentTarget.style.display = "none")} />}
              </div>
            </div>
            <TXT label="Image Alt Text" hint='Accessibility alt — e.g. "Yogi Chetan Mahesh — Founder of AYM Yoga School"' val={founder.imgAlt} err={founderErrors.imgAlt} onCh={(v) => setF("imgAlt", v)} ph="e.g. Yogi Chetan Mahesh — Founder of AYM Yoga School" max={150} />
            <p className={styles.fieldHint} style={{ marginTop: "-1rem" }}>Note: The overlay name label inside the image frame auto-uses the <strong>Founder Name</strong> field above.</p>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Bio Paragraphs</h3></div>
            <TA label="Paragraph 1" hint="Years of experience — Hatha & Ashtanga Yoga" val={founder.para1} err={founderErrors.para1} onCh={(v) => setF("para1", v)} ph="Yogi Chetan Mahesh, founder-director of AYM school has over 20 years…" />
            <TA label="Paragraph 2" hint="Student count (15,000+), best yoga instructor in India" val={founder.para2} err={founderErrors.para2} onCh={(v) => setF("para2", v)} ph="His mastery of yogic practice serves as an extension for students…" />
            <TA label="Paragraph 3" hint="Achievement paragraph — contains a bold highlighted phrase" val={founder.para3} err={founderErrors.para3} onCh={(v) => setF("para3", v)} ph="Achieving a significant milestone in his yogic journey…" />
            <TXT label="Paragraph 3 — Bold Highlight Text" hint='Exact phrase in para 3 wrapped in <strong className={styles.hl}> — must match exactly' val={founder.para3Highlight} err={founderErrors.para3Highlight} onCh={(v) => setF("para3Highlight", v)} ph="e.g. Gold Medal recipient" max={80} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Action Buttons (founderActions)</h3></div>
            <div className={styles.twoCol}>
              <TXT label='"Know More" Button Text' hint="Label for the details button" val={founder.detailsBtnText} err={founderErrors.detailsBtnText} onCh={(v) => setF("detailsBtnText", v)} ph="e.g. Know More About Yogi Chetan Mahesh" max={80} />
              <LINK label='"Know More" Button Link' hint="href for the details button" val={founder.detailsBtnLink} err={founderErrors.detailsBtnLink} onCh={(v) => setF("detailsBtnLink", v)} ph="/about/founder or #" req />
            </div>
            <div className={styles.twoCol}>
              <TXT label='"Book Now" Button Text' hint="Label for the book button" val={founder.bookBtnText} err={founderErrors.bookBtnText} onCh={(v) => setF("bookBtnText", v)} ph="e.g. Book Now" max={40} />
              <LINK label='"Book Now" Button Link' hint="href for the book button" val={founder.bookBtnLink} err={founderErrors.bookBtnLink} onCh={(v) => setF("bookBtnLink", v)} ph="/book or #" req />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/yoga-courses" className={styles.cancelBtn}>← Back to List</Link>
            <div className={styles.actionsRight}>
              <SavedToast tab="founder" />
              <button type="button" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} onClick={() => handleSubmitTab("founder")} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Update Founder</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB 5 — TEACHERS GRID
      ══════════════════════════════════════════════════ */}
      {activeTab === "teachers" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Teacher Cards (teachersGrid)</h3>
              <span className={styles.sectionBadge}>{teachers.length}/10</span>
            </div>
            <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>
              Each card shows name, surname, and photo. Displayed in the grid below the founder block.
            </p>
            <div className={styles.certsList}>
              {teachers.map((t, i) => (
                <div key={t._id || i} className={styles.certCard}>
                  <div className={styles.certCardHeader}>
                    <span className={styles.certCardNum}>{i + 1}</span>
                    <span className={styles.certCardTitle}>Teacher #{i + 1} — {t.name ? `${t.name} ${t.surname}` : "Untitled"}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => removeTeacher(i)} disabled={teachers.length <= 1}>✕ Remove</button>
                  </div>
                  <div className={styles.certCardBody}>
                    <div className={styles.certImageUpload}>
                      <label className={`${styles.uploadArea} ${styles.uploadAreaSm}`}>
                        <input type="file" accept="image/*" className={styles.fileInput} onChange={(e) => handleTeacherImg(i, e.target.files?.[0] || null)} />
                        {t.imgPreview || t.imgUrl
                          ? <img src={t.imgPreview || t.imgUrl} alt="preview" className={styles.certImgPreview} onError={(e) => (e.currentTarget.style.display = "none")} />
                          : <><span className={styles.uploadIcon}>👤</span><span className={styles.uploadText}>Upload Photo</span><span className={styles.uploadSubtext}>300×350px WEBP/JPG</span></>}
                      </label>
                    </div>
                    <div className={styles.certFields}>
                      <div className={styles.twoCol}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}><span className={styles.labelIcon}>✦</span>First Name<span className={styles.required}>*</span></label>
                          <p className={styles.fieldHint}>Include title — Dr. / Yogi</p>
                          <div className={`${styles.inputWrap} ${teacherErrors[i]?.name ? styles.inputError : ""} ${t.name && !teacherErrors[i]?.name ? styles.inputSuccess : ""}`}>
                            <input type="text" className={styles.input} maxLength={60} placeholder="e.g. Dr. Mahesh" value={t.name} onChange={(e) => updateTeacher(i, "name", e.target.value)} />
                          </div>
                          {teacherErrors[i]?.name && <p className={styles.errorMsg}>⚠ {teacherErrors[i].name}</p>}
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}><span className={styles.labelIcon}>✦</span>Surname<span className={styles.required}>*</span></label>
                          <p className={styles.fieldHint}>Shown below the first name</p>
                          <div className={`${styles.inputWrap} ${teacherErrors[i]?.surname ? styles.inputError : ""} ${t.surname && !teacherErrors[i]?.surname ? styles.inputSuccess : ""}`}>
                            <input type="text" className={styles.input} maxLength={60} placeholder="e.g. Bhatt" value={t.surname} onChange={(e) => updateTeacher(i, "surname", e.target.value)} />
                          </div>
                          {teacherErrors[i]?.surname && <p className={styles.errorMsg}>⚠ {teacherErrors[i].surname}</p>}
                        </div>
                      </div>
                      <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Or Image URL</label>
                        <p className={styles.fieldHint}>External URL if not uploading</p>
                        <div className={`${styles.inputWrap} ${styles.inputWithPrefix}`}>
                          <span className={styles.inputPrefix}>🔗</span>
                          <input type="text" className={`${styles.input} ${styles.inputPrefixed}`} placeholder="https://…/teacher.webp" value={t.imgUrl} onChange={(e) => updateTeacher(i, "imgUrl", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {teachers.length < 10 && <button type="button" className={styles.addBtn} onClick={addTeacher}>+ Add Teacher</button>}
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/yoga-courses" className={styles.cancelBtn}>← Back to List</Link>
            <div className={styles.actionsRight}>
              <SavedToast tab="teachers" />
              <button type="button" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} onClick={() => handleSubmitTab("teachers")} disabled={isSubmitting}>
                {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Update Teachers Grid</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}