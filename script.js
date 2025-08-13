// Constants


// Handles the button between Panel 1 and Panel 2
function handleButtonClick() {
  alert("Middle Action Button Clicked");
  const inputVals = getInputValues();
  const columnStringsArray = inputVals.slice(0, 11);
  const freeSlotString = inputVals[11];

  const newGameState = GameState.initFromColumnsStringArray(columnStringsArray, freeSlotString);
  setDisplayValsFromGameState(newGameState);
}

// Handles the button below Panel 1 and Panel 2
function handleBelowTopButtonClick() {
  alert("Button Below Top Panels Clicked");
}

// Handles the button below Panel 3
function handleBelowPanel3ButtonClick() {
  alert("Button Below Panel 3 Clicked");
}

// Takes a string
// trims preceding and trailing whitespace
// reduces and instances of multiple spaces to a single sace
// makes it lowercase
function cleanInputString(inputString) {
  let updatedString = inputString;
  updatedString = updatedString.trim();
  updatedString = updatedString.replace(/  +/g, ' ');
  updatedString = updatedString.toLowerCase();

  return updatedString;
}

// Sets the content in the table of Panel 2, including the top row
// topRowValues: array of 7 strings for the top row headers
// columnsData: array of arrays for each column's content
function setDisplayVals(topRowValues, columnsData) {
  const table = document.querySelector(".panel-2 table");
  const errorList = document.getElementById("panel2-error-list");

  // Show the table and hide errors
  table.style.display = "table";
  if (errorList) errorList.style.display = "none";

  // Update the top row headers
  const thead = table.querySelector("thead tr");
  thead.innerHTML = "";
  topRowValues.forEach(value => {
    const th = document.createElement("th");
    th.textContent = value;
    thead.appendChild(th);
  });

  // Update the columns below
  const tableColumns = table.querySelector(".table-columns");
  tableColumns.innerHTML = "";

  columnsData.forEach((col, index) => {
    const columnDiv = document.createElement("div");
    columnDiv.className = "column";

    const label = document.createElement("div");
    label.className = "column-label";
    label.textContent = `Col ${index + 1}`;
    columnDiv.appendChild(label);

    col.forEach(item => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = item;
      columnDiv.appendChild(cell);
    });

    tableColumns.appendChild(columnDiv);
  });
}


function setDisplayValsFromGameState(gameState) {

  const tarotSmall = gameState.tarotSmallPile.lookTopCard();
  const tarotLarge = gameState.tarotLargePile.lookTopCard();
  const freeSlot = gameState.freeSlotPile.lookTopCard();
  // yrgb
  const suitY = gameState.suitYPile.lookTopCard();
  const suitR = gameState.suitRPile.lookTopCard();
  const suitG = gameState.suitGPile.lookTopCard();
  const suitB = gameState.suitBPile.lookTopCard();

  const topVals = [];

  if (tarotSmall === null){
    topVals.push("----");
  } else {
    topVals.push(tarotSmall.toString())
  }
  if (tarotLarge === null){
    topVals.push("----");
  } else {
    topVals.push(tarotLarge.toString())
  }

  if (freeSlot === null){
    topVals.push("[    ]");
  } else {
    topVals.push(freeSlot.toString())
  }

  if (suitY === null){
    topVals.push("----");
  } else {
    topVals.push(suitY.toString())
  }
  if (suitR === null){
    topVals.push("----");
  } else {
    topVals.push(suitR.toString())
  }
  if (suitG === null){
    topVals.push("----");
  } else {
    topVals.push(suitG.toString())
  }
  if (suitB === null){
    topVals.push("----");
  } else {
    topVals.push(suitB.toString())
  }

  const columnStringArrays = gameState.getColumnStringArrays();

  setDisplayVals(topVals, columnStringArrays);
}

// Hides the table and shows error messages in Panel 2
// errors: array of strings
function showPanel2Errors(errors) {
  const table = document.querySelector(".panel-2 table");
  let errorList = document.getElementById("panel2-error-list");

  // Hide the table
  table.style.display = "none";

  // Create the error list if it doesn't exist
  if (!errorList) {
    errorList = document.createElement("ul");
    errorList.id = "panel2-error-list";
    errorList.style.color = "red";
    errorList.style.padding = "10px";
    errorList.style.marginTop = "10px";
    document.querySelector(".panel-2").appendChild(errorList);
  }

  // Show and populate the error list
  errorList.style.display = "block";
  errorList.innerHTML = "";
  errors.forEach(error => {
    const li = document.createElement("li");
    li.textContent = error;
    errorList.appendChild(li);
  });
}

