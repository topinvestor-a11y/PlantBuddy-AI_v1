import React, { useState } from 'react';
import { Leaf, Heart, Sparkles, MapPin, Sun, Wind, ChevronRight, RefreshCcw, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getPlantRecommendation } from '../services/gemini';

const MBTI_LIST = [
  'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
  'ISTP', 'ISFP', 'INFP', 'INTP',
  'ESTP', 'ESFP', 'ENFP', 'ENTP',
  'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

const GOALS = [
  { id: 'healing', label: '심리적 치유 & 안정', icon: <Heart size={18} /> },
  { id: 'interior', label: '인테리어 & 미관', icon: <Sparkles size={18} /> },
  { id: 'easy', label: '키우기 쉬운 반려식물', icon: <Leaf size={18} /> },
];

const ENVIRONMENTS = [
  { id: 'low-light', label: '빛이 적은 실내', icon: <Sun size={18} className="opacity-50" /> },
  { id: 'bright', label: '햇빛이 잘 드는 창가', icon: <Sun size={18} /> },
  { id: 'small', label: '좁은 원룸/책상', icon: <MapPin size={18} /> },
  { id: 'balcony', label: '통풍이 잘되는 베란다', icon: <Wind size={18} /> },
];

export default function PlantBuddy() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    mbti: '',
    goal: 'healing',
    environment: 'low-light'
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    setLoading(true);
    setError(null);
    setStep(4);
    try {
      const res = await getPlantRecommendation(formData);
      setResult(res);
    } catch (err: any) {
      console.error("Caught error in UI:", err);
      setError(err.message || "추천을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setResult(null);
    setFormData({ mbti: '', goal: 'healing', environment: 'low-light' });
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#2d3a3a] font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-emerald-50 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xl tracking-tight">
            <Leaf className="fill-emerald-600" />
            <span>PlantBuddy</span>
          </div>
          <button onClick={reset} className="text-sm font-medium text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1">
            <RefreshCcw size={14} />
            다시하기
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a2e2e] tracking-tight">
                  당신의 성격에 꼭 맞는<br/>
                  <span className="text-emerald-600">반려식물</span>을 찾아보세요
                </h1>
                <p className="text-slate-500 text-lg">MBTI 기반 맞춤형 식물 테라피 서비스를 시작합니다.</p>
              </div>

              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">1</span>
                  당신의 MBTI는 무엇인가요?
                </h2>
                <div className="grid grid-cols-4 gap-3">
                  {MBTI_LIST.map((m) => (
                    <button
                      key={m}
                      onClick={() => setFormData({ ...formData, mbti: m })}
                      className={`py-4 rounded-2xl font-bold transition-all border-2 ${
                        formData.mbti === m 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={!formData.mbti}
                  onClick={() => setStep(2)}
                  className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all disabled:opacity-30"
                >
                  다음 단계로 <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">2</span>
                  식물을 키우는 주된 목적이 무엇인가요?
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setFormData({ ...formData, goal: g.label })}
                      className={`p-6 rounded-3xl flex items-center gap-4 transition-all border-2 text-left ${
                        formData.goal === g.label 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-100'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        formData.goal === g.label ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {g.icon}
                      </div>
                      <span className="font-bold text-lg">{g.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">이전</button>
                  <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold">다음 단계로</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-emerald-50">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">3</span>
                  식물이 놓일 환경은 어떤가요?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ENVIRONMENTS.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => setFormData({ ...formData, environment: e.label })}
                      className={`p-6 rounded-3xl flex flex-col gap-3 transition-all border-2 text-left ${
                        formData.environment === e.label 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-emerald-100'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        formData.environment === e.label ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                      }`}>
                        {e.icon}
                      </div>
                      <span className="font-bold">{e.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">이전</button>
                  <button 
                    onClick={handleRecommend} 
                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={20} />
                    추천 결과 보기
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {loading ? (
                <div className="bg-white p-12 rounded-[2rem] shadow-xl border border-emerald-50 flex flex-col items-center justify-center space-y-6 min-h-[400px]">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                    <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={32} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-900">당신만의 반려식물을 찾는 중...</h3>
                    <p className="text-slate-400 mt-2">{formData.mbti} 성향에 가장 잘 어울리는 식물을 분석하고 있어요.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-emerald-900 text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10 flex items-center gap-3 mb-6">
                      <div className="px-3 py-1 bg-emerald-500/20 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                        Recommendation Result
                      </div>
                    </div>
                    <div className="relative z-10 space-y-2">
                      <h2 className="text-3xl font-bold">
                        {formData.mbti}님을 위한<br/>
                        완벽한 반려식물 파트너
                      </h2>
                    </div>
                  </div>

                  <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-emerald-50">
                    {error ? (
                      <div className="text-center py-12 space-y-6">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                          <Wind size={32} />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-slate-900">추천을 가져오지 못했습니다</h3>
                          <p className="text-slate-500">{error}</p>
                        </div>
                        <button 
                          onClick={handleRecommend}
                          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all"
                        >
                          다시 시도하기
                        </button>
                      </div>
                    ) : (
                      <div className="prose prose-emerald max-w-none">
                        <Markdown
                          components={{
                            h1: ({ children }) => (
                              <div className="mb-10 text-center">
                                <span className="text-emerald-600 font-bold text-sm uppercase tracking-widest block mb-2">Recommended Plant</span>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 m-0">{children}</h1>
                                <div className="w-20 h-1.5 bg-emerald-500 mx-auto mt-6 rounded-full"></div>
                              </div>
                            ),
                            h2: ({ children }) => (
                              <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mt-12 mb-6 pb-2 border-b border-slate-100">
                                {children}
                              </h2>
                            ),
                            ul: ({ children }) => (
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0 list-none mb-8">
                                {children}
                              </ul>
                            ),
                            li: ({ children }) => (
                              <li className="bg-slate-50 p-4 rounded-2xl flex items-start gap-3 m-0 border border-slate-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                                <div className="text-slate-700 leading-relaxed">{children}</div>
                              </li>
                            ),
                            p: ({ children }) => (
                              <p className="text-slate-600 leading-relaxed text-lg mb-6">
                                {children}
                              </p>
                            )
                          }}
                        >
                          {result || ''}
                        </Markdown>
                      </div>
                    )}
                    
                    <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-5 text-slate-500 bg-slate-50 p-6 rounded-3xl flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-500 shrink-0">
                          <Quote size={24} />
                        </div>
                        <span className="text-sm md:text-base font-medium leading-snug">
                          "식물은 당신의 정성을 배신하지 않아요. <br className="hidden md:block"/>
                          매일 조금씩 자라나는 생명을 보며 마음의 평안을 얻으시길 바랍니다."
                        </span>
                      </div>
                      <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={reset}
                          className="flex-1 md:flex-none px-8 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                        >
                          <RefreshCcw size={20} />
                          다시 테스트하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 PlantBuddy AI. All rights reserved.</p>
        <p className="mt-2">대한민국 MZ세대의 마음을 치유하는 식물 테라피</p>
      </footer>
    </div>
  );
}
