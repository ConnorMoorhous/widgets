export class YouTubeChannelWidget {
    constructor(containerId, data = null) {
        this.containerId = containerId;
        this.currentIndex = 0;
        this.totalVideos = 0;
        this.player = null;

        // Constants
        this.VIDEOS_PER_PAGE = 3;

        this.init();
        if (data) {
            this.update(data);
        }
    }

    async init() {
        await this.injectCSS();
        await this.injectHTML();
        this.initWidget();
    }

    async injectCSS() {
        const response = await fetch('styles.css');
        const css = await response.text();
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    async injectHTML() {
        const response = await fetch('widget.html');
        const html = await response.text();

        // const html = `
        //         <div class="channel-info" id="channelInfo">
        //             <div class="channel-info-placeholder">
        //                 <div class="channel-logo placeholder-avatar animated-background"></div>
        //                 <div class="channel-details">
        //                     <div class="placeholder-line channel-name-placeholder animated-background"></div>
        //                     <div class="placeholder-line channel-stats-placeholder animated-background"></div>
        //                 </div>
        //                 <div class="placeholder-subscribe-button animated-background"></div>
        //             </div>
        //         </div>
        //         <div class="videos-container">
        //             <button id="prevButton" class="nav-button placeholder-nav-button animated-background">
        //                 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        //                     <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        //                 </svg>
        //             </button>
        //             <div class="videos-wrapper">
        //                 <div class="videos-slider" id="videosSlider">
        //                     <div class="video-item-placeholder">
        //                         <div class="video-thumbnail-placeholder animated-background"></div>
        //                         <div class="video-info-placeholder">
        //                             <div class="placeholder-line animated-background"></div>
        //                             <div class="placeholder-line animated-background"></div>
        //                         </div>
        //                     </div>
        //                     <div class="video-item-placeholder">
        //                         <div class="video-thumbnail-placeholder animated-background"></div>
        //                         <div class="video-info-placeholder">
        //                             <div class="placeholder-line animated-background"></div>
        //                             <div class="placeholder-line animated-background"></div>
        //                         </div>
        //                     </div>
        //                     <div class="video-item-placeholder">
        //                         <div class="video-thumbnail-placeholder animated-background"></div>
        //                         <div class="video-info-placeholder">
        //                             <div class="placeholder-line animated-background"></div>
        //                             <div class="placeholder-line animated-background"></div>
        //                         </div>
        //                     </div>
        //                 </div>
        //             </div>
        //             <button id="nextButton" class="nav-button placeholder-nav-button animated-background">
        //                 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        //                     <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        //                 </svg>
        //             </button>
        //         </div>
        //         <div class="pagination" id="pagination">
        //             <!-- Pagination indicators will be populated here -->
        //         </div>
        //     </div>
        //     <div id="videoModal" class="cm-widgets-yt-channel-modal">
        //         <div class="modal-content">
        //             <button class="close" aria-label="Close video">
        //                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        //                     <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        //                     <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        //                 </svg>
        //             </button>
        //             <div id="videoPlayerWrapper">
        //                 <div id="videoPlayer"></div>
        //             </div>
        //         </div>
        //     </div>
        // </div>
        // <div id="videoModal" class="cm-widgets-yt-channel-modal">
        //     <div class="modal-content">
        //         <button class="close" aria-label="Close video">
        //             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        //                 <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        //                 <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        //             </svg>
        //         </button>
        //         <div id="videoPlayerWrapper">
        //             <div id="videoPlayer"></div>
        //         </div>
        //     </div>`;

        const container = document.getElementById(this.containerId);
        if (container) {
            container.classList.add('cm-widgets-yt-channel');
            container.innerHTML = html;
        } else {
            console.error(`Container with id "${this.containerId}" not found.`);
        }
    }

    initWidget() {
        this.setupEventListeners();
        this.loadYouTubeIframeAPI();
    }

    update(data) {
        this.currentIndex = 0;
        this.totalVideos = data.videos.length;
        this.updateHeader(data.channel);
        this.updateVideoSlider(data.videos);
    }

    updateHeader(channel) {
        if (!channel) return;

        const { snippet, statistics } = channel;
        const { title, thumbnails } = snippet;
        const { subscriberCount, videoCount, viewCount } = statistics;
        
        const channelInfo = document.getElementById('channelInfo');
        channelInfo.innerHTML = `
            <a href="https://www.youtube.com/channel/${channel.id}" target="_blank" rel="noopener noreferrer" class="channel-link">
                <img class="channel-logo" src="${thumbnails.default.url}" alt="${title}">
                <div class="channel-details">
                    <h2 class="channel-name">${title}</h2>
                    <p class="channel-stats">${Number(subscriberCount).toLocaleString()} Subscribers • ${Number(videoCount).toLocaleString()} Videos • ${Number(viewCount).toLocaleString()} Views</p>
                </div>
            </a>
            <a href="https://www.youtube.com/channel/${channel.id}?sub_confirmation=1" target="_blank" rel="noopener noreferrer" class="subscribe-button">
                <svg class="youtube-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                Subscribe
            </a>
        `;
    }

    updateVideoSlider(videos) {
        if (!videos || videos.length === 0) return;

        const videosSlider = document.getElementById('videosSlider');
        videosSlider.innerHTML = '';
        
        videos.forEach(video => {
            const videoElement = this.createVideoElement(video);
            videosSlider.appendChild(videoElement);
        });

        prevButton.classList.remove('placeholder-nav-button', 'animated-background');
        nextButton.classList.remove('placeholder-nav-button', 'animated-background');

        this.updatePagination();
        this.updateSliderPosition();
    }

    createVideoElement(video) {
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
        videoElement.addEventListener('click', () => this.openVideoModal(video.id.videoId));
        return videoElement;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.totalVideos/ this.VIDEOS_PER_PAGE);
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        for (let i = 0; i < totalPages; i++) {
            const pageIndicator = this.createPageIndicator(i);
            pagination.appendChild(pageIndicator);
        }
    }

    createPageIndicator(index) {
        const pageIndicator = document.createElement('div');
        pageIndicator.className = `page-indicator${index === this.currentIndex ? ' active' : ''}`;
        pageIndicator.addEventListener('click', () => {
            this.currentIndex = index;
            this.updateSliderPosition();
            this.updatePaginationIndicators();
        });
        return pageIndicator;
    }

    updateSliderPosition() {
        const videosSlider = document.getElementById('videosSlider');
        const videoItem = document.querySelector('.video-item');
        const { gap } = window.getComputedStyle(videosSlider);
        const slideWidth = videoItem.offsetWidth + parseInt(gap);
        videosSlider.style.transform = `translateX(-${this.currentIndex * slideWidth * this.VIDEOS_PER_PAGE}px)`;
    }

    updatePaginationIndicators() {
        const indicators = document.querySelectorAll('.page-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    handlePrevClick() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateSliderPosition();
            this.updatePaginationIndicators();
        }
    }

    handleNextClick() {
        const totalPages = Math.ceil(this.totalVideos / this.VIDEOS_PER_PAGE);
        if (this.currentIndex < totalPages - 1) {
            this.currentIndex++;
            this.updateSliderPosition();
            this.updatePaginationIndicators();
        }
    }

    openVideoModal(videoId) {
        const modal = document.getElementById('videoModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        this.player.loadVideoById(videoId);
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            if (this.player && this.player.stopVideo) {
                this.player.stopVideo();
            }
        }, 300);
    }

    setupEventListeners() {
        document.getElementById('prevButton').addEventListener('click', () => this.handlePrevClick());
        document.getElementById('nextButton').addEventListener('click', () => this.handleNextClick());
        document.querySelector('.close').addEventListener('click', () => this.closeVideoModal());
        window.onclick = (event) => {
            if (event.target === document.getElementById('videoModal')) {
                this.closeVideoModal();
            }
        };
    }

    loadYouTubeIframeAPI() {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.player = new YT.Player('videoPlayer', {
                height: '360',
                width: '640',
                videoId: '',
                playerVars: {
                    'autoplay': 1,
                    'modestbranding': 1,
                    'rel': 0
                }
            });
        };
    }
}
