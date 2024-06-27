function generateUniqueId(wordCloudId, counter) {
  return `_wc_${wordCloudId}_${counter}`;
}

/* Dummy code to make sure events work in Workbench as well as
 * edx-platform*/
if (typeof Logger === 'undefined') {
  var Logger = {
    log: function (a, b) {
      return;
    }
  };
}

var word_cloud_2_element;
var result_cloud_section;

/**
 * @function showWordCloud
 *
 * @param {object} response The response from the server that contains the user's entered words
 * along with all of the top words.
 *
 * This function will set up everything for d3 and launch the draw method. Among other things,
 * it will determine maximum word size.
 */
function showWordCloud(response) {

  // word_cloud_2_element.show();

  // if (this.configJson && this.configJson.submitted) {
  //     this.showWordCloud(this.configJson);
  // }

  console.log('farhan.showWordCloud');
  console.log(typeof (response));
  console.log('farhan.response', response);
  console.log('farhan.top_words', response.top_words);

  const words = response.top_words;
  let maxSize = 0;
  let minSize = 10000;
  let scaleFactor = 1;
  let maxFontSize = 200;
  const minFontSize = 16;

  word_cloud_2_element.find('.input_cloud_section').hide();

  // Find the word with the maximum percentage. I.e. the most popular word.
  // eslint-disable-next-line no-undef
  $.each(words, (index, word) => {
    if (word.size > maxSize) {
      maxSize = word.size;
    }
    if (word.size < minSize) {
      minSize = word.size;
    }
  });

  // Find the longest word, and calculate the scale appropriately. This is
  // required so that even long words fit into the drawing area.
  //
  // This is a fix for: if the word is very long and/or big, it is discarded by
  // for unknown reason.
  // eslint-disable-next-line no-undef
  $.each(words, (index, word) => {
    let tempScaleFactor = 1.0;
    const size = ((word.size / maxSize) * maxFontSize);

    if (size * 0.7 * word.text.length > this.width) {
      tempScaleFactor = ((this.width / word.text.length) / 0.7) / size;
    }

    if (scaleFactor > tempScaleFactor) {
      scaleFactor = tempScaleFactor;
    }
  });

  // Update the maximum font size based on the longest word.
  maxFontSize *= scaleFactor;

  // console.log("farhan. word sizes max:" + maxSize + " min:" + minSize);
  // console.log("farhan. word sizes maxFontSize:" + maxFontSize + " minFontSize:" + minFontSize);
  // console.log("farhan. word scaleFactor:" + scaleFactor);
  // console.log('words: ', words);
  // console.log('farhan.response', response);

  // Dimensions of the box where the word cloud will be drawn.
  this.width = 635;
  this.height = 635;

  // var words = ["Hello", "Everybody", "How", "Are", "You", "Today", "It", "Is", "A", "Lovely", "Day", "I", "Love", "Coding", "In", "My", "Van", "Mate"]
  var layout = d3.layout.cloud()
    .size([this.width, this.height])
    .words(words)
    .rotate(function () {
      return (Math.random() * 2) * 90;
    })
    .font("Impact")
    .fontSize((d) => {
      let size = (d.size / maxSize) * maxFontSize;
      size = size >= minFontSize ? size : minFontSize;
      return size;
    })
    .on("end", (wds, bounds) => {
      drawWordCloud(response, wds, bounds, layout);
      // draw(words, layout);
    });
  layout.start();
}

function draw(words, layout) {
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 450 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  svg
    .append("g")
    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
    .selectAll("text")
    .data(words)
    .enter().append("text")
    .style("font-size", function (d) {
      return d.size + "px";
    })
    .attr("text-anchor", "middle")
    .attr("transform", function (d) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function (d) {
      return d.text;
    });
}

