"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ─── RESPONSIVE HOOK ────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 375);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, w };
}

/* ─── CONSTANTS ─────────────────────────────────────────── */
const C = {
  ink:"#080810",deep:"#0d0d18",card:"#13131e",cardHi:"#1a1a28",
  border:"#1e1e30",borderHi:"#2e2e48",gold:"#d4a853",goldBright:"#f0c96a",
  goldDim:"#7a5f2a",cream:"#f0ebe0",creamDim:"#8a8070",creamFade:"#4a4540",
  red:"#e05050",green:"#3db87a",blue:"#4a8fd4",purple:"#a78bfa",orange:"#fb923c",
  teal:"#2dd4bf",
};
const MAX_CALLS = 25;

const LANGUAGES = [
  {code:"en",label:"English",flag:"🇺🇸"},
  {code:"es",label:"Español",flag:"🇲🇽"},
  {code:"zh",label:"中文",flag:"🇨🇳"},
  {code:"vi",label:"Tiếng Việt",flag:"🇻🇳"},
  {code:"ko",label:"한국어",flag:"🇰🇷"},
  {code:"pt",label:"Português",flag:"🇧🇷"},
  {code:"fr",label:"Français",flag:"🇫🇷"},
  {code:"ar",label:"العربية",flag:"🇸🇦",rtl:true},
];
const LANG_INST = {
  en:"Respond in English.",
  es:"Responde completamente en español.",
  zh:"请完全用中文回复。",
  vi:"Trả lời hoàn toàn bằng tiếng Việt.",
  ko:"한국어로 완전히 답변하세요.",
  pt:"Responda em português brasileiro.",
  fr:"Répondez en français.",
  ar:"أجب باللغة العربية.",
};
const AD_PLATFORMS = [
  {id:"facebook",name:"Facebook/Instagram",icon:"📘"},
  {id:"google",name:"Google Ads",icon:"🔍"},
  {id:"zillow",name:"Zillow/Trulia",icon:"🏠"},
  {id:"craigslist",name:"Craigslist",icon:"📋"},
  {id:"nextdoor",name:"Nextdoor",icon:"🏘️"},
  {id:"sms",name:"SMS Blast",icon:"💬"},
];
const CA_CITIES = [
  "Los Angeles, CA","Long Beach, CA","Compton, CA","Hawthorne, CA","Inglewood, CA",
  "South Gate, CA","Lynwood, CA","Gardena, CA","Torrance, CA","Carson, CA",
  "Downey, CA","Norwalk, CA","Bellflower, CA","La Mirada, CA","Buena Park, CA",
  "Anaheim, CA","Santa Ana, CA","Huntington Beach, CA","Riverside, CA","San Bernardino, CA",
  "Pomona, CA","Ontario, CA","Fontana, CA","Rancho Cucamonga, CA","San Diego, CA",
  "Oakland, CA","Fresno, CA","Sacramento, CA","San Jose, CA","San Francisco, CA",
  "Bakersfield, CA","Stockton, CA","Modesto, CA","Visalia, CA","Oxnard, CA",
  "Other (type below)",
];
const TIERS = {
  free:{label:"Free Preview",price:"$0",color:C.creamDim},
  pro:{label:"Pro Agent",price:"$47",priceNote:"one-time",color:C.gold,badge:"BEST VALUE",gumroad:"https://gumroad.com/l/real-ai-estate-office-pro"},
  office:{label:"Brokerage Office",price:"$97",priceNote:"one-time",color:C.purple,badge:"TEAM EDITION",gumroad:"https://gumroad.com/l/real-ai-estate-office-brokerage"},
};

/* ─── SECURITY: ACCESS CODE HASHES (SHA-256) ───────────────────────────────────── */
const ACCESS_CODE_HASHES = {
  "pro":"c1d42bb676bb8cba0b1234567890abcdef1234567890abcdef1234567890ab",
  "office":"c2d42bb676bb8cba0b1234567890abcdef1234567890abcdef1234567890cd",
};

async function verifyAccessCode(code, tier) {
  try {
    const encoded = new TextEncoder().encode(code);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex === ACCESS_CODE_HASHES[tier];
  } catch (e) {
    console.error("Hash verification failed:", e);
    return false;
  }
}

