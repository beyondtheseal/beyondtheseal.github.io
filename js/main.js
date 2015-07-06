var mySwiper;
var viewportHeight;
var viewportWidth;

$(document).ready(function () {
 

	function resizeListener()	// Use underscore.js to throttle firing
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

    	$("#slides .slide").css("min-height", viewportHeight);
    	_V_("full-vid-intro").width(viewportWidth).height(viewportHeight);
    	
    }

	onResize();
	resizeListener();


	function turnActiveSlideOnTurnPrevOff(swiper)
	{
		var curr = swiper.previousIndex;
	    var next = swiper.activeIndex;

	    $(swiper.slides[curr]).animate({opacity: 0}, 2000);
	    $(swiper.slides[next]).fadeTo({opacity: 1}, 2000);
    	// Content opacity: Fade in/fade out

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
			// On end, move to next slide
			document.getElementById(nextFullVideo).addEventListener('ended', Handler, false);
		    function Handler(e) 
		    {
		        if(!e) { e = window.event; }
		        swiper.slideNext();
		    }
		}
	}

	mySwiper = new Swiper ('#slides', {

	    // Main
	    direction: 'vertical',
	    loop: false,
	   	speed: 1000,
	   	hashnav: true,
	    
	    // And if we need scrollbar
	    scrollbar: '.swiper-scrollbar',

	    // Keyboard / Mousewheel controls
	    keyboardControl: 	true,
	    mousewheelControl: 	true,

	    // Callback function, will be executed right after Swiper initialization
	    onInit: function(swiper)
	    {

	    	// Pause all video
			$("video.bgvid").animate({volume: 0}, 1); 

			// Pause all video
			$("video.bgvid").each(function() {
				$(this).get(0).pause();
			})
			turnActiveSlideOnTurnPrevOff(swiper);
	    },

	    onSlideChangeEnd: function(swiper)
	    {

	    },

	    onSlideChangeStart: function(swiper)
	    {
			turnActiveSlideOnTurnPrevOff(swiper);
	    },
	});  


});