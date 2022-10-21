const LRU = require('lru-cache');

const options = {
    max: 1024 * 8,
    ttl: 1000 * 60 * 5,
    allowStale: false,
    updateAgeOnGet: true,
    //updateAgeOnHas: false,
}
const cache = new LRU(options);

export {cache};
