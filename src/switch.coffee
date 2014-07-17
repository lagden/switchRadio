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

  # Template
  getTemplate = ->
    [
      '<div class="switchRadio__flex" tabindex="0" role="switch" aria-valueon="{valueon}" aria-valueoff="{valueoff}" aria-valuenow="{valuenow}" aria-labeledby="{labeledby}" aria-required="{required}">'
      '<div class="switchRadio__caption switchRadio__caption--on">{captionOn}</div>'
      '<div class="switchRadio__knob"></div>'
      '<div class="switchRadio__caption switchRadio__caption--off">{captionOff}</div>'
      '</div>'
    ].join ''

  # Event Handlers
  toggle = ->
    @transform.translate.x = if @side then -@size else 0
    @radios[0].checked = !@side
    @radios[1].checked = @side
    @active = true
    @captionsActive()
    @ariaAttr()
    @requestUpdate()
    @container.dispatchEvent @eventSwitched
    radio.dispatchEvent @eventChange for radio in @radios when radio.checked
    return

  onStart = (event) ->
    @sFlex.focus()
    return

  onMove = (event) ->
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

  onEnd = (event) ->
    @side = Boolean Math.abs(@transform.translate.x) > (@size / 2)
    @sFlex.classList.remove 'is-dragging'
    toggle.bind(@)()
    return

  onTap = (event) ->
    @side = !@side
    toggle.bind(@)()
    return

  onKeydown = (event) ->
    switch event.keyCode
      when @keyCodes.enter, @keyCodes.space
        @side = !@side
        toggle.bind(@)()

      when @keyCodes.right
        @side = false
        toggle.bind(@)()

      when @keyCodes.left
        @side = true
        toggle.bind(@)()
    return

  # Master
  class Switch
    constructor: (container, required, labeledby) ->
      labeledby = labeledby || null
      required = required || false

      return new Switch(container, required, labeledby) if false is (@ instanceof Switch)

      @container = container
      @template = getTemplate()
      @size = 0
      @side = null
      @radios = []
      [].forEach.call @container.querySelectorAll('input[type=radio]'), (
        (el, idx, arr) ->
          @radios.push el
          return
        ).bind @

      @side = false if @radios[0].checked
      @side = true if @radios[1].checked

      @active = false

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

      return

    build: (captionOn, captionOff) ->
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
      mc.on 'tap', onTap.bind @
      mc.on 'panstart', onStart.bind @
      mc.on 'pan', onMove.bind @
      mc.on 'panend', onEnd.bind @
      mc.on 'pancancel', onEnd.bind @

      # Keyboard
      @sFlex.addEventListener 'keydown', onKeydown.bind(@), false

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
        toggle.bind(@)()

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
