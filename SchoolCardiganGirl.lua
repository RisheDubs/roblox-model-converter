-- School cardigan girl (blocky Roblox-style statue built from parts)
-- Paste into a Script or the Studio command bar, or build it on the Code -> Model tab.

local model = Instance.new("Model")
model.Name = "SchoolCardiganGirl"

-- Palette
local SKIN = Color3.fromRGB(222, 166, 132)
local SKIN_SHADE = Color3.fromRGB(198, 140, 108)
local KNIT = Color3.fromRGB(30, 30, 34)
local KNIT_LIGHT = Color3.fromRGB(52, 52, 58)
local KNIT_EDGE = Color3.fromRGB(16, 16, 18)
local SHIRT = Color3.fromRGB(246, 246, 248)
local SHIRT_SHADE = Color3.fromRGB(212, 214, 222)
local TIE = Color3.fromRGB(42, 84, 170)
local TIE_STRIPE = Color3.fromRGB(196, 206, 226)
local SKIRT = Color3.fromRGB(28, 28, 32)
local SKIRT_LIGHT = Color3.fromRGB(46, 46, 52)
local BELT = Color3.fromRGB(18, 18, 20)
local SILVER = Color3.fromRGB(196, 198, 206)
local GOLD = Color3.fromRGB(214, 172, 66)
local BOOT = Color3.fromRGB(26, 26, 28)
local BOOT_SHINE = Color3.fromRGB(78, 78, 86)
local HAIR = Color3.fromRGB(46, 34, 30)
local HAIR_LIGHT = Color3.fromRGB(78, 58, 48)
local HAIR_MID = Color3.fromRGB(150, 82, 40)
local HAIR_ORANGE = Color3.fromRGB(226, 120, 46)
local HAIR_PEACH = Color3.fromRGB(240, 162, 90)
local EYE_PURPLE = Color3.fromRGB(150, 104, 206)
local BLACK = Color3.fromRGB(20, 18, 20)
local WHITE = Color3.fromRGB(252, 252, 252)
local BROW = Color3.fromRGB(44, 32, 28)
local LIPS = Color3.fromRGB(196, 104, 110)
local NAILS = Color3.fromRGB(70, 50, 60)
local CREST_BLUE = Color3.fromRGB(36, 82, 168)

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

local function hoop(name, center, radius, color, parent)
	for k = 0, 11 do
		local a = math.rad(k * 30)
		part(name, Vector3.new(radius * 0.55, 0.03, 0.03),
			center * CFrame.new(radius * math.cos(a), radius * math.sin(a), 0) * CFrame.Angles(0, 0, a + math.pi / 2), color, parent)
	end
end

------------------------------------------------------------------ Legs + ankle boots
local legs = folder("Legs")
for _, side in ipairs({ -1, 1 }) do
	local x = side * 0.32
	local leg = part(side == 1 and "Left Leg" or "Right Leg", Vector3.new(0.48, 2.65, 0.5), CFrame.new(x, 2.02, 0), SKIN, legs)
	leg.CanCollide = true
	front("Knee", 0.22, 0.03, x, 1.62, -0.255, side * 10, SKIN_SHADE, legs)
	front("KneeCap", 0.16, 0.02, x, 1.52, -0.255, side * -12, SKIN_SHADE, legs)
	front("Shin", 0.02, 0.55, x - side * 0.06, 1.1, -0.255, 0, SKIN_SHADE, legs)

	-- black ankle boots with a block heel
	local shaft = part("BootShaft", Vector3.new(0.56, 0.58, 0.6), CFrame.new(x, 0.5, 0.02), BOOT, legs)
	shaft.Reflectance = 0.08
	part("BootFoot", Vector3.new(0.56, 0.3, 0.92), CFrame.new(x, 0.22, -0.14), BOOT, legs).Reflectance = 0.08
	part("BootToe", Vector3.new(0.5, 0.24, 0.12), CFrame.new(x, 0.2, -0.64), BOOT, legs)
	part("Heel", Vector3.new(0.46, 0.2, 0.28), CFrame.new(x, 0.1, 0.2), KNIT_EDGE, legs)
	part("Sole", Vector3.new(0.58, 0.05, 0.94), CFrame.new(x, 0.065, -0.15), KNIT_EDGE, legs)
	part("BootCollar", Vector3.new(0.58, 0.05, 0.62), CFrame.new(x, 0.79, 0.02), KNIT_EDGE, legs)
	front("Shine", 0.06, 0.4, x - side * 0.17, 0.5, -0.285, 0, BOOT_SHINE, legs)
	front("ToeShine", 0.16, 0.04, x - side * 0.08, 0.27, -0.705, 0, BOOT_SHINE, legs)
	part("Zip", Vector3.new(0.02, 0.5, 0.03), CFrame.new(x - side * 0.285, 0.5, 0.05), SILVER, legs)