const WORKERS = [
  {id:"listing",icon:"🏠",name:"Listing Agent AI",role:"Property Marketing",color:C.gold,tier:"free",
    description:"MLS copy, social captions, open house promos, price alerts.",
    prompts:[
      {title:"MLS Listing Description",tone:"professional",tier:"free",template:"Write a compelling MLS listing description for a {bedrooms}BR/{bathrooms}BA home in {city} at {price}. Features: {features}. Buyer-focused, vivid, under 250 words.",vars:["bedrooms","bathrooms","city","price","features"]},
      {title:"Instagram Caption",tone:"friendly",tier:"free",template:"Write an Instagram caption for a new listing in {city}. Price: {price}. Highlights: {features}. Include 3 hashtags and CTA.",vars:["city","price","features"]},
      {title:"Luxury Property Description",tone:"luxury",tier:"pro",template:"Craft a high-end property description for a {bedrooms}BR/{bathrooms}BA estate in {city} at {price}. Features: {features}.",vars:["bedrooms","bathrooms","city","price","features"]},
      {title:"Open House Announcement",tone:"professional",tier:"pro",template:"Write an open house announcement for {address} in {city}. Date: {date}, Time: {time}. Price: {price}. Highlights: {features}.",vars:["address","city","date","time","price","features"]},
      {title:"Price Reduction Alert",tone:"friendly",tier:"pro",template:"Write a price reduction alert for {address} in {city}. Old: {old_price}. New: {new_price}. Frame as opportunity.",vars:["address","city","old_price","new_price"]},
    ]},
  {id:"followup",icon:"📲",name:"Lead Follow-Up AI",role:"Client Conversion",color:C.blue,tier:"free",
    description:"First response texts, drip sequences, voicemails, re-engagement.",
    prompts:[
      {title:"First Response Text",tone:"friendly",tier:"free",template:"Write a first-response text to a lead interested in a property in {city}. Under 3 sentences. Warm, human, not pushy.",vars:["city"]},
      {title:"48-Hour Nudge",tone:"friendly",tier:"free",template:"Write a 48-hour follow-up text to a prospect who hasn't responded, interested in {city}. Casual, no pressure.",vars:["city"]},
      {title:"7-Day Re-Engagement Email",tone:"professional",tier:"pro",template:"Write a 7-day re-engagement email to a buyer looking for {criteria} in {city} under {budget}. Include subject line and CTA.",vars:["criteria","city","budget"]},
      {title:"Post-Showing Follow-Up",tone:"professional",tier:"pro",template:"Write a post-showing follow-up for a buyer who toured {address}. Ask for feedback, offer next steps.",vars:["address"]},
    ]},
  {id:"adbot",icon:"📡",name:"Ad Scheduler AI",role:"Rental Ad Automation",color:C.purple,tier:"pro",description:"Build, schedule & optimize rental ads across 6 platforms.",prompts:[],isAdBot:true},
  {id:"bizcard",icon:"💼",name:"Business Card AI",role:"Virtual Card & QR",color:C.teal,tier:"free",description:"Virtual business card with QR code and vCard download.",prompts:[],isBizCard:true},
  {id:"transaction",icon:"📋",name:"Transaction AI",role:"Contract & Timeline",color:C.green,tier:"pro",
    description:"Offer summaries, checklists, status updates, closing comms.",
    prompts:[
      {title:"Offer Summary",tone:"professional",tier:"pro",template:"Write a plain-English offer summary on {address}. Price: {price}. Earnest: {earnest}. Closing: {closing}.",vars:["address","price","earnest","closing"]},
      {title:"Buyer Closing Checklist",tone:"professional",tier:"pro",template:"Generate a buyer closing checklist for purchasing {address} in {city}. Closing: {closing}.",vars:["address","city","closing"]},
    ]},
  {id:"legal",icon:"⚖️",name:"Compliance AI",role:"Legal & Disclosure",color:C.red,tier:"pro",
    description:"Disclosure checklists, lease summaries, fair housing guides.",
    prompts:[
      {title:"Seller Disclosure Checklist",tone:"professional",tier:"pro",template:"Generate a seller disclosure checklist for a property in {state}. Not legal advice.",vars:["state"]},
      {title:"Fair Housing Reminder",tone:"professional",tier:"pro",template:"Write a fair housing compliance reminder covering 7 protected classes.",vars:[]},
    ]},
  {id:"marketing",icon:"📣",name:"Marketing AI",role:"Brand & Content Engine",color:C.purple,tier:"pro",
    description:"Newsletters, Google ads, social content, agent branding.",
    prompts:[
      {title:"Monthly Newsletter",tone:"professional",tier:"pro",template:"Write a monthly newsletter for {month} in {city}. Market update, buyer tip, seller tip, CTA.",vars:["month","city"]},
      {title:"Agent Bio",tone:"professional",tier:"pro",template:"Write a 150-word agent bio in {city} with {years} years experience. Specialty: {specialty}.",vars:["city","years","specialty"]},
    ]},
  {id:"leasing",icon:"🔑",name:"Leasing AI",role:"Property Management",color:C.orange,tier:"pro",
    description:"Rental listings, tenant comms, renewals, late notices.",
    prompts:[
      {title:"Rental Listing",tone:"friendly",tier:"pro",template:"Write a rental listing for a property in {city}. Rent: {rent}/mo. {bedrooms}BR/{bathrooms}BA. Features: {features}.",vars:["city","rent","bedrooms","bathrooms","features"]},
      {title:"Late Rent Reminder",tone:"professional",tier:"pro",template:"Write a professional late rent reminder. Amount: {amount}. Due: {due_date}. Late fee: {fee}.",vars:["due_date","amount","fee"]},
    ]},
  {id:"concierge",icon:"🤝",name:"Concierge AI",role:"Relationship Builder",color:C.teal,tier:"pro",
    description:"Onboarding, objection scripts, review requests, referral asks.",
    prompts:[
      {title:"New Client Welcome",tone:"friendly",tier:"pro",template:"Write a new client welcome email for a buyer who just signed in {city}.",vars:["city"]},
      {title:"Objection: High Commission",tone:"professional",tier:"pro",template:"Write a script handling 'your commission is too high' from a seller on {address}.",vars:["address"]},
    ]},
  {id:"promptbuilder",icon:"🧠",name:"Prompt Builder AI",role:"Custom Prompt Generator",color:"#f472b6",tier:"pro",
    description:"Describe any client problem and get expert-crafted prompts.",
    prompts:[],isPromptBuilder:true},
];

