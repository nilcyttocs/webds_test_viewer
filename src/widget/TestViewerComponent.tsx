import React, { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ThemeProvider } from '@mui/material/styles';

import Landing from './Landing';
import { webdsService } from './local_exports';

export const TestViewerComponent = (props: any): JSX.Element => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [alert, setAlert] = useState<string | undefined>(undefined);

  const webdsTheme = webdsService.ui.getWebDSTheme();

  useEffect(() => {
    const initialize = async () => {
      setInitialized(true);
    };
    initialize();
  }, []);

  return (
    <>
      <ThemeProvider theme={webdsTheme}>
        <div className="jp-webds-widget-body">
          {alert !== undefined && (
            <Alert
              severity="error"
              onClose={() => setAlert(undefined)}
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {alert}
            </Alert>
          )}
          {initialized && <Landing setAlert={setAlert} />}
        </div>
        {!initialized && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CircularProgress color="primary" />
          </div>
        )}
      </ThemeProvider>
    </>
  );
};

export default TestViewerComponent;
