import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import CacheBuster from 'react-cache-buster';
import { store } from '@/redux/store';
import { AppRoutes } from '@/routes';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { env } from '@/config/env';
import { version } from '../package.json';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

function App() {
  return (
    <CacheBuster
      currentVersion={version}
      isEnabled={env.isProd}
      isVerboseMode={env.isDev}
      loadingComponent={<LoadingSpinner fullScreen message="Checking for updates..." />}
      metaFileDirectory="."
    >
      <ErrorBoundary>
        <Provider store={store}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </Provider>
      </ErrorBoundary>
    </CacheBuster>
  );
}

export default App;
