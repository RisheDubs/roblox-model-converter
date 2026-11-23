-- Pink jacket girl (blocky Roblox-style statue built from parts)
-- Paste into a Script or the Studio command bar, or build it on the Code -> Model tab.

local model = Instance.new("Model")
model.Name = "PinkJacketGirl"

-- Palette
local SKIN = Color3.fromRGB(240, 194, 168)
local SKIN_SHADE = Color3.fromRGB(222, 168, 146)
local TOP = Color3.fromRGB(236, 229, 214)
local TOP_SHADE = Color3.fromRGB(212, 203, 186)
local JEANS = Color3.fromRGB(112, 123, 142)
local JEANS_DARK = Color3.fromRGB(90, 99, 117)
local JEANS_LIGHT = Color3.fromRGB(152, 162, 180)
local STITCH = Color3.fromRGB(212, 146, 82)
local THREAD = Color3.fromRGB(238, 238, 242)
local JACKET = Color3.fromRGB(234, 128, 198)
local JACKET_DARK = Color3.fromRGB(198, 94, 164)
local LINING = Color3.fromRGB(34, 32, 36)
local QUILT = Color3.fromRGB(78, 75, 82)
local GOLD = Color3.fromRGB(216, 174, 64)
local METAL = Color3.fromRGB(196, 198, 206)
local BLACK = Color3.fromRGB(22, 22, 26)
local SHOE = Color3.fromRGB(244, 242, 244)
local SHOE_PINK = Color3.fromRGB(236, 118, 182)
local SOLE = Color3.fromRGB(214, 212, 218)
local LACE = Color3.fromRGB(150, 150, 160)
local HAIR = Color3.fromRGB(158, 98, 216)
local HAIR_DARK = Color3.fromRGB(108, 62, 170)
local HAIR_PINK = Color3.fromRGB(242, 92, 192)
local EYE_BLUE = Color3.fromRGB(72, 124, 204)
local LIPS = Color3.fromRGB(214, 104, 124)
local LIPS_LIGHT = Color3.fromRGB(228, 124, 142)
local FRECKLE = Color3.fromRGB(196, 128, 104)
local BLUSH = Color3.fromRGB(246, 160, 166)
local BROW = Color3.fromRGB(52, 34, 40)
local INK = Color3.fromRGB(92, 92, 104)

local function folder(name)
	local m = Instance.new("Model")
	m.Name = name
	m.Parent = model
	return m
end

local function part(name, size, cframe, color, parent, material)
	local p = Instance.new("Part")
	p.Name = name
	p.Size = size
	p.CFrame = cframe
	p.Color = color
	p.Material = material or Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.CanCollide = false
	p.Anchored = true
	p.Parent = parent or model
	return p
end

-- thin detail facing the front (-Z); rot = degrees around Z
local function front(name, w, h, x, y, z, rot, color, parent)
	return part(name, Vector3.new(w, h, 0.03), CFrame.new(x, y, z) * CFrame.Angles(0, 0, math.rad(rot or 0)), color, parent)
end

-- thin detail on a side face; w runs along Z
local function sideDetail(name, w, h, x, y, z, rot, color, parent)
	return part(name, Vector3.new(0.03, h, w), CFrame.new(x, y, z) * CFrame.Angles(math.rad(rot or 0), 0, 0), color, parent)
end

-- flat round dot facing the front
local function dot(name, d, x, y, z, color, parent)
	local p = part(name, Vector3.new(0.03, d, d), CFrame.new(x, y, z) * CFrame.Angles(0, math.rad(90), 0), color, parent)
	p.Shape = Enum.PartType.Cylinder
	return p
end

-- detail placed relative to another part's CFrame (for the bent arm)
local function on(base, name, size, offset, color, parent)
	return part(name, size, base * offset, color, parent)
end

-- ring made of short segments (hoop earrings)
local function hoop(name, center, radius, color, parent)
	for k = 0, 11 do
		local a = math.rad(k * 30)
		part(name, Vector3.new(radius * 0.55, 0.03, 0.03),
			center * CFrame.new(radius * math.cos(a), radius * math.sin(a), 0) * CFrame.Angles(0, 0, a + math.pi / 2), color, parent)
	end
