import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import AdminComponent from './components/AdminComponent';
import EventDetail from './components/EventDetail';
import EventsComponent from './components/EventsComponent';
import LoginForm from './components/LoginForm';
import NavBar from './components/NavBar';
import PasswordResetForm from './components/PasswordResetForm';
import SignupForm from './components/SignupForm';

const AppContainer = styled.div`
	font-family: Arial, sans-serif;
	margin: 0;
	padding: 0;
	min-height: 100vh;
`;

const ContentContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-top: 10rem;

	@media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
		padding-top: 2rem;
	}
`;

const App = () => {
	return (
		<BrowserRouter>
			<AppContainer>
				<NavBar />
				<ContentContainer>
					<Routes>
						<Route path='/' element={<Navigate replace to='/signup' />} />
						<Route path='/signup' element={<SignupForm />} />
						<Route path='/login' element={<LoginForm />} />
						<Route path='/events' element={<EventsComponent />} />
						<Route path='/events/:reference' element={<EventDetail />} />
						<Route path='/admin' element={<AdminComponent />} />
						<Route
							path='/request-reset-password'
							element={<PasswordResetForm />}
						/>
						<Route
							path='/reset-password/:resetToken'
							element={<PasswordResetForm />}
						/>
						<Route path='*' element={<SignupForm />} />
					</Routes>
				</ContentContainer>
			</AppContainer>
		</BrowserRouter>
	);
};

export default App;
