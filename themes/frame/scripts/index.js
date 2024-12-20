/* global hexo */
'use strict';

hexo.on('generateBefore', () => {
    const footnote = require('./lib/footnote');
    footnote(hexo); // 将 hexo 对象传递给 footnote.js
});

hexo.on('generateAfter', () => {
    const hello = require('./lib/hello');
    hello(hexo); // 将 hexo 对象传递给 hello.js
});