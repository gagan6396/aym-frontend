"use client";
// ═══════════════════════════════════════════════════════════
//  ContentPart2_AddNew.tsx
//  200hr Admin — Add Syllabus, Schedule, Cert, Reg, Included
// ═══════════════════════════════════════════════════════════

import { useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/content-part2/ContentPart2.module.css";
import api from "@/lib/api";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

/* ── Types ── */
interface ContentPart2Form {
  syllabusTitle: string;
  syllabusDesc: { text: string }[];
  syllabusModules: { title: string; desc: string }[];
  scheduleItems: { time: string; activity: string; link: string }[];
  certTitle: string;
  certParas: { text: string }[];
  regTitle: string;
  regDesc: string;
  included: { text: string }[];
  notIncluded: { text: string }[];
}

/* ── Helpers ── */
function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
}
function isRteEmpty(v: string): boolean {
  return !v || stripHtml(v)==="" || v==="<p><br></p>" || v==="<p></p>";
}
function useJoditConfig() {
  return useMemo(()=>({
    readonly:false,toolbar:true,spellcheck:false,language:"en",
    toolbarButtonSize:"small" as const,toolbarAdaptive:false,
    showCharsCounter:false,showWordsCounter:false,showXPathInStatusbar:false,
    askBeforePasteHTML:false,askBeforePasteFromWord:false,
    buttons:["bold","italic","underline","strikethrough","|","brush","font","fontsize","|","paragraph","align","|","ul","ol","|","link","|","undo","redo","|","source"],
    height:200,
    style:{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:"#3d1d00",background:"#fff"},
    placeholder:"Type and format your text here…",
  }),[]);
}

/* ── Field Primitives ── */
function TXT({label,hint,val,err,onCh,ph,max=200,req=true}:{label:string;hint?:string;val:string;err?:string;onCh:(v:string)=>void;ph:string;max?:number;req?:boolean}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req&&<span className={styles.required}>*</span>}</label>
      {hint&&<p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.inputWrap} ${err?styles.inputError:""} ${val&&!err?styles.inputSuccess:""}`}>
        <input type="text" className={styles.input} placeholder={ph} value={val} maxLength={max} onChange={e=>onCh(e.target.value)}/>
        <span className={styles.charCount}>{val.length}/{max}</span>
      </div>
      {err&&<p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}
function TA({label,hint,val,err,onCh,ph,rows=3,max=800,req=true}:{label:string;hint?:string;val:string;err?:string;onCh:(v:string)=>void;ph:string;rows?:number;max?:number;req?:boolean}) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req&&<span className={styles.required}>*</span>}</label>
      {hint&&<p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.inputWrap} ${err?styles.inputError:""} ${val&&!err?styles.inputSuccess:""}`}>
        <textarea className={`${styles.input} ${styles.textarea}`} placeholder={ph} value={val} maxLength={max} rows={rows} onChange={e=>onCh(e.target.value)}/>
        <span className={`${styles.charCount} ${styles.charCountBottom}`}>{val.length}/{max}</span>
      </div>
      {err&&<p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}
function RTE({label,hint,val,err,onCh,req=true}:{label:string;hint?:string;val:string;err?:string;onCh:(v:string)=>void;req?:boolean}) {
  const config=useJoditConfig(); const edRef=useRef(null);
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req&&<span className={styles.required}>*</span>}</label>
      {hint&&<p className={styles.fieldHint}>{hint}</p>}
      <div className={`${styles.joditWrap} ${err?styles.joditError:""} ${val&&!isRteEmpty(val)&&!err?styles.joditSuccess:""}`}>
        <JoditEditor ref={edRef} value={val} config={config} onBlur={v=>onCh(v)}/>
      </div>
      {err&&<p className={styles.errorMsg}>⚠ {err}</p>}
    </div>
  );
}

