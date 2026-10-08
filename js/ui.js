(function (app) {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);

  const STATUS_LABEL = {
    idle: 'Playlist',
    playing: 'Tocando agora',
    loading: 'Carregando…',
    paused: 'Em pausa',
    ended: 'Fim da playlist',
    error: 'Não foi possível reproduzir',
  };
  const TAG_LABEL = { playing: 'Tocando', loading: 'Carregando', paused: 'Pausada', ended: 'Concluída', error: 'Indisponível' };
  const REPEAT_LABEL = { off: 'Repetir: desligado', all: 'Repetir: playlist', one: 'Repetir: música' };
  const OVERLAY_TEXT = {
    boot: { title: '', text: 'Carregando player…' },
    empty: { title: 'Playlist vazia', text: 'Adicione músicas em data/playlist.js para começar.' },
    novalid: { title: 'Nenhum link válido', text: 'Confira os endereços do YouTube em data/playlist.js.' },
    idle: { title: 'Escolha uma música', text: 'Selecione um louvor na playlist para começar a ouvir.' },
    ended: { title: 'Fim da playlist', text: 'Todas as músicas foram reproduzidas.' },
  };

  const pad = (n, width) => String(n).padStart(width, '0');

  function formatTime(seconds) {
    const s = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    return Math.floor(s / 60) + ':' + pad(s % 60, 2);
  }

  function icon(name, className) {
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('class', 'icon ' + className);
    el.setAttribute('aria-hidden', 'true');
    const use = document.createElementNS(NS, 'use');
    use.setAttribute('href', '#i-' + name);
    el.appendChild(use);
    return el;
  }

  function setFill(range, percent) {
    range.style.setProperty('--p', percent + '%');
  }

  app.createUI = function (store, actions, media, meta, signal) {
    const items = store.state.items;
    const numWidth = Math.max(2, String(items.length).length);
    const invalidCount = items.filter((t) => !t.valid).length;
    const mobileQuery = window.matchMedia('(max-width: 819px)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const el = {
      sidebar: $('sidebar'), stage: $('stage'), scrim: $('scrim'), frame: $('frame'),
      plTitle: $('plTitle'), plCount: $('plCount'),
      search: $('search'), searchClear: $('searchClear'),
      tracks: $('tracks'), emptySearch: $('emptySearch'), emptyQuery: $('emptyQuery'), emptyClear: $('emptyClear'),
      sheetClose: $('sheetClose'), openPlaylist: $('openPlaylist'),
      overlay: $('overlay'), ovTitle: $('ovTitle'), ovText: $('ovText'), ovYoutube: $('ovYoutube'),
      now: $('now'), nowStatus: $('nowStatus'), nowTitle: $('nowTitle'), nowMeta: $('nowMeta'),
      seek: $('seek'), timeCur: $('timeCur'), timeDur: $('timeDur'),
      play: $('play'), playIcon: $('playIcon'), prev: $('prev'), next: $('next'),
      shuffle: $('shuffle'), repeat: $('repeat'), repeatIcon: $('repeatIcon'),
      mute: $('mute'), muteIcon: $('muteIcon'), volume: $('volume'), fullscreen: $('fullscreen'),
      ambientImg: $('ambientImg'), live: $('live'),
    };

    const on = (target, type, handler) => target.addEventListener(type, handler, { signal });

    const rows = new Map();
    const groups = [];
    let sheetOpen = false;
    let dragging = false;
    let prevCurrent = -2;
    let prevStatus = null;
    let lastQuery = null;
    let tickTimer = 0;

    /* ---------- Lista ---------- */

    function buildList() {
      const frag = document.createDocumentFragment();
      let group = null;

      items.forEach((t) => {
        if (t.group && (!group || group.name !== t.group)) {
          const li = document.createElement('li');
          li.className = 'tracks__group';
          li.textContent = t.group;
          frag.appendChild(li);
          group = { name: t.group, li, rows: [] };
          groups.push(group);
        }

        const li = document.createElement('li');
        li.className = 'tracks__item';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'track';
        btn.dataset.index = t.index;
        btn.title = t.valid ? t.title + (t.subtitle ? ' — ' + t.subtitle : '') : 'O link do YouTube desta música não é válido';

        const lead = document.createElement('span');
        lead.className = 'track__lead';
        const num = document.createElement('span');
        num.className = 'track__num';
        num.textContent = pad(t.index + 1, numWidth);
        const eq = document.createElement('span');
        eq.className = 'eq';
        eq.setAttribute('aria-hidden', 'true');
        eq.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
        lead.append(num, icon('play', 'track__ic track__ic--play'), icon('pause', 'track__ic track__ic--pause'), eq);

        const text = document.createElement('span');
        text.className = 'track__text';
        const title = document.createElement('span');
        title.className = 'track__title';
        title.textContent = t.title;
        text.appendChild(title);
        if (t.subtitle) {
          const sub = document.createElement('span');
          sub.className = 'track__sub';
          sub.textContent = t.subtitle;
          text.appendChild(sub);
        }

        const tag = document.createElement('span');
        tag.className = 'track__tag';

        btn.append(lead, text, tag);
        if (!t.valid) {
          btn.disabled = true;
          tag.textContent = 'Link inválido';
        }

        li.appendChild(btn);
        frag.appendChild(li);
        const row = { li, btn, tag, item: t };
        rows.set(t.index, row);
        if (group) group.rows.push(row);
      });

      el.tracks.appendChild(frag);
    }

    function updateRow(index) {
      const row = rows.get(index);
      if (!row) return;
      const s = store.state;
      const isCurrent = s.current === index;
      const active = s.status === 'playing' || s.status === 'loading';
      row.btn.classList.toggle('is-current', isCurrent);
      row.btn.classList.toggle('is-playing', isCurrent && active);
      if (isCurrent) row.btn.setAttribute('aria-current', 'true');
      else row.btn.removeAttribute('aria-current');
      if (row.item.valid) row.tag.textContent = isCurrent ? TAG_LABEL[s.status] || '' : '';
    }

    function revealCurrent() {
      const row = rows.get(store.state.current);
      if (!row || row.li.hidden || !row.li.offsetHeight) return;
      const list = el.tracks;
      const top = row.li.offsetTop;
      const bottom = top + row.li.offsetHeight;
      if (top >= list.scrollTop + 40 && bottom <= list.scrollTop + list.clientHeight) return;
      list.scrollTo({
        top: top - list.clientHeight / 2 + row.li.offsetHeight / 2,
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
      });
    }

    function plural(n) {
      return n === 1 ? '1 música' : n + ' músicas';
    }

    function applyFilter() {
      const query = app.normalizeText(store.state.query);
      let shown = 0;
      rows.forEach((row) => {
        const match = !query || row.item.searchKey.includes(query);
        row.li.hidden = !match;
        if (match) shown++;
      });
      groups.forEach((g) => {
        g.li.hidden = !g.rows.some((r) => !r.li.hidden);
      });

      let count = query ? shown + ' de ' + plural(items.length) : plural(items.length);
      if (invalidCount) count += ' · ' + (invalidCount === 1 ? '1 link inválido' : invalidCount + ' links inválidos');
      el.plCount.textContent = count;

      el.emptySearch.hidden = shown > 0 || !items.length;
      el.emptyQuery.textContent = store.state.query.trim();
      el.searchClear.hidden = !el.search.value;
    }

    function firstVisibleRow() {
      for (const row of rows.values()) if (!row.li.hidden && row.item.valid) return row;
      return null;
    }

    function focusNeighbor(button, direction) {
      const visible = [...rows.values()].filter((r) => !r.li.hidden && r.item.valid).map((r) => r.btn);
      const next = visible[visible.indexOf(button) + direction];
      if (!next) return false;
      next.focus();
      return true;
    }

    /* ---------- Playlist em bottom sheet (mobile) ---------- */

    function syncInert() {
      const mobile = mobileQuery.matches;
      el.sidebar.inert = mobile && !sheetOpen;
      el.stage.inert = mobile && sheetOpen;
    }

    function setSheet(open) {
      if (sheetOpen === open) return;
      sheetOpen = open;
      el.sidebar.classList.toggle('is-open', open);
      el.scrim.classList.toggle('is-visible', open);
      syncInert();
      if (open) {
        el.sheetClose.focus({ preventScroll: true });
        revealCurrent();
      } else {
        el.openPlaylist.focus({ preventScroll: true });
      }
    }

    function closeSheet() {
      if (!sheetOpen) return false;
      setSheet(false);
      return true;
    }

    function clearSearch() {
      if (!el.search.value) return false;
      el.search.value = '';
      store.setQuery('');
      return true;
    }

    /* ---------- Progresso ---------- */

    function tick() {
      if (dragging) return;
      const duration = media.getDuration();
      const time = media.getTime();
      const ratio = duration > 0 ? Math.min(time / duration, 1) : 0;
      el.seek.value = Math.round(ratio * 1000);
      setFill(el.seek, ratio * 100);
      el.timeCur.textContent = formatTime(time);
      el.timeDur.textContent = formatTime(duration);
      el.seek.setAttribute('aria-valuetext', formatTime(time) + ' de ' + formatTime(duration));
    }

    function syncTicker(active) {
      if (active && !tickTimer) {
        tickTimer = setInterval(tick, 250);
      } else if (!active && tickTimer) {
        clearInterval(tickTimer);
        tickTimer = 0;
      }
      tick();
    }

    /* ---------- Render ---------- */

    function overlayMode(s) {
      if (s.error) return 'error';
      if (!items.length) return 'empty';
      if (!s.validCount) return 'novalid';
      if (!s.ready) return 'boot';
      if (s.status === 'ended') return 'ended';
      if (s.current < 0) return 'idle';
      if (s.status === 'loading') return 'loading';
      return 'none';
    }

    function renderOverlay(s) {
      const mode = overlayMode(s);
      const key = mode === 'error' ? 'error-' + s.error.kind : mode;
      el.overlay.dataset.mode = mode;
      el.overlay.querySelectorAll('[data-show]').forEach((node) => {
        node.hidden = !node.dataset.show.split(' ').includes(key);
      });

      let content = OVERLAY_TEXT[mode] || { title: '', text: '' };
      if (mode === 'error') {
        content = { title: s.error.title, text: s.error.text + (s.error.skipping ? ' Pulando para a próxima…' : '') };
        const track = items[s.current];
        if (track && track.watchUrl) el.ovYoutube.href = track.watchUrl;
      }
      el.ovTitle.textContent = content.title;
      el.ovText.textContent = content.text;
    }

    function announce(s) {
      if (prevStatus === null || s.status === prevStatus) return;
      const track = items[s.current];
      if (s.status === 'playing' && track) el.live.textContent = 'Tocando: ' + track.title;
      else if (s.status === 'paused') el.live.textContent = 'Pausado';
      else if (s.status === 'ended') el.live.textContent = 'Fim da playlist';
      else if (s.status === 'error' && s.error) el.live.textContent = s.error.title + '. ' + s.error.text;
    }

    function renderTrackInfo(s, track) {
      const trackChanged = prevCurrent !== s.current;
      el.now.dataset.status = s.status;
      el.nowStatus.textContent = STATUS_LABEL[s.status] || '';
      el.nowTitle.textContent = track ? track.title : items.length ? 'Escolha uma música' : 'Playlist vazia';

      const parts = [];
      if (track) {
        if (track.subtitle) parts.push(track.subtitle);
        parts.push('Faixa ' + pad(track.index + 1, numWidth) + ' de ' + pad(items.length, numWidth));
      } else if (items.length) {
        parts.push(plural(items.length));
      }
      if (s.shuffle) parts.push('Aleatório');
      if (s.repeat === 'all') parts.push('Repetindo playlist');
      if (s.repeat === 'one') parts.push('Repetindo música');
      el.nowMeta.textContent = parts.join(' · ');

      if (trackChanged && track) {
        el.nowTitle.classList.remove('is-swapping');
        void el.nowTitle.offsetWidth;
        el.nowTitle.classList.add('is-swapping');
        el.ambientImg.style.backgroundImage = 'url("' + track.thumbnail + '")';
      }
      el.ambientImg.classList.toggle('is-on', !!track);
    }

    function renderControls(s) {
      const active = s.status === 'playing' || s.status === 'loading';
      const playLabel = active ? 'Pausar' : 'Tocar';
      el.playIcon.setAttribute('href', active ? '#i-pause' : '#i-play');
      el.play.setAttribute('aria-label', playLabel);
      el.play.title = playLabel + ' (Espaço)';
      el.play.disabled = !s.validCount;
      el.prev.disabled = !s.validCount;
      el.next.disabled = !s.validCount;

      el.shuffle.setAttribute('aria-pressed', String(s.shuffle));
      el.repeat.dataset.state = s.repeat;
      el.repeat.setAttribute('aria-label', REPEAT_LABEL[s.repeat]);
      el.repeat.title = REPEAT_LABEL[s.repeat];
      el.repeatIcon.setAttribute('href', s.repeat === 'one' ? '#i-repeat-one' : '#i-repeat');

      const silent = s.muted || s.volume === 0;
      el.muteIcon.setAttribute('href', silent ? '#i-mute' : '#i-volume');
      el.mute.setAttribute('aria-label', silent ? 'Ativar som' : 'Silenciar');
      el.mute.title = silent ? 'Ativar som' : 'Silenciar';
      const shownVolume = s.muted ? 0 : s.volume;
      el.volume.value = shownVolume;
      setFill(el.volume, shownVolume);
      el.volume.setAttribute('aria-valuetext', shownVolume + '%');

      el.seek.disabled = s.current < 0 || !!s.error;
    }

    function render(s) {
      const track = items[s.current] || null;
      const active = s.status === 'playing' || s.status === 'loading';

      if (prevCurrent !== s.current) updateRow(prevCurrent);
      updateRow(s.current);
      renderTrackInfo(s, track);
      renderControls(s);
      renderOverlay(s);
      announce(s);
      if (prevCurrent !== s.current) revealCurrent();
      if (lastQuery !== s.query) {
        applyFilter();
        lastQuery = s.query;
      }
      syncTicker(active);

      prevCurrent = s.current;
      prevStatus = s.status;
    }

    /* ---------- Eventos ---------- */

    function bind() {
      on(el.tracks, 'click', (e) => {
        const button = e.target.closest('.track');
        if (!button || button.disabled) return;
        actions.onTrack(Number(button.dataset.index));
        if (mobileQuery.matches) closeSheet();
      });

      on(el.search, 'input', () => store.setQuery(el.search.value));
      on(el.search, 'keydown', (e) => {
        if (e.key !== 'Enter') return;
        const row = firstVisibleRow();
        if (row) {
          e.preventDefault();
          row.btn.click();
        }
      });
      on(el.searchClear, 'click', () => {
        clearSearch();
        el.search.focus();
      });
      on(el.emptyClear, 'click', () => {
        clearSearch();
        el.search.focus();
      });

      on(el.play, 'click', actions.onToggle);
      on(el.prev, 'click', actions.onPrev);
      on(el.next, 'click', actions.onNext);
      on(el.shuffle, 'click', actions.onShuffle);
      on(el.repeat, 'click', actions.onRepeat);
      on(el.mute, 'click', actions.onMute);
      on(el.volume, 'input', () => actions.onVolume(Number(el.volume.value)));

      on(el.seek, 'input', () => {
        dragging = true;
        const ratio = Number(el.seek.value) / 1000;
        setFill(el.seek, ratio * 100);
        el.timeCur.textContent = formatTime(ratio * media.getDuration());
      });
      on(el.seek, 'change', () => {
        dragging = false;
        actions.onSeek(Number(el.seek.value) / 1000);
      });

      on(el.openPlaylist, 'click', () => setSheet(true));
      on(el.sheetClose, 'click', () => setSheet(false));
      on(el.scrim, 'click', () => setSheet(false));
      on($('ovOpenList'), 'click', () => (mobileQuery.matches ? setSheet(true) : el.search.focus()));
      on($('ovRestart'), 'click', actions.onRestartPlaylist);
      on($('ovSkip'), 'click', actions.onSkipError);
      on($('ovRetry'), 'click', actions.onRetryApi);

      if (!document.fullscreenEnabled) el.fullscreen.hidden = true;
      on(el.fullscreen, 'click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        else el.frame.requestFullscreen().catch(() => {});
      });

      mobileQuery.addEventListener('change', syncInert, { signal });
    }

    /* ---------- Início ---------- */

    el.plTitle.textContent = meta.title;
    el.search.disabled = !items.length;
    buildList();
    bind();
    syncInert();
    store.subscribe(render);
    render(store.state);

    return {
      closeSheet,
      clearSearch,
      focusNeighbor,
      destroy() {
        clearInterval(tickTimer);
        tickTimer = 0;
      },
    };
  };
})((window.Coro = window.Coro || {}));
