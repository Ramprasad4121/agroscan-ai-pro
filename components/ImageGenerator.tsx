import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Download, RefreshCw, LayoutTemplate } from 'lucide-react';
import { generateGardenImage } from '../services/gemini';

interface ImageGeneratorProps {
  t: any;
}

export const ImageGenerator: React.FC<ImageGeneratorProps> = ({ t }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const image = await generateGardenImage(prompt, aspectRatio);
      setGeneratedImage(image);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const aspectRatios = [
    { label: 'Square (1:1)', value: '1:1' },
    { label: 'Portrait (3:4)', value: '3:4' },
    { label: 'Landscape (4:3)', value: '4:3' },
    { label: 'Mobile (9:16)', value: '9:16' },
    { label: 'Widescreen (16:9)', value: '16:9' },
  ];

  return (
    <div className="flex-grow bg-slate-50 animate-fade-in py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-4">
            <Sparkles size={14} />
            Powered by Imagen 4.0
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-3">
            {t.gen_title}
          </h2>
          <p className="text-slate-500">
            {t.gen_desc}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    {t.prompt_label}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t.prompt_placeholder}
                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <LayoutTemplate size={16} />
                    {t.aspect_ratio}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setAspectRatio(ratio.value)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                          aspectRatio === ratio.value
                            ? 'bg-purple-50 border-purple-500 text-purple-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="animate-spin" size={18} />
                      {t.generating}
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {t.generate}
                    </>
                  )}
                </button>
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 h-full min-h-[500px] flex flex-col">
              <div className="flex-grow relative bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center group">
                {generatedImage ? (
                  <>
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
                      <a 
                        href={generatedImage} 
                        download="agro-generated.jpg"
                        className="bg-white text-slate-900 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                      >
                        <Download size={20} />
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-200">
                      <ImageIcon size={40} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{t.ready_create}</h3>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">
                      {t.gen_placeholder}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};