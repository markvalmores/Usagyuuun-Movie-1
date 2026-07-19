import { motion, AnimatePresence } from "motion/react";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { SAGA_METADATA, SAGA_DATA } from "./types";
import { Play, Pause, RotateCcw, RotateCw, Info, Volume2, VolumeX, Sparkles, LayoutGrid, ChevronRight, Languages, Lock, CreditCard, X, Settings2, FastForward, Home, ZoomIn, ZoomOut, Maximize2, Move, Heart, Eye, MessageSquare } from "lucide-react";
import { db } from "./lib/firebase";
import { doc, onSnapshot, updateDoc, increment, getDoc, setDoc, deleteDoc, collection, query, serverTimestamp } from "firebase/firestore";
import { Comments } from "./components/Comments";

// Simple SFX, OST and Narration Manager using Web Audio and Speech API
class TrailerAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ostActive: boolean = false;
  private isDarkPhase: boolean = false;
  private currentLanguage: 'en' | 'fil' = 'en';

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3;
    }
  }

  setLanguage(lang: 'en' | 'fil') {
    this.currentLanguage = lang;
  }

  setPhase(dark: boolean) {
    this.isDarkPhase = dark;
  }

  private scheduleNextNotes() {
    if (!this.ctx || !this.masterGain || !this.ostActive) return;
    
    const playNote = (freq: number, time: number, duration: number, type: OscillatorType = 'sine') => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.isDarkPhase ? 0.12 : 0.06, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = this.ctx.currentTime;
    const notes = this.isDarkPhase 
      ? [130.81, 138.59, 110.00, 82.41, 73.42, 65.41] 
      : [261.63, 329.63, 392.00, 523.25, 440.00, 349.23];
    const type: OscillatorType = this.isDarkPhase ? 'sawtooth' : 'sine';
    
    for (let i = 0; i < 8; i++) {
      playNote(notes[i % 6], now + i * 0.5, 0.45, type);
    }

    setTimeout(() => this.scheduleNextNotes(), 3500);
  }

  playOST() {
    if (!this.ctx || !this.masterGain || this.ostActive) return;
    this.ostActive = true;
    this.scheduleNextNotes();
  }

  speak(text: string, textFil?: string) {
    window.speechSynthesis.cancel();
    
    const content = this.currentLanguage === 'fil' && textFil ? textFil : text;
    
    // Phonetic replacement for requested pronunciation
    const phoneticText = content
      .replace(/Usagyuuun/gi, "OU-SA-GEYUUUN")
      .replace(/Ninjin/gi, "Nin-Jin");
    
    const utterance = new SpeechSynthesisUtterance(phoneticText);
    utterance.lang = this.currentLanguage === 'fil' ? 'fil-PH' : 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    
    // Prioritize Google voices for that "Google Translate" feel
    let selectedVoice = voices.find(v => 
      v.lang.includes(this.currentLanguage === 'fil' ? 'PH' : 'US') && 
      v.name.toLowerCase().includes('google')
    );

    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        (v.lang.includes(this.currentLanguage === 'fil' ? 'PH' : 'US')) && 
        (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('google'))
      ) || voices[0];
    }
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.pitch = this.currentLanguage === 'fil' ? 1.0 : 0.5; 
    utterance.rate = 0.85;
    utterance.volume = 1.0;
    
    window.speechSynthesis.speak(utterance);
  }

  playTransition() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.frequency.setValueAtTime(this.isDarkPhase ? 200 : 800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(this.isDarkPhase ? 40 : 1200, this.ctx.currentTime + 0.3);
    env.gain.setValueAtTime(0, this.ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.05);
    env.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
    osc.connect(env);
    env.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  stopAll() {
    this.ostActive = false;
    window.speechSynthesis.cancel();
    if (this.ctx) this.ctx.suspend();
  }

  resume() {
    if (this.ctx) this.ctx.resume();
  }

  setVolume(val: number) {
    if (this.masterGain) this.masterGain.gain.value = val;
  }
}

