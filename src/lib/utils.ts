import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string, resolving Tailwind CSS conflicts.
 * @param {...ClassValue} inputs - A list of class names or class value objects.
 * @returns {string} A string of combined and merged class names.
 * @example cn("p-4", "font-bold", { "bg-red-500": hasError });
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
