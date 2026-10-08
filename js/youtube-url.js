(function (app) {
  'use strict';

  const ID_RE = /^[A-Za-z0-9_-]{11}$/;
  const YT_HOST_RE = /^(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com)$/;
  const ID_PATH_PREFIXES = ['embed', 'shorts', 'live', 'v'];

  function extractVideoId(input) {
    if (typeof input !== 'string') return null;
    const raw = input.trim();
    if (!raw) return null;
    if (ID_RE.test(raw)) return raw;

    let url;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
    } catch {
      return null;
    }

    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);
    let id = null;

    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = parts[0];
    } else if (YT_HOST_RE.test(host)) {
      if (parts[0] === 'watch') id = url.searchParams.get('v');
      else if (ID_PATH_PREFIXES.includes(parts[0])) id = parts[1];
    }

    return id && ID_RE.test(id) ? id : null;
  }

  app.parseYouTubeUrl = function (input) {
    const videoId = extractVideoId(input);
    if (!videoId) return null;
    return {
      videoId,
      embedUrl: 'https://www.youtube-nocookie.com/embed/' + videoId,
      watchUrl: 'https://www.youtube.com/watch?v=' + videoId,
      thumbnail: 'https://i.ytimg.com/vi/' + videoId + '/hqdefault.jpg',
    };
  };
})((window.Coro = window.Coro || {}));
