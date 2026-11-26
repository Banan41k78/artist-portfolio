// =========================================
// ОБЩИЕ СКРИПТЫ САЙТА
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    const MOBILE_BREAKPOINT = 960;

    /* -----------------------------------------
       Подложка под мобильное меню
       ----------------------------------------- */
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    /* -----------------------------------------
       Шапка: тень при прокрутке
       ----------------------------------------- */
    const header = document.querySelector('header');
    const updateHeaderShadow = () => {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 8);
    };
    updateHeaderShadow();
    window.addEventListener('scroll', updateHeaderShadow, { passive: true });

    /* -----------------------------------------
       Мобильное меню
       ----------------------------------------- */
    const burgerBtn = document.getElementById('burgerBtn');
    const navMenu = document.getElementById('navMenu');

    if (burgerBtn && navMenu) {
        const setMenu = (open) => {
            burgerBtn.classList.toggle('active', open);
            navMenu.classList.toggle('active', open);
            backdrop.classList.toggle('active', open);
            document.body.classList.toggle('menu-open', open);
            burgerBtn.setAttribute('aria-expanded', String(open));
            burgerBtn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
        };

        burgerBtn.addEventListener('click', () => {
            setMenu(!navMenu.classList.contains('active'));
        });

        backdrop.addEventListener('click', () => setMenu(false));

        // Закрываем меню после перехода по ссылке
        navMenu.addEventListener('click', (event) => {
            if (event.target.closest('a')) setMenu(false);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                setMenu(false);
                burgerBtn.focus();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT && navMenu.classList.contains('active')) {
                setMenu(false);
            }
        });
    }

    /* -----------------------------------------
       Год в подвале
       ----------------------------------------- */
    document.querySelectorAll('[data-year]').forEach((element) => {
        element.textContent = String(new Date().getFullYear());
    });

    /* -----------------------------------------
       Галерея: фильтры и модальное окно
       ----------------------------------------- */
    const gallery = document.getElementById('grid');

    if (gallery) {
        const cards = Array.from(gallery.querySelectorAll('.card'));
        const filterButtons = Array.from(document.querySelectorAll('.filters button'));
        const status = document.getElementById('galleryStatus');
        const emptyState = document.getElementById('galleryEmpty');

        const plural = (count, one, few, many) => {
            const mod100 = count % 100;
            if (mod100 >= 11 && mod100 <= 14) return many;
            const mod10 = count % 10;
            if (mod10 === 1) return one;
            if (mod10 >= 2 && mod10 <= 4) return few;
            return many;
        };

        const updateStatus = (visibleCount) => {
            if (!status) return;
            status.textContent = `Показано: ${visibleCount} ${plural(visibleCount, 'работа', 'работы', 'работ')}`;
        };

        const applyFilter = (filter) => {
            let visibleCount = 0;

            cards.forEach((card) => {
                const categories = (card.dataset.cat || '').split(/\s+/);
                const isVisible = filter === 'all' || categories.includes(filter);
                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) visibleCount += 1;
            });

            filterButtons.forEach((button) => {
                const isActive = button.dataset.filter === filter;
                button.classList.toggle('active', isActive);
                button.setAttribute('aria-pressed', String(isActive));
            });

            if (emptyState) emptyState.hidden = visibleCount > 0;
            updateStatus(visibleCount);
        };

        filterButtons.forEach((button) => {
            button.setAttribute('aria-pressed', String(button.classList.contains('active')));
            button.addEventListener('click', () => applyFilter(button.dataset.filter || 'all'));
        });

        updateStatus(cards.length);

        /* ---------- Модальное окно ---------- */
        const overlay = document.getElementById('overlay');
        const closeBtn = document.getElementById('close');
        const mTitle = document.getElementById('mTitle');
        const mMeta = document.getElementById('mMeta');
        const mDesc = document.getElementById('mDesc');
        const mImage = document.getElementById('mImage');

        if (overlay && closeBtn && mTitle && mMeta && mDesc && mImage) {
            let lastFocused = null;

            const openModal = (card) => {
                lastFocused = document.activeElement;
                mTitle.textContent = card.dataset.title || '';
                mMeta.textContent = card.dataset.meta || '';
                mDesc.textContent = card.dataset.desc || '';
                mImage.src = card.dataset.img || '';
                mImage.alt = `Картина «${card.dataset.title || ''}», ${card.dataset.meta || ''}`;
                overlay.classList.add('active');
                overlay.setAttribute('aria-hidden', 'false');
                document.body.classList.add('modal-open');
                closeBtn.focus();
            };

            const closeModal = () => {
                if (!overlay.classList.contains('active')) return;
                overlay.classList.remove('active');
                overlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('modal-open');
                if (lastFocused && typeof lastFocused.focus === 'function') {
                    lastFocused.focus();
                }
            };

            cards.forEach((card) => {
                card.setAttribute('role', 'button');
                card.setAttribute('tabindex', '0');

                card.addEventListener('click', () => openModal(card));
                card.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openModal(card);
                    }
                });
            });

            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) closeModal();
            });

            document.addEventListener('keydown', (event) => {
                if (!overlay.classList.contains('active')) return;

                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeModal();
                    return;
                }

                // Удерживаем фокус внутри модального окна
                if (event.key === 'Tab') {
                    const focusable = Array.from(
                        overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
                    ).filter((element) => !element.hidden && element.offsetParent !== null);

                    if (focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];

                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first.focus();
                    }
                }
            });
        }
    }

    /* -----------------------------------------
       Форма заявки
       ----------------------------------------- */
    const form = document.getElementById('contactForm');

    if (form) {
        const success = document.getElementById('formSuccess');

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            if (success) {
                success.hidden = false;
                success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            form.reset();
        });
    }
});
