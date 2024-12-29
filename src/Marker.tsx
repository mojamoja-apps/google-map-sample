import { useEffect, useState } from "react";
import { MutableRefObject } from "react";

type MarkerProps = google.maps.MarkerOptions & {
  station: { title: string; zip: string; address: string };
  infoWindowRef?: MutableRefObject<google.maps.InfoWindow | null>;
};

export const Marker = ({ station, infoWindowRef, ...options }: MarkerProps) => {
  const [marker, setMarker] = useState<google.maps.Marker>();
  const infoWindowContent = `
<div class="">
  <p>${station.title}</p>
  <p>${station.zip}</p>
  <p>${station.address}</p>
</div>
`;

  useEffect(() => {
    if (!marker) {
      setMarker(
        new google.maps.Marker({
          position: options.position,
        })
      );
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      marker.setOptions(options);
    }
  }, [marker, options]);

  marker?.addListener("click", () => {
    // クリック ピン表示に移動 すると変になるのでコメントアウト
    // if (options.map instanceof google.maps.Map) {
    //   const position = marker.getPosition();
    //   if (position) options.map.panTo(position);
    // }

    if (infoWindowRef && infoWindowRef.current) {
      infoWindowRef.current.setContent(infoWindowContent);
      infoWindowRef.current.open({ map: options.map, anchor: marker });
    }
  });

  return null;
};
