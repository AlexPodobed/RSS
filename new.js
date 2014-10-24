
function RSSBridge(){
    var rssName = $(this).data('rss');
    var rss = new RSS(rssName);
    rss.init();
}

$('ul').on('click', 'li', RSSBridge);