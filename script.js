$(document).ready(function(){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","hebrew/XMLServer.xml",false);
  xmlhttp.send();
  var xmlDoc = xmlhttp.responseXML
  var chapters = xmlDoc.getElementsByTagName("c");
  var prevVerse = -1;
  var stickyHeader = false;
  var $body = $("body");
  var $header = $("#header");
  var $audio = $("#footer audio");
  var currentChapter = 1;
  var currentBook = 1;
  var books = {};

  $header.attr("data-book-number", 1);

  $.getJSON('english/genesis.json', function(response) {
    books["1"] = response;
    getChapter(currentChapter);
  });

  $audio.html("<source src='http://media.snunit.k12.il/kodeshm/mp3/t" + pad(currentBook,2) + pad(currentChapter,2) + ".mp3' type='audio/mpeg'>");

  $("#next").click(function() {
    $("ul.chapter").html("");
    $body.css("counter-reset", "chapter-num " + currentChapter);
    getChapter(++currentChapter);
    $audio.html("<source src='http://media.snunit.k12.il/kodeshm/mp3/t" + pad(currentBook,2) + pad(currentChapter,2) + ".mp3' type='audio/mpeg'>");
  });

  $("#prev").click(function() {
    if (currentChapter > 1) {
      $("ul.chapter").html("");
      getChapter(--currentChapter);
      $body.css("counter-reset", "chapter-num " + (currentChapter - 1));
      $audio.html("<source src='http://media.snunit.k12.il/kodeshm/mp3/t" + pad(currentBook,2) + pad(currentChapter,2) + ".mp3' type='audio/mpeg'>");
    }
  });
  
  $("#search").keyup(function(e){
    if (e.which == 27) {
      $(this).val("");
      $(this).blur();
    }
  });

  $(".verse").live("click", function() {
    var book = $(this).attr("data-book");
    var chapter = $(this).attr("data-chapter");
    var verse = $(this).attr("data-verse");
    $.getJSON("http://www.reddit.com/r/Judaism/search/.json?q=" + book + chapter + "%3A" + verse + "&restrict_sr=on&jsonp=?", function(response) { 
      var $modal = $("<div>");
      $modal.append("Coming soon: verse discussion, and relevant info from web<br><br>");
      for (var i = 0; i < response.data.children.length; i++) {
        var $link = $("<a class='post'>");
        $link.attr("href", "http://www.reddit.com/" + response.data.children[i].data.permalink);
        $link.attr("target", "_blank");
        $link.html(response.data.children[i].data.title);
        $modal.append($link);
      }
      $modal.modal({overlayClose: true});
    });
  });

  resize();
  $(window).resize(resize);

  function resize () {
    if ($(window).width() > 1000)
      $("#search").attr("placeholder", "Click here to search for a book, verse, or phrase in English or Hebrew...");
    else if ($(window).width() > 860)
      $("#search").attr("placeholder", "Search for a book, verse, or phrase in English or Hebrew...");
    else if ($(window).width() > 680)
      $("#search").attr("placeholder", "Search for a book, verse, or phrase...");
    else
      $("#search").attr("placeholder", "Search...");
  }

  function getChapter (c) {
    c--;
    var verses = chapters[c].getElementsByTagName("v");
    $("ul.chapter").remove();
    var $chapter = $("<ul class='chapter'>");
    var chapterNum = chapters[c].attributes.getNamedItem("n").nodeValue;
    if (!stickyHeader) {
      $("h2").remove();
      $body.append("<h2 class='hebrew'> בְּרֵאשִׁית </h2>");
      $body.append("<h2 class='english'> Genesis </h2>");
    }
    $body.append($chapter);
    for (var v = 0; v < verses.length; v++) {
      var words = verses[v].getElementsByTagName("w");
      var verseNum = verses[v].attributes.getNamedItem("n").nodeValue;
      if (verseNum != prevVerse) {
        var $verse = $("<li class='verse'>");
        $verse.attr("data-verse", verseNum);
        $verse.attr("data-chapter", c + 1);
        $verse.attr("data-book", "Genesis");
        var $hebrew = $("<div class='hebrew'>");
        var $english = $("<div class='english'>");
        $english.appendTo($verse);
        $hebrew.appendTo($verse);
        $verse.appendTo($chapter);
        var englishLines = books[currentBook].chapters[c].verses[verseNum - 1].text;
        for (var l = 0; l < englishLines.length; l++)
          $english.append(englishLines[l] + "<br>");
      } else {
        $hebrew.append("<br>");
      }

      prevVerse = verseNum;
      for (var w = 0; w < words.length; w++) {
        var word = words[w].childNodes[0].nodeValue.replace(/\//g, "");
        if (word != ".")
          $hebrew.append(word + " ");
      }
    }
  }

  function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
  }
});
