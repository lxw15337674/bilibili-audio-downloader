import 'server-only'
import type { Locale } from './config'
import type { Dictionary } from './types'

const dictionaries = {
    zh: () => import('./dictionaries/zh.json').then((module) => module.default),
    'zh-tw': () => import('./dictionaries/zh-tw.json').then((module) => module.default),
    en: () => import('./dictionaries/en.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => dictionaries?.[locale]() 