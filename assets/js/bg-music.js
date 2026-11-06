/**
 * Background Ambient Audio Player for MUIN ISLAM Portfolio
 * Track: "biting bullets" by ridgeclub
 * Volume: Default 35% (soft, subtle, non-intrusive)
 */

(function () {
  'use strict';

  // Prevent multiple instantiations
  if (window.__MUIN_BG_MUSIC_INITIALIZED__) return;
  window.__MUIN_BG_MUSIC_INITIALIZED__ = true;

  const YOUTUBE_VIDEO_ID = 'fS-dov9xoV0';
  let targetVolume = parseInt(localStorage.getItem('muin_music_volume') || '35', 10);
  if (isNaN(targetVolume) || targetVolume < 10 || targetVolume > 60) targetVolume = 35;

  let player = null;
  let isPlaying = false;
  let hasUserInteracted = false;
  let isMuted = localStorage.getItem('muin_music_muted') === 'true';

  // Create UI Elements
  function createPlayerUI() {
    // Hidden YT container
    const ytContainer = document.createElement('div');
    ytContainer.id = 'yt-bg-audio-container';
    ytContainer.style.cssText = 'position:fixed;left:-9999px;bottom:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
    document.body.appendChild(ytContainer);

    // Floating UI Pill
    const widget = document.createElement('div');
    widget.id = 'muin-music-widget';
    widget.setAttribute('aria-label', 'Background Music Controller');
    widget.innerHTML = `
      <style>
        #muin-music-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(18, 18, 20, 0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 8px 14px 8px 12px;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
          user-select: none;
          cursor: pointer;
          transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        #muin-music-widget:hover {
          background: rgba(28, 28, 32, 0.9);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .music-equalizer {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 16px;
          width: 14px;
        }
        .eq-bar {
          width: 3px;
          background: #ffffff;
          border-radius: 2px;
          transition: height 0.2s ease;
        }
        .eq-bar-1 { height: 6px; }
        .eq-bar-2 { height: 14px; }
        .eq-bar-3 { height: 9px; }
        .music-playing .eq-bar-1 {
          animation: eq-bounce-1 1.1s ease-in-out infinite alternate;
        }
        .music-playing .eq-bar-2 {
          animation: eq-bounce-2 0.8s ease-in-out infinite alternate;
        }
        .music-playing .eq-bar-3 {
          animation: eq-bounce-3 1.3s ease-in-out infinite alternate;
        }
        @keyframes eq-bounce-1 {
          0% { height: 4px; }
          100% { height: 15px; }
        }
        @keyframes eq-bounce-2 {
          0% { height: 14px; }
          100% { height: 5px; }
        }
        @keyframes eq-bounce-3 {
          0% { height: 8px; }
          100% { height: 16px; }
        }
        .music-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
          text-align: left;
        }
        .music-title {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #ffffff;
          white-space: nowrap;
        }
        .music-artist {
          font-size: 9.5px;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .music-toggle-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #ffffff;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          transition: background 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }
        .music-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: scale(1.05);
        }
        .music-toggle-btn svg {
          width: 12px;
          height: 12px;
          fill: currentColor;
        }
        .volume-container {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-left: 2px;
        }
        .volume-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 48px;
          height: 3px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }
        .volume-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
        }
        @media (max-width: 600px) {
          #muin-music-widget {
            bottom: 16px;
            right: 16px;
            padding: 6px 12px;
            gap: 9px;
          }
          .volume-container {
            display: none;
          }
          .music-title {
            font-size: 10.5px;
          }
          .music-artist {
            font-size: 8.5px;
          }
        }
      </style>
      <div class="music-equalizer" id="muin-music-eq">
        <span class="eq-bar eq-bar-1"></span>
        <span class="eq-bar eq-bar-2"></span>
        <span class="eq-bar eq-bar-3"></span>
      </div>
      <div class="music-meta">
        <span class="music-title">biting bullets</span>
        <span class="music-artist">ridgeclub</span>
      </div>
      <button class="music-toggle-btn" id="muin-music-toggle" aria-label="Play/Pause Background Music">
        <svg id="muin-music-icon-play" viewBox="0 0 24 24" style="display:none; margin-left: 1px;"><path d="M8 5v14l11-7z"/></svg>
        <svg id="muin-music-icon-pause" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      <div class="volume-container" onclick="event.stopPropagation()">
        <input type="range" min="0" max="100" value="${targetVolume}" class="volume-slider" id="muin-music-vol" title="Volume: ${targetVolume}%">
      </div>
    `;

    document.body.appendChild(widget);

    // Event listeners
    const toggleBtn = document.getElementById('muin-music-toggle');
    const playIcon = document.getElementById('muin-music-icon-play');
    const pauseIcon = document.getElementById('muin-music-icon-pause');
    const eq = document.getElementById('muin-music-eq');
    const volSlider = document.getElementById('muin-music-vol');

    function updateUIState(playing) {
      isPlaying = playing;
      if (playing) {
        eq.classList.add('music-playing');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        toggleBtn.setAttribute('title', 'Pause Music');
      } else {
        eq.classList.remove('music-playing');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        toggleBtn.setAttribute('title', 'Play Music');
      }
    }

    widget.addEventListener('click', (e) => {
      // If clicking inside volume slider, don't toggle
      if (e.target.closest('.volume-container')) return;
      togglePlayPause();
    });

    volSlider.addEventListener('input', (e) => {
      targetVolume = parseInt(e.target.value, 10);
      volSlider.setAttribute('title', 'Volume: ' + targetVolume + '%');
      localStorage.setItem('muin_music_volume', targetVolume.toString());
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(targetVolume);
        if (targetVolume > 0 && !isPlaying) {
          player.playVideo();
        }
      }
    });

    window.__MUIN_UPDATE_MUSIC_UI__ = updateUIState;
  }

  // Smooth Volume Fade In (starts at 0% and climbs softly to targetVolume)
  function softFadeIn(vol = targetVolume, duration = 1400) {
    if (!player || typeof player.setVolume !== 'function') return;
    try {
      player.setVolume(0);
      player.playVideo();
      const interval = 50;
      const steps = Math.max(1, duration / interval);
      const increment = vol / steps;
      let curr = 0;
      const fadeTimer = setInterval(() => {
        curr += increment;
        if (curr >= vol) {
          curr = vol;
          clearInterval(fadeTimer);
        }
        if (player && typeof player.setVolume === 'function') {
          player.setVolume(Math.round(curr));
        }
      }, interval);
    } catch (e) {
      console.warn('Fade-in audio error:', e);
    }
  }

  function togglePlayPause() {
    if (!player || typeof player.getPlayerState !== 'function') return;
    try {
      const state = player.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
        localStorage.setItem('muin_music_paused', 'true');
      } else {
        localStorage.removeItem('muin_music_paused');
        softFadeIn(targetVolume, 800);
      }
    } catch (e) {
      console.warn('Audio toggle error:', e);
    }
  }

  // Trigger on first user interaction if autoplay was restricted
  function handleUserGesture() {
    if (hasUserInteracted) return;
    hasUserInteracted = true;

    // Check if user previously explicitly paused
    if (localStorage.getItem('muin_music_paused') === 'true') {
      return;
    }

    if (player && typeof player.getPlayerState === 'function') {
      const state = player.getPlayerState();
      if (state !== YT.PlayerState.PLAYING) {
        softFadeIn(targetVolume);
      }
    }

    window.removeEventListener('click', handleUserGesture);
    window.removeEventListener('scroll', handleUserGesture);
    window.removeEventListener('touchstart', handleUserGesture);
    window.removeEventListener('keydown', handleUserGesture);
  }

  // YouTube IFrame API Ready Callback
  function initYouTubePlayer() {
    player = new YT.Player('yt-bg-audio-container', {
      height: '1',
      width: '1',
      videoId: YOUTUBE_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: YOUTUBE_VIDEO_ID,
        controls: 0,
        showinfo: 0,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        playsinline: 1,
        enablejsapi: 1
      },
      events: {
        onReady: function (event) {
          event.target.setVolume(targetVolume);

          if (localStorage.getItem('muin_music_paused') !== 'true') {
            softFadeIn(targetVolume);
          } else {
            if (window.__MUIN_UPDATE_MUSIC_UI__) window.__MUIN_UPDATE_MUSIC_UI__(false);
          }
        },
        onStateChange: function (event) {
          if (event.data === YT.PlayerState.PLAYING) {
            if (window.__MUIN_UPDATE_MUSIC_UI__) window.__MUIN_UPDATE_MUSIC_UI__(true);
          } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
            if (window.__MUIN_UPDATE_MUSIC_UI__) window.__MUIN_UPDATE_MUSIC_UI__(false);
          }
        }
      }
    });
  }

  // Initialize
  function init() {
    createPlayerUI();

    // Attach user gesture listeners
    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('scroll', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });

    // Load YouTube IFrame API script
    if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () {
        if (typeof prevCallback === 'function') prevCallback();
        initYouTubePlayer();
      };

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
