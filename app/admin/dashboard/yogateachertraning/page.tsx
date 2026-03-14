"use client";

import { useState, useRef, useEffect } from "react";
import styles from "@/assets/style/Admin/dashboard/yogateachertraning/Homeabout.module.css";
import Link from "next/link";
// import api from "@/lib/api";

interface AboutSection {
  id: string;
  superTitle: string;
  mainTitle: string;
  statsCount: number;
  yogaStylesCount: number;
  ctaLink: string;
  status: "Active" | "Inactive";
  order: number;
}

function useBreakpoint() {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 480,
    isTablet: width >= 480 && width < 768,
    width,
  };
}

export default function HomeAboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);
  const { isMobile, isTablet, width } = useBreakpoint();
  const dragIndex = useRef<number | null>(null);

  const fetchSections = async () => {
    try {
      // const res = await api.get("/home-about");
      // if (res.data.success) { ... }

      // MOCK DATA — remove after API connected
      setSections([
        {
          id: "1",
          superTitle: "Yoga Teacher Training in Rishikesh",
          mainTitle: "Get Certified From the Oldest Yoga Teacher Training School in Rishikesh, India",
          statsCount: 4,
          yogaStylesCount: 6,
          ctaLink: "/yoga-teacher-training",
          status: "Active",
          order: 1,
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  /* ── Drag reorder ── */
  const handleDragStart = (i: number) => { dragIndex.current = i; };
  const handleDragEnter = (i: number) => {
    if (dragIndex.current === null || dragIndex.current === i) return;
    const arr = [...sections];
    const [moved] = arr.splice(dragIndex.current, 1);
    arr.splice(i, 0, moved);
    dragIndex.current = i;
    setSections(arr.map((s, idx) => ({ ...s, order: idx + 1 })));
  };
  const handleDragEnd = () => {
    dragIndex.current = null;
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  /* ── Move up/down ── */
  const moveUp = (i: number) => {
    if (i === 0) return;
    const arr = [...sections];
    [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
    setSections(arr.map((s, idx) => ({ ...s, order: idx + 1 })));
  };
  const moveDown = (i: number) => {
    if (i === sections.length - 1) return;
    const arr = [...sections];
    [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    setSections(arr.map((s, idx) => ({ ...s, order: idx + 1 })));
  };

  const toggleStatus = (id: string) =>
    setSections(sections.map((s) =>
      s.id === id ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" } : s
    ));

  const handleDelete = async () => {
    try {
      // await api.delete(`/home-about/delete/${deleteModal}`);
      setSections(
        sections
          .filter((s) => s.id !== deleteModal)
          .map((s, i) => ({ ...s, order: i + 1 }))
      );
      setDeleteModal(null);
    } catch (error) {
      console.log(error);
    }
  };

  /* ── Sub-components ── */
  const Status = ({ s }: { s: AboutSection }) => (
    <button
      className={`${styles.statusBadge} ${s.status === "Active" ? styles.statusActive : styles.statusInactive}`}
      onClick={() => toggleStatus(s.id)}
    >
      <span className={styles.statusDot} />{s.status}
    </button>
  );

  const Arrows = ({ i }: { i: number }) => (
    <div className={styles.arrowGroup}>
      <button className={styles.arrowBtn} onClick={() => moveUp(i)} disabled={i === 0}>▲</button>
      <button className={styles.arrowBtn} onClick={() => moveDown(i)} disabled={i === sections.length - 1}>▼</button>
    </div>
  );

  const Actions = ({ s }: { s: AboutSection }) => (
    <div className={styles.actionBtns}>
      <Link href={`homeabout/${s.id}`} className={styles.editBtn}>
        <span>✎</span><span className={styles.btnLabel}> Edit</span>
      </Link>
      <button className={styles.deleteBtn} onClick={() => setDeleteModal(s.id)}>
        <span>✕</span><span className={styles.btnLabel}> Delete</span>
      </button>
    </div>
  );

  /* ── Mobile Cards ── */
  const MobileCards = () => (
    <div className={styles.cardList}>
      {sections.map((s, i) => (
        <div
          key={s.id}
          className={styles.card}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragEnter={() => handleDragEnter(i)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardOrderBlock}>
              <span className={styles.orderBadge}>{s.order}</span>
              <Arrows i={i} />
            </div>
            <div className={styles.cardBody}>
              <p className={styles.sectionSuperTitle}>{s.superTitle}</p>
              <p className={styles.sectionMainTitle}>{s.mainTitle}</p>
              <div className={styles.cardMeta}>
                <span className={styles.metaChip}>📊 {s.statsCount} Stats</span>
                <span className={styles.metaChip}>🧘 {s.yogaStylesCount} Styles</span>
              </div>
              <div className={styles.cardTags}>
                <Status s={s} />
              </div>
            </div>
            <span className={styles.dragHandle}>⠿</span>
          </div>
          <div className={styles.cardFooter}><Actions s={s} /></div>
        </div>
      ))}
    </div>
  );

  /* ── Tablet Table ── */
  const TabletTable = () => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 52 }}>#</th>
            <th>Super Title</th>
            <th style={{ width: 100 }}>Stats</th>
            <th style={{ width: 100 }}>Status</th>
            <th style={{ width: 130 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s, i) => (
            <tr
              key={s.id}
              className={styles.row}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <td className={styles.tdOrder}>
                <span className={styles.orderBadge}>{s.order}</span>
                <Arrows i={i} />
              </td>
              <td>
                <p className={styles.sectionSuperTitle}>{s.superTitle}</p>
                <p className={styles.sectionMainTitle}>{s.mainTitle}</p>
              </td>
              <td className={styles.tdCenter}>
                <span className={styles.metaChip}>📊 {s.statsCount}</span>
              </td>
              <td className={styles.tdCenter}><Status s={s} /></td>
              <td className={styles.tdCenter}><Actions s={s} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ── Desktop Table ── */
  const DesktopTable = () => (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th style={{ width: 52 }}>#</th>
            <th style={{ width: 48 }}></th>
            <th>Super Title</th>
            <th>Main Title</th>
            {width >= 1024 && <th style={{ width: 120 }}>Content Info</th>}
            {width >= 1024 && <th style={{ width: 160 }}>CTA Link</th>}
            <th style={{ width: 110 }}>Status</th>
            <th style={{ width: 160 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sections.map((s, i) => (
            <tr
              key={s.id}
              className={styles.row}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnter={() => handleDragEnter(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
            >
              <td className={styles.tdCenter}>
                <span className={styles.orderBadge}>{s.order}</span>
              </td>
              <td>
                <div className={styles.dragGroup}>
                  <span className={styles.dragHandle}>⠿</span>
                  <Arrows i={i} />
                </div>
              </td>
              <td>
                <p className={styles.sectionSuperTitle}>{s.superTitle}</p>
              </td>
              <td>
                <p className={styles.sectionMainTitle}>{s.mainTitle}</p>
              </td>
              {width >= 1024 && (
                <td className={styles.tdCenter}>
                  <div className={styles.metaStack}>
                    <span className={styles.metaChip}>📊 {s.statsCount} Stats</span>
                    <span className={styles.metaChip}>🧘 {s.yogaStylesCount} Styles</span>
                  </div>
                </td>
              )}
              {width >= 1024 && (
                <td>
                  <span className={styles.ctaLinkText}>{s.ctaLink}</span>
                </td>
              )}
              <td className={styles.tdCenter}><Status s={s} /></td>
              <td className={styles.tdCenter}><Actions s={s} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className={styles.page}>

      {savedToast && (
        <div className={styles.toast}>✦ Order updated successfully</div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Home About Section</h1>
          <p className={styles.pageSubtitle}>
            {isMobile
              ? "Drag cards · tap arrows to reorder"
              : "Drag rows to reorder · click status to toggle"}
          </p>
        </div>
        <Link href="/admin/dashboard/yogateachertraning/add-new" className={styles.addBtn}>
          <span className={styles.addPlus}>+</span>
          <span className={styles.addLabel}>Add Section</span>
        </Link>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} />
        <span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {isMobile && <MobileCards />}
      {isTablet && <TabletTable />}
      {!isMobile && !isTablet && <DesktopTable />}

      {sections.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyOm}>ॐ</span>
          <p>No about sections found. Add your first section.</p>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal !== null && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalOm}>ॐ</div>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalText}>
              Are you sure you want to delete this section? This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteModal(null)}>
                Cancel
              </button>
              <button className={styles.modalConfirm} onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}