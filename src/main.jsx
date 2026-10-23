import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, AlertTriangle, BedDouble, Bell, CalendarDays, Check, CheckCircle2,
  ChevronDown, ClipboardList, Clock3, FileText, HeartPulse, LayoutDashboard,
  LogOut, Menu, Plus, Search, Settings, ShieldCheck, Stethoscope, Thermometer,
  Users, X, UserRound, ArrowUpRight, RefreshCw, CircleHelp, Siren
} from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import './styles.css'

const CAPACITY = 74
const STORAGE_KEY = 'carepoint-demo-v1'
const TODAY = new Date().toISOString().slice(0, 10)
const yesterday = (n=1) => { const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10) }
const isoAgo = (n) => yesterday(n)
const uid = (prefix='PT') => `${prefix}-${Math.random().toString(36).slice(2,7).toUpperCase()}`
const seed = () => {
  const patients = [
    {id:'PT-1001',name:'Aarav Mehta',age:34,gender:'Male',room:101,admissionDate:isoAgo(7),status:'Active',temps:[{date:isoAgo(3),value:36.7,unit:'C',time:'08:10'},{date:isoAgo(2),value:36.6,unit:'C',time:'08:15'},{date:isoAgo(1),value:36.8,unit:'C',time:'08:05'},{date:TODAY,value:36.7,unit:'C',time:'08:12'}],visits:[{date:isoAgo(1),notes:'Stable; continue hydration and monitoring.'}],outcome:null},
    {id:'PT-1002',name:'Diya Shah',age:28,gender:'Female',room:102,admissionDate:isoAgo(4),status:'Active',temps:[{date:isoAgo(2),value:36.9,unit:'C',time:'09:00'},{date:isoAgo(1),value:36.8,unit:'C',time:'09:04'}],visits:[],outcome:null},
    {id:'PT-1003',name:'Kabir Joshi',age:51,gender:'Male',room:103,admissionDate:isoAgo(8),status:'Active',temps:[{date:isoAgo(3),value:37.9,unit:'C',time:'07:55'},{date:isoAgo(2),value:37.2,unit:'C',time:'08:00'},{date:isoAgo(1),value:36.9,unit:'C',time:'08:08'},{date:TODAY,value:36.8,unit:'C',time:'08:02'}],visits:[],outcome:null},
    {id:'PT-1004',name:'Anaya Patel',age:43,gender:'Female',room:104,admissionDate:isoAgo(5),status:'Active',temps:[{date:isoAgo(3),value:36.6,unit:'C',time:'08:20'},{date:isoAgo(2),value:36.7,unit:'C',time:'08:25'},{date:isoAgo(1),value:36.5,unit:'C',time:'08:18'}],visits:[{date:isoAgo(2),notes:'Symptoms improving; reassess tomorrow.'}],outcome:null},
    {id:'PT-1005',name:'Vivaan Desai',age:66,gender:'Male',room:105,admissionDate:isoAgo(10),status:'Active',temps:[{date:isoAgo(2),value:38.1,unit:'C',time:'07:45'},{date:isoAgo(1),value:37.8,unit:'C',time:'07:50'},{date:TODAY,value:37.3,unit:'C',time:'07:48'}],visits:[],outcome:null},
    {id:'PT-1006',name:'Sara Khan',age:23,gender:'Female',room:106,admissionDate:isoAgo(3),status:'Active',temps:[{date:isoAgo(1),value:36.6,unit:'C',time:'09:15'}],visits:[],outcome:null},
    {id:'PT-1007',name:'Ishaan Rao',age:39,gender:'Male',room:107,admissionDate:isoAgo(9),status:'Active',temps:[{date:isoAgo(3),value:36.8,unit:'C',time:'08:11'},{date:isoAgo(2),value:36.7,unit:'C',time:'08:10'},{date:isoAgo(1),value:36.8,unit:'C',time:'08:09'},{date:TODAY,value:36.7,unit:'C',time:'08:08'}],visits:[{date:isoAgo(1),notes:'No new concerns.'}],outcome:null},
    {id:'PT-1008',name:'Mira Nair',age:72,gender:'Female',room:108,admissionDate:isoAgo(12),status:'Active',temps:[{date:isoAgo(2),value:36.9,unit:'C',time:'07:30'},{date:isoAgo(1),value:36.8,unit:'C',time:'07:35'},{date:TODAY,value:36.9,unit:'C',time:'07:32'}],visits:[],outcome:null},
    {id:'PT-1009',name:'Reyansh Kulkarni',age:31,gender:'Male',room:109,admissionDate:isoAgo(6),status:'Discharged',temps:[{date:isoAgo(6),value:36.7,unit:'C',time:'08:10'},{date:isoAgo(5),value:36.6,unit:'C',time:'08:10'},{date:isoAgo(4),value:36.8,unit:'C',time:'08:10'}],visits:[],outcome:'Recovered',dischargeDate:isoAgo(2),doctorDecision:'Approved'},
    {id:'PT-1010',name:'Myra Fernandes',age:58,gender:'Female',room:110,admissionDate:isoAgo(14),status:'Discharged',temps:[],visits:[],outcome:'Recovered',dischargeDate:isoAgo(4),doctorDecision:'Approved'},
    {id:'PT-1011',name:'Atharv Singh',age:61,gender:'Male',room:111,admissionDate:isoAgo(16),status:'Deceased',temps:[],visits:[],outcome:'Deceased',outcomeDate:isoAgo(3)},
    {id:'PT-1012',name:'Zoya Iyer',age:19,gender:'Female',room:112,admissionDate:isoAgo(2),status:'Active',temps:[],visits:[],outcome:null}
  ]
  return { patients, threshold:37.5, activity:[{id:1,text:'Demo facility data loaded',time:'Just now',kind:'info'}] }
}
function loadData() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : seed() } catch { return seed() }
}
const tempC = t => t.unit === 'F' ? (t.value - 32) * 5 / 9 : t.value
const formatTemp = t => t ? `${Number(t.value).toFixed(1)}°${t.unit === 'F' ? 'F' : 'C'}` : '—'
const fmtDate = d => d ? new Date(`${d}T12:00:00`).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '—'
const timeNow = () => new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false})
const latest = p => [...(p.temps||[])].sort((a,b)=>b.date.localeCompare(a.date))[0]
function feverFreeDays(p, threshold) {
  if (p.status !== 'Active') return 0
  const map = new Map((p.temps||[]).map(t=>[t.date,tempC(t)]))
  let count = 0
  for (let i=1;i<=3;i++) {
    const day = isoAgo(i)
    if (!map.has(day) || map.get(day) >= threshold) break
    count++
  }
  return count
}
function eligible(p, threshold) { return p.status==='Active' && feverFreeDays(p,threshold)>=3 }
function statusClass(s) { return s.toLowerCase().replaceAll(' ','-') }
function App() {
  const [data,setData] = useState(loadData)
  const [role,setRole] = useState('Nurse')
  const [page,setPage] = useState('Dashboard')
  const [query,setQuery] = useState('')
  const [filter,setFilter] = useState('All patients')
  const [selected,setSelected] = useState(null)
  const [showAdd,setShowAdd] = useState(false)
  const [showTemp,setShowTemp] = useState(null)
  const [showVisit,setShowVisit] = useState(null)
  const [toast,setToast] = useState('')
  const [mobileNav,setMobileNav] = useState(false)
  const [thresholdEdit,setThresholdEdit] = useState(false)
  const [darkMode,setDarkMode] = useState(()=>localStorage.getItem('carepoint-theme')==='dark')
  const [showEdit,setShowEdit] = useState(null)
  useEffect(()=>{ localStorage.setItem(STORAGE_KEY,JSON.stringify(data)) },[data])
  useEffect(()=>{ localStorage.setItem('carepoint-theme',darkMode?'dark':'light') },[darkMode])
  useEffect(()=>{ if(toast){const t=setTimeout(()=>setToast(''),3200);return ()=>clearTimeout(t)} },[toast])
  const active = data.patients.filter(p=>p.status==='Active')
  const occupied = active.length
  const outcomes = data.patients.filter(p=>p.outcome)
  const deaths = outcomes.filter(p=>p.outcome==='Deceased').length
  const survivors = outcomes.filter(p=>p.outcome!=='Deceased').length
  const mortality = outcomes.length ? deaths/outcomes.length*100 : 0
  const pendingTemps = active.filter(p=>!p.temps?.some(t=>t.date===TODAY)).length
  const pendingVisits = active.filter(p=>!p.visits?.some(v=>v.date===TODAY)).length
  const eligiblePatients = active.filter(p=>eligible(p,data.threshold))
  const filtered = useMemo(()=>data.patients.filter(p=>{
    const q=query.toLowerCase()
    const matches = !q || [p.name,p.id,String(p.room),String(p.age)].some(x=>String(x||'').toLowerCase().includes(q))
    const f = filter==='All patients' || (filter==='Active'&&p.status==='Active') || (filter==='Discharge eligible'&&eligible(p,data.threshold)) || p.status===filter
    return matches&&f
  }),[data.patients,query,filter,data.threshold])
  function log(text,kind='info') {
    setData(d=>({...d,activity:[{id:Date.now(),text,time:'Just now',kind},...(d.activity||[])].slice(0,8)}))
    setToast(text)
  }
  function exportPatientsCSV() {
    const rows = [['Patient ID','Name','Age','Gender','Room','Admission Date','Status','Latest Temperature','Outcome','Doctor Decision']]
    data.patients.forEach(p=>rows.push([p.id,p.name,p.age,p.gender||'',p.room||'',p.admissionDate||'',p.status,formatTemp(latest(p)),p.outcome||'',p.doctorDecision||'']))
    const csv = rows.map(row=>row.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\r\n')
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'})
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href=url; a.download=`carepoint-patients-${TODAY}.csv`; a.click(); URL.revokeObjectURL(url)
    setToast('Patient CSV export prepared.')
  }
  function exportBackup() {
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a')
    a.href=url;a.download=`carepoint-backup-${TODAY}.json`;a.click();URL.revokeObjectURL(url)
    setToast('JSON backup downloaded.')
  }
  function importBackup(file) {
    if(!file) return
    const reader=new FileReader()
    reader.onload=()=>{try{
      const incoming=JSON.parse(reader.result)
      if(!Array.isArray(incoming.patients)||typeof incoming.threshold!=='number') throw new Error('Invalid backup')
      if(!confirm(`Import ${incoming.patients.length} patient records and replace the current demo data?`)) return
      setData({...incoming,activity:[{id:Date.now(),text:'Backup imported from file',time:'Just now',kind:'success'},...(incoming.activity||[])]})
      setToast('Backup imported successfully.')
    }catch{setToast('Could not import this file. Choose a valid CarePoint JSON backup.')}};reader.readAsText(file)
  }
  function updatePatient(id,form) {
    const room=Number(form.room)
    if(!form.name.trim()||!Number.isFinite(Number(form.age))||Number(form.age)<0||Number(form.age)>120) return setToast('Enter a valid name and age (0–120).')
    if(form.room && data.patients.some(p=>p.id!==id&&p.status==='Active'&&p.room===room)) return setToast(`Room ${room} is already occupied.`)
    setData(d=>({...d,patients:d.patients.map(p=>p.id!==id?p:{...p,name:form.name.trim(),age:Number(form.age),gender:form.gender,room:form.room?room:p.room})}))
    setShowEdit(null);setSelected(null);log(`Patient details updated for ${form.name.trim()}`,'success')
  }
  function addPatient(form) {
    if(!form.name.trim() || !form.age || Number(form.age)<0 || Number(form.age)>120) return setToast('Enter a valid patient name and age (0–120).')
    if(occupied>=CAPACITY) return setToast('Facility capacity reached. No new admissions allowed.')
    const room = Number(form.room)
    if(!Number.isInteger(room)||room<101||room>174) return setToast('Choose a room from 101 to 174.')
    if(active.some(p=>p.room===room)) return setToast(`Room ${room} is already occupied.`)
    const patient = {id:uid(),name:form.name.trim(),age:Number(form.age),gender:form.gender||'Not specified',room,admissionDate:form.admissionDate||TODAY,status:'Active',temps:form.temp? [{date:form.admissionDate||TODAY,value:Number(form.temp),unit:'C',time:timeNow(),notes:'Initial reading'}]:[],visits:[],outcome:null}
    setData(d=>({...d,patients:[patient,...d.patients]})); setShowAdd(false); log(`Patient ${patient.name} admitted to room ${room}`,'success')
  }
  function saveTemp(patientId, form, correction=false) {
    const val=Number(form.value)
    if(!Number.isFinite(val) || val<(form.unit==='F'?80:25) || val>(form.unit==='F'?115:46)) return setToast('Enter a plausible temperature for this demo.')
    const patient=data.patients.find(p=>p.id===patientId)
    if(!patient || patient.status!=='Active') return setToast('Temperature can only be recorded for an active patient.')
    const exists=patient.temps?.some(t=>t.date===TODAY)
    if(exists&&!correction) return setToast('A temperature is already recorded for today. Use Edit/correction.')
    const entry={date:TODAY,value:val,unit:form.unit||'C',time:timeNow(),notes:form.notes||''}
    setData(d=>({...d,patients:d.patients.map(p=>p.id!==patientId?p:{...p,temps:[...(p.temps||[]).filter(t=>t.date!==TODAY),entry]})}))
    setShowTemp(null); log(`${correction?'Corrected':'Recorded'} temperature for ${patient.name}`,'success')
  }
  function saveVisit(patientId,notes) {
    const p=data.patients.find(x=>x.id===patientId)
    if(!p||p.status!=='Active') return setToast('Visit can only be completed for an active patient.')
    setData(d=>({...d,patients:d.patients.map(x=>x.id!==patientId?x:{...x,visits:[...(x.visits||[]).filter(v=>v.date!==TODAY),{date:TODAY,time:timeNow(),notes:notes.trim()||'Visit completed; no additional notes.'}]})}))
    setShowVisit(null); log(`Doctor visit completed for ${p.name}`,'success')
  }
  function decision(id,approved) {
    if(role!=='Doctor') return setToast('Only a doctor can make the discharge decision.')
    setData(d=>({...d,patients:d.patients.map(p=>p.id!==id?p:{...p,doctorDecision:approved?'Approved':'Declined',decisionDate:TODAY})}))
    log(`Discharge ${approved?'approved':'declined'} for ${data.patients.find(p=>p.id===id)?.name}`,approved?'success':'warning')
  }
  function discharge(id) {
    if(role!=='Admin') return setToast('Only administrative staff can complete discharge.')
    const p=data.patients.find(x=>x.id===id)
    if(!p||p.status!=='Active'||p.doctorDecision!=='Approved') return setToast('Discharge requires an active patient and doctor approval.')
    setData(d=>({...d,patients:d.patients.map(x=>x.id!==id?x:{...x,status:'Discharged',outcome:'Recovered',dischargeDate:TODAY})}))
    log(`${p.name} discharged; room ${p.room} is now available`,'success')
    setSelected(null)
  }
  function recordDeath(id) {
    if(role!=='Admin') return setToast('Only administrative staff can record an outcome in this prototype.')
    const p=data.patients.find(x=>x.id===id)
    if(!p||p.status!=='Active') return setToast('Only active patients can have an outcome recorded.')
    if(!confirm(`Record ${p.name} as deceased? This will release room ${p.room} in the demo.`)) return
    setData(d=>({...d,patients:d.patients.map(x=>x.id!==id?x:{...x,status:'Deceased',outcome:'Deceased',outcomeDate:TODAY})}))
    log(`Outcome recorded for ${p.name}`,'warning');setSelected(null)
  }
  const navItems = [
    {name:'Dashboard',icon:LayoutDashboard},
    {name:'Patients',icon:Users},
    ...(role==='Nurse'?[{name:'Temperature checks',icon:Thermometer}]:[]),
    ...(role==='Doctor'?[{name:'Doctor visits',icon:Stethoscope}]:[]),
    {name:'Discharge management',icon:CheckCircle2},
    {name:'Reports & statistics',icon:FileText}
  ]
  function navigate(name) { setPage(name);setMobileNav(false);setSelected(null) }
  function goPatient(p) { setSelected(p.id) }
  const currentPatient = data.patients.find(p=>p.id===selected)
  return <div className={`app-shell ${darkMode ? "dark-mode" : ""}`}>
    <aside className={`sidebar ${mobileNav?'open':''}`}>
      <div className="brand"><div className="brand-mark"><HeartPulse size={22}/></div><div><strong>CarePoint</strong><small>Facility management</small></div><button className="icon-btn mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="facility-label">FACILITY WORKSPACE</div>
      <nav>{navItems.map(item=><button key={item.name} className={`nav-item ${page===item.name?'active':''}`} onClick={()=>navigate(item.name)}><item.icon size={18}/><span>{item.name}</span>{item.name==='Temperature checks'&&pendingTemps>0&&<b className="nav-count">{pendingTemps}</b>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="demo-note"><ShieldCheck size={17}/><div><b>Demo environment</b><span>Fictional data · Local storage</span></div></div><button className="nav-item" onClick={exportBackup}><FileText size={17}/><span>Export backup</span></button><label className="nav-item import-label"><RefreshCw size={17}/><span>Import backup</span><input type="file" accept="application/json,.json" onChange={e=>{importBackup(e.target.files?.[0]);e.target.value=''}}/></label><button className="nav-item" onClick={()=>{if(confirm('Reset all changes and restore fictional sample data?')){setData(seed());setPage('Dashboard');setToast('Demo data reset.')}}}><RefreshCw size={17}/><span>Reset demo data</span></button><div className="user-mini"><div className="avatar">{role[0]}</div><div><b>{role} account</b><span>Demo access</span></div><LogOut size={16} className="muted"/></div></div>
    </aside>
    {mobileNav&&<div className="overlay" onClick={()=>setMobileNav(false)}></div>}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="icon-btn menu-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><div className="crumb">Facility <span>/</span> <b>{page}</b></div></div><div className="top-actions"><button className="icon-btn theme-toggle" title={darkMode?"Switch to light theme":"Switch to dark theme"} onClick={()=>setDarkMode(v=>!v)}><Activity size={17}/></button><div className="today"><CalendarDays size={16}/>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'2-digit',month:'short'})}</div><button className="icon-btn notification" title="Demo notifications" onClick={()=>setToast(`${pendingTemps} temperature checks and ${pendingVisits} doctor visits are pending today.`)}><Bell size={18}/>{pendingTemps+pendingVisits>0&&<i/>}</button><label className="role-select"><span>View as</span><select value={role} onChange={e=>{setRole(e.target.value);setPage('Dashboard');setSelected(null)}}><option>Nurse</option><option>Doctor</option><option>Admin</option></select><ChevronDown size={14}/></label></div></header>
      <div className="content">
        <div className="demo-banner"><div><ShieldCheck size={16}/><span><b>Prototype mode</b> — fictional sample data only. Not for real patient care.</span></div><button onClick={()=>setToast('Data is stored only in this browser using localStorage.')}>About data <CircleHelp size={14}/></button></div>
        {page==='Dashboard'&&<Dashboard data={data} role={role} occupied={occupied} pendingTemps={pendingTemps} pendingVisits={pendingVisits} eligiblePatients={eligiblePatients} mortality={mortality} deaths={deaths} survivors={survivors} onNavigate={navigate} onPatient={goPatient} thresholdEdit={thresholdEdit} setThresholdEdit={setThresholdEdit} setThreshold={n=>setData(d=>({...d,threshold:n}))}/>}
        {page==='Patients'&&<Patients patients={filtered} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onAdd={()=>setShowAdd(true)} onPatient={goPatient} onTemp={p=>setShowTemp({id:p.id,correction:!!p.temps?.some(t=>t.date===TODAY)})} onExport={exportPatientsCSV} role={role} threshold={data.threshold}/>}
        {page==='Temperature checks'&&<TemperaturePage patients={active} threshold={data.threshold} onPatient={goPatient} onTemp={p=>setShowTemp({id:p.id,correction:!!p.temps?.some(t=>t.date===TODAY)})}/>}
        {page==='Doctor visits'&&<DoctorVisits patients={active} threshold={data.threshold} onPatient={goPatient} onVisit={p=>setShowVisit(p.id)}/>}
        {page==='Discharge management'&&<DischargePage patients={data.patients} threshold={data.threshold} role={role} onPatient={goPatient} onDecision={decision} onDischarge={discharge}/>}
        {page==='Reports & statistics'&&<Reports patients={data.patients} mortality={mortality} deaths={deaths} survivors={survivors} onExport={exportPatientsCSV} onBackup={exportBackup}/>}
      </div>
      <footer className="footer"><span>CarePoint prototype <span className="dot">•</span> v1.0</span><span>Data saved in this browser <span className="dot">•</span> {new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</span></footer>
    </main>
    {currentPatient&&<PatientModal patient={currentPatient} threshold={data.threshold} role={role} onClose={()=>setSelected(null)} onEdit={()=>setShowEdit(currentPatient.id)} onTemp={()=>setShowTemp({id:currentPatient.id,correction:!!currentPatient.temps?.some(t=>t.date===TODAY)})} onVisit={()=>setShowVisit(currentPatient.id)} onDecision={decision} onDischarge={discharge} onDeath={recordDeath}/>}
    {showAdd&&<AddPatientModal patients={active} onClose={()=>setShowAdd(false)} onSave={addPatient}/>}
    {showEdit&&<EditPatientModal patient={data.patients.find(p=>p.id===showEdit)} patients={active} onClose={()=>setShowEdit(null)} onSave={updatePatient}/>}
    {showTemp&&<TemperatureModal patient={data.patients.find(p=>p.id===showTemp.id)} correction={showTemp.correction} onClose={()=>setShowTemp(null)} onSave={saveTemp}/>}
    {showVisit&&<VisitModal patient={data.patients.find(p=>p.id===showVisit)} onClose={()=>setShowVisit(null)} onSave={saveVisit}/>}
    {toast&&<div className="toast"><CheckCircle2 size={18}/><span>{toast}</span><button onClick={()=>setToast('')}><X size={16}/></button></div>}
  </div>
}
function PageTitle({eyebrow,title,description,action}) { return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div> }
function StatCard({icon:Icon,label,value,detail,tone='blue',alert=false}) { return <div className={`stat-card ${alert?'stat-alert':''}`}><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>{alert&&<AlertTriangle className="stat-alert-icon" size={18}/>}</div> }
function Dashboard({data,role,occupied,pendingTemps,pendingVisits,eligiblePatients,mortality,deaths,survivors,onNavigate,onPatient,thresholdEdit,setThresholdEdit,setThreshold}) {
  const active=data.patients.filter(p=>p.status==='Active')
  const recent=data.activity||[]
  const chart=[{name:'Recovered',value:survivors},{name:'Deceased',value:deaths},{name:'Active',value:active.length}]
  return <>
    <PageTitle eyebrow="OVERVIEW" title={`Good ${new Date().getHours()<12?'morning':new Date().getHours()<17?'afternoon':'evening'}`} description="Here’s the facility status and today’s care workload." action={<button className="btn btn-primary" onClick={()=>onNavigate(role==='Nurse'?'Patients':role==='Doctor'?'Doctor visits':'Discharge management')}><Plus size={17}/> Quick action</button>}/>
    <div className="summary-strip"><div className="summary-symbol"><Activity size={22}/></div><div><b>Facility operating status</b><span>Monitoring is active for {occupied} admitted {occupied===1?'patient':'patients'}.</span></div><div className="strip-right"><span className="live-dot"></span> Demo data</div></div>
    <div className="stat-grid">
      <StatCard icon={Users} label="Active patients" value={occupied} detail={`${data.patients.length} total patient records`} tone="blue"/>
      <StatCard icon={BedDouble} label="Room occupancy" value={`${occupied} / ${CAPACITY}`} detail={`${CAPACITY-occupied} rooms available`} tone="purple"/>
      <StatCard icon={Thermometer} label="Temperature checks" value={pendingTemps} detail="Pending today" tone="orange" alert={pendingTemps>0}/>
      <StatCard icon={Stethoscope} label="Doctor visits" value={pendingVisits} detail="Pending today" tone="teal" alert={pendingVisits>0}/>
      <StatCard icon={CheckCircle2} label="Discharge eligible" value={eligiblePatients.length} detail="3 full fever-free days" tone="green"/>
      <StatCard icon={HeartPulse} label="Mortality rate" value={`${mortality.toFixed(1)}%`} detail={`${deaths} deaths / ${data.patients.filter(p=>p.outcome).length} outcomes`} tone={mortality>15?'orange':'green'} alert={mortality>15}/>
    </div>
    {mortality>15&&<div className="alert-banner"><AlertTriangle size={19}/><div><b>Mortality benchmark exceeded</b><span>Current mortality rate is {mortality.toFixed(1)}%, above the 15% benchmark. This is a reporting alert, not a clinical conclusion.</span></div></div>}
    <div className="dashboard-grid">
      <section className="panel task-panel"><div className="panel-head"><div><h2>Today’s task overview</h2><p>Work that needs attention</p></div><span className="date-chip">{fmtDate(TODAY)}</span></div>
        <div className="task-list">
          <button className="task-row" onClick={()=>onNavigate(role==='Nurse'?'Temperature checks':'Patients')}><div className="task-icon orange-bg"><Thermometer size={19}/></div><div className="task-text"><b>Temperature checks</b><span>Daily readings not yet recorded</span></div><strong className={pendingTemps?'number-warn':'number-ok'}>{pendingTemps}</strong><ArrowUpRight size={16} className="muted"/></button>
          <button className="task-row" onClick={()=>onNavigate(role==='Doctor'?'Doctor visits':'Patients')}><div className="task-icon teal-bg"><Stethoscope size={19}/></div><div className="task-text"><b>Doctor visits</b><span>Patients awaiting today’s review</span></div><strong className={pendingVisits?'number-warn':'number-ok'}>{pendingVisits}</strong><ArrowUpRight size={16} className="muted"/></button>
          <button className="task-row" onClick={()=>onNavigate('Discharge management')}><div className="task-icon green-bg"><CheckCircle2 size={19}/></div><div className="task-text"><b>Discharge review</b><span>Meet the fever-free criterion</span></div><strong className="number-ok">{eligiblePatients.length}</strong><ArrowUpRight size={16} className="muted"/></button>
        </div>
        <div className="panel-foot"><span><Clock3 size={14}/> Day resets based on local date</span><button className="text-btn" onClick={()=>setThresholdEdit(!thresholdEdit)}><Settings size={14}/> Fever threshold</button></div>
        {thresholdEdit&&<div className="threshold-control"><label>Illustrative threshold (°C)<input type="number" min="35" max="42" step=".1" value={data.threshold} onChange={e=>setThreshold(Number(e.target.value)||37.5)}/></label><span>Confirm with clinical stakeholders before real use.</span></div>}
      </section>
      <section className="panel occupancy-panel"><div className="panel-head"><div><h2>Facility occupancy</h2><p>Active admissions versus capacity</p></div><BedDouble size={20} className="muted"/></div>
        <div className="occupancy-number"><strong>{occupied}</strong><span>/ {CAPACITY} beds</span></div><div className="progress-track"><div className="progress-fill" style={{width:`${Math.min(100,occupied/CAPACITY*100)}%`}}/></div><div className="occupancy-legend"><span><i className="legend-blue"></i>Occupied <b>{occupied}</b></span><span><i className="legend-gray"></i>Available <b>{CAPACITY-occupied}</b></span></div>
        <div className="occupancy-divider"></div><div className="mini-metric"><div className="mini-icon"><Activity size={17}/></div><div><span>Recovery rate</span><b>{(survivors+deaths)?(survivors/(survivors+deaths)*100).toFixed(1):'0.0'}%</b></div></div>
        <div className="mini-metric"><div className="mini-icon purple"><ShieldCheck size={17}/></div><div><span>Survival outcomes</span><b>{survivors}</b></div></div>
        <button className="btn btn-secondary full-btn" onClick={()=>onNavigate('Reports & statistics')}>View facility report <ArrowUpRight size={16}/></button>
      </section>
    </div>
    <section className="panel recent-panel"><div className="panel-head"><div><h2>Recent activity</h2><p>Latest changes in this browser session</p></div><span className="subtle-tag">Live demo log</span></div>{recent.length?<div className="activity-list">{recent.slice(0,4).map(a=><div className="activity-row" key={a.id}><div className={`activity-dot ${a.kind||'info'}`}></div><span>{a.text}</span><time>{a.time}</time></div>)}</div>:<Empty text="No recent activity yet."/>}</section>
  </>
}
function Patients({patients,query,setQuery,filter,setFilter,onAdd,onPatient,onTemp,onExport,role,threshold}) {
  return <><PageTitle eyebrow="PATIENT CARE" title="Patient directory" description="Search admissions, review status, and open individual patient records." action={role==='Nurse'?<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Add patient</button>:null}/>
    <section className="panel table-panel"><div className="table-toolbar"><div className="searchbox"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, patient ID or room..."/></div><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All patients</option><option>Active</option><option>Discharge eligible</option><option>Discharged</option><option>Deceased</option></select><span className="results-count">{patients.length} records</span><button className="btn btn-secondary btn-sm" onClick={onExport}><FileText size={14}/> Export CSV</button></div>
      <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Room</th><th>Admitted</th><th>Latest temp.</th><th>Today’s check</th><th>Status</th><th></th></tr></thead><tbody>{patients.map(p=>{const t=latest(p);const today=!!p.temps?.some(x=>x.date===TODAY);return <tr key={p.id}><td><button className="patient-cell" onClick={()=>onPatient(p)}><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span><b>{p.name}</b><small>{p.id} · {p.age} years</small></span></button></td><td><span className="room-pill">{p.room?`Room ${p.room}`:'—'}</span></td><td>{fmtDate(p.admissionDate)}</td><td><span className={t&&tempC(t)>=threshold?'temp-high':'temp-normal'}>{formatTemp(t)}</span></td><td><span className={`status-pill ${today?'complete':'pending'}`}><i/>{today?'Completed':'Pending'}</span></td><td><span className={`status-pill ${statusClass(p.status)}`}>{p.status}</span>{eligible(p,threshold)&&<small className="eligible-hint">Discharge eligible</small>}</td><td><button className="small-action" onClick={()=>onPatient(p)}>Details</button>{role==='Nurse'&&p.status==='Active'&&<button className="small-action" onClick={()=>onTemp(p)}>{today?'Edit temp.':'Record temp.'}</button>}</td></tr>})}</tbody></table></div>
      {!patients.length&&<Empty text="No patients match these filters."/>}
    </section>
    <p className="page-note"><CircleHelp size={15}/> Patient records use fictional demo data. Discharged/deceased patients do not count toward room occupancy.</p>
  </>
}
function TemperaturePage({patients,threshold,onPatient,onTemp}) {
  const pending=patients.filter(p=>!p.temps?.some(t=>t.date===TODAY))
  const done=patients.filter(p=>p.temps?.some(t=>t.date===TODAY))
  return <><PageTitle eyebrow="NURSING WORKSPACE" title="Temperature checks" description="Record one daily reading per active patient. Corrections replace today’s existing reading."/>
    <div className="two-stat-row"><div className="inline-stat"><div className="task-icon orange-bg"><Thermometer size={20}/></div><div><span>Pending today</span><b>{pending.length}</b></div></div><div className="inline-stat"><div className="task-icon green-bg"><CheckCircle2 size={20}/></div><div><span>Completed today</span><b>{done.length}</b></div></div></div>
    <section className="panel table-panel"><div className="panel-head padded"><div><h2>Pending checks</h2><p>Prioritize patients without a reading for {fmtDate(TODAY)}.</p></div></div><div className="compact-list">{pending.map(p=><div className="compact-row" key={p.id}><button className="patient-cell" onClick={()=>onPatient(p)}><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span><b>{p.name}</b><small>{p.id} · Room {p.room}</small></span></button><span className="muted">Latest: {formatTemp(latest(p))}</span><button className="btn btn-primary btn-sm" onClick={()=>onTemp(p)}><Plus size={15}/> Record</button></div>)}{!pending.length&&<Empty text="All active patients have a temperature reading for today."/>}</div></section>
    <section className="panel table-panel"><div className="panel-head padded"><div><h2>Completed checks</h2><p>Readings recorded today</p></div></div><div className="compact-list">{done.map(p=><div className="compact-row" key={p.id}><button className="patient-cell" onClick={()=>onPatient(p)}><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span><b>{p.name}</b><small>{p.id} · Room {p.room}</small></span></button><span className={`temp-normal ${tempC(latest(p))>=threshold?'temp-high':''}`}>{formatTemp(p.temps.find(t=>t.date===TODAY))}</span><button className="btn btn-secondary btn-sm" onClick={()=>onTemp(p)}><Settings size={14}/> Correct</button></div>)}{!done.length&&<Empty text="No readings recorded today yet."/>}</div></section>
  </>
}
function DoctorVisits({patients,threshold,onPatient,onVisit}) {
  const pending=patients.filter(p=>!p.visits?.some(v=>v.date===TODAY))
  const done=patients.filter(p=>p.visits?.some(v=>v.date===TODAY))
  return <><PageTitle eyebrow="CLINICAL WORKSPACE" title="Doctor visits" description="Review patients awaiting today’s visit, including their latest temperature-check status."/>
    <div className="two-stat-row"><div className="inline-stat"><div className="task-icon orange-bg"><Clock3 size={20}/></div><div><span>Visits pending</span><b>{pending.length}</b></div></div><div className="inline-stat"><div className="task-icon green-bg"><CheckCircle2 size={20}/></div><div><span>Visits completed</span><b>{done.length}</b></div></div></div>
    {pending.length>0&&<div className="alert-banner soft"><AlertTriangle size={19}/><div><b>Check temperature status first</b><span>Some patients may still need their nurse temperature check. The visit can still be recorded, but the missing reading is highlighted.</span></div></div>}
    <section className="panel table-panel"><div className="panel-head padded"><div><h2>Awaiting doctor visit</h2><p>Review patient information before marking a visit complete.</p></div></div><div className="visit-grid">{pending.map(p=><div className="visit-card" key={p.id}><div className="visit-card-top"><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span className={`status-pill ${p.temps?.some(t=>t.date===TODAY)?'complete':'pending'}`}>{p.temps?.some(t=>t.date===TODAY)?'Temp checked':'Temp pending'}</span></div><h3>{p.name}</h3><p>{p.id} · Room {p.room} · Age {p.age}</p><div className="visit-temp"><span>Latest temperature</span><b className={latest(p)&&tempC(latest(p))>=threshold?'temp-high':''}>{formatTemp(latest(p))}</b></div><div className="visit-actions"><button className="btn btn-secondary btn-sm" onClick={()=>onPatient(p)}>Patient details</button><button className="btn btn-primary btn-sm" onClick={()=>onVisit(p)}><Check size={15}/> Complete visit</button></div></div>)}{!pending.length&&<Empty text="All active patients have a doctor visit recorded for today."/>}</div></section>
    {done.length>0&&<section className="panel table-panel"><div className="panel-head padded"><div><h2>Completed today</h2><p>{done.length} visit(s) documented</p></div></div><div className="compact-list">{done.map(p=><div className="compact-row" key={p.id}><button className="patient-cell" onClick={()=>onPatient(p)}><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span><b>{p.name}</b><small>{p.id} · Room {p.room}</small></span></button><span className="status-pill complete"><i/> Completed</span><button className="small-action" onClick={()=>onPatient(p)}>Review notes</button></div>)}</div></section>}
  </>
}
function DischargePage({patients,threshold,role,onPatient,onDecision,onDischarge}) {
  const active=patients.filter(p=>p.status==='Active')
  const eligibleList=active.filter(p=>eligible(p,threshold))
  const approved=active.filter(p=>p.doctorDecision==='Approved')
  const allActive=active.filter(p=>p.doctorDecision!=='Declined')
  return <><PageTitle eyebrow="PATIENT TRANSITIONS" title="Discharge management" description="Eligibility is a flag, not an automatic discharge. Doctor approval and admin completion are separate steps."/>
    <div className="three-stat-row"><div className="inline-stat"><div className="task-icon green-bg"><CheckCircle2 size={20}/></div><div><span>Eligibility met</span><b>{eligibleList.length}</b></div></div><div className="inline-stat"><div className="task-icon teal-bg"><ShieldCheck size={20}/></div><div><span>Doctor approved</span><b>{approved.length}</b></div></div><div className="inline-stat"><div className="task-icon purple-bg"><BedDouble size={20}/></div><div><span>Recently discharged</span><b>{patients.filter(p=>p.status==='Discharged'&&p.dischargeDate===TODAY).length}</b></div></div></div>
    <section className="panel table-panel"><div className="panel-head padded"><div><h2>Active patients for discharge review</h2><p>Eligibility is calculated from dated readings for the last three complete calendar days.</p></div></div><div className="table-wrap"><table><thead><tr><th>Patient</th><th>Fever-free days</th><th>Eligibility</th><th>Doctor decision</th><th>Next action</th></tr></thead><tbody>{allActive.map(p=>{const days=feverFreeDays(p,threshold);const ok=eligible(p,threshold);return <tr key={p.id}><td><button className="patient-cell" onClick={()=>onPatient(p)}><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span><b>{p.name}</b><small>{p.id} · Room {p.room}</small></span></button></td><td><b>{days} / 3</b><div className="tiny-progress"><span style={{width:`${days/3*100}%`}}/></div></td><td><span className={`status-pill ${ok?'complete':'pending'}`}>{ok?'Criterion met':'Not yet eligible'}</span>{!ok&&<small className="eligible-hint">Missing data or fever may reset count</small>}</td><td><span className={`status-pill ${p.doctorDecision==='Approved'?'complete':p.doctorDecision==='Declined'?'deceased':'pending'}`}>{p.doctorDecision||'Pending'}</span></td><td><div className="action-stack">{role==='Doctor'&&<><button className="small-action" disabled={!ok||p.doctorDecision==='Approved'} onClick={()=>onDecision(p.id,true)}>Approve</button><button className="small-action danger-text" disabled={p.doctorDecision==='Declined'} onClick={()=>onDecision(p.id,false)}>Decline</button></>}{role==='Admin'&&<button className="btn btn-primary btn-sm" disabled={p.doctorDecision!=='Approved'} onClick={()=>onDischarge(p.id)}>Complete discharge</button>}{role!=='Doctor'&&role!=='Admin'&&<button className="small-action" onClick={()=>onPatient(p)}>View details</button>}</div></td></tr>})}</tbody></table></div>{!allActive.length&&<Empty text="There are no active patients to review."/>}</section>
    <div className="page-note"><CircleHelp size={15}/> The PRD does not define a clinical fever threshold. This prototype defaults to 37.5°C as an illustrative setting only; it is not a medical recommendation.</div>
    <section className="panel table-panel"><div className="panel-head padded"><div><h2>Discharged and closed records</h2><p>Historical outcomes are retained; released rooms are available for new admissions.</p></div></div><div className="compact-list">{patients.filter(p=>p.status!=='Active').map(p=><div className="compact-row" key={p.id}><button className="patient-cell" onClick={()=>onPatient(p)}><span className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span><b>{p.name}</b><small>{p.id} · Room {p.room}</small></span></button><span className={`status-pill ${statusClass(p.status)}`}>{p.status}</span><span className="muted">{p.outcomeDate?fmtDate(p.outcomeDate):p.dischargeDate?fmtDate(p.dischargeDate):'—'}</span><button className="small-action" onClick={()=>onPatient(p)}>Details</button></div>)}{!patients.some(p=>p.status!=='Active')&&<Empty text="No closed records yet."/>}</div></section>
  </>
}
function Reports({patients,mortality,deaths,survivors,onExport,onBackup}) {
  const outcomes=patients.filter(p=>p.outcome)
  const chartData=[{name:'Recovered',value:survivors},{name:'Deceased',value:deaths}]
  const monthly=[{month:'Admissions',count:patients.length},{month:'Active',count:patients.filter(p=>p.status==='Active').length},{month:'Discharged',count:patients.filter(p=>p.status==='Discharged').length},{month:'Deaths',count:deaths}]
  return <><PageTitle eyebrow="FACILITY ANALYTICS" title="Reports & statistics" description="Outcome metrics use only patients with a recorded outcome as the denominator." action={<div className="title-actions"><button className="btn btn-secondary" onClick={onExport}><FileText size={15}/> Export CSV</button><button className="btn btn-primary" onClick={onBackup}><RefreshCw size={15}/> Backup JSON</button></div>}/>
    {mortality>15&&<div className="alert-banner"><AlertTriangle size={19}/><div><b>Mortality benchmark exceeded</b><span>Mortality is {mortality.toFixed(1)}%, above the 15% benchmark. Review the underlying records; this prototype does not infer causation.</span></div></div>}
    <div className="stat-grid report-stats"><StatCard icon={Users} label="Total admissions" value={patients.length} detail="All patient records" tone="blue"/><StatCard icon={CheckCircle2} label="Discharged" value={patients.filter(p=>p.status==='Discharged').length} detail="Completed discharge" tone="green"/><StatCard icon={HeartPulse} label="Recoveries" value={survivors} detail="Recorded survivor outcomes" tone="teal"/><StatCard icon={Activity} label="Deaths" value={deaths} detail="Recorded deceased outcomes" tone="orange"/><StatCard icon={AlertTriangle} label="Mortality rate" value={`${mortality.toFixed(1)}%`} detail="Benchmark: 15%" tone={mortality>15?'orange':'green'} alert={mortality>15}/><StatCard icon={ShieldCheck} label="Survival rate" value={`${outcomes.length?(survivors/outcomes.length*100).toFixed(1):'0.0'}%`} detail="Among recorded outcomes" tone="purple"/></div>
    <div className="reports-grid"><section className="panel chart-panel"><div className="panel-head"><div><h2>Recorded outcomes</h2><p>Patients with an outcome on file</p></div></div>{outcomes.length?<><div className="chart-wrap"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={82} paddingAngle={4}>{chartData.map((e,i)=><Cell key={e.name} fill={i===0?'#2e9b78':'#e58b54'}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="chart-legend"><span><i className="legend-green"></i>Recovered <b>{survivors}</b></span><span><i className="legend-orange"></i>Deceased <b>{deaths}</b></span></div></div></>:<Empty text="No recorded outcomes yet."/>}</section>
      <section className="panel chart-panel"><div className="panel-head"><div><h2>Facility record counts</h2><p>Current snapshot, not a time series</p></div></div><div className="chart-wrap"><ResponsiveContainer width="100%" height={250}><BarChart data={monthly} margin={{top:10,right:8,left:-18,bottom:0}}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf4"/><XAxis dataKey="month" tick={{fontSize:11,fill:'#718096'}} axisLine={false} tickLine={false}/><YAxis allowDecimals={false} tick={{fontSize:11,fill:'#718096'}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey="count" fill="#4f83d1" radius={[5,5,0,0]} maxBarSize={42}/></BarChart></ResponsiveContainer></div></section></div>
    <section className="panel table-panel"><div className="panel-head padded"><div><h2>Metric definitions</h2><p>As specified in the product requirements</p></div></div><div className="definition-list"><div><b>Mortality rate</b><code>Deaths ÷ patients with recorded outcomes × 100</code></div><div><b>Survival rate</b><code>Survivors ÷ patients with recorded outcomes × 100</code></div><div><b>Occupancy</b><code>Active admissions; maximum capacity = 74</code></div><div><b>Mortality alert</b><code>Display warning when mortality rate exceeds 15%</code></div></div></section>
  </>
}
function PatientModal({patient:p,threshold,role,onClose,onEdit,onTemp,onVisit,onDecision,onDischarge,onDeath}) {
  const t=latest(p),todayTemp=p.temps?.find(x=>x.date===TODAY),todayVisit=p.visits?.find(x=>x.date===TODAY),days=feverFreeDays(p,threshold),ok=eligible(p,threshold)
  return <Modal title="Patient details" onClose={onClose} wide><div className="patient-detail-head"><div className="patient-avatar big">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><h2>{p.name}</h2><p>{p.id} · {p.age} years · {p.gender||'Gender not specified'}</p><div className="detail-tags"><span className={`status-pill ${statusClass(p.status)}`}>{p.status}</span><span className="room-pill">Room {p.room||'—'}</span></div></div></div>
    <div className="detail-stats"><div><span>Admission date</span><b>{fmtDate(p.admissionDate)}</b></div><div><span>Latest temperature</span><b className={t&&tempC(t)>=threshold?'temp-high':''}>{formatTemp(t)}</b></div><div><span>Fever-free days</span><b>{p.status==='Active'?`${days} / 3`:'—'}</b></div><div><span>Doctor visit today</span><b>{todayVisit?'Completed':'Pending'}</b></div></div>
    <div className="detail-section"><div className="section-title"><h3>Temperature history</h3>{role==='Nurse'&&p.status==='Active'&&<button className="small-action" onClick={onTemp}>{todayTemp?'Edit today’s reading':'Record temperature'}</button>}</div>{p.temps?.length?<div className="history-table">{[...p.temps].sort((a,b)=>b.date.localeCompare(a.date)).map((x,i)=><div key={i}><span>{fmtDate(x.date)}</span><b className={tempC(x)>=threshold?'temp-high':'temp-normal'}>{formatTemp(x)}</b><span>{x.time||'—'}</span><small>{x.notes||'—'}</small></div>)}</div>:<Empty text="No temperature readings recorded."/>}</div>
    <div className="detail-section"><div className="section-title"><h3>Doctor notes</h3>{role==='Doctor'&&p.status==='Active'&&<button className="small-action" onClick={onVisit}>{todayVisit?'Review / update visit':'Record doctor visit'}</button>}</div>{p.visits?.length?<div className="notes-list">{[...p.visits].sort((a,b)=>b.date.localeCompare(a.date)).map((v,i)=><div key={i}><b>{fmtDate(v.date)} {v.time||''}</b><p>{v.notes}</p></div>)}</div>:<Empty text="No doctor visit notes yet."/>}</div>
    <div className="discharge-callout"><div className={`task-icon ${ok?'green-bg':'orange-bg'}`}>{ok?<CheckCircle2 size={19}/>:<Clock3 size={19}/>}</div><div><b>{ok?'Three-day criterion met':'Discharge criterion not met'}</b><span>{ok?'A doctor must still make the discharge decision.':`Current count: ${days}/3 complete fever-free days. Missing readings do not count as fever-free.`}</span></div><span className={`status-pill ${ok?'complete':'pending'}`}>{p.doctorDecision||'Decision pending'}</span></div>
    <div className="modal-actions spread"><div>{role==='Admin'&&p.status==='Active'&&<button className="btn btn-secondary danger-outline" onClick={()=>onDeath(p.id)}>Record death</button>}{role!=='Nurse'&&p.status==='Active'&&<button className="btn btn-secondary" onClick={onEdit}><Settings size={14}/> Edit details</button>}</div><div><button className="btn btn-secondary" onClick={onClose}>Close</button>{role==='Doctor'&&p.status==='Active'&&ok&&<><button className="btn btn-secondary" onClick={()=>onDecision(p.id,false)}>Decline</button><button className="btn btn-primary" onClick={()=>onDecision(p.id,true)}>Approve discharge</button></>}{role==='Admin'&&p.status==='Active'&&p.doctorDecision==='Approved'&&<button className="btn btn-primary" onClick={()=>onDischarge(p.id)}>Complete discharge</button>}</div></div>
  </Modal>
}
function AddPatientModal({patients,onClose,onSave}) {
  const used=new Set(patients.map(p=>p.room))
  const first=Array.from({length:74},(_,i)=>101+i).find(r=>!used.has(r))||''
  const [form,setForm]=useState({name:'',age:'',gender:'',room:String(first),admissionDate:TODAY,temp:''})
  const [error,setError]=useState('')
  function submit(e){e.preventDefault();if(!form.name.trim()||form.age===''||Number(form.age)<0||Number(form.age)>120){setError('Enter a name and a valid age between 0 and 120.');return}if(!form.room||used.has(Number(form.room))){setError('Select an available room.');return}onSave(form)}
  return <Modal title="Admit new patient" onClose={onClose}><form onSubmit={submit} className="form-grid"><div className="field full"><label>Patient full name *</label><input required autoFocus value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Enter full name"/></div><div className="field"><label>Age *</label><input required type="number" min="0" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})} placeholder="Years"/></div><div className="field"><label>Gender</label><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option value="">Not specified</option><option>Female</option><option>Male</option><option>Other</option></select></div><div className="field"><label>Admission date *</label><input required type="date" max={TODAY} value={form.admissionDate} onChange={e=>setForm({...form,admissionDate:e.target.value})}/></div><div className="field"><label>Assign room *</label><select required value={form.room} onChange={e=>setForm({...form,room:e.target.value})}><option value="">Select available room</option>{Array.from({length:74},(_,i)=>101+i).filter(r=>!used.has(r)).map(r=><option key={r} value={r}>Room {r}</option>)}</select></div><div className="field full"><label>Initial temperature (°C, optional)</label><input type="number" min="25" max="46" step=".1" value={form.temp} onChange={e=>setForm({...form,temp:e.target.value})} placeholder="e.g. 36.8"/></div>{error&&<div className="form-error full"><AlertTriangle size={15}/>{error}</div>}<div className="modal-actions full"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary"><Plus size={16}/> Admit patient</button></div></form><p className="form-footnote">Patient ID is generated automatically. Maximum facility capacity: 74 active patients.</p></Modal>
}
function EditPatientModal({patient:p,patients,onClose,onSave}) {
  const [form,setForm]=useState({name:p?.name||'',age:String(p?.age??''),gender:p?.gender||'',room:String(p?.room||'')})
  if(!p)return null
  const used=new Set(patients.filter(x=>x.id!==p.id&&x.status==='Active').map(x=>x.room))
  return <Modal title="Edit patient details" onClose={onClose}><form className="form-grid" onSubmit={e=>{e.preventDefault();onSave(p.id,form)}}><div className="field full"><label>Patient name *</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="field"><label>Age *</label><input required type="number" min="0" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/></div><div className="field"><label>Gender</label><select value={form.gender} onChange={e=>setForm({...form,gender:e.target.value})}><option>Not specified</option><option>Female</option><option>Male</option><option>Other</option></select></div><div className="field full"><label>Room assignment</label><select value={form.room} disabled={p.status!=='Active'} onChange={e=>setForm({...form,room:e.target.value})}>{Array.from({length:74},(_,i)=>101+i).filter(r=>!used.has(r)).map(r=><option key={r} value={r}>Room {r}</option>)}</select><small className="field-hint">Room assignment can only be changed for active patients.</small></div><div className="modal-actions full"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary"><Check size={15}/> Save changes</button></div></form></Modal>
}
function TemperatureModal({patient:p,correction,onClose,onSave}) {
  const current=p?.temps?.find(t=>t.date===TODAY)
  const [form,setForm]=useState({value:current?.value??'',unit:current?.unit??'C',notes:current?.notes??''})
  if(!p)return null
  return <Modal title={correction?'Correct today’s temperature':'Record temperature'} onClose={onClose}><div className="modal-patient-summary"><div className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>{p.name}</b><span>{p.id} · Room {p.room}</span></div><span className="date-chip">{fmtDate(TODAY)}</span></div>{correction&&<div className="alert-banner soft compact-alert"><AlertTriangle size={17}/><div><b>Existing reading found</b><span>Saving replaces today’s reading; the previous value is not retained as an audit entry.</span></div></div>}<form className="form-grid" onSubmit={e=>{e.preventDefault();onSave(p.id,form,correction)}}><div className="field"><label>Temperature *</label><input required type="number" step=".1" min={form.unit==='F'?80:25} max={form.unit==='F'?115:46} value={form.value} onChange={e=>setForm({...form,value:e.target.value})} placeholder={form.unit==='F'?'98.6':'36.8'}/></div><div className="field"><label>Unit</label><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option value="C">Celsius (°C)</option><option value="F">Fahrenheit (°F)</option></select></div><div className="field full"><label>Notes (optional)</label><textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Add a short observation..."/></div><div className="modal-actions full"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit"><Check size={16}/> Save reading</button></div></form></Modal>
}
function VisitModal({patient:p,onClose,onSave}) {
  const current=p?.visits?.find(v=>v.date===TODAY)
  const [notes,setNotes]=useState(current?.notes||'')
  if(!p)return null
  return <Modal title={current?'Review today’s doctor visit':'Complete doctor visit'} onClose={onClose}><div className="modal-patient-summary"><div className="patient-avatar">{p.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><b>{p.name}</b><span>{p.id} · Room {p.room}</span></div></div>{!p.temps?.some(t=>t.date===TODAY)&&<div className="alert-banner soft compact-alert"><AlertTriangle size={17}/><div><b>Temperature check pending</b><span>No reading is recorded for today. Consider coordinating with nursing staff.</span></div></div>}<form className="form-grid" onSubmit={e=>{e.preventDefault();onSave(p.id,notes)}}><div className="field full"><label>Visit notes / treatment observations</label><textarea rows="5" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Document review findings and next steps..."/></div><div className="modal-actions full"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary"><Check size={16}/>{current?'Update visit':'Mark visit completed'}</button></div></form></Modal>
}
function Modal({title,onClose,children,wide=false}) { useEffect(()=>{const f=e=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onClose]);return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className={`modal ${wide?'modal-wide':''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close dialog"><X size={19}/></button></div><div className="modal-body">{children}</div></div></div> }
function Empty({text}) { return <div className="empty-state"><div><ClipboardList size={23}/></div><b>Nothing to show</b><span>{text}</span></div> }
createRoot(document.getElementById('root')).render(<App/>)
