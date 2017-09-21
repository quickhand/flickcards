import React from 'react';
import { connect } from 'react-redux'
import { dismissCard } from './actions.js';
import { DraggableCore } from 'react-draggable';


class FlickCard extends React.Component {
    constructor(...args) {
        super(...args);
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
    }
    
    handleDragStart(e, data) {
        this.lasttime = null;
        this.velocity = [0,0];
        if(this.props.onDragStart) { this.props.onDragStart(e, data, this.velocity) }
    }
    
    handleDragEnd(e, data) {
        if(this.props.onDragEnd) { this.props.onDragEnd(e, data, this.velocity) }
        this.velocity = [0,0];
    }
    
    handleDrag(e, data) {
        this.velocity = [0,0];
        if(typeof this.lasttime != "undefined" && this.lasttime != null) {
            let deltaT = Date.now() - this.lasttime;
            this.velocity = [data.deltaX/deltaT*1000,data.deltaY/deltaT*1000];
        }
        this.lasttime = Date.now();
        if(this.props.onDrag) { this.props.onDrag(e, data, this.velocity) }
    }
    getTransformString(theprops) {
        return "translate("+(theprops.x)+"px,"+(theprops.y)+"px)"
    }
    /*shouldComponentUpdate(nextProps, nextState) {
        this.refs.card.style.transform = this.getTransformString(nextProps);
        this.refs.card.style.width = this.props.width+"px",
        this.refs.card.style.opacity = nextProps.opacity;
        return false;
        ref="card"
    }*/
    render() {
        const props = this.props;
        
        return <DraggableCore
                onStart={this.handleDragStart.bind(this)}
                onStop={this.handleDragEnd.bind(this)}
                onDrag={this.handleDrag.bind(this)}
            >
                <div  className="mdl-card mdl-shadow--2dp flickcard" style={{
                    width: props.cardWidth + "px",
                    position:"absolute",
                    left:0,
                    top:0,
                    transform:this.getTransformString(props),
                    pointerEvents:'all',
                    opacity: props.opacity,
                    willChange: 'transform, opacity',
                    maxHeight: props.cardMaxHeight + "px"
                }}>
                    <div className="mdl-card__title">
                        <i className="material-icons info">{props.icon}</i> {props.title}
                    </div>
                    <div className="mdl-card__supporting-text scrollable">
                        {this.props.content}
                    </div>
                    <div className="mdl-card__actions">
                        <div className="padder">
                            <a className="mdl-button--accent mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" onClick={() => this.props.dismissCard(this.props.id)}>Dismiss</a>
                        </div>
                    </div>
                </div>
            </DraggableCore>
    }
}



function mapStateToProps(state) {
    return { }
}

function mapDispatchToProps(dispatch) {
    return {
        dismissCard: (id) => dispatch(dismissCard(id))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(FlickCard)