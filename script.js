$(document).ready(function(){

  var prevVerse = -1;
  var stickyHeader = false;
  var $body = $("body");
  var $header = $("#header");
  var $audio = $("#footer audio");
  var currentChapter = 1;
  var currentBook = 1;
  var books = [];
  var bookMap = [ "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges", "1samuel", "2samuel", "1kings", "2kings", "isaiah", "jeremiah", "ezekiel", "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk", "zephaniah", "haggai", "zechariah", "malachi", "psalms", "proverbs", "job", "songofsongs", "ruth", "lamentations", "ecclesiastes", "esther", "daniel", "ezra", "nehemiah", "1chronicles", "2chronicles" ];
  var audioBooks = [ "01", "02", "03", "04", "05", "06", "07", "08a", "08b", "09a", "09b", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "26", "28", "27", "30", "29", "32", "31", "33", "34", "35a", "35b", "25a", "25b" ];

  for (var i = 0; i < 40; i++) {
    books.push({});
  }

  $header.attr("data-book-number", 1);

  $.getJSON('english/genesis.json', function(response) {
    books[1].english = response;
    getChapter(currentChapter, currentBook);
  });

  function getHebrewBook(number) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET","hebrew/" + bookMap[number - 1] + ".xml", false);
    xmlhttp.send();
    var xmlDoc = xmlhttp.responseXML;
    books[number].hebrew = xmlDoc.getElementsByTagName("c");
    var hebname = xmlDoc.getElementsByTagName("hebrewname")[0];
    var engname = xmlDoc.getElementsByTagName("name")[0];
    books[number].hebrewName = hebname.textContent || hebname.innerText;
    books[number].name = engname.textContent || engname.innerText;
  }

  getHebrewBook(1);

  $audio.html("<source src='http://media.snunit.k12.il/kodeshm/mp3/t" + audioBooks[currentBook - 1] + pad(currentChapter,2) + ".mp3' type='audio/mpeg'>");

  $("#next").click(function() {
    $("ul.chapter").html("");
    $body.css("counter-reset", "chapter-num " + currentChapter);
    getChapter(++currentChapter, currentBook);
    $audio.html("<source src='http://media.snunit.k12.il/kodeshm/mp3/t" + audioBooks[currentBook - 1] + pad(currentChapter,2) + ".mp3' type='audio/mpeg'>");
  });

  $("#prev").click(function() {
    if (currentChapter > 1) {
      getChapter(--currentChapter, currentBook);
    }
  });

  $("#books").click(function(e) {
    e.stopPropagation();
    if ($("#book-dropdown").is(":visible")) {
      closeBookMenu();
    } else {
      $("#book-dropdown").slideDown();
      $(".chapter").addClass("faded");
      $(document).one("click", function(e){
        e.stopPropagation();
        e.preventDefault();
        closeBookMenu();
      });
    }
  });

  function closeBookMenu() {
    $("#book-dropdown").hide();
    $(".chapter").removeClass("faded");
  }

  $("#book-dropdown > li").click(function() {
    currentBook = $(this).parent().children().index(this) + 1;
    currentChapter = 1;

    if (!books[currentBook].hasOwnProperty("hebrew")) {
      getHebrewBook(currentBook);
    }

    if (!books[currentBook].hasOwnProperty("english")) {
      $.getJSON("english/" + currentBook + ".json", function(response) {
        books[currentBook].english = response;
        getChapter(currentChapter, currentBook);
      });
    } else {
      getChapter(currentChapter, currentBook);
    }
  });
  
  $("#search").keyup(function(e){
    if (e.which == 27) {
      $(this).val("");
      $(this).blur();
    }
  });

  $(window).keyup(function(e){
    if (e.which == 27 && $("#book-dropdown").is(":visible")) {
      closeBookMenu();
    }
  });

  /*
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
  */

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

  function getChapter (c, b) {

    $("ul.chapter").html("");

    c--;

    $body.css("counter-reset", "chapter-num " + c);
    $audio.html("<source src='http://media.snunit.k12.il/kodeshm/mp3/t" + audioBooks[b - 1] + pad(c+1,2) + ".mp3' type='audio/mpeg'>");
    var verses = books[b].hebrew[c].getElementsByTagName("v");
    $("ul.chapter").remove();
    var $chapter = $("<ul class='chapter'>");
    var chapterNum = books[b].hebrew[c].attributes.getNamedItem("n").nodeValue;

    if (!stickyHeader) {
      $("h2").remove();
      $body.append("<h2 class='hebrew'> " +  books[b].hebrewName + " </h2>");
      $body.append("<h2 class='english'> " + books[b].name + " </h2>");
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
        var englishLines = books[b].english.chapters[c].verses[verseNum - 1].text;
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

Object.prototype.hasOwnProperty = function(property) {
  return this[property] !== undefined;
};
