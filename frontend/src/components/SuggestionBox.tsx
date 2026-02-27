import { useState, useEffect, useCallback } from 'react';
import {
  Droplets,
  PersonStanding,
  Wind,
  Eye,
  Dumbbell,
  Moon,
  Apple,
  Smile,
  Footprints,
  MoveHorizontal,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Suggestion {
  icon: React.ElementType;
  title: string;
  description: string;
  category: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: Droplets,
    title: 'Hydrate Now',
    description: 'Drink a full glass of water. Staying hydrated supports heart rate stability and cognitive clarity.',
    category: 'Hydration',
  },
  {
    icon: Footprints,
    title: 'Take a 10-Minute Walk',
    description: 'A short walk boosts circulation, lowers blood pressure, and lifts your mood naturally.',
    category: 'Movement',
  },
  {
    icon: Wind,
    title: '5-Minute Deep Breathing',
    description: 'Inhale for 4 counts, hold for 4, exhale for 6. This activates your parasympathetic nervous system.',
    category: 'Breathing',
  },
  {
    icon: MoveHorizontal,
    title: 'Stand Up & Stretch',
    description: 'Roll your shoulders back, reach overhead, and loosen your neck. Counteract prolonged sitting.',
    category: 'Posture',
  },
  {
    icon: Eye,
    title: 'Rest Your Eyes',
    description: 'Look at something 20 feet away for 20 seconds. The 20-20-20 rule reduces digital eye strain.',
    category: 'Rest',
  },
  {
    icon: PersonStanding,
    title: 'Check Your Posture',
    description: 'Sit tall, shoulders relaxed, feet flat on the floor. Good posture reduces muscle tension and fatigue.',
    category: 'Posture',
  },
  {
    icon: Dumbbell,
    title: 'Desk Micro-Workout',
    description: 'Do 10 seated leg raises or 10 calf raises. Small movements add up to big health benefits.',
    category: 'Movement',
  },
  {
    icon: Moon,
    title: 'Mindful Pause',
    description: 'Close your eyes for 60 seconds. Focus only on your breath. A brief reset reduces cortisol levels.',
    category: 'Mindfulness',
  },
  {
    icon: Apple,
    title: 'Healthy Snack Break',
    description: 'Reach for a handful of nuts, fruit, or veggies. Balanced snacking keeps blood sugar stable.',
    category: 'Nutrition',
  },
  {
    icon: Smile,
    title: 'Gratitude Moment',
    description: "Think of three things you're grateful for. Positive reflection lowers stress and supports heart health.",
    category: 'Mental Health',
  },
  {
    icon: Wind,
    title: 'Box Breathing',
    description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times to calm your nervous system.',
    category: 'Breathing',
  },
  {
    icon: Droplets,
    title: 'Herbal Tea Break',
    description: 'Brew a cup of chamomile or green tea. Antioxidants and warmth support relaxation and immunity.',
    category: 'Hydration',
  },
];

const INTERVAL_MS = 18000; // 18 seconds

export function SuggestionBox() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SUGGESTIONS.length));
  const [animating, setAnimating] = useState(false);

  const advance = useCallback((nextIndex?: number) => {
    setAnimating(true);
    setTimeout(() => {
      setIndex((prev) => {
        if (nextIndex !== undefined) return nextIndex;
        return (prev + 1) % SUGGESTIONS.length;
      });
      setAnimating(false);
    }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => advance(), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [advance]);

  const handleNext = () => {
    advance((index + 1) % SUGGESTIONS.length);
  };

  const suggestion = SUGGESTIONS[index];
  const Icon = suggestion.icon;

  return (
    <div className="border-t border-border bg-card card-glow-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Label */}
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-teal" />
            <span className="text-[10px] font-semibold font-mono tracking-widest uppercase text-teal/80">
              Healthy Tip
            </span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-border shrink-0" />

          {/* Icon + Content */}
          <div
            className={`flex items-center gap-3 flex-1 min-w-0 transition-all duration-300 ${
              animating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-teal/10 border border-teal/25 flex items-center justify-center">
              <Icon className="w-4 h-4 text-teal" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-foreground truncate">{suggestion.title}</span>
                <span className="hidden sm:inline-flex shrink-0 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-teal/10 text-teal/80 border border-teal/20 uppercase tracking-wider">
                  {suggestion.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 sm:line-clamp-none">
                {suggestion.description}
              </p>
            </div>
          </div>

          {/* Next button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="shrink-0 h-8 px-2.5 text-xs text-teal hover:text-teal hover:bg-teal/10 border border-transparent hover:border-teal/25 font-mono tracking-wide transition-all"
            aria-label="Next suggestion"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
