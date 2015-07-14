var mySwiper;
var viewportHeight;
var viewportWidth;
var fullScreenVids = [];

$(document).ready(function () {
  var loadVideoAt = window.innerHeight;
  $('.lazy').laziestloader();
  // Load video one slide prior to it coming on screen
  $('video').laziestloader({ threshold: window.innerHeight });
  function resizeListener() // Use underscore.js to throttle firing
  {
    var updateLayout = _.debounce(function(e) {
        onResize();
    }, 200); // Maximum run of once per 200 milliseconds

    // Add the event listener for resize
    window.addEventListener("resize", updateLayout, false);
  }

  function onResize()
    // Housekeeping items on event on window resizing
    {
      viewportHeight = $(window).height();
      viewportWidth = $(window).width();

      $("#history-timeline").height(viewportHeight);
      $("#history-timeline").width(viewportWidth);

      // Reload the timeline (this is quick and dirty – it shouldn't stay in production)
      var iframe = $("#history-timeline");
      iframe.src = iframe.src;
      iframe.attr( 'src', function ( i, val ) { return val; });

      fullScreenVids.forEach(function(instance) {
        _V_(instance).width(viewportWidth).height(viewportHeight);
      })
    }

  resizeListener();


  function turnActiveSlideOnTurnPrevOff(swiper)
  {
    var curr = swiper.previousIndex;
      var next = swiper.activeIndex;

      // Content opacity: Fade in/fade out
      if (curr == next) // If initial load
      {
        $(swiper.slides[curr]).animate({opacity: 1}, 3000);
      }
      else // If swipe/slide change
      {
        $(swiper.slides[curr]).animate({opacity: 0}, 1500);
        $(swiper.slides[next]).animate({opacity: 1}, 1500);
      }


    // Background audio: Fade in/fade out
    var currBgVideo = $(swiper.slides[curr]).find("video.bgvid").get(0);
    var nextBgVideo = $(swiper.slides[next]).find("video.bgvid").get(0)
    if (typeof currBgVideo != "undefined")
    {
      $(currBgVideo).animate({volume: 0}, 1500);

      setTimeout(function() {
        currBgVideo.pause();
      }, 5000)
    }
    if (typeof nextBgVideo != "undefined")
    {
      nextBgVideo.play();
      $(nextBgVideo).animate({volume: 1}, 3000);
    }

      // Pause current full-screen video (if any)
    currFullVideo = $(swiper.slides[curr]).find("div.full-screen video").attr("id");
    if (typeof currFullVideo != "undefined")
    {
      var player = videojs(currFullVideo);
      player.pause();
    }

    // Play next full-screen video (if any)
    nextFullVideo = $(swiper.slides[next]).find("div.full-screen video").attr("id");
    if (typeof nextFullVideo != "undefined")
    {
      var player = videojs(nextFullVideo);
      // Play video
      player.play();

      function Handler(e) {
          if(!e) { e = window.event; }
          swiper.slideNext();
      }
      // On end, move to next slide
      document.getElementById(nextFullVideo).addEventListener('ended', Handler, false);
    }
  }

  mySwiper = new Swiper ('#slides', {

      // Main
      direction: 'vertical',
      loop: false,
      speed: 1500,
      hashnav: true,
      slidesPerView: 1,
      longSwipes: false,  // This is to make sure user doesn't scroll through several pages

      // Pagination
      pagination: '.swiper-pagination',
      paginationClickable: true,

      // Load slides one by one
      preloadImages: false,
      lazyLoading: true,
      lazyLoadingInPrevNext: true,

      // And if we need scrollbar
      scrollbar: '.swiper-scrollbar',

      // Keyboard / Mousewheel controls
      keyboardControl:  true,
      mousewheelControl:  true,

      // Callback function, will be executed right after Swiper initialization
      onInit: function(swiper)
      {

        // Pause all video
      $("video.bgvid").animate({volume: 0}, 1); 

      // Pause all video
      $("video.bgvid").each(function() {
        $(this).get(0).pause();
      });

      // Save the IDs of all full-screen videos
      $(".video-js").each(function() 
      {
        fullScreenVids.push($(this).attr("id"));
      });
      onResize();
      turnActiveSlideOnTurnPrevOff(swiper);
      },

      onTransitionEnd: function(swiper)
      {

      },

      onTransitionStart: function(swiper)
      {
      turnActiveSlideOnTurnPrevOff(swiper);
      },
  });  


});
