// ------------------------ //
// HTML Manipulation Stuff
// ------------------------ //
function showErrorGameState(errors) {
  document.getElementById('error-list').classList.remove('hidden');
  document.getElementById('valid-data').classList.add('hidden');

  const errorList = document.getElementById('error-list');
  errorList.innerHTML = '';
  errors.forEach(err => {
    const li = document.createElement('li');
    li.textContent = err;
    errorList.appendChild(li);
  });
}

function showValidGameState(topRowVals, columnData) {
  document.getElementById('error-list').classList.add('hidden');
  document.getElementById('valid-data').classList.remove('hidden');

  // Populate top row values
  const sevenCells = document.querySelectorAll('.top-row-cell');
  sevenCells.forEach((cell, i) => {
    cell.textContent = topRowVals[i] || '';
  });

  // Populate 11 columns
  const columns = document.querySelectorAll('.valid-column');
  columns.forEach((col, colIndex) => {
    const rowsContainer = col.querySelector('.valid-colum-row');
    rowsContainer.innerHTML = '';
    const rows = columnData[colIndex] || [];
    rows.forEach(val => {
      const div = document.createElement('div');
      div.textContent = val.toString();
      // Using toString() to avoid error: "Assigned expression type T is not assignable to type string; Type string is not assignable to type T"
      rowsContainer.appendChild(div);
    });
  });
}


function setResults(sub1, sub2, values) {
  // Set subheaders (Max depth reach & states looked at)
  document.getElementById('solution-subheader1').textContent = sub1;
  document.getElementById('solution-subheader2').textContent = sub2;

  // Set ordered list items for results
  const resultList = document.getElementById('result-list');
  resultList.innerHTML = ''; // clear previous items

  values.forEach(val => {
    const li = document.createElement('li');
    li.textContent = val;
    resultList.appendChild(li);
  });
}

// Get column and free slot input values
function getGameStateInputValues() {
  const values = [];
  for (let i = 1; i <= 11; i++) {
    const colInput = document.getElementById(`col${i}`);
    values.push(colInput ? colInput.value : '');
  }
  const freeInput = document.getElementById(`free-slot`);
  values.push(freeInput ? freeInput.value : '');
  return values;
}

// Get advanced settings input values
function getAdvancedSettingsInput() {
  const maxDepth = document.getElementById('max-allowed-depth');
  const maxStates = document.getElementById('max-game-states');
  return [
    maxDepth ? maxDepth.value : '',
    maxStates ? maxStates.value : ''
  ];
}

// Set first 12 input values
function setGameStateInputValues(values) {
  if (!Array.isArray(values) || values.length !== 12) {
    console.error("Expected an array of 12 values.");
    return;
  }

  for (let i = 1; i <= 11; i++) {
    const colInput = document.getElementById(`col${i}`);
    if (colInput) colInput.value = values[i - 1];
  }

  const freeInput = document.getElementById(`free-slot`);
  if (freeInput) freeInput.value = values[11];
}

// Set advanced input values (2)
function setAdvancedSettingInputValues(values) {
  if (!Array.isArray(values) || values.length !== 2) {
    console.error("Expected an array of 2 values.");
    return;
  }

  const maxDepth = document.getElementById('max-allowed-depth');
  const maxStates = document.getElementById('max-game-states');
  if (maxDepth) maxDepth.value = values[0];
  if (maxStates) maxStates.value = values[1];
}
// Input clear values button
const clearValuesButton = document.getElementById('clear-values-button');
  clearValuesButton.addEventListener('click', () => {
    setGameStateInputValues(["", "", "", "", "", "", "", "", "", "", "", "", ]);
});

// Input demo values buttons
const exampleButton1 = document.getElementById('example1');
exampleButton1.addEventListener('click', () => {
  setGameStateInputValues(EXAMPLE_GAME_1);
});
const exampleButton2 = document.getElementById('example2');
exampleButton2.addEventListener('click', () => {
  setGameStateInputValues(EXAMPLE_GAME_2);
});
const exampleButton3 = document.getElementById('example3');
exampleButton3.addEventListener('click', () => {
  setGameStateInputValues(SPLASHSCREEN_GAME_FIXED);
});

// Random game button
const randomGameButton = document.getElementById('random-game-button');
randomGameButton.addEventListener('click', () => {
  const randomGame = GameState.initRandomGame();
  const inputValues = randomGame.getInputStrings();
  setGameStateInputValues(inputValues);
});


// Confirm button hook
const confirmInputButton = document.getElementById('confirm-input-button');
confirmInputButton.addEventListener('click', () => {
  // console.log("Confirm input button clicked!");

  let userGameState = null;
  let errorFound = false;
  const standardValues = getGameStateInputValues();
  try {
    const columnStrings = standardValues.slice(0,11);
    const freeSlotString = standardValues[11];
    userGameState = GameState.initFromColumnsStringArray(columnStrings, freeSlotString);
  } catch (e) {
    showErrorGameState(["Errors found!",].concat(e));
    errorFound = true;
  }

  if (!errorFound) {
    setDisplayValsFromGameState(userGameState);
  }
  // console.log("Standard inputs:", standardValues);

});

// Result button hook
const solveButton = document.getElementById('result-button');
    solveButton.addEventListener('click', () => {
    const confirmedValues = getConfirmationValues();
    const advSettings = getAdvancedSettingsInput();
    let maxDepth = -1;
    try {
        maxDepth = Number.parseInt(advSettings[0]);
    } catch {
        setResults("Max search depth must be set to a number!")
    }
    let maxStates = -1; // set to -1 to fix warning, should work fine as whatever.
    try {
        maxStates = Number.parseInt(advSettings[1]);
    } catch {
        setResults("Max games states to consider must be a number!")
    }

    if (confirmedValues === null){
        setResults("Please fix input values before solving!")
        return;
    }

    const gs = GameState.initFromColumnsStringArray(
        confirmedValues.columnStringsArray, confirmedValues.freeSlot);
    const [solutionMoveSets, recursionMonitor] = gs.solve(maxDepth, maxStates);

    // console.log("Solve button clicked!");
    if (solutionMoveSets === null){
        setResults("No solution Found. :(", `Deepest Search Depth: ${recursionMonitor.deepestDepth}    Total Unique Game States Checked: ${recursionMonitor.checkedStates}`, []);
    } else {
        const solutionSteps = [] = [];
        for (const solutionMoveSet of solutionMoveSets) {
            // solutionSteps.push(solutionMoveSet.description); // Normal
            solutionSteps.push(solutionMoveSet.description + solutionMoveSet.movePriority); // Includes move priority
        }
        setResults("Solution found! :)", `Deepest Search Depth: ${recursionMonitor.deepestDepth}    Total Unique Game States Checked: ${recursionMonitor.checkedStates}`, solutionSteps);
    }

    /* DEBUG LOGGING */
    console.log("Move Priorities:");
    console.log(recursionMonitor.priorityTracker);

});

