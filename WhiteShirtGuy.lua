-- White shirt guy (blocky Roblox-style statue built from parts)
-- Paste into a Script or the Studio command bar, or build it on the Code -> Model tab.

local model = Instance.new("Model")
model.Name = "WhiteShirtGuy"

-- Palette
local SKIN = Color3.fromRGB(232, 180, 150)
local SKIN_SHADE = Color3.fromRGB(208, 152, 124)
local SKIN_DARK = Color3.fromRGB(184, 128, 104)
local SHIRT = Color3.fromRGB(244, 244, 246)
local SHIRT_SHADE = Color3.fromRGB(214, 214, 222)
local SHIRT_FOLD = Color3.fromRGB(196, 196, 206)
local DENIM = Color3.fromRGB(46, 48, 56)
local DENIM_DARK = Color3.fromRGB(32, 33, 40)
local DENIM_LIGHT = Color3.fromRGB(66, 68, 78)
local DENIM_CUFF = Color3.fromRGB(96, 96, 104)
local STITCH = Color3.fromRGB(150, 112, 70)
local BRASS = Color3.fromRGB(190, 152, 80)
local SNEAKER = Color3.fromRGB(246, 246, 248)
local SNEAKER_SHADE = Color3.fromRGB(214, 214, 220)
local SNEAKER_LINE = Color3.fromRGB(168, 168, 176)
local HAIR = Color3.fromRGB(110, 72, 44)
local HAIR_DARK = Color3.fromRGB(74, 46, 28)
local HAIR_LIGHT = Color3.fromRGB(150, 104, 66)
local EYE_BLUE = Color3.fromRGB(64, 132, 210)
local BROW = Color3.fromRGB(64, 40, 26)
local BLACK = Color3.fromRGB(20, 18, 20)
local WHITE = Color3.fromRGB(252, 252, 252)
local LIP = Color3.fromRGB(198, 120, 110)

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

local function dot(name, d, x, y, z, color, parent)
	local p = part(name, Vector3.new(0.03, d, d), CFrame.new(x, y, z) * CFrame.Angles(0, math.rad(90), 0), color, parent)
	p.Shape = Enum.PartType.Cylinder
	return p
end

local function on(base, name, size, offset, color, parent, material)
	return part(name, size, base * offset, color, parent, material)
end

