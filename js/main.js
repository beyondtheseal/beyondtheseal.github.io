var mySwiper;
var viewportHeight;
var viewportWidth;
var fullScreenVids = [];

var toggleMenu = function(){
      if ($("#controls").is(":visible")) {
        $("#toggle-menu").html("&laquo Menu");
      } else {
        $("#toggle-menu").html("&raquo Hide Menu");
      }
      $("#hiding-menu").toggle({
        duration: 500,
        easing: "swing"
      });
    };

$(document).ready(function() {
   $("#toggle-menu").click(toggleMenu);


  var Chapters = buildChapterNav();

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

  // Things to do when moving to a new slide
  function turnActiveSlideOnTurnPrevOff(swiper) {

    var curr = swiper.previousIndex;
    var next = swiper.activeIndex;

    //Audio fade in/fade out;
    var currBgAudio = $(swiper.slides[curr]).attr("data-bg-audio");
    var nextBgAudio = $(swiper.slides[next]).attr("data-bg-audio");

    if (typeof currBgAudio != "undefined")
    {
      console.log("Fading out " + currBgAudio);
      var sound = new Howl({
        urls: [currBgAudio],
      }).fade(1, 0, 1000);
    }

    if (typeof nextBgAudio != "undefined")
    {
      console.log("Fade in " + nextBgAudio);
      var sound = new Howl({
        urls: [nextBgAudio],
        loop: true
      }).fade(0, 1, 1000);
    }

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
  function renderVideo(targetMedium, videoId){
    function getCodec(video){
      var bits = video.split(".");
      return bits[bits.length - 1]
    }
    var videoTemplate = _.template($("#videotemplate").html());
    var firstVideo = targetMedium.data("src")[0];
    var secondVideo = targetMedium.data("src")[1];
    var classes = "video-js vjs-default-skin vjs-big-play-centered full-screen";
    if (targetMedium.hasClass("bgvid")){
      classes = "bgvid";
    }
    // Render the video player in the parent element, overwriting the div that held the video info
    $("#" + videoId).parent().html(videoTemplate({
        video_id: videoId,
        first_src: firstVideo,
        first_type: getCodec(firstVideo),
        second_src: secondVideo,
        second_type: getCodec(secondVideo),
        classes: classes
    }));
  }

  function leisurelyLoad(slidesToCheck){
    var media = ["div.videoplayer", "img.lazy"];
    // Check to see if any of the targeted elements exist on adjacent slides
    for (i in slidesToCheck){
      for (index in media){
        var targetMedium = slidesToCheck[i].find(media[index]);
        if (targetMedium.length && (targetMedium.attr("src") != targetMedium.data("src"))){
          //if it's an image
          if (index == 1) {
            targetMedium.attr("src", targetMedium.data("src")[0]);
          }

          //if it's a video
          if (index == 0){
            var videoId = targetMedium.attr("id");
            var width= window.innerWidth, height= window.innerWidth/1.9;
            var videoControls = {
              "controls": true,
              "autoplay": false,
              "loop": false,
              "preload": "auto",
              "width": width,
              "height": height,
            }

            if (targetMedium.hasClass("bgvid")) {
              videoControls["controls"]=false;
              videoControls["autoplay"]=true;
              videoControls["loop"]=false;
              

              // Handle the other content that lives in background video divs
              var extraContent = $("#" + videoId).siblings(".inner")[0].outerHTML;
            }

            renderVideo(targetMedium, videoId);
            if (extraContent) {
              $("#" + videoId).parent().append($(extraContent));
            }
            setTimeout(function(){
              // video element ID, setup options, callback
              videojs(videoId, videoControls , function(){
                if (extraContent){
                  $("#" + videoId).addClass("bgvid");
                  console.log($("#" + videoId));
                }
                console.log("loaded video: ", videoId);
              });
            }, 0);
          }
        }
      }
    }
  }

  function setUpTimeline(){
    $("#history-timeline").height(viewportHeight);
    $("#history-timeline").width(viewportWidth);
    // Reload the timeline (this is quick and dirty – it shouldn't stay in production)
    var iframe = document.getElementById("#history-timeline");
    if (iframe){
      iframe.src = iframe.src;
    }
    $( '#history-timeline' ).attr( 'src', function ( i, val ) { return val; });
  }

  function buildChapterNav(){
    // We actually have to use Javascript to freaking scroll to other slides.
    $('.chapter-nav').on("click", function(){
      var targetSlide = ($(this).data("target"));
      $(this).siblings().removeClass("current");
      $(this).addClass("current");
      mySwiper.slideTo(targetSlide, 400);
    });

    var chapters = [];
    var chapterDivs = $('.chapter-nav');
    $.each(chapterDivs, function(){
      if ($(this).data("target")){
        chapters.push($(this).data("target"));
      }
    });
    return chapters;
  };

  function highlightCurrentChapter(activeIndex, Chapters){
    $.each(Chapters, function(index){
      if ((activeIndex >= Chapters[index] && activeIndex < Chapters[index+1]) || (activeIndex >= Chapters[index] &&!(Chapters[index+1]))){
        $('#control-wrapper').find('[data-target="'+ Chapters[index] + '"]')
                             .addClass("current")
                             .siblings().removeClass("current");
      }
    });
  };


  mySwiper = new Swiper ('.swiper-container', {

      // Main
      direction: 'vertical',
      loop: false,
      speed: 300,
      hashnav: true,
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
        leisurelyLoad([$('.swiper-slide-active'), $('.swiper-slide-next')]);
      },
      // was onTransitionStart
      onSlideChangeStart: function(swiper){
        turnActiveSlideOnTurnPrevOff(swiper);
      },
      onSlideChangeEnd: function(swiper){
        leisurelyLoad([$('.swiper-slide-prev'), $('.swiper-slide-active'), $('.swiper-slide-next')]);
        highlightCurrentChapter(swiper.activeIndex, Chapters);
      }





  });

  resizeListener();
  setUpTimeline();

		var scroll_timer;
		window.addEventListener("mousewheel", onMouseWheelEvent);

		function onMouseWheelEvent(e) {
			var scroll_direction = e.wheelDelta < 0 ? 'down' : 'up';
			//console.log(scroll_direction);
			clearTimeout(scroll_timer);
			scroll_timer = setTimeout(function(){ 
				onScroll(scroll_direction)
			}, 100);
		};

		function onScroll(scroll_direction) {
			// DO SOMETHING
			if(scroll_direction == "down") {
				mySwiper.slideNext();
			} else {
				mySwiper.slidePrev();
			}
			console.log(scroll_direction);
		}
});