// J.C. STAFF Production Field Guide & Peg Bar Overlay
const PegBarAndFieldGuide = ({ stage, isPlaying }: { stage: string; isPlaying: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex flex-col justify-between p-4 border border-white/5 font-mono select-none">
      {/* Top peg holes (Traditional hand-drawn animation desk peg bar) */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-12 items-center bg-zinc-900/60 px-6 py-2 rounded-full border border-white/10 z-50">
        <div className="w-4 h-4 bg-black border border-white/30 rounded-full shadow-inner" />
        <div className="w-12 h-4 bg-black border border-white/30 rounded-md shadow-inner" />
        <div className="w-4 h-4 bg-black border border-white/30 rounded-full shadow-inner" />
        <span className="text-[9px] font-black tracking-widest text-white/50 uppercase ml-2">J.C.STAFF ANIMATION DECK</span>
      </div>

      {/* Field guide safe zone borders */}
      <div className="absolute inset-8 border border-dashed border-white/10 rounded-lg pointer-events-none">
        <div className="absolute top-2 left-4 text-[9px] font-bold text-white/30">16:9 4K FIELD GUIDE</div>
        <div className="absolute bottom-2 right-4 text-[9px] font-bold text-white/30">CROP MARKS • 23.976 fps</div>
      </div>

      {/* Production Metadata Sheet */}
      <div className="absolute top-16 right-10 text-right space-y-0.5 text-[8px] font-bold text-white/40 leading-none">
        <div>STUDIO: J.C. STAFF PRODUCTION</div>
        <div>SERIES: USAGYUUUN MOVIE PROJECT</div>
        <div>STAGE: {stage.toUpperCase()} RENDER</div>
        <div>MOCAP: ACTIVE • 3D SOLVE</div>
      </div>
    </div>
  );
};

// 3D MoCap Tracking Points Overlay
const MocapOverlay = ({ isPlaying, showRawData }: { isPlaying: boolean; showRawData: boolean }) => {
  if (!isPlaying && !showRawData) return null;
  return (
    <div className={`absolute inset-0 pointer-events-none z-30 ${showRawData ? 'opacity-80' : 'opacity-40'}`}>
      <motion.div 
        animate={showRawData ? {} : { opacity: [0.2, 0.5, 0.2] }} 
        transition={{ duration: 0.1, repeat: Infinity }}
        className="absolute inset-0"
      >
        {/* Main Skeleton Nodes */}
        <div className="absolute top-[35%] left-[50%] -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full" />
        <div className="absolute top-[55%] left-[50%] -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full" />
        
        {/* Arms Nodes */}
        <div className="absolute top-[45%] left-[40%] w-2 h-2 bg-blue-400 rounded-full" />
        <div className="absolute top-[45%] left-[60%] w-2 h-2 bg-blue-400 rounded-full" />
        
        {showRawData && (
          <svg className="absolute inset-0 w-full h-full stroke-blue-400/50 stroke-[1px] fill-none">
            {/* Spine */}
            <line x1="50%" y1="35%" x2="50%" y2="55%" />
            {/* Shoulders */}
            <line x1="40%" y1="45%" x2="60%" y2="45%" />
            {/* Wireframe Data Flow Mesh */}
            <path d="M 50 35 L 40 45 L 50 55 L 60 45 Z" className="opacity-20" fill="rgba(96,165,250,0.1)" />
            
            {/* Floating Data Labels */}
            <text x="52%" y="34%" className="fill-blue-400 text-[6px] font-mono">NODE_HEAD_TRACK: OK</text>
            <text x="52%" y="44%" className="fill-blue-400 text-[6px] font-mono">NODE_ROOT_LINK: OK</text>
          </svg>
        )}

        {/* Traditional tracking markers */}
        {!showRawData && (
          <>
            <div className="absolute top-[40%] left-[45%] w-3 h-3 border border-blue-400 rounded-full flex items-center justify-center">
              <div className="w-[1px] h-full bg-blue-400 absolute rotate-45" />
              <div className="w-[1px] h-full bg-blue-400 absolute -rotate-45" />
              <span className="absolute -top-4 text-[6px] font-mono text-blue-400">P_HEAD_01</span>
            </div>
            <div className="absolute top-[55%] left-[52%] w-3 h-3 border border-blue-400 rounded-full flex items-center justify-center">
              <div className="w-[1px] h-full bg-blue-400 absolute rotate-45" />
              <div className="w-[1px] h-full bg-blue-400 absolute -rotate-45" />
              <span className="absolute -top-4 text-[6px] font-mono text-blue-400">P_CHEST_01</span>
            </div>
          </>
        )}
        
        {/* Depth grid lines */}
        <div className="absolute bottom-0 w-full h-1/4 bg-[linear-gradient(90deg,transparent_49%,rgba(59,130,246,0.1)_50%,transparent_51%)] bg-[length:40px_100%] border-t border-blue-500/10" />
      </motion.div>
    </div>
  );
};

// Page-by-Page Paper Texture Engine
const PaperTextureOverlay = ({ isPlaying }: { isPlaying: boolean }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % 4);
    }, 83); // 12 fps cycle
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-45 opacity-[0.06] mix-blend-multiply transition-transform"
      style={{
        backgroundImage: `url('https://www.transparenttextures.com/patterns/paper-fibers.png')`,
        backgroundPosition: `${frame * 25}% ${frame * 25}%`,
        transform: `rotate(${frame * 0.5}deg) scale(1.02)`,
      }}
    />
  );
};

// Scene Jump Glitch & Transition Component
const GlitchTransition = ({ trigger }: { trigger: any }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(() => setActive(false), 300);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (!active) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0], x: [-10, 10, -5, 0] }}
      className="absolute inset-0 z-[60] pointer-events-none bg-white mix-blend-difference overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 mix-blend-overlay" />
      <div className="absolute inset-0 flex flex-col gap-[2px]">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="h-4 w-full bg-black/10 backdrop-blur-[2px]" style={{ marginLeft: Math.random() * 20 - 10 }} />
        ))}
      </div>
    </motion.div>
  );
};