// Sets the ordered list in Panel 3
function setPanel3Text(items) {
  const list = document.querySelector(".panel-3 ol");
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

// Gets all values from the text boxes in Panel 1 and returns them as an array of strings
function getInputValues() {
  const inputs = document.querySelectorAll(".input-panel input[type='text']");
  return Array.from(inputs).map(input => input.value);
}

// Solver Logic


// Card class
class Card {
  static COLOR_SUITS = ['y', 'r', 'g', 'b'];

  constructor(intVal, cardSuit) {
      this.intVal = intVal;
      this.suit = cardSuit.toLowerCase().trim();

      if (!(Number.isInteger(this.intVal))){
          throw new Error(`Error - tried to create card with invalid integer ${intVal}`);
      }

      if (this.suit === 't'){
          if (!(0 <= this.intVal <= 21)) {
              throw new Error(`Error - Tarot card cannot have value ${this.intVal}`)
          }
      } else if (Card.COLOR_SUITS.includes(this.suit)){
          if (!(1 <= this.intVal <= 13)) {
              throw new Error(`Error - Color Suit card cannot have value ${this.intVal}`)
          }
      }

  }

  static newCardFromString(cardStr) {
    const cleanCardStr = cleanInputString(cardStr);
    const cardSuit = cleanCardStr.substring(cardStr.length - 1);
    const cardVal = cleanCardStr.substring(0, cardStr.length - 1);

    let intVal = -1;
    if (cardVal === 'j') {
      intVal = 11;
    } else if (cardVal === 'q') {
      intVal = 12;
    } else if (cardVal === 'k') {
      intVal = 13;
    } else {
      intVal = parseInt(cardVal);
    }

    try {
      return new Card(intVal, cardSuit);
    } catch (error) {
      throw new Error(`Invalid cardstr - ${cardStr}`);
    }
  }


  toString() {
    let valStr = '';
    if (Card.COLOR_SUITS.includes(this.suit)) {
      if (this.intVal === 11) {
        valStr = 'J';
      } else if (this.intVal === 12) {
        valStr = 'Q';
      } else if (this.intVal === 13) {
        valStr = 'K';
      } else {
        valStr = this.intVal.toString();
      }
    } else {
      valStr = this.intVal.toString();
    }
    return valStr + this.suit.toUpperCase();
  }

  static canPlaceCard(topCard, bottomCard) {
    /**
     * @param {Card} topCard
     * @param {Card} bottomCard
     */
    if (topCard.suit !== bottomCard.suit) {
      return false;
    }
    const valDiff = topCard.intVal - bottomCard.intVal;
    return valDiff === 1 || valDiff === -1;
  }

  static sameCard(topCard, bottomCard) {
    return (
      topCard.suit === bottomCard.suit &&
      topCard.intVal === bottomCard.intVal
    );
  }

  getNextLowerCard() {
    if (this.suit === 't') {
      if (this.intVal === 0) {
        return null;
      } else {
        return new Card(this.intVal - 1, this.suit);
      }
    } else {
      if (this.intVal === 1) {
        return null;
      } else {
        return new Card(this.intVal - 1, this.suit);
      }
    }
  }

  getNextHigherCard() {
    if (this.suit === 't') {
      if (this.intVal === 21) {
        return null;
      } else {
        return new Card(this.intVal + 1, this.suit);
      }
    } else {
      if (this.intVal === 13) {
        return null;
      } else {
        return new Card(this.intVal + 1, this.suit);
      }
    }
  }
}

// CardPile class
class CardPile {
    static PILE_TYPES = ["column", "tarotSmall", "tarotLarge", "freeSlot", "suitPile"];
    static COLOR_SUITS = ["y", "r", "g", "b"];

    constructor(pileType, suit, topCard = null, cardArray = null) {

        if (!CardPile.PILE_TYPES.includes(pileType)){
            throw new Error(`Invalid pile type ${pileType}`);
        }
        if (pileType === "suitPile" && !CardPile.COLOR_SUITS.includes(suit)) {
            throw new Error(`Invalid suitPile type ${suit}`);
        }
        this.pileType = pileType;
        this.suit = suit;

        this.topCard = topCard;
        this.cardArray = cardArray;
    }

    lookTopCard(){
        if (this.pileType === "column"){
            if (this.cardArray.length === 0){
                return null;
            } else {
                return this.cardArray[this.cardArray.length - 1];
            }
        } else {
            return this.topCard;
        }
    }

    popTopCard(){
      if (this.pileType === "column"){
        return this.cardArray.pop();
      } else if (this.pileType === "freeSlot"){
        const topCard = this.topCard;
        this.topCard = null;
        return topCard;
      } else {
        throw new Error(`Can't pop from ${this.pileType}`);
      }
    }

    canReceiveCardColumn(card){
        /**
         * @param {Card} card
         */
        if (this.pileType !== "column"){
            throw new Error(`Tried to call canReceiveCardColumn on a ${this.pileType} pile`);
        }
        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null){
            return true;
        } else {
            return Card.canPlaceCard(card, pileTopCard);
        }
    }

    canReceiveCardFreeSlot (card){
        /**
         * @param {Card} card
         */
        if (this.pileType !== "freeSlot"){
            throw new Error(`Tried to call canReceiveFreeSlot on a ${this.pileType} pile`);
        }
        return this.lookTopCard() === null;
    }

    canReceiveCardTarotSmall (card){
        /**
         * @param {Card} card
         */
        if (this.pileType !== "tarotSmall"){
            throw new Error(`Tried to call canReceiveCardTarotSmall on a ${this.pileType} pile`);
        }
        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null){
            return (card.intVal === 0 && card.suit === "t");
        } else {
            return Card.canPlaceCard(card, pileTopCard)
        }
    }

    canReceiveCardTarotLarge (card){
        /**
         * @param {Card} card
         */
        if (this.pileType !== "tarotLarge"){
            throw new Error(`Tried to call canReceiveCardTarotLarge on a ${this.pileType} pile`);
        }
        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null){
            return (card.intVal === 21 && card.suit === "t");
        } else {
            return Card.canPlaceCard(card, pileTopCard)
        }
    }

    canReceiveCardSuitPile (card){
        /**
         * @param {Card} card
         */
        if (this.pileType !== "suitPile"){
            throw new Error(`Tried to call canReceiveCardSuitPile on a ${this.pileType} pile`);
        }

        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null) {
            return (card.intVal === 1 && card.suit === this.suit);
        } else {
            return Card.canPlaceCard(card, pileTopCard);
        }
    }

    canReceiveCard (card){
        switch (this.pileType){
            case "column":
                return this.canReceiveCardColumn(card);
            case "tarotSmall":
                return this.canReceiveCardTarotSmall(card);
            case "tarotLarge":
                return this.canReceiveCardTarotLarge(card);
            case "freeSlot":
                return this.canReceiveCardFreeSlot(card);
            case "suitPile":
                return this.canReceiveCardSuitPile(card);
            default:
                throw new Error("Invalid pile type " + this.pileType);
        }
    }

    clone(){
        let cloneCardArray = null;
        if (this.cardArray !== null){
            cloneCardArray = this.cardArray.slice();
        }

        return new CardPile(
          this.pileType,
          this.suit,
          this.topCard,
          cloneCardArray,
        );
    }

    placeCard(card){
        if (!this.canReceiveCard(card)){
            throw new Error(`Error: Tried to place ${card} on ${this.pileType} - ${this.lookTopCard()}`);
        }
        if (this.pileType === "column"){
            this.cardArray.push(card);
        } else {
            this.topCard = card;
        }
    }

    static initColumnPileFromString(initString){
        const cleanInitString = cleanInputString(initString);
        const cardArray = [];
        if (cleanInitString.length > 0){
            const cardStringArray = cleanInitString.split(" ");
            for (const cardStr of cardStringArray){
                const newCard = Card.newCardFromString(cardStr);
                cardArray.push(newCard);
            }
        }
        return new CardPile('column', null, null, cardArray);

    }

    static initFreeSlotPileFromString(freeSlotCardStrRaw){
      const cleanFreeSlotCardStr = cleanInputString(freeSlotCardStrRaw);
      if (cleanFreeSlotCardStr === "" || cleanFreeSlotCardStr === null) {
        return new CardPile('freeSlot', null, null, null);
      } else {
        const freeSlotCard = Card.newCardFromString(cleanFreeSlotCardStr);
        return new CardPile('freeSlot', null, freeSlotCard, null);
      }
    }

    toString(){
      const cardStrArray = []
      for (const card of this.cardArray){
        cardStrArray.push(card.toString());
      }

      return cardStrArray.join(" ");

    }

    /*
    Gets the stack on top of a column or free slot. Stacks are cards that can be safely moved together.
    returns [stackSize, topCard, BottomCard]
    if the column / free slot has no cards, returns [0, null, null]
    if the topmost card isn't part of a stack, returns [1, topCard, topCard]
    the free slot will always return a 0 or 1 stack size
     */
    getTopStack() {
      if (!(this.pileType === "column" || this.pileType ==="freeSlot")){
        throw new Error(`Tried to check for top stack on ${this.pileType}`);
      }

      if (this.pileType === "freeSlot"){
        if (this.isEmpty()) {
          return [0, null, null];
        } else {
          return [1, this.topCard, this.topCard];
        }

      } else if (this.pileType === "column"){
        if (this.cardArray.length === 0){
          return [0, null, null];
        }

        const topCard = this.lookTopCard();
        if (this.cardArray.length === 1){
          return [1, topCard, topCard];}


        let aboveCard = topCard;
        let lowestCard = topCard
        let stackSize = 1;
        for (let i = this.cardArray.length -2;i >= 0; i--) {
          const belowCard = this.cardArray[i];
          if (Card.canPlaceCard(aboveCard, belowCard)) {
            stackSize += 1;
            aboveCard = belowCard;
            lowestCard = belowCard;
          } else {
            break;
          }
        }
        return [stackSize, topCard, lowestCard];
      } else {
        throw new Error("Logic error");
      }

    }

    countCardInPile(searchCard){
      let cardCount = 0;
      switch (this.pileType) {
        case "column": {
          for (const cardInCol of this.cardArray){
            if (Card.sameCard(cardInCol, searchCard)) {
              cardCount += 1;
            }
          }

          break;
        }
        case "tarotSmall": {
          const pileTopVal = this.lookTopCard().intVal;
          if (searchCard.intVal <= pileTopVal) {
            cardCount = 1;
          }
          break;
        }
        case "tarotLarge": {
          const pileTopVal = this.lookTopCard().intVal;
          if (searchCard.intVal >= pileTopVal) {
            cardCount = 1;
          }
          break;
        }
        case "freeSlot": {
          if (this.lookTopCard() && (Card.sameCard(searchCard, this.lookTopCard()))){
            cardCount = 1;
          }
          break;
        }
        case "suitPile": {
          const pileTopVal = this.lookTopCard().intVal;
          if (searchCard.suit === this.suit && searchCard.intVal <= pileTopVal) {
            cardCount = 1;
          }
          break;
        }
        default:{
          throw new Error(`Cardpile as invalid type ${this.pileType}, can't search`)
        }
      }
      return cardCount;
    }

    isEmpty() {
        if (this.pileType === "column"){
            return this.cardArray.length === 0;
        } else {
            return this.lookTopCard() === null;
        }
    }

    columnToStringArray() {
      const outStringArray = [];
      for (const card of this.cardArray){
        outStringArray.push(card.toString());
      }
      return outStringArray;
    }

    columnToIDStr(){
        return this.cardArray.join("");
    }

    lookCardAtRow(rowNum){
        if (this.cardArray.length <= rowNum){
            return null;
        } else {
            return this.cardArray[rowNum];
        }
    }

    /*
    if a card on top, returns that card, otherwise "empty"
     */
    topCardStr(){
        if (this.isEmpty()) return "empty";
        else return this.lookTopCard().toString();

    }
}

