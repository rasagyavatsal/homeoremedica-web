import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/*
 * Source data stores remedy names in ledger caps ("ARSENICUM ALBUM").
 * Serif display contexts read better in title case; data stays untouched.
 */
export function formatRemedyDisplayName(name: string) {
  return name
    .toLowerCase()
    .replace(/(^|[\s\-–—(."'/])(\p{L})/gu, (_, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`)
}
