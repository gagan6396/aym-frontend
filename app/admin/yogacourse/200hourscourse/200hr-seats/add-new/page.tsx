"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/batches/Batches.module.css";
import api from "@/lib/api";

/* ─────────────── Types ─────────────── */
interface BatchForm {
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

/* ── Field Primitives ── */
function TXT({ label, hint, val, err, onCh, ph, max = 150, req = true, prefix }:
  { label: string; hint?: string; val: string; err?: string; onCh: (v: string) => void; ph: string; max?: number; req?: boolean; prefix?: string }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}</label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.inputWrap} ${prefix ? styles.inputWithPrefix : ""} ${err ? styles.inputError : ""} ${val && !err ? styles.inputSuccess : ""}`}>
        {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
        <input type="text" className={`${styles.input} ${prefix ? styles.inputPrefixed : ""}`}
          placeholder={ph} value={val} maxLength={max} onChange={e => onCh(e.target.value)} />
        <span className={styles.charCount}>{val.length}/{max}</span>
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

function NUM({ label, hint, val, err, onCh, ph, min = 0, max = 9999, req = true }:
  { label: string; hint?: string; val: number; err?: string; onCh: (v: number) => void; ph: string; min?: number; max?: number; req?: boolean }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req && <span className={styles.required}>*</span>}</label>
      {hint && <p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.inputWrap} ${err ? styles.inputError : ""} ${!err ? styles.inputSuccess : ""}`}>
        <input type="number" className={styles.input} placeholder={ph} value={val}
          min={min} max={max} onChange={e => onCh(Number(e.target.value))} />
      </div>
      {err && <p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

export default function BatchesAddNew() {
  const router = useRouter();

  const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<BatchForm>({
    defaultValues: {
      date: "", usd: "", inr: "",
      roomDorm: "", roomTwin: "", roomPrivate: "",
      bookedSeats: 0, totalSeats: 50,
      earlyBirdNote: "A $100 USD early bird discount is available on all accommodation types if booked 60 days in advance.",
    },
  });

  const watchedDate    = watch("date");
  const watchedUsd     = watch("usd");
  const watchedBooked  = watch("bookedSeats");
  const watchedTotal   = watch("totalSeats");

  const onSubmit = async (data: BatchForm) => {
    try {
      await api.post("/two-hundred-hour/batches/create", {
        date:          data.date,
        usd:           data.usd,
        inr:           data.inr,
        roomDorm:      data.roomDorm,
        roomTwin:      data.roomTwin,
        roomPrivate:   data.roomPrivate,
        bookedSeats:   Number(data.bookedSeats),
        totalSeats:    Number(data.totalSeats),
        earlyBirdNote: data.earlyBirdNote,
      });
      router.push("/admin/dashboard/twohundredhourpage/batches");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save. Please try again.");
    }
  };

  const isFull    = Number(watchedBooked) >= Number(watchedTotal);
  const remaining = Number(watchedTotal) - Number(watchedBooked);

  return (
    <div className={styles.page}>

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard/twohundredhourpage")}>200 Hour</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={() => router.push("/admin/dashboard/twohundredhourpage/batches")}>Batches</button>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcCurrent}>Add New</span>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Add New Batch</h1>
        <p className={styles.pageSubtitle}>Add a new course date with pricing and seat availability</p>
      </div>

      <div className={styles.ornament}>
        <span>❧</span><div className={styles.ornamentLine} /><span>ॐ</span><div className={styles.ornamentLine} /><span>❧</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formCard}>

          {/* ── Section: Date & Fees ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Date &amp; Course Fees</h3>
            </div>

            {/* Date — full width */}
            <Controller control={control} name="date" rules={{ required: "Date is required" }}
              render={({ field, fieldState }) => (
                <TXT label="Date Range" hint='Displayed in the table — e.g. "3rd Mar – 27th Mar 2026"'
                  val={field.value} err={fieldState.error?.message} onCh={field.onChange}
                  ph="e.g. 3rd Mar – 27th Mar 2026" max={60} />
              )} />

            <div className={styles.twoCol}>
              {/* USD Fee */}
              <Controller control={control} name="usd" rules={{ required: "USD fee is required" }}
                render={({ field, fieldState }) => (
                  <TXT label="FEE (USD)" hint='International student fee — e.g. "749 USD"'
                    val={field.value} err={fieldState.error?.message} onCh={field.onChange}
                    ph="749 USD" max={30} prefix="$" />
                )} />

              {/* INR Fee */}
              <Controller control={control} name="inr" rules={{ required: "INR fee is required" }}
                render={({ field, fieldState }) => (
                  <TXT label="FEE (Indian / INR)" hint='Indian student fee — e.g. "20,999 INR"'
                    val={field.value} err={fieldState.error?.message} onCh={field.onChange}
                    ph="20,999 INR" max={30} prefix="₹" />
                )} />
            </div>
          </div>

          <div className={styles.formDivider} />

          {/* ── Section: Room Prices ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Room Prices (USD)</h3>
            </div>
            <p className={styles.fieldHint}>These appear in the Room Price column: Dorm $749 | Twin $849 | Private $1099</p>

            <div className={styles.threeCol}>
              <Controller control={control} name="roomDorm" rules={{ required: "Required" }}
                render={({ field, fieldState }) => (
                  <TXT label="Dormitory" hint="Dorm room price" val={field.value}
                    err={fieldState.error?.message} onCh={field.onChange} ph="749" max={10} prefix="$" />
                )} />
              <Controller control={control} name="roomTwin" rules={{ required: "Required" }}
                render={({ field, fieldState }) => (
                  <TXT label="Twin Sharing" hint="Twin room price" val={field.value}
                    err={fieldState.error?.message} onCh={field.onChange} ph="849" max={10} prefix="$" />
                )} />
              <Controller control={control} name="roomPrivate" rules={{ required: "Required" }}
                render={({ field, fieldState }) => (
                  <TXT label="Private Room" hint="Private room price" val={field.value}
                    err={fieldState.error?.message} onCh={field.onChange} ph="1099" max={10} prefix="$" />
                )} />
            </div>
          </div>

          <div className={styles.formDivider} />

          {/* ── Section: Seats ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Seat Availability</h3>
            </div>

            <div className={styles.twoCol}>
              <Controller control={control} name="bookedSeats"
                render={({ field, fieldState }) => (
                  <NUM label="Booked Seats" hint="Number of seats already booked"
                    val={field.value} err={fieldState.error?.message} onCh={field.onChange}
                    ph="0" min={0} max={500} req={false} />
                )} />
              <Controller control={control} name="totalSeats" rules={{ required: "Required" }}
                render={({ field, fieldState }) => (
                  <NUM label="Total Seats" hint="Maximum capacity for this batch"
                    val={field.value} err={fieldState.error?.message} onCh={field.onChange}
                    ph="50" min={1} max={500} />
                )} />
            </div>

            {/* Live seats preview */}
            {watchedDate && (
              <div className={styles.previewBox}>
                <span className={styles.previewLabel}>Table preview:</span>
                <span className={styles.previewDate}>📅 {watchedDate}</span>
                <span className={styles.previewFee}>{watchedUsd}</span>
                {isFull
                  ? <span className={styles.badgeFull}>Fully Booked</span>
                  : <span className={styles.badgeAvail}>{remaining} / {Number(watchedTotal)} Seats</span>
                }
                <span className={styles.previewApply}>
                  {isFull
                    ? <span className={styles.applyDisabled}>Apply Now</span>
                    : <span className={styles.applyActive}>Apply Now</span>
                  }
                </span>
              </div>
            )}
          </div>

          <div className={styles.formDivider} />

          {/* ── Section: Early Bird Note ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✦</span>
              <h3 className={styles.sectionTitle}>Early Bird Note</h3>
            </div>
            <Controller control={control} name="earlyBirdNote"
              render={({ field }) => (
                <TXT label="Note text" hint="Shown below the table. Leave blank to hide."
                  val={field.value} onCh={field.onChange}
                  ph="A $100 USD early bird discount is available on all accommodation types if booked 60 days in advance."
                  max={250} req={false} />
              )} />
          </div>

          <div className={styles.formDivider} />

          {/* ── Actions ── */}
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/twohundredhourpage/batches" className={styles.cancelBtn}>← Cancel</Link>
            <button type="submit" className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`} disabled={isSubmitting}>
              {isSubmitting ? <><span className={styles.spinner} /> Saving…</> : <><span>✦</span> Create Batch</>}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}