const chai = require('chai');
//const assert = chai.assert;
const expect = chai.expect;

const map_cache = require('../src');

describe('Test map_cache', () => {

    it('test case 3', async () => {
        map_cache.setup(16, {test: 1}, 0.1);
        map_cache.put_data('key1', 'value1');
        expect(map_cache.size()).to.be.equal(1);
        expect(map_cache.get_data('key1')).to.be.equal('value1');
        map_cache.del_data('key1');
        expect(map_cache.size()).to.be.equal(0);
        expect(map_cache.get_data('key1')).to.be.equal(null);
    });

    after(async ()=> {
        map_cache.close();
    });

});

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
