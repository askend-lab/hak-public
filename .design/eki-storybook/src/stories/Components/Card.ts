import { createAvatar } from "./Avatar";
import "../assets/scss/components/_card.scss";

export interface Card {
  cardMediaDisplay?: boolean;
  cardMedia?: string;
  cardTitle?: string;
  titleAvatar?: boolean;
  cardText?: string;
  cardDateDisplay?: boolean;
  cardAuthor?: string;
  cardDate?: string;
  cardCountDisplay?: boolean;
  cardCount?: number;
  displayAvatar?: boolean;
}

export const createCard = ({
  cardMediaDisplay = false,
  cardMedia,
  cardTitle = "New feature available on Devias",
  titleAvatar = false,
  cardText = "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  cardDateDisplay = false,
  cardAuthor = "John Doe",
  cardDate = "Feb 28, 2025",
  displayAvatar = false,
}: Card): HTMLDivElement => {
  const card = document.createElement("div");
  card.className = "card";

  if (cardMediaDisplay) {
    const img = document.createElement("img");
    const placeholderSrc = new URL("../assets/img/placeholder.png", import.meta.url).toString();
    
    img.src = cardMedia ? cardMedia : placeholderSrc;
    img.alt = "Card Media";
    img.className = "card__media";
    card.appendChild(img);
  }

  const header = document.createElement("div");
  header.className = "card__header";

  const cardContent = document.createElement("div");
  cardContent.className = "card__content";

  if (cardDateDisplay) {
    const author = document.createElement("span");
    author.className = "card__author";
    author.innerText = cardAuthor;
  
    const date = document.createElement("span");
    date.className = "card__date";
    date.innerText = cardDate;

    header.appendChild(author);
    header.appendChild(document.createTextNode(" • "));
    header.appendChild(date);
    cardContent.appendChild(header);
  }

  const title = document.createElement("h3");
  title.className = "card__title";
  title.innerText = cardTitle;
  cardContent.appendChild(title);

  if (titleAvatar) {
    title.className = "card__title card__title--avatar";

    const avatar = document.createElement("div");
    avatar.classList.add("card__title__avatar");

    avatar.innerText = "OP";

    title.appendChild(avatar);
  }

  const content = document.createElement("p");
  content.className = "card__text";
  content.innerText = cardText;
  cardContent.appendChild(content);

  card.appendChild(cardContent);

  if (displayAvatar) {
    const cardActions = document.createElement("div");
    cardActions.className = "card__footer";

    const avatar = createAvatar({
      initials: "OP",
      title: "Security",
      avatarCountDisplay: true,
      avatarCount: 2,
    });
    cardActions.appendChild(avatar);

    card.appendChild(cardActions);
  }

  return card;
};