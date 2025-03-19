class ViewportDisplay {
    constructor() {
        this.container = null;
        this.settings = {
            enabled: true,
            position: 'bottom-right',
            fontSize: 'medium',
            textColor: '#FFFFFF',
            bgColor: '#000000',
            bgOpacity: 0.7,
            alwaysShow: false,
            hideAfter: 1000
        };
        this.hideTimeout = null;
        this.init();
    }

    async init() {
        // Make sure to wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initialize();
            });
        } else {
            this.initialize();
        }
    }

    async initialize() {
        await this.loadSettings();
        this.createContainer();
        this.setupResizeObserver();
        this.updateDimensions();
        
        // Show immediately if alwaysShow is enabled
        if (this.settings.alwaysShow) {
            this.container.style.opacity = '1';
        } else {
            // Show for initial period then hide
            this.container.style.opacity = '1';
            this.hideTimeout = setTimeout(() => {
                if (!this.settings.alwaysShow) {
                    this.container.style.opacity = '0';
                }
            }, this.settings.hideAfter);
        }
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get('viewportSettings');
            if (result.viewportSettings) {
                this.settings = { ...this.settings, ...result.viewportSettings };
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    createContainer() {
        // Remove any existing container to avoid duplicates
        const existingContainer = document.getElementById('viewport-dimensions-display');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        this.container = document.createElement('div');
        this.container.id = 'viewport-dimensions-display';
        this.updateContainerStyles();
        document.body.appendChild(this.container);
    }

    updateContainerStyles() {
        const styles = {
            position: 'fixed',
            padding: '8px 12px',
            borderRadius: '4px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            zIndex: '9999999',
            transition: 'opacity 0.3s ease',
            color: this.settings.textColor,
            fontSize: this.getFontSize(),
            opacity: this.settings.enabled ? '1' : '0',
            pointerEvents: 'none'
        };

        // Set background color with opacity
        const hexOpacity = Math.round(this.settings.bgOpacity * 255).toString(16).padStart(2, '0');
        styles.backgroundColor = `${this.settings.bgColor}${hexOpacity}`;

        // Position styles
        switch (this.settings.position) {
            case 'top-left':
                styles.top = '16px';
                styles.left = '16px';
                break;
            case 'top-right':
                styles.top = '16px';
                styles.right = '16px';
                break;
            case 'bottom-left':
                styles.bottom = '16px';
                styles.left = '16px';
                break;
            case 'bottom-right':
            default:
                styles.bottom = '16px';
                styles.right = '16px';
                break;
        }

        Object.assign(this.container.style, styles);
    }

    getFontSize() {
        switch (this.settings.fontSize) {
            case 'small': return '12px';
            case 'large': return '16px';
            case 'medium':
            default: return '14px';
        }
    }

    setupResizeObserver() {
        window.addEventListener('resize', () => {
            this.updateDimensions();
            
            if (!this.settings.alwaysShow) {
                clearTimeout(this.hideTimeout);
                this.container.style.opacity = '1';
                
                this.hideTimeout = setTimeout(() => {
                    if (!this.settings.alwaysShow) {
                        this.container.style.opacity = '0';
                    }
                }, this.settings.hideAfter);
            }
        });
    }

    updateDimensions() {
        const width = Math.round(window.innerWidth);
        const height = Math.round(window.innerHeight);
        this.container.textContent = `${width}px × ${height}px`;
    }
}

// Initialize the viewport display
const viewportDisplay = new ViewportDisplay();

// Listen for settings updates from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdated') {
        viewportDisplay.settings = { ...viewportDisplay.settings, ...message.settings };
        viewportDisplay.updateContainerStyles();
        viewportDisplay.updateDimensions();
        
        if (viewportDisplay.settings.alwaysShow) {
            viewportDisplay.container.style.opacity = '1';
        }
        
        sendResponse({ success: true });
        return true; // Indicate we'll respond asynchronously
    }
}); 