end

------------------------------------------------------------------ Legs, jeans, sneakers
local legs = folder("Legs")
for _, side in ipairs({ -1, 1 }) do
	local x = side * 0.46
	local nm = side == 1 and "Left" or "Right"

	-- chunky high-top sneakers
	part(nm .. "Shoe", Vector3.new(0.82, 0.62, 1.08), CFrame.new(x, 0.37, -0.1), SHOE, legs)
	part("Sole", Vector3.new(0.86, 0.13, 1.12), CFrame.new(x, 0.065, -0.1), SOLE, legs)
	sideDetail("PinkTrim", 0.95, 0.06, x + side * 0.415, 0.2, -0.1, 0, SHOE_PINK, legs)
	sideDetail("PinkTrim", 0.95, 0.06, x - side * 0.415, 0.2, -0.1, 0, SHOE_PINK, legs)
	front("PinkTrim", 0.8, 0.06, x, 0.2, -0.655, 0, SHOE_PINK, legs)
	front("ToeCap", 0.7, 0.12, x, 0.3, -0.655, 0, SOLE, legs)
	part("Collar", Vector3.new(0.86, 0.12, 0.86), CFrame.new(x, 0.7, 0), LACE, legs)
	part("Tongue", Vector3.new(0.34, 0.3, 0.1), CFrame.new(x, 0.78, -0.4), SHOE, legs)
	for i = 0, 2 do
		local y = 0.42 + i * 0.1
		front("Lace", 0.4, 0.03, x, y, -0.66, 28, LACE, legs)
		front("Lace", 0.4, 0.03, x, y, -0.665, -28, LACE, legs)
	end
	front("LaceLoop", 0.06, 0.18, x - 0.1, 0.62, -0.67, 25, LACE, legs)
	front("LaceLoop", 0.06, 0.18, x + 0.1, 0.62, -0.67, -25, LACE, legs)

	-- bare calves
	part(nm .. "Calf", Vector3.new(0.62, 0.76, 0.62), CFrame.new(x, 1.08, 0), SKIN, legs)

	-- capri jeans with frayed hems
	local leg = part(nm .. " Leg", Vector3.new(0.84, 2.1, 0.84), CFrame.new(x, 2.5, 0), JEANS, legs, Enum.Material.Fabric)
	leg.CanCollide = true
	part("Hem", Vector3.new(0.88, 0.1, 0.88), CFrame.new(x, 1.49, 0), JEANS_LIGHT, legs, Enum.Material.Fabric)
	for i = -3, 3 do
		front("Fringe", 0.025, 0.09, x + i * 0.11, 1.41, -0.44, i * 9, THREAD, legs)
	end
	sideDetail("Seam", 0.03, 1.95, x + side * 0.425, 2.5, 0, 0, STITCH, legs)
	front("Crease", 0.025, 1.0, x - side * 0.08, 2.9, -0.425, 0, JEANS_DARK, legs)

	-- ripped knee
	front("KneeRip", 0.42, 0.24, x, 2.05, -0.425, 0, SKIN, legs)
	for i = -1, 1 do
		front("Thread", 0.46, 0.025, x, 2.05 + i * 0.07, -0.435, i * 3, THREAD, legs)
	end
	front("RipEdge", 0.48, 0.045, x, 2.18, -0.43, 2, THREAD, legs)
	front("RipEdge", 0.44, 0.04, x, 1.92, -0.43, -3, THREAD, legs)
end

-- ripped thigh on the left leg
front("ThighRip", 0.36, 0.2, -0.5, 3.05, -0.425, -8, SKIN, legs)
front("Thread", 0.4, 0.025, -0.5, 3.0, -0.435, -8, THREAD, legs)
front("Thread", 0.38, 0.025, -0.5, 3.08, -0.435, -6, THREAD, legs)
front("RipEdge", 0.4, 0.04, -0.5, 3.16, -0.43, -8, THREAD, legs)