/**
 * @function drawWordCloud
 *
 * This function will be called when d3 has finished initing the state for our word cloud,
 * and it is ready to hand off the process to the drawing routine. Basically set up everything
 * necessary for the actual drwing of the words.
 *
 * @param {object} response The response from the server that contains the user's entered words
 * along with all of the top words.
 *
 * @param {array} words An array of objects. Each object must have two properties. One property
 * is 'text' (the actual word), and the other property is 'size' which represents the number that the
 * word was enetered by the students.
 *
 * @param {array} bounds An array of two objects. First object is the top-left coordinates of the bounding
 * box where all of the words fir, second object is the bottom-right coordinates of the bounding box. Each
 * coordinate object contains two properties: 'x', and 'y'.
 */
function drawWordCloud(response, words, bounds, layout) {

  // draw(words, layout);
  // return;

  // Dimensions of the box where the word cloud will be drawn.
  this.width = 635;
  this.height = 635;

  console.log("farhan.drawWordCloud called");
  console.log("farhan.words: ", words);
  console.log("farhan.response: ", response);

  // Color words in different colors.
  const fill = d3.scale.category20();

  // Will be populated by words the user enetered.
  const studentWordsKeys = [];

  // By default we do not scale.
  let scale = 1;

  // Caсhing of DOM element
  // const cloudSectionEl = this.wordCloudEl.find('.result_cloud_section');
  const cloudSectionEl = result_cloud_section;


  // Iterator for word cloud count for uniqueness
  let wcCount = 0;

  // If bounding rectangle is given, scale based on the bounding box of all the words.
  if (bounds) {
    scale = 0.5 * Math.min(
      this.width / Math.abs(bounds[1].x - (this.width / 2)),
      this.width / Math.abs(bounds[0].x - (this.width / 2)),
      this.height / Math.abs(bounds[1].y - (this.height / 2)),
      this.height / Math.abs(bounds[0].y - (this.height / 2)),
    );
  }

  // eslint-disable-next-line no-undef
  $.each(response.student_words, (word, stat) => {
    const percent = (response.display_student_percents) ? ` ${Math.round(100 * (stat / response.total_count))}%` : '';

    studentWordsKeys.push(interpolateHtml(
      '{listStart}{startTag}{word}{endTag}{percent}{listEnd}',
      {
        listStart: HTML('<li>'),
        startTag: HTML('<strong>'),
        word,
        endTag: HTML('</strong>'),
        percent,
        listEnd: HTML('</li>'),
      },
    ).toString());
  });

  // Comma separated string of user enetered words.
  const studentWordsStr = studentWordsKeys.join('');

  cloudSectionEl
    .addClass('active');

  setHtml(
    cloudSectionEl.find('.your_words'),
    HTML(studentWordsStr),
  );

  setHtml(
    cloudSectionEl.find('.your_words').end().find('.total_num_words'),
    interpolateHtml(
      '{start_strong}{total}{end_strong} words submitted in total.',
      {
        start_strong: HTML('<strong>'),
        end_strong: HTML('</strong>'),
        total: response.total_count,
      },
    ),
  );

  // eslint-disable-next-line no-undef
  $(`${cloudSectionEl.attr('id')} .word_cloud`).empty();

  // Actual drawing of word cloud.
  // const groupEl = d3.select(`#${cloudSectionEl.attr('id')} .word_cloud`).append('svg')
  const groupEl = d3.select("#my_dataviz").append('svg')
    .attr('width', this.width)
    .attr('height', this.height)
    .append('g')
    .attr('transform', `translate(${0.5 * this.width},${0.5 * this.height})`)
    .selectAll('text')
    .data(words)
    .enter()
    .append('g')
    .attr('data-id', () => {
      wcCount += 1;
      return wcCount;
    })
    .attr('aria-describedby', () => interpolateHtml(
      'text_word_{uniqueId} title_word_{uniqueId}',
      {
        // eslint-disable-next-line no-undef
        uniqueId: generateUniqueId(cloudSectionEl.attr('id'), $(this).data('id')),
      },
    ));

  groupEl
    .append('title')
    .attr('id', () => interpolateHtml(
      'title_word_{uniqueId}',
      {
        // eslint-disable-next-line no-undef
        uniqueId: generateUniqueId(cloudSectionEl.attr('id'), $(this).parent().data('id')),
      },
    ))
    .text((d) => {
      let res = '';

      // eslint-disable-next-line no-undef
      $.each(response.top_words, (index, value) => {
        if (value.text === d.text) {
          res = `${value.percent}%`;
        }
      });

      return res;
    });

  groupEl
    .append('text')
    .attr('id', () => interpolateHtml(
      'text_word_{uniqueId}',
      {
        // eslint-disable-next-line no-undef
        uniqueId: generateUniqueId(cloudSectionEl.attr('id'), $(this).parent().data('id')),
      },
    ))
    .style('font-size', d => `${d.size}px`)
    .style('font-family', 'Impact')
    .style('fill', (d, i) => fill(i))
    .attr('text-anchor', 'middle')
    .attr('transform', d => `translate(${d.x}, ${d.y})rotate(${d.rotate})scale(${scale})`)
    .text(d => d.text);
}

