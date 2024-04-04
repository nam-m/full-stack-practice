import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Note from './Note'
import { expect } from 'vitest'

test('clicking button calls the event handler once', async () => {
  const note = {
    content: 'component testing',
    important: true,
  }
  // Set up user instance to perform user's actions
  const user = userEvent.setup()

  // Set up mock toggle function in Vitest
  const mockHandler = vi.fn()

  render(<Note note={note} toggleImportance={mockHandler} />)
  const button = screen.getByText('make not important', { exact: false })
  await user.click(button)
  expect(mockHandler).toHaveBeenCalledOnce()

  const element = screen.getByTestId('note')
  // Output html of element
  screen.debug(element)

  expect(element).toHaveTextContent('component testing')
})
