document.addEventListener('DOMContentLoaded', async () => {
    // Get all input elements
    const enableDisplay = document.getElementById('enableDisplay');
    const position = document.getElementById('position');
    const fontSize = document.getElementById('fontSize');
    const textColor = document.getElementById('textColor');
    const bgColor = document.getElementById('bgColor');
    const bgOpacity = document.getElementById('bgOpacity');
    const alwaysShow = document.getElementById('alwaysShow');
    const hideAfter = document.getElementById('hideAfter');
    const saveButton = document.getElementById('saveSettings');

    // Load saved settings
    const result = await chrome.storage.sync.get('viewportSettings');
    const settings = result.viewportSettings || {
        enabled: true,
        position: 'bottom-right',
        fontSize: 'medium',
        textColor: '#FFFFFF', // Changed to white
        bgColor: '#000000',
        bgOpacity: 0.7,
        alwaysShow: false,
        hideAfter: 10000 // Changed to 10000ms
    };

    // Apply saved settings to form
    enableDisplay.checked = settings.enabled;
    position.value = settings.position;
    fontSize.value = settings.fontSize;
    textColor.value = settings.textColor;
    bgColor.value = settings.bgColor;
    bgOpacity.value = settings.bgOpacity;
    alwaysShow.checked = settings.alwaysShow;
    hideAfter.value = settings.hideAfter;

    // Handle hide after input state based on always show
    hideAfter.disabled = settings.alwaysShow;

    // Add event listener for always show checkbox
    alwaysShow.addEventListener('change', (e) => {
        hideAfter.disabled = e.target.checked;
    });

    // Toggle switch functionality
    enableDisplay.addEventListener('change', (e) => {
        // Just update the UI, actual save happens with save button
        // This matches the behavior in the screenshot
    });

    // Save settings
    saveButton.addEventListener('click', async () => {
        try {
            const newSettings = {
                enabled: enableDisplay.checked,
                position: position.value,
                fontSize: fontSize.value,
                textColor: textColor.value,
                bgColor: bgColor.value,
                bgOpacity: parseFloat(bgOpacity.value),
                alwaysShow: alwaysShow.checked,
                hideAfter: parseInt(hideAfter.value)
            };

            // Save to storage
            await chrome.storage.sync.set({ 
                viewportSettings: newSettings,
                // Add a timestamp to detect changes
                settingsUpdatedAt: Date.now()
            });

            // Visual feedback
            saveButton.textContent = 'Saved!';
            setTimeout(() => {
                saveButton.textContent = 'Save Settings';
            }, 1500);
        } catch (error) {
            console.error('Error saving settings:', error);
            saveButton.textContent = 'Error!';
            setTimeout(() => {
                saveButton.textContent = 'Save Settings';
            }, 1500);
        }
    });
}); 