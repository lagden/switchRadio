switch.js - Switch button
==================================

It is a plugin that show `radios buttons` like switch

### Usage

**Markup**

```html
<div class="switchRadio">
    <label for="sim">Sim</label>
    <input id="sim" type="radio" title="Sim" name="grupo" value="s">
    <label for="nao">Não</label>
    <input id="nao" type="radio" title="Não" name="grupo" value="n">
</div>
```

**RequireJS**

```javascript
[].forEach.call(document.querySelectorAll('.switchRadio'), function(el, idx, arr) {
    var switchRadio = require('switch')(el);
    var labels = el.getElementsByTagName('label');
    switchRadio.build(labels[0].textContent, labels[1].textContent);
});
```

**Global**

```javascript
[].forEach.call(document.querySelectorAll('.switchRadio'), function(el, idx, arr) {
    var switchRadio = new Switch(el);
    var labels = el.getElementsByTagName('label');
    switchRadio.build(labels[0].textContent, labels[1].textContent);
});
```

### Author

[Thiago Lagden](http://lagden.in)