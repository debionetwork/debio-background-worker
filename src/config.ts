import dotenv from 'dotenv';
dotenv.config();

export const config = {
  DEBIO_API_KEY: process.env.DEBIO_API_KEY ?? '',
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ?? '',
  REDIS_HOST: process.env.HOST_REDIS ?? 'localhost',
  REDIS_PORT: process.env.PORT_REDIS ?? '6379',
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? 'root',
  REDIS_STORE_URL: process.env.REDIS_STORE_URL ?? 'localhost:6379',
  REDIS_STORE_USERNAME: process.env.REDIS_STORE_USERNAME ?? '',
  COINMARKETCAP_API_KEY: process.env.API_KEY_COINMARKETCAP ?? '',
  COINMARKETCAP_HOST:
    process.env.COINMARKETCAP_HOST ?? 'https://pro-api.coinmarketcap.com/v2',
  DEBIO_ESCROW_PRIVATE_KEY: process.env.DEBIO_ESCROW_PRIVATE_KEY ?? 'PRIVKEY',
  WEB3_RPC_HTTPS: process.env.WEB3_RPC_HTTPS ?? '',
  ESCROW_CONTRACT_ADDRESS: process.env.ESCROW_CONTRACT_ADDRESS ?? 'ADDR',
  ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE ?? '',
  ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME ?? '',
  ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD ?? '',
  POSTGRES_HOST: process.env.HOST_POSTGRES ?? 'localhost',
  POSTGRES_USERNAME: process.env.USERNAME_POSTGRES ?? '',
  POSTGRES_PASSWORD: process.env.PASSWORD_POSTGRES ?? '',
  EMAIL: process.env.EMAIL ?? '',
  PASS_EMAIL: process.env.PASS_EMAIL ?? '',
  EMAILS: process.env.EMAILS ?? '',
  SUBSTRATE_URL: process.env.SUBSTRATE_URL ?? 'URL',
  ADMIN_SUBSTRATE_MNEMONIC: process.env.ADMIN_SUBSTRATE_MNEMONIC ?? '',
  BUCKET_NAME: process.env.BUCKET_NAME ?? '',
  STORAGE_BASE_URI: process.env.STORAGE_BASE_URI ?? '',
  MYRIAD_API_URL: process.env.MYRIAD_API_URL ?? '',
  MYRIAD_ADMIN_USERNAME: process.env.MYRIAD_ADMIN_USERNAME ?? '',
  MYRIAD_PHYSICAL_HEALTH_TIMELINE_ID:
    process.env.PHYSICAL_HEALTH_EXPERIENCE_ID ?? '',
  MYRIAD_MENTAL_HEALTH_TIMELINE_ID:
    process.env.MENTAL_HEALTH_EXPERIENCE_ID ?? '',
  PINATA_JWT: process.env.PINATA_SECRET_KEY ?? '',
  GA_ORDER_LINK: process.env.GA_ORDER_LINK ?? '',
  LAB_ORDER_LINK: process.env.LAB_ORDER_LINK ?? '',
  UNSTAKE_INTERVAL: process.env.UNSTAKE_INTERVAL ?? '',
  UNSTAKE_TIMER: process.env.UNSTAKE_TIMER ?? '',
  MENSTRUAL_SUBSCRIPTION_DURATION:
    process.env.MENSTRUAL_SUBSCRIPTION_DURATION ?? '',
};