-- colorful tattoo on the left calf
front("TattooYellow", 0.18, 0.16, -0.48, 1.3, -0.315, 10, Color3.fromRGB(242, 200, 60), legs)
dot("TattooEye", 0.06, -0.45, 1.31, -0.33, BLACK, legs)
front("TattooBlue", 0.16, 0.2, -0.43, 1.07, -0.315, -8, Color3.fromRGB(86, 146, 214), legs)
front("TattooPink", 0.2, 0.16, -0.5, 0.88, -0.315, 15, Color3.fromRGB(232, 112, 146), legs)
front("TattooLine", 0.02, 0.5, -0.56, 1.08, -0.33, 4, INK, legs)

------------------------------------------------------------------ Hips + waistband
local body = folder("Body")
local hips = part("Hips", Vector3.new(1.76, 0.65, 0.88), CFrame.new(0, 3.87, 0), JEANS, body, Enum.Material.Fabric)
hips.CanCollide = true
part("Waistband", Vector3.new(1.78, 0.2, 0.9), CFrame.new(0, 4.1, 0), JEANS_DARK, body, Enum.Material.Fabric)
front("Stitch", 1.7, 0.02, 0, 4.005, -0.455, 0, STITCH, body)
front("Stitch", 1.7, 0.02, 0, 4.19, -0.455, 0, STITCH, body)
dot("Button", 0.11, 0, 4.1, -0.465, METAL, body)
for _, lx in ipairs({ -0.8, -0.45, 0.45, 0.8 }) do
	front("BeltLoop", 0.07, 0.24, lx, 4.1, -0.465, 0, JEANS, body)
end
front("Fly", 0.02, 0.45, 0.1, 3.76, -0.445, 0, STITCH, body)
front("FlyCurve", 0.12, 0.02, 0.06, 3.53, -0.445, 40, STITCH, body)
front("CenterSeam", 0.025, 0.5, 0, 3.75, -0.442, 0, JEANS_DARK, body)
front("Pocket", 0.55, 0.025, 0.61, 3.83, -0.445, -40, STITCH, body)
front("Pocket", 0.55, 0.025, -0.61, 3.83, -0.445, 40, STITCH, body)
front("Rivet", 0.05, 0.05, 0.37, 3.97, -0.448, 0, GOLD, body)
front("Rivet", 0.05, 0.05, -0.37, 3.97, -0.448, 0, GOLD, body)

------------------------------------------------------------------ Midriff + crop top
part("Midriff", Vector3.new(1.42, 0.5, 0.72), CFrame.new(0, 4.44, 0), SKIN, body)
front("Navel", 0.04, 0.07, 0, 4.36, -0.365, 0, SKIN_SHADE, body)
front("Abs", 0.02, 0.3, 0, 4.48, -0.362, 0, SKIN_SHADE, body)

local chest = part("CropTop", Vector3.new(1.5, 1.1, 0.85), CFrame.new(0, 5.22, 0), TOP, body, Enum.Material.Fabric)
chest.CanCollide = true
part("TopHem", Vector3.new(1.52, 0.14, 0.87), CFrame.new(0, 4.74, 0), TOP_SHADE, body, Enum.Material.Fabric)
front("Fold", 0.5, 0.02, -0.35, 5.0, -0.43, 12, TOP_SHADE, body)
front("Fold", 0.45, 0.02, 0.38, 5.08, -0.43, -10, TOP_SHADE, body)
-- V neckline showing skin
for i, w in ipairs({ 0.52, 0.38, 0.24, 0.1 }) do
	front("NeckV", w, 0.085, 0, 5.73 - (i - 1) * 0.08, -0.43, 0, SKIN, body)
