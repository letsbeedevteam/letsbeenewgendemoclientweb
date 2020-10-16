const ORDER_STATUS = [
    "", // 0
    "Waiting for Restaurant Response", // 1
    "Waiting for Rider Response", // 2
    "Restaurant Declined", // 3
    "Rider Picking up the order", // 4
    "Rider Declined", // 5
    "Rider on the way to you", // 6
    "delivered" // 7
]

const ORDER_PAYMENT = {
    paypal: "Paypal",
    credit_card: "Credit Card",
    cod: "Cash on delivery"
}

export {
    ORDER_STATUS,
    ORDER_PAYMENT,
}