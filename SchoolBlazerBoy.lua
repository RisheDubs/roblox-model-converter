-- School blazer boy (blocky Roblox-style statue built from parts)
-- Paste into a Script or the Studio command bar, or build it on the Code -> Model tab.

local model = Instance.new("Model")
model.Name = "SchoolBlazerBoy"

-- Palette
local SKIN = Color3.fromRGB(236, 190, 160)
local SKIN_SHADE = Color3.fromRGB(214, 164, 136)
local NAVY = Color3.fromRGB(30, 40, 82)
local NAVY_DARK = Color3.fromRGB(20, 27, 58)
local NAVY_LIGHT = Color3.fromRGB(44, 56, 104)
local RED = Color3.fromRGB(214, 34, 40)
local SHIRT = Color3.fromRGB(246, 246, 250)
local SHIRT_SHADE = Color3.fromRGB(216, 218, 228)
local TIE = Color3.fromRGB(40, 58, 150)
local GOLD = Color3.fromRGB(200, 162, 74)
local GOLD_DARK = Color3.fromRGB(150, 116, 46)
local BELT = Color3.fromRGB(26, 24, 26)
local SHOE = Color3.fromRGB(18, 18, 20)
local SOLE = Color3.fromRGB(58, 38, 28)
local HAIR = Color3.fromRGB(122, 78, 46)
local HAIR_DARK = Color3.fromRGB(86, 52, 30)
local HAIR_LIGHT = Color3.fromRGB(160, 108, 66)
local EYE_GREEN = Color3.fromRGB(72, 158, 84)
local BROW = Color3.fromRGB(70, 44, 28)
local BLACK = Color3.fromRGB(20, 18, 20)
local WHITE = Color3.fromRGB(252, 252, 252)
local LIP = Color3.fromRGB(196, 120, 112)

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

local function dot(name, d, x, y, z, color, parent)
	local p = part(name, Vector3.new(0.03, d, d), CFrame.new(x, y, z) * CFrame.Angles(0, math.rad(90), 0), color, parent)
	p.Shape = Enum.PartType.Cylinder
	return p
end

local function on(base, name, size, offset, color, parent, material)
	return part(name, size, base * offset, color, parent, material)
end

-- a box stretched from point a (top) to point b (bottom), e.g. an arm segment
local function limbCF(a, b)
	local up = (a - b).Unit
	local right = Vector3.new(0, 0, -1):Cross(up).Unit -- keeps the part's front (-Z) facing forward
	return CFrame.fromMatrix((a + b) / 2, right, up), (a - b).Magnitude
end

------------------------------------------------------------------ Legs, trousers, shoes
local legs = folder("Legs")
for _, side in ipairs({ -1, 1 }) do
	local x = side * 0.36
	local leg = part(side == 1 and "Left Leg" or "Right Leg", Vector3.new(0.62, 2.95, 0.62), CFrame.new(x, 1.8, 0), NAVY, legs, Enum.Material.Fabric)
	leg.CanCollide = true
	front("Crease", 0.03, 2.7, x, 1.75, -0.315, 0, NAVY_DARK, legs)
	front("Shine", 0.02, 2.3, x - side * 0.15, 1.9, -0.315, 0, NAVY_LIGHT, legs)
	part("Hem", Vector3.new(0.64, 0.08, 0.64), CFrame.new(x, 0.38, 0), NAVY_DARK, legs, Enum.Material.Fabric)

	-- polished oxford shoes
	local shoe = part("Shoe", Vector3.new(0.62, 0.32, 1.0), CFrame.new(x, 0.18, -0.16), SHOE, legs)
	shoe.Reflectance = 0.15
	part("ToeCap", Vector3.new(0.56, 0.26, 0.12), CFrame.new(x, 0.16, -0.68), SHOE, legs).Reflectance = 0.15
	part("Sole", Vector3.new(0.64, 0.06, 1.04), CFrame.new(x, 0.03, -0.17), SOLE, legs)
	part("Heel", Vector3.new(0.6, 0.1, 0.26), CFrame.new(x, 0.05, 0.22), SOLE, legs)
	part("Toe", Vector3.new(0.5, 0.04, 0.1), CFrame.new(x, 0.32, -0.55), SHOE, legs)
	for i = 0, 3 do
		part("Lace", Vector3.new(0.26, 0.02, 0.03), CFrame.new(x, 0.345, -0.22 - i * 0.07), Color3.fromRGB(40, 40, 44), legs)
	end
	part("Eyelets", Vector3.new(0.02, 0.025, 0.3), CFrame.new(x - 0.12, 0.345, -0.32), GOLD_DARK, legs)
	part("Eyelets", Vector3.new(0.02, 0.025, 0.3), CFrame.new(x + 0.12, 0.345, -0.32), GOLD_DARK, legs)
	front("Glint", 0.18, 0.04, x - side * 0.1, 0.24, -0.745, 15, Color3.fromRGB(120, 120, 130), legs)