// Hand-Drawn Pencil Outline & Animation Overlay
const HandDrawnCelOverlay = ({ partId, progress, isPlaying }: { partId: number; progress: number; isPlaying: boolean }) => {
  // Generate random jitter to simulate hand-drawn frame boiler effect (vibrating brush strokes)
  const [jitter, setJitter] = React.useState({ x: 0, y: 0, rotate: 0 });
  
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setJitter({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        rotate: (Math.random() - 0.5) * 0.8
      });
    }, 83); // ~12 fps redraw/jitter cycle representing classic "animated on twos"
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sketch SVG path based on partId representing the spiritual narrative
  const getSketchPath = () => {
    switch (partId) {
      case 1: // The Divine Calling
        return (
          <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.75">
            {/* Celestial cross sketch */}
            <path d="M 50 20 L 50 80 M 35 40 L 65 40" />
            {/* Heavenly rays */}
            <path d="M 50 15 L 50 5 M 40 25 L 30 18 M 60 25 L 70 18 M 50 45 L 50 55" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Soft orbiting stars */}
            <path d="M 25 35 Q 27 30 30 35 Q 27 40 25 35 Z M 75 45 Q 77 40 80 45 Q 77 50 75 45 Z" strokeWidth="1" fill="currentColor" />
          </g>
        );
      case 2: // The Companion we Met
        return (
          <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8">
            {/* Cute rabbit ears sketch for Hana */}
            <path d="M 42 35 Q 38 10 46 25 Q 50 12 54 25" />
            {/* Soft anime blinking eyes */}
            <path d="M 40 45 Q 43 42 46 45 M 54 45 Q 57 42 60 45" />
            <path d="M 48 48 Q 50 51 52 48" strokeWidth="1.5" />
            {/* Sparkling stars of love */}
            <path d="M 30 30 L 32 32 M 32 30 L 30 32 M 70 30 L 72 32" strokeWidth="1.5" />
            <path d="M 50 62 Q 50 58 53 58 Q 50 58 50 54 Q 50 58 47 58 Q 50 58 50 62" strokeWidth="1" fill="currentColor" />
          </g>
        );
      case 3: // Shadows of Temptation
        return (
          <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" className="text-red-500">
            {/* Swirling demonic snake / shadows of doubt around Ninjin */}
            <path d="M 15 85 Q 30 45 45 65 T 75 45" strokeDasharray="4 4" />
            <path d="M 80 40 L 85 45 M 85 45 L 80 50" /> {/* Snake fangs */}
            {/* Jagged distress lines */}
            <path d="M 25 20 L 35 35 M 75 20 L 65 35 M 48 20 L 52 32" strokeWidth="1.5" />
            {/* Slashed background details */}
            <path d="M 10 10 L 90 90 M 90 10 L 10 90" strokeWidth="1" opacity="0.1" />
          </g>
        );
      case 4: // Terrors of the Void
        return (
          <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" className="text-red-600">
            {/* Massive beast claws slashing the scene */}
            <path d="M 20 20 L 35 50 M 25 15 L 40 45 M 30 10 L 45 40" />
            <path d="M 80 80 L 65 50 M 75 85 L 60 55 M 70 90 L 55 60" />
            {/* Giant evil glowing eyes in the center */}
            <path d="M 38 45 Q 45 35 52 45 M 48 45 Q 45 55 38 45 Z" fill="currentColor" opacity="0.3" />
            <path d="M 62 45 Q 55 35 48 45 M 52 45 Q 55 55 62 45 Z" fill="currentColor" opacity="0.3" />
          </g>
        );
      case 5: // Tears in the Wilderness
        return (
          <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" className="text-blue-400">
            {/* Flowing animated tears */}
            <path d="M 44 42 C 44 55 40 65 42 75" />
            <path d="M 56 42 C 56 55 60 65 58 75" />
            {/* Rain streaks */}
            <path d="M 20 10 L 15 30 M 80 10 L 75 30 M 15 50 L 10 70 M 85 50 L 80 70" strokeWidth="1.5" strokeDasharray="5 15" />
            {/* Broken covenant heart */}
            <path d="M 50 30 Q 42 18 50 10 Q 58 18 50 30 M 50 10 L 50 30" strokeWidth="1.5" />
          </g>
        );
      case 6: // Grace and Amendment
        return (
          <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" className="text-yellow-400">
            {/* Broken shackle chain representing forgiveness */}
            <path d="M 25 50 Q 30 45 35 50" />
            <path d="M 38 48 L 42 52 M 41 48 L 45 52" strokeWidth="1.5" /> {/* Broken link */}
            <path d="M 48 50 Q 53 45 58 50" />
            {/* Radiant halos and hearts */}
            <path d="M 50 25 C 40 25 40 35 50 35 C 60 35 60 25 50 25 Z" strokeWidth="1.5" fill="currentColor" opacity="0.2" />
            <path d="M 75 40 Q 77 35 80 40 T 85 40 Q 80 50 75 40" fill="currentColor" strokeWidth="1.5" />
          </g>
        );
      case 7: // Storming the Abyss
        return (
          <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" className="text-orange-500">
            {/* Shield of faith and burning flame sword */}
            <path d="M 50 15 L 75 30 L 50 85 L 25 30 Z" />
            <path d="M 50 25 L 50 75 M 35 40 L 65 40" strokeWidth="1.5" />
            {/* Energy slash sparks */}
            <path d="M 15 25 Q 35 15 45 30 M 85 25 Q 65 15 55 30" strokeWidth="2" strokeDasharray="6 4" />
          </g>
        );
      case 8: // It is Finished
        return (
          <g stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9" className="text-yellow-300">
            {/* Majestic shockwave ripple rings & divine cross */}
            <circle cx="50" cy="50" r="35" strokeDasharray="10 15" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="20" strokeDasharray="5 10" strokeWidth="1" />
            <path d="M 50 10 L 50 90 M 20 40 L 80 40" strokeWidth="4" />
            {/* Energy starburst lines */}
            <path d="M 10 10 L 25 25 M 90 10 L 75 25 M 10 90 L 25 75 M 90 90 L 75 75" strokeWidth="2" />
          </g>
        );
      case 9: // Eternal Happy Ending
        return (
          <g stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" className="text-yellow-400">
            {/* Heavenly crown of victory sketch */}
            <path d="M 30 65 L 35 40 L 50 55 L 65 40 L 70 65 Z" fill="currentColor" opacity="0.3" />
            <circle cx="35" cy="38" r="2" fill="currentColor" />
            <circle cx="50" cy="53" r="2.5" fill="currentColor" />
            <circle cx="65" cy="38" r="2" fill="currentColor" />
            {/* Sparkling divine glow dust */}
            <circle cx="20" cy="30" r="1" fill="currentColor" />
            <circle cx="80" cy="30" r="1.5" fill="currentColor" />
            <circle cx="50" cy="20" r="1" fill="currentColor" />
            <circle cx="50" cy="80" r="2" fill="currentColor" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full z-20 pointer-events-none mix-blend-screen"
      style={{
        x: jitter.x,
        y: jitter.y,
        rotate: jitter.rotate,
      }}
    >
      {/* Dynamic vector pencil sketches */}
      {getSketchPath()}
    </motion.svg>
  );
};

