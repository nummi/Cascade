window.app = {};

// RELEASE STUFF

window.Release = Backbone.Model.extend({
  defaults: { name: 'Untitled Release' }
});

window.ReleaseList = Backbone.Collection.extend({
  model: Release
});

window.ReleaseView = Backbone.View.extend({
  className : 'release',

  events: {
    'keypress .title' : 'updateOnEnter',
    'blur     .title' : 'update'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'update', 'updateOnEnter');

    this.template   = _.template($('#release_template').html());
    this.model.view = this;
    this.model.bind('change', this.render);

    this.render();
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    this.input = $(this.el).find('.title');          
    return this;
  },

  updateOnEnter: function(e) {
    if(e.keyCode == 13) this.update();
  },

  update: function() {
    this.model.set({ name: this.input.val() });
  }
});


// FEATURE STUFF

window.Feature = Backbone.Model.extend({
  defaults: { name: 'Untitled Feature' }
});

window.FeatureList = Backbone.Collection.extend({
  model: app.Feature
});

window.AppView = Backbone.View.extend({
  el: $('#wrapper'),

  initialize: function() {
    _.bindAll(this, 'addRelease');
  },

  addRelease: function() {
    var release      = new Release()
    ,   releaseView  = new ReleaseView({model: release})
    ,   element      = $(releaseView.render().el)
    ;

    app.releaseList.add(release);
    $('#releases').append(element);

    this.positionReleases();
  },

  positionReleases: function() {
    var releases     = $(' #releases .release')
    ,   releaseCount = releases.length
    ,   width        = releases.first().outerWidth(true)
    ;

    releases.each(function(i, release) {
      var left = (i == 0 ? '0' : (width * i) + 'px');

      $(release).animate({ left: left }, 300, 'easeInOutExpo');
    });
  }
});

$(function(){
  $.extend(jQuery.easing,{
    easeInOutExpo: function (x, t, b, c, d) {
      if (t==0) return b;
      if (t==d) return b+c;
      if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
      return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
  });

  Backbone.sync = function(method, model, success, error){ success(); };

  app.releaseList = new ReleaseList();
  app.masterView  = new AppView();

  $('#add_release').click(app.masterView.addRelease);
});