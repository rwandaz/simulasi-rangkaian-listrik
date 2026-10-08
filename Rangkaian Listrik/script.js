/**
 * Simulasi Rangkaian Listrik Cilik - by Pak Rwanda
 * Fitur & Mekanisme Fisik:
 * - Kabel sebagai komponen fisik mandiri (stretchable & rotatable)
 * - Sistem Magnet (Snap & Merge) ujung lingkaran merah -> lingkaran hitam
 * - Gunting tepat di titik sambungan
 * - Aliran Elektron Biru bermuatan (-)
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. Web Audio API Synthesizer
  // ==========================================================================
  class SoundFX {
    constructor() {
      this.enabled = true;
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playClick() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    // Magnetic snap sound (Klek!)
    playSnap() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    }

    playChime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.35);
      });
    }

    playBuzz() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    }

    playCut() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(260, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    }

    playFanfare() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const start = this.ctx.currentTime + idx * 0.12;
        const dur = idx === 3 ? 0.5 : 0.15;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + dur);
      });
    }
  }

  // ==========================================================================
  // 2. Constants & Component Definitions
  // ==========================================================================
  const SNAP_DISTANCE = 28; // Distance in pixels to trigger magnetic snap

  const COMPONENT_DEFAULTS = {
    wire: { title: 'Kabel', defaultLen: 110, isFlexible: true, isConductor: true },
    battery: { title: 'Baterai 1.5V', defaultLen: 120, isFlexible: false, isSource: true },
    bulb: { title: 'Lampu Bohlam', defaultLen: 100, isFlexible: false, isLoad: true },
    switch: { title: 'Saklar', defaultLen: 110, isFlexible: false },
    nail: { title: 'Paku Besi', defaultLen: 100, isFlexible: false, isConductor: true, icon: '🔩' },
    coin: { title: 'Koin Emas', defaultLen: 80, isFlexible: false, isConductor: true, icon: '🪙' },
    eraser: { title: 'Penghapus', defaultLen: 95, isFlexible: false, isConductor: false, icon: '🧹' },
    ruler: { title: 'Penggaris', defaultLen: 110, isFlexible: false, isConductor: false, icon: '📏' },
    dinamo: { title: 'Dinamo Motor', defaultLen: 110, isFlexible: false, isConductor: true, isLoad: true, icon: '⚙️' },
    solar: { title: 'Panel Surya', defaultLen: 125, isFlexible: false, isSource: true, icon: '☀️' },
    ammeter: { title: 'Amperemeter', defaultLen: 100, isFlexible: false, isConductor: true, icon: '🎛️' },
    voltmeter: { title: 'Voltmeter', defaultLen: 100, isFlexible: false, isConductor: true, icon: '📟' }
  };

  const MISSIONS = [
    {
      id: 1,
      badge: 'Misi 1',
      title: 'Nyalakan Satu Lampu!',
      instruction: 'Hubungkan kabel dari baterai ke bohlam agar menyala terang!',
      check: (app) => {
        const bulbs = app.components.filter(c => c.type === 'bulb' && c.litState === 'lit');
        return bulbs.length >= 1;
      }
    },
    {
      id: 2,
      badge: 'Misi 2',
      title: 'Kendalikan dengan Saklar',
      instruction: 'Pasang saklar di jalur kabel lampu, lalu nyalakan saklar (ON) agar lampu menyala!',
      check: (app) => {
        const switchActive = app.components.some(c => c.type === 'switch' && c.isConducting && c.state === 'closed');
        const bulbLit = app.components.some(c => c.type === 'bulb' && c.litState !== 'off');
        return switchActive && bulbLit;
      }
    },
    {
      id: 3,
      badge: 'Misi 3',
      title: 'Rangkaian Seri (2 Lampu)',
      instruction: 'Pasang 2 lampu bersambung (seri) dalam 1 jalur. Perhatikan nyalanya menjadi redup!',
      check: (app) => {
        const dimBulbs = app.components.filter(c => c.type === 'bulb' && c.litState === 'dim');
        return dimBulbs.length >= 2;
      }
    },
    {
      id: 4,
      badge: 'Misi 4',
      title: 'Detektif Konduktor Listrik',
      instruction: 'Pasang Paku Besi atau Koin Logam ke dalam rangkaian hingga lampu menyala!',
      check: (app) => {
        const condActive = app.components.some(c => (c.type === 'nail' || c.type === 'coin') && c.isConducting);
        const bulbLit = app.components.some(c => c.type === 'bulb' && c.litState !== 'off');
        return condActive && bulbLit;
      }
    },
    {
      id: 5,
      badge: 'Misi 5',
      title: 'Putar Baling-Baling Dinamo!',
      instruction: 'Hubungkan kabel dari sumber listrik ke Dinamo Motor hingga baling-balingnya berputar kencang!',
      check: (app) => {
        return app.components.some(c => c.type === 'dinamo' && c.isConducting);
      }
    },
    {
      id: 6,
      badge: 'Misi 6',
      title: 'Energi Hijau Panel Surya!',
      instruction: 'Nyalakan lampu atau putar dinamo menggunakan Panel Surya sebagai sumber listrik terbarukan!',
      check: (app) => {
        const solarActive = app.components.some(c => c.type === 'solar' && c.isConducting);
        const loadActive = app.components.some(c => (c.type === 'bulb' && c.litState !== 'off') || (c.type === 'dinamo' && c.isConducting));
        return solarActive && loadActive;
      }
    }
  ];

  // ==========================================================================
  // 3. Circuit Simulator Application Class
  // ==========================================================================
  class CircuitSimApp {
    constructor() {
      this.sound = new SoundFX();
      this.vertices = new Map(); // id -> { id, x, y }
      this.components = []; // Array of component segment objects
      this.selectedComponentId = null;
      this.activeJunctionVertexId = null; // Vertex showing scissors tool
      this.flowMode = 'electrons'; // 'electrons' | 'current' | 'none'
      this.circuitVoltage = 1.5;
      this.currentMode = 'sandbox';
      this.currentMissionIdx = 0;
      this.missionCompleted = {};

      // DOM Elements
      this.workbench = document.getElementById('workbench');
      this.svg = document.getElementById('circuit-svg');
      this.viewportGroup = document.getElementById('viewport-group');
      this.componentsGroup = document.getElementById('components-group');
      this.electronsGroup = document.getElementById('electrons-group');
      this.verticesGroup = document.getElementById('vertices-group');
      this.snapHalo = document.getElementById('snap-halo');
      this.scissorsContainer = document.getElementById('junction-scissors');
      this.compActionsContainer = document.getElementById('component-actions');
      this.batterySpecPopup = document.getElementById('battery-spec-popup');
      this.selectionToolbar = document.getElementById('selection-toolbar');
      this.dragGhost = document.getElementById('drag-ghost');
      this.statusToast = document.getElementById('status-toast');
      this.statusMsg = document.getElementById('status-msg');
      this.statusIcon = document.getElementById('status-icon');
      this.fxOverlay = document.getElementById('fx-overlay');
      this.zoomLevelDisplay = document.getElementById('zoom-level-display');

      // Floating Meter Tools Elements
      this.meterWiresGroup = document.getElementById('meter-wires-group');
      this.floatingVoltmeter = document.getElementById('floating-voltmeter');
      this.vmProbeRed = document.getElementById('vm-probe-red');
      this.vmProbeBlack = document.getElementById('vm-probe-black');
      this.floatingAmmeter = document.getElementById('floating-ammeter');
      this.amProbeSensor = document.getElementById('am-probe-sensor');

      this.isVoltmeterActive = false;
      this.isAmmeterActive = false;

      // Positions in workbench container pixel coords
      this.voltmeterPos = { x: 100, y: 55 };
      this.vmProbeRedPos = { x: 190, y: 190 };
      this.vmProbeBlackPos = { x: 65, y: 190 };

      this.ammeterPos = { x: 300, y: 55 };
      this.amProbeSensorPos = { x: 350, y: 190 };

      this.vertexPotentials = new Map(); // vId -> volts

      // Interaction Drag & Zoom/Pan State
      this.dragState = null;
      this.electronAnimOffset = 0;
      this.zoomScale = 1.0;
      this.panX = 0;
      this.panY = 0;
      this.isPanning = false;
      this.panStartX = 0;
      this.panStartY = 0;
      this.touchPinchDistance = null;
      this.touchPinchScale = 1.0;

      this.initLoadingScreen();
      this.initEvents();
      this.startAnimationLoop();
      this.loadInitialPreset();
    }

    // ==========================================================================
    // Viewport Zoom & Pan Coordinate Transforms
    // ==========================================================================
    screenToWorld(clientX, clientY) {
      const rect = this.workbench.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return {
        x: (sx - this.panX) / this.zoomScale,
        y: (sy - this.panY) / this.zoomScale
      };
    }

    worldToScreen(wx, wy) {
      return {
        x: wx * this.zoomScale + this.panX,
        y: wy * this.zoomScale + this.panY
      };
    }

    containerToWorld(cx, cy) {
      return {
        x: (cx - this.panX) / this.zoomScale,
        y: (cy - this.panY) / this.zoomScale
      };
    }

    applyViewportTransform() {
      if (this.viewportGroup) {
        this.viewportGroup.setAttribute('transform', `translate(${this.panX}, ${this.panY}) scale(${this.zoomScale})`);
      }
      if (this.zoomLevelDisplay) {
        this.zoomLevelDisplay.textContent = `${Math.round(this.zoomScale * 100)}%`;
      }
      if (this.activeJunctionVertexId) {
        this.showScissors(this.activeJunctionVertexId);
      }
      if (this.selectedComponentId) {
        this.updateComponentActionsPosition();
      }
      this.renderMeterWires();
      this.updateMeterReadouts();
    }

    zoomAt(clientX, clientY, factor) {
      const rect = this.workbench.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const oldScale = this.zoomScale;
      const newScale = Math.min(3.0, Math.max(0.4, oldScale * factor));
      if (Math.abs(newScale - oldScale) < 0.001) return;

      // Keep the point under cursor invariant
      this.panX = sx - (sx - this.panX) * (newScale / oldScale);
      this.panY = sy - (sy - this.panY) * (newScale / oldScale);
      this.zoomScale = newScale;
      this.applyViewportTransform();
    }

    zoomIn() {
      const rect = this.workbench.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.zoomAt(cx, cy, 1.25);
    }

    zoomOut() {
      const rect = this.workbench.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      this.zoomAt(cx, cy, 0.8);
    }

    resetZoom() {
      this.zoomScale = 1.0;
      this.panX = 0;
      this.panY = 0;
      this.applyViewportTransform();
      this.showToast('Tampilan kembali ke 100% 🔍', 'normal');
    }

    // ==========================================================================
    // 4. Initial Setup & UI Listeners
    // ==========================================================================
    initEvents() {
      // 1. Toolbox Pointer Drag-and-Drop + Tap to Spawn
      let trayDragState = null;
      document.querySelectorAll('.tray-item').forEach(item => {
        const type = item.getAttribute('data-type');
        item.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          trayDragState = {
            type,
            startX: e.clientX,
            startY: e.clientY,
            hasMoved: false
          };
        });
      });

      // Canvas Background Pan by Dragging
      this.workbench.addEventListener('pointerdown', (e) => {
        if (e.target === this.svg || e.target === this.workbench || e.target.id === 'viewport-group' || e.target.id === 'circuit-svg') {
          this.isPanning = true;
          this.panStartX = e.clientX - this.panX;
          this.panStartY = e.clientY - this.panY;
          this.workbench.classList.add('panning');
          this.hideScissors();
        }
      });

      window.addEventListener('pointermove', (e) => {
        if (this.isPanning) {
          this.panX = e.clientX - this.panStartX;
          this.panY = e.clientY - this.panStartY;
          this.applyViewportTransform();
          return;
        }

        if (!trayDragState) return;
        const dist = Math.hypot(e.clientX - trayDragState.startX, e.clientY - trayDragState.startY);
        if (dist > 8 && !trayDragState.hasMoved) {
          trayDragState.hasMoved = true;
          this.showDragGhost(trayDragState.type, e.clientX, e.clientY);
        }
        if (trayDragState.hasMoved) {
          this.updateDragGhost(e.clientX, e.clientY);
        }
      });

      window.addEventListener('pointerup', (e) => {
        if (this.isPanning) {
          this.isPanning = false;
          this.workbench.classList.remove('panning');
        }

        if (!trayDragState) return;
        if (trayDragState.hasMoved) {
          const rect = this.workbench.getBoundingClientRect();
          if (e.clientX >= rect.left && e.clientX <= rect.right &&
              e.clientY >= rect.top && e.clientY <= rect.bottom) {
            const worldPos = this.screenToWorld(e.clientX, e.clientY);
            this.spawnComponentAt(trayDragState.type, worldPos.x, worldPos.y);
            this.sound.playClick();
            this.showToast('Komponen diletakkan di papan kerja! 🎯', 'normal');
          }
          this.hideDragGhost();
        } else {
          // Tap / click without movement
          this.spawnComponentCenter(trayDragState.type);
          this.sound.playClick();
        }
        trayDragState = null;
      });

      // Wheel Zoom on Canvas
      this.workbench.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 0.87;
        this.zoomAt(e.clientX, e.clientY, factor);
      }, { passive: false });

      // Touch Pinch Gestures on Canvas
      this.workbench.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          this.touchPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          this.touchPinchScale = this.zoomScale;
        }
      }, { passive: false });

      this.workbench.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && this.touchPinchDistance) {
          e.preventDefault();
          const t1 = e.touches[0];
          const t2 = e.touches[1];
          const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
          const currentCenter = {
            x: (t1.clientX + t2.clientX) / 2,
            y: (t1.clientY + t2.clientY) / 2
          };
          const factor = dist / this.touchPinchDistance;
          const oldScale = this.touchPinchScale;
          const newScale = Math.min(3.0, Math.max(0.4, oldScale * factor));

          const rect = this.workbench.getBoundingClientRect();
          const sx = currentCenter.x - rect.left;
          const sy = currentCenter.y - rect.top;

          this.panX = sx - (sx - this.panX) * (newScale / this.zoomScale);
          this.panY = sy - (sy - this.panY) * (newScale / this.zoomScale);
          this.zoomScale = newScale;
          this.applyViewportTransform();
        }
      }, { passive: false });

      this.workbench.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) {
          this.touchPinchDistance = null;
        }
      });

      // Canvas Zoom Control & Clear Buttons (+, Reset, -, Clear)
      const bottomBar = document.getElementById('workbench-bottom-bar');
      if (bottomBar) {
        bottomBar.addEventListener('pointerdown', (e) => e.stopPropagation());
        bottomBar.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
        bottomBar.addEventListener('mousedown', (e) => e.stopPropagation());
      }

      const btnZoomIn = document.getElementById('btn-zoom-in');
      if (btnZoomIn) {
        btnZoomIn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.zoomIn();
        });
      }

      const btnZoomOut = document.getElementById('btn-zoom-out');
      if (btnZoomOut) {
        btnZoomOut.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.zoomOut();
        });
      }

      const btnZoomReset = document.getElementById('btn-zoom-reset');
      if (btnZoomReset) {
        btnZoomReset.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.resetZoom();
        });
      }

      // 2. Clear Workbench
      const btnClear = document.getElementById('btn-clear');
      if (btnClear) {
        btnClear.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (this.components.length === 0) {
            this.showToast('Papan kerja sudah bersih!', 'normal');
            return;
          }
          this.clearAll();
          this.sound.playCut();
          this.showToast('Papan kerja telah dibersihkan! 🧹', 'normal');
        });
      }

      // 3. Scissors button at junction
      const btnCut = document.getElementById('btn-junction-cut');
      const handleCut = (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (this.activeJunctionVertexId) {
          this.splitJunction(this.activeJunctionVertexId);
        }
      };
      btnCut.addEventListener('click', handleCut);
      btnCut.addEventListener('pointerdown', (e) => e.stopPropagation());

      // 4. Floating Rotate 90° Buttons (Floating Action & Toolbar)
      const handleRotate = (e) => {
        e.stopPropagation();
        if (this.selectedComponentId) {
          const comp = this.components.find(c => c.id === this.selectedComponentId);
          if (comp) {
            this.rotateComponent90(comp);
            this.showToast('Komponen diputar 90° 🔄', 'normal');
          }
        }
      };
      const btnCompRotate = document.getElementById('btn-comp-rotate');
      if (btnCompRotate) btnCompRotate.addEventListener('click', handleRotate);
      const btnRotateToolbar = document.getElementById('btn-rotate-toolbar');
      if (btnRotateToolbar) btnRotateToolbar.addEventListener('click', handleRotate);

      // 5. Battery & Solar Spec Button & Popup Controls
      const btnCompSpec = document.getElementById('btn-comp-spec');
      if (btnCompSpec) {
        btnCompSpec.addEventListener('click', (e) => {
          e.stopPropagation();
          const comp = this.components.find(c => c.id === this.selectedComponentId);
          if (comp && (comp.type === 'battery' || comp.type === 'solar')) {
            if (this.batterySpecPopup.classList.contains('hidden')) {
              this.showBatterySpec(comp);
            } else {
              this.hideBatterySpec();
            }
          }
        });
      }

      const btnCloseSpec = document.getElementById('btn-close-spec');
      if (btnCloseSpec) {
        btnCloseSpec.addEventListener('click', (e) => {
          e.stopPropagation();
          this.hideBatterySpec();
        });
      }

      const sliderVolt = document.getElementById('slider-voltage');
      if (sliderVolt) {
        sliderVolt.addEventListener('input', (e) => {
          this.setBatteryVoltage(parseFloat(e.target.value));
        });
      }

      const btnVoltMinus = document.getElementById('btn-volt-minus');
      if (btnVoltMinus) {
        btnVoltMinus.addEventListener('click', (e) => {
          e.stopPropagation();
          const comp = this.components.find(c => c.id === this.selectedComponentId);
          if (comp && (comp.type === 'battery' || comp.type === 'solar')) {
            const step = comp.type === 'solar' ? 1.0 : 1.5;
            const currentV = comp.voltage !== undefined ? comp.voltage : (comp.type === 'solar' ? 3.0 : 1.5);
            this.setBatteryVoltage(Math.max(0, currentV - step));
          }
        });
      }

      const btnVoltPlus = document.getElementById('btn-volt-plus');
      if (btnVoltPlus) {
        btnVoltPlus.addEventListener('click', (e) => {
          e.stopPropagation();
          const comp = this.components.find(c => c.id === this.selectedComponentId);
          if (comp && (comp.type === 'battery' || comp.type === 'solar')) {
            const step = comp.type === 'solar' ? 1.0 : 1.5;
            const currentV = comp.voltage !== undefined ? comp.voltage : (comp.type === 'solar' ? 3.0 : 1.5);
            this.setBatteryVoltage(Math.min(24, currentV + step));
          }
        });
      }

      // 6. Delete selected component button & Deselect button
      const handleDelete = (e) => {
        e.stopPropagation();
        if (this.selectedComponentId) {
          this.removeComponent(this.selectedComponentId);
          this.selectedComponentId = null;
          this.updateSelectionToolbar();
          this.updateComponentActionsPosition();
          this.sound.playCut();
          this.showToast('Komponen dihapus! 🗑️', 'normal');
        }
      };
      document.getElementById('btn-delete-selected').addEventListener('click', handleDelete);
      const btnCompDelete = document.getElementById('btn-comp-delete');
      if (btnCompDelete) btnCompDelete.addEventListener('click', handleDelete);

      const btnDeselect = document.getElementById('btn-deselect');
      if (btnDeselect) {
        btnDeselect.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectedComponentId = null;
          this.updateSelectionToolbar();
          this.updateComponentActionsPosition();
          this.render();
        });
      }

      // 7. Flow Mode Switcher: Elektron vs Arus vs Mati
      const btnFlowElec = document.getElementById('btn-flow-electrons');
      const btnFlowCurr = document.getElementById('btn-flow-current');
      const btnFlowOff = document.getElementById('btn-flow-off');

      this.setFlowMode = (mode) => {
        this.flowMode = mode;
        if (btnFlowElec) btnFlowElec.classList.toggle('active', mode === 'electrons');
        if (btnFlowCurr) btnFlowCurr.classList.toggle('active', mode === 'current');
        if (btnFlowOff) btnFlowOff.classList.toggle('active', mode === 'none');

        if (mode === 'electrons') {
          this.showToast('Menampilkan Aliran Elektron (− ke +) ⊖', 'normal');
        } else if (mode === 'current') {
          this.showToast('Menampilkan Arus Konvensional (+ ke −) ➔', 'normal');
        } else {
          if (this.electronsGroup) this.electronsGroup.innerHTML = '';
          this.showToast('Aliran partikel dinonaktifkan (Mati) 🚫', 'normal');
        }
      };

      if (btnFlowElec) {
        btnFlowElec.addEventListener('click', () => {
          this.setFlowMode(this.flowMode === 'electrons' ? 'none' : 'electrons');
        });
      }
      if (btnFlowCurr) {
        btnFlowCurr.addEventListener('click', () => {
          this.setFlowMode(this.flowMode === 'current' ? 'none' : 'current');
        });
      }
      if (btnFlowOff) {
        btnFlowOff.addEventListener('click', () => {
          this.setFlowMode('none');
        });
      }

      // 7.5 Meter Tools (Voltmeter & Amperemeter Probes)
      const btnToggleVm = document.getElementById('btn-toggle-voltmeter');
      const btnToggleAm = document.getElementById('btn-toggle-ammeter');
      const btnCloseVm = document.getElementById('btn-close-vm');
      const btnCloseAm = document.getElementById('btn-close-am');

      // Right-side instruments dock elements
      const cardDockVm = document.getElementById('card-dock-vm');
      const checkDockVm = document.getElementById('check-dock-vm');
      const cardDockAm = document.getElementById('card-dock-am');
      const checkDockAm = document.getElementById('check-dock-am');

      if (btnToggleVm) {
        btnToggleVm.addEventListener('click', () => {
          this.toggleVoltmeter(!this.isVoltmeterActive);
        });
      }
      if (checkDockVm) {
        checkDockVm.addEventListener('change', () => {
          this.toggleVoltmeter(checkDockVm.checked);
        });
      }
      if (cardDockVm) {
        cardDockVm.addEventListener('click', (e) => {
          if (e.target !== checkDockVm) {
            this.toggleVoltmeter(!this.isVoltmeterActive);
          }
        });
      }
      if (btnCloseVm) {
        btnCloseVm.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleVoltmeter(false);
        });
      }

      if (btnToggleAm) {
        btnToggleAm.addEventListener('click', () => {
          this.toggleAmmeter(!this.isAmmeterActive);
        });
      }
      if (checkDockAm) {
        checkDockAm.addEventListener('change', () => {
          this.toggleAmmeter(checkDockAm.checked);
        });
      }
      if (cardDockAm) {
        cardDockAm.addEventListener('click', (e) => {
          if (e.target !== checkDockAm) {
            this.toggleAmmeter(!this.isAmmeterActive);
          }
        });
      }
      if (btnCloseAm) {
        btnCloseAm.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleAmmeter(false);
        });
      }

      // Drag handles for floating meters & probes
      const vmDragHandle = document.getElementById('vm-drag-handle');
      if (vmDragHandle) {
        vmDragHandle.addEventListener('pointerdown', (e) => this.startMeterWidgetDrag('voltmeter', e));
      }
      if (this.vmProbeRed) {
        this.vmProbeRed.addEventListener('pointerdown', (e) => this.startProbeDrag('vm_red', e));
      }
      if (this.vmProbeBlack) {
        this.vmProbeBlack.addEventListener('pointerdown', (e) => this.startProbeDrag('vm_black', e));
      }

      const amDragHandle = document.getElementById('am-drag-handle');
      if (amDragHandle) {
        amDragHandle.addEventListener('pointerdown', (e) => this.startMeterWidgetDrag('ammeter', e));
      }
      if (this.amProbeSensor) {
        this.amProbeSensor.addEventListener('pointerdown', (e) => this.startProbeDrag('am_sensor', e));
      }

      // 8. Header buttons: Sound, Help, Fullscreen
      const btnSound = document.getElementById('btn-sound');
      btnSound.addEventListener('click', () => {
        const on = this.sound.toggle();
        btnSound.textContent = on ? '🔊' : '🔇';
      });

      const btnHelp = document.getElementById('btn-help');
      const modalHelp = document.getElementById('modal-help');
      const btnCloseHelp = document.getElementById('btn-close-help');
      const btnModalOk = document.getElementById('btn-modal-ok');
      const toggleHelp = (show) => modalHelp.classList.toggle('hidden', !show);
      btnHelp.addEventListener('click', () => toggleHelp(true));
      btnCloseHelp.addEventListener('click', () => toggleHelp(false));
      btnModalOk.addEventListener('click', () => toggleHelp(false));

      document.getElementById('btn-next-mission-modal').addEventListener('click', () => {
        document.getElementById('modal-success').classList.add('hidden');
        this.nextMission();
      });

      document.getElementById('btn-fullscreen').addEventListener('click', () => {
        this.toggleFullscreen();
      });

      // Tabs: Sandbox vs Missions
      const tabSandbox = document.getElementById('tab-sandbox');
      const tabMissions = document.getElementById('tab-missions');
      const missionBar = document.getElementById('mission-bar');

      tabSandbox.addEventListener('click', () => {
        this.currentMode = 'sandbox';
        tabSandbox.classList.add('active');
        tabMissions.classList.remove('active');
        missionBar.classList.add('hidden');
        this.showToast('Mode Lab Bebas aktif! 🛠️', 'normal');
      });

      tabMissions.addEventListener('click', () => {
        this.currentMode = 'missions';
        tabMissions.classList.add('active');
        tabSandbox.classList.remove('active');
        missionBar.classList.remove('hidden');
        this.updateMissionUI();
        this.showToast('Mode Misi Edukasi aktif! 🏆', 'normal');
      });

      document.getElementById('btn-prev-mission').addEventListener('click', () => {
        if (this.currentMissionIdx > 0) {
          this.currentMissionIdx--;
          this.updateMissionUI();
        }
      });
      document.getElementById('btn-next-mission').addEventListener('click', () => {
        this.nextMission();
      });

      // Global Pointer Events for Drag & Drop
      window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
      window.addEventListener('pointerup', (e) => this.onPointerUp(e));
      window.addEventListener('pointercancel', (e) => this.onPointerUp(e));

      // Workbench canvas tap deselects
      this.workbench.addEventListener('pointerdown', (e) => {
        if (e.target === this.workbench || e.target === this.svg) {
          this.hideScissors();
          this.hideBatterySpec();
          this.selectedComponentId = null;
          this.updateSelectionToolbar();
          this.updateComponentActionsPosition();
          this.render();
        }
      });
    }

    toggleFullscreen() {
      const elem = document.documentElement;
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }

    // ==========================================================================
    // 5. Component & Vertex Management
    // ==========================================================================
    createVertex(x, y) {
      const id = 'v_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const v = { id, x: Math.round(x), y: Math.round(y) };
      this.vertices.set(id, v);
      return v;
    }

    spawnComponent(type, x1, y1, x2, y2) {
      const v1 = this.createVertex(x1, y1);
      const v2 = this.createVertex(x2, y2);

      const id = 'comp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const def = COMPONENT_DEFAULTS[type] || COMPONENT_DEFAULTS.wire;

      const comp = {
        id,
        type,
        v1Id: v1.id,
        v2Id: v2.id,
        def,
        voltage: type === 'battery' ? 1.5 : (type === 'solar' ? 3.0 : 0),
        state: type === 'switch' ? 'closed' : 'default',
        litState: 'off',
        isConducting: false,
        spinAngle: 0,
        measuredCurrent: 0,
        measuredVoltage: 0
      };

      this.components.push(comp);
      this.render();
      this.updateSimulation();
      return comp;
    }

    spawnComponentAt(type, cx, cy) {
      const def = COMPONENT_DEFAULTS[type] || COMPONENT_DEFAULTS.wire;
      const len = def.defaultLen;

      const x1 = cx - len / 2;
      const y1 = cy;
      const x2 = cx + len / 2;
      const y2 = cy;

      const comp = this.spawnComponent(type, x1, y1, x2, y2);
      this.selectedComponentId = comp.id;
      this.updateSelectionToolbar();
      this.updateComponentActionsPosition();
      this.render();
      return comp;
    }

    spawnComponentCenter(type) {
      const rect = this.workbench.getBoundingClientRect();
      const cx = (rect.width || 500) / 2 + (Math.random() * 40 - 20);
      const cy = (rect.height || 400) / 2 + (Math.random() * 40 - 20);
      const worldPos = this.screenToWorld(rect.left + cx, rect.top + cy);
      return this.spawnComponentAt(type, worldPos.x, worldPos.y);
    }

    showDragGhost(type, clientX, clientY) {
      const def = COMPONENT_DEFAULTS[type] || COMPONENT_DEFAULTS.wire;
      const icon = def.icon || (type === 'battery' ? '🔋' : type === 'bulb' ? '💡' : type === 'switch' ? '⏻' : type === 'dinamo' ? '⚙️' : type === 'solar' ? '☀️' : type === 'ammeter' ? '🎛️' : type === 'voltmeter' ? '📟' : '🔌');
      this.dragGhost.innerHTML = `<span>${icon}</span> <span>${def.title}</span>`;
      this.dragGhost.style.left = `${clientX}px`;
      this.dragGhost.style.top = `${clientY}px`;
      this.dragGhost.classList.remove('hidden');
    }

    updateDragGhost(clientX, clientY) {
      this.dragGhost.style.left = `${clientX}px`;
      this.dragGhost.style.top = `${clientY}px`;
    }

    hideDragGhost() {
      this.dragGhost.classList.add('hidden');
    }

    // Rotasi 90 Derajat untuk komponen terpilih
    rotateComponent90(comp) {
      if (!comp) return;
      const v1 = this.vertices.get(comp.v1Id);
      const v2 = this.vertices.get(comp.v2Id);
      if (!v1 || !v2) return;

      const v1Connected = this.components.filter(c => c.v1Id === v1.id || c.v2Id === v1.id).length;
      const v2Connected = this.components.filter(c => c.v1Id === v2.id || c.v2Id === v2.id).length;

      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const len = comp.def && !comp.def.isFlexible ? comp.def.defaultLen : Math.hypot(dx, dy);

      const currentAngle = Math.atan2(dy, dx);
      // Pindah ke kuadran 90 derajat berikutnya
      const nextQuadrant = Math.round(currentAngle / (Math.PI / 2)) + 1;
      const newAngle = nextQuadrant * (Math.PI / 2);

      if (v1Connected >= 2 && v2Connected <= 1) {
        // v1 tersambung ke komponen lain, putar mengitari poros v1
        v2.x = Math.round(v1.x + len * Math.cos(newAngle));
        v2.y = Math.round(v1.y + len * Math.sin(newAngle));
      } else if (v2Connected >= 2 && v1Connected <= 1) {
        // v2 tersambung ke komponen lain, putar mengitari poros v2
        v1.x = Math.round(v2.x - len * Math.cos(newAngle));
        v1.y = Math.round(v2.y - len * Math.sin(newAngle));
      } else {
        // Putar mengitari titik tengah komponen
        const cx = (v1.x + v2.x) / 2;
        const cy = (v1.y + v2.y) / 2;
        v1.x = Math.round(cx - (len / 2) * Math.cos(newAngle));
        v1.y = Math.round(cy - (len / 2) * Math.sin(newAngle));
        v2.x = Math.round(cx + (len / 2) * Math.cos(newAngle));
        v2.y = Math.round(cy + (len / 2) * Math.sin(newAngle));
      }

      this.sound.playClick();
      this.render();
      this.updateSimulation();
      this.updateComponentActionsPosition();
    }

    initLoadingScreen() {
      const screen = document.getElementById('app-loading-screen');
      if (!screen) return;
      const fill = document.getElementById('loading-progress-fill');
      const text = document.getElementById('loading-status-text');

      if (fill) fill.style.width = '45%';
      if (text) text.textContent = 'Menyiapkan Meja Kerja Fisika...';

      setTimeout(() => {
        if (fill) fill.style.width = '85%';
        if (text) text.textContent = 'Memuat Komponen & Mesin Listrik...';
      }, 250);

      setTimeout(() => {
        if (fill) fill.style.width = '100%';
        if (text) text.textContent = 'Laboratorium Siap! 🚀';
      }, 550);

      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
          if (screen.parentNode) screen.parentNode.removeChild(screen);
        }, 500);
      }, 850);
    }

    updateComponentActionsPosition() {
      if (!this.selectedComponentId) {
        this.compActionsContainer.classList.add('hidden');
        this.hideBatterySpec();
        return;
      }
      const comp = this.components.find(c => c.id === this.selectedComponentId);
      if (!comp) {
        this.compActionsContainer.classList.add('hidden');
        this.hideBatterySpec();
        return;
      }

      const v1 = this.vertices.get(comp.v1Id);
      const v2 = this.vertices.get(comp.v2Id);
      if (!v1 || !v2) return;

      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;

      // Jarak setengah tinggi petak sorotan (selection-halo) di koordinat dunia
      let haloHalfH = 26;
      if (comp.type === 'bulb') {
        haloHalfH = 48; // Kubah lampu kaca tinggi
      } else if (comp.type === 'battery' || comp.type === 'solar' || comp.type === 'dinamo') {
        haloHalfH = 42;
      } else if (comp.type === 'resistor' || comp.type === 'switch' || comp.type === 'iron_nail' || comp.type === 'gold_coin' || comp.type === 'eraser' || comp.type === 'ruler') {
        haloHalfH = 32;
      } else if (comp.type === 'voltmeter' || comp.type === 'ammeter') {
        haloHalfH = 34;
      }

      // Vektor satuan sepanjang dan tegak lurus komponen
      const dist = Math.hypot(dx, dy) || 1;
      const ux = dx / dist;
      const uy = dy / dist;
      const nx = -uy;
      const ny = ux;

      // 4 sudut petak sorotan (selection-halo bounding box) di koordinat dunia
      const pad = 12;
      const corners = [
        { x: v1.x - ux * pad - nx * haloHalfH, y: v1.y - uy * pad - ny * haloHalfH },
        { x: v1.x - ux * pad + nx * haloHalfH, y: v1.y - uy * pad + ny * haloHalfH },
        { x: v2.x + ux * pad - nx * haloHalfH, y: v2.y + uy * pad - ny * haloHalfH },
        { x: v2.x + ux * pad + nx * haloHalfH, y: v2.y + uy * pad + ny * haloHalfH }
      ];

      // Konversikan keempat sudut ke koordinat layar
      const screenCorners = corners.map(c => this.worldToScreen(c.x, c.y));
      const minScreenY = Math.min(...screenCorners.map(sc => sc.y));
      const maxScreenY = Math.max(...screenCorners.map(sc => sc.y));
      const centerScreenX = screenCorners.reduce((sum, sc) => sum + sc.x, 0) / 4;

      // Tombol action overlay memiliki tinggi 42px (setengah tinggi = 21px).
      // Berikan margin ekstra aman 44px agar tombol berada SEPENUHNYA DI LUAR petak sorotan!
      const margin = 44;
      let targetScreenY = minScreenY - margin; // Melayang di atas petak sorotan

      // Jika di atas terlalu dekat dengan header/toolbar atas (Y < 75), tempatkan di bawah petak sorotan
      if (targetScreenY < 75) {
        targetScreenY = maxScreenY + margin; // Melayang di bawah petak sorotan
      }

      // Pastikan posisi horizontal berada di area layar yang terlihat
      const screenX = Math.max(90, Math.min(window.innerWidth - 90, centerScreenX));

      this.compActionsContainer.style.left = `${screenX}px`;
      this.compActionsContainer.style.top = `${targetScreenY}px`;
      this.compActionsContainer.classList.remove('hidden');

      // Tampilkan tombol spek volt jika komponen adalah sumber daya listrik (baterai atau panel surya)
      const btnSpec = document.getElementById('btn-comp-spec');
      if (btnSpec) {
        const isPowerSource = (comp.type === 'battery' || comp.type === 'solar');
        btnSpec.style.display = isPowerSource ? 'inline-flex' : 'none';
        btnSpec.classList.toggle('hidden', !isPowerSource);
      }

      if (!this.batterySpecPopup.classList.contains('hidden')) {
        let popupY = targetScreenY < minScreenY ? targetScreenY - 65 : targetScreenY + 65;
        if (popupY < 80) popupY = maxScreenY + 65;
        this.batterySpecPopup.style.left = `${screenX}px`;
        this.batterySpecPopup.style.top = `${popupY}px`;
      }
    }

    showBatterySpec(comp) {
      if (!comp || (comp.type !== 'battery' && comp.type !== 'solar')) return;
      const titleElem = document.getElementById('spec-popup-title');
      if (titleElem) {
        titleElem.textContent = comp.type === 'solar' ? '☀️ Panel Surya' : '⚡ Atur Baterai';
      }

      const volt = comp.voltage !== undefined ? comp.voltage : (comp.type === 'solar' ? 3.0 : 1.5);
      const displayElem = document.getElementById('spec-volt-display');
      if (displayElem) displayElem.textContent = `${volt.toFixed(1)} V`;
      const sliderElem = document.getElementById('slider-voltage');
      if (sliderElem) sliderElem.value = volt;

      this.batterySpecPopup.classList.remove('hidden');
      this.updateComponentActionsPosition();
    }

    hideBatterySpec() {
      if (this.batterySpecPopup) {
        this.batterySpecPopup.classList.add('hidden');
      }
    }

    setBatteryVoltage(volt) {
      if (!this.selectedComponentId) return;
      const comp = this.components.find(c => c.id === this.selectedComponentId);
      if (!comp || (comp.type !== 'battery' && comp.type !== 'solar')) return;

      comp.voltage = Math.max(0, Math.min(24, Math.round(volt * 10) / 10));
      document.getElementById('spec-volt-display').textContent = `${comp.voltage.toFixed(1)} V`;
      document.getElementById('slider-voltage').value = comp.voltage;

      this.sound.playClick();
      this.render();
      this.updateSimulation();
    }

    // Memulai aplikasi dengan kanvas bersih dan kosong sesuai permintaan
    loadInitialPreset() {
      this.components = [];
      this.vertices.clear();
      this.selectedComponentId = null;
      this.hideScissors();
      if (this.selectionToolbar) this.selectionToolbar.classList.add('hidden');
      this.render();
      this.updateSimulation();
      this.showToast('Kanvas siap! Tarik komponen dari panel samping untuk mulai merakit ⚡', 'normal');
    }

    removeComponent(id) {
      const idx = this.components.findIndex(c => c.id === id);
      if (idx !== -1) {
        const comp = this.components[idx];
        const v1Id = comp.v1Id;
        const v2Id = comp.v2Id;
        this.components.splice(idx, 1);

        // Check if endpoints are now orphaned vertices
        this.cleanupOrphanVertex(v1Id);
        this.cleanupOrphanVertex(v2Id);

        this.hideScissors();
        this.render();
        this.updateSimulation();
      }
    }

    cleanupOrphanVertex(vId) {
      const isUsed = this.components.some(c => c.v1Id === vId || c.v2Id === vId);
      if (!isUsed) {
        this.vertices.delete(vId);
      }
    }

    clearAll() {
      this.components = [];
      this.vertices.clear();
      this.selectedComponentId = null;
      this.hideScissors();
      this.selectionToolbar.classList.add('hidden');
      this.render();
      this.updateSimulation();
    }

    // ==========================================================================
    // 6. Snapping, Merging & Scissors (Magnetic Mechanics)
    // ==========================================================================
    findSnapCandidate(movingVertexId) {
      const mv = this.vertices.get(movingVertexId);
      if (!mv) return null;

      let closestCandidate = null;
      let minDistance = SNAP_DISTANCE;

      for (const [vId, v] of this.vertices) {
        if (vId === movingVertexId) continue;
        const d = Math.hypot(mv.x - v.x, mv.y - v.y);
        if (d < minDistance) {
          minDistance = d;
          closestCandidate = v;
        }
      }
      return closestCandidate;
    }

    mergeVertices(sourceVertexId, targetVertexId) {
      if (sourceVertexId === targetVertexId) return;

      // Point all components using sourceVertexId to targetVertexId
      this.components.forEach(comp => {
        if (comp.v1Id === sourceVertexId) comp.v1Id = targetVertexId;
        if (comp.v2Id === sourceVertexId) comp.v2Id = targetVertexId;
      });

      this.vertices.delete(sourceVertexId);
      this.sound.playSnap();
    }

    updateSelectionToolbar() {
      if (!this.selectedComponentId) {
        this.selectionToolbar.classList.add('hidden');
        return;
      }
      const comp = this.components.find(c => c.id === this.selectedComponentId);
      if (!comp || !comp.def) {
        this.selectionToolbar.classList.add('hidden');
        return;
      }
      const badge = document.getElementById('selected-comp-info');
      if (badge) {
        badge.textContent = `${comp.def.icon || '⚡'} ${comp.def.title}`;
      }
      this.selectionToolbar.classList.remove('hidden');
    }

    // Split joined junction vertex using Scissors tool
    splitJunction(vertexId) {
      const connected = this.components.filter(c => c.v1Id === vertexId || c.v2Id === vertexId);
      if (connected.length <= 1) {
        this.hideScissors();
        return;
      }

      const v = this.vertices.get(vertexId);
      if (!v) {
        this.hideScissors();
        return;
      }

      // Keep the first component on vertexId, detach subsequent components to new vertices safely separated
      for (let i = 1; i < connected.length; i++) {
        const comp = connected[i];
        const isCompV1 = (comp.v1Id === vertexId);
        const otherVId = isCompV1 ? comp.v2Id : comp.v1Id;
        const otherV = this.vertices.get(otherVId);

        let newX, newY;
        if (comp.def && !comp.def.isFlexible && otherV) {
          // Rigid component: Maintain exact length, rotate slightly away from junction
          const fixedLen = comp.def.defaultLen;
          const currentAngle = Math.atan2(v.y - otherV.y, v.x - otherV.x);
          const offsetAngle = (i % 2 === 1 ? 0.35 : -0.35) * Math.ceil(i / 2);
          const newAngle = currentAngle + offsetAngle;
          newX = Math.round(otherV.x + fixedLen * Math.cos(newAngle));
          newY = Math.round(otherV.y + fixedLen * Math.sin(newAngle));
        } else if (otherV) {
          // Flexible wire: pull endpoint back towards otherV by 40px
          const wireAngle = Math.atan2(otherV.y - v.y, otherV.x - v.x);
          newX = Math.round(v.x + Math.cos(wireAngle) * 40);
          newY = Math.round(v.y + Math.sin(wireAngle) * 40);
        } else {
          const spreadAngle = (i * Math.PI) / 3;
          newX = Math.round(v.x + Math.cos(spreadAngle) * 40);
          newY = Math.round(v.y + Math.sin(spreadAngle) * 40);
        }

        const newV = this.createVertex(newX, newY);
        if (isCompV1) comp.v1Id = newV.id;
        else comp.v2Id = newV.id;
      }

      this.sound.playCut();
      this.showToast('Sambungan titik berhasil dilepas! ✂️', 'normal');
      this.hideScissors();
      this.render();
      this.updateSimulation();
    }

    showScissors(vertexId) {
      const v = this.vertices.get(vertexId);
      if (!v) return;
      this.activeJunctionVertexId = vertexId;
      const sPos = this.worldToScreen(v.x, v.y);
      this.scissorsContainer.style.left = `${sPos.x}px`;
      this.scissorsContainer.style.top = `${sPos.y}px`;
      this.scissorsContainer.classList.remove('hidden');
      this.render();
    }

    hideScissors() {
      if (!this.activeJunctionVertexId && this.scissorsContainer.classList.contains('hidden')) return;
      this.activeJunctionVertexId = null;
      this.scissorsContainer.classList.add('hidden');
      this.render();
    }

    // ==========================================================================
    // 7. Touch & Drag-and-Drop Interaction Engine
    // ==========================================================================
    startVertexDrag(vertexId, e) {
      e.stopPropagation();
      this.dragState = {
        mode: 'vertex',
        vertexId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMoved: false
      };
    }

    startComponentDrag(compId, e) {
      e.stopPropagation();
      this.hideScissors();

      const comp = this.components.find(c => c.id === compId);
      if (!comp) return;

      const prevSelected = this.selectedComponentId;
      this.selectedComponentId = compId;
      this.updateSelectionToolbar();

      // If user tapped switch lever, toggle switch ON/OFF
      if (comp.type === 'switch' && e.target.closest('.switch-clickable')) {
        this.toggleSwitch(comp);
        this.render();
        return;
      }

      // Re-render immediately so the selection highlight appears instantly on tap
      if (prevSelected !== compId) {
        this.render();
      }

      // Record initial positions of both connected vertices
      const v1 = this.vertices.get(comp.v1Id);
      const v2 = this.vertices.get(comp.v2Id);
      if (!v1 || !v2) return;

      this.dragState = {
        mode: 'body',
        compId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        hasMoved: false,
        v1Initial: { x: v1.x, y: v1.y },
        v2Initial: { x: v2.x, y: v2.y }
      };
    }

    onPointerMove(e) {
      if (!this.dragState) return;
      e.preventDefault();

      if (this.dragState.mode === 'drag_meter_widget') {
        const dx = e.clientX - this.dragState.startClientX;
        const dy = e.clientY - this.dragState.startClientY;
        const newX = Math.max(10, this.dragState.initX + dx);
        const newY = Math.max(10, this.dragState.initY + dy);
        if (this.dragState.meterType === 'voltmeter') {
          this.voltmeterPos.x = newX;
          this.voltmeterPos.y = newY;
        } else {
          this.ammeterPos.x = newX;
          this.ammeterPos.y = newY;
        }
        this.updateMeterDOMPositions();
        this.renderMeterWires();
        return;
      }

      if (this.dragState.mode === 'drag_probe') {
        const dx = e.clientX - this.dragState.startClientX;
        const dy = e.clientY - this.dragState.startClientY;
        const newX = Math.max(10, this.dragState.initX + dx);
        const newY = Math.max(10, this.dragState.initY + dy);
        if (this.dragState.probeType === 'vm_red') {
          this.vmProbeRedPos.x = newX;
          this.vmProbeRedPos.y = newY;
        } else if (this.dragState.probeType === 'vm_black') {
          this.vmProbeBlackPos.x = newX;
          this.vmProbeBlackPos.y = newY;
        } else if (this.dragState.probeType === 'am_sensor') {
          this.amProbeSensorPos.x = newX;
          this.amProbeSensorPos.y = newY;
        }
        this.updateMeterDOMPositions();
        this.renderMeterWires();
        this.updateMeterReadouts();
        return;
      }

      const dx = e.clientX - this.dragState.startClientX;
      const dy = e.clientY - this.dragState.startClientY;
      const dist = Math.hypot(dx, dy);

      if (this.dragState.mode === 'vertex') {
        if (dist > 4) {
          if (!this.dragState.hasMoved) {
            this.dragState.hasMoved = true;
            this.hideScissors();
          }
        }
        if (!this.dragState.hasMoved) return;

        const v = this.vertices.get(this.dragState.vertexId);
        if (!v) return;

        const worldPos = this.screenToWorld(e.clientX, e.clientY);
        const targetX = Math.round(worldPos.x);
        const targetY = Math.round(worldPos.y);

        // Check if this vertex is connected to any rigid component (Battery, Bulb, Switch, Nail, etc.)
        const connectedComps = this.components.filter(c => c.v1Id === v.id || c.v2Id === v.id);
        const rigidComp = connectedComps.find(c => c.def && !c.def.isFlexible);

        if (rigidComp) {
          // Komponen kaku: Panjang tetap! Hanya berputar (rotate) tepat per 90 derajat
          const pivotVId = (rigidComp.v1Id === v.id) ? rigidComp.v2Id : rigidComp.v1Id;
          const pivotV = this.vertices.get(pivotVId);
          if (pivotV) {
            const fixedLen = rigidComp.def.defaultLen;
            const rawAngle = Math.atan2(targetY - pivotV.y, targetX - pivotV.x);
            const snapAngle = Math.round(rawAngle / (Math.PI / 2)) * (Math.PI / 2);
            v.x = Math.round(pivotV.x + fixedLen * Math.cos(snapAngle));
            v.y = Math.round(pivotV.y + fixedLen * Math.sin(snapAngle));
          } else {
            v.x = targetX;
            v.y = targetY;
          }
        } else {
          // Kabel (Wire): Fleksibel (isFlexible = true), bebas ditarik memanjang/memendek
          v.x = targetX;
          v.y = targetY;
        }

        // Check for magnetic snap candidate
        const snapCandidate = this.findSnapCandidate(this.dragState.vertexId);
        if (snapCandidate) {
          this.snapHalo.setAttribute('cx', snapCandidate.x);
          this.snapHalo.setAttribute('cy', snapCandidate.y);
          this.snapHalo.classList.remove('hidden');
          this.dragState.snapCandidateId = snapCandidate.id;
        } else {
          this.snapHalo.classList.add('hidden');
          this.dragState.snapCandidateId = null;
        }

        this.updateComponentActionsPosition();
        this.render();
      } else if (this.dragState.mode === 'body') {
        if (dist > 4) this.dragState.hasMoved = true;

        const comp = this.components.find(c => c.id === this.dragState.compId);
        if (!comp) return;

        const v1 = this.vertices.get(comp.v1Id);
        const v2 = this.vertices.get(comp.v2Id);
        if (!v1 || !v2) return;

        const dxWorld = (e.clientX - this.dragState.startClientX) / this.zoomScale;
        const dyWorld = (e.clientY - this.dragState.startClientY) / this.zoomScale;

        v1.x = Math.round(this.dragState.v1Initial.x + dxWorld);
        v1.y = Math.round(this.dragState.v1Initial.y + dyWorld);
        v2.x = Math.round(this.dragState.v2Initial.x + dxWorld);
        v2.y = Math.round(this.dragState.v2Initial.y + dyWorld);

        this.updateComponentActionsPosition();
        this.render();
      }
    }

    onPointerUp(e) {
      if (!this.dragState) return;

      if (this.dragState.mode === 'drag_meter_widget' || this.dragState.mode === 'drag_probe') {
        this.updateMeterReadouts();
        this.dragState = null;
        return;
      }

      if (this.dragState.mode === 'vertex') {
        this.snapHalo.classList.add('hidden');
        if (this.dragState.snapCandidateId) {
          this.mergeVertices(this.dragState.vertexId, this.dragState.snapCandidateId);
          this.showToast('Komponen tersambung! 🧲', 'normal');
        } else if (!this.dragState.hasMoved) {
          // Tapped / clicked on vertex!
          const vertexId = this.dragState.vertexId;
          const connected = this.components.filter(c => c.v1Id === vertexId || c.v2Id === vertexId);
          if (connected.length >= 2) {
            if (this.activeJunctionVertexId === vertexId && !this.scissorsContainer.classList.contains('hidden')) {
              // Tapping active junction again -> detach!
              this.splitJunction(vertexId);
            } else {
              this.showScissors(vertexId);
              this.sound.playClick();
            }
          } else {
            this.hideScissors();
            this.showToast('Ujung ini belum tersambung ke komponen lain 🧲', 'normal');
          }
        }
      }

      this.dragState = null;
      this.render();
      this.updateSimulation();
      this.updateComponentActionsPosition();
    }

    startMeterWidgetDrag(meterType, e) {
      e.stopPropagation();
      this.dragState = {
        mode: 'drag_meter_widget',
        meterType,
        startClientX: e.clientX,
        startClientY: e.clientY,
        initX: meterType === 'voltmeter' ? this.voltmeterPos.x : this.ammeterPos.x,
        initY: meterType === 'voltmeter' ? this.voltmeterPos.y : this.ammeterPos.y
      };
    }

    startProbeDrag(probeType, e) {
      e.stopPropagation();
      let initPos;
      if (probeType === 'vm_red') initPos = this.vmProbeRedPos;
      else if (probeType === 'vm_black') initPos = this.vmProbeBlackPos;
      else if (probeType === 'am_sensor') initPos = this.amProbeSensorPos;
      if (!initPos) return;

      this.dragState = {
        mode: 'drag_probe',
        probeType,
        startClientX: e.clientX,
        startClientY: e.clientY,
        initX: initPos.x,
        initY: initPos.y
      };
    }

    toggleVoltmeter(active) {
      this.isVoltmeterActive = !!active;
      const btnToggle = document.getElementById('btn-toggle-voltmeter');
      if (btnToggle) btnToggle.classList.toggle('active', this.isVoltmeterActive);
      const cardDock = document.getElementById('card-dock-vm');
      if (cardDock) cardDock.classList.toggle('active', this.isVoltmeterActive);
      const checkDock = document.getElementById('check-dock-vm');
      if (checkDock) checkDock.checked = this.isVoltmeterActive;

      if (this.floatingVoltmeter) this.floatingVoltmeter.classList.toggle('hidden', !this.isVoltmeterActive);
      if (this.vmProbeRed) this.vmProbeRed.classList.toggle('hidden', !this.isVoltmeterActive);
      if (this.vmProbeBlack) this.vmProbeBlack.classList.toggle('hidden', !this.isVoltmeterActive);

      if (this.isVoltmeterActive) {
        this.updateMeterDOMPositions();
        this.renderMeterWires();
        this.updateMeterReadouts();
        this.showToast('Voltmeter aktif! Pasang probe merah (+) & hitam (−) ke sambungan titik 📟', 'normal');
      } else {
        this.renderMeterWires();
      }
    }

    toggleAmmeter(active) {
      this.isAmmeterActive = !!active;
      const btnToggle = document.getElementById('btn-toggle-ammeter');
      if (btnToggle) btnToggle.classList.toggle('active', this.isAmmeterActive);
      const cardDock = document.getElementById('card-dock-am');
      if (cardDock) cardDock.classList.toggle('active', this.isAmmeterActive);
      const checkDock = document.getElementById('check-dock-am');
      if (checkDock) checkDock.checked = this.isAmmeterActive;

      if (this.floatingAmmeter) this.floatingAmmeter.classList.toggle('hidden', !this.isAmmeterActive);
      if (this.amProbeSensor) this.amProbeSensor.classList.toggle('hidden', !this.isAmmeterActive);

      if (this.isAmmeterActive) {
        this.updateMeterDOMPositions();
        this.renderMeterWires();
        this.updateMeterReadouts();
        this.showToast('Amperemeter aktif! Arahkan target sensor bundar ke kabel/komponen 🎛️', 'normal');
      } else {
        this.renderMeterWires();
      }
    }

    updateMeterDOMPositions() {
      if (this.floatingVoltmeter) {
        this.floatingVoltmeter.style.left = `${this.voltmeterPos.x}px`;
        this.floatingVoltmeter.style.top = `${this.voltmeterPos.y}px`;
      }
      if (this.vmProbeRed) {
        this.vmProbeRed.style.left = `${this.vmProbeRedPos.x}px`;
        this.vmProbeRed.style.top = `${this.vmProbeRedPos.y}px`;
      }
      if (this.vmProbeBlack) {
        this.vmProbeBlack.style.left = `${this.vmProbeBlackPos.x}px`;
        this.vmProbeBlack.style.top = `${this.vmProbeBlackPos.y}px`;
      }
      if (this.floatingAmmeter) {
        this.floatingAmmeter.style.left = `${this.ammeterPos.x}px`;
        this.floatingAmmeter.style.top = `${this.ammeterPos.y}px`;
      }
      if (this.amProbeSensor) {
        this.amProbeSensor.style.left = `${this.amProbeSensorPos.x}px`;
        this.amProbeSensor.style.top = `${this.amProbeSensorPos.y}px`;
      }
    }

    renderMeterWires() {
      if (!this.meterWiresGroup) return;
      this.meterWiresGroup.innerHTML = '';

      if (this.isVoltmeterActive) {
        // Red Probe Wire (right jack to bottom of red probe handle)
        const mRed = this.containerToWorld(this.voltmeterPos.x + 135, this.voltmeterPos.y + 115);
        const pRed = this.containerToWorld(this.vmProbeRedPos.x, this.vmProbeRedPos.y + 70);
        const pathRed = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const c1RedY = mRed.y + 55 / this.zoomScale;
        const c2RedY = pRed.y + 55 / this.zoomScale;
        pathRed.setAttribute('d', `M ${mRed.x} ${mRed.y} C ${mRed.x} ${c1RedY}, ${pRed.x} ${c2RedY}, ${pRed.x} ${pRed.y}`);
        pathRed.setAttribute('fill', 'none');
        pathRed.setAttribute('stroke', '#ef4444');
        pathRed.setAttribute('stroke-width', `${3.5 / this.zoomScale}`);
        pathRed.setAttribute('stroke-linecap', 'round');
        pathRed.setAttribute('opacity', '0.9');
        this.meterWiresGroup.appendChild(pathRed);

        // Black Probe Wire (left jack to bottom of black probe handle)
        const mBlk = this.containerToWorld(this.voltmeterPos.x + 45, this.voltmeterPos.y + 115);
        const pBlk = this.containerToWorld(this.vmProbeBlackPos.x, this.vmProbeBlackPos.y + 70);
        const pathBlk = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const c1BlkY = mBlk.y + 55 / this.zoomScale;
        const c2BlkY = pBlk.y + 55 / this.zoomScale;
        pathBlk.setAttribute('d', `M ${mBlk.x} ${mBlk.y} C ${mBlk.x} ${c1BlkY}, ${pBlk.x} ${c2BlkY}, ${pBlk.x} ${pBlk.y}`);
        pathBlk.setAttribute('fill', 'none');
        pathBlk.setAttribute('stroke', '#334155');
        pathBlk.setAttribute('stroke-width', `${3.5 / this.zoomScale}`);
        pathBlk.setAttribute('stroke-linecap', 'round');
        pathBlk.setAttribute('opacity', '0.9');
        this.meterWiresGroup.appendChild(pathBlk);
      }

      if (this.isAmmeterActive) {
        // Sensor Wand Wire (center jack to bottom of wand handle)
        const mAm = this.containerToWorld(this.ammeterPos.x + 90, this.ammeterPos.y + 115);
        const pAm = this.containerToWorld(this.amProbeSensorPos.x, this.amProbeSensorPos.y + 70);
        const pathAm = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const c1AmY = mAm.y + 55 / this.zoomScale;
        const c2AmY = pAm.y + 55 / this.zoomScale;
        pathAm.setAttribute('d', `M ${mAm.x} ${mAm.y} C ${mAm.x} ${c1AmY}, ${pAm.x} ${c2AmY}, ${pAm.x} ${pAm.y}`);
        pathAm.setAttribute('fill', 'none');
        pathAm.setAttribute('stroke', '#0284c7');
        pathAm.setAttribute('stroke-width', `${3.5 / this.zoomScale}`);
        pathAm.setAttribute('stroke-linecap', 'round');
        pathAm.setAttribute('opacity', '0.9');
        this.meterWiresGroup.appendChild(pathAm);
      }
    }

    findNearestVertexToPos(cx, cy, maxDist = 38) {
      const worldPos = this.containerToWorld(cx, cy);
      let closest = null;
      let minDist = maxDist;
      for (const [, v] of this.vertices) {
        const d = Math.hypot(v.x - worldPos.x, v.y - worldPos.y);
        if (d < minDist) {
          minDist = d;
          closest = v;
        }
      }
      return closest;
    }

    findNearestComponentToPos(cx, cy, maxDist = 38) {
      const worldPos = this.containerToWorld(cx, cy);
      let closest = null;
      let minDist = maxDist;

      for (const comp of this.components) {
        const v1 = this.vertices.get(comp.v1Id);
        const v2 = this.vertices.get(comp.v2Id);
        if (!v1 || !v2) continue;

        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        const lenSq = dx * dx + dy * dy;
        let d = 0;
        if (lenSq === 0) {
          d = Math.hypot(worldPos.x - v1.x, worldPos.y - v1.y);
        } else {
          let t = ((worldPos.x - v1.x) * dx + (worldPos.y - v1.y) * dy) / lenSq;
          t = Math.max(0, Math.min(1, t));
          const projX = v1.x + t * dx;
          const projY = v1.y + t * dy;
          d = Math.hypot(worldPos.x - projX, worldPos.y - projY);
        }

        if (d < minDist) {
          minDist = d;
          closest = comp;
        }
      }
      return closest;
    }

    updateMeterReadouts() {
      if (this.isVoltmeterActive) {
        const vRed = this.findNearestVertexToPos(this.vmProbeRedPos.x, this.vmProbeRedPos.y);
        const vBlack = this.findNearestVertexToPos(this.vmProbeBlackPos.x, this.vmProbeBlackPos.y);
        let vDiff = 0;
        if (vRed && vBlack) {
          const potRed = this.vertexPotentials.has(vRed.id) ? this.vertexPotentials.get(vRed.id) : 0;
          const potBlack = this.vertexPotentials.has(vBlack.id) ? this.vertexPotentials.get(vBlack.id) : 0;
          vDiff = potRed - potBlack;
        }
        const el = document.getElementById('vm-lcd-val');
        if (el) el.textContent = Math.abs(vDiff) < 0.005 ? '0.00' : vDiff.toFixed(2);
      }

      if (this.isAmmeterActive) {
        const comp = this.findNearestComponentToPos(this.amProbeSensorPos.x, this.amProbeSensorPos.y);
        let currentVal = 0;
        if (comp) {
          if (comp.isShorted) {
            currentVal = 99.99;
          } else if (comp.isConducting) {
            currentVal = comp.measuredCurrent || 0;
          }
        }
        const el = document.getElementById('am-lcd-val');
        if (el) {
          el.textContent = currentVal > 50 ? '> 10.0' : currentVal.toFixed(2);
        }
      }
    }

    toggleSwitch(comp) {
      comp.state = comp.state === 'closed' ? 'open' : 'closed';
      this.sound.playClick();
      this.showToast(comp.state === 'closed' ? 'Saklar ON (Tertutup) 🟢' : 'Saklar OFF (Terbuka) 🔴', 'normal');
      this.updateSimulation();
    }

    // ==========================================================================
    // 8. Circuit Solver (Accurate Series vs Parallel Physics)
    // ==========================================================================
    updateSimulation() {
      // Reset component states
      this.vertexPotentials.clear();
      this.components.forEach(c => {
        if (c.type === 'bulb') c.litState = 'off';
        c.isConducting = false;
        c.isShorted = false;
        c.currentFromVId = null;
        c.currentToVId = null;
        c.measuredCurrent = 0;
        c.measuredVoltage = 0;
      });

      const powerSources = this.components.filter(c => c.type === 'battery' || c.type === 'solar');
      if (powerSources.length === 0) {
        this.circuitVoltage = 0;
        this.renderBulbVisuals();
        this.updateMeterReadouts();
        this.checkMissions();
        return;
      }

      let circuitHasShort = false;
      const bulbBrightness = new Map(); // bulbId -> 'lit' | 'dim'
      const activeComponents = new Set();
      let totalConductedVoltage = 0;

      powerSources.forEach(src => {
        const srcV = src.voltage !== undefined ? src.voltage : (src.type === 'solar' ? 3.0 : 1.5);
        const result = this.solveBatteryCircuit(src);

        if (result.isShortCircuit) {
          circuitHasShort = true;
          result.shortedComps.forEach(c => {
            c.isShorted = true;
            activeComponents.add(c.id);
          });
          totalConductedVoltage += srcV;
          this.triggerSmoke(src);
        } else if (result.activeComps.length > 0) {
          totalConductedVoltage += srcV;
          result.bulbBrightnessMap.forEach((bright, bId) => {
            if (bulbBrightness.get(bId) !== 'lit') {
              bulbBrightness.set(bId, bright);
            }
          });
          result.activeComps.forEach(c => activeComponents.add(c.id));
        }
      });

      this.circuitVoltage = totalConductedVoltage;

      if (circuitHasShort) {
        this.sound.playBuzz();
        this.showToast('⚠️ AWAS KORSLETING! Sumber listrik terhubung langsung tanpa beban!', 'alert');
      }

      // Apply electrical state
      this.components.forEach(c => {
        if (activeComponents.has(c.id)) c.isConducting = true;
        if (c.type === 'bulb') {
          // If short-circuited across power source or 0V, bulbs shut off
          if (circuitHasShort || this.circuitVoltage <= 0) {
            c.litState = 'off';
          } else {
            c.litState = bulbBrightness.get(c.id) || 'off';
          }
        }
      });

      const wasLit = Array.from(bulbBrightness.keys()).length > 0 && !circuitHasShort && this.circuitVoltage > 0;
      if (wasLit) this.sound.playChime();

      this.renderBulbVisuals();
      this.updateMeterReadouts();
      this.checkMissions();
    }

    solveBatteryCircuit(battery) {
      const srcV = battery.voltage !== undefined ? battery.voltage : (battery.type === 'solar' ? 3.0 : 1.5);
      if (srcV <= 0) {
        this.vertexPotentials.set(battery.v1Id, 0);
        this.vertexPotentials.set(battery.v2Id, 0);
        return { isShortCircuit: false, bulbBrightnessMap: new Map(), activeComps: [], shortedComps: [] };
      }

      // Find all paths from battery/source v2 (+) to v1 (-)
      const startVertexId = battery.v2Id; // Positive
      const targetVertexId = battery.v1Id; // Negative

      const allPaths = [];
      const visitedVertices = new Set();
      const visitedComponents = new Set();

      const dfs = (currVertexId, pathComponents) => {
        if (currVertexId === targetVertexId) {
          allPaths.push([...pathComponents]);
          return;
        }

        visitedVertices.add(currVertexId);

        // Find components connected to currVertexId
        const edges = this.components.filter(c => 
          (c.v1Id === currVertexId || c.v2Id === currVertexId) &&
          !visitedComponents.has(c.id) &&
          this.canComponentConduct(c)
        );

        for (const comp of edges) {
          const nextVertexId = comp.v1Id === currVertexId ? comp.v2Id : comp.v1Id;
          if (!visitedVertices.has(nextVertexId)) {
            visitedComponents.add(comp.id);
            dfs(nextVertexId, [...pathComponents, { comp, fromVId: currVertexId, toVId: nextVertexId }]);
            visitedComponents.delete(comp.id);
          }
        }

        visitedVertices.delete(currVertexId);
      };

      visitedComponents.add(battery.id);
      dfs(startVertexId, []);

      // Propagate open-circuit potentials along conducting branches
      const propagatePotential = (rootVId, val) => {
        const queue = [rootVId];
        const visited = new Set([rootVId]);
        while (queue.length > 0) {
          const currVId = queue.shift();
          const edges = this.components.filter(c =>
            (c.v1Id === currVId || c.v2Id === currVId) &&
            this.canComponentConduct(c) &&
            !c.isConducting
          );
          for (const comp of edges) {
            const nextVId = comp.v1Id === currVId ? comp.v2Id : comp.v1Id;
            if (!visited.has(nextVId) && !this.vertexPotentials.has(nextVId)) {
              visited.add(nextVId);
              this.vertexPotentials.set(nextVId, val);
              queue.push(nextVId);
            }
          }
        }
      };

      if (allPaths.length === 0) {
        this.vertexPotentials.set(battery.v1Id, 0);
        this.vertexPotentials.set(battery.v2Id, srcV);
        propagatePotential(battery.v2Id, srcV);
        propagatePotential(battery.v1Id, 0);
        return { isShortCircuit: false, bulbBrightnessMap: new Map(), activeComps: [], shortedComps: [] };
      }

      let isShortCircuit = false;
      const bulbBrightnessMap = new Map();
      const activeComps = new Set();
      const shortedComps = new Set();

      allPaths.forEach(path => {
        let pathR = 0;
        let hasLoad = false;
        path.forEach(step => {
          if (step.comp.type === 'bulb') {
            pathR += 10.0;
            hasLoad = true;
          } else if (step.comp.type === 'dinamo') {
            pathR += 10.0;
            hasLoad = true;
          } else if (step.comp.type === 'voltmeter') {
            pathR += 10000.0;
          } else {
            pathR += 0.05; // wire, switch, ammeter, nail, coin
          }
        });

        if (!hasLoad && pathR < 0.3) {
          // Direct connection with no load = Short Circuit!
          isShortCircuit = true;
          const I_short = 50.0;
          path.forEach(step => {
            shortedComps.add(step.comp);
            step.comp.currentFromVId = step.fromVId;
            step.comp.currentToVId = step.toVId;
            step.comp.measuredCurrent = (step.comp.measuredCurrent || 0) + I_short;
          });
          shortedComps.add(battery);
          battery.currentFromVId = battery.v1Id;
          battery.currentToVId = battery.v2Id;
          battery.measuredCurrent = (battery.measuredCurrent || 0) + I_short;
        } else {
          // Fisika Rangkaian: Hukum Ohm I = V / R
          const I_path = srcV / pathR;

          const bulbsInPath = path.filter(step => step.comp.type === 'bulb');
          if (bulbsInPath.length > 0) {
            const brightness = bulbsInPath.length === 1 ? 'lit' : 'dim';
            bulbsInPath.forEach(bStep => {
              if (bulbBrightnessMap.get(bStep.comp.id) !== 'lit') {
                bulbBrightnessMap.set(bStep.comp.id, brightness);
              }
            });
          }

          let currPotential = srcV;
          this.vertexPotentials.set(startVertexId, srcV);

          path.forEach(step => {
            activeComps.add(step.comp);
            step.comp.currentFromVId = step.fromVId;
            step.comp.currentToVId = step.toVId;
            step.comp.measuredCurrent = (step.comp.measuredCurrent || 0) + I_path;

            let compR = 0.05;
            if (step.comp.type === 'bulb' || step.comp.type === 'dinamo') compR = 10.0;
            else if (step.comp.type === 'voltmeter') compR = 10000.0;

            const drop = Math.min(currPotential, I_path * compR);
            const nextPotential = Math.max(0, currPotential - drop);
            this.vertexPotentials.set(step.toVId, nextPotential);
            step.comp.measuredVoltage = Math.abs(currPotential - nextPotential);
            currPotential = nextPotential;
          });

          activeComps.add(battery);
          battery.currentFromVId = battery.v1Id;
          battery.currentToVId = battery.v2Id;
          battery.measuredCurrent = (battery.measuredCurrent || 0) + I_path;
        }
      });

      this.vertexPotentials.set(battery.v1Id, 0);
      this.vertexPotentials.set(battery.v2Id, srcV);
      propagatePotential(battery.v2Id, srcV);
      propagatePotential(battery.v1Id, 0);

      return {
        isShortCircuit,
        bulbBrightnessMap,
        activeComps: Array.from(activeComps),
        shortedComps: Array.from(shortedComps)
      };
    }

    canComponentConduct(comp) {
      if (comp.type === 'wire') return true;
      if (comp.type === 'battery' || comp.type === 'solar') return true;
      if (comp.type === 'bulb') return true;
      if (comp.type === 'dinamo') return true;
      if (comp.type === 'ammeter') return true;
      if (comp.type === 'voltmeter') return true;
      if (comp.type === 'switch') return comp.state === 'closed';
      if (comp.def && comp.def.isConductor) return true;
      return false; // Insulators do not conduct
    }

    triggerSmoke(battery) {
      const v1 = this.vertices.get(battery.v1Id);
      const v2 = this.vertices.get(battery.v2Id);
      if (!v1 || !v2) return;

      const smoke = document.createElement('div');
      smoke.className = 'smoke-cloud';
      smoke.innerHTML = '🔥💨';
      const sPos = this.worldToScreen((v1.x + v2.x) / 2 - 25, (v1.y + v2.y) / 2 - 50);
      smoke.style.left = `${sPos.x}px`;
      smoke.style.top = `${sPos.y}px`;
      this.fxOverlay.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1200);
    }

    // ==========================================================================
    // 9. SVG Rendering Engine (Visual Render)
    // ==========================================================================
    render() {
      this.componentsGroup.innerHTML = '';
      this.verticesGroup.innerHTML = '';

      // 1. Render all components (drawn between v1 and v2)
      this.components.forEach(comp => {
        const v1 = this.vertices.get(comp.v1Id);
        const v2 = this.vertices.get(comp.v2Id);
        if (!v1 || !v2) return;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `circuit-component comp-${comp.type} ${this.selectedComponentId === comp.id ? 'selected' : ''}`);
        g.setAttribute('id', comp.id);

        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        let len = Math.hypot(dx, dy);
        if (comp.def && !comp.def.isFlexible) {
          len = comp.def.defaultLen; // Kaku: panjang visual selalu tepat defaultLen
        }
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        g.setAttribute('transform', `translate(${v1.x}, ${v1.y}) rotate(${angle})`);

        // Render specific component visual template
        g.innerHTML = this.renderComponentGraphic(comp, len);

        // Component body drag handler
        g.addEventListener('pointerdown', (e) => this.startComponentDrag(comp.id, e));

        this.componentsGroup.appendChild(g);
      });

      // 2. Render all vertices (Junction points: Red Dashed vs Merged Black)
      this.vertices.forEach(v => {
        const connected = this.components.filter(c => c.v1Id === v.id || c.v2Id === v.id);
        if (connected.length === 0) return;

        const isMerged = connected.length >= 2;
        const isJunctionActive = (this.activeJunctionVertexId === v.id);
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', `circuit-vertex ${isJunctionActive ? 'active-junction' : ''}`);
        g.setAttribute('transform', `translate(${v.x}, ${v.y})`);

        // Visible circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', `circuit-vertex-circle ${isMerged ? 'merged' : 'open'} ${isJunctionActive ? 'active' : ''}`);
        circle.setAttribute('r', isMerged ? '11' : '12');
        g.appendChild(circle);

        // Invisible large hitbox for easy touch targeting
        const hitbox = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        hitbox.setAttribute('class', 'circuit-vertex-hitbox');
        hitbox.setAttribute('r', '24');
        g.appendChild(hitbox);

        // Touch event: Drag vertex or tap to show scissors
        g.addEventListener('pointerdown', (e) => {
          this.startVertexDrag(v.id, e);
        });

        this.verticesGroup.appendChild(g);
      });

      this.renderMeterWires();
      this.updateMeterReadouts();
    }

    renderComponentGraphic(comp, len) {
      const isSelected = this.selectedComponentId === comp.id;

      if (comp.type === 'wire') {
        const shortCls = comp.isShorted ? 'circuit-wire-shorted' : '';
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <line x1="0" y1="0" x2="${len}" y2="0" class="selection-glow" />
              <line x1="0" y1="0" x2="${len}" y2="0" class="selection-dash" />
            </g>
          ` : ''}
          <!-- Outline selection hitbox -->
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="26" stroke-linecap="round" />
          <!-- Outer insulated jacket -->
          <line x1="0" y1="0" x2="${len}" y2="0" class="circuit-wire-line ${shortCls}" />
          <!-- Inner core -->
          <line x1="0" y1="0" x2="${len}" y2="0" class="circuit-wire-inner" />
        `;
      } else if (comp.type === 'battery') {
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-24" width="${len + 12}" height="48" rx="10" class="selection-halo" />
              <circle cx="-6" cy="-24" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-24" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="24" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="24" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <!-- Battery Flat Base (-) -->
          <rect x="0" y="-14" width="12" height="28" fill="#94a3b8" rx="2" />
          <text x="6" y="0" font-size="14" font-weight="900" fill="#1e293b" text-anchor="middle" dominant-baseline="central">−</text>
          
          <!-- Battery Main Body -->
          <rect x="12" y="-18" width="${len - 28}" height="36" fill="#1e293b" rx="4" stroke="#0f172a" stroke-width="2" />
          <rect x="25" y="-18" width="${(len - 28) * 0.55}" height="36" fill="#f59e0b" />
          <text x="${len * 0.5}" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${(comp.voltage !== undefined ? comp.voltage : 1.5).toFixed(1)}V</text>
          
          <!-- Battery Copper Nipple (+) -->
          <rect x="${len - 16}" y="-8" width="16" height="16" fill="#eab308" stroke="#ca8a04" stroke-width="1.5" rx="3" />
          <text x="${len - 24}" y="0" font-size="16" font-weight="900" fill="#ef4444" text-anchor="middle" dominant-baseline="central">+</text>
        `;
      } else if (comp.type === 'bulb') {
        const isLit = comp.litState === 'lit';
        const isDim = comp.litState === 'dim';
        const globeStroke = isLit || isDim ? '#ca8a04' : '#94a3b8';
        const glowFilter = isLit ? 'filter="url(#glow-bulb)"' : '';

        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-52" width="${len + 12}" height="64" rx="12" class="selection-halo" />
              <circle cx="-6" cy="-52" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-52" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="12" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="12" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <!-- Radiating Light Rays if lit -->
          ${isLit ? `
            <g stroke="#facc15" stroke-width="3" stroke-linecap="round" opacity="0.8">
              <line x1="${len/2}" y1="-50" x2="${len/2}" y2="-65" />
              <line x1="${len/2 - 25}" y1="-45" x2="${len/2 - 38}" y2="-58" />
              <line x1="${len/2 + 25}" y1="-45" x2="${len/2 + 38}" y2="-58" />
            </g>
          ` : ''}
          <!-- Bulb Base Thread -->
          <rect x="${len * 0.3}" y="-10" width="${len * 0.4}" height="20" fill="#94a3b8" stroke="#475569" stroke-width="1.5" rx="3" />
          <!-- Glass Globe -->
          <circle cx="${len * 0.5}" cy="-24" r="22" fill="${isLit ? '#fef08a' : (isDim ? '#fef9c3' : '#f8fafc')}" stroke="${globeStroke}" stroke-width="2" ${glowFilter} />
          <!-- Filament inside globe -->
          <path d="M ${len * 0.44} -10 L ${len * 0.47} -26 L ${len * 0.53} -26 L ${len * 0.56} -10" fill="none" stroke="${isLit || isDim ? '#ffffff' : '#64748b'}" stroke-width="2.5" />
          <!-- Connective terminal legs to v1 and v2 -->
          <line x1="0" y1="0" x2="${len * 0.3}" y2="0" stroke="#64748b" stroke-width="6" />
          <line x1="${len * 0.7}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="6" />
        `;
      } else if (comp.type === 'switch') {
        const isClosed = comp.state === 'closed';
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-36" width="${len + 12}" height="48" rx="10" class="selection-halo" />
              <circle cx="-6" cy="-36" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-36" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="12" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="12" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <!-- Base Plate -->
          <rect x="15" y="-8" width="${len - 30}" height="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" rx="4" />
          <!-- Pivot Hinge Pin at v1 -->
          <circle cx="20" cy="0" r="6" fill="#475569" />
          <!-- Contact Terminal at v2 -->
          <circle cx="${len - 20}" cy="0" r="6" fill="#475569" />
          <!-- Moving Switch Knife Lever (Clickable) -->
          <g class="switch-clickable" style="cursor: pointer;">
            <line x1="20" y1="0" x2="${isClosed ? len - 20 : len * 0.7}" y2="${isClosed ? 0 : -28}" stroke="${isClosed ? '#22c55e' : '#ef4444'}" stroke-width="7" stroke-linecap="round" />
            <circle cx="${isClosed ? len - 20 : len * 0.7}" cy="${isClosed ? 0 : -28}" r="8" fill="#ffffff" stroke="#334155" stroke-width="2" />
          </g>
          <!-- Leads to ends -->
          <line x1="0" y1="0" x2="20" y2="0" stroke="#64748b" stroke-width="5" />
          <line x1="${len - 20}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
        `;
      } else if (comp.type === 'nail') {
        // Paku Besi (Realistis Logam Steel Nail)
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-18" width="${len + 12}" height="36" rx="8" class="selection-halo" />
              <circle cx="-6" cy="-18" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-18" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="18" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="18" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="36" />
          <!-- Leads -->
          <line x1="0" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="5" />
          <line x1="${len - 12}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
          <!-- Nail Head (Flat beveled steel disk) -->
          <rect x="12" y="-13" width="6" height="26" rx="2" fill="#94a3b8" stroke="#475569" stroke-width="1.5" />
          <rect x="13" y="-11" width="2" height="22" fill="#cbd5e1" />
          <!-- Nail Shank (Heavy steel shaft) -->
          <rect x="18" y="-6" width="${len - 44}" height="12" fill="#64748b" stroke="#334155" stroke-width="1.5" />
          <!-- Friction grip rings near head -->
          <line x1="23" y1="-6" x2="23" y2="6" stroke="#334155" stroke-width="1.5" />
          <line x1="27" y1="-6" x2="27" y2="6" stroke="#334155" stroke-width="1.5" />
          <line x1="31" y1="-6" x2="31" y2="6" stroke="#334155" stroke-width="1.5" />
          <!-- Specular Metallic Highlight -->
          <line x1="19" y1="-2" x2="${len - 28}" y2="-2" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" />
          <line x1="19" y1="3" x2="${len - 28}" y2="3" stroke="#475569" stroke-width="1.5" stroke-linecap="round" />
          <!-- Pointed Cone Tip -->
          <polygon points="${len - 26},-6 ${len - 12},0 ${len - 26},6" fill="#64748b" stroke="#334155" stroke-width="1.5" />
          <polygon points="${len - 26},-5 ${len - 13},0 ${len - 26},-1" fill="#cbd5e1" />
        `;
      } else if (comp.type === 'coin') {
        // Koin Emas (Realistis Koin Logam Berigi & Bintang Relief)
        const cx = len * 0.5;
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-28" width="${len + 12}" height="56" rx="10" class="selection-halo" />
              <circle cx="-6" cy="-28" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-28" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="28" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="28" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <!-- Connecting terminal leads -->
          <line x1="0" y1="0" x2="${cx - 24}" y2="0" stroke="#64748b" stroke-width="5" />
          <line x1="${cx + 24}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
          <!-- Outer Milled Coin Rim -->
          <circle cx="${cx}" cy="0" r="24" fill="#d97706" stroke="#92400e" stroke-width="2" />
          <circle cx="${cx}" cy="0" r="22" fill="#f59e0b" stroke="#b45309" stroke-width="1.5" stroke-dasharray="3 1.5" />
          <!-- Inner Coin Face -->
          <circle cx="${cx}" cy="0" r="18" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
          <!-- Coin Emblem: Relief Star & Rings -->
          <polygon points="${cx},-9 ${cx + 3},-3 ${cx + 9},-3 ${cx + 4},1.5 ${cx + 6},8 ${cx},3.5 ${cx - 6},8 ${cx - 4},1.5 ${cx - 9},-3 ${cx - 3},-3" fill="#fef08a" stroke="#b45309" stroke-width="1" />
          <!-- Reflection Sheen Arc -->
          <path d="M ${cx - 15} -13 A 20 20 0 0 1 ${cx + 15} -13" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.7" stroke-linecap="round" />
        `;
      } else if (comp.type === 'eraser') {
        // Penghapus Karet (Realistis Dual-Tone Eraser Pink & Biru dengan Sleeve Karton)
        const h = 26;
        const bX1 = 12;
        const bX2 = len - 12;
        const sleeveW = Math.max(26, len * 0.28);
        const sX1 = (len - sleeveW) / 2;
        const sX2 = sX1 + sleeveW;
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-20" width="${len + 12}" height="40" rx="8" class="selection-halo" />
              <circle cx="-6" cy="-20" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-20" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="20" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="20" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="36" />
          <!-- Connecting leads -->
          <line x1="0" y1="0" x2="${bX1}" y2="0" stroke="#64748b" stroke-width="4" />
          <line x1="${bX2}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="4" />
          <!-- Left Pink Rubber Block with Chisel Edge -->
          <polygon points="${bX1 - 4},0 ${bX1},-${h/2} ${sX1},-${h/2} ${sX1},${h/2} ${bX1},${h/2}" fill="#fb7185" stroke="#e11d48" stroke-width="1.5" />
          <polygon points="${bX1 - 4},0 ${bX1},-${h/2} ${sX1},-${h/2} ${sX1},-6 ${bX1},-6" fill="#fda4af" />
          <!-- Right Blue Rubber Block with Chisel Edge -->
          <polygon points="${sX2},-${h/2} ${bX2},-${h/2} ${bX2 + 4},0 ${bX2},${h/2} ${sX2},${h/2}" fill="#3b82f6" stroke="#1d4ed8" stroke-width="1.5" />
          <polygon points="${sX2},-${h/2} ${bX2},-${h/2} ${bX2 + 4},0 ${bX2},-6 ${sX2},-6" fill="#60a5fa" />
          <!-- Middle Protective Paper Sleeve -->
          <rect x="${sX1}" y="-${h/2 + 2}" width="${sleeveW}" height="${h + 4}" rx="2" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
          <rect x="${sX1 + 2}" y="-${h/2}" width="${sleeveW - 4}" height="4" fill="#0284c7" />
          <text x="${len * 0.5}" y="3" font-family="'Fredoka', sans-serif" font-size="8" font-weight="800" fill="#334155" text-anchor="middle">ERASER</text>
        `;
      } else if (comp.type === 'ruler') {
        // Mistar / Penggaris Plastik & Kayu dengan Garis Ukuran Skala (Ticks) & Angka Centimeter Nyata
        const rw = len - 24;
        let ticksSvg = '';
        const tickStep = 6;
        let cmNum = 0;
        for (let tx = 18; tx <= len - 18; tx += tickStep) {
          const idx = Math.round((tx - 18) / tickStep);
          if (idx % 5 === 0) {
            ticksSvg += `<line x1="${tx}" y1="-14" x2="${tx}" y2="-4" stroke="#854d0e" stroke-width="1.5" />`;
            ticksSvg += `<text x="${tx}" y="1" font-family="'Fredoka', sans-serif" font-size="7" font-weight="800" fill="#78350f" text-anchor="middle">${cmNum}</text>`;
            cmNum++;
          } else {
            ticksSvg += `<line x1="${tx}" y1="-14" x2="${tx}" y2="-9" stroke="#b45309" stroke-width="1" />`;
          }
        }

        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-20" width="${len + 12}" height="40" rx="8" class="selection-halo" />
              <circle cx="-6" cy="-20" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-20" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="20" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="20" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="36" />
          <!-- Terminals -->
          <line x1="0" y1="0" x2="12" y2="0" stroke="#64748b" stroke-width="4" />
          <line x1="${len - 12}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="4" />
          <!-- Acrylic / Yellow Wood Ruler Body -->
          <rect x="12" y="-14" width="${rw}" height="28" rx="3" fill="#fef08a" stroke="#ca8a04" stroke-width="2" />
          <!-- Glossy reflection stripe -->
          <rect x="13" y="-13" width="${rw - 2}" height="4" fill="#ffffff" opacity="0.6" />
          <!-- Graduation Ticks -->
          ${ticksSvg}
          <!-- Brand / Specification Label -->
          <text x="${len * 0.5}" y="9" font-family="'Fredoka', sans-serif" font-size="7.5" font-weight="700" fill="#a16207" text-anchor="middle">MISTAR 15CM (ISOLATOR)</text>
          <!-- Corner metal binding clips -->
          <rect x="12" y="-8" width="4" height="16" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" rx="1" />
          <rect x="${len - 16}" y="-8" width="4" height="16" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1" rx="1" />
        `;
      } else if (comp.type === 'dinamo') {
        // Dinamo Motor DC (Stator Silinder Logam, Poros As Baja & Baling-Baling Kipas Berputar)
        const propCenter = len * 0.76;
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-38" width="${len + 12}" height="76" rx="12" class="selection-halo" />
              <circle cx="-6" cy="-38" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-38" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="38" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="38" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="44" />
          <!-- Terminal (-) Kiri -->
          <line x1="0" y1="0" x2="16" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="10" y="-7" width="7" height="14" fill="#94a3b8" rx="2" stroke="#475569" stroke-width="1" />
          <text x="13.5" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="900" fill="#1e293b" text-anchor="middle" dominant-baseline="central">−</text>

          <!-- Bearing Belakang / Tutup Stator -->
          <rect x="16" y="-15" width="6" height="30" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" rx="2" />

          <!-- Badan Silinder Motor DC Logam -->
          <rect x="22" y="-18" width="46" height="36" fill="#334155" stroke="#0f172a" stroke-width="2" rx="4" />
          <!-- Garis Strip Aksen Dinamo Biru Elektrik -->
          <rect x="27" y="-18" width="8" height="36" fill="#0284c7" />
          <!-- Slot Ventilasi & Detil Brush -->
          <line x1="24" y1="-8" x2="65" y2="-8" stroke="#475569" stroke-width="1.5" stroke-dasharray="5 3" />
          <line x1="24" y1="8" x2="65" y2="8" stroke="#475569" stroke-width="1.5" stroke-dasharray="5 3" />
          <text x="47" y="1" font-family="'Fredoka', sans-serif" font-size="8.5" font-weight="800" fill="#f8fafc" text-anchor="middle" dominant-baseline="central">DINAMO DC</text>

          <!-- Tutup Depan Stator & As Baja -->
          <rect x="68" y="-12" width="6" height="24" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" rx="2" />
          <rect x="74" y="-3.5" width="10" height="7" fill="#94a3b8" stroke="#475569" stroke-width="1" />
          <line x1="75" y1="-1" x2="83" y2="-1" stroke="#f1f5f9" stroke-width="1.2" />

          <!-- Terminal (+) Kanan -->
          <line x1="${len - 16}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="${len - 17}" y="-7" width="7" height="14" fill="#ef4444" rx="2" stroke="#dc2626" stroke-width="1" />
          <text x="${len - 13.5}" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">+</text>

          <!-- Baling-Baling Dinamo 3 Daun Berputar -->
          <g id="dinamo-prop-${comp.id}" transform="rotate(${comp.spinAngle || 0}, ${propCenter}, 0)">
            <!-- Daun Baling 1 -->
            <path d="M ${propCenter} 0 C ${propCenter - 8} -14 ${propCenter - 10} -28 ${propCenter} -34 C ${propCenter + 10} -28 ${propCenter + 8} -14 ${propCenter} 0" fill="#06b6d4" stroke="#0891b2" stroke-width="1.2" />
            <line x1="${propCenter}" y1="0" x2="${propCenter}" y2="-28" stroke="#a5f3fc" stroke-width="1" opacity="0.75" />
            <!-- Daun Baling 2 (Rotasi 120°) -->
            <path d="M ${propCenter} 0 C ${propCenter - 8} -14 ${propCenter - 10} -28 ${propCenter} -34 C ${propCenter + 10} -28 ${propCenter + 8} -14 ${propCenter} 0" transform="rotate(120, ${propCenter}, 0)" fill="#06b6d4" stroke="#0891b2" stroke-width="1.2" />
            <line x1="${propCenter}" y1="0" x2="${propCenter}" y2="-28" transform="rotate(120, ${propCenter}, 0)" stroke="#a5f3fc" stroke-width="1" opacity="0.75" />
            <!-- Daun Baling 3 (Rotasi 240°) -->
            <path d="M ${propCenter} 0 C ${propCenter - 8} -14 ${propCenter - 10} -28 ${propCenter} -34 C ${propCenter + 10} -28 ${propCenter + 8} -14 ${propCenter} 0" transform="rotate(240, ${propCenter}, 0)" fill="#06b6d4" stroke="#0891b2" stroke-width="1.2" />
            <line x1="${propCenter}" y1="0" x2="${propCenter}" y2="-28" transform="rotate(240, ${propCenter}, 0)" stroke="#a5f3fc" stroke-width="1" opacity="0.75" />
            <!-- Hub Center Nose Cone -->
            <circle cx="${propCenter}" cy="0" r="6.5" fill="#f8fafc" stroke="#0284c7" stroke-width="2" />
            <circle cx="${propCenter}" cy="0" r="3" fill="#0284c7" />
          </g>
        `;
      } else if (comp.type === 'solar') {
        // Panel Surya Fotovoltaik (Silikon Monokristalin, Kisi Busbar & Frame Aluminium)
        const frameW = len - 28;
        const cellW = (frameW - 10) / 4;
        const cellH = 19;
        let cellsSvg = '';
        for (let r = 0; r < 2; r++) {
          const cy = -21 + r * 22;
          for (let c = 0; c < 4; c++) {
            const cx = 19 + c * cellW;
            cellsSvg += `
              <rect x="${cx}" y="${cy}" width="${cellW - 2}" height="${cellH}" fill="#1e3a8a" stroke="#1d4ed8" stroke-width="0.8" rx="1.5" />
              <line x1="${cx + (cellW - 2) / 2}" y1="${cy}" x2="${cx + (cellW - 2) / 2}" y2="${cy + cellH}" stroke="#93c5fd" stroke-width="0.8" opacity="0.8" />
              <line x1="${cx}" y1="${cy + cellH / 2}" x2="${cx + cellW - 2}" y2="${cy + cellH / 2}" stroke="#60a5fa" stroke-width="0.5" opacity="0.5" stroke-dasharray="2 2" />
            `;
          }
        }

        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-36" width="${len + 12}" height="72" rx="12" class="selection-halo" />
              <circle cx="-6" cy="-36" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-36" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="36" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="36" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="44" />
          <!-- Terminal (-) Kiri -->
          <line x1="0" y1="0" x2="14" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="4" y="-7" width="8" height="14" fill="#94a3b8" rx="2" stroke="#475569" stroke-width="1" />
          <text x="8" y="0" font-family="'Fredoka', sans-serif" font-size="12" font-weight="900" fill="#1e293b" text-anchor="middle" dominant-baseline="central">−</text>

          <!-- Terminal (+) Kanan -->
          <line x1="${len - 14}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="${len - 12}" y="-7" width="8" height="14" fill="#ef4444" rx="2" stroke="#dc2626" stroke-width="1" />
          <text x="${len - 8}" y="0" font-family="'Fredoka', sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">+</text>

          <!-- Rangka Luar Aluminium Kokoh -->
          <rect x="14" y="-26" width="${frameW}" height="52" fill="#e2e8f0" stroke="#475569" stroke-width="2.5" rx="5" />
          <!-- Papan Wafer Silikon Gelap -->
          <rect x="17" y="-23" width="${frameW - 6}" height="46" fill="#0f172a" rx="3" />

          <!-- Sel-Sel Surya Grid -->
          ${cellsSvg}

          <!-- Lapisan Pantulan Cahaya Kaca (Glossy Reflection Sheen) -->
          <polygon points="18,-23 52,-23 32,23 18,23" fill="#ffffff" opacity="0.12" />

          <!-- Badge Tegangan Surya Terang -->
          <g transform="translate(${len * 0.5}, 0)">
            <rect x="-26" y="-8.5" width="52" height="17" rx="8.5" fill="rgba(15, 23, 42, 0.9)" stroke="#f59e0b" stroke-width="1.5" />
            <text x="0" y="0" font-family="'Fredoka', sans-serif" font-size="9" font-weight="700" fill="#fef08a" text-anchor="middle" dominant-baseline="central">☀️ ${(comp.voltage !== undefined ? comp.voltage : 3.0).toFixed(1)}V</text>
          </g>
        `;
      } else if (comp.type === 'ammeter') {
        const valStr = comp.isShorted ? '> 10 A' : `${(comp.measuredCurrent || 0).toFixed(2)} A`;
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-24" width="${len + 12}" height="48" rx="10" class="selection-halo" />
              <circle cx="-6" cy="-24" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-24" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="24" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="24" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <!-- Terminal (-) Kiri -->
          <line x1="0" y1="0" x2="16" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="8" y="-7" width="8" height="14" fill="#94a3b8" rx="2" stroke="#475569" stroke-width="1" />
          <text x="12" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="900" fill="#1e293b" text-anchor="middle" dominant-baseline="central">−</text>

          <!-- Terminal (+) Kanan -->
          <line x1="${len - 16}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="${len - 16}" y="-7" width="8" height="14" fill="#ef4444" rx="2" stroke="#dc2626" stroke-width="1" />
          <text x="${len - 12}" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">+</text>

          <!-- Kotak Meter Digital Solid (Dark Slate dengan Bezel Hijau Teal) -->
          <rect x="16" y="-20" width="${len - 32}" height="40" fill="#1e293b" stroke="#059669" stroke-width="2" rx="6" />
          <!-- Label Header -->
          <text x="${len * 0.5}" y="-11" font-family="'Fredoka', sans-serif" font-size="7.5" font-weight="800" fill="#94a3b8" text-anchor="middle">AMPEREMETER</text>
          <!-- Layar LCD Hitam Pekat -->
          <rect x="22" y="-4" width="${len - 44}" height="20" fill="#064e3b" stroke="#047857" stroke-width="1.2" rx="3" />
          <!-- Nilai Arus Digital Hijau Terang -->
          <text x="${len * 0.5}" y="7" font-family="'JetBrains Mono', monospace, sans-serif" font-size="11" font-weight="900" fill="#4ade80" text-anchor="middle" dominant-baseline="central">${valStr}</text>
        `;
      } else if (comp.type === 'voltmeter') {
        const v1 = this.vertices.get(comp.v1Id);
        const v2 = this.vertices.get(comp.v2Id);
        let measuredV = 0;
        if (v1 && v2) {
          const p1 = this.vertexPotentials.has(v1.id) ? this.vertexPotentials.get(v1.id) : 0;
          const p2 = this.vertexPotentials.has(v2.id) ? this.vertexPotentials.get(v2.id) : 0;
          measuredV = Math.abs(p1 - p2);
        }
        const valStr = `${measuredV.toFixed(2)} V`;
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-24" width="${len + 12}" height="48" rx="10" class="selection-halo" />
              <circle cx="-6" cy="-24" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-24" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="24" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="24" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <!-- Terminal (-) Kiri -->
          <line x1="0" y1="0" x2="16" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="8" y="-7" width="8" height="14" fill="#94a3b8" rx="2" stroke="#475569" stroke-width="1" />
          <text x="12" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="900" fill="#1e293b" text-anchor="middle" dominant-baseline="central">−</text>

          <!-- Terminal (+) Kanan -->
          <line x1="${len - 16}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
          <rect x="${len - 16}" y="-7" width="8" height="14" fill="#ef4444" rx="2" stroke="#dc2626" stroke-width="1" />
          <text x="${len - 12}" y="0" font-family="'Fredoka', sans-serif" font-size="11" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="central">+</text>

          <!-- Kotak Meter Digital Solid (Dark Slate dengan Bezel Amber) -->
          <rect x="16" y="-20" width="${len - 32}" height="40" fill="#1e293b" stroke="#f59e0b" stroke-width="2" rx="6" />
          <!-- Label Header -->
          <text x="${len * 0.5}" y="-11" font-family="'Fredoka', sans-serif" font-size="7.5" font-weight="800" fill="#94a3b8" text-anchor="middle">VOLTMETER</text>
          <!-- Layar LCD Gelap Amber -->
          <rect x="22" y="-4" width="${len - 44}" height="20" fill="#451a03" stroke="#b45309" stroke-width="1.2" rx="3" />
          <!-- Nilai Tegangan Digital Kuning Emas Terang -->
          <text x="${len * 0.5}" y="7" font-family="'JetBrains Mono', monospace, sans-serif" font-size="11" font-weight="900" fill="#fef08a" text-anchor="middle" dominant-baseline="central">${valStr}</text>
        `;
      } else {
        // Fallback for other items
        return `
          ${isSelected ? `
            <g class="selection-highlight">
              <rect x="-6" y="-20" width="${len + 12}" height="40" rx="10" class="selection-halo" />
              <circle cx="-6" cy="-20" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="-20" r="3.5" class="selection-corner" />
              <circle cx="-6" cy="20" r="3.5" class="selection-corner" />
              <circle cx="${len + 6}" cy="20" r="3.5" class="selection-corner" />
            </g>
          ` : ''}
          <line x1="0" y1="0" x2="${len}" y2="0" class="component-body-outline" stroke="transparent" stroke-width="40" />
          <rect x="15" y="-12" width="${len - 30}" height="24" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" rx="6" />
          <text x="${len * 0.35}" y="0" font-size="16" dominant-baseline="central" text-anchor="middle">${comp.def.icon || '📦'}</text>
          <text x="${len * 0.65}" y="0" font-family="'Fredoka', sans-serif" font-size="10" font-weight="700" fill="#475569" dominant-baseline="central" text-anchor="middle">${comp.def.title}</text>
          <line x1="0" y1="0" x2="15" y2="0" stroke="#64748b" stroke-width="5" />
          <line x1="${len - 15}" y1="0" x2="${len}" y2="0" stroke="#64748b" stroke-width="5" />
        `;
      }
    }

    renderBulbVisuals() {
      // Fast re-render of components to update lit bulb glow and switch states
      this.render();
    }

    // ==========================================================================
    // 10. Particle Flow Animation Loop (Elektron vs Arus Konvensional)
    // ==========================================================================
    startAnimationLoop() {
      const loop = () => {
        const isAnyConducting = this.components.some(c => c.isConducting);
        if (isAnyConducting && this.circuitVoltage > 0) {
          const speed = Math.min(3.0, Math.max(0.4, (this.circuitVoltage / 1.5) * 0.8));
          this.electronAnimOffset += speed;
        } else if (isAnyConducting && this.components.some(c => c.isShorted)) {
          this.electronAnimOffset += 3.5;
        }

        // Putar baling-baling dinamo secara dinamis jika dinamo aktif dan ada tegangan
        if (this.circuitVoltage > 0) {
          const spinSpeed = Math.min(25, Math.max(4, (this.circuitVoltage / 1.5) * 12));
          this.components.forEach(c => {
            if (c.type === 'dinamo' && c.isConducting) {
              c.spinAngle = ((c.spinAngle || 0) + spinSpeed) % 360;
              const propGroup = document.getElementById(`dinamo-prop-${c.id}`);
              if (propGroup) {
                const len = c.def ? c.def.defaultLen : 110;
                const propCenter = len * 0.76;
                propGroup.setAttribute('transform', `rotate(${c.spinAngle}, ${propCenter}, 0)`);
              }
            }
          });
        }

        this.renderParticles();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    renderParticles() {
      if (this.flowMode === 'none') {
        if (this.electronsGroup.hasChildNodes()) this.electronsGroup.innerHTML = '';
        return;
      }

      const conductingComps = this.components.filter(c => c.isConducting);
      if (conductingComps.length === 0 || (this.circuitVoltage <= 0 && !this.components.some(c => c.isShorted))) {
        if (this.electronsGroup.hasChildNodes()) this.electronsGroup.innerHTML = '';
        return;
      }

      this.electronsGroup.innerHTML = '';

      conductingComps.forEach(comp => {
        // Arah aliran:
        // Arus konvensional: mengalir dari comp.currentFromVId ke comp.currentToVId (+ ke -)
        // Aliran elektron: mengalir dari comp.currentToVId ke comp.currentFromVId (- ke +)
        let startVId, endVId;
        if (this.flowMode === 'electrons') {
          startVId = comp.currentToVId || comp.v2Id;
          endVId = comp.currentFromVId || comp.v1Id;
        } else {
          startVId = comp.currentFromVId || comp.v1Id;
          endVId = comp.currentToVId || comp.v2Id;
        }

        const vStart = this.vertices.get(startVId);
        const vEnd = this.vertices.get(endVId);
        if (!vStart || !vEnd) return;

        const dx = vEnd.x - vStart.x;
        const dy = vEnd.y - vStart.y;
        const len = Math.hypot(dx, dy);
        if (len < 16) return;

        const spacing = 28; // Jarak antar partikel
        const count = Math.max(2, Math.floor(len / spacing));
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        for (let i = 0; i < count; i++) {
          const progress = ((this.electronAnimOffset + (i * spacing)) % len) / len;
          const px = vStart.x + dx * progress;
          const py = vStart.y + dy * progress;

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

          if (this.flowMode === 'electrons') {
            g.setAttribute('class', 'electron-particle');
            g.setAttribute('transform', `translate(${px}, ${py})`);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'electron-circle');
            circle.setAttribute('r', '7');
            g.appendChild(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('class', 'electron-text');
            text.textContent = '−';
            g.appendChild(text);
          } else {
            // Arus Konvensional: Panah oranye terarah
            g.setAttribute('class', 'current-arrow-particle');
            g.setAttribute('transform', `translate(${px}, ${py}) rotate(${angle})`);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('class', 'current-arrow-shape');
            path.setAttribute('d', 'M -6 -5 L 5 0 L -6 5 L -3 0 Z');
            g.appendChild(path);
          }

          this.electronsGroup.appendChild(g);
        }
      });
    }

    // ==========================================================================
    // 11. Missions & Challenges
    // ==========================================================================
    updateMissionUI() {
      const mission = MISSIONS[this.currentMissionIdx];
      if (!mission) return;
      document.getElementById('mission-badge').textContent = mission.badge;
      document.getElementById('mission-text').textContent = `${mission.title}: ${mission.instruction}`;
      this.checkMissions();
    }

    nextMission() {
      if (this.currentMissionIdx < MISSIONS.length - 1) {
        this.currentMissionIdx++;
        this.updateMissionUI();
        this.showToast(`Memulai ${MISSIONS[this.currentMissionIdx].badge}! 🚀`, 'normal');
      } else {
        this.showToast('Selamat! Semua misi telah diselesaikan dengan gemilang! 🏆🌟', 'success');
      }
    }

    checkMissions() {
      if (this.currentMode !== 'missions') return;
      const mission = MISSIONS[this.currentMissionIdx];
      if (!mission) return;

      if (!this.missionCompleted[mission.id] && mission.check(this)) {
        this.missionCompleted[mission.id] = true;
        this.sound.playFanfare();

        const modalSuccess = document.getElementById('modal-success');
        document.getElementById('celebrate-title').textContent = `${mission.badge} Berhasil! 🎉`;
        document.getElementById('celebrate-desc').textContent = `Hebat! Kamu berhasil menyelesaikan: "${mission.title}".`;
        modalSuccess.classList.remove('hidden');
      }
    }

    showToast(message, type = 'normal') {
      this.statusMsg.textContent = message;
      this.statusToast.className = 'status-toast';
      if (type === 'alert') {
        this.statusToast.classList.add('alert');
        this.statusIcon.textContent = '⚠️';
      } else if (type === 'success') {
        this.statusToast.classList.add('success');
        this.statusIcon.textContent = '🎉';
      } else {
        this.statusIcon.textContent = '💡';
      }
    }
  }

  // Initialize simulation on window load
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new CircuitSimApp();
  });
})();