end

-- hips, belt
local body = folder("Body")
local hips = part("Hips", Vector3.new(1.5, 0.55, 0.82), CFrame.new(0, 3.33, 0), NAVY, body, Enum.Material.Fabric)
hips.CanCollide = true
front("Fly", 0.03, 0.4, 0.06, 3.3, -0.42, 0, NAVY_DARK, body)
front("PocketSlant", 0.4, 0.025, 0.55, 3.38, -0.42, -55, NAVY_DARK, body)
front("PocketSlant", 0.4, 0.025, -0.55, 3.38, -0.42, 55, NAVY_DARK, body)
part("Belt", Vector3.new(1.53, 0.17, 0.85), CFrame.new(0, 3.66, 0), BELT, body)
front("Buckle", 0.22, 0.15, 0.05, 3.66, -0.435, 0, GOLD, body)
front("BuckleHole", 0.12, 0.07, 0.05, 3.66, -0.45, 0, BELT, body)
front("Prong", 0.1, 0.02, 0.05, 3.66, -0.455, 0, GOLD, body)
for _, lx in ipairs({ -0.5, 0.42 }) do
	front("BeltLoop", 0.06, 0.2, lx, 3.66, -0.44, 0, NAVY, body)
end

------------------------------------------------------------------ Shirt + tie
local torso = part("Torso", Vector3.new(1.5, 1.95, 0.8), CFrame.new(0, 4.72, 0), SHIRT, body, Enum.Material.Fabric)
torso.CanCollide = true
front("Placket", 0.08, 1.6, -0.12, 4.55, -0.415, 0, SHIRT_SHADE, body)
for i = 0, 3 do
	dot("ShirtButton", 0.05, -0.12, 3.95 + i * 0.35, -0.43, SHIRT_SHADE, body)
end
part("CollarBand", Vector3.new(0.52, 0.16, 0.52), CFrame.new(0, 5.66, 0), SHIRT, body)
for _, side in ipairs({ -1, 1 }) do
	front("CollarPoint", 0.24, 0.2, side * 0.14, 5.56, -0.43, side * 35, SHIRT, body)
	front("CollarEdge", 0.24, 0.02, side * 0.15, 5.47, -0.445, side * 35, SHIRT_SHADE, body)
end

-- striped tie
local tie = folder("Tie")
front("Knot", 0.17, 0.16, 0, 5.56, -0.445, 0, TIE, tie)
front("KnotStripe", 0.17, 0.035, 0, 5.57, -0.46, 35, RED, tie)
local TIE_TOP, TIE_BOTTOM = 5.47, 4.05
front("Blade", 0.2, TIE_TOP - TIE_BOTTOM, 0, (TIE_TOP + TIE_BOTTOM) / 2, -0.44, 0, TIE, tie)
part("Tip", Vector3.new(0.142, 0.142, 0.03), CFrame.new(0, TIE_BOTTOM, -0.44) * CFrame.Angles(0, 0, math.rad(45)), TIE, tie)
local y = TIE_TOP - 0.1
while y > TIE_BOTTOM + 0.05 do
	front("RedStripe", 0.2, 0.045, 0, y, -0.455, 35, RED, tie)
	front("WhiteStripe", 0.2, 0.018, 0, y - 0.05, -0.455, 35, WHITE, tie)
	y = y - 0.15
