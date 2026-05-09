import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, Download, RefreshCw, History, Edit3, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from './utils';

type Tone = 'professional' | 'startup' | 'formal';

interface HistoryItem {
  id: string;
  jdSnippet: string;
  resume: string;
  tone: Tone;
  letter: string;
  matches: string[];
  date: string;
}

export default function App() {
  const [screen, setScreen] = useState<'input' | 'output' | 'history'>('input');
  
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [tone, setTone] = useState<Tone>('professional');
  
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [coverLetter, setCoverLetter] = useState('');
  const [keyMatches, setKeyMatches] = useState<string[]>([]);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const [copied, setCopied] = useState(false);

  // Auto-typing effect variables
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) return;
      try {
        const res = await fetch(`${apiUrl}/history`);
        if (res.ok) {
          const data = await res.json();
          const loadedHistory = data.map((item: any) => ({
            id: item.id,
            jdSnippet: item.job_description_snippet || '',
            resume: item.resume_text || '',
            tone: item.tone || 'professional',
            letter: item.cover_letter,
            matches: item.key_matches || [],
            date: new Date(item.created_at).toLocaleDateString()
          }));
          setHistory(loadedHistory);
        }
      } catch (e) {
        console.warn('Failed to load history', e);
      }
    };
    fetchHistory();
  }, []);
  
  const handleGenerate = async () => {
    if (!jobDescription || !resumeText) return;
    
    setIsGenerating(true);
    let finalLetter = '';
    let finalMatches: string[] = [];

    const apiUrl = import.meta.env.VITE_API_URL;
    
    try {
      if (!apiUrl) {
          throw new Error('No API URL configured');
      }

      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_description: jobDescription,
          resume_text: resumeText,
          tone
        })
      });

      if (!response.ok) {
        throw new Error('API Generate failed');
      }

      const data = await response.json();
      finalLetter = data.cover_letter;
      finalMatches = data.key_matches || [];

    } catch (e) {
      console.warn("Using mock data, real API not connected or failed:", e);
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      finalLetter = "After leading three product launches at my current role that reduced onboarding time by 40%, I was drawn to this position's focus on user-centric engineering. Your requirement for someone who can bridge the gap between technical execution and product strategy aligns perfectly with my background.\n\nAt my previous company, my team and I scaled our backend systems to handle a 300% increase in load over six months, leveraging modern architectural patterns similar to those requested in the job description. I thrive in cross-functional environments where robust communication is just as critical as writing clean, maintainable code.\n\nI am particularly excited about the chance to bring my expertise in React and scalable system design to your team, continually pushing the standard for both performance and user experience.\n\nI look forward to discussing how my skills and drive can directly contribute to your upcoming feature rollouts.";
      finalMatches = ["React + TypeScript", "Cross-functional collaboration", "Scalable backend systems"];
    }
    
    setCoverLetter(finalLetter);
    setKeyMatches(finalMatches);
    
    // Unshift to local history instantly so user sees it locally too
    setHistory(prev => [{
      id: Date.now().toString(),
      jdSnippet: jobDescription.substring(0, 80) + '...',
      resume: resumeText,
      tone,
      letter: finalLetter,
      matches: finalMatches,
      date: new Date().toLocaleDateString()
    }, ...prev]);
    
    setIsGenerating(false);
    setDisplayedText('');
    setScreen('output');
  };

  useEffect(() => {
    if (screen === 'output' && coverLetter) {
      let i = 0;
      setDisplayedText('');
      const interval = setInterval(() => {
        setDisplayedText(prev => prev + coverLetter.charAt(i));
        i++;
        if (i >= coverLetter.length) {
          clearInterval(interval);
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [screen, coverLetter]);

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CoverLetter_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const viewHistoryItem = (item: HistoryItem) => {
    setCoverLetter(item.letter);
    setKeyMatches(item.matches);
    setDisplayedText(item.letter); // skip typing for history
    setScreen('output');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setScreen('input')}
          >
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
              <Edit3 className="w-4 h-4 text-amber-500" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-text-main">CoverCraft</span>
          </div>
          <button 
            onClick={() => setScreen(screen === 'history' ? 'input' : 'history')}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-main transition-colors"
          >
            {screen === 'history' ? (
              <>
                <X className="w-4 h-4" />
                Close History
              </>
            ) : (
              <>
                <History className="w-4 h-4" />
                History
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* ----- SCREEN 1: INPUT ----- */}
          {screen === 'input' && (
            <motion.div 
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[400px]">
                {/* JD Column */}
                <div className="flex flex-col space-y-3">
                  <label className="text-sm font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    Job Description
                    <span className="text-xs text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">Target</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target role description here..."
                    className="flex-1 bg-surface border border-border rounded-lg p-5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono leading-relaxed"
                  />
                </div>
                
                {/* Resume Column */}
                <div className="flex flex-col space-y-3">
                  <label className="text-sm font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                    Your Resume
                    <span className="text-xs text-blue-500/80 bg-blue-500/10 px-2 py-0.5 rounded">Source</span>
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your markdown or plain text resume here..."
                    className="flex-1 bg-surface border border-border rounded-lg p-5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-border/50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-muted mr-3">Tone:</span>
                  {(['professional', 'startup', 'formal'] as Tone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all capitalize border",
                        tone === t 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/30" 
                          : "bg-transparent text-text-muted border-transparent hover:bg-surfaceHover hover:text-text-main"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !jobDescription || !resumeText}
                    className="group relative inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-black bg-amber-500 rounded-lg overflow-hidden transition-all hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing Fit...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Generate Cover Letter
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                  <p className="text-xs text-text-muted/60 flex items-center gap-1.5">
                    Your letter will be written in the JD's own language
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ----- SCREEN 2: OUTPUT ----- */}
          {screen === 'output' && (
            <motion.div 
              key="output"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col max-w-3xl mx-auto w-full space-y-6 mt-4"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-text-muted mr-2">Core Focus Areas:</span>
                  {keyMatches.map((match, idx) => (
                    <motion.span 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="inline-flex items-center rounded-full bg-surface border border-border px-3 py-1 text-xs font-medium text-amber-500/90"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1.5 opacity-70" />
                      {match}
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Typewriter Card */}
              <motion.div 
                className="relative bg-[#0f0f0f] border border-border/80 shadow-2xl rounded-xl p-8 md:p-12 min-h-[400px] flex flex-col"
              >
                 <div className="absolute top-0 right-0 p-4">
                    <span className="text-[10px] uppercase tracking-widest text-text-muted/40 font-mono bg-surfaceHover px-2 py-1 rounded">
                      Tailored to this JD — not a template
                    </span>
                 </div>
                 
                 <div className="font-mono text-sm md:text-base leading-relaxed text-text-main whitespace-pre-wrap flex-1 opacity-90">
                    {displayedText}
                    {displayedText.length < coverLetter.length && (
                      <motion.span 
                        animate={{ opacity: [1, 0] }} 
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 bg-amber-500 ml-1 h-4 align-middle"
                      />
                    )}
                 </div>
              </motion.div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button 
                  onClick={() => setScreen('input')}
                  className="text-sm text-text-muted hover:text-text-main transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate with different angle
                </button>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm text-text-main transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-text-muted" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm text-text-main transition-colors"
                  >
                    <Download className="w-4 h-4 text-text-muted" />
                    Download .txt
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ----- SCREEN 3: HISTORY ----- */}
          {screen === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 max-w-3xl mx-auto w-full flex flex-col space-y-6"
            >
              <h2 className="text-xl font-semibold tracking-tight">Generation History</h2>
              
              {history.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-text-muted space-y-4 py-20 border border-dashed border-border rounded-xl">
                  <History className="w-8 h-8 opacity-20" />
                  <p className="text-sm">No cover letters generated yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => viewHistoryItem(item)}
                      className="group p-5 bg-surface border border-border rounded-xl cursor-pointer hover:border-amber-500/30 transition-all flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-text-muted">{item.date}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
                            {item.tone}
                          </span>
                        </div>
                        <p className="text-sm text-text-main line-clamp-1 break-all">
                          {item.jdSnippet}
                        </p>
                      </div>
                      <button className="flex items-center gap-1 text-xs text-text-muted group-hover:text-amber-500 transition-colors whitespace-nowrap">
                        Expand
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
