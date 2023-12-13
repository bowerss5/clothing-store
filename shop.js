// Sam Bowers CSE 383-D Final

var products = {};
var category = "%25";
var subcategory = "%25";
var cart;
var sort = "";
var priceMin = 0;
var priceMax = 10000;
var asc = true;

$(document).ready(() => {
    getCategories();
    getProducts();

    $('#categories').on('change', function () {
        category = $(this).val();
        getSubCategories();
        getProducts();
        console.log('Selected Category:', category);
    });

    $('#subcategories').on('change', function () {
        subcategory = $(this).val();
        console.log('Selected Sub-Category:', category);
        getProducts();
    });

    $('#sort').on('change', function () {
        sort = $(this).val();
        getProducts();
    });

    $("#min-price, #max-price").on("input", () => {
        priceMax = $("#max-price").val();
        priceMin = $("#min-price").val();

        // Handle default values
        priceMin = priceMin === '' ? 0 : priceMin;
        priceMax = priceMax === '' ? 10000 : priceMax;

        console.log(priceMin, priceMax);
        getProducts();
    });

    $(".close").click(() => {
        console.log("Close");
        $('#cartModal').modal('hide');
    });

    $(".purchase").click(() => {
        $("#cartForm").submit();
    });

    $("#cartForm").submit((e) => {
        e.preventDefault();
        closeCart();
    });

    $('input[name="method"]').change(function () {
        if ($(this).val() === 'card') {
            // Disable the amount field and set its value to be the same as the total field
            $('#amount').prop('disabled', true).val($('#total').val().substring(1));
        } else {
            // Enable the amount field
            $('#amount').prop('disabled', false).val('');
        }
    });
});

function closeCart() {
    console.log("Submit");
    $.ajax({
        url: `/cse383_final/final.php/closeCart/?cartID=${cart}&amount=${$("#amount").val()}&method=${parseFloat($('input[name="method"]:checked').val())}`,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            if (data.status === 0) {
                // API call successful
                $('#cartModal').modal('hide');
                alert(`Successfully closed cart\n\nYour change is: $${data.change}`);
                location.reload();
                // cart = undefined;
            } else {
                alert(data.message);
            }
        })
        .fail(function (error) {
            console.error('Error: ' + error.statusText);
        });
}

function getSubCategories() {
    var api = `/cse383_final/final.php/getSubCategories/?category=${category}`;
    $.ajax({
        url: api,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            if (data.status === 0) {
                // API call successful
                subcategories = data.result;

                $('#subcategories').empty();
                $('#subcategories').append($('<option value="%25" selected>All Sub-Categories</option>'));
                subcategories.forEach((s) => {
                    $('#subcategories').append($('<option>', {
                        value: s.subcategory,
                        text: s.subcategory
                    }));
                });
            } else {
                console.error('Error: ' + data.message);
            }
        })
        .fail(function (error) {
            console.error('Error: ' + error.statusText);
        });
}

function getCategories() {
    var apiEndpoint = '/cse383_final/final.php/getCategories';
    $.ajax({
        url: apiEndpoint,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            if (data.status === 0) {
                // API call successful
                categories = data.result;

                $('#categories').trigger('change');

                categories.forEach((c) => {

                    $('#categories').append($('<option>', {
                        value: c.category,
                        text: c.category
                    }));
                });
            } else {
                console.error('Error: ' + data.message);
            }
        })
        .fail(function (error) {
            console.error('Error: ' + error.statusText);
        });
}

function compareProducts(e1, e2) {
    if (sort == "price") { // Asscending price
        return parseFloat(e1.price) - parseFloat(e2.price);
    } else if (sort == "-price") { // Descending price
        return parseFloat(e2.price) - parseFloat(e1.price);
    }
    // Default to category
    let compare = e1.category.toLowerCase().localeCompare(e2.category.toLowerCase());
    if (compare != 0) {
        return compare;
    }
    return e1.subcategory.toLowerCase().localeCompare(e2.subcategory.toLowerCase());
}

