import React from 'react';
import {Card, Deck} from './guillotine';

const nobleCardBackUrl = 'https://guillotine.spideron.net/images/cards/guillotine_nobel_back.png';
// Todo - get from server
const nobleCards = [
  {
    name: 'Martyr',
    value: -1,
    color: 'gray',
    caption: '',
    frontUrl: 'https://guillotine.spideron.net/images/cards/martyr.png',
    backUrl: nobleCardBackUrl
  },
  {
    name: 'Wealthy Priest',
    value: 1,
    color: 'blue',
    caption: '',
    frontUrl: 'https://guillotine.spideron.net/images/cards/wealthy_priest.png',
    backUrl: nobleCardBackUrl
  },
  {
    name: 'Piss Boy',
    value: 1,
    color: 'purple',
    caption: '',
    frontUrl: 'https://guillotine.spideron.net/images/cards/piss_boy.png',
    backUrl: nobleCardBackUrl
  },
  {
    name: 'Coiffeur',
    value: 1,
    color: 'purple',
    caption: '',
    frontUrl: 'https://guillotine.spideron.net/images/cards/coiffeur.png',
    backUrl: nobleCardBackUrl
  },
  {
    name: 'Fast Noble',
    value: 1,
    color: 'purple',
    caption: 'collect an additional noble from the of the line afteryou collect this noble.',
    frontUrl: 'https://guillotine.spideron.net/images/cards/fast_noble.png',
    backUrl: nobleCardBackUrl
  }
];

const deck = Deck.fromObjectArray(nobleCards);
deck.shuffle();

export class CardUI extends React.Component {
    
    render(){
        const cards = deck.draw(3);
        const listItems = cards.map((card, i) =>
            <li key={i}>
                <img src={card.frontUrl} alt={card.name} />
            </li>);
        
        return (
            <div>
                <ul className="cardsList">
                  {listItems}  
                </ul>
            </div>
        );
    }
}