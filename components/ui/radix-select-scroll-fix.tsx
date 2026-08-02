"use client"

import { useEffect, useRef } from "react"

const RADIX_SELECT_CONTENT_SELECTOR =
  "[data-dashboard-select-content][data-state='open']"

function findScrollableAncestor(target: Element): Element {
  let current: Element | null = target

  while (current && current !== document.body && current !== document.documentElement) {
    const style = window.getComputedStyle(current)
    const canScrollY =
      /(auto|scroll|overlay)/.test(style.overflowY) &&
      current.scrollHeight > current.clientHeight
    const canScrollX =
      /(auto|scroll|overlay)/.test(style.overflowX) &&
      current.scrollWidth > current.clientWidth

    if (canScrollY || canScrollX) {
      return current
    }

    current = current.parentElement
  }

  return document.scrollingElement instanceof Element
    ? document.scrollingElement
    : document.documentElement
}

export function RadixSelectScrollLockFix() {
  const originalBodyStylesRef = useRef<
    Record<string, { value: string; priority: string }>
  >({})
  const originalHtmlStylesRef = useRef<
    Record<string, { value: string; priority: string }>
  >({})
  const hasActiveOverrideRef = useRef(false)

  useEffect(() => {
    const clearStaleBodyPointerEvents = () => {
      if (!document.querySelector(RADIX_SELECT_CONTENT_SELECTOR)) {
        document.body.style.removeProperty("pointer-events")
      }
    }

    const rememberStyle = (
      element: HTMLElement,
      property: string,
      cache: React.MutableRefObject<Record<string, { value: string; priority: string }>>,
    ) => {
      if (cache.current[property]) {
        return
      }

      cache.current[property] = {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      }
    }

    const restoreStyles = (
      element: HTMLElement,
      cache: React.MutableRefObject<Record<string, { value: string; priority: string }>>,
    ) => {
      Object.entries(cache.current).forEach(([property, snapshot]) => {
        if (snapshot.value) {
          element.style.setProperty(property, snapshot.value, snapshot.priority)
        } else {
          element.style.removeProperty(property)
        }
      })

      cache.current = {}
    }

    const syncInlineOverride = () => {
      const openSelectContent = document.querySelector(
        RADIX_SELECT_CONTENT_SELECTOR,
      )

      if (openSelectContent) {
        rememberStyle(document.body, "overflow", originalBodyStylesRef)
        rememberStyle(document.body, "margin-right", originalBodyStylesRef)
        rememberStyle(document.body, "padding-right", originalBodyStylesRef)
        rememberStyle(document.documentElement, "overflow", originalHtmlStylesRef)

        document.body.style.setProperty("pointer-events", "auto", "important")
        document.body.style.setProperty("overflow", "auto", "important")
        document.body.style.setProperty("margin-right", "0px", "important")
        document.body.style.setProperty("padding-right", "0px", "important")
        document.documentElement.style.setProperty("overflow", "auto", "important")
        hasActiveOverrideRef.current = true

        return
      }

      if (!hasActiveOverrideRef.current) {
        return
      }

      restoreStyles(document.body, originalBodyStylesRef)
      restoreStyles(document.documentElement, originalHtmlStylesRef)
      clearStaleBodyPointerEvents()
      hasActiveOverrideRef.current = false
    }

    const handleWheelOrTouchMove = (event: WheelEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const openSelectContent = document.querySelector(
        RADIX_SELECT_CONTENT_SELECTOR,
      )
      if (!openSelectContent) {
        return
      }

      if (openSelectContent.contains(target)) {
        return
      }

      if (event instanceof WheelEvent) {
        const scrollTarget = findScrollableAncestor(target)

        scrollTarget.scrollBy({
          top: event.deltaY,
          left: event.deltaX,
          behavior: "auto",
        })

        event.preventDefault()
      }

      // Prevent Radix Select's internal RemoveScroll handlers from cancelling
      // page scroll when the dropdown is open.
      event.stopImmediatePropagation()
    }

    const observer = new MutationObserver(() => {
      syncInlineOverride()
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
      childList: true,
      subtree: true,
    })

    syncInlineOverride()

    document.addEventListener("wheel", handleWheelOrTouchMove, {
      capture: true,
      passive: false,
    })
    document.addEventListener("touchmove", handleWheelOrTouchMove, {
      capture: true,
      passive: false,
    })

    return () => {
      observer.disconnect()
      restoreStyles(document.body, originalBodyStylesRef)
      restoreStyles(document.documentElement, originalHtmlStylesRef)
      clearStaleBodyPointerEvents()
      hasActiveOverrideRef.current = false
      document.removeEventListener("wheel", handleWheelOrTouchMove, {
        capture: true,
      })
      document.removeEventListener("touchmove", handleWheelOrTouchMove, {
        capture: true,
      })
    }
  }, [])

  return null
}
