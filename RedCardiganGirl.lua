-- Red cardigan girl (blocky Roblox-style statue built from parts)
-- Paste into a Script or the Studio command bar, or build it on the Code -> Model tab.

local model = Instance.new("Model")
model.Name = "RedCardiganGirl"

-- Palette
local SKIN = Color3.fromRGB(244, 204, 182)
local SKIN_SHADE = Color3.fromRGB(226, 180, 158)
local BLOUSE = Color3.fromRGB(240, 232, 234)
local BLOUSE_SHADE = Color3.fromRGB(214, 204, 208)
local KNIT = Color3.fromRGB(214, 40, 62)
local KNIT_DARK = Color3.fromRGB(176, 28, 48)
local KNIT_LIGHT = Color3.fromRGB(232, 66, 86)
local BUTTON = Color3.fromRGB(150, 128, 92)
local SKIRT = Color3.fromRGB(150, 136, 124)
local SKIRT_DARK = Color3.fromRGB(124, 112, 102)
local SKIRT_LIGHT = Color3.fromRGB(170, 156, 144)
local SHOE = Color3.fromRGB(132, 74, 40)
local SHOE_DARK = Color3.fromRGB(92, 50, 26)
local GOLD = Color3.fromRGB(206, 170, 80)
local HAIR = Color3.fromRGB(112, 70, 44)
local HAIR_DARK = Color3.fromRGB(78, 46, 28)
local HAIR_LIGHT = Color3.fromRGB(152, 100, 64)
local EYE_BLUE = Color3.fromRGB(58, 140, 204)
local BLACK = Color3.fromRGB(24, 20, 22)
local WHITE = Color3.fromRGB(252, 252, 252)
local BROW = Color3.fromRGB(96, 58, 38)
local LIPS = Color3.fromRGB(226, 104, 116)
local LIPS_LIGHT = Color3.fromRGB(238, 128, 138)
local BLUSH = Color3.fromRGB(246, 158, 158)

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

-- flat round dot facing the front
local function dot(name, d, x, y, z, color, parent)
	local p = part(name, Vector3.new(0.03, d, d), CFrame.new(x, y, z) * CFrame.Angles(0, math.rad(90), 0), color, parent)
	p.Shape = Enum.PartType.Cylinder
	return p
end

-- detail placed relative to another CFrame (for the angled arms)
local function on(base, name, size, offset, color, parent, material)
	return part(name, size, base * offset, color, parent, material)
end

------------------------------------------------------------------ Legs + Mary Jane flats
local legs = folder("Legs")
for _, side in ipairs({ -1, 1 }) do
	local x = side * 0.32
	local leg = part(side == 1 and "Left Leg" or "Right Leg", Vector3.new(0.46, 2.1, 0.46), CFrame.new(x, 1.32, 0), SKIN, legs)
	leg.CanCollide = true
	front("Shin", 0.03, 0.9, x - side * 0.05, 0.95, -0.235, 0, SKIN_SHADE, legs)

	part("Shoe", Vector3.new(0.54, 0.26, 0.86), CFrame.new(x, 0.15, -0.12), SHOE, legs)
	part("Sole", Vector3.new(0.56, 0.06, 0.88), CFrame.new(x, 0.03, -0.12), SHOE_DARK, legs)
	part("Toe", Vector3.new(0.48, 0.2, 0.1), CFrame.new(x, 0.13, -0.58), SHOE, legs)
	part("Foot", Vector3.new(0.42, 0.04, 0.32), CFrame.new(x, 0.29, -0.36), SKIN, legs)
	part("Strap", Vector3.new(0.56, 0.06, 0.09), CFrame.new(x, 0.31, -0.2), SHOE_DARK, legs)
	dot("Buckle", 0.07, x + side * 0.285, 0.29, -0.2, GOLD, legs).CFrame = CFrame.new(x + side * 0.285, 0.29, -0.2)
	front("Stitch", 0.44, 0.02, x, 0.21, -0.636, 0, SHOE_DARK, legs)