/* ─── SECURITY HELPERS ───────────────────────────────────── */
function SafeText({ text, style }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <span style={style}>
      {parts.map((p,i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} style={{color:C.gold}}>{p.slice(2,-2)}</strong>
          : p
      )}
    </span>
  );
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, "");
}

/* ─── API WRAPPER ────────────────────────────────────────── */
async function callClaude({ system, messages, maxTokens=1000, onRateLimit }) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", signal:ctrl.signal,
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:maxTokens, system, messages }),
    });
    clearTimeout(t);
    if (res.status===429||res.status===529) { onRateLimit?.(); return null; }
    if (!res.ok) throw new Error(`${res.status}`);
    const d = await res.json();
    const b = d.content?.find(x=>x.type==="text");
    return b ? stripHtml(b.text) : null;
  } catch(e) { clearTimeout(t); return e.name==="AbortError"?"__TIMEOUT__":null; }
}

function useCallCounter() {
  const [count,setCount] = useState(0);
  const increment = useCallback(()=>setCount(c=>c+1),[]);
  return { count, increment, exhausted:count>=MAX_CALLS, remaining:MAX_CALLS-count };
}

function escapeVCardField(str) {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function buildVCard(info) {
  return `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${escapeVCardField(info.name)}\r\nTITLE:${escapeVCardField(info.title)}\r\nORG:${escapeVCardField(info.company)}\r\nTEL;TYPE=CELL:${escapeVCardField(info.phone)}\r\nEMAIL:${escapeVCardField(info.email)}\r\nURL:${escapeVCardField(info.website)}\r\nADR;TYPE=WORK:;;${escapeVCardField(info.city)};;;\r\nNOTE:DRE# ${escapeVCardField(info.dre)} | ${escapeVCardField(info.specialties)}\r\nEND:VCARD`;
}

/* ─── PRIVACY NOTICE ─────────────────────────────────────── */
function PrivacyNotice({ onAccept }) {
  return (
    <div style={{background:"#0d0a04",border:`1px solid ${C.gold}33`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
      <div style={{fontSize:10,fontWeight:800,color:C.gold,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:6}}>⚠️ Privacy Notice</div>
      <div style={{fontSize:11,color:C.creamDim,lineHeight:1.6,marginBottom:10}}>
        Content is processed by Anthropic's AI. <strong style={{color:C.cream}}>Do not enter confidential client PII</strong> — use generic placeholders for sensitive data.
      </div>
      <button onClick={onAccept} style={{background:C.gold,color:C.ink,border:"none",borderRadius:7,padding:"8px 20px",fontWeight:800,fontSize:12,cursor:"pointer",touchAction:"manipulation"}}>I understand — continue</button>
    </div>
  );
}

/* ─── BUSINESS CARD ─────────────────────────────────────── */
function BizCardView({ onBack, bp }) {
  const [step,setStep]=useState("form");
  const [copied,setCopied]=useState(false);
  const [theme,setTheme]=useState("gold");
  const [info,setInfo]=useState({
    name:"Francisco Fabian Garcia",title:"Real Estate Agent",company:"FG Real Estate",
    phone:"(562) 555-0100",email:"francisco@fgrealestate.com",website:"https://fgrealestate.com",
    city:"La Mirada, CA",dre:"01234567",specialties:"Residential · Rental · Investment",
    tagline:"Helping families find home.",social_ig:"@fgrealestate",social_fb:"FGRealEstate",
  });
  const themes={
    gold:{card1:"#1a1508",card2:"#0d0c06",accent:C.gold,text:C.cream,sub:C.creamDim,border:C.gold+"44",label:"Gold"},
    night:{card1:"#13131e",card2:"#0d0d18",accent:C.purple,text:C.cream,sub:C.creamDim,border:C.purple+"44",label:"Night"},
    teal:{card1:"#0a1e1c",card2:"#041310",accent:C.teal,text:C.cream,sub:C.creamDim,border:C.teal+"44",label:"Teal"},
    slate:{card1:"#16161e",card2:"#0c0c10",accent:C.blue,text:C.cream,sub:C.creamDim,border:C.blue+"44",label:"Slate"},
  };
  const th=themes[theme];
  const vcardData=buildVCard(info);
  const qrContent=`BEGIN:VCARD\nFN:${info.name}\nTEL:${info.phone}\nEMAIL:${info.email}\nURL:${info.website}\nEND:VCARD`;
  const qrURL=`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrContent)}&bgcolor=080810&color=d4a853&margin=10`;

  const downloadVCard=()=>{
    const blob=new Blob([vcardData],{type:"text/vcard;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`${info.name.replace(/ /g,"_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url),5000);
  };
  const copyVC=()=>{navigator.clipboard.writeText(vcardData);setCopied(true);setTimeout(()=>setCopied(false),2000);};

  const Field=({label,k,half})=>(
    <div style={{flex:half&&!bp.isMobile?"0 0 calc(50% - 4px)":1}}>
      <label style={{fontSize:9,color:C.creamDim,textTransform:"uppercase",letterSpacing:0.8,fontFamily:"monospace",display:"block",marginBottom:3}}>{label}</label>
      <input value={info[k]||""} onChange={e=>setInfo({...info,[k]:e.target.value})}
        style={{width:"100%",background:C.ink,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 10px",color:C.cream,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}} />
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.ink}}>
      <div style={{background:C.deep,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:14,fontWeight:700,padding:"6px 0",touchAction:"manipulation"}}>← Office</button>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:900,color:C.cream}}>💼 Virtual Business Card</div><div style={{fontSize:10,color:C.teal,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",fontFamily:"monospace"}}>QR · vCard · 4 Themes</div></div>
        <button onClick={()=>setStep(step==="form"?"preview":"form")} style={{background:C.teal+"22",border:`1px solid ${C.teal}44`,borderRadius:8,padding:"8px 14px",color:C.teal,fontSize:12,fontWeight:700,cursor:"pointer",touchAction:"manipulation"}}>{step==="form"?"👁 Preview":"✏️ Edit"}</button>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"20px"}}>
        {step==="form"?(
          <>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:10,color:C.creamDim,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace",marginBottom:10}}>Card Theme</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {Object.entries(themes).map(([k,t])=>(
                  <button key={k} onClick={()=>setTheme(k)} style={{background:theme===k?t.accent+"22":C.card,border:`1.5px solid ${theme===k?t.accent:C.border}`,borderRadius:8,padding:"10px 6px",cursor:"pointer",textAlign:"center",touchAction:"manipulation"}}>
                    <div style={{width:18,height:18,borderRadius:"50%",background:t.accent,margin:"0 auto 5px"}}/>
                    <div style={{fontSize:10,color:theme===k?t.accent:C.creamDim,fontWeight:700}}>{t.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:16}}>
              <Field label="Full Name" k="name"/>
              <Field label="Title / License" k="title"/>
              <Field label="Company" k="company"/>
              <Field label="Phone" k="phone" half/>
              <Field label="Email" k="email" half/>
              <Field label="Website / Link" k="website"/>
              <Field label="City / Area" k="city" half/>
              <Field label="DRE License #" k="dre" half/>
              <Field label="Specialties" k="specialties"/>
              <Field label="Tagline" k="tagline"/>
              <Field label="Instagram Handle" k="social_ig" half/>
              <Field label="Facebook Page" k="social_fb" half/>
            </div>
            <button onClick={()=>setStep("preview")} style={{width:"100%",background:C.teal,color:C.ink,border:"none",borderRadius:10,padding:"12px 0",fontWeight:900,fontSize:14,cursor:"pointer",touchAction:"manipulation"}}>
              Generate My Card & QR Code →
            </button>
          </>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:bp.isMobile?"1fr":"1fr 1fr",gap:20}}>
            <div style={{background:th.card1,border:`1px solid ${th.border}`,borderRadius:16,overflow:"hidden",position:"relative"}}>
              <div style={{height:3,background:`linear-gradient(90deg,transparent,${th.accent},transparent)`}}/>
              <div style={{padding:"20px 18px 18px",display:"flex",flexDirection:"column",gap:12}}>
                <div>
                  <div style={{fontSize:9,color:th.accent,letterSpacing:2,textTransform:"uppercase",fontFamily:"monospace",fontWeight:700,marginBottom:4}}>REAL ESTATE PROFESSIONAL</div>
                  <div style={{fontSize:20,fontWeight:900,color:th.text,lineHeight:1.1,marginBottom:2}}>{info.name}</div>
                  <div style={{fontSize:11,color:th.accent,fontWeight:700,marginBottom:1}}>{info.title}</div>
                  <div style={{fontSize:10,color:th.sub,marginBottom:8}}>{info.company}</div>
                </div>
                <div style={{height:1,background:th.border}}/>
                {[
                  {icon:"📞",v:info.phone},{icon:"✉️",v:info.email},
                  {icon:"🌐",v:info.website},{icon:"📍",v:info.city},
                ].map((r,i)=>r.v&&(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10}}>{r.icon}</span>
                    <span style={{fontSize:10,color:th.sub,wordBreak:"break-all"}}>{r.v}</span>
                  </div>
                ))}
                {info.social_ig&&<div style={{display:"flex",gap:8,marginTop:6}}>
                  <span style={{fontSize:9,color:th.accent,fontFamily:"monospace"}}>IG {info.social_ig}</span>
                  {info.social_fb&&<span style={{fontSize:9,color:th.accent,fontFamily:"monospace"}}>FB {info.social_fb}</span>}
                </div>}
                {info.dre&&<div style={{marginTop:6,fontSize:8,color:C.creamFade,fontFamily:"monospace"}}>DRE# {info.dre}</div>}
              </div>
              {info.tagline&&(
                <div style={{background:th.card2,borderTop:`1px solid ${th.border}`,padding:"8px 18px"}}>
                  <div style={{fontSize:10,color:th.accent,fontStyle:"italic",textAlign:"center"}}>"{info.tagline}"</div>
                </div>
              )}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{background:th.card1,border:`1px solid ${th.border}`,borderRadius:16,padding:16,textAlign:"center"}}>
                <div style={{background:C.ink,border:`1px solid ${th.border}`,borderRadius:10,padding:12,marginBottom:12}}>
                  <img src={qrURL} alt="QR Code" style={{width:160,height:160,borderRadius:6,display:"block",margin:"0 auto"}} onError={e=>e.target.style.display="none"} />
                </div>
                <div style={{fontSize:10,color:th.sub,fontFamily:"monospace",lineHeight:1.6,marginBottom:12}}>Scan to save contact</div>
                <button onClick={downloadVCard} style={{width:"100%",background:th.accent,color:C.ink,border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",marginBottom:8,touchAction:"manipulation"}}>
                  ⬇️ Download vCard
                </button>
                <button onClick={copyVC} style={{width:"100%",background:th.accent+"33",border:`1px solid ${th.accent}`,color:th.accent,borderRadius:8,padding:"10px 0",fontWeight:700,fontSize:12,cursor:"pointer",touchAction:"manipulation"}}>
                  {copied?"✓ Copied!":"📋 Copy vCard"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PROMPT CARD ─────────────────────────────────────── */
function PromptCard({ prompt, tier, userTier, onSelect, bp }) {
  const locked = prompt.tier !== "free" && userTier !== prompt.tier;
  return (
    <div style={{background:C.card,border:`1px solid ${locked?C.red+"44":C.border}`,borderRadius:10,padding:12,cursor:locked?"not-allowed":"pointer",opacity:locked?0.6:1}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:locked?C.red:C.cream,marginBottom:2}}>{prompt.title}</div>
          <div style={{fontSize:10,color:C.creamDim}}>Tone: {prompt.tone}</div>
        </div>
        {locked&&<div style={{fontSize:10,color:C.red,fontWeight:700}}>🔒</div>}
      </div>
      <button 
        onClick={()=>!locked&&onSelect(prompt)}
        disabled={locked}
        style={{width:"100%",background:locked?C.creamFade:C.gold,color:C.ink,border:"none",borderRadius:6,padding:"8px 0",fontWeight:700,fontSize:11,cursor:locked?"not-allowed":"pointer",touchAction:"manipulation"}}
      >
        {locked?"Upgrade to Unlock":"Use This Prompt"}
      </button>
    </div>
  );
}

function PromptCard_List({ prompts, tier, userTier, onSelect, bp }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:bp.isMobile?"1fr":"repeat(2,1fr)",gap:10}}>
      {prompts.map((p) => (
        <PromptCard key={p.title} prompt={p} tier={tier} userTier={userTier} onSelect={onSelect} bp={bp} />
      ))}
    </div>
  );
}

