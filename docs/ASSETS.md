# Demo assets

The catalogue uses illustrative men's product imagery. These are not LIDRESS inventory listings or claims of brand affiliation. Replace demo assets with your own catalogue before commercial use.

- Men's editorial photograph: [Unsplash](https://images.unsplash.com/photo-1488161628813-04466f872be2).
- Check Oxford, Graphic Crew, Weekend Plaid, Summer Shirt: [DummyJSON men's shirts catalogue](https://dummyjson.com/products/category/mens-shirts), products 83–86.
- Everyday Henley and Field Jacket: [Fake Store API](https://fakestoreapi.com/), products 2 and 3.
- Denim jacket: [Stylitics product image](https://content.stylitics.com/images/items/20659209), [original product listing](https://www.macys.com/shop/product/lucky-brand-mens-denim-trucker-jacket?ID=19374673).

`node scripts/prepare-garments.mjs` creates tightly cropped transparent cutouts from the local source images. The script uses edge-connected background removal so white fabric remains visible. Keep an original copy before replacing an asset.

Body tracking uses Google's [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js). The lite model is downloaded from Google's official [model bucket](https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task). The files under `frontend/public/mediapipe/` are the unmodified WASM runtime distributed with the installed `@mediapipe/tasks-vision` package. Keep them in sync when upgrading the package.
