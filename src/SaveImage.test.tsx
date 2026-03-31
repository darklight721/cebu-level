import { describe, expect, rs, test } from '@rstest/core'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SaveImage from './SaveImage'

// Mock html2canvas
rs.mock('html2canvas', () => ({
  default: rs.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,FAKE',
  }),
}))

describe('SaveImage', () => {
  test('renders the Save Image button', () => {
    render(<SaveImage onClick={() => {}} />)
    expect(
      screen.getByRole('button', { name: 'Save Image' }),
    ).toBeInTheDocument()
  })

  test('button is not disabled initially', () => {
    render(<SaveImage onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Save Image' })).toBeEnabled()
  })

  test('calls the onClick prop when clicked', async () => {
    const user = userEvent.setup()
    const onClick = rs.fn()
    render(<SaveImage onClick={onClick} />)
    await user.click(screen.getByRole('button', { name: 'Save Image' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  test('button becomes disabled while loading', async () => {
    // html2canvas mock returns a Promise — before it resolves the button should be disabled.
    // We start the click without awaiting it, then waitFor the disabled state which appears
    // once React flushes the setLoading(true) state update from the click handler.
    const user = userEvent.setup()
    render(<SaveImage onClick={() => {}} />)
    void user.click(screen.getByRole('button', { name: 'Save Image' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Image' })).toBeDisabled()
    })
  })

  test('shows the image modal after html2canvas resolves', async () => {
    const user = userEvent.setup()
    render(<SaveImage onClick={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Save Image' }))
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    const img = screen.getByAltText('Cebu Level')
    expect(img).toHaveAttribute('src', 'data:image/png;base64,FAKE')
  })

  test('button is re-enabled after loading resolves', async () => {
    const user = userEvent.setup()
    render(<SaveImage onClick={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Save Image' }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Image' })).toBeEnabled()
    })
  })

  test('modal has a download link pointing to the data URL', async () => {
    const user = userEvent.setup()
    render(<SaveImage onClick={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Save Image' }))
    await waitFor(() => screen.getByRole('dialog'))
    const downloadLink = screen.getByRole('link', { name: 'Download Image' })
    expect(downloadLink).toHaveAttribute('href', 'data:image/png;base64,FAKE')
    expect(downloadLink).toHaveAttribute('download', 'cebulevel.png')
  })

  test('closing the modal removes it from the DOM', async () => {
    const user = userEvent.setup()
    render(<SaveImage onClick={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Save Image' }))
    await waitFor(() => screen.getByRole('dialog'))
    const closeBtn = screen.getAllByRole('button', { name: /close/i })[0]!
    await user.click(closeBtn)
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })
})
