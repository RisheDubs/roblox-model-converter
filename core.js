// Shared data + helpers: enums, BrickColors, CFrame math, instance tree (IR).
// IR instance: { cls, props: { Name: {t:'string', v:'Part'} ... }, children: [], parent }
'use strict';

const RBX = (window.RBX = window.RBX || {});

RBX.ENUMS = {
  Material: { Plastic: 256, SmoothPlastic: 272, Neon: 288, Wood: 512, WoodPlanks: 528, Marble: 784, Basalt: 788, Slate: 800, CrackedLava: 804, Concrete: 816, Limestone: 820, Granite: 832, Pavement: 836, Brick: 848, Pebble: 864, Cobblestone: 880, Rock: 896, Sandstone: 912, CorrodedMetal: 1040, DiamondPlate: 1056, Foil: 1072, Metal: 1088, Grass: 1280, LeafyGrass: 1284, Sand: 1296, Fabric: 1312, Snow: 1328, Mud: 1344, Ground: 1360, Asphalt: 1376, Salt: 1392, Ice: 1536, Glacier: 1552, Glass: 1568, ForceField: 1584, Air: 1792, Water: 2048 },
  PartType: { Ball: 0, Block: 1, Cylinder: 2, Wedge: 3, CornerWedge: 4 },
  SurfaceType: { Smooth: 0, Glue: 1, Weld: 2, Studs: 3, Inlet: 4, Universal: 5, Hinge: 6, Motor: 7, SteppingMotor: 8, SmoothNoOutlines: 10 },
  NormalId: { Right: 0, Top: 1, Back: 2, Left: 3, Bottom: 4, Front: 5 },
  MeshType: { Head: 0, Torso: 1, Wedge: 2, Sphere: 3, Cylinder: 4, FileMesh: 5, Brick: 6, Prism: 7, Pyramid: 8, ParallelRamp: 9, RightAngleRamp: 10, CornerWedge: 11 },
  TextXAlignment: { Left: 0, Right: 1, Center: 2 },
  TextYAlignment: { Top: 0, Center: 1, Bottom: 2 },
  Font: { Legacy: 0, Arial: 1, ArialBold: 2, SourceSans: 3, SourceSansBold: 4, SourceSansLight: 5, SourceSansItalic: 6, Bodoni: 7, Garamond: 8, Cartoon: 9, Code: 10, Highway: 11, SciFi: 12, Arcade: 13, Fantasy: 14, Antique: 15, SourceSansSemibold: 16, Gotham: 17, GothamMedium: 18, GothamBold: 19, GothamBlack: 20, AmaticSC: 21, Bangers: 22, Creepster: 23, DenkOne: 24, Fondamento: 25, FredokaOne: 26, GrenzeGotisch: 27, IndieFlower: 28, JosefinSans: 29, Jura: 30, Kalam: 31, LuckiestGuy: 32, Merriweather: 33, Michroma: 34, Nunito: 35, Oswald: 36, PatrickHand: 37, PermanentMarker: 38, Roboto: 39, RobotoCondensed: 40, RobotoMono: 41, Sarpanch: 42, SpecialElite: 43, TitilliumWeb: 44, Ubuntu: 45 },
  FontWeight: { Thin: 100, ExtraLight: 200, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800, Heavy: 900 },
  FontStyle: { Normal: 0, Italic: 1 },
  SizeConstraint: { RelativeXY: 0, RelativeXX: 1, RelativeYY: 2 },
  ScaleType: { Stretch: 0, Slice: 1, Tile: 2, Fit: 3, Crop: 4 },
  FillDirection: { Horizontal: 0, Vertical: 1 },
  HorizontalAlignment: { Center: 0, Left: 1, Right: 2 },
  VerticalAlignment: { Center: 0, Top: 1, Bottom: 2 },
  SortOrder: { Name: 0, Custom: 1, LayoutOrder: 2 },
  AutomaticSize: { None: 0, X: 1, Y: 2, XY: 3 },
  ZIndexBehavior: { Global: 0, Sibling: 1 },
  RunContext: { Legacy: 0, Server: 1, Client: 2, Plugin: 3 },
  RollOffMode: { Inverse: 0, Linear: 1, LinearSquare: 2, InverseTapered: 3 },
  HumanoidRigType: { R6: 0, R15: 1 },
  BorderMode: { Outline: 0, Middle: 1, Inset: 2 },
  ApplyStrokeMode: { Contextual: 0, Border: 1 },
  ResamplerMode: { Default: 0, Pixelated: 1 },
  ModelStreamingMode: { Default: 0, Atomic: 1, Persistent: 2, PersistentPerPlayer: 3, Nonatomic: 4 },
  ModelLevelOfDetail: { Automatic: 0, StreamingMesh: 1, Disabled: 2 },
  RenderFidelity: { Automatic: 0, Precise: 1, Performance: 2 },
  CollisionFidelity: { Default: 0, Hull: 1, Box: 2, PreciseConvexDecomposition: 3 },
  TextTruncate: { None: 0, AtEnd: 1, SplitWord: 2 },
  HighlightDepthMode: { AlwaysOnTop: 0, Occluded: 1 },
  ParticleOrientation: { FacingCamera: 0, FacingCameraWorldUp: 1, VelocityParallel: 2, VelocityPerpendicular: 3 },
  EasingStyle: { Linear: 0, Sine: 1, Back: 2, Quad: 3, Quart: 4, Quint: 5, Bounce: 6, Elastic: 7, Exponential: 8, Circular: 9, Cubic: 10 },
  EasingDirection: { In: 0, Out: 1, InOut: 2 },
};

