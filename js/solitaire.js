import { checkForWin, utiltimer, movementnotification } from "./utils.js?v1";
import { _timer, _timerSpan, _moveCount, _moveCountSpan, _table, _upper, _lower, _fnd, _tab,_autoWin } from "./constants.js";
import { suits, spades, hearts, diamonds, clubs, tableau } from "./cardconstants.js";

// build suits
suits['spades'] = [ ['A','spade'], ['2','spade'], ['3','spade'], ['4','spade'], ['5','spade'],['6','spade'], ['7','spade'], ['8','spade'], ['9','spade'], ['10','spade'], ['J','spade'], ['Q','spade'], ['K','spade']];
suits['hearts'] = [['A','heart'], ['2','heart'], ['3','heart'], ['4','heart'], ['5','heart'], ['6','heart'], ['7','heart'], ['8','heart'], ['9','heart'], ['10','heart'], ['J','heart'], ['Q','heart'], ['K','heart']];
suits['diamonds'] = [['A','diamond'], ['2','diamond'], ['3','diamond'], ['4','diamond'], ['5','diamond'], ['6','diamond'], ['7','diamond'], ['8','diamond'], ['9','diamond'], ['10','diamond'], ['J','diamond'], ['Q','diamond'], ['K','diamond']];
suits['clubs'] = [['A','club'], ['2','club'], ['3','club'], ['4','club'], ['5','club'], ['6','club'], ['7','club'], ['8','club'], ['9','club'], ['10','club'], ['J','club'], ['Q','club'], ['K','club']];

tableau[1] = tableau[2] = tableau[3] = tableau[4] = tableau[5] = tableau[6] = tableau[7] = [];

let unplayedTabCards = [];
let deck = [];
let lastEventTime = 0;
let time = 0;
let moves = 0;
let bonus = 0;

// build the table
let table = [];
table['stock'] = [];
table['waste'] = [];
table['spades'] = spades;
table['hearts'] = hearts;
table['diamonds'] = diamonds;
table['clubs'] = clubs;
table['tab'] = tableau;

// initial face up cards
export let playedCards =  '#waste .card,' + '#fnd .card,' +  '#tab .card:last-child';

// create deck
export let CreateGame = (deck, suits) => {
   movementnotification('Building the game');
   // loop through each suit
   for (var suit in suits) {
      suit = suits[suit];
      // loop through each card in suit
      for (var card in suit) {
         card = suit[card];
         deck.push(card); // push card to deck
      }
   }
   return deck;
}

// shuffle deck
export let shuffle = (deck) => {
   movementnotification('Shuffling Deck');
   // declare vars
   var i = deck.length, temp, rand;
   // while there remain elements to shuffle
   while (0 !== i) {
      // pick a remaining element
      rand = Math.floor(Math.random() * i);
      i--;
      // and swap it with the current element
      temp = deck[i];
      deck[i] = deck[rand];
      deck[rand] = temp;
   }
   return deck;
}

// deal deck
export let deal = (deck, table) => {
   movementnotification('Dealing Deck');
   // move all cards to stock
   table['stock'] = deck;
   // build tableau
      var tabs = table['tab'];
      // loop through 7 tableau rows
      for (var row = 1; row <= 7; row++) {
         // loop through 7 piles in row
         for (var pile = row; pile <= 7; pile++) {
            // build blank pile on first row
            if (row === 1) tabs[pile] = [];
            // deal card to pile
            move(table['stock'], tabs[pile], false);
         }
      }
   return table;
}

// Gameplay functionality
export let creategame = CreateGame(deck, suits)
export let deckgame = shuffle(creategame);
export let tablegame = deal(deckgame, table);

// move card
export function move(source, dest, pop, selectedCards = 1) {
      if (pop !== true) {
         var card = source.shift(); // take card from bottom
         dest.push(card); // push card to destination pile
      } else {
         while (selectedCards) {
            // take card from the top of selection
            var card = source[source.length - selectedCards];
            // remove it from the selected pile
            source.splice(source.length - selectedCards, 1);
            // put it in the destination pile
            dest.push(card);
            // decrement
            selectedCards--; 
         }
      }
      return;
   }

