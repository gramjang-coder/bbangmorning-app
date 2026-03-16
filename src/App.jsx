import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────
const BRAND_ORANGE = '#FF4B00';
const BRAND_CREAM = '#FDFAF4';

const FILTERS = {
  original:  { label: '원본',          brightness: 100, contrast: 100, saturate: 100, extras: '', tint: null, vignette: false },
  iphone5s:  { label: 'iPhone 5s',     brightness: 105, contrast: 90,  saturate: 80,  extras: 'sepia(0.22)', tint: 'rgba(210,170,120,0.07)', vignette: false },
  iphone6:   { label: 'iPhone 6',      brightness: 108, contrast: 105, saturate: 115, extras: 'sepia(0.15)', tint: 'rgba(255,220,180,0.06)', vignette: false },
  iphone6s:  { label: 'iPhone 6s',     brightness: 106, contrast: 108, saturate: 105, extras: 'sepia(0.12) hue-rotate(-3deg)', tint: 'rgba(255,200,190,0.05)', vignette: false },
  iphoneSE:  { label: 'iPhone SE',     brightness: 98,  contrast: 110, saturate: 95,  extras: 'sepia(0.18)', tint: 'rgba(200,160,120,0.06)', vignette: false },
  portra:    { label: 'Portra 400',    brightness: 106, contrast: 92,  saturate: 95,  extras: 'sepia(0.18)', tint: 'rgba(220,180,140,0.06)', vignette: false },
  kodakGold: { label: 'Kodak Gold',    brightness: 110, contrast: 105, saturate: 125, extras: 'sepia(0.15) hue-rotate(-8deg)', tint: 'rgba(255,180,50,0.07)', vignette: false },
  vscoA6:    { label: 'VSCO A6',       brightness: 108, contrast: 90,  saturate: 90,  extras: 'sepia(0.12)', tint: 'rgba(255,230,200,0.05)', vignette: false },
  clarendon: { label: 'Clarendon',     brightness: 108, contrast: 118, saturate: 130, extras: '', tint: null, vignette: false },
  juno:      { label: 'Juno',          brightness: 105, contrast: 105, saturate: 120, extras: 'sepia(0.08) hue-rotate(-5deg)', tint: 'rgba(255,160,60,0.05)', vignette: false },
  foodieYum: { label: 'Foodie YUM',    brightness: 110, contrast: 108, saturate: 118, extras: 'sepia(0.1)', tint: 'rgba(255,200,140,0.06)', vignette: false },
  dazz:      { label: 'Dazz',          brightness: 108, contrast: 92,  saturate: 80,  extras: 'sepia(0.15) hue-rotate(5deg)', tint: 'rgba(255,220,200,0.07)', vignette: false },
  moody:     { label: 'Moody',         brightness: 92,  contrast: 120, saturate: 90,  extras: 'sepia(0.25) hue-rotate(-5deg)', tint: null, vignette: true },
};

const STICKER_TABS = [
  { key: 'brand', label: '빵모닝', items: [
    ...Array.from({length:16}, (_,i) => `/stickers/bbangmorning/skku2_${i+1}.png`),
    ...Array.from({length:14}, (_,i) => `/stickers/bbangmorning/skku1_${i+1}.png`),
    ...Array.from({length:15}, (_,i) => `/stickers/bbangmorning/winter_${i+1}.png`),
  ]},
  { key: 'mudo', label: '무도', items:
    Array.from({length:19}, (_,i) => `/stickers/mudo/mudo_${i+1}.png`) },
  { key: 'dessert', label: '디저트', items:
    Array.from({length:8}, (_,i) => `/stickers/dessert/dessert_${i+1}.png`) },
];

const TEXT_COLORS = ['#FF4B00','#000000','#FFFFFF','#E74C3C','#3498DB','#2ECC71','#9B59B6','#F39C12'];

const ASPECT_RATIOS = [
  { key: '1:1',  label: '1:1',  w: 1, h: 1 },
  { key: '3:4',  label: '3:4',  w: 3, h: 4 },
  { key: '4:3',  label: '4:3',  w: 4, h: 3 },
  { key: '9:16', label: '9:16', w: 9, h: 16 },
  { key: '4:5',  label: '4:5',  w: 4, h: 5 },
];

const PHOTO_GUIDES = [
  { icon: '☀️', tip: '해를 등지고 찍기' },
  { icon: '🔍', tip: '2배 줌 활용' },
  { icon: '📏', tip: '빵과 배경선 일직선' },
];