end

------------------------------------------------------------------ Blazer (open, red piping)
local blazer = folder("Blazer")
part("Back", Vector3.new(1.62, 2.62, 0.2), CFrame.new(0, 4.33, 0.36), NAVY, blazer, Enum.Material.Fabric)
part("Vent", Vector3.new(0.03, 0.6, 0.03), CFrame.new(0, 3.35, 0.465), NAVY_DARK, blazer)
for _, side in ipairs({ -1, 1 }) do
	part("Side", Vector3.new(0.3, 2.62, 0.9), CFrame.new(side * 0.66, 4.33, 0), NAVY, blazer, Enum.Material.Fabric)
	-- front panel below the lapel
	part("Front", Vector3.new(0.5, 1.6, 0.1), CFrame.new(side * 0.56, 3.82, -0.46), NAVY, blazer, Enum.Material.Fabric)
	part("Chest", Vector3.new(0.34, 1.05, 0.1), CFrame.new(side * 0.64, 5.1, -0.46), NAVY, blazer, Enum.Material.Fabric)
	-- lapel (slightly raised, angled toward the collar)
	local lapelCF = CFrame.new(side * 0.4, 5.08, -0.5) * CFrame.Angles(0, 0, math.rad(side * 9))
	part("Lapel", Vector3.new(0.3, 1.08, 0.06), lapelCF, NAVY_LIGHT, blazer, Enum.Material.Fabric)
	on(lapelCF, "LapelPiping", Vector3.new(0.045, 1.1, 0.03), CFrame.new(-side * 0.16, 0, -0.03), RED, blazer)
	on(lapelCF, "LapelPiping", Vector3.new(0.045, 1.1, 0.03), CFrame.new(side * 0.15, 0, -0.03), RED, blazer)
	part("Notch", Vector3.new(0.22, 0.14, 0.06), CFrame.new(side * 0.56, 5.56, -0.5) * CFrame.Angles(0, 0, math.rad(side * -20)), NAVY_LIGHT, blazer)
	front("NotchPiping", 0.24, 0.04, side * 0.56, 5.63, -0.535, side * -20, RED, blazer)
	part("Collar", Vector3.new(0.18, 0.2, 0.6), CFrame.new(side * 0.33, 5.68, 0.05), NAVY, blazer)
	-- piping down the front edge and along the hem
	front("EdgePiping", 0.045, 1.62, side * 0.315, 3.84, -0.515, 0, RED, blazer)
	front("HemPiping", 0.5, 0.045, side * 0.56, 3.03, -0.515, 0, RED, blazer)
	front("CornerPiping", 0.12, 0.045, side * 0.33, 3.06, -0.515, side * 40, RED, blazer)
	front("ShoulderSeam", 0.3, 0.025, side * 0.64, 5.55, -0.512, 0, NAVY_DARK, blazer)
end
-- flap pocket (left side of the picture)
front("PocketFlap", 0.42, 0.15, 0.56, 3.45, -0.515, 0, NAVY, blazer)
front("FlapPiping", 0.44, 0.035, 0.56, 3.53, -0.53, 0, RED, blazer)
front("FlapPiping", 0.44, 0.035, 0.56, 3.37, -0.53, 0, RED, blazer)
front("FlapPiping", 0.035, 0.16, 0.355, 3.45, -0.53, 0, RED, blazer)
front("FlapPiping", 0.035, 0.16, 0.765, 3.45, -0.53, 0, RED, blazer)
-- gold buttons
dot("Button", 0.1, 0.37, 4.28, -0.525, GOLD, blazer)
dot("Button", 0.1, 0.37, 3.82, -0.525, GOLD, blazer)
-- breast pocket with crest
front("BreastWelt", 0.34, 0.05, -0.64, 4.98, -0.515, 0, RED, blazer)
front("Crest", 0.2, 0.2, -0.64, 4.82, -0.52, 0, GOLD, blazer)
part("CrestTip", Vector3.new(0.14, 0.14, 0.03), CFrame.new(-0.64, 4.72, -0.52) * CFrame.Angles(0, 0, math.rad(45)), GOLD, blazer)
front("CrestInner", 0.12, 0.13, -0.64, 4.83, -0.535, 0, NAVY, blazer)
front("CrestBand", 0.12, 0.03, -0.64, 4.85, -0.545, 0, RED, blazer)
front("CrestStar", 0.05, 0.05, -0.64, 4.78, -0.545, 45, GOLD_DARK, blazer)