------------------------------------------------------------------ Sneakers
local legs = folder("Legs")
for _, side in ipairs({ -1, 1 }) do
	local x = side * 0.4
	part("Sneaker", Vector3.new(0.74, 0.36, 1.16), CFrame.new(x, 0.3, -0.13), SNEAKER, legs)
	part("Sole", Vector3.new(0.8, 0.14, 1.24), CFrame.new(x, 0.07, -0.13), SNEAKER, legs)
	part("SoleLine", Vector3.new(0.81, 0.025, 1.25), CFrame.new(x, 0.13, -0.13), SNEAKER_LINE, legs)
	part("SoleTread", Vector3.new(0.78, 0.03, 1.22), CFrame.new(x, 0.015, -0.13), SNEAKER_SHADE, legs)
	part("ToeBox", Vector3.new(0.68, 0.26, 0.16), CFrame.new(x, 0.25, -0.75), SNEAKER, legs)
	part("ToeCap", Vector3.new(0.7, 0.06, 0.38), CFrame.new(x, 0.41, -0.55), SNEAKER_SHADE, legs)
	for i = 0, 3 do
		dot("Perforation", 0.03, x - 0.15 + i * 0.1, 0.32, -0.835, SNEAKER_LINE, legs)
	end
	part("Tongue", Vector3.new(0.34, 0.18, 0.36), CFrame.new(x, 0.55, -0.2) * CFrame.Angles(math.rad(-12), 0, 0), SNEAKER, legs)
	for i = 0, 3 do
		part("Lace", Vector3.new(0.34, 0.03, 0.04), CFrame.new(x, 0.49 - i * 0.015, -0.12 - i * 0.09), SNEAKER, legs)
		part("LaceShadow", Vector3.new(0.34, 0.01, 0.02), CFrame.new(x, 0.475 - i * 0.015, -0.1 - i * 0.09), SNEAKER_LINE, legs)
	end
	-- simple side panel and heel tab (no brand logo)
	for _, s in ipairs({ -1, 1 }) do
		sideDetail("SidePanel", 0.55, 0.025, x + s * 0.375, 0.32, -0.1, 18, SNEAKER_LINE, legs)
		sideDetail("SidePanel", 0.4, 0.025, x + s * 0.375, 0.26, 0.15, -10, SNEAKER_LINE, legs)
		sideDetail("PanelStitch", 0.9, 0.015, x + s * 0.375, 0.42, -0.15, 0, SNEAKER_SHADE, legs)
	end
	part("HeelTab", Vector3.new(0.3, 0.26, 0.05), CFrame.new(x, 0.38, 0.465), SNEAKER_SHADE, legs)
	part("Collar", Vector3.new(0.6, 0.08, 0.6), CFrame.new(x, 0.5, 0.12), SNEAKER_SHADE, legs)

	-- ankle peeking above the shoe
	part("Ankle", Vector3.new(0.44, 0.16, 0.44), CFrame.new(x, 0.58, 0.05), SKIN, legs)

	------------------------------------------------------------ slim dark jeans with rolled cuffs
	local nm = side == 1 and "Left" or "Right"
	part(nm .. "Cuff", Vector3.new(0.62, 0.2, 0.62), CFrame.new(x, 0.75, 0.04), DENIM_CUFF, legs, Enum.Material.Fabric)
	part("CuffEdge", Vector3.new(0.63, 0.03, 0.63), CFrame.new(x, 0.84, 0.04), DENIM_DARK, legs)
	local calf = part(nm .. " Calf", Vector3.new(0.56, 1.45, 0.58), CFrame.new(x, 1.57, 0.02), DENIM, legs, Enum.Material.Fabric)
	calf.CanCollide = true
	local thigh = part(nm .. " Leg", Vector3.new(0.7, 1.45, 0.72), CFrame.new(x, 2.95, 0), DENIM, legs, Enum.Material.Fabric)
	thigh.CanCollide = true
	part("Knee", Vector3.new(0.62, 0.3, 0.64), CFrame.new(x, 2.24, -0.01), DENIM, legs, Enum.Material.Fabric)
	front("KneeWrinkle", 0.4, 0.02, x, 2.3, -0.335, side * 8, DENIM_DARK, legs)
	front("KneeWrinkle", 0.3, 0.02, x, 2.18, -0.335, side * -6, DENIM_DARK, legs)
	sideDetail("OuterSeam", 0.03, 2.8, x + side * 0.355, 2.2, 0, 0, STITCH, legs)
	-- denim texture / highlights
	front("Fade", 0.12, 1.0, x - side * 0.05, 2.95, -0.365, 0, DENIM_LIGHT, legs)
	front("Fade", 0.08, 1.0, x - side * 0.02, 1.6, -0.295, 0, DENIM_LIGHT, legs)
	for i = -2, 2 do
		front("Grain", 0.01, 1.2, x + i * 0.12, 2.95, -0.368, 0, DENIM_DARK, legs)
	end
end

------------------------------------------------------------------ Hips + waistband
local body = folder("Body")
local hips = part("Hips", Vector3.new(1.56, 0.62, 0.86), CFrame.new(0, 3.66, 0), DENIM, body, Enum.Material.Fabric)
hips.CanCollide = true
part("Waistband", Vector3.new(1.58, 0.2, 0.88), CFrame.new(0, 3.88, 0), DENIM, body, Enum.Material.Fabric)
front("BandStitch", 1.5, 0.015, 0, 3.8, -0.445, 0, STITCH, body)
front("BandStitch", 1.5, 0.015, 0, 3.96, -0.445, 0, STITCH, body)
dot("Button", 0.11, -0.05, 3.88, -0.455, BRASS, body)
for _, lx in ipairs({ -0.62, -0.25, 0.25, 0.62 }) do
	front("BeltLoop", 0.08, 0.24, lx, 3.88, -0.455, 0, DENIM_DARK, body)
end
front("Fly", 0.02, 0.5, 0.05, 3.5, -0.435, 0, STITCH, body)
front("FlyCurve", 0.12, 0.02, 0.0, 3.27, -0.435, 40, STITCH, body)
front("FlySeam", 0.025, 0.55, -0.05, 3.5, -0.433, 0, DENIM_DARK, body)
for _, side in ipairs({ -1, 1 }) do
	front("Pocket", 0.42, 0.02, side * 0.55, 3.66, -0.435, side * -32, STITCH, body)
	front("PocketCurve", 0.16, 0.02, side * 0.73, 3.52, -0.435, side * -70, STITCH, body)
	dot("Rivet", 0.05, side * 0.36, 3.76, -0.44, BRASS, body)
