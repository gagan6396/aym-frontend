"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/assets/style/Admin/dashboard/testimonialsvideo/Testimonials.module.css";
import api from "@/lib/api";

/* ── Types ── */
interface VideoTestimonial {
  id: string;
  name: string;
  country: string;
  flag: string;
  youtubeId: string;
  quote: string;
  course: string;
  rating: number;
  status: "Active" | "Inactive";
  order: number;
}

/* ── Breakpoint hook ── */
function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const h = () => setWidth(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: width < 480, isTablet: width >= 480 && width < 768, width };
}

/* ── YouTube ID extractor ── */
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

function mapDoc(d: any): VideoTestimonial {
  return {
    id:        d._id,
    name:      d.name      ?? "",
    country:   d.country   ?? "",
    flag:      d.flag      ?? "🌍",
    youtubeId: d.youtubeId ?? getYoutubeId(d.youtubeUrl ?? ""),
    quote:     d.quote     ?? "",
    course:    d.course    ?? "",
    rating:    d.rating    ?? 5,
    status:    d.status    ?? "Active",
    order:     d.order     ?? 0,
  };
}

const StarsPreview = ({ count }: { count: number }) => (
  <span className={styles.starsPreview}>
    {"★".repeat(count)}{"☆".repeat(5 - count)}
  </span>
);

