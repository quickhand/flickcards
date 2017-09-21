export function add2d(v1,v2) {
    return [v1[0]+v2[0],v1[1]+v2[1]];
}

export function sub2d(v1,v2) {
    return [v1[0]-v2[0],v1[1]-v2[1]];
}

export function scalarMult2d(v1,s) {
    return [v1[0]*s,v1[1]*s];
}

export function dot2d(v1,v2) {
    return v1[0]*v2[0]+v1[1]*v2[1];
}

export function lengthSq2d(v1) {
    return dot2d(v1,v1);
}

export function length2d(v1) {
    return Math.sqrt(lengthSq2d(v1))
}

export function perpendic2d(v1) {
    return [-1*v1[1],v1[0]]
}

export function distanceSq2d(v1, v2) {
    return Math.pow(v1[0]-v2[0],2) + Math.pow(v1[1]-v2[1],2);
}

export function distance2d(v1, v2) {
    return Math.sqrt(distanceSq2d(v1, v2));
}

export function normalize2d(v1) {
    let vlength = length2d(v1);
    if(vlength === 0 ) { throw new Error("Can't normalize zero vector") }
    return scalarMult2d(v1,1/vlength);
}

export function cosineDistance2d(v1,v2) {
    return 1 - dot2d(v1,v2)/length2d(v1)/length2d(v2);
}

export function cleanVal(places,val) {
    return Math.round(val * Math.pow(10,places))/Math.pow(10,places);
}