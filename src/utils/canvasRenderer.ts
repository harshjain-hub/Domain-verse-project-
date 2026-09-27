import { ColormapType, WindowingPreset, PatientCase } from '../types/clinical';

// Colormap lookup helper
export function getColormapRgb(
  value: number, // 0.0 to 1.0
  colormap: ColormapType,
): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));

  switch (colormap) {
    case 'jet': {
      // Classic Thermal Jet: Blue -> Cyan -> Green -> Yellow -> Red
      const fourV = 4 * v;
      const r = Math.max(0, Math.min(1, Math.min(fourV - 1.5, -fourV + 4.5)));
      const g = Math.max(0, Math.min(1, Math.min(fourV - 0.5, -fourV + 3.5)));
      const b = Math.max(0, Math.min(1, Math.min(fourV + 0.5, -fourV + 2.5)));
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    case 'turbo': {
      // Perceptually smooth rainbow Turbo
      const r = Math.sin(Math.PI * (v - 0.2)) * 0.5 + 0.5;
      const g = Math.sin(Math.PI * (v - 0.05)) * 0.5 + 0.5;
      const b = Math.sin(Math.PI * (v + 0.3)) * 0.5 + 0.5;
      return [
        Math.round(Math.min(255, Math.max(0, r * 255))),
        Math.round(Math.min(255, Math.max(0, g * 255))),
        Math.round(Math.min(255, Math.max(0, b * 255))),
      ];
    }

    case 'inferno': {
      // Black -> Purple -> Orange -> Bright Yellow
      const r = Math.min(255, Math.round(Math.pow(v, 0.7) * 255));
      const g = Math.min(255, Math.round(Math.pow(v, 2.0) * 240));
      const b = Math.min(255, Math.round(Math.sin(v * Math.PI) * 160 + (v > 0.8 ? (v - 0.8) * 400 : 0)));
      return [r, g, b];
    }

    case 'viridis':
    default: {
      // Deep Purple -> Teal -> Bright Yellow (Colorblind safe)
      const r = Math.round(255 * (-0.019 + 0.169 * v + 0.985 * v * v));
      const g = Math.round(255 * (0.013 + 0.812 * v - 0.125 * v * v));
      const b = Math.round(255 * (0.334 + 0.449 * v - 0.783 * v * v));
      return [
        Math.max(0, Math.min(255, r)),
        Math.max(0, Math.min(255, g)),
        Math.max(0, Math.min(255, b)),
      ];
    }
  }
}

/**
 * Draws the anatomical Chest Radiograph with pathology features
 */
