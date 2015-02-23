/* See license.txt for terms of usage */

define(function(require, exports, module) {

// Dependencies
const React = require("react");
const { Reps } = require("./reps");
const { OverlayStore } = require("overlay-store");

// Shortcuts
const { SPAN, TABLE, TR, TD, BUTTON, INPUT } = Reps.DOM;

/**
 * TODO docs
 */
var OverlayForm = React.createClass({
  getInitialState: function() {
    return {};
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(nextProps.selection);
  },

  render: function() {
    var overlay = this.state;

    // xxxHonza: localization
    return (
      TABLE({className: "form"},
        TR({},
          TD({className: "right"}, "Opacity:"),
          TD({},
            INPUT({className: "opacity", type: "range", value: overlay.opacity,
              onChange: this.onChange.bind(this, "opacity")})
          ),
          TD({},
            INPUT({className: "opacity-value", size: 3, value: overlay.opacity,
              maxLength: 3,
              onChange: this.onChange.bind(this, "opacity")})
          )
        ),
        TR({},
          TD({className: "right"}, "X:"),
          TD({colSpan: 2},
            INPUT({size: 5, value: overlay.x,
              onChange: this.onChange.bind(this, "x")})
          )
        ),
        TR({},
          TD({className: "right"}, "Y:"),
          TD({colSpan: 2},
            INPUT({size: 5, value: overlay.y,
              onChange: this.onChange.bind(this, "y")})
          )
        ),
        TR({},
          TD({className: "right"}, "Scale:"),
          TD({colSpan: 2},
            INPUT({size: 3, value: overlay.scale,
              onChange: this.onChange.bind(this, "scale")})
          )
        ),
        TR({},
          TD({className: "buttonBar", colSpan: 3},
            BUTTON({id: "hideBtn", onClick: this.props.onToggle}, "Hide"),
            BUTTON({id: "lockBtn", onClick: this.props.onLock}, "Lock"),
            BUTTON({id: "addNewOverlayBtn", onClick: this.props.onAddNewOverlay},
              "Add New Layer")
          )
        )
      )
    )
  },

  // Events

  onChange: function(propName, event) {
    var value = event.target.value;

    this.state[propName] = value;
    this.setState(this.state);

    var props = {};
    props[propName] = value;
    OverlayStore.modify(this.props.selection.id, props);
  },
});

// Exports from this module
exports.OverlayForm = React.createFactory(OverlayForm);
});
