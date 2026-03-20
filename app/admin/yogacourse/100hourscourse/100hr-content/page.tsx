// FILE: src/app/admin/dashboard/100hr-content/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import styles from "@/assets/style/Admin/yogacourse/100hourscourse/Contentmodule.module.css";

interface ContentData {
  _id?: string;
  heroTitle: string;
  heroText: string;
  transformTitle: string;
  transformPara1: string;
  transformPara2: string;
  whatIsTitle: string;
  whatIsPara: string;
  whyChooseTitle: string;
  whyChoosePara: string;
  suitableTitle: string;
  suitableItems: string[];
  syllabusTitle: string;
  syllabusPara1: string;
  syllabusPara2: string;
  syllabusPara3: string;
  syllabusLeft: { title: string; desc: string }[];
  syllabusRight: { title: string; desc: string }[];
  enrollTitle: string;
  enrollPara: string;
  enrollItems: string[];
  certTitle: string;
  certPara: string;
  registrationTitle: string;
  registrationPara: string;
  includedItems: string[];
  notIncludedItems: string[];
  tableNote: string;
}

export default function ContentListPage() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  const fetchContent = async () => {
    try {
      const res = await api.get("/100hr-content/get");
      setContent(res.data.data ?? null);
    } catch {
      toast.error("Failed to fetch content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContent(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete("/100hr-content/delete");
      setContent(null);
      setDeleteModal(false);
      toast.success("Content deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className={styles.page}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>100 Hour — Page Content</h1>
          <p className={styles.pageSubtitle}>Manage all content sections of the 100 Hour YTT page</p>
        </div>
        <Link
          href="/admin/yogacourse/100hourscourse/100hr-content/add-new"
          className={`${styles.addBtn} ${content ? styles.disabledBtn : ""}`}
          onClick={e => {
            if (content) {
              e.preventDefault();
              toast.error("Content already exists. Edit or delete it first.");
            }
          }}
        >
          <span className={styles.addPlus}>+</span>
          <span className={styles.addLabel}>Add Content</span>
        </Link>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} />
        <span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {!content ? (
        <div className={styles.empty}>
          <span className={styles.emptyOm}>ॐ</span>
          <p>No content found. Add your first page content.</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Hero Title</th>
                <th>Syllabus Modules</th>
                <th>Enrol Items</th>
                <th>Included Items</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.row}>
                <td>
                  <div className={styles.titlePreview}>{content.heroTitle}</div>
                </td>
                <td className={styles.tdCenter}>
                  <span className={styles.metaChip}>
                    Left: {content.syllabusLeft?.length ?? 0}
                  </span>
                  <span className={styles.metaChip}>
                    Right: {content.syllabusRight?.length ?? 0}
                  </span>
                </td>
                <td className={styles.tdCenter}>
                  <span className={styles.metaChip}>{content.enrollItems?.length ?? 0} items</span>
                </td>
                <td className={styles.tdCenter}>
                  <span className={styles.metaChip}>{content.includedItems?.length ?? 0} included</span>
                  <span className={styles.metaChipRed}>{content.notIncludedItems?.length ?? 0} excluded</span>
                </td>
                <td>
                  <div className={styles.actionBtns}>
                    <Link href="/admin/dashboard/100hr-content/edit" className={styles.editBtn}>
                      ✎ Edit
                    </Link>
                    <button className={styles.deleteBtn} onClick={() => setDeleteModal(true)}>
                      ✕ Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {deleteModal && (
        <div className={styles.modalOverlay} onClick={() => setDeleteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalOm}>ॐ</div>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalText}>Are you sure you want to delete all page content?</p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}