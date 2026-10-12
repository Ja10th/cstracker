import React from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet';
import Modal from '../Modal';
import 'leaflet/dist/leaflet.css';

const LOCATIONS = { Oyo: [7.4, 3.9], Ondo: [7.1, 5.1], Osun: [7.5, 4.5], Ekiti: [7.7, 5.3], Ogun: [6.9, 3.4] };

function ZoomToLocation({ location }) {
  const map = useMap();
  React.useEffect(() => { if (location) map.flyTo(location, 9, { duration: 0.8 }); }, [location, map]);
  return null;
}

export default function ProductionMap({ production = [], nurseries = [], className = '' }) {
  const [selected, setSelected] = React.useState(null);
  const nurseryState = Object.fromEntries(nurseries.map((nursery) => [nursery.name, nursery.state]));
  const locations = Object.entries(LOCATIONS).map(([state, coordinates]) => {
    const stateNurseries = nurseries.filter((nursery) => nursery.state === state);
    const records = production.filter((record) => nurseryState[record.nur] === state);
    return { state, coordinates, nurseries: stateNurseries, records, quantity: records.reduce((sum, record) => sum + (parseInt(record.qty, 10) || 0), 0) };
  });
  const max = Math.max(...locations.map((location) => location.quantity), 1);

  return (
    <>
      <div className={`relative z-0 w-full overflow-hidden border border-gray-200 ${className || 'h-[360px]'}`}>
        <MapContainer center={[7.35, 4.45]} zoom={7} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {locations.map((location) => <CircleMarker key={location.state} center={location.coordinates} radius={Math.max(9, Math.min(25, 9 + (location.quantity / max) * 16))} pathOptions={{ color: '#176B3A', fillColor: '#D45417', fillOpacity: 0.72, weight: 2 }} eventHandlers={{ click: () => setSelected(location) }}><Tooltip className="production-map-tooltip" direction="top" offset={[0, -10]}>{`${location.state} · ${location.quantity.toLocaleString()} seedlings`}</Tooltip><title>{`${location.state}: ${location.quantity.toLocaleString()} seedlings`}</title></CircleMarker>)}
          {selected && <ZoomToLocation location={selected.coordinates} />}
        </MapContainer>
        <div className="absolute left-3 top-3 z-[400] bg-white/95 px-3 py-2 text-xs text-gray-700 shadow-sm">Click a marker to zoom and view location details</div>
      </div>
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`${selected?.state || 'Location'} production details`}>
        {selected && <div className="space-y-5"><div className="grid grid-cols-2 gap-3"><div className="border border-gray-200 bg-[#FAF8F1] p-4"><div className="text-xs text-gray-500">Nurseries</div><div className="text-2xl font-semibold text-gray-900 mt-1">{selected.nurseries.length}</div></div><div className="border border-gray-200 bg-[#FAF8F1] p-4"><div className="text-xs text-gray-500">Seedlings recorded</div><div className="text-2xl font-semibold text-[#176B3A] mt-1">{selected.quantity.toLocaleString()}</div></div></div><div><div className="section-heading mb-3">Nurseries in {selected.state}</div><div className="divide-y divide-gray-100 border border-gray-200">{selected.nurseries.map((nursery) => <div key={nursery.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="font-semibold text-gray-800">{nursery.name}</span><span className="text-xs text-gray-500">{nursery.lga}</span></div>)}</div></div><div><div className="section-heading mb-3">Production records</div><div className="divide-y divide-gray-100 border border-gray-200">{selected.records.slice(0, 5).map((record) => <div key={record.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="font-mono text-gray-600">{record.id}</span><span>{parseInt(record.qty, 10).toLocaleString()} seedlings</span><span className="text-xs text-gray-500">{record.date}</span></div>)}</div></div></div>}
      </Modal>
    </>
  );
}
