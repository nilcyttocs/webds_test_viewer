import React from "react";

import { ReactWidget } from "@jupyterlab/apputils";

import { WebDSService } from "@webds/service";

import TestViewerComponent from "./TestViewerComponent";

export let webdsService: WebDSService;

export class TestViewerWidget extends ReactWidget {
  id: string;
  service: WebDSService;

  constructor(id: string, service: WebDSService) {
    super();
    this.id = id;
    this.service = service;
  }

  render(): JSX.Element {
    webdsService = this.service;
    return (
      <div id={this.id + "_component"}>
        <TestViewerComponent />
      </div>
    );
  }
}

export default TestViewerWidget;
