import html2canvas from 'html2canvas'
import { useRef, useState } from 'react'
import { Button, Popover, PopoverBody, PopoverHeader } from 'reactstrap'
import './App.css'
import { VALUES, towns } from './data'
import FormModal from './FormModal'

export default function App() {
  const [values, setValues] = useState(VALUES)
  const [isEditing, setEditing] = useState(false)
  const toggleEditing = () => setEditing((p) => !p)
  const [activeTown, setActiveTown] = useState<(typeof towns)[0] | null>(null)
  const [result, setResult] = useState<
    Record<string, (typeof VALUES.levels)[0]>
  >({})
  const downloadLink = useRef<HTMLAnchorElement>(null)
  const total = Object.values(result).reduce(
    (acc, level) => acc + level.points,
    0
  )

  return (
    <div className="app mx-sm-3 h-100 position-relative overflow-auto d-flex justify-content-md-center">
      <svg
        className="flex-grow-1 flex-sm-grow-0 h-100"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 191.769 373.276"
      >
        {towns.map((town) => {
          const fillColor = result[town.id]?.color ?? '#fff'
          return town.paths.length > 1 ? (
            <g
              key={town.id}
              id={town.id}
              className="town"
              fill={fillColor}
              onClick={() => setActiveTown(town)}
              {...(town.props ?? {})}
            >
              <title>{town.name}</title>
              {town.paths.map((path) => (
                <path key={path} d={path} />
              ))}
            </g>
          ) : (
            <path
              key={town.id}
              id={town.id}
              className="town"
              fill={fillColor}
              d={town.paths[0]}
              onClick={() => setActiveTown(town)}
            >
              <title>{town.name}</title>
            </path>
          )
        })}
      </svg>
      <div className="d-flex flex-column justify-content-between align-items-end">
        <div className="links">
          <a
            className="d-block text-decoration-none text-truncate main-link"
            href="https://darklight721.github.io/cebu-level"
          >
            🏠 https://darklight721.github.io/cebu-level
          </a>
          <a
            data-html2canvas-ignore
            className="d-block text-decoration-none text-truncate"
            href="https://my-philippines-travel-level.com/map"
            target="_blank"
            rel="noopener noreferrer"
          >
            📣 https://my-philippines-travel-level.com/map
          </a>
          <a
            data-html2canvas-ignore
            className="d-block text-decoration-none text-truncate"
            href="https://zhung.com.tw/japanex"
            target="_blank"
            rel="noopener noreferrer"
          >
            📣 https://zhung.com.tw/japanex
          </a>
        </div>
        <div className="title-card d-flex flex-column align-items-center">
          <h1 className="text-center">
            {values.name}
            {values.showPoints && (
              <span className="ms-2 font-monospace">{total}</span>
            )}
          </h1>
          <div className="bg-white rounded shadow-sm px-2 px-sm-3 py-1 py-sm-2 mt-2 mt-sm-3">
            {values.levels.map((level) => (
              <div key={level.name} className="d-flex align-items-center my-1">
                <div
                  className="tile flex-shrink-0 rounded-1"
                  style={{ backgroundColor: level.color }}
                />
                <div className="flex-fill ms-2">{level.name}</div>
                {values.showPoints && (
                  <div className="ms-2">
                    Level:
                    <span className="ms-2 font-monospace">{level.points}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div data-html2canvas-ignore className="mt-3">
            <a
              ref={downloadLink}
              className="btn btn-primary"
              download="cebulevel.png"
              target="_blank"
              onClick={(e) => {
                const target = e.target as HTMLAnchorElement
                if (target.href) return

                e.preventDefault()
                html2canvas(document.body, { logging: false }).then(
                  (canvas) => {
                    target.setAttribute('href', canvas.toDataURL())
                    target.click()
                  }
                )
                window.gtag?.('event', 'post_score', { score: total })
              }}
            >
              Save Image
            </a>
            <Button className="ms-2" onClick={toggleEditing}>
              Edit Map
            </Button>
          </div>
        </div>
      </div>
      {activeTown && (
        <Popover
          hideArrow
          isOpen
          toggle={() => setActiveTown(null)}
          key={activeTown.id}
          target={activeTown.id}
          trigger="legacy"
          className="details-popover"
        >
          <PopoverHeader>{activeTown.name}</PopoverHeader>
          <PopoverBody className="p-0">
            {values.levels.map((level) => (
              <button
                key={level.name}
                className="level-choice d-block w-100 text-start px-3 py-2"
                style={
                  level.name === result[activeTown.id]?.name
                    ? { backgroundColor: level.color }
                    : undefined
                }
                onClick={() => {
                  setResult((prev) => ({ ...prev, [activeTown.id]: level }))
                  window.gtag?.('event', 'join_group', {
                    group_id: `${activeTown.id}-${level.points}`,
                  })
                  setActiveTown(null)
                  if (downloadLink.current?.href)
                    downloadLink.current.removeAttribute('href')
                }}
              >
                {level.name}
              </button>
            ))}
          </PopoverBody>
        </Popover>
      )}
      {isEditing && (
        <FormModal
          isOpen
          toggle={toggleEditing}
          values={values}
          onSave={(newValues) => setValues(newValues)}
          onReset={() => setResult({})}
        />
      )}
    </div>
  )
}
