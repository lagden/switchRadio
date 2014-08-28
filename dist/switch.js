
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
  transformProperty = getStyleProperty('transform');
  GUID = 0;
  instances = {};
  _SPL = {
    getTemplate: function() {
      return ['<div class="switchRadio__flex">', '<div class="switchRadio__caption switchRadio__caption--off">', '{captionOff}</div>', '<div class="switchRadio__knob"></div>', '<div class="switchRadio__caption switchRadio__caption--on">', '{captionOn}</div>', '</div>'].join('');
    },
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
      classie.add(this.sFlex, 'is-dragging');
    },
    onMove: function(event) {
      var v;
      v = -this.size / 2 + event.deltaX;
      if (this.ligado !== null) {
        v = this.ligado ? -this.size + event.deltaX : event.deltaX;
      }
      this.transform.translate.x = Math.min(0, Math.max(-this.size, v));
      this.updatePosition();
    },
    onEnd: function(event) {
      this.ligado = Math.abs(this.transform.translate.x) > (this.size / 2);
      classie.remove(this.sFlex, 'is-dragging');
      _SPL.onToggle.call(this);
    },
    onTap: function(event) {
      var center, rect;
      rect = this.container.getBoundingClientRect();
      center = rect.left + (rect.width / 2);
      this.ligado = event.center.x < center;
      _SPL.onToggle.call(this);
    },
    onKeydown: function(event) {
      var dispara;
      dispara = false;
      switch (event.keyCode) {
        case this.keyCodes.space:
          this.ligado = !this.ligado;
          dispara = true;
          break;
        case this.keyCodes.right:
          this.ligado = false;
          dispara = true;
          break;
        case this.keyCodes.left:
          this.ligado = true;
          dispara = true;
      }
      if (dispara) {
        _SPL.onToggle.call(this);
      }
    },
    checked: function(radio) {
      radio.setAttribute('checked', '');
      radio.checked = true;
    },
    unchecked: function(radio) {
      radio.removeAttribute('checked');
      radio.checked = false;
    },
    build: function() {
      var attrib, captionOff, captionOn, content, labels, pan, r, sizes, tap, value, _ref;
      captionOn = captionOff = '';
      labels = this.container.getElementsByTagName('label');
      if (labels.length === 2) {
        captionOff = labels[0].textContent;
        captionOn = labels[1].textContent;
      } else {
        console.warn('✖ No labels');
      }
      r = {
        'captionOn': captionOn,
        'captionOff': captionOff
      };
      content = this.template.replace(/\{(.*?)\}/g, function(a, b) {
        return r[b];
      });
      this.container.insertAdjacentHTML('afterbegin', content);
      this.elements = [];
      sizes = this.getSizes();
      this.size = Math.max(sizes.sOn, sizes.sOff);
      this.sFlex = this.container.querySelector('.switchRadio__flex');
      this.sOn = this.sFlex.querySelector('.switchRadio__caption--on');
      this.sOff = this.sFlex.querySelector('.switchRadio__caption--off');
      this.knob = this.sFlex.querySelector('.switchRadio__knob');
      this.elements.push(this.sFlex);
      this.sOn.style.width = this.sOff.style.width = "" + this.size + "px";
      this.sFlex.style.width = (this.size * 2) + sizes.knob + 'px';
      this.container.style.width = this.size + sizes.knob + 'px';
      _ref = this.aria;
      for (attrib in _ref) {
        value = _ref[attrib];
        this.sFlex.setAttribute(attrib, value);
      }
      tap = new Hammer.Tap;
      this.mc = new Hammer.Manager(this.container, {
        dragLockToAxis: true,
        dragBlockHorizontal: true,
        preventDefault: true
      });
      this.mc.add(tap);
      this.mc.on('tap', _SPL.onTap.bind(this));
      pan = new Hammer.Pan({
        direction: Hammer.DIRECTION_HORIZONTAL
      });
      this.mk = new Hammer.Manager(this.sFlex, {
        dragLockToAxis: true,
        dragBlockHorizontal: true,
        preventDefault: true
      });
      this.mk.add(pan);
      this.mk.on('panstart', _SPL.onStart.bind(this));
      this.mk.on('pan', _SPL.onMove.bind(this));
      this.mk.on('panend', _SPL.onEnd.bind(this));
      this.mk.on('pancancel', _SPL.onEnd.bind(this));
      this.eventCall = {
        'keydown': _SPL.onKeydown.bind(this)
      };
      this.sFlex.addEventListener('keydown', this.eventCall.keydown);
      this.eventToggleParam = [
        {
          'instance': this,
          'container': this.container,
          'radios': this.radios,
          'value': this.valor
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
        return;
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
        return;
      }
      this.template = _SPL.getTemplate();
      this.size = 0;
      this.ligado = null;
      if (this.radios[0].checked && !this.radios[1].checked) {
        this.ligado = false;
      }
      if (this.radios[1].checked && !this.radios[0].checked) {
        this.ligado = true;
      }
      this.valor = null;
      this.updateValor();
      this.active = false;
      this.transform = {
        translate: {
          x: 0
        }
      };
      this.keyCodes = {
        'space': 32,
        'left': 37,
        'right': 39
      };
      this.aria = {
        'tabindex': 0,
        'role': 'slider',
        'aria-valuemin': this.radios[0].title,
        'aria-valuemax': this.radios[1].title,
        'aria-valuetext': null,
        'aria-valuenow': null,
        'aria-labeledby': labeledby,
        'aria-required': required
      };
      _SPL.build.bind(this)();
    }

    SwitchRadio.prototype.toggle = function(v) {
      var a, b, radio, _i, _len, _ref;
      v = v || false;
      if (v !== false) {
        this.ligado = v;
      }
      if (this.ligado !== null) {
        this.active = true;
        this.transform.translate.x = this.ligado ? -this.size : 0;
        a = this.ligado ? 1 : 0;
        b = a ^ 1;
        _SPL.checked(this.radios[a]);
        _SPL.unchecked(this.radios[b]);
      } else {
        this.active = false;
        this.transform.translate.x = -this.size / 2;
        _ref = this.radios;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          radio = _ref[_i];
          _SPL.unchecked(radio);
        }
      }
      this.isActive();
      this.updateAria();
      this.updateValor();
      this.updatePosition();
    };

    SwitchRadio.prototype.swap = function(v) {
      if (v != null) {
        this.ligado = v;
      }
      this.ligado = !this.ligado;
      _SPL.onToggle.bind(this)();
    };

    SwitchRadio.prototype.reset = function() {
      this.ligado = null;
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

    SwitchRadio.prototype.isActive = function() {
      var method;
      method = this.active ? 'add' : 'remove';
      classie[method](this.sOn, 'is-active');
      classie[method](this.sOff, 'is-active');
    };

    SwitchRadio.prototype.updateAria = function() {
      var v;
      if (this.ligado !== null) {
        v = this.ligado === true ? this.radios[1].title : this.radios[0].title;
        this.container.setAttribute('aria-valuenow', v);
        this.container.setAttribute('aria-valuetext', v);
      }
    };

    SwitchRadio.prototype.updateValor = function() {
      this.valor = null;
      if (this.ligado !== null) {
        this.valor = this.ligado === true ? this.radios[1].value : this.radios[0].value;
      }
      if (this.eventToggleParam != null) {
        this.eventToggleParam[0].value = this.valor;
      }
    };

    SwitchRadio.prototype.updatePosition = function() {
      var value;
      value = ["translate3d(" + this.transform.translate.x + "px, 0, 0)"];
      this.sFlex.style[transformProperty] = value.join(" ");
    };

    SwitchRadio.prototype.destroy = function() {
      var el, radio, _i, _j, _len, _len1, _ref, _ref1;
      if (this.container !== null) {
        _ref = this.radios;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          radio = _ref[_i];
          radio.removeAttribute('data-side');
        }
        this.sFlex.removeEventListener('keydown', this.eventCall.keydown);
        this.mk.destroy();
        this.mc.destroy();
        _ref1 = this.elements;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          el = _ref1[_j];
          this.container.removeChild(el);
        }
        this.container.removeAttribute("class");
        this.container.removeAttribute("style");
        this.container.removeAttribute("data-sr" + this.container.srGUID);
        delete this.container.srGUID;
        this.container = null;
      }
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
