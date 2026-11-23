// IR -> Luau source that rebuilds the model with Instance.new
'use strict';
(function () {
  const RBX = window.RBX;
  const M = RBX.math;

  // Properties that exist in files but can't / shouldn't be set from a script.
  const SKIP = new Set(['AttributesSerialize', 'Tags', 'SourceAssetId', 'UniqueId', 'HistoryId', 'Capabilities', 'DefinesCapabilities', 'ScriptGuid', 'LinkedSource',
    'NeedsPivotMigration', 'ModelMeshCFrame', 'ModelMeshData', 'ModelMeshSize', 'formFactorRaw', 'FormFactor', 'Elasticity', 'Friction', 'Velocity', 'RotVelocity',
    'AssemblyLinearVelocity', 'AssemblyAngularVelocity', 'PhysicsData', 'InitialSize', 'MeshData', 'ChildData', 'AssetId', 'PhysicalConfigData', 'CollisionGroupId',
    'FrontSurfaceInput', 'BackSurfaceInput', 'LeftSurfaceInput', 'RightSurfaceInput', 'TopSurfaceInput', 'BottomSurfaceInput', 'FrontParamA', 'FrontParamB', 'BackParamA',
    'BackParamB', 'LeftParamA', 'LeftParamB', 'RightParamA', 'RightParamB', 'TopParamA', 'TopParamB', 'BottomParamA', 'BottomParamB',
    'UsePartColor', 'HasJointOffset', 'HasSkinnedMesh', 'JointOffset', 'SerializedDefaultAttributes', 'AeroMeshData', 'FluidFidelityInternal', 'UnionsScaleNonuniformly', 'MeshContent', 'TextureContent',
    'Name']);
  const PART_DERIVED = new Set(['BrickColor', 'Position', 'Orientation', 'Rotation']); // parts: CFrame/Color already cover these
  // Common defaults we can drop in compact mode.
  const DEFAULTS = {
    Anchored: false, CanCollide: true, CanTouch: true, CanQuery: true, CastShadow: true, Locked: false, Massless: false, Reflectance: 0, Transparency: 0, RootPriority: 0,
    CollisionGroup: 'Default', Archivable: true, TopSurface: 0, BottomSurface: 0, FrontSurface: 0, BackSurface: 0, LeftSurface: 0, RightSurface: 0, Disabled: false,
    RunContext: 0, Visible: true, ZIndex: 1, LayoutOrder: 0, Rotation: 0, AutoLocalize: true, Selectable: false, Active: false, ClipsDescendants: false, BorderMode: 0,
    SizeConstraint: 0, AutomaticSize: 0, TextWrapped: false, TextScaled: false, RichText: false, TextStrokeTransparency: 1, TextTransparency: 0, LineHeight: 1,
    MaxVisibleGraphemes: -1, Interactable: true, ImageTransparency: 0, BackgroundTransparency: 0, MaterialVariant: '', EnableFluidForces: true, AudioCanCollide: true,
    LevelOfDetail: 0, ModelStreamingMode: 0, DisplayOrder: 0, Enabled: true, RenderFidelity: 0, DoubleSided: false, SelectionImageObject: null, Sandboxed: false, ResetOnSpawn: true, IgnoreGuiInset: false,
  };

  const KEYWORDS = new Set('and break do else elseif end false for function if in local nil not or repeat return then true until while continue type typeof game workspace script Instance Vector3 Vector2 CFrame Color3 Enum math string table task print warn require self'.split(' '));

  function fmtNum(n, prec) {
    if (!isFinite(n)) return n > 0 ? 'math.huge' : n < 0 ? '-math.huge' : '0/0';
    const p = Math.pow(10, prec);
    let r = Math.round(n * p) / p;
    if (Object.is(r, -0)) r = 0;
    return String(r);
  }
  function luaStr(s) {
    if (/[\n\r]/.test(s) || (s.includes('"') && s.length > 40)) {
      let eq = '';
      while (s.includes(']' + eq + ']')) eq += '=';
      return `[${eq}[${s.startsWith('\n') ? '\n' : ''}${s}]${eq}]`;
    }
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\t/g, '\\t').replace(/[\x00-\x1f]/g, (c) => '\\' + c.charCodeAt(0)) + '"';
  }

  function valueToLua(prop, val, opt, inst) {
    const f = (n) => fmtNum(n, opt.precision);
    const v = val.v;
    switch (val.t) {
      case 'string': return luaStr(v);
      case 'bool': return v ? 'true' : 'false';
      case 'int': case 'int64': return String(v);
      case 'float': case 'double': return f(v);
      case 'Enum': {
        const type = RBX.PROP_ENUM[prop];
        const nm = type && RBX.enumName(type, v);
        return nm ? `Enum.${type}.${nm}` : String(v);
      }
      case 'BrickColor': return `BrickColor.new(${v})`;
      case 'Vector3': case 'Vector3int16': return `Vector3.new(${v.map(f).join(', ')})`;
      case 'Vector2': return `Vector2.new(${v.map(f).join(', ')})`;
      case 'OptionalCFrame': if (!v) return null; // fallthrough
      case 'CFrame': return cframeToLua(v, opt);
      case 'Color3': {
        const ints = v.map((x) => x * 255);
        if (ints.every((x) => Math.abs(x - Math.round(x)) < 0.01 && x >= -0.01 && x <= 255.01)) return `Color3.fromRGB(${ints.map(Math.round).join(', ')})`;
        return `Color3.new(${v.map(f).join(', ')})`;
      }
      case 'UDim': return `UDim.new(${f(v[0])}, ${Math.round(v[1])})`;
      case 'UDim2': return `UDim2.new(${f(v[0])}, ${Math.round(v[1])}, ${f(v[2])}, ${Math.round(v[3])})`;
      case 'NumberRange': return `NumberRange.new(${f(v[0])}, ${f(v[1])})`;
      case 'NumberSequence': return `NumberSequence.new({${v.map((k) => `NumberSequenceKeypoint.new(${f(k[0])}, ${f(k[1])}${k[2] ? ', ' + f(k[2]) : ''})`).join(', ')}})`;
      case 'ColorSequence': return `ColorSequence.new({${v.map((k) => `ColorSequenceKeypoint.new(${f(k[0])}, ${valueToLua('', { t: 'Color3', v: k.slice(1, 4) }, opt)})`).join(', ')}})`;
      case 'Rect': return `Rect.new(${v.map(f).join(', ')})`;
      case 'Ray': return `Ray.new(Vector3.new(${v.slice(0, 3).map(f).join(', ')}), Vector3.new(${v.slice(3).map(f).join(', ')}))`;
      case 'PhysicalProperties': return v ? `PhysicalProperties.new(${v.map(f).join(', ')})` : null;
      case 'Faces': { const n = ['Right', 'Top', 'Back', 'Left', 'Bottom', 'Front'].filter((_, i) => v & (1 << i)); return `Faces.new(${n.map((x) => 'Enum.NormalId.' + x).join(', ')})`; }
      case 'Axes': { const n = ['X', 'Y', 'Z'].filter((_, i) => v & (1 << i)); return `Axes.new(${n.map((x) => 'Enum.Axis.' + x).join(', ')})`; }
      case 'Font': {
        const w = RBX.enumName('FontWeight', v.weight) || 'Regular';
        return `Font.new(${luaStr(v.family)}, Enum.FontWeight.${w}, Enum.FontStyle.${v.style ? 'Italic' : 'Normal'})`;
      }
      default: return null; // Ref handled separately; SharedString/UniqueId/etc skipped
    }
  }

  function cframeToLua(c, opt) {
    const f = (n) => fmtNum(n, opt.precision);
    const pos = `${f(c[0])}, ${f(c[1])}, ${f(c[2])}`;
    if (M.isIdentityRot(c)) return `CFrame.new(${pos})`;
    if (opt.cframeStyle === 'matrix') return `CFrame.new(${c.map((x, i) => (i < 3 ? f(x) : fmtNum(x, Math.max(opt.precision, 6)))).join(', ')})`;
    const e = M.toEulerXYZ(c).map((r) => (r * 180) / Math.PI);
    const deg = (d) => { const s = fmtNum(d, Math.max(2, opt.precision - 1)); return s === '0' ? '0' : `math.rad(${s})`; };
    return `CFrame.new(${pos}) * CFrame.Angles(${e.map(deg).join(', ')})`;
  }

  function makeNamer() {
    const used = new Map();
    return (inst) => {
      let base = RBX.nameOf(inst).replace(/[^A-Za-z0-9_]+(.)?/g, (_, ch) => (ch ? ch.toUpperCase() : '')).replace(/^[^A-Za-z_]+/, '');
      if (!base) base = inst.cls;
      base = base.charAt(0).toLowerCase() + base.slice(1);
      if (base.length > 28) base = base.slice(0, 28);
      if (KEYWORDS.has(base)) base = base + inst.cls;
      const n = (used.get(base) || 0) + 1; used.set(base, n);
      return n === 1 ? base : base + n;
    };
  }

  RBX.generateLua = function (roots, opt) {
    opt = Object.assign({ precision: 3, compact: true, scripts: true, cframeStyle: 'angles', parent: 'workspace', header: '' }, opt);
    const all = []; RBX.walk(roots, (i) => all.push(i));
    const useTable = all.length > 180;
    const varOf = new Map();
    const namer = makeNamer();
    all.forEach((inst, i) => varOf.set(inst, useTable ? `I[${i + 1}]` : namer(inst)));
    const L = [];
    const notes = new Set();
    L.push('-- Generated by Model ⇄ Code (Roblox converter)');
    if (opt.header) L.push('-- ' + opt.header);
    L.push(`-- ${all.length} instance${all.length === 1 ? '' : 's'}. Paste into a Script, or the Studio command bar.`);
    L.push('');
    if (useTable) { L.push('local I = {} -- large model: instances are stored in a table'); L.push(''); }
    const refLines = [];
    const sourceLines = [];

    function emit(inst, depth) {
      const v = varOf.get(inst);
      const decl = useTable ? '' : 'local ';
      const name = RBX.nameOf(inst);
      L.push(`${decl}${v} = Instance.new(${luaStr(inst.cls)})${useTable ? ' -- ' + name.replace(/\n/g, ' ') : ''}`);
      if (name !== inst.cls) L.push(`${v}.Name = ${luaStr(name)}`);
      if (inst.cls === 'UnionOperation' || inst.cls === 'IntersectOperation' || inst.cls === 'NegateOperation') { notes.add('Unions'); L.push(`-- NOTE: union geometry can't be rebuilt by a script; this is an empty ${inst.cls}.`); }
      const keys = Object.keys(inst.props).sort((a, b) => order(a) - order(b) || a.localeCompare(b));
      for (const k of keys) {
        const val = inst.props[k];
        if (SKIP.has(k)) continue;
        if (RBX.BASEPART.has(inst.cls) && PART_DERIVED.has(k)) continue;
        if ((inst.cls === 'WeldConstraint' || inst.cls === 'NoCollisionConstraint') && (k === 'CFrame0' || k === 'State')) continue;
        if (val.t === 'Ref') { if (val.v && varOf.has(val.v)) refLines.push(`${v}.${k} = ${varOf.get(val.v)}`); continue; }
        if (k === 'Source') {
          if (opt.scripts && val.v) sourceLines.push([v, val.v]);
          continue;
        }
        if (k === 'Shape' && !RBX.PARTLIKE.has(inst.cls)) continue;
        if (opt.compact && k in DEFAULTS && DEFAULTS[k] === val.v) continue;
        if (opt.compact && k === 'Material' && val.v === 256) continue;
        if (opt.compact && k === 'Shape' && val.v === 1) continue;
        if (opt.compact && val.t === 'string' && val.v === '' ) continue;
        if (opt.compact && k === 'PivotOffset' && val.t === 'CFrame' && M.isIdentityRot(val.v) && !val.v[0] && !val.v[1] && !val.v[2]) continue;
        const lua = valueToLua(k, val, opt, inst);
        if (lua == null) continue;
        if (k === 'MeshId' && inst.cls === 'MeshPart') { notes.add('MeshPart'); L.push(`pcall(function() ${v}.${k} = ${lua} end) -- only works from the command bar / plugins`); continue; }
        L.push(`${v}.${k} = ${lua}`);
      }
      // attributes + tags
      const attrs = inst.props.AttributesSerialize;
      if (attrs && attrs.v && attrs.v.length > 4) {
        try {
          for (const a of RBX.decodeAttributes(attrs.v)) {
            if (a.unsupported) { L.push(`-- (attribute "${a.key}" and any after it use an unsupported type)`); break; }
            L.push(`${v}:SetAttribute(${luaStr(a.key)}, ${valueToLua('', a, opt)})`);
          }
        } catch (e) { L.push('-- (could not decode attributes)'); }
      }
      const tags = inst.props.Tags;
      if (tags && tags.v && tags.v.length) {
        for (const t of RBX.utf8.dec.decode(tags.v).split('\0').filter(Boolean)) L.push(`${v}:AddTag(${luaStr(t)})`);
      }
      for (const c of inst.children) { L.push(''); emit(c, depth + 1); }
      if (inst.parent) L.push(`${v}.Parent = ${varOf.get(inst.parent)}`);
    }
    function order(k) { return { Name: 0, Size: 1, CFrame: 2, Color: 3, Material: 4, Transparency: 5, Anchored: 6 }[k] ?? 10; }

    roots.forEach((r, i) => { if (i) L.push(''); emit(r, 0); });
    if (refLines.length) { L.push(''); L.push('-- References between instances'); L.push(...refLines); }
    if (sourceLines.length) {
      L.push(''); L.push('-- Script sources (setting .Source only works from the command bar or a plugin)');
      for (const [v, src] of sourceLines) L.push(`pcall(function() ${v}.Source = ${luaStr(src)} end)`);
    }
    L.push('');
    const GUI_ROOT = new Set(['ScreenGui', 'BillboardGui', 'SurfaceGui']);
    if (opt.parent && opt.parent !== 'none') for (const r of roots) {
      const p = opt.parent === 'workspace' && GUI_ROOT.has(r.cls) ? 'game:GetService("StarterGui")' : opt.parent;
      L.push(`${varOf.get(r)}.Parent = ${p}`);
    }
    L.push(roots.length === 1 ? `return ${varOf.get(roots[0])}` : `return { ${roots.map((r) => varOf.get(r)).join(', ')} }`);
    return { code: L.join('\n') + '\n', notes: [...notes], count: all.length };
  };
})();
