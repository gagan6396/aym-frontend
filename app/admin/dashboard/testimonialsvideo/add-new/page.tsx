"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import dynamic from "next/dynamic";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/assets/style/Admin/dashboard/testimonialsvideo/Testimonials.module.css";
import api from "@/lib/api";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

function getYoutubeId(input: string): string {
  if (!input) return "";
  const s = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return s;
  const shorts = s.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts) return shorts[1];
  const w = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (w) return w[1];
  const short = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const embed = s.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  return s;
}

interface TrustItem { icon: string; label: string; }
interface FormValues {
  name: string; country: string; flag: string;
  youtubeUrl: string; course: string; rating: number; quote: string;
  superTitle: string; mainTitle: string; subtitle: string; trustItems: TrustItem[];
}

const COURSE_OPTIONS = ["200hr YTT","300hr YTT","500hr YTT","Online YTT","Yoga Retreat","Other"];
const FLAG_OPTIONS = [
  { flag: "🇺🇸", label: "United States" }, { flag: "🇬🇧", label: "United Kingdom" },
  { flag: "🇩🇪", label: "Germany" },       { flag: "🇫🇷", label: "France" },
  { flag: "🇳🇱", label: "Netherlands" },   { flag: "🇦🇺", label: "Australia" },
  { flag: "🇨🇦", label: "Canada" },        { flag: "🇮🇳", label: "India" },
  { flag: "🇧🇷", label: "Brazil" },        { flag: "🇲🇽", label: "Mexico" },
  { flag: "🇮🇹", label: "Italy" },         { flag: "🇪🇸", label: "Spain" },
  { flag: "🇯🇵", label: "Japan" },         { flag: "🇰🇷", label: "South Korea" },
  { flag: "🇸🇬", label: "Singapore" },     { flag: "🌍", label: "Other" },
];

