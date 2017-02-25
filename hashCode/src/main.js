const fs = require('fs');

readInput()
    .then(main)


let cacheMap = {};
let videoMap = {};
let endpointMap = {};

function getCache(id) {
    return cacheMap[id];
}
function getVideo(id) {
    return videoMap[id]
}
function getEndpoint(id) {
    return endpointMap[id]
}

function readInput() {
    return new Promise((resolve) => {
            fs.readFile('./Input/qwe', "UTF-8", (err, data) => {
            const c = data
                .toString()
                .replace(/\r?\n|\r/g, ' ')
                .split(" ")
                .map(parseFloat);
            resolve(c);
        });
    });
}
function computeScore() {
    let result = 0;
    let uberTotalNumberOfRequests = 0;
    Object.keys(endpointMap).forEach((key) => {
        const endpoint = getEndpoint(key);
        const latTocenter = endpoint.latencyToDatacenter;
        Object.keys(endpoint.requests).forEach((videoId) => {
            uberTotalNumberOfRequests += endpoint.requests[videoId]
            let lowestLatency = endpoint.latencyToDatacenter;
            Object.keys(endpoint.connectedCaches).forEach((cacheId) => {
                const cache = getCache(cacheId);
                if (cache.videosInside.filter(item => item === videoId).length) {
                    if (endpoint.connectedCaches[cacheId] < lowestLatency) {
                        lowestLatency = endpoint.connectedCaches[cacheId];
                    }
                }
            })
            result += endpoint.requests[videoId] * (latTocenter - lowestLatency);
        })
    })
    return (result * 1000) / uberTotalNumberOfRequests;
}

function putVideoToCache(cacheId, videoId) {
    const cache = getCache(cacheId);
    const video = getVideo(videoId);

    if (cache.videosInside.filter(id => id === videoId).length) {
        throw new Error("VIDEO JUZ JEST W SRODKU !!!")
        return
    }
    if (cache.capacity < video.size) {
        throw new Error("VIDEO JEST ZA DUZE")
        return
    }
    cache.capacity -= video.size
    cache.videosInside.push(videoId.toString())
}

function main(input) {
    const getNext = ((input) => {
        let i = 0;
        return function () {
            return input[i++];
        }
    })(input);
    const numberOfVideos = getNext();
    const numberOfEndpoints = getNext();
    const numberOfRequestDescriptors = getNext();
    const numberOfCaches = getNext();
    const eachCacheCapacity = getNext();

    cacheMap = {}
    for (let i = 0; i < numberOfCaches; i++) {
        cacheMap[i] = {
            capacity: eachCacheCapacity,
            videosInside: []
        }
    }
    videoMap = {};
    endpointMap = {};
    for (let i = 0; i < numberOfVideos; i++) {
        videoMap[i] = {
            size: getNext()
        }
    }

    for (let i = 0; i < numberOfEndpoints; i++) {
        endpointMap[i] = {
            latencyToDatacenter: getNext(),
            connectedCaches: {},
            requests: {}
        }
        let x = getNext();
        for (let j = 0; j < x; j++) {
            endpointMap[i].connectedCaches[getNext()] = getNext();
        }
    }

    for (let i = 0; i < numberOfRequestDescriptors; i++) {
        let a = getNext();
        let b = getNext();
        let c = getNext();
        endpointMap[b].requests[a] = c;
    }

    console.log('videos \n', videoMap)
    console.log('endpointMap \n', endpointMap)
    console.log('cacheMap \n', cacheMap)


    console.log('computedScore', computeScore());
}

