export interface ApiErrorKey {
	key: string;
	value: string | number | Date | boolean;
}

export interface ApiErrorResponse<T = unknown> {
	errorMessage: string;
	details?: T;
	errorKeys: ApiErrorKey[];
}
