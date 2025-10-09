import {
  Folder, DollarSign, Book, GraduationCap, Pencil, Leaf,
  Code, Smile, Music, Popcorn, Wrench, Palette,
  Sprout, Flower, Camera, BarChart, Star, Dumbbell,
  ClipboardList, Scale, Search, Plane, Globe, Settings,
  Footprints, FlaskConical, Trophy, Heart, Coffee, Target,
  type LucideIcon
} from 'lucide-react';

export const FOLDER_ICONS: Record<string, LucideIcon> = {
  folder: Folder,
  dollar: DollarSign,
  book: Book,
  graduation: GraduationCap,
  pencil: Pencil,
  leaf: Leaf,
  code: Code,
  smile: Smile,
  music: Music,
  popcorn: Popcorn,
  wrench: Wrench,
  palette: Palette,
  sprout: Sprout,
  flower: Flower,
  camera: Camera,
  chart: BarChart,
  star: Star,
  dumbbell: Dumbbell,
  clipboard: ClipboardList,
  scale: Scale,
  search: Search,
  plane: Plane,
  globe: Globe,
  settings: Settings,
  footprints: Footprints,
  flask: FlaskConical,
  trophy: Trophy,
  heart: Heart,
  coffee: Coffee,
  target: Target,
};

// Map color hex codes to color names
export const COLOR_MAP: Record<string, string> = {
  '#3B82F6': 'blue',
  '#10B981': 'green',
  '#F59E0B': 'orange',
  '#EF4444': 'red',
  '#8B5CF6': 'purple',
  '#EC4899': 'pink',
  '#6B7280': 'gray',
  '#EAB308': 'yellow', // Yellow color mapping
};

export const FOLDER_COLORS: Record<string, string> = {
  blue: 'text-blue-500 border-blue-500',
  green: 'text-green-500 border-green-500',
  red: 'text-red-500 border-red-500',
  yellow: 'text-yellow-500 border-yellow-500',
  orange: 'text-orange-500 border-orange-500',
  purple: 'text-purple-500 border-purple-500',
  pink: 'text-pink-500 border-pink-500',
  gray: 'text-gray-500 border-gray-500',
};

export const getFolderIcon = (iconName: string): LucideIcon => {
  return FOLDER_ICONS[iconName] || Folder;
};

export const getFolderColorClass = (color: string): string => {
  // If color is already a color name (from users), use directly
  if (FOLDER_COLORS[color]) {
    return FOLDER_COLORS[color];
  }
  
  // If color is hex code (from admin), convert to color name first
  const colorName = COLOR_MAP[color] || 'blue';
  return FOLDER_COLORS[colorName] || FOLDER_COLORS.blue;
};
