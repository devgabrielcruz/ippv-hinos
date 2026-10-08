(function (app) {
  'use strict';

  const API_SRC = 'https://www.youtube.com/iframe_api';
  const API_TIMEOUT = 12000;
  const STATE_NAMES = { 0: 'ended', 1: 'playing', 2: 'paused', 3: 'buffering', 5: 'cued' };

  let apiPromise = null;

  function loadApi() {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);

      const script = document.createElement('script');
      const timer = setTimeout(() => fail(new Error('timeout')), API_TIMEOUT);

      function fail(err) {
        clearTimeout(timer);
        script.remove();
        window.onYouTubeIframeAPIReady = undefined;
        reject(err);
      }

      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        resolve(window.YT);
      };
      script.src = API_SRC;
      script.async = true;
      script.onerror = () => fail(new Error('network'));
      document.head.appendChild(script);
    }).catch((err) => {
      apiPromise = null;
      throw err;
    });
    return apiPromise;
  }

  function describeError(code) {
    switch (code) {
      case 2:
        return { code, title: 'Link inválido', text: 'O endereço deste vídeo não parece correto.' };
      case 100:
        return { code, title: 'Vídeo indisponível', text: 'Este vídeo foi removido ou está privado.' };
      case 101:
      case 150:
        return { code, title: 'Reprodução bloqueada', text: 'O autor não permite tocar este vídeo fora do YouTube.' };
      case 153:
        return { code, title: 'Não foi possível incorporar', text: 'Abra esta página por um endereço http(s), e não direto do arquivo.' };
      default:
        return { code, title: 'Erro no player', text: 'O YouTube não conseguiu carregar este vídeo.' };
    }
  }

  app.createPlayer = function ({ mount, volume, muted, onReady, onState, onError, onApiFail }) {
    let yt = null;
    let ready = false;
    let pending = null;

    const call = (method, ...args) => {
      if (!ready || !yt || typeof yt[method] !== 'function') return undefined;
      try {
        return yt[method](...args);
      } catch {
        return undefined;
      }
    };

    function handleReady() {
      ready = true;
      call('setVolume', volume);
      call(muted ? 'mute' : 'unMute');
      if (pending) {
        const { videoId, autoplay } = pending;
        pending = null;
        load(videoId, autoplay);
      }
      onReady();
    }

    function init() {
      loadApi()
        .then((YT) => {
          const playerVars = { controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, playsinline: 1, iv_load_policy: 3 };
          if (/^https?:$/.test(location.protocol)) playerVars.origin = location.origin;
          yt = new YT.Player(mount, {
            width: '100%',
            height: '100%',
            playerVars,
            events: {
              onReady: handleReady,
              onStateChange: (e) => {
                const name = STATE_NAMES[e.data];
                if (name) onState(name);
              },
              onError: (e) => onError(describeError(e.data)),
            },
          });
        })
        .catch(onApiFail);
    }

    function load(videoId, autoplay) {
      if (!ready) {
        pending = { videoId, autoplay };
        return;
      }
      call(autoplay ? 'loadVideoById' : 'cueVideoById', videoId);
    }

    init();

    return {
      retry: init,
      load,
      play: () => call('playVideo'),
      pause: () => call('pauseVideo'),
      seek: (seconds) => call('seekTo', seconds, true),
      getTime: () => Number(call('getCurrentTime')) || 0,
      getDuration: () => Number(call('getDuration')) || 0,
      setVolume: (v) => call('setVolume', v),
      setMuted: (m) => call(m ? 'mute' : 'unMute'),
    };
  };
})((window.Coro = window.Coro || {}));
