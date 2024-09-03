import { YouTubeChannelWidget } from './script.js';

const API_KEY = 'YOUR_API_KEY';
const CHANNEL_ID = 'YOUR_CHANNEL_ID';
const API_URL = 'https://www.googleapis.com/youtube/v3';
const VIDEOS_TO_FETCH = 15;

async function fetchChannelData() {
    const url = `${API_URL}/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items[0];
}

async function fetchVideos() {
    const url = `${API_URL}/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${VIDEOS_TO_FETCH}&order=date&type=video&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.items;
}

let widget;

async function initializeWidget() {
    widget = new YouTubeChannelWidget('cm-widgets-yt-channel-container');

    try {
        const [channelData, videosData] = await Promise.all([
            fetchChannelData(),
            fetchVideos()
        ]);
        
        const widgetData = {
            channel: channelData,
            videos: videosData
        };

        widget.update(widgetData);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', initializeWidget);
