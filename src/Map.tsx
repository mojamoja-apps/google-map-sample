import React, { useEffect, useRef, useState, Children, isValidElement, cloneElement } from "react";

type MapProps = google.maps.MapOptions & {
  style: { [key: string]: string };
  children?:
    | React.ReactElement<{ map: google.maps.Map; infoWindowRef: React.RefObject<google.maps.InfoWindow | null> }>[]
    | React.ReactElement<{ map: google.maps.Map; infoWindowRef: React.RefObject<google.maps.InfoWindow | null> }>;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
};

export const Map: React.FC<MapProps> = ({ children, style, onBoundsChanged, ...options }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  /** マーカー吹き出し */
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(
    new google.maps.InfoWindow({ maxWidth: 200 })
  )

  useEffect(() => {
    if (ref.current && !map) {
      const option = {
        center: options.center,
        zoom: options.zoom || 15,
        minZoom: 12,
        gestureHandling: "greedy",
      };
      setMap(new window.google.maps.Map(ref.current, option));
    }
  }, [ref, map, options.center, options.zoom]);

  /** バウンズ マップ移動や拡大縮小した時 */
  useEffect(() => {
    if (map && onBoundsChanged) {
      // マップ移動した時は吹き出しを閉じる
      infoWindowRef.current?.close();

      const listener = map.addListener('bounds_changed', () => {
        onBoundsChanged(map.getBounds()!);
      });
      return () => google.maps.event.removeListener(listener);
    }
  }, [map, onBoundsChanged]);

  return (
    <>
      <div ref={ref} style={style} />
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, { map, infoWindowRef })
        }
      })}
    </>
  );
};