export function drawChestRadiograph(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  caseData: PatientCase,
  windowing: WindowingPreset,
  inverted: boolean,
) {
  // Clear canvas
  ctx.save();

  // Background tone based on windowing
  let bgR = 14;
  let bgG = 18;
  let bgB = 24;
  if (inverted) {
    bgR = 230;
    bgG = 235;
    bgB = 240;
  }
  ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
  ctx.fillRect(0, 0, width, height);

  // Soft background radiation vignette
  const radialBg = ctx.createRadialGradient(
    width / 2,
    height * 0.48,
    width * 0.1,
    width / 2,
    height * 0.48,
    width * 0.65,
  );
  radialBg.addColorStop(0, inverted ? 'rgba(210, 215, 225, 0.4)' : 'rgba(30, 38, 52, 0.6)');
  radialBg.addColorStop(1, inverted ? 'rgba(240, 243, 248, 0.8)' : 'rgba(10, 14, 20, 0.9)');
  ctx.fillStyle = radialBg;
  ctx.fillRect(0, 0, width, height);

  const boneColor = inverted ? 'rgba(30, 35, 45, 0.85)' : 'rgba(220, 230, 245, 0.75)';
  const softBoneColor = inverted ? 'rgba(50, 60, 75, 0.45)' : 'rgba(180, 195, 215, 0.45)';
  const lungFieldDark = inverted ? 'rgba(255, 255, 255, 0.95)' : 'rgba(18, 24, 32, 0.95)';
  const denseOpacityColor = inverted ? 'rgba(40, 48, 60, 0.75)' : 'rgba(215, 228, 245, 0.75)';

  // 1. Thoracic cage & spine silhouette
  ctx.strokeStyle = softBoneColor;
  ctx.lineWidth = 14;
  ctx.beginPath();
  // Spine midline
  ctx.moveTo(width * 0.5, height * 0.08);
  ctx.lineTo(width * 0.5, height * 0.88);
  ctx.stroke();

  // Clavicles
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(width * 0.22, height * 0.18);
  ctx.quadraticCurveTo(width * 0.36, height * 0.22, width * 0.48, height * 0.20);
  ctx.moveTo(width * 0.78, height * 0.18);
  ctx.quadraticCurveTo(width * 0.64, height * 0.22, width * 0.52, height * 0.20);
  ctx.stroke();

  // Ribs arching bilaterally
  ctx.lineWidth = 4;
  for (let i = 1; i <= 8; i++) {
    const yRib = height * (0.22 + i * 0.07);
    // Left ribs (radiological right)
    ctx.beginPath();
    ctx.moveTo(width * 0.48, yRib);
    ctx.bezierCurveTo(
      width * 0.32,
      yRib + height * 0.03,
      width * 0.18,
      yRib + height * 0.06,
      width * 0.16,
      yRib + height * 0.02,
    );
    ctx.stroke();

    // Right ribs (radiological left)
    ctx.beginPath();
    ctx.moveTo(width * 0.52, yRib);
    ctx.bezierCurveTo(
      width * 0.68,
      yRib + height * 0.03,
      width * 0.82,
      yRib + height * 0.06,
      width * 0.84,
      yRib + height * 0.02,
    );
    ctx.stroke();
  }

  // 2. Lung fields
  const isPneumo = caseData.id === 'CASE-PNEUMO-04';
  const isADHF = caseData.id === 'CASE-ADHF-02';
  const isSepsis = caseData.id === 'CASE-SEPSIS-03';
  const isPE = caseData.id === 'CASE-PE-01';

  // Right lung field (anatomical patient right = screen left)
  ctx.fillStyle = lungFieldDark;
  ctx.beginPath();
  ctx.moveTo(width * 0.45, height * 0.18);
  ctx.bezierCurveTo(width * 0.20, height * 0.18, width * 0.14, height * 0.35, width * 0.15, height * 0.76);
  ctx.quadraticCurveTo(width * 0.32, height * 0.84, width * 0.45, height * 0.78);
  ctx.closePath();
  ctx.fill();

  // Left lung field (anatomical patient left = screen right)
  ctx.beginPath();
  if (isPneumo) {
    // Collapsed lung towards hilum on left
    ctx.moveTo(width * 0.54, height * 0.28);
    ctx.bezierCurveTo(width * 0.60, height * 0.32, width * 0.62, height * 0.52, width * 0.56, height * 0.62);
    ctx.closePath();
    ctx.fill();

    // Hyperlucent air filling the rest of the left hemithorax
    ctx.fillStyle = inverted ? 'rgba(255, 255, 255, 1.0)' : 'rgba(4, 6, 10, 0.98)';
    ctx.beginPath();
    ctx.moveTo(width * 0.55, height * 0.18);
    ctx.bezierCurveTo(width * 0.80, height * 0.18, width * 0.86, height * 0.35, width * 0.85, height * 0.82);
    ctx.quadraticCurveTo(width * 0.68, height * 0.88, width * 0.55, height * 0.78);
    ctx.closePath();
    ctx.fill();

    // Draw visible visceral pleural line
    ctx.strokeStyle = inverted ? 'rgba(20, 20, 20, 0.9)' : 'rgba(240, 240, 250, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(width * 0.58, height * 0.28);
    ctx.bezierCurveTo(width * 0.64, height * 0.38, width * 0.66, height * 0.54, width * 0.58, height * 0.64);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.moveTo(width * 0.55, height * 0.18);
    ctx.bezierCurveTo(width * 0.80, height * 0.18, width * 0.86, height * 0.35, width * 0.85, height * 0.76);
    ctx.quadraticCurveTo(width * 0.68, height * 0.84, width * 0.55, height * 0.78);
    ctx.closePath();
    ctx.fill();
  }

  // 3. Cardiac Silhouette & Mediastinum
  ctx.fillStyle = softBoneColor;
  ctx.beginPath();
  let heartOffset = 0;
  let heartScale = 1.0;

  if (isPneumo) {
    heartOffset = -width * 0.08; // Shifted to right (screen left)
  }
  if (isADHF) {
    heartScale = 1.35; // Cardiomegaly (CTR > 0.65)
  }

  const cardiacCenter = width * 0.5 + heartOffset;
  ctx.moveTo(cardiacCenter, height * 0.24);
  // Aortic arch knob
  ctx.bezierCurveTo(
    cardiacCenter + width * 0.06,
    height * 0.26,
    cardiacCenter + width * 0.05,
    height * 0.34,
    cardiacCenter + width * 0.03,
    height * 0.40,
  );
  // Left cardiac border (apex)
  ctx.bezierCurveTo(
    cardiacCenter + width * 0.06 * heartScale,
    height * 0.52,
    cardiacCenter + width * 0.18 * heartScale,
    height * 0.70,
    cardiacCenter + width * 0.08 * heartScale,
    height * 0.80,
  );
  // Right cardiac border
  ctx.lineTo(cardiacCenter - width * 0.08 * heartScale, height * 0.80);
  ctx.bezierCurveTo(
    cardiacCenter - width * 0.12 * heartScale,
    height * 0.68,
    cardiacCenter - width * 0.08,
    height * 0.48,
    cardiacCenter,
    height * 0.24,
  );
  ctx.closePath();
  ctx.fill();

  // 4. Case-Specific Pathological Infiltrates
  if (isPE) {
    // Hampton's Hump wedge-shaped peripheral opacity in right lower lateral zone
    ctx.fillStyle = denseOpacityColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.26, height * 0.62);
    ctx.lineTo(width * 0.16, height * 0.70);
    ctx.lineTo(width * 0.22, height * 0.78);
    ctx.closePath();
    ctx.fill();

    // Oligemia markings
    ctx.strokeStyle = inverted ? 'rgba(80, 90, 110, 0.4)' : 'rgba(160, 180, 205, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.42, height * 0.44);
    ctx.lineTo(width * 0.36, height * 0.54);
    ctx.stroke();
  }

  if (isADHF) {
    // Bat-wing perihilar alveolar edema & Kerley B lines
    const edemaGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.52,
      width * 0.04,
      width * 0.5,
      height * 0.52,
      width * 0.28,
    );
    edemaGrad.addColorStop(0, inverted ? 'rgba(40, 50, 65, 0.8)' : 'rgba(220, 230, 248, 0.8)');
    edemaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = edemaGrad;
    ctx.fillRect(width * 0.22, height * 0.36, width * 0.56, height * 0.34);

    // Blunted bilateral costophrenic angles (pleural effusions)
    ctx.fillStyle = denseOpacityColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.14, height * 0.74);
    ctx.quadraticCurveTo(width * 0.20, height * 0.77, width * 0.26, height * 0.82);
    ctx.lineTo(width * 0.14, height * 0.82);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width * 0.86, height * 0.74);
    ctx.quadraticCurveTo(width * 0.80, height * 0.77, width * 0.74, height * 0.82);
    ctx.lineTo(width * 0.86, height * 0.82);
    ctx.closePath();
    ctx.fill();
  }

  if (isSepsis) {
    // Dense right middle and lower lobar consolidation with air bronchograms
    ctx.fillStyle = denseOpacityColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.24, height * 0.52);
    ctx.bezierCurveTo(width * 0.38, height * 0.54, width * 0.42, height * 0.72, width * 0.36, height * 0.78);
    ctx.bezierCurveTo(width * 0.22, height * 0.80, width * 0.18, height * 0.68, width * 0.24, height * 0.52);
    ctx.closePath();
    ctx.fill();

    // Dark branching air bronchograms inside the consolidation
    ctx.strokeStyle = lungFieldDark;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.30, height * 0.56);
    ctx.lineTo(width * 0.28, height * 0.66);
    ctx.lineTo(width * 0.24, height * 0.74);
    ctx.moveTo(width * 0.28, height * 0.66);
    ctx.lineTo(width * 0.34, height * 0.72);
    ctx.stroke();
  }

  // Diaphragm arches
  ctx.strokeStyle = boneColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  // Right hemidiaphragm
  ctx.moveTo(width * 0.14, height * 0.80);
  ctx.quadraticCurveTo(width * 0.30, height * 0.73, width * 0.48, height * 0.78);
  // Left hemidiaphragm
  ctx.moveTo(width * 0.52, height * 0.80);
  ctx.quadraticCurveTo(width * 0.70, height * 0.76, width * 0.86, height * 0.82);
  ctx.stroke();

  // Windowing adjustments
  if (windowing === 'lung') {
    // Sharpen / high-pass contrast
    ctx.fillStyle = inverted ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)';
    ctx.fillRect(0, 0, width, height);
  } else if (windowing === 'bone') {
    ctx.strokeStyle = inverted ? '#111' : '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
  }

  ctx.restore();
}

