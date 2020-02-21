"use strict";
const defaultSettings = [
    {
        title: '成果発表3分',
        demo: false,
        duration: 60 * 3,
        sound: 'se0',
        alerms: [
            {
                time: 60 * 1,
                sound: 'se3',
            },
        ],
    },
    {
        title: '成果発表5分',
        demo: false,
        duration: 60 * 5,
        sound: 'se0',
        alerms: [
            {
                time: 60 * 1,
                sound: 'se3',
            },
        ],
    },
    {
        title: 'デモ用',
        demo: true,
        duration: 60 * 3,
        sound: 'se0',
        alerms: [
            {
                time: 60,
                sound: 'se3',
            },
        ],
    },
];
const _AudioContext = window.AudioContext || window.webkitAudioContext;
const ctx = new _AudioContext();
const settings = defaultSettings;
let currentSetting = null;
let endTime = 0;
let currentTime = 0;
let isRunning = false;
let alermCount = 0;
let mainDisplay, seekbarFill, seekbarCircle, alermText, mainContainer, updateButton;
let secretCount = 0;
let notificationTimer = 0;
document.addEventListener('DOMContentLoaded', () => {
    if ('standalone' in window.navigator && !navigator.standalone) {
        setTimeout(() => alert('全画面で表示するには[共有ボタン]から[ホーム画面に追加]を選択します。'), 0);
    }
    mainDisplay = document.getElementById('main-display');
    seekbarFill = document.getElementById('main-seekbar-fill');
    seekbarCircle = document.getElementById('main-seekbar-circle');
    alermText = document.getElementById('main-alerm-text');
    mainContainer = document.getElementById('main');
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('serviceWorker.js')
            .then(registration => {
            // 登録成功
            registration.onupdatefound = function () {
                updateButton.classList.add('highlight');
                registration.update();
            };
        })
            .catch(err => {
            // 登録失敗
        });
    }
    loadSetupMenu();
    setInterval(task, 50);
});
const loadSetupMenu = (secret = false) => {
    const clickItem = (e) => {
        var _a;
        const i = Number((_a = e.currentTarget.dataset) === null || _a === void 0 ? void 0 : _a.index);
        startTimer(settings[i]);
    };
    const content = settings
        .filter(v => secret || !v.demo)
        .map((v, i) => h('div', { class: 'setup-item', 'data-index': i + '' }, [h('div', { class: 'setup-title' }, v.title), h('div', { class: 'setup-caption' }, SectoString(v.duration))], clickItem));
    const container = document.getElementById('setup');
    container.innerHTML = '';
    const title = h('div', { class: 'setup-logo' }, 'Presentation Timer', () => {
        if (secretCount < 5) {
            playSound('secret' + secretCount);
        }
        secretCount++;
        if (secretCount == 5)
            loadSetupMenu(true);
    });
    updateButton = h('div', { class: 'update-button' }, '更新', () => {
        location.reload(true);
    });
    container.append(title, updateButton, ...content);
};
const startTimer = (data) => {
    playSound('click');
    currentSetting = data;
    endTime = performance.now() + data.duration * 1000;
    alermCount = 0;
    document.body.className = 'visible-main';
    isRunning = true;
};
const task = () => {
    mainContainer.className = 'main' + (isRunning ? '' : currentTime === 0 ? ' finished' : ' paused');
    if (!isRunning || !currentSetting || !endTime)
        return;
    let remaining = (endTime - performance.now()) / 1000;
    if (currentSetting.demo && ((65 < remaining && remaining < 170) || (3 < remaining && remaining < 55))) {
        endTime -= 1000;
    }
    if (remaining < 0) {
        remaining = 0;
        isRunning = false;
        playSound(currentSetting.sound);
        notify('時間切れw');
    }
    if (alermCount in currentSetting.alerms && remaining < currentSetting.alerms[alermCount].time) {
        const alerm = currentSetting.alerms[alermCount];
        playSound(alerm.sound);
        alermCount++;
        notify(`残り${SectoString2(alerm.time)}です`);
    }
    currentTime = remaining;
    const ratio = (1 - remaining / currentSetting.duration) * 100;
    mainDisplay.textContent = SectoString(remaining);
    seekbarCircle.style.left = `calc(${ratio}% - 16px)`;
    seekbarFill.style.width = `${ratio}%`;
};
const notify = (message) => {
    alermText.textContent = message;
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
        alermText.textContent = ``;
    }, 5000);
};
const pauseButton = () => {
    isRunning ? pause() : resume();
};
const pause = () => {
    playSound('pause0');
    isRunning = false;
};
const resume = () => {
    playSound('pause1');
    isRunning = true;
    endTime = performance.now() + currentTime * 1000;
};
const finish = () => {
    playSound('stop');
    secretCount = 0;
    loadSetupMenu();
    isRunning = false;
    currentSetting = null;
    document.body.className = 'visible-setup';
};
const SectoString = (sec) => {
    return (Math.floor(sec / 60)
        .toString()
        .padStart(2, '0') +
        ':' +
        Math.floor(sec % 60)
            .toString()
            .padStart(2, '0'));
};
const SectoString2 = (s) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    if (sec === 0)
        return `${min}分`;
    if (min === 0)
        return `${sec}秒`;
    return `${min}分${sec}秒`;
};
const playSound = (type) => {
    const t0 = ctx.currentTime;
    switch (type) {
        case 'click':
            playTone(t0, 'square', 8, 0.1, 0.05);
            playTone(t0, 'square', 12, 0.15, 0.05);
            playTone(t0, 'square', 15, 0.2, 0.05);
            break;
        // finished
        case 'se0':
            playTone(t0, 'square', 17, 0.0, 0.2);
            playTone(t0, 'square', 12, 0.2, 0.2);
            playTone(t0, 'square', 9, 0.4, 0.2);
            playTone(t0, 'square', 7, 0.6, 0.2);
            playTone(t0, 'square', 5, 0.8, 0.2);
            playTone(t0, 'square', 9, 1.0, 0.2);
            playTone(t0, 'square', 7, 1.2, 0.2);
            playTone(t0, 'square', 3, 1.4, 0.2);
            playTone(t0, 'square', 5, 1.6, 0.4);
            playTone(t0, 'sine', -7, 0.0, 0.8);
            playTone(t0, 'sine', -5, 0.8, 0.4);
            playTone(t0, 'sine', -2, 1.2, 0.4);
            playTone(t0, 'sine', -3, 1.6, 0.4);
            break;
        // alerm1
        case 'se1':
            playTone(t0, 'square', 12, 0, 0.1);
            playTone(t0, 'square', 9, 0, 0.1);
            playTone(t0, 'square', 11, 0.15, 0.1);
            playTone(t0, 'square', 8, 0.15, 0.1);
            playTone(t0, 'square', 12, 0.3, 0.1);
            playTone(t0, 'square', 9, 0.3, 0.1);
            playTone(t0, 'square', 12, 0.6, 0.1);
            playTone(t0, 'square', 9, 0.6, 0.1);
            playTone(t0, 'square', 11, 0.75, 0.1);
            playTone(t0, 'square', 8, 0.75, 0.1);
            playTone(t0, 'square', 12, 0.9, 0.1);
            playTone(t0, 'square', 9, 0.9, 0.1);
            break;
        // alerm1
        case 'se1':
            playTone(t0, 'square', 12, 0, 0.1);
            playTone(t0, 'square', 9, 0, 0.1);
            playTone(t0, 'square', 11, 0.15, 0.1);
            playTone(t0, 'square', 8, 0.15, 0.1);
            playTone(t0, 'square', 12, 0.3, 0.1);
            playTone(t0, 'square', 9, 0.3, 0.1);
            playTone(t0, 'square', 12, 0.6, 0.1);
            playTone(t0, 'square', 9, 0.6, 0.1);
            playTone(t0, 'square', 11, 0.75, 0.1);
            playTone(t0, 'square', 8, 0.75, 0.1);
            playTone(t0, 'square', 12, 0.9, 0.1);
            playTone(t0, 'square', 9, 0.9, 0.1);
            break;
        case 'se2':
            playTone(t0, 'square', 9, 0, 0.3);
            playTone(t0, 'square', 13, 0, 0.3);
            playTone(t0, 'square', 10, 0.3, 0.1);
            playTone(t0, 'square', 14, 0.3, 0.1);
            playTone(t0, 'square', 11, 0.5, 0.1);
            playTone(t0, 'square', 15, 0.5, 0.1);
            playTone(t0, 'square', 12, 0.7, 0.3);
            playTone(t0, 'square', 16, 0.7, 0.3);
            break;
        case 'se3':
            playTone(t0, 'triangle', 8, 0.0, 0.1);
            playTone(t0, 'triangle', 10, 0.1, 0.1);
            playTone(t0, 'triangle', 15, 0.2, 0.1);
            playTone(t0, 'triangle', 8, 0.3, 0.1);
            playTone(t0, 'triangle', 10, 0.4, 0.1);
            playTone(t0, 'triangle', 15, 0.5, 0.1);
            break;
        // secret logo action
        case 'secret0':
            playTone(t0, 'square', 8, 0.1, 0.05);
            playTone(t0, 'square', 12, 0.15, 0.05);
            playTone(t0, 'square', 15, 0.2, 0.05);
            break;
        case 'secret1':
            playTone(t0, 'square', 9, 0.1, 0.05);
            playTone(t0, 'square', 13, 0.15, 0.05);
            playTone(t0, 'square', 16, 0.2, 0.05);
            break;
        case 'secret2':
            playTone(t0, 'square', 10, 0.1, 0.05);
            playTone(t0, 'square', 14, 0.15, 0.05);
            playTone(t0, 'square', 17, 0.2, 0.05);
            break;
        case 'secret3':
            playTone(t0, 'square', 11, 0.1, 0.05);
            playTone(t0, 'square', 15, 0.15, 0.05);
            playTone(t0, 'square', 18, 0.2, 0.05);
            break;
        case 'secret4':
            playTone(t0, 'square', 12, 0.1, 0.05);
            playTone(t0, 'square', 16, 0.15, 0.05);
            playTone(t0, 'square', 19, 0.2, 0.05);
            playTone(t0, 'square', 24, 0.25, 0.05);
            break;
        // pause
        case 'pause0':
            playTone(t0, 'square', 14, 0.0, 0.05);
            playTone(t0, 'square', 10, 0.05, 0.05);
            playTone(t0, 'square', 5, 0.1, 0.05);
            break;
        case 'pause1':
            playTone(t0, 'square', 5, 0.0, 0.05);
            playTone(t0, 'square', 10, 0.05, 0.05);
            playTone(t0, 'square', 14, 0.1, 0.05);
            break;
        // stop
        case 'stop':
            playTone(t0, 'square', 10, 0.0, 0.05);
            playTone(t0, 'square', 17, 0.05, 0.05);
            playTone(t0, 'square', 14, 0.1, 0.05);
            playTone(t0, 'square', 10, 0.15, 0.05);
            break;
    }
};
const playTone = (t0, type = 'square', n, t = 0, duration = 0.1) => {
    ctx.resume();
    const osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.type = type;
    osc.frequency.value = 440 * Math.pow(2, n / 12);
    osc.start(t0 + t);
    osc.stop(t0 + t + duration);
};
const h = (tag, attr = null, body = null, onclick = null, ns) => {
    const element = ns === undefined ? document.createElement(tag) : document.createElementNS(ns, tag);
    if (attr != null) {
        for (const key in attr) {
            if (attr.hasOwnProperty(key)) {
                element.setAttribute(key, attr[key]);
            }
        }
    }
    if (onclick !== null) {
        element.addEventListener('touchstart', onclick, {
            passive: true,
            capture: false,
        });
    }
    if (typeof body === 'string') {
        element.textContent = body;
    }
    else if (typeof body === 'number') {
        element.textContent = String(body);
    }
    else if (body instanceof Node) {
        element.appendChild(body);
    }
    else if (body instanceof Array) {
        element.append(...body);
    }
    else if (body !== null) {
        console.warn('この中身は想定してない！！\n' + body);
    }
    return element;
};
