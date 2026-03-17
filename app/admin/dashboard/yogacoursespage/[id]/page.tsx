"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import styles from "@/assets/style/Admin/dashboard/yogacoursespage/Yogacoursessection.module.css";
import api from "@/lib/api";

/* ══════════════════════════════════════════════════════
   Jodit Editor — SSR disabled
══════════════════════════════════════════════════════ */
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface CourseSectionHeader { eyebrow: string; sectionTitle: string; sectionDesc: string; }
interface CourseItem {
  _id?: string; hours: string; days: string; name: string; style: string;
  duration: string; certificate: string; feeShared: string; feePrivate: string;
  color: string; imgUrl: string; imgPreview: string; imgFile: File | null;
  detailsLink: string; bookLink: string;
}
interface WhoSection {
  eyebrow: string; sectionTitle: string;
  para1: string; para2: string; para3: string; para4: string; para5: string;
  chips: string[]; quoteText: string; quoteAttrib: string;
}
interface TeachersSectionHeader {
  eyebrow: string; sectionTitle: string;
  introPara1: string; introPara1Highlight: string;
  introPara2: string; introPara2Highlight: string;
  ctaBtnText: string; ctaBtnLink: string;
}
interface FounderSection {
  eyebrow: string; name: string;
  imgUrl: string; imgPreview: string; imgFile: File | null; imgAlt: string;
  para1: string; para2: string; para3: string; para3Highlight: string;
  detailsBtnText: string; detailsBtnLink: string; bookBtnText: string; bookBtnLink: string;
}
interface TeacherItem {
  _id?: string; name: string; surname: string;
  imgUrl: string; imgPreview: string; imgFile: File | null;
}
type Errors<T> = Partial<Record<keyof T, string>>;
type TabId = "courses" | "who" | "teachersHeader" | "founder" | "teachers";

const CERT_OPTIONS  = ["100 Hour", "200 RYT", "300 RYT", "500 RYT"];
const STYLE_OPTIONS = ["Ashtanga / Hatha", "Hatha / Ashtanga Yoga", "Multi-Style Yoga", "Hatha / Multi-Style", "Kundalini Yoga", "Yin Yoga", "Vinyasa Flow"];

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function stripHtml(html: string): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, " ");
  text = text
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
  return text.replace(/\s+/g, " ").trim();
}
function isRteEmpty(val: string): boolean {
  if (!val) return true;
  return stripHtml(val) === "" || val === "<p><br></p>" || val === "<p></p>";
}


