(function () {
    const header = document.getElementById('main-header');
    if (!header) return;
    const video = header.querySelector('.header-video');
    const section = document.querySelector('section');

    // splash + audio
    const splash = document.getElementById('splash');
    const audio = document.getElementById('page-audio');
    const DEFAULT_AUDIO_VOLUME = 0.05; // halkabb (10%)

    function revealFromSplash() {
        if (splash) {
            const pill = splash.querySelector('.pill-img');
            // ha van pill, várjuk meg a 4s zsugorodó animáció végét, csak utána adjuk hozzá a page-loaded osztályt
            if (pill) {
                // indítjuk a zsugorodást és az overlay eltűnését
                pill.classList.add('shrink');
                splash.classList.add('hidden');

                const onPillEnd = () => {
                    // animáció vége -> mutatjuk az oldalt, indítjuk a zenét és eltávolítjuk a splash-t
                    document.body.classList.remove('splash-visible');
                    document.body.classList.add('page-loaded');

                    if (audio) {
                        audio.volume = DEFAULT_AUDIO_VOLUME;
                        audio.muted = false;
                        audio.play().catch(()=>{ /* autoplay blokkolva lehet */ });
                    }

                    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
                    pill.removeEventListener('animationend', onPillEnd);
                };

                pill.addEventListener('animationend', onPillEnd);
            } else {
                // fallback: ha nincs pill elem
                splash.classList.add('hidden');
                splash.addEventListener('transitionend', () => {
                    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
                }, { once: true });

                document.body.classList.remove('splash-visible');
                document.body.classList.add('page-loaded');

                if (audio) {
                    audio.volume = DEFAULT_AUDIO_VOLUME;
                    audio.muted = false;
                    audio.play().catch(()=>{});
                }
            }
        } else {
            // nincs splash -> azonnal láthatóvá tesszük a tartalmat
            document.body.classList.remove('splash-visible');
            document.body.classList.add('page-loaded');

            if (audio) {
                audio.volume = DEFAULT_AUDIO_VOLUME;
                audio.muted = false;
                audio.play().catch(()=>{});
            }
        }
    }

    if (splash) {
        // biztosítjuk, hogy a splash overlay blokkolja a görgetést
        document.body.classList.add('splash-visible');

        // egér / érintés
        splash.addEventListener('click', (e) => {
            e.preventDefault();
            revealFromSplash();
        });

        // billentyűzet (Enter / Space)
        splash.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                revealFromSplash();
            }
        });
    } else {
        // ha nincs splash (pl. már eltávolítva), biztosítsuk a page-loaded osztályt
        document.body.classList.add('page-loaded');
    }

    function updateOnScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const h = header.offsetHeight || window.innerHeight;
        const progress = Math.min(Math.max(scrollY / (h * 0.8), 0), 1);

        // videó elhalványítása és enyhe skálázás
        if (video) {
            video.style.opacity = String(1 - progress);
            video.style.transform = `scale(${1 + progress * 0.04})`;
        }

        // header összenyomás kis görgetésnél
        if (scrollY > h * 0.12) header.classList.add('shrink');
        else header.classList.remove('shrink');

        // section megjelenítése
        if (section) {
            if (scrollY > Math.max(20, h * 0.02)) section.classList.add('visible');
            else section.classList.remove('visible');
        }
    }

    // azonnali inicializálás
    updateOnScroll();

    // ha nincs splash, addoljuk a page-loaded-ot betöltéskor
    if (!splash) {
        function markPageLoaded() {
            requestAnimationFrame(() => requestAnimationFrame(() => {
                document.body.classList.add('page-loaded');
            }));
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', markPageLoaded);
        } else {
            markPageLoaded();
        }
    }

    window.addEventListener('scroll', updateOnScroll, { passive: true });
    window.addEventListener('resize', updateOnScroll);

    // IntersectionObserver opcionális fallback a section pontos megjelenítéséhez
    if (section && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) section.classList.add('visible');
                else {
                    if (window.scrollY < header.offsetHeight * 0.02) section.classList.remove('visible');
                }
            });
        }, { threshold: 0.05 });
        io.observe(section);
    }
})();
