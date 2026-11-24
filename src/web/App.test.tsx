import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App.tsx'
import { greetingsAt } from './greetings.ts'
import { NOTICE_KEY } from './PractitionerNotice.tsx'
import { answerStream, citation, json, pending } from './test/fakes.ts'

type Route = (init: RequestInit | undefined) => Response | Promise<Response>

/**
 * Answer requests by path; `/api/chat` takes one handler per question, in order. Without `kind`
 * the server cannot sort questions.
 */
function serve({ chat = [] as Route[], kind }: { chat?: Route[]; kind?: Route } = {}) {
  const asked: unknown[] = []
  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const path = String(input)
    if (path === '/api/books') return json({ books: [{ bookId: 'boericke_mm', title: 'Boericke, Materia Medica', author: null }] })
    if (path === '/api/config') return json({ auth: null })
    if (path === '/api/kind' && kind) return kind(init)
    if (path === '/api/chat') {
      asked.push(JSON.parse(init?.body as string))
      const next = chat.shift()
      if (!next) throw new Error('unexpected question')
      return next(init)
    }
    return json({ detail: 'Not Found' }, 404)
  })
  return asked
}

async function ask(question: string) {
  await userEvent.type(screen.getByRole('textbox', { name: 'Your question' }), `${question}{Enter}`)
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  // Past the practitioner notice, which has its own tests.
  localStorage.setItem(NOTICE_KEY, 'seen')
})

describe('sorting questions', () => {
  it('answers a case at once', async () => {
    const asked = serve({ kind: () => json({ kind: 'case' }), chat: [() => answerStream('Pulsatilla covers both [1].', [citation(1)])] })
    render(<App />)

    await ask('A weepy, thirstless woman.')

    await screen.findByText(/Pulsatilla covers both/)
    expect(asked).toEqual([{ message: 'A weepy, thirstless woman.', history: [] }])
  })

  it('answers a question that describes no patient', async () => {
    const asked = serve({ kind: () => json({ kind: 'question' }), chat: [() => answerStream('Sulphur is a polychrest [1].', [citation(1)])] })
    render(<App />)

    await ask('What is Sulphur?')

    await screen.findByText(/Sulphur is a polychrest/)
    expect(asked).toEqual([{ message: 'What is Sulphur?', history: [] }])
  })

  it('asks an off-topic question so the books are not searched for it', async () => {
    const asked = serve({ kind: () => json({ kind: 'off-topic' }), chat: [() => answerStream('No passages in the corpus matched this question.', [])] })
    render(<App />)

    await ask('What is the capital of France?')

    await screen.findByText(/No passages in the corpus matched/)
    expect(asked).toEqual([{ message: 'What is the capital of France?', history: [], offTopic: true }])
  })

  it('says it is reading the question until it is sorted', async () => {
    let sort!: (response: Response) => void
    serve({ kind: () => new Promise((resolve) => (sort = resolve)), chat: [(init) => pending(init?.signal)] })
    render(<App />)

    await ask('A weepy, thirstless woman.')
    expect(screen.getByRole('status')).toHaveTextContent('Reading your question…')
    sort(json({ kind: 'case' }))

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Searching the books…'))
  })

  it('can be stopped while the question is sorted, leaving the next question free to be asked', async () => {
    const asked = serve({ kind: () => new Promise(() => {}), chat: [] })
    render(<App />)

    await ask('A weepy, thirstless woman.')
    await userEvent.click(screen.getByRole('button', { name: 'Stop answering' }))

    expect(screen.getByText('Stopped.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send question' })).toBeInTheDocument()
    expect(asked).toEqual([])
  })
})

