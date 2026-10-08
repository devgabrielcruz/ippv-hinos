(function (app) {
  'use strict';

  const STORAGE_KEY = 'coro:v1';
  const REPEAT_MODES = ['off', 'all', 'one'];

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  app.normalizeText = function (s) {
    return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  };

  app.buildPlaylist = function (raw) {
    const list = Array.isArray(raw) ? raw : [];
    return list.map((entry, index) => {
      const title = String((entry && entry.title) || '').trim() || 'Faixa ' + (index + 1);
      const subtitle = String((entry && entry.subtitle) || '').trim();
      const group = String((entry && entry.group) || '').trim();
      const yt = app.parseYouTubeUrl(entry && entry.youtubeUrl);
      if (!yt) console.warn('[playlist] Link inválido na faixa ' + (index + 1) + ' (“' + title + '”).');
      return {
        index,
        title,
        subtitle,
        group,
        searchKey: app.normalizeText([title, subtitle, group].join(' ')),
        valid: !!yt,
        ...yt,
      };
    });
  };

  function readPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  app.createStore = function (items) {
    const listeners = new Set();
    const saved = readPrefs();
    const validIdx = items.filter((t) => t.valid).map((t) => t.index);

    const state = {
      items,
      validCount: validIdx.length,
      current: -1,
      pos: -1,
      order: [],
      status: 'idle',
      error: null,
      ready: false,
      query: '',
      shuffle: saved.shuffle === true,
      repeat: REPEAT_MODES.includes(saved.repeat) ? saved.repeat : 'off',
      volume: Number.isFinite(saved.volume) ? clamp(saved.volume, 0, 100) : 80,
      muted: saved.muted === true,
    };

    function buildOrder(first) {
      const order = validIdx.slice();
      if (!state.shuffle) return order;
      shuffleInPlace(order);
      const k = order.indexOf(first);
      if (k > 0) {
        order.splice(k, 1);
        order.unshift(first);
      }
      return order;
    }

    const restored = items.findIndex((t) => t.valid && t.videoId === saved.videoId);
    if (restored >= 0) {
      state.current = restored;
      state.status = 'paused';
    }
    state.order = buildOrder(state.current);
    state.pos = state.order.indexOf(state.current);

    function persist() {
      const track = items[state.current];
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            videoId: track ? track.videoId : null,
            shuffle: state.shuffle,
            repeat: state.repeat,
            volume: state.volume,
            muted: state.muted,
          })
        );
      } catch {
        /* armazenamento indisponível: segue sem persistir */
      }
    }

    function emit() {
      listeners.forEach((fn) => fn(state));
    }

    return {
      state,

      subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },

      select(index) {
        const track = items[index];
        if (!track || !track.valid) return false;
        state.current = index;
        state.pos = state.order.indexOf(index);
        state.error = null;
        persist();
        emit();
        return true;
      },

      advance(auto, ignoreRepeatOne = false) {
        if (!state.validCount) return -1;
        if (auto && !ignoreRepeatOne && state.repeat === 'one' && state.current >= 0) return state.current;
        let pos = state.pos + 1;
        if (pos >= state.order.length) {
          if (auto && state.repeat === 'off') return -1;
          if (state.shuffle) {
            state.order = buildOrder(-1);
            if (state.order.length > 1 && state.order[0] === state.current) {
              [state.order[0], state.order[1]] = [state.order[1], state.order[0]];
            }
          }
          pos = 0;
        }
        return state.order[pos];
      },

      previous() {
        if (!state.validCount) return -1;
        if (state.pos > 0) return state.order[state.pos - 1];
        if (state.pos < 0) return state.order[0];
        return state.repeat === 'all' ? state.order[state.order.length - 1] : state.current;
      },

      setStatus(status, error = null) {
        if (state.status === status && state.error === error) return;
        state.status = status;
        state.error = error;
        emit();
      },

      setReady() {
        state.ready = true;
        emit();
      },

      setQuery(query) {
        state.query = query;
        emit();
      },

      toggleShuffle() {
        state.shuffle = !state.shuffle;
        state.order = buildOrder(state.current);
        state.pos = state.order.indexOf(state.current);
        persist();
        emit();
      },

      cycleRepeat() {
        state.repeat = REPEAT_MODES[(REPEAT_MODES.indexOf(state.repeat) + 1) % REPEAT_MODES.length];
        persist();
        emit();
      },

      setVolume(volume) {
        state.volume = clamp(Math.round(volume), 0, 100);
        persist();
        emit();
      },

      setMuted(muted) {
        state.muted = !!muted;
        persist();
        emit();
      },
    };
  };
})((window.Coro = window.Coro || {}));
