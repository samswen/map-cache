'use strict';

module.exports = {
    setup,
    close,
    get_data,
    put_data,
    del_data,
    cleanup,
    size,
};

let cache_timer_interval = 180;
const cache_data = new Map();
const cache_type_max_ages = {default: cache_timer_interval};
let cache_types = ['default'];
let cache_max_size = 1024;
let cache_timer_id = null;

function setup(max_size, type_max_ages, timer_interval) {
    if (max_size) {
        cache_max_size = max_size;
    }
    if (type_max_ages) {
        for (const type in type_max_ages) {
            let max_age = type_max_ages[type];
            if (max_age === null) {
                max_age = null;
            } else if (typeof max_age !== 'number') {
                if (!isNaN(max_age)) {
                    max_age = Number(max_age);
                } else {
                    max_age = null;
                }
            }
            cache_type_max_ages[type] = max_age;
        }
    }
    cache_types = Object.keys(cache_type_max_ages);
    if (timer_interval) {
        cache_type_max_ages.default = timer_interval;
        cache_timer_interval = timer_interval;
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
    const now_ms = new Date().getTime();
    for (const [key, cache] of cache_data) {
        const max_age = cache_type_max_ages[cache.type];
        if (max_age === null) {
            continue;
        }
        if (now_ms - cache.created_at >= max_age * 1000) {
            cache_data.delete(key);
            continue;
        }
    }
}

function put_data(cache_key, data, type = 'default', ttl_ms) {
    if (cache_data.size >= cache_max_size) {
        return false;
    }
    if (!cache_types.includes(type)) {
        return false;
    }
    let created_at = new Date().getTime();
    const max_age = cache_type_max_ages[type];
    if (ttl_ms && max_age && ttl_ms < max_age * 1000) {
        created_at -= max_age * 1000 - ttl_ms;
    }
    cache_data.set(cache_key, {created_at, data, type});
    return true;
}

function get_data(cache_key) {
    const cache = cache_data.get(cache_key);
    if (!cache) {
        return null;
    }
    if (!cache.created_at || !cache.data || !cache.type) {
        cache_data.delete(cache_key);
        return null;
    }
    const max_age = cache_type_max_ages[cache.type];
    if (max_age === null) {
        return cache.data;
    }
    const now_ms = new Date().getTime();
    if (now_ms - cache.created_at > max_age * 1000) {
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