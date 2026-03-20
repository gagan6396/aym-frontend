// FILE: src/app/admin/dashboard/100hr-content/add-new/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import toast from "react-hot-toast";
import styles from "@/assets/style/Admin/yogacourse/100hourscourse/Contentmodule.module.css";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

/* ══════════════════════════════
   TYPES
══════════════════════════════ */
interface SylModule { title: string; desc: string; }
interface ScheduleItem { time: string; label: string; }

interface FormData {
  bannerImage: string;
  heroTitle: string;
  heroParagraphs: string[];
  transformTitle: string;
  transformParagraphs: string[];
  whatIsTitle: string;
  whatIsParagraphs: string[];
  whyChooseTitle: string;
  whyChooseParagraphs: string[];
  suitableTitle: string;
  suitableItems: string[];
  syllabusTitle: string;
  syllabusParagraphs: string[];
  syllabusLeft: SylModule[];
  syllabusRight: SylModule[];
  scheduleImage: string;
  scheduleItems: ScheduleItem[];
  soulShineText: string;
  soulShineImage: string;
  enrollTitle: string;
  enrollParagraphs: string[];
  enrollItems: string[];
  comprehensiveTitle: string;
  comprehensiveParagraphs: string[];
  certTitle: string;
  certParagraphs: string[];
  registrationTitle: string;
  registrationParagraphs: string[];
  includedItems: string[];
  notIncludedItems: string[];
}

type StrKey = keyof Omit<FormData,
  "heroParagraphs" | "transformParagraphs" | "whatIsParagraphs" | "whyChooseParagraphs" |
  "syllabusParagraphs" | "enrollParagraphs" | "comprehensiveParagraphs" | "certParagraphs" |
  "registrationParagraphs" | "suitableItems" | "enrollItems" | "includedItems" | "notIncludedItems" |
  "syllabusLeft" | "syllabusRight" | "scheduleItems"
>;

type ParaKey =
  | "heroParagraphs" | "transformParagraphs" | "whatIsParagraphs" | "whyChooseParagraphs"
  | "syllabusParagraphs" | "enrollParagraphs" | "comprehensiveParagraphs" | "certParagraphs"
  | "registrationParagraphs";

type ListKey = "suitableItems" | "enrollItems" | "includedItems" | "notIncludedItems";

/* ══════════════════════════════
   INITIAL STATE
══════════════════════════════ */
const EMPTY: FormData = {
  bannerImage: "",
  heroTitle: "100 Hour Yoga Teacher Training Course in Rishikesh India",
  heroParagraphs: [""],
  transformTitle: "Transform Your Practice with a 100 Hour Yoga Course in Rishikesh",
  transformParagraphs: [""],
  whatIsTitle: "What is a 100 Hour Yoga Teacher Training?",
  whatIsParagraphs: [""],
  whyChooseTitle: "Why Choose AYM Yoga School for Your 100 Hour Yoga TTC",
  whyChooseParagraphs: [""],
  suitableTitle: "100 Hours Yoga TTC is suitable for:",
  suitableItems: [""],
  syllabusTitle: "Syllabus of Premier - 100 Hour Yoga Teacher Training Course in Rishikesh, India",
  syllabusParagraphs: [""],
  syllabusLeft: [{ title: "", desc: "" }],
  syllabusRight: [{ title: "", desc: "" }],
  scheduleImage: "",
  scheduleItems: [{ time: "", label: "" }],
  soulShineText: "Let Your Soul Shine",
  soulShineImage: "",
  enrollTitle: "Why Enrol in AYM for a 100 hour Yoga Teacher Training Course in Rishikesh?",
  enrollParagraphs: [""],
  enrollItems: [""],
  comprehensiveTitle: "Comprehensive 100 Hour Yoga Teacher Training Course in Rishikesh",
  comprehensiveParagraphs: [""],
  certTitle: "100 Hour Yoga Teacher Training Course Certification at AYM",
  certParagraphs: [""],
  registrationTitle: "Registration Process",
  registrationParagraphs: [""],
  includedItems: [""],
  notIncludedItems: [""],
};

