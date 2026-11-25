# Catalogue assets

The store contains 80 demo products and 500 locally served gallery files. Prices, stock seeds and catalogue ratings are illustrative. Brand names describe demo items; there is no claimed affiliation.

Most full-resolution product photographs come from [DummyJSON](https://dummyjson.com/products). Men's Henley and field jacket photos come from [Fake Store API](https://fakestoreapi.com/). The denim jacket photo comes from [Stylitics](https://content.stylitics.com/images/items/20659209), associated with this [original listing](https://www.macys.com/shop/product/lucky-brand-mens-denim-trucker-jacket?ID=19374673).

Each gallery keeps the available source photographs and adds clearly labelled detail crops to reach six or seven images. Detail crops are **not additional camera angles**. No source is upscaled and no blur effect is applied. The gallery labels distinguish original photos from detail views. Obtain your own licensed supplier photography before commercial launch.

`shared/products.json` is the source of truth. `node scripts/check-catalog.mjs` verifies the product count, gallery count, readable image files and unique paths. `scripts/prepare-catalog-images.mjs` documents the crop process; it preserves original photographs and rebuilds the labelled detail crops.

The LIDRESS wordmark is the user-approved generated logo. Brand assets live in `frontend/public/brand`; retain alpha transparency when exporting them.
