/**
 * Onboarding Configuration
 * Role definitions and wizard steps for each user type
 */

import { UserRole, RoleConfig } from '@/types/onboarding';

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  learner: {
    id: 'learner',
    titleEt: 'Õppija',
    descriptionEt: 'Kuula sõnade ja lausete korrektset hääldust. Uuri sõnade hääldusvariandid.',
    ctaText: 'Hakkan õppima',
    mascotVariant: 'wave',
    steps: [
      {
        id: 'input',
        title: 'Sisesta lause',
        description: 'Kirjuta siia sõna või lause, mille hääldust soovid kuulata.',
        targetSelector: '[data-onboarding-target="sentence-1-input"]',
        position: 'bottom'
      },
      {
        id: 'play',
        title: 'Kuula hääldust',
        description: 'Vajuta, et kuulata sisestatud teksti korrektset hääldust.',
        targetSelector: '[data-onboarding-target="sentence-1-play"]',
        position: 'left'
      },
      {
        id: 'variants',
        title: 'Uuri sõna variante',
        description: 'Kliki sõnal, et näha erinevaid häälduse variante.',
        targetSelector: '[data-onboarding-target="sentence-0-tag-0"]',
        position: 'bottom'
      },
      {
        id: 'add-sentence',
        title: 'Lisa rohkem lauseid',
        description: 'Lisa mitu lauset ja kuula neid järjest.',
        targetSelector: '[data-onboarding-target="add-sentence-button"]',
        position: 'top'
      },
      {
        id: 'save-task',
        title: 'Salvesta ülesandesse',
        description: 'Salvesta harjutatud laused hilisemaks kasutamiseks.',
        targetSelector: '[data-onboarding-target="save-to-task-button"]',
        position: 'bottom'
      }
    ]
  },
  teacher: {
    id: 'teacher',
    titleEt: 'Õpetaja',
    descriptionEt: 'Loo ja jaga õppijatega ülesanded korrektse eesti keelse häälduse harjutamiseks.',
    ctaText: 'Hakkan looma',
    mascotVariant: 'point',
    steps: [
      {
        id: 'input',
        title: 'Sisesta lause',
        description: 'Kirjuta siia sõna või lause, mille hääldust soovid kuulata.',
        targetSelector: '[data-onboarding-target="sentence-1-input"]',
        position: 'bottom'
      },
      {
        id: 'play',
        title: 'Kuula hääldust',
        description: 'Vajuta, et kuulata sisestatud teksti korrektset hääldust.',
        targetSelector: '[data-onboarding-target="sentence-1-play"]',
        position: 'left'
      },
      {
        id: 'add-sentence',
        title: 'Lisa rohkem lauseid',
        description: 'Lisa mitu lauset ja kuula neid järjest.',
        targetSelector: '[data-onboarding-target="add-sentence-button"]',
        position: 'top'
      },
      {
        id: 'variants',
        title: 'Uuri sõna variante',
        description: 'Kliki sõnal, et näha erinevaid häälduse variante.',
        targetSelector: '[data-onboarding-target="sentence-0-tag-0"]',
        position: 'bottom'
      },
      {
        id: 'create-task',
        title: 'Loo ülesanne',
        description: 'Lisa laused ülesandesse, et jagada neid õppijatega.',
        targetSelector: '[data-onboarding-target="save-to-task-button"]',
        position: 'bottom'
      }
    ]
  },
  specialist: {
    id: 'specialist',
    titleEt: 'Kõnesünteesi spetsialist',
    descriptionEt: 'Tööta sõnade ja lausete kõnesünteesiga. Uuri ja loo oma hääldusvariandid.',
    ctaText: 'Hakkan uurima',
    mascotVariant: 'think',
    steps: [
      {
        id: 'input',
        title: 'Sisesta lause',
        description: 'Kirjuta siia sõna või lause, mille hääldust soovid kuulata.',
        targetSelector: '[data-onboarding-target="sentence-1-input"]',
        position: 'bottom'
      },
      {
        id: 'play',
        title: 'Kuula hääldust',
        description: 'Vajuta, et kuulata sisestatud teksti korrektset hääldust.',
        targetSelector: '[data-onboarding-target="sentence-1-play"]',
        position: 'left'
      },
      {
        id: 'add-sentence',
        title: 'Lisa rohkem lauseid',
        description: 'Lisa mitu lauset ja kuula neid järjest.',
        targetSelector: '[data-onboarding-target="add-sentence-button"]',
        position: 'top'
      },
      {
        id: 'variants',
        title: 'Uuri hääldusvariandid',
        description: 'Vali sobiv hääldusvariant või loo enda oma, ning kasuta ta lauses.',
        targetSelector: '[data-onboarding-target="sentence-0-tag-0"]',
        position: 'bottom'
      },
      {
        id: 'phonetic-form',
        title: 'Uuri foneetilist kuju',
        description: 'Ava menüüst "Uuri foneetilist kuju", et näha ja muuta lause foneetilist esitust.',
        targetSelector: '[data-onboarding-target="sentence-0-menu"]',
        position: 'left'
      }
    ]
  }
};

export const STORAGE_KEY = 'eki_onboarding';
