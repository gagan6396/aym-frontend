"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/assets/style/Admin/dashboard/aymfullpage/AymFullPage.module.css";
import tableStyles from "@/assets/style/Admin/dashboard/aymfullpage/Aymfullpagetable.module.css";
// import api from "@/lib/api";

/* ══════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════ */
interface PageRecord {
  id:          string;
  sectionKey:  "alignment" | "campus" | "cta";
  alignTitle:  string;
  campusTitle: string;
  ctaHeading:  string;
  facilities:  number;   // count of campus facilities
  journeyParas: number;  // count of journey paragraphs
  bodyPlanes:  number;   // count of body planes
  promoCard1:  string;   // title of promo card 1
  promoCard2:  string;   // title of promo card 2
  bodyPlanesImageUrl: string;
  outdoorImageUrl:    string;
  status:      "Active" | "Inactive";
  createdAt:   string;
  updatedAt:   string;
}

/* ══════════════════════════════════════════════
   MOCK DATA — replace with real API
══════════════════════════════════════════════ */
const MOCK_RECORDS: PageRecord[] = [
  {
    id:          "1",
    sectionKey:  "alignment",
    alignTitle:  "Yoga Alliance's Alignment and Adjustment Certification course in India, at AYM",
    campusTitle: "Campus: AYM Yoga school / Yoga ashram in Rishikesh",
    ctaHeading:  "Begin Your Journey to Inner Peace",
    facilities:  12,
    journeyParas: 5,
    bodyPlanes:  3,
    promoCard1:  "Yoga for Beginners at AYM",
    promoCard2:  "Yoga in India Compared to Yoga Around the World",
    bodyPlanesImageUrl: "/uploads/alignment-diagram.jpg",
    outdoorImageUrl:    "/uploads/yoga-outdoor.webp",
    status:      "Active",
    createdAt:   "2025-03-08",
    updatedAt:   "2025-03-10",
  },
];

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const truncate = (s: string, n = 48) => (s.length > n ? s.slice(0, n) + "…" : s);

