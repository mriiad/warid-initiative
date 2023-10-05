import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import AdminComponent from './components/AdminComponent';
import EventsComponent from './components/EventsComponent';
import LoginForm from './components/LoginForm';
import NavBar from './components/NavBar';
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
						{/*<Route path='/quotes/:quoteId' element={<QuoteDetail />}>
						<Route path='comments' element={<Comments />} />
					</Route>*/}
						<Route path='/login' element={<LoginForm />} />
						<Route path='/events' element={<EventsComponent />} />
						<Route path='/admin' element={<AdminComponent />} />
						<Route path='*' element={<SignupForm />} />
					</Routes>
				</ContentContainer>
			</AppContainer>
		</BrowserRouter>
	);
};

export default App;
