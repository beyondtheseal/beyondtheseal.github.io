var mySwiper;
var viewportHeight;
var viewportWidth;
var fullScreenVids = [];

$(document).ready(function () {
  // TODO: Use a pure JS solution so we can get rid of underscore
  // Use underscore.js to throttle firing
  function resizeListener(){
    var updateLayout = _.debounce(function(e) {
        onResize();
    }, 200); // Maximum run of once per 200 milliseconds

    // Add the event listener for resize
    window.addEventListener("resize", updateLayout, false);
  }

  // Housekeeping items on event on window resizing
  function onResize(){
      viewportHeight = $(window).height();
      viewportWidth = $(window).width();

      $("#history-timeline").height(viewportHeight).width(viewportWidth);

      // Reload the timeline (this is quick and dirty – it shouldn't stay in production)
      var iframe = $("#history-timeline");
      if (iframe){
        iframe.src = iframe.src;
        iframe.attr( 'src', function ( i, val ) { return val; });
      }

      fullScreenVids.forEach(function(instance) {
        _V_(instance).width(viewportWidth).height(viewportHeight);
      })
    }

  resizeListener();


  function turnActiveSlideOnTurnPrevOff(swiper){
    var curr = swiper.previousIndex;
    var next = swiper.activeIndex;

    // Content opacity: Fade in/fade out
    // If initial load
    if (curr == next){
      $(swiper.slides[curr]).animate({opacity: 1}, 3000);
    } else {
     // If swipe/slide change
      $(swiper.slides[curr]).animate({opacity: 0}, 1500);
      $(swiper.slides[next]).animate({opacity: 1}, 1500);
    }


    // Background audio: Fade in/fade out
    var currBgVideo = $(swiper.slides[curr]).find("video.bgvid").get(0);
    var nextBgVideo = $(swiper.slides[next]).find("video.bgvid").get(0);

    if (typeof currBgVideo != "undefined") {
      $(currBgVideo).animate({volume: 0}, 1500);
      setTimeout(function() {
        currBgVideo.pause();
      }, 5000)
    }

    if (typeof nextBgVideo != "undefined") {
      nextBgVideo.play();
      $(nextBgVideo).animate({volume: 1}, 3000);
    }

    // Pause current full-screen video (if any)
    currFullVideo = $(swiper.slides[curr]).find("div.full-screen video").attr("id");
    if (typeof currFullVideo != "undefined") {
      var player = videojs(currFullVideo);
      player.pause();
    }

    // Play next full-screen video (if any)
    nextFullVideo = $(swiper.slides[next]).find("div.full-screen video").attr("id");
    if (typeof nextFullVideo != "undefined") {
      var player = videojs(nextFullVideo);
      player.play();

      function Handler(e) {
          if(!e) { e = window.event; }
          swiper.slideNext();
      }
      // On end, move to next slide
      document.getElementById(nextFullVideo).addEventListener('ended', Handler, false);
    }
  }

  function leisurelyLoad(swiper, slidesToCheck){
    var media = ["video", "img.lazy"];
    //var slidesToCheck = [$('.swiper-slide-next'), $('.swiper-slide-prev')];
    // Check to see if any of the targeted elements exist on adjacent slides
    for (i in slidesToCheck){
      for (index in media){
        var hasMedia = slidesToCheck[i].find(media[index]);
        if (hasMedia.length){
          hasMedia.attr("src", hasMedia.data("src"));
        }
      }
    }
  }

  mySwiper = new Swiper ('.swiper-container', {

      // Main
      direction: 'vertical',
      loop: false,
      speed: 300,
      hashnav: false,
      slidesPerView: 1,
      longSwipesRatio: 0.9,
      longSwipesMs: 1600,
      //pagination: '.swiper-pagination',
      //paginationClickable: true,
      preloadImages: false,
      noSwiping: true,
      //onlyExternal: true,
      nextButton: '#proceed',
      prevButton: '#retreat',
      keyboardControl: true,

      // Callback function, will be executed right after Swiper initialization
      onInit: function(swiper) {

        // Pause all video
        $("video.bgvid").animate({volume: 0}, 1);

        // Pause all video
        $("video.bgvid").each(function() {
          $(this).get(0).pause();
        });

        // Save the IDs of all full-screen videos
        $(".video-js").each(function() {
          fullScreenVids.push($(this).attr("id"));
        });

        onResize();

        turnActiveSlideOnTurnPrevOff(swiper);
        leisurelyLoad(swiper, [$('.swiper-slide-active'), $('.swiper-slide-next')]);
      },
      // was onTransitionStart
      onSlideChangeStart: function(swiper){
        turnActiveSlideOnTurnPrevOff(swiper);
      },
      onSlideChangeEnd: function(swiper){
        leisurelyLoad(swiper, [$('.swiper-slide-prev'), $('.swiper-slide-next')]);
      }
  });


});