/* ══════════════════════════════════════════════
   LIST PAGE
══════════════════════════════════════════════ */
export default function AYMFullPageListPage() {
  const [records, setRecords]       = useState<PageRecord[]>([]);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Inactive">("All");

  /* Fetch */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const res = await api.get("/aym-full-page");
        // if (res.data.success) { setRecords(res.data.data); return; }
        setRecords(MOCK_RECORDS);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  /* Toggle status */
  const toggleStatus = async (id: string) => {
    // await api.patch(`/aym-full-page/toggle-status/${id}`);
    setRecords((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r));
  };

  /* Delete */
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      // await api.delete(`/aym-full-page/delete/${deleteModal}`);
      setRecords((prev) => prev.filter((r) => r.id !== deleteModal));
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (err) { console.error(err); }
    setDeleteModal(null);
  };

  /* Filter */
  const filtered = records.filter((r) => {
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q || r.alignTitle.toLowerCase().includes(q) || r.campusTitle.toLowerCase().includes(q) || r.ctaHeading.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  /* ─────────────────────── RENDER ─────────────────────── */
  return (
    <div className={styles.page}>

      {/* Toast */}
      {savedToast && <div className={styles.toast}>✦ Record deleted successfully</div>}

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>AYM Full Page</h1>
          <p className={styles.pageSubtitle}>
            Manage all content of the AYM Full page — Alignment · Campus Facilities · CTA
          </p>
        </div>
        <Link href="/admin/dashboard/aymfullpage/add-new" className={styles.addBtn}>
          <span className={styles.addPlus}>+</span>
          <span className={styles.addLabel}>Add New</span>
        </Link>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span>
        <div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* ── Filters Row ── */}
      <div className={tableStyles.filtersRow}>
        {/* Search */}
        <div className={tableStyles.searchWrap}>
          <span className={tableStyles.searchIcon}>🔍</span>
          <input
            type="text" className={tableStyles.searchInput}
            placeholder="Search by title, heading…"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className={tableStyles.searchClear} onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Status filter */}
        <div className={tableStyles.filterGroup}>
          {(["All", "Active", "Inactive"] as const).map((s) => (
            <button key={s}
              className={`${tableStyles.filterBtn} ${filterStatus === s ? tableStyles.filterBtnActive : ""}`}
              onClick={() => setFilterStatus(s)}>
              {s}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className={tableStyles.resultCount}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      {filtered.length > 0 ? (
        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th className={tableStyles.th} style={{ width: "2.5rem" }}>#</th>
                <th className={tableStyles.th}>Alignment Title</th>
                <th className={tableStyles.th}>Campus Title</th>
                <th className={tableStyles.th}>CTA Heading</th>
                <th className={tableStyles.th} style={{ width: "6rem" }}>Facilities</th>
                <th className={tableStyles.th} style={{ width: "6rem" }}>Planes</th>
                <th className={tableStyles.th} style={{ width: "6.5rem" }}>Journey §</th>
                <th className={tableStyles.th}>Promo Card 1</th>
                <th className={tableStyles.th}>Promo Card 2</th>
                <th className={tableStyles.th} style={{ width: "5.5rem" }}>Images</th>
                <th className={tableStyles.th} style={{ width: "6rem" }}>Status</th>
                <th className={tableStyles.th} style={{ width: "6.5rem" }}>Created</th>
                <th className={tableStyles.th} style={{ width: "6.5rem" }}>Updated</th>
                <th className={tableStyles.th} style={{ width: "8rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className={`${tableStyles.tr} ${idx % 2 === 0 ? tableStyles.trEven : ""}`}>

                  {/* # */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.indexBadge}>{idx + 1}</span>
                  </td>

                  {/* Alignment Title */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.cellTitle} title={r.alignTitle}>
                      {truncate(r.alignTitle, 52)}
                    </span>
                  </td>

                  {/* Campus Title */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.cellSubtitle} title={r.campusTitle}>
                      {truncate(r.campusTitle, 40)}
                    </span>
                  </td>

                  {/* CTA Heading */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.cellSubtitle} title={r.ctaHeading}>
                      {truncate(r.ctaHeading, 36)}
                    </span>
                  </td>

                  {/* Facilities count */}
                  <td className={tableStyles.td} style={{ textAlign: "center" }}>
                    <span className={tableStyles.countBadge}>{r.facilities}</span>
                  </td>

                  {/* Body Planes count */}
                  <td className={tableStyles.td} style={{ textAlign: "center" }}>
                    <span className={tableStyles.countBadge}>{r.bodyPlanes}</span>
                  </td>

                  {/* Journey Paras count */}
                  <td className={tableStyles.td} style={{ textAlign: "center" }}>
                    <span className={tableStyles.countBadge}>{r.journeyParas}</span>
                  </td>

                  {/* Promo Card 1 */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.promoBadge} title={r.promoCard1}>
                      {truncate(r.promoCard1, 30)}
                    </span>
                  </td>

                  {/* Promo Card 2 */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.promoBadge} title={r.promoCard2}>
                      {truncate(r.promoCard2, 30)}
                    </span>
                  </td>

                  {/* Images */}
                  <td className={tableStyles.td}>
                    <div className={tableStyles.imageThumbs}>
                      {r.bodyPlanesImageUrl && (
                        <div className={tableStyles.thumbWrap} title="Body Planes Diagram">
                          <img src={r.bodyPlanesImageUrl} alt="Body planes" className={tableStyles.thumb} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <span className={tableStyles.thumbLabel}>Diagram</span>
                        </div>
                      )}
                      {r.outdoorImageUrl && (
                        <div className={tableStyles.thumbWrap} title="Outdoor Photo">
                          <img src={r.outdoorImageUrl} alt="Outdoor" className={tableStyles.thumb} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          <span className={tableStyles.thumbLabel}>Outdoor</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className={tableStyles.td}>
                    <button
                      className={`${styles.statusBadge} ${r.status === "Active" ? styles.statusActive : styles.statusInactive}`}
                      onClick={() => toggleStatus(r.id)}
                      title="Click to toggle status"
                    >
                      <span className={styles.statusDot} />
                      {r.status}
                    </button>
                  </td>

                  {/* Created */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.dateBadge}>{fmt(r.createdAt)}</span>
                  </td>

                  {/* Updated */}
                  <td className={tableStyles.td}>
                    <span className={tableStyles.dateBadge}>{fmt(r.updatedAt)}</span>
                  </td>

                  {/* Actions */}
                  <td className={tableStyles.td}>
                    <div className={tableStyles.actionBtns}>
                      <Link href={`/admin/dashboard/aymfullpage/edit/${r.id}`} className={tableStyles.editBtnSm}>
                        ✎ Edit
                      </Link>
                      <button className={tableStyles.deleteBtnSm} onClick={() => setDeleteModal(r.id)}>
                        ✕
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.empty}>
          <span className={styles.emptyOm}>ॐ</span>
          <p>{search || filterStatus !== "All" ? "No records match your filters." : "No page content found. Add your first record."}</p>
        </div>
      )}

      {/* ── Stats Summary Row ── */}
      {records.length > 0 && (
        <div className={tableStyles.summaryRow}>
          <div className={tableStyles.summaryCard}>
            <span className={tableStyles.summaryIcon}>📋</span>
            <div>
              <p className={tableStyles.summaryNum}>{records.length}</p>
              <p className={tableStyles.summaryLabel}>Total Records</p>
            </div>
          </div>
          <div className={tableStyles.summaryCard}>
            <span className={tableStyles.summaryIcon}>✅</span>
            <div>
              <p className={tableStyles.summaryNum}>{records.filter((r) => r.status === "Active").length}</p>
              <p className={tableStyles.summaryLabel}>Active</p>
            </div>
          </div>
          <div className={tableStyles.summaryCard}>
            <span className={tableStyles.summaryIcon}>🏛️</span>
            <div>
              <p className={tableStyles.summaryNum}>{records.reduce((a, r) => a + r.facilities, 0)}</p>
              <p className={tableStyles.summaryLabel}>Total Facilities</p>
            </div>
          </div>
          <div className={tableStyles.summaryCard}>
            <span className={tableStyles.summaryIcon}>✨</span>
            <div>
              <p className={tableStyles.summaryNum}>{records.reduce((a, r) => a + r.journeyParas, 0)}</p>
              <p className={tableStyles.summaryLabel}>Journey Paragraphs</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalOm}>ॐ</div>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete this record? All page content, facility entries, and uploaded images will be permanently removed.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}