// Which enum a property name uses (property names are mostly unique across classes).
RBX.PROP_ENUM = {
  Material: 'Material', Shape: 'PartType', TopSurface: 'SurfaceType', BottomSurface: 'SurfaceType', LeftSurface: 'SurfaceType', RightSurface: 'SurfaceType', FrontSurface: 'SurfaceType', BackSurface: 'SurfaceType',
  Face: 'NormalId', MeshType: 'MeshType', TextXAlignment: 'TextXAlignment', TextYAlignment: 'TextYAlignment', Font: 'Font', SizeConstraint: 'SizeConstraint', ScaleType: 'ScaleType',
  FillDirection: 'FillDirection', HorizontalAlignment: 'HorizontalAlignment', VerticalAlignment: 'VerticalAlignment', SortOrder: 'SortOrder', AutomaticSize: 'AutomaticSize',
  ZIndexBehavior: 'ZIndexBehavior', RunContext: 'RunContext', RollOffMode: 'RollOffMode', RigType: 'HumanoidRigType', BorderMode: 'BorderMode', ApplyStrokeMode: 'ApplyStrokeMode',
  ResamplerMode: 'ResamplerMode', ModelStreamingMode: 'ModelStreamingMode', LevelOfDetail: 'ModelLevelOfDetail', RenderFidelity: 'RenderFidelity', CollisionFidelity: 'CollisionFidelity',
  TextTruncate: 'TextTruncate', DepthMode: 'HighlightDepthMode', Orientation_Particle: 'ParticleOrientation',
};

RBX.enumName = (type, value) => {
  const e = RBX.ENUMS[type];
  if (!e) return null;
  for (const k in e) if (e[k] === value) return k;
  return null;
};

// [number, name, r, g, b]
RBX.BRICKCOLORS = [
  [1, 'White', 242, 243, 243], [5, 'Brick yellow', 215, 197, 154], [18, 'Nougat', 204, 142, 105], [21, 'Bright red', 196, 40, 28], [23, 'Bright blue', 13, 105, 172],
  [24, 'Bright yellow', 245, 205, 48], [26, 'Black', 27, 42, 53], [28, 'Dark green', 40, 127, 71], [37, 'Bright green', 75, 151, 75], [38, 'Dark orange', 160, 95, 53],
  [102, 'Medium blue', 110, 153, 202], [104, 'Bright violet', 107, 50, 124], [106, 'Bright orange', 218, 133, 65], [119, 'Br. yellowish green', 164, 189, 71],
  [141, 'Earth green', 39, 70, 45], [151, 'Sand green', 120, 144, 130], [192, 'Reddish brown', 105, 64, 40], [194, 'Medium stone grey', 163, 162, 165],
  [199, 'Dark stone grey', 99, 95, 98], [208, 'Light stone grey', 229, 228, 223], [217, 'Brown', 124, 92, 70], [226, 'Cool yellow', 253, 234, 141],
  [1001, 'Institutional white', 248, 248, 248], [1002, 'Mid gray', 205, 205, 205], [1003, 'Really black', 17, 17, 17], [1004, 'Really red', 255, 0, 0],
  [1005, 'Deep orange', 255, 176, 0], [1006, 'Alder', 180, 128, 255], [1007, 'Dusty Rose', 163, 75, 75], [1009, 'New Yeller', 255, 255, 0], [1010, 'Really blue', 0, 0, 255],
  [1014, 'CGA brown', 170, 85, 0], [1015, 'Magenta', 170, 0, 170], [1018, 'Teal', 18, 238, 212], [1019, 'Toothpaste', 0, 255, 255], [1020, 'Lime green', 0, 255, 0],
  [1021, 'Camo', 58, 125, 21], [1022, 'Grime', 127, 142, 100], [1023, 'Lavender', 140, 91, 159], [1024, 'Pastel light blue', 175, 221, 255], [1025, 'Pastel orange', 255, 201, 201],
  [1027, 'Pastel blue-green', 159, 243, 233], [1028, 'Pastel green', 204, 255, 204], [1029, 'Pastel yellow', 255, 255, 204], [1030, 'Pastel brown', 255, 204, 153],
  [1031, 'Royal purple', 98, 37, 209], [1032, 'Hot pink', 255, 0, 191],
];
RBX.brickColorRGB = (n) => {
  const b = RBX.BRICKCOLORS.find((x) => x[0] === n);
  return b ? [b[2] / 255, b[3] / 255, b[4] / 255] : [163 / 255, 162 / 255, 165 / 255];
};

