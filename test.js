const dns = require("dns");

dns.resolveSrv("_mongodb._tcp.cluster0.j5zns6k.mongodb.net", (err, records) => {
    if (err) {
        console.error(err);
    } else {
        console.log(records);
    }
});