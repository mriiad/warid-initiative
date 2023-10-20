export interface ApiErrorResponse<T = any> {
	errorMessage: string;
	details?: T;
	errorKeys: string[];
}
