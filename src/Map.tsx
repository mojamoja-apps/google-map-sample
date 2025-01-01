import React, {
  useEffect,
  useRef,
  useState,
  Children,
  isValidElement,
  cloneElement,
  forwardRef,
  useImperativeHandle,
} from "react";

type MapProps = google.maps.MapOptions & {
  style: { [key: string]: string };
  children?:
    | React.ReactElement<{
        map: google.maps.Map;
        infoWindowRef: React.RefObject<google.maps.InfoWindow | null>;
      }>[]
    | React.ReactElement<{
        map: google.maps.Map;
        infoWindowRef: React.RefObject<google.maps.InfoWindow | null>;
      }>;
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
};

export const Map = forwardRef<google.maps.Map | null, MapProps>(
  ({ children, style, onBoundsChanged, ...options }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);

    const [map, setMap] = useState<google.maps.Map | null>(null);

    /** マーカー吹き出し */
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(
      new google.maps.InfoWindow({
        maxWidth: 200,
        disableAutoPan: true, // 吹き出し表示時に、自動でマップを移動させない
      })
    );

    useImperativeHandle(ref, () => map as google.maps.Map, [map]);

    useEffect(() => {
      if (mapRef.current && !map) {
        const option = {
          center: options.center,
          zoom: options.zoom || 15,
          minZoom: 12,
          // gestureHandling: "greedy",  // “地図を移動させるには指2本で操作します”の回避策
        };
        setMap(new window.google.maps.Map(mapRef.current, option));
      }
    }, [mapRef, map, options.center, options.zoom]);

    /** バウンズ マップ移動や拡大縮小した時 */
    useEffect(() => {
      if (map && onBoundsChanged) {
        infoWindowRef.current?.close();

        const listener = map.addListener("bounds_changed", () => {
          onBoundsChanged(map.getBounds()!);
        });
        return () => google.maps.event.removeListener(listener);
      }
    }, [map, onBoundsChanged]);

    return (
      <>
        <div ref={mapRef} style={style} />
        {Children.map(children, (child) => {
          if (isValidElement(child) && map) {
            return cloneElement(child, { map, infoWindowRef });
          }
        })}
      </>
    );
  }
);
