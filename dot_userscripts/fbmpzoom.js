// ==UserScript==
// @name         Facebook Marketplace Image Zoom
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Small item view zoom on marketplace
// @author       Jackson
// @match        https://www.facebook.com/marketplace/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log('[mpzoom] init');

    const style = document.createElement('style');
    style.textContent = `
        .marketplace-zoom-container {
            position: relative;
            display: inline-block;
            overflow: visible !important;
        }

        .zoom-lens {
            position: absolute;
            border: 1px solid #d4d4d4;
            width: 400px;
            height: 400px;
            pointer-events: none;
            visibility: hidden;
            z-index: 10000;
            background: no-repeat;
            background-size: cover;
            border-radius: 4px;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }

        .zoom-toggle-btn {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10001;
            padding: 8px 16px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-family: Arial, sans-serif;
        }

        .zoom-toggle-btn:hover {
            background: #0056b3;
        }

        .zoom-toggle-btn.active {
            background: #28a745;
        }
    `;
    document.head.appendChild(style);

    function setupZoom() {
        const images = document.querySelectorAll('img.xz74otr:not([data-zoom-applied])');

        console.log(`[mpzoom] found ${images.length} elements`);

        images.forEach((img) => {
            if (img.tagName !== 'IMG' || img.closest('video') || img.src.includes('video')) {
                console.log(`[mpzoom] skipping non-image or video-related element: ${img.src}`);
                return;
            }

            const container = document.createElement('div');
            container.className = 'marketplace-zoom-container';

            const button = document.createElement('button');
            button.className = 'zoom-toggle-btn';
            button.textContent = 'Enable Zoom';
            let zoomEnabled = false;
            let lens = null;

            img.parentNode.insertBefore(container, img);
            container.appendChild(img);
            container.appendChild(button);
            img.dataset.zoomApplied = 'true';

            // Position button
            const carousel = img.closest('div')?.nextElementSibling;
            const hasCarousel = carousel && carousel.classList.contains('x1ja2u2z') &&
                  carousel.classList.contains('x78zum5') &&
                  carousel.classList.contains('xl56j7k') &&
                  carousel.classList.contains('xh8yej3');

            button.style.bottom = hasCarousel ?
                `${carousel.getBoundingClientRect().top - img.getBoundingClientRect().bottom + 10}px` :
            '10px';

            const zoomFactor = 2;
            const lensSize = 400;

            function createLens() {
                lens = document.createElement('div');
                lens.className = 'zoom-lens';
                container.appendChild(lens);
                return lens;
            }

            function destroyLens() {
                if (lens) {
                    container.removeChild(lens);
                    lens = null;
                }
            }

            function handleMouseMove(e) {
                if (!zoomEnabled || !lens) return;

                const rect = img.getBoundingClientRect();
                let x = e.pageX - rect.left - window.scrollX;
                let y = e.pageY - rect.top - window.scrollY;

                x = Math.max(lensSize / 2, Math.min(x, rect.width - lensSize / 2));
                y = Math.max(lensSize / 2, Math.min(y, rect.height - lensSize / 2));

                lens.style.left = `${x - lensSize / 2}px`;
                lens.style.top = `${y - lensSize / 2}px`;
                lens.style.visibility = 'visible';

                const bgX = (x / rect.width) * img.naturalWidth * zoomFactor - lensSize / 2;
                const bgY = (y / rect.height) * img.naturalHeight * zoomFactor - lensSize / 2;
                lens.style.backgroundImage = `url(${img.src})`;
                lens.style.backgroundSize = `${img.naturalWidth * zoomFactor}px ${img.naturalHeight * zoomFactor}px`;
                lens.style.backgroundPosition = `-${bgX}px -${bgY}px`;
            }

            function handleMouseLeave() {
                if (!zoomEnabled || !lens) return;
                lens.style.visibility = 'hidden';
            }

            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);

            button.addEventListener('click', () => {
                zoomEnabled = !zoomEnabled;
                button.textContent = zoomEnabled ? 'Disable Zoom' : 'Enable Zoom';
                button.classList.toggle('active', zoomEnabled);

                if (zoomEnabled) {
                    createLens();
                    console.log('[mpzoom] Zoom enabled, lens created');
                } else {
                    destroyLens();
                    console.log('[mpzoom] Zoom disabled, lens destroyed');
                }
            });

            container.style.width = `${img.width}px`;
            container.style.height = `${img.height}px`;
        });
    }

    console.log('[mpzoom] applying');
    setupZoom();
})();