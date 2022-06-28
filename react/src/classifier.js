/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

// Most likely problem areas:
// 1. Regex: Evaluation doesn't match evaluation when trained / gives weirdness
// 2. Sigmoid / Math: Floating point or rounding issues
// 3. Features vs. Weights: Order of features not matching the weights properly
// 4. Least Assignment (LAP): Could cause errors in calculation, as this was hand-made
// 5. Clusters: Using "similarity" distance instead of alignment distance? (check vs. Python version?)

let ClassifierRequest = class ClassifierRequest {
  constructor(lesson, input, config, expectation) {
    this.lesson = lesson;
    this.input = input;
    this.config = config;
    this.expectation = expectation;
  }
};

let ClassifierConfig = class ClassifierConfig {
  constructor(question, expectations, model_features) {
    this.question = question;
    this.expectations = expectations;
    this.model_features = model_features;
  }
};

let Expectation = class Expectation {
  constructor(expectationId, ideal) {
    this.expectationId = expectationId;
    this.ideal = ideal;
  }
};

let ClassifierResponse = class ClassifierResponse {
  constructor(output) {
    this.output = expectationId;
  }
};

let ClassifierResult = class ClassifierResult {
  constructor(expectationResults, speechActs) {
    this.expectationResults = expectationResults;
    this.speechActs = speechActs;
  }
};

let ExpectationResult = class ExpectationResult {
  constructor(expectationId, evaluation, score) {
    this.expectationId = expectationId;
    this.evaluation = evaluation;
    this.score = score;
  }
};

let SpeechActs = class SpeechActs {
  constructor(metacognitive, profanity) {
    metacognitive: ExpectationResult;
    profanity: ExpectationResult;
  }
};

const round = (number, decimalPlaces) => {
  const factorOfTen = Math.pow(10, decimalPlaces);
  return Math.round(number * factorOfTen) / factorOfTen;
};

class FeatureExtractor {
  constructor(embedding) {
    this.embeddings = embedding;
    this.avail_words = new Set(Object.keys(this.embeddings));
  }

  word_alignment_feature(example, ideal) {
    var cost = [];
    var common_words = example.filter((w) => new Set(ideal).has(w));
    var n_exact_matches = common_words.length;

    var ia_ = new Set(ideal);
    var example_ = new Set(example);

    for (var i = 0; i < common_words.length; i++) {
      example_.delete(common_words[i]);
      ia_.delete(common_words[i]);
    }

    if (ia_.size == 0) {
      return 1;
    }
    for (let ia_i of ia_) {
      if (!this.avail_words.has(ia_i)) continue;
      var inner_cost = Array();
      for (let e of example_) {
        if (!this.avail_words.has(e)) continue;
        var dist = this.word2vec_example_similarity([e], [ia_i]);
        inner_cost.push(dist);
      }
      cost.push(inner_cost);
    }

    const answer = lap(cost);
    const row_idx = answer[0];
    const col_idx = answer[1];
    var alignment = n_exact_matches;
    for (var i = 0; i < row_idx.length; i++) {
      alignment += cost[row_idx[i]][col_idx[i]];
    }

    return alignment / (ia_.size + n_exact_matches);
  }

  _avg_feature_vector(words, num_features) {
    var feature_vec = new Array(num_features).fill(0);
    var nwords = 0;
    var common_words = words.filter((w) => this.avail_words.has(w));
    for (var j = 0; j < common_words.length; j++) {
      nwords += 1;
      for (var i = 0; i < num_features; i++) {
        feature_vec[i] += this.embeddings[common_words[j]][i];
      }
    }

    if (nwords > 0) {
      for (var i = 0; i < num_features; i++) {
        feature_vec[i] = feature_vec[i] / nwords;
      }
    }

    return feature_vec;
  }

  _calculate_similarity(a, b) {
    var n = a.length;
    var num = 0;
    var den1 = 0;
    var den2 = 0;
    for (var i = 0; i < n; i++) {
      num += a[i] * b[i];
      den1 += a[i] * a[i];
      den2 += b[i] * b[i];
    }
    if ((den1 == 0) | (den2 == 0)) {
      return 0;
    }
    return num / (Math.sqrt(den1) * Math.sqrt(den2));
  }

  length_ratio_feature(example, ideal) {
    if (ideal.length > 0) {
      return 0.0;
    } else {
      return example.length / ideal.length;
    }
  }

