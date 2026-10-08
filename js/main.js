(function (app) {
  'use strict';

  const SKIP_DELAY = 2500;
  const LOAD_TIMEOUT = 8000;
  const VOLUME_STEP = 5;

  const config = window.PLAYLIST_CONFIG || {};
  const title = config.title || 'Minha playlist';
  const items = app.buildPlaylist(config.items);
  const store = app.createStore(items);
  const abort = new AbortController();

  let ui = null;
  let player = null;
  let skipTimer = 0;
  let loadTimer = 0;
  let expectPlay = false;
  let autoFlow = false;
  let errorStreak = 0;

  const state = store.state;

  function clearTimers() {
    clearTimeout(skipTimer);
    clearTimeout(loadTimer);
  }

  function startTrack(index, { auto = false } = {}) {
    clearTimers();
    if (!store.select(index)) return;
    autoFlow = auto;
    expectPlay = true;
    store.setStatus('loading');
    player.load(items[index].videoId, true);
    loadTimer = setTimeout(() => {
      expectPlay = false;
      if (state.status === 'loading') store.setStatus('paused');
    }, LOAD_TIMEOUT);
  }

  function restart() {
    clearTimers();
    expectPlay = true;
    store.setStatus('loading');
    player.seek(0);
    player.play();
  }

  function togglePlay() {
    if (!state.validCount) return;
    if (state.current < 0) return startTrack(state.order[0]);
    if (state.status === 'ended' || state.status === 'error') return startTrack(state.current);
    if (state.status === 'playing' || state.status === 'loading') {
      expectPlay = false;
      player.pause();
      store.setStatus('paused');
    } else {
      player.play();
    }
  }

  function goNext(auto) {
    const index = store.advance(auto);
    if (index < 0) {
      clearTimers();
      store.setStatus('ended');
    } else if (auto && index === state.current) {
      restart();
    } else {
      startTrack(index, { auto });
    }
  }

  function goPrevious() {
    const index = store.previous();
    if (index < 0) return;
    if (index === state.current || player.getTime() > 3) restart();
    else startTrack(index);
  }

  function skipAfterError() {
    clearTimers();
    const index = store.advance(true, true);
    if (index < 0) store.setStatus('ended');
    else startTrack(index, { auto: true });
  }

  function changeVolume(volume) {
    store.setVolume(volume);
    if (state.muted && volume > 0) store.setMuted(false);
    player.setVolume(state.volume);
    player.setMuted(state.muted);
  }

  const actions = {
    onTrack(index) {
      if (index === state.current && state.status !== 'error') togglePlay();
      else startTrack(index);
    },
    onToggle: togglePlay,
    onNext: () => goNext(false),
    onPrev: goPrevious,
    onShuffle: () => store.toggleShuffle(),
    onRepeat: () => store.cycleRepeat(),
    onVolume: changeVolume,
    onMute() {
      if (state.muted && state.volume === 0) return changeVolume(40);
      store.setMuted(!state.muted);
      player.setMuted(state.muted);
    },
    onSeek(ratio) {
      const duration = player.getDuration();
      if (duration > 0) player.seek(ratio * duration);
    },
    onSkipError: skipAfterError,
    onRestartPlaylist: () => startTrack(state.order[0]),
    onRetryApi() {
      store.setStatus(state.current >= 0 ? 'paused' : 'idle');
      player.retry();
    },
  };

  function handlePlayerState(name) {
    if (name === 'playing') {
      clearTimeout(loadTimer);
      expectPlay = false;
      errorStreak = 0;
      store.setStatus('playing');
    } else if (name === 'buffering') {
      if (state.status !== 'ended' && state.status !== 'error') store.setStatus('loading');
    } else if (name === 'paused' || name === 'cued') {
      if (!expectPlay && state.status !== 'ended' && state.status !== 'error') store.setStatus('paused');
    } else if (name === 'ended') {
      goNext(true);
    }
  }

  function handlePlayerError(error) {
    clearTimers();
    expectPlay = false;
    errorStreak++;
    const willSkip = autoFlow && errorStreak < state.validCount;
    store.setStatus('error', { kind: 'player', ...error, skipping: willSkip });
    if (willSkip) skipTimer = setTimeout(skipAfterError, SKIP_DELAY);
  }

  function handleApiFailure() {
    store.setStatus('error', {
      kind: 'api',
      title: 'YouTube indisponível',
      text: 'Não foi possível carregar o player. Verifique sua conexão.',
    });
  }

  function handleReady() {
    store.setReady();
    if (state.current >= 0 && state.status === 'paused') player.load(items[state.current].videoId, false);
  }

  function syncDocument() {
    const track = items[state.current];
    document.title = track ? track.title + ' - ' + title : title;

    if (!('mediaSession' in navigator) || !track) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.subtitle || title,
        album: title,
        artwork: [{ src: track.thumbnail, sizes: '480x360', type: 'image/jpeg' }],
      });
      navigator.mediaSession.playbackState = state.status === 'playing' ? 'playing' : 'paused';
    } catch {
      /* Media Session indisponível */
    }
  }

  function bindMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const handlers = {
      play: togglePlay,
      pause: togglePlay,
      previoustrack: goPrevious,
      nexttrack: () => goNext(false),
    };
    Object.entries(handlers).forEach(([action, fn]) => {
      try {
        navigator.mediaSession.setActionHandler(action, fn);
      } catch {
        /* ação não suportada */
      }
    });
  }

  function handleKeydown(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const target = e.target;
    const tag = target.tagName;
    const isRange = tag === 'INPUT' && target.type === 'range';
    const isTyping = (tag === 'INPUT' && !isRange) || tag === 'TEXTAREA' || target.isContentEditable;

    switch (e.key) {
      case 'Escape':
        if (ui.closeSheet() || ui.clearSearch()) e.preventDefault();
        break;
      case ' ':
        if (isTyping || tag === 'BUTTON' || tag === 'A') return;
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        if (isTyping || isRange) return;
        e.preventDefault();
        if (e.key === 'ArrowLeft') goPrevious();
        else goNext(false);
        break;
      case 'ArrowUp':
      case 'ArrowDown': {
        if (isTyping || isRange) return;
        const direction = e.key === 'ArrowUp' ? -1 : 1;
        if (target.classList.contains('track')) {
          if (ui.focusNeighbor(target, direction)) e.preventDefault();
          return;
        }
        e.preventDefault();
        const current = state.muted ? 0 : state.volume;
        changeVolume(Math.min(100, Math.max(0, current - direction * VOLUME_STEP)));
        break;
      }
      default:
    }
  }

  player = app.createPlayer({
    mount: document.getElementById('yt'),
    volume: state.volume,
    muted: state.muted,
    onReady: handleReady,
    onState: handlePlayerState,
    onError: handlePlayerError,
    onApiFail: handleApiFailure,
  });

  ui = app.createUI(store, actions, { getTime: player.getTime, getDuration: player.getDuration }, { title }, abort.signal);

  store.subscribe(syncDocument);
  syncDocument();
  bindMediaSession();
  document.addEventListener('keydown', handleKeydown, { signal: abort.signal });

  app.destroy = function () {
    clearTimers();
    abort.abort();
    ui.destroy();
  };
})((window.Coro = window.Coro || {}));