describe('asking', () => {
  it('streams an answer and opens the source a citation points to', async () => {
    const sources = [citation(1), citation(2, { remedyName: 'Pulsatilla', text: 'Weeping, mild, changeable.' })]
    serve({ chat: [() => answerStream('Pulsatilla is mild and weepy [2].', sources)] })
    render(<App />)

    await ask('What is Pulsatilla like?')

    expect(screen.getByRole('heading', { name: 'What is Pulsatilla like?' })).toBeInTheDocument()
    // Only the cited source is counted.
    const references = await screen.findByRole('button', { name: '1 reference' })
    expect(screen.queryByRole('region', { name: 'Pulsatilla' })).not.toBeInTheDocument()
    // Citations become buttons once the Markdown renderer has loaded.
    await userEvent.click(await screen.findByRole('button', { name: 'Source 2' }))

    // Only the clicked passage is shown.
    const panel = screen.getByRole('region', { name: 'Pulsatilla' })
    expect(within(panel).getByText('Weeping, mild, changeable.')).toBeInTheDocument()
    expect(within(panel).queryByText(sources[0].text)).not.toBeInTheDocument()

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('region', { name: 'Pulsatilla' })).not.toBeInTheDocument()

    // The row lists the references, and one opens its passage, with a way back to the list.
    await userEvent.click(references)
    expect(references).toHaveAttribute('aria-pressed', 'true')
    const list = within(screen.getByRole('region', { name: 'References' })).getByRole('list', { name: 'References' })
    expect(within(list).getAllByRole('button')).toHaveLength(1)
    await userEvent.click(within(list).getByRole('button', { name: /Pulsatilla/ }))
    expect(screen.getByRole('region', { name: 'Pulsatilla' })).toBeInTheDocument()
    // Focus follows each switch, back to the reference it left.
    expect(screen.getByRole('button', { name: 'All references' })).toHaveFocus()
    await userEvent.click(screen.getByRole('button', { name: 'All references' }))
    expect(screen.getByRole('region', { name: 'References' })).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'References' })).getByRole('button', { name: /Pulsatilla/ })).toHaveFocus()

    // The row closes the list again.
    await userEvent.click(references)
    expect(screen.queryByRole('region', { name: 'References' })).not.toBeInTheDocument()
  })

  it('sends the history the server returned with the last answer', async () => {
    const asked = serve({
      chat: [() => answerStream('First answer.', [citation(1)], 'First?'), () => answerStream('Second answer.', [citation(1)])],
    })
    render(<App />)

    await ask('First?')
    await screen.findByText('First answer.')
    await ask('Second?')
    await screen.findByText('Second answer.')

    expect(asked).toEqual([
      { message: 'First?', history: [] },
      {
        message: 'Second?',
        history: [
          { role: 'user', content: 'First?' },
          { role: 'assistant', content: 'First answer.' },
        ],
      },
    ])
  })

  it('greets an empty chat for the time of day', () => {
    render(<App />)

    const hour = new Date().getHours()
    expect(greetingsAt(hour)).toContain(screen.getByRole('heading', { level: 1 }).textContent)
  })

  it('shows a failure and asks again on request', async () => {
    serve({
      chat: [() => json({ detail: 'Too many questions in a short time.' }, 429), () => answerStream('Recovered.', [citation(1)])],
    })
    render(<App />)

    await ask('Hello?')
    expect(await screen.findByRole('alert')).toHaveTextContent('Too many questions in a short time.')
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Recovered.')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Hello?' })).toHaveLength(1)
  })

  it('stops an answer in progress', async () => {
    serve({ chat: [(init) => pending(init?.signal)] })
    render(<App />)

    await ask('Slow?')
    expect(await screen.findByText('Searching the books…')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Stop answering' }))

    expect(screen.getByText('Stopped.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Send question' })).toBeDisabled())
  })
})

describe('compacting', () => {
  it('sends the summary the server condensed a chat into with the next question', async () => {
    const kept = [
      { role: 'user' as const, content: 'Second?' },
      { role: 'assistant' as const, content: 'Second answer.' },
    ]
    const summary = 'The user first asked about Nux vomica.'
    const asked = serve({
      chat: [
        () => answerStream('Second answer.', [citation(1)], 'Second?', kept, summary),
        () => answerStream('Third answer.', [citation(1)], 'Third?'),
      ],
    })
    render(<App />)

    await ask('Second?')
    await screen.findByText('Second answer.')
    await ask('Third?')

    await screen.findByText('Third answer.')
    expect(asked[1]).toEqual({ message: 'Third?', history: kept, summary })
  })
})

describe('saved chats', () => {
  it('lists an answered chat, reopens it after a reload and starts new ones', async () => {
    serve({ chat: [() => answerStream('Keynotes [1].', [citation(1)])] })
    const { unmount } = render(<App />)

    await ask('Pulsatilla keynotes?')
    await screen.findByText(/Keynotes/)
    const chats = screen.getByRole('navigation', { name: 'Chats' })
    expect(within(chats).getByRole('button', { name: 'Pulsatilla keynotes?' })).toHaveAttribute('aria-current', 'page')

    unmount()
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Pulsatilla keynotes?' })).toBeInTheDocument()
    expect(screen.getByText(/Keynotes/)).toBeInTheDocument()

    const sidebar = screen.getByRole('navigation', { name: 'Chats' })
    await userEvent.click(within(sidebar).getByRole('button', { name: 'New chat' }))
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await userEvent.click(within(sidebar).getByRole('button', { name: 'Pulsatilla keynotes?' }))
    expect(await screen.findByRole('heading', { name: 'Pulsatilla keynotes?' })).toBeInTheDocument()

    // The name starts a new chat too.
    await userEvent.click(within(sidebar).getByRole('button', { name: 'HomeoRemedica' }))
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('deletes a chat after confirmation', async () => {
    serve({ chat: [() => answerStream('Answer.', [citation(1)])] })
    render(<App />)
    await ask('Delete me?')
    await screen.findByText('Answer.')

    await userEvent.click(screen.getByRole('button', { name: 'Delete “Delete me?”' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Your chats will appear here.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(localStorage.getItem('homeoremedica.library.v1')).toBe('[]')
  })

  it('saves a stopped answer', async () => {
    serve({ chat: [(init) => pending(init?.signal)] })
    render(<App />)

    await ask('Slow?')
    await userEvent.click(screen.getByRole('button', { name: 'Stop answering' }))

    const chats = screen.getByRole('navigation', { name: 'Chats' })
    expect(within(chats).getByRole('button', { name: 'Slow?' })).toBeInTheDocument()
  })
})
