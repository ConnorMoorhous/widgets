<?php
class YouTubeWidget {
    private $apiKey;
    private $channelId;
    private $cacheFile;
    private $cacheExpiration;

    // Default credentials
    private static $defaultApiKey = 'YOUR_API_KEY';
    private static $defaultChannelId = 'YOUR_CHANNEL_ID';

    public function __construct($apiKey = null, $channelId = null, $cacheExpiration = 3600) {
        $this->apiKey = $apiKey ?? self::$defaultApiKey;
        $this->channelId = $channelId ?? self::$defaultChannelId;
        $this->cacheFile = __DIR__ . "/youtube_cache_{$this->channelId}.json";
        $this->cacheExpiration = $cacheExpiration;
    }

    private function fetchFromAPI() {
        $apiUrl = "https://www.googleapis.com/youtube/v3";
        $videosToFetch = 15;

        // Fetch channel data
        $channelUrl = "{$apiUrl}/channels?part=snippet,statistics&id={$this->channelId}&key={$this->apiKey}";
        $channelResponse = @file_get_contents($channelUrl);
        if ($channelResponse === false) {
            return null; // Return null if API call fails
        }
        $channelData = json_decode($channelResponse, true);
        if (!isset($channelData['items'][0])) {
            return null; // Return null if expected data is missing
        }

        // Fetch videos
        $videosUrl = "{$apiUrl}/search?part=snippet&channelId={$this->channelId}&maxResults={$videosToFetch}&order=date&type=video&key={$this->apiKey}";
        $videosResponse = @file_get_contents($videosUrl);
        if ($videosResponse === false) {
            return null; // Return null if API call fails
        }
        $videosData = json_decode($videosResponse, true);
        if (!isset($videosData['items'])) {
            return null; // Return null if expected data is missing
        }

        return [
            'channel' => $channelData['items'][0],
            'videos' => $videosData['items']
        ];
    }

    private function getCachedData() {
        if (file_exists($this->cacheFile) && (time() - filemtime($this->cacheFile) < $this->cacheExpiration)) {
            return json_decode(file_get_contents($this->cacheFile), true);
        }
        return null;
    }

    private function cacheData($data) {
        file_put_contents($this->cacheFile, json_encode($data));
    }

    public function getData() {
        $cachedData = $this->getCachedData();
        if ($cachedData) {
            return $cachedData;
        }

        $freshData = $this->fetchFromAPI();
        if ($freshData !== null) {
            $this->cacheData($freshData);
        }
        return $freshData;
    }

    public function render() {
        $data = $this->getData();
        $jsonData = json_encode($data);

        echo "<div id='cm-widgets-yt-channel-container'></div>";
        echo "<script>
            window.YT_WIDGET_DATA = {$jsonData};
        </script>";
        echo "<script src='/include/widgets/youtube/main.js'></script>";
    }
}

function render_youtube_channel_widget($apiKey = null, $channelId = null) {
    $widget = new YouTubeWidget($apiKey, $channelId);
    $widget->render();
}
?>