// GameState Class
let cellPadding = 5;

class GameState {
    constructor (columnPilesArray, tarotSmallPile, tarotLargePile, freeSlotPile,
                 suitYPile, suitRPile, suitGPile, suitBPile) {
      this.columnPilesArray = columnPilesArray;
      this.tarotSmallPile = tarotSmallPile;
      this.tarotLargePile = tarotLargePile;
      this.freeSlotPile = freeSlotPile;
      this.suitYPile = suitYPile;
      this.suitRPile = suitRPile;
      this.suitGPile = suitGPile;
      this.suitBPile = suitBPile;

      this.loggedMoveSets = [];
    }

    static COLUMN_LABELS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11"];
    static COMMIT_PILE_LABELS = ["tarotSmall", "tarotLarge", "suitY", "suitR", "suitG", "suitB"];
    static SUIT_PILE_LABELS = ["suitY", "suitR", "suitG", "suitB"];

    static initFromColumnsStringArray(columnStringsArray, freeSlotString){
      const columnPilesArray = [];
      for (const columnString of columnStringsArray){
        const nextColumnPile = CardPile.initColumnPileFromString(columnString);
        columnPilesArray.push(nextColumnPile);
      }

      const freeSlotPile = CardPile.initFreeSlotPileFromString(freeSlotString);

      const tarotPileSmall = new CardPile("tarotSmall", null);
      const tarotPileLarge = new CardPile("tarotLarge", null);
      const suitPileY = new CardPile("suitPile", "y");
      const suitPileR = new CardPile("suitPile", "r");
      const suitPileG = new CardPile("suitPile", "g");
      const suitPileB = new CardPile("suitPile", "b");

      const newGameState = new GameState(columnPilesArray,
        tarotPileSmall, tarotPileLarge, freeSlotPile,
        suitPileY, suitPileR, suitPileG, suitPileB);
      newGameState.initTopPiles();
      newGameState.validate();
      return newGameState

    }

    countCardInColumnsAndFree(searchCard){
      let count = 0;
      for (const columnPile of this.columnPilesArray) {
        count += columnPile.countCardInPile(searchCard);
      }
      count += this.freeSlotPile.countCardInPile(searchCard);
      return count;
    }

