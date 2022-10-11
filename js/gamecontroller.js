import { render, play, tablegame, playedCards } from "./solitaire.js?v2";

$( document ).ready(function() {
    $("#reload").click( function(){
        location.reload(); // reset the game
    });

    $("#dealgame").click( function(){
        render(tablegame, playedCards); // render all the cards to the table
        play(tablegame); // start the game
    });
});