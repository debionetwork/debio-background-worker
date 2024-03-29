module.exports = async () => {
  const path = require('path'); // eslint-disable-line
  const compose = require('docker-compose'); // eslint-disable-line
  const substrateFixture = require('./substrate-fixture.indexer'); // eslint-disable-line
  const elasticsearchFixture = require('./elasticsearch-fixture.indexer'); // eslint-disable-line

  const apiKey = 'DEBIO_API_KEY';
  process.env.DEBIO_API_KEY = apiKey;

  const promise = new Promise((resolve, reject) => {
    console.log('Starting docker-compose... 🐋');
    compose
      .upAll({ cwd: path.join(__dirname), log: true })
      .then(() => {
        substrateFixture()
          .then(() => {
            elasticsearchFixture()
              .then(() => {
                resolve('DeBio Backend Dependencies is Up! 🆙');
              })
              .catch((err) => {
                reject(
                  `Something went wrong when migrating DeBio Network Indexer: ${err.message}`,
                );
              });
          })
          .catch((err) => {
            reject(
              `Something went wrong when migrating DeBio Network Node: ${err.message}`,
            );
          });
      })
      .catch((err) => {
        reject(
          `Something went wrong when migrating DeBio Network database: ${err.message}`,
        );
      });
  });

  console.log(await promise);
};