------------------------------------------------------------------ Arms
local arms = folder("Arms")
-- outer = which local X side faces away from the body (+1 or -1)
local function cuffDetails(cf, len, outer)
	on(cf, "CuffPiping", Vector3.new(0.6, 0.045, 0.62), CFrame.new(0, -len / 2 + 0.06, 0), RED, arms)
	for i = 0, 2 do
		on(cf, "CuffButton", Vector3.new(0.07, 0.07, 0.07), CFrame.new(outer * 0.29, -len / 2 + 0.22 + i * 0.1, 0.12), GOLD, arms)
	end
end

-- right arm: relaxed at his side
local rTop = Vector3.new(0.98, 5.5, 0)
local rWrist = Vector3.new(1.12, 3.45, 0)
local rCF, rLen = limbCF(rTop, rWrist)
part("Left Arm", Vector3.new(0.56, rLen, 0.58), rCF, NAVY, arms, Enum.Material.Fabric).CanCollide = true
on(rCF, "ElbowFold", Vector3.new(0.4, 0.025, 0.02), CFrame.new(0, -0.05, -0.295) * CFrame.Angles(0, 0, 0.3), NAVY_DARK, arms)
cuffDetails(rCF, rLen, 1)
on(rCF, "ShirtCuff", Vector3.new(0.48, 0.12, 0.5), CFrame.new(0, -rLen / 2 - 0.05, 0), SHIRT, arms)
local handCF = CFrame.new(rWrist + Vector3.new(0.02, -0.36, 0)) * CFrame.Angles(0, 0, math.rad(4))
part("Hand", Vector3.new(0.38, 0.55, 0.42), handCF, SKIN, arms)
on(handCF, "Thumb", Vector3.new(0.1, 0.24, 0.12), CFrame.new(-0.19, 0.05, -0.12), SKIN, arms)
for i = -1, 1 do
	on(handCF, "Finger", Vector3.new(0.015, 0.25, 0.02), CFrame.new(i * 0.09, -0.15, -0.215), SKIN_SHADE, arms)
end

-- left arm: hangs down his side with a soft elbow bend, hand slipped into the side pocket
local lTop = Vector3.new(-0.98, 5.5, 0)
local lElbow = Vector3.new(-1.1, 4.36, 0.08)
local lWrist = Vector3.new(-0.86, 3.16, -0.05)
local uCF, uLen = limbCF(lTop, lElbow)
part("Right Arm", Vector3.new(0.56, uLen + 0.12, 0.58), uCF, NAVY, arms, Enum.Material.Fabric).CanCollide = true
local fCF, fLen = limbCF(lElbow, lWrist)
part("Forearm", Vector3.new(0.54, fLen + 0.1, 0.56), fCF, NAVY, arms, Enum.Material.Fabric)
-- rounded elbow joint so the two sleeve pieces meet cleanly
local elbowCF = CFrame.new(lElbow) * (uCF - uCF.Position):Lerp(fCF - fCF.Position, 0.5)
part("Elbow", Vector3.new(0.56, 0.4, 0.58), elbowCF, NAVY, arms, Enum.Material.Fabric)
on(elbowCF, "ElbowCrease", Vector3.new(0.36, 0.025, 0.02), CFrame.new(0, 0, -0.295), NAVY_DARK, arms)
on(fCF, "ForearmFold", Vector3.new(0.3, 0.025, 0.02), CFrame.new(0, 0.15, -0.285) * CFrame.Angles(0, 0, 0.25), NAVY_DARK, arms)
cuffDetails(fCF, fLen, -1)
on(fCF, "ShirtCuff", Vector3.new(0.46, 0.1, 0.48), CFrame.new(0, -fLen / 2 - 0.04, 0), SHIRT, arms)

