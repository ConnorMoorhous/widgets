// Configuration
const API_KEY = 'APIKEY';
const CHANNEL_ID = 'CHANNELID';
const VIDEOS_TO_FETCH = 15;
const VIDEOS_PER_PAGE = 3;
const API_URL = 'https://www.googleapis.com/youtube/v3';

// State
let allVideos = [];
let currentIndex = 0;
let player;

// API Functions
const fetchChannelData = async () => {
    const response = await fetch(`${API_URL}/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${API_KEY}`);
    const data = await response.json();
    return data.items[0];
};

const fetchVideos = async () => {
    const response = await fetch(`${API_URL}/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${VIDEOS_TO_FETCH}&order=date&type=video&key=${API_KEY}`);
    const data = await response.json();
    return data.items;
};

// UI Update Functions
const updateChannelInfo = ({ snippet, statistics }) => {
    const { title, thumbnails } = snippet;
    const { subscriberCount, videoCount, viewCount } = statistics;
    
    const channelInfo = document.getElementById('channelInfo');
    channelInfo.innerHTML = `
        <a href="https://www.youtube.com/channel/${CHANNEL_ID}" target="_blank" rel="noopener noreferrer" class="channel-link">
            <img class="channel-logo" src="${thumbnails.default.url}" alt="${title}">
            <div class="channel-details">
                <h2 class="channel-name">${title}</h2>
                <p class="channel-stats">${Number(subscriberCount).toLocaleString()} Subscribers • ${Number(videoCount).toLocaleString()} Videos • ${Number(viewCount).toLocaleString()} Views</p>
            </div>
        </a>
        <a href="https://www.youtube.com/channel/${CHANNEL_ID}?sub_confirmation=1" target="_blank" rel="noopener noreferrer" class="subscribe-button">
            <svg class="youtube-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Subscribe
        </a>
    `;
};

const updateVideos = () => {
    const videosSlider = document.getElementById('videosSlider');
    videosSlider.innerHTML = '';
    
    if (allVideos.length === 0) {
        videosSlider.innerHTML = '<div class="error">No videos found for this channel.</div>';
        return;
    }

    allVideos.forEach(video => {
        const videoElement = createVideoElement(video);
        videosSlider.appendChild(videoElement);
    });

    updatePagination();
    updateSliderPosition();
};

const createVideoElement = (video) => {
    const videoElement = document.createElement('div');
    videoElement.className = 'video-item';
    videoElement.innerHTML = `
        <div class="video-thumbnail" style="background-image: url(${video.snippet.thumbnails.medium.url});">
            <div class="play-button"></div>
        </div>
        <div class="video-info">
            <h3 class="video-title" title="${video.snippet.title}">${video.snippet.title}</h3>
            <p class="video-date">${new Date(video.snippet.publishedAt).toLocaleDateString()}</p>
        </div>
    `;
    videoElement.addEventListener('click', () => openVideoModal(video.id.videoId));
    return videoElement;
};

const updateSliderPosition = () => {
    const videosSlider = document.getElementById('videosSlider');
    const videoItem = document.querySelector('.video-item');
    const { gap } = window.getComputedStyle(videosSlider);
    const slideWidth = videoItem.offsetWidth + parseInt(gap);
    videosSlider.style.transform = `translateX(-${currentIndex * slideWidth * VIDEOS_PER_PAGE}px)`;
};

const updatePagination = () => {
    const totalPages = Math.ceil(allVideos.length / VIDEOS_PER_PAGE);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const pageIndicator = createPageIndicator(i);
        pagination.appendChild(pageIndicator);
    }
};

const createPageIndicator = (index) => {
    const pageIndicator = document.createElement('div');
    pageIndicator.className = `page-indicator${index === currentIndex ? ' active' : ''}`;
    pageIndicator.addEventListener('click', () => {
        currentIndex = index;
        updateSliderPosition();
        updatePaginationIndicators();
    });
    return pageIndicator;
};

const updatePaginationIndicators = () => {
    const indicators = document.querySelectorAll('.page-indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentIndex);
    });
};

// Event Handlers
const handlePrevClick = () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateSliderPosition();
        updatePaginationIndicators();
    }
};

const handleNextClick = () => {
    const totalPages = Math.ceil(allVideos.length / VIDEOS_PER_PAGE);
    if (currentIndex < totalPages - 1) {
        currentIndex++;
        updateSliderPosition();
        updatePaginationIndicators();
    }
};

// YouTube Player Functions
function onYouTubeIframeAPIReady() {
    player = new YT.Player('videoPlayer', {
        height: '360',
        width: '640',
        videoId: '',
        playerVars: {
            'autoplay': 1,
            'modestbranding': 1,
            'rel': 0
        }
    });
}

const openVideoModal = (videoId) => {
    const modal = document.getElementById('videoModal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
    player.loadVideoById(videoId);
};

const closeVideoModal = () => {
    const modal = document.getElementById('videoModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        if (player && player.stopVideo) {
            player.stopVideo();
        }
    }, 300);
};

// Initialization
const initWidget = async () => {
    const channelInfo = document.getElementById('channelInfo');
    const videosSlider = document.getElementById('videosSlider');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');

    prevButton.classList.add('placeholder-nav-button');
    nextButton.classList.add('placeholder-nav-button');

    try {
        const channel = await fetchChannelData();
        channelInfo.innerHTML = '';
        updateChannelInfo(channel);

        allVideos = await fetchVideos();
        videosSlider.innerHTML = '';
        updateVideos();

        prevButton.classList.remove('placeholder-nav-button', 'animated-background');
        nextButton.classList.remove('placeholder-nav-button', 'animated-background');
    } catch (error) {
        console.error('Error fetching data:', error);
        videosSlider.innerHTML = '<div class="error">Error loading videos. Please try again later.</div>';
    }
};

// Event Listeners
document.getElementById('prevButton').addEventListener('click', handlePrevClick);
document.getElementById('nextButton').addEventListener('click', handleNextClick);
document.querySelector('.close').addEventListener('click', closeVideoModal);
window.onclick = (event) => {
    if (event.target === document.getElementById('videoModal')) {
        closeVideoModal();
    }
};

// Initialize
initWidget();

// Load YouTube IFrame API
(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();
