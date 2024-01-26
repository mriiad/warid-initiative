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
				if (error.response && error.response.status === 401) {
					const requestUrl = error.config.url;
					const excludedEndpoints = [
						'http://localhost:3000/api/auth/login',
						'http://localhost:3000/api/auth/refresh-token',
					];

					if (!excludedEndpoints.includes(requestUrl)) {
						try {
							await refreshToken();
							error.config.headers[
								'Authorization'
							] = `Bearer ${localStorage.getItem('token')}`;
							return axios(error.config);
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
