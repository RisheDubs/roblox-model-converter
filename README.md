# Model ⇄ Code

A small website that converts **Roblox models into Luau code**, and **Luau code back into Roblox models** — entirely in your browser.

- **Model → Code:** drop in a `.rbxm` (binary) or `.rbxmx` (XML) file and get a readable Luau script that rebuilds it with `Instance.new`.
- **Code → Model:** write or paste Luau, click **Build model**, preview it in 3D, and download a `.rbxmx` you can insert into Roblox Studio.

No server, no account, no AI. Your files never leave your computer.

---

## Quick start

It's a static site — there's nothing to install or build.

**Option 1 — just open it:** double-click `index.html`.

**Option 2 — run a local server** (recommended):

```bash
python -m http.server 8765
```

then open <http://localhost:8765>.

**Option 3 — host it for free** with GitHub Pages (see [Hosting on GitHub Pages](#hosting-on-github-pages)).

---

## How to use it

### Model → Code

1. In Roblox Studio, select your model in the Explorer.
2. Right-click → **Save to File…** (or **Export Selection**).
3. Drop the `.rbxm` / `.rbxmx` file onto the page (or paste `.rbxmx` XML).
4. Copy or download the generated `.lua`.

Options:

| Option | What it does |
| --- | --- |
| Skip default values | Leaves out properties that are already at their usual defaults, for shorter code |
| Include script sources | Copies `Script`/`LocalScript`/`ModuleScript` source into the output |
| Rotation | `CFrame.Angles(...)` (readable) or the full 12-number CFrame matrix (exact) |
| Decimals | Rounding for numbers |
| Parent to | Where the rebuilt model goes (`workspace`, `ReplicatedStorage`, …, or nowhere) |

The generated code can be pasted into a Script or the Studio command bar.

### Code → Model

1. Open the **Code → Model** tab, pick an example or write your own Luau.
2. Click **Build model** (or press `Ctrl` + `Enter`).
3. Check the 3D preview / Explorer tree, then **Download .rbxmx**.
4. In Studio: right-click **Workspace** → **Insert from File…** and pick the file.

Whatever your code parents to `workspace` (or `return`s) becomes the model.

---

## How it works

Everything is plain JavaScript running in the browser.

```
 .rbxm (binary) ─┐                                    ┌─► Luau code (codegen.js)
                 ├─► instance tree ("IR") ────────────┤
 .rbxmx (XML) ───┘    (core.js)                       ├─► .rbxmx file (rbxmx.js writer)
                                                      └─► 3D preview (preview.js)
 Luau code ──► Lua VM + mock Roblox API (runtime.js) ─┘
```

| File | Role |
| --- | --- |
| `js/core.js` | Shared data: the instance tree format, Roblox enums, BrickColors, CFrame math, attribute encoding |
| `js/rbxm.js` | Reads Roblox's **binary** format: header, LZ4/ZSTD-compressed chunks (`INST`, `PROP`, `PRNT`, `SSTR`), interleaved/zigzag-encoded property arrays |
| `js/rbxmx.js` | Reads and writes Roblox's **XML** format |
| `js/codegen.js` | Turns an instance tree into readable Luau (`Instance.new`, property assignments, references, attributes, tags) |
| `js/runtime.js` | Runs your Luau in a real Lua VM ([Fengari](https://fengari.io/)) with a **mock Roblox API** written in Lua: `Instance`, `Vector3`, `CFrame`, `Color3`, `BrickColor`, `UDim2`, `Enum`, `PivotTo`, `Clone`, attributes, tags, services… then serializes what you built |
| `js/preview.js` | Renders parts with [three.js](https://threejs.org/) (blocks, wedges, balls, cylinders, sphere meshes) |
| `js/app.js` | The page UI |
| `js/examples.js` | Built-in examples |

### Luau support in Code → Model

Your code runs on a Lua 5.3 VM, with common Luau features translated first:

- ✅ `+=`, `-=`, `..=` and other compound assignments
- ✅ type annotations on locals, parameters and return types
- ✅ `continue`
- ✅ string interpolation `` `hello {name}` ``
- ✅ Luau library extras (`math.clamp`, `table.find`, `string.split`, `task.wait`, …)
- ❌ `if … then … else` **expressions** (use `cond and a or b`)
- ❌ generics and multi-line type declarations
- ❌ `require` — paste module code in directly

Scripts that run longer than 8 seconds are stopped (to catch infinite loops).

---

## Does it need the internet?

**It never needs Claude or any AI, and it has no backend.** It needs internet only to download three open-source libraries from public CDNs:

| Feature | Library | Works offline? |
| --- | --- | --- |
| Reading `.rbxmx` / most `.rbxm` files, generating code | none | ✅ yes |
| 3D preview | three.js (cdnjs) | ❌ preview shows a message instead |
| Code → Model | Fengari Lua VM (jsDelivr) | ❌ |
| Some newer `.rbxm` files compressed with ZSTD | fzstd (jsDelivr) | ❌ only for those files |

After the first load your browser usually caches them. To make the site **100% offline**, download these files into a `vendor/` folder and point the URLs at them:

- `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js` → used in `index.html`
- `https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js` → used in `js/runtime.js`
- `https://cdn.jsdelivr.net/npm/fzstd@0.1.1/umd/index.js` → used in `js/rbxm.js`

---

## Character scripts

The repo also includes Luau scripts that build blocky, stylized characters out of parts. Each one can be pasted into the Studio command bar or into **Code → Model**:

| File | Character |
| --- | --- |
| `RedHoodieAvatar.lua` | Avatar in a red hoodie with a brown bob |
| `PinkJacketGirl.lua` | Purple-and-pink hair, off-shoulder pink jacket, ripped jeans |
| `RedCardiganGirl.lua` | Red cardigan, collared blouse, flared midi skirt |
| `SchoolBlazerBoy.lua` | Navy school blazer with red piping, striped tie |
| `WhiteShirtGuy.lua` | White button-up, dark jeans, sharp jawline |
| `SchoolCardiganGirl.lua` | Black cardigan, tie, pleated skirt, ombre ponytail |

They're anchored statues (not playable rigs), grouped into sub-models like `Hair`, `Face`, `Arms` and `Legs`.

---

## Limitations

- **MeshPart meshes and unions** can't be recreated by a script — they're generated as placeholders with a note.
- Setting a script's `.Source` only works from the **command bar or a plugin**; the generated code wraps it in `pcall`.
- The 3D preview is approximate (no textures, decals, or file meshes).
- Rare property types (newer `Content`/terrain data) are skipped with a warning.

---

## Hosting on GitHub Pages

1. Push this repo to GitHub.
2. On GitHub: **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

---

## Credits

- [Fengari](https://github.com/fengari-lua/fengari-web) — Lua VM in JavaScript (MIT)
- [three.js](https://github.com/mrdoob/three.js) — 3D rendering (MIT)
- [fzstd](https://github.com/101arrowz/fzstd) — ZSTD decompression (MIT)
- Binary format reference: the [rbx-dom](https://github.com/rojo-rbx/rbx-dom) project's documentation; parsers were tested against its [rbx-test-files](https://github.com/rojo-rbx/rbx-test-files)

*Not affiliated with or endorsed by Roblox Corporation. Roblox and Roblox Studio are trademarks of Roblox Corporation.*
