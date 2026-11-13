/* npm run dev */

import './App.css'
import { useEffect, useRef, useState } from 'react'

function App() {
  const courtRef = useRef(null)
  const resetDropdownRef = useRef(null)
  const sequencesDropdownRef = useRef(null)
  const rotationsDropdownRef = useRef(null)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [moveHistory, setMoveHistory] = useState([])
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [isSequencesOpen, setIsSequencesOpen] = useState(false)
  const [isRotationsOpen, setIsRotationsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resetDropdownRef.current && !resetDropdownRef.current.contains(event.target)) {
        setIsResetOpen(false)
      }
      if (sequencesDropdownRef.current && !sequencesDropdownRef.current.contains(event.target)) {
        setIsSequencesOpen(false)
      }
      if (rotationsDropdownRef.current && !rotationsDropdownRef.current.contains(event.target)) {
        setIsRotationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  // Court positions for team A (left side, players face right toward net)
  // pos 1=back-right, 2=front-right, 3=front-mid, 4=front-left, 5=back-left, 6=back-mid
  const TA_COURT_POS = {
    1: { left: '13%', top: '80%' },
    2: { left: '37%', top: '80%' },
    3: { left: '37%', top: '50%' },
    4: { left: '37%', top: '20%' },
    5: { left: '13%', top: '20%' },
    6: { left: '13%', top: '50%' },
  }

  const applyTAServeRow = (row) => {
    for (let p = 1; p <= 6; p++) {
      const courtPos = ((p - row) % 6 + 6) % 6 + 1
      const { left, top } = TA_COURT_POS[courtPos]
      const el = document.getElementById(`ta-p${p}`)
      if (!el) continue
      el.style.left = left
      el.style.top = top
      el.style.right = 'auto'
      el.style.bottom = 'auto'
      el.style.transform = 'translate(-50%, -50%)'
    }
  }

  // Court positions for team B (right side, players face left toward net)
  // pos 1=back-right, 2=front-right, 3=front-mid, 4=front-left, 5=back-left, 6=back-mid
  const TB_COURT_POS = {
    1: { left: '87%', top: '20%' },
    2: { left: '63%', top: '20%' },
    3: { left: '63%', top: '50%' },
    4: { left: '63%', top: '80%' },
    5: { left: '87%', top: '80%' },
    6: { left: '87%', top: '50%' },
  }

  // CSS defaults = Row 6 (player number matches court position in Row 6)
  const applyTBServeRow = (row) => {
    for (let p = 1; p <= 6; p++) {
      const courtPos = ((p + 5 - row) % 6 + 6) % 6 + 1
      const { left, top } = TB_COURT_POS[courtPos]
      const el = document.getElementById(`tb-p${p}`)
      if (!el) continue
      el.style.left = left
      el.style.top = top
      el.style.right = 'auto'
      el.style.bottom = 'auto'
      el.style.transform = 'translate(-50%, -50%)'
    }
  }

  const capturePositions = () => {
    const courtEl = courtRef.current.querySelector('.court')
    const courtRect = courtEl.getBoundingClientRect()
    const cw = courtEl.offsetWidth
    const ch = courtEl.offsetHeight

    const capture = (team) => {
      const result = {}
      for (let p = 1; p <= 6; p++) {
        const el = document.getElementById(`${team}-p${p}`)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2 - courtRect.left
        const cy = rect.top + rect.height / 2 - courtRect.top
        result[`${team}-p${p}`] = {
          left: `${((cx / cw) * 100).toFixed(1)}%`,
          top: `${((cy / ch) * 100).toFixed(1)}%`,
        }
      }
      return result
    }

    const ballEl = document.getElementById('ball')
    let ballPos = null
    if (ballEl) {
      const rect = ballEl.getBoundingClientRect()
      const cx = rect.left + rect.width / 2 - courtRect.left
      const cy = rect.top + rect.height / 2 - courtRect.top
      ballPos = {
        left: `${((cx / cw) * 100).toFixed(1)}%`,
        top: `${((cy / ch) * 100).toFixed(1)}%`,
      }
    }

    console.log('Team A positions:', JSON.stringify(capture('ta'), null, 2))
    console.log('Team B positions:', JSON.stringify(capture('tb'), null, 2))
    console.log('Ball position:', JSON.stringify(ballPos, null, 2))
  }

  const applyServeReceiveBall = () => {
    const ballEl = document.getElementById('ball')
    if (!ballEl) return
    ballEl.style.left = '105%'
    ballEl.style.top = '20%'
    ballEl.style.right = 'auto'
    ballEl.style.bottom = 'auto'
    ballEl.style.transform = 'translate(-50%, -50%)'
  }

  const resetPlayers = () => {
    for (let i = 1; i <= 6; i++) {
      resetMarker(`ta-p${i}`)
      resetMarker(`tb-p${i}`)
    }
  }

  const resetAll = () => {
    resetMarker('r1')
    resetMarker('r2')
    resetMarker('lj1')
    resetMarker('lj2')
    resetMarker('ball')

    for (let i = 1; i <= 6; i++) {
      resetMarker(`ta-p${i}`)
      resetMarker(`tb-p${i}`)
    }

    document.getElementById('sequence-ball-lj2')?.remove()
    const courtBall = document.getElementById('ball')
    if (courtBall) courtBall.style.fontSize = ''

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

  const runLJSequence = async () => {
    const court = courtRef.current
    const lj1 = document.getElementById('lj1')
    const lj2 = document.getElementById('lj2')
    if (!court || !lj1 || !lj2) return

    setIsAnimating(true)

    // courtRef points to .court-area; markers are positioned relative to .court
    const courtEl = court.querySelector('.court')
    if (!courtEl) return

    const cw = courtEl.offsetWidth
    const ch = courtEl.offsetHeight
    const OFF = 20

    const snapTo = (marker, x, y) => {
      marker.style.transition = 'none'
      marker.style.left = `${x}px`
      marker.style.top = `${y}px`
      marker.style.right = 'auto'
      marker.style.bottom = 'auto'
      marker.style.transform = 'translate(-50%, -50%)'
    }

    // Force layout then animate in the next frame so the snap commits first
    const slideTo = (marker, x, y, ms = 1400) =>
      new Promise((resolve) => {
        void marker.getBoundingClientRect()
        requestAnimationFrame(() => {
          marker.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`
          marker.style.left = `${x}px`
          marker.style.top = `${y}px`
          setTimeout(() => {
            marker.style.transition = 'none'
            resolve()
          }, ms)
        })
      })

    const courtRect = courtEl.getBoundingClientRect()
    const leftAttackX = courtEl.querySelector('.attack-zone-left').getBoundingClientRect().left - courtRect.left
    const rightAttackX = courtEl.querySelector('.attack-zone-right').getBoundingClientRect().right - courtRect.left

    snapTo(lj1, -OFF, -OFF)
    snapTo(lj2, cw + OFF, ch + OFF)
    void courtEl.getBoundingClientRect()

    // Step 1: LJ2 walks up the right sideline to the top-right corner
    await slideTo(lj2, cw + OFF, -OFF)
    await new Promise((r) => setTimeout(r, 300))

    // Step 2: Both walk toward R1, stopping exactly at their attack-line/sideline border
    await Promise.all([
      slideTo(lj1, leftAttackX, -OFF),
      slideTo(lj2, rightAttackX, -OFF),
    ])

    setIsAnimating(false)
  }

  const runLJEndOfSetSequence = async () => {
    const courtArea = courtRef.current
    const courtEl = courtArea.querySelector('.court')
    const lj1 = document.getElementById('lj1')
    const lj2 = document.getElementById('lj2')
    if (!courtEl || !lj1 || !lj2) return

    setIsAnimating(true)

    const cw = courtEl.offsetWidth
    const ch = courtEl.offsetHeight
    const OFF = 20

    const snapTo = (marker, x, y) => {
      marker.style.transition = 'none'
      marker.style.left = `${x}px`
      marker.style.top = `${y}px`
      marker.style.right = 'auto'
      marker.style.bottom = 'auto'
      marker.style.transform = 'translate(-50%, -50%)'
    }

    const slideTo = (el, x, y, ms = 1400) =>
      new Promise((resolve) => {
        void el.getBoundingClientRect()
        requestAnimationFrame(() => {
          el.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`
          el.style.left = `${x}px`
          el.style.top = `${y}px`
          setTimeout(() => {
            el.style.transition = 'none'
            resolve()
          }, ms)
        })
      })

    const courtRect = courtEl.getBoundingClientRect()
    const leftAttackX = courtEl.querySelector('.attack-zone-left').getBoundingClientRect().left - courtRect.left
    const rightAttackX = courtEl.querySelector('.attack-zone-right').getBoundingClientRect().right - courtRect.left

    // Phase 1: identical to LJ Time Out
    snapTo(lj1, -OFF, -OFF)
    snapTo(lj2, cw + OFF, ch + OFF)
    void courtEl.getBoundingClientRect()

    await slideTo(lj2, cw + OFF, -OFF)
    await new Promise((r) => setTimeout(r, 300))

    await Promise.all([
      slideTo(lj1, leftAttackX, -OFF),
      slideTo(lj2, rightAttackX, -OFF),
    ])

    await new Promise((r) => setTimeout(r, 400))

    // Get R2's current center Y relative to the court
    const r2 = document.getElementById('r2')
    const r2Rect = r2.getBoundingClientRect()
    const r2CenterY = r2Rect.top + r2Rect.height / 2 - courtRect.top

    const BALL_OFFSET = -48
    const BALL_SIZE = '44px'

    // Snap the court ball to its current visual position in left/top terms
    const courtBall = document.getElementById('ball')
    const ballRect = courtBall.getBoundingClientRect()
    const ballCenterX = ballRect.left + ballRect.width / 2 - courtRect.left
    const ballCenterY = ballRect.top + ballRect.height / 2 - courtRect.top

    courtBall.style.transition = 'none'
    courtBall.style.left = `${ballCenterX}px`
    courtBall.style.top = `${ballCenterY}px`
    courtBall.style.right = 'auto'
    courtBall.style.bottom = 'auto'
    courtBall.style.transform = 'translate(-50%, -50%)'

    // Shrink the court ball and move it to LJ1's position simultaneously
    await new Promise((resolve) => {
      void courtBall.getBoundingClientRect()
      requestAnimationFrame(() => {
        const ms = 1400
        courtBall.style.transition = `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out`
        courtBall.style.left = `${leftAttackX}px`
        courtBall.style.top = `${-OFF + BALL_OFFSET}px`
        setTimeout(() => { courtBall.style.transition = 'none'; resolve() }, ms)
      })
    })

    await new Promise((r) => setTimeout(r, 300))

    // Create temporary ball for LJ2
    const makeBall = (x, y) => {
      const el = document.createElement('div')
      el.id = 'sequence-ball-lj2'
      el.style.position = 'absolute'
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.transform = 'translate(-50%, -50%)'
      el.style.fontSize = BALL_SIZE
      el.style.lineHeight = '1'
      el.style.zIndex = '5'
      el.style.pointerEvents = 'none'
      el.style.transition = 'none'
      el.textContent = '🏐'
      courtEl.appendChild(el)
      return el
    }

    document.getElementById('sequence-ball-lj2')?.remove()
    const ball2 = makeBall(rightAttackX, -OFF + BALL_OFFSET)
    void courtEl.getBoundingClientRect()

    // Phase 2: both LJs and their balls walk straight down to R2's y position
    await Promise.all([
      slideTo(lj1, leftAttackX, r2CenterY),
      slideTo(lj2, rightAttackX, r2CenterY),
      slideTo(courtBall, leftAttackX, r2CenterY + BALL_OFFSET),
      slideTo(ball2, rightAttackX, r2CenterY + BALL_OFFSET),
    ])

    setIsAnimating(false)
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

      <div className="court-layout">
      <div className="court-area" ref={courtRef}>
        <div className="court">
          <div className="attack-zone attack-zone-left"></div>
          <div className="attack-zone attack-zone-right"></div>
          <div className="center-line"></div>
          <div className="net"></div>

          <div
            id="r1"
            className="official-marker r1-marker"
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

          {[
            [1, 'S'], [2, 'OH1'], [3, 'MB1'], [4, 'RS'], [5, 'OH2'], [6, 'MB2'],
          ].map(([n, label]) => (
            <div
              key={`ta-p${n}`}
              id={`ta-p${n}`}
              className={`player-marker team-a-player ta-p${n}`}
              onPointerDown={handlePointerDown}
            >
              {label}
            </div>
          ))}

          {[
            [1, 'MB2'], [2, 'S'], [3, 'OH1'], [4, 'MB1'], [5, 'RS'], [6, 'OH2'],
          ].map(([n, label]) => (
            <div
              key={`tb-p${n}`}
              id={`tb-p${n}`}
              className={`player-marker team-b-player tb-p${n}`}
              onPointerDown={handlePointerDown}
            >
              {label}
            </div>
          ))}
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

        <div className="reset-dropdown" ref={resetDropdownRef}>
          <button
            className="reset-button"
            onClick={() => setIsResetOpen((o) => !o)}
          >
            Reset
          </button>

          {isResetOpen && (
            <div className="reset-dropdown-menu">
              <button
                className="reset-dropdown-item"
                onClick={() => { resetAll(); setIsResetOpen(false) }}
              >
                Reset All
              </button>

              <button
                className="reset-dropdown-item"
                onClick={() => { resetMarker('r2'); setIsResetOpen(false) }}
              >
                Reset R2
              </button>

              <button
                className="reset-dropdown-item"
                onClick={() => { resetMarker('lj1'); setIsResetOpen(false) }}
              >
                Reset LJ1
              </button>

              <button
                className="reset-dropdown-item"
                onClick={() => { resetMarker('lj2'); setIsResetOpen(false) }}
              >
                Reset LJ2
              </button>

              <button
                className="reset-dropdown-item"
                onClick={() => { resetMarker('lj1'); resetMarker('lj2'); setIsResetOpen(false) }}
              >
                Reset LJs
              </button>

              <button
                className="reset-dropdown-item"
                onClick={() => { resetPlayers(); setIsResetOpen(false) }}
              >
                Reset Players
              </button>
            </div>
          )}
        </div>

        <div className="reset-dropdown" ref={rotationsDropdownRef}>
          <button
            className="reset-button rotations-button"
            onClick={() => setIsRotationsOpen((o) => !o)}
          >
            Rotations
          </button>

          {isRotationsOpen && (
            <>
              <div className="dropdown-backdrop" onClick={() => setIsRotationsOpen(false)} />
              <div className="reset-dropdown-menu rotation-dropdown-menu">
                <div className="rotation-col">
                  <div className="rotation-col-header">Serve</div>
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <button
                      key={`r${row}-serve`}
                      className="reset-dropdown-item"
                      onClick={() => {
                        applyTAServeRow(row)
                        applyTBServeRow(row)
                        resetMarker('ball')
                        setIsRotationsOpen(false)
                      }}
                    >
                      Row {row}
                    </button>
                  ))}
                </div>
                <div className="rotation-col">
                  <div className="rotation-col-header">Serve Receive</div>
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <button
                      key={`r${row}-sr`}
                      className="reset-dropdown-item"
                      onClick={() => {
                        applyServeReceiveBall()
                        setIsRotationsOpen(false)
                      }}
                    >
                      Row {row}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="reset-dropdown" ref={sequencesDropdownRef}>
          <button
            className="reset-button lj-sequence-button"
            onClick={() => setIsSequencesOpen((o) => !o)}
            disabled={isAnimating}
          >
            Sequences
          </button>

          {isSequencesOpen && (
            <>
            <div className="dropdown-backdrop" onClick={() => setIsSequencesOpen(false)} />
            <div className="reset-dropdown-menu">
              <button
                className="reset-dropdown-item"
                onClick={() => { setIsSequencesOpen(false); runLJSequence() }}
              >
                LJ Time Out
              </button>

              <button
                className="reset-dropdown-item"
                onClick={() => { setIsSequencesOpen(false); runLJEndOfSetSequence() }}
              >
                LJ End of Set
              </button>
            </div>
            </>
          )}
        </div>

        <button
          className="reset-button capture-button"
          onClick={capturePositions}
        >
          Capture
        </button>

        <button
          className="reset-button fullscreen-button"
          onClick={toggleFullScreen}
        >
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
        </button>
      </div>
      </div>
    </main>
  )
}

export default App