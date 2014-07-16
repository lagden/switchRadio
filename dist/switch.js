
/*
switch.js - SwitchRadio

It is a plugin that show `radios buttons` like switch

@author      Thiago Lagden <lagden [at] gmail.com>
@copyright   Author
 */
(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(['get-style-property/get-style-property', 'hammerjs/hammer'], factory);
  } else {
    root.Switch = factory(root.getStyleProperty, root.Hammer);
  }
})(this, function(getStyleProperty, Hammer) {
  'use strict';
  var Switch, getTemplate, onEnd, onMove, onTap, toggle, transformProperty;
  transformProperty = getStyleProperty('transform');
  getTemplate = function() {
    return ['<div class="switchRadio__flex">', '<div class="switchRadio__caption switchRadio__caption--on">{captionOn}</div>', '<div class="switchRadio__knob"></div>', '<div class="switchRadio__caption switchRadio__caption--off">{captionOff}</div>', '</div>'].join('');
  };
  toggle = function() {
    var final;
    final = this.side ? -this.size : 0;
    this.sFlex.style[transformProperty] = 'translate3d(' + final + 'px, 0, 0)';
    this.radios[0].checked = !this.side;
    return this.radios[1].checked = this.side;
  };
  onMove = function(event) {
    var v;
    v = this.side ? -this.size + event.deltaX : event.deltaX;
    this.position = Math.min(0, Math.max(-this.size, v));
    this.sFlex.classList.add('is-dragging');
    this.sFlex.style[transformProperty] = 'translate3d(' + this.position + 'px, 0, 0)';
  };
  onEnd = function(event) {
    this.side = Math.abs(this.position) > this.size / 2;
    this.sFlex.classList.remove('is-dragging');
    toggle.bind(this)();
  };
  onTap = function(event) {
    this.side = !this.side;
    return toggle.bind(this)();
  };
  Switch = (function() {
    function Switch(container) {
      if (false === (this instanceof Switch)) {
        return new Switch(container);
      }
      this.container = container;
      this.template = getTemplate();
      this.size = 0;
      this.side = null;
      this.radios = [];
      [].forEach.call(this.container.querySelectorAll('input[type=radio]'), (function(el, idx, arr) {
        this.radios.push(el);
      }).bind(this));
      if (this.radios[0].checked) {
        this.side = false;
      }
      if (this.radios[1].checked) {
        this.side = true;
      }
      return;
    }

    Switch.prototype.build = function(captionOn, captionOff) {
      var content, mc, pan, r, tap;
      r = {
        'captionOn': captionOn,
        'captionOff': captionOff
      };
      content = this.template.replace(/\{(.*?)\}/g, function(a, b) {
        return r[b];
      });
      this.container.insertAdjacentHTML('afterbegin', content);
      this.sFlex = this.container.querySelector('.switchRadio__flex');
      this.sOn = this.container.querySelector('.switchRadio__flex > .switchRadio__caption--on');
      this.sOff = this.container.querySelector('.switchRadio__flex > .switchRadio__caption--off');
      this.knob = this.container.querySelector('.switchRadio__flex > .switchRadio__knob');
      this.size = Math.max(this.sOn.clientWidth, this.sOff.clientWidth);
      this.sOn.style.width = this.sOff.style.width = "" + this.size + "px";
      this.sFlex.style.width = (this.size * 2) + this.knob.clientWidth + 'px';
      this.container.style.width = this.size + this.knob.clientWidth + 'px';
      pan = new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL
      });
      tap = new Hammer.Tap;
      mc = new Hammer.Manager(this.sFlex, {
        touchAction: 'pan-x'
      });
      mc.add(tap);
      mc.add(pan);
      mc.on("tap", onTap.bind(this));
      mc.on("panmove", onMove.bind(this));
      mc.on("panend", onEnd.bind(this));
      mc.on("pancancel", onEnd.bind(this));
      if (this.side !== null) {
        toggle.bind(this)();
      }
    };

    return Switch;

  })();
  return Switch;
});