end
front("CoinPocket", 0.2, 0.015, 0.55, 3.72, -0.438, 0, STITCH, body)

------------------------------------------------------------------ Shirt (tucked in, collar open)
local waist = part("Waist", Vector3.new(1.55, 1.0, 0.84), CFrame.new(0, 4.48, 0), SHIRT, body, Enum.Material.Fabric)
waist.CanCollide = true
local chest = part("Torso", Vector3.new(1.95, 1.05, 0.96), CFrame.new(0, 5.48, 0), SHIRT, body, Enum.Material.Fabric)
chest.CanCollide = true
part("Shoulders", Vector3.new(1.9, 0.2, 0.9), CFrame.new(0, 6.0, 0), SHIRT, body, Enum.Material.Fabric)
-- tuck folds at the waistband
for i = -3, 3 do
	front("TuckFold", 0.02, 0.18, i * 0.2 + 0.05, 4.07, -0.425, i * 6, SHIRT_FOLD, body)
end
-- chest / pec shading and fabric pulls
for _, side in ipairs({ -1, 1 }) do
	front("Pec", 0.6, 0.025, side * 0.46, 5.12, -0.485, side * -6, SHIRT_SHADE, body)
	front("PecSide", 0.25, 0.02, side * 0.8, 5.25, -0.485, side * 55, SHIRT_SHADE, body)
	front("Pull", 0.35, 0.02, side * 0.42, 4.65, -0.425, side * 25, SHIRT_FOLD, body)
	front("SideSeam", 0.025, 0.95, side * 0.74, 4.48, -0.425, 0, SHIRT_SHADE, body)
end
-- button placket
front("Placket", 0.12, 0.95, 0.04, 5.42, -0.49, 0, SHIRT_SHADE, body)
front("PlacketEdge", 0.015, 0.95, -0.02, 5.42, -0.5, 0, SHIRT_FOLD, body)
front("PlacketLow", 0.12, 0.95, 0.04, 4.48, -0.43, 0, SHIRT_SHADE, body)
front("PlacketLowEdge", 0.015, 0.95, -0.02, 4.48, -0.44, 0, SHIRT_FOLD, body)
for i = 0, 4 do
	local y = 4.2 + i * 0.32
	local z = y > 4.95 and -0.51 or -0.45
	dot("Button", 0.07, 0.04, y, z, WHITE, body)
	dot("ButtonHole", 0.02, 0.04, y, z - 0.01, SHIRT_FOLD, body)
end
-- open collar showing the chest
for i, w in ipairs({ 0.54, 0.46, 0.38, 0.3, 0.22, 0.14, 0.07 }) do
	front("OpenNeck", w, 0.08, -0.02, 6.08 - (i - 1) * 0.075, -0.495, 0, SKIN, body)
end
front("Collarbone", 0.36, 0.02, -0.02, 6.0, -0.51, 0, SKIN_SHADE, body)
front("ChestLine", 0.02, 0.18, -0.02, 5.72, -0.51, 0, SKIN_SHADE, body)
part("CollarStand", Vector3.new(0.7, 0.24, 0.6), CFrame.new(0, 6.14, 0.08), SHIRT, body)
for _, side in ipairs({ -1, 1 }) do
	-- shirt fronts folding open along the V
	front("Lapel", 0.14, 0.62, side * 0.2, 5.8, -0.505, side * 22, SHIRT, body)
	front("LapelEdge", 0.02, 0.62, side * 0.15, 5.8, -0.52, side * 22, SHIRT_FOLD, body)
	-- collar points spread open, outlined so they read against the shirt
	front("CollarWing", 0.4, 0.28, side * 0.36, 6.02, -0.53, side * 32, SHIRT, body)
	front("CollarOutline", 0.42, 0.025, side * 0.38, 5.89, -0.545, side * 32, SHIRT_FOLD, body)
	front("CollarOutline", 0.025, 0.3, side * 0.2, 6.0, -0.545, side * 32, SHIRT_FOLD, body)
	front("CollarShadow", 0.4, 0.03, side * 0.36, 5.86, -0.51, side * 32, SHIRT_SHADE, body)
end

