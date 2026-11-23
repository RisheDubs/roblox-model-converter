-- Red hoodie avatar (detailed, blocky R6-style statue built from parts)
-- Paste into a Script or the Studio command bar, or build it on the Code -> Model tab.

local avatar = Instance.new("Model")
avatar.Name = "RedHoodieAvatar"

-- Palette
local HOODIE = Color3.fromRGB(163, 32, 38)
local HOODIE_LIGHT = Color3.fromRGB(186, 48, 52)
local HOODIE_DARK = Color3.fromRGB(122, 22, 28)
local HOODIE_LINE = Color3.fromRGB(105, 18, 24)
local PANTS = Color3.fromRGB(204, 205, 210)
local PANTS_SHADE = Color3.fromRGB(182, 183, 190)
local WHITE = Color3.fromRGB(242, 242, 245)
local SOLE = Color3.fromRGB(165, 166, 172)
local METAL = Color3.fromRGB(150, 150, 158)
local SKIN = Color3.fromRGB(240, 202, 172)
local BLUSH = Color3.fromRGB(240, 132, 136)
local EYE = Color3.fromRGB(46, 30, 28)
local HAIR = Color3.fromRGB(100, 58, 32)
local HAIR_DARK = Color3.fromRGB(70, 40, 22)
local HAIR_LIGHT = Color3.fromRGB(132, 82, 48)

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
	p.Parent = parent or avatar
	return p
end

-- Thin detail facing the front (-Z). rot = degrees around Z.
local function front(name, w, h, x, y, z, rot, color, parent)
	return part(name, Vector3.new(w, h, 0.03), CFrame.new(x, y, z) * CFrame.Angles(0, 0, math.rad(rot or 0)), color, parent)
end

-- Thin detail on a side face (+X or -X). w runs along Z.
local function sideDetail(name, w, h, x, y, z, rot, color, parent)
	return part(name, Vector3.new(0.03, h, w), CFrame.new(x, y, z) * CFrame.Angles(math.rad(rot or 0), 0, 0), color, parent)
end

-- Flat disc facing the front
local function disc(name, d, x, y, z, color, parent)
	local p = part(name, Vector3.new(0.03, d, d), CFrame.new(x, y, z) * CFrame.Angles(0, math.rad(90), 0), color, parent)
	p.Shape = Enum.PartType.Cylinder
	return p
end

------------------------------------------------------------------ Legs + sneakers
local legs = Instance.new("Model")
legs.Name = "Legs"
legs.Parent = avatar
for _, side in ipairs({ -1, 1 }) do
	local name = side == 1 and "Right Leg" or "Left Leg"
	local x = side * 0.5
	local leg = part(name, Vector3.new(1, 2, 1), CFrame.new(x, 1, 0), PANTS, legs, Enum.Material.Fabric)
	leg.CanCollide = true
	front("KneeShade", 0.96, 0.32, x, 1.05, -0.51, 0, PANTS_SHADE, legs)
	front("Crease", 0.03, 1.2, x + side * 0.05, 1.25, -0.515, 0, PANTS_SHADE, legs)
	sideDetail("OuterSeam", 0.03, 1.7, x + side * 0.505, 1.15, 0, 0, PANTS_SHADE, legs)

	-- sneaker
	part("Shoe", Vector3.new(1.04, 0.32, 1.12), CFrame.new(x, 0.2, -0.05), WHITE, legs)
	part("Sole", Vector3.new(1.06, 0.09, 1.14), CFrame.new(x, 0.045, -0.05), SOLE, legs)
	part("ToeCap", Vector3.new(0.9, 0.16, 0.06), CFrame.new(x, 0.17, -0.62), WHITE, legs)
	for i = 0, 2 do
		front("Lace", 0.34, 0.03, x, 0.24 + i * 0.07, -0.625, 0, SOLE, legs)
	end
end
front("LegGap", 0.03, 1.75, 0, 1.12, -0.51, 0, PANTS_SHADE, legs)

------------------------------------------------------------------ Torso (hoodie)
local hoodie = Instance.new("Model")
hoodie.Name = "Hoodie"
hoodie.Parent = avatar
local torso = part("Torso", Vector3.new(2, 2, 1), CFrame.new(0, 3, 0), HOODIE, hoodie, Enum.Material.Fabric)
torso.CanCollide = true

-- ribbed waistband with white toggles
part("Hem", Vector3.new(2.02, 0.3, 1.02), CFrame.new(0, 2.15, 0), HOODIE_DARK, hoodie, Enum.Material.Fabric)
for i = -7, 7 do
	front("HemRib", 0.025, 0.26, i * 0.13, 2.15, -0.515, 0, HOODIE_LINE, hoodie)
