import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Map } from "./Map";
import { Marker } from "./Marker";
import { useState } from "react";
import axios from "axios";
import { MarkerDataType } from "./types";

const render = (status: Status) => {
  return <h1>{status}</h1>;
};

function App() {
  /** 東京駅の座標 */
  const defaultCenter = { lat: 35.681236, lng: 139.767125 };

  const [positions, setPositions] = useState<MarkerDataType[]>([]);

  let boundsChangedTimeout: number;
  const handleBoundsChanged = (bounds: google.maps.LatLngBounds) => {
    if (boundsChangedTimeout) {
      clearTimeout(boundsChangedTimeout);
    }

    boundsChangedTimeout = setTimeout(() => {
      const ne = bounds.getNorthEast(); // 北東の座標
      const sw = bounds.getSouthWest(); // 南西の座標

      console.log(ne.lat(), ne.lng(), sw.lat(), sw.lng());

      fetchStations(ne.lat(), ne.lng(), sw.lat(), sw.lng());
    }, 1000);
  };

  // Fetch station data
  function fetchStations(
    ne_lat: number,
    ne_lng: number,
    sw_lat: number,
    sw_lng: number
  ) {
    axios
      .get("http://192.168.1.2:8080/station", {
        params: {
          ne_lat,
          ne_lng,
          sw_lat,
          sw_lng,
        },
      })
      .then((response) => {
        const data = response.data.data;
        const newPositions = data.map((station: any) => ({
          lat: parseFloat(station.lat),
          lng: parseFloat(station.lon),
          title: station.station_name + "駅",
          zip: station.post,
          address: station.address,
        }));
        setPositions(newPositions);
      })
      .catch((error) => {
        console.error("エラーが発生しました:", error);
      });
  }

  return (
    <div className="flex flex-col h-screen">
      <h1 className="text-4xl font-bold text-blue-500">
        全国の駅を表示 Googleマップサンプル
      </h1>

      <div className="flex-grow h-70">
        <Wrapper
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          render={render}
        >
          <Map
            style={{ width: "100%", height: "100%" }}
            center={defaultCenter}
            onBoundsChanged={handleBoundsChanged}
          >
            {positions.map(({ title, zip, address, ...position }, index) => (
              <Marker
                key={index}
                position={position}
                station={{ title, zip, address }}
              />
            ))}
          </Map>
        </Wrapper>
      </div>

      <div className="flex flex-col items-center justify-center h-30 p-4 bg-gray-100">
        <div className="flex flex-row items-center w-full max-w-md">
          <input
            type="text"
            id="searchText"
            placeholder="地名や駅名を入力"
            className="mr-2 p-2 border border-gray-300 rounded flex-grow"
          />
          <button
            id="moveCenter"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            検索
          </button>
        </div>
        <ul>
          <li className="text-lg text-gray-700">
            Go言語でAPIを作成し、Reactでフロントエンドを作成しました。
          </li>
          <li className="text-lg text-gray-700">
            Google Maps APIを使用して、全国の駅を表示しています。
          </li>
          <li className="text-lg text-gray-700">
            駅名や地名で検索することができます。
          </li>
          <li className="text-lg text-gray-700">
            駅の情報は、
            <a
              href="https://ekidata.jp/"
              target="_blank"
              className="text-blue-500 underline"
            >
              駅データ.jp
            </a>
            の無料データを使用しています。
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