/* ══════════════════════════════════════════════════════
   IMAGE URL HELPER
   /uploads/file.jpg  →  http://172.20.10.2:5000/uploads/file.jpg
   https://...        →  unchanged
   "" / null          →  ""
══════════════════════════════════════════════════════ */
function getImageUrl(path: string | undefined | null): string {
  if (!path || path.trim() === "") return "";
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/* ══════════════════════════════════════════════════════
   JODIT CONFIG
══════════════════════════════════════════════════════ */
function useJoditConfig() {
  return useMemo(() => ({
    readonly: false, toolbar: true, spellcheck: false, language: "en",
    toolbarButtonSize: "small" as const, toolbarAdaptive: false,
    showCharsCounter: false, showWordsCounter: false, showXPathInStatusbar: false,
    askBeforePasteHTML: false, askBeforePasteFromWord: false,
    buttons: ["bold","italic","underline","strikethrough","|","brush","font","fontsize","|","align","|","ul","ol","|","link","|","undo","redo","|","source"],
    height: 180,
    style: { fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: "#3d1d00", background: "#fff" },
    placeholder: "Type and format your text here…",
  }), []);
}

/* ══════════════════════════════════════════════════════
   DUAL IMAGE FIELD
══════════════════════════════════════════════════════ */
interface DualImageProps {
  label: string; hint: string; urlVal: string; previewVal: string; err?: string;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File | null, preview: string) => void;
  recommendedSize?: string;
}
function DualImageField({ label, hint, urlVal, previewVal, err, onUrlChange, onFileChange, recommendedSize = "600×400px" }: DualImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Accept base64 preview, https:// URL, or relative /uploads/ path
  const activePreview = previewVal || (urlVal && urlVal.trim() !== "" ? getImageUrl(urlVal) : "");

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onFileChange(file, e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span>
      </label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={styles.dualImgWrapper}>
        {/* Left — input options */}
        <div className={styles.dualImgLeft}>
          <p className={styles.dualImgSubLabel}>Option A — Paste URL</p>
          <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${err && !urlVal ? styles.inputError : ""} ${urlVal && !err ? styles.inputSuccess : ""}`}>
            <span className={styles.inputPrefix}>🔗</span>
            <input type="text" className={`${styles.input} ${styles.inputPrefixed}`}
              placeholder="https://images.unsplash.com/…" value={urlVal}
              onChange={(e) => onUrlChange(e.target.value)} />
          </div>
          <p className={styles.dualImgOrDivider}><span>— or —</span></p>
          <p className={styles.dualImgSubLabel}>Option B — Upload File</p>
          <label className={`${styles.uploadArea} ${styles.uploadAreaSm}`} style={{ cursor: "pointer" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] || null); }}>
            <input ref={fileInputRef} type="file" accept="image/*" className={styles.fileInput}
              onChange={(e) => handleFile(e.target.files?.[0] || null)} />
            <span className={styles.uploadIcon}>🖼</span>
            <span className={styles.uploadText}>Click or drag &amp; drop</span>
            <span className={styles.uploadSubtext}>JPG, PNG, WEBP — {recommendedSize}</span>
          </label>
        </div>
        {/* Right — preview */}
        <div className={styles.dualImgRight}>
          <p className={styles.dualImgSubLabel}>Preview</p>
          {activePreview ? (
            <div className={styles.dualImgPreviewBox}>
              <img src={activePreview} alt="preview" className={styles.dualImgPreviewImg}
                onError={(e) => (e.currentTarget.style.display = "none")} />
              <button type="button" className={styles.dualImgClear} title="Clear image"
                onClick={() => { onUrlChange(""); onFileChange(null, ""); if (fileInputRef.current) fileInputRef.current.value = ""; }}>✕</button>
            </div>
          ) : (
            <div className={styles.dualImgPlaceholder}>
              <span>🖼</span><span>No image yet</span>
            </div>
          )}
        </div>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PLAIN FIELD COMPONENTS  (defined outside — no remount bug)
══════════════════════════════════════════════════════ */
function TXT({ label, hint, val, err, onCh, ph, max = 150, req = true }:
  { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; ph: string; max?: number; req?: boolean }) {
  return (
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
}
function TA({ label, hint, val, err, onCh, ph, rows = 3, max = 600, req = true }:
  { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; ph: string; rows?: number; max?: number; req?: boolean }) {
  return (
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
}
function LINK({ label, hint, val, err, onCh, ph, req = false }:
  { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; ph: string; req?: boolean }) {
  return (
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
}
function RTE({ label, hint, val, err, onCh, req = true }:
  { label: string; hint: string; val: string; err?: string; onCh: (v: string) => void; req?: boolean }) {
  const config = useJoditConfig();
  const editorRef = useRef(null);
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}</label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.joditWrap} ${err ? styles.joditError : ""} ${val && !isRteEmpty(val) && !err ? styles.joditSuccess : ""}`}>
        <JoditEditor ref={editorRef} value={val} config={config} onBlur={(v) => onCh(v)} />
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */

export default function EditYogaCoursesPage() {
  const router = useRouter();
  const [pageLoading, setPageLoading]   = useState(true);
  const [activeTab, setActiveTab]       = useState<TabId>("courses");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedTab, setSavedTab]         = useState<TabId | null>(null);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  /* ── Form States ── */
  const [sectionHeader, setSectionHeader] = useState<CourseSectionHeader>({ eyebrow: "", sectionTitle: "", sectionDesc: "" });
  const [headerErrors, setHeaderErrors]   = useState<Errors<CourseSectionHeader>>({});
  const [courses, setCourses]             = useState<CourseItem[]>([]);
  const [courseErrors, setCourseErrors]   = useState<Errors<CourseItem>[]>([]);

  const [who, setWho]             = useState<WhoSection>({ eyebrow: "", sectionTitle: "", para1: "", para2: "", para3: "", para4: "", para5: "", chips: [], quoteText: "", quoteAttrib: "" });
  const [whoErrors, setWhoErrors] = useState<Errors<WhoSection>>({});

  const [teachersHeader, setTeachersHeader] = useState<TeachersSectionHeader>({ eyebrow: "", sectionTitle: "", introPara1: "", introPara1Highlight: "", introPara2: "", introPara2Highlight: "", ctaBtnText: "", ctaBtnLink: "" });
  const [thErrors, setThErrors]             = useState<Errors<TeachersSectionHeader>>({});

  const [founder, setFounder]             = useState<FounderSection>({ eyebrow: "", name: "", imgUrl: "", imgPreview: "", imgFile: null, imgAlt: "", para1: "", para2: "", para3: "", para3Highlight: "", detailsBtnText: "", detailsBtnLink: "", bookBtnText: "", bookBtnLink: "" });
  const [founderErrors, setFounderErrors] = useState<Errors<FounderSection>>({});

  const [teachers, setTeachers]           = useState<TeacherItem[]>([]);
  const [teacherErrors, setTeacherErrors] = useState<Errors<TeacherItem>[]>([]);

  /* ══════════ FETCH ON MOUNT ══════════ */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/yoga-courses/get");
        const d   = res.data?.data;
        if (!d) return;

        setSectionHeader(d.sectionHeader || { eyebrow: "", sectionTitle: "", sectionDesc: "" });

        setCourses((d.courses || []).map((c: any) => ({
          _id:         c._id,
          hours:       c.hours       || "",
          days:        c.days        || "",
          name:        c.name        || "",
          style:       c.style       || "",
          duration:    c.duration    || "",
          certificate: c.certificate || "",
          feeShared:   c.feeShared   || "",
          feePrivate:  c.feePrivate  || "",
          color:       c.color       || "#8B5E3C",
          imgUrl:      c.imgUrl      || "",
          imgPreview:  "",
          imgFile:     null,
          detailsLink: c.detailsLink || "#",
          bookLink:    c.bookLink    || "#",
        })));

        setWho(d.who ? {
          eyebrow:      d.who.eyebrow      || "",
          sectionTitle: d.who.sectionTitle || "",
          para1:        d.who.para1        || "",
          para2:        d.who.para2        || "",
          para3:        d.who.para3        || "",
          para4:        d.who.para4        || "",
          para5:        d.who.para5        || "",
          chips:        d.who.chips        || [],
          quoteText:    d.who.quoteText    || "",
          quoteAttrib:  d.who.quoteAttrib  || "",
        } : who);

        setTeachersHeader(d.teachersHeader ? {
          eyebrow:             d.teachersHeader.eyebrow             || "",
          sectionTitle:        d.teachersHeader.sectionTitle        || "",
          introPara1:          d.teachersHeader.introPara1          || "",
          introPara1Highlight: d.teachersHeader.introPara1Highlight || "",
          introPara2:          d.teachersHeader.introPara2          || "",
          introPara2Highlight: d.teachersHeader.introPara2Highlight || "",
          ctaBtnText:          d.teachersHeader.ctaBtnText          || "",
          ctaBtnLink:          d.teachersHeader.ctaBtnLink          || "",
        } : teachersHeader);

        setFounder(d.founder ? {
          eyebrow:        d.founder.eyebrow        || "",
          name:           d.founder.name           || "",
          imgUrl:         d.founder.imgUrl         || "",
          imgPreview:     "",
          imgFile:        null,
          imgAlt:         d.founder.imgAlt         || "",
          para1:          d.founder.para1          || "",
          para2:          d.founder.para2          || "",
          para3:          d.founder.para3          || "",
          para3Highlight: d.founder.para3Highlight || "",
          detailsBtnText: d.founder.detailsBtnText || "",
          detailsBtnLink: d.founder.detailsBtnLink || "#",
          bookBtnText:    d.founder.bookBtnText    || "",
          bookBtnLink:    d.founder.bookBtnLink    || "#",
        } : founder);

        setTeachers((d.teachers || []).map((t: any) => ({
          _id:        t._id,
          name:       t.name    || "",
          surname:    t.surname || "",
          imgUrl:     t.imgUrl  || "",
          imgPreview: "",
          imgFile:    null,
        })));
      } catch (err: any) {
        setFetchError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  /* ══════════ HELPERS ══════════ */
  const setHdr = (k: keyof CourseSectionHeader, v: string) => { setSectionHeader((p) => ({ ...p, [k]: v })); setHeaderErrors((p) => ({ ...p, [k]: undefined })); };

  /* Course */
  const updateCourse    = (i: number, k: keyof CourseItem, v: any) => setCourses((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const updateCourseImg = (i: number, file: File | null, preview: string) =>
    setCourses((p) => { const a = [...p]; a[i] = { ...a[i], imgFile: file, imgPreview: preview, imgUrl: file ? "" : a[i].imgUrl }; return a; });
  const updateCourseImgUrl = (i: number, url: string) =>
    setCourses((p) => { const a = [...p]; a[i] = { ...a[i], imgUrl: url, imgFile: null, imgPreview: "" }; return a; });
  const addCourse    = () => { if (courses.length < 6) setCourses((p) => [...p, { hours: "", days: "", name: "", style: "", duration: "", certificate: "", feeShared: "", feePrivate: "", color: "#8B5E3C", imgUrl: "", imgPreview: "", imgFile: null, detailsLink: "#", bookLink: "#" }]); };
  const removeCourse = (i: number) => setCourses((p) => p.filter((_, idx) => idx !== i));

  /* Who */
  const setW       = (k: keyof WhoSection, v: string) => { setWho((p) => ({ ...p, [k]: v })); setWhoErrors((p) => ({ ...p, [k]: undefined })); };
  const updateChip = (i: number, v: string) => setWho((p) => { const c = [...p.chips]; c[i] = v; return { ...p, chips: c }; });
  const addChip    = () => { if (who.chips.length < 8) setWho((p) => ({ ...p, chips: [...p.chips, ""] })); };
  const removeChip = (i: number) => setWho((p) => ({ ...p, chips: p.chips.filter((_, idx) => idx !== i) }));

  /* TeachersHeader */
  const setTH = (k: keyof TeachersSectionHeader, v: string) => { setTeachersHeader((p) => ({ ...p, [k]: v })); setThErrors((p) => ({ ...p, [k]: undefined })); };

  /* Founder */
  const setF = (k: keyof FounderSection, v: any) => { setFounder((p) => ({ ...p, [k]: v })); setFounderErrors((p) => ({ ...p, [k]: undefined })); };
  const handleFounderFile = (file: File | null, preview: string) =>
    setFounder((p) => ({ ...p, imgFile: file, imgPreview: preview, imgUrl: file ? "" : p.imgUrl }));
  const handleFounderUrl  = (url: string) =>
    setFounder((p) => ({ ...p, imgUrl: url, imgFile: null, imgPreview: "" }));

  /* Teachers */
  const updateTeacher    = (i: number, k: keyof TeacherItem, v: string) => setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const updateTeacherImg = (i: number, file: File | null, preview: string) =>
    setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], imgFile: file, imgPreview: preview, imgUrl: file ? "" : a[i].imgUrl }; return a; });
  const updateTeacherImgUrl = (i: number, url: string) =>
    setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], imgUrl: url, imgFile: null, imgPreview: "" }; return a; });
  const addTeacher    = () => { if (teachers.length < 10) setTeachers((p) => [...p, { name: "", surname: "", imgUrl: "", imgPreview: "", imgFile: null }]); };
  const removeTeacher = (i: number) => setTeachers((p) => p.filter((_, idx) => idx !== i));

  /* ══════════ VALIDATIONS ══════════ */
  const validateCourses = (): boolean => {
    let ok = true;
    const he: Errors<CourseSectionHeader> = {};
    if (!sectionHeader.eyebrow.trim())      { he.eyebrow     = "Required"; ok = false; }
    if (!sectionHeader.sectionTitle.trim()) { he.sectionTitle = "Required"; ok = false; }
    if (!sectionHeader.sectionDesc.trim())  { he.sectionDesc  = "Required"; ok = false; }
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
      const imgSrc = c.imgPreview || c.imgUrl;
      if (!imgSrc) { e.imgUrl = "Image required (URL or upload)"; ok = false; }
      else if (!c.imgPreview && !/^https?:\/\/.+/.test(c.imgUrl.trim())) { e.imgUrl = "Valid URL required"; ok = false; }
      return e;
    });
    setCourseErrors(ce);
    return ok;
  };
  const validateWho = (): boolean => {
    let ok = true;
    const e: Errors<WhoSection> = {};
    if (!who.eyebrow.trim())      { e.eyebrow     = "Required"; ok = false; }
    if (!who.sectionTitle.trim()) { e.sectionTitle = "Required"; ok = false; }
    if (isRteEmpty(who.para1))    { e.para1        = "Required"; ok = false; }
    if (isRteEmpty(who.para2))    { e.para2        = "Required"; ok = false; }
    if (isRteEmpty(who.para3))    { e.para3        = "Required"; ok = false; }
    if (isRteEmpty(who.para4))    { e.para4        = "Required"; ok = false; }
    if (isRteEmpty(who.para5))    { e.para5        = "Required"; ok = false; }
    if (!who.quoteText.trim())    { e.quoteText    = "Required"; ok = false; }
    if (!who.quoteAttrib.trim())  { e.quoteAttrib  = "Required"; ok = false; }
    if (who.chips.some((c) => !c.trim())) { e.chips = "All chip labels must be filled"; ok = false; }
    setWhoErrors(e);
    return ok;
  };
  const validateTeachersHeader = (): boolean => {
    let ok = true;
    const e: Errors<TeachersSectionHeader> = {};
    if (!teachersHeader.eyebrow.trim())              { e.eyebrow             = "Required"; ok = false; }
    if (!teachersHeader.sectionTitle.trim())         { e.sectionTitle        = "Required"; ok = false; }
    if (isRteEmpty(teachersHeader.introPara1))       { e.introPara1          = "Required"; ok = false; }
    if (!teachersHeader.introPara1Highlight.trim())  { e.introPara1Highlight = "Required"; ok = false; }
    if (isRteEmpty(teachersHeader.introPara2))       { e.introPara2          = "Required"; ok = false; }
    if (!teachersHeader.introPara2Highlight.trim())  { e.introPara2Highlight = "Required"; ok = false; }
    if (!teachersHeader.ctaBtnText.trim())           { e.ctaBtnText          = "Required"; ok = false; }
    if (!teachersHeader.ctaBtnLink.trim())           { e.ctaBtnLink          = "Required"; ok = false; }
    setThErrors(e);
    return ok;
  };
  const validateFounder = (): boolean => {
    let ok = true;
    const e: Errors<FounderSection> = {};
    if (!founder.eyebrow.trim())         { e.eyebrow        = "Required"; ok = false; }
    if (!founder.name.trim())            { e.name           = "Required"; ok = false; }
    if (!founder.imgAlt.trim())          { e.imgAlt         = "Required"; ok = false; }
    if (isRteEmpty(founder.para1))       { e.para1          = "Required"; ok = false; }
    if (isRteEmpty(founder.para2))       { e.para2          = "Required"; ok = false; }
    if (isRteEmpty(founder.para3))       { e.para3          = "Required"; ok = false; }
    if (!founder.para3Highlight.trim())  { e.para3Highlight = "Required"; ok = false; }
    if (!founder.detailsBtnText.trim())  { e.detailsBtnText = "Required"; ok = false; }
    if (!founder.detailsBtnLink.trim())  { e.detailsBtnLink = "Required"; ok = false; }
    if (!founder.bookBtnText.trim())     { e.bookBtnText    = "Required"; ok = false; }
    if (!founder.bookBtnLink.trim())     { e.bookBtnLink    = "Required"; ok = false; }
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

  /* ══════════ BUILD PAYLOAD PER TAB ══════════ */
  const buildPayload = (tab: TabId) => {
    switch (tab) {
      case "courses":
        return {
          sectionHeader: {
            eyebrow:      stripHtml(sectionHeader.eyebrow),
            sectionTitle: stripHtml(sectionHeader.sectionTitle),
            sectionDesc:  stripHtml(sectionHeader.sectionDesc),
          },
          courses: courses.map((c, i) => ({
            ...(c._id ? { _id: c._id } : {}),
            hours:       stripHtml(c.hours),
            days:        stripHtml(c.days),
            name:        stripHtml(c.name),
            style:       c.style,
            duration:    stripHtml(c.duration),
            certificate: c.certificate,
            feeShared:   stripHtml(c.feeShared),
            feePrivate:  stripHtml(c.feePrivate),
            color:       c.color,
            imgUrl:      c.imgFile ? `__upload_courseImg_${i}` : c.imgUrl,
            detailsLink: c.detailsLink || "#",
            bookLink:    c.bookLink    || "#",
          })),
        };

      case "who":
        return {
          eyebrow:      stripHtml(who.eyebrow),
          sectionTitle: stripHtml(who.sectionTitle),
          para1:        stripHtml(who.para1),
          para2:        stripHtml(who.para2),
          para3:        stripHtml(who.para3),
          para4:        stripHtml(who.para4),
          para5:        stripHtml(who.para5),
          chips:        who.chips.filter((c) => c.trim()).map(stripHtml),
          quoteText:    stripHtml(who.quoteText),
          quoteAttrib:  stripHtml(who.quoteAttrib),
        };

      case "teachersHeader":
        return {
          eyebrow:             stripHtml(teachersHeader.eyebrow),
          sectionTitle:        stripHtml(teachersHeader.sectionTitle),
          introPara1:          stripHtml(teachersHeader.introPara1),
          introPara1Highlight: stripHtml(teachersHeader.introPara1Highlight),
          introPara2:          stripHtml(teachersHeader.introPara2),
          introPara2Highlight: stripHtml(teachersHeader.introPara2Highlight),
          ctaBtnText:          stripHtml(teachersHeader.ctaBtnText),
          ctaBtnLink:          teachersHeader.ctaBtnLink,
        };

      case "founder":
        return {
          eyebrow:        stripHtml(founder.eyebrow),
          name:           stripHtml(founder.name),
          imgUrl:         founder.imgFile ? "__upload_founderImg" : founder.imgUrl,
          imgAlt:         stripHtml(founder.imgAlt),
          para1:          stripHtml(founder.para1),
          para2:          stripHtml(founder.para2),
          para3:          stripHtml(founder.para3),
          para3Highlight: stripHtml(founder.para3Highlight),
          detailsBtnText: stripHtml(founder.detailsBtnText),
          detailsBtnLink: founder.detailsBtnLink || "#",
          bookBtnText:    stripHtml(founder.bookBtnText),
          bookBtnLink:    founder.bookBtnLink    || "#",
        };

      case "teachers":
        return teachers
          .filter((t) => t.name.trim() && t.surname.trim())
          .map((t, i) => ({
            ...(t._id ? { _id: t._id } : {}),
            name:    stripHtml(t.name),
            surname: stripHtml(t.surname),
            imgUrl:  t.imgFile ? `__upload_teacherImg_${i}` : t.imgUrl,
          }));
    }
  };

  /* ══════════ SUBMIT PER TAB ══════════ */
  const handleSubmitTab = async (tab: TabId) => {
    const validators: Record<TabId, () => boolean> = {
      courses: validateCourses, who: validateWho,
      teachersHeader: validateTeachersHeader, founder: validateFounder, teachers: validateTeachers,
    };
    if (!validators[tab]()) return;

    try {
      setIsSubmitting(true);

      /* Check if this tab has any file uploads */
      const hasFiles = (() => {
        if (tab === "courses")  return courses.some((c) => c.imgFile);
        if (tab === "founder")  return !!founder.imgFile;
        if (tab === "teachers") return teachers.some((t) => t.imgFile);
        return false;
      })();

      const payload = buildPayload(tab);

      if (hasFiles) {
        const formData = new FormData();
        if (tab === "courses")  courses.forEach((c, i)  => { if (c.imgFile) formData.append(`courseImg_${i}`,  c.imgFile!); });
        if (tab === "founder"  && founder.imgFile)        formData.append("founderImg", founder.imgFile);
        if (tab === "teachers") teachers.forEach((t, i) => { if (t.imgFile) formData.append(`teacherImg_${i}`, t.imgFile!); });
        formData.append("data", JSON.stringify(payload));
        await api.patch(`/yoga-courses/update-section/${tab}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.patch(`/yoga-courses/update-section/${tab}`, payload);
      }

      setSavedTab(tab);
      setTimeout(() => setSavedTab(null), 2500);
    } catch (err: any) {
      console.error(`[EDIT][${tab}] error:`, err);
      alert(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Tab error flags ── */
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

  /* ── Save toast ── */
  const SavedToast = ({ tab }: { tab: TabId }) =>
    savedTab === tab ? (
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.55rem 1rem", background: "rgba(74,140,42,0.1)", border: "1px solid rgba(74,140,42,0.3)", borderRadius: 8, fontFamily: "'Cormorant Garamond', serif", fontSize: "0.88rem", color: "#2a5e1e", fontStyle: "italic" }}>
        ✓ Saved successfully
      </div>
    ) : null;

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

  /* ── Fetch error ── */
  if (fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h2 className={styles.emptyTitle}>Failed to load data</h2>
          <p className={styles.emptyText}>{fetchError}</p>
          <button className={styles.addBtn} onClick={() => window.location.reload()}>↺ Retry</button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.breadcrumbSep}>›</span>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard/yogacoursespage")}>Yoga Courses</button>
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

                    {/* ── DUAL IMAGE — Course Card ── */}
                    <DualImageField
                      label="Card Image"
                      hint="Upload a new file OR paste/update an image URL"
                      urlVal={c.imgUrl}
                      previewVal={c.imgPreview}
                      err={courseErrors[i]?.imgUrl}
                      onUrlChange={(url) => updateCourseImgUrl(i, url)}
                      onFileChange={(file, preview) => updateCourseImg(i, file, preview)}
                      recommendedSize="600×400px"
                    />

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
            <Link href="/admin/dashboard/yogacoursespage" className={styles.cancelBtn}>← Back to List</Link>
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
            <RTE label="Paragraph 1" hint="About the course not being limited to vocational learners." val={who.para1} err={whoErrors.para1} onCh={(v) => setW("para1", v)} />
            <RTE label="Paragraph 2" hint="Age 18–50, body & mind benefits, yoga retreats." val={who.para2} err={whoErrors.para2} onCh={(v) => setW("para2", v)} />
            <RTE label="Paragraph 3" hint="Career reasons — yoga teacher, lifestyle, all walks of life." val={who.para3} err={whoErrors.para3} onCh={(v) => setW("para3", v)} />
            <RTE label="Paragraph 4" hint="Teachers' personal & spiritual growth, sharing knowledge." val={who.para4} err={whoErrors.para4} onCh={(v) => setW("para4", v)} />
            <RTE label="Paragraph 5" hint="Career opportunity, Yoga Alliance certificate, teach globally." val={who.para5} err={whoErrors.para5} onCh={(v) => setW("para5", v)} />
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
                  <div className={styles.inputWrap} style={{ flex: 1 }}>
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
            <Link href="/admin/dashboard/yogacoursespage" className={styles.cancelBtn}>← Back to List</Link>
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
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Intro Paragraphs</h3></div>
            <RTE label="Intro Paragraph 1" hint="About the team — use Bold for keywords directly in editor." val={teachersHeader.introPara1} err={thErrors.introPara1} onCh={(v) => setTH("introPara1", v)} />
            <TXT label="Paragraph 1 — Bold Highlight Text" hint="Exact phrase from para 1 wrapped in <strong> (legacy)" val={teachersHeader.introPara1Highlight} err={thErrors.introPara1Highlight} onCh={(v) => setTH("introPara1Highlight", v)} ph="e.g. hatha yoga teacher training in Rishikesh" max={120} />
            <RTE label="Intro Paragraph 2" hint="About online courses — use Bold for keywords directly in editor." val={teachersHeader.introPara2} err={thErrors.introPara2} onCh={(v) => setTH("introPara2", v)} />
            <TXT label="Paragraph 2 — Bold Highlight Text" hint="Exact phrase from para 2 wrapped in <strong> (legacy)" val={teachersHeader.introPara2Highlight} err={thErrors.introPara2Highlight} onCh={(v) => setTH("introPara2Highlight", v)} ph="e.g. online yoga instructor courses in Rishikesh" max={120} />
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
            <Link href="/admin/dashboard/yogacoursespage" className={styles.cancelBtn}>← Back to List</Link>
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

            {/* ── DUAL IMAGE — Founder ── */}
            <DualImageField
              label="Founder Photo"
              hint="Upload a new file OR paste/update an image URL. Recommended 500×600px."
              urlVal={founder.imgUrl}
              previewVal={founder.imgPreview}
              err={founderErrors.imgUrl}
              onUrlChange={handleFounderUrl}
              onFileChange={handleFounderFile}
              recommendedSize="500×600px"
            />

            <TXT label="Image Alt Text" hint='Accessibility alt text' val={founder.imgAlt} err={founderErrors.imgAlt} onCh={(v) => setF("imgAlt", v)} ph="e.g. Yogi Chetan Mahesh — Founder of AYM Yoga School" max={150} />
            <p className={styles.fieldHint} style={{ marginTop: "-1rem" }}>Note: The overlay name label inside the image frame auto-uses the <strong>Founder Name</strong> field above.</p>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Bio Paragraphs</h3></div>
            <RTE label="Paragraph 1" hint="Years of experience — Hatha & Ashtanga Yoga." val={founder.para1} err={founderErrors.para1} onCh={(v) => setF("para1", v)} />
            <RTE label="Paragraph 2" hint="Student count (15,000+), best yoga instructor in India." val={founder.para2} err={founderErrors.para2} onCh={(v) => setF("para2", v)} />
            <RTE label="Paragraph 3" hint="Achievement paragraph — bold the key achievement in editor." val={founder.para3} err={founderErrors.para3} onCh={(v) => setF("para3", v)} />
            <TXT label="Paragraph 3 — Bold Highlight Text" hint="Exact phrase from para 3 wrapped in <strong> (legacy)" val={founder.para3Highlight} err={founderErrors.para3Highlight} onCh={(v) => setF("para3Highlight", v)} ph="e.g. Gold Medal recipient" max={80} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Action Buttons</h3></div>
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
            <Link href="/admin/dashboard/yogacoursespage" className={styles.cancelBtn}>← Back to List</Link>
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
              Each card shows name, surname, and photo in the grid below the founder block.
            </p>
            <div className={styles.certsList}>
              {teachers.map((t, i) => (
                <div key={t._id || i} className={styles.certCard}>
                  <div className={styles.certCardHeader}>
                    <span className={styles.certCardNum}>{i + 1}</span>
                    <span className={styles.certCardTitle}>Teacher #{i + 1} — {t.name ? `${t.name} ${t.surname}` : "Untitled"}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => removeTeacher(i)} disabled={teachers.length <= 1}>✕ Remove</button>
                  </div>
                  <div style={{ padding: "1rem" }}>
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

                    {/* ── DUAL IMAGE — Teacher ── */}
                    <DualImageField
                      label="Teacher Photo"
                      hint="Upload a new file OR paste/update an image URL. Recommended 300×350px."
                      urlVal={t.imgUrl}
                      previewVal={t.imgPreview}
                      onUrlChange={(url) => updateTeacherImgUrl(i, url)}
                      onFileChange={(file, preview) => updateTeacherImg(i, file, preview)}
                      recommendedSize="300×350px"
                    />
                  </div>
                </div>
              ))}
            </div>
            {teachers.length < 10 && <button type="button" className={styles.addBtn} onClick={addTeacher}>+ Add Teacher</button>}
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/yogacoursespage" className={styles.cancelBtn}>← Back to List</Link>
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