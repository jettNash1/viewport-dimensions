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
            hideAfter: 10000
        };
        this.hideTimeout = null;
        this.pollingInterval = null;
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    async initialize() {
        await this.loadSettings();
        this.createContainer();
        this.setupResizeObserver();
        this.updateDimensions();
        this.applyVisibility();
        this.startPolling();
    }

    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }

        this.pollingInterval = setInterval(() => {
            this.checkForSettingsUpdates();
        }, 500);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkForSettingsUpdates();
            }
        });

        window.addEventListener('focus', () => {
            this.checkForSettingsUpdates();
        });
    }

    async checkForSettingsUpdates() {
        try {
            const result = await chrome.storage.sync.get('viewportSettings');
            if (result.viewportSettings) {
                const newSettings = JSON.stringify(result.viewportSettings);
                const oldSettings = JSON.stringify(this.settings);
                
                if (newSettings !== oldSettings) {
                    console.log('New settings detected:', result.viewportSettings);
                    this.settings = result.viewportSettings;
                    
                    // Recreate the container to ensure clean styling
                    this.recreateContainer();
                }
            }
        } catch (error) {
            console.error('Error checking for settings updates:', error);
        }
    }

    recreateContainer() {
        if (this.container) {
            this.container.remove();
        }
        this.createContainer();
        this.updateDimensions();
        this.applyVisibility();
    }

    applyVisibility() {
        if (!this.container) return;
        
        // Handle enabled/disabled state
        this.container.style.display = this.settings.enabled ? 'flex' : 'none';
        if (!this.settings.enabled) return;
        
        // Handle always show vs timeout behavior
        if (this.settings.alwaysShow) {
            this.container.style.opacity = '1';
            clearTimeout(this.hideTimeout);
        } else {
            this.container.style.opacity = '1';
            clearTimeout(this.hideTimeout);
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
                this.settings = result.viewportSettings;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    createContainer() {
        // Remove any existing container first
        const existingContainer = document.getElementById('viewport-dimensions-display');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create a fresh container
        this.container = document.createElement('div');
        this.container.id = 'viewport-dimensions-display';
        
        // Apply base styles that don't change
        const baseStyles = {
            position: 'fixed',
            padding: '8px 12px',
            borderRadius: '4px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            zIndex: '9999999',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };
        
        // Apply all base styles
        Object.assign(this.container.style, baseStyles);
        
        // Apply position-specific styles (separate from updateContainerStyles for clarity)
        this.applyPositionStyles();
        
        // Apply visual styling (colors, fonts)
        this.applyVisualStyles();
        
        // Add to document
        document.body.appendChild(this.container);
    }
    
    applyPositionStyles() {
        // Reset all position properties first
        this.container.style.top = 'auto';
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
        this.container.style.left = 'auto';
        
        // Apply only the necessary position properties
        switch (this.settings.position) {
            case 'top-left':
                this.container.style.top = '16px';
                this.container.style.left = '16px';
                break;
                
            case 'top-right':
                this.container.style.top = '16px';
                this.container.style.right = '16px';
                break;
                
            case 'bottom-left':
                this.container.style.bottom = '16px';
                this.container.style.left = '16px';
                break;
                
            case 'bottom-right':
            default:
                this.container.style.bottom = '16px';
                this.container.style.right = '16px';
                break;
        }
    }
    
    applyVisualStyles() {
        // Apply color and font settings
        this.container.style.color = this.settings.textColor;
        this.container.style.fontSize = this.getFontSize();
        
        // Apply background color with opacity
        const hexOpacity = Math.round(this.settings.bgOpacity * 255).toString(16).padStart(2, '0');
        this.container.style.backgroundColor = `${this.settings.bgColor}${hexOpacity}`;
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
            
            if (!this.settings.alwaysShow && this.settings.enabled) {
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
        if (!this.container) return;
        
        const width = Math.round(window.innerWidth);
        const height = Math.round(window.innerHeight);
        this.container.textContent = `${width}px × ${height}px`;
    }
}

// Initialize the viewport display
const viewportDisplay = new ViewportDisplay();

// Listen for settings updates as a backup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'settingsUpdated') {
        viewportDisplay.settings = message.settings;
        viewportDisplay.recreateContainer();
        
        if (sendResponse) {
            sendResponse({ success: true });
        }
        return true;
    }
}); 