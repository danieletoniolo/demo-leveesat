// Helper to calculate status based on delta and threshold
const calculateStatus = (delta, threshold) => {
  const absDelta = Math.abs(delta);
  if (absDelta >= threshold) return 'CRITICAL';
  if (absDelta >= threshold * 0.7) return 'MODERATE';
  return 'NORMAL';
};

export const getLeveeData = async () => {
  try {
    const response = await fetch('/demo-leveesat/data/point.json');
    if (!response.ok) throw new Error('Failed to load point.json');
    const pointsData = await response.json();
    
    return pointsData.features
      .filter(f => f.geometry.type === 'Point')
      .map((feature, index) => {
        const props = feature.properties;
        const id = props.full_id || `point-${index}`;
        
        let name = props.name;
        if (!name) {
          if (props.waterway) name = `Waterway: ${props.waterway.charAt(0).toUpperCase() + props.waterway.slice(1)}`;
          else if (props.man_made) name = `Infrastruttura: ${props.man_made.replace('_', ' ')}`;
          else if (props.monitoring) name = `Stazione Monitoraggio`;
          else name = `Punto di Controllo ${index + 1}`;
        }

        const coordinates = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        
        // Satellite Pass Simulation
        const satellites = ['ICEYE', 'Sentinel 1', 'Sentinel 2', 'Cosmo-Skymed', 'World view 3', 'ROSA-L'];
        const satellite = satellites[index % satellites.length];
        
        // Random date within last 48 hours
        const lastPassDate = new Date(Date.now() - Math.random() * 172800000);
        
        // Simulation of SAR/PSI Displacement (mm/week)
        const randomVal = Math.random() * 100;
        const alertThreshold = 15.0; // mm/week
        let currentDelta;
        
        if (randomVal > 95) {
          currentDelta = alertThreshold + (Math.random() * 8); // ~5% Critical
        } else if (randomVal > 85) {
          currentDelta = alertThreshold * (0.7 + Math.random() * 0.3); // ~10% Moderate
        } else {
          currentDelta = Math.random() * 8; // ~85% Normal
        }

        return {
          id,
          name,
          coordinates,
          baseHeight: parseFloat(props.ele) || (10 + (index % 5)).toFixed(1),
          currentDelta: parseFloat(currentDelta.toFixed(1)), // mm/week
          alertThreshold,
          lastUpdated: lastPassDate.toISOString(),
          satellite,
          status: calculateStatus(currentDelta, alertThreshold),
          type: props.waterway || props.man_made || 'monitoring_point'
        };
      });
  } catch (error) {
    console.error("Error fetching full point data:", error);
    return [];
  }
};
