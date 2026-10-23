import './App.css'
import { useEffect, useRef, useState } from 'react'

function App() {
  const courtRef = useRef(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [moveHistory, setMoveHistory] = useState([])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullScreenChange
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullScreenChange
      )
    }
  }, [])

  const handlePointerDown = (event) => {
    const item = event.currentTarget
    const boundary = courtRef.current

    if (!boundary) {
      return
    }

    item.setPointerCapture(event.pointerId)

    const startX = event.clientX
    const startY = event.clientY

    const startingItemRect = item.getBoundingClientRect()

    const startingCenterX =
      startingItemRect.left + startingItemRect.width / 2

    const startingCenterY =
      startingItemRect.top + startingItemRect.height / 2

    const previousPosition = {
      id: item.id,
      left: item.style.left,
      top: item.style.top,
      right: item.style.right,
      bottom: item.style.bottom,
      transform: item.style.transform,
    }

    let moveRecorded = false

    const handlePointerMove = (moveEvent) => {
      if (!moveRecorded) {
        setMoveHistory((currentHistory) => [
          ...currentHistory,
          previousPosition,
        ])

        moveRecorded = true
      }

      const boundaryRect = boundary.getBoundingClientRect()
      const parentRect =
        item.offsetParent.getBoundingClientRect()

      const itemHalfWidth = startingItemRect.width / 2
      const itemHalfHeight = startingItemRect.height / 2

      const proposedCenterX =
        startingCenterX + moveEvent.clientX - startX

      const proposedCenterY =
        startingCenterY + moveEvent.clientY - startY

      const boundedCenterX = Math.min(
        Math.max(
          proposedCenterX,
          boundaryRect.left + itemHalfWidth
        ),
        boundaryRect.right - itemHalfWidth
      )

      const boundedCenterY = Math.min(
        Math.max(
          proposedCenterY,
          boundaryRect.top + itemHalfHeight
        ),
        boundaryRect.bottom - itemHalfHeight
      )

      item.style.left = `${boundedCenterX - parentRect.left}px`
      item.style.top = `${boundedCenterY - parentRect.top}px`
      item.style.right = 'auto'
      item.style.bottom = 'auto'
      item.style.transform = 'translate(-50%, -50%)'
    }

    const stopDragging = () => {
      item.removeEventListener(
        'pointermove',
        handlePointerMove
      )

      item.removeEventListener(
        'pointerup',
        stopDragging
      )

      item.removeEventListener(
        'pointercancel',
        stopDragging
      )
    }

    item.addEventListener(
      'pointermove',
      handlePointerMove
    )

    item.addEventListener(
      'pointerup',
      stopDragging
    )

    item.addEventListener(
      'pointercancel',
      stopDragging
    )
  }

  const resetMarker = (markerId) => {
    const marker = document.getElementById(markerId)

    if (!marker) {
      return
    }

    marker.style.left = ''
    marker.style.top = ''
    marker.style.right = ''
    marker.style.bottom = ''
    marker.style.transform = ''
  }

  const resetAll = () => {
    resetMarker('r1')
    resetMarker('r2')
    resetMarker('lj1')
    resetMarker('lj2')
    resetMarker('ball')

    setMoveHistory([])
  }

  const undoLastMove = () => {
    if (moveHistory.length === 0) {
      return
    }

    const previousPosition =
      moveHistory[moveHistory.length - 1]

    const marker = document.getElementById(
      previousPosition.id
    )

    if (!marker) {
      return
    }

    marker.style.left = previousPosition.left
    marker.style.top = previousPosition.top
    marker.style.right = previousPosition.right
    marker.style.bottom = previousPosition.bottom
    marker.style.transform = previousPosition.transform

    setMoveHistory((currentHistory) =>
      currentHistory.slice(0, -1)
    )
  }

  const toggleFullScreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
    } catch (error) {
      console.error('Full-screen mode could not be changed:', error)
    }
  }

  return (
    <main>
      <header className="app-header">
        <div className="title-accent"></div>

        <div>
          <h1>RefBoard</h1>
          <p className="app-subtitle">
            Interactive positioning for volleyball officials
          </p>
        </div>
      </header>

      <div className="court-area" ref={courtRef}>
        <div className="court">
          <div className="attack-zone attack-zone-left"></div>
          <div className="attack-zone attack-zone-right"></div>
          <div className="center-line"></div>
          <div className="net"></div>

          <div
            id="r1"
            className="official-marker r1-marker"
            onPointerDown={handlePointerDown}
          >
            R1
          </div>

          <div
            id="r2"
            className="official-marker r2-marker"
            onPointerDown={handlePointerDown}
          >
            R2
          </div>

          <div
            id="lj1"
            className="official-marker lj1-marker"
            onPointerDown={handlePointerDown}
          >
            LJ1
          </div>

          <div
            id="lj2"
            className="official-marker lj2-marker"
            onPointerDown={handlePointerDown}
          >
            LJ2
          </div>

          <div
            id="ball"
            className="volleyball"
            aria-label="Volleyball"
            onPointerDown={handlePointerDown}
          >
            🏐
          </div>
        </div>
      </div>

      <div className="reset-controls">
        <button
          type="button"
          className="reset-button undo-button"
          onClick={undoLastMove}
          disabled={moveHistory.length === 0}
        >
          Undo Last Move
        </button>

        <button
          className="reset-button"
          onClick={resetAll}
        >
          Reset All
        </button>

        <button
          className="reset-button"
          onClick={() => resetMarker('r1')}
        >
          Reset R1
        </button>

        <button
          className="reset-button"
          onClick={() => resetMarker('r2')}
        >
          Reset R2
        </button>

        <button
          className="reset-button"
          onClick={() => resetMarker('lj1')}
        >
          Reset LJ1
        </button>

        <button
          className="reset-button"
          onClick={() => resetMarker('lj2')}
        >
          Reset LJ2
        </button>

        <button
          className="reset-button fullscreen-button"
          onClick={toggleFullScreen}
        >
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>
    </main>
  )
}

export default App