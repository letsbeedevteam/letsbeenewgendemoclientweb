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
    cod: "Cash on delivery",
    card: "Debit/Credit Card",
    gcash: "GCash"
}

export {
    ORDER_STATUS,
    ORDER_PAYMENT,
}