const mapId = "mojamoja_apps_sample";
let map;

async function initMap() {
    // Request needed libraries.
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        zoom: 15,
        minZoom: 12,
        center: { lat: 35.681236, lng: 139.767125 },
        mapId,
        gestureHandling: "greedy",  // 地図を移動させるには指2本で操作します の無効化
    });

    // Create an info window to share between markers.
    const infoWindow = new InfoWindow();

    // ピンを管理する配列を追加
    let markers = [];

    // Fetch station data
    function fetchStations(bounds) {
        $.ajax({
            url: 'http://192.168.1.2:8080/station',
            method: 'GET',
            dataType: 'json',
            data: bounds
        })
            .done(function (data) {
                if (data === null) return;
                if (data.data === null) return;

                // 既存のピンをクリア
                markers.forEach(marker => marker.setMap(null));
                markers = [];

                const tourStops = data.data.map(station => ({
                    position: { lat: parseFloat(station.lat), lng: parseFloat(station.lon) },
                    title: station.station_name + '駅',
                    zip: station.post,
                    address: station.address,
                }));

                // Create the markers.
                tourStops.forEach(({ position, title, zip, address }, i) => {
                    const marker = new AdvancedMarkerElement({
                        position,
                        map,
                        title: `${title}<br>${zip}<br>${address}`,
                        gmpClickable: true,
                    });

                    // Add a click listener for each marker, and set up the info window.
                    marker.addListener("click", ({ domEvent, latLng }) => {
                        const { target } = domEvent;

                        infoWindow.close();
                        infoWindow.setContent(marker.title);
                        infoWindow.open(marker.map, marker);
                    });

                    // 新しいピンを配列に追加
                    markers.push(marker);
                });
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('エラーが発生しました: ' + textStatus);
            });
    }

    // 初期表示のピンを取得
    fetchStations();

    // マップの表示範囲の座標を取得する関数
    let boundsChangedTimeout;
    function getMapBounds() {
        if (boundsChangedTimeout) {
            clearTimeout(boundsChangedTimeout);
        }

        boundsChangedTimeout = setTimeout(() => {
            const bounds = map.getBounds();
            const ne = bounds.getNorthEast(); // 北東の座標
            const sw = bounds.getSouthWest(); // 南西の座標

            console.log(ne.lat(), ne.lng(), sw.lat(), sw.lng());

            fetchStations({
                ne_lat: ne.lat(),
                ne_lng: ne.lng(),
                sw_lat: sw.lat(),
                sw_lng: sw.lng()
            });
        }, 1000);
    }

    // マップの表示範囲が変更された時に座標を取得
    map.addListener('bounds_changed', getMapBounds);

    // マップの他の部分をクリックしたときに情報ウィンドウを閉じる
    map.addListener('click', () => {
        infoWindow.close();
    });
}

initMap();

document.getElementById('moveCenter').addEventListener('click', async () => {
    const searchText = document.getElementById('searchText').value;
    if (!searchText) {
        alert('検索テキストを入力してください');
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchText }, (results, status) => {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
});

// Enterキーを押したときに検索ボタンをクリックするイベントを追加
document.getElementById('searchText').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('moveCenter').click();
    }
});