  word2vec_example_similarity(example, ideal) {
    if (example.length == 1 && example[0] == '') {
      return 0;
    }
    if (ideal.length == 1 && ideal[0] == '') {
      return 0;
    }

    var example_feat_vec = this._avg_feature_vector(example, 100);
    var ideal_feat_vec = this._avg_feature_vector(ideal, 100);
    return this._calculate_similarity(example_feat_vec, ideal_feat_vec);
  }

  word2vec_question_similarity(example, question) {
    if (example.length == 1 && example[0] == '') {
      return 0;
    }
    var example_feat_vec = this._avg_feature_vector(example, 100);
    var question_feat_vec = this._avg_feature_vector(question, 100);
    return this._calculate_similarity(example_feat_vec, question_feat_vec);
  }

  regex_match_ratio(str_example, regexes) {
    if (regexes.length == 0) {
      return 0;
    }
    var count = 0;
    for (var regex of regexes) {
      var regex_var = new RegExp(regex);
      if (regex_var.test(str_example)) {
        count += 1;
      }
    }
    return count / regexes.length;
  }

  regex_match(str_example, regexes) {
    if (regexes.length == 0) {
      return [];
    }
    var matches = Array();
    for (var regex of regexes) {
      var regex_var = new RegExp(regex);
      if (regex_var.test(str_example)) {
        matches.push(1);
      } else {
        matches.push(0);
      }
    }
    return matches;
  }
}

