'use strict';
window.RBX.EXAMPLES = {
  'Spiral staircase': `-- A spiral staircase around a central pole
local model = Instance.new("Model")
model.Name = "SpiralStairs"

local pole = Instance.new("Part")
pole.Name = "Pole"
pole.Shape = Enum.PartType.Cylinder
pole.Size = Vector3.new(30, 2, 2)
pole.CFrame = CFrame.new(0, 15, 0) * CFrame.Angles(0, 0, math.rad(90))
pole.Color = Color3.fromRGB(60, 60, 70)
pole.Material = Enum.Material.Metal
pole.Anchored = true
pole.Parent = model

for i = 0, 27 do
	local step = Instance.new("Part")
	step.Name = "Step" .. i
	step.Size = Vector3.new(6, 0.5, 2)
	step.CFrame = CFrame.Angles(0, math.rad(i * 20), 0) * CFrame.new(4, i + 0.5, 0)
	step.Color = Color3.fromHSV(i / 28, 0.55, 0.95)
	step.Anchored = true
	step.Parent = model
end

model.PrimaryPart = pole
model.Parent = workspace
`,
  'Little house': `-- A small house with a pitched roof
local house = Instance.new("Model")
house.Name = "House"

local function block(name, size, pos, color, material)
	local p = Instance.new("Part")
	p.Name = name
	p.Size = size
	p.Position = pos
	p.Color = color
	p.Material = material or Enum.Material.SmoothPlastic
	p.Anchored = true
	p.Parent = house
	return p
end

local wall = Color3.fromRGB(235, 225, 205)
block("Floor", Vector3.new(20, 1, 16), Vector3.new(0, 0.5, 0), Color3.fromRGB(120, 90, 60), Enum.Material.WoodPlanks)
block("BackWall", Vector3.new(20, 10, 1), Vector3.new(0, 6, 7.5), wall)
block("LeftWall", Vector3.new(1, 10, 14), Vector3.new(-9.5, 6, 0), wall)
block("RightWall", Vector3.new(1, 10, 14), Vector3.new(9.5, 6, 0), wall)
block("FrontLeft", Vector3.new(8, 10, 1), Vector3.new(-6, 6, -7.5), wall)
block("FrontRight", Vector3.new(8, 10, 1), Vector3.new(6, 6, -7.5), wall)
block("AboveDoor", Vector3.new(4, 3, 1), Vector3.new(0, 9.5, -7.5), wall)
local door = block("Door", Vector3.new(4, 7, 0.4), Vector3.new(0, 4.5, -7.6), Color3.fromRGB(110, 60, 35), Enum.Material.Wood)
door:SetAttribute("Locked", false)

-- roof: two wedges meeting in the middle
for _, side in ipairs({-1, 1}) do
	local roof = Instance.new("WedgePart")
	roof.Name = "Roof"
	roof.Size = Vector3.new(18, 5, 11)
	roof.CFrame = CFrame.new(0, 13.5, side * 5.5) * CFrame.Angles(0, side == 1 and math.pi or 0, 0)
	roof.Color = Color3.fromRGB(170, 60, 50)
	roof.Material = Enum.Material.Slate
	roof.Anchored = true
	roof.Parent = house
end
-- the 'and/or' above is fine; Luau 'if x then a else b' expressions are not supported here

house.Parent = workspace
`,
  'Forest': `-- A few random trees (same seed = same forest)
local rng = Random.new(42)
local forest = Instance.new("Model")
forest.Name = "Forest"

for i = 1, 12 do
	local x, z = rng:NextNumber(-40, 40), rng:NextNumber(-40, 40)
	local h = rng:NextNumber(6, 12)

	local tree = Instance.new("Model")
	tree.Name = "Tree" .. i

	local trunk = Instance.new("Part")
	trunk.Name = "Trunk"
	trunk.Shape = Enum.PartType.Cylinder
	trunk.Size = Vector3.new(h, 1.5, 1.5)
	trunk.CFrame = CFrame.new(x, h / 2, z) * CFrame.Angles(0, 0, math.rad(90))
	trunk.BrickColor = BrickColor.new("Reddish brown")
	trunk.Material = Enum.Material.Wood
	trunk.Anchored = true
	trunk.Parent = tree

	local leaves = Instance.new("Part")
	leaves.Name = "Leaves"
	leaves.Shape = Enum.PartType.Ball
	local r = rng:NextNumber(5, 8)
	leaves.Size = Vector3.new(r, r, r)
	leaves.Position = Vector3.new(x, h + r * 0.3, z)
	leaves.Color = Color3.fromRGB(60, rng:NextInteger(120, 170), 60)
	leaves.Material = Enum.Material.Grass
	leaves.Anchored = true
	leaves.Parent = tree

	tree.PrimaryPart = trunk
	tree:AddTag("Tree")
	tree.Parent = forest
end

local ground = Instance.new("Part")
ground.Name = "Ground"
ground.Size = Vector3.new(100, 1, 100)
ground.Position = Vector3.new(0, -0.5, 0)
ground.Color = Color3.fromRGB(90, 140, 70)
ground.Material = Enum.Material.Grass
ground.Anchored = true
ground.Parent = forest

forest.Parent = workspace
`,
  'Neon tower': `-- A twisting neon tower, then the whole model is moved with TranslateBy
local tower = Instance.new("Model")
tower.Name = "NeonTower"

for floor = 1, 24 do
	local ring = Instance.new("Part")
	ring.Name = "Floor" .. floor
	ring.Size = Vector3.new(10, 1, 10)
	ring.CFrame = CFrame.new(0, floor * 1.5, 0) * CFrame.Angles(0, math.rad(floor * 7.5), 0)
	ring.Color = Color3.fromHSV((floor * 0.04) % 1, 0.8, 1)
	ring.Material = floor % 3 == 0 and Enum.Material.Neon or Enum.Material.Glass
	ring.Transparency = floor % 3 == 0 and 0 or 0.3
	ring.Anchored = true
	ring.Parent = tower

	if floor % 6 == 0 then
		local light = Instance.new("PointLight")
		light.Color = ring.Color
		light.Range = 16
		light.Parent = ring
	end
end

tower:TranslateBy(Vector3.new(20, 0, 0))
print("Tower height:", tower:GetExtentsSize().Y)
tower.Parent = workspace
`,
};