------------------------------------------------------------------ Arms (muscular, long sleeves)
local arms = folder("Arms")
for _, side in ipairs({ -1, 1 }) do
	local armCF = CFrame.new(side * 1.12, 5.9, 0) * CFrame.Angles(0, 0, math.rad(side * 8))
	on(armCF, "Deltoid", Vector3.new(0.78, 0.5, 0.78), CFrame.new(0, -0.18, 0), SHIRT, arms, Enum.Material.Fabric)
	local upper = on(armCF, side == 1 and "Left Arm" or "Right Arm", Vector3.new(0.7, 1.2, 0.72), CFrame.new(0, -0.85, 0), SHIRT, arms, Enum.Material.Fabric)
	upper.CanCollide = true
	on(armCF, "BicepShade", Vector3.new(0.4, 0.025, 0.02), CFrame.new(0, -1.0, -0.365) * CFrame.Angles(0, 0, 0.2), SHIRT_SHADE, arms)
	on(armCF, "ShoulderSeam", Vector3.new(0.6, 0.02, 0.02), CFrame.new(0, -0.05, -0.395), SHIRT_SHADE, arms)
	on(armCF, "Elbow", Vector3.new(0.64, 0.3, 0.66), CFrame.new(0, -1.5, 0.02), SHIRT, arms, Enum.Material.Fabric)
	on(armCF, "ElbowFold", Vector3.new(0.36, 0.02, 0.02), CFrame.new(0, -1.5, -0.335) * CFrame.Angles(0, 0, -0.25), SHIRT_FOLD, arms)
	on(armCF, "Forearm", Vector3.new(0.6, 0.85, 0.62), CFrame.new(0, -2.0, 0), SHIRT, arms, Enum.Material.Fabric)
	on(armCF, "SleeveFold", Vector3.new(0.3, 0.02, 0.02), CFrame.new(0.05, -2.2, -0.315) * CFrame.Angles(0, 0, 0.3), SHIRT_FOLD, arms)
	-- buttoned cuff
	on(armCF, "Cuff", Vector3.new(0.62, 0.3, 0.64), CFrame.new(0, -2.55, 0), SHIRT, arms, Enum.Material.Fabric)
	on(armCF, "CuffEdge", Vector3.new(0.63, 0.02, 0.65), CFrame.new(0, -2.42, 0), SHIRT_SHADE, arms)
	on(armCF, "CuffButton", Vector3.new(0.06, 0.06, 0.03), CFrame.new(side * 0.22, -2.55, -0.33), WHITE, arms)
	-- relaxed, slightly open hand
	local handCF = armCF * CFrame.new(0, -2.95, -0.02)
	part("Palm", Vector3.new(0.44, 0.5, 0.42), handCF, SKIN, arms)
	on(handCF, "Fingers", Vector3.new(0.42, 0.34, 0.3), CFrame.new(0, -0.36, -0.06) * CFrame.Angles(math.rad(-22), 0, 0), SKIN, arms)
	for i = -1, 1 do
		on(handCF, "FingerGap", Vector3.new(0.015, 0.3, 0.02), CFrame.new(i * 0.105, -0.38, -0.23) * CFrame.Angles(math.rad(-22), 0, 0), SKIN_SHADE, arms)
	end
	on(handCF, "Knuckles", Vector3.new(0.4, 0.02, 0.02), CFrame.new(0, -0.2, -0.215), SKIN_SHADE, arms)
	on(handCF, "Thumb", Vector3.new(0.12, 0.3, 0.13), CFrame.new(-side * 0.22, -0.12, -0.14) * CFrame.Angles(math.rad(-15), 0, math.rad(-side * 20)), SKIN, arms)
	on(handCF, "Wrist", Vector3.new(0.4, 0.12, 0.4), CFrame.new(0, 0.27, 0), SKIN, arms)
end