// Translucent Onion-Skin Ghost Frames Overlay
const OnionSkinning = ({ isPlaying, image }: { isPlaying: boolean; image: string }) => {
  if (!isPlaying) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-15 mix-blend-color-dodge">
      {/* Cyan ghost frame (Previous frame layout offset) */}
      <img 
        src={image} 
        alt="onion-prev" 
        className="absolute inset-0 w-full h-full object-cover transform translate-x-2 translate-y-1 scale-[1.01] filter grayscale(1) sepia(1) hue-rotate(180deg) saturate(10)" 
      />
      {/* Magenta ghost frame (Next frame layout offset) */}
      <img 
        src={image} 
        alt="onion-next" 
        className="absolute inset-0 w-full h-full object-cover transform -translate-x-2 -translate-y-1 scale-[0.99] filter grayscale(1) sepia(1) hue-rotate(300deg) saturate(10)" 
      />
    </div>
  );
};

// Cinematic VFX Overlays (Adobe Premiere / After Effects composition filters)
const CinematicVFX = ({ mode, isPlaying, stage }: { mode: string; isPlaying: boolean; stage: string }) => {
  if (!isPlaying) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none z-25 overflow-hidden">
      {/* Speed Lines for action/climax sequences */}
      {(mode === 'shake' || mode === 'impact') && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.45, 0] }}
          transition={{ repeat: Infinity, duration: 0.12 }}
          className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-25 mix-blend-screen"
        />
      )}
      
      {/* Flash / Impact burst frames for holy power releases */}
      {mode === 'impact' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-white mix-blend-overlay"
        />
      )}

      {/* Classic animation paper / film grain overlay */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] mix-blend-overlay" />
      
      {/* Production Desk Pencil Grid overlay */}
      {stage === 'rough' && (
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
      )}

      {/* Cinematic Letterbox (Panavision 2.39:1 aspect borders) */}
      <div className="absolute top-0 left-0 right-0 h-[6%] bg-zinc-950/95 z-40 border-b border-white/5" />
      <div className="absolute bottom-0 left-0 right-0 h-[6%] bg-zinc-950/95 z-40 border-t border-white/5" />

      {/* Radiant divine light rays representing Yahuah / Yahusha's glory */}
      <motion.div 
        animate={{ 
          opacity: [0.15, 0.4, 0.15],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/2 left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.12)_0%,_transparent_60%)] blur-[50px] rounded-full mix-blend-screen"
      />
    </div>
  );
};

