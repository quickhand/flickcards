import {add2d, sub2d, scalarMult2d, dot2d, lengthSq2d, length2d, perpendic2d, distance2d, cleanVal} from './vector2d.js';
import rebound from 'rebound';
import {ADD_LOCATION, SET_LOCATIONS, MOVE_LOCATION, ADD_CARD, REMOVE_CARD, CLEAR_CARDS, SET_CARD_TRANSITIONING, MOVE_CARD, SET_CARD_PARAMETERS} from './constants.js';
import {getCardById, getLocationById, getCardAtLocation, findCard} from './utils.js';

export function addLocation(location) {
    return {
        type: ADD_LOCATION,
        ...location
    };
}

export function setLocations(locations) {
    return {
        type: SET_LOCATIONS,
        locations  
    }
}

export function moveLocation(id,xPosition,yPosition) {
    return {
        type: MOVE_LOCATION,
        id,
        xPosition,
        yPosition
    };
}

function canAddCard(card,state) {
    let can = true;
    if(card.hasOwnProperty("id") && 
        (state.cards.find(c => c.id === card.id) || state.seen.indexOf(card.id)!==-1)) { 
        can = false;
    }
    return can;
}

export function addCard(card) {
    return (dispatch, getState) => {
        if(!canAddCard(card,getState().cards)) {
            return;
        }
        dispatch({
            type: ADD_CARD,
            ...card 
        })
    }
}

export function removeCard(id) {
    return {
        type: REMOVE_CARD,
        id
    }
}
export function clearCards() {
    return {
        type: CLEAR_CARDS
    }
}


export function setCardTransitioning(id,transitioning) {
    return {
        type: SET_CARD_TRANSITIONING,
        id,
        transitioning
    }
}

export function moveCard(id,offsetX,offsetY,locationId=undefined,opacity=undefined) {
    return {
        type: MOVE_CARD,
        id,
        positionOffset: [offsetX, offsetY],
        locationId,
        opacity
    }
}

/*Function specific to this layout, add a card at location 0, pop it to 1*/
export function addAndPopCard(card) {
    return (dispatch, getState) => {
        if(!canAddCard(card,getState().cards)) {
            return;
        }
        dispatch(dismissAtLocation(1));
        dispatch(addCard(card));
        let cardsArr = getState().cards.cards;
        if(cardsArr.length==0) { console.log("Warning: Could not pop card"); return; }
        let newCardId = cardsArr[cardsArr.length-1].id;
        dispatch(transitionCard(newCardId,1));
        setTimeout(() => {
            let newCard = getCardById(newCardId,getState());// store.getState().cards.cards.filter(c => c.id === newCardId);
            /*if(matchedCards.length === 0) { return; }
            let newCard = matchedCards[0];*/
            if(newCard && newCard.locationId === 1 && !newCard.transitioning) {
                dispatch(dismissCard(newCard.id));
            }
        },getState().cards.cardparms.cardTimeout)
    }   
}
/*End*/


