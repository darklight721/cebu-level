import { useEffect, useState } from 'react'
import { ButtonGroup, Popover, PopoverBody, PopoverHeader } from 'reactstrap'
import './App.css'
import EditMap from './EditMap'
import SaveImage from './SaveImage'
import ShareMap from './ShareMap'
import { HOME_URL, towns, type Result, type Values } from './data'

function computeScore(result: Result, values: Values) {
  return Object.values(result).reduce(
    (acc, index) => acc + (values.levels[index]?.points ?? 0),
    0
  )
}

type Props = {
  values: Values
  result: Result
  onChangeValues: (values: Values) => void
  onChangeResult: (result: Result) => void
}

export default function App({
  values: initValues,
  result: initResult,
  onChangeValues,
  onChangeResult,
}: Props) {
  const [values, setValues] = useState(initValues)
  const [result, setResult] = useState(initResult)
  const [activeTown, setActiveTown] = useState<(typeof towns)[0] | null>(null)

  useEffect(() => {
    onChangeValues(values)
  }, [values])

  useEffect(() => {
    onChangeResult(result)
  }, [result])

  return (
    <div className="app mx-sm-3 h-100 position-relative overflow-auto d-flex justify-content-md-center">
      <div className="links m-2 text-end position-absolute top-0 end-0">
        <a className="d-block text-decoration-none main-link" href={HOME_URL}>
          🏠 {HOME_URL}
        </a>
        <a
          data-html2canvas-ignore
          className="d-block text-decoration-none"
          href="https://my-philippines-travel-level.com/map"
          target="_blank"
          rel="noopener noreferrer"
        >
          📣 My Philippines Travel Level
        </a>
        <a
          data-html2canvas-ignore
          className="d-block text-decoration-none"
          href="mailto:skinned.vibes-06@icloud.com?subject=Cebu%20Level&body=Hi%20Roy!"
        >
          ✉️ Contact me here
        </a>
      </div>
      <svg
        className="flex-grow-1 flex-sm-grow-0 h-100"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 191.769 373.276"
      >
        {towns.map((town) => {
          const fillColor = values.levels[result[town.id]!]?.color ?? '#fff'
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
      <div className="title-card d-flex flex-column align-items-center">
        <h1 className="text-center">
          {values.name}
          {values.showPoints && (
            <span className="ms-2 font-monospace">
              {computeScore(result, values)}
            </span>
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
          <ButtonGroup className="actions">
            <SaveImage
              onClick={() =>
                window.gtag?.('event', 'post_score', {
                  score: computeScore(result, values),
                  character: values.name,
                })
              }
            />
            <EditMap
              values={values}
              onSave={setValues}
              onReset={() => setResult({})}
            />
            <ShareMap values={values} result={result} />
          </ButtonGroup>
        </div>
      </div>
      {activeTown && (
        <Popover
          hideArrow
          isOpen
          toggle={() => setActiveTown(null)}
          target={activeTown.id}
          trigger="legacy"
          className="details-popover"
        >
          <PopoverHeader>{activeTown.name}</PopoverHeader>
          <PopoverBody className="p-0">
            {values.levels.map((level, index) => (
              <button
                key={level.name}
                className="level-choice d-block w-100 text-start px-3 py-2"
                style={
                  index === result[activeTown.id]
                    ? { backgroundColor: level.color }
                    : undefined
                }
                onClick={() => {
                  setResult((prev) => ({ ...prev, [activeTown.id]: index }))
                  window.gtag?.('event', 'join_group', {
                    group_id: `${activeTown.id}|${level.name}`,
                  })
                  setActiveTown(null)
                }}
              >
                {level.name}
              </button>
            ))}
          </PopoverBody>
        </Popover>
      )}
    </div>
  )
}
