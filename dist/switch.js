
/*
switch.js - SwitchRadio

It is a plugin that show `radios buttons` like slide switch

@author      Thiago Lagden <lagden [at] gmail.com>
@copyright   Author
 */
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

(function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(['get-style-property/get-style-property', 'classie/classie', 'eventEmitter/EventEmitter', 'hammerjs/hammer'], factory);
  } else {
    root.SwitchRadio = factory(root.getStyleProperty, root.classie, root.EventEmitter, root.Hammer);
  }
})(this, function(getStyleProperty, classie, EventEmitter, Hammer) {
  'use strict';
  var GUID, SwitchRadio, instances, transformProperty, _SPL;
  if (!window.CustomEvent) {
    (function() {
      var CustomEvent;
      CustomEvent = function(event, params) {
        var evt;
        params = params || {
          bubbles: false,
          cancelable: false,
          detail: void 0
        };
        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      };
      CustomEvent.prototype = window.Event.prototype;
      window.CustomEvent = CustomEvent;
    })();
  }
  transformProperty = getStyleProperty('transform');
  GUID = 0;
  instances = {};
  _SPL = {
    onToggle: function() {
      var radio, _i, _len, _ref;
      this.toggle();
      this.emitEvent('toggle', this.eventToggleParam);
      _ref = this.radios;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        radio = _ref[_i];
        if (radio.checked) {
          radio.dispatchEvent(this.eventChange);
        }
      }
    },
    onStart: function(event) {
      this.sFlex.focus();
    },
    onMove: function(event) {
      var v;
      if (this.side === null) {
        v = -this.size / 2 + event.deltaX;
      } else {
        v = this.side ? -this.size + event.deltaX : event.deltaX;
      }
      this.transform.translate.x = Math.min(0, Math.max(-this.size, v));
      classie.add(this.sFlex, 'is-dragging');
      this.active = true;
      this.captionsActive();
      this.requestUpdate();
    },
    onEnd: function(event) {
      this.side = Boolean(Math.abs(this.transform.translate.x) > (this.size / 2));
      classie.remove(this.sFlex, 'is-dragging');
      _SPL.onToggle.bind(this)();
    },
    onTap: function(event) {
      var center, rect;
      if (this.side === null) {
        rect = this.container.getBoundingClientRect();
        center = rect.left + (rect.width / 2);
        this.side = event.center.x < center;
      } else {
        this.side = !this.side;
      }
      _SPL.onToggle.bind(this)();
    },
    onKeydown: function(event) {
      switch (event.keyCode) {
        case this.keyCodes.space:
          this.side = !this.side;
          _SPL.onToggle.bind(this)();
          break;
        case this.keyCodes.right:
          this.side = false;
          _SPL.onToggle.bind(this)();
          break;
        case this.keyCodes.left:
          this.side = true;
          _SPL.onToggle.bind(this)();
      }
    },
    getTemplate: function() {
      return ['<div class="switchRadio__flex" ', 'tabindex="0" role="slider" ', 'aria-valuemin="{valuemin}" aria-valuemax="{valuemax}" ', 'aria-valuetext="{valuetext}" aria-valuenow="{valuenow}" ', 'aria-labeledby="{labeledby}" aria-required="{required}">', '<div class="switchRadio__caption switchRadio__caption--on">', '{captionOn}</div>', '<div class="switchRadio__knob"></div>', '<div class="switchRadio__caption switchRadio__caption--off">', '{captionOff}</div>', '</div>'].join('');
    },
    build: function() {
      var captionOff, captionOn, content, labels, mc, pan, r, sizes, tap;
      captionOn = captionOff = '';
      labels = this.container.getElementsByTagName('label');
      if (labels.length === 2) {
        captionOn = labels[0].textContent;
        captionOff = labels[1].textContent;
      } else {
        console.warn('✖ No labels');
      }
      r = {
        'captionOn': captionOn,
        'captionOff': captionOff,
        'valuemax': this.aria['aria-valuemax'],
        'valuemin': this.aria['aria-valuemin'],
        'valuenow': this.aria['aria-valuenow'],
        'labeledby': this.aria['aria-labeledby'],
        'required': this.aria['aria-required']
      };
      content = this.template.replace(/\{(.*?)\}/g, function(a, b) {
        return r[b];
      });
      this.container.insertAdjacentHTML('afterbegin', content);
      this.sFlex = this.container.querySelector('.switchRadio__flex');
      this.sOn = this.sFlex.querySelector('.switchRadio__caption--on');
      this.sOff = this.sFlex.querySelector('.switchRadio__caption--off');
      this.knob = this.sFlex.querySelector('.switchRadio__knob');
      sizes = this.getSizes();
      this.size = Math.max(sizes.sOn, sizes.sOff);
      this.sOn.style.width = this.sOff.style.width = "" + this.size + "px";
      this.sFlex.style.width = (this.size * 2) + sizes.knob + 'px';
      this.container.style.width = this.size + sizes.knob + 'px';
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
      mc.on('tap', _SPL.onTap.bind(this));
      mc.on('panstart', _SPL.onStart.bind(this));
      mc.on('pan', _SPL.onMove.bind(this));
      mc.on('panend', _SPL.onEnd.bind(this));
      mc.on('pancancel', _SPL.onEnd.bind(this));
      this.sFlex.addEventListener('keydown', _SPL.onKeydown.bind(this), false);
      this.eventToggleParam = [
        {
          'instance': this,
          'container': this.container,
          'radios': this.radios,
          'handler': this.sFlex
        }
      ];
      this.eventChange = new CustomEvent('change');
      _SPL.onToggle.bind(this)();
    },
    initCheck: function(container) {
      var attrib, attribs, data, regex, _i, _len;
      regex = /data-sr(\d+)/i;
      attribs = container.attributes;
      for (_i = 0, _len = attribs.length; _i < _len; _i++) {
        attrib = attribs[_i];
        if (regex.test(attrib.name)) {
          data = attrib.name;
        }
      }
      if (!!data) {
        return true;
      }
    }
  };
  SwitchRadio = (function(_super) {
    __extends(SwitchRadio, _super);

    function SwitchRadio(container, required, labeledby) {
      var id, idx, radio, radios, _i, _len;
      if (false === (this instanceof SwitchRadio)) {
        return new SwitchRadio(container, required, labeledby);
      }
      labeledby = labeledby || null;
      required = required || false;
      if (_SPL.initCheck(container)) {
        console.warn('The component has been initialized.');
        return null;
      } else {
        id = ++GUID;
        this.container = container;
        this.container.srGUID = id;
        instances[id] = this;
        container.setAttribute("data-sr" + id, '');
      }
      this.radios = [];
      radios = this.container.getElementsByTagName('input');
      for (idx = _i = 0, _len = radios.length; _i < _len; idx = ++_i) {
        radio = radios[idx];
        if (!(radio.type === 'radio')) {
          continue;
        }
        radio.setAttribute('data-side', idx);
        this.radios.push(radio);
      }
      if (this.radios.length !== 2) {
        console.err('✖ No radios');
        return null;
      }
      this.template = _SPL.getTemplate();
      this.size = 0;
      this.side = null;
      if (this.radios[0].checked && !this.radios[1].checked) {
        this.side = false;
      }
      if (this.radios[1].checked && !this.radios[0].checked) {
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
        'aria-valuemax': this.radios[0].title,
        'aria-valuemin': this.radios[1].title,
        'aria-valuetext': null,
        'aria-valuenow': null,
        'aria-labeledby': labeledby,
        'aria-required': required
      };
      this.keyCodes = {
        'space': 32,
        'left': 37,
        'right': 39
      };
      _SPL.build.bind(this)();
    }

    SwitchRadio.prototype.toggle = function(v) {
      var radio, _i, _len, _ref;
      this.side = v !== void 0 ? v : this.side;
      if (this.side !== null) {
        this.active = true;
        this.transform.translate.x = this.side ? -this.size : 0;
        if (this.side) {
          this.radios[0].removeAttribute('checked');
          this.radios[0].checked = false;
          this.radios[1].setAttribute('checked', '');
          this.radios[1].checked = true;
        } else {
          this.radios[1].removeAttribute('checked');
          this.radios[1].checked = false;
          this.radios[0].setAttribute('checked', '');
          this.radios[0].checked = true;
        }
      } else {
        this.active = false;
        this.transform.translate.x = -this.size / 2;
        _ref = this.radios;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          radio = _ref[_i];
          radio.removeAttribute('checked');
          radio.checked = false;
        }
      }
      this.ariaAttr();
      this.captionsActive();
      this.requestUpdate();
    };

    SwitchRadio.prototype.swap = function(v) {
      v = v !== void 0 ? v : null;
      this.side = v !== null ? !v : !this.side;
      _SPL.onToggle.bind(this)();
    };

    SwitchRadio.prototype.reset = function() {
      this.side = null;
      _SPL.onToggle.bind(this)();
    };

    SwitchRadio.prototype.getSizes = function() {
      var clone, knob, knobSelector, sOff, sOffSelector, sOn, sOnSelector, sizes;
      clone = this.container.cloneNode(true);
      clone.style.visibility = 'hidden';
      clone.style.position = 'absolute';
      document.body.appendChild(clone);
      sOnSelector = '.switchRadio__flex > .switchRadio__caption--on';
      sOffSelector = '.switchRadio__flex > .switchRadio__caption--off';
      knobSelector = '.switchRadio__flex > .switchRadio__knob';
      sOn = clone.querySelector(sOnSelector);
      sOff = clone.querySelector(sOffSelector);
      knob = clone.querySelector(knobSelector);
      sizes = {
        'sOn': sOn.clientWidth,
        'sOff': sOff.clientWidth,
        'knob': knob.clientWidth
      };
      document.body.removeChild(clone);
      clone = null;
      return sizes;
    };

    SwitchRadio.prototype.ariaAttr = function() {
      var v;
      if (this.side === null) {
        v = this.side;
      } else {
        v = this.side ? this.radios[1].title : this.radios[0].title;
      }
      this.sFlex.setAttribute('aria-valuenow', v);
      this.sFlex.setAttribute('aria-valuetext', v);
    };

    SwitchRadio.prototype.captionsActive = function() {
      var method;
      method = this.active ? 'add' : 'remove';
      classie[method](this.sOn, 'is-active');
      classie[method](this.sOff, 'is-active');
    };

    SwitchRadio.prototype.updateTransform = function() {
      var value;
      value = ["translate3d(" + this.transform.translate.x + "px, 0, 0)"];
      this.sFlex.style[transformProperty] = value.join(" ");
      this.ticking = false;
    };

    SwitchRadio.prototype.requestUpdate = function() {
      if (this.ticking === false) {
        this.ticking = true;
        requestAnimationFrame(this.updateTransform.bind(this));
      }
    };

    SwitchRadio.prototype.destroy = function() {
      var style;
      style = this.container.style;
      style.width = '';
      this.container.removeChild(this.sFlex);
      this.container.removeAttribute("data-sr" + this.container.srGUID);
      delete this.container.srGUID;
      this.sFlex = null;
    };

    return SwitchRadio;

  })(EventEmitter);
  SwitchRadio.data = function(el) {
    var id;
    id = el && el.srGUID;
    return id && instances[id];
  };
  return SwitchRadio;
});