export default function App() {
  const [currentPartId, setCurrentPartId] = useState(1);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [language, setLanguage] = useState<'en' | 'fil'>('en');
  const [isFullMovieMode, setIsFullMovieMode] = useState(false);
  
  // J.C. STAFF Production Workspace States
  const [productionStage, setProductionStage] = useState<'rough' | 'ink' | 'color' | 'composite' | 'auto'>('auto');
  const [showWorkspace, setShowWorkspace] = useState(true);
  const [showMocapData, setShowMocapData] = useState(false);
  
  // Workspace Navigation States (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<{ dist: number; center: { x: number; y: number } } | null>(null);
  
  // Payment state
  const [email, setEmail] = useState("");
  const [refCode, setRefCode] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [error, setError] = useState("");
  
  // Real-time Video Stats
  const [viewCount, setViewCount] = useState(0);
  const [videoLikes, setVideoLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const audio = useRef(new TrailerAudio());

  // All scenes combined for full movie
  const ALL_SCENES = useMemo(() => SAGA_DATA.flatMap(p => p.scenes), []);

  useEffect(() => {
    // Real-time View Count & Likes
    const statsRef = doc(db, "stats", "global");
    
    // Heartbeat for Active Viewers
    const sessionId = Math.random().toString(36).substring(7);
    const sessionRef = doc(db, "active_sessions", sessionId);
    
    const startSession = async () => {
      await setDoc(sessionRef, { timestamp: serverTimestamp() });
    };
    startSession();

    // Increment persistent total views
    const incrementView = async () => {
      await updateDoc(statsRef, {
        viewCount: increment(1)
      });
    };
    incrementView();

    // Listen to global stats (Total Likes)
    const unsubscribeStats = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setVideoLikes(data.likes || 0);
      }
    });

    // Listen to active sessions count
    const q = query(collection(db, "active_sessions"));
    const unsubscribeSessions = onSnapshot(q, (snapshot) => {
      setViewCount(snapshot.size);
    });

    // Cleanup session on unmount
    return () => {
      unsubscribeStats();
      unsubscribeSessions();
      deleteDoc(sessionRef).catch(console.error);
    };
  }, []);

  const handleVideoLike = async () => {
    if (hasLiked) return;
    const statsRef = doc(db, "stats", "global");
    await updateDoc(statsRef, {
      likes: increment(1)
    });
    setHasLiked(true);
  };

  const currentPart = useMemo(() => SAGA_DATA.find(p => p.id === currentPartId) || SAGA_DATA[0], [currentPartId]);
  
  const activeScenes = isFullMovieMode ? ALL_SCENES : currentPart.scenes;
  const currentScene = activeScenes[currentSceneIndex] || activeScenes[0];

  // Dynamic progressive rendering stage mapper
  const activeStage = useMemo(() => {
    if (productionStage !== 'auto') return productionStage;
    if (!isPlaying) return 'composite';
    // Calculate progress within current scene duration
    const sceneTotal = currentScene.duration;
    const currentSceneProgress = (currentTime % sceneTotal) / sceneTotal;
    if (currentSceneProgress < 0.25) return 'rough';
    if (currentSceneProgress < 0.5) return 'ink';
    if (currentSceneProgress < 0.75) return 'color';
    return 'composite';
  }, [productionStage, currentTime, currentScene, isPlaying]);

  const totalDuration = useMemo(() => {
    if (isFullMovieMode) return 9240; // 2 hours 34 minutes in seconds
    return activeScenes.reduce((acc, s) => acc + s.duration, 0);
  }, [activeScenes, isFullMovieMode]);

  const displayTime = useMemo(() => {
    // In full movie mode, we scale the time to make it feel like 2h 34m
    if (isFullMovieMode && isPlaying) {
      return currentTime;
    }
    return currentTime;
  }, [currentTime, isFullMovieMode, isPlaying]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers for Zoom and Pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.95 : 1.05;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
    } else if (zoom > 1) {
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
      lastTouchRef.current = { dist, center };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      const delta = dist / lastTouchRef.current.dist;
      setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 5));
      lastTouchRef.current.dist = dist;
    }
  };

  const handleSeekDirection = (amount: number) => {
    setCurrentTime((prev) => {
      const next = prev + amount;
      return Math.max(0, Math.min(next, totalDuration));
    });
  };

  // Direct keyboard shortcut hotkeys for pro media player feel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPayment) return;
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeekDirection(7);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeekDirection(-7);
      } else if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, totalDuration, showPayment, isUnlocked]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return totalDuration;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  useEffect(() => {
    let totalScenesDuration = activeScenes.reduce((acc, s) => acc + s.duration, 0);
    let loopTime = currentTime % totalScenesDuration;
    let cumulativeTime = 0;
    
    for (let i = 0; i < activeScenes.length; i++) {
      cumulativeTime += activeScenes[i].duration;
      if (loopTime <= cumulativeTime) {
        if (currentSceneIndex !== i) {
          setCurrentSceneIndex(i);
          if (isPlaying && !isMuted) {
            audio.current.playTransition();
            audio.current.speak(activeScenes[i].text, activeScenes[i].textFilipino);
          }
          // Shift to dark phase based on loop
          const isDark = i >= Math.floor(activeScenes.length / 2);
          audio.current.setPhase(isDark);
        }
        break;
      }
    }
  }, [currentTime, currentSceneIndex, isPlaying, isMuted, activeScenes]);

  useEffect(() => {
    if (isPlaying && !isMuted) {
      audio.current.resume();
      audio.current.playOST();
    } else {
      audio.current.stopAll();
    }
  }, [isPlaying, isMuted, currentTime]);

  const startMovie = () => {
    audio.current.init();
    audio.current.resume();
    if (currentTime < 0.2) {
      audio.current.speak(activeScenes[0].text, activeScenes[0].textFilipino);
    }
    setIsPlaying(true);
    setShowMenu(false);
  };

  const handlePlayPause = () => {
    if (isFullMovieMode && !isUnlocked) {
      setShowPayment(true);
      return;
    }
    if (!isPlaying) {
      audio.current.init();
      audio.current.resume();
      // Speak initial scene
      if (currentTime < 0.2) {
        audio.current.speak(activeScenes[0].text, activeScenes[0].textFilipino);
      }
    }
    setIsPlaying(!isPlaying);
    if (showMenu) setShowMenu(false);
  };

  const handleUnlock = () => {
    const success = isAdminMode 
      ? (email === SAGA_METADATA.adminEmail && passcode === "121997")
      : (refCode.length >= 8 && email.includes("@"));

    if (success) {
      setIsUnlocked(true);
      setShowPayment(false);
      setError("");
      
      // Auto-start movie if they were trying to watch full movie
      setIsFullMovieMode(true);
      setCurrentPartId(10);
      setCurrentTime(0);
      setCurrentSceneIndex(0);
      
      // Small delay to ensure state updates before audio init
      setTimeout(() => {
        audio.current.init();
        audio.current.resume();
        audio.current.speak(ALL_SCENES[0].text, ALL_SCENES[0].textFilipino);
        setIsPlaying(true);
      }, 100);
    } else {
      setError(isAdminMode ? "Invalid Admin Credentials." : "Invalid Email or Reference Code. Please check payment details.");
    }
  };

  const toggleFullMovie = () => {
    if (!isUnlocked) {
      setIsAdminMode(false);
      setShowPayment(true);
      return;
    }
    setIsFullMovieMode(true);
    setCurrentPartId(10);
    setCurrentTime(0);
    setCurrentSceneIndex(0);
    
    // Play immediately
    setTimeout(() => {
      startMovie();
    }, 100);
  };

  const handleAdminLoginClick = () => {
    setIsAdminMode(true);
    setShowPayment(true);
    setError("");
  };

  const returnToTitle = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentSceneIndex(0);
    setIsFullMovieMode(false);
    audio.current.stopAll();
  };

  const handleRewind = () => {
    setCurrentTime(0);
    setCurrentSceneIndex(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setCurrentTime(percentage * totalDuration);
  };

  const selectPart = (id: number) => {
    if (id === 10) {
      if (!isUnlocked) {
        setShowPayment(true);
        setShowMenu(false);
        return;
      }
      setIsFullMovieMode(true);
      setCurrentPartId(10);
    } else {
      setIsFullMovieMode(false);
      setCurrentPartId(id);
    }
    setCurrentTime(0);
    setCurrentSceneIndex(0);
    setShowMenu(false);
    
    // Auto-start play
    setTimeout(() => {
      startMovie();
    }, 100);
  };

  const getAnimationProps = (type: string) => {
    const isFull = isFullMovieMode;
    switch (type) {
      case 'zoom': return { scale: [1, 1.4], transition: { duration: currentScene.duration, ease: "easeInOut" } };
      case 'pan-left': return { x: [60, -60], scale: 1.2, transition: { duration: currentScene.duration, ease: "linear" } };
      case 'pan-right': return { x: [-60, 60], scale: 1.2, transition: { duration: currentScene.duration, ease: "linear" } };
      case 'pan-up': return { y: [40, -40], scale: 1.15, transition: { duration: currentScene.duration, ease: "linear" } };
      case 'dolly-in': return { scale: [1.1, 1.4], x: [10, -10], transition: { duration: currentScene.duration, ease: "easeInOut" } };
      case 'dolly-out': return { scale: [1.4, 1.1], x: [-10, 10], transition: { duration: currentScene.duration, ease: "easeInOut" } };
      case 'shake': return { 
        x: [-4, 4, -4, 4, 0], 
        y: [2, -2, 2, -2, 0],
        scale: [1.1, 1.15, 1.1],
        transition: { repeat: Infinity, duration: 0.15 } 
      };
      case 'live-2d': return { 
        y: [0, -15, 0], 
        rotate: [-2, 2, -2],
        scale: [1, 1.05, 1],
        transition: { repeat: Infinity, duration: 4, ease: "easeInOut" } 
      };
      case 'parallax': return { 
        scale: [1.2, 1.35], 
        x: [-30, 30],
        y: [-10, 10],
        transition: { duration: currentScene.duration, ease: "linear" } 
      };
      case 'impact': return {
        scale: [1, 1.1, 1.05],
        filter: ["brightness(1)", "brightness(2)", "brightness(1.2)"],
        transition: { duration: 0.5, times: [0, 0.2, 1] }
      };
      default: return { scale: 1.1 };
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black overflow-y-auto font-sans text-white select-none scroll-smooth">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
        
        {/* Video Player Section */}
        <div className="relative aspect-video w-full bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 group">
          {/* VFX: Particles/Stardust Overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() 
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [0.1, 0.5, 0.1],
              scale: [1, 1.5, 1]
            }}
            transition={{ 
              duration: 2 + Math.random() * 4, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* VFX: CRT Flicker Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Live Stats Overlay */}
      <div className="absolute top-8 left-8 z-[60] flex items-center gap-3">
        <div className="bg-red-600 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse">
          <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
        </div>
        <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-2">
          <Eye size={12} className="text-blue-400" /> {viewCount} VIEWERS
        </div>
        <button 
          onClick={handleVideoLike}
          disabled={hasLiked}
          className={`bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-2 transition-all hover:bg-white/10 ${hasLiked ? 'text-red-400 border-red-400/30' : ''}`}
        >
          <Heart size={12} className={hasLiked ? 'fill-red-400' : ''} /> {videoLikes} LIKES
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${currentPartId}-${currentSceneIndex}`}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(10px) brightness(0)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ 
            cursor: zoom > 1 ? 'move' : 'default',
          }}
        >
          <motion.div
            className="w-full h-full relative"
            animate={{ 
              scale: zoom,
              x: pan.x,
              y: pan.y
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.img 
              src={currentScene.image}
              alt="Scene"
              className="w-full h-full object-cover"
              animate={isPlaying ? getAnimationProps(currentScene.animation) : {}}
            />
            
            {/* VFX Component */}
            <CinematicVFX mode={currentScene.animation} isPlaying={isPlaying} stage={activeStage} />
            
            {/* New Animation Overlays */}
            <PaperTextureOverlay isPlaying={isPlaying} />
            <MocapOverlay isPlaying={isPlaying} showRawData={showMocapData} />
            <GlitchTransition trigger={currentSceneIndex} />

            {/* VFX: Vignette and Color Grading */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.8)_100%)] z-10" />
            <div className="absolute inset-0 bg-blue-900/5 mix-blend-overlay z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 z-10" />
          </motion.div>

          {/* Dialogue/Text with dramatic anime styling */}
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "backOut" }}
            className="absolute bottom-40 left-0 w-full text-center px-10 z-40"
          >
            <div className="inline-block relative">
              <div className="absolute -inset-4 bg-black/40 blur-2xl rounded-full -z-10" />
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] drop-shadow-[0_10px_20px_rgba(0,0,0,1)] italic text-white uppercase group">
                <span className="block text-blue-500 text-sm md:text-xl font-bold tracking-[0.5em] mb-4 not-italic opacity-70">
                  {isFullMovieMode ? 'SCENE ' + (currentSceneIndex + 1) : currentPart.subtitle}
                </span>
                {language === 'fil' ? currentScene.textFilipino || currentScene.text : currentScene.text}
              </h2>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 1 }}
                className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-6 shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Main Controls Panel */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-50 flex items-center justify-between px-8"
      >
        <div className="flex items-center gap-6">
          <button 
            onClick={handlePlayPause}
            className="p-4 bg-white text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button 
            onClick={() => handleSeekDirection(-7)}
            className="p-3 text-white/70 hover:text-white transition-colors relative"
          >
            <RotateCcw size={20} />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold">7</span>
          </button>
          <button 
            onClick={() => handleSeekDirection(7)}
            className="p-3 text-white/70 hover:text-white transition-colors relative"
          >
            <RotateCw size={20} />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold">7</span>
          </button>
          <button 
            onClick={handleRewind}
            className="p-3 text-white/70 hover:text-white transition-colors ml-4"
          >
            <RotateCcw size={20} />
          </button>
          <div className="text-sm font-mono tracking-widest text-white/60 flex items-center gap-3">
            {isFullMovieMode ? (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-yellow-500 text-black text-[9px] font-black rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] tracking-widest"
              >
                FULL MOVIE
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] tracking-widest"
              >
                {currentPart.subtitle}
              </motion.div>
            )}
            <span className="font-bold text-white/80">{formatTime(currentTime)} / {formatTime(totalDuration)}</span>
          </div>

          {/* Workspace Zoom Controls */}
          <div className="hidden lg:flex items-center gap-1.5 bg-white/5 rounded-full p-1 border border-white/10 ml-4">
            <button 
              onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="px-3 py-1 text-[9px] font-black tracking-tighter hover:bg-white/20 rounded-md transition-all text-white/60 hover:text-white bg-white/5 uppercase"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button 
              onClick={() => setZoom(prev => Math.min(prev + 0.25, 5))}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={returnToTitle}
            className="p-3 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <Home size={20} />
            <span className="hidden md:inline text-[10px] font-black tracking-widest uppercase">Title Screen</span>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-3 text-white/70 hover:text-white transition-colors flex items-center gap-2"
          >
            <Settings2 size={20} />
            <span className="hidden md:inline text-[10px] font-black tracking-widest uppercase">Audio & Subtitles</span>
          </button>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-3 rounded-full transition-all ${showMenu ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            <LayoutGrid size={20} />
          </button>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 text-white/70 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-3 text-white/70 hover:text-white transition-colors"
          >
            <Info size={20} />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-400 mb-1 flex items-center gap-1">
              <Sparkles size={10} /> VFX ACTIVE
            </span>
            <p className="text-xs font-mono text-white/40 tracking-widest uppercase">
              {currentPart.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center p-6 z-[100] bg-black/60 backdrop-blur-md"
          >
            <div className="bg-zinc-900/90 border border-white/10 p-10 rounded-[2.5rem] max-w-lg w-full shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src="/src/assets/images/usagyuuun_pure_face_1784343854659.jpg" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tight">{currentPart.title}</h3>
                  <p className="text-blue-400 text-sm font-bold tracking-widest">{currentPart.subtitle}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed font-medium">
                {currentPart.description} High-fidelity VFX and synthetic OST music integrated for an immersive cinematic experience.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                  <span className="text-gray-500 uppercase text-[10px] tracking-widest">Creative Lead</span>
                  <span className="font-bold">{SAGA_METADATA.creator}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                  <span className="text-gray-500 uppercase text-[10px] tracking-widest">Entry Status</span>
                  <span className={`font-bold ${currentPart.status === 'Released' ? 'text-green-400' : 'text-blue-400'}`}>
                    {currentPart.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowInfo(false)}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-200 transition-all active:scale-95 shadow-xl"
              >
                RETURN TO TRAILER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Comments & Community Section */}
        <div className="w-full max-w-4xl mx-auto pb-20">
          <div className="flex items-center justify-between mb-4 px-4">
            <div>
              <h2 className="text-2xl font-black italic tracking-tighter uppercase">{currentPart.title}</h2>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest">{currentPart.subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Production ID</p>
              <p className="text-xs font-mono opacity-40">JC-STAFF-2026-USAGYUUN</p>
            </div>
          </div>
          
          <Comments videoId={currentPartId.toString()} />
        </div>
      </div> {/* End max-w-7xl Container */}

      {/* Title Overlay (Start) */}
      {!isPlaying && currentTime === 0 && (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-[200] bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center px-6"
          >
             <motion.div
               initial={{ y: -20 }}
               animate={{ y: 0 }}
               className="mb-4 inline-block px-4 py-1 bg-blue-600 text-[10px] font-black tracking-[0.4em] uppercase rounded-full"
             >
               A Multimedia Experience
             </motion.div>
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-2 italic bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
               USAGYUUUN N FRIENDS
             </h1>
             <h2 className="text-2xl md:text-4xl font-bold tracking-[0.2em] text-white/90 mb-4">
               THE MOVIE SERIES
             </h2>
             <p className="text-sm md:text-lg text-blue-300 font-bold tracking-[0.5em] uppercase mb-16 opacity-80">
               BY {SAGA_METADATA.creator.toUpperCase()}
             </p>
             <div className="flex flex-col items-center gap-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <button 
                    onClick={() => {
                      setIsFullMovieMode(false);
                      handlePlayPause();
                    }}
                    className="px-12 py-5 bg-white text-black font-black text-xl rounded-full hover:scale-110 active:scale-95 transition-all flex items-center gap-4 shadow-[0_0_30px_rgba(255,255,255,0.3)] group"
                  >
                    <Play fill="currentColor" className="group-hover:translate-x-1 transition-transform" /> START PART 1
                  </button>
                  <button 
                    onClick={toggleFullMovie}
                    className="px-12 py-5 bg-yellow-500 text-black font-black text-xl rounded-full hover:scale-110 active:scale-95 transition-all flex items-center gap-4 shadow-[0_0_50px_rgba(234,179,8,0.4)] group"
                  >
                    <FastForward fill="currentColor" className="group-hover:translate-x-1 transition-transform" /> WATCH FULL MOVIE
                  </button>
                </div>
                <button 
                  onClick={() => setShowMenu(true)}
                  className="text-white/40 hover:text-white text-xs font-black tracking-widest uppercase transition-colors"
                >
                  Explore Saga Timeline
                </button>
                <button 
                  onClick={handleAdminLoginClick}
                  className="mt-2 flex items-center gap-2 text-blue-500/50 hover:text-blue-400 text-[9px] font-black tracking-[0.2em] uppercase transition-all"
                >
                  <Lock size={10} /> Admin Login
                </button>
                <p className="text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">
                  Duration: 2 Hours 34 Minutes • 4K ULTRA HD • 5.1 SURROUND
                </p>
             </div>
          </motion.div>
        </div>
      )}
      {/* Saga Timeline Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-zinc-950/95 backdrop-blur-2xl z-[150] border-l border-white/10 flex flex-col"
          >
            <div className="p-8 border-b border-white/10">
              <h3 className="text-2xl font-black tracking-tight mb-1">SAGA TIMELINE</h3>
              <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">Select a Cinematic Entry</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {SAGA_DATA.map((part) => (
                <motion.button
                  key={part.id}
                  onClick={() => selectPart(part.id)}
                  whileHover={{ x: 10 }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                    currentPartId === part.id 
                    ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                    : part.id === 10 ? 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex-1">
                    <span className={`text-[10px] font-black tracking-widest uppercase mb-1 block ${currentPartId === part.id ? 'text-blue-400' : 'text-gray-500'}`}>
                      {part.subtitle}
                    </span>
                    <h4 className="text-xl font-bold tracking-tight mb-2 group-hover:text-blue-300 transition-colors">{part.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-1 group-hover:text-gray-300 transition-colors">{part.description}</p>
                  </div>
                  <ChevronRight size={20} className={`transition-transform group-hover:translate-x-1 ${currentPartId === part.id ? 'text-blue-400' : 'text-white/20'}`} />
                </motion.button>
              ))}
            </div>

            <div className="p-8 border-t border-white/10 bg-black/40">
              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-gray-500 uppercase">
                <span>Total Entries: 9</span>
                <span>Continuity: Stable</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Settings Overlay (Netflix style) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex flex-col items-center justify-center p-10"
          >
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-10 right-10 p-4 text-white hover:bg-white/10 rounded-full"
            >
              <X size={32} />
            </button>
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-20">
              <div>
                <h3 className="text-3xl font-black mb-10 flex items-center gap-4">
                  <Volume2 /> AUDIO (DUBBING)
                </h3>
                <div className="space-y-4">
                  {['en', 'fil'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang as 'en' | 'fil')}
                      className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center justify-between ${
                        language === lang ? 'border-blue-600 bg-blue-600/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-xl font-bold uppercase tracking-widest">
                        {lang === 'en' ? 'English (Original)' : 'Filipino (Tagalog)'}
                      </span>
                      {language === lang && <div className="w-4 h-4 bg-blue-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black mb-10 flex items-center gap-4">
                  <Languages /> SUBTITLES
                </h3>
                <div className="space-y-4">
                  {['en', 'fil'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang as 'en' | 'fil')}
                      className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center justify-between ${
                        language === lang ? 'border-blue-600 bg-blue-600/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <span className="text-xl font-bold uppercase tracking-widest">
                        {lang === 'en' ? 'English' : 'Filipino'}
                      </span>
                      {language === lang && <div className="w-4 h-4 bg-blue-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="max-w-4xl w-full mt-20 pt-10 border-t border-white/10">
              <h3 className="text-xl font-black mb-6 flex items-center gap-4 text-white/60">
                <Settings2 size={20} /> PRODUCTION & DEVELOPER TOOLS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setShowWorkspace(!showWorkspace)}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                    showWorkspace ? 'border-green-600 bg-green-600/10 text-white' : 'border-white/10 bg-white/5 text-white/40'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-widest">Production Workspace</p>
                    <p className="text-[10px] opacity-60">Overlays, Field Guides & Peg Bars</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${showWorkspace ? 'bg-green-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showWorkspace ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                <button 
                  onClick={() => setShowMocapData(!showMocapData)}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${
                    showMocapData ? 'border-blue-600 bg-blue-600/10 text-white' : 'border-white/10 bg-white/5 text-white/40'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-bold uppercase tracking-widest">Mocap Raw Data</p>
                    <p className="text-[10px] opacity-60">3D Wireframe Skeleton Overlay</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${showMocapData ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showMocapData ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>

                {!isUnlocked && (
                  <button 
                    onClick={() => {
                      setShowSettings(false);
                      handleAdminLoginClick();
                    }}
                    className="flex items-center justify-between p-6 rounded-2xl border-2 border-white/10 bg-white/5 text-blue-400 hover:border-blue-600 transition-all group"
                  >
                    <div className="text-left">
                      <p className="font-bold uppercase tracking-widest group-hover:text-white">Admin Movie Unlock</p>
                      <p className="text-[10px] opacity-60">Authorize Full Movie Content</p>
                    </div>
                    <Lock size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment/Unlock Modal */}
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] bg-black/95 flex items-center justify-center p-6 backdrop-blur-3xl"
          >
            <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] max-w-xl w-full shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-black italic tracking-tighter">PREMIUM UNLOCK</h3>
                <button onClick={() => setShowPayment(false)} className="text-white/40 hover:text-white"><X /></button>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl mb-8">
                <p className="text-yellow-500 text-sm font-bold leading-relaxed">
                  Support the creator to watch the full 2h 34m movie with OST, VFX, and Multi-language Dubbing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <CreditCard size={16} /> <span className="text-[10px] font-black">GCASH</span>
                  </div>
                  <p className="text-2xl font-black">₱250</p>
                </div>
                <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                  <div className="flex items-center gap-2 text-blue-400 mb-2">
                    <Lock size={16} /> <span className="text-[10px] font-black">PAYPAL</span>
                  </div>
                  <p className="text-2xl font-black">$5.00</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block">
                    {isAdminMode ? 'Admin Email' : 'Email Address'}
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAdminMode ? "admin@system" : "your@email.com"}
                    className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-blue-600 outline-none font-bold"
                  />
                </div>
                {!isAdminMode ? (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block">Reference / Proof Code</label>
                    <input 
                      type="text" 
                      value={refCode}
                      onChange={(e) => setRefCode(e.target.value)}
                      placeholder="Enter Reference Number"
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-blue-600 outline-none font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2 mb-2 block">Admin Passcode</label>
                    <input 
                      type="password" 
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-blue-600 outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-center mb-6 text-xs font-bold uppercase tracking-widest">{error}</p>}

              <button 
                onClick={handleUnlock}
                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xl rounded-2xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] active:scale-95"
              >
                {isAdminMode ? 'ADMIN VERIFY' : 'VERIFY & UNLOCK CONTENT'}
              </button>

              <div className="mt-8 flex justify-center">
                <button 
                  onClick={() => {
                    setIsAdminMode(!isAdminMode);
                    setError("");
                  }}
                  className="text-[10px] text-gray-500 hover:text-white uppercase tracking-widest font-black transition-colors"
                >
                  {isAdminMode ? 'Switch to Standard Unlock' : 'Admin Access'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