// render table
export function render(table, playedCards) {
      movementnotification('Rendering Game');

      // check for played cards
      playedCards = checkForPlayedCards(playedCards);

      // check for empty piles
      checkForEmptyPiles(table);

      // update stock pile
      update(table['stock'], '#stock ul', playedCards, true);
      // update waste pile
      update(table['waste'], '#waste ul', playedCards);
      // update spades pile
      update(table['spades'], '#spades ul', playedCards);
      // update hearts pile
      update(table['hearts'], '#hearts ul', playedCards);
      // update diamonds pile
      update(table['diamonds'], '#diamonds ul', playedCards);
      // update clubs pile
      update(table['clubs'], '#clubs ul', playedCards);
      // update tableau
      var tabs = table['tab'];
      // loop through tableau piles
      for (var i = 1; i <= 7; i++) {
         // update tableau pile
         update(tabs[i], '#tab li:nth-child('+i+') ul', playedCards, true);
      }

      // get unplayed tab cards
      unplayedTabCards = getUnplayedTabCards();

      // size cards
      sizeCards();

      // show table
      _table.style.opacity = '100';

      //console.log('Table Rendered:', table);
      return;
   }

// update piles
export function update(pile, selector, playedCards, append) {
      var e = document.querySelector(selector);
      var children = e.children; // get children
      var grandParent = e.parentElement.parentElement; // get grand parent
      // reset pile
      e.innerHTML = '';
      // loop through cards in pile
      for (var card in pile) {
         card = pile[card];
         // get html template for card
         var html = getTemplate(card);
         // create card in pile
         createCard(card, selector, html, append);
      }
      // turn cards face up
      flipCards(playedCards, 'up');
      // count played cards
      var played = countPlayedCards(children);
      e.parentElement.dataset.played = played;
      // count all played cards for #tab and #fnd piles
      if ( grandParent.id === 'tab' || grandParent.id === 'fnd' ) {
         var playedAll = parseInt(grandParent.dataset.played);
         if ( isNaN(playedAll) ) playedAll = 0;
         grandParent.dataset.played = playedAll + played;
      }
      // count unplayed cards
      var unplayed = countUnplayedCards(children);
      e.parentElement.dataset.unplayed = unplayed;
      // count all unplayed cards for #tab and #fnd piles
      if ( grandParent.id === 'tab' || grandParent.id === 'fnd' ) {
         var unplayedAll = parseInt(grandParent.dataset.unplayed);
         if ( isNaN(unplayedAll) ) unplayedAll = 0;
         grandParent.dataset.unplayed = unplayedAll + unplayed;
      }
      return pile;
}

// get html template for card
export function getTemplate(card) {
      var r = card[0]; // get rank
      var s = card[1]; // get suit
      // get html template
      var html = document.querySelector('.template li[data-rank="'+r+'"]').innerHTML;
      // search and replace suit variable
      html = html.replace('{{suit}}', s);
      return html;
}

// create card in pile
export function createCard(card, selector, html, append) {
      var r = card[0]; // get rank
      var s = card[1]; // get suit
      // get pile based on selector
      if ( selector.includes('#stock') ) var p = 'stock';
      if ( selector.includes('#waste') ) var p = 'waste';
      if ( selector.includes('#spades') ) var p = 'spades';
      if ( selector.includes('#hearts') ) var p = 'hearts';
      if ( selector.includes('#diamonds') ) var p = 'diamonds';
      if ( selector.includes('#clubs') ) var p = 'clubs';
      if ( selector.includes('#tab') ) var p = 'tab';
      var e = document.createElement('li'); // create li element
      e.className = 'card'; // add .card class to element
      e.dataset.rank = r; // set rank atribute
      e.dataset.suit = s; // set suit attribute
      e.dataset.pile = p; // set pile attribute;
      e.dataset.selected = 'false'; // set selected attribute
      e.innerHTML = html; // insert html to element
      // query for pile
      var pile = document.querySelector(selector);
      // append to pile
      if (append) pile.appendChild(e);
      // or prepend to pile
      else pile.insertBefore(e, pile.firstChild);
      return;
}

