import React, { useState } from 'react';
import { TourPackage } from '../types';
import { X, Sparkles, Image as ImageIcon, Check, RefreshCw, Download, Camera, Sliders, Layers, Eye, ShieldCheck } from 'lucide-react';

interface RealLifeImageGeneratorModalProps {
  isOpen: boolean;
  packageItem?: TourPackage | null;
  onClose: () => void;
  onApplyImage?: (imageUrl: string, imageSize: '1K' | '2K' | '4K', packageId?: string) => void;
}

export const RealLifeImageGeneratorModal: React.FC<RealLifeImageGeneratorModalProps> = ({
  isOpen,
  packageItem,
  onClose,
  onApplyImage,
}) => {
  const [placeName, setPlaceName] = useState(packageItem?.location || packageItem?.title || 'Ooty Lake & Tea Gardens');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('2K');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');
  const [photoStyle, setPhotoStyle] = useState<'photorealistic' | 'cinematic' | 'golden_hour' | 'aerial'>('photorealistic');
  const [customPrompt, setCustomPrompt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(packageItem?.image || null);
  const [generationInfo, setGenerationInfo] = useState<{
    size: '1K' | '2K' | '4K';
    dimensionStr: string;
    modelUsed: string;
    promptUsed: string;
  } | null>(null);
  const [statusNotice, setStatusNotice] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusNotice('Contacting Gemini 3 Pro image preview engine...');

    try {
      const res = await fetch('/api/generate-cover-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeName,
          title: packageItem?.title,
          imageSize,
          aspectRatio,
          style: photoStyle,
          prompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setGenerationInfo({
          size: data.imageSize || imageSize,
          dimensionStr: data.dimensionStr || (imageSize === '4K' ? '3840x2160 Ultra HD' : imageSize === '2K' ? '2048x1152 Full HD' : '1024x576 HD'),
          modelUsed: data.modelUsed || 'gemini-3.1-flash-image',
          promptUsed: data.promptUsed || `Real life travel photograph of ${placeName}`,
        });
        setStatusNotice(`✨ High-resolution ${data.imageSize || imageSize} cover photo generated successfully with ${data.modelUsed || 'gemini-3.1-flash-image'}!`);
      } else {
        setStatusNotice('Unable to generate image. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
      setStatusNotice('Network error occurred while calling AI image generator.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedImage && onApplyImage) {
      onApplyImage(generatedImage, generationInfo?.size || imageSize, packageItem?.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative my-8 text-slate-900">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-black hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 border-b border-slate-100 pb-4 pr-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-rose-600 to-indigo-600 text-white font-mono text-[11px] font-black rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              gemini-3.1-flash-image
            </span>
            <span className="text-xs font-bold text-slate-500">
              Real-Life AI Cover Engine
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 font-['Manrope'] tracking-tight">
            Generate Real-Life Place Cover Photo
          </h3>
          <p className="text-xs text-slate-600 font-bold">
            Create photorealistic cover photos for tour packages with true-to-life lighting, crisp landscape textures, and selectable image resolution (1K, 2K, 4K).
          </p>
        </div>

        {/* Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          
          {/* Destination / Location Input */}
          <div className="space-y-1.5">
            <label className="block font-black text-slate-800 flex items-center justify-between">
              <span>Destination or Location Name *</span>
              <span className="text-[10px] text-indigo-600 font-bold">Real place photography</span>
            </label>
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Ooty Botanical Gardens, Tea Estate Munnar, Kodaikanal Lake"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition"
            />
          </div>

          {/* Image Size Affordance (1K, 2K, 4K) */}
          <div className="space-y-1.5">
            <label className="block font-black text-slate-800 flex items-center justify-between">
              <span>Image Size / Resolution *</span>
              <span className="text-[10px] text-rose-600 font-bold">gemini-3.1-image spec</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1K', '2K', '4K'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setImageSize(size)}
                  className={`py-2.5 px-3 rounded-2xl font-black text-xs transition cursor-pointer border flex flex-col items-center justify-center ${
                    imageSize === size
                      ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-md ring-2 ring-amber-400/50'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm">{size}</span>
                  <span className="text-[9px] opacity-80 font-normal">
                    {size === '1K' ? '1024 px' : size === '2K' ? '2048 px' : '3840 px (4K)'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Photo Style Presets */}
          <div className="space-y-1.5">
            <label className="block font-black text-slate-800">
              Photorealistic Style Preset
            </label>
            <select
              value={photoStyle}
              onChange={(e) => setPhotoStyle(e.target.value as any)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white transition cursor-pointer"
            >
              <option value="photorealistic">📷 Photorealistic 8K DSLR Photography</option>
              <option value="golden_hour">🌅 Golden Hour Sunset & Sunbeams</option>
              <option value="cinematic">🎬 Cinematic Travel Documentary</option>
              <option value="aerial">🚁 High-Altitude Drone Landscape</option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="block font-black text-slate-800">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '16:9 Banner', val: '16:9' },
                { label: '4:3 Card', val: '4:3' },
                { label: '1:1 Square', val: '1:1' },
              ].map((ar) => (
                <button
                  key={ar.val}
                  type="button"
                  onClick={() => setAspectRatio(ar.val as any)}
                  className={`py-2.5 px-2 rounded-2xl font-extrabold text-[11px] transition cursor-pointer border ${
                    aspectRatio === ar.val
                      ? 'bg-indigo-700 text-white border-indigo-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Custom Prompt Override */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-black text-slate-800 flex items-center justify-between">
            <span>Custom Visual Prompt Details (Optional)</span>
            <span className="text-[10px] text-slate-500 font-medium">Fine-tune details like lighting, weather, season</span>
          </label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="e.g. Misty morning lake with reflections of pine trees, photorealistic 8K, crystal clear water"
            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 font-bold placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition"
          />
        </div>

        {/* Generate Action Button */}
        <button
          type="button"
          disabled={isGenerating || !placeName.trim()}
          onClick={handleGenerate}
          className="w-full py-4 bg-gradient-to-r from-rose-600 via-indigo-600 to-blue-700 hover:from-rose-700 hover:to-indigo-800 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
              <span>Generating {imageSize} Real-Life Photo with gemini-3.1-flash-image...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate Real-Life Cover Photo ({imageSize} Resolution)</span>
            </>
          )}
        </button>

        {statusNotice && (
          <p className="text-center text-xs font-black text-indigo-900 bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl animate-fade-in">
            {statusNotice}
          </p>
        )}

        {/* Preview Area */}
        {generatedImage && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                <span>Generated Cover Photo Preview</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-slate-900 text-amber-400 font-mono font-black text-[10px] rounded-lg">
                  {generationInfo?.size || imageSize} RESOLUTION
                </span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px] rounded-lg">
                  gemini-3.1-flash-image
                </span>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 shadow-md aspect-video bg-slate-900 group">
              <img
                src={generatedImage}
                alt="Generated Real Life Cover"
                className="w-full h-full object-cover transition duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 p-4 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-mono font-bold text-amber-300 border border-white/20">
                    {generationInfo?.dimensionStr || `${imageSize} Photorealistic`}
                  </span>
                </div>
                <div>
                  <h4 className="font-black text-base drop-shadow-md text-white font-['Manrope']">
                    {placeName}
                  </h4>
                  <p className="text-[11px] text-slate-200 font-medium drop-shadow-sm line-clamp-1">
                    {generationInfo?.promptUsed || `Real life travel photograph of ${placeName}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Apply & Download Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {onApplyImage && (
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply as Package Cover Photo</span>
                </button>
              )}

              <a
                href={generatedImage}
                download={`${placeName.toLowerCase().replace(/\s+/g, '_')}_${imageSize}_cover.jpg`}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl text-xs transition cursor-pointer border border-slate-300 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-indigo-700" />
                <span>Download HD Cover</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
