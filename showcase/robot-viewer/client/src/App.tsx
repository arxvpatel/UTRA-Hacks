import RobotViewer from './components/RobotViewer';
import ControlPanel from './components/ControlPanel';
import PartInfoPanel from './components/PartInfoPanel';
import VoiceControl from './components/VoiceControl';
import { useRobotStore } from './hooks/useRobotModel';

export default function App() {
  const cameraMode = useRobotStore((s) => s.cameraMode);
  const toggleCameraMode = useRobotStore((s) => s.toggleCameraMode);

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      <RobotViewer />
      <ControlPanel />
      <PartInfoPanel />
      <VoiceControl />

      <button
        onClick={toggleCameraMode}
        className="fixed bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md text-gray-700 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium hover:bg-gray-50 transition-colors shadow-lg"
      >
        Camera: {cameraMode === 'third' ? 'Third Person' : 'First Person'}
      </button>

      {/* Title */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <h1 className="text-gray-400 text-sm font-medium tracking-wider uppercase">
          Robot Part Viewer
        </h1>
      </div>
    </div>
  );
}
