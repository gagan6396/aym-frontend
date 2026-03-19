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

interface TrustItem { icon: string; label: string; }
interface FormValues {
  name: string; role: string; avatarSrc: string; rating: number; quote: string;
  superTitle: string; mainTitle: string; subtitle: string; trustItems: TrustItem[];
}

export default function AddTextReviewPage() {
  const router = useRouter();
  const [submitted,      setSubmitted]      = useState(false);
  const [avatarFile,     setAvatarFile]     = useState<File | null>(null);
  const [avatarPreview,  setAvatarPreview]  = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const editorRef     = useRef(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      name: "", role: "", avatarSrc: "", rating: 5, quote: "",
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

  const nameVal       = watch("name");
  const avatarSrc     = watch("avatarSrc");
  const avatarDisplay = avatarPreview || avatarSrc;

  const joditConfig = useMemo(() => ({
    readonly: false, placeholder: "e.g. This is truly the best yoga school for 200-hour Yoga Teacher Training…", height: 200,
    toolbarAdaptive: false,
    buttons: ["bold","italic","underline","strikethrough","|","font","fontsize","brush","|","paragraph","align","|","ul","ol","|","link","|","undo","redo","|","source"],
    colorPickerDefaultTab: "color", showCharsCounter: true, showWordsCounter: false, showXPathInStatusbar: false,
    style: { background: "transparent", color: "inherit" }, editorCssClass: styles.joditEditorBody ?? "",
  }), []);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    setValue("avatarSrc", "");
    if (avatarFileRef.current) avatarFileRef.current.value = "";
  };

  const handleAvatarUrl = () => {
    const url = avatarUrlInput.trim();
    if (!url) return;
    setAvatarFile(null);
    setAvatarPreview("");
    setValue("avatarSrc", url, { shouldValidate: true });
    setAvatarUrlInput("");
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const fd = new FormData();
      fd.append("name",   data.name);
      fd.append("role",   data.role);
      fd.append("quote",  data.quote);
      fd.append("rating", String(data.rating));
      fd.append("sectionMeta", JSON.stringify({
        superTitle: data.superTitle, mainTitle: data.mainTitle,
        subtitle: data.subtitle, trustItems: data.trustItems,
      }));
      if (avatarFile) {
        fd.append("avatar", avatarFile);
      } else if (data.avatarSrc) {
        fd.append("avatarSrc", data.avatarSrc);
      }

      await api.post("/testimonials/text/create-review", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/testimonialstext"), 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save");
    }
  };

  if (submitted) return (
    <div className={styles.successScreen}>
      <div className={styles.successCard}>
        <div className={styles.successOm}>ॐ</div><div className={styles.successCheck}>✓</div>
        <h2 className={styles.successTitle}>Text Review Saved!</h2>
        <p className={styles.successText}>Redirecting…</p>
      </div>
    </div>
  );

  return (
    <div className={styles.formPage}>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: "#1f2937", color: "#fff", borderRadius: "10px", padding: "12px 16px", fontSize: "14px" } }} />

      <div className={styles.breadcrumb}>
        <Link href="/admin/dashboard/testimonialstext" className={styles.breadcrumbLink}>Text Reviews</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Add Review</span>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Add Text Review</h1>
          <p className={styles.pageSubtitle}>Add a student text review with avatar and quote</p>
        </div>
      </div>

      <div className={styles.ornament}><span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span></div>

      <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* ── REVIEWER DETAILS ── */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Reviewer Details</h3></div>

          <div className={styles.twoCol}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Reviewer Name<span className={styles.required}>*</span></label>
              <div className={`${styles.inputWrap} ${errors.name ? styles.inputError : nameVal ? styles.inputSuccess : ""}`}>
                <input type="text" className={styles.input} placeholder="e.g. Vinita Rai" maxLength={80}
                  {...register("name", { required: "Name is required" })} />
                <span className={styles.charCount}>{nameVal?.length ?? 0}/80</span>
              </div>
              {errors.name && <p className={styles.errorMsg}>⚠ {errors.name.message}</p>}
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}><span className={styles.labelIcon}>✦</span>Role / Title<span className={styles.required}>*</span></label>
              <p className={styles.fieldHint}>e.g. Certified Yoga Teacher · Yoga Practitioner, Peru</p>
              <div className={`${styles.inputWrap} ${errors.role ? styles.inputError : watch("role") ? styles.inputSuccess : ""}`}>
                <input type="text" className={styles.input} placeholder="e.g. Certified Yoga Teacher" maxLength={100}
                  {...register("role", { required: "Role is required" })} />
              </div>
              {errors.role && <p className={styles.errorMsg}>⚠ {errors.role.message}</p>}
            </div>
          </div>

          {/* Avatar */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Avatar Photo</label>
            <p className={styles.fieldHint}>
              Upload a file (saved to <code>/uploads/</code> on server) or paste a URL. Blank = initials shown.
            </p>
            <div className={styles.avatarUploadRow}>
              <div className={styles.avatarPreviewCircle}>
                {avatarDisplay
                  ? <img src={avatarDisplay} alt={nameVal} className={styles.avatarPreviewImg}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <span>{nameVal?.charAt(0)?.toUpperCase() || "?"}</span>}
              </div>
              <div className={styles.avatarControls}>
                <div className={styles.uploadZoneSmall} onClick={() => avatarFileRef.current?.click()}>
                  <p className={styles.uploadText}>{avatarFile ? `✓ ${avatarFile.name}` : "📁 Click to upload photo"}</p>
                  <input ref={avatarFileRef} type="file" accept="image/*" className={styles.uploadInput} onChange={handleAvatarFile} />
                </div>
                <div className={styles.urlRowSmall}>
                  <div className={styles.inputWrap}>
                    <input type="text" className={styles.input} placeholder="Or paste avatar URL (https://…)"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAvatarUrl(); } }} />
                  </div>
                  <button type="button" className={styles.addUrlBtn} onClick={handleAvatarUrl}>Use URL</button>
                </div>
              </div>
            </div>
            <input type="hidden" {...register("avatarSrc")} />
          </div>

          {/* Star Rating */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Star Rating</label>
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

        <div className={styles.formDivider} />

        {/* ── REVIEW QUOTE ── */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}><span className={styles.sectionIcon}>✦</span><h3 className={styles.sectionTitle}>Review Quote</h3></div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Review Text<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Full review — supports bold, italic, colours &amp; more</p>
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
          <Link href="/admin/dashboard/testimonialstext" className={styles.cancelBtn}>← Cancel</Link>
          <button type="submit" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} disabled={isSubmitting}>
            {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Save Text Review</>}
          </button>
        </div>
      </form>
    </div>
  );
}