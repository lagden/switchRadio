
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
  var Switch, transformProperty, _privados;
  transformProperty = getStyleProperty('transform');
  _privados = {
    getTemplate: function() {
      return ['<div class="switchRadio__flex" tabindex="0" role="switch" aria-valueon="{valueon}" aria-valueoff="{valueoff}" aria-valuenow="{valuenow}" aria-labeledby="{labeledby}" aria-required="{required}">', '<div class="switchRadio__caption switchRadio__caption--on">{captionOn}</div>', '<div class="switchRadio__knob"></div>', '<div class="switchRadio__caption switchRadio__caption--off">{captionOff}</div>', '</div>'].join('');
    },
    toggle: function() {
      var radio, _i, _j, _len, _len1, _ref, _ref1;
      if (this.side !== null) {
        this.active = true;
        this.transform.translate.x = this.side ? -this.size : 0;
        if (this.side) {
          this.radios[0].removeAttribute('checked');
          this.radios[1].setAttribute('checked', '');
        } else {
          this.radios[1].removeAttribute('checked');
          this.radios[0].setAttribute('checked', '');
        }
      } else {
        this.active = false;
        this.transform.translate.x = -this.size / 2;
        _ref = this.radios;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          radio = _ref[_i];
          radio.removeAttribute('checked');
        }
      }
      this.ariaAttr();
      this.captionsActive();
      this.requestUpdate();
      this.container.dispatchEvent(this.eventToggle);
      _ref1 = this.radios;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        radio = _ref1[_j];
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
      console.log(event.deltaX);
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
    },
    onEnd: function(event) {
      this.side = Boolean(Math.abs(this.transform.translate.x) > (this.size / 2));
      this.sFlex.classList.remove('is-dragging');
      _privados.toggle.bind(this)();
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
      _privados.toggle.bind(this)();
    },
    onKeydown: function(event) {
      switch (event.keyCode) {
        case this.keyCodes.enter:
        case this.keyCodes.space:
          this.side = !this.side;
          _privados.toggle.bind(this)();
          break;
        case this.keyCodes.right:
          this.side = false;
          _privados.toggle.bind(this)();
          break;
        case this.keyCodes.left:
          this.side = true;
          _privados.toggle.bind(this)();
      }
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
      mc.on('tap', _privados.onTap.bind(this));
      mc.on('panstart', _privados.onStart.bind(this));
      mc.on('pan', _privados.onMove.bind(this));
      mc.on('panend', _privados.onEnd.bind(this));
      mc.on('pancancel', _privados.onEnd.bind(this));
      this.sFlex.addEventListener('keydown', _privados.onKeydown.bind(this), false);
      this.eventToggle = new CustomEvent('switch:toggle', {
        'detail': {
          'radios': this.radios,
          'handler': this.sFlex
        }
      });
      this.eventChange = new Event('change');
      _privados.toggle.bind(this)();
    },
    initCheck: function(container) {
      var attrib, attribs, data, regex, _i, _len;
      regex = /data-switcher-(\d+)/i;
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
  Switch = (function() {
    function Switch(container, required, labeledby) {
      var radio, radios, _i, _len;
      if (false === (this instanceof Switch)) {
        return new Switch(container, required, labeledby);
      }
      labeledby = labeledby || null;
      required = required || false;
      if (_privados.initCheck(container)) {
        console.warn('The component has been initialized.');
        return null;
      } else {
        container.setAttribute('data-switcher-' + new Date().getTime(), '');
      }
      this.container = container;
      this.radios = [];
      radios = this.container.getElementsByTagName('input');
      for (_i = 0, _len = radios.length; _i < _len; _i++) {
        radio = radios[_i];
        if (radio.type === 'radio') {
          this.radios.push(radio);
        }
      }
      if (this.radios.length !== 2) {
        console.err('✖ No radios');
        return null;
      }
      this.template = _privados.getTemplate();
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
      _privados.build.bind(this)();
      return;
    }

    Switch.prototype.reset = function() {
      this.side = null;
      return _privados.toggle.bind(this)();
    };

    Switch.prototype.getSizes = function() {
      var clone, knob, sOff, sOn, sizes;
      clone = this.container.cloneNode(true);
      clone.style.visibility = 'hidden';
      clone.style.position = 'absolute';
      document.body.appendChild(clone);
      sOn = clone.querySelector('.switchRadio__flex > .switchRadio__caption--on');
      sOff = clone.querySelector('.switchRadio__flex > .switchRadio__caption--off');
      knob = clone.querySelector('.switchRadio__flex > .switchRadio__knob');
      sizes = {
        'sOn': sOn.clientWidth,
        'sOff': sOff.clientWidth,
        'knob': knob.clientWidth
      };
      clone.remove();
      return sizes;
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
