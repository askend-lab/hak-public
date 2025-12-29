import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          "header.title1": "Estonian Speech Synthesis",
          "hero.title": "Eesti keele kõnesüntees",
          "hero.subtitle": "Sisesta tekst või sõna, et kuulata selle hääldust ja uurida variante",
          "buttons.remove": "Eemalda",
          "buttons.addToTask": "Lisa ülesandesse",
          "buttons.playAll": "Mängi kõik",
          "buttons.addSentence": "Lisa lause",
          "input.placeholder": "Kirjuta oma lause siia"
        }
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
