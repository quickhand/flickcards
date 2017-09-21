import uuid from 'uuid';
import {ADD_LOCATION, SET_LOCATIONS, MOVE_LOCATION, ADD_CARD, REMOVE_CARD, CLEAR_CARDS, SET_CARD_TRANSITIONING, MOVE_CARD, SET_CARD_PARAMETERS} from './constants.js';
import {getCardById, getLocationById} from './utils.js';
const initialState = {
    cards: [],
    seen: [],
    locations: [],
    cardpause: false,
    cardparms: {
        cardWidth: 200,
        cardMaxHeight: 400,
        cardTimeout: 8000
    }
};

function isValid(val) {
    if(typeof val === "undefined" || val === null || val === Infinity || (typeof(val) === "number" && isNaN(val))) {
        return false;
    }
    return true;
}

export default function cards(state = initialState, action) {
    if(action.type === ADD_CARD) {
        let pauselocations = state.locations.filter(loc => loc.pauseOnOccupied).map(loc => loc.id);
        let addlocation = isValid(action.locationId)?action.locationId:0;
        let curpause = state.cardpause;
        if(pauselocations.indexOf(addlocation)!==-1) { curpause = true }
        return {
            ...state,
            cards: [
                ...state.cards, 
                {
                    id: isValid(action.id)?action.id:uuid.v4(),
                    title: isValid(action.title)?action.title:"No title",
                    content: isValid(action.content)?action.content:null,
                    icon: isValid(action.icon)?action.icon:"feedback",
                    locationId: addlocation,
                    positionOffset: [0,0],
                    transitioning: false,
                    opacity: 1,
                    authordata: action.authordata || null
                }
            ],
            cardpause: curpause
        }
    } else if(action.type === CLEAR_CARDS) {
        return {
            ...state,
            cards: [],
            cardpause: false
        };
    } else if(action.type === REMOVE_CARD) {
        let pauselocations = state.locations.filter(loc => loc.pauseOnOccupied).map(loc => loc.id);
        let newcardarr = state.cards.filter(card => card.id !== action.id);
        let cardpause = newcardarr.filter(card => pauselocations.indexOf(card.locationId)!==-1).length > 0;
        
        return {
            ...state,
            cards: newcardarr,
            cardpause
        }
    } else if(action.type === SET_CARD_TRANSITIONING) {
        let target = getCardById(action.id,{ cards: state }); //state.cards.filter(card => card.id === action.id)[0];
        if(!target) { return state; }
        return {
            ...state,
            cards: [
                ...(state.cards.filter(card => card.id !== action.id)),
                {
                    ...target,
                    transitioning: action.transitioning
                }
            ]
        }
    } else if(action.type === MOVE_CARD) {
        let target = getCardById(action.id,{ cards: state });
        if(!target) { return state; }
        let othercards = state.cards.filter(card => card.id !== action.id);
        let cardpause = state.cardpause;
        if(isValid(action.locationId) && action.locationId !== target.locationId) {
            let pauselocations = state.locations.filter(loc => loc.pauseOnOccupied).map(loc => loc.id);
            cardpause = othercards.filter(card => pauselocations.indexOf(card.locationId)!==-1).length>0 ||
                pauselocations.indexOf(action.locationId)!==-1;
        }
        return {
            ...state,
            cards: [
                ...othercards,
                {
                    ...target,
                    positionOffset: action.positionOffset,
                    locationId: isValid(action.locationId)?action.locationId:target.locationId,
                    opacity: isValid(action.opacity)?action.opacity:target.opacity
                }
            ],
            cardpause
        }
    } else if(action.type === ADD_LOCATION) {
        return {
            ...state,
            locations: [
                ...state.locations, 
                {
                    id: action.id || uuid.v4(),
                    xPosition: action.xPosition || 0,
                    yPosition: action.yPosition || 0,
                    xFreedom: action.xFreedom || false,
                    yFreedom: action.yFreedom || false,
                    isCancel: action.isCancel || false,
                    isDismiss: action.isDismiss || false,
                    disabled: action.disabled || false,
                    possibleDestinations: action.possibleDestinations || []
                }
            ],
        };
    } else if(action.type === MOVE_LOCATION) {
        let target = getLocationById(action.id,{cards: state}); //locations.filter(loc => loc.id === action.id)[0];
        if(!target) { return state; }
        return {
            ...state,
            locations: [
                ...(state.locations.filter(loc => loc.id !== action.id)),
                {
                    ...target,
                    xPosition: action.xPosition,
                    yPosition: action.yPosition
                }
            ]
        };
    } else if(action.type === SET_LOCATIONS) {
        return {
            ...state,
            locations: action.locations
        };
    } else if(action.type === SET_CARD_PARAMETERS) {
        return {
            ...state,
            cardparms: Object.assign({},state.cardparms,action.cardparms)
        }
    } else {
        return state;
    }
}