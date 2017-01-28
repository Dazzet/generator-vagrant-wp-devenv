//
// En el menu principal se encarga de adicional la flecha que muestra que hay sub-itmes
// y tambien muestra/esconde los subitems
// Depende que la hoja de estilos tenga las clase 'open' para los items que tengan
// sub-items
(function($) {

  // Creamos un checkbox con label para mostrar/esconder el menu
  var label_toggle = $('<label />', {
    'for': 'menu-toggle',
    'class' : 'menu-toggle'
  });

  var checkbox_toggle = $( '<input />', {
    'type': 'checkbox',
    'id': 'menu-toggle',
    'class' : 'menu-toggle'
    } );

  // Agregamos el checkbox al dom
  $('.nav-primary').before(label_toggle).before(checkbox_toggle);

  // MOstrar esconder sub-menus
  $('.nav-primary .menu-item-has-children').on('click', function(event) {
    $(this).toggleClass('open');
  })

  // Hacemos un scrollTo a TOP para que el usuario si vea el menu
  $('#menu-toggle').on('click', function() {
    $.scrollTo('body', {duration: 800});
  });

})(jQuery);
