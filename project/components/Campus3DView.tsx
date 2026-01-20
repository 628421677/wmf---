import React, { useEffect, useRef, useState } from 'react';
import {
  Cartesian3,
  Color,
  GeoJsonDataSource,
  Ion,
  Math as CesiumMath,
  OpenStreetMapImageryProvider,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  createWorldTerrainAsync
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Ion.defaultAccessToken = (import.meta as any).env?.VITE_CESIUM_ION_TOKEN ?? '';

interface Campus3DViewProps {
  onBuildingSelect?: (building: any) => void;
  selectedBuildingId?: string | null;
}

const CAMPUS_CENTER = Cartesian3.fromDegrees(119.196, 26.03, 100);

const Campus3DView: React.FC<Campus3DViewProps> = ({ onBuildingSelect }) => {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const highlightColor = Color.YELLOW.withAlpha(0.9);
  const defaultColor = Color.WHITE.withAlpha(0.85);
  const outlineColor = Color.BLACK.withAlpha(0.6);

  const setEntityHighlighted = (entity: any, highlighted: boolean) => {
    if (!entity?.polygon) return;
    entity.polygon.material = (highlighted ? highlightColor : defaultColor) as any;
  };

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Initialize the Cesium Viewer
    const viewer = new Viewer(cesiumContainer.current, {
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
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-30),
        roll: 0.0,
      },
      duration: 1.5,
    });

    const initCampus = async () => {
      viewer.imageryLayers.removeAll();
      viewer.imageryLayers.addImageryProvider(
        new OpenStreetMapImageryProvider({
          url: 'https://a.tile.openstreetmap.org/'
        })
      );

      const dataSource = await GeoJsonDataSource.load('/map/multipolygons.geojson', {
        clampToGround: false
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
          e.polygon.material = (defaultColor as any);
          e.polygon.outline = true as any;
          e.polygon.outlineColor = (outlineColor as any);
          e.polygon.extrudedHeight = heightMeters as any;
          e.polygon.height = 0 as any;
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

        const prevId = selectedEntityId;
        if (prevId && dataSourceRef.current) {
          const prev = dataSourceRef.current.entities.getById(prevId) as any;
          setEntityHighlighted(prev, false);
        }

        const current = dataSourceRef.current?.entities.getById(id) as any;
        setEntityHighlighted(current, true);
        setSelectedEntityId(id);

        const name = pickedId?.name ?? pickedId?.properties?.name?.getValue?.() ?? '建筑物';
        onBuildingSelect?.({ id, name });
      }, ScreenSpaceEventType.LEFT_CLICK);
    };

    initCampus().catch((e) => {
      console.error(e);
    });

    viewerRef.current = viewer;

    // Intentionally not using Cesium ion terrain here to avoid token-related blank maps.

    // Cleanup
    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  return (
    <div 
      ref={cesiumContainer} 
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  );
};

export default Campus3DView;
