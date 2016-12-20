/**
 * @preserve This SDK is licensed under the MIT license (MIT)
 * Copyright (c) 2015- Applied Technologies Internet SAS (registration number B 403 261 258 - Trade and Companies Register of Bordeaux – France)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * */

videojs.plugin('atinternet', function (options) {
    var _player = this,
        _options = options || {},
        _tag,
        _oldState = 'idle',
        _queue = [],
        _playerId = Math.floor(Math.random() * 10e9),
        _metaData = {},
        _isEmbedded = _checkEmbeddedMode(),
        _isSmartTagReady = false,
        _isEmpty = false,
        _isAlreadyStopped = false;

    var trigger = (function () {
        var _tagRdy,
            _metaRdy;

        function setSmartTagRdy() {
            if (_tagRdy && _metaRdy) {
                _isSmartTagReady = true;
                _tag.richMedia.add(_metaData);
                _emptyHitQueue();
            } else {
                _isSmartTagReady = false;
            }
        }

        return {
            setTagRdy: function (b) {
                _tagRdy = b;
                setSmartTagRdy();
            },
            setMetaRdy: function (b) {
                _metaRdy = b;
                setSmartTagRdy();
            }
        };
    })();

    function _init() {
        var tagConfig = {
            site: _options.site,
            log: _options.log,
            logSSL: _options.logSSL
        };
        if (typeof ATInternet === 'undefined' || (typeof ATInternet !== 'undefined' && !ATInternet.Tracker)) {
            _loadScript("https://s3-eu-west-1.amazonaws.com/tag-miscs-dev/smarttag.js", function () {
                _tag = new ATInternet.Tracker.Tag(tagConfig);
                trigger.setTagRdy(true);
            })
        } else {
            _tag = new ATInternet.Tracker.Tag(tagConfig);
            trigger.setTagRdy(true);
        }

        _player.ready(function () {
            _player.on("loadedmetadata", _fillMediaData);
            _player.on("ended", _stateChange);
            _player.on("pause", _stateChange);
            _player.on("waiting", _stateChange);
            _player.on("playing", _stateChange);
            _player.one("seeking", _seekEvent); // _player.one will trigger only one time the callback and then will delete the listener
            _player.on("emptied", _playlistMediaChanged);
        });

    }
    function _playlistMediaChanged() {
        if (!_isAlreadyStopped) {
            _sendHit('stop');
        }
        _isEmpty = true;
        trigger.setMetaRdy(false);
    }
    function _fillMediaData() {
        _metaData = {
            mediaType: 'video',
            playerId: _playerId,
            mediaLevel2: _options.level2 || 0,
            mediaLabel: _player.mediainfo.id + '_' + _player.mediainfo.name,
            refreshDuration: _options.refreshDuration || '5',
            duration: Math.round(_player.mediainfo.duration),
            isEmbedded: _isEmbedded,
            broadcastMode: _options.broadcastMode || 'clip',
            webdomain: _isEmbedded ? window.location.host : undefined
        };
        trigger.setMetaRdy(true);
    }
    function _seekEvent() {
        _sendHit('move');
        setTimeout(function () {
            _player.one("seeking", _seekEvent);
        }, 1000);
    }
    function _stateChange(event) {
        var oldState = _oldState || '',
            newState = event.type;
        switch (oldState + newState) {
            case 'idlewaiting':
                _sendHit('play', true);
                break;
            case 'idleplaying':
            case 'pauseplaying':
                _sendHit('play', false);
                break;
            case 'playingpause':
                _sendHit('pause');
                break;
            case 'playingended':
            case 'pauseended':
                _sendHit('stop');
                break;
            case 'endedplaying':
                _sendHit('play');
                _isEmpty = false;
                break;
            case 'endedwaiting':
                _sendHit('play', true);
                _isEmpty = false;
                break;
            case 'playingwaiting':
                if (_isEmpty) {
                    _sendHit('play', true);
                    _isEmpty = false;
                } else {
                    _sendHit('info', true);
                }
                break;
            case 'pausewaiting':
                _sendHit('play', true);
                break;
            case 'waitingpause':
                _sendHit('pause');
                break;
            case 'waitingplaying':
                _sendHit('info', false);
                break;
            default:
                break;
        }
        _oldState = newState;
    }
    function _sendHit(action, buffering) {
        _queue.push({
            action: action,
            playerId: _playerId,
            isBuffering: typeof buffering !== 'undefined' ? buffering : undefined
        });
        if (action === 'play') {
            _isAlreadyStopped = false;
        }
        if (action === 'stop' && !_isAlreadyStopped) {
            _isAlreadyStopped = true;
        }
        if (_isSmartTagReady) {
            _emptyHitQueue();
        }
    }
    function _emptyHitQueue() {
        var i = _queue.length - 1;
        for (i; i >= 0; i--) {
            var hit = _queue.shift();
            hit.mediaLabel = _metaData.mediaLabel;
            _tag.richMedia.send(hit);
        }
    }
    function _checkEmbeddedMode() {
        if (_options.internalDomains instanceof Array) {
            var length = _options.internalDomains.length;
            for (var i = 0; i < length; i++) {
                if (window.location.host.indexOf(_options.internalDomains[i]) >= 0) {
                    return false;
                }
            }
            return true;
        } else {
            return _options.isEmbedded || false;
        }
    }
    function _loadScript(url, callback) {
        var newScript;
        callback = callback || function () {
            };

        var errorCallback = function () {
            newScript.onload = newScript.onreadystatechange = newScript.onerror = null;
        };
        var onloadCallback = function (event) {
            event = event || window.event;
            if (event.type === "load" || (/loaded|complete/.test(newScript.readyState) && (!document.documentMode || document.documentMode < 9))) {
                newScript.onload = newScript.onreadystatechange = newScript.onerror = null;
                callback(event);
            }
        };
        newScript = document.createElement("script");
        newScript.type = "text/javascript";
        newScript.src = url;
        newScript.async = false;
        newScript.defer = false;
        newScript.onload = newScript.onreadystatechange = onloadCallback;
        newScript.onerror = errorCallback;
        var head = document.head || document.getElementsByTagName("head")[0];
        head.insertBefore(newScript, head.lastChild);
    }

    _init();
});