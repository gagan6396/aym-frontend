"use client";
// ══════════════════════════════════════════════════════════════════
//  ContentPart1_List.tsx
//  200hr Admin — Hero, Transform, WhatIs, WhyChoose, Suitable, WhyEnrol
// ══════════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/content-part1/ContentPart1.module.css";
import api from "@/lib/api";

interface ContentPart1Data {
  _id: string;
  heroTitle: string;
  heroDesc: string;
  transformTitle: string;
  transformParas: string[];
  whatIsTitle: string;
  whatIsParas: string[];
  whyChooseTitle: string;
  whyChooseParas: string[];
  suitableTitle: string;
  suitableItems: string[];
  whyEnrolTitle: string;
  whyEnrolItems: string[];
  createdAt: string;
  updatedAt: string;
}

function strip(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function ContentPart1List() {
  const router = useRouter();
  const [data,      setData]      = useState<ContentPart1Data | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [fetchErr,  setFetchErr]  = useState<string | null>(null);
  const [showDel,   setShowDel]   = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/two-hundred-hour/content-part1/get");
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
      await api.delete("/two-hundred-hour/content-part1/delete");
      setData(null);
      setShowDel(false);
      toast.success("Content Part 1 deleted.");
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
      <div className={styles.skeletonCard}>
        {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonField} style={{ animationDelay: `${i * 0.1}s` }} />)}
      </div>
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
        <span className={styles.bcCurrent}>Content Part 1</span>
      </div>

      <div className={styles.listHeader}>
        <div>
          <h1 className={styles.pageTitle}>Content Part 1 — Hero &amp; Sections</h1>
          <p className={styles.pageSubtitle}>Hero title, Transform, What is YTT, Why Choose, Suitable For, Why Enrol</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {data && (
            <button onClick={() => setShowDel(true)} className={styles.deletepageBtn}>🗑 Delete</button>
          )}
          <Link
            href="/admin/dashboard/twohundredhourpage/content-part1/add-new"
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
          <div className={styles.emptyIcon}>📝</div>
          <h3 className={styles.emptyTitle}>No content yet</h3>
          <p className={styles.emptyText}>Add hero and section content for the 200hr page.</p>
          <Link href="/admin/dashboard/twohundredhourpage/content-part1/add-new" className={styles.emptyAddBtn}>
            + Add Content Part 1
          </Link>
        </div>
      ) : (
        <>
          {/* Meta row */}
          <div className={styles.metaRow}>
            <span className={styles.metaPill}>🕐 Created: {fmtDate(data.createdAt)}</span>
            <span className={styles.metaPill}>✏️ Updated: {fmtDate(data.updatedAt)}</span>
          </div>

          {/* Content preview cards */}
          <div className={styles.previewGrid}>

            {/* Hero */}
            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}>
                <span className={styles.previewCardIcon}>🏔</span>
                <span className={styles.previewCardTitle}>Hero Section</span>
              </div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.heroTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Description</span><span className={styles.previewVal}>{strip(data.heroDesc).slice(0, 100)}{strip(data.heroDesc).length > 100 ? "…" : ""}</span></div>
              </div>
            </div>

            {/* Transform */}
            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>🌿</span><span className={styles.previewCardTitle}>Transform Your Practice</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.transformTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Paragraphs</span><span className={styles.previewCount}>{data.transformParas?.length || 0} added</span></div>
              </div>
            </div>

            {/* What Is */}
            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>❓</span><span className={styles.previewCardTitle}>What is a 100 Hour YTT?</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.whatIsTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Paragraphs</span><span className={styles.previewCount}>{data.whatIsParas?.length || 0} added</span></div>
              </div>
            </div>

            {/* Why Choose */}
            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>🏫</span><span className={styles.previewCardTitle}>Why Choose AYM</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.whyChooseTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>Paragraphs</span><span className={styles.previewCount}>{data.whyChooseParas?.length || 0} added</span></div>
              </div>
            </div>

            {/* Suitable For */}
            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>👥</span><span className={styles.previewCardTitle}>Suitable For</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.suitableTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>List Items</span><span className={styles.previewCount}>{data.suitableItems?.length || 0} items</span></div>
              </div>
            </div>

            {/* Why Enrol */}
            <div className={styles.previewCard}>
              <div className={styles.previewCardHeader}><span className={styles.previewCardIcon}>✅</span><span className={styles.previewCardTitle}>Why Enrol in AYM</span></div>
              <div className={styles.previewCardBody}>
                <div className={styles.previewRow}><span className={styles.previewKey}>Title</span><span className={styles.previewVal}>{strip(data.whyEnrolTitle) || "—"}</span></div>
                <div className={styles.previewRow}><span className={styles.previewKey}>List Items</span><span className={styles.previewCount}>{data.whyEnrolItems?.length || 0} items</span></div>
              </div>
            </div>

          </div>

          {/* Edit button */}
          <div style={{ marginTop: "1.5rem" }}>
            <button className={styles.editBtnLg}
              onClick={() => router.push("/admin/dashboard/twohundredhourpage/content-part1/edit")}>
              ✏️ Edit Content Part 1
            </button>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {showDel && (
        <div className={styles.modalBackdrop} onClick={() => !deleting && setShowDel(false)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>🗑️</div>
            <h3 className={styles.modalTitle}>Delete Content Part 1?</h3>
            <p className={styles.modalText}>This will permanently delete all Hero &amp; Sections content.</p>
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