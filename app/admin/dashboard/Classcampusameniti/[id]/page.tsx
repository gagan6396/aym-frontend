"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "@/assets/style/Admin/dashboard/Classcampusameniti/Classcampusamenities.module.css";
// import api from "@/lib/api";

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface CampusImage {
  file: File | null;
  preview: string;       // blob URL (new) or existing URL from API
  existingUrl?: string;  // original URL from DB — send as-is if unchanged
}

interface FormData {
  classSizeSuperLabel: string;
  classSizeTitle: string;
  classSizeWelcomeText: string;
  classSizeHighlight: string;
  classSizePara: string;
  campusSuperLabel: string;
  campusTitle: string;
  campusHighlight: string;
  campusPara: string;
  amenitiesSuperLabel: string;
  amenitiesTitle: string;
  amenitiesMainPara: string;
  amenitiesSubLabel: string;
  amenities: string[];
  amenityMosaicTag: string;
}

interface FormErrors {
  classSizeSuperLabel?: string;
  classSizeTitle?: string;
  classSizeWelcomeText?: string;
  classSizeHighlight?: string;
  classSizePara?: string;
  campusSuperLabel?: string;
  campusTitle?: string;
  campusHighlight?: string;
  campusPara?: string;
  amenitiesSuperLabel?: string;
  amenitiesTitle?: string;
  amenitiesMainPara?: string;
  amenities?: string;
}

const EMPTY: FormData = {
  classSizeSuperLabel: "",
  classSizeTitle: "",
  classSizeWelcomeText: "",
  classSizeHighlight: "",
  classSizePara: "",
  campusSuperLabel: "",
  campusTitle: "",
  campusHighlight: "",
  campusPara: "",
  amenitiesSuperLabel: "",
  amenitiesTitle: "",
  amenitiesMainPara: "",
  amenitiesSubLabel: "",
  amenities: [""],
  amenityMosaicTag: "",
};

/* ─────────────────────────────────────────
   Reusable single-image uploader
───────────────────────────────────────── */
interface SingleImageProps {
  preview: string;
  badge?: string;
  hint: string;
  error?: string;
  onSelect: (file: File, preview: string) => void;
  onRemove: () => void;
}

