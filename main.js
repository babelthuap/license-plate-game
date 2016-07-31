$(document).ready(function() {
  'use strict';


  $('#letters')
  .on('keypress', function(e) {
    if (e.charCode === 13) findWords();
  })
  .focus();


  $('#go')
  .click(findWords)
  .prop('disabled', false);


  function findWords() {
    var letters = $('#letters').val();

    if (letters.length < 2) {
      return $('#words').empty();
    }

    var groups = letters.split(/(".*?)"/).filter(c => c);
    var mapped = groups.map(function(group) {
      return (group[0] === '"') ? group.slice(1) : group.split('').join('.*')
    });

    var rawRe = '.*' + mapped.join('.*') + '.*';
    var re = new RegExp(rawRe, 'i');

    var words = wordList.filter(function(word) {
      return re.test(word);
    });

    var $links;
    if (words.length === 0) {
      $links = ['no matches found!'];
    } else {
      $links = words.map(function(word) {
        var $link = $('<a>')
          .text(word)
          .attr('target', '_blank')
          .attr('href', '//en.wiktionary.org/wiki/' + word);
        return $('<span>')
          .text(', ')
          .prepend($link);
      });
    }

    $('#words').empty().append($links)
  }
});
