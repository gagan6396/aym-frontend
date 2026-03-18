"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import styles from "@/assets/style/Admin/dashboard/whyaymschool/Whyaym.module.css";

/* ── Dynamically import JoditEditor (SSR disabled) ── */
const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface Feature {
  title: string;
  desc: string;
}

interface FormData {
  superTitle: string;
  mainTitle: string;
  introPara: string;
  imageSrc: string; /* existing image path from DB — sirf reference ke liye */
  imageAlt: string;
  imgBadgeYear: string;
  imgQuote: string;
  sideFeatures: Feature[];
  bottomFeatures: Feature[];
}

/* ══════════════════════════════════════════════
   JODIT CONFIG FACTORY
══════════════════════════════════════════════ */
const makeJoditConfig = (placeholder: string, height = 220) => ({
  readonly: false,
  placeholder,
  toolbarAdaptive: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  buttons: [
    "bold", "italic", "underline", "strikethrough", "|",
    "fontsize", "font", "brush", "paragraph", "|",
    "align", "ul", "ol", "|",
    "link", "hr", "|",
    "undo", "redo", "eraser",
  ],
  height,
  style: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "15px",
    color: "#3d1d00",
  },
});

/* ── Jodit error border ── */
const joditErrorStyle: React.CSSProperties = {
  border: "1.5px solid #c44a00",
  borderRadius: "8px",
  boxShadow: "0 0 0 3px rgba(196,74,0,0.10)",
};

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */
export default function EditWhyAYMPage() {
  const router = useRouter();
  const params = useParams();
  const sectionId = params?.id as string;

  /* ── Image state ──
     imageFile    → naya File select kiya (null = nahi kiya)
     imagePreview → jo dikhao: naya blob URL / old DB path / empty
  ── */
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /* ── Jodit configs (memoized) ── */
  const mainTitleConfig = useMemo(
    () =>
      makeJoditConfig(
        "e.g. What Makes AYM Yoga School Different from Other Yoga Schools in Rishikesh, India?",
        220
      ),
    []
  );
  const introParaConfig = useMemo(
    () =>
      makeJoditConfig(
        "e.g. Namaste, yoga lovers! AYM Yoga School stands out among Rishikesh's yoga schools…",
        200
      ),
    []
  );
  const featureDescConfig = useMemo(
    () =>
      makeJoditConfig(
        "e.g. The main foundation of yoga teachers' training is laid by the wisdom imparted by the teachers…",
        180
      ),
    []
  );

  /* ── React Hook Form ── */
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      superTitle: "",
      mainTitle: "",
      introPara: "",
      imageSrc: "",
      imageAlt: "",
      imgBadgeYear: "",
      imgQuote: "",
      sideFeatures: [{ title: "", desc: "" }],
      bottomFeatures: [{ title: "", desc: "" }],
    },
  });

  /* ── Field Arrays ── */
  const {
    fields: sideFields,
    append: appendSide,
    remove: removeSide,
    move: moveSide,
  } = useFieldArray({ control, name: "sideFeatures" });

  const {
    fields: bottomFields,
    append: appendBottom,
    remove: removeBottom,
    move: moveBottom,
  } = useFieldArray({ control, name: "bottomFeatures" });

  /* ── Watched values ── */
  const watchedImgQuote = watch("imgQuote");

  /* ══════════════════════════════════════════════
     FETCH EXISTING DATA  →  GET /why-aym/get-why-aym/:id
  ══════════════════════════════════════════════ */
  useEffect(() => {
    if (!sectionId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);

        const res = await api.get(`/why-aym/get-why-aym/${sectionId}`);
        const data = res.data.data;

        /* RHF reset se saare fields ek saath populate karo */
        reset({
          superTitle: data.superTitle || "",
          mainTitle: data.mainTitle || "",
          introPara: data.introPara || "",
          imageSrc: data.imageSrc || "",
          imageAlt: data.imageAlt || "",
          imgBadgeYear: data.imgBadgeYear || "",
          imgQuote: data.imgQuote || "",
          sideFeatures:
            data.sideFeatures?.length > 0
              ? data.sideFeatures
              : [{ title: "", desc: "" }],
          bottomFeatures:
            data.bottomFeatures?.length > 0
              ? data.bottomFeatures
              : [{ title: "", desc: "" }],
        });

        /* Existing image preview set karo */
        if (data.imageSrc) {
          /* Agar relative path hai (/uploads/...) toh base URL lagao */
          const fullUrl = data.imageSrc.startsWith("http")
            ? data.imageSrc
            : `${process.env.NEXT_PUBLIC_API_URL}${data.imageSrc}`;
          setImagePreview(fullUrl);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load section data.";
        setApiError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sectionId, reset]);

  /* ══════════════════════════════════════════════
     IMAGE HANDLERS
  ══════════════════════════════════════════════ */
  const applyFile = (f: File) => {
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    applyFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    applyFile(f);
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    setImageFile(null);
    setImagePreview(url);
    setUrlInput("");
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  /* ══════════════════════════════════════════════
     DRAG-REORDER FEATURES
  ══════════════════════════════════════════════ */
  const featureDragIdx = useRef<{
    group: "sideFeatures" | "bottomFeatures";
    idx: number;
  } | null>(null);

  const handleFeatureDragStart = (
    group: "sideFeatures" | "bottomFeatures",
    i: number
  ) => {
    featureDragIdx.current = { group, idx: i };
  };

  const handleFeatureDragEnter = (
    group: "sideFeatures" | "bottomFeatures",
    i: number
  ) => {
    if (
      !featureDragIdx.current ||
      featureDragIdx.current.group !== group ||
      featureDragIdx.current.idx === i
    )
      return;
    const from = featureDragIdx.current.idx;
    featureDragIdx.current = { group, idx: i };
    if (group === "sideFeatures") moveSide(from, i);
    else moveBottom(from, i);
  };

  /* ══════════════════════════════════════════════
     SUBMIT  →  PUT /why-aym/update-why-aym/:id
     
     multer expect karta hai multipart/form-data:
       - req.file              → field "image" (optional — sirf naya upload kiya toh)
       - req.body.sideFeatures → JSON string
       - req.body.imageSrc     → URL case ya existing path
  ══════════════════════════════════════════════ */
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (!imagePreview) {
      setApiError("Hero image is required. Please upload an image or paste a URL.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError(null);

      const formData = new FormData();

      /* Text fields */
      formData.append("superTitle", data.superTitle);
      formData.append("mainTitle", data.mainTitle);
      formData.append("introPara", data.introPara);
      formData.append("imageAlt", data.imageAlt || "");
      formData.append("imgBadgeYear", data.imgBadgeYear || "");
      formData.append("imgQuote", data.imgQuote || "");

      /* Array fields → JSON string */
      formData.append("sideFeatures", JSON.stringify(data.sideFeatures));
      formData.append("bottomFeatures", JSON.stringify(data.bottomFeatures));

      /* Image:
         - Naya file select kiya  → File object append karo
         - URL paste kiya         → imageSrc as text
         - Kuch nahi kiya (existing) → imageSrc se DB path bhejo */
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        /* Existing DB path ya pasted URL — controller mein req.body.imageSrc handle hoga */
        formData.append("imageSrc", imagePreview);
      }

      await api.put(`/why-aym/update-why-aym/${sectionId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/whyaymschool"), 1500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setApiError(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ══════════════════════════════════════════════
     LOADING SCREEN
  ══════════════════════════════════════════════ */
  if (isLoading) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successOm}>ॐ</div>
          <p className={styles.successText}>Loading section…</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════
     SUCCESS SCREEN
  ══════════════════════════════════════════════ */
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

  /* ══════════════════════════════════════════════
     FEATURE BUILDER
  ══════════════════════════════════════════════ */
  const FeatureBuilder = ({
    group,
    label,
    symbol,
    fields,
    onAppend,
    onRemove,
  }: {
    group: "sideFeatures" | "bottomFeatures";
    label: string;
    symbol: string;
    fields: { id: string }[];
    onAppend: () => void;
    onRemove: (i: number) => void;
  }) => (
    <div className={styles.sectionBlock}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionIcon}>✦</span>
        <h3 className={styles.sectionTitle}>{label}</h3>
        <span className={styles.sectionBadge}>
          {fields.length} / 8 · drag to reorder
        </span>
      </div>

      {fields.map((field, i) => (
        <div
          key={field.id}
          className={styles.featureItemCard}
          draggable
          onDragStart={() => handleFeatureDragStart(group, i)}
          onDragEnter={() => handleFeatureDragEnter(group, i)}
          onDragEnd={() => {
            featureDragIdx.current = null;
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className={styles.featureItemHeader}>
            <span className={styles.featureDragHandle}>⠿</span>
            <span className={styles.featureItemNumber}>
              {symbol}
              {i + 1}
            </span>
            <span className={styles.featureItemType}>
              {label} #{i + 1}
            </span>
            <button
              type="button"
              className={styles.featureRemoveBtn}
              onClick={() => onRemove(i)}
              disabled={fields.length <= 1}
            >
              ✕
            </button>
          </div>

          {/* Feature Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✦</span>
              Feature Title<span className={styles.required}>*</span>
            </label>
            <p className={styles.fieldHint}>
              Bold heading shown before the description
            </p>
            <div
              className={`${styles.inputWrap} ${
                errors[group]?.[i]?.title ? styles.inputError : ""
              }`}
            >
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. The most experienced yoga teachers:"
                maxLength={120}
                {...register(`${group}.${i}.title` as const, {
                  required: "Feature title is required",
                })}
              />
            </div>
            {errors[group]?.[i]?.title && (
              <p className={styles.errorMsg}>
                ⚠ {errors[group]?.[i]?.title?.message}
              </p>
            )}
          </div>

          {/* Feature Description — JoditEditor */}
          <div className={styles.fieldGroup} style={{ marginBottom: 0 }}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✦</span>
              Feature Description<span className={styles.required}>*</span>
            </label>
            <p className={styles.fieldHint}>
              Body text — bold, color, italic sab toolbar se kar sakte ho
            </p>
            <Controller
              control={control}
              name={`${group}.${i}.desc` as const}
              rules={{
                required: "Feature description is required",
                validate: (v) =>
                  v.replace(/<[^>]*>/g, "").trim().length > 0 ||
                  "Description cannot be empty",
              }}
              render={({ field }) => (
                <div style={errors[group]?.[i]?.desc ? joditErrorStyle : {}}>
                  <JoditEditor
                    value={field.value}
                    config={featureDescConfig}
                    onBlur={(newContent) => field.onChange(newContent)}
                  />
                </div>
              )}
            />
            {errors[group]?.[i]?.desc && (
              <p className={styles.errorMsg} style={{ marginTop: "0.4rem" }}>
                ⚠ {errors[group]?.[i]?.desc?.message}
              </p>
            )}
          </div>
        </div>
      ))}

      {fields.length < 8 && (
        <button
          type="button"
          className={styles.addFeatureBtn}
          onClick={onAppend}
        >
          + Add {label.replace(" Features", "")} Feature
        </button>
      )}
    </div>
  );

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className={styles.formPage}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link
          href="/admin/dashboard/whyaymschool"
          className={styles.breadcrumbLink}
        >
          Why AYM
        </Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Edit Section</span>
      </div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Edit Why AYM Section</h1>
          <p className={styles.pageSubtitle}>
            Update header, hero image, side features & bottom features
          </p>
        </div>
      </div>

      {/* Ornament */}
      <div className={styles.ornament}>
        <span>❧</span>
        <div className={styles.ornamentLine} />
        <span>ॐ</span>
        <div className={styles.ornamentLine} />
        <span>❧</span>
      </div>

      {/* ── API Error Banner ── */}
      {apiError && (
        <div
          style={{
            background: "rgba(196,74,0,0.08)",
            border: "1.5px solid #c44a00",
            borderRadius: "10px",
            padding: "0.85rem 1.2rem",
            marginBottom: "1.2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>⚠</span>
          <p
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.95rem",
              color: "#c44a00",
              fontStyle: "italic",
            }}
          >
            {apiError}
          </p>
          <button
            type="button"
            onClick={() => setApiError(null)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              color: "#c44a00",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "0",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ══ FORM ══ */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.formCard}>

          {/* ════════════════════════════════
              1. SECTION HEADER
          ════════════════════════════════ */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Section Header</h3>
            </div>

            {/* Super Title */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>✦</span>
                Super Title<span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Small label shown above the main heading
              </p>
              <div
                className={`${styles.inputWrap} ${
                  errors.superTitle ? styles.inputError : ""
                }`}
              >
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Yoga Teacher Training in Rishikesh"
                  maxLength={120}
                  {...register("superTitle", {
                    required: "Super title is required",
                  })}
                />
              </div>
              {errors.superTitle && (
                <p className={styles.errorMsg}>
                  ⚠ {errors.superTitle.message}
                </p>
              )}
            </div>

            {/* Main Title — JoditEditor */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>✦</span>
                Main Title (H2)<span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Primary heading — bold, color, italic sab toolbar se kar sakte
                ho
              </p>
              <Controller
                control={control}
                name="mainTitle"
                rules={{
                  required: "Main title is required",
                  validate: (v) =>
                    v.replace(/<[^>]*>/g, "").trim().length > 0 ||
                    "Main title cannot be empty",
                }}
                render={({ field }) => (
                  <div style={errors.mainTitle ? joditErrorStyle : {}}>
                    <JoditEditor
                      value={field.value}
                      config={mainTitleConfig}
                      onBlur={(newContent) => field.onChange(newContent)}
                    />
                  </div>
                )}
              />
              {errors.mainTitle && (
                <p className={styles.errorMsg} style={{ marginTop: "0.4rem" }}>
                  ⚠ {errors.mainTitle.message}
                </p>
              )}
            </div>

            {/* Intro Paragraph — JoditEditor */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>✦</span>
                Intro Paragraph<span className={styles.required}>*</span>
              </label>
              <p className={styles.fieldHint}>
                Short intro text shown below the divider
              </p>
              <Controller
                control={control}
                name="introPara"
                rules={{
                  required: "Intro paragraph is required",
                  validate: (v) =>
                    v.replace(/<[^>]*>/g, "").trim().length > 0 ||
                    "Intro paragraph cannot be empty",
                }}
                render={({ field }) => (
                  <div style={errors.introPara ? joditErrorStyle : {}}>
                    <JoditEditor
                      value={field.value}
                      config={introParaConfig}
                      onBlur={(newContent) => field.onChange(newContent)}
                    />
                  </div>
                )}
              />
              {errors.introPara && (
                <p className={styles.errorMsg} style={{ marginTop: "0.4rem" }}>
                  ⚠ {errors.introPara.message}
                </p>
              )}
            </div>
          </div>

          <div className={styles.formDivider} />

          {/* ════════════════════════════════
              2. HERO IMAGE
          ════════════════════════════════ */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Hero Image</h3>
            </div>

            <div className={styles.imageUploadArea}>
              {/* Preview */}
              <div className={styles.imagePreviewBox}>
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Hero preview"
                      className={styles.imagePreviewImg}
                    />
                    <div className={styles.imagePreviewOverlay}>
                      <button
                        type="button"
                        className={styles.removeImgBtn}
                        onClick={handleRemoveImage}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.imagePreviewEmpty}>
                    <span className={styles.imagePreviewEmptyIcon}>🖼</span>
                    No image selected
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className={styles.imageUploadControls}>
                {/* Dropzone */}
                <div
                  className={`${styles.uploadZone} ${
                    isDragOver ? styles.uploadZoneDragOver : ""
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                >
                  <span className={styles.uploadIcon}>📁</span>
                  <p className={styles.uploadText}>
                    Click or drag to replace image
                  </p>
                  <p className={styles.uploadSubText}>JPG · PNG · WEBP</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className={styles.uploadInput}
                    onChange={handleFileChange}
                  />
                </div>

                {/* URL Row */}
                <div className={styles.urlRow}>
                  <div className={styles.inputWrap}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="Or paste image URL…"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.addUrlBtn}
                    onClick={handleAddUrl}
                  >
                    Use URL
                  </button>
                </div>

                {/* New file indicator */}
                {imageFile && (
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.82rem",
                      color: "#4a8c2a",
                      fontStyle: "italic",
                      margin: "0.2rem 0 0",
                    }}
                  >
                    ✓ New file: {imageFile.name}
                  </p>
                )}

                {/* Meta Fields */}
                <div className={styles.imageMetaFields}>
                  {/* Alt Text */}
                  <div
                    className={styles.fieldGroup}
                    style={{ marginBottom: "0.8rem" }}
                  >
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>✦</span>
                      Image Alt Text
                    </label>
                    <p className={styles.fieldHint}>
                      Accessibility description
                    </p>
                    <div className={styles.inputWrap}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. AYM Yoga School certified student"
                        maxLength={150}
                        {...register("imageAlt")}
                      />
                    </div>
                  </div>

                  {/* Badge Year */}
                  <div
                    className={styles.fieldGroup}
                    style={{ marginBottom: "0.8rem" }}
                  >
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>✦</span>
                      Badge Year
                    </label>
                    <p className={styles.fieldHint}>
                      Small badge overlaid on the image (e.g. Est. 2005)
                    </p>
                    <div className={styles.inputWrap}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Est. 2005"
                        maxLength={20}
                        {...register("imgBadgeYear")}
                      />
                    </div>
                  </div>

                  {/* Image Quote */}
                  <div
                    className={styles.fieldGroup}
                    style={{ marginBottom: 0 }}
                  >
                    <label className={styles.label}>
                      <span className={styles.labelIcon}>✦</span>
                      Image Blockquote
                    </label>
                    <p className={styles.fieldHint}>
                      Short quote below image
                    </p>
                    <div className={styles.inputWrap}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Where Ancient Yoga Lives & Transforms Lives"
                        maxLength={100}
                        {...register("imgQuote")}
                      />
                    </div>
                    {watchedImgQuote && (
                      <div className={styles.quotePreview}>
                        &ldquo;{watchedImgQuote}&rdquo;
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formDivider} />

          {/* ════════════════════════════════
              3. SIDE FEATURES
          ════════════════════════════════ */}
          <FeatureBuilder
            group="sideFeatures"
            label="Side Features"
            symbol="🔷"
            fields={sideFields}
            onAppend={() => appendSide({ title: "", desc: "" })}
            onRemove={removeSide}
          />

          <div className={styles.formDivider} />

          {/* ════════════════════════════════
              4. BOTTOM FEATURES
          ════════════════════════════════ */}
          <FeatureBuilder
            group="bottomFeatures"
            label="Bottom Features"
            symbol="🔲"
            fields={bottomFields}
            onAppend={() => appendBottom({ title: "", desc: "" })}
            onRemove={removeBottom}
          />

          <div className={styles.formDivider} />

          {/* Form Actions */}
          <div className={styles.formActions}>
            <Link
              href="/admin/dashboard/whyaymschool"
              className={styles.cancelBtn}
            >
              ← Cancel
            </Link>
            <button
              type="submit"
              className={`${styles.submitBtn} ${
                isSubmitting ? styles.submitBtnLoading : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner} /> Updating…
                </>
              ) : (
                <>
                  <span>✦</span> Update Section
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}