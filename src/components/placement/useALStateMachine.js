'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/* ─────────────────────────────────────────────────────────────
   useALStateMachine
   
   Manages the 10-state AL animation system with:
   - Priority queue (one animation at a time)
   - Auto-return to idle
   - Wrong streak tracking (meteor at 2, disappear at 3+)
   - Random black hole trigger (10–15%)
   - Streak mode (superIdle)
   - Thinking trigger on user delay
───────────────────────────────────────────────────────────── */

export function useALStateMachine() {
  const [alState, setAlState]     = useState('idle');
  const [alMsg,   setAlMsg]       = useState('');
  const wrongStreak  = useRef(0);
  const correctStreak = useRef(0);
  const thinkTimer   = useRef(null);
  const busy         = useRef(false);

  /* Messages */
  const MSGS = {
    correct:     ['Nice! ✨', 'Great job!', 'Brilliant! 🎉', "That's right!", 'Spot on! ⭐'],
    wrong:       ['Oops! Try the next one!', "Almost! Don't give up 💜", 'That was tricky!', 'Keep going!'],
    welldone:    ['You\'re on fire! 🔥', 'Incredible streak!', 'You\'re doing amazing!'],
    surprised:   ['Whoa! Two in a row... 🌟', "That's unexpected!", 'Hmm, interesting...'],
    meteor:      ['Oops... a meteor hit! 🌠', "Don't worry, AL's here!"],
    disappear:   ["AL's regrouping... 💫", "Don't worry, AL never gives up!"],
    celebrating: ['You completed the test! 🏆', 'What a journey! 🌟'],
    thinking:    ['Hmm... 🤔', 'Let me think...', 'Taking your time!'],
    idle:        ['Take your time! ✨', "You've got this!", 'Ready when you are!'],
    welcome:     ["Welcome! Let's explore your English level 🌌"],
    ready:       ["Let's go! I'm with you every step 🚀"],
  };

  function getMsg(key) {
    const arr = MSGS[key] || MSGS.idle;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* Core transition — fires one-shot then returns to idle */
  const transition = useCallback((newState, msg, autoReturnDelay = 2000) => {
    busy.current = true;
    setAlState(newState);
    setAlMsg(msg || getMsg(newState));

    const loopStates = ['idle', 'celebrating', 'thinking', 'superIdle'];
    if (!loopStates.includes(newState)) {
      setTimeout(() => {
        busy.current = false;
        const isStreaking = correctStreak.current >= 3;
        setAlState(isStreaking ? 'superIdle' : 'idle');
        setAlMsg(isStreaking ? getMsg('welldone') : getMsg('idle'));
      }, autoReturnDelay);
    } else {
      busy.current = false;
    }
  }, []);

  /* Called immediately when user taps an option */
  function onAnswerTap() {
    clearTimeout(thinkTimer.current);
    if (!busy.current) {
      transition('thinking', getMsg('thinking'), 99999);
    }
  }

  /* Called after evaluation */
  function onResult(isCorrect) {
    clearTimeout(thinkTimer.current);

    if (isCorrect) {
      wrongStreak.current = 0;
      correctStreak.current++;

      if (correctStreak.current >= 3) {
        /* Streak mode */
        transition('welldone', getMsg('welldone'), 1800);
        setTimeout(() => {
          setAlState('superIdle');
          setAlMsg(getMsg('idle'));
          busy.current = false;
        }, 1800);
      } else {
        /* Random black hole: 12% chance */
        if (Math.random() < 0.12) {
          transition('surprised', getMsg('surprised'), 1600);
        } else {
          transition('correct', getMsg('correct'), 1600);
        }
      }
    } else {
      correctStreak.current = 0;
      wrongStreak.current++;

      if (wrongStreak.current >= 3) {
        transition('disappear', getMsg('disappear'), 1800);
      } else if (wrongStreak.current === 2) {
        transition('meteor', getMsg('meteor'), 1800);
      } else {
        transition('wrong', getMsg('wrong'), 1600);
      }
    }
  }

  /* Called when there's delay (user is taking time) */
  function onUserDelay() {
    if (!busy.current) {
      setAlState('thinking');
      setAlMsg(getMsg('thinking'));
    }
  }

  /* Called when test finishes */
  function onComplete() {
    wrongStreak.current  = 0;
    correctStreak.current = 0;
    transition('celebrating', getMsg('celebrating'), 99999);
  }

  /* Called on first visit */
  function onWelcome() {
    transition('welcome', getMsg('welcome'), 2500);
    setTimeout(() => {
      transition('ready', getMsg('ready'), 2000);
    }, 2600);
  }

  /* Called on next phase / level up */
  function onNextPhase() {
    transition('nextphase', "Level up! 🌟", 1800);
  }

  /* Start thinking timer — fires if user takes >4s */
  function startThinkTimer() {
    clearTimeout(thinkTimer.current);
    thinkTimer.current = setTimeout(() => {
      if (!busy.current) onUserDelay();
    }, 4000);
  }

  function clearThinkTimer() {
    clearTimeout(thinkTimer.current);
  }

  /* Cleanup */
  useEffect(() => () => clearTimeout(thinkTimer.current), []);

  return {
    alState,
    alMsg,
    onAnswerTap,
    onResult,
    onComplete,
    onWelcome,
    onNextPhase,
    startThinkTimer,
    clearThinkTimer,
    wrongStreak: wrongStreak.current,
    correctStreak: correctStreak.current,
  };
}