export default function VideoTestimonialsListPage() {
  const [list,        setList]        = useState<VideoTestimonial[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [isDeleting,  setIsDeleting]  = useState(false);
  const { isMobile, isTablet, width } = useBreakpoint();
  const dragIndex = useRef<number | null>(null);

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/testimonials/videos/all-videos");
      setList((res.data.data ?? []).map(mapDoc).sort((a: VideoTestimonial, b: VideoTestimonial) => a.order - b.order));
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Toggle status ── */
  const toggleStatus = async (r: VideoTestimonial) => {
    const newStatus = r.status === "Active" ? "Inactive" : "Active";
    setList(list.map((item) => item.id === r.id ? { ...item, status: newStatus } : item));
    try {
      await api.put(`/testimonials/videos/update-video/${r.id}`, { status: newStatus });
    } catch {
      setList(list.map((item) => item.id === r.id ? { ...item, status: r.status } : item));
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      setIsDeleting(true);
      await api.delete(`/testimonials/videos/delete-video/${deleteModal}`);
      setList(list.filter((r) => r.id !== deleteModal).map((r, i) => ({ ...r, order: i + 1 })));
      setDeleteModal(null);
      toast.success("✦ Video testimonial deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally { setIsDeleting(false); }
  };

  /* ── Drag reorder ── */
  const handleDragStart = (i: number) => { dragIndex.current = i; };
  const handleDragEnter = (i: number) => {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const arr = [...list];
    const [moved] = arr.splice(dragIndex.current, 1);
    arr.splice(i, 0, moved);
    dragIndex.current = i;
    setList(arr.map((r, idx) => ({ ...r, order: idx + 1 })));
  };
  const handleDragEnd = async () => {
    dragIndex.current = null;
    toast.success("✦ Order updated");
    try {
      await Promise.all(list.map((r) => api.put(`/testimonials/videos/update-video/${r.id}`, { order: r.order })));
    } catch { /* silent */ }
  };

  /* ── Arrow reorder ── */
  const moveUp = async (i: number) => {
    if (i === 0) return;
    const arr = [...list];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    const updated = arr.map((r, idx) => ({ ...r, order: idx + 1 }));
    setList(updated);
    toast.success("✦ Order updated");
    try {
      await Promise.all([
        api.put(`/testimonials/videos/update-video/${updated[i - 1].id}`, { order: updated[i - 1].order }),
        api.put(`/testimonials/videos/update-video/${updated[i].id}`,     { order: updated[i].order }),
      ]);
    } catch { /* silent */ }
  };

  const moveDown = async (i: number) => {
    if (i === list.length - 1) return;
    const arr = [...list];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    const updated = arr.map((r, idx) => ({ ...r, order: idx + 1 }));
    setList(updated);
    toast.success("✦ Order updated");
    try {
      await Promise.all([
        api.put(`/testimonials/videos/update-video/${updated[i].id}`,     { order: updated[i].order }),
        api.put(`/testimonials/videos/update-video/${updated[i + 1].id}`, { order: updated[i + 1].order }),
      ]);
    } catch { /* silent */ }
  };

  /* ── Sub-components ── */
  const Status = ({ r }: { r: VideoTestimonial }) => (
    <button className={`${styles.statusBadge} ${r.status === "Active" ? styles.statusActive : styles.statusInactive}`} onClick={() => toggleStatus(r)}>
      <span className={styles.statusDot} />{r.status}
    </button>
  );
  const Arrows = ({ i }: { i: number }) => (
    <div className={styles.arrowGroup}>
      <button className={styles.arrowBtn} onClick={() => moveUp(i)}   disabled={i === 0}>▲</button>
      <button className={styles.arrowBtn} onClick={() => moveDown(i)} disabled={i === list.length - 1}>▼</button>
    </div>
  );
  const Actions = ({ r }: { r: VideoTestimonial }) => (
    <div className={styles.actionBtns}>
      <Link href={`/admin/dashboard/testimonialsvideo/${r.id}`} className={styles.editBtn}>
        <span>✎</span><span className={styles.btnLabel}> Edit</span>
      </Link>
      <button className={styles.deleteBtn} onClick={() => setDeleteModal(r.id)}>
        <span>✕</span><span className={styles.btnLabel}> Delete</span>
      </button>
    </div>
  );

  if (isLoading) return (
    <div className={styles.successScreen}>
      <div className={styles.successCard}><div className={styles.successOm}>ॐ</div><p className={styles.successText}>Loading…</p></div>
    </div>
  );

  /* ── Mobile ── */
  const MobileCards = () => (
    <div className={styles.cardList}>
      {list.map((r, i) => {
        const vid = getYoutubeId(r.youtubeId);
        return (
          <div key={r.id} className={styles.card} draggable
            onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)}
            onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
            <div className={styles.cardHeader}>
              <div className={styles.cardOrderBlock}><span className={styles.orderBadge}>{r.order}</span><Arrows i={i} /></div>
              <div className={styles.cardBody}>
                <p className={styles.reviewName}>{r.name}</p>
                <p className={styles.reviewMeta}>{r.flag} {r.country} · {r.course}</p>
                <p className={styles.reviewQuotePreview}>{r.quote.replace(/<[^>]*>/g, "")}</p>
                {vid && <img src={`https://img.youtube.com/vi/${vid}/default.jpg`} alt="" className={styles.ytThumb} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                <div className={styles.cardTags}><Status r={r} /></div>
              </div>
              <span className={styles.dragHandle}>⠿</span>
            </div>
            <div className={styles.cardFooter}><Actions r={r} /></div>
          </div>
        );
      })}
    </div>
  );

  /* ── Desktop / Tablet ── */
  const Table = () => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 52 }}>#</th>
            {!isMobile && <th style={{ width: 48 }}></th>}
            <th style={{ width: 70 }}>Thumb</th>
            <th>Name</th>
            <th>Country / Course</th>
            {width >= 1024 && <th>Quote</th>}
            <th style={{ width: 90 }}>Rating</th>
            <th style={{ width: 110 }}>Status</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r, i) => {
            const vid = getYoutubeId(r.youtubeId);
            return (
              <tr key={r.id} className={styles.row} draggable
                onDragStart={() => handleDragStart(i)} onDragEnter={() => handleDragEnter(i)}
                onDragEnd={handleDragEnd} onDragOver={(e) => e.preventDefault()}>
                <td className={styles.tdCenter}><span className={styles.orderBadge}>{r.order}</span></td>
                {!isMobile && (
                  <td>
                    <div className={styles.dragGroup}><span className={styles.dragHandle}>⠿</span><Arrows i={i} /></div>
                  </td>
                )}
                <td className={styles.tdCenter}>
                  {vid
                    ? <img src={`https://img.youtube.com/vi/${vid}/default.jpg`} alt="" className={styles.ytThumb} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    : <div className={styles.avatarFallback}>{r.name.charAt(0)}</div>}
                </td>
                <td><p className={styles.reviewName}>{r.name}</p></td>
                <td>
                  <p className={styles.reviewMeta}>{r.flag} {r.country}</p>
                  <span className={styles.metaChip}>{r.course}</span>
                </td>
                {width >= 1024 && <td><p className={styles.reviewQuotePreview}>{r.quote.replace(/<[^>]*>/g, "")}</p></td>}
                <td className={styles.tdCenter}><StarsPreview count={r.rating} /></td>
                <td className={styles.tdCenter}><Status r={r} /></td>
                <td className={styles.tdCenter}><Actions r={r} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.page}>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: "#1f2937", color: "#fff", borderRadius: "10px", padding: "12px 16px", fontSize: "14px" } }} />

      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Video Testimonials</h1>
          <p className={styles.pageSubtitle}>Max 3 videos · drag to reorder · click status to toggle</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/admin/dashboard/testimonialstext" className={styles.cancelBtn}>✦ Text Reviews</Link>
          <Link href="/admin/dashboard/testimonialsvideo/add-new" className={styles.addBtn}>
            <span className={styles.addPlus}>+</span>
            <span className={styles.addLabel}>Add Video</span>
          </Link>
        </div>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Video count indicator */}
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1rem" }}>
        {[0, 1, 2].map((slot) => (
          <div key={slot} style={{
            width: 12, height: 12, borderRadius: "50%",
            background: list[slot] ? "var(--accent, #c9a96e)" : "var(--border, #e2d5c3)",
            border: "1.5px solid var(--accent, #c9a96e)",
          }} title={list[slot] ? list[slot].name : "Empty slot"} />
        ))}
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{list.length}/3 slots used</span>
      </div>

      {isMobile ? <MobileCards /> : <Table />}

      {list.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyOm}>ॐ</span>
          <p>No video testimonials yet. Add your first one.</p>
        </div>
      )}

      {deleteModal && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalOm}>ॐ</div>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalText}>Delete this video testimonial? This cannot be undone.</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}