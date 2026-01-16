

const EVENTS = {
  startGame: {
    text: 'test123',
    spawn: ['Bitcoin', 'Toncoin'],
    nextScene: 'GameScene'
  }
}

function getEvent(eventName) {
    return EVENTS[eventName] || null;
}