/* ─── PURCHASE GATE ─────────────────────────────────────── */
function PurchaseGate({ tier, onUpgrade }) {
  const tierInfo = TIERS[tier];
  return (
    <div style={{background:`linear-gradient(135deg,${tierInfo.color}22,${tierInfo.color}11)`,border:`2px solid ${tierInfo.color}`,borderRadius:14,padding:24,textAlign:"center"}}>
      <div style={{fontSize:28,marginBottom:12}}>🔐</div>
      <div style={{fontSize:18,fontWeight:900,color:C.cream,marginBottom:6}}>Upgrade to {tierInfo.label}</div>
      <div style={{fontSize:12,color:C.creamDim,marginBottom:16,lineHeight:1.6}}>
        Unlock the full suite of prompts, advanced features, and priority support.
      </div>
      <div style={{fontSize:20,fontWeight:900,color:tierInfo.color,marginBottom:16}}>{tierInfo.price}</div>
      {tierInfo.gumroad&&(
        <a 
          href={tierInfo.gumroad} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{display:"inline-block",background:tierInfo.color,color:C.ink,border:"none",borderRadius:8,padding:"12px 32px",fontWeight:900,fontSize:14,cursor:"pointer",textDecoration:"none",transition:"all 0.2s"}}
        >
          Upgrade Now →
        </a>
      )}
    </div>
  );
}

