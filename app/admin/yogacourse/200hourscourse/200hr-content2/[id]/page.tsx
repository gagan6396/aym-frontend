"use client";
// ═══════════════════════════════════════════════════════════
//  ContentPart2_Edit.tsx
//  200hr Admin — Edit Syllabus, Schedule, Cert, Reg, Included
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm, useFieldArray, Controller, type SubmitHandler } from "react-hook-form";
import styles from "@/assets/style/Admin/dashboard/twohundredhourpage/content-part2/ContentPart2.module.css";
import api from "@/lib/api";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

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

function stripHtml(h:string):string{if(!h)return"";return h.replace(/<[^>]*>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();}
function isRteEmpty(v:string):boolean{return!v||stripHtml(v)===""||v==="<p><br></p>"||v==="<p></p>";}
function useJoditConfig(){return useMemo(()=>({readonly:false,toolbar:true,spellcheck:false,language:"en",toolbarButtonSize:"small" as const,toolbarAdaptive:false,showCharsCounter:false,showWordsCounter:false,showXPathInStatusbar:false,askBeforePasteHTML:false,askBeforePasteFromWord:false,buttons:["bold","italic","underline","strikethrough","|","brush","font","fontsize","|","paragraph","align","|","ul","ol","|","link","|","undo","redo","|","source"],height:200,style:{fontFamily:"'Cormorant Garamond',serif",fontSize:"1rem",color:"#3d1d00",background:"#fff"},placeholder:"Type and format your text here…"}),[]);}

function TXT({label,hint,val,err,onCh,ph,max=200,req=true}:{label:string;hint?:string;val:string;err?:string;onCh:(v:string)=>void;ph:string;max?:number;req?:boolean}){return(<div className={styles.fieldGroup}><label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req&&<span className={styles.required}>*</span>}</label>{hint&&<p className={styles.fieldHint}>{hint}</p>}<div className={`${styles.inputWrap} ${err?styles.inputError:""} ${val&&!err?styles.inputSuccess:""}`}><input type="text" className={styles.input} placeholder={ph} value={val} maxLength={max} onChange={e=>onCh(e.target.value)}/><span className={styles.charCount}>{val.length}/{max}</span></div>{err&&<p className={styles.errorMsg}>⚠ {err}</p>}</div>);}
function RTE({label,hint,val,err,onCh,req=true}:{label:string;hint?:string;val:string;err?:string;onCh:(v:string)=>void;req?:boolean}){const config=useJoditConfig();const edRef=useRef(null);return(<div className={styles.fieldGroup}><label className={styles.label}><span className={styles.labelIcon}>✦</span>{label}{req&&<span className={styles.required}>*</span>}</label>{hint&&<p className={styles.fieldHint}>{hint}</p>}<div className={`${styles.joditWrap} ${err?styles.joditError:""} ${val&&!isRteEmpty(val)&&!err?styles.joditSuccess:""}`}><JoditEditor ref={edRef} value={val} config={config} onBlur={v=>onCh(v)}/></div>{err&&<p className={styles.errorMsg}>⚠ {err}</p>}</div>);}
function SavedChip({show}:{show:boolean}){if(!show)return null;return<div style={{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.55rem 1rem",background:"rgba(74,140,42,0.1)",border:"1px solid rgba(74,140,42,0.3)",borderRadius:8,fontFamily:"'Cormorant Garamond',serif",fontSize:"0.88rem",color:"#2a5e1e",fontStyle:"italic"}}>✓ Saved</div>;}

export default function ContentPart2Edit() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState<string|null>(null);
  const [saved,    setSaved]    = useState(false);
  const [submitting,setSubmitting]=useState(false);

  const {control,handleSubmit,reset,formState:{isSubmitting}}=useForm<ContentPart2Form>({
    defaultValues:{syllabusTitle:"",syllabusDesc:[{text:""}],syllabusModules:[{title:"",desc:""}],scheduleItems:[{time:"",activity:"",link:""}],certTitle:"",certParas:[{text:""}],regTitle:"",regDesc:"",included:[{text:""}],notIncluded:[{text:""}]},
  });

  const {fields:sdF,append:sdA,remove:sdR}=useFieldArray({control,name:"syllabusDesc"});
  const {fields:smF,append:smA,remove:smR}=useFieldArray({control,name:"syllabusModules"});
  const {fields:scF,append:scA,remove:scR}=useFieldArray({control,name:"scheduleItems"});
  const {fields:cpF,append:cpA,remove:cpR}=useFieldArray({control,name:"certParas"});
  const {fields:inF,append:inA,remove:inR}=useFieldArray({control,name:"included"});
  const {fields:niF,append:niA,remove:niR}=useFieldArray({control,name:"notIncluded"});

  useEffect(()=>{
    (async()=>{
      try{
        const res=await api.get("/two-hundred-hour/content-part2/get");
        const d=res.data?.data;
        if(!d)return;
        reset({
          syllabusTitle:d.syllabusTitle||"",
          syllabusDesc:(d.syllabusDesc||[""]).map((t:string)=>({text:t})),
          syllabusModules:(d.syllabusModules||[{title:"",desc:""}]).map((m:any)=>({title:m.title||"",desc:m.desc||""})),
          scheduleItems:(d.scheduleItems||[{time:"",activity:"",link:""}]).map((s:any)=>({time:s.time||"",activity:s.activity||"",link:s.link||""})),
          certTitle:d.certTitle||"",
          certParas:(d.certParas||[""]).map((t:string)=>({text:t})),
          regTitle:d.regTitle||"",
          regDesc:d.regDesc||"",
          included:(d.included||[""]).map((t:string)=>({text:t})),
          notIncluded:(d.notIncluded||[""]).map((t:string)=>({text:t})),
        });
      }catch(err:any){setFetchErr(err?.response?.data?.message||"Failed to load");}
      finally{setLoading(false);}
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const onSubmit:SubmitHandler<ContentPart2Form>=async(data)=>{
    setSubmitting(true);
    try{
      await api.patch("/two-hundred-hour/content-part2/update",{
        syllabusTitle:stripHtml(data.syllabusTitle),
        syllabusDesc:data.syllabusDesc.map(p=>p.text).filter(Boolean),
        syllabusModules:data.syllabusModules.map(m=>({title:stripHtml(m.title),desc:m.desc})),
        scheduleItems:data.scheduleItems.map(s=>({time:s.time,activity:s.activity,link:s.link||""})),
        certTitle:stripHtml(data.certTitle),
        certParas:data.certParas.map(p=>p.text).filter(Boolean),
        regTitle:stripHtml(data.regTitle),
        regDesc:data.regDesc,
        included:data.included.map(p=>stripHtml(p.text)).filter(Boolean),
        notIncluded:data.notIncluded.map(p=>stripHtml(p.text)).filter(Boolean),
      });
      setSaved(true);setTimeout(()=>setSaved(false),2500);
    }catch(err:any){alert(err?.response?.data?.message||"Failed to update.");}
    finally{setSubmitting(false);}
  };

  if(loading)return<div className={styles.page}><div className={styles.skeletonHeader}/><div className={styles.skeletonCard}>{[...Array(4)].map((_,i)=><div key={i} className={styles.skeletonField} style={{animationDelay:`${i*0.1}s`}}/>)}</div></div>;
  if(fetchErr)return<div className={styles.page}><div className={styles.emptyState}><div className={styles.emptyIcon}>⚠️</div><h3 className={styles.emptyTitle}>Failed to load</h3><p className={styles.emptyText}>{fetchErr}</p><button className={styles.retryBtn} onClick={()=>window.location.reload()}>↺ Retry</button></div></div>;

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        <button className={styles.bcLink} onClick={()=>router.push("/admin/dashboard")}>Dashboard</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={()=>router.push("/admin/dashboard/twohundredhourpage")}>200 Hour</button>
        <span className={styles.bcSep}>›</span>
        <button className={styles.bcLink} onClick={()=>router.push("/admin/dashboard/twohundredhourpage/content-part2")}>Content Part 2</button>
        <span className={styles.bcSep}>›</span>
        <span className={styles.bcCurrent}>Edit</span>
      </div>

      <div className={styles.pageHeader}>
        <div className={styles.editBadge}>✏️ Edit mode — pre-filled with live data</div>
        <h1 className={styles.pageTitle}>Edit Content Part 2</h1>
        <p className={styles.pageSubtitle}>Syllabus, Schedule, Certification, Registration, Included/Not Included</p>
      </div>
      <div className={styles.ornament}><span>❧</span><div className={styles.ornamentLine}/><span>ॐ</span><div className={styles.ornamentLine}/><span>❧</span></div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formCard}>

          {/* Syllabus */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>📖</span><h3 className={styles.sectionTitle}>Syllabus Section</h3></div>
            <Controller control={control} name="syllabusTitle" rules={{required:"Required"}}
              render={({field,fieldState})=>(<TXT label="Syllabus Title" hint="" val={field.value} err={fieldState.error?.message} onCh={field.onChange} ph="Syllabus of Premier…"/>)}/>
            <div className={styles.repeaterBlock}>
              <p className={styles.repeaterLabel}>Description Paragraphs <span className={styles.badge}>{sdF.length}/5</span></p>
              {sdF.map((f,i)=>(<div key={f.id} className={styles.repeaterRow}><Controller control={control} name={`syllabusDesc.${i}.text`} rules={{validate:(v:string)=>!isRteEmpty(v)||"Required"}} render={({field:ff,fieldState:fs})=>(<RTE label={`Para ${i+1}`} hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange}/>)}/><button type="button" className={styles.removeBtnSm} onClick={()=>sdR(i)} disabled={sdF.length<=1}>✕</button></div>))}
              {sdF.length<5&&<button type="button" className={styles.addBtnSm} onClick={()=>sdA({text:""})}>+ Add Paragraph</button>}
            </div>
          </div>
          <div className={styles.formDivider}/>

          {/* Modules */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>🗂</span><h3 className={styles.sectionTitle}>Syllabus Modules</h3><span className={styles.badge}>{smF.length}/8</span></div>
            <div className={styles.moduleList}>
              {smF.map((f,i)=>(<div key={f.id} className={styles.moduleCard}><div className={styles.moduleCardHeader}><span className={styles.moduleNum}>{i+1}</span><span className={styles.moduleCardTitle}>Module #{i+1}</span><button type="button" className={styles.removeBtn} onClick={()=>smR(i)} disabled={smF.length<=1}>✕ Remove</button></div><div className={styles.moduleCardBody}><Controller control={control} name={`syllabusModules.${i}.title`} rules={{required:"Required"}} render={({field:ff,fieldState:fs})=>(<TXT label="Title" hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange} ph="e.g. Practice of Yoga Techniques" max={120}/>)}/><Controller control={control} name={`syllabusModules.${i}.desc`} rules={{validate:(v:string)=>!isRteEmpty(v)||"Required"}} render={({field:ff,fieldState:fs})=>(<RTE label="Description" hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange}/>)}/></div></div>))}
            </div>
            {smF.length<8&&<button type="button" className={styles.addBtn} onClick={()=>smA({title:"",desc:""})}>+ Add Module</button>}
          </div>
          <div className={styles.formDivider}/>

          {/* Schedule */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>🕐</span><h3 className={styles.sectionTitle}>Daily Schedule</h3><span className={styles.badge}>{scF.length}/20</span></div>
            <p className={styles.fieldHint} style={{marginBottom:"1rem"}}>Time | Activity | Link word (optional)</p>
            <div className={styles.scheduleList}>
              {scF.map((f,i)=>(<div key={f.id} className={styles.schedRow}><span className={styles.schedNum}>{i+1}</span><Controller control={control} name={`scheduleItems.${i}.time`} rules={{required:"Required"}} render={({field:ff,fieldState:fs})=>(<div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:"0 0 185px"}}><input type="text" className={styles.input} placeholder="07:00 AM – 08:00 AM" value={ff.value} maxLength={30} onChange={ff.onChange}/></div>)}/><Controller control={control} name={`scheduleItems.${i}.activity`} rules={{required:"Required"}} render={({field:ff,fieldState:fs})=>(<div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:1}}><input type="text" className={styles.input} placeholder="Pranayama and Meditation" value={ff.value} maxLength={80} onChange={ff.onChange}/></div>)}/><Controller control={control} name={`scheduleItems.${i}.link`} render={({field:ff})=>(<div className={styles.inputWrap} style={{flex:"0 0 150px"}}><input type="text" className={styles.input} placeholder="Link word (opt)" value={ff.value} maxLength={40} onChange={ff.onChange}/></div>)}/><button type="button" className={styles.removeBtnSm} onClick={()=>scR(i)} disabled={scF.length<=1}>✕</button></div>))}
            </div>
            {scF.length<20&&<button type="button" className={styles.addBtnSm} onClick={()=>scA({time:"",activity:"",link:""})}>+ Add Row</button>}
          </div>
          <div className={styles.formDivider}/>

          {/* Certification */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>🎓</span><h3 className={styles.sectionTitle}>Certification Section</h3></div>
            <Controller control={control} name="certTitle" rules={{required:"Required"}} render={({field,fieldState})=>(<TXT label="Title" hint="" val={field.value} err={fieldState.error?.message} onCh={field.onChange} ph="Certification at AYM"/>)}/>
            <div className={styles.repeaterBlock}>
              <p className={styles.repeaterLabel}>Paragraphs <span className={styles.badge}>{cpF.length}/4</span></p>
              {cpF.map((f,i)=>(<div key={f.id} className={styles.repeaterRow}><Controller control={control} name={`certParas.${i}.text`} rules={{validate:(v:string)=>!isRteEmpty(v)||"Required"}} render={({field:ff,fieldState:fs})=>(<RTE label={`Para ${i+1}`} hint="" val={ff.value} err={fs.error?.message} onCh={ff.onChange}/>)}/><button type="button" className={styles.removeBtnSm} onClick={()=>cpR(i)} disabled={cpF.length<=1}>✕</button></div>))}
              {cpF.length<4&&<button type="button" className={styles.addBtnSm} onClick={()=>cpA({text:""})}>+ Add Paragraph</button>}
            </div>
          </div>
          <div className={styles.formDivider}/>

          {/* Registration */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}><span className={styles.sectionIcon}>📝</span><h3 className={styles.sectionTitle}>Registration Section</h3></div>
            <Controller control={control} name="regTitle" rules={{required:"Required"}} render={({field,fieldState})=>(<TXT label="Title" hint="" val={field.value} err={fieldState.error?.message} onCh={field.onChange} ph="Registration Process"/>)}/>
            <Controller control={control} name="regDesc" rules={{validate:(v)=>!isRteEmpty(v)||"Required"}} render={({field,fieldState})=>(<RTE label="Description" hint="Booking/advance fee details" val={field.value} err={fieldState.error?.message} onCh={field.onChange}/>)}/>
          </div>
          <div className={styles.formDivider}/>

          {/* Included + Not Included */}
          {([{key:"included",title:"Included in Fee",icon:"✅",fields:inF,appendFn:()=>inA({text:""}),removeFn:inR,ph:"e.g. 14 Days Accommodation and 3 Meals / Day",max:15},{key:"notIncluded",title:"Not Included",icon:"❌",fields:niF,appendFn:()=>niA({text:""}),removeFn:niR,ph:"e.g. Air Ticket and Airport Pickup",max:10}] as const).map((sec)=>(
            <div key={sec.key}>
              <div className={styles.sectionBlock}>
                <div className={styles.sectionHeader}><span className={styles.sectionIcon}>{sec.icon}</span><h3 className={styles.sectionTitle}>{sec.title}</h3><span className={styles.badge}>{sec.fields.length}/{sec.max}</span></div>
                <div className={styles.listItems}>
                  {sec.fields.map((f,i)=>(<div key={f.id} className={styles.listItemRow}><span className={styles.listNum}>{i+1}.</span><Controller control={control} name={`${sec.key}.${i}.text` as any} rules={{required:"Required"}} render={({field:ff,fieldState:fs})=>(<div className={`${styles.inputWrap} ${fs.error?styles.inputError:""} ${ff.value&&!fs.error?styles.inputSuccess:""}`} style={{flex:1}}><input type="text" className={styles.input} placeholder={sec.ph} value={ff.value} maxLength={200} onChange={ff.onChange}/></div>)}/><button type="button" className={styles.removeBtnSm} onClick={()=>sec.removeFn(i)} disabled={sec.fields.length<=1}>✕</button></div>))}
                </div>
                {sec.fields.length<sec.max&&<button type="button" className={styles.addBtnSm} onClick={sec.appendFn}>+ Add Item</button>}
              </div>
              <div className={styles.formDivider}/>
            </div>
          ))}

          <div className={styles.formActions}>
            <Link href="/admin/dashboard/twohundredhourpage/content-part2" className={styles.cancelBtn}>← Back to List</Link>
            <div className={styles.actionsRight}>
              <SavedChip show={saved}/>
              <button type="submit" className={`${styles.submitBtn} ${submitting?styles.submitBtnLoading:""}`} disabled={submitting}>
                {submitting?<><span className={styles.spinner}/> Saving…</>:<><span>✦</span> Update Content Part 2</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}