export function transitionCard(cardId, endLocationId, velocity=[0,0]) {
    return (dispatch, getState) => {
        let card = getCardById(cardId,getState());// getState().cards.cards.filter(c => c.id === cardId)[0];
        if(!card) { return ;}
        let location = getLocationById(card.locationId,getState());
        if(!location) { return; }
        let sameLocations = false;
        if(card.locationId === endLocationId ) {
            sameLocations = true;
        }
        let endLocation;
        if(!sameLocations) {
            endLocation = getLocationById(endLocationId,getState());
            dispatch(setCardTransitioning(cardId,true));
            dispatch(dismissAtLocation(endLocationId));
        } else {
            endLocation = location;
        }
        // getState().locations.locations.filter(loc => loc.id === card.locationId)[0];
        let offsetVect = card.positionOffset;
        if(sameLocations) {
            location = {
                id: "temploc",
                xPosition: location.xPosition + 100,
                yPosition: location.yPosition + 100
            }
            offsetVect = [card.positionOffset[0] - 100,card.positionOffset[1] - 100];
        } 
            
        
         //getState().locations.locations.filter(loc => loc.id === endLocationId)[0];
        
        
        

        const TENSION = 80;
        const FRICTION = 10;

        
        let velocityVect = velocity.map(cleanVal.bind(null,5));
        let locationVect = [cleanVal(5,location.xPosition),cleanVal(5,location.yPosition)];
        let endLocationVect = [cleanVal(5,endLocation.xPosition),cleanVal(5,endLocation.yPosition)];
        
        let parallelVect = sub2d(endLocationVect, locationVect).map(cleanVal.bind(null,5));
        let perpendicVect = perpendic2d(parallelVect).map(cleanVal.bind(null,5));
        
        let parallelComponent = dot2d(offsetVect,parallelVect)/lengthSq2d(parallelVect);//  thresh(offsetVect.dot(parallelVect)/parallelVect.lengthSq(),0.0001);
        let perpendicComponent = dot2d(offsetVect,perpendicVect)/lengthSq2d(perpendicVect); // thresh(offsetVect.dot(perpendicVect)/perpendicVect.lengthSq(),0.0001);
        
        let parallelVelocity = dot2d(velocityVect,parallelVect)/lengthSq2d(parallelVect); //thresh(velocityVect.dot(parallelVect)/parallelVect.lengthSq(),0.0001);;
        let perpendicVelocity = dot2d(velocityVect,perpendicVect)/lengthSq2d(perpendicVect); //thresh(velocityVect.dot(perpendicVect)/perpendicVect.lengthSq(),0.0001);;

        
        let springSystem = new rebound.SpringSystem();
        let springParallel = springSystem.createSpring();
        springParallel.setCurrentValue(parallelComponent)//.setAtRest();
        let springPerpendic = springSystem.createSpring();
        springPerpendic.setCurrentValue(perpendicComponent)//.setAtRest();

        let springingParallel = parallelComponent!=1 || parallelVelocity != 0;
        let springingPerpendic = perpendicComponent!=0 || perpendicVelocity != 0;
        
        let springsInAction = (springingParallel?1:0) + (springingPerpendic?1:0);

        let curvalues = [parallelComponent,perpendicComponent].map(cleanVal.bind(null,5));
        
        let onSpringAtRest = function(spring) {
            
            springsInAction--;
            //console.log("springAtRest called for card "+cardId+" (springsInAction: "+springsInAction+")")
            //console.log("Decreasing Spring in action to "+springsInAction);
            if(springsInAction===0) {
                dispatch(moveCard(cardId,0,0,endLocationId));
                if(!sameLocations) {
                    dispatch(setCardTransitioning(cardId,false));
                    if(endLocation.isDismiss || endLocation.isCancel) {
                        dispatch(removeCard(cardId));
                    }
                }
            }    
        }
        
        const getPosition = function(parallelValue,perpendicValue) {
            /*return (new Victor(parallelValue,parallelValue)).multiply(parallelVect)
                .add((new Victor(perpendicValue,perpendicValue)).multiply(perpendicVect))
                .add(offsetVect).toArray();*/
            return add2d(
                scalarMult2d(parallelVect,parallelValue),
                scalarMult2d(perpendicVect,perpendicValue)
            ).map(cleanVal.bind(null,5))
        }
        //console.log("COMPARE1:", getPosition(parallelComponent,perpendicComponent), offsetVect)
        //console.log("COMPARE2:", add2d(getPosition(1,0),locationVect), endLocationVect);
        let lastopacity = 1;
        let getOnSpringUpdate = function(springid) {
            return function(spring) {
                //console.log(springid+": "+spring.getCurrentValue());
                let position;
                if(springid === "parallel") {
                    position = getPosition(spring.getCurrentValue(),curvalues[1]).map(cleanVal.bind(null,5));
                    curvalues[0] = spring.getCurrentValue();
                } else if(springid === "perpendicular") {
                    position = getPosition(curvalues[0],spring.getCurrentValue()).map(cleanVal.bind(null,5));
                    curvalues[1] = spring.getCurrentValue();  
                } else {
                    throw new Error("No spring by that name!");
                }
                curvalues = curvalues.map(cleanVal.bind(null,5));
                if(endLocation.isDismiss) {
                    let newopacity = Math.min(Math.max(0,distance2d(curvalues,[1,0])),1);
                    if(newopacity<lastopacity) { lastopacity = newopacity; }
                }
                dispatch(
                    moveCard(
                        cardId,
                        sameLocations?Math.round(position[0]+100):Math.round(position[0]),
                        sameLocations?Math.round(position[1]+100):Math.round(position[1]),
                        undefined,
                        lastopacity
                    )
                );
            };
        }
        if(springingParallel) {
            springParallel.addListener({ onSpringUpdate: getOnSpringUpdate("parallel"), onSpringAtRest });
            springParallel.setCurrentValue(parallelComponent,false).setVelocity(parallelVelocity).setEndValue(1);
        }
        if(springingPerpendic) {
            springPerpendic.addListener({ onSpringUpdate: getOnSpringUpdate("perpendicular"), onSpringAtRest });
            springPerpendic.setCurrentValue(perpendicComponent,false).setVelocity(perpendicVelocity).setEndValue(0);
        }
    
        
    };
}
export function dismissCard(id) {
    return (dispatch, getState) => {
        let card = getCardById(id,getState()); ////getState().cards.cards.filter(c => c.id === id)[0];
        if(!card) { return; }
        //let locations = getState().locations.locations;
        let cardloc = getLocationById(card.locationId,getState()); //locations.filter(loc => loc.id === card.locationId)[0];
        /*let possibleDestinations = cardloc.possibleDestinations.map(dId => locations.filter(loc => loc.id === dId)[0])
            .filter(d => !d.disabled).filter(d => d.isCancel || d.isDismiss);*/
        if(!cardloc) { return; }
        let possibleDestinations = cardloc.possibleDestinations.map(dId => getLocationById(dId,getState()))
            .filter(d => d!=null).filter(d => !d.disabled).filter(d => d.isCancel || d.isDismiss);
        if(possibleDestinations.length === 0) { return }
        let chosenDestination = possibleDestinations[0];
        dispatch(transitionCard(id,chosenDestination.id));
    }  
}

export function dismissAtLocation(id) {
    return (dispatch, getState) => {
        //let cards = getState().cards.cards;
        let cardAtLocation = getCardAtLocation(id,getState());
        if(cardAtLocation && !cardAtLocation.transitioning) { dispatch(dismissCard(cardAtLocation.id)); }
        /*cards.filter(c => c.locationId === id).filter(c => !c.transitioning).forEach(c => {
            dispatch(dismissCard(c.id));    
        });*/
    }   
}

export function setCardParameters(cardparms) {
    return {
        type: SET_CARD_PARAMETERS,
        cardparms
    }
}