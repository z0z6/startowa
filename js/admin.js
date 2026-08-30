import { Config } from './config.js';
import { init, setPreviewPlatform, updateGogglePosition } from './vr-headset-bg.js';
import { applyPanelToElement } from './panelConfig.js';

const $ = id => document.getElementById(id);

const ADMIN_KEYS = [
    'desktop_vr_x', 'desktop_vr_y', 'desktop_vr_size',
    'desktop_panel_x', 'desktop_panel_y',
    'desktop_panel_size', 'desktop_panel_opacity', 'desktop_panel_brightness',
    'desktop_panel_title', 'desktop_panel_content_desc', 'desktop_panel_btn_desc',
    'desktop_wallpaper_index', 'desktop_wallpaper_brightness', 'desktop_wallpaper_blur',
    'desktop_rotation_direction', 'desktop_rotation_speed',
    'desktop_tilt_direction', 'desktop_tilt_angle',
    'android_vr_x', 'android_vr_y', 'android_vr_size',
    'android_panel_x', 'android_panel_y',
    'android_panel_size', 'android_panel_opacity', 'android_panel_brightness',
    'android_panel_title', 'android_panel_content_desc', 'android_panel_btn_desc',
    'android_wallpaper_index', 'android_wallpaper_brightness', 'android_wallpaper_blur',
    'android_rotation_direction', 'android_rotation_speed',
    'android_tilt_direction', 'android_tilt_angle',
    'wallpaperEnabled', 'bgColor'
];

let currentPreviewPlatform = 'desktop';

function getPreviewRoot() {
    return document.querySelector('.admin-preview');
}

function placeCanvasForPlatform(platform) {
    const canvasContainer = $('canvas-container');
    const phoneFrame = $('phone-frame');
    const previewRoot = getPreviewRoot();
    if (!canvasContainer || !previewRoot) return;

    if (platform === 'android' && phoneFrame) {
        // Canvas w ramce telefonu — te same proporcje co smartfon
        if (canvasContainer.parentElement !== phoneFrame) {
            phoneFrame.insertBefore(canvasContainer, phoneFrame.firstChild);
        }
        canvasContainer.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
    } else {
        // Canvas na pełny podgląd desktop
        if (canvasContainer.parentElement !== previewRoot) {
            previewRoot.insertBefore(canvasContainer, previewRoot.firstChild);
        }
        canvasContainer.style.cssText =
            'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
    }

    // Odśwież rozmiar WebGL po przeniesieniu kontenera
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
    });
}

function updateUIFromConfig() {
    ADMIN_KEYS.forEach(key => {
        const el = $(key);
        if (!el) return;
        const val = Config.get(key);
        if (el.type === 'checkbox') {
            el.checked = val;
        } else {
            el.value = val;
        }
        updateBadge(key, val);
    });
    updateMockPanel(currentPreviewPlatform);
}

function updateBadge(key, val) {
    const badge = $(key + '_val');
    if (badge) {
        if (key.includes('opacity') || key.includes('size') || key.includes('brightness') || key.includes('speed')) {
            badge.textContent = parseFloat(val).toFixed(2);
        } else if (key.includes('angle')) {
            badge.textContent = val + '°';
        } else if (key === 'bgColor') {
            badge.textContent = val;
        } else {
            badge.textContent = val;
        }
    }
    if (key === 'bgColor') {
        const colorBadge = $('bgColorVal');
        if (colorBadge) colorBadge.textContent = val;
    }
}

function updateMockPanel(platform) {
    currentPreviewPlatform = platform;

    placeCanvasForPlatform(platform);

    if (platform === 'desktop') {
        $('desktop-preview').style.display = 'block';
        $('android-preview').style.display = 'none';
        $('btnPreviewDesktop').classList.add('active');
        $('btnPreviewAndroid').classList.remove('active');

        // Panel względem pełnego okna podglądu (jak na desktopie względem viewportu)
        applyPanelToElement($('mock-panel-desktop'), 'desktop_', getPreviewRoot());
    } else {
        $('desktop-preview').style.display = 'none';
        $('android-preview').style.display = 'flex';
        $('btnPreviewDesktop').classList.remove('active');
        $('btnPreviewAndroid').classList.add('active');

        // Panel względem ramki telefonu (jak na telefonie względem viewportu)
        applyPanelToElement($('mock-panel-android'), 'android_', $('phone-frame'));
    }

    setPreviewPlatform(platform);
    updateGogglePosition();
}

function bindEvents() {
    ADMIN_KEYS.forEach(key => {
        const el = $(key);
        if (!el) return;

        const handler = () => {
            let val = el.type === 'checkbox' ? el.checked : el.value;
            if (el.type !== 'checkbox' && el.type === 'range') {
                val = parseFloat(val);
            }
            Config.set(key, val);
            updateBadge(key, val);

            if (key === 'bgColor') {
                document.body.style.background = val;
                const preview = getPreviewRoot();
                if (preview) preview.style.background = val;
            }

            if (key.startsWith('desktop_') && currentPreviewPlatform === 'desktop') {
                updateMockPanel('desktop');
            } else if (key.startsWith('android_') && currentPreviewPlatform === 'android') {
                updateMockPanel('android');
            } else if (key === 'wallpaperEnabled') {
                updateMockPanel(currentPreviewPlatform);
            }
        };

        el.addEventListener('input', handler);
        el.addEventListener('change', handler);
    });

    $('btnPreviewDesktop').addEventListener('click', () => updateMockPanel('desktop'));
    $('btnPreviewAndroid').addEventListener('click', () => updateMockPanel('android'));

    $('exportBtn').addEventListener('click', () => {
        const blob = new Blob([Config.exportJSON()], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'config.json';
        a.click();
    });

    $('importBtn').addEventListener('click', () => $('importFile').click());
    $('importFile').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            if (Config.importJSON(ev.target.result)) {
                updateUIFromConfig();
                alert('Konfiguracja zaimportowana pomyślnie!');
            } else {
                alert('Błąd: Nieprawidłowy format pliku JSON');
            }
        };
        reader.readAsText(file);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.background = Config.get('bgColor');
    init('canvas-container', { forcePlatform: 'desktop' });
    updateUIFromConfig();
    bindEvents();
});
