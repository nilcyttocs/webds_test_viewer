import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from "@jupyterlab/application";

import { WidgetTracker } from "@jupyterlab/apputils";

import { ILauncher } from "@jupyterlab/launcher";

import { WebDSService, WebDSWidget } from "@webds/service";

import { testViewerIcon } from "./icons";

import TestViewerWidget from "./widget/TestViewerWidget";

namespace Attributes {
  export const command = "webds_test_viewer:open";
  export const id = "webds_test_viewer_widget";
  export const label = "Test Data Viewer";
  export const caption = "Test Data Viewer";
  export const category = "Touch - Assessment";
  export const rank = 50;
}

export let webdsService: WebDSService;

/**
 * Initialization data for the @webds/test_viewer extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: "@webds/test_viewer:plugin",
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log("JupyterLab extension @webds/test_viewer is activated!");

    webdsService = service;

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args["isLauncher"] ? testViewerIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new TestViewerWidget(Attributes.id);
          widget = new WebDSWidget<TestViewerWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = testViewerIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, "main");

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, {
      command,
      name: () => Attributes.id
    });
  }
};

export default plugin;
