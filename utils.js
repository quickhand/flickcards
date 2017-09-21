import {add2d, sub2d, scalarMult2d, dot2d, lengthSq2d, length2d, perpendic2d, distanceSq2d, distance2d, normalize2d, cosineDistance2d, cleanVal} from './vector2d.js';
import uuid from 'uuid';

export function getCardById(id,state) {
    var cards = state.cards.cards;
    var cardslength =cards.length;
    for(var i=0;i<cardslength;i++) {
        var curcard = cards[i];
        if(curcard.id === id) {
            return curcard;
        }
    }
    return null;
}

export function getBestDestination(location,candidates,offsets,velocity = [0,0]) {
    let retval = location.id;
    let originPosition = [location.xPosition, location.yPosition];
    let offsetVector = offsets;
    let filteredCandidates = candidates.filter(c => !c.disabled);
    let velocityVector = velocity;
    let cardPosition;
    if(JSON.stringify(velocity) === JSON.stringify([0,0])) {
        cardPosition = add2d(originPosition, offsetVector).map(cleanVal.bind(null,5)); 
    } else {
        const sign = function(val) {
            let retval = 0;
            if(val<0) {
                retval = -1;
            } else if(val>0) {
                retval = 1;
            }
            return retval;
        }
        const MU = 0.02;
        const G = 9.8 * 39.37 * 72;
        const MUG = MU*G;
        let finalPos = [offsetVector[0] + sign(velocityVector[0])* 0.5 * Math.pow(velocityVector[0],2)/MUG,
            offsetVector[1] + sign(velocityVector[1])* 0.5 * Math.pow(velocityVector[1],2)/MUG]
        cardPosition = add2d(originPosition, finalPos).map(cleanVal.bind(null,5));
        filteredCandidates = [location,...filteredCandidates];
    }

    let candidateVectors = filteredCandidates.map(c => [c.xPosition,c.yPosition].map(cleanVal.bind(null,5)));
    let candidateDistances = candidateVectors.map(c => distance2d(c, cardPosition));
    let chosenIdx = candidateDistances.indexOf(Math.min(...candidateDistances));
    let originToDestination = sub2d(candidateVectors[chosenIdx], originPosition).map(cleanVal.bind(null,5));
    let originToDestinationUnit;
    try {
        originToDestinationUnit = normalize2d(originToDestination).map(cleanVal.bind(null,5)); 
    } catch(e) {
        return retval;
    }
    
    //MORE THAN HALF WAY THERE
    //console.log("WAYTHERE: " + dot2d(offsetVector, originToDestinationUnit)/length2d(originToDestination),sub2d(candidateVectors[chosenIdx], originPosition))
    if(dot2d(offsetVector, originToDestinationUnit)/length2d(originToDestination) >= 0.1) {
        retval = filteredCandidates[chosenIdx].id;
    }
  
    return retval;
}

export function getLocationById(id,state) {
    var locations = state.cards.locations;
    var locationslength =locations.length;
    for(var i=0;i<locationslength;i++) {
        var curlocation = locations[i];
        if(curlocation.id === id) {
            return curlocation;
        }
    }
    return null;
}
export function getCardAtLocation(id,state) {
    var cards = state.cards.cards;
    var cardslength =cards.length;
    for(var i=0;i<cardslength;i++) {
        var curcard = cards[i];
        if(curcard.locationId === id) {
            return curcard;
        }
    }
    return null;
}


export function findCard(id,cards) {
    var cardlen = cards.length
    for(var i=0;i<cardlen;i++) {
        if(cards[i].id === id) {
            return cards[i];
        }
    }
    return null;
}