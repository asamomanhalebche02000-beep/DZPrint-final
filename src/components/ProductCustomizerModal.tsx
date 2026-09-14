import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Type,
  RotateCw,
  Move,
  Check,
  ZoomIn,
  Trash2,
  Sparkles,
  ShoppingBag,
  Info,
  Layers,
} from 'lucide-react';
import { Product, Design, CustomizationData } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';

interface ProductCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  initialDesign?: Design | null;
}

export const ProductCustomizerModal: React.FC<ProductCustomizerModalProps> = ({
  isOpen,
  onClose,
  product,
  initialDesign,
}) => {
  const { t, isRtl } = useTheme();
  const { addToCart } = useCart();

  // Selected options
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || { name: 'أسود', hex: '#111827' });
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'L');
  const [quantity, setQuantity] = useState(1);
  const [placement, setPlacement] = useState<'front' | 'back'>('front');

  // Customization artwork
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [selectedPreDesign, setSelectedPreDesign] = useState<Design | null>(initialDesign || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Position & transform
  const [scale, setScale] = useState(1);
  const [posX, setPosX] = useState(0); // percentage offset -50 to +50
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);

  // Custom text
  const [customText, setCustomText] = useState('');
  const [textFont, setTextFont] = useState('Cairo');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(24);

  // Special instructions
  const [userInstructions, setUserInstructions] = useState('');

  // Pre-made designs available
  const [preDesigns, setPreDesigns] = useState<Design[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mockupCanvasRef = useRef<HTMLDivElement>(null);

  // Dragging state on canvas
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; startPosX: number; startPosY: number }>({
    x: 0,
    y: 0,
    startPosX: 0,
    startPosY: 0,
  });

  useEffect(() => {
    if (product?.colors?.[0]) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.sizes?.[0]) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product?.id]);

  useEffect(() => {
    if (initialDesign) {
      setSelectedPreDesign(initialDesign);
    }
  }, [initialDesign]);

  useEffect(() => {
    // Fetch available designs for the gallery tab
    fetch('/api/designs?activeOnly=true')
      .then(res => res.json())
      .then(data => setPreDesigns(Array.isArray(data) ? data : []))
      .catch(() => setPreDesigns([]));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.mimetype || file.type)) {
      setUploadError('يرجى اختيار صورة بصيغة PNG أو JPG أو WEBP فقط.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('حجم الصورة كبير جداً (الحد الأقصى 10 ميغابايت).');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('designFile', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'فشل رفع الصورة');
      }

      setUploadedUrl(data.url);
      setSelectedPreDesign(null); // Clear pre-made if uploaded
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const activeArtworkUrl = uploadedUrl || selectedPreDesign?.image_url;

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!activeArtworkUrl && !customText) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: posX,
      startPosY: posY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    // Map pixels to percentage offset
    setPosX(Math.max(-45, Math.min(45, dragStartRef.current.startPosX + deltaX * 0.25)));
    setPosY(Math.max(-45, Math.min(45, dragStartRef.current.startPosY + deltaY * 0.25)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetPosition = () => {
    setPosX(0);
    setPosY(0);
    setScale(1);
    setRotation(0);
  };

  const handleAddToCart = () => {
    const unitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.base_price;

    const customization: CustomizationData = {
      scale,
      x: posX,
      y: posY,
      rotation,
      placement,
      user_instructions: userInstructions.trim() || undefined,
      custom_text: customText.trim() || undefined,
      text_font: textFont,
      text_color: textColor,
      text_size: textSize,
      image_url: activeArtworkUrl || undefined,
    };

    addToCart({
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      color: selectedColor.name,
      color_hex: selectedColor.hex,
      size: selectedSize,
      design_id: selectedPreDesign?.id,
      design_name: selectedPreDesign?.name,
      uploaded_design_url: uploadedUrl || undefined,
      customization,
      quantity,
      unit_price: unitPrice,
    });

    onClose();
  };

  if (!isOpen || !product) return null;

  const unitPrice = product.sale_price && product.sale_price > 0 ? product.sale_price : product.base_price;
  const totalPrice = unitPrice * quantity;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-5xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/70">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                    {t.customizer_title}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {product.name} — {formatPrice(unitPrice)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Studio Body: Left is Mockup Canvas, Right is Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
              {/* Mockup Canvas Column */}
              <div className="lg:col-span-7 bg-neutral-100 dark:bg-neutral-950/80 p-4 sm:p-6 flex flex-col items-center justify-center relative select-none">
                {/* Placement toggles (Front / Back) */}
                {product.category !== 'mugs' && (
                  <div className="absolute top-4 start-4 z-20 flex bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md rounded-lg p-1 border border-neutral-200 dark:border-neutral-700 shadow-sm text-xs font-medium">
                    <button
                      onClick={() => setPlacement('front')}
                      className={`px-3 py-1.5 rounded-md transition ${
                        placement === 'front'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      {t.placement_front}
                    </button>
                    <button
                      onClick={() => setPlacement('back')}
                      className={`px-3 py-1.5 rounded-md transition ${
                        placement === 'back'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                      }`}
                    >
                      {t.placement_back}
                    </button>
                  </div>
                )}

                {/* Reset button */}
                <button
                  onClick={handleResetPosition}
                  title={t.reset_position}
                  className="absolute top-4 end-4 z-20 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-amber-500 shadow-sm transition"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{t.reset_position}</span>
                </button>

                {/* THE INTERACTIVE PRODUCT MOCKUP */}
                <div
                  ref={mockupCanvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="relative w-72 h-80 sm:w-96 sm:h-96 flex items-center justify-center cursor-crosshair overflow-hidden rounded-xl shadow-inner border border-neutral-200/60 dark:border-neutral-800/60"
                  style={{
                    backgroundColor: '#e5e7eb',
                    backgroundImage: 'radial-gradient(circle, #f3f4f6 10%, #e5e7eb 90%)',
                  }}
                >
                  {/* Dynamic Garment SVG Mockup Base */}
                  {product.category === 't-shirts' && (
                    <svg
                      viewBox="0 0 400 400"
                      className="w-full h-full drop-shadow-xl transition-colors duration-300 pointer-events-none"
                    >
                      <defs>
                        <linearGradient id="tshirtShade" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                          <stop offset="50%" stopColor="#000000" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                      {/* T-Shirt Silhouette */}
                      <path
                        d="M130 50 L160 70 C180 80 220 80 240 70 L270 50 L360 110 L320 170 L280 145 L280 370 C280 375 275 380 270 380 L130 380 C125 380 120 375 120 370 L120 145 L80 170 L40 110 Z"
                        fill={selectedColor.hex}
                        stroke="#000000"
                        strokeOpacity="0.15"
                        strokeWidth="2"
                      />
                      {/* Fabric Wrinkles & Shading Overlay */}
                      <path
                        d="M130 50 L160 70 C180 80 220 80 240 70 L270 50 L360 110 L320 170 L280 145 L280 370 C280 375 275 380 270 380 L130 380 C125 380 120 375 120 370 L120 145 L80 170 L40 110 Z"
                        fill="url(#tshirtShade)"
                      />
                      {/* Collar Line */}
                      <path
                        d="M160 70 C180 95 220 95 240 70"
                        fill="none"
                        stroke="#000000"
                        strokeOpacity="0.25"
                        strokeWidth="3"
                      />
                    </svg>
                  )}

                  {product.category === 'hoodies' && (
                    <svg
                      viewBox="0 0 400 400"
                      className="w-full h-full drop-shadow-xl transition-colors duration-300 pointer-events-none"
                    >
                      <defs>
                        <linearGradient id="hoodieShade" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                          <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
                        </linearGradient>
                      </defs>
                      {/* Hoodie body */}
                      <path
                        d="M120 70 L150 90 L250 90 L280 70 L370 130 L330 190 L290 165 L290 380 L110 380 L110 165 L70 190 L30 130 Z"
                        fill={selectedColor.hex}
                        stroke="#000000"
                        strokeOpacity="0.15"
                        strokeWidth="2"
                      />
                      {/* Double Hood */}
                      <path
                        d="M140 75 C140 30 260 30 260 75 C250 110 150 110 140 75 Z"
                        fill={selectedColor.hex}
                        stroke="#000000"
                        strokeOpacity="0.2"
                        strokeWidth="2"
                      />
                      {/* Kangaroo Pocket */}
                      {placement === 'front' && (
                        <path
                          d="M145 280 L255 280 L275 350 L125 350 Z"
                          fill={selectedColor.hex}
                          stroke="#000000"
                          strokeOpacity="0.25"
                          strokeWidth="2"
                        />
                      )}
                      <path
                        d="M120 70 L150 90 L250 90 L280 70 L370 130 L330 190 L290 165 L290 380 L110 380 L110 165 L70 190 L30 130 Z"
                        fill="url(#hoodieShade)"
                      />
                    </svg>
                  )}

                  {product.category === 'mugs' && (
                    <svg
                      viewBox="0 0 400 400"
                      className="w-full h-full drop-shadow-xl transition-colors duration-300 pointer-events-none"
                    >
                      <defs>
                        <linearGradient id="mugGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#000000" stopOpacity="0.3" />
                          <stop offset="25%" stopColor="#ffffff" stopOpacity="0.2" />
                          <stop offset="70%" stopColor="#ffffff" stopOpacity="0.0" />
                          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>
                      {/* Handle */}
                      <path
                        d="M280 140 C350 140 350 260 280 260"
                        fill="none"
                        stroke={selectedColor.hex === '#ffffff' ? '#e5e7eb' : selectedColor.hex}
                        strokeWidth="22"
                        strokeLinecap="round"
                      />
                      {/* Cylinder Body */}
                      <rect
                        x="100"
                        y="100"
                        width="190"
                        height="220"
                        rx="12"
                        fill={selectedColor.hex}
                        stroke="#000000"
                        strokeOpacity="0.15"
                        strokeWidth="2"
                      />
                      <rect x="100" y="100" width="190" height="220" rx="12" fill="url(#mugGradient)" />
                      {/* Rim Top */}
                      <ellipse
                        cx="195"
                        cy="100"
                        rx="95"
                        ry="16"
                        fill={selectedColor.hex}
                        stroke="#000000"
                        strokeOpacity="0.2"
                        strokeWidth="2"
                      />
                    </svg>
                  )}

                  {/* PRINTABLE BOUNDING BOX ON CHEST / BODY */}
                  <div
                    className={`absolute border border-dashed border-amber-400/70 rounded-md pointer-events-none ${
                      product.category === 'mugs'
                        ? 'w-36 h-36 top-[130px] start-[120px]'
                        : product.category === 'hoodies'
                        ? 'w-44 h-48 top-[125px]'
                        : 'w-44 h-52 top-[120px]'
                    }`}
                  >
                    <span className="absolute -top-4 start-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase bg-white/90 dark:bg-neutral-900/90 px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap">
                      منطقة الطباعة DTF
                    </span>
                  </div>

                  {/* OVERLAID CUSTOM DESIGN / TEXT */}
                  <div
                    style={{
                      transform: `translate(${posX}px, ${posY}px) rotate(${rotation}deg) scale(${scale})`,
                      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                    }}
                    className={`absolute flex flex-col items-center justify-center select-none cursor-move ${
                      product.category === 'mugs' ? 'top-[150px]' : 'top-[140px]'
                    }`}
                  >
                    {activeArtworkUrl && (
                      <img
                        src={activeArtworkUrl}
                        alt="Design Preview"
                        className="w-28 h-28 object-contain drop-shadow-md pointer-events-none"
                      />
                    )}

                    {customText && (
                      <p
                        style={{
                          fontFamily: textFont,
                          color: textColor,
                          fontSize: `${textSize}px`,
                          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        }}
                        className="font-bold text-center mt-1 px-2 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                      >
                        {customText}
                      </p>
                    )}

                    {!activeArtworkUrl && !customText && (
                      <div className="flex flex-col items-center justify-center p-3 text-center text-neutral-400 pointer-events-none">
                        <Upload className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-[11px] font-medium leading-tight">
                          ارفع صورتك لمعاينتها هنا
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transform slider bar */}
                {(activeArtworkUrl || customText) && (
                  <div className="w-full max-w-sm mt-4 p-3 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2 flex-1">
                      <ZoomIn className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="range"
                        min="0.5"
                        max="1.8"
                        step="0.05"
                        value={scale}
                        onChange={e => setScale(parseFloat(e.target.value))}
                        className="w-full accent-amber-500"
                        title="الحجم"
                      />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <RotateCw className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        step="5"
                        value={rotation}
                        onChange={e => setRotation(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-500"
                        title="التدوير"
                      />
                    </div>
                  </div>
                )}
                <p className="text-[11px] text-neutral-400 mt-2 flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  {t.drag_resize_hint}
                </p>
              </div>

              {/* Controls Column */}
              <div className="lg:col-span-5 p-5 sm:p-6 space-y-6 overflow-y-auto">
                {/* 1. Color Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                    {t.select_color} <span className="text-neutral-900 dark:text-white font-semibold">{selectedColor.name}</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {(product.colors || []).map(col => (
                      <button
                        key={col.hex}
                        onClick={() => setSelectedColor(col)}
                        style={{ backgroundColor: col.hex }}
                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor.hex === col.hex
                            ? 'border-amber-500 ring-2 ring-amber-500/40 scale-110'
                            : 'border-neutral-300 dark:border-neutral-700 hover:scale-105'
                        }`}
                        title={col.name}
                      >
                        {selectedColor.hex === col.hex && (
                          <Check
                            className={`w-4 h-4 ${
                              col.hex === '#f9fafb' || col.hex === '#ffffff' ? 'text-black' : 'text-white'
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Size Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                    {t.select_size} <span className="text-neutral-900 dark:text-white font-semibold">{selectedSize}</span>
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(product.sizes || []).map(sz => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 text-xs font-bold rounded-lg border transition ${
                          selectedSize === sz
                            ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Upload Artwork Option */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      {t.upload_your_design}
                    </span>
                    {uploadedUrl && (
                      <button
                        onClick={() => setUploadedUrl(null)}
                        className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t.upload_remove}
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                  />

                  {uploadedUrl ? (
                    <div className="flex items-center gap-3 p-2.5 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                      <img src={uploadedUrl} alt="Uploaded" className="w-12 h-12 object-contain rounded bg-neutral-100 dark:bg-neutral-900 p-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> تم رفع التصميم بنجاح
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">جاهز للطباعة عالية الدقة</p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md hover:bg-amber-100"
                      >
                        {t.upload_replace}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl flex flex-col items-center justify-center gap-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition cursor-pointer"
                    >
                      <Upload className={`w-6 h-6 text-amber-500 ${isUploading ? 'animate-bounce' : ''}`} />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {isUploading ? 'جاري رفع الملف...' : t.upload_your_design}
                      </span>
                      <span className="text-[10px] text-neutral-400">{t.upload_hint}</span>
                    </button>
                  )}

                  {uploadError && (
                    <p className="text-xs text-red-500 font-medium">{uploadError}</p>
                  )}

                  {/* Gallery Designs quick pick */}
                  {preDesigns.length > 0 && (
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-2">
                        {t.or_choose_gallery}:
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {(preDesigns || []).map(des => (
                          <button
                            key={des.id}
                            onClick={() => {
                              setSelectedPreDesign(des);
                              setUploadedUrl(null);
                            }}
                            className={`p-1 rounded-lg border shrink-0 transition ${
                              selectedPreDesign?.id === des.id
                                ? 'border-amber-500 ring-2 ring-amber-500/30'
                                : 'border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            <img src={des.image_url} alt={des.name} className="w-12 h-12 object-contain rounded" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Custom Printed Text */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-amber-500" />
                    {t.custom_text}
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder={t.text_placeholder}
                    className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white"
                  />
                  {customText && (
                    <div className="flex items-center gap-2 pt-1">
                      <select
                        value={textFont}
                        onChange={e => setTextFont(e.target.value)}
                        className="text-xs px-2.5 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200"
                      >
                        <option value="Cairo">خط القاهرة (Cairo)</option>
                        <option value="'Plus Jakarta Sans', sans-serif">Modern Sans</option>
                        <option value="serif">Serif Classic</option>
                        <option value="monospace">Mono Tech</option>
                      </select>
                      <div className="flex items-center gap-1">
                        {['#ffffff', '#000000', '#e11d48', '#2563eb', '#16a34a', '#f59e0b'].map(c => (
                          <button
                            key={c}
                            onClick={() => setTextColor(c)}
                            style={{ backgroundColor: c }}
                            className={`w-6 h-6 rounded-full border ${
                              textColor === c ? 'ring-2 ring-amber-500' : 'border-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Special instructions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                    {t.special_instructions}
                  </label>
                  <textarea
                    rows={2}
                    value={userInstructions}
                    onChange={e => setUserInstructions(e.target.value)}
                    placeholder={t.special_instructions_placeholder}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-neutral-900 dark:text-white resize-none"
                  />
                </div>

                {/* 6. Quantity and Total Action */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-neutral-400 block">{t.quantity}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-bold text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
                      >
                        -
                      </button>
                      <span className="font-bold text-sm text-neutral-900 dark:text-white px-2">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-bold text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-end">
                    <span className="text-[11px] text-neutral-400 block">الإجمالي:</span>
                    <span className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-white">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{t.add_custom_to_cart}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
