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

type CampusOverlay = 'none' | 'vacancy' | 'density' | 'excess';

interface Campus3DViewProps {
  onBuildingSelect?: (building: any) => void;
  selectedBuildingId?: string | null;
  mapOverlay?: CampusOverlay;
}

const CAMPUS_CENTER = Cartesian3.fromDegrees(119.196, 26.03, 100);

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
  const dataSourceRef = useRef<GeoJsonDataSource | null>(null);
  const clickHandlerRef = useRef<ScreenSpaceEventHandler | null>(null);
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
      if (!e?.show) continue;
      if (!e?.polygon) continue;

      // 场地与建筑统一处理：场地保持白色；建筑根据 overlay 上色
      const p: any = e.properties;
      const name = String(p?.name?.getValue?.() ?? e.name ?? '');
      const isKeepGroundArea = name === '南区田径场' || name === '南区风雨球场';

      if (isKeepGroundArea) {
        e.polygon.material = defaultColor as any;
        continue;
      }

      e.polygon.material = (getOverlayColor(e, overlay) as any);
    }

    // 保持已选中建筑高亮
    if (selectedEntityId) {
      const current: any = ds.entities.getById(selectedEntityId);
      if (current?.polygon) current.polygon.material = highlightColor as any;
    }
  };

  useEffect(() => {
    mapOverlayRef.current = mapOverlay;
    applyOverlayToAll(mapOverlay);
  }, [mapOverlay]);

  useEffect(() => {
    if (!cesiumContainer.current) return;

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
      shouldAnimate: true
    });

    viewer.camera.flyTo({
      destination: CAMPUS_CENTER,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-30),
        roll: 0.0
      },
      duration: 1.5
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
        const e: any = entities[i];
        const p: any = e.properties;
        const name = String(p?.name?.getValue?.() ?? e.name ?? '');
        const isBuilding = Boolean(p?.building);
        const isKeepGroundArea = name === '南区田径场' || name === '南区风雨球场';

        // 默认不渲染非建筑的大面（例如学院/园区边界等），只保留两个指定场地
        if (!isBuilding && !isKeepGroundArea) {
          e.show = false;
          continue;
        }

        if (!e.polygon) continue;

        // 两个场地：保留为地面白色面，不挤出
        if (isKeepGroundArea) {
          e.polygon.material = defaultColor as any;
          e.polygon.outline = true as any;
          e.polygon.outlineColor = outlineColor as any;
          e.polygon.height = 0 as any;
          e.polygon.extrudedHeight = undefined as any;
          continue;
        }

        // 只显示建筑白膜（过滤停车蓬/车棚等）
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

        if (isParkingShed) {
          e.show = false;
          continue;
        }

        if (!isBuilding) {
          e.show = false;
          continue;
        }

        const rawLevels = p?.['building:levels']?.getValue?.();
        const levels = Number(rawLevels);
        const heightMeters = Number.isFinite(levels) && levels > 0 ? levels * 3.2 : 18;

        // 给没有数据的建筑生成“演示用”指标（用于热力图上色）
        if (!p?.vacancy) {
          (e.properties as any).vacancy = Math.random() * 0.35;
        }
        if (!p?.density) {
          const r = Math.random();
          (e.properties as any).density = r > 0.7 ? 'High' : r > 0.35 ? 'Medium' : 'Low';
        }
        if (!p?.excess) {
          const r = Math.random();
          (e.properties as any).excess = r > 0.85 ? 2 : r > 0.65 ? 1 : 0;
        }

        // 默认只白色建筑（用户切换热力图再上色）
        e.polygon.material = defaultColor as any;
        e.polygon.outline = true as any;
        e.polygon.outlineColor = outlineColor as any;
        e.polygon.extrudedHeight = heightMeters as any;
        e.polygon.height = 0 as any;
        (e.polygon as any).closeTop = true;
        (e.polygon as any).closeBottom = true;
      }

      // 初次加载后按当前 overlay（如果不是 none）应用一次
      applyOverlayToAll(mapOverlayRef.current);

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
      clickHandlerRef.current = handler;

      handler.setInputAction((movement: any) => {
        const picked = viewer.scene.pick(movement.position);
        const pickedId: any = (picked as any)?.id;
        if (!pickedId) return;

        const id = (pickedId.id as string) ?? null;
        if (!id) return;

        const ds = dataSourceRef.current;
        if (!ds) return;

        // 取消上一个选中
        if (selectedEntityId) {
          const prev: any = ds.entities.getById(selectedEntityId);
          if (prev?.polygon) prev.polygon.material = (getOverlayColor(prev, mapOverlayRef.current) as any);
        }

        const current: any = ds.entities.getById(id);
        if (current?.polygon) current.polygon.material = highlightColor as any;

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

    return () => {
      try {
        clickHandlerRef.current?.destroy();
      } catch {
      }
      clickHandlerRef.current = null;

      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
      viewerRef.current = null;
      dataSourceRef.current = null;
    };
  }, []);

  return (
    <div ref={cesiumContainer} className="w-full h-full" style={{ minHeight: '600px' }} />
  );
};

export default Campus3DView;
