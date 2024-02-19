export interface ApiErrorResponse<T = unknown> {
	errorMessage: string;
	errorKeys: string[];
}
