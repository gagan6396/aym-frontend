"use client";
// ══════════════════════════════════════════════════════════════════
//  ContentPart1_Edit.tsx  —  200hr Admin Edit Content Part 1
// ══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm, useFieldArray, Controller, type SubmitHandler } from "react-hook-form";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/content-part1/ContentPart1.module.css";
import api from "@/lib/api";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
interface ContentPart1Form {
  heroTitle: string;
  heroDesc: string;
  transformTitle: string;
  transformParas: { text: string }[];
  whatIsTitle: string;
  whatIsParas: { text: string }[];
  whyChooseTitle: string;
  whyChooseParas: { text: string }[];
  suitableTitle: string;
  suitableItems: { text: string }[];
  whyEnrolTitle: string;
  whyEnrolItems: { text: string }[];
}

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isRteEmpty(v: string): boolean {
  return !v || stripHtml(v) === "" || v === "<p><br></p>" || v === "<p></p>";
}

/* ══════════════════════════════════════════════════════
   JODIT CONFIG
══════════════════════════════════════════════════════ */
function useJoditConfig() {
  return useMemo(
    () => ({
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
        "paragraph", "align", "|",
        "ul", "ol", "|",
        "link", "|",
        "undo", "redo", "|",
        "source",
      ],
      height: 200,
      style: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1rem",
        color: "#3d1d00",
        background: "#fff",
      },
      placeholder: "Type and format your text here…",
    }),
    []
  );
}

