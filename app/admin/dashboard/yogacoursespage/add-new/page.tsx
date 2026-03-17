"use client";

import { useState, useRef, useMemo } from "react";
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
interface CourseSectionHeader {
  eyebrow: string;
  sectionTitle: string;
  sectionDesc: string;
}
interface CourseItem {
  hours: string; days: string; name: string; style: string;
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
  detailsBtnText: string; detailsBtnLink: string;
  bookBtnText: string; bookBtnLink: string;
}
interface TeacherItem {
  name: string; surname: string;
  imgUrl: string; imgPreview: string; imgFile: File | null;
}

type Errors<T> = Partial<Record<keyof T, string>>;
type TabId = "courses" | "who" | "teachersHeader" | "founder" | "teachers";

const CERT_OPTIONS  = ["100 Hour", "200 RYT", "300 RYT", "500 RYT"];
const STYLE_OPTIONS = ["Ashtanga / Hatha", "Hatha / Ashtanga Yoga", "Multi-Style Yoga", "Hatha / Multi-Style", "Kundalini Yoga", "Yin Yoga", "Vinyasa Flow"];

const EMPTY_COURSE: CourseItem   = { hours: "", days: "", name: "", style: "", duration: "", certificate: "", feeShared: "", feePrivate: "", color: "#8B5E3C", imgUrl: "", imgPreview: "", imgFile: null, detailsLink: "#", bookLink: "#" };
const EMPTY_TEACHER: TeacherItem = { name: "", surname: "", imgUrl: "", imgPreview: "", imgFile: null };

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */

