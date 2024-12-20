'use strict';

const { stripHTML } = require('hexo-util');

// Register footnotes filter
module.exports = (hexo) => {
    const config = hexo.theme.config || {};
    if (config.footnote && config.footnote.enable) {
        console.log('[footnote.js] Footnote is enabled!');
        hexo.extend.filter.register('before_post_render', (page) => {
            if (page.footnote !== false) {
                page.content = renderFootnotes(page.content, config.footnote.header);
            }
            return page;
        });
    } else {
        console.warn('[footnote.js] Footnote is disabled or not configured in theme config.');
    }

    function renderFootnotes(text, header) {
        const reFootnoteContent = /\[\^(\d+)]: ?([\S\s]+?)(?=\[\^(?:\d+)]|\n\n|$)/g;
        const reInlineFootnote = /\[\^(\d+)]\((.+?)\)/g;
        const reFootnoteIndex = /\[\^(\d+)]/g;
        const reCodeBlock = /<pre>[\s\S]*?<\/pre>/g;

        let footnotes = [];
        let html = '';
        let codeBlocks = [];

        text = text.replace(reCodeBlock, function (match) {
            codeBlocks.push(match);
            return 'CODE_BLOCK_PLACEHOLDER';
        });

        text = text.replace(reInlineFootnote, function (match, index, content) {
            footnotes.push({
                index,
                content: content ? content.trim() : '',
            });
            return '[^' + index + ']';
        });

        text = text.replace(reFootnoteContent, function (match, index, content) {
            footnotes.push({
                index,
                content: content ? content.trim() : '',
            });
            return '';
        });

        footnotes.sort(function (a, b) {
            return a.index - b.index;
        });

        text = text.replace(reFootnoteIndex, function (match, index) {
            const tooltip = footnotes.find((item) => item.index === index)?.content || '';
            return (
                '<sup id="fnref:' +
                index +
                '" class="footnote-ref">' +
                '<a href="#fn:' +
                index +
                '" rel="footnote" title="' +
                stripHTML(tooltip) +
                '">' +
                index +
                '</a></sup>'
            );
        });

        footnotes.forEach(function (item) {
            html += '<li id="fn:' + item.index + '">';
            html += item.content;
            html += '<a href="#fnref:' + item.index + '" rev="footnote" class="footnote-backref"> ↩</a>';
            html += '</li>';
        });

        if (footnotes.length) {
            text += '<section class="footnotes">';
            text += header || '<h2>Footnotes</h2>';
            text += '<ol>' + html + '</ol>';
            text += '</section>';
        }

        text = text.replace(/CODE_BLOCK_PLACEHOLDER/g, function () {
            return codeBlocks.shift();
        });

        return text;
    }
};
