import RobotViewer from './components/RobotViewer';
import ControlPanel from './components/ControlPanel';
import PartInfoPanel from './components/PartInfoPanel';
import VoiceControl from './components/VoiceControl';

export default function App() {
  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden">
      <RobotViewer />
      <ControlPanel />
      <PartInfoPanel />
      <VoiceControl />

      {/* Title */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <h1 className="text-gray-400 text-sm font-medium tracking-wider uppercase">
          Robot Part Viewer
        </h1>
      </div>
    </div>
  );
}