/**
 * Renders the Grad-CAM saliency heatmap on top of the canvas
 */
export function drawGradCamHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  caseData: PatientCase,
  colormap: ColormapType,
  opacity: number, // 0.0 to 1.0
  threshold: number, // 0.0 to 1.0
) {
  if (opacity <= 0.01) return;

  // Create an offscreen buffer for heatmap calculation
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  const imgData = offCtx.createImageData(width, height);
  const data = imgData.data;

  // Pre-calculate field intensities across the image
  const regions = caseData.gradCamRegion;
  const numRegions = regions.length;

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      let totalActivation = 0;

      for (let r = 0; r < numRegions; r++) {
        const reg = regions[r];
        const dx = (nx - reg.cx) / (reg.rx || 0.1);
        const dy = (ny - reg.cy) / (reg.ry || 0.1);
        const distSq = dx * dx + dy * dy;
        const gaussian = Math.exp(-distSq * 2.2);
        totalActivation += gaussian * reg.intensity;
      }

      // Clamp activation
      const act = Math.min(1.0, totalActivation);

      if (act >= threshold) {
        // Normalize between threshold and 1.0
        const normalizedAct = (act - threshold) / (1.0 - threshold);
        const [rVal, gVal, bVal] = getColormapRgb(normalizedAct, colormap);
        const pixelIdx = (y * width + x) * 4;

        data[pixelIdx] = rVal;
        data[pixelIdx + 1] = gVal;
        data[pixelIdx + 2] = bVal;
        // Alpha smooth curve
        data[pixelIdx + 3] = Math.round(normalizedAct * opacity * 230);
      }
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  // Blend onto main canvas
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}