end

------------------------------------------------------------------ Pleated mini skirt
local skirt = folder("Skirt")
part("Hips", Vector3.new(1.2, 0.5, 0.6), CFrame.new(0, 3.65, 0), SKIRT, skirt)
local PANELS = 24
local TOP_Y, BOTTOM_Y = 3.98, 2.95
local TOP_RX, TOP_RZ = 0.72, 0.45
local BOTTOM_RX, BOTTOM_RZ = 1.02, 0.78
local function ring(a, y, rx, rz) return Vector3.new(rx * math.sin(a), y, -rz * math.cos(a)) end
local function mid(a) return (ring(a, TOP_Y, TOP_RX, TOP_RZ) + ring(a, BOTTOM_Y, BOTTOM_RX, BOTTOM_RZ)) / 2 end
for i = 0, PANELS - 1 do
	local a = (i / PANELS) * math.pi * 2
	local t = ring(a, TOP_Y, TOP_RX, TOP_RZ)
	local b = ring(a, BOTTOM_Y, BOTTOM_RX, BOTTOM_RZ)
	local up = (t - b).Unit
	local tangent = (mid(a + 0.01) - mid(a - 0.01)).Unit
	local right = (tangent - up * tangent:Dot(up)).Unit
	local width = (mid(a + math.pi / PANELS) - mid(a - math.pi / PANELS)).Magnitude * 1.2
	-- every other panel is set slightly further out, which reads as knife pleats
	local out = (i % 2 == 0) and 0.03 or 0
	local outward = right:Cross(up).Unit
	local cf = CFrame.fromMatrix((t + b) / 2 - outward * out, right, up)
	part("Pleat", Vector3.new(width, (t - b).Magnitude, 0.06), cf, (i % 2 == 0) and SKIRT_LIGHT or SKIRT, skirt, Enum.Material.Fabric)
end
part("Waistband", Vector3.new(1.48, 0.16, 0.84), CFrame.new(0, 4.0, 0), SKIRT, skirt, Enum.Material.Fabric)

------------------------------------------------------------------ Shirt, tie, cardigan, belt
local top = folder("Top")
local torso = part("Torso", Vector3.new(1.45, 1.7, 0.8), CFrame.new(0, 4.93, 0), KNIT, top, Enum.Material.Fabric)
torso.CanCollide = true

-- shirt showing through the V-neck
for i = 0, 8 do
	local y = 5.74 - i * 0.09
	local w = math.max(0.06, 0.56 - i * 0.065)
	front("ShirtV", w, 0.095, 0, y, -0.41, 0, SHIRT, top)
end
part("CollarStand", Vector3.new(0.44, 0.14, 0.44), CFrame.new(0, 5.82, 0.02), SHIRT, top)
for _, side in ipairs({ -1, 1 }) do
	front("Collar", 0.26, 0.22, side * 0.15, 5.72, -0.43, side * 32, SHIRT, top)
	front("CollarEdge", 0.26, 0.02, side * 0.16, 5.62, -0.445, side * 32, SHIRT_SHADE, top)
	-- dark ribbed edge running down each side of the V
	front("VEdge", 0.05, 0.86, side * 0.15, 5.33, -0.43, side * 17, KNIT_EDGE, top)
end

-- striped tie
local tie = folder("Tie")
front("Knot", 0.14, 0.13, 0, 5.66, -0.45, 0, TIE, tie)
front("Blade", 0.16, 0.62, 0, 5.3, -0.445, 0, TIE, tie)
for i = 0, 3 do
	front("TieStripe", 0.16, 0.035, 0, 5.52 - i * 0.14, -0.462, 35, TIE_STRIPE, tie)
	front("TieStripeThin", 0.16, 0.015, 0, 5.48 - i * 0.14, -0.462, 35, WHITE, tie)
end