    isCardCommitted(searchCard){
        switch(searchCard.suit){
            case "t":
                if (!(this.tarotSmallPile.isEmpty())){
                    if (this.tarotSmallPile.lookTopCard().intVal >= searchCard.intVal){
                        return true;
                    }
                }
                if (!(this.tarotLargePile.isEmpty())){
                    if (this.tarotLargePile.lookTopCard().intVal <= searchCard.intVal){
                        return true;
                    }
                }
                return false;
            case "y":
                if (this.suitYPile.isEmpty()) throw new Error(`Error! ${searchCard.suit} pile should never be empty!`);
                return this.suitYPile.lookTopCard().intVal >= searchCard.intVal;
            case "r":
                if (this.suitRPile.isEmpty()) throw new Error(`Error! ${searchCard.suit} pile should never be empty!`);
                return this.suitRPile.lookTopCard().intVal >= searchCard.intVal;
            case "g":
                if (this.suitGPile.isEmpty()) throw new Error(`Error! ${searchCard.suit} pile should never be empty!`);
                return this.suitGPile.lookTopCard().intVal >= searchCard.intVal;
            case "b":
                if (this.suitBPile.isEmpty()) throw new Error(`Error! ${searchCard.suit} pile should never be empty!`);
                return this.suitBPile.lookTopCard().intVal >= searchCard.intVal;
            default:
                throw new Error("!");


        }
    }

    validate(){
        for (const suit of ["y", "r", "g", "b"]) {
            for (let val = 1; val <= 13; ++val) {
                const searchCard = new Card(val, suit);
                let count = 0;
                count += this.countCardInColumnsAndFree(searchCard);
                if (this.isCardCommitted(searchCard)) count ++;
                if (count === 0) throw new Error(`Validation failed! ${searchCard} missing!`);
                if (count > 1) throw new Error(`Validation failed! Found ${count} copies of ${searchCard}!`);
            }
        }
        for (let val = 0; val <= 21; ++val) {
            const searchCard = new Card(val, "t");
            let count = 0;
            count += this.countCardInColumnsAndFree(searchCard);
            if (this.isCardCommitted(searchCard)) count ++;
            if (count === 0) throw new Error(`Validation failed! ${searchCard} missing!`);
            if (count > 1) throw new Error(`Validation failed! Found ${count} copies of ${searchCard}!`);
        }
        return true;
    }

    findSmallestTarotCardInPlay(){
      for (let i = 0; i <= 21; i++) {
        const searchCard = new Card(i, 't');
        if (this.countCardInColumnsAndFree(searchCard) >= 1) {
          return searchCard;
        }
      }
      return null;
    }

  findLargestTarotCardInPlay(){
    for (let i = 21; i >= 0; i--) {
      const searchCard = new Card(i, 't');
      if (this.countCardInColumnsAndFree(searchCard) >= 1) {
        return searchCard;
      }
    }
    return null;
  }

  findSmallestSuitCardInPlay(suit){
      const suitLower = suit.toLowerCase();
      if (!Card.COLOR_SUITS.includes(suit)) {
        throw new Error(`Invalid suit type ${ suit }`);
      }
      for (let i = 1; i <= 13; i++) {
        const searchCard = new Card(i, suitLower);
        if (this.countCardInColumnsAndFree(searchCard) >= 1){
          return searchCard;
        }
      }
      return null;
  }

  initTopPiles(){
      const smallestTarotCardInPlay = this.findSmallestTarotCardInPlay();
      const largestTarotCardInPlay = this.findLargestTarotCardInPlay();
      if (smallestTarotCardInPlay === null && largestTarotCardInPlay === null){
        this.tarotSmallPile.topCard = new Card(10, 't');
        this.tarotLargePile.topCard = new Card(11, 't');
      } else {
        const highestCommittedSmallTarotCard = smallestTarotCardInPlay.getNextLowerCard();
        const smallestCommittedLargeTarotCard = largestTarotCardInPlay.getNextHigherCard();
        this.tarotSmallPile.topCard = highestCommittedSmallTarotCard;
        this.tarotLargePile.topCard = smallestCommittedLargeTarotCard;
      }

      const smallestYInPlay = this.findSmallestSuitCardInPlay("y");
      const smallestRInPlay = this.findSmallestSuitCardInPlay("r");
      const smallestGInPlay = this.findSmallestSuitCardInPlay("g");
      const smallestBInPlay = this.findSmallestSuitCardInPlay("b");

      if ((smallestYInPlay !== null) && Card.sameCard(Card.newCardFromString("1y"), smallestYInPlay)) {
          throw new Error(`Card 1Y should not be in play`);
      }
      if ((smallestRInPlay !== null) && Card.sameCard(Card.newCardFromString("1r"), smallestRInPlay)) {
          throw new Error(`Card 1R should not be in play`);
      }
      if ((smallestGInPlay !== null) && Card.sameCard(Card.newCardFromString("1g"), smallestGInPlay)) {
          throw new Error(`Card 1G should not be in play`);
      }
      if ((smallestBInPlay !== null) && Card.sameCard(Card.newCardFromString("1b"), smallestBInPlay)) {
          throw new Error(`Card 1B should not be in play`);
      }

      if (smallestYInPlay === null){
        this.suitYPile.topCard = new Card(13, 'y');
      } else {
        this.suitYPile.topCard = smallestYInPlay.getNextLowerCard();
      }
      if (smallestRInPlay === null){
        this.suitRPile.topCard = new Card(13, 'r');
      } else {
        this.suitRPile.topCard = smallestRInPlay.getNextLowerCard();
      }
      if (smallestGInPlay === null){
        this.suitGPile.topCard = new Card(13, 'g');
      } else {
        this.suitGPile.topCard = smallestGInPlay.getNextLowerCard();
      }
      if (smallestBInPlay === null){
        this.suitBPile.topCard = new Card(13, 'b');
      } else {
        this.suitBPile.topCard = smallestBInPlay.getNextLowerCard();
      }
  }

  /*
  Get an array of arrays of column string, for displaying info
   */
  getColumnStringArrays(){
      const columnStringArrays = [];
      for (const columnPile of this.columnPilesArray) {
        columnStringArrays.push(columnPile.columnToStringArray());
      }
    return columnStringArrays;
  }

  firstEmptyColumn(){
      for (const columnLabel of GameState.COLUMN_LABELS){
        const columnPile = this.getPileFromLabel(columnLabel);
        if (columnPile.isEmpty()) return columnLabel;
        }
      return null;
  }

