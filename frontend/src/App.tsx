import GraphCanvas from './components/GraphCanvas';
import { ControlPanel } from './components/ControlPanel';
import { PlaybackControls } from './components/PlaybackControls';

function App() {
  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <ControlPanel />
      <GraphCanvas />
      <PlaybackControls />
    </div>
  )
}

export default App
