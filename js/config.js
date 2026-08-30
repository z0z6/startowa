const DEFAULTS = {
    bgColor: '#d6d6d6',
    gridEnabled: false,
    gridColor: '#000000',
    gridDensity: 5,
    gridThickness: 0.5,
    gridSpeedX: -88,
    gridSpeedY: -91,
    desktop_vr_x: 50, desktop_vr_y: 50, desktop_vr_size: 1.0,
    desktop_panel_x: 50, desktop_panel_y: 50, desktop_panel_size: 1.0,
    desktop_panel_opacity: 0.9, desktop_panel_brightness: 1.3,
    desktop_panel_title: 'IMAGINARIUM',
    desktop_panel_content_desc: 'wirtualna przestrzeń wystawowa',
    desktop_panel_btn_desc: 'W A S D — ruch | mysz — rozglądanie | SHIFT — bieg',
    desktop_wallpaper_index: 2, desktop_wallpaper_brightness: 1.05, desktop_wallpaper_blur: 0,
    desktop_rotation_direction: 1, desktop_rotation_speed: 0.1,
    desktop_tilt_direction: 'front-right', desktop_tilt_angle: 15,
    android_vr_x: 50, android_vr_y: 20, android_vr_size: 0.9,
    android_panel_x: 50, android_panel_y: 90, android_panel_size: 0.9,
    android_panel_opacity: 0.9, android_panel_brightness: 1.3,
    android_panel_title: 'IMAGINARIUM',
    android_panel_content_desc: 'wirtualna przestrzeń wystawowa',
    android_panel_btn_desc: 'Dotknij, aby wybrać tryb',
    android_wallpaper_index: 2, android_wallpaper_brightness: 1.05, android_wallpaper_blur: 0,
    android_rotation_direction: 1, android_rotation_speed: 0.1,
    android_tilt_direction: 'front-right', android_tilt_angle: 15,
    wallpaperEnabled: true
};

const CONFIG_VERSION = '7';
const VERSION_KEY = 'metaverse_configVersion';

function migrateIfNeeded() {
    try {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        if (storedVersion === CONFIG_VERSION) return;
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('metaverse_') && k !== VERSION_KEY) toRemove.push(k);
        }
        toRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(VERSION_KEY, CONFIG_VERSION);
    } catch (e) {}
}
migrateIfNeeded();

export const Config = {
    get(key) {
        try {
            const val = localStorage.getItem('metaverse_' + key);
            if (val === null) return DEFAULTS[key];
            if (typeof DEFAULTS[key] === 'boolean') return val === 'true';
            if (typeof DEFAULTS[key] === 'number') return parseFloat(val);
            return val;
        } catch(e) { return DEFAULTS[key]; }
    },
    set(key, value) {
        try { localStorage.setItem('metaverse_' + key, value); } catch(e) {}
        window.dispatchEvent(new CustomEvent('configchange', { detail: { key, value } }));
    },
    getAll() {
        const out = {};
        for (const key in DEFAULTS) out[key] = this.get(key);
        return out;
    },
    exportJSON() {
        return JSON.stringify(this.getAll(), null, 2);
    },
    importJSON(json) {
        try {
            const obj = JSON.parse(json);
            for (const key in DEFAULTS) {
                if (obj[key] !== undefined) this.set(key, obj[key]);
            }
            return true;
        } catch(e) { return false; }
    }
};
