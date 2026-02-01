import { useState, useEffect } from 'react';
import { useRobotStore } from '../hooks/useRobotModel';
import { getAllParts, getApiStatus } from '../services/api';
import type { PartCategory } from '../types/robot';

const categories: { label: string; value: PartCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Motion', value: 'motion' },
  { label: 'Sensors', value: 'sensors' },
  { label: 'Power', value: 'power' },
  { label: 'Control', value: 'control' },
  { label: 'Structure', value: 'structure' },
  { label: 'Comms', value: 'communication' },
];

const catBadgeColors: Record<PartCategory, string> = {
  motion: 'bg-orange-100 text-orange-700',
  sensors: 'bg-purple-100 text-purple-700',
  power: 'bg-red-100 text-red-700',
  control: 'bg-blue-100 text-blue-700',
  structure: 'bg-gray-200 text-gray-700',
  communication: 'bg-teal-100 text-teal-700',
};

export default function ControlPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<PartCategory | 'all'>('all');

  const parts = useRobotStore((s) => s.parts);
  const highlightedParts = useRobotStore((s) => s.highlightedParts);
  const setParts = useRobotStore((s) => s.setParts);
  const setApiStatus = useRobotStore((s) => s.setApiStatus);
  const highlightParts = useRobotStore((s) => s.highlightParts);
  const selectPart = useRobotStore((s) => s.selectPart);
  const clearHighlights = useRobotStore((s) => s.clearHighlights);
  const explodeStrength = useRobotStore((s) => s.explodeStrength);
  const setExplodeStrength = useRobotStore((s) => s.setExplodeStrength);
  const showGround = useRobotStore((s) => s.showGround);
  const toggleGround = useRobotStore((s) => s.toggleGround);

  useEffect(() => {
    getAllParts().then(setParts).catch(console.error);
    getApiStatus().then(setApiStatus).catch(console.error);
  }, [setParts, setApiStatus]);

  const filtered = parts.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      !search ||
      [p.name, p.id, ...p.keywords].join(' ').toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed top-4 left-4 z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 backdrop-blur-md text-gray-700 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors shadow-lg mb-2"
      >
        {isOpen ? 'Hide Parts' : 'Show Parts'}
      </button>

      {isOpen && (
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-gray-200 shadow-2xl w-64 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parts..."
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Explode strength */}
          <div className="px-3 py-2 border-b border-gray-200">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">Explode</label>
              <span className="text-[10px] text-gray-400">{explodeStrength}</span>
            </div>
            <input
              type="range"
              min={0}
              max={200}
              value={explodeStrength}
              onChange={(e) => setExplodeStrength(Number(e.target.value))}
              className="w-full h-1 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Drive toggle */}
          <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Drive</label>
            <button
              onClick={toggleGround}
              className={`relative w-8 h-4 rounded-full transition-colors ${
                showGround ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  showGround ? 'translate-x-4' : ''
                }`}
              />
            </button>
          </div>

          {/* Category filters */}
          <div className="px-3 py-2 flex flex-wrap gap-1 border-b border-gray-200">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                  activeCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:text-gray-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Parts list */}
          <div className="max-h-[45vh] overflow-y-auto custom-scrollbar">
            {filtered.map((part) => {
              const isActive = highlightedParts.includes(part.id);
              return (
                <button
                  key={part.id}
                  onClick={() => {
                    highlightParts([part.id]);
                    selectPart(part.id);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors border-b border-gray-100 ${
                    isActive ? 'bg-yellow-50' : ''
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${catBadgeColors[part.category]}`}>
                    {part.category}
                  </span>
                  <span className={`text-sm ${isActive ? 'text-yellow-600 font-medium' : 'text-gray-700'}`}>
                    {part.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clear */}
          {highlightedParts.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <button
                onClick={clearHighlights}
                className="w-full text-xs text-gray-400 hover:text-gray-700 py-1 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