end
front("VEdge", 0.36, 0.03, -0.14, 5.6, -0.435, -58, TOP_SHADE, body)
front("VEdge", 0.36, 0.03, 0.14, 5.6, -0.435, 58, TOP_SHADE, body)
-- shoulders (tank top leaves them bare)
for _, side in ipairs({ -1, 1 }) do
	part("Shoulder", Vector3.new(0.42, 0.3, 0.7), CFrame.new(side * 0.92, 5.6, 0), SKIN, body)
	front("Strap", 0.16, 0.3, side * 0.66, 5.62, -0.432, 0, TOP, body)
end

-- neck, choker, necklace
part("Neck", Vector3.new(0.44, 0.36, 0.44), CFrame.new(0, 5.9, 0), SKIN, body)
part("Choker", Vector3.new(0.47, 0.1, 0.47), CFrame.new(0, 5.96, 0), BLACK, body)
dot("ChokerCharm", 0.08, 0, 5.87, -0.25, GOLD, body)
front("Chain", 0.26, 0.02, -0.09, 5.66, -0.44, -52, GOLD, body)
front("Chain", 0.26, 0.02, 0.09, 5.66, -0.44, 52, GOLD, body)
dot("Pendant", 0.13, 0, 5.53, -0.44, GOLD, body)
dot("PendantInner", 0.06, 0, 5.53, -0.455, Color3.fromRGB(176, 136, 44), body)
-- chest tattoo peeking out by the neckline
front("ChestInk", 0.12, 0.08, 0.36, 5.73, -0.432, 20, INK, body)
front("ChestInk", 0.08, 0.06, 0.48, 5.7, -0.432, -30, INK, body)

------------------------------------------------------------------ Jacket (slipped off the shoulders)
local jacket = folder("Jacket")
part("BackPanel", Vector3.new(2.15, 1.35, 0.22), CFrame.new(0, 4.5, 0.6), JACKET, jacket, Enum.Material.Fabric)
part("BackLining", Vector3.new(2.0, 0.42, 0.12), CFrame.new(0, 5.2, 0.48), LINING, jacket)
for i = -3, 3 do
	part("Quilt", Vector3.new(0.02, 0.4, 0.02), CFrame.new(i * 0.27, 5.2, 0.415) * CFrame.Angles(0, 0, math.rad(35)), QUILT, jacket)
	part("Quilt", Vector3.new(0.02, 0.4, 0.02), CFrame.new(i * 0.27, 5.2, 0.415) * CFrame.Angles(0, 0, math.rad(-35)), QUILT, jacket)
end
part("Waist", Vector3.new(2.2, 0.18, 0.26), CFrame.new(0, 3.85, 0.6), JACKET_DARK, jacket, Enum.Material.Fabric)
for _, side in ipairs({ -1, 1 }) do
	part("SideLining", Vector3.new(0.3, 1.0, 0.6), CFrame.new(side * 1.6, 4.8, 0.28), LINING, jacket)
	for j = 0, 2 do
		sideDetail("Quilt", 0.5, 0.02, side * 1.755, 4.5 + j * 0.25, 0.28, 30, QUILT, jacket)
		sideDetail("Quilt", 0.5, 0.02, side * 1.755, 4.5 + j * 0.25, 0.28, -30, QUILT, jacket)
	end
	sideDetail("Zipper", 0.03, 1.3, side * 1.08, 4.5, 0.48, 0, METAL, jacket)
end
-- zipper pull dangling on the right side
part("ZipPull", Vector3.new(0.05, 0.22, 0.03), CFrame.new(1.72, 4.42, -0.22) * CFrame.Angles(0, 0, math.rad(10)), METAL, jacket)
part("ZipTag", Vector3.new(0.12, 0.08, 0.03), CFrame.new(1.74, 4.28, -0.22), THREAD, jacket)

