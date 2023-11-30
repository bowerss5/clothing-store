$(document).ready(() => {
    var navhtml = `<nav class="navbar navbar-expand-sm navbar-dark bg-dark text-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="index.html">CSE 383</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
            aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="shop.html">Shop</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" aria-current="page" href="orders.html">Orders</a>
                </li>
                <!-- <li class="nav-item float-right">
        </li> -->
            </ul>
            <a id="cart-icon" class="nav-link d-none" aria-current="page" href="#">Cart</a>
        </div>
    </div>
</nav>`;
    $(".my-navbar").prepend(navhtml);
});