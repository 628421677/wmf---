import React, { useEffect, useRef, useState } from 'react';
import {
  Cartesian3,
  Color,
  Cesium3DTileset,
  GeoJsonDataSource,
  Ion,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  SkyAtmosphere,
  Viewer
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

type CampusOverlay = 'none' | 'vacancy' | 'density' | 'excess';

type BuildingSelection = { id: string; name: string } | null;

interface Campus3DViewProps {
  onBuildingSelect?: (building: BuildingSelection) => void;
  selectedBuildingId?: string | null;
  mapOverlay?: CampusOverlay;
}

const CAMPUS_CENTER_DESTINATION = Cartesian3.fromDegrees(119.1956, 26.0312, 1200);

const getColorForVacancy = (vacancy: number) => {
  if (vacancy > 0.2) return Color.RED.withAlpha(0.85);
  if (vacancy > 0.05) return Color.ORANGE.withAlpha(0.85);
  return Color.GREEN.withAlpha(0.85);
};

const getColorForDensity = (density: string) => {
  switch (density) {
    case 'High':
      return Color.BLUE.withAlpha(0.85);
    case 'Medium':
      return Color.CYAN.withAlpha(0.85);
    default:
      return Color.GRAY.withAlpha(0.85);
  }
};

const getColorForExcess = (excess: number) => {
  if (excess > 1) return Color.RED.withAlpha(0.85);
  if (excess > 0) return Color.YELLOW.withAlpha(0.85);
  return Color.GREEN.withAlpha(0.85);
};

const Campus3DView: React.FC<Campus3DViewProps> = ({ onBuildingSelect, mapOverlay = 'none' }) => {
  const mapOverlayRef = useRef<CampusOverlay>(mapOverlay);
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const tilesetRef = useRef<Cesium3DTileset | null>(null);
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const clickHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);

  const selectedEntityIdRef = useRef<string | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const highlightColor = Color.YELLOW.withAlpha(0.9);
  const defaultColor = Color.WHITE.withAlpha(0.85);
  const outlineColor = Color.BLACK.withAlpha(0.6);

  const getOverlayColor = (entity: any, overlay: CampusOverlay) => {
    if (overlay === 'none') return defaultColor;

    const props: any = entity?.properties;

    if (overlay === 'vacancy') {
      const vacancy = Number(props?.vacancy?.getValue?.() ?? props?.vacancy ?? 0);
      return getColorForVacancy(vacancy);
    }

    if (overlay === 'density') {
      const density = String(props?.density?.getValue?.() ?? props?.density ?? 'Low');
      return getColorForDensity(density);
    }

    if (overlay === 'excess') {
      const excess = Number(props?.excess?.getValue?.() ?? props?.excess ?? 0);
      return getColorForExcess(excess);
    }

    return defaultColor;
  };

  const applyOverlayToAll = (overlay: CampusOverlay) => {
    const ds = dataSourceRef.current;
    if (!ds) return;

    const entities = ds.entities.values;
    for (let i = 0; i < entities.length; i++) {
      const e: any = entities[i];
      if (!e?.show || !e?.polygon) continue;

      const p: any = e.properties;
      const name = String(p?.name?.getValue?.() ?? e.name ?? '');
      const isKeepGroundArea = name === '南区田径场' || name === '南区风雨球场';

      if (isKeepGroundArea) {
        e.polygon.material = defaultColor as any;
        continue;
      }

      e.polygon.material = getOverlayColor(e, overlay) as any;
    }

    const currentSelected = selectedEntityIdRef.current;
    if (currentSelected) {
      const current: any = ds.entities.getById(currentSelected);
      if (current?.polygon) current.polygon.material = highlightColor as any;
    }
  };

  const clearSelection = () => {
    const ds = dataSourceRef.current;
    if (!ds) return;

    const prevId = selectedEntityIdRef.current;
    if (!prevId) return;

    const prev: any = ds.entities.getById(prevId);
    if (prev?.polygon) prev.polygon.material = getOverlayColor(prev, mapOverlayRef.current) as any;

    selectedEntityIdRef.current = null;
    setSelectedEntityId(null);
    onBuildingSelect?.(null);
  };

  const setSelected = (id: string, pickedId: any) => {
    const ds = dataSourceRef.current;
    if (!ds) return;

    const prevId = selectedEntityIdRef.current;
    if (prevId && prevId !== id) {
      const prev: any = ds.entities.getById(prevId);
      if (prev?.polygon) prev.polygon.material = getOverlayColor(prev, mapOverlayRef.current) as any;
    }

    const current: any = ds.entities.getById(id);
    if (current?.polygon) current.polygon.material = highlightColor as any;

    selectedEntityIdRef.current = id;
    setSelectedEntityId(id);

    const name = pickedId?.name ?? pickedId?.properties?.name?.getValue?.() ?? '建筑物';
    onBuildingSelect?.({ id, name });
  };

  useEffect(() => {
    mapOverlayRef.current = mapOverlay;
    applyOverlayToAll(mapOverlay);
  }, [mapOverlay]);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    let viewer: Viewer | null = null;

    try {
      viewer = new Viewer(cesiumContainer.current, {
        globe: false,
        skyAtmosphere: new SkyAtmosphere(),
        sceneModePicker: false,
        baseLayerPicker: false,
        timeline: false,
        animation: false,
        navigationHelpButton: false,
        homeButton: false,
        geocoder: false,
        scene3DOnly: true,
        selectionIndicator: false,
        infoBox: false,
        shouldAnimate: true
      });
      viewerRef.current = viewer;
    } catch (error) {
      console.error('Failed to create Cesium Viewer:', error);
      return;
    }

    const initScene = async () => {
      try {
        const tileset = await Cesium3DTileset.fromIonAssetId(2275207);
        tilesetRef.current = tileset;
        viewer!.scene.primitives.add(tileset);

        viewer!.camera.flyTo({
          destination: CAMPUS_CENTER_DESTINATION,
          orientation: {
            heading: CesiumMath.toRadians(0),
            pitch: CesiumMath.toRadians(-45),
            roll: 0
          },
          duration: 1.5
        });

        const dataSource = await GeoJsonDataSource.load('/map/multipolygons.geojson', { clampToGround: false });
        dataSourceRef.current = dataSource;
        await viewer!.dataSources.add(dataSource);

        const entities = dataSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const e: any = entities[i];
          const p: any = e.properties;
          const name = String(p?.name?.getValue?.() ?? e.name ?? '');
          const isBuilding = Boolean(p?.building);
          const isKeepGroundArea = name === '南区田径场' || name === '南区风雨球场';

          if (!isBuilding && !isKeepGroundArea) {
            e.show = false;
            continue;
          }

          if (!e.polygon) continue;

          if (isKeepGroundArea) {
            e.polygon.material = defaultColor as any;
            e.polygon.outline = true as any;
            e.polygon.outlineColor = outlineColor as any;
            e.polygon.height = 0 as any;
            e.polygon.extrudedHeight = undefined as any;
            continue;
          }

          const amenity = String(p?.amenity?.getValue?.() ?? '');
          const otherTags = String(p?.other_tags?.getValue?.() ?? '');
          const buildingType = String(p?.building?.getValue?.() ?? p?.building ?? '');
          const isParkingShed =
            amenity === 'bicycle_parking' ||
            buildingType === 'roof' ||
            otherTags.includes('bicycle_parking"=>"shed"') ||
            name.includes('停车') ||
            name.includes('车棚') ||
            name.includes('停车蓬') ||
            name.toLowerCase().includes('shed');

          if (isParkingShed || !isBuilding) {
            e.show = false;
            continue;
          }

          const rawLevels = p?.['building:levels']?.getValue?.();
          const levels = Number(rawLevels);
          const heightMeters = Number.isFinite(levels) && levels > 0 ? levels * 4.5 : 35;

          if (!p?.vacancy) (e.properties as any).vacancy = Math.random() * 0.35;
          if (!p?.density) {
            const r = Math.random();
            (e.properties as any).density = r > 0.7 ? 'High' : r > 0.35 ? 'Medium' : 'Low';
          }
          if (!p?.excess) {
            const r = Math.random();
            (e.properties as any).excess = r > 0.85 ? 2 : r > 0.65 ? 1 : 0;
          }

          e.polygon.material = defaultColor as any;
          e.polygon.outline = true as any;
          e.polygon.outlineColor = outlineColor as any;
          e.polygon.extrudedHeight = heightMeters as any;
          e.polygon.height = 0 as any;
          (e.polygon as any).closeTop = true;
          (e.polygon as any).closeBottom = true;
        }

        applyOverlayToAll(mapOverlayRef.current);

        const handler = new ScreenSpaceEventHandler(viewer!.scene.canvas);
        clickHandlerRef.current = handler;

        handler.setInputAction((movement: any) => {
          const picked = viewer!.scene.pick(movement.position);
          const pickedId: any = (picked as any)?.id;

          if (!pickedId) {
            clearSelection();
            return;
          }

          const id = (pickedId.id as string) ?? null;
          if (!id) {
            clearSelection();
            return;
          }

          const currentSelected = selectedEntityIdRef.current;
          if (currentSelected && id === currentSelected) {
            clearSelection();
            return;
          }

          setSelected(id, pickedId);
        }, ScreenSpaceEventType.LEFT_CLICK);
      } catch (error) {
        console.error('Failed to load scene assets:', error);
      }
    };

    initScene();

    return () => {
      try {
        clickHandlerRef.current?.destroy();
        const tileset = tilesetRef.current;
        if (tileset && !tileset.isDestroyed()) {
          viewer!.scene.primitives.remove(tileset);
          tileset.destroy();
        }
        if (viewer && !viewer.isDestroyed()) {
          viewer.destroy();
        }
      } catch (e) {
        console.error('Error during Cesium cleanup:', e);
      }

      clickHandlerRef.current = null;
      tilesetRef.current = null;
      viewerRef.current = null;
      dataSourceRef.current = null;
      selectedEntityIdRef.current = null;
    };
  }, []);

  return <div ref={cesiumContainer} className="w-full h-full" style={{ minHeight: '600px' }} />;
};

export default Campus3DView;
