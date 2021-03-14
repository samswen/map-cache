'use strict';

module.exports = {
    setup,
    close,
    get_data,
    put_data,
    put_data2,
    del_data,
    cleanup,
    size,
};

let cache_timer_interval = 180;
const cache_data = new Map();
const cache_type_max_ages = {default: cache_timer_interval};
let cache_max_size = 1024;
let cache_timer_id = null;

function setup(max_size, type_max_ages, timer_interval) {
    if (max_size) {
        cache_max_size = max_size;
    }
    if (timer_interval) {
        cache_type_max_ages.default = timer_interval;
        cache_timer_interval = timer_interval;
    }
    if (type_max_ages) {
        for (const type in type_max_ages) {
            let max_age = type_max_ages[type];
            if (!max_age) {
                max_age = cache_timer_interval;
            }
            cache_type_max_ages[type] = max_age;
        }
    }
    cache_timer_id = setInterval(() => {
        maintain();
    }, cache_timer_interval * 1000); 
}

function size() {
    return cache_data.size;
}

function close() {
    if (cache_timer_id) {
        clearInterval(cache_timer_id);
        cache_timer_id = null;
    }
    cache_data.clear();
}

function maintain() {
    for (const [key, cache] of cache_data) {
        if (cache.expired_at <= Date.now()) {
            cache_data.delete(key);
        }
    }
}

function put_data(cache_key, data, type = 'default', ttl_ms) {
    const max_age = cache_type_max_ages[type];
    if (!max_age) {
        return false;
    }
    if (cache_data.size > cache_max_size + 256) {
        return false;
    }
    let expired_at;
    if (ttl_ms && ttl_ms < max_age * 1000) {
        expired_at = Date.now() + ttl_ms;
    } else {
        expired_at = Date.now() + max_age * 1000;
    }
    cache_data.set(cache_key, {expired_at, data});
    return true;
}

function put_data2(cache_key, data, ttl_secs) {
    if (cache_data.size > cache_max_size + 256) {
        return false;
    }
    const expired_at = Date.now() + ttl_secs * 1000;
    cache_data.set(cache_key, {expired_at, data});
    return true;
}

function get_data(cache_key) {
    const cache = cache_data.get(cache_key);
    if (!cache) {
        return null;
    }
    if (cache.expired_at < Date.now()) {
        cache_data.delete(cache_key);
        return null;
    }
    return cache.data;
}

function del_data(cache_keys) {
    let keys = null;
    if (Array.isArray(cache_keys)) {
        keys = cache_keys;
    } else {
        keys = [ cache_keys ];
    }
    for (const key of keys) {
        if (!cache_data.has(key)) {
            continue;
        }
        cache_data.delete(key);
    }
}

function cleanup() {
    cache_data.clear();
}