import { _timer, _timerSpan, _playPause } from "./constants.js";

// check for win
export let checkForWin = (table) => {
    // if all foundation piles are full
    if (  table['spades'].length +
            table['hearts'].length +
            table['diamonds'].length +
            table['clubs'].length
            === 52 ) {
        //console.log('Game Has Been Won');
        // stop timer
        utiltimer('stop');
        // bonus points for time
        updateScore(getBonus());
        // throw confetti
        throwConfetti();
        // return true
        return true;
    }
    else return false;
}

export let updateScore = (points) =>{
    //console.log('Updating Score', points);
    // get score
    // score = parseInt($score.dataset.score) + points;
    // set minimum score to 0
    score = score < 0 ? 0 : score;
    // parse as integer
    score = parseInt(score);
    // set score attribute
    //$score.dataset.score = score;
    // output to display
    //$score.children[1].textContent = score;
    return score;
}

// timer funcion
export let utiltimer = (action) => {
    // declare timer vars
    let minutes = 0;
    let seconds = 0;
    let time = 0;
    let gameplay = document.body.dataset.gameplay;
    // set timer attribute
    _timer.dataset.action = action;
    // switch case
    switch (action) {
       // start timer
       case 'start' :
          //console.log('Starting Timer...');
          // looping function
          let clock = setInterval(() => {
             // increment
             time++;
             // parse minutes and seconds
             minutes = parseInt(time / 60, 10);
             seconds = parseInt(time % 60, 10);
             minutes = minutes < 10 ? "0" + minutes : minutes;
             seconds = seconds < 10 ? "0" + seconds : seconds;
             // output to display
             _timerSpan.textContent = minutes + ':' + seconds;
             // if 10 seconds has passed decrement score by 2 pts
             if ( time % 10 === 0 ) updateScore(-2);
          }, 1000);
          
          // add dataset to body
          document.body.dataset.gameplay = 'active';
          // unbind click to play button
          if ( gameplay === 'paused')
          _playPause.removeEventListener('click', playTimer);
       break;
       // pause timer
       case 'pause' :
          //console.log('Pausing Timer...');
          clearInterval(clock);
          document.body.dataset.gameplay = 'paused';
          // unbind click to pause button
          if ( gameplay === 'active')
          _playPause.removeEventListener('click', pauseTimer);
          // bind click tp play button
          // _playPause.addEventListener('click', playTimer = function(){
          //    timer('start');
          // });
       break;
       // stop timer
       case 'stop' :
          //console.log('Stoping Timer...');
          clearInterval(clock);
          document.body.dataset.gameplay = 'over';
       break;
       // default
       default : break;
    }
    
    return;
}

export let movementnotification = (movement) => {
    //$("movements").html(movement);
    let elem = document.querySelector('.movements');
    elem.innerHTML = movement;
}