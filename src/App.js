import React, { useState, useMemo } from 'react';
import { CLAIMS, DENIALS, TASKS, AGENTS, ELIGIBILITY, PATIENTS, PRACTICES, PAYMENTS, APPEAL_LETTER } from './data';

// ─── STYLES ──────────────────────────────────────────────
const C = { primary:'#1e40af', blue:'#2563eb', green:'#16a34a', amber:'#d97706', red:'#dc2626', purple:'#7c3aed', cyan:'#0891b2', pink:'#db2777', text:'#0f172a', muted:'#64748b', light:'#94a3b8', border:'#e2e8f0', bg:'#f8fafc', card:'#ffffff' };

const statusColors = {
  paid:'#16a34a', verified:'#16a34a', completed:'#16a34a', approved:'#16a34a', won:'#16a34a', active:'#16a34a',
  submitted:'#2563eb', in_review:'#2563eb', pending_payer:'#d97706', pending:'#d97706', pending_review:'#d97706',
  scrubbing:'#7c3aed', denied:'#dc2626', rejected:'#dc2626', failed:'#dc2626',
  appealed:'#ea580c', appealing:'#ea580c', reviewing:'#4f46e5', correcting:'#4f46e5',
  new:'#64748b', open:'#d97706', draft:'#64748b', ready:'#0891b2', approved_to_send:'#16a34a',
};