// Classes that behave like BaseParts (have Size/CFrame/Color and render in the preview).
RBX.BASEPART = new Set(['Part', 'WedgePart', 'CornerWedgePart', 'TrussPart', 'SpawnLocation', 'Seat', 'VehicleSeat', 'SkateboardPlatform', 'Platform', 'MeshPart', 'UnionOperation', 'NegateOperation', 'IntersectOperation', 'PartOperation', 'FlagStand']);
RBX.PARTLIKE = new Set(['Part', 'SpawnLocation', 'Seat', 'SkateboardPlatform', 'Platform', 'FlagStand']); // have Shape

// Names used in files (left) vs. names used by scripts (right).
RBX.FILE_TO_API = {
  size: 'Size', Color3uint8: 'Color', shape: 'Shape', Health_XML: 'Health', xmlRead_MaxDistance_3: 'MaxDistance',
  MaterialVariantSerialized: 'MaterialVariant', WorldPivotData: 'WorldPivot', Part0Internal: 'Part0', Part1Internal: 'Part1',
};

// ---------- CFrame math (12 numbers: x,y,z, r00..r22 row-major) ----------
const M = (RBX.math = {});
M.IDENT = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1];
M.isIdentityRot = (c, eps = 1e-6) =>
  Math.abs(c[3] - 1) < eps && Math.abs(c[4]) < eps && Math.abs(c[5]) < eps && Math.abs(c[6]) < eps && Math.abs(c[7] - 1) < eps && Math.abs(c[8]) < eps && Math.abs(c[9]) < eps && Math.abs(c[10]) < eps && Math.abs(c[11] - 1) < eps;
// Euler XYZ (CFrame.Angles) from rotation
M.toEulerXYZ = (c) => {
  const [r00, r01, r02, r10, r11, r12, r20, r21, r22] = c.slice(3);
  const ry = Math.asin(Math.max(-1, Math.min(1, r02)));
  if (Math.abs(r02) < 0.9999999) return [Math.atan2(-r12, r22), ry, Math.atan2(-r01, r00)];
  return [Math.atan2(r21, r11), ry, 0];
};
// Rotation matrix for a binary-format rotation id
M.rotFromId = (id) => {
  const n = (i) => [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]][i];
  const r = n(Math.floor((id - 1) / 6)), u = n((id - 1) % 6);
  const b = [r[1] * u[2] - r[2] * u[1], r[2] * u[0] - r[0] * u[2], r[0] * u[1] - r[1] * u[0]];
  return [r[0], u[0], b[0], r[1], u[1], b[1], r[2], u[2], b[2]];
};

// ---------- IR helpers ----------
RBX.newInst = (cls, name) => ({ cls, props: { Name: { t: 'string', v: name ?? cls } }, children: [], parent: null });
RBX.addChild = (p, c) => { c.parent = p; p.children.push(c); };
RBX.walk = (roots, fn, depth = 0) => { for (const r of roots) { fn(r, depth); RBX.walk(r.children, fn, depth + 1); } };
RBX.countAll = (roots) => { let n = 0; RBX.walk(roots, () => n++); return n; };
RBX.nameOf = (inst) => (inst.props.Name && inst.props.Name.v) || inst.cls;