/* ─── WORKER VIEW ─────────────────────────────────────── */
function WorkerView({ worker, userTier, onBack, bp }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [vars, setVars] = useState({});
  const [lang, setLang] = useState("en");
  const {count, remaining, exhausted} = useCallCounter();

  const handleGenerate = async () => {
    if (exhausted) return;
    if (!selectedPrompt) return;
    
    setLoading(true);
    const filledTemplate = selectedPrompt.template.replace(/{(\w+)}/g, (_, key) => vars[key] || "");
    const sysMsg = LANG_INST[lang] + " " + selectedPrompt.tone;
    const result = await callClaude({ system: sysMsg, messages: [{role:"user",content:filledTemplate}], maxTokens:1000 });
    setResult(result);
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:C.ink}}>
      <div style={{background:C.deep,borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:C.gold,cursor:"pointer",fontSize:14,fontWeight:700,padding:"6px 0",touchAction:"manipulation"}}>← Office</button>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:900,color:C.cream}}>{worker.icon} {worker.name}</div>
          <div style={{fontSize:10,color:C.creamDim,fontWeight:700}}>{worker.role}</div>
        </div>
      </div>

      <div style={{maxWidth:1000,margin:"0 auto",padding:20}}>
        <PrivacyNotice onAccept={()=>{}} />

        {exhausted&&(
          <div style={{background:C.red+"22",border:`1px solid ${C.red}`,borderRadius:10,padding:14,marginBottom:16}}>
            <div style={{fontSize:12,color:C.red,fontWeight:700}}>Limit Reached</div>
            <div style={{fontSize:11,color:C.creamDim}}>You've used all {MAX_CALLS} free generations. Upgrade for unlimited access.</div>
          </div>
        )}

        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:C.creamDim,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace",marginBottom:6}}>Language</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {LANGUAGES.map(l=>(
              <button key={l.code} onClick={()=>setLang(l.code)} style={{background:lang===l.code?l.code==="ar"?C.border:C.gold:C.card,color:lang===l.code?C.ink:C.creamDim,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 10px",fontSize:11,fontWeight:600,cursor:"pointer",touchAction:"manipulation"}}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {worker.prompts.length>0?(
          <>
            <div style={{fontSize:11,color:C.creamDim,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace",marginBottom:10}}>Select a Prompt</div>
            <PromptCard_List prompts={worker.prompts} tier={worker.tier} userTier={userTier} onSelect={setSelectedPrompt} bp={bp} />

            {selectedPrompt&&(
              <div style={{marginTop:20,padding:16,background:C.card,border:`1px solid ${C.border}`,borderRadius:10}}>
                <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:12}}>Configure: {selectedPrompt.title}</div>
                <div style={{display:"grid",gridTemplateColumns:bp.isMobile?"1fr":"repeat(2,1fr)",gap:10,marginBottom:12}}>
                  {selectedPrompt.vars.map(v=>(
                    <input key={v} placeholder={v} value={vars[v]||""} onChange={e=>setVars({...vars,[v]:e.target.value})}
                      style={{background:C.ink,border:`1px solid ${C.border}`,borderRadius:6,padding:"8px 10px",color:C.cream,fontSize:12,outline:"none"}} />
                  ))}
                </div>
                <button onClick={handleGenerate} disabled={loading||exhausted} style={{width:"100%",background:exhausted?C.creamFade:C.teal,color:C.ink,border:"none",borderRadius:8,padding:"10px 0",fontWeight:700,cursor:exhausted?"not-allowed":"pointer",touchAction:"manipulation"}}>
                  {loading?"Generating...":"Generate"}
                </button>
              </div>
            )}

            {result&&(
              <div style={{marginTop:20,padding:16,background:C.card,border:`1px solid ${C.gold}44`,borderRadius:10}}>
                <div style={{fontSize:12,fontWeight:700,color:C.gold,marginBottom:10}}>Result</div>
                <div style={{fontSize:12,color:C.cream,lineHeight:1.7,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{result}</div>
              </div>
            )}
          </>
        ):(
          <PurchaseGate tier={userTier||"free"} onUpgrade={()=>{}} />
        )}
      </div>
    </div>
  );
}

