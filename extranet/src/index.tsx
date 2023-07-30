// Import necessary packages
import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import App from './App'; // Your main component (SignUp component)

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Wrap your app with the QueryClientProvider
ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
