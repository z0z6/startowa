import { Config } from './config.js';

const IS_MOBILE = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  || (navigator.maxTouchPoints > 1 && window.innerWidth < 900);

export function getPlatform() {
    return IS_MOBILE ? 'android' : 'desktop';
}

export function applyPanelToElement(element, prefix, containerEl = null) {
    if (!element) return;

    const x = Config.get(prefix + 'panel_x');
    const y = Config.get(prefix + 'panel_y');
    const size = Config.get(prefix + 'panel_size');
    const opacity = Config.get(prefix + 'panel_opacity');
    const brightness = Config.get(prefix + 'panel_brightness');

    const refW = containerEl ? containerEl.clientWidth : window.innerWidth;
    const refH = containerEl ? containerEl.clientHeight : window.innerHeight;

    if (containerEl) {
        element.style.position = 'absolute';
    } else {
        element.style.position = 'fixed';
    }

    const prevTransform = element.style.transform;
    element.style.transform = 'none';

    const baseW = element.offsetWidth || 1;
    const baseH = element.offsetHeight || 1;

    const scaledW = baseW * size;
    const scaledH = baseH * size;

    const maxOffsetX = Math.max(0, refW - scaledW);
    const maxOffsetY = Math.max(0, refH - scaledH);

    const leftPx = (x / 100) * maxOffsetX + scaledW / 2;
    const topPx = (y / 100) * maxOffsetY + scaledH / 2;

    element.style.left = leftPx + 'px';
    element.style.top = topPx + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    element.style.transform = `translate(-50%, -50%) scale(${size})`;
    element.style.transformOrigin = 'center center';
    element.style.opacity = opacity;
    element.style.filter = `brightness(${brightness})`;
    element.style.webkitFilter = `brightness(${brightness})`;

    if (prevTransform && prevTransform !== 'none' && !size) {
        element.style.transform = prevTransform;
    }

    const titleEl = element.querySelector('h1');
    const descEl = element.querySelector('p:not(.hint):not(.preview-desc)');
    const hintEl = element.querySelector('.hint');
    if (titleEl) titleEl.textContent = Config.get(prefix + 'panel_title');
    if (descEl) descEl.textContent = Config.get(prefix + 'panel_content_desc');
    if (hintEl) hintEl.textContent = Config.get(prefix + 'panel_btn_desc');
}

export function getGogglePosition(prefix) {
    const x = Config.get(prefix + 'vr_x');
    const y = Config.get(prefix + 'vr_y');
    return {
        x: ((x / 50) - 1) * 4.5,
        y: (1 - (y / 50)) * 3.0
    };
}
