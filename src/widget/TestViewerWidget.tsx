import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import { WebDSService } from "@webds/service";

import TestViewerComponent from "./TestViewerComponent";

export class TestViewerWidget extends ReactWidget {
  id: string;
  service: WebDSService | null = null;

  constructor(id: string, service: WebDSService) {
    super();
    this.id = id;
    this.service = service;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + "_component"}>
        <TestViewerComponent service={this.service} />
      </div>
    );
  }
}

export default TestViewerWidget;
