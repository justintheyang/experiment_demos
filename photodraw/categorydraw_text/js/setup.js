// gameport 8870
var UUID = function() {
  var baseName = (Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10) + '' +
        Math.floor(Math.random() * 10));
  var template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var id = baseName + '-' + template.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return id;
};

// Define experiment metadata object
function Experiment () {
  this.type = 'jspsych-cued-drawing';
  this.dbname = 'sona_under18_experiments';
  this.colname = 'categorydraw-text'
  this.iterationName = 'sona'; //psyc1_SS2_2021
  this.devMode = false; // Change this to TRUE if testing in dev mode or FALSE for real experiment
}

// Define session metadata object 
function Session () {
  this.categories = ['airplane', 'ape', 'axe', 'blimp', 'bread', 'butterfly', 'car_(sedan)', 'castle', 
                     'cat', 'cup', 'elephant', 'fish', 'flower', 'hat', 'hotdog', 'jack-o-lantern', 
                     'jellyfish', 'kangaroo', 'lion', 'motorcycle', 'mushroom', 'piano', 'raccoon', 'ray', 
                     'saw', 'scorpion', 'skyscraper', 'snake', 'squirrel', 'tree', 'windmill', 'window']
  // Create raw trials list
  this.trials = _.map(_.shuffle(this.categories), function (n,i) {
    return trial = _.extend({}, new Experiment, { 
        category: n,
        trialNum: i,
        numTrials: this.categories.length,
        condition: 'text',
        imageURL: NaN
        }
      )
  }.bind(this))
}

// main function for running the experiment
function setupGame() {

  // At end of each trial log dummy data
  var main_on_finish = function(data) {
    console.log('logging trial data', data);
  }

  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var studyCode = urlParams.get('id')

  // Add additional boilerplate info to each trial object
  var additionalInfo = {
    gameID: UUID(),
    on_finish: main_on_finish
  }    

  // Create trial list
  var session = new Session; 
  var trials = _.flatten(_.map(session.trials, function(trialData, i) {
    var trial = _.extend({}, additionalInfo, trialData, {trialNum: i});
    return trial;
  }));
  var practiceTrial = _.extend({}, new Experiment, {
    category: 'face',//'Make a sketch! &#8594',
    condition: 'text',
    imageURL: NaN,
    practiceTrial: true  
  });
  
  // Define consent form language
  consentHTML = {
    'str1' : '<p> Hello! In this demo, you will make some drawings of objects! </p><p> We expect the average game to last about 30 minutes, including the time it takes to read these instructions.</p><i><p> Note: We recommend using Chrome. We have not tested this experiment in other browsers.</p></i>',
  }
  // Define instructions language
  instructionsHTML = {
    'str1' : '<p>In this demo, you will be making drawings of various objects from memory. Your goal is to make these drawings recognizable to someone else trying to identify what <b>category</b> of objects you were trying to draw.</p>\
              <p>For example, suppose we asked you to draw a face. Rather than drawing a specific person\'s face, you would draw a <b>generic smiley face</b>. Importantly, someone would not be able to recognize any <i>specific</i> person\'s face, but would still recognize your drawing as a face.</p>\
              <img height = "300" src = "stimuli/categories_only.png">',
    'str2': '<p>While your drawings should be informative of the <b>general category</b> the object belongs to, you do not need to be concerned about making them look pretty.</p>\
              <p>Also, when making your drawing, please do not shade or add any words, arrows, numbers, or surrounding context around your object drawing. For example, if you are drawing a horse, please do not draw grass around it.<p/>\
              <img height = "300" src = "stimuli/not_allowed_added_shading.png">',
    'str3': '<p>On every trial, you will be shown an object label (e.g., a face) and asked to spend 8 seconds thinking about the most <b>generic</b> representative of that object class. Then you draw what you thought of, making sure the drawing <b>cannot</b> be recognized as a specific instance of that category:</p>\
              <img height = "300" src = "stimuli/generic_face_screencap.gif">\
              <p>Although you will have as much time as you need to make your drawing, you won\'t be able to erase or \'undo\' any part of your drawing while you are making it. \
              So please do your best to think about how you want your drawing to look before you begin each one. Finally, when you are satisfied with the drawing, please click SUBMIT.</p>',
    'str4': '<p>Finally, please adjust your screen such that the drawing space is not blocked in any way. <br> We hope that you will enjoy this demo! Let\'s begin!</p>'
  }
  
  

  // Create consent + instructions instructions trial
  var welcome = {
    type: 'instructions',
    pages: [
      consentHTML.str1,
      // consentHTML.str2,
      instructionsHTML.str1,
      instructionsHTML.str2,
      instructionsHTML.str3,
      instructionsHTML.str4
    ],
    force_wait: 1500, 
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: true
  }

  // Create comprehension check survey
  var comprehensionSurvey = {
    type: 'survey-multi-choice',
    preamble: "<strong>Comprehension Check</strong>",
    questions: [
              {
      prompt: "What should your goal be when making each drawing?",
      name: 'goalOfDrawing',
      options: ["To make them recognizable to someone else!", "To make them as pretty as possible!"],
      required: true
              },
        {
      prompt: "Should you shade or add words, arrows, or any surrounding context to your drawing?", 
      name: 'bannedDrawings',
      options: ["Yes", "No"],
      required: true
        },
              {
      prompt: "What does it mean for your drawing to be recognizable in this task? Please choose the better answer.",
      name: 'categoryLevel',
      options: ["A recognizable drawing would be identifiable as a member of the target category, but not necessarily look like a specific instance.", "A recognizable drawing would look like a specific instance of an object belonging to the target category."],
      required: true
              },
        {
      prompt: "Can you undo or erase things you already drew?",
      name: 'canUndo',
      options: ["Yes, I am able to undo or erase things I already drew.", "No, I won't be able to erase or undo my work once I begin."],
      required: true
        }
    ]
  }

  // Check whether comprehension check is answered correctly
  var loopNode = {
    timeline: [comprehensionSurvey],
    loop_function: function(data) {
        resp = JSON.parse(data.values()[0]['responses']);
        if ((resp["bannedDrawings"] == 'No' 
          && resp["goalOfDrawing"] == "To make them recognizable to someone else!" 
          && resp['categoryLevel'] == "A recognizable drawing would be identifiable as a member of the target category, but not necessarily look like a specific instance." 
          && resp['canUndo'] == "No, I won't be able to erase or undo my work once I begin.")) { 
            return false;
        } else {
            alert('Try again! One or more of your responses was incorrect.');
            return true;
      }
    }
  }

  // Create goodbye trial (this doesn't close the browser yet)
  var goodbye = {
    type: 'instructions',
    pages: [
      'Thanks for participating in our experiment! You are all done. You can close the tab or click the button to end the demo.'
    ],
    show_clickable_nav: true,
    allow_backward: false,
    on_finish: () => {
      window.open("https://justintheyang.github.io/","_self")
    }
  }
  
  // insert comprehension check 
  trials.unshift(loopNode);
  // insert welcome trials before check
  trials.unshift(welcome);

  // insert goodbye trial
  trials.push(goodbye);

  // create jspsych timeline object
  jsPsych.init({
    timeline: trials,
    default_iti: 1000,
    show_progress_bar: true
  });

}