  /*
  Note the label value offset, just to make it a little easier when displaying output
   */
  getPileFromLabel(pileLabel){
      switch (pileLabel){

        case "c1":
          return this.columnPilesArray[0];
        case "c2":
          return this.columnPilesArray[1];
        case "c3":
          return this.columnPilesArray[2];
        case "c4":
          return this.columnPilesArray[3];
        case "c5":
          return this.columnPilesArray[4];
        case "c6":
          return this.columnPilesArray[5];
        case "c7":
          return this.columnPilesArray[6];
        case "c8":
          return this.columnPilesArray[7];
        case "c9":
          return this.columnPilesArray[8];
        case "c10":
          return this.columnPilesArray[9];
        case "c11":
          return this.columnPilesArray[10];
        case "tarotSmall":
          return this.tarotSmallPile;
        case "tarotLarge":
          return this.tarotLargePile;
        case "freeSlot":
          return this.freeSlotPile;
        case "suitY":
          return this.suitYPile;
        case "suitR":
          return this.suitRPile;
        case "suitG":
          return this.suitGPile;
        case "suitB":
          return this.suitBPile;
        default:
          throw new Error(`Inalid pile name - ${pileLabel}`);
      }
  }

  getDisplayTextArray(cellPadding=5){
      const outputArray = [];
      let topLine = "";
      if (this.tarotSmallPile.isEmpty()){
          topLine += "   <T"
      } else {
          topLine += this.tarotSmallPile.lookTopCard().toString().padStart(cellPadding, " ");
      }
      if (this.tarotLargePile.isEmpty()){
          topLine += "   >T"
      } else {
          topLine += this.tarotLargePile.lookTopCard().toString().padStart(cellPadding, " ");
      }

      if (this.freeSlotPile.isEmpty()){
          topLine += " [ ] "
      } else {
          topLine += this.freeSlotPile.lookTopCard().toString().padStart(cellPadding, " ");
      }

      topLine += this.suitYPile.lookTopCard().toString().padStart(cellPadding, " ");
      topLine += this.suitRPile.lookTopCard().toString().padStart(cellPadding, " ");
      topLine += this.suitGPile.lookTopCard().toString().padStart(cellPadding, " ");
      topLine += this.suitBPile.lookTopCard().toString().padStart(cellPadding, " ");

      outputArray.push(topLine);
      let columnLabelLine = "";
      for (const columnLabel of GameState.COLUMN_LABELS){
          columnLabelLine += columnLabel.padStart(cellPadding, " ");
      }
      outputArray.push ("-----------")
      outputArray.push(columnLabelLine);
      let i = 0;
      while(true){
          let nextLine = "";
          let foundCardOnRow = false;
          for (let c = 0; c < 11; c++) {
              const columnPile = this.columnPilesArray[c];
              const cardAti = columnPile.lookCardAtRow(i);
              if (cardAti === null){
                  nextLine += "".padStart(cellPadding, " ");
              } else {
                  nextLine += cardAti.toString().padStart(cellPadding, " ");
                  foundCardOnRow = true;
              }
          }
          outputArray.push(nextLine);
          if (!(foundCardOnRow)) break;
          i++;
      }
      return outputArray;
  }

  logStateToConsole(){
      const lines = this.getDisplayTextArray(5);
      for (const line of lines){
          console.log(line);
      }
  }

  executeSingleMove(origin, dest){
      const originPile = this.getPileFromLabel(origin);
      const destPile = this.getPileFromLabel(dest);

      const moveCard = originPile.popTopCard();
      destPile.placeCard(moveCard);

  }

  executeMoveSet(moveSet) {
      for (const singleMove of moveSet.singleMoveArray){
        this.executeSingleMove(singleMove[0], singleMove[1]);
      }
      this.loggedMoveSets.push(moveSet);
  }

  checkValidMove(origin, dest){
    const originPile = this.getPileFromLabel(origin);
    const destPile = this.getPileFromLabel(dest);

    const moveCard = originPile.lookTopCard();
    if (!(moveCard === null)) {
      return destPile.canReceiveCard(moveCard);
    } else {
      return false;
    }
  }

  freeSlotIsEmpty(){
      return (this.freeSlotPile.lookTopCard() === null);
  }

