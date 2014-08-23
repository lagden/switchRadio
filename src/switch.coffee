###
switch.js - SwitchRadio

It is a plugin that show `radios buttons` like slide switch

@author      Thiago Lagden <lagden [at] gmail.com>
@copyright   Author
###

((root, factory) ->
  if typeof define is "function" and define.amd
    define [
        'get-style-property/get-style-property'
        'classie/classie'
        'eventEmitter/EventEmitter'
        'hammerjs/hammer'
      ], factory
  else
    root.SwitchRadio = factory root.getStyleProperty,
                               root.classie,
                               root.EventEmitter,
                               root.Hammer
  return
) @, (getStyleProperty, classie, EventEmitter, Hammer) ->

  'use strict'

  # Transform property cross-browser
  transformProperty = getStyleProperty 'transform'

  # globally unique identifiers
  GUID = 0

  # internal store of all SwitchRadio intances
  instances = {}

  _SPL =
    # Event Handlers
    onToggle: ->

      @toggle()
      @valor = @valorUpdate()
      @eventToggleParam[0].value = @valor
      @.emitEvent 'toggle', @eventToggleParam
      for radio in @radios when radio.checked
        radio.dispatchEvent @eventChange
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
      classie.add @sFlex, 'is-dragging'
      @active = true
      @captionsActive()
      @requestUpdate()
      return

    onEnd: (event) ->
      @side = Boolean Math.abs(@transform.translate.x) > (@size / 2)
      classie.remove @sFlex, 'is-dragging'
      _SPL.onToggle.bind(@)()
      return

    onTap: (event) ->
      if @side == null
        rect = @container.getBoundingClientRect()
        center = rect.left + (rect.width / 2)
        @side = event.center.x < center
      else
        @side = !@side

      _SPL.onToggle.bind(@)()
      return

    onKeydown: (event) ->
      switch event.keyCode
        when @keyCodes.space
          @side = !@side
          _SPL.onToggle.bind(@)()

        when @keyCodes.right
          @side = false
          _SPL.onToggle.bind(@)()

        when @keyCodes.left
          @side = true
          _SPL.onToggle.bind(@)()
      return

    # Template
    getTemplate: ->
      [
        '<div class="switchRadio__flex" '
        'tabindex="0" role="slider" '
        'aria-valuemin="{valuemin}" aria-valuemax="{valuemax}" '
        'aria-valuetext="{valuetext}" aria-valuenow="{valuenow}" '
        'aria-labeledby="{labeledby}" aria-required="{required}">'
        '<div class="switchRadio__caption switchRadio__caption--on">'
        '{captionOn}</div>'
        '<div class="switchRadio__knob"></div>'
        '<div class="switchRadio__caption switchRadio__caption--off">'
        '{captionOff}</div>'
        '</div>'
      ].join ''

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
        'valuemax'    : @aria['aria-valuemax']
        'valuemin'   : @aria['aria-valuemin']
        'valuenow'   : @aria['aria-valuenow']
        'labeledby'  : @aria['aria-labeledby']
        'required'   : @aria['aria-required']

      content = @template.replace /\{(.*?)\}/g, (a, b) ->
        return r[b]

      @container.insertAdjacentHTML 'afterbegin', content

      # Size elements
      @sFlex = @container.querySelector '.switchRadio__flex'
      @sOn   = @sFlex.querySelector '.switchRadio__caption--on'
      @sOff  = @sFlex.querySelector '.switchRadio__caption--off'
      @knob  = @sFlex.querySelector '.switchRadio__knob'

      sizes = @getSizes()

      @size = Math.max sizes.sOn, sizes.sOff

      @sOn.style.width       = @sOff.style.width = "#{@size}px"
      @sFlex.style.width     = (@size * 2) + sizes.knob + 'px'
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
      mc.on 'tap'       , _SPL.onTap.bind(@)
      mc.on 'panstart'  , _SPL.onStart.bind(@)
      mc.on 'pan'       , _SPL.onMove.bind(@)
      mc.on 'panend'    , _SPL.onEnd.bind(@)
      mc.on 'pancancel' , _SPL.onEnd.bind(@)

      # Keyboard
      @sFlex.addEventListener 'keydown', _SPL.onKeydown.bind(@), false

      # Event toggle param
      @eventToggleParam = [
        'instance' : @
        'container': @container
        'radios'   : @radios
        'handler'  : @sFlex
        'value'    : @valor
      ]

      # Event change
      @eventChange = new CustomEvent 'change'

      # Init
      _SPL.onToggle.bind(@)()
      return

    initCheck: (container) ->
      regex = /data-sr(\d+)/i
      attribs = container.attributes
      data = attrib.name for attrib in attribs when regex.test attrib.name
      return true if !!data

  # Master
  class SwitchRadio extends EventEmitter
    constructor: (container, required, labeledby) ->
      # Self instance
      if false is (@ instanceof SwitchRadio)
        return new SwitchRadio(container, required, labeledby)

      labeledby = labeledby || null
      required = required || false

      # Check if component was initialized
      if _SPL.initCheck container
        console.warn 'The component has been initialized.'
        return null
      else
        id = ++GUID
        # Container
        @container = container
        @container.srGUID = id
        instances[id] = @
        container.setAttribute "data-sr#{id}", ''

      # Radios
      @radios = []
      radios = @container.getElementsByTagName 'input'
      for radio, idx in radios when radio.type == 'radio'
        radio.setAttribute 'data-side', idx
        @radios.push radio

      if @radios.length != 2
        console.err '✖ No radios'
        return null

      @template = _SPL.getTemplate()
      @size = 0

      @side = null
      @side = false if @radios[0].checked and !@radios[1].checked
      @side = true  if @radios[1].checked and !@radios[0].checked

      @valor = @valorUpdate()

      @active = false

      # Animation
      @ticking = false
      @transform =
        translate:
          x: 0

      @aria =
        'aria-valuemax'  : @radios[0].title
        'aria-valuemin'  : @radios[1].title
        'aria-valuetext' : null
        'aria-valuenow'  : null
        'aria-labeledby' : labeledby
        'aria-required'  : required

      @keyCodes =
        'space' : 32
        'left'  : 37
        'right' : 39

      _SPL.build.bind(@)()

    toggle: (v) ->

      @side = if v isnt undefined then v else @side

      if @side isnt null
        @active = true
        @transform.translate.x = if @side then -@size else 0

        if @side
          @radios[0].removeAttribute 'checked'
          @radios[0].checked = false
          @radios[1].setAttribute 'checked', ''
          @radios[1].checked = true
        else
          @radios[1].removeAttribute 'checked'
          @radios[1].checked = false
          @radios[0].setAttribute 'checked', ''
          @radios[0].checked = true

      else
        @active = false
        @transform.translate.x = -@size / 2
        for radio in @radios
          radio.removeAttribute 'checked'
          radio.checked = false

      @ariaAttr()
      @captionsActive()
      @requestUpdate()
      return

    swap: (v) ->
      v = if v isnt undefined then v else null
      @side = if v isnt null then !v else !@side
      _SPL.onToggle.bind(@)()
      return

    reset: ->
      @side = null
      _SPL.onToggle.bind(@)()
      return

    getSizes: ->
      clone = @container.cloneNode true
      clone.style.visibility = 'hidden'
      clone.style.position   = 'absolute'
      document.body.appendChild clone

      sOnSelector  = '.switchRadio__flex > .switchRadio__caption--on'
      sOffSelector = '.switchRadio__flex > .switchRadio__caption--off'
      knobSelector = '.switchRadio__flex > .switchRadio__knob'
      sOn  = clone.querySelector sOnSelector
      sOff = clone.querySelector sOffSelector
      knob = clone.querySelector knobSelector

      sizes =
        'sOn': sOn.clientWidth
        'sOff': sOff.clientWidth
        'knob': knob.clientWidth

      document.body.removeChild clone
      clone = null
      return sizes

    ariaAttr: ->
      if @side == null
        v = @side
      else
        v = if @side then @radios[1].title else @radios[0].title
      @sFlex.setAttribute 'aria-valuenow', v
      @sFlex.setAttribute 'aria-valuetext', v
      return

    valorUpdate: ->
      if @side == null
        v = @side
      else
        v = if @side then @radios[1].value else @radios[0].value
      return v

    captionsActive: ->
      method = if @active then 'add' else 'remove'
      classie[method] @sOn, 'is-active'
      classie[method] @sOff, 'is-active'
      return

    updateTransform: ->
      value = ["translate3d(#{@transform.translate.x}px, 0, 0)"]
      @sFlex.style[transformProperty] = value.join " "
      @ticking = false
      return

    requestUpdate: ->
      if @ticking == false
        @ticking = true
        requestAnimationFrame @updateTransform.bind(@)
      return

    destroy: ->
      style = @container.style
      style.width = ''
      @container.removeChild @sFlex
      @container.removeAttribute "data-sr#{@container.srGUID}"
      delete @container.srGUID
      @sFlex = null
      return

  # https://github.com/metafizzy/outlayer/blob/master/outlayer.js#L887
  #
  # get SwitchRadio instance from element
  # @param {Element} el
  # @return {SwitchRadio}
  #
  SwitchRadio.data = (el) ->
    id = el and el.srGUID
    return id and instances[id]

  return SwitchRadio
