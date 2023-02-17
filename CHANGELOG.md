# Changelog

## [2.4.0](https://github.com/debionetwork/debio-background-worker/compare/2.3.0...2.4.0) (2023-02-14)


### Features

* health professional indexer ([#255](https://github.com/debionetwork/debio-background-worker/issues/255)) ([8e87af6](https://github.com/debionetwork/debio-background-worker/commit/8e87af66e5c167785c6387bcff2944d0adb64fc1))
* move reward to finalize request update ([#273](https://github.com/debionetwork/debio-background-worker/issues/273)) ([257df01](https://github.com/debionetwork/debio-background-worker/commit/257df01f837b8bcd6e5861e9471942d6fc9131a2))
* second opinion indexer handler ([#256](https://github.com/debionetwork/debio-background-worker/issues/256)) ([30a6067](https://github.com/debionetwork/debio-background-worker/commit/30a6067dfbf32eb288fa637f0f647b0bd2e73fe4))


### Bug Fixes

* add delay between reward ([#249](https://github.com/debionetwork/debio-background-worker/issues/249)) ([32dd85e](https://github.com/debionetwork/debio-background-worker/commit/32dd85e7b2d5a343fa56ff198432016568d5fe6c))
* error update on stake ([#258](https://github.com/debionetwork/debio-background-worker/issues/258)) ([b214b29](https://github.com/debionetwork/debio-background-worker/commit/b214b2914439319051da333bfa6243c74a0a0b40))
* format data class ([#257](https://github.com/debionetwork/debio-background-worker/issues/257)) ([c4a1f07](https://github.com/debionetwork/debio-background-worker/commit/c4a1f0712d7e9ab7d5e1b928d417fb0a84594041))
* health professional indexer ([#269](https://github.com/debionetwork/debio-background-worker/issues/269)) ([abf944b](https://github.com/debionetwork/debio-background-worker/commit/abf944b11c7290b4ab7d925ce9c66fd4bc3692d8))
* indexer second opinion ([#266](https://github.com/debionetwork/debio-background-worker/issues/266)) ([8c449db](https://github.com/debionetwork/debio-background-worker/commit/8c449db7f509f2d9bd84601cd927a029a83450c8))
* menstrual subscription ([#280](https://github.com/debionetwork/debio-background-worker/issues/280)) ([da7151e](https://github.com/debionetwork/debio-background-worker/commit/da7151ec68d3f8095a93d839e28fc96abc99dc9b))
* reward failed ([#252](https://github.com/debionetwork/debio-background-worker/issues/252)) ([db13adc](https://github.com/debionetwork/debio-background-worker/commit/db13adc278d7e01bb8a4b0cc5fadb81ee1b79668))
* reward finalized ([#284](https://github.com/debionetwork/debio-background-worker/issues/284)) ([a09db94](https://github.com/debionetwork/debio-background-worker/commit/a09db94ce592bc39a8f02e184cee99f7acf88c68))
* reward finalized ([#285](https://github.com/debionetwork/debio-background-worker/issues/285)) ([b5ec933](https://github.com/debionetwork/debio-background-worker/commit/b5ec93395ce04d4f649c2833cd23440a91c2dca6))
* reward not called ([#270](https://github.com/debionetwork/debio-background-worker/issues/270)) ([fd3fc29](https://github.com/debionetwork/debio-background-worker/commit/fd3fc29975f6b3e545f67b787960007e7e06f2ef))
* reward order fulfilled  ([#277](https://github.com/debionetwork/debio-background-worker/issues/277)) ([2d19fee](https://github.com/debionetwork/debio-background-worker/commit/2d19feef0eef27b9e8984f9260d7e0f7ada32cb8))
* reward, handle with convert to bigint ([#247](https://github.com/debionetwork/debio-background-worker/issues/247)) ([b6d6f95](https://github.com/debionetwork/debio-background-worker/commit/b6d6f95c1d63a0be22063bcb8bea367b861a9c88))
* run check inqueu subscription if some subscription is inactive ([#276](https://github.com/debionetwork/debio-background-worker/issues/276)) ([8510bf7](https://github.com/debionetwork/debio-background-worker/commit/8510bf76cd5e2b9b64965a8c210c230ac90a4974))
* run when finished ([#267](https://github.com/debionetwork/debio-background-worker/issues/267)) ([320e9af](https://github.com/debionetwork/debio-background-worker/commit/320e9af701f85415d2669997d4f0a03bbe6a1274))

## [2.3.0](https://github.com/debionetwork/debio-background-worker/compare/2.2.0...2.3.0) (2022-12-16)


### Features

* move duration menstrual subscription to env ([#231](https://github.com/debionetwork/debio-background-worker/issues/231)) ([ca423b2](https://github.com/debionetwork/debio-background-worker/commit/ca423b20211ac6112999e915d2688a6689c562d2))
* scheduler inqueue to active ([#230](https://github.com/debionetwork/debio-background-worker/issues/230)) ([724ed1d](https://github.com/debionetwork/debio-background-worker/commit/724ed1d6e09ee9ac975c0bb0e60fa25213fb946d))
* transaction log menstrual subscription ([#227](https://github.com/debionetwork/debio-background-worker/issues/227)) ([372daaa](https://github.com/debionetwork/debio-background-worker/commit/372daaa5377b568eba7601422efd7274021d444f))


### Bug Fixes

* add menstrual subscription index when initialize ([a3cb8b8](https://github.com/debionetwork/debio-background-worker/commit/a3cb8b8617dc8a9bced5422fec1b45960d25ce41))
* add menstrual subscription index when initialize ([#221](https://github.com/debionetwork/debio-background-worker/issues/221)) ([a3cb8b8](https://github.com/debionetwork/debio-background-worker/commit/a3cb8b8617dc8a9bced5422fec1b45960d25ce41))
* amount transaction log menstrual subscription ([#229](https://github.com/debionetwork/debio-background-worker/issues/229)) ([1f59bf7](https://github.com/debionetwork/debio-background-worker/commit/1f59bf7f6fd2e741bf42e283d389b455c9596cb1))
* change menstrual subscription status inqueue to active ([#236](https://github.com/debionetwork/debio-background-worker/issues/236)) ([0bda662](https://github.com/debionetwork/debio-background-worker/commit/0bda6622c303dc9e53462bc30b7e377976e4bf45))
* convert to dbio currency unit remove ethereum listener ([#242](https://github.com/debionetwork/debio-background-worker/issues/242)) ([4a12919](https://github.com/debionetwork/debio-background-worker/commit/4a12919358b6bd1f5ab4feb3a78d71a555fec867))
* currency unit ([#235](https://github.com/debionetwork/debio-background-worker/issues/235)) ([b3632c9](https://github.com/debionetwork/debio-background-worker/commit/b3632c93f4a8307d87dc2bc61d16209b1117e5d7))
* error listener ([#237](https://github.com/debionetwork/debio-background-worker/issues/237)) ([9db6ba5](https://github.com/debionetwork/debio-background-worker/commit/9db6ba5ea72ac8ef18d97d778154dcf75c09c587))
* error module ([#232](https://github.com/debionetwork/debio-background-worker/issues/232)) ([0190107](https://github.com/debionetwork/debio-background-worker/commit/0190107f6453d4ade7b797805b0eca7213e06a7e))
* reward request service  ([#228](https://github.com/debionetwork/debio-background-worker/issues/228)) ([d495e43](https://github.com/debionetwork/debio-background-worker/commit/d495e43cd637464957d4cefaddb4aa9ff9814ac7))

## [2.2.0](https://github.com/debionetwork/debio-background-worker/compare/2.1.7...2.2.0) (2022-11-30)


### Features

* add command handler menstrual subscription event ([#197](https://github.com/debionetwork/debio-background-worker/issues/197)) ([280ce35](https://github.com/debionetwork/debio-background-worker/commit/280ce3571ad57c182feaed4f7154470a95a9c5c8))
* add menstrual calendar event handler ([#177](https://github.com/debionetwork/debio-background-worker/issues/177)) ([92010db](https://github.com/debionetwork/debio-background-worker/commit/92010db74da4c46ab675cf4a6658bf39727bc600))
* menstrual subscription scheduler ([#218](https://github.com/debionetwork/debio-background-worker/issues/218)) ([0d1a128](https://github.com/debionetwork/debio-background-worker/commit/0d1a128e0a74c2adabc14cc24a9e710a891fe1ba))
* update cycle log (effect node pallet events parameter changed) ([#219](https://github.com/debionetwork/debio-background-worker/issues/219)) ([3bc5c3c](https://github.com/debionetwork/debio-background-worker/commit/3bc5c3cfc03d747fa669414a42653ad099b041e9))
* update notification ([#204](https://github.com/debionetwork/debio-background-worker/issues/204)) ([6407abe](https://github.com/debionetwork/debio-background-worker/commit/6407abea4b66525da5720090c75d242ef7932cb3))
* update notification order fulfilled with dynamic currency ([#194](https://github.com/debionetwork/debio-background-worker/issues/194)) ([4769250](https://github.com/debionetwork/debio-background-worker/commit/476925088e0ed11cc3d0a2358f230d603a16929e))
* update service request listener and indexer ([#195](https://github.com/debionetwork/debio-background-worker/issues/195)) ([51c042c](https://github.com/debionetwork/debio-background-worker/commit/51c042c6a2393bfaaaef9cd54e81cbf041b4e47a))


### Bug Fixes

* error and update menstrual calendar indexer ([#200](https://github.com/debionetwork/debio-background-worker/issues/200)) ([926b2f7](https://github.com/debionetwork/debio-background-worker/commit/926b2f7a377817de86475f25e1be6e750d18a5ae))
* menstrual calendar and fix id ([#180](https://github.com/debionetwork/debio-background-worker/issues/180)) ([d4d5746](https://github.com/debionetwork/debio-background-worker/commit/d4d5746766967cd055bb78ade9a0aaef9049860c))
* menstrual cycle log model data convert ([#205](https://github.com/debionetwork/debio-background-worker/issues/205)) ([c5fd91c](https://github.com/debionetwork/debio-background-worker/commit/c5fd91c379a123aba678ce5ed7780344d4ea91af))
* scheduler log error ([#220](https://github.com/debionetwork/debio-background-worker/issues/220)) ([a2a03b1](https://github.com/debionetwork/debio-background-worker/commit/a2a03b1c8d268846b45fd2f965d137ca86228864))
* staking request ([#213](https://github.com/debionetwork/debio-background-worker/issues/213)) ([b196b76](https://github.com/debionetwork/debio-background-worker/commit/b196b76071771f9bbd3f599755443294346b0358))
* update order fulfilled ([#153](https://github.com/debionetwork/debio-background-worker/issues/153)) ([e7dc265](https://github.com/debionetwork/debio-background-worker/commit/e7dc26586947a50e3e6b0d6daf1e12c04da2c2d2))
* Update package polkadot provider ([#207](https://github.com/debionetwork/debio-background-worker/issues/207)) ([e071a66](https://github.com/debionetwork/debio-background-worker/commit/e071a6625546b0641f67c4aaeeca32dd7b7258ef))
* update transaction hash from blockchain ([#214](https://github.com/debionetwork/debio-background-worker/issues/214)) ([ee8c28d](https://github.com/debionetwork/debio-background-worker/commit/ee8c28df0b1835ccaf57b3ac42f58f29de610483))


### Performance Improvements

* add currency for notification payment ([#186](https://github.com/debionetwork/debio-background-worker/issues/186)) ([acce487](https://github.com/debionetwork/debio-background-worker/commit/acce4878b9cbfecf8bc28cd617f3c21ff63127d7))