  /* Checks if cards can be moved from one pile to another and returns a moveset if so
      Returns null if no such move is valid
   */
  static VALID_ORIGIN_LABELS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "freeSlot"];

  genMoveSet(originLabel, destLabel, auto=false){
      if (!(GameState.VALID_ORIGIN_LABELS.includes(originLabel))){
        throw new Error(`Error can't move from ${originLabel}`);
      }
      const originPile = this.getPileFromLabel(originLabel);
      const destPile = this.getPileFromLabel(destLabel);

      const [stackSize, topCard, bottomCard] = originPile.getTopStack();
      if (stackSize === 0) return null;
      if (!destPile.canReceiveCard(topCard)) return null;

      const destDesc = destPile.topCardStr();

      if (stackSize === 1){
        let desc = `Move ${topCard} from ${originLabel} to ${destLabel} (${destDesc})`;
        if (auto){
            desc = "AUTO " + desc;
        }
        return MoveSet.newSingleMove(desc, originLabel, destLabel);
      } else {
        let desc = `Move ${stackSize} stack (${topCard} - ${bottomCard}) from ${originLabel} to ${destLabel} (${destDesc})`;
        if (auto) {
            desc = "AUTO " + desc;
        }
        const newMoveSet = new MoveSet(desc);
        newMoveSet.addStackMove(originLabel, destLabel, stackSize);
        return newMoveSet;
      }
  }


  genFlipMoveSet(originLabel, destPileLabel, emptyColumnLabel){
    if (this.getPileFromLabel(emptyColumnLabel) > 0){
      throw new Error(`Error ${emptyColumnLabel} is not empty`);
    }

    const originPile = this.getPileFromLabel(originLabel);
    const destPile = this.getPileFromLabel(destPileLabel);
    const [stackSize, topCard, bottomCard] = originPile.getTopStack()

    if (stackSize <= 1) return null;

    if (destPile.canReceiveCard(bottomCard)) {
        const destDesc = destPile.topCardStr();
        let desc = "";
        if (GameState.COMMIT_PILE_LABELS.includes(destPileLabel)) {
        desc = `Move ${stackSize} card stack (${topCard} - ${bottomCard}) from ${originLabel} to empty column ${emptyColumnLabel} then AUTO MOVE to ${destPileLabel}`
        } else {
        desc = `Move ${stackSize} card stack (${topCard} - ${bottomCard}) from ${originLabel} to empty column ${emptyColumnLabel} then to ${destPileLabel} ((${destDesc}))`
        }
        const newMoveSet = new MoveSet(desc);
        newMoveSet.addStackMove(originLabel, emptyColumnLabel, stackSize - 1);
        newMoveSet.addSingleMove(originLabel, destPileLabel);
        newMoveSet.addStackMove(emptyColumnLabel, destPileLabel, stackSize - 1);
        return newMoveSet;
    }

    return null;
  }

  genSingleMoveMoveSet(originLabel, destLabel){
      const originPile = this.getPileFromLabel(originLabel);
      const destPile = this.getPileFromLabel(destLabel);

      const moveCard = originPile.lookTopCard();
      if (destPile.canReceiveCard(moveCard)) {
          const destDesc = destPile.topCardStr();
          const desc = `Move ${moveCard} from ${originLabel} to ${destLabel} (${destDesc})`;
          return MoveSet.newSingleMove(desc, originLabel, destLabel);
      }

      return null;
  }

  getNextForcedMoveSet() {
      // FreeSlot - > Tarot
    const freeToTarotSmall = this.genMoveSet("freeSlot", "tarotSmall", true);
    if (freeToTarotSmall !== null) return freeToTarotSmall;
    const freeToTarotLarge = this.genMoveSet("freeSlot", "tarotLarge", true);
    if (freeToTarotLarge !== null) return freeToTarotLarge;

    // Column -> Tarot
    for (const originLabel of GameState.COLUMN_LABELS) {
      const colToTarotSmall = this.genMoveSet(originLabel, "tarotSmall", true);
      if (colToTarotSmall !== null) return colToTarotSmall;
      const colToTarotLarge = this.genMoveSet(originLabel, "tarotLarge", true);
      if (colToTarotLarge !== null) return colToTarotLarge;
    }

    // Column -> suit pile (only if free slot is empty)
    if (this.freeSlotIsEmpty()){
      for (const originColumnLabel of GameState.COLUMN_LABELS){
        for (const destSuitPileLabel of GameState.SUIT_PILE_LABELS){
          const colToSuitPile = this.genMoveSet(originColumnLabel, destSuitPileLabel, true);
          if (colToSuitPile !== null) return colToSuitPile;
        }
      }
    }

    return null;
  }

  processForcedMoves(){
    let nextForcedMove = this.getNextForcedMoveSet();
    while(!(nextForcedMove === null)){
      this.executeMoveSet(nextForcedMove);
      nextForcedMove = this.getNextForcedMoveSet()

    }
  }

  /*
  This will generate all possible moves (that are worth considering) from the current gamestate.
  They are generated in order from "most likely to be a good move" to "probably a waste of time".
  We assume that all forced moves have already been processed.
  The logic is a bit messy, but certain types of moves are a lot more likely to get good results than others.
  That's why there's a lot of repetition that seems inefficient.

  Note: when moving something to an empty column, ALWAYS use the leftmost column for clarity
  Move order:
  - If there's an empty column,
  check if the bottom card of each column top stack could be commited to a tarot pile
  - If there's an empty column and the free slot is empty,
  check if the bottom card of each column top stack could be commited to a suit pile
  - Check if the free slot card can be placed on any columns that have cards (not empty)
  - If there is a free column, Check if any top stacks can be placed on any columns with cards after flipping
  - Check if any top stacks can be placed on any columns with cards
  (Now moves are getting less obvious)
  - If there is an empty column, try moving top stacks larger than one card to it
  - If the free slot is empty, try moving single card stacks on to it
  - If the free slot is empty, try moving the top card of 2 size stacks to it
  - If a column is empty, try moving a 2 or larger stacks to it
  - If a column is empty and the free slot is full, try moving the free slot card to the column
  - If a column is empty, try moving a single card stack to it
  - If a column is empty, try moving the top card of a 2 size stack to the empty column

   */
  *possibleMoves(){
    const firstEmptyColumnLabel = this.firstEmptyColumn();
    const freeSlotIsEmpty = this.freeSlotIsEmpty();

    // If there's an empty column,
    // check if the bottom card of each column top stack could be commited to a tarot pile
    if (firstEmptyColumnLabel != null){
      for (const originColumnLabel of GameState.COLUMN_LABELS) {
        const originPile = this.getPileFromLabel(originColumnLabel);
        if (originPile.isEmpty()) continue;
        const moveResultS = this.genFlipMoveSet(originColumnLabel, "tarotSmall", firstEmptyColumnLabel);
        if (moveResultS !== null) yield moveResultS;
        const moveResultL = this.genFlipMoveSet(originColumnLabel, "tarotLarge", firstEmptyColumnLabel);
        if (moveResultL !== null) yield moveResultL;
      }
    }

    // If there's an empty column and the free slot is empty,
      //   check if the bottom card of each column top stack could be commited to a suit pile
    if (freeSlotIsEmpty && firstEmptyColumnLabel != null){
      for (const originColumnLabel of GameState.COLUMN_LABELS){
        const originPile = this.getPileFromLabel(originColumnLabel);
        if (originPile.isEmpty()) continue;
        for (const destSuitPileLabel of GameState.SUIT_PILE_LABELS){
          const moveResult = this.genFlipMoveSet(originColumnLabel, destSuitPileLabel, firstEmptyColumnLabel);
          if (moveResult !== null) yield moveResult;
        }
      }
    }

    // Check if the free slot card can be placed on any columns that have cards (not empty)
    if (!freeSlotIsEmpty) {
      for (const destColumnLabel of GameState.COLUMN_LABELS){
        const columnPile = this.getPileFromLabel(destColumnLabel);
        if (columnPile.isEmpty()) continue; // we don't want to just throw the free card on empty columns yet
        const moveResult = this.genMoveSet("freeSlot", destColumnLabel);
        if (moveResult !== null) yield moveResult;
      }
    }

    // If there is a free column, Check if any top stacks can be placed on any columns with cards after flipping
    if (firstEmptyColumnLabel != null){
        for (const originColumnLabel of GameState.COLUMN_LABELS){
            const originColumn = this.getPileFromLabel(originColumnLabel);
            if (originColumn.isEmpty()) continue;
            for (const destColumnLabel of GameState.COLUMN_LABELS){
                const destColumn = this.getPileFromLabel(destColumnLabel);
                if (originColumnLabel === destColumnLabel) continue;
                if (destColumn.isEmpty()) continue;
                const moveResult = this.genFlipMoveSet(originColumnLabel, destColumnLabel, firstEmptyColumnLabel);
                if (moveResult !== null) yield moveResult;
            }
        }
    }

    // Check if any top stacks can be placed on any columns with cards
    for (const originColumnLabel of GameState.COLUMN_LABELS) {
        const originColumn = this.getPileFromLabel(originColumnLabel);
        if (originColumn.isEmpty()) continue;
        for (const destColumnLabel of GameState.COLUMN_LABELS) {
            if (originColumnLabel === destColumnLabel) continue;
            const destColumn = this.getPileFromLabel(destColumnLabel);
            if (destColumn.isEmpty()) continue;
            const moveResult = this.genMoveSet(originColumnLabel, destColumnLabel);
            if (moveResult !== null) yield moveResult;
        }
    }

    // If there is an empty column, try moving top stacks larger than one card to it
    if (firstEmptyColumnLabel != null) {
      for (const originColumnLabel of GameState.COLUMN_LABELS) {
          const originColumn = this.getPileFromLabel(originColumnLabel);
          if (originColumn.isEmpty()) continue;
          const originTopStack = originColumn.getTopStack();
          if (originTopStack[0] < 2) continue;
          const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel)
      }
    }

    // If the free slot is empty, try moving single card stacks on to it
    if (freeSlotIsEmpty) {
        for (const originColumnLabel of GameState.COLUMN_LABELS) {
            const originColumn = this.getPileFromLabel(originColumnLabel);
            if (originColumn.isEmpty()) continue;
            const originTopStack = originColumn.getTopStack();
            if (originTopStack[0] !== 1) continue;
            const moveResult = this.genMoveSet(originColumnLabel, "freeSlot");
            if (moveResult !== null) yield moveResult;
        }
    }

      // If the free slot is empty, try moving the top card of 2 size stacks to it
      if (freeSlotIsEmpty) {
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
              const originColumn = this.getPileFromLabel(originColumnLabel);
              const topStack = originColumn.getTopStack();
              if (topStack[0] !== 2) continue;
              const moveResult = this.genSingleMoveMoveSet(originColumnLabel, "freeSlot");
              if (moveResult !== null) yield moveResult;
         }
      }

      // - If a column is empty, try moving a 2 or larger stacks to it
      if (firstEmptyColumnLabel != null){
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
              const originColumn = this.getPileFromLabel(originColumnLabel);
              if (originColumn.isEmpty()) continue;
              const topStack = originColumn.getTopStack();
              if (topStack[0] <= 1) continue;
              const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel);
              if (moveResult !== null) yield moveResult;
          }
      }
      // - If a column is empty and the free slot is full, try moving the free slot card to the column
      if (!(freeSlotIsEmpty) && (firstEmptyColumnLabel != null)){
              const moveResult = this.genMoveSet("freeSlot", firstEmptyColumnLabel);
              if (moveResult !== null) yield moveResult;
      }
      // - If a column is empty, try moving a single card stack to it
      if (firstEmptyColumnLabel != null){
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
              const originColumn = this.getPileFromLabel(originColumnLabel);
              if (originColumn.isEmpty()) continue;
              const topStack = originColumn.getTopStack();
              if (topStack[0] !== 1) continue;
              const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel);
              if (moveResult !== null) yield moveResult;
          }
      }
      // - If a column is empty, try moving the top card of a 2 size stack to the empty column
      if (firstEmptyColumnLabel != null){
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
              const originColumn = this.getPileFromLabel(originColumnLabel);
              const topStack = originColumn.getTopStack();
              if (topStack[0] !== 2) continue;
              const moveResult = this.genSingleMoveMoveSet(originColumnLabel, firstEmptyColumnLabel);
              if (moveResult !== null) yield moveResult;
          }
      }
  }

  checkWin(){
      for (const columnPile of this.columnPilesArray){
          if (!(columnPile.isEmpty())) {
              return false;
          }
      }
      return true;
  }

  clone(){
      const newColumnPileArray = [];
      for (const columnPile of this.columnPilesArray){
          newColumnPileArray.push(columnPile.clone());
      }
      const newTarotSmallPile = this.tarotSmallPile.clone();
      const newTarotLargePile = this.tarotLargePile.clone();
      const newFreeSlotPile = this.freeSlotPile.clone();
      const newSuitYPile = this.suitYPile.clone();
      const newSuitRPile = this.suitRPile.clone();
      const newSuitGPile = this.suitGPile.clone();
      const newSuitBPile = this.suitBPile.clone();


      return new GameState(newColumnPileArray, newTarotSmallPile, newTarotLargePile, newFreeSlotPile,
          newSuitYPile, newSuitRPile, newSuitGPile, newSuitBPile)
  }

  solve(maxAllowedDepth=150, maxAllowedStates=100000){
      const topSubState = this.clone();
      topSubState.processForcedMoves();
      const checkedStateIDsSet = new Set();
      const finalResult = topSubState.subSolve(checkedStateIDsSet, maxAllowedDepth, maxAllowedStates, 0);
      if (finalResult === null) {
          return null;
      } else {
        const finalResultReversed = finalResult.reverse();
        return finalResultReversed;
      }

  }

  subSolve(checkedStatesSet, maxAllowedDepth, maxAllowedStates, lastDepth) {
    this.logStateToConsole();

    const currentDepth = lastDepth + 1;
    deepestDepth = Math.max(deepestDepth, currentDepth);
    if (currentDepth >= maxAllowedDepth) {
      return null;
    }

    if (checkedStatesSet.size > maxAllowedStates) {
      return null;
    }


    this.processForcedMoves();

    if (this.checkWin()) {
      return this.loggedMoveSets.reverse();
    }

    const postID = this.getIDStr();
    if (checkedStatesSet.has(postID)) {
        return null;
    }

    checkedStatesSet.add(postID);
    checkedSetsSize = checkedStatesSet.size;

    for (const nextPossibleMove of this.possibleMoves()) {
      const subState = this.clone();
      subState.executeMoveSet(nextPossibleMove);
      const subResult = subState.subSolve(
        checkedStatesSet,
        maxAllowedDepth,
        maxAllowedStates,
        currentDepth,
      );

      if (subResult !== null) {
        const reversedLoggedMoves = this.loggedMoveSets.reverse();
        for (const loggedMoveSet of reversedLoggedMoves) {
          subResult.push(loggedMoveSet);
        }
        return subResult;
      }
    }
    return null;
  }

  /*
  Generates a str representing the current gamestate.
  Note, we don't have to care about what order the columns are in.
  If you simply swapped the cards in two columns, that is still exactly the same gamestate except for the labels.
  Thus, we can just sort the strings representing each column before combining them.
  That's why we start with the free slot then join the sorted column strings.
   */
  getIDStr() {
      let idStr = "";

      if (this.freeSlotIsEmpty()) {
          idStr += "n"
      } else {
          idStr += this.freeSlotPile.lookTopCard().toString();
      }
      const columnTxtArray = [];
      for (const columnPile of this.columnPilesArray){
        columnTxtArray.push(columnPile.columnToIDStr());
      }
      columnTxtArray.sort();

      for (const columnStr of columnTxtArray){
          if (columnStr.length > 0){
              idStr += " " + columnStr;
          }
      }
      return idStr;
  }
}

