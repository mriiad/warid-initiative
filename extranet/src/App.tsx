// App.js
import React from 'react';
import styled from 'styled-components';
import NavBar from './NavBar';
import SignupForm from './SignupForm';

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
	padding-top: 4rem;

	@media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
		padding-top: 2rem;
	}
`;

const App = () => {
	return (
		<AppContainer>
			<NavBar />
			<ContentContainer>
				<SignupForm />
			</ContentContainer>
		</AppContainer>
	);
};

export default App;
