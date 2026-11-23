// three.js preview of BaseParts in an IR tree, with a tiny orbit camera.
'use strict';
(function () {
  const RBX = window.RBX;

  function wedgeGeometry(corner) {
    const g = new THREE.BufferGeometry();
    let v;
    if (!corner) {
      // bottom rectangle + top edge at the back (+Z); slope faces front (-Z) and up
      const p = [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5]];
      const f = [[0, 2, 1], [0, 3, 2], [3, 5, 2], [3, 4, 5], [0, 1, 5], [0, 5, 4], [0, 4, 3], [1, 2, 5]];
      v = f.flatMap((t) => t.flatMap((i) => p[i]));
    } else {
      const p = [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5], [0.5, 0.5, -0.5]];
      const f = [[0, 2, 1], [0, 3, 2], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
      v = f.flatMap((t) => t.flatMap((i) => p[i]));
    }
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    return g;
  }

  class Preview {
    constructor(container) {
      this.el = container;
      this.ready = typeof THREE !== 'undefined';
      if (!this.ready) { container.innerHTML = '<div class="pv-empty">3D preview unavailable (three.js didn\'t load — are you offline?)</div>'; return; }
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(this.renderer.domElement);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20000);
      this.scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x3a3328, 0.85));
      const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(0.5, 1, 0.35); this.scene.add(sun);
      this.group = new THREE.Group(); this.scene.add(this.group);
      this.grid = new THREE.GridHelper(200, 50, 0x3a4256, 0x262c3a); this.scene.add(this.grid);
      this.geo = { box: new THREE.BoxGeometry(1, 1, 1), ball: new THREE.SphereGeometry(0.5, 24, 16), cyl: new THREE.CylinderGeometry(0.5, 0.5, 1, 24), wedge: wedgeGeometry(false), corner: wedgeGeometry(true) };
      this.yaw = Math.PI - 0.55; this.pitch = 0.45; this.dist = 30; this.target = new THREE.Vector3(); // camera starts at the model's front (-Z)
      this.bindControls();
      new ResizeObserver(() => this.resize()).observe(container);
      this.resize();
      this.empty = document.createElement('div'); this.empty.className = 'pv-empty'; container.appendChild(this.empty);
      this.setRoots([]);
    }
    bindControls() {
      const c = this.renderer.domElement; let drag = null;
      c.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, pan: e.button === 2 || e.shiftKey }; c.setPointerCapture(e.pointerId); });
      c.addEventListener('pointermove', (e) => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
        if (drag.pan) {
          const s = this.dist * 0.0018;
          const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0), up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1);
          this.target.addScaledVector(right, -dx * s).addScaledVector(up, dy * s);
        } else { this.yaw -= dx * 0.008; this.pitch = Math.max(-1.5, Math.min(1.5, this.pitch + dy * 0.008)); }
        this.render();
      });
      c.addEventListener('pointerup', () => (drag = null));
      c.addEventListener('contextmenu', (e) => e.preventDefault());
      c.addEventListener('wheel', (e) => { e.preventDefault(); this.dist *= Math.exp(e.deltaY * 0.0012); this.render(); }, { passive: false });
    }
    resize() {
      const w = this.el.clientWidth || 300, h = this.el.clientHeight || 300;
      this.renderer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); this.render();
    }
    setRoots(roots) {
      if (!this.ready) return;
      while (this.group.children.length) { const m = this.group.children.pop(); if (m.material) m.material.dispose(); }
      let count = 0;
      const box = new THREE.Box3();
      RBX.walk(roots, (inst) => {
        if (!RBX.BASEPART.has(inst.cls)) return;
        const P = inst.props;
        const size = P.Size && P.Size.t === 'Vector3' ? P.Size.v : [4, 1, 2];
        const cf = P.CFrame ? P.CFrame.v : RBX.math.IDENT;
        let color = P.Color && P.Color.t === 'Color3' ? P.Color.v : P.BrickColor ? RBX.brickColorRGB(P.BrickColor.v) : [0.64, 0.635, 0.647];
        const transparency = P.Transparency ? P.Transparency.v : 0;
        if (transparency >= 0.999) return;
        const mat = P.Material ? P.Material.v : 256;
        let geo = this.geo.box, sx = size[0], sy = size[1], sz = size[2], rotZ = false;
        const shape = P.Shape ? P.Shape.v : 1;
        if (inst.cls === 'WedgePart' || (RBX.PARTLIKE.has(inst.cls) && shape === 3)) geo = this.geo.wedge;
        else if (inst.cls === 'CornerWedgePart' || (RBX.PARTLIKE.has(inst.cls) && shape === 4)) geo = this.geo.corner;
        else if (RBX.PARTLIKE.has(inst.cls) && shape === 0) { geo = this.geo.ball; sx = sy = sz = Math.min(...size); }
        else if (RBX.PARTLIKE.has(inst.cls) && shape === 2) { geo = this.geo.cyl; const r = Math.min(size[1], size[2]); sx = r; sy = size[0]; sz = r; rotZ = true; }
        // SpecialMesh "Sphere" turns a part into an ellipsoid that fills its size (times Scale)
        const sm = inst.children.find((c) => c.cls === 'SpecialMesh');
        if (sm && sm.props.MeshType && sm.props.MeshType.v === 3) {
          const sc = sm.props.Scale && sm.props.Scale.t === 'Vector3' ? sm.props.Scale.v : [1, 1, 1];
          geo = this.geo.ball; sx = size[0] * sc[0]; sy = size[1] * sc[1]; sz = size[2] * sc[2]; rotZ = false;
        }
        const isMesh = inst.cls === 'MeshPart' || inst.cls.endsWith('Operation');
        const material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color[0], color[1], color[2]),
          roughness: mat === 1088 || mat === 1072 || mat === 1056 ? 0.35 : mat === 1568 ? 0.05 : 0.75,
          metalness: mat === 1088 || mat === 1072 || mat === 1056 || mat === 1040 ? 0.6 : 0,
          transparent: transparency > 0 || mat === 1568 || isMesh, opacity: Math.min(1 - transparency, mat === 1568 ? 0.55 : 1, isMesh ? 0.7 : 1),
          emissive: mat === 288 ? new THREE.Color(color[0], color[1], color[2]) : new THREE.Color(0), emissiveIntensity: mat === 288 ? 0.9 : 0,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, material);
        const m4 = new THREE.Matrix4().set(cf[3], cf[4], cf[5], cf[0], cf[6], cf[7], cf[8], cf[1], cf[9], cf[10], cf[11], cf[2], 0, 0, 0, 1);
        if (rotZ) m4.multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        m4.multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
        mesh.matrixAutoUpdate = false; mesh.matrix.copy(m4);
        mesh.userData.inst = inst;
        this.group.add(mesh);
        mesh.updateMatrixWorld(true);
        box.expandByObject(mesh);
        count++;
      });
      this.count = count;
      this.empty.textContent = count ? '' : 'No parts to preview';
      this.empty.style.display = count ? 'none' : '';
      if (count) {
        box.getCenter(this.target);
        const s = box.getSize(new THREE.Vector3()).length();
        this.dist = Math.max(6, s * 1.25);
        this.grid.position.y = box.min.y - 0.01;
        const gs = Math.max(50, Math.ceil(s * 2 / 10) * 10);
        this.grid.scale.setScalar(gs / 200);
        this.grid.position.x = this.target.x; this.grid.position.z = this.target.z;
      } else { this.target.set(0, 0, 0); this.dist = 30; this.grid.position.set(0, 0, 0); this.grid.scale.setScalar(1); }
      this.render();
    }
    render() {
      if (!this.ready) return;
      const c = Math.cos(this.pitch);
      this.camera.position.set(this.target.x + this.dist * c * Math.sin(this.yaw), this.target.y + this.dist * Math.sin(this.pitch), this.target.z + this.dist * c * Math.cos(this.yaw));
      this.camera.near = Math.max(0.05, this.dist / 1000); this.camera.far = this.dist * 100; this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.target);
      this.renderer.render(this.scene, this.camera);
    }
  }
  RBX.Preview = Preview;
})();
