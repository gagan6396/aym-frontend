"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/batches/Batches.module.css";
import api from "@/lib/api";

/* ─────────────── Types ─────────────── */
interface BatchRecord {
  _id: string;
  date: string;
  usd: string;
  inr: string;
  roomDorm: string;
  roomTwin: string;
  roomPrivate: string;
  bookedSeats: number;
  totalSeats: number;
  earlyBirdNote: string;
}

type SortField = "date" | "usd" | "inr";
type SortDir   = "asc" | "desc";

export default function BatchesList() {
  const router = useRouter();

  const [batches,    setBatches]    = useState<BatchRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [search,    setSearch]    = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir,   setSortDir]   = useState<SortDir>("asc");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);
  const [deleting,     setDeleting]     = useState(false);

  const toastFired = useRef(false);

  /* ── Fetch ── */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await api.get("/two-hundred-hour/batches/get");
        const data = (res.data?.data || []) as BatchRecord[];
        setBatches(data);

        if (!toastFired.current && data.length > 0) {
          toastFired.current = true;
          toast("Records exist — Edit or Delete before adding new.", {
            duration: 5000, icon: "⚠️",
            style: { background: "#92400e", color: "#fff", borderRadius: "10px", fontSize: "14px" },
          });
        }
      } catch (err: any) {
        setFetchError(err?.response?.data?.message || "Failed to load batches");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Sort / Filter ── */
  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(f); setSortDir("asc"); }
  };

  const filtered = batches
    .filter(b =>
      b.date.toLowerCase().includes(search.toLowerCase()) ||
      b.usd.toLowerCase().includes(search.toLowerCase())  ||
      b.inr.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/two-hundred-hour/batches/delete/${deleteTarget.id}`);
      setBatches(prev => prev.filter(b => b._id !== deleteTarget.id));
      toast.success(`"${deleteTarget.label}" deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  const SortIcon = ({ f }: { f: SortField }) =>
    sortField === f
      ? <span className={styles.sortActive}>{sortDir === "asc" ? " ↑" : " ↓"}</span>
      : <span className={styles.sortInactive}> ⇅</span>;

  /* ── Loading ── */
  if (loading) return (
    <div className={styles.page}>
      <div className={styles.skeletonHeader} />
      <div className={styles.skeletonCard}>
        {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonField} style={{ animationDelay: `${i * 0.1}s` }} />)}
      </div>
    </div>
  );

  /* ── Error ── */
  if (fetchError) return (
    <div className={styles.page}>
      <Toaster position="bottom-right" />
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⚠️</div>
        <h3 className={styles.emptyTitle}>Failed to load</h3>
        <p className={styles.emptyText}>{fetchError}</p>
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
        <span className={styles.bcCurrent}>Batches & Seats</span>
      </div>

      {/* Header */}
      <div className={styles.listHeader}>
        <div>
          <h1 className={styles.pageTitle}>Course Batches & Seats</h1>
          <p className={styles.pageSubtitle}>Manage 200hr course dates, pricing and seat availability</p>
        </div>
        <Link href="/admin/dashboard/twohundredhourpage/batches/add-new" className={styles.addNewBtn}>
          <span>✦</span> Add New Batch
        </Link>
      </div>

      {/* Ornament */}
      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        {[
          { icon: "📅", label: "Total Batches",  val: batches.length },
          { icon: "💺", label: "Total Seats",    val: batches.reduce((s, b) => s + b.totalSeats, 0) },
          { icon: "✅", label: "Booked Seats",   val: batches.reduce((s, b) => s + b.bookedSeats, 0) },
          { icon: "🪑", label: "Available",      val: batches.reduce((s, b) => s + Math.max(0, b.totalSeats - b.bookedSeats), 0) },
          { icon: "🔴", label: "Fully Booked",   val: batches.filter(b => b.bookedSeats >= b.totalSeats).length },
        ].map((s, i) => (
          <div key={i} className={styles.statPill}>
            <span>{s.icon}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statVal}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input className={styles.searchInput} placeholder="Search by date, USD fee, INR fee…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className={styles.clearSearch} onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <h3 className={styles.emptyTitle}>{search ? "No results found" : "No batches yet"}</h3>
          <p className={styles.emptyText}>{search ? "Try a different search term" : "Add your first course batch"}</p>
          {!search && (
            <Link href="/admin/dashboard/twohundredhourpage/batches/add-new" className={styles.emptyAddBtn}>
              + Add First Batch
            </Link>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>#</th>
                <th className={`${styles.th} ${styles.thSort}`} onClick={() => toggleSort("date")}>
                  Date <SortIcon f="date" />
                </th>
                <th className={`${styles.th} ${styles.thSort}`} onClick={() => toggleSort("usd")}>
                  FEE (USD) <SortIcon f="usd" />
                </th>
                <th className={`${styles.th} ${styles.thSort}`} onClick={() => toggleSort("inr")}>
                  FEE (Indian) <SortIcon f="inr" />
                </th>
                <th className={styles.th}>Room Price</th>
                <th className={styles.th}>Seats</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, i) => {
                const isFull      = b.bookedSeats >= b.totalSeats;
                const remaining   = b.totalSeats - b.bookedSeats;
                const fillPct     = Math.round((b.bookedSeats / b.totalSeats) * 100);
                return (
                  <tr key={b._id} className={styles.tr}>
                    <td className={`${styles.td} ${styles.tdNum}`}>{i + 1}</td>

                    {/* Date */}
                    <td className={styles.td}>
                      <span className={styles.dateText}>📅 {b.date}</span>
                      {b.earlyBirdNote && (
                        <span className={styles.earlyNote}>✦ {b.earlyBirdNote}</span>
                      )}
                    </td>

                    {/* FEE USD */}
                    <td className={styles.td}>
                      <span className={styles.feeBadge}>{b.usd}</span>
                    </td>

                    {/* FEE INR */}
                    <td className={styles.td}>
                      <span className={styles.feeInrBadge}>{b.inr}</span>
                    </td>

                    {/* Room Price */}
                    <td className={styles.td}>
                      <div className={styles.roomGrid}>
                        <span className={styles.roomItem}>Dorm <strong>${b.roomDorm}</strong></span>
                        <span className={styles.roomItem}>Twin <strong>${b.roomTwin}</strong></span>
                        <span className={styles.roomItem}>Pvt <strong>${b.roomPrivate}</strong></span>
                      </div>
                    </td>

                    {/* Seats */}
                    <td className={styles.td}>
                      <div className={styles.seatsWrap}>
                        <span className={styles.seatsText}>{b.bookedSeats} / {b.totalSeats}</span>
                        <div className={styles.seatsBar}>
                          <div className={styles.seatsBarFill}
                            style={{ width: `${fillPct}%`, background: isFull ? "#c44a00" : fillPct > 70 ? "#e07b00" : "#4a8c2a" }} />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className={`${styles.td} ${styles.tdCenter}`}>
                      {isFull
                        ? <span className={styles.badgeFull}>Fully Booked</span>
                        : <span className={styles.badgeAvail}>{remaining} left</span>
                      }
                    </td>

                    {/* Actions */}
                    <td className={styles.td}>
                      <div className={styles.actionBtns}>
                        <button className={styles.editBtn}
                          onClick={() => router.push(`/admin/dashboard/twohundredhourpage/batches/edit/${b._id}`)}>
                          ✏️ Edit
                        </button>
                        <button className={styles.deleteBtn}
                          onClick={() => setDeleteTarget({ id: b._id, label: b.date })}>
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 && (
        <p className={styles.resultCount}>
          Showing {filtered.length} of {batches.length} batch{batches.length !== 1 ? "es" : ""}
          {search && ` matching "${search}"`}
        </p>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className={styles.modalBackdrop} onClick={() => !deleting && setDeleteTarget(null)}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>📅</div>
            <h3 className={styles.modalTitle}>Delete Batch?</h3>
            <p className={styles.modalText}>
              Permanently remove <strong>"{deleteTarget.label}"</strong>?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className={styles.modalDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? <><span className={styles.spinner} /> Deleting…</> : "Delete Batch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}