// check for played cards
export function checkForPlayedCards(playedCards) {
      // query
      var els = document.querySelectorAll('.card[data-played="true"]');
      for (var e in els) { // loop through elements
         e = els[e];
         if (e.nodeType) {
            var r = e.dataset.rank;
            var s = e.dataset.suit;
            playedCards += ', .card[data-rank="'+r+'"][data-suit="'+s+'"]' ;
         }
      }
      return playedCards;
}

// check for empty piles
export function checkForEmptyPiles(table) {
      // reset empty data on all piles
      var els = document.querySelectorAll('.pile'); // query elements
      for (var e in els) { // loop through elements
         e = els[e];
         if (e.nodeType) {
            delete e.dataset.empty;
         }
      }
      // declare var with fake pile so we always have one
      var emptyPiles = '#fake.pile';
      // check spades pile
      if ( table['spades'].length === 0 ) {
         emptyPiles += ', #fnd #spades.pile';
      }
      // check hearts pile
      if ( table['hearts'].length === 0 ) {
         emptyPiles += ', #fnd #hearts.pile';
      }
      // check diamonds pile
      if ( table['diamonds'].length === 0 ) {
         emptyPiles += ', #fnd #diamonds.pile';
      }
      // check clubs pile
      if ( table['clubs'].length === 0 ) {
         emptyPiles += ', #fnd #clubs.pile';
      }
      // check tableau piles
      var tabs = table['tab'];
         // loop through tableau piles
         for (var i = 1; i <= 7; i++) {
            // check tabeau pile
            if ( tabs[i].length === 0 ) {
               emptyPiles += ', #tab li:nth-child('+i+').pile';
            }
         }
      // mark piles as empty
      els = document.querySelectorAll(emptyPiles); // query elements
      for (var e in els) { // loop through elements
         e = els[e];
         if (e.nodeType) {
            e.dataset.empty = 'true'; // mark as empty
         }
      }
      return emptyPiles;
}

// count played cards
export function countPlayedCards(cards) {
      var played = 0;
         // loop through cards
         for (var card in cards) {
            card = cards[card];
            if (card.nodeType) {
               // check if card has been played
               if (card.dataset.played === 'true') played++;
            }
         }
      return played;
   }

// count unplayed cards
export function countUnplayedCards(cards) {
      var unplayed = 0;
         // loop through cards
         for (var card in cards) {
            card = cards[card];
            if (card.nodeType) {
               // check if card has been played
               if (card.dataset.played !== 'true') unplayed++;
            }
         }
      return unplayed;
}

// flip cards
export function flipCards(selectors, direction) {
      var els = document.querySelectorAll(selectors); // query all elements
      for (var e in els) { // loop through elements
         e = els[e];
         if (e.nodeType) {
            switch(direction) {
               case 'up' :
                  if (e.dataset.played !== 'true') {
                     // if flipping over tableau card
                     if (e.dataset.pile === 'tab') {
                        // loop through unplayed cards
                        for (var card in unplayedTabCards) {
                           card = unplayedTabCards[card];
                           // if rank and suit matches
                           if (  e.dataset.rank === card[0] && e.dataset.suit === card[1] ){
                              // score 5 points 
                              //updateScore(5);
                           }
                        }
                     }
                     e.className += ' up'; // add class
                     e.dataset.played = 'true'; // mark as played
                  }
                  break;
               case 'down' :
                  e.className = 'card'; // reset class
                  delete e.dataset.played; // reset played data attribute
               default : break;
            }
         }
      }
      return;
}

