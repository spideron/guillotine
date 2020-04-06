/**
 * Card prototype.
 * name - the card name
 * value - the value of the card
 * color - the color of the card
 * caption - the card caption / any specific text on it
 * frontUrl - image url for the front of the card
 * backUrl = image urk for the back of the card
 * 
 * usage: card = New Card(name, value, caption, frontUrl, backUrl)
**/
export class Card {
    constructor(name, value, color, caption, frontUrl, backUrl) {
        this._name = name;
        this._value = value;
        this._color = color;
        this._caption = caption;
        this._frontUrl = frontUrl;
        this._backUrl = backUrl;
    }
    
    /** Get the card name (card.name) **/
    get name() {
        return this._name;
    }

     /** Get the card value (card.value) **/
    get value() {
        return this._value;
    }
    
    get color(){
        return this._color;
    }

    /** get the card caption / any specific text on it (card.caption)  **/
    get caption() {
        return this._caption;
    }

    /** get the image url for the front of the card (card.frontUrl)  **/
    get frontUrl() {
        return this._frontUrl;
    }
    
    /** get the image url for the back of the card (card.backUrl)  **/
    get backUrl() {
        return this._backUrl;
    }
    
    /** static array of the valid card colors **/
    static colors = ['red', 'purple', 'blue', 'gray'];
    
    /** static function the see if a card is valid (Card.isValid(card)) **/
    static isValid(card) {
        return card && card.name && card.value && card.color && 
            Card.colors.includes(card.color);
    }

    /** 
     * static function that returns a new card from an object
     * the object must have a valid name and value properties. caption, frontUr, and backUrl
     * will be initialized to empty string ('') if no valid value is set for these properties
     *
     * usage: card = Card.fromObject(obj)
    **/
    static fromObject(obj) {
        if (Card.isValid(obj)) {
            const caption = obj.caption && typeof obj.caption === 'string' ? obj.caption : '';
            const frontUrl = obj.frontUrl && typeof obj.frontUrl === 'string' ? obj.frontUrl : '';
            const backUrl = obj.backUrl && typeof obj.backUrl === 'string' ? obj.backUrl : '';
            return new Card(obj.name, obj.value, obj.color, caption, frontUrl, backUrl);
        }
        else{
            throw new Error('Invalid card object', obj);
        }
    }
}

/**
* Deck prototype
* cards - a valid array of Card class
* 
* uasge: deck = new Deck(cards)
**/
export class Deck {
    constructor(cards) {
        if (cards && Array.isArray(cards)) {
            for (let i = 0; i < cards.length; i++) {
                if (!Card.isValid(cards[i])) {
                    throw new Error('Invlid card', cards[i]);
                }
            }
            this._cards = cards;
        }
    }

    /** 
     * return a number of cards from the top of the deck without changing it
     * if the number id bigger than the deck size, the function will return
     * all the reamining cards in the deck
     * 
     * usage: deck.peek(1)
    **/
    peek(num) {
        if (this._cards.length > 0) {
            if (num && Number.isInteger(num)) {
                return this._cards.slice(0, Math.min(num, this._cards.length));
            }
        }
    }

    /** shuffle the deck **/
    shuffle() {
        for (let i = this._cards.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
        }
    }
    
    /**
     * draw cards from the deck (and remove them from the deck)
     * if the deck size is smaller than the num argument, the full deck will
     * be drawn. the function returns an array
     * 
     * usage: 
     *  cards = deck.draw() - will draw 1 card (default)
     *  cards = deck.draw(3) - will draw 3 cards
    **/
    draw(num = 1){
        if(num && Number.isInteger(num) && num > 0 && this._cards.length > 0){
            return this._cards.splice(0, Math.min(num, this._cards.length));
        }
    }
    
    /** 
     * add a card to the deck. by default the card will be added to the top of 
     * the deck. The index allows to add the card at a specific location.
     * if the index argument is outside the bounds of the deck array the card
     * will be added at the end of the deck
     * 
     * usage: 
     *  deck.add(card) - card will be added at the top of the deck
     *  deck.add(card, 3) - card will be added as the fourth card (0 index based)
     * 
    **/
    add(card, index = 0){
        if(card instanceof Card){
            this._cards.splice(Math.min(index, this._cards.length -1), 0, card);
        }
    }
    
    /**
    * return a new Deck from array of object represnding cards data
    * 
    * usage: deck = Deck.fromObjectArray(arr)
    **/
    static fromObjectArray(arr){
        if(arr && Array.isArray(arr)){
            let cards = [], card;
            for(let i=0; i < arr.length; i++){
                card = Card.fromObject(arr[i]);
                cards.push(Card.fromObject(arr[i]));
            }
            return new Deck(cards);
        }
        else {
            throw new Error('not an Array', arr);
        }
    }
}
