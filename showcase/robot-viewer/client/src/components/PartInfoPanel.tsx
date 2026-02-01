import { useEffect, useState } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';
import { getPartDetails } from '../services/api';
import type { RobotPart, PartCategory } from '../types/robot';

const categoryColors: Record<PartCategory, string> = {
  motion: 'bg-orange-100 text-orange-700 border-orange-200',
  sensors: 'bg-purple-100 text-purple-700 border-purple-200',
  power: 'bg-red-100 text-red-700 border-red-200',
  control: 'bg-blue-100 text-blue-700 border-blue-200',
  structure: 'bg-gray-100 text-gray-700 border-gray-200',
  communication: 'bg-teal-100 text-teal-700 border-teal-200',
};

export default function PartInfoPanel() {
  const selectedPart = useRobotStore((s) => s.selectedPart);
  const highlightedParts = useRobotStore((s) => s.highlightedParts);
  const clearHighlights = useRobotStore((s) => s.clearHighlights);
  const tourActive = useRobotStore((s) => s.tourActive);

  const [detail, setDetail] = useState<{ part: RobotPart; relatedParts: RobotPart[] } | null>(null);

  useEffect(() => {
    if (!selectedPart) {
      setDetail(null);
      return;
    }
    getPartDetails(selectedPart)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [selectedPart]);

  if (tourActive) return null;
  if (!selectedPart && highlightedParts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-20 w-72 bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-gray-800 text-sm font-semibold">Part Details</h3>
        <button
          onClick={clearHighlights}
          className="text-gray-400 hover:text-gray-700 text-xs transition-colors"
        >
          Close
        </button>
      </div>

      {detail && (
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Category badge */}
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded border ${categoryColors[detail.part.category]}`}
          >
            {detail.part.category}
          </span>

          <h4 className="text-gray-800 font-semibold text-lg leading-tight">{detail.part.name}</h4>
          <p className="text-gray-400 text-xs font-mono">{detail.part.id}</p>
          <p className="text-gray-600 text-sm leading-relaxed">{detail.part.description}</p>

          {/* Keywords */}
          <div className="flex flex-wrap gap-1.5">
            {detail.part.keywords.map((kw) => (
              <span
                key={kw}
                className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
