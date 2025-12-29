import feather from 'feather-icons';
import '../assets/scss/components/_pagination.scss';

export interface Pagination {
  count: number;
  shape: string;
  showArrows?: boolean;
  showAll?: boolean;
  onClick?: () => void;
}

export const createPagination = ({
  count,
  shape = 'circular',
  showArrows = false,
  showAll = true,
  onClick,
}: Pagination): HTMLDivElement => {
  const paginationContainer = document.createElement('div');
  paginationContainer.classList.add('pagination__container', 'pagination');

  const paginationUl = document.createElement('ul');
  paginationUl.classList.add('pagination__list');

  const handlePageClick = (event: Event) => {
    event.preventDefault();
    const activeClass = 'pagination__item--active';

    const currentActive = paginationUl.querySelector(`.${activeClass}`);
    if (currentActive) {
      currentActive.classList.remove(activeClass);
    }

    const target = event.currentTarget as HTMLElement;
    const targetItem = target.parentElement;
    if (targetItem && targetItem.classList.contains('pagination__item')) {
      targetItem.classList.add(activeClass);
    }

    if (onClick) {
      onClick();
    }

    updateArrowState();
  };

  const createPageItem = (pageNumber: number, isActive: boolean = false) => {
    const paginationLi = document.createElement('li');
    paginationLi.classList.add('pagination__item');

    if (isActive) {
      paginationLi.classList.add('pagination__item--active');
    }

    const paginationLink = document.createElement('a');
    paginationLink.href = '#';
    paginationLink.textContent = `${pageNumber}`;
    paginationLink.addEventListener('click', handlePageClick);

    paginationLi.appendChild(paginationLink);
    paginationLi.classList.add(`pagination__item--${shape}`);

    return paginationLi;
  };

  const updateArrowState = () => {
    const currentActive = paginationUl.querySelector('.pagination__item--active');
    const prevLink = paginationUl.querySelector('.pagination__link--prev');
    const nextLink = paginationUl.querySelector('.pagination__link--next');

    if (currentActive) {
      const firstPage = paginationUl.firstChild as HTMLElement | null;
      const lastPage = paginationUl.lastChild as HTMLElement | null;

      const isFirstPage = firstPage ? currentActive.isEqualNode(firstPage.nextElementSibling as HTMLElement) : false;
      const isLastPage = lastPage ? currentActive.isEqualNode(lastPage.previousElementSibling as HTMLElement) : false;

      if (prevLink) {
        prevLink.classList.toggle('pagination__link--disabled', !!isFirstPage);
      }
      if (nextLink) {
        nextLink.classList.toggle('pagination__link--disabled', !!isLastPage);
      }
    }
  };

  if (showArrows) {
    const prevLi = document.createElement('li');

    const prevLink = document.createElement('a');
    prevLink.href = '#';
    prevLink.classList.add('pagination__link', 'pagination__link--prev');
    prevLink.innerHTML = feather.icons['chevron-left'].toSvg();
    prevLink.addEventListener('click', (event) => {
      event.preventDefault();

      const currentActive = paginationUl.querySelector('.pagination__item--active');
      const prevItem = currentActive?.previousElementSibling as HTMLElement;
      if (prevItem && prevItem.classList.contains('pagination__item')) {
        currentActive?.classList.remove('pagination__item--active');
        prevItem.classList.add('pagination__item--active');
        updateArrowState();
      }
    });

    prevLi.appendChild(prevLink);
    paginationUl.appendChild(prevLi);
  }

  if (showAll || count <= 4) {
    for (let i = 0; i < count; i++) {
      paginationUl.appendChild(createPageItem(i + 1, i === 0));
    }
  } else {
    paginationUl.appendChild(createPageItem(1, true));
    paginationUl.appendChild(createPageItem(2));

    const ellipsisLi = document.createElement('li');
    ellipsisLi.classList.add('pagination__item');
    ellipsisLi.textContent = '...';
    paginationUl.appendChild(ellipsisLi);

    paginationUl.appendChild(createPageItem(count - 1));
    paginationUl.appendChild(createPageItem(count));
  }

  if (showArrows) {
    const nextLi = document.createElement('li');

    const nextLink = document.createElement('a');
    nextLink.href = '#';
    nextLink.classList.add('pagination__link', 'pagination__link--next');
    nextLink.innerHTML = feather.icons['chevron-right'].toSvg();
    nextLink.addEventListener('click', (event) => {
      event.preventDefault();

      const currentActive = paginationUl.querySelector('.pagination__item--active');
      const nextItem = currentActive?.nextElementSibling as HTMLElement;
      if (nextItem && nextItem.classList.contains('pagination__item')) {
        currentActive?.classList.remove('pagination__item--active');
        nextItem.classList.add('pagination__item--active');
        updateArrowState();
      }
    });

    nextLi.appendChild(nextLink);
    paginationUl.appendChild(nextLi);
  }

  paginationContainer.appendChild(paginationUl);
  updateArrowState();

  return paginationContainer;
};