function SingleImageUpload({ preview, badge, hint, error, onSelect, onRemove }: SingleImageProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSelect(file, URL.createObjectURL(file));
    e.target.value = "";
  };

  return (
    <div>
      <div className={`${styles.imageUploadZone} ${preview ? styles.hasImage : ""} ${error ? styles.inputError : ""}`}>
        {!preview ? (
          <>
            <input type="file" accept="image/*" onChange={handleChange} />
            <div className={styles.imageUploadPlaceholder}>
              <span className={styles.imageUploadIcon}>🖼️</span>
              <span className={styles.imageUploadText}>Click to Upload Image</span>
              <span className={styles.imageUploadSub}>{hint}</span>
            </div>
          </>
        ) : (
          <div className={styles.imagePreviewWrap}>
            {badge && <span className={styles.imageBadge}>{badge}</span>}
            <img src={preview} alt="preview" className={styles.imagePreview} />
            <div className={styles.imagePreviewOverlay}>
              <span className={styles.imagePreviewAction}>✎ Change</span>
              <input type="file" accept="image/*" className={styles.imagePreviewOverlayInput} onChange={handleChange} />
            </div>
            <button type="button" className={styles.removeImageBtn}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}>✕</button>
          </div>
        )}
      </div>
      {error && <p className={styles.errorMsg}>⚠ {error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function EditClassCampusAmenitiesPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Image states — preview holds either existing URL or new blob URL
  const [classSizeImageFile, setClassSizeImageFile] = useState<File | null>(null);
  const [classSizeImagePreview, setClassSizeImagePreview] = useState("");
  const [campusImages, setCampusImages] = useState<CampusImage[]>([]);
  const [amenityImageFile, setAmenityImageFile] = useState<File | null>(null);
  const [amenityImagePreview, setAmenityImagePreview] = useState("");

  /* ── Fetch existing data ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ── Uncomment and adapt when API is ready ──
        // const res = await api.get(`/class-campus-amenities/${id}`);
        // const d = res.data.data;
        // setForm({
        //   classSizeSuperLabel:  d.classSizeSuperLabel  || "",
        //   classSizeTitle:       d.classSizeTitle       || "",
        //   classSizeWelcomeText: d.classSizeWelcomeText || "",
        //   classSizeHighlight:   d.classSizeHighlight   || "",
        //   classSizePara:        d.classSizePara        || "",
        //   campusSuperLabel:     d.campusSuperLabel     || "",
        //   campusTitle:          d.campusTitle          || "",
        //   campusHighlight:      d.campusHighlight      || "",
        //   campusPara:           d.campusPara           || "",
        //   amenitiesSuperLabel:  d.amenitiesSuperLabel  || "",
        //   amenitiesTitle:       d.amenitiesTitle       || "",
        //   amenitiesMainPara:    d.amenitiesMainPara    || "",
        //   amenitiesSubLabel:    d.amenitiesSubLabel    || "",
        //   amenities:            d.amenities?.length ? d.amenities : [""],
        //   amenityMosaicTag:     d.amenityMosaicTag     || "",
        // });
        // if (d.classSizeImageUrl) setClassSizeImagePreview(d.classSizeImageUrl);
        // if (d.campusImageUrls?.length)
        //   setCampusImages(d.campusImageUrls.map((url: string) => ({ file: null, preview: url, existingUrl: url })));
        // if (d.amenityImageUrl) setAmenityImagePreview(d.amenityImageUrl);

        // ── MOCK DATA — remove after API connected ──
        setForm({
          classSizeSuperLabel:  "Small Batches · Personal Attention",
          classSizeTitle:       "AYM CLASS SIZE",
          classSizeWelcomeText: "Welcome to AYM Family",
          classSizeHighlight:   "25 students",
          classSizePara:        "At AYM, only 25 students are admitted in one batch. The class size is consciously kept low to focus individual attention and seamless interactions between the faculty and students.",
          campusSuperLabel:     "5000 sq.mts. · Rishikesh",
          campusTitle:          "AYM YOGA CAMPUS",
          campusHighlight:      "5000 sq.mts.",
          campusPara:           "Spread across an expansive 5000 sq.mts., the AYM campus is one of the lushest campuses in Rishikesh.",
          amenitiesSuperLabel:  "Comfort · Nature · Serenity",
          amenitiesTitle:       "AMENITIES",
          amenitiesMainPara:    "Students have fully furnished rooms amid lush gardens at this yoga teacher training school.",
          amenitiesSubLabel:    "Other amenities include:",
          amenities: [
            "Accommodation ( Private / Shared / Dormitory )",
            "Spacious yoga hall",
            "Free Wi-Fi",
            "Lush Garden area",
            "Hot / Cold water 24x7",
          ],
          amenityMosaicTag: "Furnished Rooms",
        });
        // Mock image previews (replace with real API URLs)
        setClassSizeImagePreview("/mock/aym-class-size.webp");
        setCampusImages([
          { file: null, preview: "/mock/aym-yoga-campus.webp", existingUrl: "/mock/aym-yoga-campus.webp" },
        ]);
        setAmenityImagePreview("/mock/shared-room.webp");
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const set = (key: keyof FormData, val: string) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const updateAmenity = (i: number, val: string) =>
    setForm((p) => { const a = [...p.amenities]; a[i] = val; return { ...p, amenities: a }; });
  const addAmenity = () => {
    if (form.amenities.length >= 10) return;
    setForm((p) => ({ ...p, amenities: [...p.amenities, ""] }));
  };
  const removeAmenity = (i: number) =>
    setForm((p) => ({ ...p, amenities: p.amenities.filter((_, idx) => idx !== i) }));

  const addCampusImage = (file: File, preview: string) => {
    if (campusImages.length >= 5) return;
    setCampusImages((p) => [...p, { file, preview }]);
  };
  const updateCampusImage = (i: number, file: File, preview: string) =>
    setCampusImages((p) => p.map((img, idx) => idx === i ? { file, preview } : img));
  const removeCampusImage = (i: number) =>
    setCampusImages((p) => p.filter((_, idx) => idx !== i));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.classSizeSuperLabel.trim())  e.classSizeSuperLabel  = "Super label is required";
    if (!form.classSizeTitle.trim())       e.classSizeTitle       = "Title is required";
    if (!form.classSizeWelcomeText.trim()) e.classSizeWelcomeText = "Overlay text is required";
    if (!form.classSizeHighlight.trim())   e.classSizeHighlight   = "Highlight text is required";
    if (!form.classSizePara.trim())        e.classSizePara        = "Paragraph is required";
    if (!form.campusSuperLabel.trim())     e.campusSuperLabel     = "Super label is required";
    if (!form.campusTitle.trim())          e.campusTitle          = "Title is required";
    if (!form.campusHighlight.trim())      e.campusHighlight      = "Highlight text is required";
    if (!form.campusPara.trim())           e.campusPara           = "Paragraph is required";
    if (!form.amenitiesSuperLabel.trim())  e.amenitiesSuperLabel  = "Super label is required";
    if (!form.amenitiesTitle.trim())       e.amenitiesTitle       = "Title is required";
    if (!form.amenitiesMainPara.trim())    e.amenitiesMainPara    = "Main paragraph is required";
    if (form.amenities.some((a) => !a.trim())) e.amenities = "All amenity fields must be filled";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((item) => fd.append(k, item));
        else fd.append(k, v as string);
      });
      // New files
      if (classSizeImageFile) fd.append("classSizeImage", classSizeImageFile);
      campusImages.forEach((img, i) => {
        if (img.file) fd.append(`campusImage_${i}`, img.file);
        else if (img.existingUrl) fd.append(`campusImageExisting_${i}`, img.existingUrl);
      });
      if (amenityImageFile) fd.append("amenityImage", amenityImageFile);
      // await api.put(`/class-campus-amenities/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      console.log("FormData ready:", [...fd.keys()]);
      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/yogateachertraning/classcampusamenities"), 1500);
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonField} />)}
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successOm}>ॐ</div>
          <div className={styles.successCheck}>✓</div>
          <h2 className={styles.successTitle}>Section Updated!</h2>
          <p className={styles.successText}>Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink}
          onClick={() => router.push("/admin/dashboard/yogateachertraning/classcampusamenities")}>
          Class, Campus & Amenities
        </button>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Edit Section</span>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderText}>
          <h1 className={styles.pageTitle}>Edit Class, Campus & Amenities</h1>
          <p className={styles.pageSubtitle}>Update the details of this section</p>
        </div>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} />
        <span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      <div className={styles.formCard}>

        {/* ══════════════════════════════════════
            BLOCK 1 — CLASS SIZE
        ══════════════════════════════════════ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>AYM Class Size Block</h3>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Super Label<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Small label above the title</p>
            <div className={`${styles.inputWrap} ${errors.classSizeSuperLabel ? styles.inputError : ""} ${form.classSizeSuperLabel && !errors.classSizeSuperLabel ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. Small Batches · Personal Attention"
                value={form.classSizeSuperLabel} maxLength={80}
                onChange={(e) => set("classSizeSuperLabel", e.target.value)} />
              <span className={styles.charCount}>{form.classSizeSuperLabel.length}/80</span>
            </div>
            {errors.classSizeSuperLabel && <p className={styles.errorMsg}>⚠ {errors.classSizeSuperLabel}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Block Title<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Main heading for this block</p>
            <div className={`${styles.inputWrap} ${errors.classSizeTitle ? styles.inputError : ""} ${form.classSizeTitle && !errors.classSizeTitle ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. AYM CLASS SIZE"
                value={form.classSizeTitle} maxLength={60}
                onChange={(e) => set("classSizeTitle", e.target.value)} />
              <span className={styles.charCount}>{form.classSizeTitle.length}/60</span>
            </div>
            {errors.classSizeTitle && <p className={styles.errorMsg}>⚠ {errors.classSizeTitle}</p>}
          </div>

          {/* ── Class Size Image ── */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Class Group Photo<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Main image in the class size block — click to replace existing image</p>
            <SingleImageUpload
              preview={classSizeImagePreview}
              badge="AYM Class Group Photo"
              hint="JPG / PNG / WebP · Recommended 800×600px"
              onSelect={(file, preview) => { setClassSizeImageFile(file); setClassSizeImagePreview(preview); }}
              onRemove={() => { setClassSizeImageFile(null); setClassSizeImagePreview(""); }}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Image Overlay Text<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Script text shown as overlay on the class image</p>
            <div className={`${styles.inputWrap} ${errors.classSizeWelcomeText ? styles.inputError : ""} ${form.classSizeWelcomeText && !errors.classSizeWelcomeText ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. Welcome to AYM Family"
                value={form.classSizeWelcomeText} maxLength={60}
                onChange={(e) => set("classSizeWelcomeText", e.target.value)} />
              <span className={styles.charCount}>{form.classSizeWelcomeText.length}/60</span>
            </div>
            {errors.classSizeWelcomeText && <p className={styles.errorMsg}>⚠ {errors.classSizeWelcomeText}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Highlight Text<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Bold highlighted word/phrase inside the paragraph</p>
            <div className={`${styles.inputWrap} ${errors.classSizeHighlight ? styles.inputError : ""} ${form.classSizeHighlight && !errors.classSizeHighlight ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. 25 students"
                value={form.classSizeHighlight} maxLength={40}
                onChange={(e) => set("classSizeHighlight", e.target.value)} />
              <span className={styles.charCount}>{form.classSizeHighlight.length}/40</span>
            </div>
            {errors.classSizeHighlight && <p className={styles.errorMsg}>⚠ {errors.classSizeHighlight}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Description Paragraph<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Full description about the class size policy</p>
            <div className={`${styles.inputWrap} ${errors.classSizePara ? styles.inputError : ""} ${form.classSizePara && !errors.classSizePara ? styles.inputSuccess : ""}`}>
              <textarea className={`${styles.input} ${styles.textarea}`}
                placeholder="e.g. At AYM, only 25 students are admitted in one batch…"
                value={form.classSizePara} maxLength={500} rows={4}
                onChange={(e) => set("classSizePara", e.target.value)} />
              <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form.classSizePara.length}/500</span>
            </div>
            {errors.classSizePara && <p className={styles.errorMsg}>⚠ {errors.classSizePara}</p>}
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* ══════════════════════════════════════
            BLOCK 2 — CAMPUS
        ══════════════════════════════════════ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>AYM Yoga Campus Block</h3>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Super Label<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Small label above the title</p>
            <div className={`${styles.inputWrap} ${errors.campusSuperLabel ? styles.inputError : ""} ${form.campusSuperLabel && !errors.campusSuperLabel ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. 5000 sq.mts. · Rishikesh"
                value={form.campusSuperLabel} maxLength={80}
                onChange={(e) => set("campusSuperLabel", e.target.value)} />
              <span className={styles.charCount}>{form.campusSuperLabel.length}/80</span>
            </div>
            {errors.campusSuperLabel && <p className={styles.errorMsg}>⚠ {errors.campusSuperLabel}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Block Title<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Main heading for the campus block</p>
            <div className={`${styles.inputWrap} ${errors.campusTitle ? styles.inputError : ""} ${form.campusTitle && !errors.campusTitle ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. AYM YOGA CAMPUS"
                value={form.campusTitle} maxLength={60}
                onChange={(e) => set("campusTitle", e.target.value)} />
              <span className={styles.charCount}>{form.campusTitle.length}/60</span>
            </div>
            {errors.campusTitle && <p className={styles.errorMsg}>⚠ {errors.campusTitle}</p>}
          </div>

          {/* ── Campus Images Grid ── */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Campus Photos<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Thumbnail gallery images in the campus block — add, replace, or remove (max 5)</p>

            <div className={styles.campusImagesGrid}>
              {campusImages.map((img, i) => (
                <div key={i} className={`${styles.campusImageSlot} ${styles.hasImg}`}>
                  <img src={img.preview} alt={`Campus ${i + 1}`} className={styles.campusSlotPreview} />
                  <button type="button" className={styles.campusSlotRemove} onClick={() => removeCampusImage(i)}>✕</button>
                  <input type="file" accept="image/*" style={{ zIndex: 3 }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      updateCampusImage(i, file, URL.createObjectURL(file));
                      e.target.value = "";
                    }} />
                </div>
              ))}
              {campusImages.length < 5 && (
                <label className={styles.addCampusImgBtn}>
                  <span>🖼️</span>
                  <span>Add Photo</span>
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      addCampusImage(file, URL.createObjectURL(file));
                      e.target.value = "";
                    }} />
                </label>
              )}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Highlight Text<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Bold text inside the paragraph</p>
            <div className={`${styles.inputWrap} ${errors.campusHighlight ? styles.inputError : ""} ${form.campusHighlight && !errors.campusHighlight ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. 5000 sq.mts."
                value={form.campusHighlight} maxLength={40}
                onChange={(e) => set("campusHighlight", e.target.value)} />
              <span className={styles.charCount}>{form.campusHighlight.length}/40</span>
            </div>
            {errors.campusHighlight && <p className={styles.errorMsg}>⚠ {errors.campusHighlight}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Description Paragraph<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Full description about the campus</p>
            <div className={`${styles.inputWrap} ${errors.campusPara ? styles.inputError : ""} ${form.campusPara && !errors.campusPara ? styles.inputSuccess : ""}`}>
              <textarea className={`${styles.input} ${styles.textarea}`}
                placeholder="e.g. Spread across an expansive 5000 sq.mts.…"
                value={form.campusPara} maxLength={500} rows={4}
                onChange={(e) => set("campusPara", e.target.value)} />
              <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form.campusPara.length}/500</span>
            </div>
            {errors.campusPara && <p className={styles.errorMsg}>⚠ {errors.campusPara}</p>}
          </div>
        </div>

        <div className={styles.formDivider} />

        {/* ══════════════════════════════════════
            BLOCK 3 — AMENITIES
        ══════════════════════════════════════ */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>✦</span>
            <h3 className={styles.sectionTitle}>Amenities Block</h3>
            <span className={styles.sectionBadge}>{form.amenities.length}/10</span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Super Label<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Small label above the title</p>
            <div className={`${styles.inputWrap} ${errors.amenitiesSuperLabel ? styles.inputError : ""} ${form.amenitiesSuperLabel && !errors.amenitiesSuperLabel ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. Comfort · Nature · Serenity"
                value={form.amenitiesSuperLabel} maxLength={80}
                onChange={(e) => set("amenitiesSuperLabel", e.target.value)} />
              <span className={styles.charCount}>{form.amenitiesSuperLabel.length}/80</span>
            </div>
            {errors.amenitiesSuperLabel && <p className={styles.errorMsg}>⚠ {errors.amenitiesSuperLabel}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Block Title<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Main heading for the amenities block</p>
            <div className={`${styles.inputWrap} ${errors.amenitiesTitle ? styles.inputError : ""} ${form.amenitiesTitle && !errors.amenitiesTitle ? styles.inputSuccess : ""}`}>
              <input type="text" className={styles.input} placeholder="e.g. AMENITIES"
                value={form.amenitiesTitle} maxLength={60}
                onChange={(e) => set("amenitiesTitle", e.target.value)} />
              <span className={styles.charCount}>{form.amenitiesTitle.length}/60</span>
            </div>
            {errors.amenitiesTitle && <p className={styles.errorMsg}>⚠ {errors.amenitiesTitle}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Main Paragraph<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>First paragraph about accommodation and rooms</p>
            <div className={`${styles.inputWrap} ${errors.amenitiesMainPara ? styles.inputError : ""} ${form.amenitiesMainPara && !errors.amenitiesMainPara ? styles.inputSuccess : ""}`}>
              <textarea className={`${styles.input} ${styles.textarea}`}
                placeholder="e.g. Students have fully furnished rooms amid lush gardens…"
                value={form.amenitiesMainPara} maxLength={500} rows={3}
                onChange={(e) => set("amenitiesMainPara", e.target.value)} />
              <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form.amenitiesMainPara.length}/500</span>
            </div>
            {errors.amenitiesMainPara && <p className={styles.errorMsg}>⚠ {errors.amenitiesMainPara}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>List Intro Label</label>
            <p className={styles.fieldHint}>Text shown before the amenity list</p>
            <div className={styles.inputWrap}>
              <input type="text" className={styles.input} placeholder="e.g. Other amenities include:"
                value={form.amenitiesSubLabel} maxLength={80}
                onChange={(e) => set("amenitiesSubLabel", e.target.value)} />
              <span className={styles.charCount}>{form.amenitiesSubLabel.length}/80</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Amenities List<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Each item appears with an ॐ bullet in the frontend (max 10)</p>
            {errors.amenities && <p className={styles.errorMsg} style={{ marginBottom: "0.8rem" }}>⚠ {errors.amenities}</p>}
            <div className={styles.amenityList}>
              {form.amenities.map((item, i) => (
                <div key={i} className={styles.amenityRow}>
                  <div className={styles.amenityIndex}>{i + 1}</div>
                  <div className={`${styles.inputWrap} ${styles.amenityInputWrap}`}>
                    <input type="text" className={styles.input}
                      placeholder="e.g. Spacious yoga hall"
                      value={item} maxLength={100}
                      onChange={(e) => updateAmenity(i, e.target.value)} />
                  </div>
                  <button type="button" className={styles.removeAmenityBtn}
                    onClick={() => removeAmenity(i)} disabled={form.amenities.length <= 1}>✕</button>
                </div>
              ))}
            </div>
            {form.amenities.length < 10 && (
              <button type="button" className={styles.addAmenityBtn} onClick={addAmenity}>+ Add Amenity</button>
            )}
            {form.amenities.some((a) => a.trim()) && (
              <div className={styles.amenityPreview}>
                {form.amenities.filter((a) => a.trim()).map((a, i) => (
                  <span key={i} className={styles.amenityChip}>
                    <span className={styles.amenityChipOm}>ॐ</span>{a}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Amenity Room Image ── */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Amenity Mosaic / Room Image<span className={styles.required}>*</span></label>
            <p className={styles.fieldHint}>Right-side image alongside the amenities list — click to replace existing image</p>
            <SingleImageUpload
              preview={amenityImagePreview}
              badge="Furnished Rooms"
              hint="JPG / PNG / WebP · Recommended 700×900px"
              onSelect={(file, preview) => { setAmenityImageFile(file); setAmenityImagePreview(preview); }}
              onRemove={() => { setAmenityImageFile(null); setAmenityImagePreview(""); }}
            />
          </div>

          {/* Mosaic Tag */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}><span className={styles.labelIcon}>✦</span>Image Tag Label</label>
            <p className={styles.fieldHint}>Text tag shown as overlay on the room image (e.g. Furnished Rooms)</p>
            <div className={styles.inputWrap}>
              <input type="text" className={styles.input} placeholder="e.g. Furnished Rooms"
                value={form.amenityMosaicTag} maxLength={40}
                onChange={(e) => set("amenityMosaicTag", e.target.value)} />
              <span className={styles.charCount}>{form.amenityMosaicTag.length}/40</span>
            </div>
          </div>
        </div>

        <div className={styles.formDivider} />

        <div className={styles.formActions}>
          <Link href="/admin/dashboard/yogateachertraning/classcampusamenities" className={styles.cancelBtn}>
            ← Cancel
          </Link>
          <button type="button"
            className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
            onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <><span className={styles.spinner} /> Updating…</> : <><span>✦</span> Update Section</>}
          </button>
        </div>

      </div>
    </div>
  );
}