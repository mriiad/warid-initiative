/**
 * Represents all the Warid's events
 */
export interface Event {
	_id: string;
	startDate: Date;
	endDate: Date;
	location: string;
	name?: string;
}
