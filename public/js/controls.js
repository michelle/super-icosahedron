/**
 * Handle WASD, arrow keys.
 */
function handleKeys(ev) {
  var move_amount = 0.1;
  console.log(ev.keyCode);
  console.log(ev.charCode);

  switch (String.fromCharCode(ev.keyCode)) {
    case 'a':  // 'a'
      game.playerMoveLeft(move_amount);
      break;
    case 'w':  // 'w'
      game.playerMoveUp(move_amount);
      break;
    case 'd':  // 'd'
      console.log('asdf');
      game.playerMoveRight(move_amount);
      break;
    case 's':  // 's'
      game.playerMoveDown(move_amount);
      break;
  }
};