/* ══════════════════════════════════════════════════════
   FIELD PRIMITIVES
══════════════════════════════════════════════════════ */
function TXT({
  label, hint, val, err, onCh, ph, max = 200, req = true,
}: {
  label: string; hint?: string; val: string; err?: string;
  onCh: (v: string) => void; ph: string; max?: number; req?: boolean;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>
        {label}
        {req && <span className={styles.required}>*</span>}
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.inputWrap} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        <input
          type="text"
          className={styles.input}
          placeholder={ph}
          value={val}
          maxLength={max}
          onChange={e => onCh(e.target.value)}
        />
        <span className={styles.charCount}>{val.length}/{max}</span>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

function RTE({
  label, hint, val, err, onCh, req = true,
}: {
  label: string; hint?: string; val: string; err?: string;
  onCh: (v: string) => void; req?: boolean;
}) {
  const config = useJoditConfig();
  const edRef  = useRef(null);
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>
        {label}
        {req && <span className={styles.required}>*</span>}
      </label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.joditWrap} ${err ? styles.joditError : ""} ${val && !isRteEmpty(val) && !err ? styles.joditSuccess : ""}`}>
        <JoditEditor ref={edRef} value={val} config={config} onBlur={v => onCh(v)} />
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SAVED CHIP
══════════════════════════════════════════════════════ */
function SavedChip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      padding: "0.55rem 1rem",
      background: "rgba(74,140,42,0.1)",
      border: "1px solid rgba(74,140,42,0.3)",
      borderRadius: 8,
      fontFamily: "'Cormorant Garamond', serif",
      fontSize: "0.88rem",
      color: "#2a5e1e",
      fontStyle: "italic",
    }}>
      ✓ Saved successfully
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   REUSABLE — RTE REPEATER SECTION
══════════════════════════════════════════════════════ */
interface RteSectionProps {
  icon: string;
  heading: string;
  titleKey: string;
  titlePh: string;
  paraKey: string;
  control: any;
  fields: any[];
  appendFn: () => void;
  removeFn: (i: number) => void;
  maxParas?: number;
}

function RteSection({
  icon, heading, titleKey, titlePh, paraKey,
  control, fields, appendFn, removeFn, maxParas = 6,
}: RteSectionProps) {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h3 className={styles.sectionTitle}>{heading}</h3>
      </div>

      <Controller
        control={control}
        name={titleKey as any}
        rules={{ required: "Required" }}
        render={({ field, fieldState }) => (
          <TXT
            label="Section Title"
            hint=""
            val={field.value}
            err={fieldState.error?.message}
            onCh={field.onChange}
            ph={titlePh}
            max={200}
          />
        )}
      />

      <div className={styles.repeaterBlock}>
        <p className={styles.repeaterLabel}>
          Paragraphs <span className={styles.badge}>{fields.length}/{maxParas}</span>
        </p>
        {fields.map((f, i) => (
          <div key={f.id} className={styles.repeaterRow}>
            <Controller
              control={control}
              name={`${paraKey}.${i}.text` as any}
              rules={{ validate: (v: string) => !isRteEmpty(v) || "Required" }}
              render={({ field: ff, fieldState: fs }) => (
                <RTE
                  label={`Paragraph ${i + 1}`}
                  hint=""
                  val={ff.value}
                  err={fs.error?.message}
                  onCh={ff.onChange}
                />
              )}
            />
            <button
              type="button"
              className={styles.removeBtnSm}
              onClick={() => removeFn(i)}
              disabled={fields.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
        {fields.length < maxParas && (
          <button type="button" className={styles.addBtnSm} onClick={appendFn}>
            + Add Paragraph
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   REUSABLE — LIST SECTION (plain text numbered items)
══════════════════════════════════════════════════════ */
interface ListSectionProps {
  icon: string;
  heading: string;
  titleKey: string;
  titlePh: string;
  itemKey: string;
  itemPh: string;
  control: any;
  fields: any[];
  appendFn: () => void;
  removeFn: (i: number) => void;
  maxItems?: number;
}

function ListSection({
  icon, heading, titleKey, titlePh, itemKey, itemPh,
  control, fields, appendFn, removeFn, maxItems = 12,
}: ListSectionProps) {
  return (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>{icon}</span>
        <h3 className={styles.sectionTitle}>{heading}</h3>
      </div>

      <Controller
        control={control}
        name={titleKey as any}
        rules={{ required: "Required" }}
        render={({ field, fieldState }) => (
          <TXT
            label="Section Title"
            hint=""
            val={field.value}
            err={fieldState.error?.message}
            onCh={field.onChange}
            ph={titlePh}
            max={200}
          />
        )}
      />

      <div className={styles.repeaterBlock}>
        <p className={styles.repeaterLabel}>
          List Items <span className={styles.badge}>{fields.length}/{maxItems}</span>
        </p>
        {fields.map((f, i) => (
          <div key={f.id} className={styles.listItemRow}>
            <span className={styles.listNum}>{i + 1}.</span>
            <Controller
              control={control}
              name={`${itemKey}.${i}.text` as any}
              rules={{ required: "Required" }}
              render={({ field: ff, fieldState: fs }) => (
                <div
                  className={`${styles.inputWrap} ${fs.error ? styles.inputError : ""} ${ff.value && !fs.error ? styles.inputSuccess : ""}`}
                  style={{ flex: 1 }}
                >
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={itemPh}
                    value={ff.value}
                    maxLength={300}
                    onChange={ff.onChange}
                  />
                </div>
              )}
            />
            <button
              type="button"
              className={styles.removeBtnSm}
              onClick={() => removeFn(i)}
              disabled={fields.length <= 1}
            >
              ✕
            </button>
          </div>
        ))}
        {fields.length < maxItems && (
          <button type="button" className={styles.addBtnSm} onClick={appendFn}>
            + Add Item
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
export default function ContentPart1Edit() {
  const router = useRouter();

  const [loading,    setLoading]    = useState(true);
  const [fetchErr,   setFetchErr]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved,      setSaved]      = useState(false);

  /* ── Form setup ── */
  const { control, handleSubmit, reset } = useForm<ContentPart1Form>({
    defaultValues: {
      heroTitle: "",
      heroDesc: "",
      transformTitle: "",
      transformParas: [{ text: "" }],
      whatIsTitle: "",
      whatIsParas: [{ text: "" }],
      whyChooseTitle: "",
      whyChooseParas: [{ text: "" }],
      suitableTitle: "",
      suitableItems: [{ text: "" }],
      whyEnrolTitle: "",
      whyEnrolItems: [{ text: "" }],
    },
  });

  const { fields: tpF, append: tpA, remove: tpR } = useFieldArray({ control, name: "transformParas" });
  const { fields: wiF, append: wiA, remove: wiR } = useFieldArray({ control, name: "whatIsParas" });
  const { fields: wcF, append: wcA, remove: wcR } = useFieldArray({ control, name: "whyChooseParas" });
  const { fields: suF, append: suA, remove: suR } = useFieldArray({ control, name: "suitableItems" });
  const { fields: weF, append: weA, remove: weR } = useFieldArray({ control, name: "whyEnrolItems" });

  /* ── Fetch existing data ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/two-hundred-hour/content-part1/get");
        const d   = res.data?.data;
        if (!d) return;

        reset({
          heroTitle:      d.heroTitle      || "",
          heroDesc:       d.heroDesc       || "",
          transformTitle: d.transformTitle || "",
          transformParas: (d.transformParas?.length ? d.transformParas : [""]).map((t: string) => ({ text: t })),
          whatIsTitle:    d.whatIsTitle    || "",
          whatIsParas:    (d.whatIsParas?.length    ? d.whatIsParas    : [""]).map((t: string) => ({ text: t })),
          whyChooseTitle: d.whyChooseTitle || "",
          whyChooseParas: (d.whyChooseParas?.length ? d.whyChooseParas : [""]).map((t: string) => ({ text: t })),
          suitableTitle:  d.suitableTitle  || "",
          suitableItems:  (d.suitableItems?.length  ? d.suitableItems  : [""]).map((t: string) => ({ text: t })),
          whyEnrolTitle:  d.whyEnrolTitle  || "",
          whyEnrolItems:  (d.whyEnrolItems?.length  ? d.whyEnrolItems  : [""]).map((t: string) => ({ text: t })),
        });
      } catch (err: any) {
        setFetchErr(err?.response?.data?.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Submit handler ── */
  const onSubmit: SubmitHandler<ContentPart1Form> = async (data) => {
    setSubmitting(true);
    try {
      await api.patch("/two-hundred-hour/content-part1/update", {
        heroTitle:      data.heroTitle,
        heroDesc:       data.heroDesc,
        transformTitle: stripHtml(data.transformTitle),
        transformParas: data.transformParas.map(p => p.text).filter(Boolean),
        whatIsTitle:    stripHtml(data.whatIsTitle),
        whatIsParas:    data.whatIsParas.map(p => p.text).filter(Boolean),
        whyChooseTitle: stripHtml(data.whyChooseTitle),
        whyChooseParas: data.whyChooseParas.map(p => p.text).filter(Boolean),
        suitableTitle:  stripHtml(data.suitableTitle),
        suitableItems:  data.suitableItems.map(p => stripHtml(p.text)).filter(Boolean),
        whyEnrolTitle:  stripHtml(data.whyEnrolTitle),
        whyEnrolItems:  data.whyEnrolItems.map(p => stripHtml(p.text)).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading screen ── */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.skeletonField} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error screen ── */
  if (fetchErr) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h3 className={styles.emptyTitle}>Failed to load</h3>
          <p className={styles.emptyText}>{fetchErr}</p>
          <button className={styles.retryBtn} onClick={() => window.location.reload()}>↺ Retry</button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════════ */
  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard/twohundredhourpage")}>200 Hour</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard/twohundredhourpage/content-part1")}>Content Part 1</button>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcCurrent}>Edit</span>
      </div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.editBadge}>✏️ Edit mode — pre-filled with live data</div>
        <h1 className={styles.pageTitle}>Edit Content Part 1</h1>
        <p className={styles.pageSubtitle}>Hero, Transform, WhatIs, WhyChoose, Suitable For, Why Enrol</p>
      </div>

      {/* Ornament */}
      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formCard}>

          {/* ── Hero ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🏔</span>
              <h3 className={styles.sectionTitle}>Hero Section</h3>
            </div>
            <Controller
              control={control} name="heroTitle" rules={{ required: "Required" }}
              render={({ field, fieldState }) => (
                <TXT
                  label="Hero Title (H1)"
                  hint="Main heading shown at the top of the page"
                  val={field.value}
                  err={fieldState.error?.message}
                  onCh={field.onChange}
                  ph="100 Hour Yoga Teacher Training Course in Rishikesh India"
                  max={200}
                />
              )}
            />
            <Controller
              control={control} name="heroDesc"
              rules={{ validate: (v) => !isRteEmpty(v) || "Required" }}
              render={({ field, fieldState }) => (
                <RTE
                  label="Hero Description"
                  hint="First paragraph shown below the hero image"
                  val={field.value}
                  err={fieldState.error?.message}
                  onCh={field.onChange}
                />
              )}
            />
          </div>

          <div className={styles.formDivider} />

          {/* ── Transform ── */}
          <RteSection
            icon="🌿"
            heading="Transform Your Practice"
            titleKey="transformTitle"
            titlePh="Transform Your Practice with a 100 Hour Yoga Course in Rishikesh"
            paraKey="transformParas"
            control={control}
            fields={tpF}
            appendFn={() => tpA({ text: "" })}
            removeFn={tpR}
          />

          <div className={styles.formDivider} />

          {/* ── What Is ── */}
          <RteSection
            icon="❓"
            heading="What is a 100 Hour YTT?"
            titleKey="whatIsTitle"
            titlePh="What is a 100 Hour Yoga Teacher Training?"
            paraKey="whatIsParas"
            control={control}
            fields={wiF}
            appendFn={() => wiA({ text: "" })}
            removeFn={wiR}
          />

          <div className={styles.formDivider} />

          {/* ── Why Choose ── */}
          <RteSection
            icon="🏫"
            heading="Why Choose AYM"
            titleKey="whyChooseTitle"
            titlePh="Why Choose AYM Yoga School for Your 100 Hour Yoga TTC"
            paraKey="whyChooseParas"
            control={control}
            fields={wcF}
            appendFn={() => wcA({ text: "" })}
            removeFn={wcR}
          />

          <div className={styles.formDivider} />

          {/* ── Suitable For ── */}
          <ListSection
            icon="👥"
            heading="Suitable For (Numbered List)"
            titleKey="suitableTitle"
            titlePh="100 Hours Yoga TTC is suitable for:"
            itemKey="suitableItems"
            itemPh="e.g. If you want to understand yoga holistically…"
            control={control}
            fields={suF}
            appendFn={() => suA({ text: "" })}
            removeFn={suR}
            maxItems={10}
          />

          <div className={styles.formDivider} />

          {/* ── Why Enrol ── */}
          <ListSection
            icon="✅"
            heading="Why Enrol in AYM (Numbered List)"
            titleKey="whyEnrolTitle"
            titlePh="Why Enrol in AYM for a 100 hour Yoga Teacher Training?"
            itemKey="whyEnrolItems"
            itemPh="e.g. We have a sattvic and spiritual atmosphere…"
            control={control}
            fields={weF}
            appendFn={() => weA({ text: "" })}
            removeFn={weR}
            maxItems={12}
          />

          <div className={styles.formDivider} />

          {/* ── Actions ── */}
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/twohundredhourpage/content-part1" className={styles.cancelBtn}>
              ← Back to List
            </Link>
            <div className={styles.actionsRight}>
              <SavedChip show={saved} />
              <button
                type="submit"
                className={`${styles.submitBtn} ${submitting ? styles.submitBtnLoading : ""}`}
                disabled={submitting}
              >
                {submitting
                  ? <><span className={styles.spinner} /> Saving…</>
                  : <><span>✦</span> Update Content Part 1</>
                }
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}