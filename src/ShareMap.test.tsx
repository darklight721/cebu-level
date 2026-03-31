import { describe, expect, rs, test } from '@rstest/core'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import ShareMap from './ShareMap'
import { HOME_URL, VALUES, type Result, type Values } from './data'

function makeProps(overrides?: { values?: Partial<Values>; result?: Result }) {
  return {
    values: { ...VALUES, ...overrides?.values },
    result: overrides?.result ?? {},
  }
}

async function openModal(user: UserEvent, props = makeProps()) {
  render(<ShareMap {...props} />)
  await user.click(screen.getByRole('button', { name: 'Share Map' }))
  return screen.getByRole('dialog')
}

describe('ShareMap button', () => {
  test('renders the Share Map button', () => {
    render(<ShareMap {...makeProps()} />)
    expect(
      screen.getByRole('button', { name: 'Share Map' }),
    ).toBeInTheDocument()
  })

  test('clicking the button opens the modal', async () => {
    const user = userEvent.setup()
    await openModal(user)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('closing the modal removes it', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const closeBtn = screen.getAllByRole('button', { name: /close/i })[0]!
    await user.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})

describe('ShareMap link generation', () => {
  test('shows HOME_URL as link when values are default and result is empty', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', HOME_URL)
    expect(link).toHaveTextContent(HOME_URL)
  })

  test('link includes result param when result is non-empty (type 1 default)', async () => {
    const user = userEvent.setup()
    await openModal(user, makeProps({ result: { Cebu_City: 0 } }))
    const link = screen.getByRole('link')
    expect(link.getAttribute('href')).toContain('r=')
  })

  test('does NOT show share-type toggle when result is empty', async () => {
    const user = userEvent.setup()
    await openModal(user, makeProps({ result: {} }))
    expect(
      screen.queryByText('Share my map and result'),
    ).not.toBeInTheDocument()
  })

  test('shows share-type toggle when both custom values and result exist', async () => {
    const user = userEvent.setup()
    await openModal(
      user,
      makeProps({
        values: { name: 'Custom', showPoints: true, levels: VALUES.levels },
        result: { Cebu_City: 0 },
      }),
    )
    expect(screen.getByText('Share my map and result')).toBeInTheDocument()
    expect(screen.getByText('Share my map')).toBeInTheDocument()
  })

  test('switching to type 2 removes result param from link', async () => {
    const user = userEvent.setup()
    await openModal(
      user,
      makeProps({
        values: { name: 'Custom', showPoints: true, levels: VALUES.levels },
        result: { Cebu_City: 0 },
      }),
    )
    // Type 1 is selected by default — link has r=
    expect(screen.getByRole('link').getAttribute('href')).toContain('r=')
    await user.click(screen.getByText('Share my map'))
    await waitFor(() => {
      expect(screen.getByRole('link').getAttribute('href')).not.toContain('r=')
    })
  })

  test('switching back to type 1 re-adds result param to link', async () => {
    const user = userEvent.setup()
    await openModal(
      user,
      makeProps({
        values: { name: 'Custom', showPoints: true, levels: VALUES.levels },
        result: { Cebu_City: 0 },
      }),
    )
    // Go to type 2 first
    await user.click(screen.getByText('Share my map'))
    await waitFor(() => {
      expect(screen.getByRole('link').getAttribute('href')).not.toContain('r=')
    })
    // Switch back to type 1
    await user.click(screen.getByText('Share my map and result'))
    await waitFor(() => {
      expect(screen.getByRole('link').getAttribute('href')).toContain('r=')
    })
  })
})

describe('ShareMap copy to clipboard', () => {
  test('copy button calls navigator.clipboard.writeText', async () => {
    const user = userEvent.setup()
    const writeText = rs.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    await openModal(user)
    await user.click(screen.getByRole('button', { name: /copy to clipboard/i }))
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(HOME_URL)
    })
  })

  test('copy button shows "Copied" after clicking and resets after 1s', async () => {
    const writeText = rs.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    rs.useFakeTimers()
    try {
      // Use fireEvent for synchronous clicks — userEvent uses setTimeout internally
      // which conflicts with fake timers even when advanceTimers is configured.
      render(<ShareMap {...makeProps()} />)
      fireEvent.click(screen.getByRole('button', { name: 'Share Map' }))
      fireEvent.click(
        screen.getByRole('button', { name: /copy to clipboard/i }),
      )
      // Flush microtasks so the clipboard.writeText().then(() => setCopied(true)) resolves
      await act(async () => {})
      expect(
        screen.getByRole('button', { name: /copied to clipboard/i }),
      ).toBeInTheDocument()
      // Advance past the 1s reset timeout
      await act(async () => {
        rs.advanceTimersByTime(1100)
      })
      expect(
        screen.getByRole('button', { name: /copy to clipboard/i }),
      ).toBeInTheDocument()
    } finally {
      rs.useRealTimers()
    }
  })
})

describe('ShareMap social buttons', () => {
  test('renders Facebook, Twitter, Reddit and Email share buttons', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const dialog = screen.getByRole('dialog')
    // react-share renders buttons with accessible names from DEFAULT_ARIA_LABELS
    // when the button children contain no text content (icon-only buttons)
    expect(
      screen.getByRole('button', { name: 'Share on Facebook' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Share on X' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Share on Reddit' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Share by email' }),
    ).toBeInTheDocument()
    // All four are within the modal
    expect(dialog).toContainElement(
      screen.getByRole('button', { name: 'Share on Facebook' }),
    )
  })
})
