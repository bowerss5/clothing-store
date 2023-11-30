$(document).ready(() => {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get('id');
    console.log(id);
    $('#id').text(id);
    $.ajax({
        url: `/cse383_final/final.php/getCart/?cartID=${id}`,
        method: 'GET',
        dataType: 'json',
        success: (data) => {
            if (data.status === 0) {
                $('ul').empty();
                data.cart.forEach((e) => {
                    var listItem = $('<li>').text(e.title);

                    var subtotal = $('<span>').text(`$${e.price} x ${e.quantity} = Subtotal: $${e.subtotal}`);
                    listItem.append('</br>', subtotal);
                    $('ul').append(listItem);
                });
                $('#total').text(`${data.total}`)
                $('#date').text(`${data.closed}`)
                print();
            }
            else {
                console.error('Error: ' + data.message);
            }
        },
        error: (error) => {
            console.error('Error: ' + error.statusText);
        }
    });
});