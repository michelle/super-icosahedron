/**
 * Handle WASD, arrow keys.
 */
function handleKeys(ev) {
  var move_amount = 0.1;
  var kc = ev.keyCode || ev.which;

  switch (kc) {
    case 65:  // 'a'
    case 37:  // left
      game.playerMoveLeft(move_amount);
      break;
    case 87:  // 'w'
    case 38:  // up
      game.playerMoveUp(move_amount);
      break;
    case 68:  // 'd'
    case 39:  // right
      game.playerMoveRight(move_amount);
      break;
    case 83:  // 's'
    case 40:  // down
      game.playerMoveDown(move_amount);
      break;
  }
};