end
for _, side in ipairs({ -1, 1 }) do
	front("Toggle", 0.36, 0.09, side * 0.62, 2.15, -0.53, 0, WHITE, hoodie)
	front("ToggleCord", 0.03, 0.14, side * 0.62, 2.04, -0.53, 0, WHITE, hoodie)
end

-- V collar + hood lining
front("CollarL", 0.6, 0.07, -0.225, 3.79, -0.515, -38, HOODIE_LINE, hoodie)
front("CollarR", 0.6, 0.07, 0.225, 3.79, -0.515, 38, HOODIE_LINE, hoodie)
front("NeckShadow", 0.7, 0.12, 0, 3.95, -0.512, 0, HOODIE_DARK, hoodie)
part("Hood", Vector3.new(1.6, 0.5, 0.6), CFrame.new(0, 4.2, 0.32), HOODIE, hoodie, Enum.Material.Fabric)
part("HoodRim", Vector3.new(1.3, 0.12, 0.25), CFrame.new(0, 4.4, 0.08), HOODIE_DARK, hoodie, Enum.Material.Fabric)
for _, side in ipairs({ -1, 1 }) do
	part("HoodSide", Vector3.new(0.3, 0.32, 0.75), CFrame.new(side * 0.62, 4.12, 0.05), HOODIE, hoodie, Enum.Material.Fabric)
end

-- drawstrings with metal tips
for _, side in ipairs({ -1, 1 }) do
	front("Eyelet", 0.07, 0.07, side * 0.22, 3.9, -0.52, 0, METAL, hoodie)
	front("Drawstring", 0.055, 0.6, side * 0.22 + side * 0.02, 3.58, -0.525, side * -3, WHITE, hoodie)
	front("Aglet", 0.075, 0.1, side * 0.24, 3.24, -0.53, 0, METAL, hoodie)
end

-- chest logo
front("Logo", 0.28, 0.1, -0.5, 3.48, -0.515, 0, WHITE, hoodie)
front("LogoLine", 0.18, 0.03, -0.5, 3.39, -0.515, 0, WHITE, hoodie)

-- kangaroo pocket outline
front("PocketTop", 1.1, 0.04, 0, 2.88, -0.515, 0, HOODIE_LINE, hoodie)
front("PocketL", 0.55, 0.04, -0.66, 2.62, -0.515, 68, HOODIE_LINE, hoodie)
front("PocketR", 0.55, 0.04, 0.66, 2.62, -0.515, -68, HOODIE_LINE, hoodie)

-- fabric folds
front("Fold", 0.45, 0.03, -0.55, 3.12, -0.512, 18, HOODIE_DARK, hoodie)
front("Fold", 0.4, 0.03, 0.6, 3.2, -0.512, -15, HOODIE_DARK, hoodie)

------------------------------------------------------------------ Arms (sleeves)
for _, side in ipairs({ -1, 1 }) do
	local name = side == 1 and "Right Arm" or "Left Arm"
	local x = side * 1.5
	local arm = part(name, Vector3.new(1, 2, 1), CFrame.new(x, 3, 0), HOODIE, hoodie, Enum.Material.Fabric)
	arm.CanCollide = true
	part(name .. " Shoulder", Vector3.new(1.02, 0.14, 1.02), CFrame.new(x, 3.93, 0), HOODIE_LIGHT, hoodie, Enum.Material.Fabric)
	front("ShoulderSeam", 0.03, 0.5, x - side * 0.48, 3.72, -0.51, 0, HOODIE_DARK, hoodie)

	-- ribbed cuff
	part(name .. " Cuff", Vector3.new(1.02, 0.32, 1.02), CFrame.new(x, 2.16, 0), HOODIE_DARK, hoodie, Enum.Material.Fabric)
	for i = -3, 3 do
		front("CuffRib", 0.025, 0.28, x + i * 0.13, 2.16, -0.515, 0, HOODIE_LINE, hoodie)
	end

	-- elbow folds
	front("ElbowFold", 0.5, 0.03, x, 3.05, -0.512, side * 12, HOODIE_DARK, hoodie)
	front("ElbowFold", 0.35, 0.03, x + side * 0.1, 2.9, -0.512, side * -8, HOODIE_DARK, hoodie)

	-- three white sporty stripes down the outside of the sleeve
	for i = 0, 2 do
		sideDetail("Stripe", 0.07, 1.25, x + side * 0.51, 2.95, -0.3 + i * 0.17, 0, WHITE, hoodie)
	end
	-- stripes wrap onto the front edge
	front("StripeFront", 0.07, 1.25, x + side * 0.44, 2.95, -0.515, 0, WHITE, hoodie)
end

------------------------------------------------------------------ Head + face
local head = part("Head", Vector3.new(1.2, 1.2, 1.2), CFrame.new(0, 4.6, 0), SKIN)
head.CanCollide = true
local mesh = Instance.new("SpecialMesh")
mesh.MeshType = Enum.MeshType.Head
mesh.Parent = head

