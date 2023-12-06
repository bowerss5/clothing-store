var start = "2023-01-01";
var end = 'now';

$(document).ready(() => {
    getOrders();

    $('#startDate').on('change', (e) => {
        start = e.target.value;
        getOrders();
    });

    $('#endDate').on('change', (e) => {
        end = e.target.value;
        getOrders();
    });
});

function getOrders() {
    $.ajax({
        url: `/cse383_final/final.php/getOrders/?start=${start}&end=${end}`,
        method: 'GET',
        dataType: 'json'
    })
    .done((data) => {
        if (data.status === 0) {
            $('#orders').empty();
            data.orders.forEach((e) => {
                var row = $("<tr>").html(`
                    <th scope="row">${e.cartID}</th>
                    <td>${e.closed}</td>
                    <td>${e.quantity}</td>
                    <td>$${e.total}</td>
                    <td><a href="print.html?id=${e.cartID}" target="_blank">Print</a></td>`)
                $('#orders').append(row);
            });
        } else {
            console.error('Error: ' + data.message);
        }
    })
    .fail((error) => {
        console.error('Error: ' + error.statusText);
    });
}
