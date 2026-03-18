"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api";
import styles from "@/assets/style/Admin/dashboard/whyaymschool/Whyaym.module.css";

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface WhyAYMRecord {
  _id: string;
  superTitle: string;
  mainTitle: string;
  introPara: string;
  imageAlt: string;
  imageSrc: string;
  imgBadgeYear: string;
  imgQuote: string;
  sideFeatures: { title: string; desc: string }[];
  bottomFeatures: { title: string; desc: string }[];
  createdAt: string;
  updatedAt: string;
}

/* ══════════════════════════════════════════════
   BREAKPOINT HOOK
══════════════════════════════════════════════ */
function useBreakpoint() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return {
    isMobile: width < 480,
    isTablet: width >= 480 && width < 768,
    width,
  };
}

/* ══════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════ */
export default function WhyAYMListPage() {
  const [record, setRecord] = useState<WhyAYMRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { isMobile, isTablet, width } = useBreakpoint();

  /* ── Toast helper ── */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ══════════════════════════════════════════════
     FETCH  →  GET /why-aym/get-all-why-aym
     Backend returns single object (findOne)
  ══════════════════════════════════════════════ */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError(null);

      const res = await api.get("/why-aym/get-all-why-aym");
      /* Backend: { success: true, data: object | null } */
      setRecord(res.data.data || null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load data.";
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ══════════════════════════════════════════════
     DELETE  →  DELETE /why-aym/delete-why-aym/:id
  ══════════════════════════════════════════════ */
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      setIsDeleting(true);
      await api.delete(`/why-aym/delete-why-aym/${deleteModal}`);
      setRecord(null);
      setDeleteModal(null);
      showToast("✦ Section deleted successfully");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete.";
      setApiError(msg);
      setDeleteModal(null);
    } finally {
      setIsDeleting(false);
    }
  };

  /* ══════════════════════════════════════════════
     IMAGE URL HELPER
     DB mein /uploads/... stored hai → full URL banao
  ══════════════════════════════════════════════ */
  const getImageUrl = (src: string) => {
    if (!src) return "";
    if (src.startsWith("http")) return src;
    return `${process.env.NEXT_PUBLIC_API_URL}${src}`;
  };

  /* ══════════════════════════════════════════════
     SUB-COMPONENTS
  ══════════════════════════════════════════════ */
  const Actions = ({ r }: { r: WhyAYMRecord }) => (
    <div className={styles.actionBtns}>
      <Link
        href={`/admin/dashboard/whyaymschool/${r._id}`}
        className={styles.editBtn}
      >
        <span>✎</span>
        <span className={styles.btnLabel}> Edit</span>
      </Link>
      <button
        className={styles.deleteBtn}
        onClick={() => setDeleteModal(r._id)}
      >
        <span>✕</span>
        <span className={styles.btnLabel}> Delete</span>
      </button>
    </div>
  );

  /* ── Loading Screen ── */
  if (isLoading) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successOm}>ॐ</div>
          <p className={styles.successText}>Loading…</p>
        </div>
      </div>
    );
  }

  /* ── Mobile Card ── */
  const MobileCard = ({ r }: { r: WhyAYMRecord }) => (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardBody}>
          <p className={styles.blockLabel}>{r.superTitle}</p>
          {/* Main Title */}
          <p
            className={styles.sectionHeading}
            dangerouslySetInnerHTML={{ __html: r.mainTitle }}
          />
          {/* Intro Para */}
          <p
            className={styles.paraPreview}
            dangerouslySetInnerHTML={{ __html: r.introPara }}
          />
          {r.imageSrc && (
            <div className={styles.cardThumbRow}>
              <img
                src={getImageUrl(r.imageSrc)}
                alt={r.imageAlt}
                className={styles.cardThumb}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
          <div className={styles.cardMeta}>
            <span className={styles.metaChip}>
              🔷 {r.sideFeatures?.length ?? 0} Side
            </span>
            <span className={styles.metaChip}>
              🔲 {r.bottomFeatures?.length ?? 0} Bottom
            </span>
            {r.imgBadgeYear && (
              <span className={styles.metaChip}>{r.imgBadgeYear}</span>
            )}
          </div>
        </div>
      </div>
      <div className={styles.cardFooter}>
        <Actions r={r} />
      </div>
    </div>
  );

  /* ── Tablet Table ── */
  const TabletTable = ({ r }: { r: WhyAYMRecord }) => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 160 }}>Super Title</th>
            <th>Main Title</th>
            <th>Intro Para</th>
            <th style={{ width: 110 }}>Features</th>
            <th style={{ width: 140 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.row}>
            <td>
              <p className={styles.blockLabel}>{r.superTitle}</p>
            </td>
            <td>
              <p
                className={styles.sectionHeading}
                dangerouslySetInnerHTML={{ __html: r.mainTitle }}
              />
            </td>
            <td>
              <p
                className={styles.paraPreview}
                dangerouslySetInnerHTML={{ __html: r.introPara }}
              />
            </td>
            <td className={styles.tdCenter}>
              <div className={styles.metaStack}>
                <span className={styles.metaChip}>
                  🔷 {r.sideFeatures?.length ?? 0}
                </span>
                <span className={styles.metaChip}>
                  🔲 {r.bottomFeatures?.length ?? 0}
                </span>
              </div>
            </td>
            <td className={styles.tdCenter}>
              <Actions r={r} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  /* ── Desktop Table ── */
  const DesktopTable = ({ r }: { r: WhyAYMRecord }) => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 60 }}>Image</th>
            <th style={{ width: 160 }}>Super Title</th>
            <th style={{ width: 220 }}>Main Title</th>
            <th>Intro Para</th>
            {width >= 1024 && (
              <th style={{ width: 130 }}>Features</th>
            )}
            {width >= 1024 && (
              <th style={{ width: 160 }}>Image Quote</th>
            )}
            {width >= 1024 && (
              <th style={{ width: 100 }}>Badge Year</th>
            )}
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className={styles.row}>
            <td className={styles.tdCenter}>
              {r.imageSrc && (
                <img
                  src={getImageUrl(r.imageSrc)}
                  alt={r.imageAlt}
                  className={styles.thumbTiny}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </td>
            <td>
              <p className={styles.blockLabel}>{r.superTitle}</p>
            </td>
            <td>
              <p
                className={styles.sectionHeading}
                dangerouslySetInnerHTML={{ __html: r.mainTitle }}
              />
            </td>
            <td>
              <p
                className={styles.paraPreview}
                dangerouslySetInnerHTML={{ __html: r.introPara }}
              />
            </td>
            {width >= 1024 && (
              <td className={styles.tdCenter}>
                <div className={styles.metaStack}>
                  <span className={styles.metaChip}>
                    🔷 {r.sideFeatures?.length ?? 0} Side
                  </span>
                  <span className={styles.metaChip}>
                    🔲 {r.bottomFeatures?.length ?? 0} Bottom
                  </span>
                </div>
              </td>
            )}
            {width >= 1024 && (
              <td>
                {r.imgQuote && (
                  <p className={styles.paraPreview}>
                    &ldquo;{r.imgQuote}&rdquo;
                  </p>
                )}
              </td>
            )}
            {width >= 1024 && (
              <td className={styles.tdCenter}>
                {r.imgBadgeYear && (
                  <span className={styles.metaChip}>{r.imgBadgeYear}</span>
                )}
              </td>
            )}
            <td className={styles.tdCenter}>
              <Actions r={r} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className={styles.page}>

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Why AYM Section</h1>
          <p className={styles.pageSubtitle}>
            {record
              ? "Section exists — edit or delete below"
              : "No section yet — add one to get started"}
          </p>
        </div>

        {/* Add button sirf tab dikhao jab record nahi hai
            (backend ek hi record allow karta hai) */}
        {!record && (
          <Link
            href="/admin/dashboard/whyaymschool/add-new"
            className={styles.addBtn}
          >
            <span className={styles.addPlus}>+</span>
            <span className={styles.addLabel}>Add Section</span>
          </Link>
        )}
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

      {/* ── Content ── */}
      {record ? (
        <>
          {isMobile && <MobileCard r={record} />}
          {isTablet && <TabletTable r={record} />}
          {!isMobile && !isTablet && <DesktopTable r={record} />}
        </>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyOm}>ॐ</span>
          <p>No Why AYM section found. Add your first section.</p>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteModal !== null && (
        <div
          className={styles.modalOverlay}
          onClick={() => !isDeleting && setDeleteModal(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalOm}>ॐ</div>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalText}>
              Delete this Why AYM section? All features and image data will
              be removed permanently.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalCancel}
                onClick={() => setDeleteModal(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirm}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}