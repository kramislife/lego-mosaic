import { Upload, Crop, Grid3X3, Download, Palette, Eye } from "lucide-react";

export const GUIDE_STEPS = [
  {
    id: 1,
    icon: Upload,
    title: "Upload Your Image",
    desc: "Click the upload area or drag & drop your image. Best results with high-contrast photos.",
  },
  {
    id: 2,
    icon: Crop,
    title: "Crop & Adjust",
    desc: "Use the crop tool to select your focus area. Adjust zoom, brightness, contrast, and colors.",
  },
  {
    id: 3,
    icon: Grid3X3,
    title: "Choose Resolution",
    desc: "Select base grid size (16×16 or 32×32) and adjust resolution for detail level.",
  },
  {
    id: 4,
    icon: Download,
    title: "Export & Build",
    desc: "Export as PNG for viewing, PDF for instructions, or CSV for piece lists.",
  },
];

export const PRO_FEATURES = [
  {
    icon: Grid3X3,
    title: "Grid Overlay",
    desc: "Toggle grid to see LEGO stud placement",
    colorClass: "bg-blue-500",
  },
  {
    icon: Palette,
    title: "Color Management",
    desc: "Optimize LEGO color palette",
    colorClass: "bg-green-500",
  },
  {
    icon: Eye,
    title: "Live Preview",
    desc: "See changes in real-time",
    colorClass: "bg-purple-500",
  },
];

export const PRO_TIPS = [
  "Use images with high contrast and clear subjects",
  "Square aspect ratio images (1:1) work best for mosaics",
  "Start with 32×32 resolution for beginners",
  "Use the grid overlay to plan your build",
  "Adjust brightness and contrast to optimize colors",
];
