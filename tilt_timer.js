// tilt_timer.js

class TiltTimer {
  constructor() {
    this.timerRunning = false;
    this.startTime = 0;
    this.totalTime = 0;
  }

  startStopTimer() {
    if (!this.timerRunning) {
      this.timerRunning = true;
      this.startTime = Date.now();
    } else {
      this.timerRunning = false;
      this.totalTime += Date.now() - this.startTime;
    }
  }

  stopTimer() {
    if (this.timerRunning) {
      this.timerRunning = false;
      this.totalTime += Date.now() - this.startTime;
    }
  }

  getTotalTime() {
    if (this.timerRunning) {
      return this.totalTime + (Date.now() - this.startTime);
    }
    return this.totalTime;
  }

  resetTimer() {
    this.timerRunning = false;
    this.startTime = 0;
    this.totalTime = 0;
  }
}

const timer1 = new TiltTimer();
const timer2 = new TiltTimer();

const timer1Label = document.getElementById('timer1');
const timer2Label = document.getElementById('timer2');
const percentageLabel = document.getElementById('percentage');
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');
const enableButton = document.getElementById('enable');
const datetimeLabel = document.getElementById('datetime');
let tiltDetectionEnabled = false;

function updateDateTime() {
  const currentDatetime = new Date().toLocaleString('ja-JP');
  datetimeLabel.textContent = currentDatetime;
  setTimeout(updateDateTime, 60000);
}

function updateTimerLabels() {
  const totalTime1 = timer1.getTotalTime() / 1000;
  const minutes1 = Math.floor(totalTime1 / 60);
  const seconds1 = Math.floor(totalTime1 % 60);
  const tenths1 = Math.floor((totalTime1 * 10) % 10);
  timer1Label.textContent = `${minutes1}:${seconds1.toString().padStart(2, '0')}.${tenths1}`;

  const totalTime2 = timer2.getTotalTime() / 1000;
  const minutes2 = Math.floor(totalTime2 / 60);
  const seconds2 = Math.floor(totalTime2 % 60);
  const tenths2 = Math.floor((totalTime2 * 10) % 10);
  timer2Label.textContent = `${minutes2}:${seconds2.toString().padStart(2, '0')}.${tenths2}`;

  const totalTime = totalTime1 + totalTime2;
  const percentage = totalTime > 0 ? (totalTime1 / totalTime) * 100 : 0;
  percentageLabel.textContent = `${percentage.toFixed(0)}%`;
}

function checkTilt(event) {
  if (!tiltDetectionEnabled) return;

  const { beta } = event; // beta is the front/back tilt in degrees

  if (beta > 45 && beta < 135) { // 画面が前に45度から135度の間に傾いたとき
    if (!timer2.timerRunning) {
      timer1.stopTimer(); // タイマー1を停止
      timer2.startStopTimer();
    }
    document.body.style.backgroundColor = '#ffcccc'; // 薄い赤背景
  } else if (beta >= -45 && beta <= 45) { // 画面が上向きのとき（プラスマイナス45度）
    if (!timer1.timerRunning) {
      timer2.stopTimer(); // タイマー2を停止
      timer1.startStopTimer();
    }
    document.body.style.backgroundColor = '#cc55ff'; // 薄い緑背景
  } else {
    timer1.stopTimer();
    timer2.stopTimer();
    document.body.style.backgroundColor = 'white';
  }

  updateTimerLabels();
}

startButton.addEventListener('click', () => {
  tiltDetectionEnabled = true;
  window.addEventListener('deviceorientation', checkTilt);
  startButton.disabled = true;
  resetButton.disabled = false;
});

resetButton.addEventListener('click', () => {
  if (resetButton.textContent === '終了') {
    tiltDetectionEnabled = false;
    window.removeEventListener('deviceorientation', checkTilt);
    timer1.resetTimer();
    timer2.resetTimer();
    startButton.disabled = false;
    resetButton.textContent = 'リセット';
    document.body.style.backgroundColor = 'white';
  } else {
    timer1.resetTimer();
    timer2.resetTimer();
    startButton.disabled = false;
    resetButton.disabled = true;
    resetButton.textContent = '終了';
    timer1Label.textContent = '0:00.0';
    timer2Label.textContent = '0:00.0';
    percentageLabel.textContent = '00%';
    document.body.style.backgroundColor = 'white';
  }
});

enableButton.addEventListener('click', () => {
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    DeviceMotionEvent.requestPermission().then(permissionState => {
      if (permissionState === 'granted') {
        enableButton.style.display = 'none';
      }
    }).catch(console.error);
  } else {
    enableButton.style.display = 'none';
  }
});

updateDateTime();
