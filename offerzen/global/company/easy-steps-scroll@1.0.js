window.$loaded(function (window, document, $, undefined) {
  const stepsEl = $('[data-js="steps"]')
  const textContentEl = $('[data-js="text-list"]')
  const textListItemEls = textContentEl.find('[data-js="text-list-item"]')
  const imageContentEl = $('[data-js="image-list"]')
  const imageListItemEls = imageContentEl.find('[data-js="image-list-item"]')

  function clamp(val, min = 0, max = 1) {
    return Math.max(min, Math.min(val, max))
  }

  function clampPercent(val, min, max) {
    const clampedVal = clamp(val, min, max)

    const area = max - min
    return (clampedVal - min) / area
  }

  function domain(val, [min, max], [toMin, toMax]) {
    val = clamp(val, min, max)
    const range = ((val - min) / (max - min)) * (toMax - toMin) + toMin
    return range
  }

  function update(index, textNode) {
    const deadZoneAbove = 0 // percent
    const deadZoneBelow = 0.1 // percent
    const textContainerEl = $(textNode)
    const textEl = textContainerEl.find(':first-child') // wrapping div
    const imageEl = $(imageListItemEls[index])
    const imageInnerEl = imageEl.find(':first-child')
    const scrollY = window.scrollY
    const position = textEl.offset().top + textEl.height() / 2 - scrollY // position of middle of content
    const scrollArea = window.innerHeight
    const positionPercent = clamp(position / scrollArea) // percent of text el on screen (0 = top, 1 = bottom)
    const fadeSpeed = 3 // integer, higher is faster
    const scrollSpeed = 3 // integer, higher is faster
    const imageTargetPercent = 0.4
    let adjustedPositionPercent = 1
    let opacity = 0
    let scale = 1

    if (positionPercent < imageTargetPercent) {
      adjustedPositionPercent =
        clampPercent(positionPercent, 0, imageTargetPercent - deadZoneAbove) - 1
      opacity = 1 + adjustedPositionPercent
      scale = Math.pow(domain(opacity, [0, 1], [0.8, 1]), 2)
    } else {
      adjustedPositionPercent = clampPercent(
        positionPercent,
        0.5 + deadZoneBelow,
        1
      )
      adjustedPositionPercent = Math.pow(adjustedPositionPercent, scrollSpeed)
      opacity = 1 - domain(adjustedPositionPercent, [0, 1], [0, 0.6])
    }
    opacity = Math.pow(opacity, fadeSpeed)
    opacity = domain(opacity, [0, 1], [0.3, 1])

    const imageAreaPadding = 20 // move image offscreen by this amount
    const imageOffset = -imageEl.height() / 2 // center image to imageTargetPercent
    const imageArea = scrollArea * (1 - imageTargetPercent)
    const adjustedImageArea = imageArea - imageOffset + imageAreaPadding // account for offset and add some padding
    const imageTarget = scrollArea * imageTargetPercent
    const imagePosition =
      imageTarget + adjustedImageArea * adjustedPositionPercent + imageOffset

    imageEl.css({
      transform: `translate3d(0, ${imagePosition}px, 1px)`,
      opacity
    })
    imageInnerEl.css({
      transform: `scale(${scale})`
    })
  }

  // init
  textListItemEls.each(update)
  window.addEventListener('resize', (e) => textListItemEls.each(update))
  document.addEventListener('scroll', (e) => textListItemEls.each(update))

  stepsEl.addClass('visible')
})
