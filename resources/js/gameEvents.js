

const EVENTS = {
  startGame: {
    text: 'test123',
    spawn: ['Bitcoin', 'Toncoin'],
    nextScene: 'GameScene'
  },
  dead: {
    text: 'you are dead',
    nextScene: 'DeadScene'
  },
  resetGame: {
    text: 'you are dead, but...',
    spawn: ['Bitcoin', 'Toncoin'],
    nextScene: 'GameScene'
  }
}

export function getEvent(eventName) {
    return EVENTS[eventName] || null;
}