-- cardigan button band below the V
front("ButtonBand", 0.06, 0.82, 0, 4.5, -0.415, 0, KNIT_EDGE, top)
for i = 0, 3 do
	dot("Button", 0.07, 0, 4.2 + i * 0.22, -0.43, KNIT_LIGHT, top)
end
-- knit texture + side seams
for _, side in ipairs({ -1, 1 }) do
	for i = 0, 2 do
		front("Knit", 0.012, 1.2, side * (0.35 + i * 0.12), 4.8, -0.41, 0, KNIT_LIGHT, top)
	end
	front("Gather", 0.3, 0.015, side * 0.3, 4.62, -0.41, side * 15, KNIT_LIGHT, top)
end
part("Hem", Vector3.new(1.47, 0.12, 0.82), CFrame.new(0, 4.13, 0), KNIT_EDGE, top, Enum.Material.Fabric)
-- shirt tails peeking out under the cardigan
for _, side in ipairs({ -1, 1 }) do
	front("ShirtTail", 0.5, 0.16, side * 0.42, 4.0, -0.43, side * -6, SHIRT, top)
	front("ShirtTailEdge", 0.5, 0.02, side * 0.42, 3.93, -0.445, side * -6, SHIRT_SHADE, top)
end

-- skinny belt cinched over the cardigan
part("Belt", Vector3.new(1.47, 0.11, 0.83), CFrame.new(0, 4.38, 0), BELT, top)
front("Buckle", 0.16, 0.13, 0.22, 4.38, -0.425, 0, SILVER, top)
front("BuckleHole", 0.09, 0.07, 0.22, 4.38, -0.44, 0, BELT, top)
front("Prong", 0.08, 0.015, 0.22, 4.38, -0.445, 0, SILVER, top)
for i = 0, 2 do
	dot("BeltHole", 0.025, 0.42 + i * 0.08, 4.38, -0.425, KNIT_LIGHT, top)
end
front("BeltLoop", 0.05, 0.15, 0.6, 4.38, -0.43, 0, BELT, top)

-- original school badge: blue shield with a white bird and gold trim
local crest = folder("Badge")
front("Shield", 0.24, 0.24, -0.4, 5.08, -0.42, 0, CREST_BLUE, crest)
part("ShieldTip", Vector3.new(0.17, 0.17, 0.03), CFrame.new(-0.4, 4.96, -0.42) * CFrame.Angles(0, 0, math.rad(45)), CREST_BLUE, crest)
front("TrimTop", 0.26, 0.025, -0.4, 5.205, -0.435, 0, GOLD, crest)
front("TrimSide", 0.02, 0.24, -0.525, 5.08, -0.435, 0, GOLD, crest)
front("TrimSide", 0.02, 0.24, -0.275, 5.08, -0.435, 0, GOLD, crest)
front("Wing", 0.14, 0.035, -0.43, 5.1, -0.44, 25, WHITE, crest)
front("Wing", 0.14, 0.035, -0.37, 5.1, -0.44, -25, WHITE, crest)
front("Body", 0.04, 0.1, -0.4, 5.05, -0.44, 0, WHITE, crest)
front("Scroll", 0.22, 0.04, -0.4, 4.88, -0.435, 0, GOLD, crest)

