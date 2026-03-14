"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/assets/style/Admin/dashboard/yogacoursespage/Yogacoursessection.module.css";
// import api from "@/lib/api";

/* ─────────────────────── Types ─────────────────────── */
interface CourseRecord {
  _id: string;
  hours: string;
  days: string;
  name: string;
  style: string;
  duration: string;
  certificate: string;
  fee: string;
  color: string;
  img: string;
  createdAt: string;
  updatedAt: string;
}

interface TeacherRecord {
  _id: string;
  name: string;
  surname: string;
  designation?: string;
  experience?: string;
  imgUrl?: string;
  createdAt: string;
  updatedAt: string;
}

type CourseSort  = "name" | "certificate" | "updatedAt";
type TeacherSort = "name" | "updatedAt";
type SortDir     = "asc" | "desc";

/* ─────────────────────── Mock Data ─────────────────────── */
const MOCK_COURSES: CourseRecord[] = [
  { _id: "c1", hours: "100 HOUR YOGA", days: "14 Days Program", name: "Beginner Yoga Course",     style: "Ashtanga / Hatha",      duration: "14 Days", certificate: "100 Hour", fee: "500 USD / 550 USD",   color: "#8B5E3C", img: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=200&q=60", createdAt: "2024-01-10T08:00:00Z", updatedAt: "2025-03-01T10:00:00Z" },
  { _id: "c2", hours: "200 HOUR YOGA", days: "24 Days Program", name: "Foundation Yoga Course",   style: "Hatha / Ashtanga Yoga", duration: "24 Days", certificate: "200 RYT",  fee: "749 USD / 899 USD",   color: "#2D5A27", img: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=200&q=60", createdAt: "2024-01-12T08:00:00Z", updatedAt: "2025-03-04T12:00:00Z" },
  { _id: "c3", hours: "300 HOUR YOGA", days: "28 Days Program", name: "Intermediate Yoga Course", style: "Multi-Style Yoga",      duration: "28 Days", certificate: "300 RYT",  fee: "849 USD / 999 USD",   color: "#1A4A6B", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=60", createdAt: "2024-01-15T08:00:00Z", updatedAt: "2025-03-06T09:00:00Z" },
  { _id: "c4", hours: "500 HOUR YOGA", days: "56 Days Program", name: "Advanced Yoga Course",     style: "Hatha / Multi-Style",   duration: "56 Days", certificate: "500 RYT",  fee: "1649 USD / 1949 USD", color: "#7B3F00", img: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=200&q=60", createdAt: "2024-01-18T08:00:00Z", updatedAt: "2025-03-10T14:00:00Z" },
];

const MOCK_TEACHERS: TeacherRecord[] = [
  { _id: "t1", name: "Dr. Mahesh",  surname: "Bhatt",   designation: "Senior Yoga Teacher",      experience: "15+ Years", imgUrl: "", createdAt: "2024-01-10T08:00:00Z", updatedAt: "2025-02-20T10:00:00Z" },
  { _id: "t2", name: "Yogi Deepak", surname: "Bisht",   designation: "Multi-Style Yoga Teacher", experience: "12+ Years", imgUrl: "", createdAt: "2024-01-11T08:00:00Z", updatedAt: "2025-02-22T10:00:00Z" },
  { _id: "t3", name: "Dr. Hemlata", surname: "Saklani", designation: "Anatomy & Yoga Expert",    experience: "10+ Years", imgUrl: "", createdAt: "2024-01-12T08:00:00Z", updatedAt: "2025-02-25T10:00:00Z" },
  { _id: "t4", name: "Yogi Ajay",   surname: "Kumar",   designation: "Hatha Yoga Teacher",       experience: "8+ Years",  imgUrl: "", createdAt: "2024-01-13T08:00:00Z", updatedAt: "2025-02-28T10:00:00Z" },
];

/* ─────────────────────── Component ─────────────────────── */
export default function YogaCoursesSectionListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"courses" | "teachers">("courses");

  /* Courses */
  const [courses, setCourses]         = useState<CourseRecord[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseSearch, setCourseSearch]     = useState("");
  const [courseSortField, setCourseSortField] = useState<CourseSort>("updatedAt");
  const [courseSortDir, setCourseSortDir]     = useState<SortDir>("desc");

  /* Teachers */
  const [teachers, setTeachers]           = useState<TeacherRecord[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [teacherSearch, setTeacherSearch]     = useState("");
  const [teacherSortField, setTeacherSortField] = useState<TeacherSort>("updatedAt");
  const [teacherSortDir, setTeacherSortDir]     = useState<SortDir>("desc");

  /* Delete modal */
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "course" | "teacher"; label: string } | null>(null);
  const [deleting, setDeleting]         = useState(false);

  useEffect(() => {
    setTimeout(() => { setCourses(MOCK_COURSES);  setCoursesLoading(false);  }, 600);
    setTimeout(() => { setTeachers(MOCK_TEACHERS); setTeachersLoading(false); }, 800);
  }, []);

  /* ── Course helpers ── */
  const toggleCourseSort = (f: CourseSort) => {
    if (courseSortField === f) setCourseSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setCourseSortField(f); setCourseSortDir("asc"); }
  };
  const filteredCourses = courses
    .filter((c) =>
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.style.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.certificate.toLowerCase().includes(courseSearch.toLowerCase())
    )
    .sort((a, b) => {
      const av = a[courseSortField] as string;
      const bv = b[courseSortField] as string;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return courseSortDir === "asc" ? cmp : -cmp;
    });

  /* ── Teacher helpers ── */
  const toggleTeacherSort = (f: TeacherSort) => {
    if (teacherSortField === f) setTeacherSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setTeacherSortField(f); setTeacherSortDir("asc"); }
  };
  const filteredTeachers = teachers
    .filter((t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.surname.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.designation || "").toLowerCase().includes(teacherSearch.toLowerCase())
    )
    .sort((a, b) => {
      const av = teacherSortField === "name" ? `${a.name} ${a.surname}` : a.updatedAt;
      const bv = teacherSortField === "name" ? `${b.name} ${b.surname}` : b.updatedAt;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return teacherSortDir === "asc" ? cmp : -cmp;
    });

  /* ── Delete ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      if (deleteTarget.type === "course") {
        // await api.delete(`/courses/delete/${deleteTarget.id}`);
        setCourses((p) => p.filter((c) => c._id !== deleteTarget.id));
      } else {
        // await api.delete(`/teachers/delete/${deleteTarget.id}`);
        setTeachers((p) => p.filter((t) => t._id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const initials = (name: string, surname: string) =>
    `${name.replace(/[^A-Za-z]/g, "").charAt(0)}${surname.charAt(0)}`.toUpperCase();

  const SortIcon = ({ field, active, dir }: { field: string; active: string; dir: SortDir }) =>
    field === active
      ? <span className={styles.sortActive}>{dir === "asc" ? " ↑" : " ↓"}</span>
      : <span className={styles.sortInactive}> ⇅</span>;

  if (coursesLoading && teachersLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonField} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.breadcrumbLink} onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.breadcrumbSep}>›</span>
        <span className={styles.breadcrumbCurrent}>Yoga Courses &amp; Teachers</span>
      </div>

      {/* Header */}
      <div className={styles.listPageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Yoga Courses &amp; Teachers</h1>
          <p className={styles.pageSubtitle}>Manage all yoga teacher training courses and faculty</p>
        </div>
         <Link href="/admin/dashboard/yogacoursespage/add-new" className={styles.addBtn}>
          <span>✦</span> Add New {activeTab === "courses" ? "Course" : "Teacher"}
        </Link>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statPill}>
          <span className={styles.statPillIcon}>🧘</span>
          <span className={styles.statPillLabel}>Total Courses</span>
          <span className={styles.statPillVal}>{courses.length}</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillIcon}>👨‍🏫</span>
          <span className={styles.statPillLabel}>Total Teachers</span>
          <span className={styles.statPillVal}>{teachers.length}</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillIcon}>📜</span>
          <span className={styles.statPillLabel}>Certifications</span>
          <span className={styles.statPillVal}>{courses.length > 0 ? `${courses.length} levels` : "—"}</span>
        </div>
      </div>

      {/* List Tab Nav */}
      <div className={styles.listTabNav}>
        <button className={`${styles.listTabBtn} ${activeTab === "courses"  ? styles.listTabBtnActive : ""}`} onClick={() => setActiveTab("courses")}>
          🧘 Courses ({courses.length})
        </button>
        <button className={`${styles.listTabBtn} ${activeTab === "teachers" ? styles.listTabBtnActive : ""}`} onClick={() => setActiveTab("teachers")}>
          👨‍🏫 Teachers ({teachers.length})
        </button>
      </div>

      {/* ══════════ COURSES TABLE ══════════ */}
      {activeTab === "courses" && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input className={styles.searchInput}
                placeholder="Search by name, style, certificate…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)} />
              {courseSearch && <button className={styles.clearSearch} onClick={() => setCourseSearch("")}>✕</button>}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🪷</div>
              <h3 className={styles.emptyTitle}>{courseSearch ? "No courses found" : "No courses yet"}</h3>
              <p className={styles.emptyText}>{courseSearch ? "Try a different search term" : "Click 'Add New Course' to get started"}</p>
              {!courseSearch && <Link href="/admin/dashboard/yoga-courses/add-course" className={styles.emptyAddBtn}>+ Add First Course</Link>}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>#</th>
                    <th className={styles.th}>Image</th>
                    <th className={`${styles.th} ${styles.thSortable}`} onClick={() => toggleCourseSort("name")}>
                      Course Name <SortIcon field="name" active={courseSortField} dir={courseSortDir} />
                    </th>
                    <th className={styles.th}>Hours / Days</th>
                    <th className={styles.th}>Style</th>
                    <th className={`${styles.th} ${styles.thSortable}`} onClick={() => toggleCourseSort("certificate")}>
                      Certificate <SortIcon field="certificate" active={courseSortField} dir={courseSortDir} />
                    </th>
                    <th className={styles.th}>Fee</th>
                    <th className={styles.th}>Color</th>
                    <th className={`${styles.th} ${styles.thSortable}`} onClick={() => toggleCourseSort("updatedAt")}>
                      Updated <SortIcon field="updatedAt" active={courseSortField} dir={courseSortDir} />
                    </th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c, i) => (
                    <tr key={c._id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdNum}`}>{i + 1}</td>
                      <td className={styles.td}>
                        {c.img
                          ? <img src={c.img} alt={c.name} style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, border: "1.5px solid #e8d5b5" }} />
                          : <div style={{ width: 48, height: 36, borderRadius: 6, background: "#fdf6ec", border: "1.5px dashed #e8d5b5", display: "flex", alignItems: "center", justifyContent: "center" }}>🧘</div>
                        }
                      </td>
                      <td className={styles.td}>
                        <div className={styles.titleCell}>
                          <span className={styles.titleText}>{c.name}</span>
                          <span className={styles.subText}>{c.days}</span>
                        </div>
                      </td>
                      <td className={styles.td}><span className={styles.hoursBadge}>{c.hours}</span></td>
                      <td className={styles.td}><span className={styles.subText}>{c.style}</span></td>
                      <td className={`${styles.td} ${styles.tdCenter}`}><span className={styles.hoursBadge}>{c.certificate}</span></td>
                      <td className={styles.td}><span className={styles.feeBadge}>{c.fee}</span></td>
                      <td className={`${styles.td} ${styles.tdCenter}`}>
                        <span className={styles.colorDot} style={{ background: c.color }} title={c.color} />
                      </td>
                      <td className={`${styles.td} ${styles.tdDate}`}>{formatDate(c.updatedAt)}</td>
                      <td className={styles.td}>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} onClick={() => router.push(`/admin/dashboard/yoga-courses/edit-course/${c._id}`)}>✏️ Edit</button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ id: c._id, type: "course", label: c.name })}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredCourses.length > 0 && (
            <p className={styles.resultCount}>
              Showing {filteredCourses.length} of {courses.length} course{courses.length !== 1 ? "s" : ""}
              {courseSearch && ` matching "${courseSearch}"`}
            </p>
          )}
        </>
      )}

      {/* ══════════ TEACHERS TABLE ══════════ */}
      {activeTab === "teachers" && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input className={styles.searchInput}
                placeholder="Search by name or designation…"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)} />
              {teacherSearch && <button className={styles.clearSearch} onClick={() => setTeacherSearch("")}>✕</button>}
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🙏</div>
              <h3 className={styles.emptyTitle}>{teacherSearch ? "No teachers found" : "No teachers yet"}</h3>
              <p className={styles.emptyText}>{teacherSearch ? "Try a different search term" : "Click 'Add New Teacher' to get started"}</p>
              {!teacherSearch && <Link href="/admin/dashboard/yoga-courses/add-teacher" className={styles.emptyAddBtn}>+ Add First Teacher</Link>}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>#</th>
                    <th className={styles.th}>Photo</th>
                    <th className={`${styles.th} ${styles.thSortable}`} onClick={() => toggleTeacherSort("name")}>
                      Name <SortIcon field="name" active={teacherSortField} dir={teacherSortDir} />
                    </th>
                    <th className={styles.th}>Designation</th>
                    <th className={styles.th}>Experience</th>
                    <th className={`${styles.th} ${styles.thSortable}`} onClick={() => toggleTeacherSort("updatedAt")}>
                      Updated <SortIcon field="updatedAt" active={teacherSortField} dir={teacherSortDir} />
                    </th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t, i) => (
                    <tr key={t._id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdNum}`}>{i + 1}</td>
                      <td className={styles.td}>
                        {t.imgUrl
                          ? <img src={t.imgUrl} alt={`${t.name} ${t.surname}`} className={styles.teacherThumb} />
                          : <div className={styles.teacherThumbPlaceholder}>{initials(t.name, t.surname)}</div>
                        }
                      </td>
                      <td className={styles.td}>
                        <div className={styles.titleCell}>
                          <span className={styles.titleText}>{t.name} {t.surname}</span>
                        </div>
                      </td>
                      <td className={styles.td}><span className={styles.subText}>{t.designation || <span className={styles.naText}>—</span>}</span></td>
                      <td className={styles.td}>
                        {t.experience ? <span className={styles.hoursBadge}>{t.experience}</span> : <span className={styles.naText}>—</span>}
                      </td>
                      <td className={`${styles.td} ${styles.tdDate}`}>{formatDate(t.updatedAt)}</td>
                      <td className={styles.td}>
                        <div className={styles.actionBtns}>
                          <button className={styles.editBtn} onClick={() => router.push(`/admin/dashboard/yoga-courses/edit-teacher/${t._id}`)}>✏️ Edit</button>
                          <button className={styles.deleteBtn} onClick={() => setDeleteTarget({ id: t._id, type: "teacher", label: `${t.name} ${t.surname}` })}>🗑 Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredTeachers.length > 0 && (
            <p className={styles.resultCount}>
              Showing {filteredTeachers.length} of {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
              {teacherSearch && ` matching "${teacherSearch}"`}
            </p>
          )}
        </>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className={styles.modalBackdrop} onClick={() => !deleting && setDeleteTarget(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>{deleteTarget.type === "course" ? "🧘" : "👨‍🏫"}</div>
            <h3 className={styles.modalTitle}>Delete {deleteTarget.type === "course" ? "Course" : "Teacher"}?</h3>
            <p className={styles.modalText}>
              This will permanently remove <strong>"{deleteTarget.label}"</strong>. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className={styles.modalDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? <><span className={styles.spinner} /> Deleting…</> : `Delete ${deleteTarget.type === "course" ? "Course" : "Teacher"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}