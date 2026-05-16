let userLocation = "";

let paymentCompleted = false;

const outletLat = 7.2906;
const outletLon = 80.6337;

/* LOAD CART */

function loadCart() {

    let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];

    let container =
    document.getElementById(
        "cartItems"
    );

    let total = 0;

    container.innerHTML = "";

    if(cart.length === 0){

        container.innerHTML =
        "<p>Your cart is empty</p>";

        document.getElementById(
            "grandTotal"
        ).innerText = 0;

        return;
    }

    cart.forEach((item,index)=>{

        let itemTotal =
        item.price * item.qty;

        total += itemTotal;

        container.innerHTML += `

        <div class="item">

            <h4>${item.name}</h4>

            <p>
                Rs. ${item.price}
            </p>

            <button onclick="decreaseQty(${index})">
            −
            </button>

            Qty: ${item.qty}

            <button onclick="increaseQty(${index})">
            +
            </button>

            <br><br>

            Item Total:
            Rs. ${itemTotal}

            <br><br>

            <button
            class="remove"
            onclick="removeItem(${index})">

            Remove

            </button>

        </div>
        `;
    });

    const orderType =
    document.getElementById(
        "orderType"
    ).value;

    /* DELIVERY CHARGE */

    if(orderType === "Delivery"){

        total += 250;

    }

    /* SERVICE CHARGE */

    else{

        total += total * 0.10;

    }

    document.getElementById(
        "grandTotal"
    ).innerText =
    total.toFixed(2);
}

/* QUANTITY */

function increaseQty(i){

    let cart =
    JSON.parse(
        localStorage.getItem("cart")
    );

    cart[i].qty++;

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCart();
}

function decreaseQty(i){

    let cart =
    JSON.parse(
        localStorage.getItem("cart")
    );

    if(cart[i].qty > 1){

        cart[i].qty--;

    } else {

        cart.splice(i,1);
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCart();
}

function removeItem(i){

    let cart =
    JSON.parse(
        localStorage.getItem("cart")
    );

    cart.splice(i,1);

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    loadCart();
}

/* CLEAR */

function clearCart(){

    localStorage.removeItem(
        "cart"
    );

    loadCart();
}

/* LOCATION */

function getLocation(){

navigator.geolocation
.getCurrentPosition(pos=>{

    let lat =
    pos.coords.latitude;

    let lon =
    pos.coords.longitude;

    userLocation =
    `https://maps.google.com/?q=${lat},${lon}`;

    const distance =
    calculateDistance(
        lat,
        lon,
        outletLat,
        outletLon
    );

    if(distance > 5){

        alert(
        "Delivery unavailable beyond 5KM"
        );

        document.getElementById(
            "orderType"
        ).value = "Takeaway";

        toggleDeliveryFields();

        loadCart();

        return;
    }

    document.getElementById(
        "locationText"
    ).innerText =
    "Location Added ✔";

});
}

/* DISTANCE */

function calculateDistance(
lat1, lon1, lat2, lon2
){

const R = 6371;

const dLat =
(deg2rad(lat2-lat1));

const dLon =
(deg2rad(lon2-lon1));

const a =

Math.sin(dLat/2) *
Math.sin(dLat/2)

+

Math.cos(deg2rad(lat1))

*

Math.cos(deg2rad(lat2))

*

Math.sin(dLon/2)

*

Math.sin(dLon/2);

const c =
2 * Math.atan2(
Math.sqrt(a),
Math.sqrt(1-a)
);

return R * c;
}

function deg2rad(deg){

return deg * (Math.PI/180);
}

/* DELIVERY TOGGLE */

function toggleDeliveryFields(){

    let type =
    document.getElementById(
        "orderType"
    ).value;

    let section =
    document.getElementById(
        "deliverySection"
    );

    if(type === "Delivery"){

        section.style.display =
        "block";

    } else {

        section.style.display =
        "none";
    }

    loadCart();
}

/* PAYMENT METHOD TOGGLE */

function togglePaymentMethod(){

    const selected =
    document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    const paypalSection =
    document.getElementById(
        "paypalSection"
    );

    const placeBtn =
    document.getElementById(
        "placeOrderBtn"
    );

    if(selected === "online"){

        paypalSection.style.display =
        "block";

        placeBtn.disabled = true;

    } else {

        paypalSection.style.display =
        "none";

        placeBtn.disabled = false;

        paymentCompleted = false;
    }
}

/* PAYPAL */

paypal.Buttons({

    style: {

        layout: 'vertical',

        color: 'gold',

        shape: 'rect',

        label: 'paypal'
    },

    createOrder: function(data, actions) {

        let total = document
        .getElementById(
            "grandTotal"
        ).innerText;

        let lkrTotal = parseFloat(total);

        if(isNaN(lkrTotal)){

            lkrTotal = 0;
        }

        const usdRate = 300;

        const usdTotal = Number(
            lkrTotal / usdRate
        ).toFixed(2);

        return actions.order.create({

            purchase_units: [{

                amount: {

                    currency_code: "USD",

                    value: usdTotal
                }
            }]
        });
    },

    onApprove: function(data, actions) {

        return actions.order.capture()

        .then(function(details) {

            paymentCompleted = true;

            const btn =
            document.getElementById(
                "placeOrderBtn"
            );

            btn.disabled = false;

            btn.classList.add(
                "active"
            );

            alert(
                "Payment Successful ✔"
            );
        });
    },

    onError: function(err) {

        console.log(err);

        alert(
            "Payment Failed"
        );
    }

}).render(
'#paypal-button-container'
);

/* PLACE ORDER */

async function placeOrder(){

    let cart =
    JSON.parse(
        localStorage.getItem("cart")
    ) || [];

    if(cart.length === 0){

        alert("Cart is empty");

        return;
    }

    const name =
    document.getElementById(
        "name"
    ).value;

    const phone =
    document.getElementById(
        "phone"
    ).value;

    const orderType =
    document.getElementById(
        "orderType"
    ).value;

    const address =
    document.getElementById(
        "address"
    ).value;

    const street =
    document.getElementById(
        "street"
    ).value;

    const paymentMethod =
    document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    if(name === "" || phone === ""){

        alert(
            "Please fill all details"
        );

        return;
    }

    if(orderType === "Delivery"){

        if(address === ""){

            alert(
                "Enter delivery address"
            );

            return;
        }

        if(userLocation === ""){

            alert(
                "Please add location"
            );

            return;
        }
    }

    /* ONLINE PAYMENT CHECK */

    if(
        paymentMethod === "online"
        &&
        !paymentCompleted
    ){

        alert(
            "Complete PayPal payment first"
        );

        return;
    }

    const orderData = {

        customer_name: name,

        phone: phone,

        order_type: orderType,

        address: address,

        street: street,

        location: userLocation,

        payment: paymentMethod,

        paymentStatus:

        paymentMethod === "online"

        ? "Paid"

        : "Cash on Delivery",

        total:
        document.getElementById(
            "grandTotal"
        ).innerText,

        items: cart
    };

    console.log(orderData);

    /* SAVE TO DATABASE */

    try {

        await fetch(
            "https://focused-rebirth-production-6a18.up.railway.app/orders",
            {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
                orderData
            )
        });

        alert(
            "Order Placed Successfully ✔"
        );

        localStorage.removeItem(
            "cart"
        );

        window.location.href =
        "index.html";

    }

    catch(error){

        console.log(error);

        alert(
            "Failed to place order"
        );
    }
}

/* BACK BUTTON */

function goBack(){

    window.history.back();
}

/* INITIAL */

window.onload = () => {

    loadCart();

    toggleDeliveryFields();

    togglePaymentMethod();
};