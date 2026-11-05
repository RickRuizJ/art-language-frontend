import { Sprout, Leaf, Droplets, Waves, Zap, Target, Bot, Lock, BookOpen, GraduationCap, CalendarDays, Lightbulb, CheckCircle2, XCircle, BarChart3, Rocket, Trophy, HeartHandshake, TrendingUp, Sparkles, Flame, Brain, Hand, Star, Moon, MessageCircle, ArrowUpRight } from 'lucide-react';

const GLYPHS = {
  '🌱': Sprout, '🌿': Leaf, '💧': Droplets, '🌊': Waves, '⚡': Zap,
  '🎯': Target, '🤖': Bot, '🔒': Lock, '📚': BookOpen, '🎓': GraduationCap,
  '📅': CalendarDays, '💡': Lightbulb, '✅': CheckCircle2, '❌': XCircle,
  '📊': BarChart3, '🚀': Rocket, '🏆': Trophy, '🤝': HeartHandshake,
  '📈': TrendingUp, '✨': Sparkles, '🎉': Sparkles, '🔥': Flame,
  '👆': Hand, '⭐': Star, '🌌': Moon, '💫': Sparkles,
  '🌟': Star, '🌠': Sparkles, '🤔': Brain, '💜': Sparkles, '🙏': HeartHandshake,
  '👋': MessageCircle,
};
export default function CampusGlyph({ symbol, size = 18, className = '', ...props }) {
  const Glyph = GLYPHS[symbol] || ArrowUpRight;
  return <Glyph size={size} className={className} aria-hidden="true" {...props} />;
}