// get face down cards in tableau pile
export function getUnplayedTabCards() {
      // reset array
      unplayedTabCards = [];
      // get all face down card elements
      var els = document.querySelectorAll('#tab .card:not([data-played="true"])');
      for (var e in els) { // loop through elements
         e = els[e];
         if (e.nodeType) {
            unplayedTabCards.push( [ e.dataset.rank, e.dataset.suit ] );
         }
      }
      return unplayedTabCards;
}

// size cards
export function sizeCards(selector = '.pile', ratio = 1.4) {
      var s = selector;
      var r = ratio;
      var e = document.querySelector(s); // query element
      var h = e.offsetWidth * r; // get height of element
      // set row heights
      _upper.style.height = h + 10 + 'px';
      _lower.style.height = h + 120 + 'px';
      // set height of elements
      var els = document.querySelectorAll(s); // query all elements
      for (var e in els) { // loop through elements
         e = els[e];
         if (e.nodeType) e.style.height = h + 'px'; // set height in css
      }
}

// gameplay
export function play(table) {
      // check for winning table
      if ( checkForWin(table) ) return;
      // check for autowin
      checkForAutoWin(table);
      // bind click events
      bindClick(
         '#stock .card:first-child,' +
         '#waste .card:first-child,' +
         '#fnd .card:first-child,' +
         '#tab .card[data-played="true"]'
      );
      // bind dbl click events
      bindClick(
         '#waste .card:first-child,' +
         '#tab .card:last-child',
         'double'
      );
      
      movementnotification('Your Next Move');
}

// bind click events
export function bindClick(selectors, double) {
      var elements = document.querySelectorAll(selectors); // query all elements
      // loop through elements
      for (var e in elements) {
         e = elements[e];
         // add event listener
         if (e.nodeType) {
            if (!double) e.addEventListener('click', select);
            else e.addEventListener('dblclick', select);
         }
      }
      return;
}

// unbind click events
export function unbindClick(selectors, double) {
      var elements = document.querySelectorAll(selectors); // query all elements
      // loop through elements
      for (var e in elements) {
         e = elements[e];
         // remove event listener
         if (e.nodeType) {
            if (!double) e.removeEventListener('click', select);
            else e.removeEventListener('dblclick', select);
         }
      }
      return;
}

