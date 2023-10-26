import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.render(
  <React.StrictMode>
  
  <GoogleOAuthProvider clientId ={"978568787969-t6hihuo1k4ifro5ll704h7sbc7laqct1.apps.googleusercontent.com"}>
    <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);