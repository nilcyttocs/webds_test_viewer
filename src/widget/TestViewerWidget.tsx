import React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import TestViewerComponent from './TestViewerComponent';

export class TestViewerWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + '_component'}>
        <TestViewerComponent />
      </div>
    );
  }
}

export default TestViewerWidget;