// base64 <-> bytes
RBX.b64decode = (s) => { const bin = atob(s.replace(/\s+/g, '')); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
RBX.b64encode = (u) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
RBX.utf8 = { dec: new TextDecoder('utf-8'), enc: new TextEncoder() };

// ---------- Attributes (AttributesSerialize) codec ----------
RBX.decodeAttributes = (bytes) => {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let o = 0;
  const u32 = () => { const v = dv.getUint32(o, true); o += 4; return v; };
  const f32 = () => { const v = dv.getFloat32(o, true); o += 4; return v; };
  const str = () => { const n = u32(); const s = RBX.utf8.dec.decode(bytes.subarray(o, o + n)); o += n; return s; };
  const out = [];
  if (bytes.length < 4) return out;
  const count = u32();
  for (let i = 0; i < count; i++) {
    const key = str();
    const type = bytes[o++];
    let val;
    switch (type) {
      case 0x02: val = { t: 'string', v: str() }; break;
      case 0x03: val = { t: 'bool', v: bytes[o++] !== 0 }; break;
      case 0x05: val = { t: 'double', v: f32() }; break;
      case 0x06: val = { t: 'double', v: dv.getFloat64(o, true) }; o += 8; break;
      case 0x09: val = { t: 'UDim', v: [f32(), dv.getInt32(o, true)] }; o += 4; break;
      case 0x0a: { const xs = f32(), xo = dv.getInt32(o, true); o += 4; const ys = f32(), yo = dv.getInt32(o, true); o += 4; val = { t: 'UDim2', v: [xs, xo, ys, yo] }; break; }
      case 0x0e: val = { t: 'BrickColor', v: u32() }; break;
      case 0x0f: val = { t: 'Color3', v: [f32(), f32(), f32()] }; break;
      case 0x10: val = { t: 'Vector2', v: [f32(), f32()] }; break;
      case 0x11: val = { t: 'Vector3', v: [f32(), f32(), f32()] }; break;
      case 0x14: { const p = [f32(), f32(), f32()]; const id = bytes[o++]; let rot; if (id === 0) { rot = []; for (let k = 0; k < 9; k++) rot.push(f32()); } else rot = M.rotFromId(id); val = { t: 'CFrame', v: p.concat(rot) }; break; }
      case 0x17: { const n = u32(); const ks = []; for (let k = 0; k < n; k++) { const e = f32(), t = f32(), v = f32(); ks.push([t, v, e]); } val = { t: 'NumberSequence', v: ks }; break; }
      case 0x19: { const n = u32(); const ks = []; for (let k = 0; k < n; k++) { const e = f32(), t = f32(), r = f32(), g = f32(), b = f32(); ks.push([t, r, g, b, e]); } val = { t: 'ColorSequence', v: ks }; break; }
      case 0x1b: val = { t: 'NumberRange', v: [f32(), f32()] }; break;
      case 0x1c: val = { t: 'Rect', v: [f32(), f32(), f32(), f32()] }; break;
      default: out.push({ key, unsupported: true }); return out; // unknown size; stop
    }
    out.push({ key, ...val });
  }
  return out;
};

RBX.encodeAttributes = (attrs) => {
  const parts = [];
  const u32 = (v) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, v >>> 0, true); parts.push(b); };
  const i32 = (v) => { const b = new Uint8Array(4); new DataView(b.buffer).setInt32(0, v | 0, true); parts.push(b); };
  const f32 = (v) => { const b = new Uint8Array(4); new DataView(b.buffer).setFloat32(0, v, true); parts.push(b); };
  const f64 = (v) => { const b = new Uint8Array(8); new DataView(b.buffer).setFloat64(0, v, true); parts.push(b); };
  const str = (s) => { const e = RBX.utf8.enc.encode(s); u32(e.length); parts.push(e); };
  const byte = (v) => parts.push(new Uint8Array([v]));
  const ok = attrs.filter((a) => ['string', 'bool', 'double', 'UDim', 'UDim2', 'BrickColor', 'Color3', 'Vector2', 'Vector3', 'NumberRange', 'Rect'].includes(a.t));
  u32(ok.length);
  for (const a of ok) {
    str(a.key);
    switch (a.t) {
      case 'string': byte(0x02); str(a.v); break;
      case 'bool': byte(0x03); byte(a.v ? 1 : 0); break;
      case 'double': byte(0x06); f64(a.v); break;
      case 'UDim': byte(0x09); f32(a.v[0]); i32(a.v[1]); break;
      case 'UDim2': byte(0x0a); f32(a.v[0]); i32(a.v[1]); f32(a.v[2]); i32(a.v[3]); break;
      case 'BrickColor': byte(0x0e); u32(a.v); break;
      case 'Color3': byte(0x0f); a.v.forEach(f32); break;
      case 'Vector2': byte(0x10); a.v.forEach(f32); break;
      case 'Vector3': byte(0x11); a.v.forEach(f32); break;
      case 'NumberRange': byte(0x1b); a.v.forEach(f32); break;
      case 'Rect': byte(0x1c); a.v.forEach(f32); break;
    }
  }
  let len = 0; parts.forEach((p) => (len += p.length));
  const out = new Uint8Array(len); let o = 0; parts.forEach((p) => { out.set(p, o); o += p.length; });
  return out;
};
