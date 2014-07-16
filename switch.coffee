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
    root.Switch = factory(root.getStyleProperty, root.Hammer)
  return
) @, (getStyleProperty, Hammer) ->

  'use strict'

  transformProperty = getStyleProperty 'transform'

  getTemplate = ->
    [
      '<div class="switchRadio__flex">'
      '<div class="switchRadio__caption switchRadio__caption--on">{captionOn}</div>'
      '<div class="switchRadio__knob"></div>'
      '<div class="switchRadio__caption switchRadio__caption--off">{captionOff}</div>'
      '</div>'
    ].join ''

  toggle = ->
    final = if @side then -@size else 0
    @sFlex.style[transformProperty] = 'translate3d(' + final + 'px, 0, 0)'
    @radios[0].checked = !@side
    @radios[1].checked = @side

  onMove = (event) ->
    v = if @side then -@size + event.deltaX else event.deltaX
    @position = Math.min 0, Math.max(-@size, v)
    @sFlex.classList.add 'is-dragging'
    @sFlex.style[transformProperty] = 'translate3d(' + @position + 'px, 0, 0)'
    return

  onEnd = (event) ->
    @side = Math.abs(@position) > @size / 2
    @sFlex.classList.remove 'is-dragging'
    toggle.bind(@)()
    return

  onTap = (event) ->
    @side = !@side
    toggle.bind(@)()

  class Switch
    constructor: (container) ->
      return new Switch(container) if false is (@ instanceof Switch)
      @container = container
      @template = getTemplate()
      @size = 0
      @side = null
      @radios = []
      [].forEach.call @container.querySelectorAll('input[type=radio]'), (
        (el, idx, arr) ->
          @radios.push(el);
          return
        ).bind @

      @side = false if @radios[0].checked
      @side = true if @radios[1].checked

      return

    build: (captionOn, captionOff) ->
      r = {
        'captionOn': captionOn
        'captionOff': captionOff
      }
      content = @template.replace /\{(.*?)\}/g, (a, b) ->
        return r[b]

      @container.insertAdjacentHTML 'afterbegin', content

      @sFlex = @container.querySelector '.switchRadio__flex'
      @sOn   = @container.querySelector '.switchRadio__flex > .switchRadio__caption--on'
      @sOff  = @container.querySelector '.switchRadio__flex > .switchRadio__caption--off'
      @knob  = @container.querySelector '.switchRadio__flex > .switchRadio__knob'

      @size = Math.max @sOn.clientWidth, @sOff.clientWidth

      @sOn.style.width = @sOff.style.width = "#{@size}px"
      @sFlex.style.width = (@size * 2) + @knob.clientWidth + 'px'
      @container.style.width = @size + @knob.clientWidth + 'px'

      pan = new Hammer.Pan { direction: Hammer.DIRECTION_HORIZONTAL }
      tap = new Hammer.Tap

      mc = new Hammer.Manager @sFlex, { touchAction: 'pan-x'}
      mc.add tap
      mc.add pan
      mc.on "tap", onTap.bind(@)
      mc.on "panmove", onMove.bind(@)
      mc.on "panend", onEnd.bind(@)
      mc.on "pancancel", onEnd.bind(@)

      if @side != null
        toggle.bind(@)()

      return

  return Switch
