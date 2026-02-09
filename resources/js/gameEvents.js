

const EVENTS = {
  startGame: {
    text: 'test123',
    spawn: {Bitcoin:3, Toncoin:4},
    nextScene: 'GameScene'
  },
  dead: {
    text: 'you are dead',
    nextScene: 'DeadScene'
  },
  resetGame: {
    text: 'you are dead, but...',
    spawn: {Bitcoin:3, Toncoin:4},
    nextScene: 'GameScene'
  }
}

export function getEvent(eventName) {
    return EVENTS[eventName] || null;
}
