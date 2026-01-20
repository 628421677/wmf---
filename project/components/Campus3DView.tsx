import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Cartesian3,
  CesiumTerrainProvider,
  Color,
  GeoJsonDataSource,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
interface Campus3DViewProps {
  onBuildingSelect?: (building: any) => void;
  selectedBuildingId?: string | null;
}

const CAMPUS_CENTER = Cartesian3.fromDegrees(119.196, 26.03, 100);

const Campus3DView: React.FC<Campus3DViewProps> = ({ onBuildingSelect, selectedBuildingId }) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

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

    const initCampus = async () => {
      const dataSource = await GeoJsonDataSource.load('/map/multipolygons.geojson', {
        clampToGround: true
      });

      dataSourceRef.current = dataSource;
      await viewer.dataSources.add(dataSource);

      const entities = dataSource.entities.values;
      for (let i = 0; i < entities.length; i++) {
        const e = entities[i];
        const p: any = e.properties;
        const isBuilding = Boolean(p?.building);
        if (!isBuilding) continue;

        const rawLevels = p?.['building:levels']?.getValue?.();
        const levels = Number(rawLevels);
        const heightMeters = Number.isFinite(levels) && levels > 0 ? levels * 3.2 : 18;

        if (e.polygon) {
          e.polygon.material = Color.WHITE.withAlpha(0.85);
          e.polygon.outline = true;
          e.polygon.outlineColor = Color.BLACK.withAlpha(0.6);
          e.polygon.extrudedHeight = heightMeters;
          e.polygon.height = 0;
          (e.polygon as any).closeTop = true;
          (e.polygon as any).closeBottom = true;
        }
      }

      viewer.camera.flyTo({
        destination: Cartesian3.fromDegrees(119.1956, 26.0312, 800),
        orientation: {
          heading: CesiumMath.toRadians(0),
          pitch: CesiumMath.toRadians(-45),
          roll: 0
        },
        duration: 1.2
      });

      const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
      handler.setInputAction((movement) => {
        const picked = viewer.scene.pick(movement.position);
        const pickedId: any = (picked as any)?.id;
        if (!pickedId) return;

        const id = (pickedId.id as string) ?? null;
        if (!id) return;

        setSelectedEntityId(id);

        const name = pickedId?.name ?? pickedId?.properties?.name?.getValue?.() ?? '建筑物';
        onBuildingSelect?.({ id, name });
      }, ScreenSpaceEventType.LEFT_CLICK);
    };

    initCampus().catch((e) => {
      console.error(e);
    });

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
