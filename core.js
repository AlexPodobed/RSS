// CONSTANTS
var _API = 'http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=';
var _RSS_LIST = {
    "CNN": "http://rss.cnn.com/rss/cnn_topstories.rss",
    "Hacker News": "http://news.ycombinator.com/rss",
    "Mashable": "http://feeds2.feedburner.com/Mashable",
    "Huffington Post": "http://feeds.huffingtonpost.com/huffingtonpost/raw_feed",
    "TechCrunch": "http://feeds.feedburner.com/TechCrunch"
};

function RSS(name) {
    this.name = name;
    this.url = _RSS_LIST[name];
    this.feed = {};
    this.isRendered = false;

    if (RSS.instance[name]) {
        RSS.instance[name].isRendered =  true;
        return RSS.instance[name];
    } else {
        RSS.instance[name] = this;
    }

    return this;
}
RSS.instance = {};
RSS.prototype.fetchFeed = function () {
    return $.getJSON(_API + this.url)
};
RSS.prototype.getFeed = function (callback) {
    var savedFeed = localStorage.getItem(this.name),
        context = this;

    if (savedFeed) {
        this.feed = JSON.parse(savedFeed)
        callback();
    } else {
        this.fetchFeed()
            .done(function (data) {
                var feed = data.responseData.feed;
                context.feed = feed;
                localStorage.setItem(context.name, JSON.stringify(feed));
                callback();
            });
    }
};
RSS.prototype.createView = function () {
    var view = ViewMaker.factory({
        type: this.name.replace(/\W/g,''),
        feed: this.feed,
        isRendered: this.isRendered
    });
    view.render();
};
RSS.prototype.init = function () {
    this.getFeed(this.createView.bind(this))
};
RSS.prototype.refresh = function(){
    localStorage.removeItem(this.name);
    RSS.instance[this.name].isRendered =  false;
    this.init();
};

function ViewMaker(){
    this.$node = $('body');
    this.index =  0;
}

ViewMaker.prototype.render = function(){
    console.log(this.config.feed)

    var feed = this.config.feed;
    var template = this.$node.find('#' + this.templateId).html();

    if (!this.config.isRendered){
        console.log('rendered')
        Mustache.parse(template);
        feed.increaseIndex = function(){
            this.index += 1;
        }.bind(this);
        feed.getIndex = function(){
            return this.index;
        }.bind(this);
        feed.clearFix = function(){
            if(this.index%2 === 0){
                return "<div class='clearfix'></div>"
            }
        }.bind(this);
        var renderedHtml = Mustache.render(template, this.config.feed);
        this.$node.find('#'+this.config.type).html(renderedHtml);
    }
};
ViewMaker.factory = function(config){
    var constr = config.type,
        newview;

    if(typeof ViewMaker[constr].prototype.render !== 'function'){
        ViewMaker[constr].prototype = new ViewMaker();
    }
    ViewMaker[constr].prototype.config = config;

    newview = new ViewMaker[constr]();

    return newview;
};

ViewMaker.CNN = function() {
    this.templateId = 'CNN_template';
};
ViewMaker.HackerNews = function() {
    this.templateId = 'Hacker_template';
};
ViewMaker.Mashable = function() {
    this.templateId = 'Mashable_template';
};
ViewMaker.HuffingtonPost = function() {
    this.templateId = 'Huffington_template';
};
ViewMaker.TechCrunch = function() {
    this.templateId = 'TechCrunch_template';
};

$('#menu').on('click', 'li', function(e){
    var name = $(this).find('a').data('rss'),
        rss;

    if(e.target.tagName ==='A'){
        rss = new RSS(name);
        rss.init();
    }else if(e.target.tagName ==='SPAN'){
        rss = new RSS(name);
        rss.refresh();
    }
});