function getConfirmationValues() {
    const validSection = document.getElementById('valid-data');
    if (validSection.classList.contains('hidden')) {
    // Section is not in valid mode
    return null;
    }

    const result = {
    topValues: [],
    columnStringsArray: [],
    freeSlot: "",
    };

    // Get the top row values
    const topRowVals = document.querySelectorAll('.top-row-cell');
    topRowVals.forEach(cell => {
    result.topValues.push(cell.textContent);
    });

    result.freeSlot = topRowVals[2].textContent;
    // We display the free slot as "[   ]" or something similar, so we need to make sure we can recognize it properly
    result.freeSlot = result.freeSlot.replace("[", '');
    result.freeSlot = result.freeSlot.replace("]", '');
    result.freeSlot = cleanInputString(result.freeSlot);
    // if (result.freeSlot === "[  ]") result.freeSlot = ""; //Old method, only works if the blank freeSlot has that exact string val

    // Get the 11 columns
    const columns = document.querySelectorAll('.valid-column');
    columns.forEach(col => {
    const rowsContainer = col.querySelector('.valid-colum-row');
    const rowValues = [];
    rowsContainer.querySelectorAll('div').forEach(div => {
      rowValues.push(div.textContent);
    });
    result.columnStringsArray.push(rowValues.join(" "));
    });

    return result;
}



// ------------------------ //
// Logic Stuff
// ------------------------ //

/* Takes a string
Removes preceding and trailing whitespace.
Replaces all instances of multiple spaces to a single space.
Makes it lowercase.
 */
function cleanInputString(inputString) {
    let updatedString = inputString;
    updatedString = updatedString.trim();
    updatedString = updatedString.replace(/  +/g, ' ');
    updatedString = updatedString.toLowerCase();

    return updatedString;
}


function setDisplayValsFromGameState(gameState) {
    const tarotSmall = gameState.tarotSmallPile.lookTopCard();
    const tarotLarge = gameState.tarotLargePile.lookTopCard();
    const freeSlot = gameState.freeSlotPile.lookTopCard();
    // Suit order: y r g b
    const suitY = gameState.suitYPile.lookTopCard();
    const suitR = gameState.suitRPile.lookTopCard();
    const suitG = gameState.suitGPile.lookTopCard();
    const suitB = gameState.suitBPile.lookTopCard();

    const topVals = [];

    if (tarotSmall === null) {
        topVals.push("----");
    } else {
        topVals.push(tarotSmall.toString())
    }
    if (tarotLarge === null) {
        topVals.push("----");
    } else {
        topVals.push(tarotLarge.toString())
    }

    if (freeSlot === null) {
        topVals.push("[  ]");
    } else {
        topVals.push(freeSlot.toString())
    }

    if (suitY === null) {
        topVals.push("----");
    } else {
        topVals.push(suitY.toString())
    }
    if (suitR === null) {
        topVals.push("----");
    } else {
        topVals.push(suitR.toString())
    }
    if (suitG === null) {
        topVals.push("----");
    } else {
        topVals.push(suitG.toString())
    }
    if (suitB === null) {
        topVals.push("----");
    } else {
        topVals.push(suitB.toString())
    }

    const columnStringArrays = gameState.getColumnStringArrays();
    /* DEBUG LOGGING
    console.log("Input Game State Confirmed");
    gameState.logStateToConsole();
     */

    showValidGameState(topVals, columnStringArrays)
}

// Solver Logic

