import axios from 'axios';
import { useEffect } from 'react';

export const useAxiosInterceptor = (refreshToken) => {
	useEffect(() => {
		const interceptor = axios.interceptors.response.use(
			(response) => response,
			(error) => {
				if (error.response && error.response.status === 401) {
					return refreshToken().then(() => {
						error.config.headers[
							'Authorization'
						] = `Bearer ${localStorage.getItem('token')}`;
						return axios(error.config);
					});
				}
				return Promise.reject(error);
			}
		);

		return () => {
			axios.interceptors.response.eject(interceptor);
		};
	}, [refreshToken]);
};