/* ─── MAIN OFFICE VIEW ─────────────────────────────────── */
function OfficeView({ userTier, onWorkerSelect, bp }) {
  const [langPicker, setLangPicker] = useState(false);
  const langPickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (langPickerRef.current && !langPickerRef.current.contains(e.target)) {
        setLangPicker(false);
      }
    }
    if (langPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
      };
    }
  }, [langPicker]);

  return (
    <div style={{minHeight:"100vh",background:C.ink}}>
      <div style={{background:C.deep,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:10}}>
        <div><div style={{fontSize:16,fontWeight:900,color:C.cream}}>🏢 Real Estate AI Office</div><div style={{fontSize:10,color:C.teal,fontWeight:700}}>Platinum Edition</div></div>
        <div style={{display:"flex",gap:8,position:"relative"}}>
          <button onClick={()=>setLangPicker(!langPicker)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:6,padding:"6px 8px",fontSize:11,fontWeight:700,color:C.creamDim,cursor:"pointer",touchAction:"manipulation"}}>
            🌐 EN
          </button>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:20}}>
        <PrivacyNotice onAccept={()=>{}} />

        <div style={{marginBottom:24}}>
          <div style={{fontSize:13,color:C.creamDim,textTransform:"uppercase",letterSpacing:1,fontFamily:"monospace",marginBottom:14,fontWeight:700}}>AI Workers</div>
          <div style={{display:"grid",gridTemplateColumns:bp.isMobile?"1fr":bp.isTablet?"repeat(2,1fr)":"repeat(3,1fr)",gap:12}}>
            {WORKERS.map((w) => {
              const canAccess = w.tier === "free" || userTier === w.tier || userTier === "office";
              return (
                <button key={w.id} onClick={()=>onWorkerSelect(w)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:14,textAlign:"left",cursor:canAccess?"pointer":"default",opacity:canAccess?1:0.5,transition:"all 0.2s",touchAction:"manipulation"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{w.icon}</div>
                  <div style={{fontSize:13,fontWeight:700,color:C.cream,marginBottom:3}}>{w.name}</div>
                  <div style={{fontSize:10,color:C.gold,fontWeight:700,marginBottom:6}}>{w.role}</div>
                  <div style={{fontSize:10,color:C.creamDim,lineHeight:1.5,marginBottom:8}}>{w.description}</div>
                  <div style={{fontSize:9,color:C.creamDim,fontFamily:"monospace"}}>
                    {w.tier==="free"?"Free":"Pro"}
                    {!canAccess&&" — 🔒"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:bp.isMobile?"1fr":"repeat(3,1fr)",gap:12,marginBottom:24}}>
          {Object.entries(TIERS).map(([k,t])=>(
            <div key={k} style={{background:C.card,border:`1px solid ${t.color}44`,borderRadius:10,padding:16}}>
              <div style={{fontSize:11,color:t.color,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t.badge&&`${t.badge} `}{t.label}</div>
              <div style={{fontSize:24,fontWeight:900,color:t.color,marginBottom:2}}>{t.price}</div>
              {t.priceNote&&<div style={{fontSize:9,color:C.creamDim,marginBottom:10}}>one-time</div>}
              {t.gumroad&&(
                <a href={t.gumroad} target="_blank" rel="noopener noreferrer" style={{display:"block",background:t.color,color:C.ink,border:"none",borderRadius:6,padding:"8px 0",fontWeight:700,fontSize:11,textAlign:"center",textDecoration:"none",cursor:"pointer"}}>
                  Upgrade Now →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ─────────────────────────────────── */
export default function Page() {
  const bp = useBreakpoint();
  const [view, setView] = useState("office");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [userTier, setUserTier] = useState("free");

  return (
    <div style={{background:C.ink,minHeight:"100vh",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      {view==="office"&&<OfficeView userTier={userTier} onWorkerSelect={(w)=>{setSelectedWorker(w);setView("worker");}} bp={bp} />}
      {view==="worker"&&selectedWorker&&<WorkerView worker={selectedWorker} userTier={userTier} onBack={()=>setView("office")} bp={bp} />}
    </div>
  );
}