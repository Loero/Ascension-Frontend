(function () {
    const header = document.getElementById('main-header');
    if (!header) return;
    const video = header.querySelector('.header-video');
    const section = document.querySelector('section');

    // splash + audio
    const splash = document.getElementById('splash');
    const audio = document.getElementById('page-audio');
    const pillAudio = document.getElementById('pill-audio');
    const volumeToggle = document.getElementById('volume-toggle');
    const DEFAULT_AUDIO_VOLUME = 0.15; // halkabb (5%)

    function revealFromSplash() {
        if (splash) {
            const pill = splash.querySelector('.pill-img');
            // 2s pirula fade, majd +2s header megjelenés és zene
            if (pill) {
                // indítsuk a pirula fadet
                pill.classList.add('fade');
                const caption = splash.querySelector('.pill-caption');
                if (caption) caption.classList.add('fade');

                // a splash marad fekete háttér, ne ugorjon el azonnal
                // 2s után jelenjen meg a header (page-loaded), de a splash még legyen látható
                setTimeout(() => {
                    document.body.classList.remove('splash-visible');
                    document.body.classList.add('page-loaded');

                    // még várunk további 2s, mielőtt a splash teljesen eltűnik és a zene indul
                    setTimeout(() => {
                        splash.classList.add('hidden');
                        splash.addEventListener('transitionend', () => {
                            if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
                        }, { once: true });

                        if (audio) {
                            audio.volume = DEFAULT_AUDIO_VOLUME;
                            audio.muted = false;
                            audio.play().catch(()=>{ /* autoplay blokkolva lehet */ });
                        }
                    }, 2000);
                }, 2000);
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
    const pill = splash.querySelector('.pill-img');
    const caption = splash.querySelector('.pill-caption');
    // csak a felirat interaktív

        // Caption ugyanúgy viselkedik
        if (caption) {
            caption.setAttribute('tabindex', '0');
            const handleActivate = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (pillAudio) {
                    pillAudio.volume = DEFAULT_AUDIO_VOLUME;
                    pillAudio.muted = false;
                    pillAudio.currentTime = 0;
                    pillAudio.play().catch(()=>{});
                }
                // tartós nagyítás
                caption.classList.add('active');
                revealFromSplash();
            };
            caption.addEventListener('click', handleActivate);
            caption.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') handleActivate(e);
            });
        }
    } else {
        // ha nincs splash (pl. már eltávolítva), biztosítsuk a page-loaded osztályt
        document.body.classList.add('page-loaded');
    }

    // Hangerő gomb logika
    if (volumeToggle && audio) {
        // állapot beállítása kezdetben
        const setMutedState = (muted) => {
            audio.muted = muted;
            volumeToggle.classList.toggle('muted', muted);
            volumeToggle.setAttribute('aria-pressed', muted ? 'true' : 'false');
            volumeToggle.title = muted ? 'Hang bekapcsolása' : 'Hang kikapcsolása';
        };
        setMutedState(audio.muted);

        volumeToggle.addEventListener('click', () => {
            setMutedState(!audio.muted);
            // ha bekapcsoljuk a hangot és még nem indult, próbáljuk elindítani
            if (!audio.muted && audio.paused) {
                audio.volume = DEFAULT_AUDIO_VOLUME;
                audio.play().catch(()=>{});
            }
        });
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
