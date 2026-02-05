import React, { useEffect, useRef } from 'react';
import {
  Cartesian2,
  Cartesian3,
  Cesium3DTileset,
  Color,
  HorizontalOrigin,
  Ion,
  LabelStyle,
  Math as CesiumMath,
  NearFarScalar,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  VerticalOrigin,
  createOsmBuildingsAsync,
  createWorldTerrainAsync,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

interface CesiumViewProps {
  className?: string;
}

const getBuildingNameFromFeature = (feature: any): string | null => {
  if (!feature || typeof feature.getProperty !== 'function') return null;

  const candidates = [
    'name:zh',
    'name:en',
    'name',
    'addr:housename',
    'addr:unit',
    'brand',
  ];

  for (const key of candidates) {
    const v = feature.getProperty(key);
    if (typeof v === 'string' && v.trim()) return v.trim();
  }

  return null;
};

export const CesiumView: React.FC<CesiumViewProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    Ion.defaultAccessToken =
      import.meta.env.VITE_CESIUM_ION_TOKEN ||
      (import.meta.env as any).NUXT_PUBLIC_CESIUM_TOKEN ||
      '';

    const viewer = new Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      homeButton: false,
      geocoder: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      selectionIndicator: false,
      infoBox: false,
      shouldAnimate: true,
    });

    viewerRef.current = viewer;

    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(119.1895, 26.0254, 500),
      orientation: {
        heading: CesiumMath.toRadians(30),
        pitch: CesiumMath.toRadians(-35),
        roll: 0,
      },
    });

    // Load terrain + Cesium OSM Buildings, then enable click-to-label.
    (async () => {
      try {
        if (!Ion.defaultAccessToken) return;

        viewer.terrainProvider = await createWorldTerrainAsync();

        const osmBuildings = await createOsmBuildingsAsync();
        viewer.scene.primitives.add(osmBuildings);
        (osmBuildings as Cesium3DTileset).style = undefined;

        const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

        handler.setInputAction((movement: any) => {
          const picked = viewer.scene.pick(movement.position as Cartesian2);
          if (!picked) return;

          const feature = (picked as any).getProperty ? picked : (picked as any).id;
          const name = getBuildingNameFromFeature(feature);
          if (!name) return;

          const cartesian = viewer.scene.pickPosition(movement.position as Cartesian2);
          if (!cartesian) return;

          // Deduplicate: avoid piling labels on repeated clicks.
          const existing = viewer.entities.values.find(
            (e) => (e.label as any)?.text?.getValue?.() === name
          );
          if (existing) {
            existing.position = cartesian;
            return;
          }

          viewer.entities.add({
            position: cartesian,
            label: {
              text: name,
              font: '14px "Microsoft YaHei", "PingFang SC", sans-serif',
              style: LabelStyle.FILL_AND_OUTLINE,
              fillColor: Color.WHITE,
              outlineColor: Color.BLACK,
              outlineWidth: 3,
              showBackground: true,
              backgroundColor: Color.fromAlpha(Color.BLACK, 0.55),
              horizontalOrigin: HorizontalOrigin.CENTER,
              verticalOrigin: VerticalOrigin.BOTTOM,
              pixelOffset: new Cartesian2(0, -10),
              eyeOffset: new Cartesian3(0, 0, -20),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
              scaleByDistance: new NearFarScalar(200, 1.0, 2000, 0.6),
              distanceDisplayCondition: undefined,
            },
          });
        }, ScreenSpaceEventType.LEFT_CLICK);

        // Cleanup handler when viewer is destroyed.
        (viewer as any).__labelHandler = handler;
      } catch {
        // noop
      }
    })();

    return () => {
      const v = viewerRef.current;
      const handler = (v as any)?.__labelHandler as ScreenSpaceEventHandler | undefined;
      if (handler) handler.destroy();

      if (v && !v.isDestroyed()) {
        v.destroy();
      }
      viewerRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={className ?? ''} />;
};
