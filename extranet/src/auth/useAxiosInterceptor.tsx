import axios from 'axios';
import { useEffect } from 'react';

export const useAxiosInterceptor = (refreshToken) => {
	useEffect(() => {
		const interceptor = axios.interceptors.response.use(
			(response) => response, // If the response is successful, do nothing
			async (error) => {
				// Only proceed if there's an error response and it's a 401
				// That means the user is not authorized so the token needs to be refreshed
				if (error.response && error.response.status === 401) {
					// Exclude specific routes from triggering the refresh logic
					// Because the token & refreshToken might be undefined when calling them
					// e.g. login (after a logout and clean up of localStorage)
					// e.g. refresh-token which means the currently stored token/refreshToken is invalid
					const requestUrl = error.config.url;
					const excludedEndpoints = [
						'http://localhost:3000/api/auth/login',
						'http://localhost:3000/api/auth/refresh-token',
					];

					if (!excludedEndpoints.includes(requestUrl)) {
						try {
							await refreshToken(); // Attempt to refresh the token
							// Update the Authorization header with the new token
							error.config.headers[
								'Authorization'
							] = `Bearer ${localStorage.getItem('token')}`;
							return axios(error.config); // Retry the original request with the new token
						} catch (refreshError) {
							// If refreshing also fails, reject the promise
							return Promise.reject(refreshError);
						}
					}
				}
				// If it's an excluded endpoint or not a 401, just reject the promise
				return Promise.reject(error);
			}
		);

		// Cleanup the interceptor when the component using this hook unmounts
		return () => {
			axios.interceptors.response.eject(interceptor);
		};
	}, [refreshToken]); // Only recreate the interceptor when refreshToken changes
};
