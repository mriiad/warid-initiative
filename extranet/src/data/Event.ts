export interface Event {
	_id: string;
	reference: string;
	title: string;
	image: string;
	subtitle: string;
	location: string;
	date: string;
	mapLink: string;
	description: string;
	isGeneric: boolean;
	createdAt?: string;
	qrCode?: string;
}