------------------------------------------------------------------ Neck + head + face
part("Neck", Vector3.new(0.58, 0.45, 0.52), CFrame.new(0, 6.25, 0), SKIN)
front("NeckShade", 0.04, 0.3, -0.18, 6.22, -0.265, 12, SKIN_SHADE)
front("NeckShade", 0.04, 0.3, 0.18, 6.22, -0.265, -12, SKIN_SHADE)
-- Head is built in pieces so the lower face tapers straight into the jaw:
-- an upper block, a center chin block, and two wedges whose slopes ARE the jawline.
local JAW_TOP, JAW_BOTTOM = 6.78, 6.36   -- where the taper starts / ends
local CHIN_HALF = 0.25                    -- half-width of the chin
local HEAD_HALF = 0.625                   -- half-width of the head
local head = part("Head", Vector3.new(1.25, 7.73 - JAW_TOP, 1.25), CFrame.new(0, (7.73 + JAW_TOP) / 2, 0), SKIN)
head.CanCollide = true
part("LowerFace", Vector3.new(CHIN_HALF * 2, JAW_TOP - JAW_BOTTOM, 1.15), CFrame.new(0, (JAW_TOP + JAW_BOTTOM) / 2, -0.05), SKIN)
for _, side in ipairs({ -1, 1 }) do
	-- right angle sits at the inner-top corner; one leg runs outward, the other runs down to the chin
	local w = HEAD_HALF - CHIN_HALF
	local h = JAW_TOP - JAW_BOTTOM
	local center = Vector3.new(side * (CHIN_HALF + w / 2), JAW_TOP - h / 2, 0)
	local jaw = Instance.new("WedgePart")
	jaw.Name = "JawWedge"
	jaw.Size = Vector3.new(1.25, h, w)
	jaw.CFrame = CFrame.fromMatrix(center, Vector3.new(0, 0, -side), Vector3.new(0, -1, 0))
	jaw.Color = SKIN
	jaw.Material = Enum.Material.SmoothPlastic
	jaw.Anchored = true
	jaw.CanCollide = false
	jaw.Parent = model
end

local face = folder("Face")
local FZ = -0.625
for _, side in ipairs({ -1, 1 }) do
	local ex = side * 0.23
	-- calm blue eyes
	front("Eye", 0.22, 0.13, ex, 7.16, FZ, 0, WHITE, face)
	dot("Iris", 0.12, ex, 7.155, FZ - 0.01, EYE_BLUE, face)
	dot("Pupil", 0.055, ex, 7.155, FZ - 0.02, BLACK, face)
	dot("Shine", 0.03, ex + 0.025, 7.18, FZ - 0.03, WHITE, face)
	front("UpperLid", 0.25, 0.035, ex, 7.23, FZ - 0.01, side * -5, BLACK, face)
	front("LidCrease", 0.2, 0.015, ex, 7.27, FZ - 0.005, side * -5, SKIN_SHADE, face)
	front("UnderEye", 0.18, 0.015, ex, 7.08, FZ - 0.005, 0, SKIN_SHADE, face)
	-- strong, straight brows
	front("Brow", 0.3, 0.075, side * 0.24, 7.36, FZ, side * 6, BROW, face)
	front("BrowTail", 0.1, 0.05, side * 0.42, 7.35, FZ, side * -12, BROW, face)
	part("Ear", Vector3.new(0.08, 0.26, 0.16), CFrame.new(side * 0.655, 7.08, 0.05), SKIN, face)
	-- cheekbones + strong jaw
	-- sharp, angular jawline: a solid edge from below the ear down to the chin
	-- shading that follows the wedge slope, so the jaw edge reads crisply
	local jx = side * (CHIN_HALF + HEAD_HALF) / 2
	local jy = (JAW_TOP + JAW_BOTTOM) / 2
	local slope = math.deg(math.atan2(JAW_TOP - JAW_BOTTOM, HEAD_HALF - CHIN_HALF))
	local len = math.sqrt((JAW_TOP - JAW_BOTTOM) ^ 2 + (HEAD_HALF - CHIN_HALF) ^ 2)
	front("JawEdge", len, 0.03, jx, jy, FZ - 0.005, side * slope, SKIN_DARK, face)
	front("JawHighlight", len * 0.8, 0.02, jx - side * 0.04, jy + 0.035, FZ - 0.005, side * slope, Color3.fromRGB(242, 196, 168), face)
	-- hollow under the cheekbone
	front("CheekHollow", 0.025, 0.3, side * 0.43, 6.8, FZ - 0.005, side * -12, SKIN_SHADE, face)
	front("CheekHollow", 0.02, 0.2, side * 0.46, 6.97, FZ - 0.005, side * -25, SKIN_SHADE, face)
	front("Dimple", 0.02, 0.07, side * 0.19, 6.74, FZ - 0.005, side * 15, SKIN_SHADE, face)
