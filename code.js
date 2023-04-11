// import * from d3 as "d3";

class ListOfDecks {
  constructor() {
    this.deckLists = {}
    this.deckName = []
  }

  addDeck(nameOfDeck, deck) {
    this.deckLists[nameOfDeck] = deck // store the deck object as the key
    this.deckName.push(nameOfDeck)
  }

  deleteDeck(nameOfDeck) {
    delete this.deckLists(nameOfDeck)
  }

  showDecks(){
    this.deckName.forEach(element => console.log(element))
  }

}


// class declarations
class Deck {
  constructor() {
    this.deckList = {}; // key is the name, value is array [quantity, Card Object]
    this.totalCards = 0;
    this.images = [];
    this.cardTypes = {};
    this.all_cmc = {};
  }

  clearDeck() {
    this.deckList = {};
    this.totalCards = 0;
    this.images = [];
    this.cardTypes = {};
    document.querySelector("magnify-image").innerHTML = ""
  }

  sumDeck() {
    for (key in this.deckList) {
      this.totalCards += this.deckList[key][0];
    }
    console.log("Deck has been counted");
  }

  typifyDeck() {
    this.cardTypes = {};

    for (key in this.deckList) {
      console.log(key);
      let cardType = this.deckList[key][1].type;

      if (cardType in this.cardTypes) {
        this.cardTypes[cardType].push(key);
      } else {
        this.cardTypes[cardType] = [key];
      }
    }
  }

  nameDeck(){

  }

  saveDeck(){
    
  }
}

class Card {
  constructor(name, cmc, type, uris) {
    this.name = name;
    this.cmc = cmc;
    this.type = type;
    this.uris = uris;
    this.commander = false;
    // console.log(name + " card object has been created")
  }
}

// instantiating Deck object
const myDeck = new Deck();

const output = document.querySelector("output");


// functions
function loadImage(cardName) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var txt = this.responseText;
      var obj = JSON.parse(txt);

      // extracting the sole type (land, creature, artifact, etc.)
      card_type = typeExtraction(obj.type_line);

      // checking if it's marked as a commander
      if (cardName.slice(-1) == "*") {
        console.log("Deck has a Commander");
        card_type = "Commander";
        old_name = cardName;
        cardName = obj.name;
        myDeck.deckList[cardName] = myDeck.deckList[old_name];
        delete myDeck.deckList[old_name];
      }

      // getting the image uris and creating the Card objects
      try {
        if (obj.card_faces.length == 2) {
          myDeck.images.push(obj.card_faces[0].image_uris.small);

          image_dict = {
            small: obj.card_faces[0].image_uris.small,
            normal: obj.card_faces[0].image_uris.normal,
          };

          newCardObject = new Card(cardName, obj.cmc, card_type, image_dict);
        }
      } catch {
        myDeck.images.push(obj.image_uris.small);

        image_dict = {
          small: obj.image_uris.small,
          normal: obj.image_uris.normal,
        };

        newCardObject = new Card(cardName, obj.cmc, card_type, image_dict);
      }
      // adding the card objects to the arrays in decklist
      myDeck.deckList[cardName].push(newCardObject);
    }
  };
  xhttp.open(
    "GET",
    "https://api.scryfall.com/cards/named?fuzzy=" + cardName,
    true
  );
  xhttp.send();
}

function typeExtraction(cardTypeString) {
  stringText = cardTypeString.split(" ");
  if (stringText[0] == "Legendary") {
    return stringText[1];
  } else if (stringText[1] == "Creature") {
    return stringText[1];
  } else if (stringText[0] == "Basic") {
    return stringText[1];
  } else {
    return stringText[0];
  }
}

function loadDeck() {
  for (key in myDeck.deckList) {
    loadImage(key);
    console.log(key + " image retrieved");
  }
}

function submitDeck() {
  if (myDeck.deckList != {}) {
    myDeck.clearDeck();
  } else {
    console.log("New deck being created!");
  }

  var deck = document.getElementById("deck");
  var lines = deck.value.replace(/\r\n/g, "\n").split("\n");

  for (let i = 0; i < lines.length; i++) {
    data = parseLine(lines[i]);
    myDeck.deckList[data[1]] = [data[0]]; // store cardName as key, qty as value
  }

  loadDeck();

  myDeck.sumDeck();
}

function parseLine(someText) {
  // find index of the first space
  firstSpace = someText.indexOf(" ");
  lastItem = someText[-1];

  //partition quantities
  var regex = /\d+/g;
  strQuantity = someText.slice(0, firstSpace);
  strQuantity = strQuantity.match(regex);

  intQuantity = parseInt(strQuantity);
  // is the card a valid card?
  cardName = someText.slice(firstSpace + 1);

  // check response from scryfall API
  // if null, return bad value

  return [intQuantity, cardName];
}

function restoreTextArea() {
  myDeck.clearDeck();
  document.getElementById("deck").value = "";
  output.innerHTML = "";
}

