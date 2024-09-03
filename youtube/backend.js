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

async function fetchData() {
    try {
        const [channelData, videosData] = await Promise.all([
            fetchChannelData(),
            fetchVideos()
        ]);
        
        window.YT_WIDGET_DATA = {
            channel: channelData,
            videos: videosData
        };

        console.log('YouTube widget data fetched and set successfully');

    } catch (error) {
        console.error('Error fetching YouTube data:', error);
    }
}

document.addEventListener('DOMContentLoaded', fetchData);
