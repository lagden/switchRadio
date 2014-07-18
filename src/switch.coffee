###
switch.js - SwitchRadio

It is a plugin that show `radios buttons` like switch

@author      Thiago Lagden <lagden [at] gmail.com>
@copyright   Author
###

((root, factory) ->
  if typeof define is "function" and define.amd
    define ['get-style-property/get-style-property', 'hammerjs/hammer'], factory
  else
    root.Switch = factory root.getStyleProperty, root.Hammer
  return
) @, (getStyleProperty, Hammer) ->

  'use strict'

  transformProperty = getStyleProperty 'transform'

  _privados =
      # Template
      getTemplate: ->
        [
          '<div class="switchRadio__flex" tabindex="0" role="switch" aria-valueon="{valueon}" aria-valueoff="{valueoff}" aria-valuenow="{valuenow}" aria-labeledby="{labeledby}" aria-required="{required}">'
          '<div class="switchRadio__caption switchRadio__caption--on">{captionOn}</div>'
          '<div class="switchRadio__knob"></div>'
          '<div class="switchRadio__caption switchRadio__caption--off">{captionOff}</div>'
          '</div>'
        ].join ''

      # Event Handlers
      toggle: ->
        @transform.translate.x = if @side then -@size else 0

        if @side != null
            @radios[0].checked = !@side
            @radios[1].checked = @side
            @active = true
        else
            @active =
            @radios[0].checked =
            @radios[1].checked = false

        @captionsActive()
        @ariaAttr()
        @requestUpdate()
        @container.dispatchEvent @eventSwitched
        radio.dispatchEvent @eventChange for radio in @radios when radio.checked
        return

      onStart: (event) ->
        @sFlex.focus()
        return

      onMove: (event) ->
        if @side == null
          v = -@size/2 + event.deltaX
        else
          v = if @side then -@size + event.deltaX else event.deltaX

        @transform.translate.x = Math.min 0, Math.max -@size, v
        @sFlex.classList.add 'is-dragging'
        @active = true
        @captionsActive()
        @requestUpdate()
        return

      onEnd: (event) ->
        @side = Boolean Math.abs(@transform.translate.x) > (@size / 2)
        @sFlex.classList.remove 'is-dragging'
        _privados.toggle.bind(@)()
        return

      onTap: (event) ->
        @side = !@side
        _privados.toggle.bind(@)()
        return

      onKeydown: (event) ->
        switch event.keyCode
          when @keyCodes.enter, @keyCodes.space
            @side = !@side
            _privados.toggle.bind(@)()

          when @keyCodes.right
            @side = false
            _privados.toggle.bind(@)()

          when @keyCodes.left
            @side = true
            _privados.toggle.bind(@)()
        return

      build: () ->
        captionOn = captionOff = ''

        labels = @container.getElementsByTagName 'label'
        if labels.length == 2
          captionOn  = labels[0].textContent
          captionOff = labels[1].textContent
        else
          console.warn '✖ No labels'

        # Template Render
        r =
          'captionOn'  : captionOn
          'captionOff' : captionOff
          'valueon'    : @aria['aria-valueon']
          'valueoff'   : @aria['aria-valueoff']
          'valuenow'   : @aria['aria-valuenow']
          'labeledby'  : @aria['aria-labeledby']
          'required'   : @aria['aria-required']

        content = @template.replace /\{(.*?)\}/g, (a, b) ->
          return r[b]

        @container.insertAdjacentHTML 'afterbegin', content

        # Size elements
        @sFlex = @container.querySelector '.switchRadio__flex'
        @sOn   = @container.querySelector '.switchRadio__flex > .switchRadio__caption--on'
        @sOff  = @container.querySelector '.switchRadio__flex > .switchRadio__caption--off'
        @knob  = @container.querySelector '.switchRadio__flex > .switchRadio__knob'

        sizes = @getSizes()

        @size = Math.max sizes.sOn, sizes.sOff

        @sOn.style.width = @sOff.style.width = "#{@size}px"
        @sFlex.style.width = (@size * 2) + sizes.knob + 'px'
        @container.style.width = @size + sizes.knob + 'px'

        # Drag
        pan = new Hammer.Pan direction: Hammer.DIRECTION_HORIZONTAL
        tap = new Hammer.Tap

        mc = new Hammer.Manager @sFlex,
          dragLockToAxis: true
          dragBlockHorizontal: true
          preventDefault: true

        mc.add tap
        mc.add pan
        mc.on 'tap'       , _privados.onTap.bind(@)
        mc.on 'panstart'  , _privados.onStart.bind(@)
        mc.on 'pan'       , _privados.onMove.bind(@)
        mc.on 'panend'    , _privados.onEnd.bind(@)
        mc.on 'pancancel' , _privados.onEnd.bind(@)

        # Keyboard
        @sFlex.addEventListener 'keydown', _privados.onKeydown.bind(@), false

        xxx = (event) ->
            console.log('xxx')

        for radio in @radios
            radio.addEventListener 'input', xxx.bind(@), false

        # Custom events
        @eventSwitched = new CustomEvent 'switched',
          'detail':
            'radios': @radios
            'handler': @sFlex

        @eventChange = new CustomEvent 'change'

        # Init
        if @side == null
          @transform.translate.x = -@size / 2
          @requestUpdate()
        else
          _privados.toggle.bind(@)()

        return

      initCheck: (container) ->
        regex = /data-switcher-(\d+)/i
        attribs = container.attributes
        data = attrib.name for attrib in attribs when regex.test attrib.name
        return true if !!data

  # Master
  class Switch
    constructor: (container, required, labeledby) ->

      # Self instance
      return new Switch(container, required, labeledby) if false is (@ instanceof Switch)

      labeledby = labeledby || null
      required = required || false

      # Check if component was initialized
      if _privados.initCheck container
        console.warn 'The component has been initialized.'
        return null
      else
        container.setAttribute 'data-switcher-' + new Date().getTime(), ''

      # Container
      @container = container

      # Radios
      @radios = []
      radios = @container.getElementsByTagName 'input'
      @radios.push radio for radio in radios when radio.type == 'radio'
      if @radios.length != 2
        console.err '✖ No radios'
        return null

      @template = _privados.getTemplate()
      @size = 0

      @side = null
      @side = false if @radios[0].checked
      @side = true if @radios[1].checked

      @active = false

      # Animation
      @ticking = false
      @transform =
        translate:
          x: 0

      @aria =
        'aria-valueon'   : @radios[0].value
        'aria-valueoff'  : @radios[1].value
        'aria-valuenow'  : null
        'aria-labeledby' : labeledby
        'aria-required'  : required

      @keyCodes =
        'enter' : 13
        'space' : 32
        'left'  : 37
        'up'    : 38
        'right' : 39
        'down'  : 40

      _privados.build.bind(@)()

      return

    getSizes: ->
      clone = @container.cloneNode true
      clone.style.visibility = 'hidden'
      clone.style.position = 'absolute'
      document.body.appendChild clone
      sOn   = clone.querySelector '.switchRadio__flex > .switchRadio__caption--on'
      sOff  = clone.querySelector '.switchRadio__flex > .switchRadio__caption--off'
      knob  = clone.querySelector '.switchRadio__flex > .switchRadio__knob'
      sizes =
        'sOn': sOn.clientWidth
        'sOff': sOff.clientWidth
        'knob': knob.clientWidth
      clone.remove()
      return sizes

    ariaAttr: ->
      if @side == null
        v = @side
      else
        v = if @side then @radios[1].value else @radios[0].value
      @sFlex.setAttribute 'aria-valuenow', v

    captionsActive: ->
      method = if @active then 'add' else 'remove'
      @sOn.classList[method] 'is-active'
      @sOff.classList[method] 'is-active'

    updateTransform: ->
      value = ['translate3d(' + @transform.translate.x + 'px, 0, 0)']
      @sFlex.style[transformProperty] = value.join " "
      @ticking = false
      return

    requestUpdate: ->
      if @ticking == false
        @ticking = true
        requestAnimationFrame @updateTransform.bind(@)
      return

  return Switch