/**
 * @function submitAnswer
 *
 * Callback to be executed when the user eneter his words. It will send user entries to the
 * server, and upon receiving correct response, will call the function to generate the
 * word cloud.
 */
function submitAnswer(runtime, element) {
  console.log('farhan.submitAnswer');
  const data = {student_words: []};

  // const wordCloudEl = $(element).find('.word_cloud_2');

  word_cloud_2_element = $('.word_cloud_2', element);
  result_cloud_section = $('.result_cloud_section', element);
  // Populate the data to be sent to the server with user's words.
  word_cloud_2_element.find('input.input-cloud').each((index, value) => {
    // eslint-disable-next-line no-undef
    console.log('farhan.wordCloudEl.find(index, value)', $(value).val());
    data.student_words.push($(value).val());
  });

  var handlerUrl = runtime.handlerUrl(element, 'prepare_data');
  $.ajax({
    type: "POST",
    url: handlerUrl,
    data: JSON.stringify(data),
    success: showWordCloud
  });
}

function WordCloudXBlock(runtime, element, data) {
  console.log('farhan.word_cloud.WordCloudXBlock called');

  // $(element).find('.word_cloud_2').hide();
  $('.save', element).on('click', () => {
    submitAnswer(runtime, element);
  });
}

function setHtml(element, html) {
  return $(element).html(ensureHtml(html).toString());
}

function interpolateHtml(formatString, parameters) {
  var result = StringInterpolate(
    ensureHtml(formatString).toString(),
    mapObject(parameters, ensureHtml)
  );
  return HTML(result);
}

function ensureHtml(html) {
  if (html instanceof HtmlSnippet) {
    return html;
  } else {
    return HTML(escape(html));
  }
}

function HtmlSnippet(htmlString) {
  this.text = htmlString;
}

HtmlSnippet.prototype.valueOf = function () {
  return this.text;
};
HtmlSnippet.prototype.toString = function () {
  return this.text;
};

function StringInterpolate(formatString, parameters) {
  return formatString.replace(/{\w+}/g,
    function (parameter) {
      var parameterName = parameter.slice(1, -1);
      return String(parameters[parameterName]);
    });
}

HTML = function (htmlString) {
  return new HtmlSnippet(htmlString);
};

function mapObject(obj, iteratee) {
  var result = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = iteratee(obj[key], key, obj);
    }
  }
  return result;
}

function escape(string) {
  // If the string is null or undefined, return an empty string
  if (string == null) return '';

  // Create a map of characters to their escaped equivalents
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  // Create a regular expression to match characters that need to be escaped
  var escaper = /[&<>"'`]/g;

  // Replace each character in the string with its escaped equivalent
  return ('' + string).replace(escaper, function (match) {
    return escapeMap[match];
  });
}
