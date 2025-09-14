import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return React.createElement('div', null, 'Test React App Working!');
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(container);
root.render(React.createElement(TestApp));
