import { Pencil, Sparkles } from "lucide-react";
import { useState, type ReactNode } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
}

export function HoverCard({ children, className = "" }: HoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative rounded-lg border border-gray-200 bg-white p-6 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered
          ? "inset 0 0 20px rgba(59, 130, 246, 0.2), 0 0 25px rgba(59, 130, 246, 0.1)"
          : "none",
      }}
    >
      {/* Content */}
      <div>{children}</div>

      {/* Icons on hover - top right corner */}
      <div
        className={`absolute top-3 right-3 flex gap-2 transition-all duration-300 ${
          isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }`}
      >
        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
          <Pencil className="w-4 h-4 text-gray-600 hover:text-blue-600" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
          <Sparkles className="w-4 h-4 text-gray-600 hover:text-blue-600" />
        </button>
      </div>
    </div>
  );
}
