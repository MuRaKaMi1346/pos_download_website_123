"""Self-contained HTML for the admin feedback dashboard.

Served by ``GET /api/v1/admin/feedback/view``. The page itself is static; the
data + image endpoints it calls are gated by the admin token, which the page
collects once and keeps in ``sessionStorage`` (never placed in the URL). All
customer-supplied text is rendered via ``textContent`` to avoid stored XSS.
"""

from __future__ import annotations

FEEDBACK_DASHBOARD_HTML = """<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>SmartBrew · Feedback</title>
<style>
:root{--bg:#faf9f7;--card:#fff;--ink:#2b2622;--muted:#8a8178;--border:#e7e3de;--accent:#3a2e23;--gold:#c79a3a;--danger:#b4452f;--ok:#3f8f5b}
*{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","IBM Plex Sans Thai",sans-serif;background:var(--bg);color:var(--ink)}
header{position:sticky;top:0;z-index:5;background:rgba(250,249,247,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);padding:14px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
header h1{font-size:17px;margin:0;font-weight:600}
.count{background:var(--accent);color:#fff;border-radius:999px;padding:2px 10px;font-size:13px;font-variant-numeric:tabular-nums}
.spacer{flex:1}
button{font:inherit;cursor:pointer;border-radius:8px;border:1px solid var(--border);background:#fff;color:var(--ink);padding:8px 14px}
button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
button:disabled{opacity:.5;cursor:default}
main{max-width:760px;margin:0 auto;padding:20px}
.gate{max-width:380px;margin:56px auto;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:24px}
.gate h2{margin:0 0 6px;font-size:18px}
.gate p{margin:0 0 16px;color:var(--muted);font-size:14px}
.gate input{width:100%;padding:11px 12px;border:1px solid var(--border);border-radius:8px;font:inherit;margin-bottom:12px}
.gate .err{color:var(--danger);font-size:13px;margin-top:10px;min-height:18px}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-bottom:14px}
.top{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted);margin-bottom:8px;flex-wrap:wrap}
.stars{color:var(--gold);letter-spacing:1px}
.badge{border:1px solid var(--ok);color:var(--ok);border-radius:999px;padding:1px 8px;font-size:12px}
.msg{white-space:pre-wrap;line-height:1.55;margin:0 0 8px;word-break:break-word}
.email{font-size:13px;color:var(--muted)}
.shot{margin-top:10px}
.shot img{max-width:260px;max-height:260px;border:1px solid var(--border);border-radius:10px;display:block;cursor:zoom-in}
.empty{text-align:center;color:var(--muted);padding:64px 0}
.id{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink)}
</style>
</head>
<body>
<header>
  <h1>SmartBrew · Feedback</h1>
  <span class="count" id="count" hidden>0</span>
  <span class="spacer"></span>
  <button id="refresh" hidden>รีเฟรช</button>
  <button id="logout" hidden>ออกจากระบบ</button>
</header>
<main>
  <div class="gate" id="gate">
    <h2>เข้าสู่ระบบผู้ดูแล</h2>
    <p>ใส่ Admin Token เพื่อดูความเห็นจากลูกค้า</p>
    <input id="token" type="password" placeholder="Admin token" autocomplete="off">
    <button class="primary" id="login" style="width:100%">เข้าสู่ระบบ</button>
    <div class="err" id="gateErr"></div>
  </div>
  <div id="list"></div>
</main>
<script>
const API = location.origin + '/api/v1/admin';
const KEY = 'sb_admin_token';
const $ = (s) => document.querySelector(s);
let token = sessionStorage.getItem(KEY) || '';

function stars(n){ return n ? '<span class="stars">' + '\\u2605'.repeat(n) + '\\u2606'.repeat(5 - n) + '</span>' : ''; }
function fmtDate(s){ try { return new Date(s).toLocaleString('th-TH', { dateStyle:'medium', timeStyle:'short' }); } catch (e) { return s; } }

function showApp(on){
  $('#gate').hidden = on;
  ['#count','#refresh','#logout'].forEach((s) => { $(s).hidden = !on; });
}

async function load(){
  $('#refresh').disabled = true;
  let res;
  try { res = await fetch(API + '/feedback', { headers: { 'X-Admin-Token': token } }); }
  catch (e) { $('#gateErr').textContent = 'เชื่อมต่อไม่ได้'; showApp(false); $('#refresh').disabled = false; return; }
  if (res.status === 401) {
    sessionStorage.removeItem(KEY); token = '';
    showApp(false); $('#gateErr').textContent = 'Token ไม่ถูกต้อง'; $('#refresh').disabled = false; return;
  }
  const items = await res.json();
  showApp(true);
  $('#count').textContent = items.length;
  const list = $('#list');
  list.textContent = '';
  if (items.length === 0) { list.innerHTML = '<div class="empty">ยังไม่มีความเห็น</div>'; $('#refresh').disabled = false; return; }
  for (const it of items) {
    const card = document.createElement('div'); card.className = 'card';
    const top = document.createElement('div'); top.className = 'top';
    top.innerHTML = '<span class="id">#' + Number(it.id) + '</span>' + stars(Number(it.rating) || 0)
      + '<span>' + fmtDate(it.created_at).replace(/[<>&]/g, '') + '</span>'
      + (it.handled ? '<span class="badge">ดูแล้ว</span>' : '');
    card.appendChild(top);
    const msg = document.createElement('p'); msg.className = 'msg'; msg.textContent = it.message; card.appendChild(msg);
    if (it.email) { const em = document.createElement('div'); em.className = 'email'; em.textContent = 'อีเมล: ' + it.email; card.appendChild(em); }
    if (it.has_image) {
      const wrap = document.createElement('div'); wrap.className = 'shot';
      const img = document.createElement('img'); img.alt = 'รูปแนบจากความเห็น #' + Number(it.id); img.loading = 'lazy';
      wrap.appendChild(img); card.appendChild(wrap);
      fetch(API + '/feedback/' + Number(it.id) + '/image', { headers: { 'X-Admin-Token': token } })
        .then((r) => r.ok ? r.blob() : Promise.reject(r.status))
        .then((b) => { const u = URL.createObjectURL(b); img.src = u; img.onclick = () => window.open(u, '_blank'); })
        .catch(() => { img.remove(); });
    }
    list.appendChild(card);
  }
  $('#refresh').disabled = false;
}

$('#login').onclick = () => {
  token = $('#token').value.trim();
  if (!token) { $('#gateErr').textContent = 'กรุณาใส่ token'; return; }
  sessionStorage.setItem(KEY, token); $('#gateErr').textContent = ''; load();
};
$('#token').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('#login').click(); });
$('#refresh').onclick = load;
$('#logout').onclick = () => { sessionStorage.removeItem(KEY); token = ''; $('#list').textContent = ''; showApp(false); $('#token').value = ''; };

if (token) load(); else showApp(false);
</script>
</body>
</html>
"""
