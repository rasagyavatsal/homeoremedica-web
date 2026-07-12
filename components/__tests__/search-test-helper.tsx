import { screen, fireEvent, act } from '@testing-library/react';
import { vi } from 'vitest';

export const SEARCH_PLACEHOLDER = 'Search symptom keywords…';

export function getSearchInput() {
  return screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
}

export async function typeSearchQuery(value: string, advanceTime: number = 350) {
  const input = getSearchInput();
  await act(async () => {
    fireEvent.change(input, { target: { value } });
  });
  if (advanceTime > 0) {
    await act(async () => {
      vi.advanceTimersByTime(advanceTime);
    });
  }
  return input;
}