export default function AddVideoTestimonialPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const editorRef = useRef(null);

  const { register, control, handleSubmit, watch, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      name: "", country: "", flag: "🇺🇸", youtubeUrl: "", course: "200hr YTT", rating: 5, quote: "",
      superTitle: "Voices from Our Global Sangha",
      mainTitle: "Success Stories of Our Students",
      subtitle: "Hear the inspiring journeys of our students from around the world.",
      trustItems: [
        { icon: "🌍", label: "Students from 50+ Countries" },
        { icon: "⭐", label: "4.9 / 5 Average Rating" },
        { icon: "🧘", label: "100,000+ Certified Teachers" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "trustItems" });

  const youtubeUrl = watch("youtubeUrl");
  const nameVal    = watch("name");
  const ytId       = getYoutubeId(youtubeUrl);
  const ytIdValid  = ytId.length === 11;

  const joditConfig = useMemo(() => ({
    readonly: false, placeholder: "e.g. Namaste, my name is Marit. I am from the Netherlands…", height: 200,
    toolbarAdaptive: false,
    buttons: ["bold","italic","underline","strikethrough","|","font","fontsize","brush","|","paragraph","align","|","ul","ol","|","link","|","undo","redo","|","source"],
    colorPickerDefaultTab: "color", showCharsCounter: true, showWordsCounter: false, showXPathInStatusbar: false,
    style: { background: "transparent", color: "inherit" }, editorCssClass: styles.joditEditorBody ?? "",
  }), []);

  const onSubmit = async (data: FormValues) => {
    if (!ytIdValid) {
      setError("youtubeUrl", { message: "Could not extract a valid YouTube video ID" });
      return;
    }
    try {
      await api.post("/testimonials/videos/create-video", {
        name:       data.name,
        country:    data.country,
        flag:       data.flag,
        youtubeUrl: data.youtubeUrl,
        youtubeId:  ytId,
        course:     data.course,
        quote:      data.quote,
        rating:     data.rating,
        sectionMeta: {
          superTitle: data.superTitle,
          mainTitle:  data.mainTitle,
          subtitle:   data.subtitle,
          trustItems: data.trustItems,
        },
      });
      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/testimonialsvideo"), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to save";
      if (msg.toLowerCase().includes("only 3")) {
        toast.error("⚠️ Video limit reached! Only 3 video testimonials allowed. Delete one first.", { duration: 5000 });
      } else {
        toast.error(msg);
      }
    }
  };

  if (submitted) return (
    <div className={styles.successScreen}>
      <div className={styles.successCard}>
        <div className={styles.successOm}>ॐ</div><div className={styles.successCheck}>✓</div>
        <h2 className={styles.successTitle}>Video Testimonial Saved!</h2>
        <p className={styles.successText}>Redirecting…</p>
      </div>
    </div>
  );

  return (
    <div className={styles.formPage}>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: "#1f2937", color: "#fff", borderRadius: "10px", padding: "12px 16px", fontSize: "14px" } }} />

      <div className={styles.breadcrumb}>
        <Link href="/admin/dashboard/testimonialsvideo" className={styles.breadcrumbLink}>Video Testimonials</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Add Video</span>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Add Video Testimonial</h1>
          <p className={styles.pageSubtitle}>Add a YouTube video testimonial (max 3 total)</p>
        </div>
      </div>

      <div className={styles.ornament}><span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span></div>

      <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── STUDENT DETAILS ── */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Student Details</h3></div>

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Student Name<span className={styles.required}>*</span></label>
              <div className={`${styles.inputWrap} ${errors.name ? styles.inputError : nameVal ? styles.inputSuccess : ""}`}>
                <input type="text" className={styles.input} placeholder="e.g. Marit" maxLength={80}
                  {...register("name", { required: "Name is required" })} />
                <span className={styles.charCount}>{nameVal?.length ?? 0}/80</span>
              </div>
              {errors.name && <p className={styles.errorMsg}>⚠ {errors.name.message}</p>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Country<span className={styles.required}>*</span></label>
              <div className={`${styles.inputWrap} ${errors.country ? styles.inputError : watch("country") ? styles.inputSuccess : ""}`}>
                <input type="text" className={styles.input} placeholder="e.g. Netherlands" maxLength={60}
                  {...register("country", { required: "Country is required" })} />
              </div>
              {errors.country && <p className={styles.errorMsg}>⚠ {errors.country.message}</p>}
            </div>
          </div>

          <div className={styles.threeCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Flag</label>
              <div className={styles.inputWrap} style={{ position: "relative" }}>
                <select className={styles.select} {...register("flag")}>
                  {FLAG_OPTIONS.map((f) => <option key={f.flag} value={f.flag}>{f.flag} {f.label}</option>)}
                </select>
                <span className={styles.selectArrow}>▾</span>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Course<span className={styles.required}>*</span></label>
              <div className={`${styles.inputWrap} ${errors.course ? styles.inputError : ""}`} style={{ position: "relative" }}>
                <select className={styles.select} {...register("course", { required: "Course is required" })}>
                  {COURSE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className={styles.selectArrow}>▾</span>
              </div>
              {errors.course && <p className={styles.errorMsg}>⚠ {errors.course.message}</p>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Rating</label>
              <div className={styles.inputWrap} style={{ padding: "0 0.5rem" }}>
                <Controller name="rating" control={control} render={({ field }) => (
                  <div className={styles.starRatingInput}>
                    {[1,2,3,4,5].map((s) => (
                      <button key={s} type="button" className={`${styles.starBtn} ${s <= field.value ? styles.starBtnActive : ""}`} onClick={() => field.onChange(s)}>★</button>
                    ))}
                  </div>
                )} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* ── VIDEO ── */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Video Details</h3></div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>YouTube URL or Video ID<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Paste full YouTube URL, Shorts link, or just the 11-character video ID</p>
            <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${errors.youtubeUrl ? styles.inputError : ytIdValid ? styles.inputSuccess : ""}`}>
              <span className={styles.inputPrefix}>▶</span>
              <input type="text" className={`${styles.input} ${styles.inputPrefixed}`}
                placeholder="e.g. https://youtube.com/shorts/l12jCvLqUQg"
                {...register("youtubeUrl", { required: "YouTube URL/ID is required" })} />
            </div>
            {errors.youtubeUrl && <p className={styles.errorMsg}>⚠ {errors.youtubeUrl.message}</p>}
            {ytId && (
              <div className={styles.ytIdPreview}>
                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="Thumbnail" className={styles.ytIdPreviewImg}
                  onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
                <span className={styles.ytIdPreviewText}>{ytIdValid ? `✓ Video ID: ${ytId}` : "⚠ Could not extract ID"}</span>
              </div>
            )}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Quote / Testimonial Text<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Full testimonial quote — supports bold, italic, colours &amp; more</p>
            <div className={errors.quote ? styles.joditWrapError : styles.joditWrap}>
              <Controller name="quote" control={control}
                rules={{ required: "Quote is required", validate: (v) => v.replace(/<[^>]*>/g, "").trim().length > 0 || "Quote is required" }}
                render={({ field }) => (
                  <JoditEditor ref={editorRef} value={field.value} config={joditConfig as any}
                    onBlur={(c) => field.onChange(c)} onChange={(c) => field.onChange(c)} />
                )} />
            </div>
            {errors.quote && <p className={styles.errorMsg}>⚠ {errors.quote.message}</p>}
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* ── SECTION META ── */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Section Header &amp; Trust Strip</h3><span className={styles.sectionBadge}>global</span></div>

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Super Title</label>
              <div className={`${styles.inputWrap} ${watch("superTitle") ? styles.inputSuccess : ""}`}>
                <input type="text" className={styles.input} maxLength={100} {...register("superTitle")} />
                <span className={styles.charCount}>{watch("superTitle")?.length ?? 0}/100</span>
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Main Title</label>
              <div className={`${styles.inputWrap} ${watch("mainTitle") ? styles.inputSuccess : ""}`}>
                <input type="text" className={styles.input} maxLength={150} {...register("mainTitle")} />
                <span className={styles.charCount}>{watch("mainTitle")?.length ?? 0}/150</span>
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Subtitle</label>
            <div className={`${styles.inputWrap} ${watch("subtitle") ? styles.inputSuccess : ""}`}>
              <textarea className={`${styles.input} ${styles.textarea}`} maxLength={300} rows={2} {...register("subtitle")} />
              <span className={styles.charCount}>{watch("subtitle")?.length ?? 0}/300</span>
            </div>
          </div>

          <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Trust Strip Items</label>
            <p className={styles.fieldHint}>Icon + label pairs shown at the bottom of the section</p>
            {fields.map((field, i) => (
              <div key={field.id} className={styles.trustItemCard}>
                <div className={styles.trustItemHeader}>
                  <span className={styles.trustItemNum}>{i + 1}</span>
                  <span className={styles.trustItemLabel}>Item #{i + 1}</span>
                  <button type="button" className={styles.trustRemoveBtn} onClick={() => remove(i)} disabled={fields.length <= 1}>✕</button>
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label} style={{ fontSize: "0.65rem" }}>Icon</label>
                    <div className={styles.inputWrap}>
                      <input type="text" className={styles.input} placeholder="🌍" maxLength={8} {...register(`trustItems.${i}.icon`)} />
                    </div>
                  </div>
                  <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
                    <label className={styles.label} style={{ fontSize: "0.65rem" }}>Label</label>
                    <div className={styles.inputWrap}>
                      <input type="text" className={styles.input} placeholder="Students from 50+ Countries" maxLength={60} {...register(`trustItems.${i}.label`)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {fields.length < 5 && (
              <button type="button" className={styles.addTrustBtn} onClick={() => append({ icon: "✦", label: "" })}>+ Add Item</button>
            )}
          </div>
        </div>

        <div className={styles.formDivider} />
        <div className={styles.formActions}>
          <Link href="/admin/dashboard/testimonialsvideo" className={styles.cancelBtn}>← Cancel</Link>
          <button type="submit" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} disabled={isSubmitting}>
            {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Save Video Testimonial</>}
          </button>
        </div>
      </form>
    </div>
  );
}