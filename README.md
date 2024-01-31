# AWS SAML to STS Chrome extension

[Google Chrome] extension that intercepts the SAML assertion when logging into
the [AWS] console and exchanges it for temporary [STS] credentials.

## Getting started

### Installation

### Development and testing

#### Requirements

- [Google Chrome]
- [Node.js] 20 and [npm] 9+

Clone the repository and navigate to the `chrome-ext-aws-saml-sts` directory,
and install dependencies with [npm].

```bash
git clone git@github.com:unfunco/chrome-ext-aws-saml-sts.git
cd chrome-ext-aws-saml-sts
npm install
```

```bash
npm run dev
```

## License

© 2023 [Daniel Morris]\
Made available under the terms of the [Apache License 2.0].

[apache license 2.0]: LICENSE.md
[aws]: https://aws.amazon.com
[daniel morris]: https://unfun.co
[google chrome]: https://www.google.com/chrome
[node.js]: https://nodejs.org
[npm]: https://www.npmjs.com
[sts]: https://docs.aws.amazon.com/STS/latest/APIReference/welcome.html