/* ════════════════════════════════════════
   COMPONENT
════════════════════════════════════════ */
export default function ContentPart2AddNew() {
  const router = useRouter();

  const { control, handleSubmit, formState: { isSubmitting } } = useForm<ContentPart2Form>({
    defaultValues: {
      syllabusTitle:"", syllabusDesc:[{text:""}],
      syllabusModules:[{title:"",desc:""}],
      scheduleItems:[{time:"",activity:"",link:""}],
      certTitle:"", certParas:[{text:""}],
      regTitle:"", regDesc:"",
      included:[{text:""}], notIncluded:[{text:""}],
    },
  });

  const {fields:sdF,append:sdA,remove:sdR}  = useFieldArray({control,name:"syllabusDesc"});
  const {fields:smF,append:smA,remove:smR}  = useFieldArray({control,name:"syllabusModules"});
  const {fields:scF,append:scA,remove:scR}  = useFieldArray({control,name:"scheduleItems"});
  const {fields:cpF,append:cpA,remove:cpR}  = useFieldArray({control,name:"certParas"});
  const {fields:inF,append:inA,remove:inR}  = useFieldArray({control,name:"included"});
  const {fields:niF,append:niA,remove:niR}  = useFieldArray({control,name:"notIncluded"});

  const onSubmit = async (data: ContentPart2Form) => {
    try {
      await api.post("/two-hundred-hour/content-part2/create", {
        syllabusTitle:   stripHtml(data.syllabusTitle),
        syllabusDesc:    data.syllabusDesc.map(p=>p.text).filter(Boolean),
        syllabusModules: data.syllabusModules.map(m=>({title:stripHtml(m.title),desc:m.desc})),
        scheduleItems:   data.scheduleItems.map(s=>({time:s.time,activity:s.activity,link:s.link||""})),
        certTitle:       stripHtml(data.certTitle),
        certParas:       data.certParas.map(p=>p.text).filter(Boolean),
        regTitle:        stripHtml(data.regTitle),
        regDesc:         data.regDesc,
        included:        data.included.map(p=>stripHtml(p.text)).filter(Boolean),
        notIncluded:     data.notIncluded.map(p=>stripHtml(p.text)).filter(Boolean),
      });
      router.push("/admin/dashboard/twohundredhourpage/content-part2");
    } catch(err:any) {
      alert(err?.response?.data?.message||"Failed to save.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <button className={styles.bcLink} onClick={()=>router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={()=>router.push("/admin/dashboard/twohundredhourpage")}>200 Hour</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={()=>router.push("/admin/dashboard/twohundredhourpage/content-part2")}>Content Part 2</button>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcCurrent}>Add New</span>
      </div>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Add Content Part 2</h1>
        <p className={styles.pageSubtitle}>Syllabus, Schedule, Certification, Registration, Included/Not Included</p>
      </div>
      <div className={styles.ornament}><span>❧</span><div className={styles.ornamentLine}/><span>ॐ</span><div className={styles.ornamentLine}/><span>❧</span></div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formCard}>

          {/* ── Syllabus ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>📖</span><h3 className={styles.sectionTitle}>Syllabus Section</h3></div>
            <Controller control={control} name="syllabusTitle" rules={{required:"Required"}}
              render={({field,fieldState})=>(<TXT label="Syllabus Title" hint="" val={field.value} err={fieldState.error?.message} onCh={field.onChange} ph="Syllabus of Premier — 100 Hour Yoga Teacher Training Course in Rishikesh, India"/>)}/>

            {/* Syllabus Description Paragraphs (Jodit) */}
            <div className={styles.repeaterBlock}>
              <p className={styles.repeaterLabel}>Description Paragraphs (Jodit) <span className={styles.badge}>{sdF.length}/5</span></p>
              {sdF.map((f,i)=>(
                <div key={f.id} className={styles.repeaterRow}>
                  <Controller control={control} name={`syllabusDesc.${i}.text`} rules={{validate:(v:string)=>!isRteEmpty(v)||"Required"}}
                    render={({field:ff,fieldState:fs})=>(<RTE label={`Paragraph ${i+1}`} hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange}/>)}/>
                  <button type="button" className={styles.removeBtnSm} onClick={()=>sdR(i)} disabled={sdF.length<=1}>✕</button>
                </div>
              ))}
              {sdF.length<5&&<button type="button" className={styles.addBtnSm} onClick={()=>sdA({text:""})}>+ Add Paragraph</button>}
            </div>
          </div>

          <div className={styles.formDivider}/>

          {/* ── Syllabus Modules ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🗂</span>
              <h3 className={styles.sectionTitle}>Syllabus Modules (Cards)</h3>
              <span className={styles.badge}>{smF.length}/8</span>
            </div>
            <div className={styles.moduleList}>
              {smF.map((f,i)=>(
                <div key={f.id} className={styles.moduleCard}>
                  <div className={styles.moduleCardHeader}>
                    <span className={styles.moduleNum}>{i+1}</span>
                    <span className={styles.moduleCardTitle}>Module #{i+1}</span>
                    <button type="button" className={styles.removeBtn} onClick={()=>smR(i)} disabled={smF.length<=1}>✕ Remove</button>
                  </div>
                  <div className={styles.moduleCardBody}>
                    <Controller control={control} name={`syllabusModules.${i}.title`} rules={{required:"Required"}}
                      render={({field:ff,fieldState:fs})=>(<TXT label="Module Title" hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange} ph="e.g. Practice of Yoga Techniques" max={120}/>)}/>
                    <Controller control={control} name={`syllabusModules.${i}.desc`} rules={{validate:(v:string)=>!isRteEmpty(v)||"Required"}}
                      render={({field:ff,fieldState:fs})=>(<RTE label="Module Description" hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange}/>)}/>
                  </div>
                </div>
              ))}
            </div>
            {smF.length<8&&<button type="button" className={styles.addBtn} onClick={()=>smA({title:"",desc:""})}>+ Add Module</button>}
          </div>

          <div className={styles.formDivider}/>

          {/* ── Daily Schedule ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>🕐</span>
              <h3 className={styles.sectionTitle}>Daily Schedule</h3>
              <span className={styles.badge}>{scF.length}/20</span>
            </div>
            <p className={styles.fieldHint} style={{marginBottom:"1rem"}}>
              Time | Activity label | Link word (optional — the word in activity that becomes a hyperlink)
            </p>
            <div className={styles.scheduleList}>
              {scF.map((f,i)=>(
                <div key={f.id} className={styles.schedRow}>
                  <span className={styles.schedNum}>{i+1}</span>
                  <Controller control={control} name={`scheduleItems.${i}.time`} rules={{required:"Required"}}
                    render={({field:ff,fieldState:fs})=>(
                      <div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:"0 0 185px"}}>
                        <input type="text" className={styles.input} placeholder="07:00 AM – 08:00 AM" value={ff.value} maxLength={30} onChange={ff.onChange}/>
                      </div>
                    )}/>
                  <Controller control={control} name={`scheduleItems.${i}.activity`} rules={{required:"Required"}}
                    render={({field:ff,fieldState:fs})=>(
                      <div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:1}}>
                        <input type="text" className={styles.input} placeholder="Pranayama and Meditation." value={ff.value} maxLength={80} onChange={ff.onChange}/>
                      </div>
                    )}/>
                  <Controller control={control} name={`scheduleItems.${i}.link`}
                    render={({field:ff})=>(
                      <div className={styles.inputWrap} style={{flex:"0 0 150px"}}>
                        <input type="text" className={styles.input} placeholder="Link word (opt)" value={ff.value} maxLength={40} onChange={ff.onChange}/>
                      </div>
                    )}/>
                  <button type="button" className={styles.removeBtnSm} onClick={()=>scR(i)} disabled={scF.length<=1}>✕</button>
                </div>
              ))}
            </div>
            {scF.length<20&&<button type="button" className={styles.addBtnSm} onClick={()=>scA({time:"",activity:"",link:""})}>+ Add Row</button>}
          </div>

          <div className={styles.formDivider}/>

          {/* ── Certification ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>🎓</span><h3 className={styles.sectionTitle}>Certification Section</h3></div>
            <Controller control={control} name="certTitle" rules={{required:"Required"}}
              render={({field,fieldState})=>(<TXT label="Section Title" hint="" val={field.value} err={fieldState.error?.message} onCh={field.onChange} ph="100 Hour Yoga Teacher Training Course Certification at AYM"/>)}/>
            <div className={styles.repeaterBlock}>
              <p className={styles.repeaterLabel}>Paragraphs <span className={styles.badge}>{cpF.length}/4</span></p>
              {cpF.map((f,i)=>(
                <div key={f.id} className={styles.repeaterRow}>
                  <Controller control={control} name={`certParas.${i}.text`} rules={{validate:(v:string)=>!isRteEmpty(v)||"Required"}}
                    render={({field:ff,fieldState:fs})=>(<RTE label={`Paragraph ${i+1}`} hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange}/>)}/>
                  <button type="button" className={styles.removeBtnSm} onClick={()=>cpR(i)} disabled={cpF.length<=1}>✕</button>
                </div>
              ))}
              {cpF.length<4&&<button type="button" className={styles.addBtnSm} onClick={()=>cpA({text:""})}>+ Add Paragraph</button>}
            </div>
          </div>

          <div className={styles.formDivider}/>

          {/* ── Registration ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>📝</span><h3 className={styles.sectionTitle}>Registration Section</h3></div>
            <Controller control={control} name="regTitle" rules={{required:"Required"}}
              render={({field,fieldState})=>(<TXT label="Section Title" hint="" val={field.value} err={fieldState.error?.message} onCh={field.onChange} ph="Registration Process"/>)}/>
            <Controller control={control} name="regDesc" rules={{validate:(v)=>!isRteEmpty(v)||"Required"}}
              render={({field,fieldState})=>(<RTE label="Registration Description" hint="Booking process, advance fee details, terms etc." val={field.value} err={fieldState.error?.message} onCh={field.onChange}/>)}/>
          </div>

          <div className={styles.formDivider}/>

          {/* ── Included ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>✅</span>
              <h3 className={styles.sectionTitle}>Included in Fee</h3>
              <span className={styles.badge}>{inF.length}/15</span>
            </div>
            <div className={styles.listItems}>
              {inF.map((f,i)=>(
                <div key={f.id} className={styles.listItemRow}>
                  <span className={styles.listNum}>{i+1}.</span>
                  <Controller control={control} name={`included.${i}.text`} rules={{required:"Required"}}
                    render={({field:ff,fieldState:fs})=>(
                      <div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:1}}>
                        <input type="text" className={styles.input} placeholder="e.g. 14 Days Accommodation and 3 Meals / Day" value={ff.value} maxLength={200} onChange={ff.onChange}/>
                      </div>
                    )}/>
                  <button type="button" className={styles.removeBtnSm} onClick={()=>inR(i)} disabled={inF.length<=1}>✕</button>
                </div>
              ))}
            </div>
            {inF.length<15&&<button type="button" className={styles.addBtnSm} onClick={()=>inA({text:""})}>+ Add Item</button>}
          </div>

          <div className={styles.formDivider}/>

          {/* ── Not Included ── */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionIcon}>❌</span>
              <h3 className={styles.sectionTitle}>Not Included</h3>
              <span className={styles.badge}>{niF.length}/10</span>
            </div>
            <div className={styles.listItems}>
              {niF.map((f,i)=>(
                <div key={f.id} className={styles.listItemRow}>
                  <span className={styles.listNum}>{i+1}.</span>
                  <Controller control={control} name={`notIncluded.${i}.text`} rules={{required:"Required"}}
                    render={({field:ff,fieldState:fs})=>(
                      <div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:1}}>
                        <input type="text" className={styles.input} placeholder="e.g. Air Ticket and Airport Pickup" value={ff.value} maxLength={200} onChange={ff.onChange}/>
                      </div>
                    )}/>
                  <button type="button" className={styles.removeBtnSm} onClick={()=>niR(i)} disabled={niF.length<=1}>✕</button>
                </div>
              ))}
            </div>
            {niF.length<10&&<button type="button" className={styles.addBtnSm} onClick={()=>niA({text:""})}>+ Add Item</button>}
          </div>

          <div className={styles.formDivider}/>
          <div className={styles.formActions}>
            <Link href="/admin/dashboard/twohundredhourpage/content-part2" className={styles.cancelBtn}>← Cancel</Link>
            <button type="submit" className={`${styles.submitBtn} ${isSubmitting?styles.submitBtnLoading:""}`} disabled={isSubmitting}>
              {isSubmitting?<><span className={styles.spinner}/> Saving…</>:<><span>✦</span> Create Content Part 2</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}