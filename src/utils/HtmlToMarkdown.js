import React from 'react'
import TurndownService from 'turndown';
import { HTML_TESTS } from './html_tests';

var markdown = "";
var turndownService = new TurndownService({ emDelimiter: '*', headingStyle: 'atx', bulletListMarker: '-', strongDelimiter: '-_' });
turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: function (content) {
        return '~~' + content + '~~'
    }
})

turndownService.addRule('underline', {
    filter: ['u'],
    replacement: function (content) {
        return '^:' + content + '^:'
    }
})



turndownService.addRule('center_align', {
    filter: function (node) {
        return (
            (node.nodeName === 'P' || node.nodeName === 'blockquote') &&
            node.className === 'ql-align-center'

        )
    },
    replacement: function (content) {
        return '\n\n-_[center] ' + content;
    }
})

turndownService.addRule('right_align', {
    filter: function (node) {
        return (
            node.nodeName === 'P' &&
            node.className === 'ql-align-right'

        )
    },
    replacement: function (content) {
        return '\n\n-_[right] ' + content;
    }
})

turndownService.addRule('mention', {
    filter: function (node) {
        const mention_regex = /\[~[A-Za-z0-9]+\]/gm;
        return (
            node.nodeName === 'P' &&
            (node.textContent.search(mention_regex) !== -1)

        )
    },
    replacement: function (content) {
        return '\n\n' + content.slice(0, content.indexOf('[') - 1) + '#[mention](' + content.slice(content.indexOf('[') + 1, content.indexOf(']') - 1) + ')' + content.slice(content.indexOf(']') + 1, content.length) + '\n\n';
    }
})



HTML_TESTS.forEach(element => {
    markdown += turndownService.turndown(element) + '\n';
});

export default markdown;