// Globals
devmode = false; // Change this to TRUE if testing in dev mode (no instructions) or FALSE for real experiment

// Define experiment metadata object
function Experiment() {
  this.type = 'part-listing';
  this.dbname = 'partnaming';
  this.colname = 'partnaming_exemplar_annotation'
  this.iterationName = 'demo'; // remember to change to correct iteration name when running study
  this.devMode = devmode;
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
    gameID: '123',   // we can replace with sessionID if we want to
    on_finish: main_on_finish
  }

  // Create raw trials list
  function createTrialsList(batch_num) {
    rawTrials = _.map(_.shuffle(metadata32.filter(o => o.batch_num == batch_num)), function(n, i) {
      return trial = _.extend({}, new Experiment, additionalInfo, {
        batch_num: batch_num,
        trialNum: i,
        category: n.category,
        preamble: "Please list all of the parts of this <i>" + (n.category === 'car_(sedan)' ? 'car' : n.category) + 
        "</i><div id='trialimage'><img width=250px src='" + n.s3_url + "'></div>",
        required: true,
        catch_trial: false,
        img_id: n.s3_url,
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
    'str1': '<p> Hello! In this study, you will be describing various objects!</p> \
    <p> We expect the average game to last about 30 minutes, including the time \
    it takes to read these instructions.</p> \
    <i><p> Note: We recommend using Chrome. We have not tested this study in other browsers.</p></i>',
  }

  // Define instructions language
  instructionsHTML = {
    'str1': "<p id = 'tightinstruction'> In this study, we are interested in what specific <b>parts</b> \
      of an object may come to mind when you see an object. \
      For example, suppose you are shown a picture of a <i>chair</i>. \
      What are the individual parts of the chair that you see in that picture?</i></p> \
      <br> <img id='thought' height = '250' src = 'stimuli/thinking.png'></p>",
    'str2': '<p id = "exampleprompt">Suppose this the picture of the object that you are shown! \
      In each trial, you will be asked to name all of the basic parts of the object.<br> \
      <img id="chair" height = "450" src = "stimuli/chair.png"></p> \
      <p>In this particular example, you might list these parts: <i>seat, armrest, leg, and backrest</i>.</p>',
    'str3': ["<u><p id='legal'>Some guidelines to keep in mind:</p></u>",
      '<p id = "exampleprompt"> \
        <img id="check" height = "35" src = "stimuli/check.png"> Please only list concrete parts. Please do NOT list other properties of the object (e.g., <i>comfy, tall</i>).</p> \
        <p><img id="check" height = "35" src = "stimuli/check.png">Please use common names for parts that you think most other people would understand. Avoid jargon.</p> \
        <p><img id="check" height = "35" src = "stimuli/check.png"> If the same part occurs multiple times in that object (e.g., a <i>chair</i> might have four legs), please only list that part once. For example, just say: <i>leg</i>. Please avoid language like: <i>back left leg; front right leg</i>.</p> \
        <p><img id="check" height = "35" src = "stimuli/check.png"> Please list ALL of the parts of the object, rather than only the most obvious ones. For example, an incomplete list for <i>chair</i> would be: <i>leg; backrest</i> </p>',
    ].join(' '),
    'str4': "<p> <u>COMPREHENSION CHECK</u></p>Please answer the following questions regarding appropriate parts. \
      Please select the option with the part that meets all of the criteria for this task. \
      You must correctly answer all of the questions in order to move onto the study and recieve compensation. \
      If you fail the comprehension check, you will be allowed to review the instructions and retry the comprehension check before moving on.</p>",
    'str5': '<p> Great job! Your task is to list as many parts of the object that come to mind as you can. \
      Here is an example of a trial : <br> \
      <img id="example" height = "350" src = "stimuli/exemplarexample.png"></p> \
      You must list at least 3 parts of the object.</p><p>List each part as a single word with one part in each box. \
      Please do not use sentences to describe the parts.</p>',
    'str6': "<p>In total, this study should take around 30 minutes. \
      Once you are finished, the study will be automatically submitted for approval. \
      If you encounter a problem or error, please send us an email \
      <a href='mailto://cogtoolslab.requester@gmail.com'>(cogtoolslab.requester@gmail.com)</a> \
      and we will make sure you're compensated for your time. \
      Thank you again for contributing to our research! Let's begin! </p>"
  }

  // Create consent + instructions instructions trial
  var welcome_consent = {
    type: 'instructions',
    pages: [
      consentHTML.str1,
    ],
    force_wait: 2000,
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: true
  }
  var welcome1 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str1,
      instructionsHTML.str2,
      instructionsHTML.str3,
      instructionsHTML.str4,
    ],
    force_wait: 2000,
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: true
  };

  var welcome2 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str5,
      instructionsHTML.str6,
    ],
    force_wait: 2000,
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: true
  };

  // Create comprehension check survey
  var comprehensionSurvey = {
    type: 'survey-multi-choice',
    preamble: "<br><strong>Comprehension Check</strong>",
    questions: [{
        prompt: "Which of the following is a valid part of this <i>bird</i>?<br> \
        <img id='bird' height='250' src='stimuli/bird.png'></br> \
        Please select a label option:",
        name: 'bird',
        options: ["wing", "sparrow", "flying"],
        required: true
      },
      {
        prompt: "Which one of the following is a valid part of this <i>dog</i>?<br>\
        <img id='dog' height = '250' src = 'stimuli/dog.png'></br> \
        Please select a label option:",
        name: 'dog',
        options: ["puppy", "furry", "tail"],
        required: true
      },
      {
        prompt: "Which one of the following is a valid part of this <i>chair</i>?<br> \
        <img id='chair-quiz' height='250' src='stimuli/chair.png'></br> \
        Please select a label option:",
        name: 'chair',
        options: ["back right leg", "seat", "wooden"],
        required: true
      },
      {
        prompt: "Which one of the following is a valid part of this <i>grasshopper</i>?<br> \
        <img id='ghop' height='250' src='stimuli/grasshopper.png'></br> \
        Please select a label option:",
        name: 'grasshopper',
        options: ["pronotum", "head", "abdominal segment"],
        required: true
      },
      {
        prompt: "Which of the following is a valid list of parts for this <i>mouse</i>?<br> \
        <img id='mouse' height='250' src='stimuli/mouse.png'></br> \
        Please select a label option:",
        name: 'mouse',
        options: ["head, tail, body, whisker, paw, eye, nose, mouth", "head, body", "mouse"],
        required: true
      }
    ]
  }

  // Check whether comprehension check is answered correctly
  var loopNode = {
    timeline: [welcome1, comprehensionSurvey],
    loop_function: function(data) {

      resp = JSON.parse(data.values()[1]['responses']);
      if ((resp["bird"] == 'wing' &&
          resp["dog"] == "tail" &&
          resp['chair'] == "seat")) {
        return false;
      } else {
        alert('One or more of your responses was incorrect. You will be sent to review the instructions. Please try again!');
        return true;
      }
    }
  }

  // exit survey trials
  var surveyChoiceInfo = _.omit(_.extend({}, additionalInfo, new Experiment), ['type', 'dev_mode']);
  var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
    type: 'survey-multi-choice',
    preamble: "<strong><u>Exit Survey</u></strong>",
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
    }],
    on_finish: main_on_finish
  });

  // Add survey page after trials are done
  var surveyTextInfo = _.omit(_.extend({}, additionalInfo, new Experiment), ['type', 'dev_mode']);
  var exitSurveyText = _.extend({}, surveyTextInfo, {
    type: 'survey-text',
    preamble: "<strong><u>Exit Survey</u></strong>",
    questions: [{
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
        name: "criteriaForDecisions",
        prompt: "Please share a few words about how you made your judgements.",
        placeholder: "I made my judgements based on...",
        rows: 5,
        columns: 50,
        required: false
      },
      {
        name: 'participantComments',
        prompt: "Thank you for participating in our HIT! Do you have any other comments or feedback to share with us about your experience?",
        placeholder: "I had a lot of fun!",
        rows: 5,
        columns: 50,
        required: false
      },
      {
        name: "TechnicalDifficultiesFreeResp",
        prompt: "If you encountered any technical difficulties, please briefly describe the issue.",
        placeholder: "I did not encounter any technical difficulities.",
        rows: 5,
        columns: 50,
        required: false
      }
    ],
    on_finish: main_on_finish
  });

  // Create goodbye trial (this doesn't close the browser yet)
  var goodbye = {
    type: 'instructions',
    pages: [
      'Thanks for participating in our experiment! You are all done now. Please click the submit button to complete the study.'
    ],
    show_clickable_nav: true,
    allow_backward: false,
    button_label_next: '< submit',
    on_finish: () => {
      window.onbeforeunload = null;
      
      window.open("https://justintheyang.github.io/","_self")
    }
  }

  var enter_fullscreen = {
    type: 'fullscreen',
    fullscreen_mode: true
  }  

  // create trials list and add instrutions and exit survey
  trials = createTrialsList(0)

  trials.unshift(enter_fullscreen);
  devmode ? null : trials.unshift(welcome2);
  devmode ? null : trials.unshift(loopNode);
  devmode ? null : trials.unshift(welcome_consent);

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