class MoveSet {
  constructor(description){
    this.singleMoveArray = [];
    this.description = description;
  }

  static newSingleMove(description, origin, destination){
    const newMoveset = new MoveSet(description);
    newMoveset.singleMoveArray.push([origin, destination]);
    return newMoveset
  }

  addStackMove(origin, destination, size){
    for (let i = 0; i < size; i++){
      this.singleMoveArray.push([origin, destination]);
    }
  }

  addSingleMove(origin, destination){
    this.singleMoveArray.push([origin, destination]);
  }


}
const TEST_VALS_EMPTY = [
    "","","","","","","","","","","","",

]

const TEST_VALS_SIMPLE = [
    "9t qr kr qb kb","1t 2t 3t 5t 4t","jg qg kg 10g 9g 7g 8g","","","","","","","","","",

]

const TEST_VALS_DEMO = [
    "2r 5g 7t qy 4g 4r 12t 11t",
    "10g 13t jb 5r 15t 8t",
    "8y 9y",
    "10b 19t 6g 6r ky jy",
    "10y 3y 7y qg 5y 10t 18t 17t 16t",
    "6y",
    "9g 9t",
    "9r 8r 7r",
    "7b 8g qb kr 4y jr qr",
    "9b 8b",
    "14t qr 7g jg 10r kg kb",
    ""
]

