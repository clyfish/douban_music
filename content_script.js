(function() {
    var retry = 10
      , matchSid = window.location.href.match(/\/subject\/(\d+)/)
      , aid
      , sidSet = {}
      , remain = 0; 

    if (matchSid) {
        aid = matchSid[1];
    } else {
        return;
    }
    
    for (var i = 0; i < document.links.length; i++) {
        var link = document.links[i];
        if (link.id && link.id.match(/^song-\d+$/)) {
            var sid = link.id.split('-')[1], nextTd = link.parentNode.nextSibling;
            while (!nextTd.tagName || nextTd.tagName.toUpperCase() != 'TD') {
                nextTd = nextTd.nextSibling;
            }
            sidSet[sid] = nextTd;
            remain++;
        }
    }
    
    var tryGetAll = function tryGetAll() {
        chrome.extension.sendRequest({
            action: 'getDoubanFmInfoByAid',
            aid: aid
        }, function(data) {
            if (!data || data.r || !data.song || !data.song.length) {
                alert('getDoubanFmInfoByAid Error');
            }
            for (var i = 0; i < data.song.length; i++) {
                var song = data.song[i], download, listen;
                if (song.sid in sidSet) {
                    download = '<a href="' + song.url + '" target="_blank">下载</a>';
                    listen = '<a href="http://douban.fm/?start=' + song.sid + 'g' + song.ssid + 'g0&cid=0" target="_blank">播放</a>';
                    sidSet[song.sid].innerHTML = download + ' ' + listen;
                    delete sidSet[song.sid];
                    remain--;
                }
            }
            retry--;
            console.log('remain=' + remain + ', retry=' + retry);
            if (remain && retry) {
                tryGetAll();
            }
        });
    };
    tryGetAll();
})();