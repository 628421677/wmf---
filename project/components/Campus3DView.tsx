import React, { useEffect, useRef } from 'react';
import { Viewer, Entity, CesiumTerrainProvider, Ion, createOsmBuildingsAsync, IonResource, Cartesian3, Color } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import * as Cesium from 'cesium';

// Set your Cesium ion access token (you'll need to sign up at https://cesium.com/ion/)
// This is a placeholder - in production, use environment variables
Ion.defaultAccessToken = 'your-cesium-ion-access-token';

interface Campus3DViewProps {
  onBuildingSelect?: (building: any) => void;
  selectedBuildingId?: string | null;
}

const CAMPUS_CENTER = Cartesian3.fromDegrees(119.196, 26.03, 100);

const Campus3DView: React.FC<Campus3DViewProps> = ({ onBuildingSelect, selectedBuildingId }) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const buildingsRef = useRef<{ [key: string]: Entity }>({});

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Initialize the Cesium Viewer
    const viewer = new Viewer(cesiumContainer.current, {
      terrain: CesiumTerrainProvider.fromIonAsset(1),
      baseLayerPicker: false,
      timeline: false,
      animation: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      homeButton: false,
      geocoder: false,
      scene3DOnly: true,
      selectionIndicator: false,
      infoBox: false,
      shouldAnimate: true,
    });

    // Set initial view
    viewer.camera.flyTo({
      destination: CAMPUS_CENTER,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-30),
        roll: 0.0,
      },
      duration: 1.5,
    });

    // Add OSM buildings
    createOsmBuildingsAsync().then((buildingTileset) => {
      viewer.scene.primitives.add(buildingTileset);
    });

    // Add custom buildings from GeoJSON
    const addCustomBuildings = async () => {
      try {
        // Load the OSM data for buildings
        const response = await fetch('/map.osm');
        const osmData = await response.text();
        
        // Parse OSM data and add buildings
        // This is a simplified example - you'll need to process the OSM data
        // to extract building geometries and properties
        
        // For now, we'll add a sample building
        const sampleBuilding = viewer.entities.add({
          name: 'Sample Building',
          position: Cartesian3.fromDegrees(119.196, 26.03, 0),
          box: {
            dimensions: new Cartesian3(200, 150, 30),
            material: Color.WHITE.withAlpha(0.8),
            outline: true,
            outlineColor: Color.BLACK,
          },
        });
        
        buildingsRef.current['sample'] = sampleBuilding;
        
        // Add click handler for buildings
        viewer.screenSpaceEventHandler.setInputAction((movement: any) => {
          const pickedObject = viewer.scene.pick(movement.position);
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            onBuildingSelect?.({
              id: 'sample',
              name: 'Sample Building',
              // Add more properties as needed
            });
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        
      } catch (error) {
        console.error('Error loading OSM data:', error);
      }
    };
    
    addCustomBuildings();

    viewerRef.current = viewer;

    // Cleanup
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  // Update selected building highlight
  useEffect(() => {
    if (!viewerRef.current) return;

    // Reset all buildings to default style
    Object.values(buildingsRef.current).forEach(building => {
      if (building.box) {
        building.box.material = Cesium.Color.WHITE.withAlpha(0.8);
      }
    });

    // Highlight selected building
    if (selectedBuildingId && buildingsRef.current[selectedBuildingId]) {
      const building = buildingsRef.current[selectedBuildingId];
      if (building.box) {
        building.box.material = Cesium.Color.YELLOW.withAlpha(0.8);
        
        // Fly to selected building
        viewerRef.current?.camera.flyTo({
          destination: Cesium.Cartesian3.fromElements(
            building.position?.getValue(Cesium.JulianDate.now())?.x || 0,
            building.position?.getValue(Cesium.JulianDate.now())?.y || 0,
            200
          ),
          orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
          },
          duration: 1.0,
        });
      }
    }
  }, [selectedBuildingId]);

  return (
    <div 
      ref={cesiumContainer} 
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
};

export default Campus3DView;
