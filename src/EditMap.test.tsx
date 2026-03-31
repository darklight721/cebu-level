import { describe, expect, rs, test } from '@rstest/core'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import EditMap from './EditMap'
import { VALUES } from './data'

function makeProps(overrides?: {
  onSave?: (v: typeof VALUES) => void
  onReset?: () => void
}) {
  return {
    values: { ...VALUES },
    onSave: overrides?.onSave ?? (() => {}),
    onReset: overrides?.onReset ?? (() => {}),
  }
}

async function openModal(user: UserEvent, props = makeProps()) {
  render(<EditMap {...props} />)
  await user.click(screen.getByRole('button', { name: 'Edit Map' }))
  return screen.getByRole('dialog')
}

describe('EditMap button', () => {
  test('renders the Edit Map button', () => {
    render(<EditMap {...makeProps()} />)
    expect(screen.getByRole('button', { name: 'Edit Map' })).toBeInTheDocument()
  })

  test('clicking the button opens the modal', async () => {
    const user = userEvent.setup()
    await openModal(user)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('EditMap modal form', () => {
  test('shows the current name in the name input', async () => {
    const user = userEvent.setup()
    await openModal(user)
    expect(screen.getByLabelText('Name')).toHaveValue(VALUES.name)
  })

  test('shows the Show points checkbox checked when showPoints is true', async () => {
    const user = userEvent.setup()
    await openModal(user)
    expect(screen.getByLabelText('Show points?')).toBeChecked()
  })

  test('unchecking showPoints hides the points column', async () => {
    const user = userEvent.setup()
    await openModal(user)
    await user.click(screen.getByLabelText('Show points?'))
    expect(screen.queryAllByPlaceholderText('Points')).toHaveLength(0)
  })

  test('shows all level name inputs', async () => {
    const user = userEvent.setup()
    await openModal(user)
    expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(
      VALUES.levels.length,
    )
  })

  test('changing the name input updates its value', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const nameInput = screen.getByLabelText('Name')
    await user.clear(nameInput)
    await user.type(nameInput, 'My Map')
    expect(nameInput).toHaveValue('My Map')
  })

  test('changing a level name input updates its value', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const firstNameInput = screen.getAllByPlaceholderText('Level name')[0]!
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Level One')
    expect(firstNameInput).toHaveValue('Level One')
  })

  test('changing a points input updates its value', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const firstPointsInput = screen.getAllByPlaceholderText('Points')[0]!
    await user.clear(firstPointsInput)
    await user.type(firstPointsInput, '99')
    expect(firstPointsInput).toHaveValue(99)
  })

  test('changing a color input updates its value', async () => {
    const user = userEvent.setup()
    await openModal(user)
    // userEvent has no color-picker API; fireEvent.change is the correct tool here.
    // Color inputs are queried by their aria-label (added for accessibility).
    const firstColor = screen.getByLabelText('Level 1 color')
    fireEvent.change(firstColor, { target: { value: '#123456' } })
    expect(firstColor).toHaveValue('#123456')
  })
})

describe('EditMap add/remove levels', () => {
  test('clicking Add new level appends a row', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const before = screen.getAllByPlaceholderText('Level name').length
    await user.click(screen.getByRole('button', { name: 'Add new level' }))
    expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(
      before + 1,
    )
  })

  test('Add new level button is disabled when 10 levels exist', async () => {
    const user = userEvent.setup()
    // Start with 6 levels (VALUES default), add 4 more to hit 10
    await openModal(user)
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole('button', { name: 'Add new level' }))
    }
    expect(screen.getByRole('button', { name: 'Add new level' })).toBeDisabled()
  })

  test('clicking remove (×) button removes that level row', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const before = screen.getAllByPlaceholderText('Level name').length
    const dialog = screen.getByRole('dialog')
    // Exclude the modal header close button; level-row close buttons sit outside .modal-header
    const rowCloseButtons = within(dialog)
      .getAllByRole('button', { name: /close/i })
      .filter((btn) => !btn.closest('.modal-header'))
    await user.click(rowCloseButtons[0]!)
    expect(screen.getAllByPlaceholderText('Level name')).toHaveLength(
      before - 1,
    )
  })

  test('remove button is disabled when only one level remains', async () => {
    const user = userEvent.setup()
    await openModal(user)
    // Remove until 1 level is left
    while (screen.getAllByPlaceholderText('Level name').length > 1) {
      const dialog = screen.getByRole('dialog')
      const rowCloseButtons = within(dialog)
        .getAllByRole('button', { name: /close/i })
        .filter((btn) => !btn.closest('.modal-header'))
      await user.click(rowCloseButtons[0]!)
    }
    const dialog = screen.getByRole('dialog')
    const lastClose = within(dialog)
      .getAllByRole('button', { name: /close/i })
      .filter((btn) => !btn.closest('.modal-header'))[0]!
    expect(lastClose).toBeDisabled()
  })
})

describe('EditMap save / reset / cancel', () => {
  test('clicking Save calls onSave with form data and closes modal', async () => {
    const user = userEvent.setup()
    const onSave = rs.fn()
    await openModal(user, makeProps({ onSave }))
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: VALUES.name,
        showPoints: VALUES.showPoints,
        levels: VALUES.levels.map((l) =>
          expect.objectContaining({ ...l, points: expect.any(Number) }),
        ),
      }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('clicking Save does not call onSave when a required field is empty', async () => {
    const user = userEvent.setup()
    const onSave = rs.fn()
    await openModal(user, makeProps({ onSave }))
    const firstNameInput = screen.getAllByPlaceholderText('Level name')[0]!
    await user.clear(firstNameInput)
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  test('clicking Reset calls onSave with default VALUES and onReset, then closes', async () => {
    const user = userEvent.setup()
    const onSave = rs.fn()
    const onReset = rs.fn()
    await openModal(user, makeProps({ onSave, onReset }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(onSave).toHaveBeenCalledWith(VALUES)
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('clicking Cancel closes the modal without calling onSave', async () => {
    const user = userEvent.setup()
    const onSave = rs.fn()
    await openModal(user, makeProps({ onSave }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onSave).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  test('clicking the modal header × closes the modal', async () => {
    const user = userEvent.setup()
    await openModal(user)
    const dialog = screen.getByRole('dialog')
    const headerClose = within(dialog)
      .getAllByRole('button', { name: /close/i })
      .find((btn) => btn.closest('.modal-header'))!
    await user.click(headerClose)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
