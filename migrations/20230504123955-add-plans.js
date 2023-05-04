const up = async (db, client) => {
    await db.collection('plans').insertMany([
        {
            "product_id": "prod_Ngec3y0PN8mw60",
            "price_id": "price_1MvHJDBjyCcg4xzLbTjwfRuW",
            "name": "enhanced",
            "description": "xpo enhanced plan",
            "price": "900",
            "recurring": "month",
            "currency": "usd",
            "items": "50"
        },
        {
            "name": "free",
            "description": "xpo free plan",
            "price": "0",
            "items": "10"
        }
    ]);
};

const down = async (db, client) => {
    await db.collection('plans').deleteMany({});
};

module.exports = { up, down };