import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function App() {
  const [stations, setStations] = useState([]);
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    axios.get("https://api.openchargemap.io/v3/poi/?output=json&countrycode=DE&maxresults=50")
      .then(res => setStations(res.data))
      .catch(err => console.log(err));
  }, []);

  const filteredStations = filterType 
    ? stations.filter(station => station.Connections.some(c => c.ConnectionType?.Title?.includes(filterType)))
    : stations;

  return (
    <div className="h-screen w-screen">
      <div className="absolute z-10 p-4 bg-white shadow-md rounded-md m-4 flex gap-2">
        <select
          className="border rounded p-1"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Alle Steckertypen</option>
          <option value="Type 2">Type 2</option>
          <option value="CCS">CCS</option>
          <option value="CHAdeMO">CHAdeMO</option>
        </select>
        <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={() => setFilterType("")}>
          Reset
        </button>
      </div>

      <MapContainer center={[51.1657, 10.4515]} zoom={6} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredStations.map(station => (
          <Marker
            key={station.ID}
            position={[station.AddressInfo.Latitude, station.AddressInfo.Longitude]}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <strong>{station.AddressInfo.Title}</strong>
                <span>{station.AddressInfo.AddressLine1}, {station.AddressInfo.Town}</span>
                <span>Anbieter: {station.OperatorInfo?.Title || "unbekannt"}</span>
                <span>Steckertypen:</span>
                <ul className="list-disc ml-4">
                  {station.Connections.map((c, i) => <li key={i}>{c.ConnectionType?.Title || "unbekannt"}</li>)}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
