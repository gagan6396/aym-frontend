"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "@/assets/style/Admin/dashboard/aymfullpage/AymFullPage.module.css";
// import api from "@/lib/api";

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface BodyPlaneItem  { label: string; listItem: string; }
interface PromoCard      { title: string; text: string; link: string; }
interface JourneyPara    { text: string; }
interface CampusFacility { bold: string; text: string; image: File | null; imageAlt: string; imageUrl?: string; }

interface FormData {
  alignTitle:          string;
  salutation:          string;
  alignPara1:          string;
  alignPara2:          string;
  alignPara3:          string;
  bodyPlanes:          BodyPlaneItem[];
  planesPara:          string;
  bodyPlanesImage:     File | null;
  bodyPlanesImageAlt:  string;
  bodyPlanesImageUrl:  string;   // ← existing server URL
  outdoorImage:        File | null;
  outdoorImageAlt:     string;
  outdoorImageUrl:     string;   // ← existing server URL
  outdoorCaption:      string;
  highlight1:          string;
  highlight2:          string;
  campusTitle:         string;
  campusFacilities:    CampusFacility[];
  promoCard1:          PromoCard;
  promoCard2:          PromoCard;
  ctaHeading:          string;
  ctaSubtext:          string;
  whatsappLink:        string;
  masterQuote:         string;
  masterAttrib:        string;
  journeyParas:        JourneyPara[];
  namesteText:         string;
}

interface FormErrors {
  alignTitle?: string;      salutation?: string;
  alignPara1?: string;      alignPara2?: string;    alignPara3?: string;
  planesPara?: string;
  bodyPlanesImage?: string; outdoorImage?: string;
  highlight1?: string;      highlight2?: string;
  campusTitle?: string;
  promoCard1Title?: string; promoCard1Text?: string; promoCard1Link?: string;
  promoCard2Title?: string; promoCard2Text?: string; promoCard2Link?: string;
  ctaHeading?: string;      ctaSubtext?: string;    whatsappLink?: string;
  masterQuote?: string;     masterAttrib?: string;  namesteText?: string;
}

type TabKey = "alignment" | "campus" | "cta";

/* ══════════════════════════════════════════════
   MOCK — replace with real API response
══════════════════════════════════════════════ */
const MOCK_EXISTING: FormData = {
  alignTitle:  "Yoga Alliance's Alignment and Adjustment Certification course in India, at AYM",
  salutation:  "Nameste! yogis",
  alignPara1:  "I was thinking of addressing this significant topic with you. There are numerous Yoga schools, colleges, institutes, and ashrams worldwide that offer Yoga certifications, diplomas, and degrees; however, how many of them incorporate the art of alignment and adjustment into their course curriculum? In Rishikesh, there are very few, almost none, except at our school.",
  alignPara2:  "There are very few experts in the universe who are the complete masters of the alignment and adjustment of asana or postures. There are three planes of the body that yoga experts frequently use in teaching yoga postures and describing how the body moves during entry into asanas or while holding asanas.",
  alignPara3:  "By knowing the different body planes correctly, you can use this knowledge in designing your yoga lesson planning to ensure you're moving and strengthening your body in all the correct directions.",
  bodyPlanes:  [
    { label: "Sagittal plane",   listItem: "Sagittal (Longitudinal) plane." },
    { label: "Coronal plane",    listItem: "Coronal (frontal) plane."        },
    { label: "Transverse plane", listItem: "Transverse (Axial) plane."       },
  ],
  planesPara:          "The three planes of movement in different postures of Yoga, and a Yoga teacher should have deep knowledge of them: the names are:",
  bodyPlanesImage:     null,
  bodyPlanesImageAlt:  "Yoga body planes diagram - Sagittal, Coronal and Transverse planes",
  bodyPlanesImageUrl:  "/uploads/alignment-diagram.jpg",
  outdoorImage:        null,
  outdoorImageAlt:     "Outdoor Yoga Practice by the Ganges, Rishikesh",
  outdoorImageUrl:     "/uploads/yoga-outdoor.webp",
  outdoorCaption:      "🌊 Outdoor Yoga Practice by the Ganges, Rishikesh",
  highlight1:          "200 Hour Yoga TTC in Rishikesh with Alignment Focus",
  highlight2:          "Advanced Yoga Teacher Training with Alignment in Rishikesh.",
  campusTitle:         "Campus: AYM Yoga school / Yoga ashram in Rishikesh",
  campusFacilities: [
    { bold: "Location:",                                    text: "Our campus is a spacious blend of natural beauty and airy buildings, creating a quiet and contemplative atmosphere. The AYM campus is one of the most lush campuses among Yoga TTC schools in Rishikesh.",                                          image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Buildings/Wings:",                        text: "We have a total of six wings, each with 20 to 25 rooms, as well as yoga studios, a library, an Ayurveda spa centre, and a swimming pool.",                                                                                                       image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Accommodation:",                          text: "We have a variety of accommodations at our Transformative Yoga teacher training centre in Rishikesh.",                                                                                                                                            image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Garden:",                                 text: "At the centre of our campus, we have a beautiful garden with lush greenery, featuring large mango and avocado trees, as well as swinging chairs.",                                                                                                image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Yoga studios:",                           text: "Our campus has 10 Yoga halls designed to help you leave the outside world behind.",                                                                                                                                                               image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Dining space and cuisine:",               text: "Our dining hall is a peaceful space where mindful eating and nourishing, simple meals are served.",                                                                                                                                               image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Central Temple or Agnihotra shala:",      text: "Agnihotra shala is a space for performing the Vedic healing ritual, which purifies the atmosphere and promotes physical, mental, and spiritual well-being.",                                                                                      image: null, imageAlt: "", imageUrl: "" },
    { bold: "Swimming pool:",                              text: "A small pool in open air and in sunlight, designed for the Healing properties of water and being used for water yoga, pregnancy yoga, teacher training classes, water breathing exercise and contemplation.",                                      image: null, imageAlt: "", imageUrl: "" },
    { bold: "AYM Ayurveda centre:",                        text: "You can step away from every tension into a world of relaxation, rejuvenation, and natural healing at AYM Ayurveda Center in Rishikesh India.",                                                                                                  image: null, imageAlt: "", imageUrl: "" },
    { bold: "Sound / Reiki healing studios:",              text: "We have three sound healing studios, a haven of peace featuring soothing light and many sound healers from the Himalayas.",                                                                                                                       image: null, imageAlt: "", imageUrl: "" },
    { bold: "A yoga library:",                             text: "The space is a blend of traditional and modern ambience. Having books on yoga philosophy, ayurveda, computers, and high-speed internet.",                                                                                                        image: null, imageAlt: "", imageUrl: "" },
    { bold: "The atmosphere of AYM Yoga School in Rishikesh:", text: "The vibe of the Aym campus is full of spiritual energy, with a community of residential yoga teacher training certification students and long-stay students.",                                                                                image: null, imageAlt: "", imageUrl: "" },
  ],
  promoCard1:   { title: "Yoga for Beginners at AYM",                                     text: "New to Yoga? Join our short yet intensive 1 and 2-week-long yoga training programs in Rishikesh.",                                                                                link: "/yoga-for-beginners" },
  promoCard2:   { title: "Yoga in India Compared to Yoga Around the World",                text: "India is the birthplace of Yoga, which proves the potential to learn and master the art from trained yogis within the country.",                                                   link: "/yoga-in-india"      },
  ctaHeading:   "Begin Your Journey to Inner Peace",
  ctaSubtext:   "Transform your mind, body, and spirit with our expert-led yoga classes. Connect with us now to start your personalized yoga experience.",
  whatsappLink: "https://wa.me/918476898395",
  masterQuote:  "\"The beauty of Yoga is, it shows you fitness with a side of spirituality and happiness.\"",
  masterAttrib: "— Yogi Chetan Mahesh Ji",
  journeyParas: [
    { text: "Are you ready to witness the beauty of yogic practices? Tune into your spiritual self with us. Join our yoga teacher training courses in Rishikesh and take the transformative path." },
    { text: "Our courses are built to imbibe self-confidence and reach personal growth milestones. Learn to replace your negative emotions with positive-inducing thoughts." },
    { text: "Learn from fellow yogis, cherish the moments spent mastering perfection and find your calm and inner peace." },
    { text: "Get in touch with us to enrol in our upcoming yoga teacher training programs in Rishikesh. Each batch has limited seats." },
    { text: "Start your journey to become a registered yoga teacher. The best yoga training school in Rishikesh looks forward to welcoming you." },
  ],
  namesteText: "May you always be happy, healthy and peaceful.",
};

