switch.js - Switch button
==================================

It is a plugin that show `radios buttons` like switch

## Installation

    bower install switch-radio

## Usage

**Markup**

```html
<div id="labelSwitch">Did you think cool?</div>
<div class="switchRadio">
    <label for="sim">Yep</label>
    <input id="sim" type="radio" title="Yep" name="switch" value="s">
    <label for="nao">Nope</label>
    <input id="nao" type="radio" title="Nope" name="switch" value="n">
</div>
```

**RequireJS**

```javascript
[].forEach.call(document.querySelectorAll('.switchRadio'), function(el, idx, arr) {
    var switchRadio = require('switch')(el, false, el.previousElementSibling.id);
    var labels = el.getElementsByTagName('label');
    switchRadio.build(labels[0].textContent, labels[1].textContent);
});
```

**Global**

```javascript
[].forEach.call(document.querySelectorAll('.switchRadio'), function(el, idx, arr) {
    var switchRadio = new Switch(el, false, el.previousElementSibling.id);
    var labels = el.getElementsByTagName('label');
    switchRadio.build(labels[0].textContent, labels[1].textContent);
});
```

### Author

[Thiago Lagden](http://lagden.in)