/**
 * Native Ambient Audio Player for MUIN ISLAM Portfolio
 * Track: "biting bullets" by ridgeclub (Clean Master Audio)
 * Features: Native HTML5 Audio, Zero Ads, Soft Volume, Seamless Cross-Page Resume, Responsive UI
 */

(function () {
  'use strict';

  if (window.__MUIN_AUDIO_PLAYER_INITIALIZED__) return;
  window.__MUIN_AUDIO_PLAYER_INITIALIZED__ = true;

  // Resolve audio path relative to this script
  let audioUrl;
  try {
    const scripts = document.getElementsByTagName('script');
    let currentScriptSrc = '';
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('bg-music.js')) {
        currentScriptSrc = scripts[i].src;
        break;
      }
    }
    if (currentScriptSrc) {
      audioUrl = currentScriptSrc.replace(/\/js\/bg-music\.js.*$/, '/audio/biting-bullets.mp3');
    } else {
      audioUrl = './assets/audio/biting-bullets.mp3';
    }
  } catch (e) {
    audioUrl = './assets/audio/biting-bullets.mp3';
  }

  // User Volume preference (default 35% / 0.35)
  let savedVol = parseFloat(localStorage.getItem('muin_audio_vol') || '0.35');
  if (isNaN(savedVol) || savedVol < 0.05 || savedVol > 0.8) savedVol = 0.35;
  let targetVolume = savedVol;

  let isExplicitlyPaused = localStorage.getItem('muin_audio_paused') === 'true';
  let lastSavedTime = parseFloat(sessionStorage.getItem('muin_audio_time') || '0');

  // Create Native Audio Element
  const audio = document.createElement('audio');
  audio.id = 'muin-native-audio';
  audio.src = audioUrl;
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0; // Starts muted for soft fade-in
  document.body.appendChild(audio);

  // Resume playback position across pages
  if (!isNaN(lastSavedTime) && lastSavedTime > 0 && lastSavedTime < 145) {
    audio.currentTime = lastSavedTime;
  }

  // Periodic time synchronization
  setInterval(() => {
    if (audio && !audio.paused && audio.currentTime > 0) {
      sessionStorage.setItem('muin_audio_time', audio.currentTime.toString());
    }
  }, 1000);

  // Build Minimal Glassmorphic UI
  function createUI() {
    const widget = document.createElement('div');
    widget.id = 'muin-music-widget';
    widget.setAttribute('role', 'region');
    widget.setAttribute('aria-label', 'Background Music Player');
    widget.innerHTML = `
      <style>
        #muin-music-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 999999;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(14, 14, 16, 0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 8px 14px 8px 12px;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.04);
          user-select: none;
          cursor: pointer;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }
        #muin-music-widget:hover {
          background: rgba(22, 22, 26, 0.92);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .muin-eq-container {
          display: flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 16px;
          width: 15px;
        }
        .muin-eq-bar {
          width: 3px;
          background: #ffffff;
          border-radius: 2px;
          transition: height 0.2s ease;
        }
        .muin-eq-1 { height: 6px; }
        .muin-eq-2 { height: 14px; }
        .muin-eq-3 { height: 8px; }
        .muin-playing .muin-eq-1 {
          animation: muin-bounce-1 1.05s ease-in-out infinite alternate;
        }
        .muin-playing .muin-eq-2 {
          animation: muin-bounce-2 0.75s ease-in-out infinite alternate;
        }
        .muin-playing .muin-eq-3 {
          animation: muin-bounce-3 1.25s ease-in-out infinite alternate;
        }
        @keyframes muin-bounce-1 {
          0% { height: 4px; }
          100% { height: 15px; }
        }
        @keyframes muin-bounce-2 {
          0% { height: 14px; }
          100% { height: 5px; }
        }
        @keyframes muin-bounce-3 {
          0% { height: 7px; }
          100% { height: 16px; }
        }
        .muin-track-info {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
          text-align: left;
        }
        .muin-track-title {
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: #ffffff;
          white-space: nowrap;
        }
        .muin-track-artist {
          font-size: 9.5px;
          color: rgba(255, 255, 255, 0.55);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .muin-toggle-btn {
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
        .muin-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: scale(1.06);
        }
        .muin-toggle-btn svg {
          width: 12px;
          height: 12px;
          fill: currentColor;
        }
        .muin-vol-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          padding-left: 2px;
        }
        .muin-vol-slider {
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
        .muin-vol-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }
        .muin-vol-slider::-moz-range-thumb {
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
          .muin-vol-wrap {
            display: none;
          }
          .muin-track-title {
            font-size: 10.5px;
          }
          .muin-track-artist {
            font-size: 8.5px;
          }
        }
      </style>
      <div class="muin-eq-container" id="muin-music-eq">
        <span class="muin-eq-bar muin-eq-1"></span>
        <span class="muin-eq-bar muin-eq-2"></span>
        <span class="muin-eq-bar muin-eq-3"></span>
      </div>
      <div class="muin-track-info">
        <span class="muin-track-title">biting bullets</span>
        <span class="muin-track-artist">ridgeclub</span>
      </div>
      <button class="muin-toggle-btn" id="muin-music-toggle" aria-label="Play or Pause Ambient Music">
        <svg id="muin-icon-play" viewBox="0 0 24 24" style="display:none; margin-left: 1px;"><path d="M8 5v14l11-7z"/></svg>
        <svg id="muin-icon-pause" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      <div class="muin-vol-wrap" onclick="event.stopPropagation()">
        <input type="range" min="0" max="100" value="${Math.round(targetVolume * 100)}" class="muin-vol-slider" id="muin-vol-input" title="Volume: ${Math.round(targetVolume * 100)}%">
      </div>
    `;

    document.body.appendChild(widget);

    const toggleBtn = document.getElementById('muin-music-toggle');
    const playIcon = document.getElementById('muin-icon-play');
    const pauseIcon = document.getElementById('muin-icon-pause');
    const eq = document.getElementById('muin-music-eq');
    const volInput = document.getElementById('muin-vol-input');

    function updateVisuals(playing) {
      if (playing) {
        eq.classList.add('muin-playing');
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        toggleBtn.setAttribute('title', 'Pause Music');
      } else {
        eq.classList.remove('muin-playing');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        toggleBtn.setAttribute('title', 'Play Music');
      }
    }

    widget.addEventListener('click', (e) => {
      if (e.target.closest('.muin-vol-wrap')) return;
      toggleAudio();
    });

    volInput.addEventListener('input', (e) => {
      const pct = parseInt(e.target.value, 10);
      targetVolume = pct / 100;
      volInput.setAttribute('title', 'Volume: ' + pct + '%');
      localStorage.setItem('muin_audio_vol', targetVolume.toString());
      if (audio) {
        audio.volume = targetVolume;
        if (targetVolume > 0 && audio.paused) {
          audio.play().then(() => updateVisuals(true)).catch(() => {});
        }
      }
    });

    audio.addEventListener('play', () => updateVisuals(true));
    audio.addEventListener('pause', () => updateVisuals(false));
    audio.addEventListener('ended', () => updateVisuals(false));
  }

  // Smooth Volume Fade In (starts at 0 and climbs softly to targetVolume)
  let fadeInterval = null;
  function softFadeIn(vol = targetVolume, duration = 1400) {
    if (fadeInterval) clearInterval(fadeInterval);
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        const stepTime = 50;
        const steps = Math.max(1, duration / stepTime);
        const increment = vol / steps;
        let current = 0;
        fadeInterval = setInterval(() => {
          current += increment;
          if (current >= vol) {
            current = vol;
            clearInterval(fadeInterval);
          }
          audio.volume = Math.min(1, Math.max(0, current));
        }, stepTime);
      }).catch((err) => {
        // Browser blocked unmuted autoplay before interaction
      });
    }
  }

  function toggleAudio() {
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      localStorage.setItem('muin_audio_paused', 'true');
    } else {
      localStorage.removeItem('muin_audio_paused');
      softFadeIn(targetVolume, 800);
    }
  }

  let hasInteracted = false;
  function handleFirstGesture() {
    if (hasInteracted) return;
    hasInteracted = true;

    if (localStorage.getItem('muin_audio_paused') !== 'true' && audio.paused) {
      softFadeIn(targetVolume);
    }

    window.removeEventListener('click', handleFirstGesture);
    window.removeEventListener('scroll', handleFirstGesture);
    window.removeEventListener('touchstart', handleFirstGesture);
    window.removeEventListener('keydown', handleFirstGesture);
  }

  function start() {
    createUI();

    // Attach user gesture listeners
    window.addEventListener('click', handleFirstGesture, { passive: true });
    window.addEventListener('scroll', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    // Attempt gentle autoplay on load
    if (!isExplicitlyPaused) {
      softFadeIn(targetVolume);
    } else {
      const playIcon = document.getElementById('muin-icon-play');
      const pauseIcon = document.getElementById('muin-icon-pause');
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