/*
  Fischer-Yates shuffle in place
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {

    // Generate random index
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

// Card class
class Card {
    static COLOR_SUITS = ['y', 'r', 'g', 'b'];

    constructor(intVal, cardSuit) {
        this.intVal = intVal;
        this.suit = cardSuit.toLowerCase().trim();

        if (!(Number.isInteger(this.intVal))) {
            throw new Error(`Error - tried to create card with invalid integer ${intVal}`);
        }

        if (this.suit === 't') {
            if (!(0 <= this.intVal <= 21)) {
                throw new Error(`Error - Tarot card cannot have value ${this.intVal}`)
            }
        } else if (Card.COLOR_SUITS.includes(this.suit)) {
            if (!(1 <= this.intVal <= 13)) {
                throw new Error(`Error - Color Suit card cannot have value ${this.intVal}`)
            }
        }

    }

    static newCardFromString(cardStr) {
        let cleanCardStr = cardStr
        // This for the special case when reading a card string from the free Slot display
        cleanCardStr = cleanCardStr.replace('[', '');
        cleanCardStr = cleanCardStr.replace(']', '');
        cleanCardStr = cleanInputString(cleanCardStr);
        const cardSuit = cleanCardStr.substring(cardStr.length - 1);
        const cardVal = cleanCardStr.substring(0, cardStr.length - 1);

        let intVal;
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
            throw new Error(`Invalid card string - ${cardStr}`);
        }
    }


    toString() {
        let valStr;
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

    isColorCard() {
      return Card.COLOR_SUITS.includes(this.suit);

    }
}

// CardPile class
class CardPile {
    static PILE_TYPES = ["column", "tarotSmall", "tarotLarge", "freeSlot", "suitPile"];
    static COLOR_SUITS = ["y", "r", "g", "b"];
    static DISALLOWED_COLUMN_TOP_CARD_STRINGS =  ["2y", "2r", "2g", "2b", "0t", "21t"]

    constructor(pileType, suit, topCard = null, cardArray = null) {

        if (!CardPile.PILE_TYPES.includes(pileType)) {
            throw new Error(`Invalid pile type ${pileType}`);
        }
        if (pileType === "suitPile" && !CardPile.COLOR_SUITS.includes(suit)) {
            throw new Error(`Invalid suitPile type ${suit}`);
        }
        this.pileType = pileType;
        this.suit = suit;

        this.topCard = topCard;

        if (cardArray === null) {
          this.cardArray = [];
        } else {
          this.cardArray = cardArray;
        }
    }


    static getUIPileLabel (labelStr) {
      switch (labelStr) {
        case "c1":
          return "Col 1";
        case "c2":
          return "Col 2";
        case "c3":
          return "Col 3";
        case "c4":
          return "Col 4";
        case "c5":
          return "Col 5";
        case "c6":
          return "Col 6";
        case "c7":
          return "Col 7";
        case "c8":
          return "Col 8";
        case "c9":
          return "Col 9";
        case "c10":
          return "Col 10";
        case "c11":
          return "Col 11";
        case "tarotSmall":
          return "Small Tarot Pile"
        case "tarotLarge":
          return "Large Tarot Pile"
        case "suitY":
          return "Yellow Suit Pile";
        case "suitR":
          return "Red Suit Pile";
        case "suitG":
          return "Green Suit Pile";
        case "suitB":
          return "Blue Suit Pile";
        case "freeSlot":
          return "Free Card Slot";
      }
    }

    lookTopCard() {
        if (this.pileType === "column") {
            if (this.cardArray.length === 0) {
                return null;
            } else {
                return this.cardArray[this.cardArray.length - 1];
            }
        } else {
            return this.topCard;
        }
    }

    popTopCard() {
        if (this.pileType === "column") {
            return this.cardArray.pop();
        } else if (this.pileType === "freeSlot") {
            const topCard = this.topCard;
            this.topCard = null;
            return topCard;
        } else {
            throw new Error(`Can't pop from ${this.pileType}`);
        }
    }

    canReceiveCardColumn(card) {
        /**
         * @param {Card} card
         */
        if (this.pileType !== "column") {
            throw new Error(`Tried to call canReceiveCardColumn on a ${this.pileType} pile`);
        }
        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null) {
            return true;
        } else {
            return Card.canPlaceCard(card, pileTopCard);
        }
    }

    canReceiveCardFreeSlot() {
        /**
         * @param {Card} card
         */
        if (this.pileType !== "freeSlot") {
            throw new Error(`Tried to call canReceiveFreeSlot on a ${this.pileType} pile`);
        }
        return this.lookTopCard() === null;
    }

    canReceiveCardTarotSmall(card) {
        /**
         * @param {Card} card
         */
        if (this.pileType !== "tarotSmall") {
            throw new Error(`Tried to call canReceiveCardTarotSmall on a ${this.pileType} pile`);
        }
        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null) {
            return (card.intVal === 0 && card.suit === "t");
        } else {
            return Card.canPlaceCard(card, pileTopCard)
        }
    }

    canReceiveCardTarotLarge(card) {
        /**
         * @param {Card} card
         */
        if (this.pileType !== "tarotLarge") {
            throw new Error(`Tried to call canReceiveCardTarotLarge on a ${this.pileType} pile`);
        }
        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null) {
            return (card.intVal === 21 && card.suit === "t");
        } else {
            return Card.canPlaceCard(card, pileTopCard)
        }
    }

    canReceiveCardSuitPile(card) {
        /**
         * @param {Card} card
         */
        if (this.pileType !== "suitPile") {
            throw new Error(`Tried to call canReceiveCardSuitPile on a ${this.pileType} pile`);
        }

        const pileTopCard = this.lookTopCard();
        if (pileTopCard === null) {
            return (card.intVal === 1 && card.suit === this.suit);
        } else {
            return Card.canPlaceCard(card, pileTopCard);
        }
    }

    canReceiveCard(card) {
        switch (this.pileType) {
            case "column":
                return this.canReceiveCardColumn(card);
            case "tarotSmall":
                return this.canReceiveCardTarotSmall(card);
            case "tarotLarge":
                return this.canReceiveCardTarotLarge(card);
            case "freeSlot":
                return this.canReceiveCardFreeSlot();
            case "suitPile":
                return this.canReceiveCardSuitPile(card);
            default:
                throw new Error("Invalid pile type " + this.pileType);
        }
    }

    clone() {
        let cloneCardArray = null;
        if (this.cardArray !== null) {
            cloneCardArray = this.cardArray.slice();
        }

        return new CardPile(
            this.pileType,
            this.suit,
            this.topCard,
            cloneCardArray,
        );
    }

    placeCard(card) {
        if (!this.canReceiveCard(card)) {
            throw new Error(`Error: Tried to place ${card} on ${this.pileType} - ${this.lookTopCard()}`);
        }
        if (this.pileType === "column") {
            this.cardArray.push(card);
        } else {
            this.topCard = card;
        }
    }

    static initColumnPileFromString(initString) {
        const cleanInitString = cleanInputString(initString);
        const cardArray = [];
        if (cleanInitString.length > 0) {
            const cardStringArray = cleanInitString.split(" ");
            for (const cardStr of cardStringArray) {
                const newCard = Card.newCardFromString(cardStr);
                cardArray.push(newCard);
            }
        }
        return new CardPile('column', null, null, cardArray);

    }

    static initFreeSlotPileFromString(freeSlotCardStrRaw) {
        const cleanFreeSlotCardStr = cleanInputString(freeSlotCardStrRaw);
        if (cleanFreeSlotCardStr === "" || cleanFreeSlotCardStr === null) {
            return new CardPile('freeSlot', null, null, null);
        } else {
            const freeSlotCard = Card.newCardFromString(cleanFreeSlotCardStr);
            return new CardPile('freeSlot', null, freeSlotCard, null);
        }
    }

    toString() {
        if (this.pileType === "column") {
          const cardStrArray = []
          for (const card of this.cardArray) {
            cardStrArray.push(card.toString());
          }
          return cardStrArray.join(" ");
        } else {
          if (this.topCard === null) return "";
          return this.topCard.toString();
        }

    }

    /*
    Gets the stack on top of a column or free slot. Stacks are cards that can be safely moved together.
    returns [stackSize, topCard, BottomCard]
    if the column / free slot has no cards, returns [0, null, null]
    if the topmost card isn't part of a stack, returns [1, topCard, topCard]
    the free slot will always return a 0 or 1 stack size
     */
    getTopStack() {
        if (!(this.pileType === "column" || this.pileType === "freeSlot")) {
            throw new Error(`Tried to check for top stack on ${this.pileType}`);
        }

        if (this.pileType === "freeSlot") {
            if (this.isEmpty()) {
                return [0, null, null];
            } else {
                return [1, this.topCard, this.topCard];
            }

        } else if (this.pileType === "column") {
            if (this.cardArray.length === 0) {
                return [0, null, null];
            }

            const topCard = this.lookTopCard();
            if (this.cardArray.length === 1) {
                return [1, topCard, topCard];
            }


            let aboveCard = topCard;
            let lowestCard = topCard
            let stackSize = 1;
            for (let i = this.cardArray.length - 2; i >= 0; i--) {
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

    /*
    This gets the card immediately beneath the top stack of a column
    Returns null if the column is empty or if all cards are part of the top stack
     */
    getCardBelowTopStack() {
        if (this.pileType !== "column") {
            throw new Error(`Tried to check for card below top stack on ${this.pileType}`);
        }
        const topStack = this.getTopStack();
        const topStackSize = topStack[0];
        if (this.cardArray.length <= topStackSize) return null;
        return this.cardArray[this.cardArray.length - topStackSize - 1];

    }

    countCardInPile(searchCard) {
        let cardCount = 0;
        switch (this.pileType) {
            case "column": {
                for (const cardInCol of this.cardArray) {
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
                if (this.lookTopCard() && (Card.sameCard(searchCard, this.lookTopCard()))) {
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
            default: {
                throw new Error(`Invalid card pile type ${this.pileType}, can't search`)
            }
        }
        return cardCount;
    }

    isEmpty() {
        if (this.pileType === "column") {
            return this.cardArray.length === 0;
        } else {
            return this.lookTopCard() === null;
        }
    }

    columnToStringArray() {
        const outStringArray = [];
        for (const card of this.cardArray) {
            outStringArray.push(card.toString());
        }
        return outStringArray;
    }

    columnToIDStr() {
        return this.cardArray.join("");
    }

    lookCardAtRow(rowNum) {
        if (this.cardArray.length <= rowNum) {
            return null;
        } else {
            return this.cardArray[rowNum];
        }
    }

    /*
    if a card on top, returns that card, otherwise "empty"
     */
    topCardStr() {
        if (this.isEmpty()) return "empty";
        else return this.lookTopCard().toString();

    }


    hasDisallowedStartingTopCard () {
      if (!(this.pileType === "column")) {
        throw new Error(`Tried to check disallowed starting card on ${this.pileType} pile`);
      }
      if (this.isEmpty()) return false;
      for (const disallowedStartCardString of CardPile.DISALLOWED_COLUMN_TOP_CARD_STRINGS) {
        const disallowedStartCard = Card.newCardFromString(disallowedStartCardString);
        if (Card.sameCard(disallowedStartCard, this.lookTopCard())) return true;
      }
      return false;

    }

    shuffleColumn(){
      if (!(this.pileType === "column")) {
        throw new Error(`Tried to shuffle ${this.pileType} pile`);
      }
      shuffleArray(this.cardArray);
    }


}

class GameState {
    constructor(columnPilesArray, tarotSmallPile, tarotLargePile, freeSlotPile,
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


    static initFromColumnsStringArray(columnStringsArray, freeSlotString) {
        const columnPilesArray = [];
        for (const columnString of columnStringsArray) {
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

    static initRandomGame(){
        const columnPilesArray = [];
        for (let i = 0; i < 11; i++){
          const cardPile = new CardPile("column", null, null, null);
          columnPilesArray.push(cardPile);
        }
        const tarotSmallPile = new CardPile("tarotSmall", "t", null, null);
        const tarotLargePile = new CardPile("tarotLarge", "t", null, null);
        const freeSlotPile = new CardPile("freeSlot", null, null, null);
        const suitYPile = new CardPile("suitPile", "y", null, null);
        const suitRPile = new CardPile("suitPile", "r", null, null);
        const suitGPile = new CardPile("suitPile", "g", null, null);
        const suitBPile = new CardPile("suitPile", "b", null, null);

        const gameState = new GameState(columnPilesArray, tarotSmallPile, tarotLargePile, freeSlotPile,
          suitYPile, suitRPile, suitGPile, suitBPile,);

        const cardDeck = [];
        for (const suit of Card.COLOR_SUITS){
            for (let val = 2; val <= 13; val++){
                cardDeck.push(new Card(val, suit))
            }
        }
        for (let val = 0; val <= 21; val++){
            cardDeck.push(new Card(val, 't'));
        }
        shuffleArray(cardDeck);
        let colNum = -1;
        while (cardDeck.length > 0){
            colNum++;
            if (colNum === 5) continue; // Middle column must be empty
            gameState.columnPilesArray[colNum].cardArray.push(cardDeck.pop());
            if (colNum >= 10){
              colNum = -1;
            }
        }

        for (const columnPile of gameState.columnPilesArray){
          while (columnPile.hasDisallowedStartingTopCard()){
            columnPile.shuffleColumn(); // It is extremely unlikely that a column would have all 6 disallowed cards, but even then this should be fine
          }
        }
        gameState.initTopPiles();
        return gameState;
    }

    countCardInColumnsAndFree(searchCard) {
        let count = 0;
        for (const columnPile of this.columnPilesArray) {
            count += columnPile.countCardInPile(searchCard);
        }
        count += this.freeSlotPile.countCardInPile(searchCard);
        return count;
    }

    isCardCommitted(searchCard) {
        switch (searchCard.suit) {
            case "t":
                if (!(this.tarotSmallPile.isEmpty())) {
                    if (this.tarotSmallPile.lookTopCard().intVal >= searchCard.intVal) {
                        return true;
                    }
                }
                if (!(this.tarotLargePile.isEmpty())) {
                    if (this.tarotLargePile.lookTopCard().intVal <= searchCard.intVal) {
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

    validate() {
        const errors = [];
        for (const suit of ["y", "r", "g", "b"]) {
            for (let val = 1; val <= 13; ++val) {
              const searchCard = new Card(val, suit);
              let count = 0;
              count += this.countCardInColumnsAndFree(searchCard);
              if (this.isCardCommitted(searchCard)) count++;
              if (count === 0) {
                errors.push(new Error(`Validation failed! ${searchCard} missing!`));
              }
              if (count > 1) {
                errors.push(new Error(`Validation failed! Found ${count} copies of ${searchCard}!`));
              }
            }
        }
        for (let val = 0; val <= 21; ++val) {
          const searchCard = new Card(val, 't');
          let count = 0;
          count += this.countCardInColumnsAndFree(searchCard);
          if (this.isCardCommitted(searchCard)) count++;
          if (count === 0) {
            errors.push(new Error(`Validation failed! ${searchCard} missing!`));
          }
          if (count > 1) {
            errors.push( new Error(`Validation failed! Found ${count} copies of ${searchCard}!`));
          }
        }
        if (errors.length > 0) {
          throw errors;
        }
        return true;
    }

    findSmallestTarotCardInPlay() {
        for (let i = 0; i <= 21; i++) {
            const searchCard = new Card(i, 't');
            if (this.countCardInColumnsAndFree(searchCard) >= 1) {
                return searchCard;
            }
        }
        return null;
    }

    findLargestTarotCardInPlay() {
        for (let i = 21; i >= 0; i--) {
            const searchCard = new Card(i, 't');
            if (this.countCardInColumnsAndFree(searchCard) >= 1) {
                return searchCard;
            }
        }
        return null;
    }

    findSmallestSuitCardInPlay(suit) {
        const suitLower = suit.toLowerCase();
        if (!Card.COLOR_SUITS.includes(suit)) {
            throw new Error(`Invalid suit type ${suit}`);
        }
        for (let i = 1; i <= 13; i++) {
            const searchCard = new Card(i, suitLower);
            if (this.countCardInColumnsAndFree(searchCard) >= 1) {
                return searchCard;
            }
        }
        return null;
    }

    initTopPiles() {
        const smallestTarotCardInPlay = this.findSmallestTarotCardInPlay();
        const largestTarotCardInPlay = this.findLargestTarotCardInPlay();
        if (smallestTarotCardInPlay === null && largestTarotCardInPlay === null) {
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

        if (smallestYInPlay === null) {
            this.suitYPile.topCard = new Card(13, 'y');
        } else {
            this.suitYPile.topCard = smallestYInPlay.getNextLowerCard();
        }
        if (smallestRInPlay === null) {
            this.suitRPile.topCard = new Card(13, 'r');
        } else {
            this.suitRPile.topCard = smallestRInPlay.getNextLowerCard();
        }
        if (smallestGInPlay === null) {
            this.suitGPile.topCard = new Card(13, 'g');
        } else {
            this.suitGPile.topCard = smallestGInPlay.getNextLowerCard();
        }
        if (smallestBInPlay === null) {
            this.suitBPile.topCard = new Card(13, 'b');
        } else {
            this.suitBPile.topCard = smallestBInPlay.getNextLowerCard();
        }
    }

    /*
    Get an array of arrays of column string, for displaying info
     */
    getColumnStringArrays() {
        const columnStringArrays = [];
        for (const columnPile of this.columnPilesArray) {
            columnStringArrays.push(columnPile.columnToStringArray());
        }
        return columnStringArrays;
    }

    firstEmptyColumn() {
        for (const columnLabel of GameState.COLUMN_LABELS) {
            const columnPile = this.getPileFromLabel(columnLabel);
            if (columnPile.isEmpty()) return columnLabel;
        }
        return null;
    }

    /*
    Note the label value offset, just to make it a little easier when displaying output
     */
    getPileFromLabel(pileLabel) {
        switch (pileLabel) {

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
                throw new Error(`Invalid pile name - ${pileLabel}`);
        }
    }

    getDisplayTextArray(cellPadding = 5) {
        const outputArray = [];
        let topLine = "";
        if (this.tarotSmallPile.isEmpty()) {
            topLine += "   <T"
        } else {
            topLine += this.tarotSmallPile.lookTopCard().toString().padStart(cellPadding, " ");
        }
        if (this.tarotLargePile.isEmpty()) {
            topLine += "   >T"
        } else {
            topLine += this.tarotLargePile.lookTopCard().toString().padStart(cellPadding, " ");
        }

        if (this.freeSlotPile.isEmpty()) {
            topLine += " [  ] "
        } else {
            topLine += this.freeSlotPile.lookTopCard().toString().padStart(cellPadding, " ");
        }

        topLine += this.suitYPile.lookTopCard().toString().padStart(cellPadding, " ");
        topLine += this.suitRPile.lookTopCard().toString().padStart(cellPadding, " ");
        topLine += this.suitGPile.lookTopCard().toString().padStart(cellPadding, " ");
        topLine += this.suitBPile.lookTopCard().toString().padStart(cellPadding, " ");

        outputArray.push(topLine);
        let columnLabelLine = "";
        for (const columnLabel of GameState.COLUMN_LABELS) {
            columnLabelLine += columnLabel.padStart(cellPadding, " ");
        }
        outputArray.push("-----------")
        outputArray.push(columnLabelLine);
        let i = 0;
        while (true) {
            let nextLine = "";
            let foundCardOnRow = false;
            for (let c = 0; c < 11; c++) {
                const columnPile = this.columnPilesArray[c];
                const cardAti = columnPile.lookCardAtRow(i);
                if (cardAti === null) {
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

    // Mainly for debugging
    logStateToConsole() {
        const lines = this.getDisplayTextArray(5);
        for (const line of lines) {
            console.log(line);
        }
    }

    executeSingleMove(originLabel, destLabel) {
        // Can enable this for debugging to make sure executed moves are actually valid
        // if (!this.checkValidMove(originLabel, destLabel)) {
        //     throw new Error(`Tried to execute invalid single move ${originLabel} -> ${destLabel}`);
        // }
        const originPile = this.getPileFromLabel(originLabel);
        const destPile = this.getPileFromLabel(destLabel);

        const moveCard = originPile.popTopCard();
        destPile.placeCard(moveCard);

    }

    executeMoveSet(moveSet) {
        for (const singleMove of moveSet.singleMoveArray) {
            this.executeSingleMove(singleMove[0], singleMove[1]);
        }
        this.loggedMoveSets.push(moveSet);
    }

    // May be used for debugging to make sure executed moves are actually valid
    checkValidMove(origin, dest) {
        const originPile = this.getPileFromLabel(origin);
        const destPile = this.getPileFromLabel(dest);

        const moveCard = originPile.lookTopCard();
        if (!(moveCard === null)) {
            return destPile.canReceiveCard(moveCard);
        } else {
            return false;
        }
    }

    freeSlotIsEmpty() {
        return (this.freeSlotPile.lookTopCard() === null);
    }

    /*
    Checks in the top stack cards of a given column can be moved together to another pile.
    If so, returns a moveSet for those actions.
     */
    static VALID_ORIGIN_LABELS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10", "c11", "freeSlot"];

    genMoveSet(originLabel, destLabel, auto = false, movePriority = -1) {
        if (!(GameState.VALID_ORIGIN_LABELS.includes(originLabel))) {
            throw new Error(`Error can't move from ${originLabel}`);
        }
        const originPile = this.getPileFromLabel(originLabel);
        const destPile = this.getPileFromLabel(destLabel);

        const originUILabel = CardPile.getUIPileLabel(originLabel);
        const destUILabel = CardPile.getUIPileLabel(destLabel);

        const [stackSize, topCard, bottomCard] = originPile.getTopStack();
        if (stackSize === 0) return null;
        if (!destPile.canReceiveCard(topCard)) return null;

        const destDesc = destPile.topCardStr();

        if (stackSize === 1) {
            let desc = `Move ${topCard} from ${originUILabel} to ${destUILabel} (${destDesc})`;
            if (auto) {
                desc = "AUTO " + desc;
            }
            return MoveSet.newSingleMove(desc, originLabel, destLabel, movePriority);
        } else {
            let desc = `Move ${stackSize} stack (${topCard} - ${bottomCard}) from ${originUILabel} to ${destUILabel} (${destDesc})`;
            if (auto) {
                desc = "AUTO " + desc;
            }
            const newMoveSet = new MoveSet(desc, movePriority);
            newMoveSet.addStackMove(originLabel, destLabel, stackSize, movePriority);
            return newMoveSet;
        }
    }


    genFlipMoveSet(originLabel, destPileLabel, emptyColumnLabel, auto = false, movePriority = -1) {
        if (this.getPileFromLabel(emptyColumnLabel) > 0) {
            throw new Error(`Error ${emptyColumnLabel} is not empty`);
        }

        const originPile = this.getPileFromLabel(originLabel);
        const destPile = this.getPileFromLabel(destPileLabel);
        const [stackSize, topCard, bottomCard] = originPile.getTopStack()

        const originUILabel = CardPile.getUIPileLabel(originLabel);
        const destUILabel = CardPile.getUIPileLabel(destPileLabel);
        const emptyColumnUILabel = CardPile.getUIPileLabel(emptyColumnLabel);

        if (stackSize <= 1) return null;

        if (destPile.canReceiveCard(bottomCard)) {
            const destDesc = destPile.topCardStr();
            let desc;
            if (GameState.COMMIT_PILE_LABELS.includes(destPileLabel)) {
                desc = `Move ${stackSize} card stack (${topCard} - ${bottomCard}) from ${originUILabel} to empty column ${emptyColumnUILabel} then AUTO MOVE to ${destUILabel}`
            } else {
                desc = `Move ${stackSize} card stack (${topCard} - ${bottomCard}) from ${originUILabel} to empty column ${emptyColumnUILabel} then to ${destUILabel} (${destDesc})`
            }
            const newMoveSet = new MoveSet(desc, movePriority);
            newMoveSet.addStackMove(originLabel, emptyColumnLabel, stackSize - 1);
            newMoveSet.addSingleMove(originLabel, destPileLabel);
            newMoveSet.addStackMove(emptyColumnLabel, destPileLabel, stackSize - 1);
            return newMoveSet;
        }

        return null;
    }

    genSingleMoveMoveSet(originLabel, destLabel, auto = false, movePriority = -1) {
        const originPile = this.getPileFromLabel(originLabel);
        const destPile = this.getPileFromLabel(destLabel);

        const originUILabel = CardPile.getUIPileLabel(originLabel);
        const destUILabel = CardPile.getUIPileLabel(destLabel);

        const moveCard = originPile.lookTopCard();
        if (destPile.canReceiveCard(moveCard)) {
            const destDesc = destPile.topCardStr();
            const desc = `Move ${moveCard} from ${originUILabel} to ${destUILabel} (${destDesc})`;
            return MoveSet.newSingleMove(desc, originLabel, destLabel, movePriority);
        }

        return null;
    }

    getNextForcedMoveSet() {
        const movePriority = 0;
        // FreeSlot - > Tarot
        const freeToTarotSmall = this.genMoveSet("freeSlot", "tarotSmall", true, movePriority);
        if (freeToTarotSmall !== null) return freeToTarotSmall;
        const freeToTarotLarge = this.genMoveSet("freeSlot", "tarotLarge", true, movePriority);
        if (freeToTarotLarge !== null) return freeToTarotLarge;

        // Column -> Tarot
        for (const originLabel of GameState.COLUMN_LABELS) {
            const colToTarotSmall = this.genMoveSet(originLabel, "tarotSmall", true, movePriority);
            if (colToTarotSmall !== null) return colToTarotSmall;
            const colToTarotLarge = this.genMoveSet(originLabel, "tarotLarge", true, movePriority);
            if (colToTarotLarge !== null) return colToTarotLarge;
        }

        // Column -> suit pile (only if free slot is empty)
        if (this.freeSlotIsEmpty()) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                for (const destSuitPileLabel of GameState.SUIT_PILE_LABELS) {
                    const colToSuitPile = this.genMoveSet(originColumnLabel, destSuitPileLabel, true, movePriority);
                    if (colToSuitPile !== null) return colToSuitPile;
                }
            }
        }

        return null;
    }

    processForcedMoves() {
        let nextForcedMove = this.getNextForcedMoveSet();
        while (!(nextForcedMove === null)) {
            this.executeMoveSet(nextForcedMove);
            nextForcedMove = this.getNextForcedMoveSet()

        }
    }

    /*
    This will generate all possible moves (that are worth considering) from the current game state.
    They are generated in order from "most likely to be a good move" to "probably a waste of time".
    We assume that all forced moves have already been processed.
    The logic is a bit messy, but certain types of moves are a lot more likely to get good results than others.
    That's why there's a lot of repetition that seems inefficient.

    Note: when moving something to an empty column, ALWAYS ONLY use the leftmost column

    Move priority order (after forced moves have been processed) :

    1. If there's an empty column,
    check if the bottom card of each column top stack could be commited to a tarot pile.
    If so, flip the top stack to that empty column.

    2. If there's an empty column and the free slot is empty,
    check if the bottom card of each column top stack could be commited to a suit pile.
    If so, flip the top stack to that empty column.

    3. Check if the free slot card can be placed on any columns that have cards (not empty).
    If so, move it to that column.

    4. If there is a free column, Check if any top stacks can be placed on any columns with cards after flipping.
    If so, move that top stack to the empty column then to the other column.

    5. Check if any top stacks can be placed on any other columns with cards.
    If so, move that top stack to that column.

    6. If there is an empty column,
    Check if there is a card beneath any of the top stacks that could be commited to a tarot pile.
    If so, flip the top pile of that column onto the empty column.

    7. If there is an empty column and the free slot is empty,
    Check if there is a card beneath any of the top stacks that could be commited to a suit pile.
    If so, flip the top pile of that column onto the empty column.

    8. If the free slot is filled, and there's an empty column,
    check if the card beneath any of the top stacks could be committed to a color suit pile.
    If so, move the free slot card to the empty column.


    Moves past this point are exploratory, and if we do find a decent move,
    we often just immediately undo everything
    So, we're going to start doing a bid of breadth first searching.

    9. If the free slot is free,
       Check if the top card beneath any single top stacks could be placed on a column with cards.
       If so, move that card to the free slot.

    10. If a column is free,
       Check if the top card beneath any top stacks could be placed on a column with cards.
       If so, move that top stack to a column.

    11. If a column is free, and there is a top stack with K as the bottom card,
        Move the top stack to the empty column.

    12. If there is an empty column, try moving top stacks larger than one card to it.
    13. If the free slot is empty, try moving single card stacks on to it.
    14. If the free slot is empty, try moving the top card of 2 size stacks to it.
    15. If a column is empty, try moving a 2 or larger stacks to it.
    16. If a column is empty and the free slot is full, try moving the free slot card to the column.
    17. If a column is empty, try moving a single card stack to it.
    18. If a column is empty, try moving the top card of a 2 size stack to the empty column.

     */
    * possibleMoves() {
        const firstEmptyColumnLabel = this.firstEmptyColumn();
        const freeSlotIsEmpty = this.freeSlotIsEmpty();
        let movePriority;

        // 1. If there's an empty column,
        // check if the bottom card of each column top stack could be commited to a tarot pile.
        // If so, flip the top stack to that empty column.
        movePriority = 1;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originPile = this.getPileFromLabel(originColumnLabel);
                if (originPile.isEmpty()) continue;
                const moveResultS = this.genFlipMoveSet(originColumnLabel, "tarotSmall", firstEmptyColumnLabel, false, movePriority);
                if (moveResultS !== null) yield moveResultS;
                const moveResultL = this.genFlipMoveSet(originColumnLabel, "tarotLarge", firstEmptyColumnLabel, false, movePriority);
                if (moveResultL !== null) yield moveResultL;
            }
        }

        // 2. If there's an empty column and the free slot is empty,
        // check if the bottom card of each column top stack could be commited to a suit pile.
        // If so, flip the top stack to that empty column.
        movePriority = 2
        if (freeSlotIsEmpty && firstEmptyColumnLabel != null) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originPile = this.getPileFromLabel(originColumnLabel);
                if (originPile.isEmpty()) continue;
                for (const destSuitPileLabel of GameState.SUIT_PILE_LABELS) {
                    const moveResult = this.genFlipMoveSet(originColumnLabel, destSuitPileLabel, firstEmptyColumnLabel, false, movePriority);
                    if (moveResult !== null) yield moveResult;
                }
            }
        }

        // 3. Check if the free slot card can be placed on any columns that have cards (not empty).
        // If so, move it to that column.
        movePriority = 3;
        if (!freeSlotIsEmpty) {
            for (const destColumnLabel of GameState.COLUMN_LABELS) {
                const destColumnPile = this.getPileFromLabel(destColumnLabel);
                if (destColumnPile.isEmpty()) continue; // we don't want to just throw the free card on empty columns yet
                const moveResult = this.genMoveSet("freeSlot", destColumnLabel, false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }

        //  4. If there is a free column, Check if any top stacks can be placed on any columns with cards after flipping.
        //  If so, move that top stack to the empty column then to the other column.
        movePriority = 4;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                if (originColumn.isEmpty()) continue;
                for (const destColumnLabel of GameState.COLUMN_LABELS) {
                    const destColumn = this.getPileFromLabel(destColumnLabel);
                    if (originColumnLabel === destColumnLabel) continue;
                    if (destColumn.isEmpty()) continue;
                    const moveResult = this.genFlipMoveSet(originColumnLabel, destColumnLabel, firstEmptyColumnLabel, false, movePriority);
                    if (moveResult !== null) yield moveResult;
                }
            }
        }

        // 5. Check if any top stacks can be placed on any other columns with cards.
        // If so, move that top stack to that column.
        movePriority = 5;
        for (const originColumnLabel of GameState.COLUMN_LABELS) {
            const originColumn = this.getPileFromLabel(originColumnLabel);
            if (originColumn.isEmpty()) continue;
            for (const destColumnLabel of GameState.COLUMN_LABELS) {
                if (originColumnLabel === destColumnLabel) continue;
                const destColumn = this.getPileFromLabel(destColumnLabel);
                if (destColumn.isEmpty()) continue; // Ignore empty columns for now
                const moveResult = this.genMoveSet(originColumnLabel, destColumnLabel, false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }
        //  6. If there is an empty column and the free slot is empty,
        //  Check if there is a card beneath any of the top stacks that could be commited to a suit pile.
        //  If so, flip the top pile of that column onto the empty column.
        movePriority = 6;
        if (freeSlotIsEmpty && firstEmptyColumnLabel) {
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
            const originColumn = this.getPileFromLabel(originColumnLabel);
            if (originColumn.isEmpty()) continue;
            const cardBelowTopStack = originColumn.getCardBelowTopStack();
            if (cardBelowTopStack === null) continue;
            for (const destSuitPileLabel of GameState.SUIT_PILE_LABELS) {
              const destSuitPile = this.getPileFromLabel(destSuitPileLabel);
              if (destSuitPile.canReceiveCard(cardBelowTopStack)){
                const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
                if (moveResult !== null) yield moveResult;
              }
            }
          }
        }

        //   7. If there is an empty column
        //   Check if there is a card beneath any of the top stacks that could be commited to a tarot pile.
        //   If so, flip the top pile of that column onto the empty column.
        movePriority = 7;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                const cardBelowTopStack = originColumn.getCardBelowTopStack();
                if (cardBelowTopStack === null) continue; // Should return null both if the pile is empty and if the whole pile is one stack
                if (this.tarotSmallPile.canReceiveCard(cardBelowTopStack)) {
                    const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
                    if (moveResult !== null) yield moveResult;
                }
                if (this.tarotLargePile.canReceiveCard(cardBelowTopStack)) {
                    const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
                    if (moveResult !== null) yield moveResult;
                }
            }
        }
        //   8. If the free slot is filled, and there's an empty column,
        //   check if the card beneath any of the top stacks could be committed to a color suit pile.
        //   If so, move the free slot card to the empty column.
        movePriority = 8;
        if (!freeSlotIsEmpty && (firstEmptyColumnLabel)) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                const cardBelowTopStack = originColumn.getCardBelowTopStack();
                if (cardBelowTopStack === null) continue;
                for (const suitPileLabel of GameState.SUIT_PILE_LABELS) {
                    const suitPile = this.getPileFromLabel(suitPileLabel);
                    if (suitPile.canReceiveCard(cardBelowTopStack)) {
                        const moveResult = this.genSingleMoveMoveSet("freeSlot", firstEmptyColumnLabel, false, movePriority);
                        if (moveResult !== null) yield moveResult;
                    }
                }
            }
        }
        //   9. If the free slot is free,
        //   Check if the top card beneath any single top stacks could be placed on a column with cards.
        //   If so, move that card to the free slot.
        movePriority = 9;
        if (freeSlotIsEmpty){
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                const topStackSize = originColumn.getTopStack()[0];
                if (topStackSize > 1) continue;
                const cardBelowTopStack = originColumn.getCardBelowTopStack();
                if (cardBelowTopStack === null) continue;
                for (const destColumnLabel of GameState.COLUMN_LABELS) {
                  const destColumn = this.getPileFromLabel(destColumnLabel);
                  if (destColumn.isEmpty()) continue;
                  if (!destColumn.canReceiveCard(cardBelowTopStack)) continue;
                  const moveResult = this.genSingleMoveMoveSet(originColumnLabel, "freeSlot", false, movePriority);
                  if (moveResult !== null) yield moveResult;
                }
            }
        }

        // 10. If a column is free,
        // Check if the top card beneath any top stacks could be placed on a column with cards.
        // If so, move that top stack to a column.
        movePriority = 10;
        if (firstEmptyColumnLabel){
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
            const originColumn = this.getPileFromLabel(originColumnLabel);
            const cardBelowTopStack = originColumn.getCardBelowTopStack();
            if (cardBelowTopStack === null) continue;
            for (const destColumnLabel of GameState.COLUMN_LABELS) {
              const destColumn = this.getPileFromLabel(destColumnLabel);
              if (destColumn.isEmpty()) continue;
              if (!destColumn.canReceiveCard(cardBelowTopStack)) continue;
              const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
              if (moveResult !== null) yield moveResult;
            }
          }
        }

        // 11. If a column is free, and there is a top stack with K as the bottom card,
        //   Move the top stack to the empty column.
        movePriority = 11;
        if (firstEmptyColumnLabel){
          for (const originColumnLabel of GameState.COLUMN_LABELS) {
            const originColumn = this.getPileFromLabel(originColumnLabel);
            if (originColumn.isEmpty()) continue;
            const [topStackSize, topStackTopCard, topStackBottomCard] = originColumn.getTopStack();
            if (topStackBottomCard.isColorCard() && topStackBottomCard.intVal === 13){
              const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
              if (moveResult !== null) yield moveResult;
            }
          }
        }

        //   Okay, now we're in the weeds
        //   12. If there is an empty column, try moving top stacks larger than one card to it.
        movePriority = 12;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                if (originColumn.isEmpty()) continue;
                const originTopStack = originColumn.getTopStack();
                if (originTopStack[0] < 2) continue;
                const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority)
                if (moveResult !== null) yield moveResult;
            }
        }

        //   13. If the free slot is empty, try moving single card stacks on to it.
        movePriority = 13;
        if (freeSlotIsEmpty) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                if (originColumn.isEmpty()) continue;
                const originTopStack = originColumn.getTopStack();
                if (originTopStack[0] !== 1) continue;
                const moveResult = this.genSingleMoveMoveSet(originColumnLabel, "freeSlot", false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }

        // 14. If the free slot is empty, try moving the top card of 2 size stacks to it.
        movePriority = 14;
        if (freeSlotIsEmpty) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                const topStack = originColumn.getTopStack();
                if (topStack[0] !== 2) continue;
                const moveResult = this.genSingleMoveMoveSet(originColumnLabel, "freeSlot", false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }

        //  15. If a column is empty, try moving a 2 or larger stacks to it.
        movePriority = 15;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                if (originColumn.isEmpty()) continue;
                const topStack = originColumn.getTopStack();
                if (topStack[0] < 2) continue;
                const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }
        //   16. If a column is empty and the free slot is full, try moving the free slot card to the column.
        movePriority = 16;
        if (!(freeSlotIsEmpty) && (firstEmptyColumnLabel)) {
            const moveResult = this.genMoveSet("freeSlot", firstEmptyColumnLabel, false, movePriority);
            if (moveResult !== null) yield moveResult;
        }

        //   17. If a column is empty, try moving a single card stack to it.
        movePriority = 17;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                if (originColumn.isEmpty()) continue;
                const topStack = originColumn.getTopStack();
                if (topStack[0] !== 1) continue;
                const moveResult = this.genMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }
        //   18. If a column is empty, try moving the top card of a 2 size stack to the empty column.
        movePriority = 18;
        if (firstEmptyColumnLabel) {
            for (const originColumnLabel of GameState.COLUMN_LABELS) {
                const originColumn = this.getPileFromLabel(originColumnLabel);
                const topStack = originColumn.getTopStack();
                if (topStack[0] !== 2) continue;
                const moveResult = this.genSingleMoveMoveSet(originColumnLabel, firstEmptyColumnLabel, false, movePriority);
                if (moveResult !== null) yield moveResult;
            }
        }
    }

    checkWin() {
        for (const columnPile of this.columnPilesArray) {
            if (!(columnPile.isEmpty())) {
                return false;
            }
        }
        return true;
    }

    clone() {
        const newColumnPileArray = [];
        for (const columnPile of this.columnPilesArray) {
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

    solve(maxAllowedDepth = 200, maxAllowedStates = 500000) {
      const recursionMonitor = new RecursionMonitor();
      const topSubState = this.clone();
      topSubState.processForcedMoves();
      const checkedStateIDsSet = new Set();
      const finalResult = topSubState.subSolve(checkedStateIDsSet, maxAllowedDepth, maxAllowedStates, 0, recursionMonitor);
      if (finalResult === null) {
          return [null, recursionMonitor];
      } else {
          const finalResultReversed = finalResult.reverse();
          return [finalResultReversed, recursionMonitor];
      }

    }

    subSolve(checkedStatesSet, maxAllowedDepth, maxAllowedStates, lastDepth, recursionMonitor) {
        const currentDepth = lastDepth + 1;
        recursionMonitor.updateDepth(currentDepth)

        if (currentDepth >= maxAllowedDepth) {
            return null;
        }

        if (checkedStatesSet.size >= maxAllowedStates) {
            return null;
        }

        const preID = this.getIDStr();
        if (checkedStatesSet.has(preID)) {
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

        checkedStatesSet.add(preID);
        checkedStatesSet.add(postID);
        recursionMonitor.updateCheckedStates(checkedStatesSet.size);

        for (const nextPossibleMove of this.possibleMoves()) {
            if (recursionMonitor){
                const movePriority = nextPossibleMove.movePriority;
                recursionMonitor.incrementPriorityTracker(movePriority);
            }

            const subState = this.clone();
            subState.executeMoveSet(nextPossibleMove);
            const subResult = subState.subSolve(
                checkedStatesSet,
                maxAllowedDepth,
                maxAllowedStates,
                currentDepth,
                recursionMonitor,
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
    Generates a str representing the current game state.
    Note, we don't have to care about what order the columns are in.
    If you simply swapped the cards in two columns, that is still exactly the same game state except for the labels.
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
        for (const columnPile of this.columnPilesArray) {
            columnTxtArray.push(columnPile.columnToIDStr());
        }
        columnTxtArray.sort();

        for (const columnStr of columnTxtArray) {
            if (columnStr.length > 0) {
                idStr += " " + columnStr;
            }
        }
        return idStr;
    }

    getInputStrings(){
      const outArray = [];
      for (const columnPile of this.columnPilesArray) {
        outArray.push(columnPile.toString().toLowerCase());
      }
      outArray.push(this.freeSlotPile.toString().toLowerCase());
      return outArray;
    }
}

class MoveSet {
    constructor(description, movePriority = 0) {
        this.singleMoveArray = [];
        this.description = description;
        this.movePriority = movePriority; // This is for keeping track of what move priority this is, just for debugging

    }

    static newSingleMove(description, origin, destination, movePriority = 0) {
        const newMoveset = new MoveSet(description, movePriority);
        newMoveset.singleMoveArray.push([origin, destination]);
        return newMoveset
    }

    addStackMove(origin, destination, stackSize) {
        for (let i = 0; i < stackSize; i++) {
            this.singleMoveArray.push([origin, destination]);
        }
    }

    addSingleMove(origin, destination) {
        this.singleMoveArray.push([origin, destination]);
    }


}

class RecursionMonitor{
    static MAX_PRIORITY_VAL = 18
    constructor() {
    this.deepestDepth = 0;
    this.checkedStates = 0;
    this.priorityTracker = [];
    for (let i = 0; i < RecursionMonitor.MAX_PRIORITY_VAL + 1; i++) { // One more, so -1 can be the last val
        this.priorityTracker.push(0);
    }
    }

    updateDepth(depth) {
    this.deepestDepth = Math.max(this.deepestDepth, depth);
    }

    updateCheckedStates(checkedStates) {
    this.checkedStates = Math.max(this.checkedStates, checkedStates);
    }

    incrementPriorityTracker(priorityVal){
        this.priorityTracker[priorityVal]++;

    }
}



// Various values for testing
/*
const TEST_VALS_EMPTY = [
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
  "",
];

const TEST_VALS_SIMPLE = [
    "9t qr kr qb kb", "1t 2t 3t 5t 4t", "jg qg kg 10g 9g 7g 8g", "6t 7t 8t", "", "", "", "", "", "", "", "",

];

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
];



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
];

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

];

const TRY_4 = [
  "4g 6r 10t 8b 15t qb 18t",
  "21t ky 3g 2g jr 2t 20t",
  "8t 9t 3y 2y 6y 8y 19t",
  "3t 5t 12t 0t 5r 7b 4r",
  "6g 6b 5b 7r 16t 5g 10y",
  "",
  "qg jg 11t 10r 9y 9r 7y",
  "6t 14t 4y 7g 9b 8r 17t",
  "kb qy 4t 7t qr 8g kg",
  "2b kr 1t 2r 13t 5y 9g",
  "jy 3r 10g jb 10b 4b 3b",
  "",
];
 */

const EXAMPLE_GAME_1 = [
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
];

const EXAMPLE_GAME_2 = [
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
];

const SPLASHSCREEN_GAME_FIXED = [
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
  "14t 3r 7g jg 10r kg kb",
  "",
];

setGameStateInputValues(SPLASHSCREEN_GAME_FIXED);
setAdvancedSettingInputValues(["250", "30000"])

