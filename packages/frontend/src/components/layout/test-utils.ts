import { useTranslation } from 'react-i18next';

export const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const DEFAULT_TRANSLATIONS: Record<string, string> = {
  'header.title1': 'EESTI KEELE',
  'header.title2': 'HÄÄLDUSABILINE',
  'nav.synthesis': 'Süntees',
  'nav.tasks': 'Ülesanded',
};

export function setupI18nMock(extraTranslations: Record<string, string> = {}): void {
  const translations = { ...DEFAULT_TRANSLATIONS, ...extraTranslations };
  
  mockUseTranslation.mockReturnValue({
    t: (key: string) => translations[key] ?? key,
    i18n: { changeLanguage: jest.fn() },
  } as jest.Mocked<ReturnType<typeof useTranslation>>);
}