------------------------------------------------------------------ Arms
local arms = folder("Arms")
local function tattooSleeve(cf, parent)
	-- grey ink + a small rose on the upper arm's front
	on(cf, "Ink", Vector3.new(0.16, 0.12, 0.02), CFrame.new(-0.05, 0.25, -0.27) * CFrame.Angles(0, 0, 0.4), INK, parent)
	on(cf, "Ink", Vector3.new(0.1, 0.22, 0.02), CFrame.new(0.1, 0.05, -0.27) * CFrame.Angles(0, 0, -0.3), INK, parent)
	on(cf, "Ink", Vector3.new(0.2, 0.04, 0.02), CFrame.new(0, -0.2, -0.27), INK, parent)
	on(cf, "Rose", Vector3.new(0.1, 0.1, 0.02), CFrame.new(-0.08, -0.05, -0.275) * CFrame.Angles(0, 0, 0.8), Color3.fromRGB(214, 86, 110), parent)
	on(cf, "Leaf", Vector3.new(0.08, 0.05, 0.02), CFrame.new(-0.16, -0.12, -0.275) * CFrame.Angles(0, 0, -0.5), Color3.fromRGB(96, 150, 100), parent)
end
local function hand(cf, parent)
	part("Hand", Vector3.new(0.38, 0.44, 0.4), cf, SKIN, parent)
	on(cf, "Bracelet", Vector3.new(0.42, 0.05, 0.44), CFrame.new(0, 0.2, 0), METAL, parent)
	on(cf, "Ring", Vector3.new(0.12, 0.04, 0.02), CFrame.new(-0.06, -0.08, -0.21), METAL, parent)
	on(cf, "Ring", Vector3.new(0.12, 0.04, 0.02), CFrame.new(0.08, -0.12, -0.21), GOLD, parent)
	for i = 0, 3 do
		on(cf, "Nail", Vector3.new(0.06, 0.06, 0.02), CFrame.new(-0.13 + i * 0.087, -0.19, -0.21), BLACK, parent)
	end
end
local function sleeve(cf, len, parent)
	part("Sleeve", Vector3.new(0.78, len, 0.78), cf, JACKET, parent, Enum.Material.Fabric)
	on(cf, "Bunch", Vector3.new(0.86, 0.3, 0.86), CFrame.new(0, len / 2 - 0.1, 0), JACKET_DARK, parent)
	on(cf, "OpenLining", Vector3.new(0.8, 0.16, 0.8), CFrame.new(0, len / 2 + 0.08, 0), LINING, parent)
	on(cf, "Cuff", Vector3.new(0.7, 0.18, 0.7), CFrame.new(0, -len / 2 - 0.05, 0), JACKET_DARK, parent)
	on(cf, "Fold", Vector3.new(0.5, 0.03, 0.02), CFrame.new(0, 0.15, -0.395) * CFrame.Angles(0, 0, 0.3), JACKET_DARK, parent)
	on(cf, "Fold", Vector3.new(0.4, 0.03, 0.02), CFrame.new(0.05, -0.2, -0.395) * CFrame.Angles(0, 0, -0.25), JACKET_DARK, parent)
	on(cf, "Zip", Vector3.new(0.03, len * 0.8, 0.02), CFrame.new(0.3, 0, -0.395), METAL, parent)
end

-- right arm: hanging straight down
local rUpper = CFrame.new(1.17, 5.18, 0)
part("Right Arm", Vector3.new(0.52, 1.15, 0.52), rUpper, SKIN, arms).CanCollide = true
tattooSleeve(rUpper, arms)
sleeve(CFrame.new(1.2, 4.0, 0), 1.25, arms)
hand(CFrame.new(1.2, 3.12, 0), arms)

-- left arm: elbow out, hand resting on the hip
local shoulder = Vector3.new(-1.17, 5.75, 0)
local up1 = Vector3.new(math.sin(math.rad(25)), math.cos(math.rad(25)), 0)
local lUpper = CFrame.new(shoulder - up1 * 0.575) * CFrame.Angles(0, 0, math.rad(-25))
part("Left Arm", Vector3.new(0.52, 1.15, 0.52), lUpper, SKIN, arms).CanCollide = true
tattooSleeve(lUpper, arms)
local elbow = shoulder - up1 * 1.15
local handPos = Vector3.new(-0.86, 3.98, -0.15)
local fore = handPos - elbow
local foreAngle = math.atan2(-fore.X, -fore.Y) -- rotate so the sleeve's +Y points back up to the elbow
sleeve(CFrame.new(elbow + fore * 0.45) * CFrame.Angles(0, 0, -foreAngle), fore.Magnitude * 0.9, arms)
hand(CFrame.new(handPos.X, handPos.Y, -0.32) * CFrame.Angles(0, 0, -foreAngle), arms)