const TRY1_STARTING_CARDS = [
    "6t 6b ky 17t 6g 10y 7g",
    "qg 3t 8r 2r 7b 8t 5b",
    "4t 5y 16t 6y 19t jg kr",
    "9g 10r qr 1t 2y 0t 12t",
    "18t 10g jb 9t 9y 5g 2t",
    "",
    "kb 2b 7r jr 20t 3g 7y",
    "15t 11t 4r 9b 3r 5t 13t",
    "7t 10t 4g 8y 6r 9r jy",
    "kg 5r 8b 10b 3b 21t 4b",
    "14t qb 4y 8g 3y 2g qy",
    "",
]

const TRY2_STARTING_CARDS = [
    "3b 9t 5g 4g 4b jg qy",
    "6g 8b 7t 10t 3y 2t 6b",
    "kg jr kr qb 10g 5r 5y",
    "9g 10b 5b 6y 4r 6t jy",
    "2y 9r 8t 2b qg 8g 13t",
    "",
    "7r 3g 9b 3r 8y 12t 10y",
    "18t 2r 5t 20t 8r 7y 10r",
    "jb 21t 15t 1t 0t 17t 14t",
    "19t 6r kb qr 7g ky 4y",
    "3t 9y 7b 2g 16t 4t 11t",
    "",
]

const TRY3 = [
    "2r 10y 6y 0t 9r 5y 8t",
    "3b jb 9t 6r 14t 2g qr",
    "5g jr 10b 4t 4g 2b 4b",
    "8y qb 15t 7g 8g qy 12t",
    "3t kb 5t kg 10r 7b 10g",
    "",
    "3g 19t 13t 16t 7t 4y jg",
    "6t 7r 4r 21t 2t 9y 3r",
    "5r 17t 5b 7y 9b 6b 8r",
    "1t jy 8b kr qg 2y 20t",
    "6g ky 18t 10t 9g 3y 11t",
    "",
]

const TEST_7 = [
    "5b",
    "",
    "6g 7g 8g 9g 10g jg",
    "",
    "3t kb 5t",
    "6r 7r 8r 9r 10r jr",
    "16t 15t 13t 12t 11t",
    "qr kr",
    "",
    "",
    "",
    "4t",

]

let skips = 1;
let deepestDepth = 0;
let checkedSetsSize = 0;

function test(){

    // const inputVals = getInputValues();
    // const columnTextArray = inputVals.slice(0, 11);
    // const freeSlotString = inputVals[11]

    const testArray = TRY3;
    const gs = GameState.initFromColumnsStringArray(testArray.slice(0, 11), testArray[11]);


    // const res = gs.solve(500,500000);
    // console.log(res);

    // setDisplayValsFromGameState(gs);
    // const solveResult = gs.solve(500, 100000);
    // console.log(solveResult);

    // for (const nextMove of gs.possibleMoves()){
    //     const gsClone = gs.clone();
    //     console.log(nextMove);
    //     gsClone.executeMoveSet(nextMove);
    //     console.log(gsClone);
    //     console.log(gsClone.columnPilesArray[0].isEmpty());
    // }

    const textdisp = gs.getDisplayTextArray();
    for (const line of textdisp){
        console.log(line);
    }

    // for (const move of gs.possibleMoves()){
    //     console.log(move);
    // }

    const result = gs.solve(150, 10000);
    console.log(result);

    for (const move of result){
        console.log(move.description);
    }

    console.log(deepestDepth);
    console.log(checkedSetsSize);
}

test();


/*
next fixes:
- should prioritize moving the free slot card if that will result in autocommits
- should prioritize moving stacks that will reveal commitable cards
    or maybe just deprioritize flipping stacks when the whole column is the same stack
 */