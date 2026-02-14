

const EVENTS = {
  startGame: {
    text: 'test123 some strong scenari text i need check rollsalofjask lgfjaskfgjksajgsa kjgsakg jaskgjkasjgksdgjkdl sghsfdljkghsdfjl kghfdsjlkgfdhgdjk ghfdjkghdfjk gfhsajkghjasghajsjkg  ghsajghasjhgak ashfgjksahgak afhsjkghas ahgsjkg ghsajkghsajk hgasjkghsa hgasjkghasjk ',
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