------------------------------------------------------------------ Head + face
local head = part("Head", Vector3.new(1.25, 1.25, 1.25), CFrame.new(0, 6.68, 0), SKIN)
head.CanCollide = true
local mesh = Instance.new("SpecialMesh")
mesh.MeshType = Enum.MeshType.Head
mesh.Parent = head

local face = folder("Face")
local FZ = -0.625
for _, side in ipairs({ -1, 1 }) do
	local ex = side * 0.24
	-- big blue eyes with winged lashes
	front("Eye", 0.25, 0.17, ex, 6.72, FZ, 0, Color3.fromRGB(250, 250, 252), face)
	dot("Iris", 0.15, ex, 6.71, FZ - 0.01, EYE_BLUE, face)
	dot("Pupil", 0.07, ex, 6.71, FZ - 0.02, BLACK, face)
	dot("Shine", 0.035, ex + 0.03, 6.74, FZ - 0.03, Color3.fromRGB(255, 255, 255), face)
	front("Lashes", 0.29, 0.05, ex, 6.81, FZ - 0.01, side * -4, BLACK, face)
	front("Wing", 0.11, 0.035, side * 0.4, 6.835, FZ - 0.01, side * 30, BLACK, face)
	front("LowerLash", 0.2, 0.02, ex, 6.63, FZ - 0.005, 0, BROW, face)
	-- bold arched brows
	front("BrowInner", 0.17, 0.055, side * 0.17, 6.93, FZ, side * 10, BROW, face)
	front("BrowOuter", 0.15, 0.045, side * 0.32, 6.95, FZ, side * -18, BROW, face)
	-- blush
	dot("Blush", 0.17, side * 0.34, 6.5, FZ, BLUSH, face)
	-- ears + gold hoops
	part("Ear", Vector3.new(0.07, 0.2, 0.14), CFrame.new(side * 0.655, 6.6, 0.05), SKIN, face)
	dot("Stud", 0.06, side * 0.67, 6.52, -0.02, GOLD, face)
	hoop("Hoop", CFrame.new(side * 0.71, 6.36, -0.05) * CFrame.Angles(0, math.rad(side * 40), 0), 0.15, GOLD, face)
end
-- nose + lips
front("Nose", 0.09, 0.15, 0, 6.53, FZ - 0.02, 0, SKIN_SHADE, face)
dot("NoseTip", 0.07, 0, 6.47, FZ - 0.04, BLUSH, face)
front("UpperLip", 0.21, 0.05, 0, 6.335, FZ - 0.01, 0, LIPS, face)
front("LowerLip", 0.19, 0.065, 0, 6.28, FZ - 0.01, 0, LIPS_LIGHT, face)
front("LipLine", 0.22, 0.015, 0, 6.31, FZ - 0.02, 2, Color3.fromRGB(160, 70, 90), face)
-- freckles
for _, f in ipairs({ { 0.1, 6.56 }, { 0.16, 6.5 }, { 0.24, 6.54 }, { 0.2, 6.6 }, { 0.3, 6.58 }, { 0.06, 6.61 } }) do
	dot("Freckle", 0.03, f[1], f[2], FZ - 0.008, FRECKLE, face)
	dot("Freckle", 0.03, -f[1], f[2] + 0.01, FZ - 0.008, FRECKLE, face)
end

