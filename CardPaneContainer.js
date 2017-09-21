import React from 'react';
import { connect } from 'react-redux';
import CardPane from './CardPane.js';
import {moveCard, transitionCard} from './actions.js';

function mapStateToProps(state,ownProps) {
    return {
        locations : state.cards.locations,
        cards: state.cards.cards,
        cardWidth: state.cards.cardparms.cardWidth,
        cardMaxHeight: state.cards.cardparms.cardMaxHeight
    }
}


// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
    return {
        /*populateList: () => dispatch(fetchJobs()),
        listenForUpdates: () => dispatch(listenForUpdates())*/
        moveCard: (id, offsetX, offsetY) => dispatch(moveCard(id, offsetX, offsetY)),
        transitionCard: (cardId, endLocationId, velocity) => 
            dispatch(transitionCard(cardId, endLocationId, velocity))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CardPane)