-- the hand is pushed into the side pocket: only the knuckles and thumb show
local pocketHand = CFrame.new(-0.79, 2.98, -0.06) * CFrame.Angles(0, 0, math.rad(10))
part("Hand", Vector3.new(0.3, 0.38, 0.38), pocketHand, SKIN, arms)
on(pocketHand, "Knuckles", Vector3.new(0.26, 0.022, 0.02), CFrame.new(0, 0.14, -0.195), SKIN_SHADE, arms)
-- thumb hooked over the front of the pocket
part("Thumb", Vector3.new(0.09, 0.2, 0.08), CFrame.new(-0.66, 3.0, -0.37) * CFrame.Angles(0, 0, math.rad(-20)), SKIN, arms)
part("ThumbNail", Vector3.new(0.06, 0.05, 0.02), CFrame.new(-0.67, 2.93, -0.415) * CFrame.Angles(0, 0, math.rad(-20)), SKIN_SHADE, arms)
-- trouser fabric bulging around the hand, with the pocket opening along the top
part("PocketBulge", Vector3.new(0.3, 0.52, 0.66), CFrame.new(-0.72, 2.83, -0.03), NAVY, legs, Enum.Material.Fabric)
part("PocketOpening", Vector3.new(0.31, 0.03, 0.67), CFrame.new(-0.72, 3.085, -0.03), NAVY_DARK, legs)
front("OpeningEdge", 0.3, 0.025, -0.72, 3.075, -0.365, 0, NAVY_DARK, legs)
front("BulgeFold", 0.22, 0.02, -0.72, 2.78, -0.365, 12, NAVY_DARK, legs)
front("BulgeFold", 0.16, 0.02, -0.7, 2.66, -0.365, -8, NAVY_DARK, legs)
part("BulgeSideFold", Vector3.new(0.02, 0.3, 0.02), CFrame.new(-0.875, 2.8, -0.2), NAVY_DARK, legs)

------------------------------------------------------------------ Neck + head + face
part("Neck", Vector3.new(0.42, 0.4, 0.42), CFrame.new(0, 5.72, 0), SKIN)
local head = part("Head", Vector3.new(1.25, 1.25, 1.25), CFrame.new(0, 6.4, 0), SKIN)
head.CanCollide = true
local mesh = Instance.new("SpecialMesh")
mesh.MeshType = Enum.MeshType.Head
mesh.Parent = head

local face = folder("Face")
local FZ = -0.625
for _, side in ipairs({ -1, 1 }) do
	local ex = side * 0.23
	-- confident, slightly narrowed green eyes
	front("Eye", 0.22, 0.13, ex, 6.48, FZ, 0, WHITE, face)
	dot("Iris", 0.12, ex - side * 0.01, 6.475, FZ - 0.01, EYE_GREEN, face)
	dot("Pupil", 0.055, ex - side * 0.01, 6.475, FZ - 0.02, BLACK, face)
	dot("Shine", 0.03, ex + 0.02, 6.5, FZ - 0.03, WHITE, face)
	front("UpperLid", 0.25, 0.04, ex, 6.55, FZ - 0.01, side * -4, BLACK, face)
	front("LowerLid", 0.18, 0.015, ex, 6.415, FZ - 0.005, 0, SKIN_SHADE, face)
	-- thick, slightly lowered brows
	front("Brow", 0.28, 0.07, side * 0.23, 6.66, FZ, side * 8, BROW, face)
	front("BrowTail", 0.1, 0.05, side * 0.39, 6.66, FZ, side * -15, BROW, face)
	part("Ear", Vector3.new(0.07, 0.22, 0.15), CFrame.new(side * 0.655, 6.38, 0.05), SKIN, face)
	-- cheek shading
	front("Cheek", 0.15, 0.04, side * 0.4, 6.18, FZ, side * 30, SKIN_SHADE, face)