/* ══════════════════════════════
   JODIT CONFIG — full toolbar with color picker
══════════════════════════════ */
const joditCfg = (height = 220): any => ({
  readonly: false,
  toolbar: true,
  toolbarAdaptive: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  defaultActionOnPaste: "insert_clear_html",
  height,
  placeholder: "Start typing…",
  buttons: [
    "bold", "italic", "underline", "strikethrough", "|",
    "brush",       // text color
    "fontsize", "|",
    "align", "|",
    "ul", "ol", "|",
    "link", "|",
    "undo", "redo",
  ],
  colorPickerDefaultTab: "text",
});

/* ══════════════════════════════
   COMPONENT
══════════════════════════════ */
export default function ContentAddPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* ✅ FIX: MutableRefObject<T | null> — no type mismatch */
  const bannerFileRef = useRef<HTMLInputElement | null>(null);
  const schedImgRef   = useRef<HTMLInputElement | null>(null);
  const soulImgRef    = useRef<HTMLInputElement | null>(null);
  const bannerFile    = useRef<File | null>(null);
  const schedFile     = useRef<File | null>(null);
  const soulFile      = useRef<File | null>(null);

  /* Check if content already exists */
  useEffect(() => {
    api.get("/100hr-content/get").then(res => {
      if (res.data.data) {
        toast.error("Content already exists. Edit it instead.");
        router.replace("/admin/dashboard/100hr-content");
      }
    }).catch(() => {});
  }, [router]);

  /* ── Simple string field setter ── */
  const set = (key: StrKey, val: string) => {
    setForm(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: undefined }));
  };

  /* ── Dynamic paragraph helpers ── */
  const updatePara = (key: ParaKey, idx: number, val: string) =>
    setForm(p => { const a = [...p[key]]; a[idx] = val; return { ...p, [key]: a }; });
  const addPara = (key: ParaKey) =>
    setForm(p => ({ ...p, [key]: [...p[key], ""] }));
  const removePara = (key: ParaKey, idx: number) =>
    setForm(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  /* ── List item helpers ── */
  const updateList = (key: ListKey, idx: number, val: string) =>
    setForm(p => { const a = [...p[key]]; a[idx] = val; return { ...p, [key]: a }; });
  const addList = (key: ListKey) =>
    setForm(p => ({ ...p, [key]: [...p[key], ""] }));
  const removeList = (key: ListKey, idx: number) =>
    setForm(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));

  /* ── Syllabus module helpers ── */
  const updateSyl = (side: "syllabusLeft" | "syllabusRight", idx: number, field: keyof SylModule, val: string) =>
    setForm(p => { const a = [...p[side]]; a[idx] = { ...a[idx], [field]: val }; return { ...p, [side]: a }; });
  const addSyl = (side: "syllabusLeft" | "syllabusRight") =>
    setForm(p => ({ ...p, [side]: [...p[side], { title: "", desc: "" }] }));
  const removeSyl = (side: "syllabusLeft" | "syllabusRight", idx: number) =>
    setForm(p => ({ ...p, [side]: p[side].filter((_, i) => i !== idx) }));

  /* ── Schedule helpers ── */
  const updateSched = (idx: number, field: keyof ScheduleItem, val: string) =>
    setForm(p => { const a = [...p.scheduleItems]; a[idx] = { ...a[idx], [field]: val }; return { ...p, scheduleItems: a }; });
  const addSched = () =>
    setForm(p => ({ ...p, scheduleItems: [...p.scheduleItems, { time: "", label: "" }] }));
  const removeSched = (idx: number) =>
    setForm(p => ({ ...p, scheduleItems: p.scheduleItems.filter((_, i) => i !== idx) }));

  /* ── Image file handler ── */
  const handleImgFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileRef: React.MutableRefObject<File | null>,
    key: StrKey
  ) => {
    const f = e.target.files?.[0];
    if (!f) return;
    fileRef.current = f;
    set(key, URL.createObjectURL(f));
    if (e.target) e.target.value = "";
  };

  /* ── Validate ── */
  const validate = () => {
    const e: Partial<Record<string, string>> = {};
    if (!form.heroTitle.trim()) e.heroTitle = "Required";
    if (form.heroParagraphs.every(p => !p.replace(/<[^>]*>/g, "").trim()))
      e.heroParagraphs = "At least one paragraph required";
    if (!form.syllabusTitle.trim()) e.syllabusTitle = "Required";
    if (form.syllabusLeft.some(m => !m.title.trim() || !m.desc.trim()))
      e.syllabusLeft = "All module fields required";
    if (form.syllabusRight.some(m => !m.title.trim() || !m.desc.trim()))
      e.syllabusRight = "All module fields required";
    if (form.scheduleItems.some(s => !s.time.trim() || !s.label.trim()))
      e.scheduleItems = "All schedule fields required";
    if (form.includedItems.some(s => !s.trim())) e.includedItems = "All items must be filled";
    if (form.notIncludedItems.some(s => !s.trim())) e.notIncludedItems = "All items must be filled";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!validate()) { toast.error("Please fill all required fields"); return; }
    try {
      setIsSubmitting(true);
      const fd = new FormData();

      if (bannerFile.current) fd.append("bannerImage", bannerFile.current);
      else if (form.bannerImage) fd.append("bannerImageUrl", form.bannerImage);

      if (schedFile.current) fd.append("scheduleImage", schedFile.current);
      else if (form.scheduleImage) fd.append("scheduleImageUrl", form.scheduleImage);

      if (soulFile.current) fd.append("soulShineImage", soulFile.current);
      else if (form.soulShineImage) fd.append("soulShineImageUrl", form.soulShineImage);

      fd.append("data", JSON.stringify({
        ...form,
        bannerImage: undefined,
        scheduleImage: undefined,
        soulShineImage: undefined,
      }));

      await api.post("/100hr-content/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/100hr-content"), 1500);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) return (
    <div className={styles.successScreen}>
      <div className={styles.successCard}>
        <div className={styles.successOm}>ॐ</div>
        <div className={styles.successCheck}>✓</div>
        <h2 className={styles.successTitle}>Content Saved!</h2>
        <p className={styles.successText}>Redirecting…</p>
      </div>
    </div>
  );

  /* ════════════════════════════════
     REUSABLE SUB-COMPONENTS
  ════════════════════════════════ */

  /* Jodit rich text field */
  const JField = ({
    label, hint, value, onChange, errorKey, height = 220, required = true,
  }: {
    label: string; hint?: string; value: string;
    onChange: (v: string) => void; errorKey?: string;
    height?: number; required?: boolean;
  }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.joditWrap} ${errorKey && errors[errorKey] ? styles.inputError : ""}`}>
        <JoditEditor value={value} config={joditCfg(height)} onBlur={v => onChange(v)} />
      </div>
      {errorKey && errors[errorKey] && <p className={styles.errorMsg}>⚠ {errors[errorKey]}</p>}
    </div>
  );

  /* Dynamic paragraphs block */
  const ParaBlock = ({ label, paraKey, required = false }: {
    label: string; paraKey: ParaKey; required?: boolean;
  }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {errors[paraKey] && <p className={styles.errorMsg}>⚠ {errors[paraKey]}</p>}
      <div className={styles.paraStack}>
        {form[paraKey].map((val, i) => (
          <div key={i} className={styles.paraItem}>
            <div className={styles.paraItemHeader}>
              <span className={styles.paraNum}>Para {i + 1}</span>
              <button type="button" className={styles.removeItemBtn}
                onClick={() => removePara(paraKey, i)}
                disabled={form[paraKey].length <= 1}>✕</button>
            </div>
            <div className={styles.joditWrap}>
              <JoditEditor value={val} config={joditCfg(200)} onBlur={v => updatePara(paraKey, i, v)} />
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItemBtn} onClick={() => addPara(paraKey)}>
        + Add Paragraph
      </button>
    </div>
  );

  /* Simple text input field */
  const TField = ({ label, hint, fkey, placeholder = "", max = 250 }: {
    label: string; hint?: string; fkey: StrKey; placeholder?: string; max?: number;
  }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span>
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.inputWrap} ${errors[fkey] ? styles.inputError : ""} ${(form[fkey] as string) && !errors[fkey] ? styles.inputSuccess : ""}`}>
        <input type="text" className={styles.input}
          placeholder={placeholder} value={form[fkey] as string}
          maxLength={max} onChange={e => set(fkey, e.target.value)} />
        <span className={styles.charCount}>{(form[fkey] as string).length}/{max}</span>
      </div>
      {errors[fkey] && <p className={styles.errorMsg}>⚠ {errors[fkey]}</p>}
    </div>
  );

  /* ✅ FIX: inputRef type is MutableRefObject<HTMLInputElement | null> */
  const ImgField = ({
    label, hint, fkey, fileRef, inputRef,
  }: {
    label: string; hint?: string; fkey: StrKey;
    fileRef: React.MutableRefObject<File | null>;
    inputRef: React.MutableRefObject<HTMLInputElement | null>;
  }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={styles.imgUploadRow}>
        <div className={styles.imgPreviewBox}>
          {(form[fkey] as string)
            ? <img src={form[fkey] as string} alt="preview" className={styles.imgPreview} />
            : <span className={styles.imgPreviewEmpty}>🖼</span>
          }
        </div>
        <div className={styles.imgUploadControls}>
          <div className={styles.imgUploadZone} onClick={() => inputRef.current?.click()}>
            <span>📁 Click to upload</span>
            <span className={styles.imgUploadSub}>JPG · PNG · WEBP</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={e => handleImgFile(e, fileRef, fkey)}
          />
          <div className={styles.imgUrlRow}>
            <div className={styles.inputWrap}>
              <input type="text" className={styles.input}
                placeholder="Or paste image URL…"
                value={form[fkey] as string}
                onChange={e => { fileRef.current = null; set(fkey, e.target.value); }} />
            </div>
            {(form[fkey] as string) && (
              <button type="button" className={styles.imgClearBtn}
                onClick={() => { fileRef.current = null; set(fkey, ""); }}>✕</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  /* String list field */
  const ListField = ({ label, fkey, placeholder }: {
    label: string; fkey: ListKey; placeholder: string;
  }) => (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span>
      </label>
      {errors[fkey] && <p className={styles.errorMsg}>⚠ {errors[fkey]}</p>}
      <div className={styles.listItems}>
        {form[fkey].map((val, i) => (
          <div key={i} className={styles.listItemRow}>
            <span className={styles.listNum}>{i + 1}</span>
            <div className={`${styles.inputWrap} ${styles.listInput}`}>
              <input type="text" className={styles.input}
                placeholder={placeholder} value={val} maxLength={300}
                onChange={e => updateList(fkey, i, e.target.value)} />
            </div>
            <button type="button" className={styles.removeItemBtn}
              onClick={() => removeList(fkey, i)} disabled={form[fkey].length <= 1}>✕</button>
          </div>
        ))}
      </div>
      <button type="button" className={styles.addItemBtn} onClick={() => addList(fkey)}>
        + Add Item
      </button>
    </div>
  );

  /* ════════════════════════════════
     RENDER
  ════════════════════════════════ */
  return (
    <div className={styles.formPage}>
      <div className={styles.breadcrumb}>
        <Link href="/admin/dashboard/100hr-content" className={styles.breadcrumbLink}>
          Page Content
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Add Content</span>
      </div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Add Page Content</h1>
        <p className={styles.pageSubtitle}>Fill in all content sections for the 100 Hour YTT page</p>
      </div>
      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} />
        <span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      <div className={styles.formCard}>

        {/* ══ BANNER ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Page Banner / Hero Image</h3>
          </div>
          <ImgField label="Banner Image"
            hint="Main hero image shown at the top of the page"
            fkey="bannerImage" fileRef={bannerFile} inputRef={bannerFileRef} />
        </div>

        <div className={styles.formDivider} />

        {/* ══ HERO ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Hero Section</h3>
          </div>
          <TField label="Hero Title (H1)" fkey="heroTitle" max={200} />
          <ParaBlock label="Hero Intro Text" paraKey="heroParagraphs" required />
        </div>

        <div className={styles.formDivider} />

        {/* ══ TRANSFORM ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Transform Your Practice</h3>
          </div>
          <TField label="Section Title" fkey="transformTitle" max={200} />
          <ParaBlock label="Paragraphs" paraKey="transformParagraphs" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ WHAT IS ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>What is 100 Hour YTT?</h3>
          </div>
          <TField label="Section Title" fkey="whatIsTitle" max={200} />
          <ParaBlock label="Paragraphs" paraKey="whatIsParagraphs" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ WHY CHOOSE ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Why Choose AYM?</h3>
          </div>
          <TField label="Section Title" fkey="whyChooseTitle" max={200} />
          <ParaBlock label="Paragraphs" paraKey="whyChooseParagraphs" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ SUITABLE ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Suitable For (List)</h3>
          </div>
          <TField label="Section Title" fkey="suitableTitle" max={200} />
          <ListField label="List Items" fkey="suitableItems"
            placeholder="e.g. If you want to understand and study yoga holistically…" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ SYLLABUS ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Syllabus Section</h3>
          </div>
          <TField label="Syllabus Title" fkey="syllabusTitle" max={250} />
          <ParaBlock label="Intro Paragraphs" paraKey="syllabusParagraphs" />

          {/* Left Modules */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✦</span>Left Column Modules<span className={styles.required}>*</span>
            </label>
            {errors.syllabusLeft && <p className={styles.errorMsg}>⚠ {errors.syllabusLeft}</p>}
            <div className={styles.moduleList}>
              {form.syllabusLeft.map((m, i) => (
                <div key={i} className={styles.moduleCard}>
                  <div className={styles.moduleCardHeader}>
                    <span className={styles.moduleNum}>Module L{i + 1}</span>
                    <button type="button" className={styles.removeItemBtn}
                      onClick={() => removeSyl("syllabusLeft", i)}
                      disabled={form.syllabusLeft.length <= 1}>✕</button>
                  </div>
                  <div className={styles.moduleFields}>
                    <div className={styles.fieldGroup} style={{ marginBottom: "0.8rem" }}>
                      <label className={styles.labelSm}>Title</label>
                      <div className={styles.inputWrap}>
                        <input type="text" className={styles.input}
                          placeholder="e.g. Practice of Yoga Techniques"
                          value={m.title} maxLength={100}
                          onChange={e => updateSyl("syllabusLeft", i, "title", e.target.value)} />
                      </div>
                    </div>
                    <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.labelSm}>Description</label>
                      <div className={styles.inputWrap}>
                        <textarea className={`${styles.input} ${styles.textarea}`} rows={3}
                          placeholder="Module description…" value={m.desc} maxLength={400}
                          onChange={e => updateSyl("syllabusLeft", i, "desc", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addItemBtn}
              onClick={() => addSyl("syllabusLeft")}>+ Add Left Module</button>
          </div>

          {/* Right Modules */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✦</span>Right Column Modules<span className={styles.required}>*</span>
            </label>
            {errors.syllabusRight && <p className={styles.errorMsg}>⚠ {errors.syllabusRight}</p>}
            <div className={styles.moduleList}>
              {form.syllabusRight.map((m, i) => (
                <div key={i} className={styles.moduleCard}>
                  <div className={styles.moduleCardHeader}>
                    <span className={styles.moduleNum}>Module R{i + 1}</span>
                    <button type="button" className={styles.removeItemBtn}
                      onClick={() => removeSyl("syllabusRight", i)}
                      disabled={form.syllabusRight.length <= 1}>✕</button>
                  </div>
                  <div className={styles.moduleFields}>
                    <div className={styles.fieldGroup} style={{ marginBottom: "0.8rem" }}>
                      <label className={styles.labelSm}>Title</label>
                      <div className={styles.inputWrap}>
                        <input type="text" className={styles.input}
                          placeholder="e.g. Practicum" value={m.title} maxLength={100}
                          onChange={e => updateSyl("syllabusRight", i, "title", e.target.value)} />
                      </div>
                    </div>
                    <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                      <label className={styles.labelSm}>Description</label>
                      <div className={styles.inputWrap}>
                        <textarea className={`${styles.input} ${styles.textarea}`} rows={3}
                          placeholder="Module description…" value={m.desc} maxLength={400}
                          onChange={e => updateSyl("syllabusRight", i, "desc", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addItemBtn}
              onClick={() => addSyl("syllabusRight")}>+ Add Right Module</button>
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* ══ DAILY SCHEDULE ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Daily Schedule</h3>
          </div>

          <ImgField label="Schedule Section Image (Left Side)"
            hint="Circular ornament image shown on the left side of the schedule"
            fkey="scheduleImage" fileRef={schedFile} inputRef={schedImgRef} />

          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✦</span>Schedule Items<span className={styles.required}>*</span>
            </label>
            {errors.scheduleItems && <p className={styles.errorMsg}>⚠ {errors.scheduleItems}</p>}
            <div className={styles.schedList}>
              {form.scheduleItems.map((item, i) => (
                <div key={i} className={styles.schedRow}>
                  <span className={styles.schedRowNum}>{i + 1}</span>
                  <div className={styles.schedRowFields}>
                    <div className={`${styles.inputWrap} ${styles.schedTimeInput}`}>
                      <input type="text" className={styles.input}
                        placeholder="e.g. 07:00 Am - 08:00 Am"
                        value={item.time} maxLength={40}
                        onChange={e => updateSched(i, "time", e.target.value)} />
                    </div>
                    <div className={`${styles.inputWrap} ${styles.schedLabelInput}`}>
                      <input type="text" className={styles.input}
                        placeholder="e.g. Pranayama and Meditation"
                        value={item.label} maxLength={100}
                        onChange={e => updateSched(i, "label", e.target.value)} />
                    </div>
                  </div>
                  <button type="button" className={styles.removeItemBtn}
                    onClick={() => removeSched(i)}
                    disabled={form.scheduleItems.length <= 1}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addItemBtn} onClick={addSched}>
              + Add Schedule Item
            </button>
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* ══ SOUL SHINE BANNER ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Let Your Soul Shine Banner</h3>
          </div>
          <TField label="Banner Text" hint="Text overlay shown on the banner image"
            fkey="soulShineText" placeholder="Let Your Soul Shine" max={100} />
          <ImgField label="Banner Image"
            hint="Full-width banner image (shown with text overlay)"
            fkey="soulShineImage" fileRef={soulFile} inputRef={soulImgRef} />
        </div>

        <div className={styles.formDivider} />

        {/* ══ WHY ENROL ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Why Enrol Section</h3>
          </div>
          <TField label="Section Title" fkey="enrollTitle" max={250} />
          <ParaBlock label="Intro Paragraphs" paraKey="enrollParagraphs" />
          <ListField label="Enrol Reasons (numbered list)" fkey="enrollItems"
            placeholder="e.g. We have a sattvic and spiritual atmosphere…" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ COMPREHENSIVE ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Comprehensive Section</h3>
          </div>
          <TField label="Section Title" fkey="comprehensiveTitle" max={200} />
          <ParaBlock label="Paragraphs" paraKey="comprehensiveParagraphs" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ CERTIFICATION ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Certification</h3>
          </div>
          <TField label="Section Title" fkey="certTitle" max={200} />
          <ParaBlock label="Paragraphs" paraKey="certParagraphs" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ REGISTRATION ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Registration Process</h3>
          </div>
          <TField label="Section Title" fkey="registrationTitle" max={200} />
          <ParaBlock label="Paragraphs" paraKey="registrationParagraphs" />
        </div>

        <div className={styles.formDivider} />

        {/* ══ FEE LISTS ══ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Fee — Included / Not Included</h3>
          </div>
          <div className={styles.twoColSection}>
            <ListField label="Included in Fee" fkey="includedItems"
              placeholder="e.g. 14 Days Accommodation and 3 Meals / Day" />
            <ListField label="Not Included in Fee" fkey="notIncludedItems"
              placeholder="e.g. Air Ticket and Airport Pickup" />
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* Actions */}
        <div className={styles.formActions}>
          <Link href="/admin/dashboard/100hr-content" className={styles.cancelBtn}>
            ← Cancel
          </Link>
          <button
            type="button"
            className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <><span className={styles.spinner} /> Saving…</>
              : <><span>✦</span> Save Content</>
            }
          </button>
        </div>

      </div>
    </div>
  );
}