function preprocess_punctuations(sentence) {
  sentence = sentence.replace(/[\-=]/g, ' ');
  sentence = sentence.replace('%', ' percent ');
  sentence = sentence.replace("n't", ' not');
  sentence = sentence.replace(/[()~!^,?.\'$]/g, '');
  return sentence;
}

function number_of_negatives(example) {
  var negative_regex =
    /\b(no|never|nothing|nowhere|none|not|havent|hasnt|hadnt|cant|couldnt|shouldnt|wont|wouldnt|dont|doesnt|didnt|isnt|arent|aint)\b/g;
  // var negative_regex =
  //   /\b(?:no|never|nothing|nowhere|none|not|havent|hasnt|hadnt|cant|couldnt|shouldnt|wont|wouldnt|dont|doesnt|didnt|isnt|arent|aint)\b/g;
  var str_example = example.join(' ');
  var replaced_example = str_example.replace("[.*'.*]", '');
  var no_of_negatives = [...replaced_example.matchAll(negative_regex)].length;
  var sec = 0;
  if (no_of_negatives % 2 == 0) {
    sec = 1;
  } else {
    sec = 0;
  }
  return [no_of_negatives, sec];
}

function preprocess_sentence(sentence) {
  sentence = preprocess_punctuations(sentence.toLowerCase());
  //alpha2digit skip for now
  var words = [];
  var words_ans = sentence.split(' ');
  for (var i = 0; i < words_ans.length; i++) {
    if (!stopwords.has(words_ans[i])) {
      words.push(words_ans[i]);
    }
  }
  return words;
}

function check_is_pattern_match(sentence, pattern) {
  const words = Array(new Set(preprocess_sentence(sentence)));
  var keywords = pattern.split('+');
  var is_there = true;
  for (var i = 0; i < keywords.length; i++) {
    var keyword = keywords[i].trim();
    if (keyword == '[NEG]' && number_of_negatives(words)[0] == 0) {
      is_there = false;
      break;
    } else if (keyword != '[NEG]' && !words.includes(keyword)) {
      is_there = false;
      break;
    }
  }
  if (is_there) {
    return 1;
  } else {
    return 0;
  }
}

// Least Assignment Problem?
function lap(cost) {
  let r = cost.length;
  let c = cost[0].length;
  if (c == 0) return [[], []];
  var cost_best = Number.MIN_VALUE;
  var col_idx = Array();

  function search(i, path, curr) {
    if (i == Math.min(r, c)) {
      if (curr > cost_best) {
        cost_best = curr;
        col_idx = path.filter(() => true);
      }
    } else {
      for (var j = 0; j < c; j++) {
        if (path.includes(j)) {
          continue;
        }
        path.push(j);
        search(i + 1, path, curr + cost[i][j]);
        path.pop();
      }
    }
  }

  var row_idx = Array();
  for (var i = 0; i < Math.min(r, c); i++) {
    row_idx.push(i);
  }

  search(0, Array(), 0);
  return [row_idx, col_idx];
}

function check_profanity(sentence) {
  var regex_var = new RegExp(
    /\b(\w*fuck\w*|ass|ass(hole|wipe|wad|kisser)|hell|shit|piss\w*|cock|cock(sucker|head|eater)|douche\w*|bitch\w*|retard[ed]|midget\w*|dyke|fag|faggot|cunt\w*|\w*nigg\w*|tranny|slut\w*|cum[bucket]|dick\w*|pussy\w*|dildo\w*|idiot\w*|(hate you)|stupid\w*)\b/g
  );
  if (regex_var.test(sentence.toLowerCase())) {
    return 1;
  } else {
    return 0;
  }
}

function check_meta_cognitive(sentence) {
  var regex_var = new RegExp(
    /\b(idk|belie\w*|don\w*|comprehend\w*|confuse\w*|guess\w*|(n[o']t)\s?\b(know\w*|underst\w*|follow\w*|recogniz\w*|sure\w*|get)\b|messed|no\s?(idea|clue)|lost|forg[eo]t|need\s?help|imagined?|interpret(ed)?|(seen?|saw)|suppos(ed)?)\b/g
  );
  // var regex_var = new RegExp(
  //   /\b(idk|belie\w*|don\w*|comprehend\w*|confuse\w*|guess\w*|(?<=n[o']t)\s?\b(know\w*|underst\w*|follow\w*|recogniz\w*|sure\w*|get)\b|messed|no\s?(idea|clue)|lost|forg[eo]t|need\s?help|imagined?|interpret(ed)?|(seen?|saw)|suppos(ed)?)\b/g
  // );
  if (regex_var.test(sentence.toLowerCase())) {
    return 1;
  } else {
    return 0;
  }
}

// USE BUILT-IN SIGMOID IF POSSIBLE! (check math libraries, due to floating point risks)
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function calculate_score(weights, bias, features) {
  var logit = bias;
  for (var i = 0; i < features.length; i++) {
    logit += features[i] * weights[i];
  }
  return sigmoid(logit);
}

export function evaluate(classifierRequest, embedding, model_features) {
  //model_features : Later must be read through lessonId
  var question = classifierRequest.config.question;
  var ans = classifierRequest.input;
  var ques_words = preprocess_sentence(question);
  var ans_words = preprocess_sentence(ans);
  var featExt = new FeatureExtractor(embedding);
  var expectationResults = [];

  for (var j = 0; j < classifierRequest.config.expectations.length; j++) {
    var expectation = classifierRequest.config.expectations[j];
    var ideal = expectation.ideal;
    var ideal_words = preprocess_sentence(ideal);
    const regex_good = featExt.regex_match(
      ans,
      model_features[expectation.expectationId]['regex_good']
    );
    const regex_bad = featExt.regex_match(
      ans,
      model_features[expectation.expectationId]['regex_bad']
    );
    const negatives = number_of_negatives(ans_words);
    var feat = Array();
    feat.push(negatives[0]);
    feat.push(negatives[1]);
    feat.push(featExt.word_alignment_feature(ans_words, ideal_words));
    feat.push(featExt.word2vec_example_similarity(ans_words, ideal_words));
    feat.push(featExt.word2vec_question_similarity(ans_words, ques_words));

    if (model_features[expectation.expectationId]['featureLengthRatio']) {
      feat.push(featExt.length_ratio_feature(ans_words, ideal_words));
    }
    if (
      model_features[expectation.expectationId]['featureRegexAggregateDisabled']
    ) {
      for (var val of regex_good) {
        feat.push(val);
      }
      for (var val of regex_bad) {
        feat.push(val);
      }
    } else {
      feat.push(
        featExt.regex_match_ratio(
          ans,
          model_features[expectation.expectationId]['regex_good']
        )
      );
      feat.push(
        featExt.regex_match_ratio(
          ans,
          model_features[expectation.expectationId]['regex_bad']
        )
      );
    }
    if (
      model_features[expectation.expectationId][
        'featureDbScanClustersArchetypeEnabled'
      ]
    ) {
      let archtype_good =
        model_features[expectation.expectationId]['archetype_good'];
      for (var i = 0; i < archtype_good.length; i++) {
        feat.push(
          featExt.word2vec_example_similarity(
            ans_words,
            archtype_good[i].split(' ')
          )
        );
      }

      let archtype_bad =
        model_features[expectation.expectationId]['archetype_bad'];
      for (var i = 0; i < archtype_bad.length; i++) {
        feat.push(
          featExt.word2vec_example_similarity(
            ans_words,
            archtype_bad[i].split(' ')
          )
        );
      }
    }

    var score = calculate_score(
      model_features[expectation.expectationId]['weights_bias'][0],
      model_features[expectation.expectationId]['weights_bias'][1],
      feat
    );

    if (score > 0.5) {
      expectationResults.push(
        new ExpectationResult(expectation.expectationId, 'GOOD', score)
      );
    } else {
      expectationResults.push(
        new ExpectationResult(expectation.expectationId, 'BAD', 1 - score)
      );
    }
  }
  return expectationResults;
}

export function evaluate_default(
  classifierRequest,
  embedding,
  model_features,
  ideal
) {
  //model_features : Later must be read throguh lessonId

  var question = classifierRequest.config.question;
  var ans = classifierRequest.input;
  var ques_words = preprocess_sentence(question);
  var ans_words = preprocess_sentence(ans);
  var expectationResults = [];
  var featExt = new FeatureExtractor(embedding);

  for (var j = 0; j < classifierRequest.config.expectations.length; j++) {
    var expectation = classifierRequest.config.expectations[j];
    var ideal_words = preprocess_sentence(ideal);

    const regex_good = featExt.regex_match(
      ans,
      model_features[expectation.expectationId]['regex_good']
    );
    const regex_bad = featExt.regex_match(
      ans,
      model_features[expectation.expectationId]['regex_bad']
    );

    const negatives = number_of_negatives(ans_words);
    var feat = Array();
    feat.push(negatives[0]);
    feat.push(negatives[1]);
    feat.push(featExt.word_alignment_feature(ans_words, ideal_words));
    feat.push(featExt.word2vec_example_similarity(ans_words, ideal_words));
    feat.push(featExt.word2vec_question_similarity(ans_words, ques_words));
    if (model_features[expectation.expectationId]['featureLengthRatio']) {
      feat.push(featExt.length_ratio_feature(ans_words, ideal_words));
    }

    if (
      model_features[expectation.expectationId]['featureRegexAggregateDisabled']
    ) {
      for (var val of regex_good) {
        feat.push(val);
      }
      for (var val of regex_bad) {
        feat.push(val);
      }
    } else {
      feat.push(
        featExt.regex_match_ratio(
          ans,
          model_features[expectation.expectationId]['regex_good']
        )
      );
      feat.push(
        featExt.regex_match_ratio(
          ans,
          model_features[expectation.expectationId]['regex_bad']
        )
      );
    }

    if (
      model_features[expectation.expectationId][
        'featureDbScanClustersArchetypeEnabled'
      ]
    ) {
      let archtype_good =
        model_features[expectation.expectationId]['archetype_good'];
      for (var i = 0; i < archtype_good.length; i++) {
        feat.push(
          featExt.word2vec_example_similarity(
            ans_words,
            archtype_good[i].split(' ')
          )
        );
      }

      let archtype_bad =
        model_features[expectation.expectationId]['archetype_bad'];
      for (var i = 0; i < archtype_bad.length; i++) {
        feat.push(
          featExt.word2vec_example_similarity(
            ans_words,
            archtype_bad[i].split(' ')
          )
        );
      }
    }

    var score = calculate_score(
      model_features[expectation.expectationId]['weights_bias'][0],
      model_features[expectation.expectationId]['weights_bias'][1],
      feat
    );

    if (score > 0.5) {
      expectationResults.push(
        new ExpectationResult(expectation.expectationId, 'GOOD', score)
      );
    } else {
      expectationResults.push(
        new ExpectationResult(expectation.expectationId, 'BAD', 1 - score)
      );
    }
  }
  return expectationResults;
}

var stopwords = new Set([
  'i',
  'me',
  'my',
  'myself',
  'we',
  'our',
  'ours',
  'ourselves',
  'you',
  "you're",
  "you've",
  "you'll",
  "you'd",
  'your',
  'yours',
  'yourself',
  'yourselves',
  'he',
  'him',
  'his',
  'himself',
  'she',
  "she's",
  'her',
  'hers',
  'herself',
  'it',
  "it's",
  'its',
  'itself',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  "that'll",
  'these',
  'those',
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'did',
  'doing',
  'an',
  'the',
  'and',
  'but',
  'if',
  'or',
  'because',
  'as',
  'until',
  'while',
  'of',
  'at',
  'by',
  'for',
  'with',
  'about',
  'against',
  'between',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'to',
  'from',
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'only',
  'own',
  'so',
  'than',
  'too',
  'very',
  'can',
  'will',
  'just',
  'should',
  "should've",
  'now',
  'll',
  're',
  've',
  "'s",
  ' ',
  '',
]);
