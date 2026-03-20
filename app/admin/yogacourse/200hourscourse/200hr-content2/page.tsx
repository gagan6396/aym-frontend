"use client";
// ═══════════════════════════════════════════════════════════
//  ContentPart2_List.tsx
//  200hr Admin — Syllabus, Schedule, Cert, Reg, Included
// ═══════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/content-part2/ContentPart2.module.css";
import api from "@/lib/api";

interface ContentPart2Data {
  _id: string;
  syllabusTitle: string;
  syllabusDesc: string[];
  syllabusModules: { title: string; desc: string }[];
  scheduleItems: { time: string; activity: string; link?: string }[];
  certTitle: string;
  certParas: string[];
  regTitle: string;
  regDesc: string;
  included: string[];
  notIncluded: string[];
  createdAt: string;
  updatedAt: string;
}

function strip(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ContentPart2List() {
  const router = useRouter();
  const [data,     setData]     = useState<ContentPart2Data | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
  const [showDel,  setShowDel]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/two-hundred-hour/content-part2/get");
        setData(res.data?.data || null);
      } catch (err: any) {
        setFetchErr(err?.response?.data?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete("/two-hundred-hour/content-part2/delete");
      setData(null);
      setShowDel(false);
      toast.success("Content Part 2 deleted.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  if (loading) return (
    <div className={styles.page}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonCard}>{[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonField} style={{ animationDelay: `${i * 0.1}s` }} />)}</div>
    </div>
  );
  if (fetchErr) return (
    <div className={styles.page}>
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⚠️</div>
        <h3 className={styles.emptyTitle}>Failed to load</h3>
        <p className={styles.emptyText}>{fetchErr}</p>
        <button className={styles.retryBtn} onClick={() => window.location.reload()}>↺ Retry</button>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: "#1f2937", color: "#fff", borderRadius: "10px", fontSize: "14px" } }} />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard/twohundredhourpage")}>200 Hour</button>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcCurrent}>Content Part 2</span>
      </div>

      <div className={styles.listHeader}>
        <div>
          <h1 className={styles.pageTitle}>Content Part 2 — Syllabus, Schedule &amp; Fee</h1>
          <p className={styles.pageSubtitle}>Syllabus, Daily Schedule, Certification, Registration, Included/Not Included</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {data && (
            <button onClick={() => setShowDel(true)} className={styles.deletepageBtn}>🗑 Delete</button>
          )}
          <Link
            href="/admin/dashboard/twohundredhourpage/content-part2/add-new"
            className={`${styles.addNewBtn} ${data ? styles.disabledBtn : ""}`}
            onClick={e => {
              if (data) {
                e.preventDefault();
                toast.error("Content already exists. Edit or Delete first.", {
                  style: { background: "#7f1d1d", color: "#fff", borderRadius: "10px", fontSize: "14px" },
                });
              }
            }}>
            <span>✦</span> Add Content
          </Link>
        </div>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {!data ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3 className={styles.emptyTitle}>No content yet</h3>
          <p className={styles.emptyText}>Add syllabus, schedule and fee content for the 200hr page.</p>
          <Link href="/admin/dashboard/twohundredhourpage/content-part2/add-new" className={styles.emptyAddBtn}>
            + Add Content Part 2
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.metaRow}>
            <span className={styles.metaPill}>🕐 Created: {fmtDate(data.createdAt)}</span>
            <span className={styles.metaPill}>✏️ Updated: {fmtDate(data.updatedAt)}</span>
          </div>

          <div className={styles.previewGrid}>

            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>📖</span><span className={styles.previewCardTitle}>Syllabus</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.syllabusTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Desc Paras</span><span className={styles.previewCount}>{data.syllabusDesc?.length || 0}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Modules</span><span className={styles.previewCount}>{data.syllabusModules?.length || 0} modules</span></div>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>🕐</span><span className={styles.previewCardTitle}>Daily Schedule</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Items</span><span className={styles.previewCount}>{data.scheduleItems?.length || 0} entries</span></div>
                {data.scheduleItems?.[0] && <div className={styles.previewRow}><span className={styles.previewKey}>First</span><span className={styles.previewVal}>{data.scheduleItems[0].time}</span></div>}
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>🎓</span><span className={styles.previewCardTitle}>Certification</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.certTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Paragraphs</span><span className={styles.previewCount}>{data.certParas?.length || 0}</span></div>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>📝</span><span className={styles.previewCardTitle}>Registration</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.regTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Description</span><span className={styles.previewVal}>{strip(data.regDesc).slice(0, 60)}{strip(data.regDesc).length > 60 ? "…" : ""}</span></div>
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>✅</span><span className={styles.previewCardTitle}>Included in Fee</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Items</span><span className={styles.previewCount}>{data.included?.length || 0} items</span></div>
                {data.included?.[0] && <div className={styles.previewRow}><span className={styles.previewKey}>First</span><span className={styles.previewVal}>{data.included[0].slice(0, 50)}…</span></div>}
              </div>
            </div>

            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>❌</span><span className={styles.previewCardTitle}>Not Included</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Items</span><span className={styles.previewCount}>{data.notIncluded?.length || 0} items</span></div>
                {data.notIncluded?.[0] && <div className={styles.previewRow}><span className={styles.previewKey}>First</span><span className={styles.previewVal}>{data.notIncluded[0].slice(0, 50)}…</span></div>}
              </div>
            </div>

          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button className={styles.editBtnLg}
              onClick={() => router.push("/admin/dashboard/twohundredhourpage/content-part2/edit")}>
              ✏️ Edit Content Part 2
            </button>
          </div>
        </>
      )}

      {showDel && (
        <div className={styles.modalBackdrop} onClick={() => !deleting && setShowDel(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3 className={styles.modalTitle}>Delete Content Part 2?</h3>
            <p className={styles.modalText}>This will permanently delete Syllabus, Schedule, Certification, Registration, Included &amp; Not Included content.</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setShowDel(false)} disabled={deleting}>Cancel</button>
              <button className={styles.modalDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? <><span className={styles.spinner} /> Deleting…</> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}