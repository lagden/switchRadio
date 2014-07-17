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
    require('switch')(el, false, el.previousElementSibling.id);
});
```

**Global**

```javascript
[].forEach.call(document.querySelectorAll('.switchRadio'), function(el, idx, arr) {
    new Switch(el, false, el.previousElementSibling.id);
});
```

## Author

[Thiago Lagden](http://lagden.in)

## Contributors

- [Felquis Gimenes](https://github.com/felquis)