// ─── SHARED COMPONENTS ───────────────────────────────────
function Badge({ status }) {
  const c = statusColors[status] || '#64748b';
  return <span style={{ background: c+'15', color: c, padding:'3px 10px', borderRadius:10, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.4px', whiteSpace:'nowrap' }}>{(status||'').replace(/_/g,' ')}</span>;
}

function Metric({ label, value, sub, color=C.blue }) {
  return (
    <div style={{ background:C.card, borderRadius:10, padding:'18px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)', borderLeft:`4px solid ${color}`, flex:'1 1 180px', minWidth:165 }}>
      <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color:C.text, letterSpacing:'-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:C.light, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style={} }) {
  return <div style={{ background:C.card, borderRadius:10, boxShadow:'0 1px 3px rgba(0,0,0,0.05)', overflow:'hidden', ...style }}>{children}</div>;
}

function Table({ headers, children }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12.5, minWidth:700 }}>
        <thead><tr style={{ background:'#f8fafc', borderBottom:'2px solid #e2e8f0' }}>
          {headers.map(h => <th key={h} style={{ textAlign:'left', padding:'10px 12px', color:C.muted, fontWeight:700, fontSize:10.5, textTransform:'uppercase', letterSpacing:'0.6px', whiteSpace:'nowrap' }}>{h}</th>)}
        </tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Td({ children, style={} }) {
  return <td style={{ padding:'10px 12px', borderBottom:'1px solid #f1f5f9', ...style }}>{children}</td>;
}

// ─── LOGIN PAGE ──────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('demo@meridianbilling.com');
  const [pass, setPass] = useState('demo123');
  const [error, setError] = useState('');
  const handleLogin = () => {
    if (email === 'demo@meridianbilling.com' && pass === 'demo123') onLogin();
    else setError('Invalid credentials. Use demo@meridianbilling.com / demo123');
  };
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg, #0c1220 0%, #1a2744 40%, #0f2027 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="fade-in" style={{ background:'#fff', borderRadius:16, padding:'48px 40px', width:400, maxWidth:'100%', boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:36, marginBottom:8 }}>⚕️</div>
          <div style={{ fontSize:24, fontWeight:800, color:C.text, letterSpacing:'-0.5px' }}>Meridian RCM</div>
          <div style={{ fontSize:12, color:C.blue, fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginTop:4 }}>AI-Powered Revenue Cycle</div>
        </div>
        {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'10px 14px', borderRadius:8, fontSize:12, marginBottom:16 }}>{error}</div>}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:'block', marginBottom:5 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:12, fontWeight:600, color:C.muted, display:'block', marginBottom:5 }}>Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==='Enter' && handleLogin()} style={{ width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid #e2e8f0', fontSize:14, outline:'none' }} />
        </div>
        <button onClick={handleLogin} style={{ width:'100%', padding:'12px', borderRadius:8, border:'none', background:C.blue, color:'#fff', fontSize:14, fontWeight:700 }}>Sign In</button>
        <div style={{ textAlign:'center', marginTop:16, fontSize:11, color:C.light }}>Demo: demo@meridianbilling.com / demo123</div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────
function Dashboard() {
  const totalCharges = CLAIMS.reduce((s,c) => s+c.total_charge, 0);
  const totalCollected = CLAIMS.reduce((s,c) => s+(c.total_paid||0), 0);
  const deniedAmt = DENIALS.reduce((s,d) => s+d.amount_denied, 0);
  const avgAR = Math.round(CLAIMS.filter(c=>!['paid','void','draft'].includes(c.status)).reduce((s,c)=>s+c.days_in_ar,0) / CLAIMS.filter(c=>!['paid','void','draft'].includes(c.status)).length);
  const statusGroups = {};
  CLAIMS.forEach(c => { statusGroups[c.status] = statusGroups[c.status] || { count:0, total:0 }; statusGroups[c.status].count++; statusGroups[c.status].total += c.total_charge; });
  const sortedStatuses = Object.entries(statusGroups).sort((a,b) => b[1].total - a[1].total);
  const barColors = [C.blue, C.green, C.amber, C.red, '#7c3aed', '#ea580c', '#0891b2', '#db2777'];
  const agentPerf = {};
  AGENTS.forEach(a => { agentPerf[a.agent_type] = agentPerf[a.agent_type] || { actions:0, ok:0, totalMs:0 }; agentPerf[a.agent_type].actions++; if(a.status==='completed') agentPerf[a.agent_type].ok++; agentPerf[a.agent_type].totalMs += a.processing_time_ms; });

  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Total Claims" value={CLAIMS.length} sub={`$${totalCharges.toLocaleString()} in charges`} color={C.blue} />
        <Metric label="Collected" value={`$${totalCollected.toLocaleString()}`} sub={`${(totalCollected/totalCharges*100).toFixed(1)}% of charges`} color={C.green} />
        <Metric label="Denials" value={DENIALS.length} sub={`$${deniedAmt.toLocaleString()} at risk`} color={C.red} />
        <Metric label="Avg Days in A/R" value={avgAR} sub="Target: < 35 days" color={C.amber} />
      </div>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Practices" value={PRACTICES.length} color={C.purple} />
        <Metric label="Patients" value={PATIENTS.length} color={C.cyan} />
        <Metric label="Pending Tasks" value={TASKS.filter(t=>t.status!=='completed').length} sub="Require human review" color={C.amber} />
        <Metric label="AI Agent Actions" value={AGENTS.length} sub="Last 24 hours" color={C.pink} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
        <Card style={{ padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, margin:'0 0 14px' }}>Claims by Status</h3>
          {sortedStatuses.map(([status, data], i) => (
            <div key={status} style={{ marginBottom:9 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><span style={{ width:8, height:8, borderRadius:2, background:barColors[i%barColors.length] }} />{status.replace(/_/g,' ')}</span>
                <span style={{ fontWeight:600 }}>{data.count} claims — ${data.total.toLocaleString()}</span>
              </div>
              <div style={{ height:5, background:'#f1f5f9', borderRadius:3 }}><div style={{ height:'100%', width:`${(data.total/totalCharges)*100}%`, background:barColors[i%barColors.length], borderRadius:3 }} /></div>
            </div>
          ))}
        </Card>
        <Card style={{ padding:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, margin:'0 0 14px' }}>AI Agent Performance</h3>
          <Table headers={['Agent','Actions','Success Rate','Avg Time']}>
            {Object.entries(agentPerf).map(([type, data]) => (
              <tr key={type}><Td style={{ fontWeight:500 }}>{type.replace(/_/g,' ')}</Td><Td>{data.actions}</Td>
              <Td><span style={{ color:data.ok/data.actions>=0.9?C.green:C.amber, fontWeight:700 }}>{Math.round(data.ok/data.actions*100)}%</span></Td>
              <Td style={{ fontFamily:'monospace', fontSize:11 }}>{Math.round(data.totalMs/data.actions).toLocaleString()}ms</Td></tr>
            ))}
          </Table>
        </Card>
      </div>
      <Card style={{ padding:20 }}>
        <h3 style={{ fontSize:14, fontWeight:700, margin:'0 0 14px' }}>Denial Categories</h3>
        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
          {['authorization','medical_necessity','coding'].map((cat, i) => {
            const ds = DENIALS.filter(d => d.denial_category === cat);
            const total = ds.reduce((s,d) => s+d.amount_denied, 0);
            const colors = [C.red, C.amber, C.purple];
            return (
              <div key={cat} style={{ flex:'1 1 200px', background:colors[i]+'08', borderRadius:8, padding:14, borderLeft:`3px solid ${colors[i]}` }}>
                <div style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', color:colors[i], marginBottom:4 }}>{cat.replace(/_/g,' ')}</div>
                <div style={{ fontSize:22, fontWeight:800, color:C.text }}>{ds.length} denials</div>
                <div style={{ fontSize:12, color:C.muted }}>${total.toLocaleString()} at risk</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── CLAIMS ──────────────────────────────────────────────
function ClaimsPage({ onSelect }) {
  const [filter, setFilter] = useState('all');
  const statuses = [...new Set(CLAIMS.map(c=>c.status))];
  const filtered = filter==='all' ? CLAIMS : CLAIMS.filter(c=>c.status===filter);
  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
        {['all',...statuses].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{ padding:'5px 12px', borderRadius:14, border:filter===s?`2px solid ${C.blue}`:'1px solid #e2e8f0', background:filter===s?'#eff6ff':'#fff', fontSize:11.5, fontWeight:filter===s?700:500, color:filter===s?C.blue:'#475569', textTransform:'capitalize' }}>
            {s==='all'?`All (${CLAIMS.length})`:`${s.replace(/_/g,' ')} (${CLAIMS.filter(c=>c.status===s).length})`}
          </button>
        ))}
      </div>
      <Card>
        <Table headers={['Claim #','Patient','Practice','Payer','DOS','ICD / CPT','Charge','Paid','Status','Days AR']}>
          {filtered.map(c => (
            <tr key={c.id} onClick={()=>onSelect(c)} style={{ cursor:'pointer' }} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
              <Td style={{ fontWeight:700, color:C.blue }}>{c.claim_number}</Td>
              <Td style={{ fontWeight:500 }}>{c.patient_name}</Td>
              <Td style={{ fontSize:11, color:C.muted }}>{c.practice_name}</Td>
              <Td>{c.payer_name}</Td>
              <Td style={{ whiteSpace:'nowrap' }}>{c.service_date}</Td>
              <Td style={{ fontFamily:'monospace', fontSize:10.5 }}>{c.primary_icd} / {c.cpt_codes}</Td>
              <Td style={{ fontWeight:600 }}>${c.total_charge.toLocaleString()}</Td>
              <Td style={{ color:c.total_paid?C.green:C.light }}>{c.total_paid!=null?`$${c.total_paid.toLocaleString()}`:'-'}</Td>
              <Td><Badge status={c.status}/></Td>
              <Td style={{ fontWeight:c.days_in_ar>60?800:c.days_in_ar>30?600:400, color:c.days_in_ar>60?C.red:c.days_in_ar>30?C.amber:C.text }}>{c.days_in_ar}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── CLAIM DETAIL ────────────────────────────────────────
function ClaimDetail({ claim, onBack }) {
  const denial = DENIALS.find(d => d.claim_number === claim.claim_number);
  return (
    <div className="fade-in">
      <button onClick={onBack} style={{ background:'none', border:'none', color:C.blue, fontSize:13, fontWeight:600, marginBottom:16, display:'flex', alignItems:'center', gap:4 }}>← Back to Claims</button>
      <Card style={{ padding:24, marginBottom:12 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:C.text, marginBottom:4 }}>{claim.claim_number}</div>
            <div style={{ fontSize:14, color:C.muted }}>{claim.patient_name} — {claim.practice_name}</div>
            <div style={{ fontSize:12, color:C.light, marginTop:2 }}>Provider: {claim.provider} | Filed: {claim.filing_date || 'Not yet filed'}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <Badge status={claim.status} />
            <div style={{ fontSize:28, fontWeight:800, marginTop:8, color:C.text }}>${claim.total_charge.toLocaleString()}</div>
          </div>
        </div>
      </Card>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:12 }}>
        <Card style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', marginBottom:8 }}>Payer Information</div>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{claim.payer_name}</div>
          <div style={{ fontSize:12, color:C.muted }}>Service Date: {claim.service_date}</div>
          <div style={{ fontSize:12, color:C.muted }}>Days in A/R: <span style={{ fontWeight:700, color:claim.days_in_ar>60?C.red:claim.days_in_ar>30?C.amber:C.text }}>{claim.days_in_ar}</span></div>
        </Card>
        <Card style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', marginBottom:8 }}>Clinical Codes</div>
          <div style={{ fontSize:12, marginBottom:4 }}>ICD-10: <span style={{ fontFamily:'monospace', fontWeight:600 }}>{claim.primary_icd}</span></div>
          <div style={{ fontSize:12 }}>CPT: <span style={{ fontFamily:'monospace', fontWeight:600 }}>{claim.cpt_codes}</span></div>
        </Card>
        <Card style={{ padding:16 }}>
          <div style={{ fontSize:11, fontWeight:600, color:C.muted, textTransform:'uppercase', marginBottom:8 }}>Financials</div>
          <div style={{ fontSize:12, marginBottom:2 }}>Charged: <strong>${claim.total_charge.toLocaleString()}</strong></div>
          <div style={{ fontSize:12, marginBottom:2 }}>Paid: <strong style={{ color:claim.total_paid?C.green:C.light }}>{claim.total_paid!=null?`$${claim.total_paid.toLocaleString()}`:'-'}</strong></div>
          <div style={{ fontSize:12 }}>Patient: <strong>{claim.patient_resp!=null?`$${claim.patient_resp}`:'-'}</strong></div>
        </Card>
      </div>
      {denial && (
        <Card style={{ padding:20, borderLeft:`4px solid ${C.red}`, marginBottom:12 }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.red, marginBottom:8 }}>Denial: {denial.denial_code} — {denial.denial_category.replace(/_/g,' ').toUpperCase()}</div>
          <div style={{ fontSize:13, color:C.text, marginBottom:12, lineHeight:1.5 }}>{denial.denial_reason}</div>
          <div style={{ background:C.purple+'08', borderRadius:8, padding:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.purple, marginBottom:6 }}>AI ANALYSIS ({Math.round(denial.ai_confidence*100)}% confidence)</div>
            <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{denial.ai_classification.recommended_action}</div>
          </div>
          {denial.appeal_deadline && <div style={{ fontSize:11, color:C.red, fontWeight:600, marginTop:8 }}>Appeal deadline: {denial.appeal_deadline}</div>}
        </Card>
      )}
      {claim.claim_number === 'CLM-2024-00005' && (
        <Card style={{ padding:20, borderLeft:`4px solid ${C.blue}` }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.blue, marginBottom:10 }}>AI-Generated Appeal Letter</div>
          <div style={{ fontSize:12.5, color:C.text, lineHeight:1.7, whiteSpace:'pre-wrap', fontFamily:'Georgia, serif' }}>{APPEAL_LETTER}</div>
        </Card>
      )}
    </div>
  );
}

// ─── DENIALS ─────────────────────────────────────────────
function DenialsPage() {
  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Total Denials" value={DENIALS.length} color={C.red} />
        <Metric label="Total at Risk" value={`$${DENIALS.reduce((s,d)=>s+d.amount_denied,0).toLocaleString()}`} color={C.amber} />
        <Metric label="Appealable" value={DENIALS.filter(d=>d.is_appealable).length} color={C.blue} />
        <Metric label="Avg AI Confidence" value={`${Math.round(DENIALS.reduce((s,d)=>s+d.ai_confidence,0)/DENIALS.length*100)}%`} color={C.purple} />
      </div>
      {DENIALS.map(d => (
        <Card key={d.id} style={{ padding:20, marginBottom:10, borderLeft:`4px solid ${C.red}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:12 }}>
            <div><div style={{ fontSize:15, fontWeight:700 }}>{d.claim_number} — {d.patient_name}</div><div style={{ fontSize:11, color:C.muted }}>{d.practice_name} | {d.payer_name} | DOS: {d.service_date}</div></div>
            <div style={{ textAlign:'right' }}><div style={{ fontSize:22, fontWeight:800, color:C.red }}>${d.amount_denied.toLocaleString()}</div><Badge status={d.status} /></div>
          </div>
          <div style={{ background:'#fef2f2', borderRadius:8, padding:12, marginBottom:10 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#991b1b', marginBottom:3 }}>{d.denial_code} — {d.denial_category.replace(/_/g,' ').toUpperCase()}</div>
            <div style={{ fontSize:12.5, color:C.text, lineHeight:1.5 }}>{d.denial_reason}</div>
          </div>
          <div style={{ background:C.purple+'08', borderRadius:8, padding:12, display:'flex', gap:14, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:11, fontWeight:700, color:C.purple }}>AI Analysis</span>
            <span style={{ fontSize:11 }}>Root cause: <strong>{d.ai_classification.root_cause.replace(/_/g,' ')}</strong></span>
            <span style={{ fontSize:11, flex:1 }}>Recommended: <strong>{d.ai_classification.recommended_action.slice(0,80)}...</strong></span>
            <span style={{ fontSize:11, color:C.purple, fontWeight:700 }}>{Math.round(d.ai_confidence*100)}%</span>
          </div>
          {d.appeal_deadline && <div style={{ marginTop:8, fontSize:11, color:C.red, fontWeight:600 }}>Appeal deadline: {d.appeal_deadline}</div>}
        </Card>
      ))}
    </div>
  );
}

// ─── APPEALS ─────────────────────────────────────────────
function AppealsPage() {
  const [showLetter, setShowLetter] = useState(false);
  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Active Appeals" value={1} color={C.blue} />
        <Metric label="Amount in Appeal" value="$850" color={C.amber} />
        <Metric label="Avg Appeal Time" value="15 days" color={C.purple} />
      </div>
      <Card style={{ padding:20, borderLeft:`4px solid ${C.blue}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:12 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700 }}>CLM-2024-00005 — David Martinez</div>
            <div style={{ fontSize:11, color:C.muted }}>Lone Star Orthopedics | Medicare | Level 1 Appeal</div>
          </div>
          <div style={{ textAlign:'right' }}><Badge status="submitted" /><div style={{ fontSize:11, color:C.muted, marginTop:4 }}>Submitted: 2025-02-01</div></div>
        </div>
        <div style={{ display:'flex', gap:12, marginBottom:12 }}>
          <div style={{ fontSize:12 }}>Denial: <strong>CO-197</strong> (authorization)</div>
          <div style={{ fontSize:12 }}>Amount: <strong style={{ color:C.red }}>$850</strong></div>
          <div style={{ fontSize:12 }}>Deadline: <strong>2025-04-15</strong></div>
        </div>
        <button onClick={()=>setShowLetter(!showLetter)} style={{ padding:'8px 16px', borderRadius:6, border:`1px solid ${C.blue}`, background:showLetter?C.blue:'#fff', color:showLetter?'#fff':C.blue, fontSize:12, fontWeight:600 }}>
          {showLetter ? 'Hide' : 'View'} Appeal Letter
        </button>
        {showLetter && (
          <div style={{ marginTop:14, background:'#fafafa', borderRadius:8, padding:20, border:'1px solid #e2e8f0' }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.purple, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>AI-Generated Appeal Letter</div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.8, whiteSpace:'pre-wrap', fontFamily:'Georgia, serif' }}>{APPEAL_LETTER}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── TASKS ───────────────────────────────────────────────
function TasksPage() {
  const [tasks, setTasks] = useState(TASKS);
  const pColors = { critical:C.red, high:'#ea580c', medium:C.amber, low:C.muted };
  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Open Tasks" value={tasks.filter(t=>t.status==='open').length} color={C.amber} />
        <Metric label="Pending Review" value={tasks.filter(t=>t.status==='pending_review').length} color="ea580c" />
        <Metric label="Critical" value={tasks.filter(t=>t.priority==='critical').length} color={C.red} />
        <Metric label="Completed" value={tasks.filter(t=>t.status==='completed').length} color={C.green} />
      </div>
      {tasks.map(t => (
        <Card key={t.id} style={{ padding:18, marginBottom:8, borderLeft:`4px solid ${pColors[t.priority]}`, opacity:t.status==='completed'?0.5:1, transition:'opacity 0.3s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5, flexWrap:'wrap' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:pColors[t.priority] }} />
                <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:C.muted }}>{t.priority}</span>
                <span style={{ fontSize:10, color:'#d1d5db' }}>|</span>
                <span style={{ fontSize:10, color:C.muted }}>{t.task_type.replace(/_/g,' ')}</span>
                <Badge status={t.status} />
              </div>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:5, color:C.text }}>{t.title}</div>
              <div style={{ fontSize:12, color:C.muted, lineHeight:1.6 }}>{t.description}</div>
              <div style={{ fontSize:11, color:C.light, marginTop:6 }}>{t.practice_name} | Agent: {t.agent_id} | Due: {t.due_date}</div>
            </div>
            {t.status !== 'completed' && (
              <div style={{ display:'flex', gap:6, marginLeft:12, flexShrink:0 }}>
                <button onClick={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,status:'completed'}:x))} style={{ padding:'6px 14px', borderRadius:6, border:'none', background:C.blue, color:'#fff', fontSize:11, fontWeight:700 }}>Approve</button>
                <button onClick={()=>setTasks(prev=>prev.map(x=>x.id===t.id?{...x,status:'completed'}:x))} style={{ padding:'6px 14px', borderRadius:6, border:'1px solid #d1d5db', background:'#fff', fontSize:11, fontWeight:600, color:C.muted }}>Dismiss</button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── ELIGIBILITY ─────────────────────────────────────────
function EligibilityPage() {
  const checks = ELIGIBILITY;
  const avgTime = Math.round(checks.reduce((s,c)=>s+c.processing_time_ms,0)/checks.length);
  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Total Checks" value={checks.length} color={C.blue} />
        <Metric label="Verified" value={checks.filter(c=>c.status==='verified').length} color={C.green} />
        <Metric label="Failed" value={checks.filter(c=>c.status==='failed').length} color={C.red} />
        <Metric label="Avg Response" value={`${avgTime.toLocaleString()}ms`} color={C.purple} />
      </div>
      <Card>
        <Table headers={['Patient','Payer','Plan','Member ID','Practice','Status','Coverage','Copay','Ded. Left','Time']}>
          {checks.map(c => (
            <tr key={c.id}>
              <Td style={{ fontWeight:500 }}>{c.patient_name}</Td>
              <Td>{c.payer_name}</Td>
              <Td style={{ fontSize:11, color:C.muted }}>{c.plan}</Td>
              <Td style={{ fontFamily:'monospace', fontSize:10.5 }}>{c.member_id}</Td>
              <Td style={{ fontSize:11, color:C.muted }}>{c.practice_name}</Td>
              <Td><Badge status={c.status} /></Td>
              <Td style={{ fontWeight:600, color:c.coverage_active?C.green:C.red }}>{c.coverage_active?'Active':'Inactive'}</Td>
              <Td>{c.copay!=null?`$${c.copay}`:'-'}</Td>
              <Td>{c.deductible_remaining!=null?`$${c.deductible_remaining}`:'-'}</Td>
              <Td style={{ fontFamily:'monospace', fontSize:11 }}>{c.processing_time_ms}ms</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── PATIENTS ────────────────────────────────────────────
function PatientsPage() {
  return (
    <div className="fade-in"><Card>
      <Table headers={['Patient','MRN','Date of Birth','Gender','Practice','Payer','Member ID','Coverage']}>
        {PATIENTS.map(p => (
          <tr key={p.id}>
            <Td style={{ fontWeight:500 }}>{p.last_name}, {p.first_name}</Td>
            <Td style={{ fontFamily:'monospace', fontSize:11 }}>{p.mrn}</Td>
            <Td>{p.dob}</Td>
            <Td>{p.gender}</Td>
            <Td style={{ fontSize:11, color:C.muted }}>{p.practice_name}</Td>
            <Td>{p.payer}</Td>
            <Td style={{ fontFamily:'monospace', fontSize:11 }}>{p.member_id}</Td>
            <Td><Badge status={p.coverage} /></Td>
          </tr>
        ))}
      </Table>
    </Card></div>
  );
}

// ─── AGENT ACTIVITY ──────────────────────────────────────
function AgentActivityPage() {
  return (
    <div className="fade-in"><Card>
      <Table headers={['Timestamp','Agent','Action','Entity','Practice','Status','Processing Time','Details']}>
        {AGENTS.map(a => (
          <tr key={a.id}>
            <Td style={{ fontSize:11, color:C.muted, whiteSpace:'nowrap' }}>{new Date(a.created_at).toLocaleString()}</Td>
            <Td><span style={{ background:C.blue+'12', color:C.blue, padding:'2px 8px', borderRadius:4, fontSize:10, fontWeight:700 }}>{a.agent_type.replace(/_/g,' ')}</span></Td>
            <Td style={{ fontSize:11.5 }}>{a.action_type.replace(/_/g,' ')}</Td>
            <Td style={{ fontSize:11, color:C.muted }}>{a.entity_type}</Td>
            <Td style={{ fontSize:11 }}>{a.practice_name}</Td>
            <Td><Badge status={a.status} /></Td>
            <Td style={{ fontFamily:'monospace', fontSize:11 }}>{a.processing_time_ms.toLocaleString()}ms</Td>
            <Td style={{ fontSize:10.5, color:C.muted, maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.details}</Td>
          </tr>
        ))}
      </Table>
    </Card></div>
  );
}

// ─── PRACTICES ───────────────────────────────────────────
function PracticesPage() {
  const emrColors = { Epic:'#dc2626', athenahealth:'#2563eb', Cerner:'#d97706' };
  return (
    <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
      {PRACTICES.map(p => (
        <Card key={p.id} style={{ padding:20 }}>
          <div style={{ fontSize:15, fontWeight:700, marginBottom:2 }}>{p.name}</div>
          <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>{p.specialty} — {p.city}, {p.state}</div>
          <div style={{ display:'flex', gap:6, marginBottom:12 }}>
            <span style={{ fontSize:10, fontWeight:700, background:(emrColors[p.emr]||C.muted)+'15', color:emrColors[p.emr]||C.muted, padding:'2px 8px', borderRadius:4 }}>{p.emr}</span>
            <span style={{ fontSize:10, color:C.muted, padding:'2px 8px' }}>NPI: {p.npi}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            <div><div style={{ fontSize:18, fontWeight:800, color:C.text }}>{p.patients}</div><div style={{ fontSize:10, color:C.muted }}>Patients</div></div>
            <div><div style={{ fontSize:18, fontWeight:800, color:C.text }}>{p.claims}</div><div style={{ fontSize:10, color:C.muted }}>Claims</div></div>
            <div><div style={{ fontSize:14, fontWeight:800, color:C.text }}>${(p.total_charges/1000).toFixed(1)}k</div><div style={{ fontSize:10, color:C.muted }}>Charges</div></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── PAYMENTS ────────────────────────────────────────────
function PaymentsPage() {
  return (
    <div className="fade-in">
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
        <Metric label="Total Payments" value={PAYMENTS.length} color={C.green} />
        <Metric label="Total Received" value={`$${PAYMENTS.reduce((s,p)=>s+p.amount,0).toLocaleString()}`} color={C.green} />
        <Metric label="All Posted" value="100%" color={C.blue} />
        <Metric label="All Reconciled" value="100%" color={C.purple} />
      </div>
      <Card>
        <Table headers={['Date','Claim #','Patient','Payer','Payment','Adjustment','Patient Resp.','Method','EFT #','Posted','Reconciled']}>
          {PAYMENTS.map(p => (
            <tr key={p.id}>
              <Td>{p.date}</Td>
              <Td style={{ fontWeight:700, color:C.blue }}>{p.claim_number}</Td>
              <Td style={{ fontWeight:500 }}>{p.patient_name}</Td>
              <Td>{p.payer}</Td>
              <Td style={{ fontWeight:600, color:C.green }}>${p.amount.toLocaleString()}</Td>
              <Td style={{ color:C.red }}>${p.adjustment}</Td>
              <Td>${p.patient_resp}</Td>
              <Td><Badge status={p.method==='EFT'?'completed':'pending'} /></Td>
              <Td style={{ fontFamily:'monospace', fontSize:11 }}>{p.eft_number}</Td>
              <Td>{p.posted?'✓':'-'}</Td>
              <Td>{p.reconciled?'✓':'-'}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}

// ─── MAIN APP ════════════════════════════════════════════
const NAV = [
  { id:'dashboard', label:'Dashboard', icon:'📊' },
  { id:'claims', label:'Claims', icon:'📄' },
  { id:'denials', label:'Denials', icon:'❌' },
  { id:'appeals', label:'Appeals', icon:'📝' },
  { id:'tasks', label:'Tasks (HITL)', icon:'✅' },
  { id:'eligibility', label:'Eligibility', icon:'🛡️' },
  { id:'patients', label:'Patients', icon:'👥' },
  { id:'agents', label:'Agent Activity', icon:'🤖' },
  { id:'practices', label:'Practices', icon:'🏥' },
  { id:'payments', label:'Payments', icon:'💰' },
];

const TITLES = { dashboard:'Dashboard', claims:'Claims Management', denials:'Denial Management', appeals:'Appeals', tasks:'Human-in-the-Loop Task Queue', eligibility:'Eligibility Verification', patients:'Patient Registry', agents:'AI Agent Activity Log', practices:'Practices', payments:'Payments & Remittance' };

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [selectedClaim, setSelectedClaim] = useState(null);

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  const handleClaimSelect = (claim) => { setSelectedClaim(claim); setPage('claim_detail'); };
  const handleBack = () => { setSelectedClaim(null); setPage('claims'); };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:230, background:'linear-gradient(180deg, #0c1220 0%, #1a2744 100%)', flexShrink:0, display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'20px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize:18, fontWeight:800, color:'#fff', letterSpacing:'-0.5px' }}>⚕️ Meridian RCM</div>
          <div style={{ fontSize:9.5, color:'#60a5fa', fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginTop:3 }}>AI-Powered Platform</div>
        </div>
        <nav style={{ padding:'10px 8px', flex:1, overflowY:'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setPage(n.id); setSelectedClaim(null); }} style={{
              display:'flex', alignItems:'center', gap:10, width:'100%', padding:'9px 12px',
              background:page===n.id||(page==='claim_detail'&&n.id==='claims') ? 'rgba(59,130,246,0.12)' : 'transparent',
              border:'none', borderRadius:8, color:page===n.id||(page==='claim_detail'&&n.id==='claims') ? '#60a5fa' : '#94a3b8',
              fontSize:12.5, fontWeight:page===n.id ? 700 : 400, marginBottom:1, textAlign:'left',
            }}><span style={{ fontSize:15 }}>{n.icon}</span>{n.label}</button>
          ))}
        </nav>
        <div style={{ padding:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:C.blue, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:12 }}>SM</div>
            <div><div style={{ fontSize:12, color:'#e2e8f0', fontWeight:500 }}>Sarah Mitchell</div><div style={{ fontSize:10, color:'#64748b' }}>Admin</div></div>
          </div>
          <button onClick={() => setLoggedIn(false)} style={{ width:'100%', marginTop:10, padding:'6px', borderRadius:6, border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'#64748b', fontSize:11, fontWeight:500 }}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <header style={{ background:'#fff', padding:'14px 28px', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <div>
            <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text }}>{page==='claim_detail' ? 'Claim Detail' : TITLES[page]}</h1>
            <span style={{ fontSize:11, color:C.light }}>Meridian Medical Billing — 5 Practices — {new Date().toLocaleDateString()}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:11, color:C.green, fontWeight:600 }}>All Systems Operational</span>
          </div>
        </header>
        <main style={{ flex:1, padding:24, overflow:'auto', background:'#f8fafc' }}>
          {page==='dashboard' && <Dashboard />}
          {page==='claims' && <ClaimsPage onSelect={handleClaimSelect} />}
          {page==='claim_detail' && selectedClaim && <ClaimDetail claim={selectedClaim} onBack={handleBack} />}
          {page==='denials' && <DenialsPage />}
          {page==='appeals' && <AppealsPage />}
          {page==='tasks' && <TasksPage />}
          {page==='eligibility' && <EligibilityPage />}
          {page==='patients' && <PatientsPage />}
          {page==='agents' && <AgentActivityPage />}
          {page==='practices' && <PracticesPage />}
          {page==='payments' && <PaymentsPage />}
        </main>
      </div>
    </div>
  );
}
