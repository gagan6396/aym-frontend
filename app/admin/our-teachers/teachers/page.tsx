"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/assets/style/Admin/our-teachers/Teacher.module.css";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Teacher {
  _id: string;
  name: string;
  role: string;
  years: string;
  image: string;
  bio: string[];
  education: string[];
  expertise: string[];
  isGuest: boolean;
  order?: number;
}

export default function TeacherListPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tab, setTab] = useState<"faculty" | "guest">("faculty");

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers/get-all-teachers");
      setTeachers(res.data.data || []);
    } catch {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/teachers/delete-teacher/${deleteId}`);
      setTeachers((prev) => prev.filter((t) => t._id !== deleteId));
      setDeleteId(null);
      toast.success("Teacher removed successfully");
    } catch {
      toast.error("Failed to delete teacher");
    }
  };

  const faculty = teachers.filter((t) => !t.isGuest);
  const guest   = teachers.filter((t) => t.isGuest);
  const displayed = tab === "faculty" ? faculty : guest;

  /* ── Loading ── */
  if (loading) return (
    <div className={styles.page}>
      <div className={styles.loadingState}>
        <div className={styles.loadingOm}>ॐ</div>
        <p className={styles.loadingText}>Loading teachers…</p>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Our Teachers</h1>
          <p className={styles.pageSubtitle}>
            Manage faculty &amp; guest teachers displayed on the Teachers page
          </p>
        </div>
        <Link href="/admin/our-teachers/teachers/add-new" className={styles.primaryBtn}>
          + Add Teacher
        </Link>
      </div>

      {/* Ornament */}
      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} />
        <span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Tabs */}
      <div className={styles.tabsRow}>
        <button
          className={`${styles.tab} ${tab === "faculty" ? styles.tabActive : ""}`}
          onClick={() => setTab("faculty")}
        >
          Teaching Faculty
          <span className={styles.tabCount}>{faculty.length}</span>
        </button>
        <button
          className={`${styles.tab} ${tab === "guest" ? styles.tabActive : ""}`}
          onClick={() => setTab("guest")}
        >
          Guest &amp; Visiting
          <span className={styles.tabCount}>{guest.length}</span>
        </button>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{teachers.length}</span>
          <span className={styles.statLbl}>Total</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{faculty.length}</span>
          <span className={styles.statLbl}>Faculty</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{guest.length}</span>
          <span className={styles.statLbl}>Guest</span>
        </div>
      </div>

      {/* Empty */}
      {displayed.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyOm}>ॐ</div>
          <p className={styles.emptyText}>
            No {tab === "faculty" ? "faculty" : "guest"} teachers found.
          </p>
          <Link href="/admin/our-teachers/teachers/add-new" className={styles.emptyBtn}>
            + Add Teacher
          </Link>
        </div>
      )}

      {/* Table */}
      {displayed.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thPhoto}>Photo</th>
                <th>Name</th>
                <th className={styles.hideMobile}>Role</th>
                <th className={styles.hideTablet}>Experience</th>
                <th className={styles.hideDesktop}>Expertise</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((t) => (
                <tr key={t._id} className={styles.tableRow}>
                  <td>
                    <div className={styles.avatarWrap}>
                      <img src={t.image} alt={t.name} className={styles.avatar} />
                    </div>
                  </td>
                  <td>
                    <div className={styles.nameCell}>
                      <span className={styles.teacherName}>{t.name}</span>
                      {t.isGuest
                        ? <span className={styles.teacherRoleSub}>Guest Teacher</span>
                        : <span className={styles.teacherRoleSub}>{t.role}</span>
                      }
                    </div>
                  </td>
                  <td className={styles.hideMobile}>
                    {t.isGuest
                      ? <span className={styles.guestBadge}>✨ Guest</span>
                      : <span className={styles.roleTag}>{t.role}</span>
                    }
                  </td>
                  <td className={styles.hideTablet}>
                    {t.years
                      ? <span className={styles.yearsBadge}>{t.years}</span>
                      : <span className={styles.guestBadge}>Visiting</span>
                    }
                  </td>
                  <td className={styles.hideDesktop}>
                    <div className={styles.expertiseChips}>
                      {t.expertise?.slice(0, 3).map((e, i) => (
                        <span key={i} className={styles.chip}>{e}</span>
                      ))}
                      {(t.expertise?.length ?? 0) > 3 && (
                        <span className={styles.chipMore}>+{t.expertise.length - 3}</span>
                      )}
                      {(!t.expertise || t.expertise.length === 0) && (
                        <span className={styles.guestBadge}>Guest</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <Link
                        href={`/admin/dashboard/teachers/edit/${t._id}`}
                        className={styles.editBtn}
                      >
                        ✎ Edit
                      </Link>
                      <button className={styles.deleteBtn} onClick={() => setDeleteId(t._id)}>
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className={styles.modalOverlay} onClick={() => setDeleteId(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalOm}>ॐ</div>
            <h3 className={styles.modalTitle}>Confirm Deletion</h3>
            <p className={styles.modalText}>
              Are you sure you want to remove this teacher? This cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setDeleteId(null)}>Cancel</button>
              <button className={styles.modalConfirm} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}