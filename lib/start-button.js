/* See license.txt for terms of usage */

"use strict";

const self = require("sdk/self");
const options = require("@loader/options");

const { Cu } = require("chrome");
const { Trace, TraceError } = require("./sdk/core/trace.js").get(module.id);
const { Locale } = require("./sdk/core/locale.js");
const { ToolbarButton } = require("./sdk/toolbar-button.js");
const { getMostRecentBrowserWindow } = require("sdk/window/utils");
const { Chrome } = require("./sdk/chrome.js");
const { PixelPerfectToolboxOverlay } = require("./pixel-perfect-toolbox-overlay.js");
const { defer } = require("sdk/core/promise");
const { openTab } = require("sdk/tabs/utils");

const { CustomizableUI } = Cu.import("resource:///modules/CustomizableUI.jsm", {});
const { AREA_PANEL, AREA_NAVBAR } = CustomizableUI;
const { AddonManager } = Cu.import("resource://gre/modules/AddonManager.jsm", {});

// DevTools
const { gDevTools } = Cu.import("resource:///modules/devtools/gDevTools.jsm", {});
const { devtools } = Cu.import("resource://gre/modules/devtools/Loader.jsm", {});

const startButtonId = "pixel-perfect-start-button";

/**
 * xxxHonza TODO docs
 */
var StartButton =
/** @lends StartButton */
{
  // Initialization

  initialize: function() {
    // Create customizable button in browser toolbar.
    // Read more:
    // https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/CustomizableUI.jsm
    // https://blog.mozilla.org/addons/2014/03/06/australis-for-add-on-developers-2/
    CustomizableUI.createWidget({
      id: startButtonId,
      type: "custom",
      defaultArea: AREA_NAVBAR,
      allowedAreas: [AREA_PANEL, AREA_NAVBAR],
      onBuild: this.onBuild.bind(this)
    });
  },

  shutdown: function(reason) {
    CustomizableUI.destroyWidget(startButtonId);
  },

  onBuild: function(doc) {
    Trace.sysout("startButton.onBuild;", doc);

    let button = new ToolbarButton({
      document: doc,
      id: startButtonId,
      label: "pixelPerfect.startButton.title",
      tooltiptext: "pixelPerfect.startButton.tip",
      type: "menu-button",
      "class": "toolbarbutton-1 chromeclass-toolbar-additional",
      image: "chrome://pixelperfect/skin/logo_16x16.png",
      items: this.getMenuItems.bind(this, doc.defaultView),
      command: this.onTogglePixelPerfect.bind(this)
    });

    return button.button;
  },

  // Menu Actions

  getMenuItems: function(win) {
    let items = [];

    items.push({
      nol10n: true,
      label: Locale.$STR("pixelPerfect.menu.visitHomePage.label"),
      tooltiptext: Locale.$STR("pixelPerfect.menu.visitHomePage.tip"),
      command: this.onVisitHomePage.bind(this)
    });

    items.push({
      nol10n: true,
      label: Locale.$STR("pixelPerfect.menu.reportIssue.label"),
      tooltiptext: Locale.$STR("pixelPerfect.menu.reportIssue.tip"),
      command: this.onReportIssue.bind(this)
    });

    items.push("-");

    items.push({
      nol10n: true,
      label: Locale.$STR("pixelPerfect.menu.about.label") + " " + self.version,
      tooltiptext: Locale.$STR("pixelPerfect.menu.about.tip"),
      image: "chrome://pixelperfect/skin/logo_16x16.png",
      command: this.onAbout.bind(this)
    });

    return items;
  },

  onTogglePixelPerfect: function() {
    Trace.sysout("startButton.onTogglePixelPerfect;");

    getToolboxWhenReady().then(toolbox => {
      let context = Chrome.getContext(toolbox);
      let overlayId = PixelPerfectToolboxOverlay.prototype.overlayId;
      let overlay = context.getOverlay(overlayId);
      overlay.togglePixelPerfectPopup();

      // xxxHonza: register listeners to update the UI button.
      // Or the toolbox overlay could update it.
    });
  },

  // Commands

  onAbout: function(event) {
    cancelEvent(event);

    AddonManager.getAddonByID(self.id, function (addon) {
      let browser = getMostRecentBrowserWindow();
      browser.openDialog("chrome://mozapps/content/extensions/about.xul", "",
        "chrome,centerscreen,modal", addon);
    });
  },

  onVisitHomePage: function(event) {
    cancelEvent(event);

    let browser = getMostRecentBrowserWindow();
    openTab(browser, options.manifest.homepage);
  },

  onReportIssue: function(event) {
    cancelEvent(event);

    let browser = getMostRecentBrowserWindow();
    openTab(browser, options.manifest.bugs.url);
  }
}

// Helpers

function getToolboxWhenReady(toolId) {
  let deferred = defer();
  showToolbox(toolId).then(toolbox => {
    deferred.resolve(toolbox);
  });
  return deferred.promise;
}

function showToolbox(toolId) {
  let browser = getMostRecentBrowserWindow();
  let tab = browser.gBrowser.mCurrentTab;
  let target = devtools.TargetFactory.forTab(tab);
  return gDevTools.showToolbox(target, toolId);
}

function cancelEvent(event) {
  event.stopPropagation();
  event.preventDefault();
}

// Exports from this module
exports.StartButton = StartButton;