/* ══════════════════════════════════════════════
   IMAGE UPLOAD FIELD
══════════════════════════════════════════════ */
interface ImageUploadFieldProps {
  label: string; hint: string; file: File | null; existingUrl?: string;
  altText: string; altPlaceholder: string; errorMsg?: string; required?: boolean;
  onFileChange: (file: File | null) => void; onAltChange: (alt: string) => void;
}

function ImageUploadField({ label, hint, file, existingUrl, altText, altPlaceholder, errorMsg, required, onFileChange, onAltChange }: ImageUploadFieldProps) {
  const inputRef                = useRef<HTMLInputElement>(null);
  const [preview, setPreview]   = useState<string | null>(existingUrl ?? null);
  const [dragOver, setDragOver] = useState(false);
  const isExisting              = !file && !!existingUrl && preview === existingUrl;

  const handleFile = (f: File | null) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = (e) => setPreview(e.target?.result as string);
    r.readAsDataURL(f);
    onFileChange(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleRemove = () => { setPreview(null); onFileChange(null); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}>
        <span className={styles.labelIcon}>✦</span>{label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <p className={styles.fieldHint}>{hint}</p>

      {!preview ? (
        <div
          className={`${styles.imageDropZone} ${dragOver ? styles.imageDropZoneActive : ""} ${errorMsg ? styles.imageDropZoneError : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <span className={styles.dropIcon}>🖼</span>
          <p className={styles.dropText}>Drag & drop image here or <span className={styles.dropBrowse}>browse</span></p>
          <p className={styles.dropMeta}>PNG · JPG · WEBP · Max 5 MB</p>
          <input ref={inputRef} type="file" accept="image/*" className={styles.fileInputHidden}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      ) : (
        <div className={styles.imagePreviewWrap}>
          {isExisting && <div className={styles.existingImageBadge}>✓ Current Image</div>}
          <img src={preview} alt="Preview" className={styles.imagePreview} />
          <div className={styles.imagePreviewOverlay}>
            <button type="button" className={styles.imageRemoveBtn} onClick={handleRemove}>✕ Remove</button>
            <button type="button" className={styles.imageChangeBtn} onClick={() => inputRef.current?.click()}>✎ Change</button>
          </div>
          {file       && <div className={styles.imageFileName}>{file.name}</div>}
          {isExisting && <div className={styles.imageFileName} style={{ color: "#5a7c52" }}>Saved on server — upload new file to replace</div>}
          <input ref={inputRef} type="file" accept="image/*" className={styles.fileInputHidden}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      )}

      {errorMsg && <p className={styles.errorMsg}>⚠ {errorMsg}</p>}

      <div className={`${styles.inputWrap} ${styles.altInputWrap}`}>
        <input type="text" className={styles.input} placeholder={altPlaceholder}
          value={altText} maxLength={120} onChange={(e) => onAltChange(e.target.value)} />
        <span className={styles.charCount}>{altText.length}/120</span>
      </div>
      <p className={styles.fieldHint} style={{ marginTop: "0.4rem" }}>Alt text — important for SEO &amp; accessibility</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   FACILITY IMAGE UPLOAD (compact)
══════════════════════════════════════════════ */
interface FacilityImageProps {
  file: File | null; existingUrl?: string; altText: string;
  onFileChange: (f: File | null) => void; onAltChange: (v: string) => void;
}

function FacilityImageUpload({ file, existingUrl, altText, onFileChange, onAltChange }: FacilityImageProps) {
  const inputRef              = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const isExisting            = !file && !!existingUrl && preview === existingUrl;

  const handleFile = (f: File | null) => {
    if (!f) return;
    const r = new FileReader(); r.onload = (e) => setPreview(e.target?.result as string); r.readAsDataURL(f); onFileChange(f);
  };
  const handleRemove = () => { setPreview(null); onFileChange(null); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div style={{ marginTop: "0.75rem" }}>
      <p className={styles.fieldHint} style={{ marginBottom: "0.5rem" }}>🖼 Optional facility photo</p>
      {!preview ? (
        <div className={styles.imageDropZone} style={{ padding: "1rem", marginBottom: "0.5rem" }} onClick={() => inputRef.current?.click()}>
          <span style={{ fontSize: "1.2rem" }}>📷</span>
          <p className={styles.dropText} style={{ fontSize: "0.8rem" }}>Click to upload facility photo</p>
          <p className={styles.dropMeta}>PNG · JPG · WEBP · Max 5 MB</p>
          <input ref={inputRef} type="file" accept="image/*" className={styles.fileInputHidden}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      ) : (
        <div className={styles.imagePreviewWrap} style={{ marginBottom: "0.5rem", maxHeight: "160px" }}>
          {isExisting && <div className={styles.existingImageBadge}>✓ Current</div>}
          <img src={preview} alt="Facility" className={styles.imagePreview} style={{ maxHeight: "140px" }} />
          <div className={styles.imagePreviewOverlay}>
            <button type="button" className={styles.imageRemoveBtn} onClick={handleRemove}>✕ Remove</button>
            <button type="button" className={styles.imageChangeBtn} onClick={() => inputRef.current?.click()}>✎ Change</button>
          </div>
          {file       && <div className={styles.imageFileName}>{file.name}</div>}
          {isExisting && <div className={styles.imageFileName} style={{ color: "#5a7c52" }}>Saved — upload new to replace</div>}
          <input ref={inputRef} type="file" accept="image/*" className={styles.fileInputHidden}
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
        </div>
      )}
      <div className={styles.inputWrap}>
        <input type="text" className={styles.input} placeholder="Alt text for this facility photo"
          value={altText} maxLength={120} onChange={(e) => onAltChange(e.target.value)} />
        <span className={styles.charCount}>{altText.length}/120</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN EDIT PAGE
══════════════════════════════════════════════ */
export default function EditAYMFullPagePage() {
  const router = useRouter();
  const params = useParams();
  const id     = params?.id as string;

  const [form, setForm]                 = useState<FormData | null>(null);
  const [originalForm, setOriginalForm] = useState<string>("");
  const [errors, setErrors]             = useState<FormErrors>({});
  const [isLoading, setIsLoading]       = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);
  const [activeTab, setActiveTab]       = useState<TabKey>("alignment");
  const [expandedFacilities, setExpandedFacilities] = useState<Set<number>>(new Set());
  const [hasChanges, setHasChanges]     = useState(false);

  /* ── Fetch existing data on mount ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // const res  = await api.get(`/aym-full-page/${id}`);
        // const data = res.data.data as FormData;
        const data = { ...MOCK_EXISTING }; // ← replace with real API
        setForm(data);
        // Snapshot for change-detection (without File objects)
        setOriginalForm(JSON.stringify(stripFiles(data)));
      } catch (err) {
        console.error(err);
        alert("Failed to load page data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  /* ── Strip File objects for comparison ── */
  const stripFiles = (f: FormData) => ({
    ...f,
    bodyPlanesImage: null,
    outdoorImage:    null,
    campusFacilities: f.campusFacilities.map(({ image, ...rest }) => rest),
  });

  /* ── Unsaved-changes detection ── */
  useEffect(() => {
    if (!form || !originalForm) return;
    const current     = JSON.stringify(stripFiles(form));
    const hasFileChange = !!form.bodyPlanesImage || !!form.outdoorImage || form.campusFacilities.some((f) => !!f.image);
    setHasChanges(current !== originalForm || hasFileChange);
  }, [form, originalForm]);

  /* Loading screen */
  if (isLoading || !form) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingOm}>ॐ</div>
        <p className={styles.loadingText}>Loading page content…</p>
      </div>
    );
  }

  /* ── Helpers ── */
  const set = (key: keyof FormData, val: string) => {
    setForm((p) => p ? { ...p, [key]: val } : p);
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const setImage = (key: "bodyPlanesImage" | "outdoorImage", file: File | null) => {
    setForm((p) => p ? { ...p, [key]: file } : p);
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const setPromo = (card: "promoCard1" | "promoCard2", field: keyof PromoCard, val: string) => {
    setForm((p) => p ? { ...p, [card]: { ...p[card], [field]: val } } : p);
    const errKey = `${card}${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof FormErrors;
    setErrors((p) => ({ ...p, [errKey]: undefined }));
  };

  /* Body Planes */
  const updatePlane  = (i: number, field: keyof BodyPlaneItem, val: string) =>
    setForm((p) => { if (!p) return p; const a = [...p.bodyPlanes]; a[i] = { ...a[i], [field]: val }; return { ...p, bodyPlanes: a }; });
  const addPlane     = () => { if (form.bodyPlanes.length >= 8) return; setForm((p) => p ? { ...p, bodyPlanes: [...p.bodyPlanes, { label: "", listItem: "" }] } : p); };
  const removePlane  = (i: number) => setForm((p) => p ? { ...p, bodyPlanes: p.bodyPlanes.filter((_, idx) => idx !== i) } : p);

  /* Facilities */
  const updateFacility = (i: number, field: keyof CampusFacility, val: string | File | null) =>
    setForm((p) => { if (!p) return p; const a = [...p.campusFacilities]; a[i] = { ...a[i], [field]: val }; return { ...p, campusFacilities: a }; });
  const addFacility = () => {
    if (form.campusFacilities.length >= 20) return;
    const idx = form.campusFacilities.length;
    setForm((p) => p ? { ...p, campusFacilities: [...p.campusFacilities, { bold: "", text: "", image: null, imageAlt: "", imageUrl: "" }] } : p);
    setExpandedFacilities((prev) => new Set(prev).add(idx));
  };
  const removeFacility = (i: number) => {
    setForm((p) => p ? { ...p, campusFacilities: p.campusFacilities.filter((_, idx) => idx !== i) } : p);
    setExpandedFacilities((prev) => { const n = new Set<number>(); prev.forEach((v) => { if (v < i) n.add(v); else if (v > i) n.add(v - 1); }); return n; });
  };
  const toggleFacility = (i: number) =>
    setExpandedFacilities((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });

  /* Journey paras */
  const updateJourney = (i: number, val: string) =>
    setForm((p) => { if (!p) return p; const a = [...p.journeyParas]; a[i] = { text: val }; return { ...p, journeyParas: a }; });
  const addJourney    = () => { if (form.journeyParas.length >= 8) return; setForm((p) => p ? { ...p, journeyParas: [...p.journeyParas, { text: "" }] } : p); };
  const removeJourney = (i: number) => setForm((p) => p ? { ...p, journeyParas: p.journeyParas.filter((_, idx) => idx !== i) } : p);

  /* Validation */
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.alignTitle.trim())       e.alignTitle      = "Alignment section title is required";
    if (!form.salutation.trim())       e.salutation      = "Salutation is required";
    if (!form.alignPara1.trim())       e.alignPara1      = "Paragraph 1 is required";
    if (!form.alignPara2.trim())       e.alignPara2      = "Paragraph 2 is required";
    if (!form.alignPara3.trim())       e.alignPara3      = "Paragraph 3 is required";
    if (!form.planesPara.trim())       e.planesPara      = "Planes intro paragraph is required";
    if (!form.bodyPlanesImage && !form.bodyPlanesImageUrl) e.bodyPlanesImage = "Body planes diagram image is required";
    if (!form.outdoorImage    && !form.outdoorImageUrl)    e.outdoorImage    = "Outdoor group photo is required";
    if (!form.highlight1.trim())       e.highlight1      = "Highlight text 1 is required";
    if (!form.highlight2.trim())       e.highlight2      = "Highlight text 2 is required";
    if (!form.campusTitle.trim())      e.campusTitle     = "Campus section title is required";
    if (!form.promoCard1.title.trim()) e.promoCard1Title = "Promo card 1 title is required";
    if (!form.promoCard1.text.trim())  e.promoCard1Text  = "Promo card 1 text is required";
    if (!form.promoCard1.link.trim())  e.promoCard1Link  = "Promo card 1 link is required";
    if (!form.promoCard2.title.trim()) e.promoCard2Title = "Promo card 2 title is required";
    if (!form.promoCard2.text.trim())  e.promoCard2Text  = "Promo card 2 text is required";
    if (!form.promoCard2.link.trim())  e.promoCard2Link  = "Promo card 2 link is required";
    if (!form.ctaHeading.trim())       e.ctaHeading      = "CTA heading is required";
    if (!form.ctaSubtext.trim())       e.ctaSubtext      = "CTA subtext is required";
    if (!form.whatsappLink.trim())     e.whatsappLink    = "WhatsApp link is required";
    if (!form.masterQuote.trim())      e.masterQuote     = "Master quote is required";
    if (!form.masterAttrib.trim())     e.masterAttrib    = "Attribution is required";
    if (!form.namesteText.trim())      e.namesteText     = "Namaste closing text is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const tabHasError = (tab: TabKey): boolean => {
    const map: Record<TabKey, (keyof FormErrors)[]> = {
      alignment: ["alignTitle","salutation","alignPara1","alignPara2","alignPara3","planesPara","bodyPlanesImage","outdoorImage","highlight1","highlight2"],
      campus:    ["campusTitle","promoCard1Title","promoCard1Text","promoCard1Link","promoCard2Title","promoCard2Text","promoCard2Link"],
      cta:       ["ctaHeading","ctaSubtext","whatsappLink","masterQuote","masterAttrib","namesteText"],
    };
    return map[tab].some((k) => !!errors[k]);
  };

  const handleSubmit = async () => {
    if (!validate()) {
      if (tabHasError("alignment"))   setActiveTab("alignment");
      else if (tabHasError("campus")) setActiveTab("campus");
      else                            setActiveTab("cta");
      return;
    }
    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v instanceof File) fd.append(k, v);
        else if (k === "campusFacilities") {
          (v as CampusFacility[]).forEach((fac, i) => { if (fac.image) fd.append(`facilityImage_${i}`, fac.image); });
          fd.append(k, JSON.stringify((v as CampusFacility[]).map(({ image, ...r }) => r)));
        } else if (Array.isArray(v) || (typeof v === "object" && v !== null))
          fd.append(k, JSON.stringify(v));
        else if (v !== null && v !== undefined)
          fd.append(k, String(v));
      });
      // await api.put(`/aym-full-page/update/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      console.log("PUT /aym-full-page/update/" + id, form);
      setSubmitted(true);
      setTimeout(() => router.push("/admin/dashboard/aymfullpage"), 1500);
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Success screen */
  if (submitted) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successOm}>ॐ</div>
          <div className={styles.successCheck}>✓</div>
          <h2 className={styles.successTitle}>Changes Saved!</h2>
          <p className={styles.successText}>Redirecting…</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "alignment", label: "Alignment & Adjustment", icon: "🧘" },
    { key: "campus",    label: "Campus Section",          icon: "🏛️" },
    { key: "cta",       label: "CTA & Journey",           icon: "✨" },
  ];

  /* ════════════════════ RENDER ════════════════════ */
  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard/aymfullpage")}>
          AYM Full Page
        </button>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Edit Content</span>
      </div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Edit AYM Full Page Content</h1>
          <p className={styles.pageSubtitle}>Update all three sections — changes apply to the live page</p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.4rem 0.9rem", background: "rgba(224,123,0,0.08)", border: "1px solid rgba(224,123,0,0.25)", borderRadius: "6px", fontFamily: "'Cormorant Garamond', serif", fontSize: "0.8rem", color: "#a07840", fontStyle: "italic", flexShrink: 0 }}>
          <span style={{ fontSize: "0.65rem", color: "#e07b00" }}>✦</span> ID: {id}
        </div>
      </div>

      {/* Unsaved-changes banner */}
      {hasChanges && (
        <div className={styles.changesNotice}>
          <span className={styles.changesIcon}>✎</span>
          You have unsaved changes — click <strong style={{ margin: "0 0.25rem" }}>Update Content</strong> to save.
        </div>
      )}

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span>
        <div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabNav}>
        {tabs.map((t) => (
          <button key={t.key}
            className={`${styles.tabBtn} ${activeTab === t.key ? styles.tabBtnActive : ""} ${tabHasError(t.key) ? styles.tabBtnError : ""}`}
            onClick={() => setActiveTab(t.key)}>
            <span>{t.icon}</span>
            <span className={styles.tabLabel}>{t.label}</span>
            {tabHasError(t.key) && <span className={styles.tabErrorDot}>!</span>}
          </button>
        ))}
      </div>

      <div className={styles.formCard}>

        {/* ═══════════ TAB 1: ALIGNMENT ═══════════ */}
        {activeTab === "alignment" && (
          <>
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Section Header</h3>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Section Title (H2)<span className={styles.required}>*</span></label>
                <p className={styles.fieldHint}>Main heading for the Alignment & Adjustment section</p>
                <div className={`${styles.inputWrap} ${errors.alignTitle ? styles.inputError : ""} ${form.alignTitle && !errors.alignTitle ? styles.inputSuccess : ""}`}>
                  <textarea className={`${styles.input} ${styles.textarea}`}
                    placeholder="e.g. Yoga Alliance's Alignment and Adjustment Certification course in India, at AYM"
                    value={form.alignTitle} maxLength={200} rows={2}
                    onChange={(e) => set("alignTitle", e.target.value)} />
                  <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form.alignTitle.length}/200</span>
                </div>
                {errors.alignTitle && <p className={styles.errorMsg}>⚠ {errors.alignTitle}</p>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Salutation<span className={styles.required}>*</span></label>
                <p className={styles.fieldHint}>Greeting shown below the heading</p>
                <div className={`${styles.inputWrap} ${errors.salutation ? styles.inputError : ""} ${form.salutation && !errors.salutation ? styles.inputSuccess : ""}`}>
                  <input type="text" className={styles.input} placeholder="e.g. Nameste! yogis"
                    value={form.salutation} maxLength={80} onChange={(e) => set("salutation", e.target.value)} />
                  <span className={styles.charCount}>{form.salutation.length}/80</span>
                </div>
                {errors.salutation && <p className={styles.errorMsg}>⚠ {errors.salutation}</p>}
              </div>
            </div>

            <div className={styles.formDivider} />

            {/* Body Paragraphs */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Body Paragraphs</h3>
              </div>
              {([
                { key: "alignPara1" as const, label: "Paragraph 1", hint: "Intro about yoga schools and alignment curriculum" },
                { key: "alignPara2" as const, label: "Paragraph 2", hint: "About body planes and their role in yoga teaching" },
                { key: "alignPara3" as const, label: "Paragraph 3", hint: "Using body planes correctly in lesson planning" },
              ]).map(({ key, label, hint }) => (
                <div key={key} className={styles.fieldGroup}>
                  <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span></label>
                  <p className={styles.fieldHint}>{hint}</p>
                  <div className={`${styles.inputWrap} ${errors[key] ? styles.inputError : ""} ${form[key] && !errors[key] ? styles.inputSuccess : ""}`}>
                    <textarea className={`${styles.input} ${styles.textarea}`}
                      placeholder={`Write ${label.toLowerCase()}…`} value={form[key]} maxLength={600} rows={4}
                      onChange={(e) => set(key, e.target.value)} />
                    <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form[key].length}/600</span>
                  </div>
                  {errors[key] && <p className={styles.errorMsg}>⚠ {errors[key]}</p>}
                </div>
              ))}
            </div>

            <div className={styles.formDivider} />

            {/* Body Planes Diagram Image */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Body Planes Diagram Image</h3>
                <span className={styles.sectionBadge}>yogaBodyPlanes</span>
              </div>
              <ImageUploadField
                label="Alignment Diagram Image"
                hint="Leave unchanged to keep the current image — upload a new file to replace it"
                file={form.bodyPlanesImage} existingUrl={form.bodyPlanesImageUrl}
                altText={form.bodyPlanesImageAlt}
                altPlaceholder="e.g. Yoga body planes diagram - Sagittal, Coronal and Transverse planes"
                errorMsg={errors.bodyPlanesImage} required
                onFileChange={(f) => setImage("bodyPlanesImage", f)}
                onAltChange={(v) => set("bodyPlanesImageAlt", v)}
              />
            </div>

            <div className={styles.formDivider} />

            {/* Body Planes List */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Body Planes List</h3>
                <span className={styles.sectionBadge}>{form.bodyPlanes.length}/8</span>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Intro Paragraph<span className={styles.required}>*</span></label>
                <p className={styles.fieldHint}>Text shown above the numbered list</p>
                <div className={`${styles.inputWrap} ${errors.planesPara ? styles.inputError : ""} ${form.planesPara && !errors.planesPara ? styles.inputSuccess : ""}`}>
                  <textarea className={`${styles.input} ${styles.textarea}`}
                    placeholder="e.g. The three planes of movement…" value={form.planesPara} maxLength={300} rows={2}
                    onChange={(e) => set("planesPara", e.target.value)} />
                  <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form.planesPara.length}/300</span>
                </div>
                {errors.planesPara && <p className={styles.errorMsg}>⚠ {errors.planesPara}</p>}
              </div>
              <p className={styles.fieldHint} style={{ marginBottom: "0.9rem" }}>Diagram label = text under image column · List item = numbered list text</p>
              <div className={styles.statsGrid}>
                {form.bodyPlanes.map((plane, i) => (
                  <div key={i} className={styles.statRow}>
                    <div className={styles.statIndex}>{i + 1}</div>
                    <div className={styles.statFields}>
                      <div className={styles.inputWrap}>
                        <input type="text" className={styles.input} placeholder="Diagram label"
                          value={plane.label} maxLength={40} onChange={(e) => updatePlane(i, "label", e.target.value)} />
                      </div>
                      <div className={styles.inputWrap}>
                        <input type="text" className={styles.input} placeholder="List item"
                          value={plane.listItem} maxLength={60} onChange={(e) => updatePlane(i, "listItem", e.target.value)} />
                      </div>
                    </div>
                    <button type="button" className={styles.removeStatBtn}
                      onClick={() => removePlane(i)} disabled={form.bodyPlanes.length <= 1}>✕</button>
                  </div>
                ))}
              </div>
              {form.bodyPlanes.length < 8 && (
                <button type="button" className={styles.addStatBtn} onClick={addPlane}>+ Add Plane</button>
              )}
            </div>

            <div className={styles.formDivider} />

            {/* Highlight Keywords */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Highlight Keywords</h3>
              </div>
              {([
                { key: "highlight1" as const, label: "Highlight Text 1", ph: "e.g. 200 Hour Yoga TTC in Rishikesh with Alignment Focus" },
                { key: "highlight2" as const, label: "Highlight Text 2", ph: "e.g. Advanced Yoga Teacher Training with Alignment in Rishikesh." },
              ]).map(({ key, label, ph }) => (
                <div key={key} className={styles.fieldGroup}>
                  <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span></label>
                  <div className={`${styles.inputWrap} ${errors[key] ? styles.inputError : ""} ${form[key] && !errors[key] ? styles.inputSuccess : ""}`}>
                    <input type="text" className={styles.input} placeholder={ph}
                      value={form[key]} maxLength={160} onChange={(e) => set(key, e.target.value)} />
                    <span className={styles.charCount}>{form[key].length}/160</span>
                  </div>
                  {errors[key] && <p className={styles.errorMsg}>⚠ {errors[key]}</p>}
                </div>
              ))}
            </div>

            <div className={styles.formDivider} />

            {/* Outdoor Photo */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Outdoor Group Yoga Photo</h3>
                <span className={styles.sectionBadge}>yogaoutdoor image</span>
              </div>
              <ImageUploadField
                label="Outdoor Yoga Practice Photo"
                hint="Leave unchanged to keep the current image — upload a new file to replace it"
                file={form.outdoorImage} existingUrl={form.outdoorImageUrl}
                altText={form.outdoorImageAlt}
                altPlaceholder="e.g. Outdoor Yoga Practice by the Ganges, Rishikesh"
                errorMsg={errors.outdoorImage} required
                onFileChange={(f) => setImage("outdoorImage", f)}
                onAltChange={(v) => set("outdoorImageAlt", v)}
              />
              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Photo Overlay Caption</label>
                <p className={styles.fieldHint}>Text shown on the dark overlay strip at the bottom of the photo</p>
                <div className={styles.inputWrap}>
                  <input type="text" className={styles.input}
                    placeholder="e.g. 🌊 Outdoor Yoga Practice by the Ganges, Rishikesh"
                    value={form.outdoorCaption} maxLength={120}
                    onChange={(e) => set("outdoorCaption", e.target.value)} />
                  <span className={styles.charCount}>{form.outdoorCaption.length}/120</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════ TAB 2: CAMPUS ═══════════ */}
        {activeTab === "campus" && (
          <>
            {/* Campus Title */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Campus Section Heading</h3>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Section Title (H2)<span className={styles.required}>*</span></label>
                <p className={styles.fieldHint}>Main heading for the Campus section</p>
                <div className={`${styles.inputWrap} ${errors.campusTitle ? styles.inputError : ""} ${form.campusTitle && !errors.campusTitle ? styles.inputSuccess : ""}`}>
                  <textarea className={`${styles.input} ${styles.textarea}`}
                    placeholder="e.g. Campus: AYM Yoga school / Yoga ashram in Rishikesh"
                    value={form.campusTitle} maxLength={200} rows={2}
                    onChange={(e) => set("campusTitle", e.target.value)} />
                  <span className={`${styles.charCount} ${styles.charCountBottom}`}>{form.campusTitle.length}/200</span>
                </div>
                {errors.campusTitle && <p className={styles.errorMsg}>⚠ {errors.campusTitle}</p>}
              </div>
            </div>

            <div className={styles.formDivider} />

            {/* Campus Facilities accordion */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Campus Facilities</h3>
                <span className={styles.sectionBadge}>{form.campusFacilities.length}/20</span>
              </div>
              <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>
                Edit each facility's bold label, description, and optional photo. Click a row to expand.
              </p>
              <div className={styles.statsGrid}>
                {form.campusFacilities.map((fac, i) => {
                  const isOpen = expandedFacilities.has(i);
                  const hasImg = !!(fac.imageUrl || fac.image);
                  return (
                    <div key={i} style={{ border: "1.5px solid #e8d5b5", borderRadius: "10px", overflow: "hidden", background: "#fffdf8" }}>
                      <div onClick={() => toggleFacility(i)} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.75rem 1rem", cursor: "pointer", background: isOpen ? "rgba(224,123,0,0.06)" : "transparent", borderBottom: isOpen ? "1px solid #e8d5b5" : "none", transition: "background 0.2s" }}>
                        <div className={styles.statIndex} style={{ margin: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontFamily: "'Cinzel',serif", fontSize: "0.72rem", fontWeight: 600, color: "#5c2d00", letterSpacing: "0.04em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {fac.bold || `Facility ${i + 1}`}
                          </p>
                          {!isOpen && fac.text && (
                            <p style={{ margin: "0.1rem 0 0", fontFamily: "'Cormorant Garamond',serif", fontSize: "0.78rem", color: "#a07840", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {fac.text.slice(0, 80)}{fac.text.length > 80 ? "…" : ""}
                            </p>
                          )}
                        </div>
                        {hasImg && (
                          <span style={{ fontSize: "0.7rem", color: "#2a5e1e", background: "rgba(42,94,30,0.1)", border: "1px solid rgba(42,94,30,0.2)", borderRadius: "4px", padding: "0.1rem 0.4rem", fontFamily: "'Cinzel',serif", flexShrink: 0 }}>📷</span>
                        )}
                        <span style={{ color: "#a07840", fontSize: "0.8rem", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
                        <button type="button" className={styles.removeStatBtn} style={{ margin: 0, flexShrink: 0 }}
                          onClick={(e) => { e.stopPropagation(); removeFacility(i); }}
                          disabled={form.campusFacilities.length <= 1}>✕</button>
                      </div>

                      {isOpen && (
                        <div style={{ padding: "1rem" }}>
                          <div className={styles.fieldGroup} style={{ marginBottom: "1rem" }}>
                            <label className={styles.label} style={{ marginBottom: "0.3rem" }}><span className={styles.labelIcon}>✦</span> Bold Label</label>
                            <p className={styles.fieldHint}>e.g. "Location:" or "AYM Garden:"</p>
                            <div className={styles.inputWrap}>
                              <input type="text" className={styles.input} placeholder="e.g. Location:"
                                value={fac.bold} maxLength={80} onChange={(e) => updateFacility(i, "bold", e.target.value)} />
                              <span className={styles.charCount}>{fac.bold.length}/80</span>
                            </div>
                          </div>
                          <div className={styles.fieldGroup} style={{ marginBottom: "1rem" }}>
                            <label className={styles.label} style={{ marginBottom: "0.3rem" }}><span className={styles.labelIcon}>✦</span> Description Text</label>
                            <div className={styles.inputWrap}>
                              <textarea className={`${styles.input} ${styles.textarea}`}
                                placeholder="Describe this facility…" value={fac.text} maxLength={800} rows={4}
                                onChange={(e) => updateFacility(i, "text", e.target.value)} />
                              <span className={`${styles.charCount} ${styles.charCountBottom}`}>{fac.text.length}/800</span>
                            </div>
                          </div>
                          <FacilityImageUpload
                            file={fac.image} existingUrl={fac.imageUrl} altText={fac.imageAlt}
                            onFileChange={(f) => updateFacility(i, "image", f)}
                            onAltChange={(v) => updateFacility(i, "imageAlt", v)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {form.campusFacilities.length < 20 && (
                <button type="button" className={styles.addStatBtn} onClick={addFacility} style={{ marginTop: "0.9rem" }}>
                  + Add Facility
                </button>
              )}
            </div>

            <div className={styles.formDivider} />

            {/* Promo Cards */}
            {(["promoCard1", "promoCard2"] as const).map((cardKey, ci) => (
              <div key={cardKey}>
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.sectionIcon}>✦</span>
                    <h3 className={styles.sectionTitle}>Promo Card {ci + 1}</h3>
                    <span className={styles.sectionBadge}>{ci === 0 ? "Yoga for Beginners" : "Yoga in India"}</span>
                  </div>
                  {([
                    { field: "title" as const, label: "Card Title",   ph: ci === 0 ? "e.g. Yoga for Beginners at AYM" : "e.g. Yoga in India Compared to Yoga Around the World", max: 120, rows: 0, errSuffix: "Title" },
                    { field: "text"  as const, label: "Card Text",    ph: "Description paragraph…", max: 700, rows: 4, errSuffix: "Text" },
                  ]).map(({ field, label, ph, max, rows, errSuffix }) => {
                    const errKey = `${cardKey}${errSuffix}` as keyof FormErrors;
                    return (
                      <div key={field} className={styles.fieldGroup}>
                        <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span></label>
                        <div className={`${styles.inputWrap} ${errors[errKey] ? styles.inputError : ""} ${form[cardKey][field] && !errors[errKey] ? styles.inputSuccess : ""}`}>
                          {rows > 0
                            ? <textarea className={`${styles.input} ${styles.textarea}`} placeholder={ph} value={form[cardKey][field]} maxLength={max} rows={rows} onChange={(e) => setPromo(cardKey, field, e.target.value)} />
                            : <input type="text" className={styles.input} placeholder={ph} value={form[cardKey][field]} maxLength={max} onChange={(e) => setPromo(cardKey, field, e.target.value)} />}
                          <span className={rows > 0 ? `${styles.charCount} ${styles.charCountBottom}` : styles.charCount}>{form[cardKey][field].length}/{max}</span>
                        </div>
                        {errors[errKey] && <p className={styles.errorMsg}>⚠ {errors[errKey]}</p>}
                      </div>
                    );
                  })}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}><span className={styles.labelIcon}>✦</span>"More information" Link<span className={styles.required}>*</span></label>
                    <div className={`${styles.inputWrap} ${styles.inputWithPrefix} ${errors[`${cardKey}Link` as keyof FormErrors] ? styles.inputError : ""} ${form[cardKey].link && !errors[`${cardKey}Link` as keyof FormErrors] ? styles.inputSuccess : ""}`}>
                      <span className={styles.inputPrefix}>🔗</span>
                      <input type="text" className={`${styles.input} ${styles.inputPrefixed}`}
                        placeholder="/yoga-for-beginners or https://…" value={form[cardKey].link}
                        onChange={(e) => setPromo(cardKey, "link", e.target.value)} />
                    </div>
                    {errors[`${cardKey}Link` as keyof FormErrors] && <p className={styles.errorMsg}>⚠ {errors[`${cardKey}Link` as keyof FormErrors]}</p>}
                  </div>
                </div>
                {ci === 0 && <div className={styles.formDivider} />}
              </div>
            ))}
          </>
        )}

        {/* ═══════════ TAB 3: CTA ═══════════ */}
        {activeTab === "cta" && (
          <>
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>CTA Banner</h3>
              </div>
              {([
                { key: "ctaHeading"   as const, label: "CTA Heading",          max: 100, rows: 0, ph: "e.g. Begin Your Journey to Inner Peace" },
                { key: "ctaSubtext"   as const, label: "CTA Subtext",          max: 300, rows: 3, ph: "e.g. Transform your mind, body, and spirit…" },
                { key: "whatsappLink" as const, label: "WhatsApp Button Link", max: 120, rows: 0, ph: "e.g. https://wa.me/918476898395" },
              ]).map(({ key, label, max, rows, ph }) => (
                <div key={key} className={styles.fieldGroup}>
                  <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span></label>
                  <div className={`${styles.inputWrap} ${errors[key as keyof FormErrors] ? styles.inputError : ""} ${(form[key] as string) && !errors[key as keyof FormErrors] ? styles.inputSuccess : ""}`}>
                    {rows > 0
                      ? <textarea className={`${styles.input} ${styles.textarea}`} placeholder={ph} value={form[key] as string} maxLength={max} rows={rows} onChange={(e) => set(key, e.target.value)} />
                      : <input type="text" className={styles.input} placeholder={ph} value={form[key] as string} maxLength={max} onChange={(e) => set(key, e.target.value)} />}
                    <span className={rows > 0 ? `${styles.charCount} ${styles.charCountBottom}` : styles.charCount}>{(form[key] as string).length}/{max}</span>
                  </div>
                  {errors[key as keyof FormErrors] && <p className={styles.errorMsg}>⚠ {errors[key as keyof FormErrors]}</p>}
                </div>
              ))}
            </div>

            <div className={styles.formDivider} />

            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Master Quote Block</h3>
              </div>
              {([
                { key: "masterQuote"  as const, label: "Quote Text",  max: 250, rows: 2, ph: '"The beauty of Yoga is…"' },
                { key: "masterAttrib" as const, label: "Attribution", max: 100, rows: 0, ph: "e.g. — Yogi Chetan Mahesh Ji" },
              ]).map(({ key, label, max, rows, ph }) => (
                <div key={key} className={styles.fieldGroup}>
                  <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}<span className={styles.required}>*</span></label>
                  <div className={`${styles.inputWrap} ${errors[key as keyof FormErrors] ? styles.inputError : ""} ${(form[key] as string) && !errors[key as keyof FormErrors] ? styles.inputSuccess : ""}`}>
                    {rows > 0
                      ? <textarea className={`${styles.input} ${styles.textarea}`} placeholder={ph} value={form[key] as string} maxLength={max} rows={rows} onChange={(e) => set(key, e.target.value)} />
                      : <input type="text" className={styles.input} placeholder={ph} value={form[key] as string} maxLength={max} onChange={(e) => set(key, e.target.value)} />}
                    <span className={rows > 0 ? `${styles.charCount} ${styles.charCountBottom}` : styles.charCount}>{(form[key] as string).length}/{max}</span>
                  </div>
                  {errors[key as keyof FormErrors] && <p className={styles.errorMsg}>⚠ {errors[key as keyof FormErrors]}</p>}
                </div>
              ))}
            </div>

            <div className={styles.formDivider} />

            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Journey Paragraphs</h3>
                <span className={styles.sectionBadge}>{form.journeyParas.length}/8</span>
              </div>
              <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>Motivational body text shown below the master quote</p>
              <div className={styles.statsGrid}>
                {form.journeyParas.map((para, i) => (
                  <div key={i} className={`${styles.statRow} ${styles.journeyRow}`}>
                    <div className={styles.statIndex}>{i + 1}</div>
                    <div className={`${styles.inputWrap} ${styles.journeyInput}`}>
                      <textarea className={`${styles.input} ${styles.textarea}`}
                        placeholder={`Journey paragraph ${i + 1}…`} value={para.text} maxLength={500} rows={3}
                        onChange={(e) => updateJourney(i, e.target.value)} />
                      <span className={`${styles.charCount} ${styles.charCountBottom}`}>{para.text.length}/500</span>
                    </div>
                    <button type="button" className={styles.removeStatBtn}
                      onClick={() => removeJourney(i)} disabled={form.journeyParas.length <= 1}>✕</button>
                  </div>
                ))}
              </div>
              {form.journeyParas.length < 8 && (
                <button type="button" className={styles.addStatBtn} onClick={addJourney}>+ Add Paragraph</button>
              )}
            </div>

            <div className={styles.formDivider} />

            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>✦</span>
                <h3 className={styles.sectionTitle}>Closing Namaste Text</h3>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}><span className={styles.labelIcon}>✦</span>Closing Line<span className={styles.required}>*</span></label>
                <p className={styles.fieldHint}>Final text before "Namaste!" e.g. "May you always be happy, healthy and peaceful."</p>
                <div className={`${styles.inputWrap} ${errors.namesteText ? styles.inputError : ""} ${form.namesteText && !errors.namesteText ? styles.inputSuccess : ""}`}>
                  <input type="text" className={styles.input}
                    placeholder="e.g. May you always be happy, healthy and peaceful."
                    value={form.namesteText} maxLength={200}
                    onChange={(e) => set("namesteText", e.target.value)} />
                  <span className={styles.charCount}>{form.namesteText.length}/200</span>
                </div>
                {errors.namesteText && <p className={styles.errorMsg}>⚠ {errors.namesteText}</p>}
              </div>
            </div>
          </>
        )}

        <div className={styles.formDivider} />

        {/* Bottom Actions */}
        <div className={styles.formActionsRow}>
          <div className={styles.tabNavBtns}>
            {activeTab !== "alignment" && (
              <button type="button" className={styles.tabPrevBtn}
                onClick={() => setActiveTab(activeTab === "cta" ? "campus" : "alignment")}>← Previous</button>
            )}
            {activeTab !== "cta" && (
              <button type="button" className={styles.tabNextBtn}
                onClick={() => setActiveTab(activeTab === "alignment" ? "campus" : "cta")}>Next →</button>
            )}
          </div>
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/aymfullpage" className={styles.cancelBtn}>← Cancel</Link>
            <button type="button"
              className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""} ${!hasChanges ? styles.submitBtnDisabled : ""}`}
              onClick={handleSubmit} disabled={isSubmitting || !hasChanges}>
              {isSubmitting
                ? <><span className={styles.spinner} /> Saving…</>
                : <><span>✦</span> Update Content</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}