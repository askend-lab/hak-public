import "../assets/scss/components/_avatar.scss";

export interface Avatar {
  initials: string;
  title: string;
  avatarCountDisplay: boolean;
  avatarCount: number;
}

export const createAvatar = ({
  initials,
  title,
  avatarCountDisplay,
  avatarCount,
}: Avatar): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "avatar__wrapper";

  if (!avatarCountDisplay) {
    const avatar = document.createElement("div");
    avatar.className = "avatar";

    const initialsContainer = document.createElement("div");
    initialsContainer.className = "avatar__initials";
    initialsContainer.innerText = initials.toUpperCase();

    const avatarTitle = document.createElement("span");
    avatarTitle.className = "avatar__title";
    avatarTitle.innerText = title;

    avatar.appendChild(initialsContainer);
    avatar.appendChild(avatarTitle);

    wrapper.appendChild(avatar);
  } else {
    Array.from({ length: avatarCount }).forEach(() => {
      const avatar = document.createElement("div");
      avatar.className = "avatar";

      const initialsContainer = document.createElement("div");
      initialsContainer.className = "avatar__initials";
      initialsContainer.innerText = initials.toUpperCase();

      const avatarTitle = document.createElement("span");
      avatarTitle.className = "avatar__title";
      avatarTitle.innerText = title;

      avatar.appendChild(initialsContainer);
      avatar.appendChild(avatarTitle);

      wrapper.appendChild(avatar);
    });
  }

  return wrapper;
};
