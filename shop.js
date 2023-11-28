var products = {};
var category = "%25";
var subcategory = "%25";

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
});


function getSubCategories() {
    var api = `/cse383_final/final.php/getSubCategories/?category=${category}`;
    $.ajax({
        url: api,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
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
        },
        error: function (error) {
            console.error('Error: ' + error.statusText);
        }
    });
}



function getCategories() {
    var apiEndpoint = '/cse383_final/final.php/getCategories';
    $.ajax({
        url: apiEndpoint,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
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
        },
        error: function (error) {
            console.error('Error: ' + error.statusText);
        }
    });
}

function getProducts() {
    $("#cart-alert").hide();
    var apiEndpoint = `/cse383_final/final.php/getProduct?category=${category}&subcategory=${subcategory}&id=0`;
    $.ajax({
        url: apiEndpoint,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            if (data.status === 0) {
                // API call successful
                products = data.result;
                renderProducts();
            } else {
                console.error('Error: ' + data.message);
            }
        },
        error: function (error) {
            console.error('Error: ' + error.statusText);
        }
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
                
            </div>
            <div class="card-footer">
                <button type="button" class="btn btn-success" onclick="{console.log('${product.title}')}">Add to Cart</button>
            </div>
        </div>
      `;

        // Set the HTML content for the product column
        productColumn.html(productHtml);

        // Append the product column to the target element
        targetElement.append(productColumn);
    });
}