// Globals
devmode = false;
category_labels = ['airplane', 'ape', 'axe', 'blimp', 'bread', 'butterfly', 'car', 'castle',
                   'cat', 'cup', 'elephant', 'fish', 'flower', 'hat', 'hotdog', 'jack-o-lantern',
                   'jellyfish', 'kangaroo', 'lion', 'motorcycle', 'mushroom', 'piano', 'raccoon', 'stingray',
                   'saw', 'scorpion', 'skyscraper', 'snake', 'squirrel', 'tree', 'windmill', 'window'
]

// Define experiment metadata object
function Experiment() {
  this.type = 'part-listing';
  this.dbname = 'partnaming';
  this.colname = 'photodraw32_category_annotation'
  this.iterationName = 'demo' // remember to change to correct iteration name when running study   livetest1
  this.devMode = devmode; // Change this to TRUE if testing in dev mode (short trial videos) or FALSE for real experiment
}

function setupGame() {
  // get experiment ID information from URL
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var prolificID = urlParams.get('PROLIFIC_PID') // ID unique to the participant
  var studyID = urlParams.get('STUDY_ID') // ID unique to the study
  var sessionID = urlParams.get('SESSION_ID') // ID unique to the particular submission

  var main_on_finish = function(data) {
    console.log('emitting trial data', data)
  }

  var additionalInfo = {
    prolificID: prolificID,
    studyID: studyID,
    sessionID: sessionID, // this is the same as gameID
    gameID: '123', // we can replace with sessionID if we want to
    on_finish: main_on_finish
  }

  // Create raw trials list
  function createTrialsList() {
    rawTrials = _.map(_.shuffle(category_labels), function(cat, i) {
      return trial = _.extend({}, new Experiment, additionalInfo, {
        category: cat,
        trialNum: i,
        preamble: "Please list all of the visible parts of a <i>" + cat + "</i>",
        required: true,
        open_boxes: 0,
        questions: [{
            prompt: '',
            name: 'attribute_1',
            placeholder: 'part',
            required: true
          },
          {
            prompt: '',
            name: 'attribute_2',
            placeholder: 'part',
            required: true
          },
          {
            prompt: '',
            name: 'attribute_3',
            placeholder: 'part',
            required: true
          },
          {
            prompt: '',
            name: 'attribute_4',
            placeholder: 'part',
            required: false
          },
          {
            prompt: '',
            name: 'attribute_5',
            placeholder: 'part',
            required: false
          },
          {
            prompt: '',
            name: 'attribute_6',
            placeholder: 'part',
            required: false
          },
          {
            prompt: '',
            name: 'attribute_7',
            placeholder: 'part',
            required: false
          },
          {
            prompt: '',
            name: 'attribute_8',
            placeholder: 'part',
            required: false
          },
          {
            prompt: '',
            name: 'attribute_9',
            placeholder: 'part',
            required: false
          },
          {
            prompt: '',
            name: 'attribute_10',
            placeholder: 'part',
            required: false
          },
        ]
      });
    })
    return rawTrials
  };

  // Define consent form language
  consentHTML = {
    'str1': '<p> Hello! In this study, you will be describing various objects!!</p>\
              <p> We expect the average game to last about 30 minutes, including the time it takes to read these instructions.</p>\
          <i><p> Note: We recommend using Chrome. We have not tested this study in other browsers.</p></i>',
  }
  // Define instructions language
  instructionsHTML = {
    'str1': "<p id = 'tightinstruction'>We are interested in what specific <b>parts</b> of an object come to mind when you imagine what that object looks like. For example, suppose you are asked to imagine a <i>chair</i>. Try your best to conjure up a vivid mental picture of what a typical chair looks like. What are the individual parts of that chair that you \'see\' in that mental picture?</i></p> <br><img id='thought' height = '250' src = 'stimuli/thinking.png'></p>",
    'str2': '<p id = "exampleprompt">Suppose your mental picture looks like this! <br> <img id="chair" height = "450" src = "stimuli/chair.png"></p> You will be asked to name all of its basic parts. In this example, you might say: <i>seat, armrest, leg, and backrest</i>. </p>',
    'str3': ["<u><p id='legal'>Some guidelines to keep in mind:</p></u>",
      '<p id = "exampleprompt">\
                  <img id="check" height = "35" src = "stimuli/check.png"> Please only list concrete parts. Please do NOT list other properties of the object (e.g., <i>comfy, tall</i>).</p>\
              <p><img id="check" height = "35" src = "stimuli/check.png"> Please use common names for parts that you think most other people would understand. Avoid jargon.</p>\
              <p><img id="check" height = "35" src = "stimuli/check.png"> If the same part occurs multiple times in that object (e.g., a <i>chair</i> might have four legs), please only list that part once. For example, just say: <i>leg</i>. Please avoid language like: <i>back left leg; front right leg</i>. </p> \
              <p><img id="check" height = "35" src = "stimuli/check.png"> Please list ALL of the parts of the object, rather than only the most obvious ones. For example, an incomplete list for <i>chair</i> would be: <i>leg; backrest</i>.</p>'
    ].join(' '),
    'str4': "<p> <u>COMPREHENSION CHECK</u> </p>\
              <p>Please answer the following questions regarding appropriate parts. Please select the option with the part that meets all of the criteria for this study. You must correctly answer all of the questions in order to move onto the study and recieve compensation. </p>",
    'str5': '<p><br>Great job! Your task is to list as many parts of the object that come to mind as you can. <br>\
                <br>Here is an example of what the interface of a trial looks like: <br>\
                <br><img id="catexample" height = "350" src = "stimuli/categoryexample.png"></p>\
              <p>You must list at least 3 parts of the object. List each part as a single word with one part in each box. Please do not use sentences to describe the parts.</p>',
    'str6': "<p> In total, this study should take around 30 minutes. Once you are finished, the study will be automatically submitted for approval. If you encounter a problem or error, please send us an email <a href='mailto://cogtoolslab.requester@gmail.com'>(cogtoolslab.requester@gmail.com)</a> and we will make sure you're compensated for your time. Thank you again for contributing to our research! Let's begin! </p>"
  }

  // Create consent + instructions instructions trial
  var welcome1 = {
    type: 'instructions',
    pages: [
      consentHTML.str1,
      instructionsHTML.str1,
      instructionsHTML.str2,
      instructionsHTML.str3,
      instructionsHTML.str4,
    ],
    force_wait: devmode ? 0 : 2000,
    show_clickable_nav: true,
    allow_keys: devmode,
    allow_backward: false
  };

  var welcome2 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str5,
      instructionsHTML.str6,
    ],
    force_wait: devmode ? 0 : 2000,
    show_clickable_nav: true,
    allow_keys: devmode,
    allow_backward: false
  };

  // Create comprehension check survey
  var comprehensionSurvey = {
    type: 'survey-multi-choice',
    comprehension: true,
    preamble: "<br><strong>COMPREHENSION CHECK</strong>",
    questions: [{
        prompt: "Which of the following is a valid part of a <i>bird</i>?",
        name: 'bird', // "To make a drawing that looks like a generic version of each object, but not any specific example."
        options: ["wing", "sparrow", "flying"],
        required: true
      },
      {
        prompt: "Which one of the following is a valid part of a <i>dog</i>?",
        name: 'dog',
        options: ["puppy", "furry", "tail"],
        required: true
      },
      {
        prompt: "Which one of the following is a valid part of a <i>grasshopper</i>?",
        name: 'grasshopper',
        options: [
          "pronotum",
          "head",
          "abdominal segment"
        ],
        required: true
      },
      {
        prompt: "Which one of the following is a valid part of a <i>chair</i>?",
        name: 'chair',
        options: ["back right leg", "seat", "wooden"],
        required: true
      },
      {
        prompt: "Which of the following is a valid list of parts for a <i>mouse</i>?",
        name: 'mouse',
        options: [
          "head, tail, body, whisker, paw, eye, nose, mouth",
          "head, body",
          "mouse"
        ],
        required: true
      }
    ]
  }

  // Check whether comprehension check is answered correctly
  var loopNode = {
    timeline: [comprehensionSurvey],
    loop_function: function(data) {

      resp = JSON.parse(data.values()[0]['responses']);
      if ((resp["bird"] == 'wing' &&
          resp["dog"] == "tail" &&
          resp["grasshopper"] == "head" &&
          resp['chair'] == "seat" &&
          resp['mouse'] == "head, tail, body, whisker, paw, eye, nose, mouth")) {
        return false;
      } else {
        alert('Try again! One or more of your responses was incorrect. Please try again!');
        return true;
      }
    }
  }


  // exit survey trials
  var exitSurveyChoice = _.extend({}, new Experiment, additionalInfo, {
    type: 'survey-multi-choice',
    preamble: "<strong><u>Survey</u></strong>",
    questions: [{
        prompt: "What is your gender?",
        name: "participantSex",
        horizontal: true,
        options: ["Male", "Female", "Other", "Do Not Wish To Say"],
        required: true
      },
      {
        prompt: "How difficult did you find this study? (1: very easy, 7: very hard)",
        name: "judgedDifficulty",
        horizontal: true,
        options: ["1", "2", "3", "4", "5", "6", "7"],
        required: true
      },
      {
        prompt: "Did you encounter any technical difficulties while completing this study? \
        This could include: images or videos were glitchy (e.g., did not load, froze, or appeared \
        to stop too soon), labelling interface was glitchy, or sections of the study did \
        not load properly.",
        name: "technicalDifficultiesBinary",
        horizontal: true,
        options: ["Yes", "No"],
        required: true
      }
    ],
    on_finish: main_on_finish
  });

  // Add survey page after trials are done
  var surveyTextInfo = _.omit(_.extend({}, new Experiment, additionalInfo));
  var exitSurveyText = _.extend({}, surveyTextInfo, {
    type: 'survey-text',
    preamble: "<strong><u>Survey</u></strong>",
    questions: [{
        name: "TechnicalDifficultiesFreeResp",
        prompt: "If you encountered any technical difficulties, please briefly describe the issue.",
        placeholder: "I did not encounter any technical difficulities.",
        rows: 5,
        columns: 50,
        required: false
      },
      {
        name: 'participantAge',
        prompt: "What is your year of birth?",
        placeholder: "2020",
        required: true
      },
      {
        name: 'participantYears',
        prompt: "How many years old are you?",
        placeholder: "18",
        required: true
      },
      {
        name: 'participantComments',
        prompt: "Thank you for participating in our study! Do you have any other comments or feedback \
        to share with us about your experience?",
        placeholder: "I had a lot of fun!",
        rows: 5,
        columns: 50,
        require: false
      }
    ],
    on_finish: main_on_finish
  });

  // Create goodbye trial (this doesn't close the browser yet)
  var goodbye = {
    type: 'instructions',
    pages: [
      'Thanks for participating in our experiment! You are all done now.'
    ],
    show_clickable_nav: true,
    allow_backward: false,
    button_label_next: '< submit',
    on_finish: () => {
      window.open("https://justintheyang.github.io/","_self")
    }
  }

  // create trials list and add instrutions and exit survey
  trials = createTrialsList()

  trials.unshift(welcome2);
  devmode ? null : trials.unshift(loopNode);
  trials.unshift(welcome1);


  // append exit surveys
  trials.push(exitSurveyChoice);
  trials.push(exitSurveyText);

  // append goodbye trial
  trials.push(goodbye);

  jsPsych.init({
    timeline: trials,
    default_iti: 1000,
    show_progress_bar: true
  });

}
