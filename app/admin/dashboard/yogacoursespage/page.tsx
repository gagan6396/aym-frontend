"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/assets/style/Admin/dashboard/yogacoursespage/Yogacoursessection.module.css";
import api from "@/lib/api";

/* ─────────────────────── Types ─────────────────────── */
interface CourseRecord {
  _id: string;
  hours: string;
  days: string;
  name: string;
  style: string;
  duration: string;
  certificate: string;
  feeShared: string;
  feePrivate: string;
  color: string;
  imgUrl: string;
}

interface TeacherRecord {
  _id: string;
  name: string;
  surname: string;
  imgUrl?: string;
}

/* Page-level metadata from DB */
interface PageMeta {
  _id: string;
  updatedAt: string;
  createdAt: string;
}

type CourseSort  = "name" | "certificate";
type TeacherSort = "name";
type SortDir     = "asc" | "desc";

/* ─────────────────────── Component ─────────────────────── */

/* ══════════════════════════════════════════════════════
   IMAGE URL HELPER
   /uploads/file.jpg  →  http://172.20.10.2:5000/uploads/file.jpg
   https://...        →  unchanged
   "" / null          →  ""
══════════════════════════════════════════════════════ */
function getImageUrl(path: string | undefined | null): string {
  if (!path || path.trim() === "") return "";
  if (/^https?:\/\//.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function YogaCoursesSectionListPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"courses" | "teachers">("courses");

  /* Data */
  const [pageMeta, setPageMeta]   = useState<PageMeta | null>(null);
  const [courses, setCourses]     = useState<CourseRecord[]>([]);
  const [teachers, setTeachers]   = useState<TeacherRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /* Courses UI */
  const [courseSearch, setCourseSearch]       = useState("");
  const [courseSortField, setCourseSortField] = useState<CourseSort>("name");
  const [courseSortDir, setCourseSortDir]     = useState<SortDir>("asc");

  /* Teachers UI */
  const [teacherSearch, setTeacherSearch]       = useState("");
  const [teacherSortField, setTeacherSortField] = useState<TeacherSort>("name");
  const [teacherSortDir, setTeacherSortDir]     = useState<SortDir>("asc");

  /* Delete modal */
  const [deleteTarget, setDeleteTarget] = useState<{ type: "course" | "teacher"; id: string; label: string } | null>(null);
  const [deleting, setDeleting]         = useState(false);

  /* ══════════ FETCH ══════════ */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res  = await api.get("/yoga-courses/get");
        const data = res.data?.data;
        if (!data) return;

        setPageMeta({ _id: data._id, createdAt: data.createdAt, updatedAt: data.updatedAt });

        setCourses(
          (data.courses || []).map((c: any) => ({
            _id:         c._id,
            hours:       c.hours       || "",
            days:        c.days        || "",
            name:        c.name        || "",
            style:       c.style       || "",
            duration:    c.duration    || "",
            certificate: c.certificate || "",
            feeShared:   c.feeShared   || "",
            feePrivate:  c.feePrivate  || "",
            color:       c.color       || "#8B5E3C",
            imgUrl:      c.imgUrl      || "",
          }))
        );

        setTeachers(
          (data.teachers || []).map((t: any) => ({
            _id:    t._id,
            name:   t.name    || "",
            surname: t.surname || "",
            imgUrl: t.imgUrl  || "",
          }))
        );
      } catch (err: any) {
        setFetchError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ══════════ SORT / FILTER ══════════ */
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
      const av = a[courseSortField];
      const bv = b[courseSortField];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return courseSortDir === "asc" ? cmp : -cmp;
    });

  const toggleTeacherSort = (f: TeacherSort) => {
    if (teacherSortField === f) setTeacherSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setTeacherSortField(f); setTeacherSortDir("asc"); }
  };
  const filteredTeachers = teachers
    .filter((t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.surname.toLowerCase().includes(teacherSearch.toLowerCase())
    )
    .sort((a, b) => {
      const av = `${a.name} ${a.surname}`;
      const bv = `${b.name} ${b.surname}`;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return teacherSortDir === "asc" ? cmp : -cmp;
    });

  /* ══════════ DELETE ══════════
     Backend has a single document — we PATCH the relevant section
     to remove the item by _id from the array.
  ══════════════════════════════ */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);

      if (deleteTarget.type === "course") {
        const updated = courses
          .filter((c) => c._id !== deleteTarget.id)
          .map((c) => ({
            _id: c._id, hours: c.hours, days: c.days, name: c.name,
            style: c.style, duration: c.duration, certificate: c.certificate,
            feeShared: c.feeShared, feePrivate: c.feePrivate,
            color: c.color, imgUrl: c.imgUrl,
            detailsLink: "#", bookLink: "#",
          }));
        // PATCH sends the full updated courses array (section = "courses")
        // Backend updateSection sets page.courses = req.body, so we send
        // an object that matches what the controller expects.
        await api.patch("/yoga-courses/update-section/courses", {
          sectionHeader: undefined, // not touched
          courses: updated,
        });
        setCourses((p) => p.filter((c) => c._id !== deleteTarget.id));

      } else {
        const updated = teachers
          .filter((t) => t._id !== deleteTarget.id)
          .map((t) => ({ _id: t._id, name: t.name, surname: t.surname, imgUrl: t.imgUrl }));
        await api.patch("/yoga-courses/update-section/teachers", updated);
        setTeachers((p) => p.filter((t) => t._id !== deleteTarget.id));
      }

      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  /* ══════════ UTILS ══════════ */
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const initials = (name: string, surname: string) =>
    `${name.replace(/[^A-Za-z]/g, "").charAt(0)}${surname.charAt(0)}`.toUpperCase();

  /* Resolve image — supports /uploads/... and https://... */
  const imgSrc = (url: string) => getImageUrl(url);

  const SortIcon = ({ field, active, dir }: { field: string; active: string; dir: SortDir }) =>
    field === active
      ? <span className={styles.sortActive}>{dir === "asc" ? " ↑" : " ↓"}</span>
      : <span className={styles.sortInactive}> ⇅</span>;

  /* ══════════ LOADING ══════════ */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonCard}>
          {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonField} style={{ animationDelay: `${i * 0.1}s` }} />)}
        </div>
      </div>
    );
  }

  /* ══════════ ERROR ══════════ */
  if (fetchError) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⚠️</div>
          <h3 className={styles.emptyTitle}>Failed to load</h3>
          <p className={styles.emptyText}>{fetchError}</p>
          <button className={styles.addBtn} onClick={() => window.location.reload()}>↺ Retry</button>
        </div>
      </div>
    );
  }

  /* ══════════ NO DATA — first time ══════════ */
  if (!pageMeta) {
    return (
      <div className={styles.page}>
        <div className={styles.listPageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Yoga Courses &amp; Teachers</h1>
            <p className={styles.pageSubtitle}>No page data found. Create the page first.</p>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🪷</div>
          <h3 className={styles.emptyTitle}>Page not created yet</h3>
          <p className={styles.emptyText}>Use the "Add New" form to set up the Yoga Courses page for the first time.</p>
          <Link href="/admin/dashboard/yogacoursespage/add-new" className={styles.emptyAddBtn}>
            + Create Yoga Courses Page
          </Link>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════ */
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
        <Link href="/admin/dashboard/yogacoursespage/add-new" className={styles.addNewBtn}>
          <span>✦</span> Edit Page Content
        </Link>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      {/* Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statPill}>
          <span className={styles.statPillIcon}>🧘</span>
          <span className={styles.statPillLabel}>Courses</span>
          <span className={styles.statPillVal}>{courses.length}</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillIcon}>👨‍🏫</span>
          <span className={styles.statPillLabel}>Teachers</span>
          <span className={styles.statPillVal}>{teachers.length}</span>
        </div>
        <div className={styles.statPill}>
          <span className={styles.statPillIcon}>🕐</span>
          <span className={styles.statPillLabel}>Last Updated</span>
          <span className={styles.statPillVal}>{formatDate(pageMeta.updatedAt)}</span>
        </div>
      </div>

      {/* Tab Nav */}
      <div className={styles.listTabNav}>
        <button
          className={`${styles.listTabBtn} ${activeTab === "courses" ? styles.listTabBtnActive : ""}`}
          onClick={() => setActiveTab("courses")}>
          🧘 Courses ({courses.length})
        </button>
        <button
          className={`${styles.listTabBtn} ${activeTab === "teachers" ? styles.listTabBtnActive : ""}`}
          onClick={() => setActiveTab("teachers")}>
          👨‍🏫 Teachers ({teachers.length})
        </button>
      </div>

      {/* ══════════ COURSES TABLE ══════════ */}
      {activeTab === "courses" && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                placeholder="Search by name, style, certificate…"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
              />
              {courseSearch && <button className={styles.clearSearch} onClick={() => setCourseSearch("")}>✕</button>}
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🪷</div>
              <h3 className={styles.emptyTitle}>{courseSearch ? "No courses found" : "No courses yet"}</h3>
              <p className={styles.emptyText}>{courseSearch ? "Try a different search term" : "Edit the page to add courses"}</p>
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
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map((c, i) => (
                    <tr key={c._id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdNum}`}>{i + 1}</td>

                      {/* ── Image — shows /uploads/ path correctly ── */}
                      <td className={styles.td}>
                        {c.imgUrl ? (
                          <img
                            src={imgSrc(c.imgUrl)}
                            alt={c.name}
                            style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6, border: "1.5px solid #e8d5b5", display: "block" }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                            }}
                          />
                        ) : null}
                        <div style={{
                          width: 56, height: 40, borderRadius: 6,
                          background: "#fdf6ec", border: "1.5px dashed #e8d5b5",
                          display: c.imgUrl ? "none" : "flex",
                          alignItems: "center", justifyContent: "center",
                          fontSize: "1.1rem"
                        }}>🧘</div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.titleCell}>
                          <span className={styles.titleText}>{c.name}</span>
                          <span className={styles.subText}>{c.days}</span>
                        </div>
                      </td>
                      <td className={styles.td}><span className={styles.hoursBadge}>{c.hours}</span></td>
                      <td className={styles.td}><span className={styles.subText}>{c.style}</span></td>
                      <td className={`${styles.td} ${styles.tdCenter}`}>
                        <span className={styles.hoursBadge}>{c.certificate}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={styles.feeBadge}>{c.feeShared} / {c.feePrivate} USD</span>
                      </td>
                      <td className={`${styles.td} ${styles.tdCenter}`}>
                        <span className={styles.colorDot} style={{ background: c.color }} title={c.color} />
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.editBtn}
                            onClick={() => router.push("/admin/dashboard/yogacoursespage/edit")}>
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteTarget({ id: c._id, type: "course", label: c.name })}>
                            🗑 Delete
                          </button>
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
              <input
                className={styles.searchInput}
                placeholder="Search by name or surname…"
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
              />
              {teacherSearch && <button className={styles.clearSearch} onClick={() => setTeacherSearch("")}>✕</button>}
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🙏</div>
              <h3 className={styles.emptyTitle}>{teacherSearch ? "No teachers found" : "No teachers yet"}</h3>
              <p className={styles.emptyText}>{teacherSearch ? "Try a different search term" : "Edit the page to add teachers"}</p>
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
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t, i) => (
                    <tr key={t._id} className={styles.tr}>
                      <td className={`${styles.td} ${styles.tdNum}`}>{i + 1}</td>

                      {/* ── Photo — shows /uploads/ path correctly ── */}
                      <td className={styles.td}>
                        {t.imgUrl ? (
                          <img
                            src={imgSrc(t.imgUrl)}
                            alt={`${t.name} ${t.surname}`}
                            className={styles.teacherThumb}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                            }}
                          />
                        ) : null}
                        <div
                          className={styles.teacherThumbPlaceholder}
                          style={{ display: t.imgUrl ? "none" : "flex" }}>
                          {initials(t.name, t.surname)}
                        </div>
                      </td>

                      <td className={styles.td}>
                        <div className={styles.titleCell}>
                          <span className={styles.titleText}>{t.name} {t.surname}</span>
                        </div>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.actionBtns}>
                          <button
                            className={styles.editBtn}
                            onClick={() => router.push("/admin/dashboard/yogacoursespage/edit")}>
                            ✏️ Edit
                          </button>
                          <button
                            className={styles.deleteBtn}
                            onClick={() => setDeleteTarget({ id: t._id, type: "teacher", label: `${t.name} ${t.surname}` })}>
                            🗑 Delete
                          </button>
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

      {/* ══════════ DELETE MODAL ══════════ */}
      {deleteTarget && (
        <div className={styles.modalBackdrop} onClick={() => !deleting && setDeleteTarget(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>{deleteTarget.type === "course" ? "🧘" : "👨‍🏫"}</div>
            <h3 className={styles.modalTitle}>
              Delete {deleteTarget.type === "course" ? "Course" : "Teacher"}?
            </h3>
            <p className={styles.modalText}>
              This will permanently remove <strong>"{deleteTarget.label}"</strong> from the page. This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancelBtn} onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button className={styles.modalDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting
                  ? <><span className={styles.spinner} /> Deleting…</>
                  : `Delete ${deleteTarget.type === "course" ? "Course" : "Teacher"}`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}