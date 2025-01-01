import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Map } from "./Map";
import { Marker } from "./Marker";
import { useState, useRef } from "react";
import axios from "axios";
import { MarkerDataType } from "./types";

const render = (status: Status) => {
  return <h1>{status}</h1>;
};

function App() {
  console.log("MODE:", import.meta.env.VITE_PUBLIC_KEY);

  /** 東京駅の座標 */
  const defaultCenter = { lat: 35.681236, lng: 139.767125 };

  const [positions, setPositions] = useState<MarkerDataType[]>([]);
  const searchTextRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

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
      .get(import.meta.env.VITE_API_URL, {
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

  const handleSearch = async () => {
    const searchText = searchTextRef.current?.value;
    if (!searchText) {
      alert("検索テキストを入力してください");
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchText }, (results, status) => {
      if (status === "OK" && results) {
        mapRef.current?.setCenter(results[0].geometry.location);
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  };

  return (
    <div className="h-screen">
      <h1 className="text-xl sm:text-4xl font-bold text-blue-500 m-2">
        Googleマップで全国の駅を表示
      </h1>

      <div className="h-3/4">
        <Wrapper
          apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          render={render}
        >
          <Map
            style={{ width: "100%", height: "100%" }}
            center={defaultCenter}
            onBoundsChanged={handleBoundsChanged}
            ref={mapRef}
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

      <div className="items-center justify-center h-30 p-4 bg-gray-100">
        <div className="flex flex-row items-center w-full max-w-md">
          <input
            type="text"
            id="searchText"
            placeholder="地名や駅名を入力"
            className="mr-2 p-2 border border-gray-300 rounded flex-grow"
            ref={searchTextRef}
          />
          <button
            id="moveCenter"
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={handleSearch}
          >
            検索
          </button>
        </div>
        <div className="text-lg text-gray-700">
          全国の各駅にマーカーを表示します。クリックすると駅名と住所が表示されます。
          <br />
          駅名や地名で検索することができます。
        </div>
        <ul className="text-lg text-gray-700 my-5">
          <li>使用技術</li>
          <li>・フロントエンド：Amazon AWS EC2、React</li>
          <li>・バックエンド：Amazon AWS EC2、go言語</li>
          <li>・Let's Encryptを使用した無料SSL。自動で証明書の更新。</li>
          <li>・データベース：Amazon RDS、MySQL</li>
          <li>・デプロイ：github actionsを使った自動デプロイ</li>
          <li>
            駅の情報：
            <a
              href="https://ekidata.jp/"
              target="_blank"
              className="text-blue-500 underline"
            >
              駅データ.jp
            </a>
          </li>
        </ul>
        <div>
          <a
            href="https://mojamoja-apps.com/"
            target="_blank"
            className="text-blue-500 underline"
          >
            開発：mojamoja apps
          </a>
        </div>
      </div>
      <p className="text-center text-gray-500 m-2">© 2025 mojamoja apps</p>
    </div>
  );
}

export default App;