function displayImages() {
  myDeck.typifyDeck();

  let div_images = "";
  for (let card in myDeck.deckList) {
    url = myDeck.deckList[card][1]["uris"]["small"];
    count = myDeck.deckList[card][0];
    div_images += `<div class="image"><img id="${card}" onmouseover="magnifyImage(this)" class="card_image" src="${url}" alt="image"><span>x${count}</span></div>`;
  }

  // for (i = 0; i < myDeck.images.length; i++) {
  //   div_images += `<div class="image"><img src="${myDeck.images[i]}" alt="image"><span>"x${}"</span></div>`;
  // }

  output.innerHTML = div_images;
}

function arrangeByType() {
  let current_types = [];
  let current_divs = [];
  // quite convoluted to get the name...

  for (key in myDeck.cardTypes) {
    current_types.push(key);
  }
  console.log(current_types);

  order = [
    "Commander",
    "Creature",
    "Sorcery",
    "Instant",
    "Artifact",
    "Enchantment",
    "Land",
  ];

  for (type of order) {
    console.log(type);
    if (current_types.includes(type)) {
      cardNames = myDeck.cardTypes[type];
      console.log(cardNames);
      let images = "";
      for (i = 0; i < cardNames.length; i++) {
        images += `<div class="image"><img id="${cardNames[i]}" onmouseover="magnifyImage(this)" class="card_image" src="${myDeck.deckList[cardNames[i]][1]["uris"]["small"]}" alt="image"></div>`;
      }
      new_div = `<div class="block">
      <h4>${type}(${cardNames.length})</h4>
      ${images}
      </div>`;

      current_divs.push(new_div);
    }
  }
  output.innerHTML = current_divs.join("");
}

function arrangeByCMC() {
  // read through each card in myDeck.decklist
  // get out the cmc (ignore if it's a land)

  all_cmc = {};
  lands = [];
  current_divs = [];

  // landAnalysis()
  for (card in myDeck.deckList) {
    if (myDeck.deckList[card][1]["type"] == "Land") {
      lands.push(card);
    } else {
      let currCMC = myDeck.deckList[card][1]["cmc"];
      if (!all_cmc[currCMC]) {
        all_cmc[currCMC] = [card];
        // console.log(all_cmc);
      } else {
        all_cmc[currCMC].push(card);
      }

      // console.log(lands);

      all_cmc["Lands"] = lands;
    }
  }

  for (cmc in all_cmc) {
      cardNames = all_cmc[cmc];
      console.log(cmc)
      let images = "";
      for (i = 0; i < cardNames.length; i++) {
        images += `<div class="image"><img id="${cardNames[i]}" onmouseover="magnifyImage(this)" class="card_image" src="${myDeck.deckList[cardNames[i]][1]["uris"]["small"]}" alt="image"></div>`;
      }
      if (cmc == 'Lands'){
        console.log("land")
          new_div = `<div class="block">
        <h4>${cmc}(${cardNames.length})</h4>
        ${images}
        </div>`;
      } 
      
      if (cmc != 'Lands'){
        console.log("GOTTEM")
        new_div = `<div class="block">
        <h4>${cmc} cmc(${cardNames.length})</h4>
        ${images}
        </div>`;
      }

    current_divs.push(new_div);
  }
  output.innerHTML = current_divs.join("");

  // attaching the all_cmc object to myDeck
  myDeck.all_cmc = all_cmc;
}


function magnifyImage(image) {
  // console.log(image);
  // console.log(image.id);
  bigger_source = myDeck.deckList[image.id][1]["uris"]["normal"];

  magnify_area = document.querySelector("magnify-image");

  magnify_area.innerHTML = `<div class="image"><p class="mag_card_name">${image.id}</p><img class="large_card_image" src="${bigger_source}" alt="image"></div>`;
}

function showDataViz() {

  averageNonLandCMC = toString(calcAverageNonLandCMC())
  console.log(averageNonLandCMC)

  const data = [1, 2, 2, 2, 3, 4, 5, 6, 6, 6, 9]
  const margin = 60;
  const width = 1000 - 2 * margin;
  const height = 600 - 2 * margin;

  const svg = d3.select('svg');


  
}

function calcAverageNonLandCMC(){
  /*
  I want this function to:
    1. calculate the nonland average CMC of the deck
  */
    spellsDict = {};
    landsDict = {};
  
    let cards = Object.keys(myDeck.deckList);
    let totalSpells = 0;
    let sumOfCMC = 0;
    let totalLands = 0;
  
    for (let i = 0; i < cards.length; i++) {
      if (myDeck.deckList[cards[i]][1]["type"] != "Land") {
        cmc = myDeck.deckList[cards[i]][1]["cmc"];
        count = myDeck.deckList[cards[i]][0];
        spellsDict[cards[i]] = myDeck.deckList[cards[i]][0];
        totalSpells += count;
        sumOfCMC += cmc * count;
      } else {
        totalLands += myDeck.deckList[cards[i]][0];
        landsDict[cards[i]] = myDeck.deckList[cards[i]][0];
      }
    }
  
    // calculate the average CMC of the deck
    averageNonLandCMC = sumOfCMC / totalSpells;
    // console.log(averageNonLandCMC.toFixed(2));

    return averageNonLandCMC;

}

function saveDeck(){
  const response = confirm("Would you like to save this deck?");

  if (response){
    console.log("Deck is saved")
  } else {
    console.log("My guy...")
  }



}
