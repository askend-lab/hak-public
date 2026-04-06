// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Centralized Estonian UI strings.
 * Extracted from hooks and components to enable future i18n migration.
 */

export const TASK_STRINGS = {
  ADDED_TO_TASK: "Lisatud ülesandesse",
  ADDED_ENTRY: (taskName: string) => `Lause lisatud ülesandesse ${taskName}!`,
  ADDED_ENTRIES: (count: number, taskName: string) =>
    `${count} ${count === 1 ? "lause" : "lauset"} lisatud ülesandesse ${taskName}!`,
  ADD_ENTRIES_FAILED: "Lausete lisamine ebaõnnestus",
  TASK_CREATED: "Ülesanne loodud",
  TASK_CREATED_DETAIL: (name: string) => `${name} loodud!`,
  TASK_UPDATED: (name: string) => `Ülesanne "${name}" uuendatud!`,
  TASK_UPDATE_FAILED: "Ülesande uuendamine ebaõnnestus",
  TASK_DELETED: (name: string) => `Ülesanne "${name}" kustutatud!`,
  TASK_DELETE_FAILED: "Ülesande kustutamine ebaõnnestus",
  VIEW_TASK: "Vaata ülesannet",
} as const;

export const VARIANTS_STRINGS = {
  NOT_FOUND: "Variante ei leitud",
  NOT_FOUND_DESC: "Sõna ei leidu eesti keeles või on valesti kirjutatud.",
  TIMEOUT: "Päring aegus",
  TIMEOUT_DESC: "Variantide laadimine võttis liiga kaua.",
  LOAD_FAILED: "Variantide laadimine ebaõnnestus",
} as const;

export const SYNTHESIS_STRINGS = {
  ADD_SENTENCE: "Lisa lause",
  TAG_MENU_VARIANTS: "Vali sõna häälduskuju",
  TAG_MENU_EDIT: "Muuda sõna kirjakuju",
  TAG_MENU_DELETE: "Kustuta sõna",
} as const;

export const ERROR_STRINGS = {
  RATE_LIMIT: "Liiga palju päringuid",
  RATE_LIMIT_DESC: "Proovi mõne hetke pärast uuesti.",
  SERVICE_BUSY: "Teenus on ajutiselt ülekoormatud",
  SERVICE_BUSY_DESC: "Proovi mõne hetke pärast uuesti.",
  BLOCKED: "Ligipääs keelatud",
  BLOCKED_DESC: "Päring blokeeriti.",
  SYNTHESIS_FAILED: "Kõnesüntees ebaõnnestus",
  SYNTHESIS_FAILED_DESC: "Proovi uuesti.",
  SYNTHESIS_TIMEOUT: "Kõnesüntees aegus",
  SYNTHESIS_TIMEOUT_DESC: "Teksti ei õnnestunud töödelda. Proovi teistsugust teksti.",
} as const;

export const MODAL_STRINGS = {
  PHONETIC_APPLIED: "Lause uus häälduskuju rakendatud",
  DELETE_TASK_TITLE: "Kustuta ülesanne",
  DELETE_TASK_CONFIRM: (name: string) =>
    `Kas oled kindel, et soovid ülesande "${name}" kustutada?`,
  DELETE_TASK_BUTTON: "Kustuta",
  DELETE_TASK_CANCEL: "Tühista",
} as const;
