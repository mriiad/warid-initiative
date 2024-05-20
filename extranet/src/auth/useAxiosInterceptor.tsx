import axios from 'axios';
import { useEffect } from 'react';

export const useAxiosInterceptor = (refreshToken) => {
	useEffect(() => {
		// Request Interceptor
		const requestInterceptor = axios.interceptors.request.use((request) => {
			const currentToken = localStorage.getItem('token');
			if (currentToken) {
				request.headers['Authorization'] = `Bearer ${currentToken}`;
			}
			return request;
		});

		// Response Interceptor
		const responseInterceptor = axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;
				if (
					error.response &&
					error.response.status === 401 &&
					!originalRequest._retry
				) {
					const requestUrl = originalRequest.url;
					const excludedEndpoints = [
						'http://localhost:3000/api/auth/login',
						'http://localhost:3000/api/auth/refresh-token',
					];

					if (!excludedEndpoints.includes(requestUrl)) {
						originalRequest._retry = true;
						try {
							await refreshToken();
							originalRequest.headers[
								'Authorization'
							] = `Bearer ${localStorage.getItem('token')}`;
							return axios(originalRequest);
						} catch (refreshError) {
							return Promise.reject(refreshError);
						}
					}
				}
				return Promise.reject(error);
			}
		);

		// Cleanup
		return () => {
			axios.interceptors.request.eject(requestInterceptor);
			axios.interceptors.response.eject(responseInterceptor);
		};
	}, [refreshToken]);
};