end

------------------------------------------------------------------ Flared midi skirt (a cone of panels)
local skirt = folder("Skirt")
-- oval at the waist (hugs the hips), wide and round at the hem
local PANELS = 22
local TOP_Y, BOTTOM_Y = 4.42, 1.55
local TOP_RX, TOP_RZ = 0.76, 0.46
local BOTTOM_RX, BOTTOM_RZ = 1.48, 1.25
local function ring(a, y, rx, rz) return Vector3.new(rx * math.sin(a), y, -rz * math.cos(a)) end
local function mid(a)
	return (ring(a, TOP_Y, TOP_RX, TOP_RZ) + ring(a, BOTTOM_Y, BOTTOM_RX, BOTTOM_RZ)) / 2
end
for i = 0, PANELS - 1 do
	local a = (i / PANELS) * math.pi * 2
	local t = ring(a, TOP_Y, TOP_RX, TOP_RZ)
	local b = ring(a, BOTTOM_Y, BOTTOM_RX, BOTTOM_RZ)
	local up = (t - b).Unit
	local tangent = (mid(a + 0.01) - mid(a - 0.01)).Unit
	local right = (tangent - up * tangent:Dot(up)).Unit
	local width = (mid(a + math.pi / PANELS) - mid(a - math.pi / PANELS)).Magnitude * 1.25
	local color = (i % 3 == 0) and SKIRT_DARK or ((i % 3 == 1) and SKIRT or SKIRT_LIGHT)
	part("Panel", Vector3.new(width, (t - b).Magnitude, 0.08), CFrame.fromMatrix((t + b) / 2, right, up), color, skirt, Enum.Material.Fabric)
end
front("Waistband", 0.62, 0.12, 0, 4.38, -0.47, 0, SKIRT_DARK, skirt)
front("WaistStitch", 0.62, 0.02, 0, 4.31, -0.49, 0, SKIRT_LIGHT, skirt)

------------------------------------------------------------------ Blouse + cardigan
local top = folder("Top")
local torso = part("Torso", Vector3.new(1.4, 1.5, 0.8), CFrame.new(0, 5.15, 0), BLOUSE, top, Enum.Material.Fabric)
torso.CanCollide = true
-- blouse placket, buttons, collar
front("Placket", 0.1, 1.4, 0.03, 5.12, -0.415, 0, BLOUSE_SHADE, top)
for i = 0, 4 do
	dot("BlouseButton", 0.06, 0.03, 4.58 + i * 0.26, -0.43, BUTTON, top)
end
front("Tuck", 0.6, 0.02, 0, 4.5, -0.415, 0, BLOUSE_SHADE, top)
front("OpenNeck", 0.18, 0.16, 0, 5.8, -0.414, 0, SKIN, top)
front("OpenNeckV", 0.1, 0.1, 0, 5.7, -0.414, 45, SKIN, top)
part("CollarStand", Vector3.new(0.5, 0.1, 0.5), CFrame.new(0, 5.93, 0), BLOUSE, top)
for _, side in ipairs({ -1, 1 }) do
	front("Collar", 0.34, 0.2, side * 0.19, 5.84, -0.43, side * 28, BLOUSE, top)
	front("CollarEdge", 0.36, 0.02, side * 0.2, 5.74, -0.445, side * 28, BLOUSE_SHADE, top)
end

