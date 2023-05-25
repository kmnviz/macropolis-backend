const up = async (db, client) => {
    await db.collection('plans').insertMany([
        {
            product_id: "prod_Ngec3y0PN8mw60",
            price_id: "price_1MvHJDBjyCcg4xzLbTjwfRuW",
            name: "enhanced",
            description: "xpo enhanced plan",
            price: "900",
            recurring: "month",
            currency: "usd",
            includes: {
                items: {
                    limit: 999999999,
                    description: 'unlimited'
                },
                collections: {
                    limit: 1,
                    description: 'create collections of items'
                },
                storage: {
                    limit: 10240,
                    description: 'up to 10GB storage'
                },
            }
        },
        {
            name: "free",
            description: "xpo free plan",
            price: "0",
            includes: {
                items: {
                    limit: 10,
                    description: 'up to 10 items'
                },
                collections: {
                    limit: 0,
                    description: 'collections not available'
                },
                storage: {
                    limit: 10240,
                    description: 'up to 1GB storage'
                },
            }
        }
    ]);
};

const down = async (db, client) => {
    await db.collection('plans').deleteMany({});
};

module.exports = { up, down };