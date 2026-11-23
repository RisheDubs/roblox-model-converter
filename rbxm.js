// Roblox binary model format (.rbxm / .rbxl) reader -> IR
'use strict';
(function () {
  const RBX = window.RBX;
  const M = RBX.math;

  function lz4(src, outLen) {
    const out = new Uint8Array(outLen);
    let i = 0, o = 0;
    while (i < src.length) {
      const tok = src[i++];
      let lit = tok >> 4;
      if (lit === 15) { let b; do { b = src[i++]; lit += b; } while (b === 255); }
      out.set(src.subarray(i, i + lit), o); i += lit; o += lit;
      if (i >= src.length) break;
      const off = src[i] | (src[i + 1] << 8); i += 2;
      let ml = tok & 15;
      if (ml === 15) { let b; do { b = src[i++]; ml += b; } while (b === 255); }
      ml += 4;
      let p = o - off;
      for (let k = 0; k < ml; k++) out[o++] = out[p++];
    }
    return out;
  }

  let zstdPromise = null;
  function loadZstd() {
    if (window.fzstd) return Promise.resolve(window.fzstd);
    if (!zstdPromise) zstdPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/fzstd@0.1.1/umd/index.js';
      s.onload = () => res(window.fzstd);
      s.onerror = () => rej(new Error('Could not load the ZSTD decoder (needs internet once).'));
      document.head.appendChild(s);
    });
    return zstdPromise;
  }

  class Reader {
    constructor(u8) { this.u = u8; this.dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength); this.o = 0; }
    get left() { return this.u.length - this.o; }
    u8() { return this.u[this.o++]; }
    u16() { const v = this.dv.getUint16(this.o, true); this.o += 2; return v; }
    u32() { const v = this.dv.getUint32(this.o, true); this.o += 4; return v; }
    i32() { const v = this.dv.getInt32(this.o, true); this.o += 4; return v; }
    f32() { const v = this.dv.getFloat32(this.o, true); this.o += 4; return v; }
    f64() { const v = this.dv.getFloat64(this.o, true); this.o += 8; return v; }
    bytes(n) { const v = this.u.subarray(this.o, this.o + n); this.o += n; return v; }
    str() { return RBX.utf8.dec.decode(this.bytesStr()); }
    bytesStr() { return this.bytes(this.u32()); }
    // interleaved big-endian 32-bit words
    words(n) {
      const b = this.bytes(n * 4), out = new Uint32Array(n);
      for (let i = 0; i < n; i++) out[i] = ((b[i] << 24) | (b[n + i] << 16) | (b[2 * n + i] << 8) | b[3 * n + i]) >>> 0;
      return out;
    }
    ints(n) { return Array.from(this.words(n), (v) => (v >>> 1) ^ -(v & 1)); }
    uints(n) { return Array.from(this.words(n)); }
    floats(n) {
      const w = this.words(n), tmp = new DataView(new ArrayBuffer(4));
      return Array.from(w, (v) => { tmp.setUint32(0, ((v >>> 1) | (v << 31)) >>> 0); return tmp.getFloat32(0); });
    }
    refs(n) { const d = this.ints(n); let acc = 0; return d.map((x) => (acc += x)); }
    int64s(n) {
      const b = this.bytes(n * 8), out = [];
      for (let i = 0; i < n; i++) {
        let v = 0n;
        for (let k = 0; k < 8; k++) v = (v << 8n) | BigInt(b[k * n + i]);
        v = (v >> 1n) ^ -(v & 1n);
        out.push(Number(BigInt.asIntN(64, v)));
      }
      return out;
    }
  }

  async function readChunks(u8) {
    const magic = RBX.utf8.dec.decode(u8.subarray(0, 8));
    if (magic !== '<roblox!') throw new Error('Not a binary Roblox file');
    const r = new Reader(u8);
    r.o = 14; r.u16(); const classCount = r.i32(); const instCount = r.i32(); r.o += 8;
    const chunks = [];
    while (r.left >= 16) {
      const name = RBX.utf8.dec.decode(r.bytes(4)).replace(/\0+$/, '');
      const clen = r.u32(), ulen = r.u32(); r.o += 4;
      let data;
      if (clen === 0) data = r.bytes(ulen);
      else {
        const raw = r.bytes(clen);
        if (raw[0] === 0x28 && raw[1] === 0xb5 && raw[2] === 0x2f && raw[3] === 0xfd) data = (await loadZstd()).decompress(raw, new Uint8Array(ulen));
        else data = lz4(raw, ulen);
      }
      chunks.push({ name, data });
      if (name === 'END') break;
    }
    return { classCount, instCount, chunks };
  }

  function readProp(r, type, n, warn, ctx) {
    switch (type) {
      case 0x01: { const a = []; for (let i = 0; i < n; i++) { const b = r.bytesStr(); a.push({ t: 'string', v: RBX.utf8.dec.decode(b), raw: b }); } return a; }
      case 0x02: return Array.from(r.bytes(n), (b) => ({ t: 'bool', v: b !== 0 }));
      case 0x03: return r.ints(n).map((v) => ({ t: 'int', v }));
      case 0x04: return r.floats(n).map((v) => ({ t: 'float', v }));
      case 0x05: { const a = []; for (let i = 0; i < n; i++) a.push({ t: 'double', v: r.f64() }); return a; }
      case 0x06: { const s = r.floats(n), o = r.ints(n); return s.map((x, i) => ({ t: 'UDim', v: [x, o[i]] })); }
      case 0x07: { const xs = r.floats(n), ys = r.floats(n), xo = r.ints(n), yo = r.ints(n); return xs.map((x, i) => ({ t: 'UDim2', v: [x, xo[i], ys[i], yo[i]] })); }
      case 0x08: { const a = []; for (let i = 0; i < n; i++) { const v = []; for (let k = 0; k < 6; k++) v.push(r.f32()); a.push({ t: 'Ray', v }); } return a; }
      case 0x09: return Array.from(r.bytes(n), (b) => ({ t: 'Faces', v: b }));
      case 0x0a: return Array.from(r.bytes(n), (b) => ({ t: 'Axes', v: b }));
      case 0x0b: return r.uints(n).map((v) => ({ t: 'BrickColor', v }));
      case 0x0c: { const R = r.floats(n), G = r.floats(n), B = r.floats(n); return R.map((x, i) => ({ t: 'Color3', v: [x, G[i], B[i]] })); }
      case 0x0d: { const X = r.floats(n), Y = r.floats(n); return X.map((x, i) => ({ t: 'Vector2', v: [x, Y[i]] })); }
      case 0x0e: { const X = r.floats(n), Y = r.floats(n), Z = r.floats(n); return X.map((x, i) => ({ t: 'Vector3', v: [x, Y[i], Z[i]] })); }
      case 0x10: return readCFrames(r, n).map((v) => ({ t: 'CFrame', v }));
      case 0x1e: {
        r.u8(); // inner type (0x10)
        const cfs = readCFrames(r, n); r.u8(); // bool type
        const has = r.bytes(n);
        return cfs.map((v, i) => ({ t: 'OptionalCFrame', v: has[i] ? v : null }));
      }
      case 0x12: return r.uints(n).map((v) => ({ t: 'Enum', v }));
      case 0x13: return r.refs(n).map((v) => ({ t: 'Ref', v }));
      case 0x14: { const X = [], Y = [], Z = []; for (let i = 0; i < n; i++) X.push(r.dv.getInt16(r.o + i * 2, true)); r.o += n * 2; for (let i = 0; i < n; i++) Y.push(r.dv.getInt16(r.o + i * 2, true)); r.o += n * 2; for (let i = 0; i < n; i++) Z.push(r.dv.getInt16(r.o + i * 2, true)); r.o += n * 2; return X.map((x, i) => ({ t: 'Vector3int16', v: [x, Y[i], Z[i]] })); }
      case 0x15: { const a = []; for (let i = 0; i < n; i++) { const c = r.u32(), ks = []; for (let k = 0; k < c; k++) ks.push([r.f32(), r.f32(), r.f32()]); a.push({ t: 'NumberSequence', v: ks }); } return a; }
      case 0x16: { const a = []; for (let i = 0; i < n; i++) { const c = r.u32(), ks = []; for (let k = 0; k < c; k++) ks.push([r.f32(), r.f32(), r.f32(), r.f32(), r.f32()]); a.push({ t: 'ColorSequence', v: ks }); } return a; }
      case 0x17: { const a = []; for (let i = 0; i < n; i++) a.push({ t: 'NumberRange', v: [r.f32(), r.f32()] }); return a; }
      case 0x18: { const a = r.floats(n), b = r.floats(n), c = r.floats(n), d = r.floats(n); return a.map((x, i) => ({ t: 'Rect', v: [x, b[i], c[i], d[i]] })); }
      case 0x19: { const a = []; for (let i = 0; i < n; i++) { const flag = r.u8(); if (flag & 1) { const v = [r.f32(), r.f32(), r.f32(), r.f32(), r.f32()]; if (flag & 2) r.f32(); a.push({ t: 'PhysicalProperties', v }); } else a.push({ t: 'PhysicalProperties', v: null }); } return a; }
      case 0x1a: { const R = r.bytes(n), G = r.bytes(n), B = r.bytes(n); return Array.from(R, (x, i) => ({ t: 'Color3', v: [x / 255, G[i] / 255, B[i] / 255] })); }
      case 0x1b: return r.int64s(n).map((v) => ({ t: 'int64', v }));
      case 0x1c: return r.uints(n).map((v) => ({ t: 'SharedString', v }));
      case 0x1f: { r.bytes(n * 16); return Array.from({ length: n }, () => ({ t: 'UniqueId', v: null })); }
      case 0x20: { const a = []; for (let i = 0; i < n; i++) { const family = r.str(); const weight = r.u16(); const style = r.u8(); r.str(); a.push({ t: 'Font', v: { family, weight, style } }); } return a; }
      case 0x21: return r.int64s(n).map((v) => ({ t: 'SecurityCapabilities', v }));
      default:
        if (type !== 0x22 && type !== 0x23) warn(`Skipped ${ctx} (unknown binary type 0x${type.toString(16)})`); // 0x22/0x23: newer content/terrain data, duplicated elsewhere
        return null;
    }
  }

  function readCFrames(r, n) {
    const rots = [];
    for (let i = 0; i < n; i++) {
      const id = r.u8();
      if (id === 0) { const m = []; for (let k = 0; k < 9; k++) m.push(r.f32()); rots.push(m); }
      else rots.push(M.rotFromId(id));
    }
    const X = r.floats(n), Y = r.floats(n), Z = r.floats(n);
    return rots.map((m, i) => [X[i], Y[i], Z[i], ...m]);
  }

  const strict = new TextDecoder('utf-8', { fatal: true });
  function looksBinary(name, bytes) {
    if (/(Serialize|Data|Grid|Colors|Overrides)$/.test(name) && name !== 'Name') return true;
    if (bytes.includes(0)) return true;
    try { strict.decode(bytes); return false; } catch { return true; }
  }

  RBX.readBinary = async function (u8) {
    const warnings = [];
    const warn = (w) => { if (!warnings.includes(w)) warnings.push(w); };
    const { chunks } = await readChunks(u8);
    const classes = {}; // classId -> {name, refs}
    const byRef = new Map();
    const sharedStrings = [];
    const pending = [];
    for (const ch of chunks) {
      const r = new Reader(ch.data);
      if (ch.name === 'INST') {
        const id = r.u32(), name = r.str(); const fmt = r.u8(); const n = r.u32();
        const refs = r.refs(n);
        classes[id] = { name, refs };
        for (const ref of refs) byRef.set(ref, RBX.newInst(name));
      } else if (ch.name === 'PROP') {
        const id = r.u32(), pname = r.str(), type = r.u8();
        const cls = classes[id];
        if (!cls) continue;
        let vals;
        try { vals = readProp(r, type, cls.refs.length, warn, `${cls.name}.${pname}`); }
        catch (e) { warn(`Skipped ${cls.name}.${pname}: ${e.message}`); continue; }
        if (!vals) continue;
        const api = RBX.FILE_TO_API[pname] || pname;
        cls.refs.forEach((ref, i) => {
          const inst = byRef.get(ref); let val = vals[i];
          if (val.t === 'Ref') pending.push([inst, api, val.v]);
          if (val.t === 'string' && (api === 'AttributesSerialize' || api === 'Tags' || looksBinary(api, val.raw))) val = { t: 'BinaryString', v: val.raw };
          else delete val.raw;
          inst.props[api] = val;
        });
      } else if (ch.name === 'PRNT') {
        r.u8(); const n = r.u32(); const kids = r.refs(n), parents = r.refs(n);
        for (let i = 0; i < n; i++) {
          const c = byRef.get(kids[i]), p = byRef.get(parents[i]);
          if (c && p) RBX.addChild(p, c);
        }
      } else if (ch.name === 'SSTR') {
        r.u32(); const n = r.u32();
        for (let i = 0; i < n; i++) { r.bytes(16); sharedStrings.push(r.bytesStr()); }
      }
    }
    for (const [inst, prop, ref] of pending) inst.props[prop] = { t: 'Ref', v: ref === -1 ? null : byRef.get(ref) || null };
    for (const inst of byRef.values()) for (const k in inst.props) { const p = inst.props[k]; if (p.t === 'SharedString') p.bytes = sharedStrings[p.v]; }
    const roots = [...byRef.values()].filter((i) => !i.parent);
    return { roots, warnings };
  };
})();
