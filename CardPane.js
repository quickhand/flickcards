import React from 'react';
import FlickCard from './FlickCard.js';
import {getBestDestination } from './utils.js';
import { throttle } from 'lodash';

export default (props) => {
    const getLocation = function(id) {
        let location;
        let loclength = props.locations.length
        for(var i=0;i<loclength;i++) {
            var curloc = props.locations[i];
            if(curloc.id === id) {
                location = curloc;
                return location;
            }    //= props.locations.filter(loc => loc.id === card.locationId)[0];
        }
        return null;
    }
    const handleDragStart = function(card, e, data) {
        
    }
    const handleDragEnd = function(card, e, data, velocity) {
        
        let cardloc = getLocation(card.locationId);
       
        
        if(!cardloc.xFreedom && !cardloc.yFreedom) { return }
        let newVelocity = [cardloc.xFreedom?velocity[0]:0,cardloc.yFreedom?velocity[1]:0];
        let candidates = props.locations.filter(loc => cardloc.possibleDestinations.indexOf(loc.id) !== -1);
        let destinationId = getBestDestination(cardloc,candidates,card.positionOffset,newVelocity);
        props.transitionCard(card.id, destinationId, newVelocity);
    }
    const handleDrag = throttle(function(card, e, data) {
        let cardloc = getLocation(card.locationId);
        
        if(!cardloc.xFreedom && !cardloc.yFreedom) { return }
        props.moveCard(card.id,
            card.positionOffset[0]+(cardloc.xFreedom?data.deltaX:0),
            card.positionOffset[1]+(cardloc.yFreedom?data.deltaY:0));
    },100,{leading:true,trailing:false});
    return <aside
        style={{
            position: 'fixed',
            width: '100vw',
            height: '100%',
            top: 0,
            left: 0,
            zIndex:100,
            pointerEvents: 'none'
        }}>
        {
            props.cards.filter((card) => {
                let retval = true;
                if(card.locationId!=null) {
                    let curlocation = getLocation(card.locationId); 
                    retval = !curlocation.disabled;
                } 
                return retval;
            }).map((card) => {        
                let calcX = 0, calcY = 0;
                if(card.locationId!=null) {
                    let curlocation = props.locations.filter(location => location.id === card.locationId)[0];
                    calcX = curlocation.xPosition + card.positionOffset[0];
                    calcY = curlocation.yPosition + card.positionOffset[1];   
                }

                return <FlickCard 
                    key={"flickcard_"+card.id}
                    content={card.content}
                    title={card.title}
                    opacity={card.opacity}
                    icon={card.icon}
                    cardWidth={props.cardWidth}
                    cardMaxHeight={props.cardMaxHeight}
                    id ={card.id}
                    x={calcX}
                    y={calcY}
                    onDragStart={handleDragStart.bind(this,card)}
                    onDragEnd={handleDragEnd.bind(this,card)}
                    onDrag={handleDrag.bind(this,card)}
                />
            })
        }
    </aside>
}