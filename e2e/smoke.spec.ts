import { ask, expect, openApp, replies, test } from './fixtures.ts'

test('answers a question from the books, citing its sources', async ({ page }) => {
  await openApp(page)
  // A case: the app shows the symptoms it read and answers once they are confirmed.
  await ask(page, 'Irritable, chilly and oversensitive to noise, worse in the morning', { wait: false })
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('button', { name: 'Stop answering' })).toBeHidden()

  const reply = replies(page).last()
  await expect(reply.getByRole('alert')).toBeHidden()
  await reply.getByRole('button', { name: /^\d+ references?$/ }).click()
  await expect(page.getByRole('region', { name: 'References' }).getByRole('listitem').first()).toBeVisible()
  await page.getByRole('button', { name: 'Close references' }).click()

  await reply.getByRole('button', { name: /^Source \d+$/ }).first().click()
  await expect(page.getByRole('button', { name: 'Close source' })).toBeVisible()
})
