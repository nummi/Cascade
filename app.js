window.app = {};

window.Release = Backbone.Model.extend({
  defaults   : { name: 'Untitled Release' },
  initialize : function() {
    this.features = new FeatureCollection();
  }
});

window.ReleaseCollection = Backbone.Collection.extend({
  model: Release
});

window.ReleaseView = Backbone.View.extend({
  className : 'release',

  events: {
    'keypress .title'  : 'updateOnEnter',
    'blur     .title'  : 'update',
    'click    .footer' : 'addFeature'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'update', 'updateOnEnter', 'addFeature');

    this.template   = _.template($('#release_template').html());
    this.model.view = this;

    this.render();
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()));
    this.input = $(this.el).find('.title');
    return this;
  },

  updateOnEnter : function(e) { if(e.keyCode == 13) this.input.blur(); },
  update        : function(e) {
    var previousValue = this.model.get('name')
    ,   newValue      = this.input.val()
    ;

    if(newValue == '' || newValue == previousValue) {
      this.input.val(this.model.get('name'));
      return;
    }

    this.model.set({ name: newValue });
  },

  addFeature: function() {
    var feature     = this.model.features.create({})
    ,   featureView = new FeatureView({model: feature})

    $(this.el).find('.features').append(featureView.render().el);
  }
});


window.Feature = Backbone.Model.extend({
  defaults: { name: 'Untitled Feature' },
});

window.FeatureView = Backbone.View.extend({
  className: 'feature',

  events: {
    'click .delete_feature' : 'eradicate',
  },

  initialize: function() {
    _.bindAll(this, 'render', 'eradicate');

    this.template  = _.template($('#feature_template').html());
    this.model.view = this;
    this.model.bind('change', this.render);

    this.render();
  },

  render: function() {
    $(this.el).html(this.template(this.model.toJSON()))
              .attr('draggable', true);
    return this;
  },

  eradicate: function() {
    var self = this;
    $(this.el).slideUp(100, function() {
      self.remove();
      self.model.destroy();
    });
  }
});

window.FeatureCollection = Backbone.Collection.extend({
  model: Feature
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

  $('#icebox').hover(function() {
    $(this).addClass('hover');
  }, function() {
    $(this).removeClass('hover');
  });


  window.ReleasesView = Backbone.View.extend({
    el: $('#releases'),

    initialize: function() {
      _.bindAll(this, 'addRelease');
      app.mainReleaseCollection = new ReleaseCollection();
    },

    addRelease: function() {
      var release      = app.mainReleaseCollection.create({})
      ,   releaseView  = new ReleaseView({model: release})
      ,   element      = $(releaseView.render().el)
      ;

      $(this.el).append(element);
      releaseView.input.focus();

      this.positionReleases();
    },

    positionReleases: function() {
      var $releases     = $(this.el).find('.release')
      ,   releaseCount  = $releases.length
      ,   width         = $releases.first().outerWidth(true)
      ;

      $releases.each(function(i, release) {
        var left = (i == 0 ? '0' : (width * i) + 'px');
        $(release).animate({ left: left }, 300, 'easeInOutExpo');
      });
    }
  });

  app.mainReleasesView  = new ReleasesView();

  $('#add_release').click(app.mainReleasesView.addRelease);
});