end
front("NoseBridge", 0.05, 0.24, -0.04, 6.98, FZ - 0.01, 0, SKIN_SHADE, face)
front("Nose", 0.14, 0.06, 0, 6.87, FZ - 0.02, 0, SKIN_SHADE, face)
front("Nostril", 0.04, 0.03, -0.05, 6.85, FZ - 0.03, 0, SKIN_DARK, face)
front("Nostril", 0.04, 0.03, 0.05, 6.85, FZ - 0.03, 0, SKIN_DARK, face)
-- slight, confident smile
front("Mouth", 0.26, 0.025, 0, 6.71, FZ - 0.01, 0, Color3.fromRGB(150, 84, 76), face)
front("SmileCorner", 0.06, 0.02, -0.15, 6.725, FZ - 0.01, -28, Color3.fromRGB(150, 84, 76), face)
front("SmileCorner", 0.07, 0.02, 0.15, 6.73, FZ - 0.01, 32, Color3.fromRGB(150, 84, 76), face)
front("LowerLip", 0.18, 0.04, 0, 6.67, FZ - 0.005, 0, LIP, face)
-- squared chin that juts slightly forward
part("Chin", Vector3.new(0.48, 0.26, 0.3), CFrame.new(0, 6.44, -0.52), SKIN, face)
front("ChinCleft", 0.02, 0.1, 0, 6.45, -0.675, 0, SKIN_SHADE, face)
front("ChinShade", 0.3, 0.02, 0, 6.56, -0.672, 0, SKIN_SHADE, face)
front("ChinEdge", 0.46, 0.025, 0, 6.32, -0.672, 0, SKIN_DARK, face)
-- shadow cast under the jaw onto the neck
front("UnderJaw", 0.5, 0.08, 0, 6.38, -0.27, 0, SKIN_DARK, face)
front("UnderJaw", 0.04, 0.12, -0.24, 6.42, -0.27, 40, SKIN_DARK, face)
front("UnderJaw", 0.04, 0.12, 0.24, 6.42, -0.27, -40, SKIN_DARK, face)

------------------------------------------------------------------ Hair (short sides, swept-back side part)
local hair = folder("Hair")
part("Top", Vector3.new(1.36, 0.3, 1.36), CFrame.new(0, 7.8, 0.04), HAIR, hair)
part("Back", Vector3.new(1.34, 0.8, 0.2), CFrame.new(0, 7.3, 0.69), HAIR_DARK, hair)
part("Hairline", Vector3.new(1.2, 0.14, 0.1), CFrame.new(0.04, 7.66, -0.63), HAIR, hair)
for _, side in ipairs({ -1, 1 }) do
	part("Side", Vector3.new(0.1, 0.55, 1.15), CFrame.new(side * 0.67, 7.38, 0.08), HAIR_DARK, hair)
	part("Temple", Vector3.new(0.12, 0.2, 0.3), CFrame.new(side * 0.66, 7.5, -0.48), HAIR, hair)
	part("Sideburn", Vector3.new(0.07, 0.24, 0.13), CFrame.new(side * 0.665, 7.12, -0.24), HAIR_DARK, hair)
end
-- swept-back volume rising off the forehead, parted on one side
part("Quiff", Vector3.new(1.0, 0.32, 0.55), CFrame.new(0.1, 7.92, -0.4) * CFrame.Angles(math.rad(-14), 0, math.rad(-4)), HAIR, hair)
part("QuiffBack", Vector3.new(1.05, 0.22, 0.6), CFrame.new(0.08, 7.96, 0.1) * CFrame.Angles(math.rad(6), 0, 0), HAIR, hair)
part("PartSide", Vector3.new(0.36, 0.2, 1.0), CFrame.new(-0.5, 7.92, 0.0), HAIR_DARK, hair)
part("PartLine", Vector3.new(0.025, 0.02, 0.95), CFrame.new(-0.33, 8.04, -0.05), SKIN_SHADE, hair)
for i, x in ipairs({ -0.15, 0.05, 0.25, 0.45 }) do
	part("Comb", Vector3.new(0.03, 0.02, 0.9), CFrame.new(x, 8.075, -0.12) * CFrame.Angles(math.rad(-6), 0, math.rad(-4)), i % 2 == 0 and HAIR_DARK or HAIR_LIGHT, hair)
end
front("QuiffShine", 0.6, 0.03, 0.12, 7.95, -0.69, -4, HAIR_LIGHT, hair)
front("QuiffShadow", 0.7, 0.03, 0.1, 7.82, -0.66, -4, HAIR_DARK, hair)

model.PrimaryPart = chest
model.Parent = workspace
return model
