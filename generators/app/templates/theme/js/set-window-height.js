(function($) {

  var window_height = $( window ).height();
  var header_height = $('.site-header').height();

  if (isNaN(parseInt(header_height))) header_height = 0;

  $('.window-height').css('min-height', window_height - header_height);
  $('.half-window-height').css('min-height', (window_height-header_height)/2);

})(jQuery);