// on click handler: select
var clicks = 0; // set counter for counting clicks
var clickDelay = 50; // set delay for double click
var clickTimer = null; // set timer for timeout function
export function select(event) {

      // prevent default
      event.preventDefault();

      // start timer
      if( _timer.dataset.action !== 'start' ) {
         utiltimer('start');
      }

      // if timestamp matches then return false
      var time = event.timeStamp; // get timestamp
      if ( time === lastEventTime ) {
         //console.log('Status: Timestamp Matches, False Click');
         
         return false;
      }
      else {
         lastEventTime = time; // cache timestamp
      }

      // get variables
      var e = event.target; // get element
      var isSelected = e.dataset.selected; // get selected attribute
      var rank = e.dataset.rank; // get rank attribute
      var suit = e.dataset.suit; // get suit attribute
      var pile = e.dataset.pile; // get pile attribute
      var action = e.dataset.action; // get action attribute

      // create card array
      if (rank && suit) var card = [rank,suit];

      // count clicks
      clicks++;

      // single click
      if (clicks === 1 && event.type === 'click') {
         clickTimer = setTimeout(function() {
            //console.log('Single Click Detected', event);
            movementnotification('Single Click');

            // reset click counter
            clicks = 0;

            // if same card is clicked
            if (e.dataset.selected === 'true') {
               movementnotification('Same card seleted');
               // deselect card
               delete e.dataset.selected;
               delete _table.dataset.move;
               delete _table.dataset.selected;
               delete _table.dataset.source;
               //console.log('Card Deselected', card, e);
               movementnotification('Deselected The card');
            }

            // if move is in progress
            else if (_table.dataset.move) {
               //console.log('Status: A Move Is In Progess');
               movementnotification('Moving ...');
               // get selected
               var selected = _table.dataset.selected.split(',');
               // update table dataset with destination pile
               _table.dataset.dest = e.closest('.pile').dataset.pile;
               // get destination card or pile
               if ( card ) var dest = card;
               else var dest = _table.dataset.dest;
               // validate move
               if ( validateMove(selected, dest) ) {
                  // make move
                  makeMove();
                  reset(table);
                  render(table, playedCards);
                  play(table);
               } else {
                  //console.log('Move is Invalid. Try again...');
                  movementnotification('Invalid Move');
                  reset(table);
                  render(table, playedCards);
                  play(table);
                  //console.log('Card Deselected', card, e);
               }
            }

            // if stock is clicked
            else if (pile === 'stock') {
               //console.log('Status: Stock Pile Clicked');
               // if stock isn't empty
               if (table['stock'].length) {
                  // move card from stock to waste
                  move(table['stock'], table['waste']);
                  reset(table);
                  render(table, playedCards);
                  // if empty, then bind click to stock pile element
                  if (table['stock'].length === 0) bindClick('#stock .reload-icon');
                  // count move
                  countMove(moves++);
                  // return to play
                  play(table);
               }
            }

            // if stock reload icon is clicked
            else if (action === 'reload') {
               //console.log('Reloading Stock Pile');
               movementnotification('Reloading');
               // remove event listener
               unbindClick('#stock .reload-icon');
               // reload stock pile
               if (table['waste'].length) {
                  table['stock'] = table['waste']; // move waste to stock
                  table['waste'] = [] // empty waste
               }
               // render table
               render(table, playedCards);
               // turn all stock cards face down
               flipCards('#stock .card', 'down');
               // update score by -100 pts
               //updateScore(-100);
               // return to play
               play(table);
            }

            // if no move is in progress
            else {
               // select card
               e.dataset.selected = 'true';
               _table.dataset.move = 'true';
               _table.dataset.selected = card;
               _table.dataset.source = e.closest('.pile').dataset.pile;
               // if ace is selected
               if (rank === 'A') {
                  //console.log('Ace Is Selected');
                  movementnotification('Selected an ace');
                  bindClick('#fnd #'+suit+'s.pile[data-empty="true"]');
               }
               if (rank === 'K') {
                  //console.log('King Is Selected');
                  movementnotification('Selected a king');
                  bindClick('#tab .pile[data-empty="true"]');
               }
            }

         }, clickDelay);
      }

      // double click
      else if (event.type === 'dblclick') {
         //console.log('Double Click Detected', event);
         clearTimeout(clickTimer); // prevent single click
         clicks = 0; // reset click counter
         // select card
         e.dataset.selected = 'true';
         _table.dataset.move = 'true';
         _table.dataset.selected = card;
         _table.dataset.source = e.closest('.pile').dataset.pile;
         // get destination pile
         if ( card) var dest = card[1]+'s';
         // update table dataset with destination
         _table.dataset.dest = dest;
         // validate move
         if ( validateMove(card, dest) ) {
            // make move
            makeMove();
            reset(table);
            render(table, playedCards);
            play(table);
         } else {
            //console.log('Move is Invalid. Try again...');
            movementnotification('Invalid Move');
            reset(table);
            render(table, playedCards);
            play(table);
            //console.log('Card Deselected', card, e);
         }

      }

   }

