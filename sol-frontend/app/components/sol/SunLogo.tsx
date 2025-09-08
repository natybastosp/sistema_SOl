import { Sun } from "lucide-react";

interface SunLogoProps {
  size?: "large" | "medium" | "small";
}

export default function SunLogo({ size = "large" }: SunLogoProps) {
  const sizeClasses = {
    large: "w-32 h-32",
    medium: "w-24 h-24",
    small: "w-16 h-16",
  };

  const iconSizes = {
    large: "w-16 h-16",
    medium: "w-12 h-12",
    small: "w-8 h-8",
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-orange-300 to-orange-400 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg`}
    >
      <Sun className={`${iconSizes[size]} text-white`} />
    </div>
  );
}