// ─── App ─────────────────────────────────────────────────────────
export default function App() {
  // ─── State ───
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState('filter');
  const [selectedFilter, setSelectedFilter] = useState('original');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [filterExtras, setFilterExtras] = useState('');
  const [filterTint, setFilterTint] = useState(null);
  const [filterVignette, setFilterVignette] = useState(false);
  const [stickers, setStickers] = useState([]);
  const [texts, setTexts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [stickerTab, setStickerTab] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState(BRAND_ORANGE);
  const [textStroke, setTextStroke] = useState(null);
  const [textStrokeWidth, setTextStrokeWidth] = useState(2);
  const [textBgBox, setTextBgBox] = useState(null);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [guidePage, setGuidePage] = useState(0);
  const [photoTip, setPhotoTip] = useState(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraFilter, setCameraFilter] = useState('original');
  const [facingMode, setFacingMode] = useState('environment');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [editingTextId, setEditingTextId] = useState(null);

  // ─── Refs ───
  const containerRef = useRef(null);
  const imgObjRef = useRef(null);
  const dragRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ─── Computed ───
  const filterStr = `brightness(${brightness / 100}) contrast(${contrast / 100}) saturate(${saturation / 100}) ${filterExtras}`.trim();
  const ar = ASPECT_RATIOS.find(r => r.key === aspectRatio) || ASPECT_RATIOS[0];
  const paddingRatio = `${(ar.h / ar.w) * 100}%`;

  // ─── Pointer drag (document-level) ───
  useEffect(() => {
    const handleMove = (e) => {
      if (!dragRef.current) return;
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const { id, type, mode, offsetX, offsetY, centerX, centerY } = dragRef.current;
      const setter = type === 'sticker' ? setStickers : setTexts;

      if (mode === 'move') {
        const x = ((e.clientX - rect.left - offsetX) / rect.width) * 100;
        const y = ((e.clientY - rect.top - offsetY) / rect.height) * 100;
        setter(prev => prev.map(it => it.id === id
          ? { ...it, x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) } : it));
      } else if (mode === 'resize') {
        const dx = e.clientX - rect.left - centerX;
        const dy = e.clientY - rect.top - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const newSize = Math.max(20, Math.min(200, dist * 2));
        setter(prev => prev.map(it => it.id === id ? { ...it, size: newSize } : it));
      } else if (mode === 'rotate') {
        const dx = e.clientX - rect.left - centerX;
        const dy = e.clientY - rect.top - centerY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        setter(prev => prev.map(it => it.id === id ? { ...it, rotation: angle } : it));
      }
    };
    const handleUp = () => { dragRef.current = null; };
    document.addEventListener('pointermove', handleMove, { passive: false });
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  // ─── Camera ───
  const startCamera = useCallback(async (facing) => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing || facingMode, width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('카메라에 접근할 수 없습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      setCameraMode(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const f = FILTERS[cameraFilter];
    const camFilterStr = `brightness(${f.brightness/100}) contrast(${f.contrast/100}) saturate(${f.saturate/100}) ${f.extras}`.trim();

    // 비율에 맞춰 center-crop
    const vw = video.videoWidth, vh = video.videoHeight;
    const targetRatio = ar.w / ar.h;
    const videoRatio = vw / vh;
    let sw, sh;
    if (videoRatio > targetRatio) { sh = vh; sw = vh * targetRatio; }
    else { sw = vw; sh = vw / targetRatio; }
    const sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    const outW = Math.round(sw), outH = Math.round(sh);

    const canvas = document.createElement('canvas');
    canvas.width = outW; canvas.height = outH;
    const ctx = canvas.getContext('2d');
    ctx.filter = camFilterStr;
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    ctx.filter = 'none';
    if (f.tint) { ctx.fillStyle = f.tint; ctx.fillRect(0, 0, outW, outH); }
    if (f.vignette) {
      const r = Math.max(outW, outH);
      const grad = ctx.createRadialGradient(outW/2, outH/2, r*0.25, outW/2, outH/2, r*0.7);
      grad.addColorStop(0, 'transparent'); grad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, outW, outH);
    }

    const base64 = canvas.toDataURL('image/png');
    setImage(base64);
    applyFilter(cameraFilter);
    const img = new Image();
    img.onload = () => { imgObjRef.current = img; };
    img.src = base64;
    stopCamera();
  }, [cameraFilter, stopCamera, ar]);

  const flipCamera = useCallback(() => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  }, [facingMode, startCamera]);

  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  // ─── Handlers ───
  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setImage(base64);
      const img = new Image();
      img.onload = () => {
        imgObjRef.current = img;
        // 밝기 분석 → 팁 표시
        const c = document.createElement('canvas');
        const sz = 100;
        c.width = sz; c.height = sz;
        const cx = c.getContext('2d');
        cx.drawImage(img, 0, 0, sz, sz);
        const d = cx.getImageData(0, 0, sz, sz).data;
        let sum = 0;
        for (let i = 0; i < d.length; i += 4) sum += (d[i] + d[i+1] + d[i+2]) / 3;
        const avg = sum / (sz * sz);
        if (avg < 85) setPhotoTip("💡 조명이 아쉬워요! '아이폰6' 필터를 추천해요");
        else if (avg > 180) setPhotoTip("✨ 밝기 좋아요! '카페 감성' 필터가 잘 어울려요");
        else setPhotoTip("👍 좋은 사진이에요! 필터로 감성을 더해보세요");
        setTimeout(() => setPhotoTip(null), 3500);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const applyFilter = (key) => {
    const f = FILTERS[key];
    setSelectedFilter(key);
    setBrightness(f.brightness);
    setContrast(f.contrast);
    setSaturation(f.saturate);
    setFilterExtras(f.extras);
    setFilterTint(f.tint || null);
    setFilterVignette(!!f.vignette);
  };

  const addSticker = (content, type = 'image') => {
    const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setStickers(prev => [...prev, {
      id, type, content,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 60, rotation: 0,
    }]);
  };

  const addText = () => {
    if (!textInput.trim()) return;
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setTexts(prev => [...prev, {
      id, text: textInput.trim(), color: textColor,
      stroke: textStroke, strokeWidth: textStrokeWidth,
      bgBox: textBgBox,
      bold: textBold, italic: textItalic,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      size: 20, rotation: 0,
    }]);
    setTextInput('');
  };

  const startDrag = (e, id, type, mode = 'move') => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const items = type === 'sticker' ? stickers : texts;
    const item = items.find(i => i.id === id);
    if (!item) return;
    const centerX = (item.x / 100) * rect.width;
    const centerY = (item.y / 100) * rect.height;
    dragRef.current = {
      id, type, mode, centerX, centerY,
      offsetX: e.clientX - rect.left - centerX,
      offsetY: e.clientY - rect.top - centerY,
    };
    setSelectedId(id);
    setSelectedType(type);
  };

  const deleteSelected = () => {
    if (selectedType === 'sticker') {
      setStickers(prev => prev.filter(s => s.id !== selectedId));
    } else {
      setTexts(prev => prev.filter(t => t.id !== selectedId));
    }
    deselect();
  };

  const deselect = () => { setSelectedId(null); setSelectedType(null); setEditingTextId(null); };

  const resetAll = () => {
    setImage(null);
    setStickers([]);
    setTexts([]);
    deselect();
    applyFilter('original');
    setTextInput('');
    setTextColor(BRAND_ORANGE);
    setStickerTab(0);
    setActiveTab('filter');
    setGuidePage(0);
    setPhotoTip(null);
    setAspectRatio('1:1');
    imgObjRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Canvas Download ───
  const handleDownload = () => {
    if (!image || !imgObjRef.current) return;
    const displayW = containerRef.current.offsetWidth;
    const displayH = containerRef.current.offsetHeight;
    const scale = 3;
    const cW = displayW * scale;
    const cH = displayH * scale;
    const canvas = document.createElement('canvas');
    canvas.width = cW;
    canvas.height = cH;
    const ctx = canvas.getContext('2d');

    // 1) Draw image (object-fit: cover → center-crop to ratio)
    ctx.filter = filterStr;
    const img = imgObjRef.current;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const targetRatio = ar.w / ar.h;
    const imgRatio = nw / nh;
    let sx, sy, sw, sh;
    if (imgRatio > targetRatio) { sh = nh; sw = nh * targetRatio; }
    else { sw = nw; sh = nw / targetRatio; }
    sx = (nw - sw) / 2; sy = (nh - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cW, cH);
    ctx.filter = 'none';

    // 1b) Tint overlay
    if (filterTint) {
      ctx.fillStyle = filterTint;
      ctx.fillRect(0, 0, cW, cH);
    }
    // 1c) Vignette overlay
    if (filterVignette) {
      const r = Math.max(cW, cH);
      const grad = ctx.createRadialGradient(cW / 2, cH / 2, r * 0.25, cW / 2, cH / 2, r * 0.7);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cW, cH);
    }

    // 2) Stickers (image-based, drawn via preloaded cache)
    const stickerPromises = stickers.map(s => new Promise((resolve) => {
      const sImg = new Image();
      sImg.crossOrigin = 'anonymous';
      sImg.onload = () => resolve({ ...s, imgEl: sImg });
      sImg.onerror = () => resolve({ ...s, imgEl: null });
      sImg.src = s.content;
    }));
    Promise.all(stickerPromises).then((loaded) => {
      loaded.forEach(s => {
        if (!s.imgEl) return;
        const x = (s.x / 100) * cW;
        const y = (s.y / 100) * cH;
        const sz = s.size * scale;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((s.rotation || 0) * Math.PI / 180);
        const nw = s.imgEl.naturalWidth || sz;
        const nh = s.imgEl.naturalHeight || sz;
        const ratio = nw / nh;
        const dw = ratio >= 1 ? sz : sz * ratio;
        const dh = ratio >= 1 ? sz / ratio : sz;
        ctx.drawImage(s.imgEl, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      });

      // 3) Texts
      texts.forEach(t => {
        const x = (t.x / 100) * cW;
        const y = (t.y / 100) * cH;
        const fs = t.size * scale;
        const fStyle = t.italic ? 'italic' : 'normal';
        const fWeight = t.bold ? 'bold' : 'normal';
        ctx.font = `${fStyle} ${fWeight} ${fs}px -apple-system, BlinkMacSystemFont, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((t.rotation || 0) * Math.PI / 180);
        if (t.bgBox) {
          const m = ctx.measureText(t.text);
          const px = fs * 0.4;
          const py = fs * 0.25;
          ctx.fillStyle = t.bgBox;
          ctx.beginPath();
          const rr = fs * 0.2;
          const bx = -m.width / 2 - px, by = -fs / 2 - py, bw = m.width + px * 2, bh = fs + py * 2;
          ctx.moveTo(bx + rr, by); ctx.lineTo(bx + bw - rr, by);
          ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + rr);
          ctx.lineTo(bx + bw, by + bh - rr);
          ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - rr, by + bh);
          ctx.lineTo(bx + rr, by + bh);
          ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - rr);
          ctx.lineTo(bx, by + rr);
          ctx.quadraticCurveTo(bx, by, bx + rr, by);
          ctx.closePath(); ctx.fill();
        }
        if (t.stroke) {
          ctx.lineJoin = 'round';
          ctx.strokeStyle = t.stroke;
          ctx.lineWidth = (t.strokeWidth || 1) * scale;
          ctx.strokeText(t.text, 0, 0);
        }
        ctx.fillStyle = t.color;
        ctx.fillText(t.text, 0, 0);
        ctx.restore();
      });

      // 4) Trigger download
      const link = document.createElement('a');
      link.download = `bbangmorning_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  // ─── Styles ───
  const S = {
    app: {
      background: '#FFF', minHeight: '100vh', display: 'flex',
      flexDirection: 'column', maxWidth: 480, margin: '0 auto',
      position: 'relative', paddingBottom: 80,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 20px', borderBottom: '1px solid #F0F0F0',
    },
    logo: { fontSize: 20, fontWeight: 900, color: BRAND_ORANGE, letterSpacing: -0.5 },
    photoWrap: {
      position: 'relative', width: '100%', paddingTop: paddingRatio,
      background: '#F8F8F8', overflow: 'hidden', transition: 'padding-top 0.3s ease',
    },
    photoInner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    img: {
      width: '100%', height: '100%', objectFit: 'cover',
      display: 'block', filter: filterStr,
    },
    uploadZone: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 20,
    },
    toolbar: {
      position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 6, background: 'rgba(0,0,0,0.7)',
      borderRadius: 22, padding: '5px 10px', zIndex: 50,
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    },
    toolBtn: {
      background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF',
      fontSize: 13, padding: '6px 14px', borderRadius: 16, cursor: 'pointer',
      fontWeight: 600, whiteSpace: 'nowrap',
    },
    tabBar: {
      display: 'flex', background: '#FFF',
      borderBottom: '1px solid #F0F0F0', padding: '0 8px',
    },
    tabContent: { padding: '14px 16px', minHeight: 130 },
    bottomBar: {
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 480, display: 'flex', gap: 10,
      padding: '12px 16px', background: '#FFF',
      borderTop: '1px solid #F0F0F0', zIndex: 100,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
    },
    btnReset: {
      flex: 1, padding: '14px 0', borderRadius: 14,
      border: '1.5px solid #E0E0E0', background: '#FFF',
      fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#888',
    },
    btnDownload: {
      flex: 2, padding: '14px 0', borderRadius: 14, border: 'none',
      background: BRAND_ORANGE, color: '#FFF', fontSize: 14,
      fontWeight: 700, cursor: 'pointer',
      boxShadow: '0 2px 12px rgba(255,75,0,0.25)',
    },
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '12px 0', textAlign: 'center',
    fontSize: 13, fontWeight: active ? 700 : 500,
    color: active ? BRAND_ORANGE : '#BBB',
    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: active ? `2.5px solid ${BRAND_ORANGE}` : '2.5px solid transparent',
    cursor: 'pointer', background: 'transparent',
    transition: 'color 0.2s',
  });

  const stickerSubTabStyle = (active) => ({
    flex: 1, padding: '8px 0', fontSize: 13,
    fontWeight: active ? 700 : 500,
    background: active ? BRAND_ORANGE : '#FAFAFA',
    color: active ? '#FFF' : '#999',
    border: 'none', cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const itemOverlay = (item, isSelected) => ({
    position: 'absolute',
    left: `${item.x}%`, top: `${item.y}%`,
    transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
    cursor: 'grab', touchAction: 'none', userSelect: 'none',
    zIndex: isSelected ? 40 : 10,
    ...(isSelected ? { outline: '2px dashed #4A90D9', outlineOffset: 4 } : {}),
  });

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#222', letterSpacing: 1.5, textTransform: 'uppercase' }}>BB.MORNING</span>
          <div style={{ width: 1, height: 16, background: '#DDD' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#999', display: 'inline-flex', alignItems: 'center', gap: 4 }}>빵 <span style={{ fontSize: 15, position: 'relative', top: -1 }}>📸</span></span>
        </div>
      </div>

      {/* Photo Area */}
      <div style={S.photoWrap}>
        <div style={S.photoInner} ref={containerRef}>
          {cameraMode ? (
            <>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                style={{
                  width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                  filter: (() => { const f = FILTERS[cameraFilter]; return `brightness(${f.brightness/100}) contrast(${f.contrast/100}) saturate(${f.saturate/100}) ${f.extras}`.trim(); })(),
                }}
              />
              {FILTERS[cameraFilter].tint && (
                <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background: FILTERS[cameraFilter].tint, pointerEvents:'none', zIndex:1 }} />
              )}
              {FILTERS[cameraFilter].vignette && (
                <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.45) 100%)', pointerEvents:'none', zIndex:1 }} />
              )}
              {/* 비율 선택 */}
              <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:6, zIndex:10 }}>
                {ASPECT_RATIOS.map(r => (
                  <button key={r.key} onClick={() => setAspectRatio(r.key)} style={{
                    width:40, height:32, borderRadius:8, border:'none', fontSize:11, fontWeight:700, cursor:'pointer',
                    background: aspectRatio === r.key ? BRAND_ORANGE : 'rgba(0,0,0,0.5)',
                    color:'#FFF',
                  }}>{r.label}</button>
                ))}
              </div>
              {/* 카메라 컨트롤 */}
              <div style={{ position:'absolute', bottom:16, left:0, right:0, display:'flex', justifyContent:'center', alignItems:'center', gap:20, zIndex:10 }}>
                <button onClick={stopCamera} style={{ width:44, height:44, borderRadius:'50%', border:'2px solid #FFF', background:'rgba(0,0,0,0.4)', color:'#FFF', fontSize:18, cursor:'pointer' }}>✕</button>
                <button onClick={capturePhoto} style={{ width:64, height:64, borderRadius:'50%', border:'4px solid #FFF', background:BRAND_ORANGE, cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' }} />
                <button onClick={flipCamera} style={{ width:44, height:44, borderRadius:'50%', border:'2px solid #FFF', background:'rgba(0,0,0,0.4)', color:'#FFF', fontSize:18, cursor:'pointer' }}>🔄</button>
              </div>
              {/* 카메라 필터 스트립 */}
              <div style={{ position:'absolute', top:12, left:0, right:0, display:'flex', gap:8, overflowX:'auto', padding:'0 12px', zIndex:10, WebkitOverflowScrolling:'touch' }}>
                {Object.entries(FILTERS).map(([key, f]) => (
                  <button key={key} onClick={() => setCameraFilter(key)} style={{
                    flexShrink:0, padding:'6px 12px', borderRadius:16, border:'none',
                    background: cameraFilter === key ? BRAND_ORANGE : 'rgba(0,0,0,0.5)',
                    color:'#FFF', fontSize:12, fontWeight: cameraFilter === key ? 700 : 500, cursor:'pointer',
                  }}>{f.label}</button>
                ))}
              </div>
            </>
          ) : image ? (
            <>
              <img
                src={image} style={S.img} alt="photo"
                draggable={false} onClick={deselect}
              />
              {filterTint && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: filterTint, pointerEvents: 'none', zIndex: 1 }} />
              )}
              {filterVignette && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.45) 100%)', pointerEvents: 'none', zIndex: 1 }} />
              )}

              {/* 비율 선택 (편집 모드) */}
              <div style={{ position:'absolute', right:8, top:8, display:'flex', flexDirection:'column', gap:4, zIndex:45 }}>
                {ASPECT_RATIOS.map(r => (
                  <button key={r.key} onClick={(e) => { e.stopPropagation(); setAspectRatio(r.key); }} style={{
                    width:36, height:28, borderRadius:6, border:'none', fontSize:10, fontWeight:700, cursor:'pointer',
                    background: aspectRatio === r.key ? BRAND_ORANGE : 'rgba(0,0,0,0.45)',
                    color:'#FFF', opacity: 0.9,
                  }}>{r.label}</button>
                ))}
              </div>
              {/* 팁 토스트 */}
              {photoTip && (
                <div style={{
                  position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.75)', color: '#FFF', fontSize: 13, fontWeight: 600,
                  padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', zIndex: 60,
                }}>
                  {photoTip}
                </div>
              )}

              {/* Stickers on photo */}
              {stickers.map(st => (
                <div
                  key={st.id}
                  onPointerDown={(e) => startDrag(e, st.id, 'sticker')}
                  style={{
                    ...itemOverlay(st, selectedId === st.id),
                    width: st.size, height: st.size,
                  }}
                >
                  <img src={st.content} alt="" draggable={false}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                  {selectedId === st.id && (
                    <>
                      <div onPointerDown={(e) => startDrag(e, st.id, 'sticker', 'resize')}
                        style={{ position:'absolute', right:-6, bottom:-6, width:14, height:14, background:'#4A90D9', border:'2px solid #FFF', borderRadius:3, cursor:'nwse-resize', zIndex:50 }} />
                      <div onPointerDown={(e) => startDrag(e, st.id, 'sticker', 'rotate')}
                        style={{ position:'absolute', left:'50%', top:-24, transform:'translateX(-50%)', width:18, height:18, background:'#4A90D9', border:'2px solid #FFF', borderRadius:'50%', cursor:'grab', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#FFF' }}>↻</div>
                    </>
                  )}
                </div>
              ))}

              {/* Texts on photo */}
              {texts.map(t => (
                <div
                  key={t.id}
                  onPointerDown={(e) => { if (editingTextId !== t.id) startDrag(e, t.id, 'text'); }}
                  onClick={() => { if (selectedId === t.id && editingTextId !== t.id) setEditingTextId(t.id); }}
                  style={{
                    ...itemOverlay(t, selectedId === t.id),
                    fontSize: t.size,
                    fontWeight: t.bold ? 700 : 400,
                    fontStyle: t.italic ? 'italic' : 'normal',
                    color: t.color,
                    ...(t.stroke ? { WebkitTextStroke: `${t.strokeWidth || 1}px ${t.stroke}`, paintOrder: 'stroke fill' } : {}),
                    ...(t.bgBox ? { background: t.bgBox, padding: '4px 10px', borderRadius: 6 } : {}),
                    whiteSpace: 'nowrap',
                    fontFamily: '-apple-system, sans-serif',
                  }}
                >
                  {editingTextId === t.id ? (
                    <input
                      autoFocus
                      value={t.text}
                      onChange={(e) => setTexts(prev => prev.map(item => item.id === t.id ? { ...item, text: e.target.value } : item))}
                      onBlur={() => setEditingTextId(null)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setEditingTextId(null); }}
                      style={{
                        background: 'transparent', border: 'none', outline: 'none', padding: 0, margin: 0,
                        font: 'inherit', color: 'inherit', width: Math.max(60, t.text.length * t.size * 0.6),
                        WebkitTextStroke: t.stroke ? `${t.strokeWidth || 1}px ${t.stroke}` : 'unset',
                      }}
                    />
                  ) : t.text}
                  {selectedId === t.id && (
                    <>
                      <div onPointerDown={(e) => startDrag(e, t.id, 'text', 'resize')}
                        style={{ position:'absolute', right:-6, bottom:-6, width:14, height:14, background:'#4A90D9', border:'2px solid #FFF', borderRadius:3, cursor:'nwse-resize', zIndex:50 }} />
                      <div onPointerDown={(e) => startDrag(e, t.id, 'text', 'rotate')}
                        style={{ position:'absolute', left:'50%', top:-24, transform:'translateX(-50%)', width:18, height:18, background:'#4A90D9', border:'2px solid #FFF', borderRadius:'50%', cursor:'grab', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#FFF' }}>↻</div>
                    </>
                  )}
                </div>
              ))}

              {/* Selection Toolbar */}
              {selectedId && activeTab !== 'preview' && (
                <div style={S.toolbar}>
                  <button style={{ ...S.toolBtn, background: 'rgba(231,76,60,0.8)' }} onClick={deleteSelected}>삭제</button>
                  <button style={{ ...S.toolBtn, background: 'rgba(46,204,113,0.8)' }} onClick={deselect}>완료</button>
                </div>
              )}
            </>
          ) : (
            <div style={S.uploadZone}>
              {/* 촬영 팁 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
                {PHOTO_GUIDES.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    padding: '10px 14px', background: '#F5F5F5', borderRadius: 12, width: '100%',
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{g.icon}</span>
                    <span style={{ fontSize: 13, color: '#777', fontWeight: 600 }}>{g.tip}</span>
                  </div>
                ))}
              </div>
              {/* 버튼 */}
              <div style={{ display: 'flex', gap: 10, padding: '0 20px', width: '100%', boxSizing: 'border-box' }}>
                <button onClick={() => fileInputRef.current?.click()} style={{
                  flex: 1, padding: '14px 0', borderRadius: 14, border: 'none',
                  background: BRAND_ORANGE, color: '#FFF', fontSize: 14,
                  fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(255,75,0,0.2)',
                }}>
                  앨범에서 선택
                </button>
                <button onClick={() => { setCameraMode(true); startCamera(); }} style={{
                  flex: 1, padding: '14px 0', borderRadius: 14,
                  border: '1.5px solid #E0E0E0', background: '#FFF',
                  color: '#555', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}>
                  📷 촬영하기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef} type="file" accept="image/*"
        onChange={handleUpload} style={{ display: 'none' }}
      />

      {/* Tabs + Content */}
      {image && (
        <>
          <div style={S.tabBar}>
            {['filter','sticker','text','preview'].map(key => {
              const labels = { filter: '필터', sticker: '스티커', text: '텍스트', preview: '미리보기' };
              return (
                <button
                  key={key}
                  style={tabStyle(activeTab === key)}
                  onClick={() => { setActiveTab(key); deselect(); }}
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>

          <div style={S.tabContent}>
            {/* ── Filter Tab ── */}
            {activeTab === 'filter' && (
              <div>
                {/* Filter thumbnails */}
                <div style={{
                  display: 'flex', gap: 10, overflowX: 'auto',
                  paddingBottom: 12, WebkitOverflowScrolling: 'touch',
                }}>
                  {Object.entries(FILTERS).map(([key, f]) => (
                    <div
                      key={key}
                      onClick={() => applyFilter(key)}
                      style={{ cursor: 'pointer', textAlign: 'center', flexShrink: 0 }}
                    >
                      <div style={{
                        width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                        border: selectedFilter === key
                          ? `3px solid ${BRAND_ORANGE}`
                          : '3px solid transparent',
                      }}>
                        <img
                          src={image} alt={key} draggable={false}
                          style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                            filter: `brightness(${f.brightness/100}) contrast(${f.contrast/100}) saturate(${f.saturate/100}) ${f.extras}`,
                          }}
                        />
                      </div>
                      <span style={{
                        fontSize: 11, marginTop: 4, display: 'block',
                        color: selectedFilter === key ? BRAND_ORANGE : '#999',
                        fontWeight: selectedFilter === key ? 700 : 500,
                      }}>
                        {f.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sliders */}
                <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: '밝기', value: brightness, set: setBrightness },
                    { label: '대비', value: contrast,   set: setContrast },
                    { label: '채도', value: saturation,  set: setSaturation },
                  ].map(sl => (
                    <div key={sl.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: '#888', width: 32, fontWeight: 600 }}>{sl.label}</span>
                      <input
                        type="range" min={50} max={150} value={sl.value}
                        onChange={(e) => sl.set(Number(e.target.value))}
                        style={{ flex: 1, accentColor: BRAND_ORANGE }}
                      />
                      <span style={{ fontSize: 12, color: '#AAA', width: 30, textAlign: 'right' }}>{sl.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Sticker Tab ── */}
            {activeTab === 'sticker' && (
              <div>
                {/* Sub-tabs */}
                <div style={{
                  display: 'flex', marginBottom: 14, borderRadius: 10,
                  overflow: 'hidden', border: '1px solid #E8E0D5',
                }}>
                  {STICKER_TABS.map((t, i) => (
                    <button key={i} onClick={() => setStickerTab(i)} style={stickerSubTabStyle(stickerTab === i)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, maxHeight: 280, overflowY: 'auto', padding: 2 }}>
                  {STICKER_TABS[stickerTab].items.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => addSticker(src)}
                      style={{
                        padding: 4, background: '#FFF',
                        border: '1px solid #F0E8DC', borderRadius: 12,
                        cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        aspectRatio: '1',
                      }}
                    >
                      <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Text Tab ── */}
            {activeTab === 'text' && (
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    type="text" value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="텍스트를 입력하세요"
                    maxLength={20}
                    onKeyDown={(e) => { if (e.key === 'Enter') addText(); }}
                    style={{
                      flex: 1, padding: '11px 14px', borderRadius: 12,
                      border: '2px solid #E8E0D5', fontSize: 15,
                      outline: 'none', background: '#FFF',
                    }}
                  />
                  <button
                    onClick={addText}
                    style={{
                      padding: '11px 22px', borderRadius: 12, border: 'none',
                      background: BRAND_ORANGE, color: '#FFF',
                      fontWeight: 700, fontSize: 15, cursor: 'pointer',
                    }}
                  >
                    추가
                  </button>
                </div>
                {/* 색상 팔레트 */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>글자 색</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {TEXT_COLORS.map(c => (
                      <button key={c} onClick={() => setTextColor(c)}
                        style={{
                          width: 32, height: 32, borderRadius: '50%',
                          border: textColor === c ? '3px solid #333' : '2px solid #DDD',
                          background: c, cursor: 'pointer',
                          boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #DDD' : 'none',
                        }} />
                    ))}
                    <label style={{ width: 32, height: 32, borderRadius: '50%', border: '2px dashed #BBB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#999', overflow: 'hidden', position: 'relative' }}>
                      +
                      <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                        style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </label>
                  </div>
                </div>

                {/* 미리보기 */}
                {textInput.trim() && (
                  <div style={{
                    marginBottom: 14, padding: '12px 16px', background: '#F5F0EB',
                    borderRadius: 12, textAlign: 'center', minHeight: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: 20, color: textColor,
                      fontWeight: textBold ? 700 : 400,
                      fontStyle: textItalic ? 'italic' : 'normal',
                      ...(textStroke ? { WebkitTextStroke: `${textStrokeWidth}px ${textStroke}`, paintOrder: 'stroke fill' } : {}),
                      ...(textBgBox ? { background: textBgBox, padding: '4px 10px', borderRadius: 6 } : {}),
                      fontFamily: '-apple-system, sans-serif',
                    }}>{textInput.trim()}</span>
                  </div>
                )}

                {/* 스타일 토글 */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  <button onClick={() => setTextBold(!textBold)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: textBold ? '2px solid #4A90D9' : '2px solid #DDD',
                      background: textBold ? '#EBF2FF' : '#FFF',
                      cursor: 'pointer', fontSize: 16, fontWeight: 700,
                    }}>B</button>
                  <button onClick={() => setTextItalic(!textItalic)}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      border: textItalic ? '2px solid #4A90D9' : '2px solid #DDD',
                      background: textItalic ? '#EBF2FF' : '#FFF',
                      cursor: 'pointer', fontSize: 16, fontStyle: 'italic',
                    }}>I</button>
                  <button onClick={() => setTextStroke(textStroke ? null : '#000000')}
                    style={{
                      height: 40, padding: '0 12px', borderRadius: 10,
                      border: textStroke ? '2px solid #4A90D9' : '2px solid #DDD',
                      background: textStroke ? '#EBF2FF' : '#FFF',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    }}>테두리</button>
                  <button onClick={() => setTextBgBox(textBgBox ? null : 'rgba(0,0,0,0.5)')}
                    style={{
                      height: 40, padding: '0 12px', borderRadius: 10,
                      border: textBgBox ? '2px solid #4A90D9' : '2px solid #DDD',
                      background: textBgBox ? '#EBF2FF' : '#FFF',
                      cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    }}>배경박스</button>
                </div>

                {/* 테두리 색 + 두께 */}
                {textStroke && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>테두리 색</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                      {TEXT_COLORS.map(c => (
                        <button key={c} onClick={() => setTextStroke(c)}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            border: textStroke === c ? '3px solid #333' : '2px solid #DDD',
                            background: c, cursor: 'pointer',
                            boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #DDD' : 'none',
                          }} />
                      ))}
                      <label style={{ width: 28, height: 28, borderRadius: '50%', border: '2px dashed #BBB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#999', overflow: 'hidden', position: 'relative' }}>
                        +
                        <input type="color" value={textStroke} onChange={(e) => setTextStroke(e.target.value)}
                          style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                      </label>
                    </div>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>두께</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[1, 2, 3, 4].map(w => (
                        <button key={w} onClick={() => setTextStrokeWidth(w)}
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            border: textStrokeWidth === w ? '2px solid #4A90D9' : '2px solid #DDD',
                            background: textStrokeWidth === w ? '#EBF2FF' : '#FFF',
                            cursor: 'pointer', fontSize: 13, fontWeight: 600,
                          }}>{w}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 배경박스 색 선택 */}
                {textBgBox && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>배경 색</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['rgba(0,0,0,0.5)','rgba(0,0,0,0.8)','rgba(255,255,255,0.7)','rgba(255,75,0,0.7)','rgba(59,130,246,0.7)','rgba(34,197,94,0.7)','rgba(168,85,247,0.7)','rgba(234,179,8,0.7)'].map(c => (
                        <button key={c} onClick={() => setTextBgBox(c)}
                          style={{
                            width: 28, height: 28, borderRadius: 6,
                            border: textBgBox === c ? '3px solid #333' : '2px solid #DDD',
                            background: c, cursor: 'pointer',
                          }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Preview Tab ── */}
            {activeTab === 'preview' && (
              <div style={{ textAlign: 'center', color: '#AAA', fontSize: 14, padding: 16 }}>
                <p>위 미리보기에서 최종 결과를 확인하세요</p>
                <p style={{ marginTop: 8, fontSize: 12 }}>다운로드하면 3배 고해상도로 저장됩니다</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Bottom Action Bar */}
      {!cameraMode && <div style={S.bottomBar}>
        <button style={S.btnReset} onClick={resetAll}>🔄 초기화</button>
        <button
          style={{ ...S.btnDownload, opacity: image ? 1 : 0.4 }}
          onClick={handleDownload}
          disabled={!image}
        >
          📥 다운로드
        </button>
      </div>}
    </div>
  );
}
