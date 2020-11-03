const chai = require('chai');
//const assert = chai.assert;
const expect = chai.expect;

const map_cache = require('../src');

describe('Test map_cache', () => {

    it('test case 2', async () => {
        map_cache.setup(16, {test: 1}, 0.1);
        map_cache.put_data('key1', 'value1');
        map_cache.put_data('key2', 'value2', 'test');
        expect(map_cache.size()).to.be.equal(2);
        expect(map_cache.get_data('key1')).to.be.equal('value1');
        expect(map_cache.get_data('key2')).to.be.equal('value2');
        await sleep(110);
        expect(map_cache.size()).to.be.equal(1);
        expect(map_cache.get_data('key1')).to.be.equal(null);
        expect(map_cache.get_data('key2')).to.be.equal('value2');
    });

    after(async ()=> {
        map_cache.close();
    });

});

function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