// validate move
export function validateMove(selected, dest) {
      //console.log ('Validating Move...', selected, dest);

      // if selected card exists
      if (selected) {
         var sRank = parseRankAsInt(selected[0]);
         var sSuit = selected[1];
      }

      // if destination is another card
      if (dest.constructor === Array) {
         //console.log('Desitination appears to be a card');
         // movementnotification('Single Click');

         var dRank = parseRankAsInt(dest[0]);
         var dSuit = dest[1];
         var dPile = _table.dataset.dest;
         // if destination pile is foundation
         if (['spades','hearts','diamonds','clubs'].indexOf(dPile) >= 0) {
            // if rank isn't in sequence then return false
            if (dRank - sRank !== -1) {
               //console.log('Rank sequence invalid');
               //console.log(dRank - sRank)
               return false;
            }
            // if suit isn't in sequence then return false
            if ( sSuit !== dSuit ) {
               // console.log('Suit sequence invalid');
               return false;
            }
         }
         // if destination pile is tableau
         else {
            // if rank isn't in sequence then return false
            if (dRank - sRank !== 1) {
               //console.log('Rank sequence invalid');
               return false;
            }
            // if suit isn't in sequence then return false
            if ( ( (sSuit === 'spade' || sSuit === 'club') &&
               (dSuit === 'spade' || dSuit === 'club') ) ||
               ( (sSuit === 'heart' || sSuit === 'diamond') &&
               (dSuit === 'heart' || dSuit === 'diamond') ) ) {
               //console.log('Suit sequence invalid');
               return false;
            }
         }
         // else return true
         //console.log('Valid move');
         return true;

      }

      // if destination is foundation pile
      if (['spades','hearts','diamonds','clubs'].indexOf(dest) >= 0) {
         //console.log('Destination appears to be empty foundation');

         // get last card in destination pile
         var lastCard = document.querySelector('#'+dest+' .card:first-child');
         if (lastCard) {
            var dRank = parseRankAsInt(lastCard.dataset.rank);
            var dSuit = lastCard.dataset.suit;
         }
         // if suit doesn't match pile then return false
         if ( sSuit + 's' !== dest ) {
            //console.log('Suit sequence invalid');
            return false;
         }
         // if rank is ace then return true
         else if ( sRank === 1 ) {
            //console.log('Valid Move');
            return true;
         }
         // if rank isn't in sequence then return false
         else if ( sRank - dRank !== 1 ) {
            //console.log('Rank sequence invalid');
            return false;
         }
         // else return true
         else {
            //console.log('Valid move');
            return true;
         }
      }

      // if destination is empty tableau pile
      if ( dest >= 1 && dest <= 7 ) {
         //console.log('Destination appears tp be empty tableau');
         movementnotification('Empty Tableau');
         return true;
      }

   }

// make move
export function makeMove() {
      //console.log('Making Move...');
      movementnotification('Move Card');

      // get source and dest
      var source = _table.dataset.source;
      var dest = _table.dataset.dest;
      //console.log('From '+source+' pile to '+dest+' pile');

      // if pulling card from waste pile
      if ( source === 'waste') {
         // if moving card to foundation pile
         if ( isNaN(dest) ) {
            //console.log('Moving To Foundation Pile');
            move(table[source], table[dest], true);
            //updateScore(10); // score 10 pts
         }
         // if moving card to tableau pile
         else {
            //console.log('Moving To Tableau Pile');
            move(table[source], table['tab'][dest], true);
            //updateScore(5); // score 5 pts
         }
      }

      // if pulling card from foundation pile
      else if (['spades','hearts','diamonds','clubs'].indexOf(source) >= 0) {
         // only allow moves to tableau piles
         if ( isNaN(dest) ) {
            //console.log('That move is not allowed');
            return false;
         }
         // if moving card to tableau pile
         else {
            //console.log('Moving To Tableau Pile');
            move(table[source], table['tab'][dest], true);
            //updateScore(-15); // score -15 pts
         }
      }

      // if pulling card from tableau pile
      else {
         // if moving card to foundation pile
         if ( isNaN(dest) ) {
            //console.log('Moving To Foundation Pile');
            move(table['tab'][source], table[dest], true);
            //updateScore(10); // score 10 pts
         }
         // if moving card to tableau pile
         else {
            //console.log('Moving To Tableau Pile');
            // get selected card
            var selected = document.querySelector('.card[data-selected="true"');
            // get cards under selected card
            var selectedCards = [selected];
            while ( selected = selected['nextSibling'] ) {
               if (selected.nodeType) selectedCards.push(selected);
            }
            // move card(s)
            move(
               table['tab'][source],
               table['tab'][dest],
               true,
               selectedCards.length
            );
         }
      }

      // unbind click events
      unbindClick(
         '#stock .card:first-child,' +
         '#waste .card:first-child,' +
         '#fnd .card:first-child,' +
         '#fnd #spades.pile[data-empty="true"],' +
         '#fnd #hearts.pile[data-empty="true"],' +
         '#fnd #diamonds.pile[data-empty="true"],' +
         '#fnd #clubs.pile[data-empty="true"],' +
         '#tab .card[data-played="true"],' +
         '#tab .pile[data-empty="true"]'
      );
      // unbind double click events
      unbindClick(
         '#waste .card:first-child' +
         '#tab .card:last-child',
         'double'
      )

      // count move
      countMove(moves++);

      // reset table
      //console.log('Ending Move...');
      movementnotification('Move end');

      return;
   }

