// Roblox XML model format (.rbxmx) reader + writer
'use strict';
(function () {
  const RBX = window.RBX;
  const CF_KEYS = ['X', 'Y', 'Z', 'R00', 'R01', 'R02', 'R10', 'R11', 'R12', 'R20', 'R21', 'R22'];

  const kids = (el) => Array.from(el.children);
  const child = (el, tag) => kids(el).find((c) => c.tagName === tag);
  const num = (el, tag) => { const c = child(el, tag); return c ? parseFloat(c.textContent) : 0; };
  const nums = (s) => s.trim().split(/\s+/).filter(Boolean).map(Number);

  function parseColor3(el) {
    if (child(el, 'R')) return [num(el, 'R'), num(el, 'G'), num(el, 'B')];
    const v = parseInt(el.textContent, 10) >>> 0;
    return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
  }
  function parseContent(el) {
    const c = el.children[0];
    if (!c) return el.textContent.trim();
    if (c.tagName === 'null') return '';
    return c.textContent.trim();
  }

  function parseProp(el, shared, warn, ctx) {
    const tag = el.tagName;
    const txt = el.textContent;
    switch (tag) {
      case 'string': return { t: 'string', v: txt };
      case 'ProtectedString': return { t: 'string', v: txt };
      case 'bool': return { t: 'bool', v: txt.trim() === 'true' };
      case 'int': return { t: 'int', v: parseInt(txt, 10) };
      case 'int64': return { t: 'int64', v: Number(txt) };
      case 'float': return { t: 'float', v: parseFloat(txt) };
      case 'double': return { t: 'double', v: parseFloat(txt) };
      case 'token': return { t: 'Enum', v: parseInt(txt, 10) };
      case 'BrickColor': return { t: 'BrickColor', v: parseInt(txt, 10) };
      case 'Content': case 'ContentId': return { t: 'string', v: parseContent(el) };
      case 'Vector3': return { t: 'Vector3', v: [num(el, 'X'), num(el, 'Y'), num(el, 'Z')] };
      case 'Vector2': return { t: 'Vector2', v: [num(el, 'X'), num(el, 'Y')] };
      case 'Vector3int16': return { t: 'Vector3int16', v: [num(el, 'X'), num(el, 'Y'), num(el, 'Z')] };
      case 'CoordinateFrame': return { t: 'CFrame', v: CF_KEYS.map((k) => num(el, k)) };
      case 'OptionalCoordinateFrame': { const c = child(el, 'CFrame'); return { t: 'OptionalCFrame', v: c ? CF_KEYS.map((k) => num(c, k)) : null }; }
      case 'Color3': return { t: 'Color3', v: parseColor3(el) };
      case 'Color3uint8': return { t: 'Color3', v: parseColor3(el) };
      case 'UDim': return { t: 'UDim', v: [num(el, 'S'), num(el, 'O')] };
      case 'UDim2': return { t: 'UDim2', v: [num(el, 'XS'), num(el, 'XO'), num(el, 'YS'), num(el, 'YO')] };
      case 'NumberRange': { const n = nums(txt); return { t: 'NumberRange', v: [n[0] || 0, n[1] || 0] }; }
      case 'NumberSequence': { const n = nums(txt), ks = []; for (let i = 0; i + 2 < n.length; i += 3) ks.push([n[i], n[i + 1], n[i + 2]]); return { t: 'NumberSequence', v: ks }; }
      case 'ColorSequence': { const n = nums(txt), ks = []; for (let i = 0; i + 4 < n.length; i += 5) ks.push(n.slice(i, i + 5)); return { t: 'ColorSequence', v: ks }; }
      case 'Rect2D': { const a = child(el, 'min'), b = child(el, 'max'); return { t: 'Rect', v: [num(a, 'X'), num(a, 'Y'), num(b, 'X'), num(b, 'Y')] }; }
      case 'PhysicalProperties': {
        if (child(el, 'CustomPhysics') && child(el, 'CustomPhysics').textContent.trim() === 'true')
          return { t: 'PhysicalProperties', v: ['Density', 'Friction', 'Elasticity', 'FrictionWeight', 'ElasticityWeight'].map((k) => num(el, k)) };
        return { t: 'PhysicalProperties', v: null };
      }
      case 'Faces': return { t: 'Faces', v: parseInt((child(el, 'faces') || el).textContent, 10) };
      case 'Axes': return { t: 'Axes', v: parseInt((child(el, 'axes') || el).textContent, 10) };
      case 'Font': {
        const fam = child(el, 'Family'); const w = child(el, 'Weight'); const s = child(el, 'Style');
        return { t: 'Font', v: { family: fam ? parseContent(fam) : '', weight: w ? parseInt(w.textContent, 10) : 400, style: s && s.textContent.trim() === 'Italic' ? 1 : 0 } };
      }
      case 'BinaryString': return { t: 'BinaryString', v: RBX.b64decode(txt) };
      case 'SharedString': { const b = shared[txt.trim()]; return { t: 'SharedString', v: txt.trim(), bytes: b }; }
      case 'Ref': return { t: 'Ref', v: txt.trim() };
      case 'Ray': { const o = child(el, 'origin'), d = child(el, 'direction'); return { t: 'Ray', v: [num(o, 'X'), num(o, 'Y'), num(o, 'Z'), num(d, 'X'), num(d, 'Y'), num(d, 'Z')] }; }
      case 'UniqueId': case 'SecurityCapabilities': case 'AssetContentMap': case 'NetAssetRef': return { t: tag, v: null };
      default: warn(`Skipped ${ctx} (unknown XML type <${tag}>)`); return null;
    }
  }

  RBX.readXml = function (text) {
    const doc = new DOMParser().parseFromString(text, 'application/xml');
    const err = doc.querySelector('parsererror');
    if (err) throw new Error('Invalid XML: ' + err.textContent.split('\n')[0]);
    const root = doc.documentElement;
    if (root.tagName !== 'roblox') throw new Error('Not a Roblox XML file (missing <roblox> root)');
    const warnings = []; const warn = (w) => { if (!warnings.includes(w)) warnings.push(w); };
    const shared = {};
    const ss = child(root, 'SharedStrings');
    if (ss) for (const s of kids(ss)) shared[s.getAttribute('md5')] = RBX.b64decode(s.textContent);
    const byRef = {}; const refProps = [];
    function readItem(el, parent) {
      const inst = RBX.newInst(el.getAttribute('class'));
      const ref = el.getAttribute('referent'); if (ref) byRef[ref] = inst;
      for (const c of kids(el)) {
        if (c.tagName === 'Properties') {
          for (const p of kids(c)) {
            const name = p.getAttribute('name');
            const val = parseProp(p, shared, warn, `${inst.cls}.${name}`);
            if (!val) continue;
            const api = RBX.FILE_TO_API[name] || name;
            if (val.t === 'Ref') refProps.push([inst, api, val.v]);
            inst.props[api] = val;
          }
        } else if (c.tagName === 'Item') readItem(c, inst);
      }
      if (parent) RBX.addChild(parent, inst);
      return inst;
    }
    const roots = kids(root).filter((c) => c.tagName === 'Item').map((c) => readItem(c, null));
    for (const [inst, prop, ref] of refProps) inst.props[prop] = { t: 'Ref', v: byRef[ref] || null };
    return { roots, warnings };
  };

  // ---------------- writer ----------------
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (n) => { if (!isFinite(n)) return '0'; return String(Math.abs(n) < 1e-12 ? 0 : +n.toPrecision(9)); };
  const cdata = (s) => '<![CDATA[' + String(s).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';

  function fileName(inst, prop, val) {
    const bp = RBX.BASEPART.has(inst.cls);
    if (bp && prop === 'Size' && val.t === 'Vector3') return 'size';
    if (bp && prop === 'Color' && val.t === 'Color3') return 'Color3uint8';
    if (RBX.PARTLIKE.has(inst.cls) && prop === 'Shape') return 'shape';
    if (inst.cls === 'Humanoid' && prop === 'Health') return 'Health_XML';
    if (prop === 'MaterialVariant') return 'MaterialVariantSerialized';
    if (prop === 'WorldPivot') return 'WorldPivotData';
    if ((inst.cls === 'WeldConstraint' || inst.cls === 'NoCollisionConstraint') && (prop === 'Part0' || prop === 'Part1')) return prop + 'Internal';
    return prop;
  }

  function writeProp(inst, prop, val, refId) {
    const name = esc(fileName(inst, prop, val));
    const v = val.v;
    const vec = (keys, arr) => keys.map((k, i) => `<${k}>${fmt(arr[i])}</${k}>`).join('');
    switch (val.t) {
      case 'string':
        if (prop === 'Source') return `<ProtectedString name="${name}">${cdata(v)}</ProtectedString>`;
        if (val.content) return `<Content name="${name}">${v ? `<url>${esc(v)}</url>` : '<null></null>'}</Content>`;
        return `<string name="${name}">${esc(v)}</string>`;
      case 'bool': return `<bool name="${name}">${v ? 'true' : 'false'}</bool>`;
      case 'int': return `<int name="${name}">${Math.round(v)}</int>`;
      case 'int64': return `<int64 name="${name}">${Math.round(v)}</int64>`;
      case 'float': return `<float name="${name}">${fmt(v)}</float>`;
      case 'double': return `<double name="${name}">${fmt(v)}</double>`;
      case 'Enum': return `<token name="${name}">${v}</token>`;
      case 'BrickColor': return `<int name="${name}">${v}</int>`;
      case 'Vector3': return `<Vector3 name="${name}">${vec(['X', 'Y', 'Z'], v)}</Vector3>`;
      case 'Vector2': return `<Vector2 name="${name}">${vec(['X', 'Y'], v)}</Vector2>`;
      case 'CFrame': return `<CoordinateFrame name="${name}">${vec(CF_KEYS, v)}</CoordinateFrame>`;
      case 'OptionalCFrame': return v ? `<OptionalCoordinateFrame name="${name}"><CFrame>${vec(CF_KEYS, v)}</CFrame></OptionalCoordinateFrame>` : `<OptionalCoordinateFrame name="${name}"></OptionalCoordinateFrame>`;
      case 'Color3': {
        if (name === 'Color3uint8') {
          const b = (x) => Math.max(0, Math.min(255, Math.round(x * 255)));
          return `<Color3uint8 name="${name}">${(0xff000000 | (b(v[0]) << 16) | (b(v[1]) << 8) | b(v[2])) >>> 0}</Color3uint8>`;
        }
        return `<Color3 name="${name}">${vec(['R', 'G', 'B'], v)}</Color3>`;
      }
      case 'UDim': return `<UDim name="${name}"><S>${fmt(v[0])}</S><O>${Math.round(v[1])}</O></UDim>`;
      case 'UDim2': return `<UDim2 name="${name}"><XS>${fmt(v[0])}</XS><XO>${Math.round(v[1])}</XO><YS>${fmt(v[2])}</YS><YO>${Math.round(v[3])}</YO></UDim2>`;
      case 'NumberRange': return `<NumberRange name="${name}">${fmt(v[0])} ${fmt(v[1])} </NumberRange>`;
      case 'NumberSequence': return `<NumberSequence name="${name}">${v.map((k) => k.map(fmt).join(' ')).join(' ')} </NumberSequence>`;
      case 'ColorSequence': return `<ColorSequence name="${name}">${v.map((k) => k.map(fmt).join(' ')).join(' ')} </ColorSequence>`;
      case 'Rect': return `<Rect2D name="${name}"><min><X>${fmt(v[0])}</X><Y>${fmt(v[1])}</Y></min><max><X>${fmt(v[2])}</X><Y>${fmt(v[3])}</Y></max></Rect2D>`;
      case 'PhysicalProperties':
        if (!v) return `<PhysicalProperties name="${name}"><CustomPhysics>false</CustomPhysics></PhysicalProperties>`;
        return `<PhysicalProperties name="${name}"><CustomPhysics>true</CustomPhysics>${vec(['Density', 'Friction', 'Elasticity', 'FrictionWeight', 'ElasticityWeight'], v)}</PhysicalProperties>`;
      case 'Faces': return `<Faces name="${name}"><faces>${v}</faces></Faces>`;
      case 'Axes': return `<Axes name="${name}"><axes>${v}</axes></Axes>`;
      case 'Font': return `<Font name="${name}"><Family><url>${esc(v.family)}</url></Family><Weight>${v.weight}</Weight><Style>${v.style ? 'Italic' : 'Normal'}</Style></Font>`;
      case 'BinaryString': return `<BinaryString name="${name}">${RBX.b64encode(v)}</BinaryString>`;
      case 'Ref': return `<Ref name="${name}">${v && refId.has(v) ? refId.get(v) : 'null'}</Ref>`;
      default: return null;
    }
  }

  RBX.writeXml = function (roots) {
    const refId = new Map(); let n = 0;
    RBX.walk(roots, (i) => refId.set(i, 'RBX' + (n++).toString(16).toUpperCase().padStart(8, '0')));
    const out = ['<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">', '\t<Meta name="ExplicitAutoJoints">true</Meta>', '\t<External>null</External>', '\t<External>nil</External>'];
    function item(inst, d) {
      const tab = '\t'.repeat(d);
      out.push(`${tab}<Item class="${esc(inst.cls)}" referent="${refId.get(inst)}">`);
      out.push(`${tab}\t<Properties>`);
      for (const k in inst.props) {
        const x = writeProp(inst, k, inst.props[k], refId);
        if (x) out.push(`${tab}\t\t${x}`);
      }
      out.push(`${tab}\t</Properties>`);
      for (const c of inst.children) item(c, d + 1);
      out.push(`${tab}</Item>`);
    }
    for (const r of roots) item(r, 1);
    out.push('</roblox>');
    return out.join('\n');
  };
})();
