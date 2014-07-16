
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
  var Switch, getTemplate, onEnd, onKeydown, onMove, onStart, onTap, toggle, transformProperty;
  transformProperty = getStyleProperty('transform');
  getTemplate = function() {
    return ['<div class="switchRadio__flex" tabindex="0" role="switch" aria-valueon="{valueon}" aria-valueoff="{valueoff}" aria-valuenow="{valuenow}" aria-labeledby="{labeledby}" aria-required="{required}">', '<div class="switchRadio__caption switchRadio__caption--on">{captionOn}</div>', '<div class="switchRadio__knob"></div>', '<div class="switchRadio__caption switchRadio__caption--off">{captionOff}</div>', '</div>'].join('');
  };
  toggle = function() {
    this.transform.translate.x = this.side ? -this.size : 0;
    this.radios[0].checked = !this.side;
    this.radios[1].checked = this.side;
    this.active = true;
    this.captionsActive();
    this.ariaAttr();
    this.requestUpdate();
    this.container.dispatchEvent(this.event);
  };
  onStart = function(event) {
    this.sFlex.focus();
  };
  onMove = function(event) {
    var v;
    if (this.side === null) {
      v = -this.size / 2 + event.deltaX;
    } else {
      v = this.side ? -this.size + event.deltaX : event.deltaX;
    }
    this.transform.translate.x = Math.min(0, Math.max(-this.size, v));
    this.sFlex.classList.add('is-dragging');
    this.active = true;
    this.captionsActive();
    this.requestUpdate();
  };
  onEnd = function(event) {
    this.side = Math.abs(this.transform.translate.x) > this.size / 2;
    this.sFlex.classList.remove('is-dragging');
    toggle.bind(this)();
  };
  onTap = function(event) {
    this.side = !this.side;
    toggle.bind(this)();
  };
  onKeydown = function(event) {
    switch (event.keyCode) {
      case this.keyCodes.enter:
      case this.keyCodes.space:
        this.side = !this.side;
        toggle.bind(this)();
        break;
      case this.keyCodes.right:
        this.side = false;
        toggle.bind(this)();
        break;
      case this.keyCodes.left:
        this.side = true;
        toggle.bind(this)();
    }
  };
  Switch = (function() {
    function Switch(container, required, labeledby) {
      labeledby = labeledby || null;
      required = required || false;
      if (false === (this instanceof Switch)) {
        return new Switch(container, required, labeledby);
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
      this.active = false;
      this.ticking = false;
      this.transform = {
        translate: {
          x: 0
        }
      };
      this.aria = {
        'aria-valueon': this.radios[0].value,
        'aria-valueoff': this.radios[1].value,
        'aria-valuenow': null,
        'aria-labeledby': labeledby,
        'aria-required': required
      };
      this.keyCodes = {
        'enter': 13,
        'space': 32,
        'left': 37,
        'up': 38,
        'right': 39,
        'down': 40
      };
      this.event = new CustomEvent('switched', {
        'detail': {
          'radios': this.radios
        }
      });
      return;
    }

    Switch.prototype.build = function(captionOn, captionOff) {
      var content, mc, pan, r, tap;
      r = {
        'captionOn': captionOn,
        'captionOff': captionOff,
        'valueon': this.aria['aria-valueon'],
        'valueoff': this.aria['aria-valueoff'],
        'valuenow': this.aria['aria-valuenow'],
        'labeledby': this.aria['aria-labeledby'],
        'required': this.aria['aria-required']
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
      this.sFlex.addEventListener('keydown', onKeydown.bind(this), false);
      pan = new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL
      });
      tap = new Hammer.Tap;
      mc = new Hammer.Manager(this.sFlex, {
        dragLockToAxis: true,
        dragBlockHorizontal: true,
        preventDefault: true
      });
      mc.add(tap);
      mc.add(pan);
      mc.on("tap", onTap.bind(this));
      mc.on("panstart", onStart.bind(this));
      mc.on("pan", onMove.bind(this));
      mc.on("panend", onEnd.bind(this));
      mc.on("pancancel", onEnd.bind(this));
      if (this.side === null) {
        this.transform.translate.x = -this.size / 2;
        this.requestUpdate();
      } else {
        toggle.bind(this)();
      }
    };

    Switch.prototype.ariaAttr = function() {
      var v;
      if (this.side === null) {
        v = this.side;
      } else {
        v = this.side ? this.radios[1].value : this.radios[0].value;
      }
      return this.sFlex.setAttribute('aria-valuenow', v);
    };

    Switch.prototype.captionsActive = function() {
      var method;
      method = this.active ? 'add' : 'remove';
      this.sOn.classList[method]('is-active');
      return this.sOff.classList[method]('is-active');
    };

    Switch.prototype.updateTransform = function() {
      var value;
      value = ['translate3d(' + this.transform.translate.x + 'px, 0, 0)'];
      this.sFlex.style[transformProperty] = value.join(" ");
      this.ticking = false;
    };

    Switch.prototype.requestUpdate = function() {
      if (this.ticking === false) {
        this.ticking = true;
        requestAnimationFrame(this.updateTransform.bind(this));
      }
    };

    return Switch;

  })();
  return Switch;
});
