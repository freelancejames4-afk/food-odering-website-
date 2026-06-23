import React, { useEffect, useRef, useState } from 'react';
import { SimulatedOrder, DeliveryAddress, OrderStage } from '../types';
import {
  Clock,
  Navigation,
  CheckCircle,
  Smartphone,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Shield,
  ThumbsUp,
  User,
  Zap,
  Play,
  Pause,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveOrderTrackerProps {
  order: SimulatedOrder;
  onResetOrder: () => void;
}

export default function LiveOrderTracker({ order, onResetOrder }: LiveOrderTrackerProps) {
  const [stage, setStage] = useState<OrderStage>('preparing');
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [etaSecs, setEtaSecs] = useState(1500); // 25 mins initial
  const [isFastSim, setIsFastSim] = useState(true); // Default to fast simulation so user doesn't wait 25 mins
  const [isPaused, setIsPaused] = useState(false);
  
  // Simulated courier interaction
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'driver' | 'user'; text: string; time: string }>>([
    {
      sender: 'driver',
      text: "Hi! I'm Alex, your FreshDelivery courier. I'm waiting at the kitchen for your Signature Salmon Bowl. Any specific drop-off details?",
      time: 'Just now'
    }
  ]);
  const [userChatMsg, setUserChatMsg] = useState('');

  // Canvas Refs for responsive map drawing
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  // Map Coordinates configuration (drawn as fractions of canvas width/height)
  const mapPoints = {
    start: { x: 0.15, y: 0.75 },    // Kitchen
    mid1: { x: 0.35, y: 0.60 },     // Intersection 1
    mid2: { x: 0.45, y: 0.25 },     // Intersection 2
    mid3: { x: 0.70, y: 0.45 },     // Park curve
    end: { x: 0.85, y: 0.20 }       // Delivery Address
  };

  // Run the simulation loop
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = isFastSim ? 250 : 1000;
    const progressIncrement = isFastSim ? 1.0 : 0.08; // Speeds up the journey nicely

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = Math.min(100, prev + progressIncrement);
        
        // Update stage based on progress
        if (next < 25) {
          setStage('preparing');
        } else if (next >= 25 && next < 45) {
          setStage('pickup');
        } else if (next >= 45 && next < 98) {
          setStage('on_the_way');
        } else {
          setStage('arrived');
        }

        return next;
      });

      // Tick down ETA
      setEtaSecs((prev) => {
        if (prev <= 0) return 0;
        // In fast mode, decrease ETA faster
        return Math.max(0, prev - (isFastSim ? 15 : 1));
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isFastSim, isPaused]);

  // Handle active messages depending on the stage
  const getStageTitle = (currentStage: OrderStage) => {
    switch (currentStage) {
      case 'preparing':
        return 'Prepping Salmon & Pressing Juices';
      case 'pickup':
        return 'Order Handed over to Courier';
      case 'on_the_way':
        return 'Courier is en Route (Eco E-Bike)';
      case 'arrived':
        return 'Order Delivered! Enjoy Fresh!';
    }
  };

  const getStageDesc = (currentStage: OrderStage) => {
    switch (currentStage) {
      case 'preparing':
        return 'Chef is portioning sashimi salmon & preparing fresh toppings in our hygienic kitchen.';
      case 'pickup':
        return 'Courier Alex is checking order contents and placing them securely in an insulated pouch.';
      case 'on_the_way':
        return 'Cruising along Central Park. Courier is avoiding traffic lights to reach you fast.';
      case 'arrived':
        return 'Food left at your designated drop location. Thank you for eating fresh with us!';
    }
  };

  // Automated courier updates during driving stages
  useEffect(() => {
    if (progress >= 30 && chatMessages.length === 1) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: "Perfect, just picked up your fresh-pressed juices and Salmon Bowl! Insulated and ice-cold blocks are secured. Setting off now!",
          time: '3m ago'
        }
      ]);
    } else if (progress >= 70 && chatMessages.length === 2) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: "About 2 minutes away. I'll buzz the gate code (1234) as requested and leave it right at Apartment 4B door.",
          time: '1m ago'
        }
      ]);
    } else if (progress >= 98 && chatMessages.length === 3) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: "Delivered! Left safely at your door. Have a wonderful, healthy meal! 🥗✨",
          time: 'Just now'
        }
      ]);
    }
  }, [progress, chatMessages]);

  // ResizeObserver for canvas sizing & map drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth;
    let height = 240; // Fixed aesthetic height

    // Adjust for HighDPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    let frameId: number;

    const bezierPoint = (t: number, p0: any, p1: any, p2: any, p3: any, p4: any) => {
      // Piecewise linear interpolation along our winding delivery route
      if (t < 0.25) {
        const localT = t / 0.25;
        return {
          x: p0.x + (p1.x - p0.x) * localT,
          y: p0.y + (p1.y - p0.y) * localT
        };
      } else if (t < 0.50) {
        const localT = (t - 0.25) / 0.25;
        return {
          x: p1.x + (p2.x - p1.x) * localT,
          y: p1.y + (p2.y - p1.y) * localT
        };
      } else if (t < 0.75) {
        const localT = (t - 0.50) / 0.25;
        return {
          x: p2.x + (p3.x - p2.x) * localT,
          y: p2.y + (p3.y - p2.y) * localT
        };
      } else {
        const localT = (t - 0.75) / 0.25;
        return {
          x: p3.x + (p4.x - p3.x) * localT,
          y: p3.y + (p4.y - p3.y) * localT
        };
      }
    };

    let animationTick = 0;

    const drawMap = () => {
      animationTick += 1;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Background Grid
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 0.5;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Draw Scenic "Central Park" Green Zone in background
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.beginPath();
      ctx.roundRect(width * 0.48, height * 0.35, width * 0.22, height * 0.45, 12);
      ctx.fill();
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px Inter';
      ctx.fillText('CENTRAL PARK', width * 0.51, height * 0.55);

      // 3. Define raw pixel coordinates for landmarks based on fractions
      const pStart = { x: mapPoints.start.x * width, y: mapPoints.start.y * height };
      const p1 = { x: mapPoints.mid1.x * width, y: mapPoints.mid1.y * height };
      const p2 = { x: mapPoints.mid2.x * width, y: mapPoints.mid2.y * height };
      const p3 = { x: mapPoints.mid3.x * width, y: mapPoints.mid3.y * height };
      const pEnd = { x: mapPoints.end.x * width, y: mapPoints.end.y * height };

      // 4. Draw Route Track (Slightly curved or winding path)
      ctx.beginPath();
      ctx.moveTo(pStart.x, pStart.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(pEnd.x, pEnd.y);
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Draw Inner Dotted Track Indicator
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 5. Draw Kitchen Landmark (Starting point)
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.fillStyle = '#10b981'; // Forest green / Emerald
      ctx.beginPath();
      ctx.arc(pStart.x, pStart.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍳', pStart.x, pStart.y);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('Fresh Kitchen', pStart.x, pStart.y + 16);

      // 6. Draw User Home Landmark (Ending point)
      ctx.fillStyle = '#6366f1'; // Primary Indigo
      ctx.beginPath();
      ctx.arc(pEnd.x, pEnd.y, 8, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter';
      ctx.fillText('🏠', pEnd.x, pEnd.y);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 10px Inter';
      ctx.fillText('Your Home', pEnd.x, pEnd.y - 14);

      // 7. Calculate and Draw Moving Driver (alex)
      const currentPos = bezierPoint(progress / 100, pStart, p1, p2, p3, pEnd);

      // Pulse ring around courier
      const pulseSize = 8 + Math.abs(Math.sin(animationTick * 0.08)) * 14;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, pulseSize, 0, 2 * Math.PI);
      ctx.stroke();

      // Courier core circle
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(currentPos.x, currentPos.y, 9, 0, 2 * Math.PI);
      ctx.fill();

      // Courier indicator letter (A for Alex)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Inter';
      ctx.fillText('🚴', currentPos.x, currentPos.y);

      // Label "Courier Alex"
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 9px Inter';
      ctx.fillText('Alex (En Route)', currentPos.x, currentPos.y + 18);

      frameId = requestAnimationFrame(drawMap);
    };

    drawMap();

    // Resize observer to handle responsiveness elegantly
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = entry.contentRect.width;
        canvas.width = width * dpr;
        canvas.style.width = `${width}px`;
        if (ctx) {
          ctx.restore();
          ctx.save();
          ctx.scale(dpr, dpr);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [progress]);

  // Handle formatted clock/ETA
  const formatETA = (seconds: number) => {
    if (seconds <= 0) return 'Arrived';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Formatted Local Placed Time
  const getPlacedTimeStr = () => {
    const d = new Date(order.placedAt);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send interactive message to courier chat
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userChatMsg.trim()) return;

    const newUserMsg = {
      sender: 'user' as const,
      text: userChatMsg,
      time: 'Just now'
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setUserChatMsg('');

    // Trigger funny automated witty courier replies based on status
    setTimeout(() => {
      let driverReply = '';
      if (progress < 40) {
        driverReply = "Roger that! I'm on standby. The chefs are currently putting the final garnishes of pickled ginger and sesame drizzle. 🥗";
      } else if (progress >= 40 && progress < 90) {
        driverReply = "Got it! Pedaling as fast as these eco-friendly wheels can carry me. Watch me navigate the streets live on your screen!";
      } else {
        driverReply = "Perfect! Just locked up the bike and walking up to your porch. Enjoy the delicious, crisp food!";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'driver',
          text: driverReply,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-surface-variant/20 text-center space-y-4">
        <div className="relative inline-flex items-center justify-center p-2 bg-primary/10 rounded-full text-primary">
          <span className="material-symbols-outlined text-4xl animate-bounce">delivery_dining</span>
          <div className="absolute inset-0 rounded-full border border-primary/20 pulse-ring" />
        </div>

        <div>
          <h2 className="font-display text-lg sm:text-xl font-black text-on-surface">
            {getStageTitle(stage)}
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-1 max-w-sm mx-auto leading-relaxed">
            {getStageDesc(stage)}
          </p>
        </div>

        {/* Live Visual Timeline Progress Bar */}
        <div className="relative pt-2">
          <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 text-[10px] font-bold text-on-surface-variant pt-2">
            <span className={stage === 'preparing' ? 'text-primary font-black' : ''}>Prepping</span>
            <span className={stage === 'pickup' ? 'text-primary font-black' : ''}>Pick-up</span>
            <span className={stage === 'on_the_way' ? 'text-primary font-black' : ''}>On Road</span>
            <span className={stage === 'arrived' ? 'text-primary font-black' : ''}>Arrived</span>
          </div>
        </div>
      </section>

      {/* Simulator Controls & Speed Option */}
      <section className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Live Simulator:</span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-750 text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-secondary animate-pulse" /> : <Pause className="w-3.5 h-3.5 text-primary" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-zinc-400">Speed:</span>
          <button
            onClick={() => setIsFastSim(true)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isFastSim
                ? 'bg-primary text-white font-bold'
                : 'bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-750 text-zinc-300'
            }`}
          >
            <Zap className="w-3 h-3 inline mr-1" /> Fast Demo (60s)
          </button>
          <button
            onClick={() => setIsFastSim(false)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !isFastSim
                ? 'bg-primary text-white font-bold'
                : 'bg-zinc-800 border border-zinc-700/50 hover:bg-zinc-750 text-zinc-300'
            }`}
          >
            Standard Speed
          </button>
        </div>
      </section>

      {/* Responsive Route Tracking Map */}
      <section className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-variant/20 shadow-xs space-y-2">
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-primary rotate-45" /> Live Courier GPS Tracker
          </span>
          <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            ● GPS ACTIVE
          </span>
        </div>

        {/* Responsive Canvas Container */}
        <div ref={canvasContainerRef} className="w-full h-[240px] rounded-xl overflow-hidden bg-surface-container-low relative border border-surface-variant/10">
          <canvas ref={canvasRef} className="block w-full h-full" />
        </div>
      </section>

      {/* ETA Details Grid */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/20 shadow-3xs flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-full text-primary">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Estimated Time</span>
            <p className="font-display text-sm font-extrabold text-on-surface mt-0.5">
              {stage === 'arrived' ? 'Delivered!' : formatETA(etaSecs)}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/20 shadow-3xs flex items-center gap-3">
          <div className="bg-secondary/10 p-2.5 rounded-full text-secondary">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Placed At</span>
            <p className="font-display text-sm font-extrabold text-on-surface mt-0.5">
              {getPlacedTimeStr()}
            </p>
          </div>
        </div>
      </section>

      {/* Courier Profile Detail Card */}
      <section className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-variant/20 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border border-surface-variant flex items-center justify-center font-display font-extrabold text-on-surface text-lg">
            AM
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm font-extrabold text-on-surface">Alex Mercer</span>
              <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded">4.9 ★</span>
            </div>
            <p className="text-on-surface-variant text-xs mt-0.5">E-Bike Courier (Zero Emission)</p>
          </div>
        </div>

        <button
          onClick={() => setShowChatModal(true)}
          className="bg-primary text-white p-3 rounded-full shadow-md hover:bg-opacity-95 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </section>

      {/* Complete Reset Button when Arrived */}
      {stage === 'arrived' && (
        <button
          onClick={onResetOrder}
          className="w-full bg-secondary text-white py-4 rounded-full font-display text-base font-bold shadow-md hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-5 h-5 fill-white/10" />
          <span>Confirm Delivery & Go Home</span>
        </button>
      )}

      {/* Interactive Chat Modal with Driver */}
      <AnimatePresence>
        {showChatModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChatModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col h-[55vh] z-10"
            >
              {/* Modal Chat Header */}
              <div className="p-4 border-b border-surface-variant/30 flex justify-between items-center bg-surface-container-low rounded-t-3xl sm:rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                    AM
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-on-surface">Alex Mercer</h3>
                    <p className="text-[10px] text-secondary flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" /> Active Rider
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="p-1 hover:bg-surface-container-high rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {chatMessages.map((msg, i) => {
                  const isDriver = msg.sender === 'driver';
                  return (
                    <div
                      key={i}
                      className={`flex ${isDriver ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed ${
                          isDriver
                            ? 'bg-surface-container-low text-on-surface rounded-tl-none'
                            : 'bg-primary text-white rounded-tr-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`text-[9px] block text-right mt-1 ${
                          isDriver ? 'text-on-surface-variant' : 'text-white/75'
                        }`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Footer Form */}
              <form onSubmit={handleSendChat} className="p-3 border-t border-surface-variant/30 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to Alex..."
                  value={userChatMsg}
                  onChange={(e) => setUserChatMsg(e.target.value)}
                  className="flex-grow bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!userChatMsg.trim()}
                  className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