-- open cardigan: back, sides and two front panels
part("CardiganBack", Vector3.new(1.54, 1.95, 0.2), CFrame.new(0, 4.97, 0.34), KNIT, top, Enum.Material.Fabric)
for _, side in ipairs({ -1, 1 }) do
	part("CardiganSide", Vector3.new(0.3, 1.95, 0.86), CFrame.new(side * 0.62, 4.97, 0), KNIT, top, Enum.Material.Fabric)
	-- front panel up to the V, then a narrow strip to the shoulder
	part("CardiganFront", Vector3.new(0.42, 1.35, 0.1), CFrame.new(side * 0.53, 4.67, -0.44), KNIT, top, Enum.Material.Fabric)
	part("CardiganShoulder", Vector3.new(0.28, 0.6, 0.1), CFrame.new(side * 0.6, 5.65, -0.44), KNIT, top, Enum.Material.Fabric)
	-- ribbed button band running up the front edge and around the V
	part("Band", Vector3.new(0.1, 1.35, 0.12), CFrame.new(side * 0.33, 4.67, -0.45), KNIT_DARK, top, Enum.Material.Fabric)
	part("BandV", Vector3.new(0.1, 0.66, 0.12), CFrame.new(side * 0.4, 5.6, -0.45) * CFrame.Angles(0, 0, math.rad(side * 20)), KNIT_DARK, top, Enum.Material.Fabric)
	for i = 0, 8 do
		front("BandRib", 0.1, 0.015, side * 0.33, 4.08 + i * 0.145, -0.513, 0, KNIT, top)
	end
	-- ribbed hem
	part("Hem", Vector3.new(0.74, 0.2, 0.12), CFrame.new(side * 0.47, 4.0, -0.45), KNIT_DARK, top, Enum.Material.Fabric)
	for i = 0, 5 do
		front("HemRib", 0.015, 0.18, side * (0.17 + i * 0.12), 4.0, -0.513, 0, KNIT, top)
	end
	-- knit texture lines
	for i = 0, 3 do
		front("Knit", 0.015, 1.1, side * (0.45 + i * 0.08), 4.72, -0.493, 0, KNIT_LIGHT, top)
	end
end
-- buttons down the right front band
for i = 0, 5 do
	dot("Button", 0.08, -0.33, 4.18 + i * 0.22, -0.52, BUTTON, top)
end
-- patch pocket on the right front
front("Pocket", 0.36, 0.4, -0.55, 4.38, -0.495, 0, KNIT, top)
front("PocketRib", 0.36, 0.08, -0.55, 4.58, -0.5, 0, KNIT_DARK, top)
front("PocketEdge", 0.02, 0.4, -0.37, 4.38, -0.5, 0, KNIT_DARK, top)

------------------------------------------------------------------ Arms (pushed-up knit sleeves)
local arms = folder("Arms")
for _, side in ipairs({ -1, 1 }) do
	local armCF = CFrame.new(side * 0.95, 5.85, 0) * CFrame.Angles(0, 0, math.rad(side * 7))
	local sleeve = on(armCF, side == 1 and "Left Arm" or "Right Arm", Vector3.new(0.52, 1.45, 0.56), CFrame.new(0, -0.72, 0), KNIT, arms, Enum.Material.Fabric)
	sleeve.CanCollide = true
	on(armCF, "ShoulderCap", Vector3.new(0.56, 0.12, 0.6), CFrame.new(0, -0.06, 0), KNIT_LIGHT, arms, Enum.Material.Fabric)
	on(armCF, "Wrinkle", Vector3.new(0.4, 0.025, 0.02), CFrame.new(0, -0.95, -0.285) * CFrame.Angles(0, 0, 0.25), KNIT_DARK, arms)
	on(armCF, "Wrinkle", Vector3.new(0.35, 0.025, 0.02), CFrame.new(0, -1.15, -0.285) * CFrame.Angles(0, 0, -0.2), KNIT_DARK, arms)
	-- bunched + ribbed cuff
	on(armCF, "Bunch", Vector3.new(0.6, 0.26, 0.62), CFrame.new(0, -1.55, 0), KNIT, arms, Enum.Material.Fabric)
	on(armCF, "Cuff", Vector3.new(0.54, 0.2, 0.58), CFrame.new(0, -1.76, 0), KNIT_DARK, arms, Enum.Material.Fabric)
	for i = -2, 2 do
		on(armCF, "CuffRib", Vector3.new(0.015, 0.18, 0.02), CFrame.new(i * 0.1, -1.76, -0.295), KNIT, arms)
	end
	-- forearm + hand
	on(armCF, "Forearm", Vector3.new(0.4, 0.85, 0.42), CFrame.new(0, -2.28, 0), SKIN, arms)
	on(armCF, "Hand", Vector3.new(0.38, 0.5, 0.4), CFrame.new(0, -2.95, 0), SKIN, arms)
	for i = -1, 1 do
		on(armCF, "Finger", Vector3.new(0.015, 0.22, 0.02), CFrame.new(i * 0.09, -3.08, -0.205), SKIN_SHADE, arms)
	end
	on(armCF, "Thumb", Vector3.new(0.1, 0.2, 0.1), CFrame.new(-side * 0.17, -2.88, -0.12), SKIN, arms)
