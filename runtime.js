// Runs Luau-ish code in the browser (Fengari Lua VM) against a mock Roblox API,
// then turns the created instances into IR.
'use strict';
(function () {
  const RBX = window.RBX;
  RBX.ENUMS.Axis = { X: 0, Y: 1, Z: 2 };

  const PRELUDE = String.raw`
local __prints = {}
local function __fmtn(n)
  if n ~= n then return "nan" end
  if n == math.floor(n) and math.abs(n) < 1e15 then return string.format("%d", math.floor(n)) end
  return (string.format("%.4f", n):gsub("0+$", ""):gsub("%.$", ""))
end
print = function(...)
  local t = table.pack(...)
  local s = {}
  for i = 1, t.n do s[i] = tostring(t[i]) end
  __prints[#__prints + 1] = table.concat(s, " ")
end
warn = function(...) local t = table.pack(...) local s = {} for i = 1, t.n do s[i] = tostring(t[i]) end __prints[#__prints + 1] = "\u{26A0} " .. table.concat(s, " ") end
unpack = table.unpack
loadstring = load

function typeof(v)
  local mt = getmetatable(v)
  if type(v) == "table" and type(mt) == "table" and rawget(mt, "__type") then return mt.__type end
  return type(v)
end

-- Luau library extras
math.clamp = function(x, a, b) if x < a then return a elseif x > b then return b end return x end
math.round = function(x) if x >= 0 then return math.floor(x + 0.5) end return -math.floor(-x + 0.5) end
math.sign = function(x) if x > 0 then return 1 elseif x < 0 then return -1 end return 0 end
math.pow = function(a, b) return a ^ b end
math.atan2 = function(y, x) return math.atan(y, x or 1) end
math.log10 = math.log10 or function(x) return math.log(x, 10) end
math.noise = function(x, y, z)
  local n = math.sin((x or 0) * 12.9898 + (y or 0) * 78.233 + (z or 0) * 37.719) * 43758.5453
  return (n - math.floor(n)) - 0.5
end
math.lerp = function(a, b, t) return a + (b - a) * t end
table.find = function(t, v, init) for i = init or 1, #t do if t[i] == v then return i end end return nil end
table.clear = function(t) for k in pairs(t) do t[k] = nil end end
table.create = function(n, v) local t = {} for i = 1, n do t[i] = v end return t end
table.freeze = function(t) return t end
table.isfrozen = function() return false end
table.clone = function(t) local c = {} for k, v in pairs(t) do c[k] = v end return c end
string.split = function(s, sep)
  sep = sep or ","
  local out, i = {}, 1
  while true do
    local a, b = string.find(s, sep, i, true)
    if not a or sep == "" then out[#out + 1] = string.sub(s, i) break end
    out[#out + 1] = string.sub(s, i, a - 1)
    i = b + 1
  end
  return out
end
bit32 = {
  band = function(a, b) return math.floor(a) & math.floor(b) end, bor = function(a, b) return math.floor(a) | math.floor(b) end,
  bxor = function(a, b) return math.floor(a) ~ math.floor(b) end, lshift = function(a, n) return (math.floor(a) << n) & 0xFFFFFFFF end,
  rshift = function(a, n) return (math.floor(a) & 0xFFFFFFFF) >> n end, bnot = function(a) return (~math.floor(a)) & 0xFFFFFFFF end,
}
tick = function() return os.time() end
time = function() return 0 end
elapsedTime = time
wait = function() return 0, 0 end
spawn = function(f) f() end
delay = function(_, f) f() end
task = { wait = wait, spawn = function(f, ...) f(...) end, defer = function(f, ...) f(...) end, delay = function(_, f, ...) f(...) end, cancel = function() end }
require = function() error("require() isn't supported here - paste the module's code in directly", 2) end

local function mk(name) local mt = { __type = name } return mt end
local function nearly(a, b) return math.abs(a - b) < 1e-5 end

------------------------------------------------------------------ Vector3
local V3 = mk("Vector3")
local V3m = {}
local function v3(x, y, z) return setmetatable({ x or 0, y or 0, z or 0 }, V3) end
V3.__index = function(v, k)
  if k == "X" or k == "x" then return v[1] elseif k == "Y" or k == "y" then return v[2] elseif k == "Z" or k == "z" then return v[3]
  elseif k == "Magnitude" or k == "magnitude" then return math.sqrt(v[1] ^ 2 + v[2] ^ 2 + v[3] ^ 2)
  elseif k == "Unit" or k == "unit" then local m = math.sqrt(v[1] ^ 2 + v[2] ^ 2 + v[3] ^ 2) if m == 0 then return v3(0, 0, 0) end return v3(v[1] / m, v[2] / m, v[3] / m) end
  return V3m[k]
end
V3.__newindex = function() error("Vector3 values are read-only - make a new one with Vector3.new", 2) end
V3.__add = function(a, b) return v3(a[1] + b[1], a[2] + b[2], a[3] + b[3]) end
V3.__sub = function(a, b) return v3(a[1] - b[1], a[2] - b[2], a[3] - b[3]) end
V3.__mul = function(a, b)
  if type(a) == "number" then return v3(a * b[1], a * b[2], a * b[3]) end
  if type(b) == "number" then return v3(a[1] * b, a[2] * b, a[3] * b) end
  return v3(a[1] * b[1], a[2] * b[2], a[3] * b[3])
end
V3.__div = function(a, b)
  if type(b) == "number" then return v3(a[1] / b, a[2] / b, a[3] / b) end
  if type(a) == "number" then return v3(a / b[1], a / b[2], a / b[3]) end
  return v3(a[1] / b[1], a[2] / b[2], a[3] / b[3])
end
V3.__idiv = function(a, b) local d = V3.__div(a, b) return v3(math.floor(d[1]), math.floor(d[2]), math.floor(d[3])) end
V3.__unm = function(a) return v3(-a[1], -a[2], -a[3]) end
V3.__eq = function(a, b) return a[1] == b[1] and a[2] == b[2] and a[3] == b[3] end
V3.__tostring = function(v) return __fmtn(v[1]) .. ", " .. __fmtn(v[2]) .. ", " .. __fmtn(v[3]) end
function V3m.Dot(a, b) return a[1] * b[1] + a[2] * b[2] + a[3] * b[3] end
function V3m.Cross(a, b) return v3(a[2] * b[3] - a[3] * b[2], a[3] * b[1] - a[1] * b[3], a[1] * b[2] - a[2] * b[1]) end
function V3m.Lerp(a, b, t) return v3(a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t) end
function V3m.FuzzyEq(a, b, e) e = e or 1e-5 return math.abs(a[1] - b[1]) <= e and math.abs(a[2] - b[2]) <= e and math.abs(a[3] - b[3]) <= e end
function V3m.Abs(a) return v3(math.abs(a[1]), math.abs(a[2]), math.abs(a[3])) end
function V3m.Floor(a) return v3(math.floor(a[1]), math.floor(a[2]), math.floor(a[3])) end
function V3m.Ceil(a) return v3(math.ceil(a[1]), math.ceil(a[2]), math.ceil(a[3])) end
function V3m.Sign(a) return v3(math.sign(a[1]), math.sign(a[2]), math.sign(a[3])) end
function V3m.Min(a, b) return v3(math.min(a[1], b[1]), math.min(a[2], b[2]), math.min(a[3], b[3])) end
function V3m.Max(a, b) return v3(math.max(a[1], b[1]), math.max(a[2], b[2]), math.max(a[3], b[3])) end
function V3m.Angle(a, b) local d = V3m.Dot(a.Unit, b.Unit) return math.acos(math.clamp(d, -1, 1)) end
Vector3 = { new = v3, zero = v3(0, 0, 0), one = v3(1, 1, 1), xAxis = v3(1, 0, 0), yAxis = v3(0, 1, 0), zAxis = v3(0, 0, 1) }
Vector3.FromNormalId = function(n)
  local t = { [0] = v3(1, 0, 0), v3(0, 1, 0), v3(0, 0, 1), v3(-1, 0, 0), v3(0, -1, 0), v3(0, 0, -1) }
  return t[n.Value]
end
Vector3int16 = { new = v3 }

------------------------------------------------------------------ Vector2
local V2 = mk("Vector2")
local V2m = {}
local function v2(x, y) return setmetatable({ x or 0, y or 0 }, V2) end
V2.__index = function(v, k)
  if k == "X" or k == "x" then return v[1] elseif k == "Y" or k == "y" then return v[2]
  elseif k == "Magnitude" then return math.sqrt(v[1] ^ 2 + v[2] ^ 2)
  elseif k == "Unit" then local m = math.sqrt(v[1] ^ 2 + v[2] ^ 2) if m == 0 then return v2() end return v2(v[1] / m, v[2] / m) end
  return V2m[k]
end
V2.__add = function(a, b) return v2(a[1] + b[1], a[2] + b[2]) end
V2.__sub = function(a, b) return v2(a[1] - b[1], a[2] - b[2]) end
V2.__mul = function(a, b) if type(a) == "number" then return v2(a * b[1], a * b[2]) elseif type(b) == "number" then return v2(a[1] * b, a[2] * b) end return v2(a[1] * b[1], a[2] * b[2]) end
V2.__div = function(a, b) if type(b) == "number" then return v2(a[1] / b, a[2] / b) end return v2(a[1] / b[1], a[2] / b[2]) end
V2.__unm = function(a) return v2(-a[1], -a[2]) end
V2.__eq = function(a, b) return a[1] == b[1] and a[2] == b[2] end
V2.__tostring = function(v) return __fmtn(v[1]) .. ", " .. __fmtn(v[2]) end
function V2m.Dot(a, b) return a[1] * b[1] + a[2] * b[2] end
function V2m.Lerp(a, b, t) return v2(a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t) end
Vector2 = { new = v2, zero = v2(0, 0), one = v2(1, 1), xAxis = v2(1, 0), yAxis = v2(0, 1) }

------------------------------------------------------------------ CFrame
local CF = mk("CFrame")
local CFm = {}
local function cf(x, y, z, a, b, c, d, e, f, g, h, i)
  return setmetatable({ x, y, z, a, b, c, d, e, f, g, h, i }, CF)
end
local function cfrot(a, b, c, d, e, f, g, h, i) return cf(0, 0, 0, a, b, c, d, e, f, g, h, i) end
local function cfmul(A, B)
  local a = A
  local b = B
  return cf(
    a[4] * b[1] + a[5] * b[2] + a[6] * b[3] + a[1],
    a[7] * b[1] + a[8] * b[2] + a[9] * b[3] + a[2],
    a[10] * b[1] + a[11] * b[2] + a[12] * b[3] + a[3],
    a[4] * b[4] + a[5] * b[7] + a[6] * b[10], a[4] * b[5] + a[5] * b[8] + a[6] * b[11], a[4] * b[6] + a[5] * b[9] + a[6] * b[12],
    a[7] * b[4] + a[8] * b[7] + a[9] * b[10], a[7] * b[5] + a[8] * b[8] + a[9] * b[11], a[7] * b[6] + a[8] * b[9] + a[9] * b[12],
    a[10] * b[4] + a[11] * b[7] + a[12] * b[10], a[10] * b[5] + a[11] * b[8] + a[12] * b[11], a[10] * b[6] + a[11] * b[9] + a[12] * b[12])
end
local function cfpoint(a, v) return v3(a[4] * v[1] + a[5] * v[2] + a[6] * v[3] + a[1], a[7] * v[1] + a[8] * v[2] + a[9] * v[3] + a[2], a[10] * v[1] + a[11] * v[2] + a[12] * v[3] + a[3]) end
local function cfvec(a, v) return v3(a[4] * v[1] + a[5] * v[2] + a[6] * v[3], a[7] * v[1] + a[8] * v[2] + a[9] * v[3], a[10] * v[1] + a[11] * v[2] + a[12] * v[3]) end
local function cfinv(a)
  local x, y, z = a[1], a[2], a[3]
  return cf(-(a[4] * x + a[7] * y + a[10] * z), -(a[5] * x + a[8] * y + a[11] * z), -(a[6] * x + a[9] * y + a[12] * z),
    a[4], a[7], a[10], a[5], a[8], a[11], a[6], a[9], a[12])
end
local function rx(t) local c, s = math.cos(t), math.sin(t) return cfrot(1, 0, 0, 0, c, -s, 0, s, c) end
local function ry(t) local c, s = math.cos(t), math.sin(t) return cfrot(c, 0, s, 0, 1, 0, -s, 0, c) end
local function rz(t) local c, s = math.cos(t), math.sin(t) return cfrot(c, -s, 0, s, c, 0, 0, 0, 1) end
local function quatToCf(x, y, z, qx, qy, qz, qw)
  local m = math.sqrt(qx * qx + qy * qy + qz * qz + qw * qw)
  if m == 0 then m = 1 end
  qx, qy, qz, qw = qx / m, qy / m, qz / m, qw / m
  return cf(x, y, z,
    1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
    2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
    2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy))
end
local function cfToQuat(a)
  local m00, m01, m02, m10, m11, m12, m20, m21, m22 = a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12]
  local tr = m00 + m11 + m22
  if tr > 0 then local s = math.sqrt(tr + 1) * 2 return (m21 - m12) / s, (m02 - m20) / s, (m10 - m01) / s, 0.25 * s
  elseif m00 > m11 and m00 > m22 then local s = math.sqrt(1 + m00 - m11 - m22) * 2 return 0.25 * s, (m01 + m10) / s, (m02 + m20) / s, (m21 - m12) / s
  elseif m11 > m22 then local s = math.sqrt(1 + m11 - m00 - m22) * 2 return (m01 + m10) / s, 0.25 * s, (m12 + m21) / s, (m02 - m20) / s
  else local s = math.sqrt(1 + m22 - m00 - m11) * 2 return (m02 + m20) / s, (m12 + m21) / s, 0.25 * s, (m10 - m01) / s end
end
local function lookAt(at, target, up)
  up = up or v3(0, 1, 0)
  local look = (target - at).Unit
  if look.Magnitude == 0 then return cf(at[1], at[2], at[3], 1, 0, 0, 0, 1, 0, 0, 0, 1) end
  local right = look:Cross(up)
  if right.Magnitude < 1e-6 then right = look:Cross(v3(0, 0, 1)) end
  right = right.Unit
  local up2 = right:Cross(look).Unit
  return cf(at[1], at[2], at[3], right[1], up2[1], -look[1], right[2], up2[2], -look[2], right[3], up2[3], -look[3])
end
CF.__index = function(c, k)
  if k == "Position" or k == "p" then return v3(c[1], c[2], c[3])
  elseif k == "X" or k == "x" then return c[1] elseif k == "Y" or k == "y" then return c[2] elseif k == "Z" or k == "z" then return c[3]
  elseif k == "LookVector" or k == "lookVector" then return v3(-c[6], -c[9], -c[12])
  elseif k == "RightVector" or k == "XVector" then return v3(c[4], c[7], c[10])
  elseif k == "UpVector" or k == "YVector" then return v3(c[5], c[8], c[11])
  elseif k == "ZVector" then return v3(c[6], c[9], c[12])
  elseif k == "Rotation" then return cf(0, 0, 0, c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], c[12]) end
  return CFm[k]
end
CF.__newindex = function() error("CFrame values are read-only - make a new one with CFrame.new", 2) end
CF.__mul = function(a, b)
  if typeof(b) == "Vector3" then return cfpoint(a, b) end
  if typeof(b) ~= "CFrame" then error("CFrame can only be multiplied by a CFrame or Vector3", 2) end
  return cfmul(a, b)
end
CF.__add = function(a, b) return cf(a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12]) end
CF.__sub = function(a, b) return cf(a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12]) end
CF.__eq = function(a, b) for i = 1, 12 do if a[i] ~= b[i] then return false end end return true end
CF.__tostring = function(c) local t = {} for i = 1, 12 do t[i] = __fmtn(c[i]) end return table.concat(t, ", ") end
function CFm.Inverse(a) return cfinv(a) end
function CFm.ToWorldSpace(a, b) return cfmul(a, b) end
function CFm.ToObjectSpace(a, b) return cfmul(cfinv(a), b) end
function CFm.PointToWorldSpace(a, v) return cfpoint(a, v) end
function CFm.PointToObjectSpace(a, v) return cfpoint(cfinv(a), v) end
function CFm.VectorToWorldSpace(a, v) return cfvec(a, v) end
function CFm.VectorToObjectSpace(a, v) return cfvec(cfinv(a), v) end
function CFm.GetComponents(a) return table.unpack(a, 1, 12) end
CFm.components = CFm.GetComponents
function CFm.Orthonormalize(a) return a end
function CFm.ToEulerAnglesXYZ(c)
  local y = math.asin(math.clamp(c[6], -1, 1))
  if math.abs(c[6]) < 0.9999999 then return math.atan(-c[9], c[12]), y, math.atan(-c[5], c[4]) end
  return math.atan(c[11], c[8]), y, 0
end
function CFm.ToEulerAnglesYXZ(c)
  local x = math.asin(math.clamp(-c[9], -1, 1))
  if math.abs(c[9]) < 0.9999999 then return x, math.atan(c[6], c[12]), math.atan(c[7], c[8]) end
  return x, math.atan(-c[10], c[4]), 0
end
CFm.ToOrientation = CFm.ToEulerAnglesYXZ
function CFm.Lerp(a, b, t)
  local ax, ay, az, aw = cfToQuat(a)
  local bx, by, bz, bw = cfToQuat(b)
  local d = ax * bx + ay * by + az * bz + aw * bw
  if d < 0 then bx, by, bz, bw, d = -bx, -by, -bz, -bw, -d end
  local s0, s1
  if d > 0.9995 then s0, s1 = 1 - t, t else
    local th = math.acos(d) local sn = math.sin(th)
    s0, s1 = math.sin((1 - t) * th) / sn, math.sin(t * th) / sn
  end
  return quatToCf(a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t,
    ax * s0 + bx * s1, ay * s0 + by * s1, az * s0 + bz * s1, aw * s0 + bw * s1)
end
function CFm.FuzzyEq(a, b, e) e = e or 1e-5 for i = 1, 12 do if math.abs(a[i] - b[i]) > e then return false end end return true end
local function angles(x, y, z) return cfmul(cfmul(rx(x or 0), ry(y or 0)), rz(z or 0)) end
local function yxz(x, y, z) return cfmul(cfmul(ry(y or 0), rx(x or 0)), rz(z or 0)) end
CFrame = {
  new = function(...)
    local n = select("#", ...)
    local a = { ... }
    if n == 0 then return cf(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1) end
    if typeof(a[1]) == "Vector3" then
      if typeof(a[2]) == "Vector3" then return lookAt(a[1], a[2]) end
      return cf(a[1][1], a[1][2], a[1][3], 1, 0, 0, 0, 1, 0, 0, 0, 1)
    end
    if n == 3 then return cf(a[1], a[2], a[3], 1, 0, 0, 0, 1, 0, 0, 0, 1) end
    if n == 7 then return quatToCf(a[1], a[2], a[3], a[4], a[5], a[6], a[7]) end
    if n == 12 then return cf(table.unpack(a, 1, 12)) end
    error("CFrame.new: unsupported arguments", 2)
  end,
  Angles = angles, fromEulerAnglesXYZ = angles, fromEulerAngles = function(x, y, z) return angles(x, y, z) end,
  fromEulerAnglesYXZ = yxz, fromOrientation = yxz,
  lookAt = lookAt,
  fromAxisAngle = function(axis, t)
    local u = axis.Unit local x, y, z = u[1], u[2], u[3]
    local c, s = math.cos(t), math.sin(t) local C = 1 - c
    return cfrot(c + x * x * C, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, c + y * y * C, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, c + z * z * C)
  end,
  fromMatrix = function(p, vx, vy, vz)
    vz = vz or vx:Cross(vy).Unit
    return cf(p[1], p[2], p[3], vx[1], vy[1], vz[1], vx[2], vy[2], vz[2], vx[3], vy[3], vz[3])
  end,
  identity = cf(0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1),
}
CFrame.lookAlong = function(at, dir, up) return lookAt(at, at + dir, up) end

------------------------------------------------------------------ Color3
local C3 = mk("Color3")
local C3m = {}
local function c3(r, g, b) return setmetatable({ r or 0, g or 0, b or 0 }, C3) end
C3.__index = function(c, k)
  if k == "R" or k == "r" then return c[1] elseif k == "G" or k == "g" then return c[2] elseif k == "B" or k == "b" then return c[3] end
  return C3m[k]
end
C3.__eq = function(a, b) return a[1] == b[1] and a[2] == b[2] and a[3] == b[3] end
C3.__tostring = function(c) return __fmtn(c[1]) .. ", " .. __fmtn(c[2]) .. ", " .. __fmtn(c[3]) end
function C3m.Lerp(a, b, t) return c3(a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t) end
function C3m.ToHSV(c)
  local r, g, b = c[1], c[2], c[3]
  local mx, mn = math.max(r, g, b), math.min(r, g, b)
  local d = mx - mn local h = 0
  if d ~= 0 then
    if mx == r then h = ((g - b) / d) % 6 elseif mx == g then h = (b - r) / d + 2 else h = (r - g) / d + 4 end
    h = h / 6
  end
  return h, mx == 0 and 0 or d / mx, mx
end
function C3m.ToHex(c) return string.format("%02X%02X%02X", math.floor(c[1] * 255 + 0.5), math.floor(c[2] * 255 + 0.5), math.floor(c[3] * 255 + 0.5)) end
local function hsv(h, s, v)
  h = (h % 1) * 6 local i = math.floor(h) local f = h - i
  local p, q, t = v * (1 - s), v * (1 - s * f), v * (1 - s * (1 - f))
  if i == 0 then return c3(v, t, p) elseif i == 1 then return c3(q, v, p) elseif i == 2 then return c3(p, v, t)
  elseif i == 3 then return c3(p, q, v) elseif i == 4 then return c3(t, p, v) end
  return c3(v, p, q)
end
Color3 = {
  new = c3, fromRGB = function(r, g, b) return c3((r or 0) / 255, (g or 0) / 255, (b or 0) / 255) end, fromHSV = hsv,
  fromHex = function(h) h = h:gsub("#", "") return c3(tonumber(h:sub(1, 2), 16) / 255, tonumber(h:sub(3, 4), 16) / 255, tonumber(h:sub(5, 6), 16) / 255) end,
  toHSV = function(c) return C3m.ToHSV(c) end,
}

------------------------------------------------------------------ BrickColor
local BC = mk("BrickColor")
local function bcobj(e) return setmetatable({ Number = e[1], Name = e[2], Color = c3(e[3] / 255, e[4] / 255, e[5] / 255), r = e[3] / 255, g = e[4] / 255, b = e[5] / 255 }, BC) end
BC.__index = function(t, k) if k == "R" then return rawget(t, "r") elseif k == "G" then return rawget(t, "g") elseif k == "B" then return rawget(t, "b") end end
BC.__tostring = function(b) return b.Name end
BC.__eq = function(a, b) return a.Number == b.Number end
local function bcNearest(r, g, b)
  local best, bd = __BRICKCOLORS[1], math.huge
  for _, e in ipairs(__BRICKCOLORS) do
    local d = (e[3] / 255 - r) ^ 2 + (e[4] / 255 - g) ^ 2 + (e[5] / 255 - b) ^ 2
    if d < bd then best, bd = e, d end
  end
  return bcobj(best)
end
BrickColor = {
  new = function(a, g, b)
    if type(a) == "number" and g then return bcNearest(a, g, b) end
    if typeof(a) == "Color3" then return bcNearest(a[1], a[2], a[3]) end
    for _, e in ipairs(__BRICKCOLORS) do if e[1] == a or e[2] == a then return bcobj(e) end end
    return bcobj(__BRICKCOLORS[18])
  end,
  random = function() return bcobj(__BRICKCOLORS[math.random(#__BRICKCOLORS)]) end,
}
for name, num in pairs({ White = 1, Gray = 194, DarkGray = 199, Black = 26, Red = 21, Yellow = 24, Green = 28, Blue = 23 }) do
  BrickColor[name] = function() return BrickColor.new(num) end
end
BrickColor.palette = function(i) return bcobj(__BRICKCOLORS[(i % #__BRICKCOLORS) + 1]) end

------------------------------------------------------------------ small value types
local function simple(name, fields)
  local mt = mk(name)
  mt.__index = function(t, k) local i = fields[k] if i then return rawget(t, i) end end
  mt.__eq = function(a, b) for i = 1, #a do if a[i] ~= b[i] then return false end end return true end
  mt.__tostring = function(t) local s = {} for i = 1, #t do s[i] = tostring(t[i]) end return table.concat(s, ", ") end
  return mt
end
local UD = simple("UDim", { Scale = 1, Offset = 2 })
UDim = { new = function(s, o) return setmetatable({ s or 0, o or 0 }, UD) end }
UD.__add = function(a, b) return UDim.new(a[1] + b[1], a[2] + b[2]) end
UD.__sub = function(a, b) return UDim.new(a[1] - b[1], a[2] - b[2]) end
local UD2 = mk("UDim2")
UD2.__index = function(t, k)
  if k == "X" or k == "Width" then return UDim.new(t[1], t[2]) elseif k == "Y" or k == "Height" then return UDim.new(t[3], t[4]) end
  if k == "Lerp" then return function(a, b, al) local r = {} for i = 1, 4 do r[i] = a[i] + (b[i] - a[i]) * al end return setmetatable(r, UD2) end end
end
UD2.__eq = function(a, b) for i = 1, 4 do if a[i] ~= b[i] then return false end end return true end
UD2.__add = function(a, b) return setmetatable({ a[1] + b[1], a[2] + b[2], a[3] + b[3], a[4] + b[4] }, UD2) end
UD2.__sub = function(a, b) return setmetatable({ a[1] - b[1], a[2] - b[2], a[3] - b[3], a[4] - b[4] }, UD2) end
UD2.__tostring = function(t) return "{" .. t[1] .. ", " .. t[2] .. "}, {" .. t[3] .. ", " .. t[4] .. "}" end
UDim2 = {
  new = function(a, b, c, d)
    if typeof(a) == "UDim" then return setmetatable({ a[1], a[2], b[1], b[2] }, UD2) end
    return setmetatable({ a or 0, b or 0, c or 0, d or 0 }, UD2)
  end,
  fromScale = function(x, y) return setmetatable({ x or 0, 0, y or 0, 0 }, UD2) end,
  fromOffset = function(x, y) return setmetatable({ 0, x or 0, 0, y or 0 }, UD2) end,
}
local NR = simple("NumberRange", { Min = 1, Max = 2 })
NumberRange = { new = function(a, b) return setmetatable({ a, b or a }, NR) end }
local Rct = simple("Rect", {})
Rect = { new = function(a, b, c, d)
  if typeof(a) == "Vector2" then return setmetatable({ a[1], a[2], b[1], b[2] }, Rct) end
  return setmetatable({ a or 0, b or 0, c or 0, d or 0 }, Rct)
end }
local NSK = simple("NumberSequenceKeypoint", { Time = 1, Value = 2, Envelope = 3 })
NumberSequenceKeypoint = { new = function(t, v, e) return setmetatable({ t, v, e or 0 }, NSK) end }
local NS = mk("NumberSequence")
NS.__index = function(t, k) if k == "Keypoints" then return rawget(t, "k") end end
NumberSequence = { new = function(a, b)
  local ks
  if type(a) == "number" then ks = { NumberSequenceKeypoint.new(0, a), NumberSequenceKeypoint.new(1, b or a) } else ks = a end
  return setmetatable({ k = ks }, NS)
end }
local CSK = mk("ColorSequenceKeypoint")
CSK.__index = function(t, k) if k == "Time" then return rawget(t, 1) elseif k == "Value" then return rawget(t, 2) end end
ColorSequenceKeypoint = { new = function(t, c) return setmetatable({ t, c }, CSK) end }
local CS = mk("ColorSequence")
CS.__index = function(t, k) if k == "Keypoints" then return rawget(t, "k") end end
ColorSequence = { new = function(a, b)
  local ks
  if typeof(a) == "Color3" then ks = { ColorSequenceKeypoint.new(0, a), ColorSequenceKeypoint.new(1, b or a) } else ks = a end
  return setmetatable({ k = ks }, CS)
end }
local PP = simple("PhysicalProperties", { Density = 1, Friction = 2, Elasticity = 3, FrictionWeight = 4, ElasticityWeight = 5 })
PhysicalProperties = { new = function(d, f, e, fw, ew)
  if typeof(d) == "EnumItem" then return setmetatable({ 0.7, 0.3, 0.5, 1, 1 }, PP) end
  return setmetatable({ d, f, e, fw or 1, ew or 1 }, PP)
end }
local FNT = mk("Font")
FNT.__index = function(t, k)
  if k == "Family" then return rawget(t, 1) elseif k == "Weight" then return rawget(t, 2) elseif k == "Style" then return rawget(t, 3)
  elseif k == "Bold" then return rawget(t, 2).Value >= 600 end
end
local function fontNew(fam, w, s) return setmetatable({ fam, w or Enum.FontWeight.Regular, s or Enum.FontStyle.Normal }, FNT) end
Font = {
  new = fontNew,
  fromName = function(n, w, s) return fontNew("rbxasset://fonts/families/" .. n .. ".json", w, s) end,
  fromId = function(id, w, s) return fontNew("rbxassetid://" .. id, w, s) end,
  fromEnum = function(e)
    local map = { SourceSans = "SourceSansPro", Gotham = "GothamSSm", GothamBold = "GothamSSm", Arial = "Arial", Roboto = "Roboto", Ubuntu = "Ubuntu", Oswald = "Oswald", Arcade = "PressStart2P", Cartoon = "ComicNeueAngular", Code = "Inconsolata", FredokaOne = "FredokaOne", LuckiestGuy = "LuckiestGuy", Bangers = "Bangers" }
    local w = (e.Name:find("Bold") and Enum.FontWeight.Bold) or Enum.FontWeight.Regular
    return fontNew("rbxasset://fonts/families/" .. (map[e.Name] or e.Name) .. ".json", w)
  end,
}
local FC = mk("Faces")
Faces = { new = function(...) local m = 0 for _, n in ipairs({ ... }) do m = m | (1 << n.Value) end return setmetatable({ m = m }, FC) end }
local AX = mk("Axes")
Axes = { new = function(...) local m = 0 for _, n in ipairs({ ... }) do m = m | (1 << (n.EnumType == Enum.NormalId and (n.Value % 3) or n.Value)) end return setmetatable({ m = m }, AX) end }
TweenInfo = { new = function(...) return { ... } end }
local RAY = mk("Ray")
RAY.__index = function(r, k) if k == "Origin" then return rawget(r, "o") elseif k == "Direction" then return rawget(r, "d") elseif k == "Unit" then return setmetatable({ o = r.o, d = r.d.Unit }, RAY) end end
Ray = { new = function(o, d) return setmetatable({ o = o, d = d }, RAY) end }
local RND = mk("Random")
RND.__index = {
  NextNumber = function(self, a, b) local r = math.random() if a then return a + (b - a) * r end return r end,
  NextInteger = function(self, a, b) return math.random(a, b) end,
  NextUnitVector = function() return v3(math.random() - 0.5, math.random() - 0.5, math.random() - 0.5).Unit end,
}
Random = { new = function(seed) if seed then math.randomseed(math.floor(seed)) end return setmetatable({}, RND) end }
DateTime = { now = function() return { UnixTimestamp = os.time(), UnixTimestampMillis = os.time() * 1000 } end }

------------------------------------------------------------------ Enum
local EI = mk("EnumItem")
EI.__tostring = function(e) return "Enum." .. e.__typename .. "." .. e.Name end
EI.__index = function(e, k) if k == "EnumType" then return Enum[rawget(e, "__typename")] end end
local ET = mk("Enum")
local enumTypes = {}
Enum = setmetatable({}, { __index = function(_, tname)
  if enumTypes[tname] then return enumTypes[tname] end
  local data = __ENUMS[tname]
  if not data then error("Enum." .. tostring(tname) .. " isn't supported by this converter", 2) end
  local items, byValue = {}, {}
  for name, val in pairs(data) do local it = setmetatable({ Name = name, Value = val, __typename = tname }, EI) items[name] = it byValue[val] = it end
  local et = setmetatable({}, { __type = "Enum", __tostring = function() return tname end, __index = function(_, k)
    if k == "GetEnumItems" then return function() local l = {} for _, v in pairs(items) do l[#l + 1] = v end table.sort(l, function(a, b) return a.Value < b.Value end) return l end end
    if k == "FromValue" then return function(_, v) return byValue[v] end end
    if k == "FromName" then return function(_, n) return items[n] end end
    local it = items[k]
    if not it then error(tostring(k) .. " is not a valid member of Enum." .. tname .. " (or isn't supported by this converter)", 2) end
    return it
  end })
  enumTypes[tname] = et
  return et
end })
local function toEnum(prop, v)
  local tname = __PROP_ENUM[prop]
  if not tname then return v end
  if type(v) == "string" then return Enum[tname][v] end
  if type(v) == "number" then return Enum[tname]:FromValue(v) or v end
  return v
end

------------------------------------------------------------------ Instances
local SIGNAL = { Connect = function() return { Disconnect = function() end, Connected = true } end, Once = function() return { Disconnect = function() end } end, Wait = function() end }
SIGNAL.ConnectParallel = SIGNAL.Connect
local INST = { __type = "Instance" }
local D = setmetatable({}, { __mode = "k" })
local nextId = 0
local instCount = 0
local function isInst(v) return type(v) == "table" and getmetatable(v) == INST end

local BASEPART = {}
for _, c in ipairs(__BASEPART) do BASEPART[c] = true end
local GUIOBJ = { Frame = 1, TextLabel = 1, TextButton = 1, TextBox = 1, ImageLabel = 1, ImageButton = 1, ScrollingFrame = 1, ViewportFrame = 1, CanvasGroup = 1, VideoFrame = 1 }
local ANC = {
  Model = { "PVInstance" }, WorldModel = { "Model", "PVInstance" }, Workspace = { "WorldRoot", "Model", "PVInstance" }, Actor = { "Model", "PVInstance" },
  Script = { "BaseScript", "LuaSourceContainer" }, LocalScript = { "Script", "BaseScript", "LuaSourceContainer" }, ModuleScript = { "LuaSourceContainer" },
  ScreenGui = { "LayerCollector", "GuiBase2d" }, BillboardGui = { "LayerCollector", "GuiBase2d" }, SurfaceGui = { "SurfaceGuiBase", "LayerCollector", "GuiBase2d" },
  Weld = { "JointInstance" }, Motor6D = { "Motor", "JointInstance" }, Snap = { "JointInstance" },
  Decal = { "FaceInstance" }, Texture = { "Decal", "FaceInstance" },
  PointLight = { "Light" }, SpotLight = { "Light" }, SurfaceLight = { "Light" },
  SpecialMesh = { "FileMesh", "DataModelMesh" }, BlockMesh = { "BevelMesh", "DataModelMesh" }, CylinderMesh = { "BevelMesh", "DataModelMesh" },
  BoolValue = { "ValueBase" }, IntValue = { "ValueBase" }, NumberValue = { "ValueBase" }, StringValue = { "ValueBase" }, ObjectValue = { "ValueBase" },
  Vector3Value = { "ValueBase" }, CFrameValue = { "ValueBase" }, Color3Value = { "ValueBase" }, BrickColorValue = { "ValueBase" },
  RopeConstraint = { "Constraint" }, HingeConstraint = { "Constraint" }, SpringConstraint = { "Constraint" }, RodConstraint = { "Constraint" }, BallSocketConstraint = { "Constraint" },
  Shirt = { "Clothing" }, Pants = { "Clothing" }, Accessory = { "Accoutrement" }, Hat = { "Accoutrement" },
}
local function isA(cls, name)
  if cls == name or name == "Instance" then return true end
  if BASEPART[cls] and (name == "BasePart" or name == "PVInstance" or (name == "FormFactorPart" and cls ~= "MeshPart") or (name == "Part" and (cls == "SpawnLocation" or cls == "Seat" or cls == "Platform" or cls == "SkateboardPlatform")) or (name == "TriangleMeshPart" and cls == "MeshPart") or (name == "PartOperation" and (cls == "UnionOperation" or cls == "NegateOperation" or cls == "IntersectOperation"))) then return true end
  if GUIOBJ[cls] and (name == "GuiObject" or name == "GuiBase2d" or (name == "GuiButton" and (cls == "TextButton" or cls == "ImageButton"))) then return true end
  local a = ANC[cls]
  if a then for _, x in ipairs(a) do if x == name then return true end end end
  return false
end

local DEFAULTS = {}
local function partDefaults(cls)
  return {
    Size = cls == "Part" and v3(4, 1.2, 2) or (cls == "TrussPart" and v3(2, 2, 2) or (cls == "SpawnLocation" and v3(12, 1, 12) or v3(4, 1, 2))),
    CFrame = CFrame.identity, Color = c3(163 / 255, 162 / 255, 165 / 255), Transparency = 0, Reflectance = 0, Anchored = false,
    CanCollide = true, CanTouch = true, CanQuery = true, CastShadow = true, Locked = false, Massless = false,
    PivotOffset = CFrame.identity, CollisionGroup = "Default", MaterialVariant = "",
  }
end
local GENERIC = { Archivable = true, Enabled = true, Disabled = false, Visible = true, Value = nil, Text = "", Transparency = 0,
  BackgroundTransparency = 0, ZIndex = 1, LayoutOrder = 0, Brightness = 1, Range = 8, Volume = 0.5, Looped = false, Playing = false,
  MaxHealth = 100, Health = 100, WalkSpeed = 16, JumpPower = 50, Source = "" }

local function data(o) return D[o] end
local service -- forward
local game, workspace_

local function setParent(o, p)
  local d = D[o]
  if p ~= nil and not isInst(p) then error("Parent must be an Instance or nil", 3) end
  if d.destroyed then error("The Parent property of " .. tostring(d.props.Name or d.cls) .. " is locked (it was destroyed)", 3) end
  local q = p
  while q do if q == o then error("Attempt to set parent of " .. tostring(d.props.Name or d.cls) .. " to itself or a descendant", 3) end q = D[q].parent end
  if d.parent then
    local sib = D[d.parent].children
    for i = #sib, 1, -1 do if sib[i] == o then table.remove(sib, i) break end end
  end
  d.parent = p
  if p then local ch = D[p].children ch[#ch + 1] = o end
end

local function descendants(o, out)
  out = out or {}
  for _, c in ipairs(D[o].children) do out[#out + 1] = c descendants(c, out) end
  return out
end

local function bbox(parts)
  local mn, mx = { math.huge, math.huge, math.huge }, { -math.huge, -math.huge, -math.huge }
  for _, p in ipairs(parts) do
    local c, s = p.CFrame, p.Size
    for _, sx in ipairs({ -0.5, 0.5 }) do for _, sy in ipairs({ -0.5, 0.5 }) do for _, sz in ipairs({ -0.5, 0.5 }) do
      local w = cfpoint(c, v3(s[1] * sx, s[2] * sy, s[3] * sz))
      for i = 1, 3 do mn[i] = math.min(mn[i], w[i]) mx[i] = math.max(mx[i], w[i]) end
    end end end
  end
  if mn[1] == math.huge then return CFrame.identity, v3(0, 0, 0) end
  return CFrame.new((mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2, (mn[3] + mx[3]) / 2), v3(mx[1] - mn[1], mx[2] - mn[2], mx[3] - mn[3])
end
local function partsOf(o)
  local l = {}
  for _, d in ipairs(descendants(o)) do if BASEPART[D[d].cls] then l[#l + 1] = d end end
  return l
end
local function getPivot(o)
  local d = D[o]
  if BASEPART[d.cls] then return cfmul(o.CFrame, o.PivotOffset) end
  if d.props.WorldPivot then return d.props.WorldPivot end
  if d.props.PrimaryPart then return D[d.props.PrimaryPart].props.CFrame or CFrame.identity end
  return (bbox(partsOf(o)))
end
local function pivotTo(o, target)
  local d = D[o]
  if BASEPART[d.cls] then o.CFrame = cfmul(target, cfinv(o.PivotOffset)) return end
  local delta = cfmul(target, cfinv(getPivot(o)))
  for _, p in ipairs(partsOf(o)) do D[p].props.CFrame = cfmul(delta, p.CFrame) end
  if d.props.WorldPivot then d.props.WorldPivot = target end
end

local M = {}
function M.GetChildren(o) local t = {} for i, c in ipairs(D[o].children) do t[i] = c end return t end
function M.GetDescendants(o) return descendants(o) end
function M.FindFirstChild(o, name, rec)
  for _, c in ipairs(D[o].children) do if c.Name == name then return c end end
  if rec then for _, c in ipairs(D[o].children) do local r = M.FindFirstChild(c, name, true) if r then return r end end end
  return nil
end
function M.WaitForChild(o, name) local c = M.FindFirstChild(o, name) if not c then error("WaitForChild: " .. tostring(name) .. " doesn't exist (scripts can't wait in this converter)", 2) end return c end
function M.FindFirstChildOfClass(o, cls) for _, c in ipairs(D[o].children) do if D[c].cls == cls then return c end end end
function M.FindFirstChildWhichIsA(o, cls, rec)
  local list = rec and descendants(o) or D[o].children
  for _, c in ipairs(list) do if isA(D[c].cls, cls) then return c end end
end
function M.FindFirstAncestor(o, name) local p = D[o].parent while p do if p.Name == name then return p end p = D[p].parent end end
function M.FindFirstAncestorOfClass(o, cls) local p = D[o].parent while p do if D[p].cls == cls then return p end p = D[p].parent end end
function M.FindFirstAncestorWhichIsA(o, cls) local p = D[o].parent while p do if isA(D[p].cls, cls) then return p end p = D[p].parent end end
function M.IsDescendantOf(o, a) local p = D[o].parent while p do if p == a then return true end p = D[p].parent end return false end
function M.IsAncestorOf(o, d) return M.IsDescendantOf(d, o) end
function M.IsA(o, cls) return isA(D[o].cls, cls) end
function M.GetFullName(o) local n, p = { o.Name }, D[o].parent while p and p ~= game do table.insert(n, 1, p.Name) p = D[p].parent end return table.concat(n, ".") end
function M.ClearAllChildren(o) for _, c in ipairs(M.GetChildren(o)) do M.Destroy(c) end end
function M.Destroy(o)
  for _, c in ipairs(M.GetChildren(o)) do M.Destroy(c) end
  if D[o].parent then setParent(o, nil) end
  D[o].destroyed = true
end
M.Remove = function(o) setParent(o, nil) end
function M.SetAttribute(o, k, v)
  local d = D[o]
  if d.attrs[k] == nil then d.attrOrder[#d.attrOrder + 1] = k end
  d.attrs[k] = v
end
function M.GetAttribute(o, k) return D[o].attrs[k] end
function M.GetAttributes(o) local t = {} for k, v in pairs(D[o].attrs) do t[k] = v end return t end
function M.GetAttributeChangedSignal() return SIGNAL end
function M.GetPropertyChangedSignal() return SIGNAL end
function M.AddTag(o, t) local d = D[o] if not d.tags[t] then d.tags[t] = true d.tagOrder[#d.tagOrder + 1] = t end end
function M.RemoveTag(o, t) local d = D[o] d.tags[t] = nil for i, x in ipairs(d.tagOrder) do if x == t then table.remove(d.tagOrder, i) break end end end
function M.HasTag(o, t) return D[o].tags[t] == true end
function M.GetTags(o) local t = {} for i, x in ipairs(D[o].tagOrder) do t[i] = x end return t end
function M.GetPivot(o) return getPivot(o) end
function M.PivotTo(o, cf_) pivotTo(o, cf_) end
function M.SetPrimaryPartCFrame(o, cf_) pivotTo(o, cf_) end
function M.GetPrimaryPartCFrame(o) local pp = D[o].props.PrimaryPart return pp and pp.CFrame or getPivot(o) end
function M.MoveTo(o, pos) local p = getPivot(o) pivotTo(o, p + (pos - p.Position)) end
function M.TranslateBy(o, off) pivotTo(o, getPivot(o) + off) end
function M.GetBoundingBox(o) return bbox(partsOf(o)) end
function M.GetExtentsSize(o) local _, s = bbox(partsOf(o)) return s end
function M.GetScale(o) return D[o].scale or 1 end
function M.ScaleTo(o, s)
  local d = D[o]
  local k = s / (d.scale or 1)
  local piv = getPivot(o)
  for _, p in ipairs(partsOf(o)) do
    local rel = cfmul(cfinv(piv), p.CFrame)
    rel = cf(rel[1] * k, rel[2] * k, rel[3] * k, rel[4], rel[5], rel[6], rel[7], rel[8], rel[9], rel[10], rel[11], rel[12])
    D[p].props.CFrame = cfmul(piv, rel)
    D[p].props.Size = p.Size * k
  end
  d.scale = s
end
function M.GetMass(o) local s = o.Size return s[1] * s[2] * s[3] * 0.7 end
function M.BreakJoints() end
function M.MakeJoints() end
function M.SetNetworkOwner() end
function M.GetService(o, name) return service(name) end
M.FindService = M.GetService
function M.Clone(o)
  local map = {}
  local function copy(x)
    local d = D[x]
    if not (d.props.Archivable == nil or d.props.Archivable) then return nil end
    local n = Instance.new(d.cls)
    local nd = D[n]
    for k, v in pairs(d.props) do nd.props[k] = v end
    for _, k in ipairs(d.attrOrder) do M.SetAttribute(n, k, d.attrs[k]) end
    for _, t in ipairs(d.tagOrder) do M.AddTag(n, t) end
    nd.scale = d.scale
    map[x] = n
    for _, c in ipairs(d.children) do local cc = copy(c) if cc then setParent(cc, n) end end
    return n
  end
  local root = copy(o)
  for old, new in pairs(map) do
    for k, v in pairs(D[new].props) do if isInst(v) and map[v] then D[new].props[k] = map[v] end end
  end
  return root
end
local EVENTS = { Changed = 1, ChildAdded = 1, ChildRemoved = 1, DescendantAdded = 1, DescendantRemoving = 1, AncestryChanged = 1, Destroying = 1, Touched = 1, TouchEnded = 1,
  MouseButton1Click = 1, MouseButton1Down = 1, MouseButton1Up = 1, MouseEnter = 1, MouseLeave = 1, Activated = 1, Triggered = 1, PromptTriggered = 1, MouseClick = 1,
  Died = 1, HealthChanged = 1, Heartbeat = 1, RenderStepped = 1, Stepped = 1, PlayerAdded = 1, PlayerRemoving = 1, CharacterAdded = 1, FocusLost = 1, Ended = 1, Event = 1, OnServerEvent = 1, OnClientEvent = 1 }

INST.__index = function(o, k)
  local d = D[o]
  if d.service and d.props[k] ~= nil then return d.props[k] end
  local m = M[k]
  if m then return m end
  if k == "Parent" then return d.parent
  elseif k == "ClassName" then return d.cls
  elseif k == "Name" then return d.props.Name or d.cls end
  local v = d.props[k]
  if v ~= nil then return v end
  if BASEPART[d.cls] then
    if k == "Position" then return o.CFrame.Position
    elseif k == "Orientation" then local x, y, z = o.CFrame:ToOrientation() return v3(math.deg(x), math.deg(y), math.deg(z))
    elseif k == "Rotation" then local x, y, z = o.CFrame:ToEulerAnglesXYZ() return v3(math.deg(x), math.deg(y), math.deg(z))
    elseif k == "BrickColor" then return BrickColor.new(o.Color)
    elseif k == "Mass" then return M.GetMass(o)
    elseif k == "AssemblyMass" then return M.GetMass(o) end
    local def = d.defaults[k]
    if def ~= nil then return def end
    if k == "Material" then return Enum.Material.Plastic elseif k == "Shape" then return Enum.PartType.Block
    elseif k:find("Surface$") then return Enum.SurfaceType.Smooth end
  end
  if k == "WorldPivot" and isA(d.cls, "Model") then return getPivot(o) end
  if EVENTS[k] then return SIGNAL end
  for _, c in ipairs(d.children) do if c.Name == k then return c end end
  if GENERIC[k] ~= nil then return GENERIC[k] end
  return nil
end
INST.__newindex = function(o, k, v)
  local d = D[o]
  if d.service and k ~= "Name" then d.props[k] = v return end
  if k == "Parent" then setParent(o, v) return end
  if M[k] then error("Can't set " .. k .. " - it's a method", 2) end
  if k == "Name" then d.props.Name = tostring(v) return end
  if k == "ClassName" then error("ClassName is read-only", 2) end
  if BASEPART[d.cls] then
    if k == "Position" then local c = o.CFrame d.props.CFrame = c - c.Position + v return
    elseif k == "Orientation" then local p = o.CFrame.Position d.props.CFrame = yxz(math.rad(v[1]), math.rad(v[2]), math.rad(v[3])) + p return
    elseif k == "Rotation" then local p = o.CFrame.Position d.props.CFrame = angles(math.rad(v[1]), math.rad(v[2]), math.rad(v[3])) + p return
    elseif k == "BrickColor" then d.props.Color = (type(v) == "table" and v.Color) or BrickColor.new(v).Color return
    elseif k == "Color" and typeof(v) == "BrickColor" then v = v.Color end
  end
  if typeof(v) == "Vector3" and k == "Size" and BASEPART[d.cls] then v = v3(math.max(v[1], 0.001), math.max(v[2], 0.001), math.max(v[3], 0.001)) end
  d.props[k] = toEnum(k, v)
end
INST.__tostring = function(o) return o.Name end
INST.__eq = rawequal

Instance = {
  new = function(cls, parent)
    if type(cls) ~= "string" then error("Instance.new expects a class name string", 2) end
    instCount = instCount + 1
    if instCount > 50000 then error("Too many instances (over 50,000) - stopping", 2) end
    nextId = nextId + 1
    local o = setmetatable({}, INST)
    D[o] = { cls = cls, props = {}, children = {}, attrs = {}, attrOrder = {}, tags = {}, tagOrder = {}, id = nextId, defaults = BASEPART[cls] and partDefaults(cls) or {} }
    if parent then setParent(o, parent) end
    return o
  end,
}

local services = {}
service = function(name)
  if services[name] then return services[name] end
  local o = Instance.new(name)
  D[o].service = true
  services[name] = o
  if game then setParent(o, game) end
  return o
end
game = Instance.new("DataModel")
D[game].service = true
_G.game = game
for _, n in ipairs({ "Workspace", "ReplicatedStorage", "ServerStorage", "ServerScriptService", "StarterGui", "StarterPack", "StarterPlayer", "Lighting", "ReplicatedFirst", "SoundService", "Teams", "Players", "CollectionService", "TweenService", "RunService", "HttpService", "Debris" }) do service(n) end
workspace_ = services.Workspace
workspace = workspace_
Workspace = workspace_
D[game].props.Name = "Game"
D[workspace].props.Gravity = 196.2
local CollectionService = services.CollectionService
D[CollectionService].props.AddTag = function(_, o, t) M.AddTag(o, t) end
D[CollectionService].props.RemoveTag = function(_, o, t) M.RemoveTag(o, t) end
D[CollectionService].props.HasTag = function(_, o, t) return M.HasTag(o, t) end
D[CollectionService].props.GetTags = function(_, o) return M.GetTags(o) end
D[CollectionService].props.GetTagged = function(_, t)
  local r = {}
  for _, x in ipairs(descendants(game)) do if D[x].tags[t] then r[#r + 1] = x end end
  return r
end
D[services.TweenService].props.Create = function() return { Play = function() end, Cancel = function() end, Pause = function() end, Completed = SIGNAL } end
D[services.Debris].props.AddItem = function() end
D[services.HttpService].props.GenerateGUID = function(_, wrap) local s = string.format("%08X-%04X-%04X-%04X-%012X", math.random(0, 0xFFFFFFF), math.random(0, 0xFFFF), math.random(0, 0xFFFF), math.random(0, 0xFFFF), math.random(0, 0xFFFFFFF)) if wrap == false then return s end return "{" .. s .. "}" end
D[services.RunService].props.IsServer = function() return true end
D[services.RunService].props.IsClient = function() return false end
D[services.RunService].props.IsStudio = function() return true end
D[services.Players].props.GetPlayers = function() return {} end
script = Instance.new("Script")

------------------------------------------------------------------ serialization
local function jstr(s)
  return '"' .. s:gsub('[%c"\\]', function(c)
    if c == '"' then return '\\"' elseif c == "\\" then return "\\\\" elseif c == "\n" then return "\\n" elseif c == "\r" then return "\\r" elseif c == "\t" then return "\\t" end
    return string.format("\\u%04x", string.byte(c))
  end) .. '"'
end
local function jn(n)
  if n ~= n or n == math.huge or n == -math.huge then return "0" end
  if math.type(n) == "integer" then return tostring(n) end
  return string.format("%.10g", n)
end
local function arr(t, n) local s = {} for i = 1, n do s[i] = jn(t[i]) end return "[" .. table.concat(s, ",") .. "]" end
local function enc(v)
  local t = typeof(v)
  if t == "boolean" then return '{"t":"bool","v":' .. tostring(v) .. "}"
  elseif t == "number" then return '{"t":"num","v":' .. jn(v) .. "}"
  elseif t == "string" then return '{"t":"string","v":' .. jstr(v) .. "}"
  elseif t == "Vector3" then return '{"t":"Vector3","v":' .. arr(v, 3) .. "}"
  elseif t == "Vector2" then return '{"t":"Vector2","v":' .. arr(v, 2) .. "}"
  elseif t == "CFrame" then return '{"t":"CFrame","v":' .. arr(v, 12) .. "}"
  elseif t == "Color3" then return '{"t":"Color3","v":' .. arr(v, 3) .. "}"
  elseif t == "BrickColor" then return '{"t":"BrickColor","v":' .. v.Number .. "}"
  elseif t == "EnumItem" then return '{"t":"Enum","v":' .. v.Value .. "}"
  elseif t == "UDim" then return '{"t":"UDim","v":' .. arr(v, 2) .. "}"
  elseif t == "UDim2" then return '{"t":"UDim2","v":' .. arr(v, 4) .. "}"
  elseif t == "NumberRange" then return '{"t":"NumberRange","v":' .. arr(v, 2) .. "}"
  elseif t == "Rect" then return '{"t":"Rect","v":' .. arr(v, 4) .. "}"
  elseif t == "PhysicalProperties" then return '{"t":"PhysicalProperties","v":' .. arr(v, 5) .. "}"
  elseif t == "NumberSequence" then local s = {} for i, k in ipairs(v.k) do s[i] = arr(k, 3) end return '{"t":"NumberSequence","v":[' .. table.concat(s, ",") .. "]}"
  elseif t == "ColorSequence" then local s = {} for i, k in ipairs(v.k) do s[i] = "[" .. jn(k[1]) .. "," .. jn(k[2][1]) .. "," .. jn(k[2][2]) .. "," .. jn(k[2][3]) .. ",0]" end return '{"t":"ColorSequence","v":[' .. table.concat(s, ",") .. "]}"
  elseif t == "Font" then return '{"t":"Font","v":{"family":' .. jstr(v[1]) .. ',"weight":' .. v[2].Value .. ',"style":' .. v[3].Value .. "}}"
  elseif t == "Faces" then return '{"t":"Faces","v":' .. v.m .. "}"
  elseif t == "Axes" then return '{"t":"Axes","v":' .. v.m .. "}"
  elseif t == "Instance" then return '{"t":"Ref","v":' .. D[v].id .. "}"
  end
  return nil
end
local function encInst(o)
  local d = D[o]
  local ps = {}
  ps[#ps + 1] = '"Name":' .. enc(o.Name)
  if BASEPART[d.cls] then
    if d.props.Size == nil then d.props.Size = d.defaults.Size end
    if d.props.CFrame == nil then d.props.CFrame = CFrame.identity end
    if d.props.Color == nil then d.props.Color = d.defaults.Color end
  end
  local keys = {}
  for k in pairs(d.props) do if k ~= "Name" then keys[#keys + 1] = k end end
  table.sort(keys)
  for _, k in ipairs(keys) do local e = enc(d.props[k]) if e then ps[#ps + 1] = jstr(k) .. ":" .. e end end
  local at = {}
  for _, k in ipairs(d.attrOrder) do local e = d.attrs[k] ~= nil and enc(d.attrs[k]) if e then at[#at + 1] = "[" .. jstr(k) .. "," .. e .. "]" end end
  local tg = {}
  for i, t in ipairs(d.tagOrder) do tg[i] = jstr(t) end
  local ch = {}
  for _, c in ipairs(d.children) do ch[#ch + 1] = encInst(c) end
  return '{"c":' .. jstr(d.cls) .. ',"id":' .. d.id .. ',"p":{' .. table.concat(ps, ",") .. '},"a":[' .. table.concat(at, ",") .. '],"g":[' .. table.concat(tg, ",") .. '],"k":[' .. table.concat(ch, ",") .. "]}"
end

function __run(src)
  local f, err = load(src, "=YourCode")
  local roots, source = {}, ""
  local ok = f ~= nil
  local res
  if ok then
    ok, res = xpcall(f, function(e) return tostring(e) end)
    if not ok then err = res end
  end
  if ok then
    if isInst(res) then roots = { res } source = "return value"
    elseif type(res) == "table" and isInst(res[1]) then roots = res source = "returned table" end
    if #roots == 0 then roots = M.GetChildren(workspace) source = "workspace" end
    if #roots == 0 then
      for _, s in ipairs(M.GetChildren(game)) do for _, c in ipairs(M.GetChildren(s)) do roots[#roots + 1] = c end end
      source = "services"
    end
  end
  local rs = {}
  for i, r in ipairs(roots) do rs[i] = encInst(r) end
  local pr = {}
  for i, p in ipairs(__prints) do pr[i] = jstr(p) end
  return '{"ok":' .. tostring(ok) .. ',"error":' .. (err and jstr(tostring(err)) or "null") .. ',"source":' .. jstr(source) .. ',"prints":[' .. table.concat(pr, ",") .. '],"roots":[' .. table.concat(rs, ",") .. "]}"
end
`;

  // --- Luau -> Lua 5.3 best-effort source transforms ---
  function luauToLua(src) {
    const lines = src.split('\n');
    const out = [];
    for (let line of lines) {
      // export type / type alias (single line)
      if (/^\s*(export\s+)?type\s+\w+(<[^>]*>)?\s*=/.test(line)) { out.push('-- ' + line); continue; }
      // compound assignment
      line = line.replace(/^(\s*)([A-Za-z_][\w.:\[\]"']*)\s*(\.\.|\/\/|[+\-*/%^])=\s*(.+?)\s*(--.*)?$/, (m, ind, lhs, op, rhs, cm) => `${ind}${lhs} = ${lhs} ${op} (${rhs})${cm ? ' ' + cm : ''}`);
      // local x: Type = ...
      line = line.replace(/\blocal\s+([A-Za-z_]\w*)\s*:\s*[\w.]+(?:<[^>]*>)?\??(\s*=|\s*$)/g, 'local $1$2');
      // function params / return types
      line = line.replace(/\bfunction\b([^(]*)\(([^)]*)\)\s*(:\s*[^\n]*?)?(\s*(--.*)?)$/, (m, name, params, ret, tail) => {
        const p = params.replace(/:\s*[^,]+/g, '');
        return `function${name}(${p})${tail || ''}`;
      });
      // string interpolation `a {b} c`
      line = line.replace(/`([^`]*)`/g, (m, body) => {
        const parts = []; let i = 0, lit = '';
        while (i < body.length) {
          const ch = body[i];
          if (ch === '\\' && i + 1 < body.length) { lit += ch + body[i + 1]; i += 2; continue; }
          if (ch === '{') {
            let depth = 1, j = i + 1;
            while (j < body.length && depth) { if (body[j] === '{') depth++; else if (body[j] === '}') depth--; j++; }
            parts.push(JSON.stringify(lit).replace(/\\\\/g, '\\')); lit = '';
            parts.push(`tostring(${body.slice(i + 1, j - 1)})`); i = j; continue;
          }
          lit += ch; i++;
        }
        parts.push(JSON.stringify(lit).replace(/\\\\/g, '\\'));
        return '(' + parts.filter((p) => p !== '""').join(' .. ') + ')' || '""';
      });
      out.push(line);
    }
    let code = out.join('\n');
    // continue -> goto (only inside simple loops: append label before the loop's matching end)
    if (/\bcontinue\b/.test(code)) code = rewriteContinue(code);
    return code;
  }

  // Very small tokenizer-based rewrite of `continue` into `goto __continue_N`.
  function rewriteContinue(code) {
    const toks = [];
    const re = /--\[(=*)\[[\s\S]*?\]\1\]|--[^\n]*|\[(=*)\[[\s\S]*?\]\2\]|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|[A-Za-z_]\w*|[\s\S]/g;
    let m;
    while ((m = re.exec(code))) toks.push(m[0]);
    const stack = []; // entries: {type:'loop'|'block', id, used}
    let id = 0;
    let pendingLoop = false;
    const out = [];
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t === 'for' || t === 'while') { pendingLoop = true; out.push(t); continue; }
      if (t === 'do') { stack.push(pendingLoop ? { type: 'loop', id: ++id, used: false } : { type: 'block' }); pendingLoop = false; out.push(t); continue; }
      if (t === 'repeat') { stack.push({ type: 'repeat', id: ++id, used: false }); out.push(t); continue; }
      if (t === 'function' || t === 'if') { stack.push({ type: 'block' }); out.push(t); continue; }
      if (t === 'until') { const s = stack.pop(); if (s && s.used) out.push(`::__continue_${s.id}:: `); out.push(t); continue; }
      if (t === 'end') { const s = stack.pop(); if (s && s.type === 'loop' && s.used) out.push(`::__continue_${s.id}:: `); out.push(t); continue; }
      if (t === 'continue') {
        for (let k = stack.length - 1; k >= 0; k--) if (stack[k].type === 'loop' || stack[k].type === 'repeat') { stack[k].used = true; out.push(`goto __continue_${stack[k].id}`); break; }
        continue;
      }
      out.push(t);
    }
    return out.join('');
  }

  const CONTENT = new Set(['MeshId', 'TextureID', 'TextureId', 'Texture', 'Image', 'HoverImage', 'PressedImage', 'SoundId', 'AnimationId', 'ColorMap', 'NormalMap', 'MetalnessMap', 'RoughnessMap',
    'ShirtTemplate', 'PantsTemplate', 'Graphic', 'SkyboxBk', 'SkyboxDn', 'SkyboxFt', 'SkyboxLf', 'SkyboxRt', 'SkyboxUp', 'SunTextureId', 'MoonTextureId', 'CursorIcon', 'OverlayTextureId', 'BaseTextureId', 'LinkedSource']);
  const INT_PROPS = new Set(['ZIndex', 'LayoutOrder', 'BorderSizePixel', 'MaxVisibleGraphemes', 'DisplayOrder', 'ScrollBarThickness', 'TextSize_int', 'SelectionOrder']);

  function jsonToIR(j) {
    const byId = new Map();
    const refs = [];
    function build(node) {
      const inst = { cls: node.c, props: {}, children: [], parent: null };
      byId.set(node.id, inst);
      for (const k in node.p) {
        let v = node.p[k];
        if (v.t === 'num') {
          let t = 'float';
          if (INT_PROPS.has(k)) t = 'int';
          else if (k === 'Value' && node.c === 'IntValue') t = 'int64';
          else if (k === 'Value' && node.c === 'NumberValue') t = 'double';
          v = { t, v: v.v };
        }
        if (v.t === 'string' && CONTENT.has(k)) v.content = true;
        if (v.t === 'Ref') refs.push([inst, k, v.v]);
        if (v.t === 'BrickColor' && RBX.BASEPART.has(node.c)) { v = { t: 'Color3', v: RBX.brickColorRGB(v.v) }; k === 'BrickColor' && (inst.props.Color = v); continue; }
        if (v.t === 'CFrame' && k === 'WorldPivot') v = { t: 'OptionalCFrame', v: v.v };
        inst.props[k] = v;
      }
      if (node.a.length) {
        const attrs = node.a.map(([key, val]) => ({ key, t: val.t === 'num' ? 'double' : val.t, v: val.v }));
        inst.props.AttributesSerialize = { t: 'BinaryString', v: RBX.encodeAttributes(attrs) };
      }
      if (node.g.length) inst.props.Tags = { t: 'BinaryString', v: RBX.utf8.enc.encode(node.g.join('\0')) };
      for (const c of node.k) RBX.addChild(inst, build(c));
      return inst;
    }
    const roots = j.roots.map(build);
    for (const [inst, k, id] of refs) inst.props[k] = { t: 'Ref', v: byId.get(id) || null };
    return roots;
  }

  // --- Fengari loading & execution ---
  let fengariPromise = null;
  function loadFengari() {
    if (window.fengari) return Promise.resolve(window.fengari);
    if (!fengariPromise) fengariPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js';
      s.onload = () => (window.fengari ? res(window.fengari) : rej(new Error('Lua engine failed to start')));
      s.onerror = () => rej(new Error('Could not load the Lua engine (needs an internet connection the first time).'));
      document.head.appendChild(s);
    });
    return fengariPromise;
  }

  function luaTable(obj) {
    if (Array.isArray(obj)) return '{' + obj.map(luaTable).join(',') + '}';
    if (obj && typeof obj === 'object') return '{' + Object.entries(obj).map(([k, v]) => `[${JSON.stringify(k)}]=${luaTable(v)}`).join(',') + '}';
    return typeof obj === 'string' ? JSON.stringify(obj) : String(obj);
  }

  RBX.runLua = async function (userCode, { timeoutMs = 8000 } = {}) {
    const F = await loadFengari();
    const { lua, lauxlib, lualib, to_luastring } = F;
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);
    const consts = `__ENUMS = ${luaTable(RBX.ENUMS)}\n__PROP_ENUM = ${luaTable(RBX.PROP_ENUM)}\n__BRICKCOLORS = ${luaTable(RBX.BRICKCOLORS)}\n__BASEPART = ${luaTable([...RBX.BASEPART])}\n`;
    if (lauxlib.luaL_dostring(L, to_luastring(consts + PRELUDE)) !== 0) {
      throw new Error('Internal runtime error: ' + lua.lua_tojsstring(L, -1));
    }
    const start = performance.now();
    lua.lua_sethook(L, (L2) => {
      if (performance.now() - start > timeoutMs) lauxlib.luaL_error(L2, to_luastring(`Script took longer than ${timeoutMs / 1000}s (infinite loop?) - stopped`));
    }, lua.LUA_MASKCOUNT, 10000);
    lua.lua_getglobal(L, to_luastring('__run'));
    lua.lua_pushstring(L, to_luastring(luauToLua(userCode)));
    if (lua.lua_pcall(L, 1, 1, 0) !== 0) {
      return { ok: false, error: lua.lua_tojsstring(L, -1), prints: [], roots: [] };
    }
    const json = JSON.parse(lua.lua_tojsstring(L, -1));
    const roots = jsonToIR(json);
    return { ok: json.ok, error: json.error, prints: json.prints, source: json.source, roots };
  };
  RBX._luauToLua = luauToLua;
})();