local face = Instance.new("Model")
face.Name = "Face"
face.Parent = avatar
local FZ = -0.6
for _, side in ipairs({ -1, 1 }) do
	local ex = side * 0.2
	-- half-closed, side-glancing eyes
	front("Eye", 0.11, 0.15, ex, 4.66, FZ, 0, EYE, face)
	front("Shine", 0.04, 0.04, ex + 0.025, 4.7, FZ - 0.01, 0, WHITE, face)
	front("Lid", 0.2, 0.04, ex, 4.75, FZ - 0.005, side * -10, EYE, face)
	front("Lash", 0.06, 0.03, ex + side * 0.1, 4.78, FZ - 0.005, side * -35, EYE, face)
	front("Brow", 0.2, 0.035, side * 0.22, 4.9, FZ, side * 6, HAIR_DARK, face)
	-- rosy cheeks with little shine marks
	disc("Blush", 0.17, side * 0.34, 4.47, FZ, BLUSH, face)
	front("BlushLine", 0.025, 0.06, side * 0.31, 4.47, FZ - 0.02, 20, WHITE, face)
	front("BlushLine", 0.025, 0.06, side * 0.36, 4.47, FZ - 0.02, 20, WHITE, face)
end
-- smirk
front("Mouth", 0.16, 0.03, 0.02, 4.36, FZ, -4, EYE, face)
front("MouthCurl", 0.07, 0.03, 0.12, 4.39, FZ, 35, EYE, face)

------------------------------------------------------------------ Hair (layered brown bob)
local hair = Instance.new("Model")
hair.Name = "Hair"
hair.Parent = avatar
part("Top", Vector3.new(1.38, 0.32, 1.38), CFrame.new(0, 5.3, 0.02), HAIR, hair)
part("Crown", Vector3.new(1.1, 0.12, 1.1), CFrame.new(0, 5.5, 0.06), HAIR, hair)
part("Back", Vector3.new(1.38, 1.32, 0.32), CFrame.new(0, 4.6, 0.62), HAIR, hair)
part("BackFlare", Vector3.new(1.5, 0.28, 0.38), CFrame.new(0, 4.02, 0.62), HAIR, hair)
front("SidePart", 0.04, 0.02, 0.25, 5.47, 0, 0, HAIR_DARK, hair).Size = Vector3.new(0.04, 0.02, 1.0)

for _, side in ipairs({ -1, 1 }) do
	part("Side", Vector3.new(0.26, 1.3, 1.25), CFrame.new(side * 0.72, 4.62, 0.05), HAIR, hair)
	part("FaceFrame", Vector3.new(0.22, 1.0, 0.28), CFrame.new(side * 0.66, 4.55, -0.5), HAIR, hair)
	part("Flip", Vector3.new(0.42, 0.22, 1.1), CFrame.new(side * 0.82, 3.98, 0.08) * CFrame.Angles(0, 0, math.rad(side * 20)), HAIR, hair)
	-- strand lines on the outside of each side
	for i, z in ipairs({ -0.35, -0.05, 0.25, 0.5 }) do
		local color = i % 2 == 0 and HAIR_DARK or HAIR_LIGHT
		sideDetail("Strand", 0.03, 1.05, side * 0.855, 4.6, z, 0, color, hair)
	end
end
-- strands on the back
for i, x in ipairs({ -0.5, -0.25, 0, 0.25, 0.5 }) do
	local color = i % 2 == 0 and HAIR_DARK or HAIR_LIGHT
	part("Strand", Vector3.new(0.03, 1.1, 0.03), CFrame.new(x, 4.62, 0.79), color, hair)
end

-- side-swept bangs
part("Bangs", Vector3.new(1.05, 0.3, 0.2), CFrame.new(-0.08, 5.02, -0.63) * CFrame.Angles(0, 0, math.rad(-12)), HAIR, hair)
part("BangsSwoop", Vector3.new(0.55, 0.36, 0.2), CFrame.new(0.4, 5.1, -0.62) * CFrame.Angles(0, 0, math.rad(18)), HAIR, hair)
part("BangsTip", Vector3.new(0.32, 0.24, 0.18), CFrame.new(-0.56, 4.86, -0.6) * CFrame.Angles(0, 0, math.rad(-35)), HAIR, hair)
front("BangsShine", 0.4, 0.03, -0.05, 5.06, -0.735, -12, HAIR_LIGHT, hair)
front("BangsShadow", 0.5, 0.03, 0.1, 4.95, -0.735, -12, HAIR_DARK, hair)

avatar.PrimaryPart = torso
avatar.Parent = workspace
return avatar
