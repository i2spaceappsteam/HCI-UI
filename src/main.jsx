import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/index.js';
import App from './App.jsx';
// // import './assets/scss/style.scss';
// import "./assets/scss/base/_reset.scss";
// import "./assets/scss/base/_typography.scss";
// import './assets/scss/layout/_sidebar.scss';

// Components
// import "components/according";
// import "components/alert";
// import "components/avatars";
// import "components/badge";
// import "components/bookmark";
// import "components/breadcrumb";
// import "components/builders";
// import "components/custome";
// import "components/buttons";
// import "components/card";
import { AuthProvider } from './Providers/AuthProvider.jsx';
import GlobalStatesProvider from './Providers/GlobalStatesProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <GlobalStatesProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GlobalStatesProvider>
    </Provider>
  </React.StrictMode>,
);