function getProducts() {
    $("#cart-alert").hide();
    var apiEndpoint = `/cse383_final/final.php/getProduct?category=${category}&subcategory=${subcategory}&id=0`;
    $.ajax({
        url: apiEndpoint,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            if (data.status === 0) {
                // API call successful
                products = data.result.filter((e) => (parseFloat(e.price) >= priceMin && parseFloat(e.price) <= priceMax)).sort((e1, e2) => compareProducts(e1, e2));
                renderProducts();
            } else {
                console.error('Error: ' + data.message);
            }
        })
        .fail(function (error) {
            console.error('Error: ' + error.statusText);
        });
}

function getCart() {
    $.ajax({
        url: `/cse383_final/final.php/getCart/?cartID=${cart}`,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            if (data.status === 0) {
                $('#cartModal .modal-body ul').empty();
                data.cart.forEach((e) => {
                    var listItem = $('<li>').text(e.title);
                    var minusButton = $('<a>').addClass('btn btn-secondary').attr('href', '#').text('-').click(() => addToCart(e.product_id, -1));
                    var plusButton = $('<a>').addClass('btn btn-primary').attr('href', '#').text('+').click(() => addToCart(e.product_id));
                    var subtotal = $('<span>').text(`$${e.price} x ${e.quantity} = Subtotal: $${e.subtotal}`);
                    listItem.append(' ', minusButton, ` (x${e.quantity}) `, plusButton, '</br>', subtotal);
                    $('#cartModal .modal-body ul').append(listItem);
                });
                $('#total').attr('value', `$${data.total}`);
            } else {
                console.error('Error: ' + data.message);
            }
        })
        .fail(function (error) {
            console.error('Error: ' + error.statusText);
        });
}

function createCart(id) {
    console.log(id);
    if (cart === undefined) {
        // Call openCart and set cart to id returned.
        $.ajax({
            url: '/cse383_final/final.php/openCart',
            method: 'GET',
            dataType: 'json'
        })
            .done(function (data) {
                if (data.status === 0) {
                    // Set cart value
                    cart = data.cartID;
                    $('#cart-icon').toggleClass('d-none');
                    addToCart(id);
                    $('#cart-icon').click(function () {
                        // Show the modal
                        $('#cartModal').modal('show');
                        getCart();
                    });
                } else {
                    console.error('Error: ' + data.message);
                }
            })
            .fail(function (error) {
                console.error('Error: ' + error.statusText);
            });
    } else {
        addToCart(id);
    }
}

function addToCart(id, q = 1) {
    console.log(id, cart);
    var api = `/cse383_final/final.php/addToCart/?cart=${cart}&product=${id}&quantity=${q}`;
    $.ajax({
        url: api,
        method: 'GET',
        dataType: 'json'
    })
        .done(function (data) {
            if (data.status === 0) {
                // Set cart value
                getCart();
            } else {
                console.error('Error: ' + data.message);
            }
        })
        .fail(function (error) {
            console.error('Error: ' + error.statusText);
        });
}

function renderProducts() {
    var targetElement = $('#apps');

    // Clear existing content in the target element
    targetElement.empty();

    // Loop through each product in the result
    products.forEach((product) => {
        // Create a column for each product
        var productColumn = $('<div class="col-sm-6 col-md-4 col-lg-3 col-xl-2">');

        // Build the HTML content for the product
        var productHtml = `
        <div class="card" id="${product.product_id}">
            <div class="card-header">
                ${product.title}
            </div>
            <img src="${product.image}" class="card-img-top" alt="${product.title}">
            <div class="card-body">
                <p class="card-text">Price: $${product.price}</p>
                <p class="card-text">Category: ${product.category}</p>
                <p class="card-text">Sub-Category: ${product.subcategory}</p>
            </div>
            <div class="card-footer">
                <button type="button" class="btn btn-success" onclick="createCart(${product.product_id})">Add to Cart</button>
            </div>
        </div>`;

        // Set the HTML content for the product column
        productColumn.html(productHtml);

        // Append the product column to the target element
        targetElement.append(productColumn);
    });
}
