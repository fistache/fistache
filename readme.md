<p align="center"><a href="#" target="_blank" rel="nofollow"><img width="64" src="https://gist.github.com/aliaksandrparfiankou/439bf6ea2eefb8f0b9c6deff86010964/raw/06fbf009b5a2cd237bf3ac146a433bbab2e56efb/logo.png" alt="Seafood logo"></a></p>

# [Seafood]() ![Version](https://img.shields.io/badge/version-0.0.1%40dev-blue.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)
* **Ready to use solution** to start working out-of-the-box.
No time wasting to find needed packages, check it out, build
all this stuff together and other headache.
* **Trusted SSL certificate** for local development out-of-the-box.
* **Workshop area** where you can develop each component separately
focusing only on it.
* **Standarts** for a components writing(one possible programming language, structure, BEM and etc)
* **Typescript** everywhere.
* Component **composition and inheritance**.
* Mandatory **SSR**
* **Everything we've used to**. Components, HMR, data binding and stuff.

# Installation
Coming soon.

# Example component
```XML
<script>
    import { Component, use, attribute } from '@seafood/component'
    import Product from '../../Entity/Product'
    import ProductPriceComponent from '../Components/ProductPrice.seafood'

    @use({
        ProductPriceComponent
    })
    export default class ProductComponent extends Component {
        @attribute({
            required: true
        })
        private product: Product
    }
</script>

<div class="product">
    <div class="product__name">{{ this.product.name }}</div>
    <div class="product__body">
        <ProductPrice price={ this.product.price } />
    </div>
</div>

<style>
    .product
        background-color floralwhite

    .product__name
        font-size 2em
        color darkblue

    .product__body
        background-color ghostwhite
</style>

```