end

------------------------------------------------------------------ Neck + head + face
part("Neck", Vector3.new(0.4, 0.4, 0.4), CFrame.new(0, 6.1, 0), SKIN)
local head = part("Head", Vector3.new(1.25, 1.25, 1.25), CFrame.new(0, 6.85, 0), SKIN)
head.CanCollide = true
local mesh = Instance.new("SpecialMesh")
mesh.MeshType = Enum.MeshType.Head
mesh.Parent = head

local face = folder("Face")
local FZ = -0.625
for _, side in ipairs({ -1, 1 }) do
	local ex = side * 0.24
	-- big blue eyes with long lashes
	front("Eye", 0.26, 0.2, ex, 6.93, FZ, 0, WHITE, face)
	dot("Iris", 0.17, ex, 6.92, FZ - 0.01, EYE_BLUE, face)
	dot("IrisRing", 0.11, ex, 6.92, FZ - 0.015, Color3.fromRGB(40, 104, 166), face)
	dot("Pupil", 0.07, ex, 6.92, FZ - 0.02, BLACK, face)
	dot("Shine", 0.04, ex + 0.035, 6.96, FZ - 0.03, WHITE, face)
	dot("Shine2", 0.02, ex - 0.03, 6.88, FZ - 0.03, WHITE, face)
	front("Lashes", 0.3, 0.055, ex, 7.03, FZ - 0.01, side * -6, BLACK, face)
	for k = 0, 2 do
		front("Lash", 0.06, 0.025, side * (0.33 + k * 0.035), 7.05 + k * 0.015, FZ - 0.012, side * (25 + k * 12), BLACK, face)
	end
	front("LowerLash", 0.22, 0.02, ex, 6.82, FZ - 0.005, 0, BROW, face)
	-- soft arched brows
	front("BrowInner", 0.17, 0.05, side * 0.17, 7.17, FZ, side * 8, BROW, face)
	front("BrowOuter", 0.16, 0.045, side * 0.33, 7.19, FZ, side * -14, BROW, face)
	-- rosy cheeks
	dot("Blush", 0.2, side * 0.35, 6.7, FZ, BLUSH, face)
	-- ear
	part("Ear", Vector3.new(0.07, 0.2, 0.14), CFrame.new(side * 0.655, 6.82, 0.05), SKIN, face)
end
-- nose + closed smile
front("Nose", 0.09, 0.15, 0, 6.74, FZ - 0.02, 0, SKIN_SHADE, face)
dot("NoseTip", 0.07, 0, 6.69, FZ - 0.04, BLUSH, face)
front("UpperLip", 0.24, 0.05, 0, 6.53, FZ - 0.01, 0, LIPS, face)
front("LowerLip", 0.22, 0.07, 0, 6.48, FZ - 0.01, 0, LIPS_LIGHT, face)
front("Smile", 0.26, 0.015, 0, 6.505, FZ - 0.02, 0, Color3.fromRGB(170, 70, 84), face)
front("SmileCorner", 0.06, 0.02, -0.14, 6.52, FZ - 0.02, -30, Color3.fromRGB(170, 70, 84), face)
front("SmileCorner", 0.06, 0.02, 0.14, 6.52, FZ - 0.02, 30, Color3.fromRGB(170, 70, 84), face)
dot("LipShine", 0.04, 0.05, 6.47, FZ - 0.025, Color3.fromRGB(250, 190, 196), face)