end
front("NoseBridge", 0.05, 0.2, 0.0, 6.3, FZ - 0.01, 0, SKIN_SHADE, face)
front("Nose", 0.12, 0.05, 0, 6.2, FZ - 0.02, 0, SKIN_SHADE, face)
-- smirk: one corner lifted
front("Mouth", 0.24, 0.025, -0.02, 6.03, FZ - 0.01, 0, Color3.fromRGB(150, 84, 76), face)
front("SmirkCorner", 0.08, 0.025, 0.13, 6.055, FZ - 0.01, 30, Color3.fromRGB(150, 84, 76), face)
front("LowerLip", 0.16, 0.04, -0.01, 5.99, FZ - 0.005, 0, LIP, face)
front("Chin", 0.18, 0.02, 0, 5.84, FZ - 0.005, 0, SKIN_SHADE, face)

------------------------------------------------------------------ Hair (short, swept-up quiff)
local hair = folder("Hair")
part("Top", Vector3.new(1.36, 0.28, 1.36), CFrame.new(0, 7.12, 0.04), HAIR, hair)
part("Back", Vector3.new(1.36, 0.95, 0.24), CFrame.new(0, 6.62, 0.68), HAIR, hair)
part("Nape", Vector3.new(1.2, 0.2, 0.2), CFrame.new(0, 6.08, 0.66), HAIR_DARK, hair)
for _, side in ipairs({ -1, 1 }) do
	part("Side", Vector3.new(0.16, 0.6, 1.15), CFrame.new(side * 0.7, 6.82, 0.08), HAIR, hair)
	part("Sideburn", Vector3.new(0.08, 0.25, 0.14), CFrame.new(side * 0.66, 6.43, -0.22), HAIR_DARK, hair)
	part("Fade", Vector3.new(0.05, 0.4, 0.9), CFrame.new(side * 0.79, 6.8, 0.12), HAIR_DARK, hair)
end
-- quiff: tufts swept up and back
local tufts = {
	{ Vector3.new(0.9, 0.36, 0.5), Vector3.new(0.05, 7.3, -0.42), -28, 4, HAIR },
	{ Vector3.new(0.45, 0.3, 0.42), Vector3.new(-0.32, 7.36, -0.3), -20, 14, HAIR_LIGHT },
	{ Vector3.new(0.45, 0.32, 0.42), Vector3.new(0.38, 7.35, -0.32), -24, -12, HAIR },
	{ Vector3.new(0.6, 0.28, 0.5), Vector3.new(0.0, 7.36, 0.05), -10, 0, HAIR_DARK },
	{ Vector3.new(0.4, 0.22, 0.4), Vector3.new(0.3, 7.28, 0.4), 12, -8, HAIR },
	{ Vector3.new(0.4, 0.22, 0.4), Vector3.new(-0.3, 7.28, 0.38), 12, 10, HAIR_LIGHT },
	{ Vector3.new(0.3, 0.3, 0.2), Vector3.new(-0.42, 7.08, -0.62), -10, 25, HAIR },
}
for i, t in ipairs(tufts) do
	part("Tuft" .. i, t[1], CFrame.new(t[2]) * CFrame.Angles(math.rad(t[3]), 0, math.rad(t[4])), t[5], hair)
end
front("Strand", 0.5, 0.03, 0.05, 7.27, -0.69, 8, HAIR_LIGHT, hair)
front("Strand", 0.4, 0.03, 0.1, 7.19, -0.68, 5, HAIR_DARK, hair)

model.PrimaryPart = torso
model.Parent = workspace
return model
