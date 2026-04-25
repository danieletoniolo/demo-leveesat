import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import LeveeDetailPanel from './components/LeveeDetailPanel';
import { getLeveeData } from './services/leveeDataService';

function App() {
  const [levees, setLevees] = useState([]);
  const [selectedLevee, setSelectedLevee] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await getLeveeData();
      setLevees(data);
    };
    loadData();
  }, []);

  const handleSelectLevee = (levee) => {
    setSelectedLevee(levee);
  };

  const handleClosePanel = () => {
    setSelectedLevee(null);
  };

  const systemStatus = levees.some(l => l.status === 'CRITICAL') 
    ? { label: 'CRITICAL ALERT', color: 'text-red-500' }
    : levees.some(l => l.status === 'MODERATE')
    ? { label: 'ACTIVE WARNING', color: 'text-yellow-500' }
    : { label: 'SYSTEM NORMAL', color: 'text-green-500' };

  return (
    <div className="flex h-screen w-screen bg-levee-dark text-slate-100 overflow-hidden">
      {/* Sidebar - Fixed width */}
      <Sidebar 
        levees={levees} 
        onSelectLevee={handleSelectLevee} 
        selectedLeveeId={selectedLevee?.id}
      />

      {/* Main Content - Map */}
      <main className="flex-1 relative overflow-hidden">
        <Map 
          levees={levees} 
          selectedLevee={selectedLevee} 
          onSelectLevee={handleSelectLevee} 
        />

        {/* Floating Header Overlay */}
        <div className="absolute top-4 left-4 z-[500] pointer-events-none">
          <div className="bg-levee-panel/80 backdrop-blur-md border border-levee-border p-3 rounded-lg shadow-xl pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Current Operation</span>
                <span className="text-xs font-semibold text-blue-400">EMILIA-ROMAGNA MONITORING</span>
              </div>
              <div className="h-8 w-[1px] bg-levee-border"></div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Status</span>
                <span className={`text-xs font-semibold ${systemStatus.color}`}>{systemStatus.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel Overlay */}
        <LeveeDetailPanel 
          levee={selectedLevee} 
          onClose={handleClosePanel} 
        />
      </main>
    </div>
  );
}

export default App;
