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
                    description: 'number of items: unlimited'
                },
                collections: {
                    limit: 1,
                    description: 'collections: yes'
                },
                storage: {
                    limit: 10240,
                    description: 'storage: 10GB'
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
                    description: 'number of items: 10'
                },
                collections: {
                    limit: 0,
                    description: 'collections: no'
                },
                storage: {
                    limit: 10240,
                    description: 'storage: 1GB'
                },
            }
        }
    ]);
};

const down = async (db, client) => {
    await db.collection('plans').deleteMany({});
};

module.exports = { up, down };