------------------------------------------------------------------ Hair (long, wavy, center part)
local hair = folder("Hair")
part("Top", Vector3.new(1.4, 0.32, 1.4), CFrame.new(0, 7.62, 0.03), HAIR, hair)
part("Crown", Vector3.new(1.12, 0.12, 1.12), CFrame.new(0, 7.82, 0.06), HAIR, hair)
part("PartLine", Vector3.new(0.03, 0.02, 0.8), CFrame.new(0, 7.885, -0.1), SKIN_SHADE, hair)
part("Back", Vector3.new(1.45, 2.5, 0.36), CFrame.new(0, 6.3, 0.72), HAIR, hair)
part("BackEnds", Vector3.new(1.3, 0.35, 0.38), CFrame.new(0, 4.95, 0.72) * CFrame.Angles(0, 0, math.rad(-5)), HAIR_LIGHT, hair)
for i, x in ipairs({ -0.55, -0.3, -0.05, 0.2, 0.45 }) do
	part("Strand", Vector3.new(0.035, 2.2, 0.03), CFrame.new(x, 6.35, 0.905), i % 2 == 0 and HAIR_DARK or HAIR_LIGHT, hair)
end

for _, side in ipairs({ -1, 1 }) do
	-- hair parted from the middle, sweeping down over the temples
	part("Sweep", Vector3.new(0.62, 0.26, 0.22), CFrame.new(side * 0.34, 7.38, -0.62) * CFrame.Angles(0, 0, math.rad(-side * 14)), HAIR, hair)
	front("SweepShine", 0.4, 0.03, side * 0.32, 7.42, -0.735, -side * 14, HAIR_LIGHT, hair)
	part("Side", Vector3.new(0.3, 1.3, 1.15), CFrame.new(side * 0.75, 7.0, 0.1), HAIR, hair)
	part("FaceFrame", Vector3.new(0.24, 1.35, 0.32), CFrame.new(side * 0.67, 6.75, -0.47), HAIR, hair)
	front("FrameStrand", 0.03, 1.1, side * 0.6, 6.75, -0.635, side * 3, HAIR_DARK, hair)

	-- long waves tumbling past the shoulders
	local waves = {
		{ Vector3.new(0.45, 0.6, 0.85), Vector3.new(0.86, 6.1, 0.42), 10, HAIR },
		{ Vector3.new(0.5, 0.58, 0.82), Vector3.new(1.0, 5.6, 0.45), -14, HAIR_LIGHT },
		{ Vector3.new(0.5, 0.55, 0.78), Vector3.new(1.08, 5.1, 0.47), 16, HAIR },
		{ Vector3.new(0.46, 0.5, 0.7), Vector3.new(1.1, 4.65, 0.48), -18, HAIR_DARK },
		{ Vector3.new(0.38, 0.4, 0.55), Vector3.new(1.2, 4.28, 0.46), 24, HAIR_LIGHT },
	}
	for i, w in ipairs(waves) do
		local p = w[2]
		part("Wave" .. i, w[1], CFrame.new(side * p.X, p.Y, p.Z) * CFrame.Angles(0, 0, math.rad(side * w[3])), w[4], hair)
	end
	-- one lock falling in front of the shoulder
	part("FrontLock", Vector3.new(0.26, 1.0, 0.26), CFrame.new(side * 0.72, 5.8, -0.2) * CFrame.Angles(0, 0, math.rad(side * 6)), HAIR, hair)
	part("FrontCurl", Vector3.new(0.3, 0.3, 0.28), CFrame.new(side * 0.8, 5.25, -0.18) * CFrame.Angles(0, 0, math.rad(side * 30)), HAIR_LIGHT, hair)
end

model.PrimaryPart = torso
model.Parent = workspace
return model
