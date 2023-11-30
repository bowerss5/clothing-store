$(document).ready(function() {
    // Add a click event handler to elements with class "cart"
    $('.cart').click(function() {
      // Show the Bootstrap modal
      $('#cartModal').modal('show');
    });
  });