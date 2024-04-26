// ----- SWITCH THESE FLAGS depending on which 'game' we are running -----
// options: 'group1', 'group2', 'group3', or 'group4' (or 'generateIntro')
const whichGroup = 'group1'

// IMPORTANT NOTE! If you change the above, you need to restart app.js in terminal
// ALSO! Make sure that whichGame matches in setup.js so that the catchTrial matches

const interationName = 'remaining75_pilot_2' // remaining75_pilot_1

function sendData(data) {
  console.log('sending data to mturk');
}

// Define trial object with boilerplate using global variables from above
function Trial() {
	this.type = 'jspsych-stroke-kid-annotations',
  this.dbname = 'part_annotations';
  this.colname = 'part_annotations'; 
  this.iterationName = interationName; 
};

function setupGame() {    
  // Get workerId, etc. from URL (so that it can be sent to the server)
  // get PROLIFIC participantID
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var prolificID = urlParams.get('PROLIFIC_PID')   // ID unique to the participant
  var studyID = urlParams.get('STUDY_ID')          // ID unique to the study
  var sessionID = urlParams.get('SESSION_ID')      // ID unique to the particular submission

  // These are flags to control which trial types are included in the experiment
  const includeIntro = true;
  const includeQuiz = true;
  const includeExitSurvey = true;
  const includeGoodbye = true;

  // flag for streamlining study timing and making introduce images + gifs with cat trial
  const debuggingMode = false;

  if (debuggingMode) {
    var introButtonTiming = 0;
    var introGifTiming_1 = 0;
    var introGifTiming_2 = 0;
    var introGifTiming_3 = 0;
    var introGifTiming_4 = 0;
  } else {
    var introButtonTiming = 2000;
    var introGifTiming_1 = 14000;
    var introGifTiming_2 = 13000;
    var introGifTiming_3 = 7000;
    var introGifTiming_4 = 3000;
  }

  // recruitment platform
  const mTurk = false;

  if (mTurk) {
    var recruitmentPlatform = 'mturk'
  } else {
    // IMPORTANT! Change to either SONA or PROLIFIC! 
    var recruitmentPlatform = 'SONA'
  };

  var meta = metadata.meta;
  var gameid = '123';

  // console.log('meta', meta);

  // at end of each trial save data locally and send data to server
  var main_on_finish = function(data) {
    console.log('emitting data');
  }

  // add additional default info so that experiment doesnt break without any stim uploaded
  var additionalInfo = {
    // add prolific info
    prolificID:  prolificID,
    studyID: studyID, 
    sessionID: sessionID,
    // add usual info
    gameID: gameid,
    recruitmentPlatform: recruitmentPlatform,
    on_finish: main_on_finish
  }

  // shuffle trials within batches
  meta_shuff = _.shuffle(meta);

  // which catchTrial do we want? 
  if (meta_shuff[0]['strokes'][0]['group'] == 'generateIntro') {
    // example trial used in intro instructions for generated images and gifs
    var catchTrial = _.extend({}, cat_example_intro, new Trial, {
      type: 'jspsych-stroke-kid-annotations',
      catch: true,
    });
  } else if (meta_shuff[0]['strokes'][0]['group'] == 'group1') {
    // real catchTrial used for checking accuracy performance of real participants!
    var catchTrial = _.extend({}, cat_example, new Trial, { 
      type: 'jspsych-stroke-kid-annotations',
      catch: true,
    });
  } else if (meta_shuff[0]['strokes'][0]['group'] == 'group2') {
    var catchTrial = _.extend({}, lion_example, new Trial, {
      type: 'jspsych-stroke-kid-annotations',
      catch: true,
    });
  } else if (meta_shuff[0]['strokes'][0]['group'] == 'group3') {
    var catchTrial = _.extend({}, airplane_example, new Trial, {
      type: 'jspsych-stroke-kid-annotations',
      catch: true,
    });
  } else if (meta_shuff[0]['strokes'][0]['group'] == 'group4') {
    var catchTrial = _.extend({}, jack_o_lantern_example, new Trial, {
      type: 'jspsych-stroke-kid-annotations',
      catch: true,
    });
  }; // close else statement

  // randomly insert catchTrial between trialnum 2-8
  const N = meta.length - 2
  const array = Array.from({length: N}, (_, index) => index + 2);
  const rand = array[Math.floor(Math.random() * array.length)]; 

  // insert catchTrial into meta data as the FIRST trial
  // meta_shuff.splice(0, 0, catchTrial);
  // insert randomly
  meta_shuff.splice(rand, 0, catchTrial);

  // count all trials (including catchTrial)
  var numTrials = meta_shuff.length;    

  // get annotation trials, and add the plugin type attribute to each
  var trials = _.map(meta_shuff, function(trial, i) {
  return _.extend({}, trial, new Trial, additionalInfo, {
      // trialNum will be 10 trials + 1 catchTrial
      trialNum: i,
      numTrials: numTrials,
    })
  });    

  //collect PID info from SONA participants
  var PIDinfo = _.omit(_.extend({}, new Trial, additionalInfo));
  var collectPID = _.extend({}, PIDinfo, {
    type: 'survey-text',
    questions: [{
      prompt: "Please enter your UCSD email address below. \
        This will only be used to verify that you completed this study, so that you can be given credit on SONA. \
        <i>Your UCSD email address will not be used for any other purpose.</i> \
        Click 'Continue' to participate in this study.",
      placeholder: "your UCSD email address",
      rows: 1,
      columns: 30,
      required: true
    }],
    on_finish: main_on_finish
  });

  // add instruction pages
  instructionsHTML = {
    'str1': "<p>Hello!</p><p>In this study, you will see drawings of different objects. \
    Your study is to tell us what each part of the drawing represents. Your \
    total time commitment is expected to be approximately 20 minutes, including \
    the time it takes to read these instructions. For your participation in this \
    game, you will receive 0.5 credits on SONA.<p> \
    <p>When you are finished, the study will be automatically submitted for \
    approval.</p> <p><i>We recommend \
    using Chrome. This study has not been tested in other browsers.</i></p>",
    // 'str1': "<p>Hello!</p><p>In this study, you will see drawings of different objects. \
    // Your study is to tell us what each part of the drawing represents. Your \
    // total time commitment is expected to be approximately 12 minutes, including \
    // the time it takes to read these instructions. For your participation in this \
    // game, you will receive $2.80 on Prolific.<p> \
    // <p>When you are finished, the study will be automatically submitted for \
    // approval.</p> <p><i>We recommend \
    // using Chrome. This study has not been tested in other browsers.</i></p>",
    'str2': "<p>In a previous research study, people were asked to draw some objects. \
    Each drawing is made up of many lines and curves that represent \
    different parts of the objects. We are interested in learning \
    how you think each drawn line or curve corresponds to the different parts of the objects.</p>\
    <img class='introImgs' src='stim/cat_intro.png'>",
    'str3': "<p>On every trial, you will see the name of an object, \
    a menu of labels, and a drawing of that object. \
    Each label will correspond to parts of the object.</p> \
    <p>Here is what the trial interface will look like: </p> \
    <img class='introImgs introExamples' src='stim/cat_example.png'>",
    'str4': "<p>For each drawing, we will highlight a specific line in green. \
    Your study will be to select the label that corresponds to the part of the drawn object. \
    If many lines were used to represent the same part, you can select the same label for those lines.</p> \
    <p>When you're done labeling every line in a drawing, you will move onto the next drawing. \
    <i>Try to be as careful as possible. You cannot undo your answer once you select a label.</i></p> \
    <p>Here is an example of how you might choose to label the different parts of the example drawing below:</p>\
    <p><video class='introImgs introExamples' autoplay loop> <source src='stim/cat_example.mp4' type='video/mp4'></p>", 
    'str5': "<p>You will also have a menu of special labels. \
    If there is a line that represents multiple parts of the object, click the 'Multiple parts' button. \
    Then click on all the parts that the line corresponds to.</p>\
    <p>In the example below, this line represents \
    a 'Head' and two 'Ear's, so you would click those two buttons and then click 'Done'.<p>\
    <p><video class='introImgs introExamples' autoplay loop> <source src='stim/multiple_example.mp4' type='video/mp4'></p>", 
    'str6': "<p>If you think that we have not provided the correct labels, you can also write your own labels.</p> \
    <p>In the example below, you might write 'Heart' to describe the highlighted line and then click 'Submit'. \
    <i>Try to use the provided labels as much as you can, unless you strongly think that a new label should be written.</i><p>\
    <p><video class='introImgs introExamples' autoplay loop> <source src='stim/other_example.mp4' type='video/mp4'></p>", 
    'str7': "<p>If you see a line that does not look like anything at all, you can click 'I can't tell'. \
    For example, you might think that this highlighted line looks like nothing understandable:</p>\
    <p><video class='introImgs introExamples' autoplay loop> <source src='stim/unintelligible_example.mp4' type='video/mp4'></p> \
    <p>That's all you need to know about those special buttons! <i>Again, because you cannot undo your answer, \
    please try to be as careful as possible.</i><p>", 
    'str8': "<p>That's it! When you're ready, click 'Next' to complete a short quiz and begin the study.</p>"
  };

  //combine instructions and consent
  var introMsg0 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str1,
      instructionsHTML.str2,
      instructionsHTML.str3,
    ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: true, 
    delayTime: introButtonTiming,
  };

  var introMsg1 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str4,
    ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: true, 
    delayTime: introGifTiming_1,
  };

  var introMsg2 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str5, 
    ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: true, 
    delayTime: introGifTiming_2,
  };

  var introMsg3 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str6, 
    ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: true, 
    delayTime: introGifTiming_3,
  };

  var introMsg4 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str7
    ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: true, 
    delayTime: introGifTiming_4,
  };

  var introMsg5 = {
    type: 'instructions',
    pages: [
      instructionsHTML.str8
    ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: false
  };

  // Add comprehension check
  var quizTrial = {
    type: 'survey-multi-choice',
    preamble: "<b><u>Quiz</u></b><p>Before completing the next part of this study, \
    please complete the following quiz as practice to ensure that you understand the study.</p>",
    questions: [{
        prompt: "<b>Question 1</b> - \
        Which label should you click on if you see this line highlighted in green? \
        <img class='quizImgs' src='stim/cat_example.png'> \
        Please select a label option:",
        name: 'labelNormal',
        horizontal: false,
        options: ["Eye", "Head", "Ear", "Whisker", "Tail", "Mouth", "Other", "Multiple parts", "I can't tell"],
        required: true
      },
      {
        prompt: "<b>Question 2</b> - \
        Which label should you click on if you see this line highlighted in green? \
        <img class='quizImgs' src='stim/other_example.png'> \
        Please select a label option:",
        name: 'labelOther',
        horizontal: false,
        options: ["Eye", "Head", "Ear", "Whisker", "Tail", "Mouth", "Other", "Multiple parts", "I can't tell"],
        required: true
      },
      {
        prompt: "<b>Question 3</b> - \
        Which label should you click on if you see a line like this that represents multiple parts of the animal? \
        <img class='quizImgs' src='stim/multiple_example.png'> \
        Please select a label option:",
        name: 'labelMultiple',
        horizontal: false,
        options: ["Eye", "Head", "Ear", "Whisker", "Tail", "Mouth", "Other", "Multiple parts", "I can't tell"],
        required: true
      },
      {
        prompt: "<b>Question 3</b> - \
        After clicking 'Multiple parts', which labels would you click on to label this particular line? \
        <img class='quizImgs' src='stim/multiple_example.png'> \
        Please select a label option:",
        name: 'selectTheMultiple',
        horizontal: false,
        options: ["Eye, Head, Ear, Whisker", "Head, Ear", "Ear, Eye", "Head", "Ear"],
        required: true
      },
      {
        prompt: "<b>Question 7</b> - \
        <br>If you don't know a line represents, which label should you click on? \
        <img class='quizImgs' src='stim/unintelligible_example.png'> \
        Please select a label option:",
        name: "whatToLabelUnintelligible",
        horizontal: false,
        options: ["Other", "Multiple parts", "I can't tell"],
        required: true
      },
      {
        prompt: "<b>Question 8</b> - Can you undo your answer once you select a label?",
        name: "labelUndo",
        horizontal: false,
        options: ["Yes", "No"],
        required: true
      }
      // ,
      // {
      //   prompt: "<b>Question 9</b><br>Can you do this study more than once?",
      //   name: "howManyTimesHIT",
      //   horizontal: false,
      //   options: ["Yes ", "No "],
      //   required: true
      // }
    ]
  };

  // Check whether comprehension check responses are correct
  var loopNode = {
    timeline: [quizTrial],
    loop_function: function(data) {
      resp = JSON.parse(data.values()[0]['responses']);
      // console.log('data.values',resp);
      if ((resp['labelNormal'] == "Ear") && 
      (resp['labelOther'] == "Other") && 
      (resp['labelMultiple'] == "Multiple parts") && 
      (resp['selectTheMultiple'] == "Head, Ear") && 
      (resp['whatToLabelUnintelligible'] == "I can't tell") && 
      (resp['labelUndo'] == "No")) {
      // (resp['howManyTimesHIT'] == 'No ')) {
        return false;
      } else {
        alert('Try again! One or more of your responses was incorrect.');
        return true;
      }
    }
  };

  // exit survey trials
  var surveyChoiceInfo = _.omit(_.extend({}, new Trial, additionalInfo ));
  var exitSurveyChoice = _.extend({}, surveyChoiceInfo, {
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
  var surveyTextInfo = _.omit(_.extend({}, new Trial, additionalInfo));
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
        require: true
      },
      {
        name: 'participantYears',
        prompt: "How many years old are you?",
        placeholder: "18",
        require: true
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

  console.log(jsPsych.data.getURLVariable('credit_token'), 'hey');

  // add goodbye page
  var goodbye = {
    type: 'instructions',
    pages: [
      'Congrats! You are all done. Thanks for participating in our game! \
      Your SONA credit will be provide the day after the deadline. \
      Click NEXT to submit this study.'
    ],
    // pages: [
    //   'Congrats! You are all done. Thanks for participating in our game! \
    //   Click NEXT to submit this study.'
    // ],
    show_clickable_nav: true,
    allow_backward: false,
    delay: false, 
    on_finish: function() {
      sendData();
      window.open("https://justintheyang.github.io/","_self")
    }
  };
  
  // add all experiment elements to trials array
  var setup = [];

  if (includeIntro) setup.push(introMsg0)
  if (includeIntro) setup.push(introMsg1)
  if (includeIntro) setup.push(introMsg2)
  if (includeIntro) setup.push(introMsg3)
  if (includeIntro) setup.push(introMsg4)
  if (includeIntro) setup.push(introMsg5)
  if (includeIntro) setup.push(collectPID)
  if (includeQuiz) setup.push(loopNode)

  var experiment = setup.concat(trials);

  if(includeExitSurvey) experiment.push(exitSurveyChoice);
  if(includeExitSurvey) experiment.push(exitSurveyText);
  if(includeGoodbye) experiment.push(goodbye);

  
  console.log('experiment', experiment);

  // set up images for preload
  var imagePaths = [
    'stim/cat_example.png', 
    'stim/cat_intro.png', 
    'stim/multiple_example.png', 
    'stim/other_example.png', 
    'stim/panel_example.png', 
    'stim/unintelligible_example.png'
    ];

  // set up videos for preload
  var videoPaths = [
    'stim/cat_example.mp4',
    'stim/multiple_example.mp4',
    'stim/other_example.mp4',
    'stim/unintelligible_example.mp4'
  ];

  jsPsych.init({
    timeline: experiment,
    default_iti: 1000,
    preload_video: videoPaths,
    preload_images: imagePaths,
    show_progress_bar: true
  });

} // close setup game
