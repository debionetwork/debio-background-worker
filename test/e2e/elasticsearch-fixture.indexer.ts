import { connectionRetries, setElasticsearchDummyCredentials } from './config';
import { Client } from '@elastic/elasticsearch';

async function initalElasticsearchConnection(): Promise<Client> {
  await new Promise((resolve) => setTimeout(resolve, 60000));
  setElasticsearchDummyCredentials();
  return new Client({
    node: process.env.ELASTICSEARCH_NODE,
    auth: {
      username: process.env.ELASTICSEARCH_USERNAME,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  });
}

module.exports = async () => {
  // Wait for Elasticsearch to open connection.
  console.log('Waiting for debio-elasticsearch to resolve ⏰...');
  const client: Client = await connectionRetries(
    initalElasticsearchConnection,
    60,
  );
  console.log('debio-elasticsearch resolved! ✅');

  const indices = [
    'country-service-request',
    'last-block-number-request-service',
    'create-service-request',
    'certifications',
    'labs',
    'genetic-analysis',
    'genetic-analysis-order',
    'genetic-analysts-services',
    'genetic-analysts',
    'genetic-analysts-qualification',
    'genetic-data',
    'data-bounty',
    'services',
    'orders',
    'last-block-number-substrate',
  ];

  for (const i of indices) {
    const { body: exist } = await client.indices.exists({
      index: i,
    });

    if (!exist) {
      await client.indices.create({
        index: i,
      });
      console.log(`create ${i} indices`);
    }
  }
};