// parse rank as integer
export function parseRankAsInt(rank) {
   // assign numerical ranks to letter cards
   switch (rank) {
      case 'A' : rank = '1'; break;
      case 'J' : rank = '11'; break;
      case 'Q' : rank = '12'; break;
      case 'K' : rank = '13'; break;
      default : break;
   }
   // return integer value for rank
   return parseInt(rank);
}

// parse integer as rank
export function parseIntAsRank(int) {
   // parse as integer
   rank = parseInt(int);
   // assign letter ranks to letter cards
   switch(rank) {
      case 1 : rank = 'A'; break;
      case 11 : rank = 'J'; break;
      case 12 : rank = 'Q'; break;
      case 13 : rank = 'K'; break;
      default : break;
   }
   return rank;
}

// reset table
export function reset(table) {
      delete _table.dataset.move;
      delete _table.dataset.selected;
      delete _table.dataset.source;
      delete _table.dataset.dest;
      delete _fnd.dataset.played;
      delete _fnd.dataset.unplayed;
      delete _tab.dataset.played;
      delete _tab.dataset.unplayed;
      //console.log('Table reset');
      movementnotification('Table Reset');
   }


// move counter
export function countMove(moves) {
      //console.log('Move Counter', moves);
      // set move attribute
      _moveCount.dataset.moves = moves + 1;
      // output to display
      _moveCountSpan.textContent = moves + 1;
      return;
}

// calculate bonus points
export function getBonus() {
      if (time >= 30) bonus = parseInt(700000 / time);
      //console.log(bonus);
      return bonus;
}


// check for auto win
export function checkForAutoWin(table) {
      // if all tableau cards are played and stock is empty
      if (  parseInt(_tab.dataset.unplayed) +
            table['stock'].length +
            table['waste'].length === 0) {
         // show auto win button
         _autoWin.style.display = 'block';
         // bind click to auto win button
         _autoWin.addEventListener('click', autoWin);
      }
      return;
   }

// auto win
export function autoWin() {
      //console.log('Huzzah!');
      // hide auto win button
      _autoWin.style.display = 'none';
      // unbind click to auto win button
      _autoWin.removeEventListener('click', autoWin);
      // unbind click events
      unbindClick(
         '#stock .card:first-child,' +
         '#waste .card:first-child,' +
         '#fnd .card:first-child,' +
         '#fnd #spades.pile[data-empty="true"],' +
         '#fnd #hearts.pile[data-empty="true"],' +
         '#fnd #diamonds.pile[data-empty="true"],' +
         '#fnd #clubs.pile[data-empty="true"],' +
         '#tab .card[data-played="true"],' +
         '#tab .pile[data-empty="true"]'
      );
      // unbind double click events
      unbindClick(
         '#waste .card:first-child' +
         '#tab .card:last-child',
         'double'
      );
      // reset table
      reset(table);
      render(table);
      // animate cards to foundation piles
      //autoWinAnimation(table);
      // stop timer
      utiltimer('stop');
      // bonus points for time
      //updateScore(getBonus());
}