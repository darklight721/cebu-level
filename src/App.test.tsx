import { afterEach, beforeEach, describe, expect, rs, test } from '@rstest/core'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { VALUES, towns, type Result, type Values } from './data'

// Mock html2canvas so SaveImage button doesn't throw in App tests
rs.mock('html2canvas', () => ({
  default: rs
    .fn()
    .mockResolvedValue({ toDataURL: () => 'data:image/png;base64,FAKE' }),
}))

function makeProps(overrides?: {
  values?: Partial<Values>
  result?: Result
  onChangeValues?: (v: Values) => void
  onChangeResult?: (r: Result) => void
}) {
  return {
    values: { ...VALUES, ...overrides?.values },
    result: overrides?.result ?? {},
    onChangeValues: overrides?.onChangeValues ?? (() => {}),
    onChangeResult: overrides?.onChangeResult ?? (() => {}),
  }
}

// SVG <path>/<g> elements are not pointer-interactable in happy-dom; fireEvent
// bypasses the visibility/interactability checks that userEvent enforces, which
// is the right call here since SVG map elements are not accessible via pointer
// events. Each town has a <title> child — getByText with selector:'title' finds
// it by text content, then .parentElement gives us the clickable .town element.
// (getByTitle only queries [title] attributes and direct svg > title children,
// not nested <title> elements inside <path>/<g>.)
function clickTown(name: string) {
  fireEvent.click(screen.getByText(name, { selector: 'title' }).parentElement!)
}

describe('App rendering', () => {
  test('renders the map title', () => {
    render(<App {...makeProps()} />)
    expect(screen.getByRole('heading')).toHaveTextContent(VALUES.name)
  })

  test('renders score when showPoints is true', () => {
    const result: Result = { Cebu_City: 0 } // level 0 has 5 points
    render(<App {...makeProps({ result })} />)
    const heading = screen.getByRole('heading')
    expect(heading).toHaveTextContent('5')
  })

  test('hides score when showPoints is false', () => {
    render(<App {...makeProps({ values: { showPoints: false } })} />)
    // Heading should contain only the map name — no trailing score number
    expect(screen.getByRole('heading').textContent?.trim()).toBe(VALUES.name)
  })

  test('renders all legend level names', () => {
    render(<App {...makeProps()} />)
    for (const level of VALUES.levels) {
      expect(screen.getByText(level.name)).toBeInTheDocument()
    }
  })

  test('renders legend points when showPoints is true', () => {
    render(<App {...makeProps()} />)
    // Every level row has "Level: <points>"
    const levelLabels = screen.getAllByText(/^Level:/)
    expect(levelLabels).toHaveLength(VALUES.levels.length)
  })

  test('hides legend points when showPoints is false', () => {
    render(<App {...makeProps({ values: { showPoints: false } })} />)
    expect(screen.queryByText(/^Level:/)).not.toBeInTheDocument()
  })

  test('renders SVG paths for all towns', () => {
    const { container } = render(<App {...makeProps()} />)
    // Every town has a <title> child — count all <title> elements inside .town elements
    const townTitles = container.querySelectorAll('.town > title, .town title')
    expect(townTitles).toHaveLength(towns.length)
  })

  test('multi-path town (Lapu-lapu) renders as a <g> group', () => {
    render(<App {...makeProps()} />)
    const townEl = screen.getByText('Lapu-lapu', {
      selector: 'title',
    }).parentElement
    expect(townEl?.tagName.toLowerCase()).toBe('g')
  })

  test('single-path town (Cebu City) renders as a <path>', () => {
    render(<App {...makeProps()} />)
    const townEl = screen.getByText('Cebu City', {
      selector: 'title',
    }).parentElement
    expect(townEl?.tagName.toLowerCase()).toBe('path')
  })

  test('renders SaveImage, EditMap and ShareMap buttons', () => {
    render(<App {...makeProps()} />)
    expect(
      screen.getByRole('button', { name: 'Save Image' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Edit Map' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Share Map' }),
    ).toBeInTheDocument()
  })
})