/** Strip HTML tags and decode entities — converts Jodit HTML output to plain text for backend */
function stripHtml(html: string): string {
  if (!html) return "";
  // Remove all HTML tags
  let text = html.replace(/<[^>]*>/g, " ");
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
  // Collapse multiple spaces/newlines
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

/** Check if a Jodit value is empty (empty string, whitespace-only, or empty <p>) */
function isRteEmpty(val: string): boolean {
  if (!val) return true;
  const stripped = stripHtml(val);
  return stripped === "" || val === "<p><br></p>" || val === "<p></p>";
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
   JODIT CONFIG HOOK
══════════════════════════════════════════════════════ */
function useJoditConfig() {
  return useMemo(() => ({
    readonly: false,
    toolbar: true,
    spellcheck: false,
    language: "en",
    toolbarButtonSize: "small" as const,
    toolbarAdaptive: false,
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    buttons: [
      "bold", "italic", "underline", "strikethrough", "|",
      "brush", "font", "fontsize", "|",
      "align", "|",
      "ul", "ol", "|",
      "link", "|",
      "undo", "redo", "|",
      "source"
    ],
    height: 180,
    style: {
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "1rem",
      color: "#3d1d00",
      background: "#fff",
    },
    editorCssClass: "jodit-yoga-editor",
    placeholder: "Type and format your text here…",
  }), []);
}

/* ══════════════════════════════════════════════════════
   DUAL IMAGE FIELD  (URL + Upload, mutually aware)
══════════════════════════════════════════════════════ */
interface DualImageProps {
  label: string;
  hint: string;
  urlVal: string;
  previewVal: string;
  err?: string;
  onUrlChange: (url: string) => void;
  onFileChange: (file: File, preview: string) => void;
  recommendedSize?: string;
}

function DualImageField({ label, hint, urlVal, previewVal, err, onUrlChange, onFileChange, recommendedSize = "600×400px" }: DualImageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Accept base64 preview, https:// URL, or relative /uploads/ path
  const activePreview = previewVal || (urlVal && urlVal.trim() !== "" ? getImageUrl(urlVal) : "");

  const handleFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileChange(file, e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span>
      </label>
      <p className={styles.fieldHint}>{hint}</p>

      <div className={styles.dualImgWrapper}>
        {/* Left — URL input */}
        <div className={styles.dualImgLeft}>
          <p className={styles.dualImgSubLabel}>Option A — Paste URL</p>
          <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${err && !urlVal ? styles.inputError : ""} ${urlVal && !err ? styles.inputSuccess : ""}`}>
            <span className={styles.inputPrefix}>🔗</span>
            <input
              type="text"
              className={`${styles.input} ${styles.inputPrefixed}`}
              placeholder="https://images.unsplash.com/…"
              value={urlVal}
              onChange={(e) => onUrlChange(e.target.value)}
            />
          </div>

          <p className={styles.dualImgOrDivider}><span>— or —</span></p>

          <p className={styles.dualImgSubLabel}>Option B — Upload File</p>
          <label
            className={`${styles.uploadArea} ${styles.uploadAreaSm}`}
            style={{ cursor: "pointer" }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0] || null); }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
            <span className={styles.uploadIcon}>🖼</span>
            <span className={styles.uploadText}>Click or drag &amp; drop</span>
            <span className={styles.uploadSubtext}>JPG, PNG, WEBP — {recommendedSize}</span>
          </label>
        </div>

        {/* Right — Live preview */}
        <div className={styles.dualImgRight}>
          <p className={styles.dualImgSubLabel}>Preview</p>
          {activePreview ? (
            <div className={styles.dualImgPreviewBox}>
              <img
                src={activePreview}
                alt="preview"
                className={styles.dualImgPreviewImg}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <button
                type="button"
                className={styles.dualImgClear}
                onClick={() => { onUrlChange(""); onFileChange(null as any, ""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                title="Clear image"
              >✕</button>
            </div>
          ) : (
            <div className={styles.dualImgPlaceholder}>
              <span>🖼</span>
              <span>No image yet</span>
            </div>
          )}
        </div>
      </div>

      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PLAIN FIELD COMPONENTS
══════════════════════════════════════════════════════ */
function TXT({ label, hint, val, err, onCh, ph, max = 150, req = true }: {
  label: string; hint: string; val: string; err?: string;
  onCh: (v: string) => void; ph: string; max?: number; req?: boolean;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}
      </label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.inputWrap} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <input type="text" className={styles.input} placeholder={ph} value={val} maxLength={max}
          onChange={(e) => onCh(e.target.value)} />
        <span className={styles.charCount}>{val.length}/{max}</span>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

function TA({ label, hint, val, err, onCh, ph, rows = 3, max = 600, req = true }: {
  label: string; hint: string; val: string; err?: string;
  onCh: (v: string) => void; ph: string; rows?: number; max?: number; req?: boolean;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}
      </label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.inputWrap} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <textarea className={`${styles.input} ${styles.textarea}`} placeholder={ph} value={val}
          maxLength={max} rows={rows} onChange={(e) => onCh(e.target.value)} />
        <span className={`${styles.charCount} ${styles.charCountBottom}`}>{val.length}/{max}</span>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

function LINK({ label, hint, val, err, onCh, ph, req = false }: {
  label: string; hint: string; val: string; err?: string;
  onCh: (v: string) => void; ph: string; req?: boolean;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}
      </label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <span className={styles.inputPrefix}>🔗</span>
        <input type="text" className={`${styles.input} ${styles.inputPrefixed}`} placeholder={ph} value={val}
          onChange={(e) => onCh(e.target.value)} />
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ── Jodit Rich Text Field ── */
function RTE({ label, hint, val, err, onCh, req = true }: {
  label: string; hint: string; val: string; err?: string;
  onCh: (v: string) => void; req?: boolean;
}) {
  const config = useJoditConfig();
  const editorRef = useRef(null);
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}
      </label>
      <p className={styles.fieldHint}>{hint}</p>
      <div className={`${styles.joditWrap} ${err ? styles.joditError : ""} ${val && val !== "<p><br></p>" && !err ? styles.joditSuccess : ""}`}>
        <JoditEditor
          ref={editorRef}
          value={val}
          config={config}
          onBlur={(newContent) => onCh(newContent)}
        />
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */

export default function AddYogaCoursesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("courses");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ── State ── */
  const [sectionHeader, setSectionHeader] = useState<CourseSectionHeader>({ eyebrow: "", sectionTitle: "", sectionDesc: "" });
  const [headerErrors, setHeaderErrors]   = useState<Errors<CourseSectionHeader>>({});
  const [courses, setCourses]             = useState<CourseItem[]>([{ ...EMPTY_COURSE }]);
  const [courseErrors, setCourseErrors]   = useState<Errors<CourseItem>[]>([]);

  const [who, setWho]             = useState<WhoSection>({ eyebrow: "", sectionTitle: "", para1: "", para2: "", para3: "", para4: "", para5: "", chips: ["", "", "", "", "", ""], quoteText: "", quoteAttrib: "" });
  const [whoErrors, setWhoErrors] = useState<Errors<WhoSection>>({});

  const [teachersHeader, setTeachersHeader] = useState<TeachersSectionHeader>({ eyebrow: "", sectionTitle: "", introPara1: "", introPara1Highlight: "", introPara2: "", introPara2Highlight: "", ctaBtnText: "", ctaBtnLink: "" });
  const [teachersHeaderErrors, setTHErrors] = useState<Errors<TeachersSectionHeader>>({});

  const [founder, setFounder]             = useState<FounderSection>({ eyebrow: "", name: "", imgUrl: "", imgPreview: "", imgFile: null, imgAlt: "", para1: "", para2: "", para3: "", para3Highlight: "", detailsBtnText: "", detailsBtnLink: "#", bookBtnText: "Book Now", bookBtnLink: "#" });
  const [founderErrors, setFounderErrors] = useState<Errors<FounderSection>>({});

  const [teachers, setTeachers]           = useState<TeacherItem[]>([{ ...EMPTY_TEACHER }]);
  const [teacherErrors, setTeacherErrors] = useState<Errors<TeacherItem>[]>([]);

  /* ══════════ HELPERS ══════════ */
  const setHdr = (k: keyof CourseSectionHeader, v: string) => {
    setSectionHeader((p) => ({ ...p, [k]: v }));
    setHeaderErrors((p) => ({ ...p, [k]: undefined }));
  };

  /* Course helpers */
  const updateCourse = (i: number, k: keyof CourseItem, v: any) =>
    setCourses((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const updateCourseImg = (i: number, file: File | null, preview: string) =>
    setCourses((p) => { const a = [...p]; a[i] = { ...a[i], imgFile: file, imgPreview: preview, imgUrl: file ? "" : a[i].imgUrl }; return a; });
  const updateCourseImgUrl = (i: number, url: string) =>
    setCourses((p) => { const a = [...p]; a[i] = { ...a[i], imgUrl: url, imgFile: null, imgPreview: "" }; return a; });
  const addCourse    = () => { if (courses.length < 6) setCourses((p) => [...p, { ...EMPTY_COURSE }]); };
  const removeCourse = (i: number) => setCourses((p) => p.filter((_, idx) => idx !== i));

  /* Who helpers */
  const setW = (k: keyof WhoSection, v: string) => {
    setWho((p) => ({ ...p, [k]: v }));
    setWhoErrors((p) => ({ ...p, [k]: undefined }));
  };
  const updateChip = (i: number, v: string) =>
    setWho((p) => { const c = [...p.chips]; c[i] = v; return { ...p, chips: c }; });
  const addChip    = () => { if (who.chips.length < 8) setWho((p) => ({ ...p, chips: [...p.chips, ""] })); };
  const removeChip = (i: number) => setWho((p) => ({ ...p, chips: p.chips.filter((_, idx) => idx !== i) }));

  const setTH = (k: keyof TeachersSectionHeader, v: string) => {
    setTeachersHeader((p) => ({ ...p, [k]: v }));
    setTHErrors((p) => ({ ...p, [k]: undefined }));
  };

  /* Founder helpers */
  const setF = (k: keyof FounderSection, v: any) => {
    setFounder((p) => ({ ...p, [k]: v }));
    setFounderErrors((p) => ({ ...p, [k]: undefined }));
  };
  const handleFounderFile = (file: File | null, preview: string) => {
    setFounder((p) => ({ ...p, imgFile: file, imgPreview: preview, imgUrl: file ? "" : p.imgUrl }));
  };
  const handleFounderUrl = (url: string) => {
    setFounder((p) => ({ ...p, imgUrl: url, imgFile: null, imgPreview: "" }));
  };

  /* Teacher helpers */
  const updateTeacher = (i: number, k: keyof TeacherItem, v: string) =>
    setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], [k]: v }; return a; });
  const updateTeacherImg = (i: number, file: File | null, preview: string) =>
    setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], imgFile: file, imgPreview: preview, imgUrl: file ? "" : a[i].imgUrl }; return a; });
  const updateTeacherImgUrl = (i: number, url: string) =>
    setTeachers((p) => { const a = [...p]; a[i] = { ...a[i], imgUrl: url, imgFile: null, imgPreview: "" }; return a; });
  const addTeacher    = () => { if (teachers.length < 10) setTeachers((p) => [...p, { ...EMPTY_TEACHER }]); };
  const removeTeacher = (i: number) => setTeachers((p) => p.filter((_, idx) => idx !== i));

  /* ══════════ VALIDATIONS ══════════ */
  const getImgSrc = (imgUrl: string, imgPreview: string) => imgPreview || imgUrl;

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
      const imgSrc = getImgSrc(c.imgUrl, c.imgPreview);
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
    if (!who.para1.trim() || who.para1 === "<p><br></p>") { e.para1 = "Required"; ok = false; }
    if (!who.para2.trim() || who.para2 === "<p><br></p>") { e.para2 = "Required"; ok = false; }
    if (!who.para3.trim() || who.para3 === "<p><br></p>") { e.para3 = "Required"; ok = false; }
    if (!who.para4.trim() || who.para4 === "<p><br></p>") { e.para4 = "Required"; ok = false; }
    if (!who.para5.trim() || who.para5 === "<p><br></p>") { e.para5 = "Required"; ok = false; }
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
    if (!teachersHeader.introPara1.trim() || teachersHeader.introPara1 === "<p><br></p>") { e.introPara1 = "Required"; ok = false; }
    if (!teachersHeader.introPara1Highlight.trim())  { e.introPara1Highlight = "Required"; ok = false; }
    if (!teachersHeader.introPara2.trim() || teachersHeader.introPara2 === "<p><br></p>") { e.introPara2 = "Required"; ok = false; }
    if (!teachersHeader.introPara2Highlight.trim())  { e.introPara2Highlight = "Required"; ok = false; }
    if (!teachersHeader.ctaBtnText.trim())           { e.ctaBtnText          = "Required"; ok = false; }
    if (!teachersHeader.ctaBtnLink.trim())           { e.ctaBtnLink          = "Required"; ok = false; }
    setTHErrors(e);
    return ok;
  };

  const validateFounder = (): boolean => {
    let ok = true;
    const e: Errors<FounderSection> = {};
    if (!founder.eyebrow.trim())         { e.eyebrow        = "Required"; ok = false; }
    if (!founder.name.trim())            { e.name           = "Required"; ok = false; }
    if (!founder.imgAlt.trim())          { e.imgAlt         = "Required"; ok = false; }
    if (!founder.para1.trim() || founder.para1 === "<p><br></p>") { e.para1 = "Required"; ok = false; }
    if (!founder.para2.trim() || founder.para2 === "<p><br></p>") { e.para2 = "Required"; ok = false; }
    if (!founder.para3.trim() || founder.para3 === "<p><br></p>") { e.para3 = "Required"; ok = false; }
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

  /* ══════════ SUBMIT ══════════ */
  const handleSubmit = async () => {
    const v1 = validateCourses();
    const v2 = validateWho();
    const v3 = validateTeachersHeader();
    const v4 = validateFounder();
    const v5 = validateTeachers();
    if (!v1 || !v2 || !v3 || !v4 || !v5) {
      alert("Please fill all required fields in all sections");
      return;
    }
    try {
      setIsSubmitting(true);

      // ── Check if any file uploads exist ──
      const hasFiles =
        courses.some((c) => c.imgFile) ||
        !!founder.imgFile ||
        teachers.some((t) => t.imgFile);

      // ── Build clean payload (strip HTML from ALL text fields) ──
      const payload = {
        sectionHeader: {
          eyebrow:      stripHtml(sectionHeader.eyebrow),
          sectionTitle: stripHtml(sectionHeader.sectionTitle),
          sectionDesc:  stripHtml(sectionHeader.sectionDesc),
        },
        courses: courses.map((c, i) => ({
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
        who: {
          eyebrow:      stripHtml(who.eyebrow),
          sectionTitle: stripHtml(who.sectionTitle),
          para1:        stripHtml(who.para1),
          para2:        stripHtml(who.para2),
          para3:        stripHtml(who.para3),
          para4:        stripHtml(who.para4),
          para5:        stripHtml(who.para5),
          chips:        who.chips.filter((c) => c.trim() !== "").map(stripHtml),
          quoteText:    stripHtml(who.quoteText),
          quoteAttrib:  stripHtml(who.quoteAttrib),
        },
        teachersHeader: {
          eyebrow:             stripHtml(teachersHeader.eyebrow),
          sectionTitle:        stripHtml(teachersHeader.sectionTitle),
          introPara1:          stripHtml(teachersHeader.introPara1),
          introPara1Highlight: stripHtml(teachersHeader.introPara1Highlight),
          introPara2:          stripHtml(teachersHeader.introPara2),
          introPara2Highlight: stripHtml(teachersHeader.introPara2Highlight),
          ctaBtnText:          stripHtml(teachersHeader.ctaBtnText),
          ctaBtnLink:          teachersHeader.ctaBtnLink,
        },
        founder: {
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
        },
        teachers: teachers
          .filter((t) => t.name.trim() && t.surname.trim())
          .map((t, i) => ({
            name:    stripHtml(t.name),
            surname: stripHtml(t.surname),
            imgUrl:  t.imgFile ? `__upload_teacherImg_${i}` : t.imgUrl,
          })),
      };

      if (hasFiles) {
        // ── Send as FormData (files + JSON data field) ──
        const formData = new FormData();
        courses.forEach((c, i) => { if (c.imgFile) formData.append(`courseImg_${i}`, c.imgFile); });
        if (founder.imgFile) formData.append("founderImg", founder.imgFile);
        teachers.forEach((t, i) => { if (t.imgFile) formData.append(`teacherImg_${i}`, t.imgFile); });
        formData.append("data", JSON.stringify(payload));
        await api.post("/yoga-courses/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // ── No files — send plain JSON ──
        await api.post("/yoga-courses/create", payload);
      }

      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/yogacoursespage"), 1500);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err?.response?.data?.message || "Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Tab error flags ── */
  const tabErr: Record<TabId, boolean> = {
    courses:        Object.keys(headerErrors).length > 0 || courseErrors.some((e) => Object.keys(e).length > 0),
    who:            Object.keys(whoErrors).length > 0,
    teachersHeader: Object.keys(teachersHeaderErrors).length > 0,
    founder:        Object.keys(founderErrors).length > 0,
    teachers:       teacherErrors.some((e) => Object.keys(e).length > 0),
  };

  const TAB_LABELS: Record<TabId, string> = {
    courses: "① Courses", who: "② Who Section",
    teachersHeader: "③ Teachers Intro", founder: "④ Founder", teachers: "⑤ Teachers Grid",
  };

  /* ── Success Screen ── */
  if (submitted) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successOm}>ॐ</div>
          <div className={styles.successCheck}>✓</div>
          <h2 className={styles.successTitle}>Section Saved!</h2>
          <p className={styles.successText}>Redirecting to yoga courses list…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin")}>Dashboard</button>
        <span className={styles.breadcrumbSep}>›</span>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard/yogacoursespage")}>Yoga Courses</button>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Add New</span>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Add — Yoga Courses &amp; Teachers Page</h1>
        <p className={styles.pageSubtitle}>Fill each section and save independently</p>
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
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1 — COURSES ══════════ */}
      {activeTab === "courses" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Header</h3></div>
            <TXT label="Eyebrow Text" hint='Small text above the heading — e.g. "Sacred Path of Yoga"' val={sectionHeader.eyebrow} err={headerErrors.eyebrow} onCh={(v) => setHdr("eyebrow", v)} ph="e.g. Sacred Path of Yoga" max={80} />
            <TXT label="Section Title (H2)" hint="Main heading of the courses section" val={sectionHeader.sectionTitle} err={headerErrors.sectionTitle} onCh={(v) => setHdr("sectionTitle", v)} ph="e.g. Join Our Yoga Teacher Training in Rishikesh" />
            <TA  label="Section Description" hint="Paragraph shown below the heading" val={sectionHeader.sectionDesc} err={headerErrors.sectionDesc} onCh={(v) => setHdr("sectionDesc", v)} ph="Ready to embark on a transformative path…" max={400} rows={3} />
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
                <div key={i} className={styles.certCard}>
                  <div className={styles.certCardHeader}>
                    <span className={styles.certCardNum}>{i + 1}</span>
                    <span className={styles.certCardTitle}>Course #{i + 1} — {c.name || "Untitled"}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => removeCourse(i)} disabled={courses.length <= 1}>✕ Remove</button>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Course Name<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Full name shown on the card</p>
                        <div className={`${styles.inputWrap} ${courseErrors[i]?.name ? styles.inputError : ""} ${c.name && !courseErrors[i]?.name ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={100} placeholder="e.g. Beginner Yoga Course" value={c.name} onChange={(e) => updateCourse(i, "name", e.target.value)} />
                        </div>
                        {courseErrors[i]?.name && <p className={styles.errorMsg}>⚠ {courseErrors[i].name}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Hours Label<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Badge on card image — e.g. 100 HOUR YOGA</p>
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
                        <p className={styles.fieldHint}>Meta row value — e.g. 14 Days</p>
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
                        <p className={styles.fieldHint}>Price for shared accommodation</p>
                        <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${courseErrors[i]?.feeShared ? styles.inputError : ""} ${c.feeShared && !courseErrors[i]?.feeShared ? styles.inputSuccess : ""}`}>
                          <span className={styles.inputPrefix}>$</span>
                          <input type="number" className={`${styles.input} ${styles.inputPrefixed}`} placeholder="500" value={c.feeShared} onChange={(e) => updateCourse(i, "feeShared", e.target.value)} />
                        </div>
                        {courseErrors[i]?.feeShared && <p className={styles.errorMsg}>⚠ {courseErrors[i].feeShared}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Private Room Fee (USD)<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Price for private accommodation</p>
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

                    {/* ── DUAL IMAGE — Card ── */}
                    <DualImageField
                      label="Card Image"
                      hint="Upload a file OR paste an image URL (w=600&q=80 recommended)"
                      urlVal={c.imgUrl}
                      previewVal={c.imgPreview}
                      err={courseErrors[i]?.imgUrl}
                      onUrlChange={(url) => updateCourseImgUrl(i, url)}
                      onFileChange={(file, preview) => updateCourseImg(i, file, preview)}
                      recommendedSize="600×400px"
                    />

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}><span className={styles.labelIcon}>✦</span>Accent Color</label>
                      <p className={styles.fieldHint}>Card overlay gradient color (--card-color)</p>
                      <div className={styles.colorInputWrap}>
                        <div className={styles.colorSwatch} style={{ background: c.color }}>
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
            <Link href="/admin/dashboard/yogacoursespage" className={styles.cancelBtn}>← Cancel</Link>
            <button type="button" className={styles.submitBtn} onClick={() => setActiveTab("who")} disabled={isSubmitting}>
              Next: Who Section →
            </button>
          </div>
        </div>
      )}

      {/* ══════════ TAB 2 — WHO ══════════ */}
      {activeTab === "who" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Head</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Eyebrow" hint='Small label above heading — e.g. "Open to All Seekers"' val={who.eyebrow} err={whoErrors.eyebrow} onCh={(v) => setW("eyebrow", v)} ph="e.g. Open to All Seekers" max={80} />
              <TXT label="Section Title (H2)" hint="Main heading of the who section" val={who.sectionTitle} err={whoErrors.sectionTitle} onCh={(v) => setW("sectionTitle", v)} ph="e.g. Who Can Join Yoga TTC in Rishikesh?" />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Left Column — 5 Body Paragraphs</h3></div>
            <RTE label="Paragraph 1" hint="About the course not being limited to vocational learners. Use Bold, Color etc. as needed." val={who.para1} err={whoErrors.para1} onCh={(v) => setW("para1", v)} />
            <RTE label="Paragraph 2" hint="Age 18–50, body & mind benefits, yoga retreats." val={who.para2} err={whoErrors.para2} onCh={(v) => setW("para2", v)} />
            <RTE label="Paragraph 3" hint="Career reasons — yoga teacher, lifestyle, weight loss, all walks of life." val={who.para3} err={whoErrors.para3} onCh={(v) => setW("para3", v)} />
            <RTE label="Paragraph 4" hint="Teachers' personal & spiritual growth, sharing knowledge." val={who.para4} err={whoErrors.para4} onCh={(v) => setW("para4", v)} />
            <RTE label="Paragraph 5" hint="Career opportunity, Yoga Alliance certificate, teach globally." val={who.para5} err={whoErrors.para5} onCh={(v) => setW("para5", v)} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Right Decor — Feature Chips (✦ items)</h3>
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
            <TA label="Quote Text" hint='Shown with " " marks by frontend — do not include quotes here.' val={who.quoteText} err={whoErrors.quoteText} onCh={(v) => setW("quoteText", v)} ph="Yoga is the journey of the self, through the self, to the self." max={200} rows={2} />
            <TXT label="Quote Attribution" hint='Author / source line — e.g. "— Bhagavad Gita"' val={who.quoteAttrib} err={whoErrors.quoteAttrib} onCh={(v) => setW("quoteAttrib", v)} ph="— Bhagavad Gita" max={80} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveTab("courses")}>← Previous</button>
            <button type="button" className={styles.submitBtn} onClick={() => setActiveTab("teachersHeader")} disabled={isSubmitting}>
              Next: Teachers Intro →
            </button>
          </div>
        </div>
      )}

      {/* ══════════ TAB 3 — TEACHERS HEADER ══════════ */}
      {activeTab === "teachersHeader" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Head</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Eyebrow" hint='Small label above heading — e.g. "Masters of the Ancient Art"' val={teachersHeader.eyebrow} err={teachersHeaderErrors.eyebrow} onCh={(v) => setTH("eyebrow", v)} ph="e.g. Masters of the Ancient Art" max={80} />
              <TXT label="Section Title (H2)" hint="Main heading of the teachers section" val={teachersHeader.sectionTitle} err={teachersHeaderErrors.sectionTitle} onCh={(v) => setTH("sectionTitle", v)} ph="e.g. Our Experienced Yoga Teachers" />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Intro Paragraphs</h3></div>
            {/* Jodit for intro para 1 */}
            <RTE label="Intro Paragraph 1" hint="About the team — use Bold to highlight important keywords directly inside the editor." val={teachersHeader.introPara1} err={teachersHeaderErrors.introPara1} onCh={(v) => setTH("introPara1", v)} />
            <TXT label="Paragraph 1 — Bold Highlight Text (plain)" hint="Optional: exact phrase from para 1 that the frontend wraps in <strong> (legacy support)" val={teachersHeader.introPara1Highlight} err={teachersHeaderErrors.introPara1Highlight} onCh={(v) => setTH("introPara1Highlight", v)} ph="e.g. hatha yoga teacher training in Rishikesh" max={120} />
            {/* Jodit for intro para 2 */}
            <RTE label="Intro Paragraph 2" hint="About online courses — use Bold to highlight keywords directly inside the editor." val={teachersHeader.introPara2} err={teachersHeaderErrors.introPara2} onCh={(v) => setTH("introPara2", v)} />
            <TXT label="Paragraph 2 — Bold Highlight Text (plain)" hint="Optional: exact phrase from para 2 that the frontend wraps in <strong> (legacy support)" val={teachersHeader.introPara2Highlight} err={teachersHeaderErrors.introPara2Highlight} onCh={(v) => setTH("introPara2Highlight", v)} ph="e.g. online yoga instructor courses in Rishikesh" max={120} />
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>"Our Teachers' Information" CTA Button</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Button Text" hint="Label shown on the CTA button" val={teachersHeader.ctaBtnText} err={teachersHeaderErrors.ctaBtnText} onCh={(v) => setTH("ctaBtnText", v)} ph="e.g. Our Teachers' Information" max={80} />
              <LINK label="Button Link" hint="href for the CTA button" val={teachersHeader.ctaBtnLink} err={teachersHeaderErrors.ctaBtnLink} onCh={(v) => setTH("ctaBtnLink", v)} ph="/teachers or #" req />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveTab("who")}>← Previous</button>
            <button type="button" className={styles.submitBtn} onClick={() => setActiveTab("founder")} disabled={isSubmitting}>
              Next: Founder →
            </button>
          </div>
        </div>
      )}

      {/* ══════════ TAB 4 — FOUNDER ══════════ */}
      {activeTab === "founder" && (
        <div className={styles.formCard}>
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Founder Identity</h3></div>
            <div className={styles.twoCol}>
              <TXT label="Eyebrow / Role Label" hint='Small text above the founder name — e.g. "Founder of AYM Yoga School"' val={founder.eyebrow} err={founderErrors.eyebrow} onCh={(v) => setF("eyebrow", v)} ph="e.g. Founder of AYM Yoga School" max={80} />
              <TXT label="Founder Name (H3)" hint="Full display name" val={founder.name} err={founderErrors.name} onCh={(v) => setF("name", v)} ph="e.g. Yogi Chetan Mahesh" max={80} />
            </div>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Founder Photo</h3></div>

            {/* ── DUAL IMAGE — Founder ── */}
            <DualImageField
              label="Founder Photo"
              hint="Upload a file OR paste an image URL. Recommended 500×600px."
              urlVal={founder.imgUrl}
              previewVal={founder.imgPreview}
              err={founderErrors.imgUrl}
              onUrlChange={handleFounderUrl}
              onFileChange={handleFounderFile}
              recommendedSize="500×600px"
            />

            <TXT label="Image Alt Text" hint='Accessibility alt — e.g. "Yogi Chetan Mahesh — Founder of AYM Yoga School"' val={founder.imgAlt} err={founderErrors.imgAlt} onCh={(v) => setF("imgAlt", v)} ph="e.g. Yogi Chetan Mahesh — Founder of AYM Yoga School" max={150} />
            <p className={styles.fieldHint} style={{ marginTop: "-1rem" }}>
              Note: The overlay name label inside the image frame auto-uses the <strong>Founder Name</strong> field above.
            </p>
          </div>
          <div className={styles.formDivider} />
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Bio Paragraphs</h3></div>
            <RTE label="Paragraph 1" hint="Years of experience — Hatha & Ashtanga Yoga. Use Bold/Color for emphasis." val={founder.para1} err={founderErrors.para1} onCh={(v) => setF("para1", v)} />
            <RTE label="Paragraph 2" hint="Student count (15,000+), best yoga instructor in India." val={founder.para2} err={founderErrors.para2} onCh={(v) => setF("para2", v)} />
            <RTE label="Paragraph 3" hint="Achievement paragraph — bold the key achievement directly inside the editor." val={founder.para3} err={founderErrors.para3} onCh={(v) => setF("para3", v)} />
            <TXT label="Paragraph 3 — Bold Highlight Text (plain)" hint="Optional: exact phrase from para 3 wrapped in <strong> (legacy support)" val={founder.para3Highlight} err={founderErrors.para3Highlight} onCh={(v) => setF("para3Highlight", v)} ph="e.g. Gold Medal recipient" max={80} />
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
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveTab("teachersHeader")}>← Previous</button>
            <button type="button" className={styles.submitBtn} onClick={() => setActiveTab("teachers")} disabled={isSubmitting}>
              Next: Teachers Grid →
            </button>
          </div>
        </div>
      )}

      {/* ══════════ TAB 5 — TEACHERS GRID ══════════ */}
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
                <div key={i} className={styles.certCard}>
                  <div className={styles.certCardHeader}>
                    <span className={styles.certCardNum}>{i + 1}</span>
                    <span className={styles.certCardTitle}>Teacher #{i + 1} — {t.name ? `${t.name} ${t.surname}` : "Untitled"}</span>
                    <button type="button" className={styles.removeBtn} onClick={() => removeTeacher(i)} disabled={teachers.length <= 1}>✕ Remove</button>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div className={styles.twoCol}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>First Name<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Include title — e.g. Dr. / Yogi</p>
                        <div className={`${styles.inputWrap} ${teacherErrors[i]?.name ? styles.inputError : ""} ${t.name && !teacherErrors[i]?.name ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={60} placeholder="e.g. Dr. Mahesh or Yogi Deepak" value={t.name} onChange={(e) => updateTeacher(i, "name", e.target.value)} />
                        </div>
                        {teacherErrors[i]?.name && <p className={styles.errorMsg}>⚠ {teacherErrors[i].name}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>Surname<span className={styles.required}>*</span></label>
                        <p className={styles.fieldHint}>Shown below the first name on the card</p>
                        <div className={`${styles.inputWrap} ${teacherErrors[i]?.surname ? styles.inputError : ""} ${t.surname && !teacherErrors[i]?.surname ? styles.inputSuccess : ""}`}>
                          <input type="text" className={styles.input} maxLength={60} placeholder="e.g. Bhatt" value={t.surname} onChange={(e) => updateTeacher(i, "surname", e.target.value)} />
                        </div>
                        {teacherErrors[i]?.surname && <p className={styles.errorMsg}>⚠ {teacherErrors[i].surname}</p>}
                      </div>
                    </div>

                    {/* ── DUAL IMAGE — Teacher ── */}
                    <DualImageField
                      label="Teacher Photo"
                      hint="Upload a file OR paste an image URL. Recommended 300×350px."
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
            <button type="button" className={styles.cancelBtn} onClick={() => setActiveTab("founder")}>← Previous</button>
            <button
              type="button"
              className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <><span className={styles.spinner} /> Creating…</> : <><span>✦</span> Create Yoga Courses Page</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}