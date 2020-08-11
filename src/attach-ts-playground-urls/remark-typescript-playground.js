const map = require('unist-util-map');
const is = require('unist-util-is');
const LZString = require('lz-string');

const SUPPORTED_LANGS = [null, 'ts', 'js', 'typescript', 'javascript'];

function typescriptPlayground() {
  return function transformer(tree, file) {
    const codes = [];

    map(tree, (node) => {
      if (
        is(
          node,
          SUPPORTED_LANGS.map((lang) => ({ type: 'code', lang }))
        )
      ) {
        file.data.playgroundURLs = file.data.playgroundURLs || [];

        const compressedCode = LZString.compressToEncodedURIComponent(
          node.value
        );

        const url = `https://www.typescriptlang.org/play#code/${compressedCode}`;

        file.data.playgroundURLs.push(url);
      }
    });
  };
}

module.exports = typescriptPlayground;