------------------------------------------------------------------ Arms
local arms = folder("Arms")
for _, side in ipairs({ -1, 1 }) do
	local armCF = CFrame.new(side * 0.95, 5.66, 0) * CFrame.Angles(0, 0, math.rad(side * 6))
	on(armCF, "Shoulder", Vector3.new(0.52, 0.3, 0.54), CFrame.new(0, -0.1, 0), KNIT, arms, Enum.Material.Fabric)
	local sleeve = on(armCF, side == 1 and "Left Arm" or "Right Arm", Vector3.new(0.48, 2.05, 0.5), CFrame.new(0, -1.1, 0), KNIT, arms, Enum.Material.Fabric)
	sleeve.CanCollide = true
	on(armCF, "ElbowFold", Vector3.new(0.3, 0.015, 0.02), CFrame.new(0, -1.15, -0.255) * CFrame.Angles(0, 0, 0.3), KNIT_LIGHT, arms)
	on(armCF, "ElbowFold", Vector3.new(0.25, 0.015, 0.02), CFrame.new(0, -1.3, -0.255) * CFrame.Angles(0, 0, -0.2), KNIT_LIGHT, arms)
	-- white shirt cuff folded back over the sleeve
	on(armCF, "ShirtCuff", Vector3.new(0.56, 0.3, 0.58), CFrame.new(0, -2.18, 0), SHIRT, arms, Enum.Material.Fabric)
	on(armCF, "CuffFold", Vector3.new(0.57, 0.02, 0.59), CFrame.new(0, -2.1, 0), SHIRT_SHADE, arms)
	-- hand with dark nails
	local handCF = armCF * CFrame.new(0, -2.6, -0.02)
	part("Hand", Vector3.new(0.36, 0.52, 0.38), handCF, SKIN, arms)
	on(handCF, "Thumb", Vector3.new(0.09, 0.24, 0.1), CFrame.new(-side * 0.17, 0.0, -0.12), SKIN, arms)
	for i = -1, 1 do
		on(handCF, "FingerGap", Vector3.new(0.012, 0.2, 0.02), CFrame.new(i * 0.085, -0.14, -0.195), SKIN_SHADE, arms)
	end
	for i = 0, 3 do
		on(handCF, "Nail", Vector3.new(0.055, 0.06, 0.02), CFrame.new(-0.13 + i * 0.087, -0.23, -0.195), NAILS, arms)
	end
end

------------------------------------------------------------------ Neck + head + face
part("Neck", Vector3.new(0.36, 0.38, 0.36), CFrame.new(0, 5.92, 0), SKIN)
local head = part("Head", Vector3.new(1.2, 1.2, 1.2), CFrame.new(0, 6.62, 0), SKIN)
head.CanCollide = true
local mesh = Instance.new("SpecialMesh")
mesh.MeshType = Enum.MeshType.Head
mesh.Parent = head

local face = folder("Face")
local FZ = -0.6
for _, side in ipairs({ -1, 1 }) do
	local ex = side * 0.23
	-- purple eyes with winged liner
	front("Eye", 0.24, 0.16, ex, 6.66, FZ, 0, WHITE, face)
	dot("Iris", 0.14, ex, 6.655, FZ - 0.01, EYE_PURPLE, face)
	dot("IrisRing", 0.09, ex, 6.655, FZ - 0.015, Color3.fromRGB(108, 68, 164), face)
	dot("Pupil", 0.055, ex, 6.655, FZ - 0.02, BLACK, face)
	dot("Shine", 0.035, ex + 0.03, 6.69, FZ - 0.03, WHITE, face)
	front("Liner", 0.28, 0.05, ex, 6.745, FZ - 0.01, side * -5, BLACK, face)
	front("Wing", 0.1, 0.035, side * 0.38, 6.77, FZ - 0.01, side * 28, BLACK, face)
	front("Lid", 0.24, 0.04, ex, 6.79, FZ - 0.005, side * -5, Color3.fromRGB(176, 120, 170), face)
	front("LowerLash", 0.2, 0.018, ex, 6.575, FZ - 0.005, 0, BROW, face)
	-- softly arched brows (mostly under the bangs)
	front("Brow", 0.24, 0.045, side * 0.23, 6.88, FZ, side * -6, BROW, face)
	-- gold hoops
	part("Ear", Vector3.new(0.07, 0.2, 0.14), CFrame.new(side * 0.63, 6.58, 0.05), SKIN, face)
	dot("Stud", 0.06, side * 0.645, 6.48, -0.02, GOLD, face)
	hoop("Hoop", CFrame.new(side * 0.69, 6.33, -0.05) * CFrame.Angles(0, math.rad(side * 40), 0), 0.14, GOLD, face)
end
front("Nose", 0.08, 0.13, 0, 6.5, FZ - 0.02, 0, SKIN_SHADE, face)
front("NoseTip", 0.12, 0.04, 0, 6.44, FZ - 0.025, 0, SKIN_SHADE, face)
-- smile showing a hint of teeth
front("UpperLip", 0.26, 0.045, 0, 6.33, FZ - 0.01, 0, LIPS, face)
front("Teeth", 0.2, 0.035, 0, 6.295, FZ - 0.01, 0, WHITE, face)
front("LowerLip", 0.22, 0.06, 0, 6.25, FZ - 0.01, 0, LIPS, face)
front("SmileCorner", 0.06, 0.02, -0.15, 6.34, FZ - 0.012, -32, Color3.fromRGB(150, 76, 84), face)
front("SmileCorner", 0.06, 0.02, 0.15, 6.34, FZ - 0.012, 32, Color3.fromRGB(150, 76, 84), face)
dot("LipShine", 0.035, 0.05, 6.25, FZ - 0.025, Color3.fromRGB(232, 160, 160), face)

