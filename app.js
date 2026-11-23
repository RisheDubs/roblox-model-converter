'use strict';
(function () {
  const RBX = window.RBX;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- syntax highlighting ----------
  const KW = new Set('and break do else elseif end false for function goto if in local nil not or repeat return then true until while continue'.split(' '));
  const GLOBALS = new Set('Instance Vector3 Vector2 CFrame Color3 BrickColor UDim UDim2 Enum NumberRange NumberSequence NumberSequenceKeypoint ColorSequence ColorSequenceKeypoint Rect PhysicalProperties Font Faces Axes Random TweenInfo game workspace script math string table task print warn typeof pairs ipairs pcall tostring tonumber select type error'.split(' '));
  function highlight(src) {
    const re = /(--\[(=*)\[[\s\S]*?\]\2\]|--[^\n]*)|(\[(=*)\[[\s\S]*?\]\4\]|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`[^`]*`?)|(\b0x[\da-fA-F]+\b|\b\d+\.?\d*(?:e[+-]?\d+)?\b)|(Enum(?:\.\w+){0,2})|([A-Za-z_]\w*)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index));
      const t = m[0];
      if (m[1]) out += `<span class="t-c">${esc(t)}</span>`;
      else if (m[3]) out += `<span class="t-s">${esc(t)}</span>`;
      else if (m[5]) out += `<span class="t-n">${t}</span>`;
      else if (m[6]) out += `<span class="t-e">${t}</span>`;
      else if (KW.has(t)) out += `<span class="t-k">${t}</span>`;
      else if (GLOBALS.has(t)) out += `<span class="t-g">${t}</span>`;
      else out += esc(t);
      last = m.index + t.length;
    }
    return out + esc(src.slice(last));
  }
  const gutter = (el, n) => { let s = ''; for (let i = 1; i <= n; i++) s += i + '\n'; el.textContent = s; };

  const toast = (msg) => { const t = $('toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 1800); };
  const download = (name, text, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const copy = async (text) => { try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); } catch { toast('Copy failed — select and copy manually'); } };

  // ---------- tabs ----------
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
  function showView(v) {
    document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x.dataset.view === v));
    document.querySelectorAll('.view').forEach((x) => x.classList.toggle('on', x.id === 'view-' + v));
    (v === 'm2c' ? m2cPreview : c2mPreview).resize();
    if (v === 'c2m') syncEditor();
  }
  function segment(segId, pvId, treeId, preview) {
    $(segId).addEventListener('click', (e) => {
      const p = e.target.dataset.p; if (!p) return;
      $(segId).querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.p === p));
      $(pvId).hidden = p !== 'pv'; $(treeId).hidden = p !== 'tree';
      if (p === 'pv') preview.resize();
    });
  }

  // ---------- explorer tree ----------
  const ICONS = { Model: ['M', '#46c2ff'], Folder: ['F', '#ffcb6b'], Script: ['S', '#3ddc97'], LocalScript: ['L', '#3ddc97'], ModuleScript: ['m', '#3ddc97'] };
  function icon(cls) {
    if (ICONS[cls]) return ICONS[cls];
    if (RBX.BASEPART.has(cls)) return ['P', '#a0a8b8'];
    if (/Gui|Frame|Label|Button|Text|Image/.test(cls)) return ['G', '#c792ea'];
    if (/Light/.test(cls)) return ['☀', '#ffe08a'];
    if (/Weld|Motor|Constraint|Attachment/.test(cls)) return ['J', '#f78c6c'];
    if (/Value$/.test(cls)) return ['V', '#82aaff'];
    return ['•', '#5c6a80'];
  }
  function renderTree(el, roots) {
    el.innerHTML = '';
    if (!roots.length) { el.innerHTML = '<div class="empty">Nothing here yet</div>'; return; }
    const frag = document.createDocumentFragment();
    let shown = 0;
    function add(inst, depth, parentEl) {
      if (shown++ > 3000) return;
      const row = document.createElement('div'); row.className = 'row'; row.style.paddingLeft = 6 + depth * 16 + 'px';
      const [ch, col] = icon(inst.cls);
      const tw = document.createElement('span'); tw.className = 'tw'; tw.textContent = inst.children.length ? '▾' : '';
      row.appendChild(tw);
      row.insertAdjacentHTML('beforeend', `<span class="ico" style="background:${col}">${ch}</span><span>${esc(RBX.nameOf(inst))}</span><span class="cls">${esc(inst.cls)}</span>`);
      parentEl.appendChild(row);
      const box = document.createElement('div'); parentEl.appendChild(box);
      inst.children.forEach((c) => add(c, depth + 1, box));
      if (inst.children.length) tw.onclick = () => { box.hidden = !box.hidden; tw.textContent = box.hidden ? '▸' : '▾'; };
      if (depth >= 2 && inst.children.length > 0) { box.hidden = true; tw.textContent = '▸'; }
    }
    roots.forEach((r) => add(r, 0, frag));
    el.appendChild(frag);
  }

  // ================= MODEL -> CODE =================
  const m2cPreview = new RBX.Preview($('m2c-pv'));
  segment('m2c-seg', 'm2c-pv', 'm2c-tree', m2cPreview);
  let m2cRoots = null, m2cName = 'model', m2cCode = '', m2cWarnings = [];

  async function loadBytes(u8, name) {
    $('file-name').textContent = name;
    try {
      const head = RBX.utf8.dec.decode(u8.subarray(0, 8));
      const isImage = (u8[0] === 0x89 && u8[1] === 0x50) || (u8[0] === 0xff && u8[1] === 0xd8) || head.startsWith('GIF8') || (head.startsWith('RIFF'));
      if (isImage) throw new Error("That's an image, not a Roblox model.\n-- Pictures can't be converted automatically. In Studio, select your model,\n-- right-click → Save to File…, and drop that .rbxm/.rbxmx here instead.");
      let res;
      if (head === '<roblox!') res = await RBX.readBinary(u8);
      else res = RBX.readXml(RBX.utf8.dec.decode(u8));
      m2cRoots = res.roots; m2cWarnings = res.warnings; m2cName = name.replace(/\.[^.]+$/, '') || 'model';
      renderTree($('m2c-tree'), m2cRoots);
      m2cPreview.setRoots(m2cRoots);
      regenerate();
    } catch (e) {
      console.error(e);
      m2cRoots = null;
      $('m2c-code').innerHTML = `<span class="t-c">-- Couldn't read that file:\n-- ${esc(e.message)}</span>`;
      gutter($('m2c-gutter'), 2);
      $('m2c-stat').textContent = '';
      ['m2c-copy', 'm2c-dl', 'm2c-send'].forEach((id) => ($(id).disabled = true));
    }
  }
  function regenerate() {
    if (!m2cRoots) return;
    const opt = {
      compact: $('o-compact').checked, scripts: $('o-scripts').checked, cframeStyle: $('o-cf').value,
      precision: Math.max(0, Math.min(8, parseInt($('o-prec').value, 10) || 0)), parent: $('o-parent').value, header: 'From ' + $('file-name').textContent,
    };
    const { code, notes, count } = RBX.generateLua(m2cRoots, opt);
    m2cCode = code;
    $('m2c-code').innerHTML = highlight(code);
    gutter($('m2c-gutter'), code.split('\n').length);
    $('m2c-stat').innerHTML = `<b>${count}</b> instances · <b>${code.split('\n').length}</b> lines`;
    ['m2c-copy', 'm2c-dl', 'm2c-send'].forEach((id) => ($(id).disabled = false));
    const msgs = [];
    if (notes.includes('MeshPart')) msgs.push('MeshPart meshes can only be set from the command bar or a plugin.');
    if (notes.includes('Unions')) msgs.push("Unions can't be rebuilt from a script — they become empty placeholders.");
    msgs.push(...m2cWarnings.slice(0, 5));
    $('m2c-notes').innerHTML = msgs.map((m) => '⚠ ' + esc(m)).join('<br>');
    $('m2c-notes').classList.toggle('on', msgs.length > 0);
  }
  ['o-compact', 'o-scripts', 'o-cf', 'o-prec', 'o-parent'].forEach((id) => $(id).addEventListener('change', regenerate));
  $('o-prec').addEventListener('input', regenerate);
  // scroll sync for read-only output gutter
  $('m2c-code').addEventListener('scroll', (e) => ($('m2c-gutter').scrollTop = e.target.scrollTop));

  const drop = $('drop');
  drop.addEventListener('click', () => $('file-input').click());
  $('file-input').addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) loadBytes(new Uint8Array(await f.arrayBuffer()), f.name); e.target.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => document.addEventListener(t, (e) => { e.preventDefault(); if (document.querySelector('#view-m2c.on')) drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((t) => document.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  document.addEventListener('drop', async (e) => {
    const f = e.dataTransfer.files[0]; if (!f) return;
    showView('m2c');
    loadBytes(new Uint8Array(await f.arrayBuffer()), f.name);
  });
  $('paste-toggle').onclick = () => $('paste').classList.toggle('on');
  $('paste-go').onclick = () => { const t = $('paste-text').value.trim(); if (t) loadBytes(RBX.utf8.enc.encode(t), 'pasted.rbxmx'); };
  $('m2c-copy').onclick = () => copy(m2cCode);
  $('m2c-dl').onclick = () => download(m2cName + '.lua', m2cCode, 'text/plain');
  $('m2c-send').onclick = () => { setEditor(m2cCode); $('c2m-name').value = m2cName; showView('c2m'); build(); };

  // ================= CODE -> MODEL =================
  const c2mPreview = new RBX.Preview($('c2m-pv'));
  segment('c2m-seg', 'c2m-pv', 'c2m-tree', c2mPreview);
  const ta = $('c2m-code'), hl = $('c2m-hl');
  let c2mXml = '';
  function syncEditor() {
    hl.innerHTML = highlight(ta.value) + '\n';
    gutter($('c2m-gutter'), ta.value.split('\n').length);
    hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; $('c2m-gutter').scrollTop = ta.scrollTop;
    try { localStorage.setItem('m2c-code', ta.value); } catch {}
  }
  function setEditor(v) { ta.value = v; syncEditor(); }
  ta.addEventListener('input', syncEditor);
  ta.addEventListener('scroll', () => { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; $('c2m-gutter').scrollTop = ta.scrollTop; });
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); build(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      ta.setRangeText('\t', s, en, 'end'); syncEditor();
    } else if (e.key === 'Enter') {
      const s = ta.selectionStart; const line = ta.value.slice(0, s).split('\n').pop();
      let ind = (line.match(/^\s*/) || [''])[0];
      if (/\b(then|do|function\s*[\w.:]*\s*\([^)]*\)|repeat|else)\s*$/.test(line) || /\{\s*$/.test(line)) ind += '\t';
      e.preventDefault(); ta.setRangeText('\n' + ind, s, ta.selectionEnd, 'end'); syncEditor();
    }
  });

  const ex = $('examples');
  Object.keys(RBX.EXAMPLES).forEach((k) => ex.insertAdjacentHTML('beforeend', `<option>${esc(k)}</option>`));
  ex.onchange = () => { if (ex.value) { setEditor(RBX.EXAMPLES[ex.value]); $('c2m-name').value = ex.value.replace(/\W+/g, ''); build(); } ex.value = ''; };

  function log(cls, text) { const d = document.createElement('div'); d.className = cls; d.textContent = text; $('console').appendChild(d); }
  let building = false;
  async function build() {
    if (building) return; building = true;
    $('run').disabled = true; $('run').textContent = 'Building…';
    $('console').innerHTML = '';
    try {
      const t0 = performance.now();
      const res = await RBX.runLua(ta.value);
      for (const p of res.prints) log(p.startsWith('⚠') ? 'warn' : '', p);
      if (!res.ok) {
        log('err', '✖ ' + (res.error || 'Unknown error').replace(/^YourCode:/, 'Line '));
        $('c2m-stat').textContent = '';
      }
      if (res.ok || res.roots.length) {
        const n = RBX.countAll(res.roots);
        c2mXml = res.roots.length ? RBX.writeXml(res.roots) : '';
        if (res.roots.length === 1 && ['', 'MyModel'].includes($('c2m-name').value.trim())) $('c2m-name').value = RBX.nameOf(res.roots[0]);
        renderTree($('c2m-tree'), res.roots);
        c2mPreview.setRoots(res.roots);
        $('c2m-dl').disabled = $('c2m-copyxml').disabled = !res.roots.length;
        if (res.ok) {
          if (!res.roots.length) log('warn', 'Your code ran, but no instances ended up in workspace. Parent them to workspace or return the model.');
          else log('ok', `✔ Built ${n} instance${n === 1 ? '' : 's'} (taken from ${res.source}) in ${Math.round(performance.now() - t0)} ms`);
          $('c2m-stat').innerHTML = res.roots.length ? `<b>${n}</b> instances` : '';
        }
      }
    } catch (e) {
      log('err', '✖ ' + e.message);
    } finally {
      building = false; $('run').disabled = false; $('run').textContent = 'Build model ▶';
    }
  }
  $('run').onclick = build;
  $('c2m-dl').onclick = () => download(($('c2m-name').value.trim() || 'Model').replace(/[\\/:*?"<>|]+/g, '_') + '.rbxmx', c2mXml, 'application/xml');
  $('c2m-copyxml').onclick = () => copy(c2mXml);

  RBX._previews = { m2c: m2cPreview, c2m: c2mPreview }; // handy for debugging camera views
  let saved = null;
  try { saved = localStorage.getItem('m2c-code'); } catch {}
  setEditor(saved || RBX.EXAMPLES['Spiral staircase']);
})();