describe('App town interaction', () => {
  test('clicking a town opens a popover with its name', async () => {
    render(<App {...makeProps()} />)
    clickTown('Danao')
    expect(
      await screen.findByText('Danao', { selector: '.popover-header' }),
    ).toBeInTheDocument()
  })

  test('clicking the multi-path Lapu-lapu town opens a popover', async () => {
    render(<App {...makeProps()} />)
    clickTown('Lapu-lapu')
    expect(
      await screen.findByText('Lapu-lapu', { selector: '.popover-header' }),
    ).toBeInTheDocument()
  })

  test('popover lists all level choices', async () => {
    render(<App {...makeProps()} />)
    clickTown('Danao')
    await screen.findByText('Danao', { selector: '.popover-header' })
    for (const level of VALUES.levels) {
      expect(
        screen.getByRole('button', { name: level.name }),
      ).toBeInTheDocument()
    }
  })

  test('already-selected level is highlighted with background color', async () => {
    render(<App {...makeProps({ result: { Danao: 0 } })} />)
    clickTown('Danao')
    await screen.findByText('Danao', { selector: '.popover-header' })
    // The first level button should have a backgroundColor style set
    const firstBtn = screen.getByRole('button', {
      name: VALUES.levels[0]!.name,
    })
    expect(firstBtn.getAttribute('style')).toContain('background-color')
  })

  test('selecting a level closes the popover', async () => {
    const user = userEvent.setup()
    render(<App {...makeProps()} />)
    clickTown('Danao')
    await screen.findByText('Danao', { selector: '.popover-header' })
    await user.click(
      screen.getByRole('button', { name: VALUES.levels[0]!.name }),
    )
    expect(
      screen.queryByText('Danao', { selector: '.popover-header' }),
    ).not.toBeInTheDocument()
  })

  test('selecting a level calls onChangeResult', async () => {
    const user = userEvent.setup()
    const onChangeResult = rs.fn()
    render(<App {...makeProps({ onChangeResult })} />)
    clickTown('Danao')
    await screen.findByText('Danao', { selector: '.popover-header' })
    await user.click(
      screen.getByRole('button', { name: VALUES.levels[0]!.name }),
    )
    expect(onChangeResult).toHaveBeenCalledWith(
      expect.objectContaining({ Danao: 0 }),
    )
  })

  test('score in heading updates after selecting a level', async () => {
    const user = userEvent.setup()
    render(<App {...makeProps()} />)
    // No towns selected — score starts at 0
    expect(screen.getByRole('heading')).toHaveTextContent('0')
    clickTown('Danao')
    await screen.findByText('Danao', { selector: '.popover-header' })
    // Level 0 carries 5 points
    await user.click(
      screen.getByRole('button', { name: VALUES.levels[0]!.name }),
    )
    expect(screen.getByRole('heading')).toHaveTextContent('5')
  })
})

describe('App Popover toggle', () => {
  test('toggle prop closes popover when activeTown is cleared', async () => {
    render(<App {...makeProps()} />)
    // Open popover by clicking a town
    clickTown('Danao')
    // Wait for popover with real timers first
    await screen.findByText('Danao', { selector: '.popover-header' })
    // Now switch to fake timers to control the 50ms hideWithDelay timeout
    rs.useFakeTimers()
    try {
      // Click outside the popover — triggers Reactstrap's legacy document click handler
      // which calls hideWithDelay (50ms timeout) → hide → toggle → setActiveTown(null)
      // fireEvent is required here: userEvent.click(document.body) conflicts with
      // fake timers because userEvent uses setTimeout internally for pointer events.
      fireEvent.click(document.body)
      // Advance timers past the 50ms hide delay inside act to flush state updates
      await act(async () => {
        rs.advanceTimersByTime(100)
      })
    } finally {
      rs.useRealTimers()
    }
    expect(
      screen.queryByText('Danao', { selector: '.popover-header' }),
    ).not.toBeInTheDocument()
  })
})

describe('App EditMap reset', () => {
  test('clicking Reset in EditMap modal calls onReset and clears result', async () => {
    const user = userEvent.setup()
    const onChangeResult = rs.fn()
    const result: Result = { Cebu_City: 0 }
    render(<App {...makeProps({ result, onChangeResult })} />)
    // Open EditMap modal
    await user.click(screen.getByRole('button', { name: 'Edit Map' }))
    // Wait for modal to appear
    await screen.findByText('Edit Map', { selector: '.modal-title' })
    // Click Reset button in modal footer
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    // onChangeResult should be called with empty result
    expect(onChangeResult).toHaveBeenLastCalledWith({})
  })
})

describe('App callbacks', () => {
  test('onChangeValues is called on mount with initial values', () => {
    const onChangeValues = rs.fn()
    render(<App {...makeProps({ onChangeValues })} />)
    expect(onChangeValues).toHaveBeenCalledTimes(1)
  })

  test('onChangeResult is called on mount with initial result', () => {
    const onChangeResult = rs.fn()
    render(<App {...makeProps({ onChangeResult })} />)
    expect(onChangeResult).toHaveBeenCalledTimes(1)
  })

  describe('window.gtag', () => {
    let gtag: ReturnType<typeof rs.fn>
    beforeEach(() => {
      gtag = rs.fn()
      window.gtag = gtag
    })
    afterEach(() => {
      delete window.gtag
    })

    test('join_group event is fired when a level is selected', async () => {
      const user = userEvent.setup()
      render(<App {...makeProps()} />)
      clickTown('Danao')
      await screen.findByText('Danao', { selector: '.popover-header' })
      await user.click(
        screen.getByRole('button', { name: VALUES.levels[0]!.name }),
      )
      expect(gtag).toHaveBeenCalledWith(
        'event',
        'join_group',
        expect.objectContaining({
          group_id: expect.stringContaining('Danao'),
        }),
      )
    })

    test('post_score event is fired when Save Image is clicked', async () => {
      const user = userEvent.setup()
      render(<App {...makeProps({ result: { Cebu_City: 0 } })} />)
      await user.click(screen.getByRole('button', { name: 'Save Image' }))
      expect(gtag).toHaveBeenCalledWith(
        'event',
        'post_score',
        expect.objectContaining({ score: expect.any(Number) }),
      )
    })
  })
})
