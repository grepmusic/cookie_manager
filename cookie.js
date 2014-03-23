window.onload = function () {
    var $ = function (id) { return document.getElementById(id); }
    var input_cookie = $('input_cookie'), update_cookie = $('update_cookie'), filter_cookie = $('filter_cookie'), shown_as = $('shown_as'), all_cookie = $('all_cookie');
    
    var parse_cookie = function (cookie_string, format) {
        // Set-Cookie: name=value; expires=Tue, 10-Mar-2015 16:36:24 GMT; path=/; domain=example.com secure; httponly
        var cookies = cookie_string.split("\n");
        var ret = [], is_first;
        var cookie, idx, k, v;
        
        for(var i in cookies) {
            var key_values = cookies[i].replace(/^\s+/, '').replace(/;?\s*$/, '');
            if(key_values[0] === '#' && key_values[1] === ' ')
                continue;
            key_values = key_values.replace(/^Set-Cookie:\s*/i, '').split(/;\s*/);
            is_first = true
            cookie = {}; // cookie.name, cookie.value, cookie.expirationDate, cookie.path, cookie.domain, cookie.secure, cookie.httpOnly
            for(var j in key_values) {
                idx = key_values[j].indexOf('=');
                if(idx == -1) { // secure httponly
                    v = key_values[j].toLowerCase();
                    if(v === 'httponly') {
                        cookie.httpOnly = true;
                    } else if(v === 'secure') {
                        cookie.secure = true;
                    }
                } else {
                    k = key_values[j].substr(0, idx);
                    v = key_values[j].substr(idx + 1);
                    if(is_first) {
                        cookie.name = k;
                        cookie.value = v;
                        is_first = false;
                    } else {
                        k = k.toLowerCase();
                        switch(k) {
                            case 'path':
                            case 'domain':
                                cookie[k] = v;
                                break;
                            case 'secure':
                                cookie.secure = true;
                                break;
                            case 'httponly':
                                cookie.httpOnly = true;
                                break;
                            case 'expires':
                                cookie.expirationDate = Date.parse(v) / 1000;
                                if(isNaN(cookie.expirationDate))
                                    delete cookie.expirationDate;
                                break;
                            default:
                                console.log('ignore cookie key ' + k);
                                break;
                        }
                    }
                }
            }
            if(('name' in cookie) && ('domain' in cookie)) {
                cookie.url = (cookie.secure ? 'https://' : 'http://') + cookie.domain + (cookie.path || '/');
                ret.push(cookie);
            } else {
                console.log('ignore invalid(name or domain not set) cookie ' + cookies[i]);
            }
        }
        
        return ret;
    }
    
    update_cookie.onclick = function () {
        var cookies = parse_cookie(input_cookie.value, 'HTTP');
        var current_timestamp = Math.floor( new Date().getTime() / 1000 );
        for (var i in cookies) {
            if(cookies[i].expirationDate <= current_timestamp) { // to remove the cookie
                if(cookies[i].value === '') {
                    chrome.cookies.remove({ url: cookies[i].url, name: cookies[i].name }, function (details) {
                        if(details === null) {
                            console.log('error deleting cookie: ' + chrome.runtime.lastError);
                        }
                    });
                } else {
                    console.log('try to delete cookie but the value is not empty: ' + cookies[i].value);
                }
                continue;
            }
            chrome.cookies.set(cookies[i], function (cookie) {
                if(cookie === null) {
                    console.log('error setting cookie: ' + chrome.runtime.lastError);
                }
            });
        }
        setTimeout(function () {
            filter();
            setTimeout(function () {
                filter();
            }, 1000);
        }, 1000);
    }
    
    var dump_cookies = function (cookies, as /* 1|2 */) {
        var c, v;
        var d = new Date, sep = '; ', html = [];
        if(as == 2) {
            html.push("name\tvalue\texpires\tpath\tdomain\tsecure\thttponly");
            for(var cookie in cookies) {
                cookie = cookies[cookie];
                html.push(
                    [ cookie.name, cookie.value, cookie.expirationDate, cookie.path, cookie.domain, cookie.secure, cookie.httpOnly ].join("\t") 
                );
            }
        } else {
            html.push("# name=value; expires=GMT_DATE; path=/; domain=example.com; secure; httponly");
            for(var cookie in cookies) {
                cookie = cookies[cookie];
                c = cookie.name + '=' + cookie.value;
                v = Number(cookie.expirationDate);
                if(! isNaN(v)) {
                    d.setTime(Math.floor(v * 1000));
                    c += sep + 'expires=' + d.toGMTString().replace(/(\d+) (\w+) (\d+)/, '$1-$2-$3');
                }
                if('path' in cookie) {
                    c += sep + 'path=' + cookie.path;
                }
                c += sep + 'domain=' + cookie.domain;
                if(cookie.secure === true)
                    c += sep + 'secure';
                if(cookie.httpOnly === true)
                    c += sep + 'httponly';
                html.push(c);
            }
        }
        return html.join("\n");
    }
    
    var filter = function (e) {
        // if(e.keyCode == 13) {
            chrome.cookies.getAll({}, function (cookies) {
                var filtered_cookies = [];
                for(var cookie in cookies) {
                    cookie = cookies[cookie];
                    if(cookie.domain.indexOf(filter_cookie.value) >= 0)
                        filtered_cookies.push(cookie);
                }
                document.getElementById("all_cookie").innerHTML = dump_cookies(filtered_cookies, shown_as.value);
            });
        // }
    }
    filter();
    
    filter_cookie.onkeydown = shown_as.onchange = filter;
    
    
}