------------------------------------------------------------------ Hair (long, wavy, purple with pink streaks)
local hair = folder("Hair")
part("Top", Vector3.new(1.4, 0.32, 1.4), CFrame.new(0, 7.42, 0.03), HAIR, hair)
part("Crown", Vector3.new(1.12, 0.12, 1.12), CFrame.new(0, 7.62, 0.06), HAIR, hair)
part("Back", Vector3.new(1.42, 2.3, 0.36), CFrame.new(0, 6.2, 0.72), HAIR, hair)
part("BackCurl", Vector3.new(1.2, 0.4, 0.4), CFrame.new(0.1, 4.98, 0.74) * CFrame.Angles(0, 0, math.rad(8)), HAIR_PINK, hair)
part("PartLine", Vector3.new(0.03, 0.02, 0.9), CFrame.new(-0.25, 7.585, -0.05), HAIR_DARK, hair)
for i, x in ipairs({ -0.5, -0.25, 0, 0.25, 0.5 }) do
	part("Strand", Vector3.new(0.035, 1.9, 0.03), CFrame.new(x, 6.25, 0.905), i % 2 == 0 and HAIR_PINK or HAIR_DARK, hair)
end

-- left side: tucked behind the ear
part("SideL", Vector3.new(0.22, 0.75, 1.0), CFrame.new(-0.73, 6.95, 0.15), HAIR, hair)
part("BehindEar", Vector3.new(0.3, 1.35, 0.45), CFrame.new(-0.72, 5.95, 0.48), HAIR_DARK, hair)
sideDetail("Streak", 0.06, 0.7, -0.845, 6.95, 0.25, 0, HAIR_PINK, hair)

-- right side: big wavy cascade over the shoulder
local waves = {
	{ Vector3.new(0.36, 0.95, 1.15), Vector3.new(0.75, 6.85, 0.08), 0, HAIR },
	{ Vector3.new(0.5, 0.62, 0.95), Vector3.new(0.86, 6.2, 0.4), 12, HAIR_DARK },
	{ Vector3.new(0.56, 0.62, 0.9), Vector3.new(1.02, 5.7, 0.48), -15, HAIR },
	{ Vector3.new(0.56, 0.56, 0.85), Vector3.new(1.08, 5.2, 0.5), 15, HAIR_PINK },
	{ Vector3.new(0.5, 0.5, 0.8), Vector3.new(1.0, 4.75, 0.52), -20, HAIR },
	{ Vector3.new(0.42, 0.42, 0.62), Vector3.new(1.12, 4.35, 0.52), 25, HAIR_PINK },
	{ Vector3.new(0.62, 0.45, 0.7), Vector3.new(1.48, 5.05, 0.55), 30, HAIR_PINK },
	{ Vector3.new(0.5, 0.36, 0.6), Vector3.new(1.7, 4.65, 0.5), -20, HAIR },
	{ Vector3.new(0.4, 0.3, 0.5), Vector3.new(1.85, 4.35, 0.45), 35, HAIR_PINK },
}
for i, w in ipairs(waves) do
	part("Wave" .. i, w[1], CFrame.new(w[2]) * CFrame.Angles(0, 0, math.rad(w[3])), w[4], hair)
end

-- side-swept bangs with a pink streak
part("Bangs", Vector3.new(0.95, 0.38, 0.22), CFrame.new(0.2, 7.12, -0.66) * CFrame.Angles(0, 0, math.rad(14)), HAIR, hair)
front("BangStreak", 0.7, 0.08, 0.2, 7.12, -0.785, 14, HAIR_PINK, hair)
front("BangShadow", 0.6, 0.03, 0.15, 7.0, -0.785, 14, HAIR_DARK, hair)
part("FaceLock", Vector3.new(0.24, 1.05, 0.3), CFrame.new(0.66, 6.55, -0.5) * CFrame.Angles(0, 0, math.rad(-5)), HAIR_PINK, hair)
part("LockCurl", Vector3.new(0.3, 0.25, 0.3), CFrame.new(0.74, 5.98, -0.45) * CFrame.Angles(0, 0, math.rad(25)), HAIR, hair)
part("SmallLock", Vector3.new(0.15, 0.4, 0.2), CFrame.new(-0.62, 7.0, -0.55), HAIR_DARK, hair)

model.PrimaryPart = hips
model.Parent = workspace
return model
