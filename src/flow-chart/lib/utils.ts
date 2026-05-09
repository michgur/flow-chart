import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Invert<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

export function invert<T extends Record<PropertyKey, PropertyKey>>(record: T): Invert<T> {
  return Object.fromEntries(Object.entries(record).map(([k, v]) => [v, k])) as any;
}
