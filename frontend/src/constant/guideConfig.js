import {
  Upload,
  Crop,
  Grid3X3,
  Download,
  Palette,
  Eye,
  Brush,
  Image,
  Settings,
  FileText,
  Layers,
  Sparkles,
} from "lucide-react";

export const GUIDE_STEPS = [
  {
    id: 1,
    icon: Upload,
    title: "Upload & Crop",
    desc: "Drop in your image and frame the perfect shot with our 3×3 grid overlay.",
  },
  {
    id: 2,
    icon: Settings,
    title: "Pick Your Size",
    desc: "Start small (16×16) or go epic (384×384 studs). Your canvas, your choice!",
  },
  {
    id: 3,
    icon: Sparkles,
    title: "Make It Pop",
    desc: "Dial in the perfect look with Hue, Saturation, Brightness, and Contrast sliders.",
  },
  {
    id: 4,
    icon: Layers,
    title: "Style Your Pixels",
    desc: "Round tiles for smooth vibes or square plates for crisp edges—mix and match!",
  },
  {
    id: 5,
    icon: Brush,
    title: "Get Creative",
    desc: "Paint new details, sample colors with the dropper, or fix mistakes with the eraser.",
  },
  {
    id: 6,
    icon: Download,
    title: "Take It Home",
    desc: "Export as PNG for sharing, PDF for building, or CSV for ordering parts.",
  },
];

export const PRO_FEATURES = [
  {
    icon: Grid3X3,
    title: "Flexible Canvas",
    desc: "From desktop-sized (16×16) to wall-worthy (384×384). Dream big!",
    colorClass: "bg-blue-500",
  },
  {
    icon: Sparkles,
    title: "Real-Time Tuning",
    desc: "Tweak colors and contrast on the fly—what you see is what you'll build.",
    colorClass: "bg-purple-500",
  },
  {
    icon: Layers,
    title: "Mix & Match Styles",
    desc: "Combine round tiles, square plates, and everything in between for unique textures.",
    colorClass: "bg-green-500",
  },
  {
    icon: Palette,
    title: "True LEGO Colors",
    desc: "Authentic Bricklink palette plus custom colors. Export your parts list instantly.",
    colorClass: "bg-orange-500",
  },
  {
    icon: Brush,
    title: "Pro Edit Suite",
    desc: "Paint, sample, erase, or reset—full creative control at your fingertips.",
    colorClass: "bg-pink-500",
  },
  {
    icon: Eye,
    title: "Buttery Smooth",
    desc: "Even massive mosaics render instantly. No lag, no waiting, just creating.",
    colorClass: "bg-indigo-500",
  },
  {
    icon: FileText,
    title: "Build Instructions",
    desc: "Professional PDF guides with color keys and section breakdowns.",
    colorClass: "bg-red-500",
  },
  {
    icon: Image,
    title: "Export Everything",
    desc: "Share PNGs, print PDFs, or order parts with CSV—we've got you covered.",
    colorClass: "bg-teal-500",
  },
  
];

export const PRO_TIPS = [
  "🎯 High-contrast images with bold subjects = stunning mosaics",
  "🚀 New to this? Start with 32×32 or 64×64, then level up to epic sizes",
  "✨ Boost brightness and contrast before generating for richer colors",
  "💡 The dropper tool is your best friend—steal colors from anywhere in your mosaic",
  "🧹 Clean up your palette! Remove unused colors to simplify your shopping list",
  "🎨 Mix round tiles with square plates for awesome texture effects",
  "📦 Always export CSV before ordering—it's your exact parts checklist",
  "⚡ Building something huge? Our engine handles 128×128+ with zero slowdown",
];