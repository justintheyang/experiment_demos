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
  this.colname = 'instancedraw-photo'
  this.iterationName = 'sona';
  this.devMode = false; // Change this to TRUE if testing in dev mode or FALSE for real experiment
}

// Define session metadata object 
function Session () {
  // Create raw trials list
  this.trials = _.map(_.shuffle(metadata32.filter(o => o.index == 3)), function (n,i) {
    return trial = _.extend({}, new Experiment, { 
        category: n.category,
        trialNum: i,
        numTrials: metadata32.filter(o => o.index == 3).length,
        condition: 'photo', 
        imageURL: n.s3_url
        }
      )
  }.bind(this))
}

// main function for running the experiment
function setupGame() {    
  // At end of each trial save score locally and send data to server
  var main_on_finish = function(data) {
    console.log('logging data', data);
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
  var session = new Session(); 
  var trials = _.flatten(_.map(session.trials, function(trialData, i) {
    var trial = _.extend({}, additionalInfo, trialData, {trialNum: i});
    return trial;
  }));
  // var practiceTrial = _.extend({}, new Experiment, {
  //   category: 'face',//'Make a sketch! &#8594',
  //   condition: 'photo',
  //   practiceTrial: true  
  // });
  
  // Define consent form language
  consentHTML = {
    'str1' : '<p> Hello! In this demo, you will make some drawings of objects! </p><p> We expect the average game to last about 30 minutes, including the time \
              it takes to read these instructions. </p><i><p> Note: We recommend using Chrome. We have not tested \
              this experiment in other browsers.</p></i>',
  }
  // Define instructions language
  instructionsHTML = {
    'str1' : '<p>In this demo, you will be making drawings of various objects, given an image. Your goal is to make drawings that look like the <b>specific</b> object that you were shown.</p>\
              <p>For example, suppose we asked you to draw a face. Instead of drawing a generic smiley face, you will be shown a <b>specific person\'s face</b> to make a drawing of. Importantly, someone should be able to guess which person\'s face you were shown, a lineup of different faces. \
                You do not, however, need to be concerned about making them look pretty.</p>\
              <img height = "300" src = "stimuli/instances_only.png">',
    'str2': '<p>Also, when making your drawing, please do not shade or add any words, arrows, numbers, or surrounding context around your object drawing. For example, if you are drawing a horse, please do not draw grass around it.<p/>\
              <img height = "300" src = "stimuli/not_allowed_added_shading.png">',
    'str3': '<p>On every trial, you will be shown an image (e.g., of a face) for 8 seconds. After the 8 seconds is up, you will produce a drawing of that <b>specific</b> image you were just shown:</p>\
              <img height = "300" src = "stimuli/instance_photo_screencap.gif">\
              <p>Although you will have as much time as you need to make your drawing, you won\'t be able to erase or \'undo\' any part of your drawing while you are making it. \
              So please do your best to think about how you want your drawing to look before you begin each one. When you are satisfied with the drawing, please click SUBMIT.</p>',
    'str4': '<p>Finally, please adjust your screen such that the drawing space is not blocked in any way. <br> We hope that you will enjoy this demo! Let\'s begin!</p>'
  }
  
  
  // Create consent + instructions instructions trial
  var welcome = {
    type: 'instructions',
    pages: [
      consentHTML.str1,
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
        name: 'goalOfDrawing',  // "To make a drawing that looks like a generic version of each object, but not any specific example."
        options: ["To make a drawing that is recognizable, but not one that could be matched to the image I was shown.", "To make a drawing that looks pretty!", "To make a drawing that can be matched to the image I was shown"],
        required: true
                },
        {
      prompt: "Should you shade or add words, arrows, or any surrounding context to your drawing?", 
      name: 'bannedDrawings',
      options: ["Yes", "No"],
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
          && resp["goalOfDrawing"] == "To make a drawing that can be matched to the image I was shown" 
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
      'Thanks for participating in our experiment! You are all done. Please click the button to end the demo.'
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
  // insert practice trial
  // trials.unshift(practiceTrial);

  // append goodbye trial
  trials.push(goodbye);

  // create jspsych timeline object
  jsPsych.init({
    timeline: trials,
    default_iti: 1000,
    show_progress_bar: true
  });

}
