

const EVENTS = {
  startGame: {
    text: 'You play as Kaspa, and your goal is to survive. Watch out for BTC — it hits really hard and has a huge amount of HP. Your HP scales with Market Cap, and your damage scales with price.',
    spawn: {Bitcoin:3, Etherium:4},
    nextScene: 'GameScene'
  },
  dead: {
    text: 'you are dead',
    nextScene: 'DeadScene'
  },
  resetGame: {
    text: 'you are dead, but...',
    spawn: {Bitcoin:3, Etherium:4},
    nextScene: 'GameScene'
  }
}

export function getEvent(eventName) {
    return EVENTS[eventName] || null;
}
