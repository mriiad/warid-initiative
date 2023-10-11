import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { Event } from '../../data/Event';
import { extractLatLng } from '../../utils/utils';

interface MapProps {
	event: Event;
}

const Map: React.FC<MapProps> = ({ event }) => {
	const { latitude = 0.0, longitude = 0.0 } = event
		? extractLatLng(event.mapLink)
		: {};

	const openMapLink = () => {
		window.open(event.mapLink, '_blank');
	};

	return (
		<MapContainer
			center={[latitude, longitude]}
			zoom={13}
			style={{ height: '300px', width: '100%' }}
		>
			<TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
			<Marker
				position={[latitude, longitude]}
				eventHandlers={{ click: openMapLink }}
			/>
		</MapContainer>
	);
};

export default Map;
