import { YouTubeChannelWidget } from './YouTubeChannelWidget.js';

let widget; 

function initializeWidget() {
    widget = new YouTubeChannelWidget('cm-widgets-yt-channel-container');

    if (typeof window.YT_WIDGET_DATA !== 'undefined') {
        widget.update(window.YT_WIDGET_DATA);
    }
}

function updateWidget() {
    if (typeof window.YT_WIDGET_DATA !== 'undefined') {
        widget.update(window.YT_WIDGET_DATA);
        console.log('Widget updated with data');
    } else {
        console.log('YouTube widget data not found, retrying...');
        setTimeout(updateWidget, 500); // Retry after 500ms
    }
}

// Initialize the widget when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeWidget();
    updateWidget();
});