------------------------------------------------------------------ Hair: blunt bangs + high ponytail with orange ombre
local hair = folder("Hair")
part("Top", Vector3.new(1.32, 0.28, 1.32), CFrame.new(0, 7.3, 0.03), HAIR, hair)
part("Back", Vector3.new(1.3, 0.95, 0.18), CFrame.new(0, 6.82, 0.66), HAIR, hair)
for _, side in ipairs({ -1, 1 }) do
	part("Side", Vector3.new(0.1, 0.7, 1.1), CFrame.new(side * 0.64, 6.92, 0.1), HAIR, hair)
	part("Wisp", Vector3.new(0.08, 0.55, 0.1), CFrame.new(side * 0.56, 6.55, -0.56) * CFrame.Angles(0, 0, math.rad(side * 6)), HAIR, hair)
end
-- blunt bangs with a choppy edge
part("Bangs", Vector3.new(1.22, 0.3, 0.14), CFrame.new(0, 7.03, -0.64), HAIR, hair)
for i = -5, 5 do
	local h = (i % 2 == 0) and 0.1 or 0.07
	part("Fringe", Vector3.new(0.09, h, 0.12), CFrame.new(i * 0.105, 6.88 - h / 2 + 0.035, -0.64), HAIR, hair)
end
front("BangShine", 0.7, 0.025, 0.05, 7.1, -0.715, 0, HAIR_LIGHT, hair)
for _, x in ipairs({ -0.4, -0.1, 0.2, 0.45 }) do
	part("CombLine", Vector3.new(0.025, 0.02, 1.0), CFrame.new(x, 7.445, 0.05), HAIR_LIGHT, hair)
end

-- ponytail: tied high at the back, then sweeping over her left shoulder
part("PonyBase", Vector3.new(0.36, 0.3, 0.36), CFrame.new(0, 7.42, 0.5), HAIR, hair)
part("Tie", Vector3.new(0.38, 0.08, 0.38), CFrame.new(0, 7.46, 0.52), BLACK, hair)
part("PonyLoop", Vector3.new(0.4, 0.5, 0.4), CFrame.new(0, 7.68, 0.66) * CFrame.Angles(math.rad(30), 0, 0), HAIR, hair)
local tail = {
	{ Vector3.new(0.42, 0.55, 0.4), Vector3.new(-0.12, 7.25, 0.88), -15, HAIR },
	{ Vector3.new(0.44, 0.6, 0.42), Vector3.new(-0.38, 6.7, 0.72), -25, HAIR },
	{ Vector3.new(0.44, 0.6, 0.42), Vector3.new(-0.62, 6.15, 0.35), -10, HAIR_LIGHT },
	{ Vector3.new(0.42, 0.6, 0.38), Vector3.new(-0.74, 5.65, -0.12), 8, HAIR_MID },
	{ Vector3.new(0.4, 0.58, 0.34), Vector3.new(-0.68, 5.15, -0.45), -10, HAIR_ORANGE },
	{ Vector3.new(0.36, 0.55, 0.3), Vector3.new(-0.6, 4.68, -0.52), 12, HAIR_ORANGE },
	{ Vector3.new(0.28, 0.4, 0.24), Vector3.new(-0.66, 4.28, -0.52), -15, HAIR_PEACH },
	{ Vector3.new(0.18, 0.25, 0.18), Vector3.new(-0.6, 4.0, -0.5), 20, HAIR_PEACH },
}
for i, s in ipairs(tail) do
	part("Ponytail" .. i, s[1], CFrame.new(s[2]) * CFrame.Angles(0, 0, math.rad(s[3])), s[4], hair)
end
-- wavy strand lines on the front of the tail
front("Strand", 0.025, 0.5, -0.62, 5.15, -0.625, 6, HAIR_PEACH, hair)
front("Strand", 0.025, 0.45, -0.75, 5.1, -0.625, -8, HAIR_MID, hair)
front("Strand", 0.025, 0.45, -0.56, 4.68, -0.675, -10, HAIR_PEACH, hair)

model.PrimaryPart = torso
model.Parent = workspace
return model
